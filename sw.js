const CACHE_NAME = 'travel-expense-v2';  // バージョンを上げて古いキャッシュを破棄
const ASSETS = [
  '/Euro2026/travel-expense.html',
  '/Euro2026/index.html',
  '/Euro2026/hotel_manager_euro2026.html',  // 宿泊先管理アプリを追加
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネットワーク優先、失敗時はキャッシュ
// → オンライン時は常に最新、オフライン時もアプリが動く
self.addEventListener('fetch', event => {
  // 為替レートAPIはキャッシュしない
  if (event.request.url.includes('open.er-api.com')) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功したレスポンスをキャッシュに更新
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
