// เสียงเอฟเฟกต์สังเคราะห์ด้วย Web Audio (ไม่ต้องมีไฟล์เสียง) เล่นได้หลังผู้เล่นแตะหน้าจอครั้งแรก
let ctx = null;
let enabled = true;

export function setSoundEnabled(on) {
  enabled = on;
}

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
}

function tone(freq, start, dur, { type = 'sine', vol = 0.07, slide = 0 } = {}) {
  const c = ctx;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(freq * slide, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const SOUNDS = {
  tap: () => tone(660, 0, 0.07, { type: 'triangle', vol: 0.05 }),
  coin: () => {
    tone(988, 0, 0.09, { type: 'square', vol: 0.03 });
    tone(1319, 0.08, 0.16, { type: 'square', vol: 0.03 });
  },
  send: () => tone(440, 0, 0.25, { type: 'triangle', vol: 0.06, slide: 1.8 }),
  eat: () => {
    tone(520, 0, 0.06, { type: 'triangle' });
    tone(620, 0.09, 0.06, { type: 'triangle' });
  },
  success: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.18, { type: 'triangle' })),
  discover: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, i * 0.09, 0.26, { type: 'sine', vol: 0.08 })),
  levelup: () => [523, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.2, { type: 'square', vol: 0.03 })),
  error: () => tone(220, 0, 0.18, { type: 'triangle', vol: 0.06, slide: 0.7 }),
};

export function play(name) {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c || !SOUNDS[name]) return;
  try {
    if (c.state === 'suspended') c.resume();
    SOUNDS[name]();
  } catch {
    // เสียงเล่นไม่ได้ก็เล่นเกมต่อได้
  }
}
