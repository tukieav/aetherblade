// Records CrazyGames preview gameplay with a scripted bot, in landscape
// (1920x1080) and portrait (800x1200) via Playwright recordVideo.
// Raw .webm goes to marketing/raw/; scripts/build-videos.sh turns them into
// final MP4s with the static cover as the first frame.
import {chromium} from 'playwright';
import {server, chrome} from '../tests/helpers.mjs';
import {mkdirSync, renameSync} from 'node:fs';

const PORT = 8704;
const srv = await server(PORT);
mkdirSync('marketing/raw', {recursive: true});

const browser = await chromium.launch({
  executablePath: chrome, headless: true,
  args: ['--no-sandbox', '--use-gl=swiftshader']
});

async function record(name, w, h, withBoss) {
  const ctx = await browser.newContext({
    viewport: {width: w, height: h},
    recordVideo: {dir: 'marketing/raw', size: {width: w, height: h}}
  });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/?debug=1&capture=1`);
  await page.waitForFunction(() => window.__astro, null, {timeout: 30000});
  await page.evaluate(() => {
    const A = window.__astro;
    localStorage.clear();
    // Skip tutorial UI clutter; hide loading hint; keep gameplay HUD.
    document.querySelector('#hint').style.display = 'none';
    // Continuously suppress any modal (tutorial-complete, endgame...) so the
    // recording shows pure gameplay with the HUD only.
    setInterval(() => {
      for (const sec of document.querySelectorAll('section')) sec.classList.remove('open');
    }, 80);
    A.setLevel(6); // strong enough for snappy fights
    A.setQuest(3);
    A.teleport(2, 26); // village outskirts
  });
  await page.waitForTimeout(700);
  const mark = Date.now();

  // Phase 1 — village walk (~4.5s): stroll through the village.
  await page.keyboard.down('w');
  await page.waitForTimeout(2300);
  await page.keyboard.down('d');
  await page.waitForTimeout(900);
  await page.keyboard.up('d');
  await page.waitForTimeout(1300);
  await page.keyboard.up('w');

  // Phase 2 — combat (~7s): slimes + wolf, skills.
  await page.evaluate(() => {
    const A = window.__astro;
    const s = A.getState();
    A.spawnMobAt('Slime', s.pos.x + 3, s.pos.z + 2.5);
    A.spawnMobAt('Slime', s.pos.x - 2.5, s.pos.z + 3);
    A.spawnMobAt('Wolf', s.pos.x + 1, s.pos.z + 4);
  });
  await page.waitForTimeout(400);
  for (let i = 0; i < 5; i++) {
    await page.mouse.click(w / 2, h / 2); // sword combo swings
    await page.waitForTimeout(450);
  }
  await page.evaluate(() => window.__astro.castSkill(4)); // War Cry
  await page.waitForTimeout(600);
  await page.evaluate(() => window.__astro.castSkill(3)); // Whirlwind
  await page.waitForTimeout(900);
  for (let i = 0; i < 4; i++) {
    await page.mouse.click(w / 2, h / 2);
    await page.waitForTimeout(420);
  }
  await page.evaluate(() => window.__astro.castSkill(2)); // Dash
  await page.waitForTimeout(800);

  if (withBoss) {
    // Phase 3 — Alpha Wolf boss teaser (~6s).
    await page.evaluate(() => {
      const A = window.__astro;
      A.spawnBoss();
      const b = A.getState().mobs.find(m => m.type === 'Alpha Wolf');
    });
    await page.evaluate(() => {
      const A = window.__astro;
      A.teleport(-40, -34); // boss arena vicinity
    });
    await page.waitForTimeout(500);
    await page.keyboard.down('w');
    await page.waitForTimeout(1300);
    await page.keyboard.up('w');
    for (let i = 0; i < 6; i++) {
      await page.mouse.click(w / 2, h / 2);
      await page.waitForTimeout(430);
    }
    await page.evaluate(() => window.__astro.castSkill(3));
    await page.waitForTimeout(1200);
  } else {
    // Portrait: extend the skirmish instead of the boss.
    await page.evaluate(() => {
      const A = window.__astro;
      const s = A.getState();
      A.spawnMobAt('Wolf', s.pos.x + 2.4, s.pos.z + 3);
      A.spawnMobAt('Slime', s.pos.x - 2, s.pos.z + 2.6);
    });
    for (let i = 0; i < 8; i++) {
      await page.mouse.click(w / 2, h / 2);
      await page.waitForTimeout(450);
    }
    await page.evaluate(() => window.__astro.castSkill(3));
    await page.waitForTimeout(1400);
  }

  const alive = await page.evaluate(() => {
    const s = window.__astro.getState();
    return {hp: s.hp, level: s.level, kills: s.mobs.filter(m => m.dead).length, map: s.map};
  });
  console.log(`${name}: scripted gameplay ${(Date.now() - mark) / 1000}s, state:`, JSON.stringify(alive));

  await page.close();
  await ctx.close();
  const video = await page.video().path();
  renameSync(video, `marketing/raw/${name}.webm`);
  console.log(`saved marketing/raw/${name}.webm`);
}

await record('gameplay-landscape', 1920, 1080, true);
await record('gameplay-portrait', 800, 1200, false);
await browser.close();
srv.close();
