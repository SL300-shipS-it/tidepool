// Scene runner, chapter flow (hub), trainer card, letter, photos, credits.
import { G, $, sleep, fmt, test, label, saveState, restoreLink, on } from "./core.js";
import { CONFIG } from "../config.js";
import { show, transition, setScene, stage, say, sayAll, setSpeaker, choose, askText, popup, flash } from "./ui.js";
import { sfx } from "./audio.js";
import { runBattle } from "./battle.js";
import { grantKey, awardBadgeAnim, renderCase, scan, promptWord, badgeVisible } from "./badges.js";
import { renderBadge, renderSprite } from "./art.js";

// ---------- chapters ----------
export function chapterOf(id) { return G.story.chapters.find((c) => c.id === id); }

export function nextChapter() {
  return G.story.chapters.find((c) => !G.state.done.includes(c.id) && test(c.if));
}
function chapterOpen(ch) {
  return !ch.key || ch.key === "continue" || !!G.state.keys[ch.key];
}

export async function startChapter(ch) {
  G.state.chapter = ch.id;
  G.state.scene = ch.start;
  saveState();
  await transition(() => { show("play"); $("hudChapter").textContent = fmt(ch.title); });
  await runFrom(ch.start);
}

// Resume wherever the save says.
export async function resume() {
  const s = G.state;
  if (s.chapter && s.scene && !s.done.includes(s.chapter) && G.story.scenes[s.scene]) {
    const ch = chapterOf(s.chapter);
    await transition(() => { show("play"); $("hudChapter").textContent = fmt(ch?.title || ""); });
    await runFrom(s.scene);
  } else {
    await openHub();
  }
}

export async function openHub({ autoStart = true } = {}) {
  const ch = nextChapter();
  const go = $("hubGo"), title = $("hubTitle"), text = $("hubText");
  $("hudChapter").textContent = "";
  if (!ch) {
    title.textContent = "THE END";
    text.textContent = fmt("Thanks for playing, {name}.");
    go.classList.remove("hidden"); go.textContent = "REPLAY CREDITS";
    go.onclick = () => runCredits(G.story.credits || { lines: ["THE END"] }).then(() => openHub());
    show("hub");
    return;
  }
  if (chapterOpen(ch)) {
    title.textContent = fmt(ch.title);
    text.textContent = fmt(ch.intro || (ch.key === "continue" ? "Ready when you are." : "A new route is open!"));
    go.classList.remove("hidden");
    go.textContent = ch.key === "continue" ? "CONTINUE" : "START";
    go.onclick = () => { sfx("select"); startChapter(ch); };
    show("hub");
    if (autoStart && ch.key && ch.key !== "continue" && G.justUnlocked === ch.key) { G.justUnlocked = null; startChapter(ch); }
    return;
  }
  const b = G.story.badges[ch.key];
  title.textContent = fmt(ch.lockedTitle || "ROUTE LOCKED");
  text.textContent = fmt(ch.lockedText || b?.hint || "You need a badge to continue.");
  go.classList.add("hidden");
  show("hub");
}

on("keys-changed", (id) => {
  G.justUnlocked = id;
  if ($("hub").classList.contains("on")) openHub();
});

// ---------- scene runner ----------
export async function runFrom(id) {
  while (id) {
    if (id === "@end") { await endChapter(); return; }
    if (id === "@hub") { await openHub(); return; }
    const scene = G.story.scenes[id];
    if (!scene) { await popup({ title: "MISSING SCENE", text: id }); await openHub(); return; }
    if (scene.if && !test(scene.if)) { id = resolveNext(scene.else || scene.next); continue; }
    G.state.scene = id;
    saveState();
    id = await play(id, scene);
  }
}

function resolveNext(next) {
  if (!next) return null;
  if (typeof next === "string") return next;
  for (const n of next) if (test(n.if)) return n.next;
  return null;
}

function applySet(set) { if (set) { Object.assign(G.state.flags, set); saveState(); } }

async function doEffects(list) {
  for (const e of list || []) {
    if (e.set) applySet(e.set);
    if (e.sfx) sfx(e.sfx);
    if (e.item) {
      const it = G.story.items?.[e.item] || { name: e.item };
      if (!G.state.items.includes(e.item)) G.state.items.push(e.item);
      saveState();
      await popup({ title: "ITEM GET!", text: `{name} obtained ${it.name}!` + (it.desc ? `\n${it.desc}` : ""), icon: { sprite: "item" }, sound: "item" });
    }
    if (e.status) {
      const st = G.story.statuses?.[e.status] || { name: e.status };
      if (!G.state.statuses.includes(e.status)) G.state.statuses.push(e.status);
      saveState();
      await popup({ title: "STATUS", text: `{name} is ${st.name}!` + (st.desc ? `\n${st.desc}` : ""), icon: { sprite: "status" }, sound: "status" });
    }
    if (e.clearStatus) { G.state.statuses = G.state.statuses.filter((s) => s !== e.clearStatus); saveState(); }
    if (e.achievement) {
      if (!G.state.ach.includes(e.achievement)) G.state.ach.push(e.achievement);
      saveState();
      await popup({ title: "ACHIEVEMENT UNLOCKED", text: e.achievement, icon: { sprite: "trophy" }, sound: "achievement" });
    }
    if (e.badge) await awardBadgeAnim(e.badge);
    if (e.wait) await sleep(e.wait);
  }
}

