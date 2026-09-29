// Hidden admin panel: tap the title N times, then enter the PIN from config.js.
import { G, $, saveState, resetState, exportCode, importCode, debugUpdate, restoreLink } from "./core.js";
import { CONFIG } from "../config.js";
import { popup, show } from "./ui.js";
import { grantKey } from "./badges.js";
import { startChapter, runFrom, openHub, chapterOf } from "./scenes.js";
import { sfx, SFX_NAMES } from "./audio.js";
import { transition } from "./ui.js";

let taps = 0, tapTimer = null;

export function initAdmin() {
  $("titleText").addEventListener("click", async () => {
    taps++;
    clearTimeout(tapTimer); tapTimer = setTimeout(() => (taps = 0), 2500);
    if (taps < CONFIG.ADMIN_TAPS) return;
    taps = 0;
    const r = await popup({ title: "ADMIN", text: "PIN?", input: { placeholder: "PIN" }, buttons: ["OK", "CANCEL"] });
    if (r.button === 0 && r.value === CONFIG.ADMIN_PIN) openAdmin();
    else if (r.button === 0) sfx("fail");
  });
}

function btn(label, fn) { const b = document.createElement("button"); b.className = "btn"; b.textContent = label; b.onclick = fn; return b; }
function h3(t) { const h = document.createElement("h3"); h.textContent = t; return h; }
function row(...els) { const d = document.createElement("div"); d.className = "row"; els.forEach((e) => d.appendChild(e)); return d; }
function select(opts) { const s = document.createElement("select"); opts.forEach(([v, l]) => { const o = document.createElement("option"); o.value = v; o.textContent = l; s.appendChild(o); }); return s; }

function close() { $("admin").classList.remove("on"); }

export function openAdmin() {
  const p = $("adminPanel"); p.innerHTML = "";
  const st = G.state;

  p.appendChild(h3(`ADMIN · v${CONFIG.VERSION} · ${st.name || "(no name)"}`));
  p.appendChild(row(btn("CLOSE", close), btn(G.debug ? "DEBUG: ON" : "DEBUG: OFF", () => { G.debug = !G.debug; debugUpdate(); openAdmin(); })));

  // chapters
  p.appendChild(h3("JUMP TO CHAPTER"));
  const chSel = select(G.story.chapters.map((c) => [c.id, `${c.id} — ${c.title}${st.done.includes(c.id) ? " ✓" : ""}`]));
  p.appendChild(chSel);
  p.appendChild(row(
    btn("PLAY CHAPTER", () => { close(); const ch = chapterOf(chSel.value); st.done = st.done.filter((d) => d !== ch.id); startChapter(ch); }),
    btn("MARK DONE", () => { if (!st.done.includes(chSel.value)) st.done.push(chSel.value); st.chapter = null; st.scene = null; saveState(); openAdmin(); }),
    btn("UN-DONE", () => { st.done = st.done.filter((d) => d !== chSel.value); saveState(); openAdmin(); }),
    btn("GO TO HUB", () => { close(); st.chapter = null; st.scene = null; saveState(); transition(() => openHub({ autoStart: false })); }),
  ));

  // scenes
  p.appendChild(h3("JUMP TO SCENE"));
  const scSel = select(Object.keys(G.story.scenes).map((id) => [id, id]));
  if (st.scene) scSel.value = st.scene;
  p.appendChild(scSel);
  p.appendChild(row(btn("PLAY SCENE", () => {
    close();
    const ch = G.story.chapters.find((c) => scSel.value.startsWith(c.prefix || c.id)) || G.story.chapters[0];
    st.chapter = ch.id; saveState();
    transition(() => show("play")).then(() => runFrom(scSel.value));
  })));

  // keys / badges
  p.appendChild(h3("BADGES / KEYS"));
  const kr = row();
  for (const [id, b] of Object.entries(G.story.badges)) {
    const has = !!st.keys[id];
    kr.appendChild(btn(`${has ? "✓" : "·"} ${b.name}`, async () => {
      if (has) { delete st.keys[id]; delete st.badges[id]; saveState(); openAdmin(); }
      else { close(); await grantKey(id); openAdmin(); $("admin").classList.add("on"); }
    }));
  }
  p.appendChild(kr);

  // flags
  p.appendChild(h3("FLAGS (JSON)"));
  const fl = document.createElement("textarea"); fl.value = JSON.stringify(st.flags, null, 1);
  p.appendChild(fl);
  const nm = document.createElement("input"); nm.value = st.name; nm.placeholder = "trainer name";
  p.appendChild(nm);
  p.appendChild(row(btn("SAVE FLAGS + NAME", () => {
    try { st.flags = JSON.parse(fl.value); st.name = nm.value.toUpperCase(); saveState(); sfx("select"); openAdmin(); }
    catch { popup({ title: "BAD JSON", text: "Check the flags text." }); }
  })));

  // save
  p.appendChild(h3("SAVE"));
  const code = document.createElement("textarea"); code.value = exportCode();
  p.appendChild(code);
  p.appendChild(row(
    btn("COPY RESTORE LINK", () => navigator.clipboard?.writeText(restoreLink())),
    btn("IMPORT CODE ABOVE", () => { try { G.state = importCode(code.value.replace(/^.*#r=/, "")); saveState(); openAdmin(); } catch { popup({ title: "BAD CODE", text: "Couldn't read that code." }); } }),
    btn("RESET SAVE", async () => { const r = await popup({ title: "RESET", text: "Erase everything?", buttons: ["ERASE", "CANCEL"] }); if (r === 0) { resetState(); location.reload(); } }),
  ));

  // sound test
  p.appendChild(h3("SOUND TEST"));
  const sr = row(); SFX_NAMES.forEach((n) => sr.appendChild(btn(n, () => sfx(n)))); p.appendChild(sr);

  $("admin").classList.add("on");
}
