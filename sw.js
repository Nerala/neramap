// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap Service Worker — Tile caching for offline & faster reloads
// ═══════════════════════════════════════════════════════════════════════════════

const CACHE_NAME = "neramap-tiles-v1";

// Tile URL patterns we want to cache
const TILE_PATTERNS = [
  "tile.opentopomap.org",
  "tile.openstreetmap.org",
  "basemaps.cartocdn.com",
  "server.arcgisonline.com",
];

function isTileRequest(url) {
  return TILE_PATTERNS.some((pattern) => url.includes(pattern));
}

// ─ Install: pre-cache nothing, just set up ─
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// ─ Activate: clean old caches ─
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k.startsWith("neramap-tiles"))
            .map((k) => caches.delete(k)),
        ),
      ),
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ─ Fetch: serve tiles from cache if available, fetch & cache otherwise ─
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept tile image requests
  if (!isTileRequest(request.url)) return;
  if (request.method !== "GET") return;

  event.respondWith(cacheThenNetwork(request));
});

async function cacheThenNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      // Cache in the background (don't await — fire and forget)
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch (err) {
    // Offline and not in cache — return the opaque cached response if any
    const fallback = await caches.match(request);
    if (fallback) return fallback;
    // Last resort: transparent placeholder
    return new Response("", { status: 408, statusText: "Offline" });
  }
}
