import { BALANCE } from '../data/balance.js';
import { getAnimal } from '../data/animals.js';
import { AREAS, getArea } from '../data/areas.js';
import { getFood } from '../data/items.js';
import { animalSVG } from '../art/animals.js';
import { icon } from '../art/icons.js';
import { sceneSVG } from '../art/scenes.js';
import { MOOD_LABEL, getOwned, moodState } from '../logic/care.js';
import {
  canSend,
  collectExpedition,
  discoverChance,
  estimateCoins,
  freeSlots,
  isDone,
  startExpedition,
  undiscovered,
} from '../logic/expedition.js';
import { canUnlockArea, unlockArea } from '../logic/shop.js';
import { formatCountdown } from '../logic/time.js';
import { renderAnimalSheet } from './home.js';
import { bar, chip, fmt, price, sheetHead } from './common.js';

// ทีมที่กำลังเลือกอยู่ในหน้าต่างจัดทีม
const picker = { areaId: null, sel: [] };

function tripTag(g, e) {
  const area = getArea(e.areaId);
  const done = isDone(e, g.now());
  const members = `<div class="tag-members">${e.members.map((id) => animalSVG(id, done ? 'happy' : 'normal')).join('')}</div>`;
  const total = e.endAt - e.startAt;
  const elapsed = Math.min(total, g.now() - e.startAt);
  if (done) {
    return (
      '<div class="tag done">' +
      `<div class="tag-title"><b>${area.name}</b>${members}</div>` +
      '<span class="stamp">กลับถึงบ้านแล้ว</span>' +
      `<button class="btn mint block" style="grid-column:1/-1" data-action="collect" data-exp="${e.id}">${icon('gift')}รับของที่ได้มา</button>` +
      '</div>'
    );
  }
  return (
    '<div class="tag">' +
    `<div class="tag-title"><b>${area.name}</b>${members}</div>` +
    `<span class="time" data-live="cd:${e.id}" data-end="${e.endAt}">${formatCountdown(e.endAt - g.now())}</span>` +
    `<div class="bar trip" data-live="trip:${e.id}" data-start="${e.startAt}" data-end="${e.endAt}"><i style="width:${(elapsed / total) * 100}%"></i></div>` +
    '</div>'
  );
}

function postcard(g, area) {
  const s = g.state;
  const unlocked = s.unlockedAreas.includes(area.id);
  const missing = undiscovered(s, area.id);
  const chips =
    chip('clock', `${area.minutes} นาที`) +
    chip('energy', `${area.energy}/ตัว`) +
    chip('coin', `~${area.coins}/ตัว`) +
    chip('exp', `+${area.exp} EXP`);

  let hint;
  if (missing.length) {
    const sil = missing.map((a) => animalSVG(a.id, 'normal', 'silhouette')).join('');
    const chance = unlocked ? ` โอกาสเจอ ${Math.round(discoverChance(s, area.id) * 100)}%` : '';
    hint = `<div class="find-hint"><span class="mini">${sil}</span>มีเพื่อนใหม่ซ่อนอยู่ ${missing.length} ตัว${chance}</div>`;
  } else if (area.id !== 'garden' || s.animals.length > 1) {
    hint = `<div class="find-hint">${icon('gift')}เจอเพื่อนครบแล้ว มีลุ้นกล่องของขวัญ</div>`;
  } else {
    hint = '';
  }

  let actions;
  if (unlocked) {
    const noSlot = freeSlots(s) <= 0;
    actions =
      `<span class="muted">${noSlot ? 'ทุกประตูมีทีมออกไปแล้ว' : 'เลือกได้ 1-3 ตัว'}</span>` +
      `<button class="btn small" data-action="openPicker" data-area="${area.id}" ${noSlot ? 'disabled' : ''}>ส่งทีม</button>`;
  } else {
    const check = canUnlockArea(s, area.id);
    const req = area.reqLevel > 1 ? `ต้องมีเพื่อน Lv.${area.reqLevel}` : 'ใช้เหรียญปลดล็อก';
    actions =
      `<span class="muted">${icon('lock')} ${check.ok ? 'พร้อมปลดล็อกแล้ว' : req}</span>` +
      `<button class="btn small soft" data-action="unlockArea" data-area="${area.id}" ${check.ok ? '' : 'disabled'}>ปลดล็อก ${price(area.unlockCost)}</button>`;
  }

  return (
    `<article class="postcard ${unlocked ? '' : 'locked'}">` +
    sceneSVG(area.id) +
    '<div class="postcard-body">' +
    `<div class="postcard-head"><h3>${area.name}</h3></div>` +
    `<p class="muted">${area.desc}</p>` +
    `<div class="chips">${chips}</div>` +
    hint +
    `<div class="postcard-actions">${actions}</div>` +
    '</div></article>'
  );
}

