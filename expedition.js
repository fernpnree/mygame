import { BALANCE } from '../data/balance.js';
import { ANIMALS } from '../data/animals.js';
import { getArea } from '../data/areas.js';
import { createAnimal } from '../state.js';
import { addExp, earn, getOwned, levelMultiplier, moodMultiplier } from './care.js';
import { track } from './missions.js';

export function freeSlots(state) {
  return state.upgrades.slots - state.expeditions.length;
}

export function undiscovered(state, areaId) {
  return ANIMALS.filter((a) => a.area === areaId && !getOwned(state, a.id));
}

export function discoverChance(state, areaId) {
  if (undiscovered(state, areaId).length === 0) return 0;
  const misses = state.areaMisses[areaId] || 0;
  return Math.min(1, BALANCE.discoverBase + BALANCE.discoverPity * misses);
}

export function memberMultiplier(animal) {
  return levelMultiplier(animal.level) * moodMultiplier(animal.mood);
}

// เหรียญโดยประมาณ (ยังไม่สุ่ม ±10%)
export function estimateCoins(state, areaId, animalIds) {
  const area = getArea(areaId);
  const mult = animalIds.reduce((sum, id) => sum + memberMultiplier(getOwned(state, id)), 0);
  return Math.round(area.coins * mult);
}

export function canSend(state, areaId, animalIds) {
  const area = getArea(areaId);
  if (!area || !state.unlockedAreas.includes(areaId)) return { ok: false, reason: 'ยังไม่ได้ปลดล็อกพื้นที่นี้' };
  if (freeSlots(state) <= 0) return { ok: false, reason: 'ทีมสำรวจออกไปครบทุกประตูแล้ว' };
  if (animalIds.length === 0) return { ok: false, reason: 'เลือกเพื่อนอย่างน้อย 1 ตัว' };
  if (animalIds.length > BALANCE.teamMax) return { ok: false, reason: `ทีมละไม่เกิน ${BALANCE.teamMax} ตัว` };
  if (new Set(animalIds).size !== animalIds.length) return { ok: false, reason: 'เลือกซ้ำกัน' };
  for (const id of animalIds) {
    const a = getOwned(state, id);
    if (!a) return { ok: false, reason: 'ไม่พบเพื่อนตัวนี้' };
    if (a.away) return { ok: false, reason: 'มีเพื่อนที่ออกสำรวจอยู่แล้ว' };
    if (a.energy < area.energy) return { ok: false, reason: 'พลังงานไม่พอ' };
  }
  return { ok: true, area };
}

export function startExpedition(state, areaId, animalIds, nowTs) {
  const check = canSend(state, areaId, animalIds);
  if (!check.ok) return check;
  const area = check.area;
  let mult = 0;
  for (const id of animalIds) {
    const a = getOwned(state, id);
    mult += memberMultiplier(a);
    a.energy -= area.energy;
    a.mood = Math.max(0, a.mood - BALANCE.moodLossPerExpedition);
    a.away = true;
  }
  const expedition = {
    id: state.nextExpeditionId++,
    areaId,
    members: [...animalIds],
    mult,
    startAt: nowTs,
    endAt: nowTs + area.minutes * 60_000,
  };
  state.expeditions.push(expedition);
  state.stats.trips += 1;
  track(state, 'trip', { areaId, size: animalIds.length });
  return { ok: true, expedition };
}

export function isDone(expedition, nowTs) {
  return nowTs >= expedition.endAt;
}

export function collectExpedition(state, expeditionId, nowTs, rng = Math.random) {
  const idx = state.expeditions.findIndex((e) => e.id === expeditionId);
  if (idx < 0) return null;
  const exp = state.expeditions[idx];
  if (!isDone(exp, nowTs)) return null;
  const area = getArea(exp.areaId);

  const spread = 1 + BALANCE.rewardSpread * (2 * rng() - 1);
  const coins = Math.max(1, Math.round(area.coins * exp.mult * spread));
  earn(state, coins);

  const levelUps = [];
  for (const id of exp.members) {
    const a = getOwned(state, id);
    if (!a) continue;
    a.away = false;
    const gained = addExp(a, area.exp);
    if (gained) levelUps.push({ id, level: a.level });
  }

  const foods = [];
  for (const [foodId, chance] of Object.entries(area.drops)) {
    if (rng() < chance) {
      state.inventory[foodId] = (state.inventory[foodId] || 0) + 1;
      foods.push(foodId);
    }
  }

  let newAnimal = null;
  let giftCoins = 0;
  const candidates = undiscovered(state, area.id);
  if (candidates.length > 0) {
    if (rng() < discoverChance(state, area.id)) {
      newAnimal = candidates[Math.floor(rng() * candidates.length)].id;
      state.animals.push(createAnimal(newAnimal));
      state.areaMisses[area.id] = 0;
    } else {
      state.areaMisses[area.id] = (state.areaMisses[area.id] || 0) + 1;
    }
  } else if (rng() < 0.25) {
    giftCoins = area.coins;
    earn(state, giftCoins);
  }

  state.expeditions.splice(idx, 1);
  return { areaId: area.id, members: exp.members, coins, levelUps, foods, newAnimal, giftCoins, exp: area.exp };
}
