// ไอคอน SVG ขนาดเล็ก: กลุ่มแรกมีสีของตัวเอง (ทรัพยากร/ไอเทม) กลุ่มหลังใช้สีตามตัวอักษร (เมนู/ปุ่ม)
const INK = '#4A3B52';

const COLOR = {
  coin:
    '<circle cx="12" cy="12" r="9.5" fill="#FFD66B" stroke="#D99A1E" stroke-width="1.6"/>' +
    '<circle cx="12" cy="12" r="6.6" fill="none" stroke="#E9B23C" stroke-width="1.2"/>' +
    '<ellipse cx="12" cy="13.6" rx="2.6" ry="2.1" fill="#D99A1E"/>' +
    '<circle cx="9.2" cy="10.6" r="1.1" fill="#D99A1E"/><circle cx="11.2" cy="9.3" r="1.1" fill="#D99A1E"/>' +
    '<circle cx="12.8" cy="9.3" r="1.1" fill="#D99A1E"/><circle cx="14.8" cy="10.6" r="1.1" fill="#D99A1E"/>',
  energy: '<path d="M13.5 2.5 5 13.2h5.6L9.8 21.5l8.7-11.3h-5.7z" fill="#FFCB52" stroke="#D99A1E" stroke-width="1.5" stroke-linejoin="round"/>',
  mood:
    '<path d="M12 20.3S3.5 15.2 3.5 9.2A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 2.2c0 6-8.5 11.1-8.5 11.1z" fill="#FF8FAB" stroke="#E0607F" stroke-width="1.5" stroke-linejoin="round"/>',
  exp: '<path d="m12 2.8 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="#C3B1FF" stroke="#8F78E6" stroke-width="1.5" stroke-linejoin="round"/>',
  carrot:
    '<path d="M15.8 8.2 4.2 19.8c-.5.5.1 1.2.7.9l11.1-6.6c1.8-1.1 2-3.5.6-5-.3-.3-.6-.6-.8-.9z" fill="#FFA45C" stroke="#D9773A" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M16 8c.5-2.5 2.2-4.4 4.5-4.6M16.5 8.4c1.5-1 3.6-1.1 5-.2M15.6 7.6c-.2-2 .6-3.7 1.6-4.6" fill="none" stroke="#5CBF7A" stroke-width="1.8" stroke-linecap="round"/>',
  fruit:
    '<path d="M12 7.5c-2.2-1.3-6.8-.9-7.3 4 0 4.9 3.4 9 5.6 9 .8 0 1.1-.4 1.7-.4s.9.4 1.7.4c2.2 0 5.6-4.1 5.6-9-.5-4.9-5.1-5.3-7.3-4z" fill="#FF7E95" stroke="#D9566F" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M12 7.5c0-2 .6-3.4 1.6-4.4" fill="none" stroke="#8A6248" stroke-width="1.6" stroke-linecap="round"/>' +
    '<path d="M13 5.6c1.6-1.7 4-1.8 5.2-1-.7 1.7-3.2 2.4-5.2 1z" fill="#6CCB8A"/>' +
    '<ellipse cx="8.6" cy="11.4" rx="1.3" ry="2" fill="#fff" opacity=".55"/>',
  treat:
    '<path d="M5.5 12.5h13l-1.8 8a1 1 0 0 1-1 .8H8.3a1 1 0 0 1-1-.8z" fill="#A9DDF5" stroke="#6BAFD1" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M4.7 12.8c-.9-2.5 1-4.6 3.1-4.3.4-2.3 2.4-3.7 4.2-3.7s3.8 1.4 4.2 3.7c2.1-.3 4 1.8 3.1 4.3z" fill="#FFB8CF" stroke="#E07FA0" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<circle cx="12" cy="4.2" r="1.6" fill="#FF6F8E"/>' +
    '<path d="M8.5 15v4M12 15v4M15.5 15v4" stroke="#6BAFD1" stroke-width="1.1" stroke-linecap="round"/>',
  bed:
    '<rect x="2.5" y="10" width="19" height="7" rx="2.5" fill="#D8CCFF" stroke="#9A86E0" stroke-width="1.4"/>' +
    '<rect x="4" y="7.5" width="6" height="4" rx="2" fill="#fff" stroke="#9A86E0" stroke-width="1.3"/>' +
    '<path d="M4 17v3M20 17v3" stroke="#9A86E0" stroke-width="1.8" stroke-linecap="round"/>',
  door:
    '<path d="M6 21V9a6 6 0 0 1 12 0v12z" fill="#BDEBD7" stroke="#5FB592" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<circle cx="15" cy="14.5" r="1.2" fill="#5FB592"/><path d="M3.5 21h17" stroke="#5FB592" stroke-width="1.6" stroke-linecap="round"/>',
  piggy:
    '<ellipse cx="11.5" cy="13" rx="8" ry="6.5" fill="#FFC3D3" stroke="#E07F9F" stroke-width="1.4"/>' +
    '<path d="M7 8.2 6.3 5.4l3.2 1.8" fill="#FFC3D3" stroke="#E07F9F" stroke-width="1.3" stroke-linejoin="round"/>' +
    '<rect x="17.8" y="11" width="3.4" height="4" rx="1.5" fill="#FFC3D3" stroke="#E07F9F" stroke-width="1.3"/>' +
    '<path d="M9.5 7.3h4" stroke="#E07F9F" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="14.6" cy="11.4" r="1" fill="' + INK + '"/>' +
    '<path d="M7.5 19v1.6M14.5 19v1.6" stroke="#E07F9F" stroke-width="2" stroke-linecap="round"/>',
  gift:
    '<rect x="3.5" y="9" width="17" height="11.5" rx="2" fill="#FFD0DE" stroke="#E07F9F" stroke-width="1.4"/>' +
    '<rect x="2.5" y="6.5" width="19" height="4" rx="1.5" fill="#FFB0C6" stroke="#E07F9F" stroke-width="1.4"/>' +
    '<path d="M12 6.5v14" stroke="#9A86E0" stroke-width="2.4"/>' +
    '<path d="M12 6.4C10 3 6.8 3.6 7.6 5.6c.5 1 2.5 1 4.4.8zm0 0c2-3.4 5.2-2.8 4.4-.8-.5 1-2.5 1-4.4.8z" fill="#C3B1FF" stroke="#9A86E0" stroke-width="1.2"/>',
  trophy:
    '<path d="M7 3.5h10v5.2a5 5 0 0 1-10 0z" fill="#FFD66B" stroke="#D99A1E" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M7 5.5H4.5a3 3 0 0 0 3 3.6M17 5.5h2.5a3 3 0 0 1-3 3.6" fill="none" stroke="#D99A1E" stroke-width="1.4"/>' +
    '<path d="M12 13.7v3.3M8 20.5h8l-1-3.5H9z" fill="#FFE59A" stroke="#D99A1E" stroke-width="1.4" stroke-linejoin="round"/>',
  lock:
    '<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#E6DEEA" stroke="#9C8AA6" stroke-width="1.5"/>' +
    '<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="#9C8AA6" stroke-width="1.8"/>' +
    '<circle cx="12" cy="15.5" r="1.6" fill="#9C8AA6"/>',
  clock:
    '<circle cx="12" cy="12" r="9" fill="#D6ECFF" stroke="#6E9FCB" stroke-width="1.5"/>' +
    '<path d="M12 7v5.3l3.3 2" fill="none" stroke="#4F7DA8" stroke-width="1.8" stroke-linecap="round"/>',
};

