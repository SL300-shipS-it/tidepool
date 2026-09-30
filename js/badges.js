// Unlock keys: token hashing, the three unlock paths, badge case, camera scanner.
import { G, $, emit, saveState, test, sleep } from "./core.js";
import { popup, show } from "./ui.js";
import { renderBadge, BADGE_ICONS } from "./art.js";
import { sfx } from "./audio.js";

const SALT = "tidepool:";

export async function sha256(text) {
  if (!crypto?.subtle) throw new Error("Needs HTTPS (or localhost) for crypto.subtle");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, "");

// Returns the key id matching a scanned token or a typed backup word, or null.
export async function matchSecret(secret) {
  const h = await sha256(SALT + norm(secret));
  for (const [id, b] of Object.entries(G.story.badges)) {
    if (b.hash === h || b.wordHash === h) return id;
  }
  return null;
}

// Pulls a token out of a scanned string (full URL with #b=, or the raw token).
export function tokenFrom(text) {
  const m = String(text).match(/[#&?]b=([A-Za-z0-9_-]+)/);
  return m ? m[1] : String(text).trim();
}

export function badgeVisible(id) {
  const b = G.story.badges[id];
  return !b.if || test(b.if);
}

// Grants a key. Plays the badge animation unless the key reveals its badge later (e.g. after a battle).
export async function grantKey(id, { quiet = false } = {}) {
  const b = G.story.badges[id];
  if (!b) return;
  const already = !!G.state.keys[id];
  G.state.keys[id] = G.state.keys[id] || Date.now();
  if (b.revealOn !== "battle") G.state.badges[id] = G.state.badges[id] || Date.now();
  saveState();
  if (quiet) return;
  if (already) { await popup({ title: "BADGE CASE", text: `You already have the ${b.name}!`, icon: { badge: b.icon } }); return; }
  if (b.revealOn === "battle") {
    await popup({ title: b.name.toUpperCase(), text: b.scanText || "A challenger approaches...", icon: { badge: b.icon }, sound: "battle" });
  } else {
    await awardBadgeAnim(id);
  }
  // Scanned out of order: keep it, explain it opens later.
  const next = G.story.chapters.find((c) => !G.state.done.includes(c.id) && test(c.if));
  const mine = G.story.chapters.find((c) => c.key === id);
  if (next && mine && next.id !== mine.id && !G.state.done.includes(mine.id)) {
    // Never name the future chapter (CR-015). The badge itself is fine: she has earned it.
    await popup({ title: "SAVED FOR LATER", text: `Keep the ${b.name} safe. It's for later. Finish the current route first!` });
  }
  emit("keys-changed", id);
}

export async function awardBadgeAnim(id) {
  const b = G.story.badges[id];
  G.state.badges[id] = G.state.badges[id] || Date.now();
  saveState();
  const kind = b.kind === "key" ? "obtained" : "earned";
  await popup({ title: b.kind === "key" ? "KEY ITEM!" : "NEW BADGE!", text: `{name} ${kind} the ${b.name}!`, icon: { badge: b.icon }, sound: "badge", spin: true });
}

// ---------- unlock paths ----------
export async function tryUnlock(secret) {
  let id = null;
  try { id = await matchSecret(secret); } catch (e) { await popup({ title: "ERROR", text: String(e.message) }); return null; }
  if (!id) { sfx("fail"); await popup({ title: "HMM...", text: "That doesn't match any badge." }); return null; }
  await grantKey(id);
  return id;
}

export async function promptWord() {
  const r = await popup({ title: "CODE WORD", text: "Type the word printed on the back of the badge.", input: { placeholder: "code word" }, buttons: ["ENTER", "CANCEL"] });
  if (r.button !== 0 || !r.value.trim()) return null;
  return tryUnlock(r.value);
}

// ---------- badge case ----------
// Locked slots reveal nothing (CR-015): one shared "locked" icon, "???", no hint text. Earned slots
// show the badge. Badges hidden by `if` (e.g. Bloom when sunflowers = no) have no slot at all.
export function renderLockedIcon(cv, size = 64) {
  if (BADGE_ICONS.locked) { renderBadge(cv, "locked", size); return; }
  // Fallback until the art has a locked icon: an empty gray medallion.
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  const s = size / 32;
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const d = Math.hypot(x - 15.5, y - 15.5);
    if (d <= 14) { ctx.fillStyle = d > 12.5 ? "#606868" : "#a8b0b0"; ctx.fillRect(x * s, y * s, s, s); }
  }
}

export function renderCase() {
  const grid = $("caseGrid"); grid.innerHTML = "";
  for (const [id, b] of Object.entries(G.story.badges)) {
    if (!badgeVisible(id)) continue;
    const got = !!G.state.badges[id];
    const slot = document.createElement("div");
    slot.className = "slot" + (got ? "" : " locked");
    const cv = document.createElement("canvas"); cv.className = "pix";
    if (got) renderBadge(cv, b.icon, 64); else renderLockedIcon(cv, 64);
    slot.appendChild(cv);
    slot.appendChild(document.createTextNode(got ? b.name : "???"));
    grid.appendChild(slot);
  }
  const hint = $("caseHint"); if (hint) hint.textContent = "";
}

// ---------- camera scanner ----------
let stream = null, scanning = false;

export async function scan() {
  // resolves with key id or null
  show("scanner");
  $("scanMsg").textContent = "POINT THE CAMERA AT THE BADGE";
  const video = $("cam");
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
  } catch (e) {
    $("scanMsg").textContent = "CAMERA UNAVAILABLE. USE THE CODE WORD INSTEAD.";
    await waitCancel();
    return null;
  }
  video.srcObject = stream;
  video.setAttribute("playsinline", ""); video.muted = true;
  try { await video.play(); } catch {}
  scanning = true;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const found = await new Promise((resolve) => {
    $("scanCancel").onclick = () => resolve(null);
    const tick = () => {
      if (!scanning) return;
      if (video.readyState >= 2 && video.videoWidth) {
        const w = 480, h = Math.round((video.videoHeight / video.videoWidth) * 480);
        canvas.width = w; canvas.height = h;
        ctx.drawImage(video, 0, 0, w, h);
        const img = ctx.getImageData(0, 0, w, h);
        const code = window.jsQR && window.jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
        if (code && code.data) { resolve(code.data); return; }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  stopCam();
  if (!found) return null;
  sfx("select");
  return tryUnlock(tokenFrom(found));
}
function waitCancel() { return new Promise((r) => ($("scanCancel").onclick = () => { stopCam(); r(); })); }
export function stopCam() {
  scanning = false;
  if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
  $("cam").srcObject = null;
}
