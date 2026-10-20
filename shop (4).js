import { BALANCE } from '../data/balance.js';
import { FOODS } from '../data/items.js';
import { icon } from '../art/icons.js';
import { buyBed, buyFood, buySlot, nextBed } from '../logic/shop.js';
import { chip, fmt, price } from './common.js';

function foodCard(s, f) {
  const have = s.inventory[f.id] || 0;
  const buy = (qty) =>
    `<button class="btn small ${qty > 1 ? 'soft' : ''}" data-action="buyFood" data-food="${f.id}" data-qty="${qty}" ${s.coins < f.price * qty ? 'disabled' : ''}>` +
    `ซื้อ ${qty} ${price(f.price * qty)}</button>`;
  return (
    '<article class="panel shop-item">' +
    `<div class="shop-icon">${icon(f.id)}</div>` +
    '<div class="shop-info">' +
    `<b>${f.name}</b><span class="muted">${f.desc} · มีอยู่ ${have}</span>` +
    `<div class="chips">${chip('energy', `+${f.energy}`)}${chip('mood', `+${f.mood}`)}</div>` +
    `<div class="shop-buy">${buy(1)}${buy(5)}</div>` +
    '</div></article>'
  );
}

export function renderShop(g) {
  const s = g.state;
  const bed = BALANCE.beds[s.upgrades.bed];
  const next = nextBed(s);
  const bedCard =
    '<article class="panel shop-item">' +
    `<div class="shop-icon">${icon('bed')}</div>` +
    '<div class="shop-info">' +
    `<b>${next ? next.name : bed.name}</b>` +
    (next
      ? `<span class="muted">ตอนนี้ใช้${bed.name} อัปเกรดแล้วเพื่อนๆ ฟื้นพลังงานเร็วขึ้น x${next.mult}</span>` +
        `<div class="shop-buy"><button class="btn small" data-action="buyBed" ${s.coins < next.cost ? 'disabled' : ''}>อัปเกรด ${price(next.cost)}</button></div>`
      : `<span class="muted">ที่นอนดีที่สุดแล้ว ฟื้นพลังงานเร็ว x${bed.mult}</span>`) +
    '</div></article>';

  const maxed = s.upgrades.slots >= BALANCE.maxSlots;
  const slotCard =
    '<article class="panel shop-item">' +
    `<div class="shop-icon">${icon('door')}</div>` +
    '<div class="shop-info">' +
    '<b>ประตูสำรวจบานที่ 2</b>' +
    (maxed
      ? '<span class="muted">มีครบแล้ว ส่งได้พร้อมกัน 2 ทีม</span>'
      : `<span class="muted">ส่งทีมออกสำรวจพร้อมกันได้ 2 ทีม</span>` +
        `<div class="shop-buy"><button class="btn small" data-action="buySlot" ${s.coins < BALANCE.extraSlotCost ? 'disabled' : ''}>ซื้อ ${price(BALANCE.extraSlotCost)}</button></div>`) +
    '</div></article>';

  return (
    '<section class="section"><div class="section-head"><h2>อาหาร</h2><span class="hint">ซื้อเก็บไว้ในตู้ได้</span></div>' +
    FOODS.map((f) => foodCard(s, f)).join('') +
    '</section>' +
    '<section class="section"><div class="section-head"><h2>ของในบ้าน</h2></div>' +
    bedCard +
    slotCard +
    '</section>' +
    '<p class="muted">พื้นที่สำรวจใหม่ ปลดล็อกได้ที่หน้า "สำรวจ"</p>'
  );
}

export const shopActions = {
  buyFood(g, d) {
    const qty = Number(d.qty) || 1;
    const r = buyFood(g.state, d.food, qty);
    if (!r.ok) return g.fail(r.reason);
    g.sound('coin');
    g.toast(`ซื้อแล้ว ${qty} ชิ้น (-${fmt(r.cost)})`, d.food);
    g.bumpCoins();
    g.refresh();
  },
  buyBed(g) {
    const r = buyBed(g.state);
    if (!r.ok) return g.fail(r.reason);
    g.sound('success');
    g.toast(`ได้${r.bed.name}แล้ว`, 'bed');
    g.bumpCoins();
    g.refresh();
  },
  buySlot(g) {
    const r = buySlot(g.state);
    if (!r.ok) return g.fail(r.reason);
    g.sound('success');
    g.toast('เปิดประตูบานที่ 2 แล้ว ส่งได้ 2 ทีม', 'door');
    g.bumpCoins();
    g.refresh();
  },
};