// Plays one scene; returns the next scene id.
async function play(id, s) {
  setScene(s);
  switch (s.type || "dialogue") {
    case "dialogue": {
      await sayAll(s.lines, s.speaker);
      await doEffects(s.do);
      return await menuOrNext(s);
    }
    case "input": {
      setSpeaker(s.speaker);
      for (const l of s.lines || []) await say(l);
      await say(s.prompt || "What's your name?", { wait: false });
      const v = await askText({ max: s.max || 10, placeholder: s.placeholder || "" });
      if (s.flag === "name") G.state.name = v; else G.state.flags[s.flag] = v;
      saveState();
      await doEffects(s.do);
      return resolveNext(s.next);
    }
    case "encounter": {
      stage.sprites = (s.sprites || []).map((sp) => ({ ...sp, enter: 80 }));
      sfx("encounter");
      await flash();
      setSpeaker(null);
      await say(s.text || "A wild LEON appeared!");
      await sayAll(s.lines, s.speaker);
      await doEffects(s.do);
      return await menuOrNext(s);
    }
    case "obstacle":
    case "choice":
      await sayAll(s.lines, s.speaker);
      await doEffects(s.do);
      return await menuOrNext(s);
    case "battle": {
      const def = G.story.battles[s.battle];
      await sayAll(s.lines, s.speaker);
      await runBattle(def);
      setScene({ bg: s.afterBg ?? stage.bg, sprites: s.afterSprites ?? [] });
      await doEffects(s.do);
      return resolveNext(s.next);
    }
    case "trainerCard": {
      await sayAll(s.lines, s.speaker);
      await showCard({ share: true });
      return resolveNext(s.next);
    }
    case "letter": await runLetter(s); return resolveNext(s.next);
    case "photos": await runPhotos(s); show("play"); return resolveNext(s.next);
    case "credits": await runCredits(s); return resolveNext(s.next);
    default:
      await popup({ title: "UNKNOWN SCENE TYPE", text: s.type });
      return resolveNext(s.next);
  }
}

// Shows choices if the scene has them, else follows next.
async function menuOrNext(s) {
  let choices = s.choices;
  if (s.choicesFrom) {
    choices = (G.story.lists[s.choicesFrom] || []).filter((x) => x.available !== false).map((x) => ({ label: x.name, set: { [s.choiceFlag]: x.id }, next: s.next }));
  }
  if (!choices) return resolveNext(s.next);
  while (true) {
    const visible = choices.filter((c) => test(c.if));
    const i = await choose(visible.map((c) => c.label), { prompt: s.prompt || lastLine(s) });
    const c = visible[i];
    if (c.fail) {
      // Wrong answer: show the fail lines, then loop back to the menu.
      sfx("fail");
      await sayAll(c.fail, c.failSpeaker || s.speaker);
      await doEffects(c.do);
      continue;
    }
    applySet(c.set);
    await doEffects(c.do);
    if (c.lines) await sayAll(c.lines, c.speaker || s.speaker);
    return resolveNext(c.next || s.next);
  }
}
function lastLine(s) { return s.lines && s.lines.length ? s.lines[s.lines.length - 1] : ""; }

async function endChapter() {
  const ch = chapterOf(G.state.chapter);
  if (ch && !G.state.done.includes(ch.id)) G.state.done.push(ch.id);
  G.state.chapter = null; G.state.scene = null;
  saveState();
  await transition(() => openHub({ autoStart: false }));
}

// ---------- trainer card ----------
export function renderCard() {
  const s = G.state;
  renderSprite($("cardJess"), "jess", 5);
  renderSprite($("cardPartner"), "gidget", 4);
  const rows = (G.story.card || []).filter((r) => test(r.if)).map((r) => [r.label, fmt(r.value)]);
  rows.unshift(["TRAINER", s.name || "?"], ["PARTNER", CONFIG.PARTNER]);
  if (s.statuses.length) rows.push(["STATUS", s.statuses.map((x) => G.story.statuses?.[x]?.name || x).join(", ")]);
  $("cardList").innerHTML = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
  const bw = $("cardBadges"); bw.innerHTML = "";
  for (const [id, b] of Object.entries(G.story.badges)) {
    if (!G.state.badges[id]) continue;
    const cv = document.createElement("canvas"); cv.className = "pix"; renderBadge(cv, b.icon, 32); bw.appendChild(cv);
  }
  return rows;
}
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

