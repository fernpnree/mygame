import { AREAS, getArea } from './areas.js';
import { ANIMALS } from './animals.js';
import { BALANCE } from './balance.js';

// แม่แบบภารกิจรายวัน: make(state, rng) คืนค่าภารกิจ หรือ null ถ้ายังทำไม่ได้
export const DAILY_TEMPLATES = [
  {
    type: 'trip',
    make: (s, rng) => {
      const target = pick([3, 4, 5], rng);
      return { target, reward: { coins: target * 15 } };
    },
  },
  {
    type: 'feed',
    make: (s, rng) => {
      const target = pick([2, 3], rng);
      return { target, reward: { food: 'carrot', qty: target } };
    },
  },
  {
    type: 'earn',
    make: (s, rng) => {
      const tier = s.unlockedAreas.length;
      const target = pick([150, 200, 300], rng) * tier;
      return { target, reward: { coins: Math.round(target * 0.2) } };
    },
  },
  {
    type: 'piggy',
    make: () => ({ target: 1, reward: { coins: 30 } }),
  },
  {
    type: 'area',
    make: (s, rng) => {
      const areaId = pick(s.unlockedAreas, rng);
      const target = areaId === 'garden' ? 3 : 2;
      return { target, areaId, reward: { food: 'fruit', qty: 1 } };
    },
  },
  {
    type: 'fullTeam',
    make: (s) => {
      if (s.animals.length < BALANCE.teamMax) return null;
      return { target: 1, reward: { coins: 60 } };
    },
  },
];

export function dailyText(m) {
  switch (m.type) {
    case 'trip':
      return `ส่งทีมออกสำรวจ ${m.target} ครั้ง`;
    case 'feed':
      return `ให้อาหารเพื่อนๆ ${m.target} ครั้ง`;
    case 'earn':
      return `หาเหรียญให้ได้ ${m.target.toLocaleString('th-TH')} เหรียญ`;
    case 'piggy':
      return 'เก็บเหรียญจากกระปุกออมสิน';
    case 'area':
      return `สำรวจ${getArea(m.areaId).name} ${m.target} ครั้ง`;
    case 'fullTeam':
      return `ส่งทีมครบ ${BALANCE.teamMax} ตัวออกสำรวจ`;
    default:
      return '';
  }
}

const maxLevel = (s) => s.animals.reduce((mx, a) => Math.max(mx, a.level), 0);

// Achievement: value(state) เทียบกับ target
export const ACHIEVEMENTS = [
  { id: 'trip1', name: 'ก้าวแรกของการผจญภัย', desc: 'ส่งทีมออกสำรวจครั้งแรก', target: 1, value: (s) => s.stats.trips, reward: 20 },
  { id: 'trip10', name: 'นักสำรวจฝึกหัด', desc: 'ออกสำรวจ 10 ครั้ง', target: 10, value: (s) => s.stats.trips, reward: 60 },
  { id: 'trip50', name: 'นักสำรวจตัวจริง', desc: 'ออกสำรวจ 50 ครั้ง', target: 50, value: (s) => s.stats.trips, reward: 250 },
  { id: 'trip100', name: 'ตำนานนักผจญภัย', desc: 'ออกสำรวจ 100 ครั้ง', target: 100, value: (s) => s.stats.trips, reward: 600 },
  { id: 'friend4', name: 'บ้านเริ่มคึกคัก', desc: 'มีเพื่อนขนฟู 4 ตัว', target: 4, value: (s) => s.animals.length, reward: 150 },
  { id: 'friend8', name: 'ครอบครัวขนฟูครบทีม', desc: `พบเพื่อนครบทั้ง ${ANIMALS.length} ตัว`, target: ANIMALS.length, value: (s) => s.animals.length, reward: 1000 },
  { id: 'coin1k', name: 'กระเป๋าเริ่มหนัก', desc: 'หาเหรียญรวม 1,000 เหรียญ', target: 1000, value: (s) => s.stats.coinsEarned, reward: 100 },
  { id: 'coin10k', name: 'เศรษฐีขนฟู', desc: 'หาเหรียญรวม 10,000 เหรียญ', target: 10000, value: (s) => s.stats.coinsEarned, reward: 500 },
  { id: 'areaAll', name: 'แผนที่ครบทุกมุม', desc: 'ปลดล็อกพื้นที่สำรวจครบทุกแห่ง', target: AREAS.length, value: (s) => s.unlockedAreas.length, reward: 500 },
  { id: 'lv5', name: 'เพื่อนที่เก่งขึ้น', desc: 'มีเพื่อนเลเวล 5', target: 5, value: maxLevel, reward: 200 },
  { id: 'lv10', name: 'สุดยอดคู่หู', desc: 'มีเพื่อนเลเวล 10', target: 10, value: maxLevel, reward: 1000 },
  { id: 'feed20', name: 'เชฟประจำบ้าน', desc: 'ให้อาหาร 20 ครั้ง', target: 20, value: (s) => s.stats.feeds, reward: 100 },
  { id: 'bedMax', name: 'ห้องนอนในฝัน', desc: 'อัปเกรดที่นอนถึงระดับสูงสุด', target: BALANCE.beds.length - 1, value: (s) => s.upgrades.bed, reward: 300 },
];

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}
