import test from 'node:test';
import assert from 'node:assert/strict';
import { T0 } from './helpers.js';
import { createState, loadState, saveState, migrate, SAVE_KEY } from '../js/state.js';
import { unlockArea, buyBed, buySlot, buyFood } from '../js/logic/shop.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
}

test('เซฟแล้วโหลดกลับมาได้เหมือนเดิม', () => {
  const storage = memoryStorage();
  const s = createState(T0);
  s.coins = 999;
  assert.equal(saveState(storage, s), true);
  assert.deepEqual(loadState(storage, T0), s);
});

test('เซฟเสียหรือไม่มีเซฟ คืนค่า null', () => {
  const storage = memoryStorage();
  assert.equal(loadState(storage, T0), null);
  storage.setItem(SAVE_KEY, '{not json');
  assert.equal(loadState(storage, T0), null);
});

test('storage ใช้ไม่ได้ (เช่น private mode) เกมไม่พัง', () => {
  const broken = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
  };
  assert.equal(loadState(broken, T0), null);
  assert.equal(saveState(broken, createState(T0)), false);
});

test('migration เติมช่องที่เซฟเก่าไม่มี และตัดสัตว์ที่ไม่รู้จักออก', () => {
  const old = {
    version: 0,
    coins: 77,
    animals: [{ id: 'cat', level: 4 }, { id: 'dragon' }],
    inventory: { carrot: 5 },
  };
  const s = migrate(old, T0);
  assert.equal(s.coins, 77);
  assert.equal(s.animals.length, 1);
  assert.equal(s.animals[0].level, 4);
  assert.equal(s.animals[0].energy, 100);
  assert.equal(s.inventory.carrot, 5);
  assert.equal(s.inventory.treat, 0);
  assert.deepEqual(s.unlockedAreas, ['garden']);
  assert.equal(s.settings.sound, true);
});

test('ปลดล็อกพื้นที่ต้องมีเหรียญและเลเวลถึง', () => {
  const s = createState(T0);
  s.coins = 100;
  assert.equal(unlockArea(s, 'meadow').ok, false);
  s.coins = 1000;
  assert.equal(unlockArea(s, 'meadow').ok, true);
  assert.equal(s.coins, 850);
  const forest = unlockArea(s, 'forest');
  assert.equal(forest.ok, false);
  assert.match(forest.reason, /เลเวล 3/);
  s.animals[0].level = 3;
  assert.equal(unlockArea(s, 'forest').ok, true);
});

test('ซื้ออาหาร ที่นอน และประตูที่ 2', () => {
  const s = createState(T0);
  s.coins = 2000;
  assert.equal(buyFood(s, 'fruit', 2).ok, true);
  assert.equal(s.inventory.fruit, 2);
  assert.equal(buyBed(s).ok, true);
  assert.equal(s.upgrades.bed, 1);
  assert.equal(buySlot(s).ok, true);
  assert.equal(buySlot(s).ok, false);
  assert.equal(s.coins, 2000 - 120 - 300 - 500);
});
