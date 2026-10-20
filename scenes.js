// ฉากเล็กๆ ของแต่ละพื้นที่สำรวจ (viewBox 160x90)
const SCENES = {
  garden:
    '<rect width="160" height="90" fill="#DDF3FF"/>' +
    '<circle cx="132" cy="20" r="10" fill="#FFE59A"/>' +
    '<path d="M0 62q40-14 80-4t80-6v38H0z" fill="#BFE8B5"/>' +
    '<g stroke="#D9B48F" stroke-width="4" stroke-linecap="round"><path d="M14 66v-18M30 64v-18M46 63v-18M62 63v-18"/><path d="M10 53h56" stroke-width="3"/></g>' +
    '<circle cx="112" cy="58" r="13" fill="#9ED89A"/><circle cx="126" cy="61" r="10" fill="#8ECF8B"/>' +
    '<g fill="#FF9EB1"><circle cx="20" cy="78" r="3"/><circle cx="84" cy="74" r="3"/><circle cx="140" cy="80" r="3"/></g>' +
    '<g fill="#FFE07A"><circle cx="20" cy="78" r="1.2"/><circle cx="84" cy="74" r="1.2"/><circle cx="140" cy="80" r="1.2"/></g>',
  meadow:
    '<rect width="160" height="90" fill="#FFEAF2"/>' +
    '<path d="M0 50q30-20 70-6t90-8v54H0z" fill="#F9C9DA"/>' +
    '<path d="M0 66q50-14 90-2t70-4v30H0z" fill="#F4B2C9"/>' +
    '<g fill="#fff"><circle cx="18" cy="72" r="3.2"/><circle cx="44" cy="80" r="3.2"/><circle cx="76" cy="70" r="3.2"/><circle cx="104" cy="82" r="3.2"/><circle cx="132" cy="72" r="3.2"/><circle cx="58" cy="56" r="2.6"/><circle cx="118" cy="56" r="2.6"/></g>' +
    '<g fill="#FFD66B"><circle cx="18" cy="72" r="1.3"/><circle cx="44" cy="80" r="1.3"/><circle cx="76" cy="70" r="1.3"/><circle cx="104" cy="82" r="1.3"/><circle cx="132" cy="72" r="1.3"/></g>' +
    '<circle cx="34" cy="30" r="8" fill="#FFF3C4"/>',
  forest:
    '<rect width="160" height="90" fill="#E3F4E6"/>' +
    '<g fill="#A9D9B2"><path d="M12 70 30 18l18 52z"/><path d="M110 70l20-58 20 58z"/></g>' +
    '<g fill="#8CCB9B"><path d="M36 74 52 30l16 44z"/><path d="M128 76l14-36 14 36z"/></g>' +
    '<path d="M0 72q80-10 160 0v18H0z" fill="#B7DDB0"/>' +
    '<rect x="76" y="54" width="10" height="22" rx="4" fill="#FFF3E6"/>' +
    '<path d="M62 56a19 15 0 0 1 38 0z" fill="#FF9AA8"/>' +
    '<g fill="#fff"><circle cx="72" cy="49" r="3"/><circle cx="84" cy="45" r="2.4"/><circle cx="92" cy="51" r="2.2"/></g>' +
    '<rect x="102" y="66" width="6" height="12" rx="3" fill="#FFF3E6"/>' +
    '<path d="M96 68a9 7 0 0 1 18 0z" fill="#C3B1FF"/>',
  snow:
    '<rect width="160" height="90" fill="#E9E4FF"/>' +
    '<path d="M-6 80 40 22l46 58z" fill="#C9D6F2"/><path d="M40 22 30 36l6 4 4-6 5 6 6-4z" fill="#fff"/>' +
    '<path d="M60 84l50-66 56 66z" fill="#B5C4EA"/><path d="M110 18 98 34l7 4 5-7 6 7 7-4z" fill="#fff"/>' +
    '<path d="M0 74q80-12 160 0v16H0z" fill="#fff"/>' +
    '<g fill="#fff"><circle cx="20" cy="18" r="1.8"/><circle cx="70" cy="12" r="1.5"/><circle cx="146" cy="30" r="1.8"/><circle cx="88" cy="40" r="1.4"/><circle cx="136" cy="56" r="1.5"/></g>',
};

export function sceneSVG(areaId, className = 'scene') {
  return `<svg class="${className}" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${SCENES[areaId] || ''}</svg>`;
}
