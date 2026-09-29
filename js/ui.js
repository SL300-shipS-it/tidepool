// Screens, stage rendering, text box, choices, popups, transitions.
import { G, $, sleep, fmt } from "./core.js";
import { CONFIG } from "../config.js";
import { sfx } from "./audio.js";
import { drawBg, drawGrid, gridSize, SPRITES, renderBadge, renderSprite } from "./art.js";

// ---------- screens ----------
export function show(id) {
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
    if (sp.enter != null) { x += sp.enter; sp.enter = Math.max(0, sp.enter - 3); if (!sp.enter) sp.enter = null; }
    drawGrid(ctx, grid, x, y, s, sp.flip);
    if (sp.zzz) { ctx.fillStyle = "#0f380f"; ctx.font = "8px PressStart"; ctx.fillText("z".repeat(1 + (((t / 500) | 0) % 3)), x + w * s - 4, y - 2); }
  }
}
function loop(t) { drawStage(t); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
window.addEventListener("resize", () => { if ($("play").classList.contains("on")) resizeStage(); });

export function setScene(scene) {
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
export async function say(text, { speed = CONFIG.TEXT_SPEED_MS, wait = true } = {}) {
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
