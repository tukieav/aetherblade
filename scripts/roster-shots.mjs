// Roster consistency shots: all mob types + bosses lined up on the meadow, and cave roster.
import {chromium} from 'playwright';
import {server, chrome} from '../tests/helpers.mjs';

const PORT = 8703;
const srv = await server(PORT);
const browser = await chromium.launch({executablePath: chrome, headless: true, args: ['--no-sandbox', '--use-gl=swiftshader']});
const page = await browser.newPage({viewport: {width: 1600, height: 900}});
await page.goto(`http://localhost:${PORT}/?debug=1&capture=1`);
await page.waitForFunction(() => window.__astro, null, {timeout: 30000});
await page.waitForTimeout(2500); // let GLBs load

// ---- Meadow lineup: knight + all overworld roster in a row ----
await page.evaluate(() => {
  const A = window.__astro;
  A.teleport(8.3, -50);
  A.posePlayer(Math.PI, 'idle');
  // Line the roster up at z=-50, facing camera (+z side)
  A.spawnMobAt('Slime', -8, -50);
  A.spawnMobAt('Wolf', -4.7, -50);
  A.spawnMobAt('Skeleton', -1.5, -50);
  A.spawnMobAt('Cave Bat', 1.2, -51.5);
  A.spawnMobAt('Crystal Golem', 5, -50);
  A.setCameraPose(0, 3.8, -38.5, 0, 1.6, -50);
  A.rimLight(0, 4, 4, '#fff3d8', 18);
  for (const sel of ['#hud', '#fade', '#touchui', '#restoring']) document.querySelector(sel)?.style.setProperty('display', 'none', 'important');
});
await page.waitForTimeout(1800);
await page.screenshot({path: 'qa/screenshots/roster-lineup.png'});
console.log('roster-lineup.png captured');

// ---- Cave roster: bat, golem, colossus ----
await page.evaluate(() => {
  const A = window.__astro;
  A.enterCave(true);
});
await page.waitForTimeout(800);
await page.evaluate(() => {
  const A = window.__astro;
  A.teleport(5, -31);
  A.spawnCaveBoss();
  A.spawnMobAt('Cave Bat', -3.2, -38);
  A.spawnMobAt('Crystal Golem', 4.2, -37.5);
  A.setCameraPose(5.4, 4.6, -29.2, 0, 2.4, -42);
  A.rimLight(-2, 5, -8, '#bcd8ff', 26);
  A.rimLight(2, 4, -5, '#e8d8ff', 18);
  for (const sel of ['#hud', '#fade', '#touchui', '#restoring']) document.querySelector(sel)?.style.setProperty('display', 'none', 'important');
});
await page.waitForTimeout(1500);
await page.screenshot({path: 'qa/screenshots/roster-cave.png'});
console.log('roster-cave.png captured');

await browser.close();
srv.close();