export function renderExplore(g) {
  const s = g.state;
  const trips = s.expeditions.map((e) => tripTag(g, e)).join('');
  const free = Array.from({ length: Math.max(0, freeSlots(s)) }, () => `<div class="slot-free">${icon('door')}ประตูว่าง เลือกพื้นที่ด้านล่างแล้วส่งทีมได้เลย</div>`).join('');
  const more =
    s.upgrades.slots < BALANCE.maxSlots
      ? '<p class="muted">ส่งได้ทีละ 1 ทีม ซื้อประตูบานที่ 2 ได้ที่ร้านค้า</p>'
      : '';
  return (
    '<section class="section">' +
    `<div class="section-head"><h2>ทีมที่ออกเดินทาง</h2><span class="hint">${s.expeditions.length}/${s.upgrades.slots} ประตู</span></div>` +
    trips +
    free +
    more +
    '</section>' +
    '<section class="section"><div class="section-head"><h2>พื้นที่สำรวจ</h2></div>' +
    AREAS.map((a) => postcard(g, a)).join('') +
    '</section>'
  );
}

// ---------- หน้าต่างจัดทีม ----------
function pickRow(g, a, area) {
  const info = getAnimal(a.id);
  const mood = moodState(a.mood);
  const selected = picker.sel.includes(a.id);
  const lowEnergy = a.energy < area.energy;
  let status;
  if (a.away) status = '<span class="muted">กำลังสำรวจอยู่</span>';
  else if (lowEnergy) status = `<span class="muted">พลังงานไม่พอ (ต้องใช้ ${area.energy})</span>`;
  else status = chip(null, MOOD_LABEL[mood], mood);

  const right = a.away
    ? ''
    : lowEnergy
      ? `<button class="btn small soft" data-action="pickerFeed" data-id="${a.id}">ให้อาหาร</button>`
      : `<span class="check">${selected ? icon('check') : ''}</span>`;
  const blocked = a.away || lowEnergy;
  const tag = blocked ? 'div' : 'button';
  const attrs = blocked ? '' : `data-action="togglePick" data-id="${a.id}" aria-pressed="${selected}"`;
  return (
    `<${tag} class="pick ${selected ? 'selected' : ''} ${blocked ? 'blocked' : ''}" ${attrs}>` +
    animalSVG(a.id, mood) +
    '<div class="friend-info">' +
    `<div class="friend-top"><b>${info.name}</b><span class="lv">Lv.${a.level}</span></div>` +
    `<div class="stat">${icon('energy')}${bar('energy', a.energy, BALANCE.maxEnergy, { need: area.energy })}<span class="num">${Math.floor(a.energy)}</span></div>` +
    status +
    `</div>${right}</${tag}>`
  );
}

export function renderPicker(g) {
  const s = g.state;
  const area = getArea(picker.areaId);
  picker.sel = picker.sel.filter((id) => {
    const a = getOwned(s, id);
    return a && !a.away && a.energy >= area.energy;
  });
  const rows = [...s.animals]
    .sort((a, b) => Number(a.away) - Number(b.away) || b.energy - a.energy)
    .map((a) => pickRow(g, a, area))
    .join('');
  const check = canSend(s, area.id, picker.sel);
  const est = picker.sel.length ? estimateCoins(s, area.id, picker.sel) : 0;
  const sad = picker.sel.filter((id) => moodState(getOwned(s, id).mood) === 'sad');
  const sadWarn = sad.length
    ? `<p class="warn">${sad.map((id) => getAnimal(id).name).join(', ')} กำลังเศร้า ได้รางวัลน้อยลง ลองให้อาหารก่อนดีไหม</p>`
    : '';
  const drops = Object.keys(area.drops).map((f) => getFood(f).name).join(', ');
  return (
    sheetHead(`ส่งทีมไป${area.name}`) +
    '<div class="sheet-body">' +
    `<p class="muted">ใช้พลังงาน ${area.energy} ต่อตัว · ไป ${area.minutes} นาที · ความสุขลด ${BALANCE.moodLossPerExpedition} · อาจได้ ${drops}</p>` +
    `<div class="pick-list">${rows}</div>` +
    sadWarn +
    '</div>' +
    '<div class="sheet-foot">' +
    `<div class="estimate">${chip(null, `เลือกแล้ว ${picker.sel.length}/${BALANCE.teamMax}`)}${chip('coin', `ประมาณ ${fmt(est)}`)}${chip('exp', `+${area.exp} EXP/ตัว`)}</div>` +
    `<button class="btn block" data-action="sendTeam" ${check.ok ? '' : 'disabled'}>${check.ok ? 'ออกเดินทาง!' : check.reason}</button>` +
    '</div>'
  );
}

