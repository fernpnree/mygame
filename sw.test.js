import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? listFiles(p) : [p];
  });
}

test('service worker เก็บไฟล์ JS ครบทุกไฟล์ และทุกไฟล์ในรายการมีอยู่จริง', () => {
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  const listed = [...sw.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean);
  for (const file of listed) {
    assert.ok(existsSync(join(root, file)), `ไม่พบไฟล์ ${file}`);
  }
  const js = listFiles(join(root, 'js')).map((p) => relative(root, p).split('\\').join('/'));
  for (const file of js) {
    assert.ok(listed.includes(file), `ลืมใส่ ${file} ใน sw.js`);
  }
});
