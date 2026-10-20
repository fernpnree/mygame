import { icon } from '../art/icons.js';

export const fmt = (n) => Math.floor(n).toLocaleString('th-TH');

export const pct = (value, max) => Math.max(0, Math.min(100, (value / max) * 100));

export function bar(kind, value, max, { live = '', need = null } = {}) {
  const liveAttr = live ? ` data-live="${live}" data-max="${max}"` : '';
  const needMark = need != null ? `<span class="need" style="left:${pct(need, max)}%"></span>` : '';
  return `<div class="bar ${kind}"${liveAttr}><i style="width:${pct(value, max)}%"></i>${needMark}</div>`;
}

export function chip(iconName, text, cls = '') {
  return `<span class="chip ${cls}">${iconName ? icon(iconName) : ''}${text}</span>`;
}

export function price(amount) {
  return `<span class="price">${icon('coin')}<span class="num">${fmt(amount)}</span></span>`;
}

export function sheetHead(title, { back = null } = {}) {
  const backBtn = back
    ? `<button class="icon-btn" data-action="${back.action}" ${back.data || ''} aria-label="${back.label}">${icon('back')}</button>`
    : '';
  return (
    '<div class="sheet-grip"></div>' +
    `<div class="sheet-head">${backBtn}<h2>${title}</h2>` +
    `<button class="icon-btn" data-action="closeSheet" aria-label="ปิด">${icon('close')}</button></div>`
  );
}

export function rewardText(reward) {
  if (reward.coins) return `${icon('coin')}<span class="num">${fmt(reward.coins)}</span>`;
  if (reward.food) return `${icon(reward.food)}<span class="num">x${reward.qty || 1}</span>`;
  return '';
}