// ---------- ผลการสำรวจ ----------
function renderResult(r) {
  const area = getArea(r.areaId);
  const lines = [];
  lines.push(`<div class="reward-line">${icon('exp')}ทุกตัวได้ +${r.exp} EXP</div>`);
  for (const up of r.levelUps) {
    lines.push(`<div class="reward-line">${icon('exp')}<b>${getAnimal(up.id).name}</b> เลเวลอัปเป็น Lv.${up.level}!</div>`);
  }
  for (const f of r.foods) {
    lines.push(`<div class="reward-line">${icon(f)}เก็บ${getFood(f).name}มาได้ 1 ชิ้น</div>`);
  }
  if (r.giftCoins) {
    lines.push(`<div class="reward-line">${icon('gift')}เจอกล่องของขวัญ +${fmt(r.giftCoins)} เหรียญ</div>`);
  }
  const friend = r.newAnimal
    ? `<div class="new-friend"><span class="ribbon">เพื่อนใหม่!</span>${animalSVG(r.newAnimal, 'happy')}` +
      `<b>${getAnimal(r.newAnimal).name}</b><span class="muted">${getAnimal(r.newAnimal).kind} ตามทีมกลับมาอยู่ด้วยกันที่บ้าน</span></div>`
    : '';
  return (
    sheetHead(`กลับจาก${area.name}`) +
    '<div class="sheet-body">' +
    friend +
    `<div class="reward-big">${icon('coin')}+${fmt(r.coins)}</div>` +
    `<div class="reward-list">${lines.join('')}</div>` +
    '</div>' +
    '<div class="sheet-foot"><button class="btn block" data-action="closeSheet">เยี่ยมเลย</button></div>'
  );
}

export const exploreActions = {
  openPicker(g, d) {
    const s = g.state;
    const area = getArea(d.area);
    picker.areaId = d.area;
    picker.sel = s.animals
      .filter((a) => !a.away && a.energy >= area.energy && moodState(a.mood) !== 'sad')
      .sort((a, b) => b.mood - a.mood)
      .slice(0, BALANCE.teamMax)
      .map((a) => a.id);
    g.openSheet(() => renderPicker(g));
  },
  togglePick(g, d) {
    if (picker.sel.includes(d.id)) picker.sel = picker.sel.filter((x) => x !== d.id);
    else if (picker.sel.length < BALANCE.teamMax) picker.sel.push(d.id);
    else return g.fail(`ทีมละไม่เกิน ${BALANCE.teamMax} ตัว`);
    g.sound('tap');
    g.refresh();
  },
  pickerFeed(g, d) {
    const back = { action: 'backToPicker', label: 'กลับไปจัดทีม' };
    g.replaceSheet(() => renderAnimalSheet(g, d.id, back));
  },
  backToPicker(g) {
    g.replaceSheet(() => renderPicker(g));
  },
  sendTeam(g) {
    const r = startExpedition(g.state, picker.areaId, picker.sel, g.now());
    if (!r.ok) return g.fail(r.reason);
    g.sound('send');
    g.toast(`ออกเดินทางไป${getArea(picker.areaId).name}แล้ว`, 'explore');
    picker.sel = [];
    g.closeSheet();
    g.refresh();
  },
  collect(g, d) {
    const r = collectExpedition(g.state, Number(d.exp), g.now());
    if (!r) return;
    g.sound(r.newAnimal ? 'discover' : r.levelUps.length ? 'levelup' : 'coin');
    g.bumpCoins();
    g.openSheet(() => renderResult(r));
    g.refresh();
  },
  unlockArea(g, d) {
    const r = unlockArea(g.state, d.area);
    if (!r.ok) return g.fail(r.reason);
    g.sound('success');
    g.toast(`ปลดล็อก${r.area.name}แล้ว`, 'explore');
    g.refresh();
  },
};
