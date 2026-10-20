import { BALANCE } from '../data/balance.js';
import { DAILY_TEMPLATES, ACHIEVEMENTS } from '../data/missions.js';
import { localDateKey } from './time.js';

export const DAILY_COUNT = 3;

// สุ่มภารกิจใหม่เมื่อขึ้นวันใหม่ (ตามเวลาเครื่อง) คืนค่า true ถ้าเพิ่งรีเซ็ต
export function ensureDaily(state, nowTs, rng = Math.random) {
  const date = localDateKey(nowTs);
  if (state.daily.date === date && state.daily.missions.length > 0) return false;
  const pool = [...DAILY_TEMPLATES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const missions = [];
  for (const tpl of pool) {
    if (missions.length >= DAILY_COUNT) break;
    const made = tpl.make(state, rng);
    if (made) missions.push({ type: tpl.type, progress: 0, claimed: false, ...made });
  }
  state.daily = { date, missions };
  return true;
}

// บันทึกความคืบหน้าภารกิจรายวัน
export function track(state, event, data = {}) {
  for (const m of state.daily.missions) {
    if (m.claimed) continue;
    let add = 0;
    if (event === 'trip') {
      if (m.type === 'trip') add = 1;
      if (m.type === 'area' && m.areaId === data.areaId) add = 1;
      if (m.type === 'fullTeam' && data.size >= BALANCE.teamMax) add = 1;
    } else if (event === 'feed' && m.type === 'feed') {
      add = 1;
    } else if (event === 'earn' && m.type === 'earn') {
      add = data.amount || 0;
    } else if (event === 'piggy' && m.type === 'piggy') {
      add = 1;
    }
    if (add) m.progress = Math.min(m.target, m.progress + add);
  }
}

export function grant(state, reward) {
  if (reward.coins) {
    state.coins += reward.coins;
    state.stats.coinsEarned += reward.coins;
  }
  if (reward.food) {
    state.inventory[reward.food] = (state.inventory[reward.food] || 0) + (reward.qty || 1);
  }
}

export function claimDaily(state, index) {
  const m = state.daily.missions[index];
  if (!m || m.claimed || m.progress < m.target) return null;
  m.claimed = true;
  grant(state, m.reward);
  return m.reward;
}

export function achievementList(state) {
  return ACHIEVEMENTS.map((a) => {
    const value = Math.min(a.target, a.value(state));
    return { ...a, value, done: value >= a.target, claimed: !!state.achievements[a.id] };
  });
}

export function claimAchievement(state, id) {
  const a = achievementList(state).find((x) => x.id === id);
  if (!a || !a.done || a.claimed) return null;
  state.achievements[id] = true;
  grant(state, { coins: a.reward });
  return { coins: a.reward };
}

export function claimableCount(state) {
  const daily = state.daily.missions.filter((m) => !m.claimed && m.progress >= m.target).length;
  const ach = achievementList(state).filter((a) => a.done && !a.claimed).length;
  return daily + ach;
}
