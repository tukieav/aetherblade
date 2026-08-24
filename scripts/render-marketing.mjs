// Renders the three CrazyGames cover formats from marketing/cover.html.
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {join, extname} from 'node:path';

const PORT = 8703;
const srv = createServer(async (req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/cover.html';
  try {
    const b = await readFile(join('marketing', p));
    res.writeHead(200, {'content-type': extname(p) === '.png' ? 'image/png' : 'text/html'});
    res.end(b);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => srv.listen(PORT, r));

const FORMATS = [
  {name: 'cover-16x9.png', w: 1920, h: 1080},
  {name: 'cover-2x3.png', w: 800, h: 1200},
  {name: 'cover-1x1.png', w: 800, h: 800},
];

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome', headless: true,
  args: ['--no-sandbox', '--use-gl=swiftshader']
});
for (const f of FORMATS) {
  const page = await browser.newPage({viewport: {width: f.w, height: f.h}, deviceScaleFactor: 1});
  await page.goto(`http://localhost:${PORT}/cover.html?w=${f.w}&h=${f.h}`);
  await page.waitForFunction(() => window.__coverReady, null, {timeout: 15000});
  await page.waitForTimeout(200);
  await page.locator('#cv').screenshot({path: `marketing/${f.name}`});
  console.log(`rendered marketing/${f.name} (${f.w}x${f.h})`);
  await page.close();
}
await browser.close();
srv.close();
