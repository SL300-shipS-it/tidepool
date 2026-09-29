// Offline cache. Bump VERSION on every deploy so phones pick up the new files.
const VERSION = "tp-v0.1.0";
const CORE = [
  "./", "index.html", "styles.css", "config.js",
  "js/main.js", "js/core.js", "js/ui.js", "js/art.js", "js/audio.js",
  "js/scenes.js", "js/battle.js", "js/badges.js", "js/admin.js",
  "vendor/jsQR.js", "assets/fonts/PressStart2P.woff2",
  "story/story.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(CORE);
    // Also cache every photo the story references.
    try {
      const story = await (await fetch("story/story.json", { cache: "no-cache" })).json();
      const photos = new Set();
      for (const s of Object.values(story.scenes)) for (const p of s.photos || []) photos.add(p.src);
      await cache.addAll([...photos]);
    } catch {}
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Serve from cache immediately (works offline), refresh the cache in the background.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (new URL(req.url).pathname.includes("/tools/")) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    return res || (req.mode === "navigate" ? cache.match("index.html") : new Response("", { status: 504 }));
  })());
});
