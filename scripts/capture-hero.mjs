// Captures a real in-game render of the knight hero for the marketing cover.
// Serves dist/ locally, poses the knight facing camera in the Emerald Vale,
// adds a warm rim light, hides the HUD and screenshots the raw WebGL frame.
import {chromium} from 'playwright';
import {server, chrome} from '../tests/helpers.mjs';
import {mkdirSync} from 'node:fs';

const PORT = 8702;
const srv = await server(PORT);
mkdirSync('marketing', {recursive: true});

const browser = await chromium.launch({
  executablePath: chrome, headless: true,
  args: ['--no-sandbox', '--use-gl=swiftshader']
});
const page = await browser.newPage({viewport: {width: 1800, height: 2000}, deviceScaleFactor: 1});
await page.goto(`http://localhost:${PORT}/?debug=1&capture=1`);
await page.waitForFunction(() => window.__astro, null, {timeout: 30000});
await page.waitForTimeout(1500);

await page.evaluate(() => {
  const A = window.__astro;
  // Sunny meadow spot, knight facing the camera.
  A.teleport(6, 14);
  A.posePlayer(0, 'idle');
  const s = A.getState();
  // Camera in front of the knight (+z), slightly low for a heroic angle.
  A.setCameraPose(s.pos.x, s.pos.y + 1.7, s.pos.z + 5.1, s.pos.x, s.pos.y + 1.15, s.pos.z);
  // Warm rim light behind-left + a soft fill in front.
  A.rimLight(-1.6, 2.6, -2.2, '#ffca7a', 30);
  A.rimLight(1.8, 2.2, -1.8, '#ffb35e', 22);
  A.rimLight(0, 2.0, 3.0, '#fff3d8', 10);
  // Hide every HUD element for a clean frame.
  for (const sel of ['#hud', '#fade', '#touchui', '#restoring'])
    document.querySelector(sel)?.style.setProperty('display', 'none', 'important');
  for (const sec of document.querySelectorAll('section')) sec.classList.remove('open');
});
await page.waitForTimeout(1200); // let lerp/light settle + a few frames render
await page.screenshot({path: 'marketing/hero-shot.png'});
console.log('hero-shot.png captured 1800x2000');
await page.close();

// Wide shot for the 16:9 / 1:1 covers — camera pulled back so the full
// knight (helmet to boots) fits with headroom in a landscape crop.
const wide = await browser.newPage({viewport: {width: 2560, height: 1440}, deviceScaleFactor: 1});
await wide.goto(`http://localhost:${PORT}/?debug=1&capture=1`);
await wide.waitForFunction(() => window.__astro, null, {timeout: 30000});
await wide.waitForTimeout(1500);
await wide.evaluate(() => {
  const A = window.__astro;
  A.teleport(6, 14);
  A.posePlayer(0, 'idle');
  const s = A.getState();
  A.setCameraPose(s.pos.x, s.pos.y + 1.5, s.pos.z + 4.6, s.pos.x, s.pos.y + 1.05, s.pos.z);
  A.rimLight(-1.6, 2.6, -2.2, '#ffca7a', 30);
  A.rimLight(1.8, 2.2, -1.8, '#ffb35e', 22);
  A.rimLight(0, 2.0, 3.0, '#fff3d8', 10);
  for (const sel of ['#hud', '#fade', '#touchui', '#restoring'])
    document.querySelector(sel)?.style.setProperty('display', 'none', 'important');
  for (const sec of document.querySelectorAll('section')) sec.classList.remove('open');
});
await wide.waitForTimeout(1200);
await wide.screenshot({path: 'marketing/hero-wide.png'});
console.log('hero-wide.png captured 2560x1440');
await browser.close();
srv.close();
