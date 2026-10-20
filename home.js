import { BALANCE } from '../data/balance.js';
import { getAnimal } from '../data/animals.js';
import { getArea } from '../data/areas.js';
import { FOODS, getFood } from '../data/items.js';
import { animalSVG } from '../art/animals.js';
import { icon } from '../art/icons.js';
import {
  MOOD_LABEL,
  canFeed,
  collectPiggy,
  energyRegenPerMin,
  expNeeded,
  feed,
  getOwned,
  moodState,
  piggyCap,
  piggyRatePerMin,
} from '../logic/care.js';
import { buyFood } from '../logic/shop.js';
import { bar, chip, fmt, sheetHead } from './common.js';

const WINDOW_SVG =
  '<svg class="room-window" viewBox="0 0 92 64" aria-hidden="true">' +
  '<rect x="4" y="4" width="84" height="56" rx="10" fill="#DDF3FF" stroke="#fff" stroke-width="5"/>' +
  '<ellipse cx="30" cy="24" rx="12" ry="6" fill="#fff"/><ellipse cx="40" cy="21" rx="9" ry="6" fill="#fff"/>' +
  '<circle cx="70" cy="18" r="6" fill="#FFE59A"/>' +
  '<path d="M46 4v56M4 32h84" stroke="#fff" stroke-width="4"/>' +
  '<path d="M4 4h18c-4 18-4 38 0 56H4z" fill="#FFC6D6" opacity=".9"/><path d="M88 4H70c4 18 4 38 0 56h18z" fill="#FFC6D6" opacity=".9"/>' +
  '</svg>';

function sprite(a) {
  const mood = moodState(a.mood);
  const tired = a.energy < 30;
  const cls = mood === 'sad' ? 'sad' : tired ? 'tired' : '';
  const bubble = tired ? '<span class="bubble">Zz</span>' : '';
  const delay = (a.id.length * 0.37) % 2;
  return (
    `<button class="sprite ${cls}" data-action="openAnimal" data-id="${a.id}" aria-label="ดู${getAnimal(a.id).name}">` +
    animalSVG(a.id, mood).replace('<svg ', `<svg style="animation-delay:-${delay.toFixed(2)}s" `) +
    `<span class="nametag">${getAnimal(a.id).name}</span>${bubble}</button>`
  );
}

function friendRow(g, a) {
  const info = getAnimal(a.id);
  const mood = moodState(a.mood);
  const exp = g.state.expeditions.find((e) => e.members.includes(a.id));
  const where = exp
    ? chip('clock', `${getArea(exp.areaId).name}`, 'normal')
    : chip(null, MOOD_LABEL[mood], mood);
  return (
    `<button class="friend ${a.away ? 'away' : ''}" data-action="openAnimal" data-id="${a.id}">` +
    animalSVG(a.id, mood) +
    '<div class="friend-info">' +
    `<div class="friend-top"><b>${info.name}</b><span class="lv">Lv.${a.level}</span>${where}</div>` +
    `<div class="stat">${icon('energy')}${bar('energy', a.energy, BALANCE.maxEnergy, { live: `energy:${a.id}` })}<span class="num" data-live="energy-text:${a.id}">${Math.floor(a.energy)}</span></div>` +
    `<div class="stat">${icon('mood')}${bar('mood', a.mood, BALANCE.maxMood, { live: `mood:${a.id}` })}<span class="num" data-live="mood-text:${a.id}">${Math.floor(a.mood)}</span></div>` +
    '</div></button>'
  );
}

export function renderHome(g) {
  const s = g.state;
  const atHome = s.animals.filter((a) => !a.away);
  const bed = BALANCE.beds[s.upgrades.bed];
  const cap = piggyCap(s);
  const rate = piggyRatePerMin(s) * 60;

  const room =
    '<section class="room" aria-label="ห้องของเพื่อนๆ">' +
    WINDOW_SVG +
    `<div class="room-frame">${icon('bed')}${bed.name}</div>` +
    (atHome.length
      ? `<div class="room-floor">${atHome.map(sprite).join('')}</div>`
      : '<div class="room-empty">เพื่อนๆ ออกไปผจญภัยกันหมดเลย<br>บ้านเงียบจัง</div>') +
    '</section>';

  const piggy =
    '<section class="panel piggy">' +
    icon('piggy', 'ic-lg') +
    '<div class="piggy-body">' +
    `<b>กระปุกออมสิน <span class="num" data-live="piggy">${fmt(s.piggy)}</span> / <span class="num">${fmt(cap)}</span></b>` +
    bar('', s.piggy, cap, { live: 'piggy-bar' }) +
    `<span class="muted">${rate > 0 ? `เพื่อนที่อยู่บ้านและไม่เศร้าหยอดให้ ${fmt(rate)} เหรียญ/ชม.` : 'ตอนนี้ไม่มีใครหยอด เพื่อนต้องอยู่บ้านและไม่เศร้า'}</span>` +
    '</div>' +
    `<button class="btn mint small" data-action="collectPiggy" ${s.piggy < 1 ? 'disabled' : ''}>เก็บ</button>` +
    '</section>';

  const inventory =
    '<section class="section"><div class="section-head"><h2>ในตู้กับข้าว</h2>' +
    '<button class="hint" data-action="go" data-tab="shop">ไปร้านค้า</button></div>' +
    '<div class="inventory">' +
    FOODS.map(
      (f) => `<div class="inv-item">${icon(f.id)}<span>${f.name}</span><b>${s.inventory[f.id] || 0}</b></div>`,
    ).join('') +
    '</div></section>';

  const sorted = [...s.animals].sort((a, b) => Number(a.away) - Number(b.away));
  const friends =
    '<section class="section"><div class="section-head"><h2>เพื่อนขนฟู</h2>' +
    `<span class="hint">แตะเพื่อดูแล</span></div>` +
    `<div class="friend-list">${sorted.map((a) => friendRow(g, a)).join('')}</div></section>`;

  return room + piggy + friends + inventory;
}

