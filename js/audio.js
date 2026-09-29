// Synthesized retro sound effects (Web Audio). No audio files.
import { getPref, setPref } from "./core.js";

let ctx = null;
let master = null;
let muted = getPref("muted", false);

export function isMuted() { return muted; }
export function setMuted(m) { muted = m; setPref("muted", m); if (master) master.gain.value = m ? 0 : 0.18; }

// iOS only allows audio after a user gesture: call this from the first tap.
export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.18;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    // play a silent buffer to fully unlock on older iOS
    const b = ctx.createBuffer(1, 1, 22050); const s = ctx.createBufferSource(); s.buffer = b; s.connect(master); s.start(0);
  } catch {}
}

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz

function tone(freq, start, dur, type = "square", vol = 1, slideTo = null) {
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  o.connect(g); g.connect(master); o.start(start); o.stop(start + dur + 0.02);
}
function noise(start, dur, vol = 0.6) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(); const g = ctx.createGain();
  s.buffer = buf; g.gain.setValueAtTime(vol, start); g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  s.connect(g); g.connect(master); s.start(start);
}
// seq: [[midi, beats], ...] (midi 0 = rest)
function seq(notes, bpm = 180, type = "square", vol = 0.8) {
  const beat = 60 / bpm; let t = ctx.currentTime + 0.02;
  for (const [n, b] of notes) { if (n) tone(NOTE(n), t, beat * b * 0.95, type, vol); t += beat * b; }
  return t - ctx.currentTime;
}

const SFX = {
  blip: () => tone(NOTE(84), ctx.currentTime, 0.03, "square", 0.25),
  move: () => tone(NOTE(76), ctx.currentTime, 0.05, "square", 0.5),
  select: () => { tone(NOTE(79), ctx.currentTime, 0.06); tone(NOTE(86), ctx.currentTime + 0.06, 0.08); },
  fail: () => tone(NOTE(55), ctx.currentTime, 0.3, "square", 0.6, NOTE(43)),
  badge: () => seq([[72, .5], [76, .5], [79, .5], [84, 1], [0, .25], [79, .5], [84, 2]], 200),
  item: () => seq([[76, .5], [79, .5], [84, .5], [88, 1.5]], 220),
  encounter: () => { seq([[60, .25], [61, .25], [60, .25], [61, .25], [64, .25], [65, .25], [64, .25], [65, .25], [67, 1]], 360, "sawtooth", 0.6); },
  battle: () => { noise(ctx.currentTime, 0.4, 0.4); seq([[55, .25], [58, .25], [62, .25], [67, .25], [70, 1]], 300, "square", 0.7); },
  hit: () => { noise(ctx.currentTime, 0.18, 0.8); tone(NOTE(48), ctx.currentTime, 0.18, "square", 0.6, NOTE(36)); },
  super: () => { noise(ctx.currentTime, 0.25, 0.9); seq([[84, .25], [91, .25], [96, .5]], 300); },
  revive: () => seq([[67, .5], [72, .5], [76, .5], [79, .5], [84, .5], [88, .5], [91, 2]], 240, "triangle", 0.9),
  victory: () => seq([[67, .5], [67, .5], [67, .5], [72, 1.5], [0, .5], [76, .5], [74, .5], [72, .5], [76, .5], [79, 3]], 200),
  achievement: () => seq([[79, .25], [84, .25], [88, .25], [91, 1]], 260, "triangle", 0.9),
  status: () => seq([[64, .5], [63, .5], [62, .5], [61, 1]], 220, "square", 0.6),
  unlock: () => seq([[60, .25], [64, .25], [67, .25], [72, 1]], 260),
};

export function sfx(name) {
  if (!ctx || muted) return;
  try { if (ctx.state === "suspended") ctx.resume(); (SFX[name] || (() => {}))(); } catch {}
}
export const SFX_NAMES = Object.keys(SFX);
