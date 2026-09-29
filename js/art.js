// Original pixel art, drawn in code. Grids use: "." transparent, a (lightest) b c d (darkest).
export const PAL = { a: "#9bbc0f", b: "#8bac0f", c: "#306230", d: "#0f380f" };

// ---------- sprites (16x16 unless noted) ----------
const GIDGET_TAIL = ["....", "....", "....", "....", "....", "....", ".dd.", "d..d", "...d", "...d", "..d.", "dd..", "....", "....", "....", "...."];
function withTail(rows) { return rows.map((r, i) => r + GIDGET_TAIL[i]); }

export const SPRITES = {
  gidget: withTail([
    "..d..........d..",
    ".dcd........dcd.",
    ".dbcddddddddcbd.",
    ".dccccccccccccd.",
    ".dccccccccccccd.",
    ".dccaaccccaaccd.",
    ".dccadccccadccd.",
    ".dcbcccddcccbcd.",
    ".dbdccdccdccdcd.",
    ".dbdccdccdccdcd.",
    ".dbdccdccdccdcd.",
    ".dbdccdccdccdcdd",
    ".dbdccdccdccdcd.",
    ".dddddddddddddd.",
    "...dd......dd...",
    "................",
  ]),
  gidget_sleep: withTail([
    "..d..........d..",
    ".dcd........dcd.",
    ".dbcddddddddcbd.",
    ".dccccccccccccd.",
    ".dccccccccccccd.",
    ".dccccccccccccd.",
    ".dccddccccddccd.",
    ".dcbcccddcccbcd.",
    ".dbdccdccdccdcd.",
    ".dbdccdccdccdcd.",
    ".dbdccdccdccdcd.",
    ".dbdccdccdccdcdd",
    ".dbdccdccdccdcd.",
    ".dddddddddddddd.",
    "...dd......dd...",
    "................",
  ]),
  jess: [
    "....dddddddd....",
    "...dddddddddd...",
    "..dddddddddddd..",
    "..ddaaaaaaaadd..",
    "..ddadaaaadadd..",
    "..ddaaaaaaaadd..",
    "..ddabaaaabadd..",
    "..ddaaaddaaadd..",
    "..dd..aaaa..dd..",
    "..d.cccccccc.d..",
    "..acccccccccca..",
    "...cccccccccc...",
    "....cccccccc....",
    "....dddddddd....",
    ".....dd..dd.....",
    ".....dd..dd.....",
  ],
  leon: [
    "................",
    "....dddddddd....",
    "...dddddddddd...",
    "...daaaaaaaad...",
    "...aaaaaaaaaa...",
    "...aadaaaadaa...",
    "...aaaaaaaaaa...",
    "...aaaaddaaaa...",
    "....aaaaaaaa....",
    "...dddddddddd...",
    "..adddddddddda..",
    "..adddddddddda..",
    "...dddddddddd...",
    "...cccc..cccc...",
    "...ccc....ccc...",
    "...dddd..dddd...",
  ],
  leon_lips: [
    "................",
    "....dddddddd....",
    "...dddddddddd...",
    "...daaaaaaaad...",
    "...aaaaaaaaaa...",
    "...aadaaaadaa...",
    "...aaaaaaaaaa...",
    "..acccccccccca..",
    "...acccddccca...",
    "...dddddddddd...",
    "..adddddddddda..",
    "..adddddddddda..",
    "...dddddddddd...",
    "...cccc..cccc...",
    "...ccc....ccc...",
    "...dddd..dddd...",
  ],
  // 24x8: Leon asleep, lying across a doorway
  leon_asleep: [
    "..dddd..................",
    ".ddaaaa.................",
    ".daddaa.dddddddddddcccc.",
    ".daaaaaddddddddddddcccc.",
    "..aaaa.ddddddddddddcccc.",
    "........a.........a.dd.d",
    "........................",
    "........................",
  ],
  lactaid: [
    "................",
    "................",
    "...dddddddddd...",
    "...daaaaaaaad...",
    "...daaaaaaaad...",
    "...daaaaaaaad...",
    "...dadaaaaaad...",
    "...dadaaaaaad...",
    "...dadddaaaad...",
    "...daaaaaaaad...",
    "...dbbbbbbbbd...",
    "...dbabbabbad...",
    "...dbbbbbbbbd...",
    "...dddddddddd...",
    "................",
    "................",
  ],
  tennis: [
    "................",
    "......dddd......",
    ".....dbbbbd.....",
    "....dbabbbbd....",
    "....dbbbabbd....",
    ".....dddddd.....",
    "......dddd......",
    ".....dbbbbd.....",
    "....dbabbbbd....",
    "....dbbbabbd....",
    ".....dddddd.....",
    "......dddd......",
    ".....dbbbbd.....",
    "....dbabbbbd....",
    "....dbbbabbd....",
    ".....dddddd.....",
  ],
  npc: [
    "................",
    ".....dddddd.....",
    "....dddddddd....",
    "...dddddddddd...",
    "....aaaaaaaa....",
    "....adaaaada....",
    "....aaaaaaaa....",
    "....aaaddaaa....",
    ".....aaaaaa.....",
    "...cccccccccc...",
    "..acccccccccca..",
    "..acccccccccca..",
    "...cccccccccc...",
    "...dddd..dddd...",
    "...ddd....ddd...",
    "...dddd..dddd...",
  ],
  trophy: [
    "................",
    "..dddddddddddd..",
    ".ddcbbbbbbbbcdd.",
    "d.dcbabbbbbbcd.d",
    "d.dcbabbbbbbcd.d",
    ".ddcbbbbbbbbcdd.",
    "...dcbbbbbbcd...",
    "....dcbbbbcd....",
    ".....dcccd......",
    "......dcd.......",
    "......dcd.......",
    ".....dcccd......",
    "....dddddddd....",
    "....dccccccd....",
    "....dddddddd....",
    "................",
  ],
  item: [
    "................",
    "......dddd......",
    ".....dccccd.....",
    "....dddddddd....",
    "...dbbbbbbbbd...",
    "..dbbbbbbbbbbd..",
    "..dbbbbddbbbbd..",
    "..ddddddaadddd..",
    "..dccccdaadcccd.",
    "..dcccccddccccd.",
    "..dccccccccccd..",
    "..dccccccccccd..",
    "...dddddddddd...",
    "................",
    "................",
    "................",
  ],
  status: [
    "................",
    ".......dd.......",
    "......dccd......",
    "......dccd......",
    ".....dccccd.....",
    ".....dcddcd.....",
    "....dccddccd....",
    "....dccddccd....",
    "...dcccddcccd...",
    "...dcccccccccd..",
    "..dccccddccccd..",
    "..dccccddccccd..",
    ".dccccccccccccd.",
    ".dddddddddddddd.",
    "................",
    "................",
  ],
};

