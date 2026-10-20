import { BALANCE } from '../data/balance.js';
import { getArea } from '../data/areas.js';
import { getFood } from '../data/items.js';

export function buyFood(state, foodId, qty = 1) {
  const food = getFood(foodId);
  if (!food) return { ok: false, reason: 'ไม่พบสินค้า' };
  const cost = food.price * qty;
  if (state.coins < cost) return { ok: false, reason: `เหรียญไม่พอ (ต้องการ ${cost})` };
  state.coins -= cost;
  state.inventory[foodId] = (state.inventory[foodId] || 0) + qty;
  return { ok: true, cost };
}

export function nextBed(state) {
  return BALANCE.beds[state.upgrades.bed + 1] || null;
}

export function buyBed(state) {
  const bed = nextBed(state);
  if (!bed) return { ok: false, reason: 'ที่นอนดีที่สุดแล้ว' };
  if (state.coins < bed.cost) return { ok: false, reason: `เหรียญไม่พอ (ต้องการ ${bed.cost})` };
  state.coins -= bed.cost;
  state.upgrades.bed = bed.level;
  return { ok: true, bed };
}

export function buySlot(state) {
  if (state.upgrades.slots >= BALANCE.maxSlots) return { ok: false, reason: 'มีประตูครบแล้ว' };
  if (state.coins < BALANCE.extraSlotCost) return { ok: false, reason: `เหรียญไม่พอ (ต้องการ ${BALANCE.extraSlotCost})` };
  state.coins -= BALANCE.extraSlotCost;
  state.upgrades.slots += 1;
  return { ok: true };
}

export function canUnlockArea(state, areaId) {
  const area = getArea(areaId);
  if (!area) return { ok: false, reason: 'ไม่พบพื้นที่' };
  if (state.unlockedAreas.includes(areaId)) return { ok: false, reason: 'ปลดล็อกแล้ว' };
  const topLevel = state.animals.reduce((mx, a) => Math.max(mx, a.level), 0);
  if (topLevel < area.reqLevel) return { ok: false, reason: `ต้องมีเพื่อนเลเวล ${area.reqLevel} ก่อน` };
  if (state.coins < area.unlockCost) return { ok: false, reason: `เหรียญไม่พอ (ต้องการ ${area.unlockCost.toLocaleString('th-TH')})` };
  return { ok: true, area };
}

export function unlockArea(state, areaId) {
  const check = canUnlockArea(state, areaId);
  if (!check.ok) return check;
  state.coins -= check.area.unlockCost;
  state.unlockedAreas.push(areaId);
  return { ok: true, area: check.area };
}
