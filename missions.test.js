import test from 'node:test';
import assert from 'node:assert/strict';
import { newState, withAnimals, seq, T0, HOUR } from './helpers.js';
import {
  ensureDaily,
  track,
  claimDaily,
  achievementList,
  claimAchievement,
  claimableCount,
} from '../js/logic/missions.js';
import { startExpedition } from '../js/logic/expedition.js';

test('สุ่มภารกิจ 3 ข้อไม่ซ้ำประเภท และไม่สุ่มใหม่ในวันเดียวกัน', () => {
  const s = newState();
  assert.equal(ensureDaily(s, T0, seq(0.1, 0.5, 0.9, 0.3)), true);
  assert.equal(s.daily.missions.length, 3);
  const types = s.daily.missions.map((m) => m.type);
  assert.equal(new Set(types).size, 3);
  assert.equal(ensureDaily(s, T0 + 2 * HOUR), false);
});

test('ข้ามเที่ยงคืนแล้วได้ภารกิจชุดใหม่', () => {
  const s = newState();
  ensureDaily(s, T0);
  s.daily.missions[0].progress = 1;
  assert.equal(ensureDaily(s, T0 + 20 * HOUR), true);
  assert.ok(s.daily.missions.every((m) => m.progress === 0));
});

test('ภารกิจส่งทีมครบ 3 ตัวไม่ออกถ้ามีสัตว์ไม่ถึง 3 ตัว', () => {
  for (let i = 0; i < 20; i++) {
    const s = newState();
    ensureDaily(s, T0, Math.random);
    assert.ok(!s.daily.missions.some((m) => m.type === 'fullTeam'));
  }
});

test('ส่งทีมแล้วนับความคืบหน้า และรับรางวัลได้เมื่อครบ', () => {
  const s = newState();
  s.daily = {
    date: '2026-10-19',
    missions: [
      { type: 'trip', target: 1, progress: 0, claimed: false, reward: { coins: 45 } },
      { type: 'area', areaId: 'garden', target: 3, progress: 0, claimed: false, reward: { food: 'fruit', qty: 1 } },
    ],
  };
  assert.equal(claimDaily(s, 0), null);
  startExpedition(s, 'garden', ['cat'], T0);
  assert.equal(s.daily.missions[0].progress, 1);
  assert.equal(s.daily.missions[1].progress, 1);
  const coins = s.coins;
  assert.deepEqual(claimDaily(s, 0), { coins: 45 });
  assert.equal(s.coins, coins + 45);
  assert.equal(claimDaily(s, 0), null);
});

test('ภารกิจหาเหรียญนับตามจำนวนเหรียญ', () => {
  const s = newState();
  s.daily = { date: 'x', missions: [{ type: 'earn', target: 100, progress: 0, claimed: false, reward: { coins: 20 } }] };
  track(s, 'earn', { amount: 60 });
  track(s, 'earn', { amount: 60 });
  assert.equal(s.daily.missions[0].progress, 100);
});

test('achievement รับรางวัลได้ครั้งเดียว', () => {
  const s = withAnimals(newState(), 'shiba', 'rabbit', 'hamster');
  const friend4 = achievementList(s).find((a) => a.id === 'friend4');
  assert.equal(friend4.done, true);
  assert.equal(claimableCount(s), 1);
  assert.deepEqual(claimAchievement(s, 'friend4'), { coins: 150 });
  assert.equal(claimAchievement(s, 'friend4'), null);
  assert.equal(claimableCount(s), 0);
});