// ---------- badge icons (16x16, drawn on a round badge) ----------
export const BADGE_ICONS = {
  glamour: [
    "..............d.",
    ".............ddd",
    "..............d.",
    "...dddddddd.....",
    "..dbadbadbad....",
    ".dbbbdbbbdbbbd..",
    "ddddddddddddddd.",
    ".dbbbbdbbbbbd...",
    "..dbbbdbbbbd....",
    "...dbbdbbbd.....",
    "....dbdbbd......",
    ".....dbd........",
    "......d.........",
    "................",
    "................",
    "................",
  ],
  snooze: [
    "................",
    ".ddddddd........",
    "......dd........",
    ".....dd.........",
    "....dd....dddd..",
    "...dd.......d...",
    "..dd.......d....",
    ".ddddddd..dddd..",
    "................",
    "..........ddd...",
    "...........d....",
    "..........ddd...",
    "................",
    "................",
    "................",
    "................",
  ],
  bloom: [
    "................",
    "....c.ccc.c.....",
    ".....ccccc......",
    "...ccdddddcc....",
    "....cdbdbdc.....",
    "...ccdbdbdcc....",
    "....cdddddc.....",
    ".....ccccc......",
    "....c.ccc.c.....",
    ".......d........",
    ".......d.cc.....",
    "....cc.d.c......",
    ".....c.d........",
    ".......d........",
    ".......d........",
    "................",
  ],
  tide: [
    "................",
    "................",
    ".......dddd.....",
    ".....ddccccd....",
    "....dccddccd....",
    "...dccd..dcd....",
    "..dccd....d.....",
    ".dccd...........",
    "dccd.......dd...",
    "dccd.....dccd...",
    "dcccd..dcccccd..",
    "dccccddccccccccd",
    "dddddddddddddddd",
    "................",
    "................",
    "................",
  ],
  compass: [
    "................",
    ".....dddddd.....",
    "...dd......dd...",
    "..d....dd....d..",
    ".d.....dd.....d.",
    ".d....dddd....d.",
    "d.....dddd.....d",
    "d....ddaadd....d",
    "d....ccaacc....d",
    "d.....cccc.....d",
    ".d....cccc....d.",
    ".d.....cc.....d.",
    "..d....cc....d..",
    "...dd......dd...",
    ".....dddddd.....",
    "................",
  ],
  sunset: [
    "................",
    "...........ddd..",
    ".............d..",
    "...........ddd..",
    "...........d....",
    "...........ddd..",
    "......dddd......",
    "....dddddddd....",
    "...dddddddddd...",
    "..dddddddddddd..",
    "cccccccccccccccc",
    "ccbccccbccccbccc",
    "cccccccccccccccc",
    ".cbccccbccccbcc.",
    "................",
    "................",
  ],
};
BADGE_ICONS.canele = SPRITES.gidget.map((r) => r.slice(0, 16));

