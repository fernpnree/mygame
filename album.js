import { ANIMALS } from '../data/animals.js';
import { getArea } from '../data/areas.js';
import { animalSVG } from '../art/animals.js';
import { getOwned, moodState } from '../logic/care.js';

export function renderAlbum(g) {
  const s = g.state;
  const cards = ANIMALS.map((info) => {
    const owned = getOwned(s, info.id);
    if (!owned) {
      const where = info.area ? getArea(info.area).name : '';
      return (
        '<article class="sticker unknown">' +
        animalSVG(info.id, 'normal', 'silhouette') +
        '<b>???</b>' +
        `<span class="bio">พบได้ที่${where}</span>` +
        '</article>'
      );
    }
    return (
      `<button class="sticker" data-action="openAnimal" data-id="${info.id}">` +
      animalSVG(info.id, moodState(owned.mood)) +
      `<b>${info.name}</b>` +
      `<span class="lv">${info.kind} · Lv.${owned.level}</span>` +
      `<span class="bio">${info.bio}</span>` +
      '</button>'
    );
  }).join('');
  return (
    '<section class="section">' +
    `<div class="section-head"><h2>สมุดสะสมเพื่อนขนฟู</h2><span class="hint">พบแล้ว ${s.animals.length}/${ANIMALS.length}</span></div>` +
    '<p class="muted">เพื่อนใหม่ซ่อนอยู่ตามพื้นที่สำรวจ ยิ่งไปบ่อย ยิ่งมีโอกาสเจอ</p>' +
    `<div class="album">${cards}</div>` +
    '</section>'
  );
}
