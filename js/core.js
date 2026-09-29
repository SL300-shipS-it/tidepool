// Shared game context: story data, save state, persistence, small helpers.
import { CONFIG } from "../config.js";

export const G = {
  story: null,
  state: null,
  debug: false,
  listeners: {},
};

export const $ = (id) => document.getElementById(id);
// ?fast=1 (used by tools/playtest.html) shrinks every delay so the whole game plays in seconds.
const FAST = new URLSearchParams(location.search).has("fast");
export const sleep = (ms) => new Promise((r) => setTimeout(r, FAST ? Math.min(ms, 4) : ms));

export function on(evt, fn) { (G.listeners[evt] ||= []).push(fn); }
export function emit(evt, data) { (G.listeners[evt] || []).forEach((fn) => fn(data)); }

// ---------- save state ----------
export function freshState() {
  return {
    v: 1,
    name: "",
    flags: {},          // prologue picks and any other story flags
    keys: {},           // unlock keys obtained: { gala: timestamp }
    badges: {},         // badges shown in the case: { gala: timestamp }
    items: [],
    statuses: [],
    ach: [],
    done: [],           // finished chapter ids
    chapter: null,      // chapter in progress
    scene: null,        // scene to resume at
    started: Date.now(),
  };
}

function storageGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function storageSet(key, val) { try { localStorage.setItem(key, val); return true; } catch { return false; } }
function storageDel(key) { try { localStorage.removeItem(key); } catch {} }

export function loadState() {
  const raw = storageGet(CONFIG.SAVE_KEY);
  if (raw) {
    try { G.state = Object.assign(freshState(), JSON.parse(raw)); return true; } catch {}
  }
  G.state = freshState();
  return false;
}
export function saveState() { storageSet(CONFIG.SAVE_KEY, JSON.stringify(G.state)); debugUpdate(); }
export function resetState() { storageDel(CONFIG.SAVE_KEY); G.state = freshState(); }
export function hasSave() { return !!storageGet(CONFIG.SAVE_KEY); }

export function getPref(k, d) { const v = storageGet("tp_pref_" + k); return v === null ? d : JSON.parse(v); }
export function setPref(k, v) { storageSet("tp_pref_" + k, JSON.stringify(v)); }

// ---------- restore codes (base64url JSON) ----------
export function exportCode(state = G.state) {
  const s = state;
  const compact = { v: s.v, n: s.name, f: s.flags, k: Object.keys(s.keys), b: Object.keys(s.badges), i: s.items, s: s.statuses, a: s.ach, d: s.done, c: s.chapter, sc: s.scene };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(compact))));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function importCode(code) {
  const b64 = code.trim().replace(/-/g, "+").replace(/_/g, "/");
  const c = JSON.parse(decodeURIComponent(escape(atob(b64))));
  const t = Date.now();
  const st = freshState();
  Object.assign(st, {
    name: c.n || "", flags: c.f || {}, items: c.i || [], statuses: c.s || [], ach: c.a || [], done: c.d || [],
    chapter: c.c || null, scene: c.sc || null,
    keys: Object.fromEntries((c.k || []).map((k) => [k, t])),
    badges: Object.fromEntries((c.b || []).map((k) => [k, t])),
  });
  return st;
}

export function baseUrl() {
  return CONFIG.BASE_URL || (location.origin + location.pathname.replace(/index\.html$/, ""));
}
export function restoreLink() { return baseUrl() + "#r=" + exportCode(); }

// ---------- conditions + text ----------
// cond: { flag: "value" | ["a","b"] | "!value" }  (all must match)
export function test(cond) {
  if (!cond) return true;
  const f = G.state.flags;
  return Object.entries(cond).every(([k, want]) => {
    const have = k === "hasKey" ? (G.state.keys[want] ? want : null) : f[k];
    if (k === "hasKey") return !!have;
    if (Array.isArray(want)) return want.includes(have);
    if (typeof want === "string" && want.startsWith("!")) return have !== want.slice(1);
    return have === want;
  });
}

export function label(flag) {
  const v = G.state.flags[flag];
  const lists = G.story.lists || {};
  if (lists[flag + "s"]) { const hit = lists[flag + "s"].find((x) => x.id === v); if (hit) return hit.name; }
  const map = (G.story.labels || {})[flag];
  return (map && map[v]) || v || "";
}

export function fmt(text) {
  if (!text) return "";
  return String(text)
    .replace(/\{name\}/g, G.state.name || "TRAINER")
    .replace(/\{partner\}/g, CONFIG.PARTNER)
    .replace(/\{L\.(\w+)\}/g, (_, k) => label(k))
    .replace(/\{f\.(\w+)\}/g, (_, k) => G.state.flags[k] ?? "");
}

// ---------- debug overlay ----------
export function debugUpdate() {
  const el = $("debug");
  if (!el) return;
  el.classList.toggle("hidden", !G.debug);
  if (!G.debug || !G.state) return;
  const s = G.state;
  el.textContent = `scene: ${s.scene}\nchapter: ${s.chapter}\nflags: ${JSON.stringify(s.flags)}\nkeys: ${Object.keys(s.keys).join(",")}\ndone: ${s.done.join(",")}`;
}