export function showCard({ share = false } = {}) {
  return new Promise((resolve) => {
    const rows = renderCard();
    $("cardMsg").textContent = "";
    $("cardShare").classList.toggle("hidden", !share && !G.state.done.includes("prologue"));
    $("cardShare").onclick = async () => {
      const text = `${G.story.meta?.shareTitle || "TRAINER CARD"}\n` + rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nRestore link: ${restoreLink()}`;
      try {
        if (navigator.share) { await navigator.share({ text }); $("cardMsg").textContent = "SENT!"; return; }
      } catch (e) { if (e.name === "AbortError") return; }
      try { await navigator.clipboard.writeText(text); $("cardMsg").textContent = "COPIED! PASTE IT IN A TEXT. OR TAKE A SCREENSHOT."; }
      catch { $("cardMsg").textContent = "TAKE A SCREENSHOT AND SEND IT!"; }
    };
    $("cardDone").onclick = () => { sfx("move"); resolve(); };
    show("card");
  }).then(() => show("play"));
}

// ---------- letter ----------
function runLetter(s) {
  return new Promise(async (resolve) => {
    $("letterTitle").textContent = fmt(s.title || "");
    const body = $("letterBody"); body.innerHTML = "";
    const done = $("letterDone"); done.classList.add("hidden");
    const paras = (s.paragraphs || String(s.text || "").split(/\n\s*\n/)).map(fmt);
    const els = paras.map((p) => { const el = document.createElement("p"); el.textContent = p; body.appendChild(el); return el; });
    show("letter"); $("letter").scrollTop = 0;
    let fast = false;
    $("letter").onclick = () => (fast = true);
    for (const el of els) {
      el.classList.add("on");
      el.scrollIntoView({ behavior: "smooth", block: "end" });
      await sleep(fast ? 150 : (s.msPerParagraph || 2600));
    }
    $("letter").onclick = null;
    done.classList.remove("hidden");
    done.onclick = () => { sfx("move"); show("play"); resolve(); };
  });
}

// ---------- photos ----------
async function runPhotos(s) {
  show("photos");
  for (const p of s.photos || []) {
    $("photoImg").src = p.src;
    $("photoCaption").textContent = fmt(p.caption || "");
    await new Promise((r) => { $("photos").onclick = () => { sfx("move"); r(); }; });
  }
  $("photos").onclick = null;
}

// ---------- credits ----------
export async function runCredits(s) {
  show("credits");
  const roll = $("creditsRoll");
  roll.innerHTML = (s.lines || []).map((l) => (l.startsWith("#") ? `<div class="big">${esc(fmt(l.slice(1).trim()))}</div>` : `<div>${esc(fmt(l)) || "&nbsp;"}</div>`)).join("");
  sfx("victory");
  const H = $("credits").clientHeight;
  roll.style.transform = `translateY(${H}px)`;
  const total = roll.scrollHeight + H;
  const speed = s.speed || 30; // px per second
  let y = H, last = performance.now(), fast = false;
  $("credits").onclick = () => (fast = true);
  await new Promise((resolve) => {
    const step = (t) => {
      const dt = (t - last) / 1000; last = t;
      y -= dt * speed * (fast ? 6 : 1);
      roll.style.transform = `translateY(${y}px)`;
      if (y < H - total) return resolve();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  $("credits").onclick = null;
  show("play");
}

// ---------- menu / hub buttons ----------
export function initMenus() {
  const back = () => { const from = G.caseReturn || "play"; show(from); };
  document.querySelector("#case .back").onclick = () => { sfx("move"); back(); };
  $("hubCase").onclick = () => { renderCase(); G.caseReturn = "hub"; show("case"); };
  $("hubCard").onclick = async () => { await showCard(); openHub({ autoStart: false }); };
  $("hubScan").onclick = async () => { const id = await scan(); if (!id) openHub({ autoStart: false }); else { G.justUnlocked = id; openHub(); } };
  $("hubWord").onclick = async () => { const id = await promptWord(); if (id) { G.justUnlocked = id; openHub(); } };

  $("btnMenu").onclick = () => { sfx("move"); $("menu").classList.add("on"); };
  $("menu").onclick = async (e) => {
    const m = e.target.dataset?.m;
    if (!m) return;
    sfx("move");
    $("menu").classList.remove("on");
    if (m === "case") { renderCase(); G.caseReturn = "play"; show("case"); }
    if (m === "card") await showCard();
    if (m === "bag") {
      const items = G.state.items.map((i) => G.story.items?.[i]?.name || i);
      await popup({ title: "BAG", text: items.length ? items.join("\n") : "Nothing here yet.", icon: { sprite: "item" } });
    }
    if (m === "scan") { const id = await scan(); show("play"); if (id) popup({ title: "NICE!", text: "Finish this chapter to use it." }); }
    if (m === "save") {
      await popup({ title: "SAVE CODE", text: "If your save ever disappears, open this link to get it back.", textarea: restoreLink(), buttons: ["DONE"] });
    }
  };
}
