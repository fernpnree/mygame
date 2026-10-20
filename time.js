// นาฬิกาของเกม: ปกติคือเวลาจริง แต่โหมด debug เลื่อนไปข้างหน้าได้เพื่อทดสอบ
let offsetMs = 0;

export function now() {
  return Date.now() + offsetMs;
}

export function getOffset() {
  return offsetMs;
}

export function setOffset(ms) {
  offsetMs = ms;
}

export function localDateKey(ts) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// นับถอยหลัง เช่น 4:05 หรือ 1:02:09
export function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`;
  return `${m}:${ss}`;
}

// ระยะเวลาแบบอ่านง่าย เช่น "3 ชม. 12 นาที"
export function formatDuration(ms) {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} นาที`;
  if (m === 0) return `${h} ชม.`;
  return `${h} ชม. ${m} นาที`;
}
