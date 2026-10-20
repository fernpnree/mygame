// Service worker: เก็บไฟล์เกมไว้ในเครื่อง ให้เปิดเล่นได้แม้ไม่มีเน็ต
// เปลี่ยนเลข VERSION ทุกครั้งที่อัปเดตไฟล์เกม เพื่อให้เครื่องผู้เล่นโหลดชุดใหม่
const VERSION = 'v1';
const CACHE = `fluffy-adventure-${VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './js/main.js',
  './js/state.js',
  './js/audio.js',
  './js/art/animals.js',
  './js/art/icons.js',
  './js/art/scenes.js',
  './js/data/animals.js',
  './js/data/areas.js',
  './js/data/balance.js',
  './js/data/items.js',
  './js/data/missions.js',
  './js/logic/care.js',
  './js/logic/expedition.js',
  './js/logic/missions.js',
  './js/logic/shop.js',
  './js/logic/time.js',
  './js/ui/album.js',
  './js/ui/common.js',
  './js/ui/explore.js',
  './js/ui/home.js',
  './js/ui/missions.js',
  './js/ui/sheets.js',
  './js/ui/shop.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// ใช้ของในเครื่องก่อนเพื่อให้เปิดเร็ว แล้วแอบโหลดของใหม่มาเก็บไว้ใช้ครั้งหน้า
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !fonts) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
