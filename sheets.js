import { BALANCE } from '../data/balance.js';
import { animalSVG } from '../art/animals.js';
import { icon } from '../art/icons.js';
import { formatDuration } from '../logic/time.js';
import { fmt, sheetHead } from './common.js';

// ---------- แนะนำวิธีเล่น ----------
const TUTORIAL = [
  {
    art: () => animalSVG('cat', 'happy', 'big'),
    title: 'ยินดีต้อนรับสู่บ้านขนฟู',
    text: 'นี่คือส้มจี๊ด เพื่อนตัวแรกของเรา ส่งเพื่อนๆ ออกไปสำรวจ หาเหรียญ และพาเพื่อนใหม่กลับบ้านกัน',
  },
  {
    art: () => icon('energy', 'big'),
    title: 'ออกสำรวจใช้พลังงาน',
    text: `จัดทีม 1-${BALANCE.teamMax} ตัวไปสำรวจ แต่ละที่ใช้พลังงานต่างกัน พลังงานฟื้นเองตอนอยู่บ้าน หรือให้อาหารเพื่อเติมทันที`,
  },
  {
    art: () => animalSVG('cat', 'sad', 'big'),
    title: 'ดูแลให้อารมณ์ดี',
    text: 'ออกสำรวจบ่อยๆ ความสุขจะลดลง ถ้าเพื่อนเศร้าจะหาของได้น้อยลง ให้ขนมหรือพักที่บ้านแล้วจะร่าเริงอีกครั้ง',
  },
  {
    art: () => icon('piggy', 'big'),
    title: 'ปิดเกมไปก็ยังได้ของ',
    text: 'ทีมสำรวจเดินทางต่อแม้ปิดแอป เพื่อนที่อยู่บ้านก็หยอดกระปุกออมสินให้ (สะสมได้ถึง 8 ชม.) อย่าลืมทำภารกิจรายวันนะ',
  },
];

export function renderTutorial(step) {
  const t = TUTORIAL[step];
  const last = step === TUTORIAL.length - 1;
  const dots = TUTORIAL.map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('');
  return (
    '<div class="sheet-grip"></div>' +
    '<div class="tutorial">' +
    t.art() +
    `<h2>${t.title}</h2><p>${t.text}</p><div class="steps">${dots}</div>` +
    '</div>' +
    '<div class="sheet-foot">' +
    (last
      ? '<button class="btn block" data-action="tutDone">เริ่มผจญภัย</button>'
      : `<button class="btn block" data-action="tutNext" data-step="${step + 1}">ต่อไป</button>` +
        '<button class="btn block soft" data-action="tutDone">ข้าม</button>') +
    '</div>'
  );
}

// ---------- ระหว่างที่ไม่อยู่ ----------
export function renderWelcome(summary) {
  const lines = [];
  if (summary.tripsDone) lines.push(`${icon('door')}ทีมสำรวจกลับมารอรับของ ${summary.tripsDone} ทีม`);
  if (summary.piggy >= 1) lines.push(`${icon('piggy')}กระปุกออมสินเพิ่มขึ้น +${fmt(summary.piggy)} เหรียญ`);
  if (summary.energy >= 1) lines.push(`${icon('energy')}เพื่อนๆ พักผ่อน พลังงานรวม +${fmt(summary.energy)}`);
  if (summary.newDay) lines.push(`${icon('missions')}ภารกิจรายวันชุดใหม่มาแล้ว`);
  if (!lines.length) {
    lines.push(summary.tripsAway ? `${icon('clock')}ทีมสำรวจยังเดินทางอยู่ ใกล้ถึงแล้ว` : `${icon('home')}ทุกคนรอเราอยู่ที่บ้าน`);
  }
  return (
    sheetHead('กลับมาแล้ว!') +
    '<div class="sheet-body">' +
    `<p class="muted">ระหว่างที่ไม่อยู่ ${formatDuration(summary.elapsed)}${summary.capped ? ' (นับสูงสุด 48 ชม.)' : ''}</p>` +
    `<div class="reward-list">${lines.map((l) => `<div class="reward-line">${l}</div>`).join('')}</div>` +
    '</div>' +
    `<div class="sheet-foot"><button class="btn block" data-action="${summary.tripsDone ? 'goExplore' : 'closeSheet'}">${summary.tripsDone ? 'ไปรับของ' : 'โอเค'}</button></div>`
  );
}

// ---------- ตั้งค่า ----------
let resetArmed = false;

export function renderSettings(g) {
  const on = g.state.settings.sound;
  return (
    sheetHead('ตั้งค่า') +
    '<div class="sheet-body">' +
    `<div class="setting-row"><span>${icon(on ? 'soundOn' : 'soundOff')} เสียงเอฟเฟกต์</span>` +
    `<button class="toggle" role="switch" aria-checked="${on}" aria-label="เปิดปิดเสียง" data-action="toggleSound"></button></div>` +
    '<div class="setting-row"><span>วิธีเล่น</span><button class="btn small soft" data-action="showTutorial">ดูอีกครั้ง</button></div>' +
    '<div class="setting-row"><span>เริ่มเกมใหม่ทั้งหมด<br><small class="muted">ข้อมูลในเครื่องนี้จะถูกลบ</small></span>' +
    `<button class="btn small ${resetArmed ? '' : 'soft'}" data-action="resetGame">${resetArmed ? 'แตะอีกครั้งเพื่อยืนยัน' : 'เริ่มใหม่'}</button></div>` +
    '<p class="muted">เกมเซฟอัตโนมัติในเครื่องนี้ ถ้าล้างข้อมูล browser หรือเปลี่ยนเครื่อง เซฟจะไม่ตามไปด้วย</p>' +
    '<p class="muted">เพื่อนขนฟู ผจญภัย · เวอร์ชัน 0.1</p>' +
    '</div>'
  );
}

export const sheetActions = {
  tutNext(g, d) {
    g.sound('tap');
    g.replaceSheet(() => renderTutorial(Number(d.step)));
  },
  tutDone(g) {
    g.state.tutorialDone = true;
    g.sound('success');
    g.closeSheet();
    g.refresh();
  },
  showTutorial(g) {
    g.replaceSheet(() => renderTutorial(0));
  },
  openSettings(g) {
    resetArmed = false;
    g.openSheet(() => renderSettings(g));
  },
  toggleSound(g) {
    g.state.settings.sound = !g.state.settings.sound;
    g.applySettings();
    g.sound('tap');
    g.refresh();
  },
  resetGame(g) {
    if (!resetArmed) {
      resetArmed = true;
      g.sound('error');
      return g.refresh();
    }
    resetArmed = false;
    g.reset();
  },
  goExplore(g) {
    g.closeSheet();
    g.go('explore');
  },
};
