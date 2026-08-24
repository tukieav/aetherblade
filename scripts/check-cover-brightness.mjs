// CrazyGames cover brightness/saturation gate.
// Pass criteria: meanLum >= 80, darkFrac (lum<40) <= 0.35, meanSat >= 0.35.
// Decodes PNGs with Chrome (no native deps) and measures pixels.
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';

const files = process.argv.slice(2).length ? process.argv.slice(2) :
  ['marketing/cover-16x9.png', 'marketing/cover-2x3.png', 'marketing/cover-1x1.png'];

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox']
});
const page = await browser.newPage();
let fail = 0;
for (const f of files) {
  const b64 = (await readFile(f)).toString('base64');
  const m = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let lumSum = 0, satSum = 0, dark = 0, n = 0;
    for (let i = 0; i < d.length; i += 16) { // sample every 4th pixel
      const r = d[i], gg = d[i + 1], b = d[i + 2];
      const lum = .2126 * r + .7152 * gg + .0722 * b;
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
      const sat = mx === 0 ? 0 : (mx - mn) / mx;
      lumSum += lum; satSum += sat; if (lum < 40) dark++; n++;
    }
    return {w: c.width, h: c.height, meanLum: lumSum / n, darkFrac: dark / n, meanSat: satSum / n};
  }, b64);
  const ok = m.meanLum >= 80 && m.darkFrac <= 0.35 && m.meanSat >= 0.35;
  if (!ok) fail++;
  console.log(`${f} ${m.w}x${m.h} meanLum=${m.meanLum.toFixed(1)} darkFrac=${m.darkFrac.toFixed(3)} meanSat=${m.meanSat.toFixed(3)} -> ${ok ? 'PASS' : 'FAIL'}`);
}
await browser.close();
process.exit(fail ? 1 : 0);
