// public/sw.js
// Service Worker — cache tài nguyên tĩnh, cho phép dùng offline cơ bản

const CACHE_NAME = "wordwise-v1";
const CACHE_VERSION = 1;

// Các route cache khi install
const PRECACHE_URLS = ["/", "/learning", "/offline"];

// ── Install: precache các trang chính ─────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Nếu precache lỗi thì bỏ qua — không block install
      });
    }),
  );
  self.skipWaiting();
});

// ── Activate: xoá cache cũ ────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// ── Fetch: chiến lược cache ───────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bỏ qua API calls — luôn network-first, không cache
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  // Bỏ qua Next.js HMR / dev requests
  if (url.pathname.startsWith("/_next/webpack-hmr")) {
    return;
  }

  // Static assets (_next/static): Cache First
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, clone));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Pages (HTML): Network First, fallback cache, fallback offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return (
            cached ??
            caches.match("/offline") ??
            new Response("Offline", { status: 503 })
          );
        }),
    );
    return;
  }

  // Mọi thứ khác: Network First
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// ── Push Notification (streak reminder) ──────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Học Từ Vựng", {
      body: data.body ?? "Đừng quên học hôm nay!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: { url: data.url ?? "/learning" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/learning";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client)
          return client.focus();
      }
      return clients.openWindow(url);
    }),
  );
});
