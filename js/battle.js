// Turn-based trivia battle. The player cannot lose.
import { G, $, sleep, fmt, saveState } from "./core.js";
import { stage, say, setSpeaker, choose, flash, shake } from "./ui.js";
import { drawGrid, gridSize, SPRITES } from "./art.js";
import { sfx } from "./audio.js";
import { awardBadgeAnim } from "./badges.js";
import { CONFIG } from "../config.js";

function setHp(el, name, hp, max, showNum) {
  el.classList.remove("hidden");
  el.querySelector(".hpname").textContent = fmt(name);
  const pct = Math.max(0, Math.round((hp / max) * 100));
  const bar = el.querySelector(".bar i");
  bar.style.width = pct + "%";
  bar.classList.toggle("mid", pct > 20 && pct <= 50);
  bar.classList.toggle("low", pct <= 20);
  const num = el.querySelector(".hpnum");
  if (num && showNum) num.textContent = `${Math.max(1, Math.ceil(hp))}/${max}`;
}

// Gidget never gets hurt or faints (CR-010): a wrong answer distracts her, low HP makes her nap.
const DEFAULT_DISTRACTED = [
  "{partner} got distracted by a bug!",
  "{partner} started grooming mid-battle.",
  "{partner} is staring at absolutely nothing.",
];
const DEFAULT_NAP = ["{partner} curled up for a nap..."];
const DEFAULT_WAKE = ["{partner} woke up and stretched! Ready to go!"];
const pool = (lines, dflt) => (Array.isArray(lines) && lines.length ? lines : dflt);

export async function runBattle(def) {
  const max = def.hp || 100;
  let me = max, foe = max, revived = false;
  const qs = def.questions || [];
  const perHit = Math.ceil(max / Math.max(1, qs.length));
  const dmg = def.damage || 30;
  let foeHurt = 0, meHurt = 0;
  let allyHop = 0; // CR-027: start time of a teammate (LEON) move; Jess hops twice on the player side
  let cat = "idle"; // Gidget's mood: "idle" | "distracted" (turns away, hops) | "nap" (asleep, zzz)

  stage.bg = def.bg || "battle";
  stage.sprites = [];
  stage.custom = (ctx, t) => {
    const W = stage.W, H = stage.H;
    const foeG = SPRITES[def.foeSprite || "leon"];
    const fg = gridSize(foeG);
    const fx = Math.round(W * 0.73 - fg.w), fy = Math.round(H * 0.34 - fg.h * 2 + 4);
    if (!(foeHurt && ((t / 80) | 0) % 2)) drawGrid(ctx, foeG, fx, fy, 2);
    const floor = Math.round(H * 0.84 + 4); // player platform line; sprites stand on it whatever their height
    if (allyHop && !allyHop.t0) allyHop.t0 = t;
    const ht = allyHop ? t - allyHop.t0 : 0;
    const hop = allyHop && ht < 360 ? Math.round(Math.abs(Math.sin((ht / 360) * Math.PI * 2)) * 5) : 0;
    const jx = Math.round(W * 0.08), jy = floor - gridSize(SPRITES.jess).h * 2 - hop;
    // Only Jess blinks on a hit; Gidget is never shown as hurt.
    if (!(meHurt && ((t / 80) | 0) % 2)) drawGrid(ctx, SPRITES.jess, jx, jy, 2, true);
    const gidG = SPRITES.gidget, napG = SPRITES.gidget_sleep || gidG;
    const g = cat === "nap" ? napG : gidG;
    const gx = jx + 32, gy = floor - gridSize(g).h * 2; // bottom-aligned
    if (cat === "nap") {
      drawGrid(ctx, g, gx, gy, 2, true);
      ctx.fillStyle = "#303838"; ctx.font = "8px PressStart";
      ctx.fillText("z".repeat(1 + (((t / 500) | 0) % 3)), gx + gridSize(g).w * 2 - 4, gy - 2);
    } else if (cat === "distracted") {
      const hop = Math.round(Math.abs(Math.sin(t / 110)) * 4);
      drawGrid(ctx, g, gx, gy - hop, 2, false); // turned away from the foe
    } else {
      const gb = Math.round(Math.abs(Math.sin(t / 260)) * 2);
      drawGrid(ctx, g, gx, gy - gb, 2, true);
    }
  };
  const hpFoe = $("hpFoe"), hpMe = $("hpMe");
  const meName = `{name} & ${CONFIG.PARTNER}`;
  setHp(hpFoe, def.foe, foe, max); setHp(hpMe, meName, me, max, true);

  sfx("battle"); await flash();
  setSpeaker(null);
  for (const l of def.intro || []) await say(l);

  for (const q of qs) {
    // CR-021/CR-027: LEON's move before the question. LEON is on Jess's team, so it is a teammate's
    // move: after the first box, the hit sound plays and Jess hops on the player side. The foe never
    // moves and nobody blinks (no damage).
    const lm = typeof q.leonMove === "string" ? [q.leonMove] : Array.isArray(q.leonMove) ? q.leonMove : [];
    for (const [i, l] of lm.entries()) {
      if (typeof l !== "string" || !l) continue;
      await say(l);
      if (i === 0) { sfx("hit"); allyHop = {}; await sleep(380); allyHop = 0; await sleep(120); }
    }
    const pick = await choose(q.options, { prompt: q.q, cls: "q" });
    if (pick === q.answer) {
      await say(`${CONFIG.PARTNER} used ${q.move || "TACKLE"}!`);
      sfx("super"); foeHurt = 1; await shake(); foeHurt = 0;
      foe = Math.max(0, foe - perHit); setHp(hpFoe, def.foe, foe, max);
      await sleep(400);
      await say(q.hitText || "It's super effective!");
    } else {
      const mv = (def.foeMoves || [{ name: "TACKLE", text: "" }])[Math.floor(Math.random() * (def.foeMoves || [1]).length)];
      await say(`${def.foe} used ${mv.name}!`);
      sfx("hit"); meHurt = 1; await shake(); meHurt = 0;
      me = Math.max(1, me - dmg); setHp(hpMe, meName, me, max, true);
      await sleep(400);
      if (mv.text) await say(mv.text);
      const dl = pool(def.distracted, DEFAULT_DISTRACTED);
      cat = "distracted";
      await say(dl[Math.floor(Math.random() * dl.length)]);
      cat = "idle";
      if (q.missText) await say(q.missText);
      // "Out of HP": Gidget naps, the revive lines play, she wakes up and HP refills. Once per battle.
      if (!revived && me <= dmg) {
        revived = true;
        cat = "nap";
        for (const l of pool(def.nap, DEFAULT_NAP)) await say(l);
        sfx("revive");
        for (const l of def.revive || []) await say(l);
        cat = "idle";
        me = max; setHp(hpMe, meName, me, max, true);
        for (const l of pool(def.wake, DEFAULT_WAKE)) await say(l);
      }
    }
  }
  // Always finish the foe off.
  if (foe > 0) {
    for (const [i, l] of (def.finisher || [`${CONFIG.PARTNER} used HUG!`, "It's super effective!"]).entries()) {
      if (i === 0) { await say(l); sfx("super"); foeHurt = 1; await shake(); foeHurt = 0; foe = 0; setHp(hpFoe, def.foe, 0, max); await sleep(500); }
      else await say(l);
    }
  }
  stage.custom = null;
  hpFoe.classList.add("hidden"); hpMe.classList.add("hidden");
  sfx("victory");
  for (const l of def.win || []) await say(l);
  if (def.award) await awardBadgeAnim(def.award);
  saveState();
}
