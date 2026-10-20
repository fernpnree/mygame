// สร้างไอคอนแอป (SVG + PNG) จากภาพแมวส้มในเกม
// วิธีใช้: node tools/make-icons.mjs  (ต้องมี Playwright + Chromium ในเครื่อง)
import { writeFileSync } from 'node:fs';
import { animalSVG } from '../js/art/animals.js';

const inner = (mood) => animalSVG('cat', mood).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

// ไอคอนปกติ: พื้นชมพูมุมมน
const icon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
  '<rect width="120" height="120" rx="28" fill="#FFD9E4"/>' +
  `<g transform="translate(6 4) scale(0.9)">${inner('happy')}</g></svg>`;

// maskable: พื้นเต็มกรอบ แมวอยู่ในพื้นที่ปลอดภัยตรงกลาง
const maskable =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
  '<rect width="120" height="120" fill="#FFD9E4"/>' +
  `<g transform="translate(21 19) scale(0.65)">${inner('happy')}</g></svg>`;

writeFileSync(new URL('../icons/icon.svg', import.meta.url), icon);

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
const shots = [
  [icon, 192, 'icon-192.png', true],
  [icon, 512, 'icon-512.png', true],
  [maskable, 512, 'icon-maskable-512.png', false],
  [maskable, 180, 'apple-touch-icon.png', false],
];
for (const [svg, size, name, transparent] of shots) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  await page.screenshot({ path: new URL(`../icons/${name}`, import.meta.url).pathname, omitBackground: transparent });
}
await browser.close();
console.log('icons written');