const LINE = {
  home: '<path d="M4 11.2 12 4.5l8 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-3.5v-5.5h-6v5.5H5.5A1.5 1.5 0 0 1 4 19z"/>',
  explore:
    '<circle cx="12" cy="12" r="8.8"/><path d="m15.6 8.4-2.2 5-5 2.2 2.2-5z"/>',
  shop: '<path d="M5 8h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M8.8 10.5V7a3.2 3.2 0 0 1 6.4 0v3.5"/>',
  missions: '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="m8.5 9 1.5 1.5 2.8-2.8M8.5 15l1.5 1.5 2.8-2.8M15 9.5h1M15 15.5h1"/>',
  album: '<path d="M4.5 5.5c2.6-1.3 5.2-1.3 7.5.3 2.3-1.6 4.9-1.6 7.5-.3v13.4c-2.6-1.3-5.2-1.3-7.5.3-2.3-1.6-4.9-1.6-7.5-.3z"/><path d="M12 5.8v13.4"/>',
  gear:
    '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  soundOn: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/>',
  soundOff: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  back: '<path d="M14.5 6 8.5 12l6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};

export function icon(name, className = 'ic') {
  if (COLOR[name]) {
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${COLOR[name]}</svg>`;
  }
  const body = LINE[name] || '';
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
