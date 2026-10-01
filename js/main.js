// Boot: load story + save, wire title screen, handle #b= / #r= links, register the service worker.
import { G, $, loadState, saveState, hasSave, resetState, importCode, debugUpdate } from "./core.js";
import { CONFIG } from "../config.js";
import { show, initTap, popup, transition } from "./ui.js";
import { unlockAudio, isMuted, setMuted, sfx } from "./audio.js";
import { tryUnlock, tokenFrom } from "./badges.js";
import { resume, startChapter, initMenus } from "./scenes.js";
import { initAdmin } from "./admin.js";
import { renderSprite } from "./art.js";

async function boot() {
  try {
    const res = await fetch("story/story.json", { cache: "no-cache" });
    G.story = await res.json();
  } catch (e) {
    document.body.textContent = "Couldn't load the story. Check your connection and reload.";
    return;
  }
  loadState();
  initTap(); initMenus(); initAdmin();
  $("versionText").textContent = "v" + CONFIG.VERSION;
  // Gidget is the prologue's reveal (CR-050): show the canele until she has joined the team.
  const metGidget = G.state.flags.gidgetJoined === "yes" || G.state.done.includes("prologue");
  if (metGidget) renderSprite($("titleArt"), "gidget", 8);
  else renderSprite($("titleArt"), "canele", 12);
  $("titleArt").style.animation = "none";
  refreshMute();

  // First tap anywhere unlocks audio (iOS requirement).
  const unlock = () => { unlockAudio(); window.removeEventListener("pointerdown", unlock); };
  window.addEventListener("pointerdown", unlock);

  $("btnMute").onclick = $("btnMuteTitle").onclick = () => { setMuted(!isMuted()); refreshMute(); sfx("move"); };

  $("btnContinue").classList.toggle("hidden", !hasSave());
  $("btnContinue").onclick = () => { sfx("select"); resume(); };
  $("btnNew").onclick = async () => {
    if (hasSave()) {
      const r = await popup({ title: "NEW GAME", text: "Start over? Your current save will be erased.", buttons: ["START OVER", "CANCEL"] });
      if (r !== 0) return;
    }
    sfx("select");
    resetState(); saveState();
    startChapter(G.story.chapters[0]);
  };

  show("title");
  await handleHash();
  debugUpdate();
}

function refreshMute() {
  $("btnMute").classList.toggle("muted", isMuted());
  $("btnMuteTitle").textContent = "SOUND: " + (isMuted() ? "OFF" : "ON");
}

// #b=<token>  -> unlock a badge (from the iPhone Camera app)
// #r=<code>   -> restore a save
async function handleHash() {
  const h = location.hash;
  if (!h || h.length < 3) return;
  history.replaceState(null, "", location.pathname + location.search);
  if (h.startsWith("#b=")) {
    const id = await tryUnlock(tokenFrom(h));
    if (id) { $("btnContinue").classList.remove("hidden"); resume(); }
  } else if (h.startsWith("#r=")) {
    try {
      const st = importCode(h.slice(3));
      const r = await popup({ title: "RESTORE SAVE", text: `Load the save for ${st.name || "this trainer"}?`, buttons: ["LOAD", "CANCEL"] });
      if (r === 0) { G.state = st; saveState(); $("btnContinue").classList.remove("hidden"); resume(); }
    } catch { await popup({ title: "HMM...", text: "That restore link didn't work." }); }
  }
}

window.addEventListener("hashchange", handleHash);

// No offline cache in playtest mode (?fast=1), so tests always run the current files.
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost") && !new URLSearchParams(location.search).has("fast")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

boot();
