import { BALANCE } from './data/balance.js';
import { ANIMALS, STARTER_ID } from './data/animals.js';

export const SAVE_KEY = 'fluffy-adventure-save';
export const SAVE_VERSION = 1;

export function createAnimal(id) {
  return {
    id,
    level: 1,
    exp: 0,
    energy: BALANCE.maxEnergy,
    mood: BALANCE.startMood,
    away: false,
  };
}

export function createState(now) {
  return {
    version: SAVE_VERSION,
    createdAt: now,
    lastTick: now,
    coins: BALANCE.startCoins,
    animals: [createAnimal(STARTER_ID)],
    inventory: { carrot: 2, fruit: 0, treat: 0 },
    unlockedAreas: ['garden'],
    areaMisses: {},
    expeditions: [],
    nextExpeditionId: 1,
    upgrades: { bed: 0, slots: BALANCE.baseSlots },
    piggy: 0,
    daily: { date: '', missions: [] },
    achievements: {},
    stats: { trips: 0, feeds: 0, coinsEarned: 0, piggyCollects: 0 },
    settings: { sound: true },
    tutorialDone: false,
  };
}

// เติมช่องที่เซฟเก่ายังไม่มี เพื่อให้อัปเดตเกมแล้วเซฟเดิมยังใช้ได้
export function migrate(data, now) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.animals)) return null;
  const fresh = createState(now);
  const known = new Set(ANIMALS.map((a) => a.id));
  const state = { ...fresh, ...data, version: SAVE_VERSION };
  for (const key of ['inventory', 'upgrades', 'stats', 'settings', 'daily', 'areaMisses', 'achievements']) {
    state[key] = { ...fresh[key], ...(data[key] || {}) };
  }
  state.animals = data.animals
    .filter((a) => a && known.has(a.id))
    .map((a) => ({ ...createAnimal(a.id), ...a }));
  if (state.animals.length === 0) state.animals = fresh.animals;
  if (!Array.isArray(state.expeditions)) state.expeditions = [];
  if (!Array.isArray(state.unlockedAreas) || state.unlockedAreas.length === 0) {
    state.unlockedAreas = fresh.unlockedAreas;
  }
  if (typeof state.lastTick !== 'number') state.lastTick = now;
  return state;
}

export function loadState(storage, now) {
  try {
    const text = storage.getItem(SAVE_KEY);
    if (!text) return null;
    return migrate(JSON.parse(text), now);
  } catch {
    return null;
  }
}

export function saveState(storage, state) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(storage) {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    // ไม่มี storage ก็ไม่เป็นไร
  }
}
