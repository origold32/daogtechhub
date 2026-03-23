// DAOG Tech Hub — Service Worker
// Provides offline support, smart caching, and background sync

const CACHE_VERSION = "daog-v2";
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE   = `${CACHE_VERSION}-images`;

const STATIC_ASSETS = [
  "/",
  "/gadgets",
  "/jerseys",
  "/cars",
  "/realestate",
  "/manifest.json",
  "/images/logo.webp",
  "/images/hero_phone.jpg",
  "/images/gadgets_phone.jpg",
  "/images/jerseys_shirt.jpg",
  "/images/cars_vehicle.jpg",
  "/images/realestate_house.jpg",
  "/offline",
];

// ── Install: cache static shell ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Cache what we can; don't fail install if some assets are missing
      return Promise.allSettled(
        STATIC_ASSETS.map((url) => cache.add(url).catch(() => null))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("daog-") && k !== STATIC_CACHE && k !== DYNAMIC_CACHE && k !== IMAGE_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for images, network-first for API, stale-while-revalidate for pages ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Auth routes and any URL with auth params must NEVER be cached.
  // Service worker caching of auth callbacks breaks PKCE cookie flow.
  const isAuthRoute =
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/api/auth");
  const hasAuthParams =
    url.searchParams.has("code") ||
    url.searchParams.has("token_hash") ||
    url.searchParams.has("error") ||
    url.searchParams.has("error_description");
  if (isAuthRoute || hasAuthParams) return;

  // API routes: network-first with short timeout
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE, 4000));
    return;
  }

  // Images: cache-first, long TTL
  if (request.destination === "image" || url.pathname.match(/\.(jpg|jpeg|png|webp|avif|svg|ico)$/)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Static assets (_next/static): cache-first immutable
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ── Push notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "DAOG Tech Hub", {
      body:    data.body ?? "You have a new notification",
      icon:    "/icons/icon-192.png",
      badge:   "/icons/icon-72.png",
      image:   data.image,
      data:    { url: data.url ?? "/" },
      actions: [
        { action: "view",    title: "View" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(clients.openWindow(url));
});

// ── Background sync ──────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-cart") {
    event.waitUntil(syncCart());
  }
});

async function syncCart() {
  try {
    const db = await openDB();
    const pendingItems = await db.getAll("pendingCart");
    for (const item of pendingItems) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      await db.delete("pendingCart", item.id);
    }
  } catch (err) {
    console.warn("[sw] Cart sync failed:", err);
  }
}

// ── Cache strategies ─────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    clearTimeout(timer);
    const cached = await caches.match(request);
    return cached ?? new Response(JSON.stringify({ success: false, error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached ?? fetchPromise ?? new Response("Offline", { status: 503 });
}

// Minimal IndexedDB wrapper for background sync
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("daog-sw", 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore("pendingCart", { keyPath: "id" });
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      resolve({
        getAll: (store) => new Promise((res, rej) => {
          const tx = db.transaction(store, "readonly");
          const req = tx.objectStore(store).getAll();
          req.onsuccess = () => res(req.result);
          req.onerror = rej;
        }),
        delete: (store, key) => new Promise((res, rej) => {
          const tx = db.transaction(store, "readwrite");
          const req = tx.objectStore(store).delete(key);
          req.onsuccess = res;
          req.onerror = rej;
        }),
      });
    };
    req.onerror = reject;
  });
}
