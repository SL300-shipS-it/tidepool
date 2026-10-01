// Screens, stage rendering, text box, choices, popups, transitions.
import { G, $, sleep, fmt } from "./core.js";
import { CONFIG } from "../config.js";
import { sfx } from "./audio.js";
import { drawBg, drawGrid, gridSize, SPRITES, PAL, renderBadge, renderSprite } from "./art.js";

// ---------- screens ----------
export function show(id) {
  if (id !== "play") endRing();
  document.querySelectorAll(".screen:not(.overlay)").forEach((s) => s.classList.toggle("on", s.id === id));
  if (id === "play") resizeStage();
}
export function overlay(id, on) { $(id).classList.toggle("on", on); }

export async function fadeOut() { $("fade").classList.add("on"); await sleep(380); }
export async function fadeIn() { $("fade").classList.remove("on"); await sleep(300); }
export async function transition(fn) { await fadeOut(); await fn(); await fadeIn(); }

// ---------- stage ----------
// G.stageState = { bg, sprites: [{art, at, y, flip, anim, big}] }
export const stage = { bg: "title", sprites: [], W: 130, H: 117, scale: 3, custom: null };

export function resizeStage() {
  const c = $("stage");
  const cssW = Math.min(window.innerWidth, 520);
  const scale = Math.max(2, Math.floor(cssW / 130));
  stage.scale = scale;
  stage.W = Math.floor(cssW / scale);
  stage.H = Math.floor(stage.W * 0.92);
  const maxH = Math.floor((window.innerHeight * 0.5) / scale);
  if (stage.H > maxH) stage.H = Math.max(80, maxH);
  c.width = stage.W; c.height = stage.H;
  c.style.width = stage.W * scale + "px"; c.style.height = stage.H * scale + "px";
  $("stageWrap").style.width = stage.W * scale + "px";
}

const HOPIN_MS = 900;
const AT = { left: 0.25, center: 0.5, right: 0.75, farleft: 0.15, farright: 0.85 };

function drawStage(t) {
  const c = $("stage");
  if (!c.width || !$("play").classList.contains("on")) return;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  drawBg(ctx, stage.bg, stage.W, stage.H, t);
  if (stage.custom) { stage.custom(ctx, t); return; }
  const floor = Math.round(stage.H * 0.9);
  for (const sp of stage.sprites) {
    const grid = SPRITES[sp.art];
    if (!grid) continue;
    const { w, h } = gridSize(grid);
    const s = sp.big === false ? 1 : 2;
    const cx = typeof sp.at === "number" ? sp.at : (AT[sp.at] ?? 0.5);
    let x = Math.round(cx * stage.W - (w * s) / 2);
    let y = floor - h * s + (sp.dy || 0);
    if (sp.anim === "bounce") y -= Math.round(Math.abs(Math.sin(t / 260)) * 3);
    if (sp.anim === "bob") y -= ((t / 500) | 0) % 2;
    if (sp.anim === "hopin") {
      // CR-043: hops in from off-screen left in 3 small hops (~900 ms), then sits still at `at`.
      if (sp._t0 == null) sp._t0 = t;
      const p = Math.min(1, Math.max(0, (t - sp._t0) / HOPIN_MS));
      if (p < 1) {
        x = Math.round(x - (x + w * s) * (1 - p));
        y -= Math.round(Math.abs(Math.sin(p * 3 * Math.PI)) * 6);
      }
    }
    if (sp.enter != null) { x += sp.enter; sp.enter = Math.max(0, sp.enter - 3); if (!sp.enter) sp.enter = null; }
    drawGrid(ctx, grid, x, y, s, sp.flip);
    if (sp.zzz) { ctx.fillStyle = "#303838"; ctx.font = "8px PressStart"; ctx.fillText("z".repeat(1 + (((t / 500) | 0) % 3)), x + w * s - 4, y - 2); }
  }
}
function loop(t) { drawStage(t); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
window.addEventListener("resize", () => { if ($("play").classList.contains("on")) resizeStage(); });

export function setScene(scene) {
  endRing();
  if (scene.bg !== undefined) stage.bg = scene.bg;
  if (scene.sprites !== undefined) stage.sprites = scene.sprites.map((s) => ({ ...s }));
}

export async function flash() {
  const w = $("stageWrap");
  w.classList.remove("flash"); void w.offsetWidth; w.classList.add("flash");
  await sleep(760); w.classList.remove("flash");
}
export async function shake() {
  const w = $("stageWrap");
  w.classList.remove("shake"); void w.offsetWidth; w.classList.add("shake");
  await sleep(320); w.classList.remove("shake");
}

// ---------- tap input ----------
let tapResolver = null;
export function waitTap() { return new Promise((r) => (tapResolver = r)); }
export function initTap() {
  const target = $("play");
  target.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, input, #choices")) return;
    if (tapResolver) { const r = tapResolver; tapResolver = null; r(); }
  });
}

