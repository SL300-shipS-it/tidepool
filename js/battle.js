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
  bar.classList.toggle("low", pct <= 25);
  const num = el.querySelector(".hpnum");
  if (num && showNum) num.textContent = `${Math.max(1, Math.ceil(hp))}/${max}`;
}

export async function runBattle(def) {
  const max = def.hp || 100;
  let me = max, foe = max, revived = false;
  const qs = def.questions || [];
  const perHit = Math.ceil(max / Math.max(1, qs.length));
  const dmg = def.damage || 30;
  let foeHurt = 0, meHurt = 0;

  stage.bg = def.bg || "battle";
  stage.sprites = [];
  stage.custom = (ctx, t) => {
    const W = stage.W, H = stage.H;
    const foeG = SPRITES[def.foeSprite || "leon"];
    const fg = gridSize(foeG);
    const fx = Math.round(W * 0.73 - fg.w), fy = Math.round(H * 0.34 - fg.h * 2 + 4);
    if (!(foeHurt && ((t / 80) | 0) % 2)) drawGrid(ctx, foeG, fx, fy, 2);
    const jx = Math.round(W * 0.08), jy = Math.round(H * 0.84 - 32 + 4);
    if (!(meHurt && ((t / 80) | 0) % 2)) {
      drawGrid(ctx, SPRITES.jess, jx, jy, 2, true);
      const gb = Math.round(Math.abs(Math.sin(t / 260)) * 2);
      drawGrid(ctx, SPRITES.gidget, jx + 32, jy - gb, 2, true);
    }
  };
  const hpFoe = $("hpFoe"), hpMe = $("hpMe");
  const meName = `{name} & ${CONFIG.PARTNER}`;
  setHp(hpFoe, def.foe, foe, max); setHp(hpMe, meName, me, max, true);

  sfx("battle"); await flash();
  setSpeaker(null);
  for (const l of def.intro || []) await say(l);

  for (const q of qs) {
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
      if (q.missText) await say(q.missText);
      if (!revived && me <= dmg && def.revive) {
        revived = true;
        sfx("revive");
        for (const l of def.revive) await say(l);
        me = max; setHp(hpMe, meName, me, max, true);
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
