// ภาพสัตว์ทั้งหมดวาดด้วย SVG: ตัวกลมแบบโมจิ + หน้าตาเปลี่ยนตามอารมณ์ (happy / normal / sad)
const INK = '#4A3B52';
const BLUSH = '#FF9EB1';

const attrs = (o) =>
  Object.entries(o)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
const el = (tag, o) => `<${tag} ${attrs(o)}/>`;

function body(fill, stroke, cx = 60, cy = 72, rx = 38, ry = 34) {
  return el('ellipse', { cx, cy, rx, ry, fill, stroke, 'stroke-width': 2.5 });
}

function feet(fill, stroke) {
  return (
    el('ellipse', { cx: 45, cy: 104, rx: 9, ry: 5.5, fill, stroke, 'stroke-width': 2 }) +
    el('ellipse', { cx: 75, cy: 104, rx: 9, ry: 5.5, fill, stroke, 'stroke-width': 2 })
  );
}

// ท่อโค้ง (หาง) ที่มีเส้นขอบ
function tube(d, fill, stroke, w) {
  return (
    el('path', { d, fill: 'none', stroke, 'stroke-width': w + 5, 'stroke-linecap': 'round' }) +
    el('path', { d, fill: 'none', stroke: fill, 'stroke-width': w, 'stroke-linecap': 'round' })
  );
}

