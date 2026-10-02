// Offline cache. Bump VERSION on every deploy so phones pick up the new files.
//
// Updates are all-or-nothing: a new version downloads every file into a fresh cache during install.
// If any file fails (bad signal), the install fails and the phone keeps the old, complete version.
// Pages are always served cache-first, so files from two versions never mix.
const VERSION = "tp-v0.1.7";
const CORE = [
  "./", "index.html", "styles.css", "config.js",
  "js/main.js", "js/core.js", "js/ui.js", "js/art.js", "js/audio.js",
  "js/scenes.js", "js/battle.js", "js/badges.js", "js/admin.js",
  "js/minigames/index.js", "js/minigames/tap.js",
  "vendor/jsQR.js", "assets/fonts/PressStart2P.woff2",
  "story/story.json",
  "manifest.webmanifest", "assets/icons/apple-touch-icon.png", "assets/icons/icon-512.png", "assets/icons/favicon-32.png",
];

// Bypass the browser's HTTP cache so a new version never picks up stale files.
const fresh = (url) => new Request(url, { cache: "reload" });

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const story = await (await fetch(fresh("story/story.json"))).json();
    const photos = new Set();
    for (const s of Object.values(story.scenes)) for (const p of s.photos || []) photos.add(p.src);
    const cache = await caches.open(VERSION);
    await cache.addAll([...CORE, ...photos].map(fresh)); // throws if anything is missing -> install fails, old version stays
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.includes("/tools/")) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === "navigate") { const idx = await cache.match("index.html"); if (idx) return idx; }
    try { return await fetch(req); } catch { return new Response("", { status: 504 }); }
  })());
});
