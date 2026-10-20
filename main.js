import { BALANCE } from './data/balance.js';
import { AREAS, getArea } from './data/areas.js';
import { icon } from './art/icons.js';
import { play, setSoundEnabled } from './audio.js';
import { clearState, createState, loadState, saveState } from './state.js';
import { catchUp, moodState, piggyCap } from './logic/care.js';
import { isDone } from './logic/expedition.js';
import { claimableCount, ensureDaily } from './logic/missions.js';
import { formatCountdown, getOffset, now, setOffset } from './logic/time.js';
import { fmt, pct } from './ui/common.js';
import { homeActions, renderHome } from './ui/home.js';
import { exploreActions, renderExplore } from './ui/explore.js';
import { renderShop, shopActions } from './ui/shop.js';
import { missionActions, renderMissions } from './ui/missions.js';
import { renderAlbum } from './ui/album.js';
import { renderTutorial, renderWelcome, sheetActions } from './ui/sheets.js';

const TABS = [
  { id: 'home', label: 'บ้าน', render: renderHome },
  { id: 'explore', label: 'สำรวจ', render: renderExplore },
  { id: 'shop', label: 'ร้านค้า', render: renderShop },
  { id: 'missions', label: 'ภารกิจ', render: renderMissions },
  { id: 'album', label: 'สมุดสัตว์', render: renderAlbum },
];

const DEBUG_KEY = 'fluffy-adventure-debug-offset';
const debug = /[?&]debug\b/.test(location.search) || location.hash === '#debug';

// localStorage อาจใช้ไม่ได้ (private mode / ถูกบล็อก) ให้ใช้หน่วยความจำแทน เกมยังเล่นได้แต่ไม่เซฟ
function getStorage() {
  try {
    const ls = window.localStorage;
    ls.setItem('__probe', '1');
    ls.removeItem('__probe');
    return ls;
  } catch {
    const mem = new Map();
    return {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
    };
  }
}

const storage = getStorage();
if (debug) setOffset(Number(storage.getItem(DEBUG_KEY)) || 0);

const $ = (sel) => document.querySelector(sel);
const dom = {
  screen: $('#screen'),
  inner: $('#screen-inner'),
  tabbar: $('#tabbar'),
  coins: $('#coins'),
  coinPill: $('#coin-pill'),
  toasts: $('#toasts'),
  sheetRoot: $('#sheet-root'),
};

let state = loadState(storage, now());
const firstLaunch = !state;
if (!state) state = createState(now());

let tab = 'home';
let sheetFn = null;
let sheetLocked = false;
const sheetQueue = [];
let lastSig = '';
let seenDone = new Set();
let hiddenAt = null;

const game = {
  get state() {
    return state;
  },
  now,
  refresh,
  go,
  openSheet,
  replaceSheet,
  closeSheet,
  toast,
  fail(reason) {
    play('error');
    toast(reason, null, true);
  },
  sound: (name) => play(name),
  bumpCoins() {
    dom.coinPill.classList.remove('bump');
    void dom.coinPill.offsetWidth;
    dom.coinPill.classList.add('bump');
  },
  applySettings() {
    setSoundEnabled(state.settings.sound);
  },
  reset() {
    clearState(storage);
    state = createState(now());
    ensureDaily(state, now());
    sheetQueue.length = 0;
    sheetFn = null;
    seenDone = new Set();
    save();
    go('home');
    openSheet(() => renderTutorial(0), { locked: true });
  },
};

const actions = {
  ...homeActions,
  ...exploreActions,
  ...shopActions,
  ...missionActions,
  ...sheetActions,
  closeSheet: () => closeSheet(),
  go: (g, d) => go(d.tab),
};

// ---------- การแสดงผล ----------
function renderTabbar() {
  const claim = claimableCount(state);
  const done = state.expeditions.some((e) => isDone(e, now()));
  const firstTrip = state.tutorialDone && state.stats.trips === 0 && tab !== 'explore';
  dom.tabbar.innerHTML = TABS.map((t) => {
    let badge = '';
    if (t.id === 'missions' && claim) badge = `<span class="badge">${claim}</span>`;
    if (t.id === 'explore' && done) badge = '<span class="badge dot"></span>';
    const pulse = t.id === 'explore' && firstTrip ? ' pulse' : '';
    return (
      `<button class="tab${t.id === tab ? ' active' : ''}${pulse}" data-action="go" data-tab="${t.id}" aria-current="${t.id === tab ? 'page' : 'false'}">` +
      `${icon(t.id)}<span>${t.label}</span>${badge}</button>`
    );
  }).join('');
}