// ---------- drawing ----------
export function drawGrid(ctx, grid, x, y, scale = 1, flip = false) {
  const h = grid.length;
  for (let r = 0; r < h; r++) {
    const row = grid[r];
    const w = row.length;
    for (let c = 0; c < w; c++) {
      const ch = row[c];
      if (ch === ".") continue;
      ctx.fillStyle = PAL[ch];
      const cx = flip ? w - 1 - c : c;
      ctx.fillRect(Math.round(x + cx * scale), Math.round(y + r * scale), scale, scale);
    }
  }
}
export function gridSize(grid) { return { w: grid[0].length, h: grid.length }; }

// Draws a badge (round medallion + icon) into a canvas at size px.
export function renderBadge(canvas, iconId, size = 32) {
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const s = size / 32;
  // pixel circle
  const R = 15;
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const d = Math.hypot(x - 15.5, y - 15.5);
    if (d <= R) {
      ctx.fillStyle = d > R - 2 ? PAL.d : d > R - 3.5 ? PAL.c : PAL.a;
      ctx.fillRect(x * s, y * s, s, s);
    }
  }
  const icon = BADGE_ICONS[iconId];
  if (icon) {
    const g = gridSize(icon);
    drawGrid(ctx, icon, (32 - g.w) / 2 * s, (32 - g.h) / 2 * s, s);
  }
}

export function renderSprite(canvas, id, scale = 4) {
  const grid = SPRITES[id] || BADGE_ICONS[id];
  const g = gridSize(grid);
  canvas.width = g.w * scale; canvas.height = g.h * scale;
  const ctx = canvas.getContext("2d");
  drawGrid(ctx, grid, 0, 0, scale);
}

