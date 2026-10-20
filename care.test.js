import test from 'node:test';
import assert from 'node:assert/strict';
import { newState, withAnimals, T0, MIN, HOUR } from './helpers.js';
import { catchUp, collectPiggy, feed, getOwned, moodState, piggyCap } from '../js/logic/care.js';
import { startExpedition } from '../js/logic/expedition.js';

test('พลังงานฟื้น +1 ทุก 90 วินาทีเมื่ออยู่บ้าน', () => {
  const s = newState();
  getOwned(s, 'cat').energy = 10;
  catchUp(s, T0 + 15 * MIN);
  assert.ok(Math.abs(getOwned(s, 'cat').energy - 20) < 1e-6);
});

test('ที่นอนระดับสูงฟื้นเร็วขึ้น', () => {
  const s = newState();
  s.upgrades.bed = 2; // x2
  getOwned(s, 'cat').energy = 10;
  catchUp(s, T0 + 15 * MIN);
  assert.ok(Math.abs(getOwned(s, 'cat').energy - 30) < 1e-6);
});

test('สัตว์ที่ออกสำรวจไม่ฟื้นพลังงาน', () => {
  const s = newState();
  startExpedition(s, 'garden', ['cat'], T0);
  catchUp(s, T0 + 30 * MIN);
  assert.equal(getOwned(s, 'cat').energy, 85);
});

test('ไม่อยู่ 10 ชม. กระปุกได้สูงสุดแค่ 8 ชม.', () => {
  const s = newState();
  const elapsed = catchUp(s, T0 + 10 * HOUR);
  assert.equal(elapsed, 10 * HOUR);
  assert.equal(piggyCap(s), 120);
  assert.equal(s.piggy, 120);
  assert.equal(getOwned(s, 'cat').energy, 100);
  assert.equal(getOwned(s, 'cat').mood, 100);
});

test('สัตว์ที่เศร้าไม่หยอดกระปุก จนกว่าจะหายเศร้า', () => {
  const s = newState();
  getOwned(s, 'cat').mood = 10;
  catchUp(s, T0 + 60 * MIN); // ความสุข 10 -> 22 ยังเศร้าอยู่
  assert.equal(s.piggy, 0);
  catchUp(s, T0 + 120 * MIN); // ความสุขข้าม 30 แล้ว
  assert.ok(s.piggy > 0);
});

test('เวลาเครื่องย้อนกลับไม่ทำให้ค่าพัง', () => {
  const s = newState();
  getOwned(s, 'cat').energy = 50;
  assert.equal(catchUp(s, T0 - 5 * HOUR), 0);
  assert.equal(getOwned(s, 'cat').energy, 50);
  assert.equal(s.lastTick, T0 - 5 * HOUR);
});

test('เก็บกระปุกได้เป็นจำนวนเต็ม เศษเก็บไว้ต่อ', () => {
  const s = newState();
  s.piggy = 12.6;
  const coins = s.coins;
  assert.equal(collectPiggy(s), 12);
  assert.equal(s.coins, coins + 12);
  assert.ok(Math.abs(s.piggy - 0.6) < 1e-9);
});

test('ให้อาหารใช้ของในกระเป๋า เพิ่มพลังงานและความสุข', () => {
  const s = newState();
  const cat = getOwned(s, 'cat');
  cat.energy = 40;
  cat.mood = 50;
  assert.equal(feed(s, 'cat', 'carrot').ok, true);
  assert.equal(cat.energy, 65);
  assert.equal(cat.mood, 55);
  assert.equal(s.inventory.carrot, 1);
  assert.equal(s.stats.feeds, 1);
});

test('อาหารหมดหรืออิ่มแล้วให้ไม่ได้', () => {
  const s = newState();
  const cat = getOwned(s, 'cat');
  cat.energy = 100;
  cat.mood = 100;
  assert.equal(feed(s, 'cat', 'carrot').ok, false);
  cat.energy = 10;
  assert.equal(feed(s, 'cat', 'treat').ok, false);
});

test('ระดับอารมณ์', () => {
  assert.equal(moodState(70), 'happy');
  assert.equal(moodState(69), 'normal');
  assert.equal(moodState(30), 'normal');
  assert.equal(moodState(29), 'sad');
});

test('กระปุกเต็มตามจำนวนสัตว์ที่มี', () => {
  const s = withAnimals(newState(), 'shiba', 'rabbit');
  assert.equal(piggyCap(s), 360);
});