function renderScreen() {
  const def = TABS.find((t) => t.id === tab);
  dom.inner.innerHTML = def.render(game);
}

function renderSheet(mode = 'keep') {
  if (!sheetFn) {
    dom.sheetRoot.hidden = true;
    dom.sheetRoot.innerHTML = '';
    return;
  }
  let panel = dom.sheetRoot.querySelector('.sheet');
  if (!panel || mode === 'fresh') {
    dom.sheetRoot.hidden = false;
    dom.sheetRoot.innerHTML = '<div class="sheet" role="dialog" aria-modal="true"></div>';
    panel = dom.sheetRoot.querySelector('.sheet');
  }
  const top = panel.scrollTop;
  panel.innerHTML = sheetFn();
  panel.scrollTop = mode === 'keep' ? top : 0;
}

function refresh() {
  dom.coins.textContent = fmt(state.coins);
  renderTabbar();
  renderScreen();
  renderSheet('keep');
  lastSig = signature();
}

function go(next) {
  if (!TABS.some((t) => t.id === next)) return;
  if (next !== tab) play('tap');
  tab = next;
  refresh();
  dom.screen.scrollTop = 0;
}

function openSheet(fn, { locked = false } = {}) {
  if (sheetFn) {
    sheetQueue.push({ fn, locked });
    return;
  }
  sheetFn = fn;
  sheetLocked = locked;
  renderSheet('fresh');
}

function replaceSheet(fn) {
  sheetFn = fn;
  sheetLocked = false;
  renderSheet('top');
}

function closeSheet() {
  const next = sheetQueue.shift();
  sheetFn = next ? next.fn : null;
  sheetLocked = next ? next.locked : false;
  renderSheet('fresh');
  refresh();
}

function toast(text, iconName = null, bad = false) {
  const el = document.createElement('div');
  el.className = `toast${bad ? ' bad' : ''}`;
  // ถ้ามีหน้าต่างเปิดอยู่ (บังด้านล่าง) ให้แจ้งเตือนขึ้นด้านบนแทน
  dom.toasts.classList.toggle('top', !!sheetFn);
  el.innerHTML = `${iconName ? icon(iconName) : ''}<span>${text}</span>`;
  dom.toasts.prepend(el);
  while (dom.toasts.children.length > 2) dom.toasts.lastChild.remove();
  setTimeout(() => el.remove(), 2500);
}

// ค่าที่เปลี่ยนตามเวลาโดยไม่ต้องวาดหน้าจอใหม่ทั้งหน้า
function setBar(el, value, max) {
  const fill = el.firstElementChild;
  if (fill) fill.style.width = `${pct(value, max)}%`;
}

function updateLive() {
  const t = now();
  dom.coins.textContent = fmt(state.coins);
  for (const el of document.querySelectorAll('[data-live]')) {
    const [kind, id] = el.dataset.live.split(':');
    const a = id ? state.animals.find((x) => x.id === id) : null;
    switch (kind) {
      case 'piggy':
        el.textContent = fmt(state.piggy);
        break;
      case 'piggy-bar':
        setBar(el, state.piggy, piggyCap(state));
        break;
      case 'energy':
        if (a) setBar(el, a.energy, BALANCE.maxEnergy);
        break;
      case 'energy-text':
        if (a) el.textContent = Math.floor(a.energy);
        break;
      case 'mood':
        if (a) setBar(el, a.mood, BALANCE.maxMood);
        break;
      case 'mood-text':
        if (a) el.textContent = Math.floor(a.mood);
        break;
      case 'cd':
        el.textContent = formatCountdown(Number(el.dataset.end) - t);
        break;
      case 'trip':
        setBar(el, t - Number(el.dataset.start), Number(el.dataset.end) - Number(el.dataset.start));
        break;
      default:
    }
  }
}

