import test from 'node:test';
import assert from 'node:assert/strict';
import { newState, withAnimals, seq, T0, MIN } from './helpers.js';
import {
  canSend,
  startExpedition,
  collectExpedition,
  estimateCoins,
  discoverChance,
} from '../js/logic/expedition.js';
import { getOwned } from '../js/logic/care.js';

test('ส่งทีมแล้วหักพลังงานและความสุข สัตว์ออกจากบ้าน', () => {
  const s = newState();
  const r = startExpedition(s, 'garden', ['cat'], T0);
  assert.equal(r.ok, true);
  const cat = getOwned(s, 'cat');
  assert.equal(cat.energy, 85);
  assert.equal(cat.mood, 80);
  assert.equal(cat.away, true);
  assert.equal(r.expedition.endAt, T0 + 1 * MIN);
  assert.equal(s.stats.trips, 1);
});

test('พลังงานไม่พอส่งไม่ได้', () => {
  const s = newState();
  getOwned(s, 'cat').energy = 10;
  const r = canSend(s, 'garden', ['cat']);
  assert.equal(r.ok, false);
  assert.match(r.reason, /พลังงาน/);
});

test('พื้นที่ที่ยังไม่ปลดล็อกส่งไม่ได้', () => {
  const s = newState();
  assert.equal(canSend(s, 'meadow', ['cat']).ok, false);
});

test('ทีมเกิน 3 ตัวหรือประตูเต็มส่งไม่ได้', () => {
  const s = withAnimals(newState(), 'shiba', 'rabbit', 'hamster');
  assert.equal(canSend(s, 'garden', ['cat', 'shiba', 'rabbit', 'hamster']).ok, false);
  assert.equal(startExpedition(s, 'garden', ['cat'], T0).ok, true);
  const r = canSend(s, 'garden', ['shiba']);
  assert.equal(r.ok, false);
  assert.match(r.reason, /ประตู/);
});

test('รางวัลคูณตามเลเวลและอารมณ์', () => {
  const s = withAnimals(newState(), 'shiba');
  const cat = getOwned(s, 'cat');
  const dog = getOwned(s, 'shiba');
  cat.mood = 90; // ร่าเริง x1.25
  dog.mood = 20; // เศร้า x0.6
  dog.level = 3; // x1.2
  // 12 * 1.25 + 12 * 1.2 * 0.6 = 15 + 8.64
  assert.equal(estimateCoins(s, 'garden', ['cat', 'shiba']), 24);
});

test('ยังไม่ถึงเวลาเก็บรางวัลไม่ได้', () => {
  const s = newState();
  const { expedition } = startExpedition(s, 'garden', ['cat'], T0);
  assert.equal(collectExpedition(s, expedition.id, T0 + 30_000), null);
});

test('เก็บรางวัลได้เหรียญ EXP และสัตว์กลับบ้าน', () => {
  const s = newState();
  const { expedition } = startExpedition(s, 'garden', ['cat'], T0);
  const before = s.coins;
  // rng: spread=0.5 (ไม่สุ่มเพิ่ม), drop แครอท 0.9 (ไม่ได้), เจอสัตว์ 0.9 (ไม่เจอ)
  const r = collectExpedition(s, expedition.id, T0 + MIN, seq(0.5, 0.9, 0.9));
  assert.equal(r.coins, 15); // 12 x 1.25 (ร่าเริง)
  assert.equal(s.coins, before + 15);
  assert.equal(getOwned(s, 'cat').exp, 5);
  assert.equal(getOwned(s, 'cat').away, false);
  assert.equal(s.expeditions.length, 0);
  assert.equal(r.newAnimal, null);
  assert.equal(s.areaMisses.garden, 1);
});

test('ระบบ pity เพิ่มโอกาสเจอสัตว์ทุกครั้งที่ไม่เจอ แล้วรีเซ็ตเมื่อเจอ', () => {
  const s = newState();
  assert.equal(discoverChance(s, 'garden'), 0.2);
  s.areaMisses.garden = 3;
  assert.ok(Math.abs(discoverChance(s, 'garden') - 0.5) < 1e-9);
  s.areaMisses.garden = 20;
  assert.equal(discoverChance(s, 'garden'), 1);

  s.areaMisses.garden = 3;
  const { expedition } = startExpedition(s, 'garden', ['cat'], T0);
  const r = collectExpedition(s, expedition.id, T0 + MIN, seq(0.5, 0.9, 0.4, 0));
  assert.equal(r.newAnimal, 'shiba');
  assert.ok(getOwned(s, 'shiba'));
  assert.equal(s.areaMisses.garden, 0);
});

test('เจอสัตว์ครบในพื้นที่แล้วไม่มีโอกาสเจออีก', () => {
  const s = withAnimals(newState(), 'shiba', 'rabbit');
  assert.equal(discoverChance(s, 'garden'), 0);
});

test('เลเวลอัปเมื่อ EXP ถึง', () => {
  const s = newState();
  getOwned(s, 'cat').exp = 18;
  const { expedition } = startExpedition(s, 'garden', ['cat'], T0);
  const r = collectExpedition(s, expedition.id, T0 + MIN, seq(0.5, 0.9, 0.9));
  assert.deepEqual(r.levelUps, [{ id: 'cat', level: 2 }]);
  assert.equal(getOwned(s, 'cat').exp, 3);
});
