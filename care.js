import { BALANCE } from '../data/balance.js';
import { getFood } from '../data/items.js';
import { track } from './missions.js';

const STEP_MS = 60_000;

export function moodState(mood) {
  if (mood >= BALANCE.moodHappyAt) return 'happy';
  if (mood < BALANCE.moodSadBelow) return 'sad';
  return 'normal';
}

export const MOOD_LABEL = { happy: 'ร่าเริง', normal: 'ปกติ', sad: 'เศร้า' };

export function moodMultiplier(mood) {
  return BALANCE.moodMultiplier[moodState(mood)];
}

export function levelMultiplier(level) {
  return 1 + BALANCE.levelBonus * (level - 1);
}

export function energyRegenPerMin(state) {
  return BALANCE.energyRegenPerMin * BALANCE.beds[state.upgrades.bed].mult;
}

export function piggyRatePerMin(state) {
  const eligible = state.animals.filter((a) => !a.away && moodState(a.mood) !== 'sad').length;
  return eligible * BALANCE.piggyPerMinPerAnimal;
}

export function piggyCap(state) {
  return BALANCE.piggyPerMinPerAnimal * 60 * BALANCE.piggyMaxHours * state.animals.length;
}

export function getOwned(state, id) {
  return state.animals.find((a) => a.id === id);
}

export function earn(state, amount) {
  if (amount <= 0) return;
  state.coins += amount;
  state.stats.coinsEarned += amount;
  track(state, 'earn', { amount });
}

// เดินเวลาไปข้างหน้า dtMs: สัตว์ที่อยู่บ้านฟื้นพลังงาน/ความสุข และกระปุกออมสินเพิ่มขึ้น
export function advance(state, dtMs) {
  let left = dtMs;
  while (left > 0) {
    const step = Math.min(STEP_MS, left);
    const min = step / 60_000;
    const piggyAdd = piggyRatePerMin(state) * min;
    const energyAdd = energyRegenPerMin(state) * min;
    for (const a of state.animals) {
      if (a.away) continue;
      a.energy = Math.min(BALANCE.maxEnergy, a.energy + energyAdd);
      a.mood = Math.min(BALANCE.maxMood, a.mood + BALANCE.moodRegenPerMin * min);
    }
    state.piggy = Math.min(piggyCap(state), state.piggy + piggyAdd);
    left -= step;
  }
}

// คำนวณสิ่งที่เกิดขึ้นตั้งแต่ lastTick ถึง nowTs (ใช้ทั้งตอนเล่นและตอนเปิดเกมกลับมา)
// ถ้าเวลาเครื่องถูกย้อนกลับ จะไม่ให้ผลย้อนหลัง แค่ตั้งจุดอ้างอิงใหม่
export function catchUp(state, nowTs) {
  const elapsed = nowTs - state.lastTick;
  state.lastTick = nowTs;
  if (elapsed <= 0) return 0;
  advance(state, Math.min(elapsed, BALANCE.maxCatchUpHours * 3_600_000));
  return elapsed;
}

export function collectPiggy(state) {
  const amount = Math.floor(state.piggy);
  if (amount <= 0) return 0;
  state.piggy -= amount;
  earn(state, amount);
  state.stats.piggyCollects += 1;
  track(state, 'piggy');
  return amount;
}

export function canFeed(state, animalId, foodId) {
  const a = getOwned(state, animalId);
  const food = getFood(foodId);
  if (!a || !food) return { ok: false, reason: 'ไม่พบข้อมูล' };
  if (a.away) return { ok: false, reason: 'กำลังออกสำรวจอยู่' };
  if (a.energy >= BALANCE.maxEnergy && a.mood >= BALANCE.maxMood) {
    return { ok: false, reason: 'อิ่มแล้ว พลังงานกับความสุขเต็มหลอด' };
  }
  return { ok: true, food, animal: a };
}

export function feed(state, animalId, foodId) {
  const check = canFeed(state, animalId, foodId);
  if (!check.ok) return check;
  if ((state.inventory[foodId] || 0) <= 0) return { ok: false, reason: `${check.food.name}หมดแล้ว` };
  state.inventory[foodId] -= 1;
  const a = check.animal;
  a.energy = Math.min(BALANCE.maxEnergy, a.energy + check.food.energy);
  a.mood = Math.min(BALANCE.maxMood, a.mood + check.food.mood);
  state.stats.feeds += 1;
  track(state, 'feed');
  return { ok: true };
}

export function expNeeded(level) {
  return BALANCE.expToNext[level] ?? Infinity;
}

// เพิ่ม EXP แล้วคืนจำนวนเลเวลที่เพิ่มขึ้น
export function addExp(animal, amount) {
  let gained = 0;
  animal.exp += amount;
  while (animal.level < BALANCE.maxLevel && animal.exp >= expNeeded(animal.level)) {
    animal.exp -= expNeeded(animal.level);
    animal.level += 1;
    gained += 1;
  }
  if (animal.level >= BALANCE.maxLevel) animal.exp = 0;
  return gained;
}