function eyes(mood, y = 69) {
  const L = 47;
  const R = 73;
  if (mood === 'happy') {
    const arc = (x) => el('path', { d: `M${x - 5},${y + 1} Q${x},${y - 6} ${x + 5},${y + 1}`, fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' });
    return arc(L) + arc(R);
  }
  const eye = (x) =>
    el('circle', { cx: x, cy: y, r: mood === 'sad' ? 3.8 : 4.4, fill: INK }) +
    el('circle', { cx: x - 1.4, cy: y - 1.6, r: 1.5, fill: '#fff' });
  let out = eye(L) + eye(R);
  if (mood === 'sad') {
    out +=
      el('path', { d: `M${L - 6},${y - 7} L${L + 4},${y - 10}`, stroke: INK, 'stroke-width': 2.2, 'stroke-linecap': 'round' }) +
      el('path', { d: `M${R + 6},${y - 7} L${R - 4},${y - 10}`, stroke: INK, 'stroke-width': 2.2, 'stroke-linecap': 'round' }) +
      el('path', { d: `M${L - 4},${y + 5} q-3,6 0,8 q3,-2 0,-8z`, fill: '#9BD2F7' });
  }
  return out;
}

function blush(y = 79, rx = 6, ry = 3.8) {
  return (
    el('ellipse', { cx: 37, cy: y, rx, ry, fill: BLUSH, opacity: 0.55 }) +
    el('ellipse', { cx: 83, cy: y, rx, ry, fill: BLUSH, opacity: 0.55 })
  );
}

function mouth(mood, y = 79) {
  if (mood === 'happy') {
    return el('path', { d: `M54,${y - 1} Q60,${y + 8} 66,${y - 1} Z`, fill: '#F07C8E', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' });
  }
  if (mood === 'sad') {
    return el('path', { d: `M54,${y + 3} Q60,${y - 3} 66,${y + 3}`, fill: 'none', stroke: INK, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
  }
  return el('path', { d: `M54,${y} Q57,${y + 4} 60,${y} Q63,${y + 4} 66,${y}`, fill: 'none', stroke: INK, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
}

function beak(mood, y = 77) {
  if (mood === 'happy') {
    return (
      el('path', { d: `M53,${y} L67,${y} L60,${y + 5} Z`, fill: '#FFA94D', stroke: '#DB8730', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }) +
      el('path', { d: `M55,${y + 6} L65,${y + 6} L60,${y + 10} Z`, fill: '#FF8F6B', stroke: '#DB8730', 'stroke-width': 1.8, 'stroke-linejoin': 'round' })
    );
  }
  return el('path', { d: `M53,${y} L67,${y} L60,${y + 7} Z`, fill: '#FFA94D', stroke: '#DB8730', 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
}

const nose = (fill = INK, y = 75) => el('ellipse', { cx: 60, cy: y, rx: 3.4, ry: 2.4, fill });

const face = (mood) => blush() + eyes(mood) + mouth(mood, 81);

const SPECIES = {
  cat(mood) {
    const c = { fill: '#FFC89E', line: '#E3965F', stripe: '#F4A468', belly: '#FFF1E4', inner: '#FFB3BE' };
    const back =
      tube('M88,94 C108,92 112,70 101,60', c.fill, c.line, 9) +
      el('path', { d: 'M28,54 L34,22 L56,40 Z', fill: c.fill, stroke: c.line, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }) +
      el('path', { d: 'M92,54 L86,22 L64,40 Z', fill: c.fill, stroke: c.line, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }) +
      el('path', { d: 'M34,46 L36,31 L47,40 Z', fill: c.inner }) +
      el('path', { d: 'M86,46 L84,31 L73,40 Z', fill: c.inner });
    const stripes = ['M60,40 L60,49', 'M51,42 L53,49', 'M69,42 L67,49']
      .map((d) => el('path', { d, stroke: c.stripe, 'stroke-width': 3.2, 'stroke-linecap': 'round' }))
      .join('');
    const whiskers = ['M27,76 L17,74', 'M27,81 L17,83', 'M93,76 L103,74', 'M93,81 L103,83']
      .map((d) => el('path', { d, stroke: c.line, 'stroke-width': 1.6, 'stroke-linecap': 'round' }))
      .join('');
    return (
      back +
      body(c.fill, c.line) +
      el('ellipse', { cx: 60, cy: 93, rx: 20, ry: 11, fill: c.belly }) +
      feet(c.fill, c.line) +
      stripes +
      whiskers +
      el('path', { d: 'M57.5,75 L62.5,75 L60,78 Z', fill: '#F58A9B' }) +
      face(mood)
    );
  },

  shiba(mood) {
    const c = { fill: '#F7C08A', line: '#D6955A', cream: '#FFF4E6' };
    const back =
      tube('M90,86 C110,86 110,62 95,64 C86,66 90,77 97,75', c.fill, c.line, 8) +
      el('path', { d: 'M28,54 L33,24 L55,41 Z', fill: c.fill, stroke: c.line, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }) +
      el('path', { d: 'M92,54 L87,24 L65,41 Z', fill: c.fill, stroke: c.line, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }) +
      el('path', { d: 'M34,46 L36,32 L46,41 Z', fill: c.cream }) +
      el('path', { d: 'M86,46 L84,32 L74,41 Z', fill: c.cream });
    return (
      back +
      body(c.fill, c.line) +
      el('ellipse', { cx: 60, cy: 86, rx: 27, ry: 18, fill: c.cream }) +
      el('circle', { cx: 46, cy: 59, r: 3, fill: c.cream }) +
      el('circle', { cx: 74, cy: 59, r: 3, fill: c.cream }) +
      feet(c.fill, c.line) +
      nose(INK, 76) +
      blush() +
      eyes(mood) +
      mouth(mood, 82)
    );
  },

  rabbit(mood) {
    const c = { fill: '#FFF8FB', line: '#DDB8CB', inner: '#FFC6D6' };
    const tilt = mood === 'sad' ? 62 : mood === 'happy' ? 6 : 16;
    const ear = (cx, sign) =>
      `<g transform="rotate(${sign * tilt} ${cx} 44)">` +
      el('ellipse', { cx, cy: 24, rx: 8.5, ry: 21, fill: c.fill, stroke: c.line, 'stroke-width': 2.5 }) +
      el('ellipse', { cx, cy: 26, rx: 4, ry: 15, fill: c.inner }) +
      '</g>';
    return (
      el('circle', { cx: 92, cy: 96, r: 8, fill: c.fill, stroke: c.line, 'stroke-width': 2.2 }) +
      ear(47, -1) +
      ear(73, 1) +
      body(c.fill, c.line) +
      el('ellipse', { cx: 60, cy: 93, rx: 18, ry: 10, fill: '#FFEFF5' }) +
      feet(c.fill, c.line) +
      el('path', { d: 'M57,75 L63,75 L60,78.5 Z', fill: '#F58A9B' }) +
      face(mood)
    );
  },

  hamster(mood) {
    const c = { fill: '#F9D7A6', line: '#D9AD73', white: '#FFF8EE', inner: '#FFC2C2' };
    return (
      el('circle', { cx: 35, cy: 45, r: 9.5, fill: c.fill, stroke: c.line, 'stroke-width': 2.5 }) +
      el('circle', { cx: 85, cy: 45, r: 9.5, fill: c.fill, stroke: c.line, 'stroke-width': 2.5 }) +
      el('circle', { cx: 35, cy: 45, r: 5, fill: c.inner }) +
      el('circle', { cx: 85, cy: 45, r: 5, fill: c.inner }) +
      body(c.fill, c.line, 60, 73, 40, 33) +
      el('ellipse', { cx: 60, cy: 88, rx: 28, ry: 17, fill: c.white }) +
      feet(c.fill, c.line) +
      el('ellipse', { cx: 37, cy: 80, rx: 9, ry: 6, fill: BLUSH, opacity: 0.5 }) +
      el('ellipse', { cx: 83, cy: 80, rx: 9, ry: 6, fill: BLUSH, opacity: 0.5 }) +
      el('ellipse', { cx: 60, cy: 94, rx: 5, ry: 3.5, fill: '#C99A62' }) +
      el('ellipse', { cx: 54, cy: 93, rx: 4, ry: 3, fill: '#FFD9C4', stroke: c.line, 'stroke-width': 1.5 }) +
      el('ellipse', { cx: 66, cy: 93, rx: 4, ry: 3, fill: '#FFD9C4', stroke: c.line, 'stroke-width': 1.5 }) +
      el('path', { d: 'M58,75 L62,75 L60,77.5 Z', fill: '#F58A9B' }) +
      eyes(mood) +
      mouth(mood, 81)
    );
  },

  chick(mood) {
    const c = { fill: '#FFE680', line: '#E0B63A', wing: '#FFD95C' };
    return (
      el('path', { d: 'M55,42 C52,30 60,27 60,38 C61,27 70,30 65,42 Z', fill: c.fill, stroke: c.line, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }) +
      el('ellipse', { cx: 25, cy: 78, rx: 7, ry: 12, fill: c.wing, stroke: c.line, 'stroke-width': 2.2, transform: 'rotate(25 25 78)' }) +
      el('ellipse', { cx: 95, cy: 78, rx: 7, ry: 12, fill: c.wing, stroke: c.line, 'stroke-width': 2.2, transform: 'rotate(-25 95 78)' }) +
      body(c.fill, c.line, 60, 73, 36, 33) +
      el('ellipse', { cx: 46, cy: 104, rx: 7, ry: 4.5, fill: '#FFA94D', stroke: '#DB8730', 'stroke-width': 2 }) +
      el('ellipse', { cx: 74, cy: 104, rx: 7, ry: 4.5, fill: '#FFA94D', stroke: '#DB8730', 'stroke-width': 2 }) +
      blush(80) +
      eyes(mood, 68) +
      beak(mood, 76)
    );
  },

  fox(mood) {
    const c = { fill: '#FFB07F', line: '#DE8150', white: '#FFF6EE', tip: '#A8735F' };
    return (
      el('ellipse', { cx: 96, cy: 82, rx: 14, ry: 25, fill: c.fill, stroke: c.line, 'stroke-width': 2.5, transform: 'rotate(42 96 82)' }) +
      el('ellipse', { cx: 108, cy: 70, rx: 7, ry: 9, fill: c.white, transform: 'rotate(42 108 70)' }) +
      el('path', { d: 'M26,56 L28,16 L56,40 Z', fill: c.fill, stroke: c.line, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }) +
      el('path', { d: 'M94,56 L92,16 L64,40 Z', fill: c.fill, stroke: c.line, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }) +
      el('path', { d: 'M28,16 L28.8,27 L36,24 Z', fill: c.tip }) +
      el('path', { d: 'M92,16 L91.2,27 L84,24 Z', fill: c.tip }) +
      el('path', { d: 'M33,47 L33,28 L47,40 Z', fill: c.white }) +
      el('path', { d: 'M87,47 L87,28 L73,40 Z', fill: c.white }) +
      body(c.fill, c.line) +
      el('path', { d: 'M24,74 Q42,70 60,84 Q78,70 96,74 Q92,104 60,104 Q28,104 24,74 Z', fill: c.white }) +
      feet(c.tip, '#8C5C4C') +
      nose(INK, 78) +
      blush(80) +
      eyes(mood, 67) +
      mouth(mood, 84)
    );
  },

  redpanda(mood) {
    const c = { fill: '#EC8E60', line: '#C2653A', white: '#FFF5EC', dark: '#9A5F50', stripe: '#BE6640' };
    const stripes = [
      'M85.6,87.5 L100.2,94.3',
      'M90.8,76.6 L105.2,83.4',
      'M95.9,65.7 L110.4,72.5',
    ]
      .map((d) => el('path', { d, stroke: c.stripe, 'stroke-width': 5 }))
      .join('');
    return (
      el('ellipse', { cx: 98, cy: 80, rx: 11, ry: 24, fill: c.fill, stroke: c.line, 'stroke-width': 2.5, transform: 'rotate(25 98 80)' }) +
      stripes +
      el('path', { d: 'M27,54 Q24,24 53,38 Z', fill: c.fill, stroke: c.line, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }) +
      el('path', { d: 'M93,54 Q96,24 67,38 Z', fill: c.fill, stroke: c.line, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }) +
      el('path', { d: 'M33,48 Q32,32 46,40 Z', fill: c.white }) +
      el('path', { d: 'M87,48 Q88,32 74,40 Z', fill: c.white }) +
      body(c.fill, c.line) +
      el('ellipse', { cx: 60, cy: 97, rx: 19, ry: 8, fill: c.dark }) +
      el('ellipse', { cx: 46, cy: 58, rx: 6, ry: 3.6, fill: c.white }) +
      el('ellipse', { cx: 74, cy: 58, rx: 6, ry: 3.6, fill: c.white }) +
      el('ellipse', { cx: 34, cy: 76, rx: 7, ry: 6.5, fill: c.white }) +
      el('ellipse', { cx: 86, cy: 76, rx: 7, ry: 6.5, fill: c.white }) +
      el('ellipse', { cx: 60, cy: 80, rx: 12, ry: 8.5, fill: c.white }) +
      feet(c.dark, '#7A4A3E') +
      nose(INK, 76) +
      eyes(mood) +
      mouth(mood, 82) +
      el('ellipse', { cx: 40, cy: 83, rx: 5, ry: 3, fill: BLUSH, opacity: 0.6 }) +
      el('ellipse', { cx: 80, cy: 83, rx: 5, ry: 3, fill: BLUSH, opacity: 0.6 })
    );
  },

  penguin(mood) {
    const c = { fill: '#7387B5', line: '#566A98', white: '#FFFFFF' };
    return (
      el('ellipse', { cx: 23, cy: 80, rx: 7, ry: 15, fill: c.fill, stroke: c.line, 'stroke-width': 2.5, transform: 'rotate(22 23 80)' }) +
      el('ellipse', { cx: 97, cy: 80, rx: 7, ry: 15, fill: c.fill, stroke: c.line, 'stroke-width': 2.5, transform: 'rotate(-22 97 80)' }) +
      body(c.fill, c.line, 60, 72, 37, 35) +
      el('ellipse', { cx: 48, cy: 70, rx: 15, ry: 14, fill: c.white }) +
      el('ellipse', { cx: 72, cy: 70, rx: 15, ry: 14, fill: c.white }) +
      el('ellipse', { cx: 60, cy: 90, rx: 24, ry: 16, fill: c.white }) +
      el('ellipse', { cx: 46, cy: 105, rx: 8, ry: 4.5, fill: '#FFA94D', stroke: '#DB8730', 'stroke-width': 2 }) +
      el('ellipse', { cx: 74, cy: 105, rx: 8, ry: 4.5, fill: '#FFA94D', stroke: '#DB8730', 'stroke-width': 2 }) +
      blush(80, 5, 3.4) +
      eyes(mood, 68) +
      beak(mood, 76)
    );
  },
};

// คืนค่า SVG string ของสัตว์ id ตามอารมณ์
export function animalSVG(id, mood = 'normal', className = '') {
  const draw = SPECIES[id] || SPECIES.cat;
  return (
    `<svg class="${className}" viewBox="0 0 120 120" role="img" aria-hidden="true" focusable="false">` +
    el('ellipse', { cx: 60, cy: 110, rx: 32, ry: 5, fill: 'rgba(74,59,82,.12)' }) +
    draw(mood) +
    '</svg>'
  );
}