// ---------- text box ----------
export function setSpeaker(name) {
  const t = $("nameTag");
  t.textContent = fmt(name || "");
  t.classList.toggle("hidden", !name);
}

// Types one box of text; first tap completes it, next tap advances.
const FAST = new URLSearchParams(location.search).has("fast");
export async function say(text, { speed = FAST ? 0 : CONFIG.TEXT_SPEED_MS, wait = true } = {}) {
  const el = $("text");
  const more = $("more");
  const full = fmt(text);
  more.classList.add("hidden");
  el.textContent = "";
  let skip = false;
  const tapP = waitTap().then(() => (skip = true));
  for (let i = 0; i < full.length; i++) {
    if (skip) break;
    el.textContent = full.slice(0, i + 1);
    if (i % 2 === 0 && full[i] !== " ") sfx("blip");
    await sleep(speed);
  }
  el.textContent = full;
  if (!skip) tapResolver = null;
  if (!wait) return;
  more.classList.remove("hidden");
  await waitTap();
  more.classList.add("hidden");
  sfx("move");
}

export async function sayAll(lines, speaker) {
  setSpeaker(speaker);
  for (const l of lines || []) await say(l);
}

// Shows options in the box; resolves with the chosen index.
export function choose(options, { prompt = null, cls = "" } = {}) {
  return new Promise(async (resolve) => {
    if (prompt) await say(prompt, { wait: false });
    $("more").classList.add("hidden");
    const ul = $("choices");
    ul.className = cls;
    ul.innerHTML = "";
    options.forEach((opt, i) => {
      const li = document.createElement("li");
      li.textContent = fmt(opt);
      li.addEventListener("pointerdown", () => { ul.querySelectorAll("li").forEach((x) => x.classList.remove("sel")); li.classList.add("sel"); });
      li.addEventListener("click", async () => {
        sfx("select");
        li.classList.add("sel");
        await sleep(160);
        ul.classList.add("hidden");
        ul.innerHTML = "";
        resolve(i);
      }, { once: true });
      ul.appendChild(li);
    });
    ul.classList.remove("hidden");
  });
}

// ---------- partner carousel (CR-045) ----------
// slots: [{ art, label, silhouette, empty }] in ring order. Resolves with the chosen slot index.
// The ring is drawn on the stage canvas; the text box shows the prompt, the front slot's name, the
// arrows and CHOOSE. #choices stays in the DOM (visually hidden, class "ring") with one <li> per
// non-empty slot, so the playtest's choice driver works unchanged.
// Throws synchronously-before-showing-anything if a slot's art is missing (caller falls back to
// choose()). If drawing fails later, it degrades in place to the plain list.
let ringNow = null;  // active ring: { slots, n, from, to, t0, dur, front, done }
const RING_MS = 280;
const SILHOUETTE = "#283038";

export function endRing() {
  const r = ringNow;
  if (!r) return;
  ringNow = null;
  r.done = true;
  if (stage.custom === r.draw) stage.custom = null;
  $("ring").classList.add("hidden");
  $("stageWrap").classList.remove("ringon");
  const ul = $("choices");
  // A ring list left behind (a new run took over mid-pick) must not turn into a visible menu.
  if (ul.classList.contains("ring")) { ul.classList.add("hidden"); ul.innerHTML = ""; ul.classList.remove("ring"); }
}

// Pixel-exact grid draw at any (fractional) scale: each cell snaps to whole canvas pixels, so the
// art stays crisp mid-turn. `fill` paints every opaque cell one color (the silhouette).
function drawPix(ctx, grid, x, y, s, fill) {
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    const y0 = Math.round(y + r * s), y1 = Math.round(y + (r + 1) * s);
    if (y1 <= y0) continue;
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === ".") continue;
      const x0 = Math.round(x + c * s), x1 = Math.round(x + (c + 1) * s);
      if (x1 <= x0) continue;
      ctx.fillStyle = fill || PAL[ch] || "#ff00ff";
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
  }
}
function pixEllipse(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  for (let dy = -ry; dy <= ry; dy++) {
    const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + 0.5)) ** 2)));
    if (hw > 0) ctx.fillRect(Math.round(cx - hw), Math.round(cy + dy), hw * 2, 1);
  }
}
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const mod = (a, n) => ((a % n) + n) % n;

