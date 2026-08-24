// Verifies preview videos contain real gameplay: extracts frames at 1s/8s/15s
// and checks each is non-black and non-menu (meanLum in a sane range, has
// color variance). Prints ffprobe duration/resolution as proof.
import {execSync} from 'node:child_process';
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import {mkdirSync} from 'node:fs';

const videos = ['marketing/video-landscape.mp4', 'marketing/video-portrait.mp4'];
mkdirSync('marketing/frames', {recursive: true});

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox']
});
const page = await browser.newPage();
let fail = 0;
for (const v of videos) {
  const probe = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name,pix_fmt -show_entries format=duration -of default=noprint_wrappers=1 ${v}`
  ).toString().trim();
  console.log(`--- ${v}\n${probe}`);
  for (const t of [1, 8, 15]) {
    const out = `marketing/frames/${v.split('/').pop().replace('.mp4', '')}-${t}s.png`;
    execSync(`ffmpeg -y -v error -ss ${t} -i ${v} -frames:v 1 ${out}`);
    const b64 = (await readFile(out)).toString('base64');
    const m = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let lum = 0, n = 0, dark = 0;
      const hues = new Set();
      for (let i = 0; i < d.length; i += 40) {
        const l = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2];
        lum += l; if (l < 20) dark++; n++;
        hues.add((d[i] >> 5) * 100 + (d[i + 1] >> 5) * 10 + (d[i + 2] >> 5));
      }
      return {meanLum: lum / n, blackFrac: dark / n, distinctColors: hues.size};
    }, b64);
    // Gameplay frame = bright-ish, not mostly black, colorful 3D scene.
    const ok = m.meanLum > 40 && m.blackFrac < 0.5 && m.distinctColors > 25;
    if (!ok) fail++;
    console.log(`  t=${t}s meanLum=${m.meanLum.toFixed(1)} blackFrac=${m.blackFrac.toFixed(3)} colors=${m.distinctColors} -> ${ok ? 'GAMEPLAY OK' : 'FAIL (black/menu?)'}`);
  }
}
await browser.close();
process.exit(fail ? 1 : 0);