// ---------- backgrounds (procedural; any W x H) ----------
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export function drawBg(ctx, name, W, H, t = 0) {
  const R = (col, x, y, w, h) => { ctx.fillStyle = PAL[col]; ctx.fillRect(x | 0, y | 0, Math.ceil(w), Math.ceil(h)); };
  const horizon = Math.round(H * 0.55);
  switch (name) {
    case "night": {
      R("d", 0, 0, W, H);
      const r = rng(7);
      for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * horizon; if (((t / 400 + i) | 0) % 7) R("a", x, y, 1, 1); }
      R("c", W * 0.72, 8, 8, 8); R("d", W * 0.72 + 3, 7, 7, 7); // moon
      R("c", 0, horizon + 18, W, H); R("b", 0, horizon + 26, W, 2);
      for (let x = ((t / 60) | 0) % 12; x < W; x += 12) R("a", x, horizon + 30, 5, 1);
      break;
    }
    case "road": {
      R("a", 0, 0, W, horizon);
      R("b", 0, horizon - 10, W, 10); // hills
      for (let x = 0; x < W; x += 16) R("c", x, horizon - 14 + ((x / 16) % 2) * 4, 12, 14);
      R("c", 0, horizon, W, H);
      R("d", 0, horizon + 20, W, 20);
      for (let x = -((t / 40) | 0) % 16; x < W; x += 16) R("a", x, horizon + 29, 8, 2);
      break;
    }
    case "beach": {
      R("a", 0, 0, W, horizon);
      R("b", W * 0.15, 10, 18, 3); R("b", W * 0.55, 16, 24, 3); // clouds
      R("c", 0, horizon, W, 14);
      for (let x = ((t / 90) | 0) % 10; x < W; x += 10) R("b", x, horizon + 4, 5, 1);
      R("b", 0, horizon + 14, W, H);
      R("a", 0, horizon + 14, W, 2);
      break;
    }
    case "sunset": {
      R("b", 0, 0, W, horizon);
      R("a", 0, horizon - 20, W, 20);
      const cx = W / 2;
      for (let y = -14; y <= 0; y++) { const w = Math.sqrt(14 * 14 - y * y) * 2; R("d", cx - w / 2, horizon + y, w, 1); }
      R("c", 0, horizon, W, H);
      for (let y = horizon + 3; y < H; y += 5) R("a", cx - 10 + ((y + (t / 200 | 0)) % 3) * 2, y, 20 - (y - horizon) / 3, 1);
      break;
    }
    case "field": {
      R("a", 0, 0, W, horizon);
      R("c", 0, horizon, W, H);
      const r = rng(3);
      for (let i = 0; i < 26; i++) {
        const x = r() * W, y = horizon + 6 + r() * (H - horizon - 10);
        R("d", x, y, 1, 6); R("b", x - 2, y - 3, 5, 3); R("d", x - 1, y - 2, 3, 1);
      }
      break;
    }
    case "town": {
      R("a", 0, 0, W, H);
      for (let x = 0; x < W; x += 34) { R("c", x + 4, horizon - 26, 26, 26); R("d", x + 2, horizon - 32, 30, 6); R("a", x + 14, horizon - 14, 6, 14); R("b", x + 8, horizon - 22, 5, 5); R("b", x + 21, horizon - 22, 5, 5); }
      R("b", 0, horizon, W, H);
      break;
    }
    case "inn": case "hideout": case "doorway": {
      R("b", 0, 0, W, H);
      R("c", 0, 0, W, horizon);
      for (let x = 0; x < W; x += 8) R("d", x, 0, 1, horizon); // wall planks
      R("d", W / 2 - 18, horizon - 44, 36, 44); R("a", W / 2 - 14, horizon - 40, 28, 40); // door
      if (name === "hideout") { R("d", 10, 10, 20, 14); R("a", 12, 12, 16, 10); }
      R("d", 0, horizon, W, 2);
      break;
    }
    case "battle": {
      R("a", 0, 0, W, H);
      R("b", W * 0.52, H * 0.34, W * 0.42, 8);   // foe platform
      R("b", W * 0.04, H * 0.84, W * 0.42, 8);   // player platform
      break;
    }
    case "title": {
      R("a", 0, 0, W, H);
      break;
    }
    default:
      R("a", 0, 0, W, H);
  }
}