function ringPos(r, t) {
  if (!r.dur || t >= r.t0 + r.dur) return r.to;
  return r.from + (r.to - r.from) * ease(Math.max(0, (t - r.t0) / r.dur));
}

function ringDraw(r, ctx, t) {
  const W = stage.W, H = stage.H, n = r.n;
  const pos = ringPos(r, t);
  const moving = pos !== r.to;
  // Dim the room, then a spotlight cone + pool on the front spot.
  ctx.fillStyle = "rgba(32,32,40,0.32)";
  ctx.fillRect(0, 0, W, H);
  const cx = Math.round(W / 2), cy = Math.round(H * 0.72);
  const rx = Math.round(W * 0.3), ry = Math.max(6, Math.round(H * 0.12));
  const frontY = cy + ry;
  ctx.fillStyle = "rgba(248,248,232,0.16)";
  for (let y = 0; y < frontY; y++) {
    const hw = Math.round(6 + (y / frontY) * 18);
    ctx.fillRect(cx - hw, y, hw * 2, 1);
  }
  pixEllipse(ctx, cx, frontY, 24, 5, "rgba(248,248,232,0.5)");
  const items = r.slots.map((sl, i) => {
    const a = ((i - pos) * 2 * Math.PI) / n;
    return { sl, i, a, depth: Math.cos(a) };
  }).sort((p, q) => p.depth - q.depth);
  for (const it of items) {
    const fx = cx + Math.sin(it.a) * rx;
    const fy = cy + it.depth * ry;
    const sc = 1 + Math.min(1, Math.max(0, (it.depth + 0.5) / 1.5));  // back 1x .. front 2x
    const grid = !it.sl.empty && SPRITES[it.sl.art];
    if (!grid) { pixEllipse(ctx, fx, fy, Math.round(7 * sc), Math.max(1, Math.round(1.5 * sc)), "rgba(32,32,40,0.18)"); continue; }
    const { w, h } = gridSize(grid);
    pixEllipse(ctx, fx, fy, Math.round(w * sc * 0.4), Math.max(1, Math.round(1.5 * sc)), "rgba(32,32,40,0.35)");
    const front = !moving && it.i === r.front;
    const bob = front && !it.sl.silhouette ? ((t / 500) | 0) % 2 : 0;
    drawPix(ctx, grid, fx - (w * sc) / 2, fy - h * sc - bob, sc, it.sl.silhouette ? SILHOUETTE : null);
  }
}

export function carousel(slots, { prompt = null, start = null } = {}) {
  endRing();
  bindSwipe();
  const n = slots.length;
  if (n < 2) throw new Error("carousel needs at least 2 slots");
  for (const sl of slots) if (!sl.empty && !SPRITES[sl.art]) throw new Error("carousel: missing art " + sl.art);
  const firstFull = slots.findIndex((sl) => !sl.empty);
  if (firstFull < 0) throw new Error("carousel: no choosable slot");
  const front0 = start != null && slots[start] && !slots[start].empty ? start : firstFull;
  const r = { slots, n, from: front0, to: front0, t0: 0, dur: 0, front: front0, done: false };
  r.draw = (ctx, t) => {
    try { ringDraw(r, ctx, t); }
    catch (e) { console.warn("carousel draw failed; plain list instead", e); degrade(); }
  };
  // Test-draw once off-screen: a throw here means "use the plain menu" before anything is shown.
  const probe = document.createElement("canvas");
  probe.width = Math.max(1, stage.W); probe.height = Math.max(1, stage.H);
  ringDraw(r, probe.getContext("2d"), 0);

  const ul = $("choices"), box = $("ring"), nameEl = $("ringName"), chooseBtn = $("ringChoose");
  const labelOf = (sl) => (sl.silhouette ? "???" : fmt(sl.label || ""));
  let resolveFn;
  const done = new Promise((res) => (resolveFn = res));

  function refresh() {
    const sl = slots[r.front];
    nameEl.textContent = sl.empty ? "" : labelOf(sl);
    chooseBtn.disabled = !!sl.empty;
  }
  function turn(dir) {
    if (r.done) return;
    const now = performance.now();
    r.from = ringPos(r, now);
    r.to = r.to + dir;
    r.t0 = now;
    r.dur = FAST ? 0 : RING_MS;
    r.front = mod(r.to, n);
    sfx("move");
    refresh();
  }
  async function finish(i) {
    if (r.done || !slots[i] || slots[i].empty) return;
    r.done = true;
    sfx("select");
    await sleep(160);
    ul.classList.add("hidden"); ul.innerHTML = "";
    if (ringNow === r) endRing();
    resolveFn(i);
  }
  function degrade() {
    // Drawing broke: drop the ring, show the hidden list as the normal menu.
    if (stage.custom === r.draw) stage.custom = null;
    box.classList.add("hidden");
    $("stageWrap").classList.remove("ringon");
    ul.classList.remove("ring");
  }
  r.turn = turn;
  ringNow = r;
  stage.custom = r.draw;
  $("stageWrap").classList.add("ringon");

  (async () => {
    if (prompt) await say(prompt, { wait: false });
    if (r.done || ringNow !== r) return;
    $("more").classList.add("hidden");
    ul.className = "ring";
    ul.innerHTML = "";
    slots.forEach((sl, i) => {
      if (sl.empty) return;
      const li = document.createElement("li");
      li.textContent = labelOf(sl);
      li.addEventListener("click", () => { li.classList.add("sel"); finish(i); });
      ul.appendChild(li);
    });
    ul.classList.remove("hidden");
    $("ringLeft").onclick = () => turn(-1);
    $("ringRight").onclick = () => turn(1);
    chooseBtn.onclick = () => finish(r.front);
    refresh();
    if (stage.custom === r.draw) box.classList.remove("hidden");
  })();
  return done;
}