// ---------- หน้าต่างดูแลสัตว์ ----------
export function renderAnimalSheet(g, id, back = null) {
  const s = g.state;
  const a = getOwned(s, id);
  if (!a) return sheetHead('ไม่พบเพื่อนตัวนี้');
  const info = getAnimal(id);
  const mood = moodState(a.mood);
  const exp = s.expeditions.find((e) => e.members.includes(id));

  let energyNote;
  if (a.away) energyNote = `กำลังสำรวจ${getArea(exp.areaId).name} ระหว่างนี้พลังงานไม่ฟื้น`;
  else if (a.energy >= BALANCE.maxEnergy) energyNote = 'พลังงานเต็มแล้ว พร้อมออกเดินทาง';
  else {
    const mins = Math.ceil((BALANCE.maxEnergy - a.energy) / energyRegenPerMin(s));
    energyNote = `พักที่บ้านอีกประมาณ ${mins >= 60 ? `${Math.floor(mins / 60)} ชม. ${mins % 60} นาที` : `${mins} นาที`} พลังงานจะเต็ม`;
  }
  const moodNote = {
    happy: `ร่าเริง ได้รางวัลเพิ่ม x${BALANCE.moodMultiplier.happy}`,
    normal: 'อารมณ์ปกติ ได้รางวัลตามปกติ',
    sad: `กำลังเศร้า รางวัลเหลือ x${BALANCE.moodMultiplier.sad} ให้อาหารหรือพักที่บ้านจะดีขึ้น`,
  }[mood];
  const maxed = a.level >= BALANCE.maxLevel;
  const need = expNeeded(a.level);

  const foods = FOODS.map((f) => {
    const have = s.inventory[f.id] || 0;
    const check = canFeed(s, id, f.id);
    const affordable = have > 0 || s.coins >= f.price;
    const action = have > 0 ? 'feed' : 'buyFeed';
    const sub = have > 0 ? `มี ${have}` : `<span class="buy">ซื้อ ${f.price}</span>`;
    return (
      `<button class="food-btn" data-action="${action}" data-id="${id}" data-food="${f.id}" ${check.ok && affordable ? '' : 'disabled'}>` +
      `${icon(f.id)}<b>${f.name}</b><small>+${f.energy} พลังงาน</small><small>${sub}</small></button>`
    );
  }).join('');

  return (
    sheetHead(info.name, { back }) +
    '<div class="sheet-body">' +
    `<div class="hero-animal">${animalSVG(id, mood)}<span class="kind">${info.kind} · Lv.${a.level}</span><p class="note">${info.bio}</p></div>` +
    '<div class="stats">' +
    `<div class="stat">${icon('energy')}<span class="label">พลังงาน</span>${bar('energy', a.energy, BALANCE.maxEnergy, { live: `energy:${id}` })}<span class="num" data-live="energy-text:${id}">${Math.floor(a.energy)}</span></div>` +
    `<p class="note">${energyNote}</p>` +
    `<div class="stat">${icon('mood')}<span class="label">ความสุข</span>${bar('mood', a.mood, BALANCE.maxMood, { live: `mood:${id}` })}<span class="num" data-live="mood-text:${id}">${Math.floor(a.mood)}</span></div>` +
    `<p class="note">${moodNote}</p>` +
    `<div class="stat">${icon('exp')}<span class="label">EXP</span>${bar('exp', maxed ? 1 : a.exp, maxed ? 1 : need)}<span class="num">${maxed ? 'MAX' : `${a.exp}/${need}`}</span></div>` +
    `<p class="note">เลเวลยิ่งสูง ยิ่งหาเหรียญได้มาก (ตอนนี้ x${(1 + BALANCE.levelBonus * (a.level - 1)).toFixed(1)})</p>` +
    '</div>' +
    `<div class="section"><div class="section-head"><h2>ให้อาหาร</h2><span class="hint">${a.away ? 'รอกลับบ้านก่อนนะ' : ''}</span></div>` +
    `<div class="food-row">${foods}</div></div>` +
    '</div>'
  );
}

function afterFeed(g, id, foodId) {
  const f = getFood(foodId);
  g.sound('eat');
  g.toast(`${getAnimal(id).name} กินอร่อย +${f.energy} พลังงาน`, 'energy');
  g.refresh();
}

export const homeActions = {
  openAnimal(g, d) {
    g.openSheet(() => renderAnimalSheet(g, d.id));
  },
  feed(g, d) {
    const r = feed(g.state, d.id, d.food);
    if (!r.ok) return g.fail(r.reason);
    afterFeed(g, d.id, d.food);
  },
  buyFeed(g, d) {
    const check = canFeed(g.state, d.id, d.food);
    if (!check.ok) return g.fail(check.reason);
    const bought = buyFood(g.state, d.food, 1);
    if (!bought.ok) return g.fail(bought.reason);
    feed(g.state, d.id, d.food);
    g.bumpCoins();
    afterFeed(g, d.id, d.food);
  },
  collectPiggy(g) {
    const amount = collectPiggy(g.state);
    if (!amount) return;
    g.sound('coin');
    g.toast(`เก็บจากกระปุก +${fmt(amount)} เหรียญ`, 'coin');
    g.bumpCoins();
    g.refresh();
  },
};
