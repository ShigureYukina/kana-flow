/* かなフロー service worker
   - 页面(HTML/导航):网络优先,失败才用缓存 → 改完代码刷新即生效
   - 其余资源(CSV/图标/CDN 词典):缓存优先 → 离线可用
   - 词库 CSV 或预缓存列表变化时,递增 VER 触发重新缓存 */
const VER = 'kf-v6';
const ASSETS = [
  './',
  './prototype.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './jlpt-n5-words.csv',
  './jlpt-n4-words.csv',
  './jlpt-n3-words.csv',
  './zh-dict.json',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isPage = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/';
  if (isPage){
    e.respondWith(fetch(e.request).then(res => {
      if (res.ok){ const clone = res.clone(); caches.open(VER).then(c => c.put(e.request, clone)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./prototype.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    try {
      // 同源正常响应 + CDN 不透明响应(kuromoji 词典)都进缓存,首次加载后离线可用
      if ((res.ok || res.type === 'opaque') && (res.type === 'opaque' || url.origin === location.origin)){
        const clone = res.clone();
        caches.open(VER).then(c => c.put(e.request, clone));
      }
    } catch (err) {}
    return res;
  })));
});
