const CACHE_NAME = 'yuzu-schedule-v2';
const urlsToCache = [
    './',
    './index.html',
    './tubiao.png',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting()) // 强制立即接管控制权
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        // 网络优先策略
        fetch(event.request)
            .then(networkResponse => {
                // 网络请求成功，更新缓存
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // 网络失败，返回缓存
                return caches.match(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        }).then(() => self.clients.claim()) // 立即让新 SW 生效
    );
});