// Swipe on the stage turns the ring (horizontal drag > 30 px). Bound once; idle when no ring is up.
let swipeX = null, swipeLast = null;
function swipeEnd() {
  if (swipeX == null) return;
  const dx = swipeLast - swipeX;
  swipeX = null;
  const r = ringNow;
  if (!r || r.done || stage.custom !== r.draw) return;
  if (Math.abs(dx) > 30) r.turn(dx > 0 ? -1 : 1);  // drag right: the left one comes to the front
}
let ringBound = false;
function bindSwipe() {
  if (ringBound) return;
  ringBound = true;
  const w = $("stageWrap");
  w.addEventListener("pointerdown", (e) => { if (ringNow) { swipeX = swipeLast = e.clientX; } });
  w.addEventListener("pointermove", (e) => { if (swipeX != null) swipeLast = e.clientX; });
  w.addEventListener("pointerup", (e) => { if (swipeX != null) { swipeLast = e.clientX; swipeEnd(); } });
  w.addEventListener("pointercancel", swipeEnd);
}

export function askText({ max = 10, placeholder = "" } = {}) {
  return new Promise((resolve) => {
    const row = $("inputRow"), inp = $("nameInput"), ok = $("nameOk");
    inp.maxLength = max; inp.value = ""; inp.placeholder = placeholder;
    row.classList.remove("hidden");
    setTimeout(() => inp.focus(), 50);
    const done = () => {
      const v = inp.value.trim().toUpperCase();
      if (!v) { inp.focus(); return; }
      sfx("select");
      row.classList.add("hidden"); inp.blur();
      ok.onclick = null; inp.onkeydown = null;
      resolve(v);
    };
    ok.onclick = done;
    inp.onkeydown = (e) => { if (e.key === "Enter") done(); };
  });
}

// ---------- popup ----------
// icon: {badge: id} | {sprite: id} | null ; input: {placeholder} for a text field; buttons: ["A","B"]
export function popup({ title = "", text = "", icon = null, sound = null, input = null, textarea = null, buttons = ["OK"], spin = false } = {}) {
  return new Promise((resolve) => {
    const cv = $("popIcon");
    cv.classList.toggle("hidden", !icon);
    cv.classList.toggle("spin", spin);
    if (icon?.badge) renderBadge(cv, icon.badge, 64);
    else if (icon?.sprite) renderSprite(cv, icon.sprite, 4);
    $("popTitle").textContent = fmt(title);
    $("popText").textContent = fmt(text);
    const extra = $("popExtra"); extra.innerHTML = "";
    let field = null;
    if (input) { field = document.createElement("input"); field.placeholder = input.placeholder || ""; field.autocapitalize = "off"; field.autocomplete = "off"; extra.appendChild(field); }
    if (textarea != null) { field = document.createElement("textarea"); field.value = textarea; extra.appendChild(field); }
    const ok = $("popOk");
    const btnRow = document.createElement("div"); btnRow.className = "stack";
    buttons.slice(1).forEach((b, i) => {
      const el = document.createElement("button"); el.className = "btn small"; el.textContent = b;
      el.onclick = () => close(i + 1); btnRow.appendChild(el);
    });
    extra.appendChild(btnRow);
    ok.textContent = buttons[0];
    const close = (i) => { $("popup").classList.add("hidden"); ok.onclick = null; resolve(field ? { button: i, value: field.value } : i); };
    ok.onclick = () => { sfx("move"); close(0); };
    $("popup").classList.remove("hidden");
    if (sound) sfx(sound);
    if (field && input) setTimeout(() => field.focus(), 50);
  });
}