// สรุปสถานะที่ถ้าเปลี่ยนแล้วต้องวาดหน้าจอใหม่ (อารมณ์ข้ามเกณฑ์ ทีมกลับถึงบ้าน ฯลฯ)
function signature() {
  const t = now();
  const animals = state.animals
    .map((a) => {
      const thresholds = AREAS.map((ar) => (a.energy >= ar.energy ? 1 : 0)).join('');
      return `${a.id}${moodState(a.mood)}${a.energy < 30}${a.energy >= BALANCE.maxEnergy}${a.mood >= BALANCE.maxMood}${a.away}${thresholds}`;
    })
    .join('|');
  const done = state.expeditions.filter((e) => isDone(e, t)).length;
  return `${animals}#${state.piggy >= 1}#${done}#${state.daily.date}`;
}

// ---------- เวลา ----------
function summarize(fn) {
  const t = now();
  const before = {
    piggy: state.piggy,
    energy: state.animals.reduce((sum, a) => sum + a.energy, 0),
    date: state.daily.date,
  };
  const elapsed = fn();
  return {
    elapsed,
    capped: elapsed > BALANCE.maxCatchUpHours * 3_600_000,
    piggy: state.piggy - before.piggy,
    energy: state.animals.reduce((sum, a) => sum + a.energy, 0) - before.energy,
    tripsDone: state.expeditions.filter((e) => isDone(e, t)).length,
    tripsAway: state.expeditions.filter((e) => !isDone(e, t)).length,
    newDay: before.date !== '' && before.date !== state.daily.date,
  };
}

function catchUpAndMaybeWelcome() {
  const summary = summarize(() => {
    const elapsed = catchUp(state, now());
    ensureDaily(state, now());
    return elapsed;
  });
  if (state.tutorialDone && summary.elapsed >= BALANCE.welcomeBackAfterMin * 60_000) {
    openSheet(() => renderWelcome(summary));
  }
  return summary;
}

function tick() {
  const t = now();
  catchUp(state, t);
  const newDay = ensureDaily(state, t);
  if (newDay) toast('ภารกิจรายวันชุดใหม่มาแล้ว', 'missions');
  for (const e of state.expeditions) {
    if (isDone(e, t) && !seenDone.has(e.id)) {
      seenDone.add(e.id);
      play('success');
      toast(`ทีมจาก${getArea(e.areaId).name}กลับถึงบ้านแล้ว`, 'door');
    }
  }
  if (signature() !== lastSig) refresh();
  else updateLive();
}

function save() {
  saveState(storage, state);
}

// ---------- เริ่มเกม ----------
function boot() {
  game.applySettings();
  const t = now();
  for (const e of state.expeditions) if (isDone(e, t)) seenDone.add(e.id);

  if (firstLaunch) {
    ensureDaily(state, t);
  } else {
    catchUpAndMaybeWelcome();
  }
  if (!state.tutorialDone) openSheet(() => renderTutorial(0), { locked: true });
  refresh();
  save();

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    fn(game, el.dataset, el);
    save();
  });

  dom.sheetRoot.addEventListener('click', (ev) => {
    if (ev.target === dom.sheetRoot && !sheetLocked) closeSheet();
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && sheetFn && !sheetLocked) closeSheet();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      hiddenAt = now();
      save();
    } else if (hiddenAt != null) {
      hiddenAt = null;
      for (const e of state.expeditions) if (isDone(e, now())) seenDone.add(e.id);
      catchUpAndMaybeWelcome();
      refresh();
    }
  });
  window.addEventListener('pagehide', save);

  setInterval(tick, 1000);
  setInterval(save, 5000);

  if (debug) mountDebug();

  const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || local)) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ---------- โหมดทดสอบ: เลื่อนเวลาไปข้างหน้า ----------
function mountDebug() {
  const panel = document.createElement('div');
  panel.className = 'debug';
  const jumps = [
    ['+1 นาที', 60_000],
    ['+10 นาที', 600_000],
    ['+1 ชม.', 3_600_000],
    ['+8 ชม.', 8 * 3_600_000],
  ];
  panel.innerHTML =
    jumps.map(([label, ms]) => `<button data-ms="${ms}">${label}</button>`).join('') +
    '<button data-coins="500">+500 เหรียญ</button>';
  panel.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.coins) {
      state.coins += Number(b.dataset.coins);
    } else {
      setOffset(getOffset() + Number(b.dataset.ms));
      storage.setItem(DEBUG_KEY, String(getOffset()));
      for (const e of state.expeditions) if (isDone(e, now())) seenDone.add(e.id);
      catchUpAndMaybeWelcome();
    }
    refresh();
    save();
  });
  document.querySelector('#app').appendChild(panel);
}

boot();
