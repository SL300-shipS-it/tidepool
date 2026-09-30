// Original pixel art, drawn in code. GBA-era full-color palette (CR-001, CR-002).
// Grid letters ("." = transparent). Every letter used in a grid must be a key of PAL.
//   Neutral ramp (legacy a-d):
//     a #f8f8f8 white        b #b8c0c8 light gray   c #607080 slate gray   d #303838 near-black
//   Named colors:
//     e #f8f8e8 cream        k #202028 outline black
//     s #f8c8a0 skin         t #d89870 skin shadow
//     h #805838 hair brown   i #4a3020 hair dark
//     r #d86040 coral        q #a03828 red dark      p #f0a0b0 pink
//     m #d89048 caramel      n #9a5a28 caramel dark  o #5a3018 canele crust
//     u #80c0e8 sky blue     v #3868a8 deep blue     l #8870b8 lavender
//     z #e8d098 sand         y #f8d048 sunflower     x #c89830 gold dark
//     g #58a848 leaf green   f #307838 leaf dark     j #384850 slate (UI)
//     w #d0e050 tennis lime  (CR-002)
//   Uppercase letters (added once a-z ran out; CR-005/006/007):
//     B #a8704a Leon skin (warm medium brown)   C #7a4c30 Leon skin shadow
//     S #dce4ec silver (chain, hoop, bracelet)
//     G #6c7c64 dark gray-green suede           H #4c5846 suede shadow
//     D #9a7a52 brown canvas                    E #6a5034 canvas shadow
//     L #e4eef8 pale blue-white linen/satin     M #b4c8dc skirt shadow
//     T #c8a070 brown paper (kraft)             U #94704a kraft shadow
//     P #5a80b8 plaid mid blue (currently unused; kept for future sprites)
//     A #2a2838 Gidget black fur          F #46485f fur sheen      R #8090b8 fur rim light (CR-009)
//     I #24222c black hair (Jess, Leon)   J #4c4e66 black-hair gloss / curl highlight
//     N #fcdab4 Jess skin (golden beige)  O #e2b284 Jess skin shadow
//     Q #243058 plaid navy
// Sprite style (CR-002): dark outline k, 2-3 shades per material, light from the upper left.
export const PAL = {
  a: "#f8f8f8", b: "#b8c0c8", c: "#607080", d: "#303838",
  e: "#f8f8e8", k: "#202028",
  s: "#f8c8a0", t: "#d89870",
  h: "#805838", i: "#4a3020",
  r: "#d86040", q: "#a03828", p: "#f0a0b0",
  m: "#d89048", n: "#9a5a28", o: "#5a3018",
  u: "#80c0e8", v: "#3868a8", l: "#8870b8",
  z: "#e8d098", y: "#f8d048", x: "#c89830",
  g: "#58a848", f: "#307838", j: "#384850",
  w: "#d0e050",
  B: "#a8704a", C: "#7a4c30", S: "#dce4ec",
  G: "#6c7c64", H: "#4c5846", D: "#9a7a52", E: "#6a5034",
  L: "#e4eef8", M: "#b4c8dc", T: "#c8a070", U: "#94704a", P: "#5a80b8",
  A: "#2a2838", F: "#46485f", R: "#8090b8",
  I: "#24222c", J: "#4c4e66", N: "#fcdab4", O: "#e2b284", Q: "#243058",
};

// ---------- sprites (16x16 unless noted) ----------
// Gidget (CR-009): Jess's childhood cat, a black cat, wearing a small canele (caramel sides,
// dark caramelized crown) as a hat between her ears. Near-black fur A with sheen F and a blue-gray
// rim light R on the upper-left edges, ears and tail so she reads on night/dark backgrounds.
// Yellow-green eyes (w), pink nose and inner ears (p), whiskers (b).
export const SPRITES = {
  // 20x20: sitting, tail curled up on the right.
  gidget: [
    "......kkkk..........",
    ".....konnok.........",
    "..k.kzmnmnnk.k......",
    ".kRkkzmnmnnkkFk.....",
    ".kRpknnnnnnkpFk.....",
    ".kRAAAAAAAAAAFk.....",
    ".kRAAAAAAAAAAFk.....",
    ".kRAawAAAAawAFk.....",
    ".kRAwkAAAAkwAFk.....",
    "bkRAAAAppAAAAFkbkRFk",
    ".bkFAAkAAkAAFkb.kRk.",
    "..kFAAAkkAAAFk..kRk.",
    "...kkAAAAAAkk...kRk.",
    "...kRAAAAAAAFk..kRk.",
    "..kRAAAAAAAAAFk.kRk.",
    "..kRAAAAAAAAAFkkRAk.",
    "..kRAAAAAAAAAAFRAk..",
    "..kRAAAFFAAAAAAAk...",
    "..kRAkAAAAkAAAkk....",
    "...kkRkkkkRkkkk.....",
  ],
  // 20x14: curled up asleep, eyes closed, canele hat slipped askew over one ear.
  gidget_sleep: [
    ".......kkk..........",
    ".....kkonnk.........",
    ".k..kzmnmnok........",
    "kRkkzmnmnnnkk.......",
    "kRpknnnnnnkFk.kkkk..",
    "kRAAkkkkkkAAFkRRRRk.",
    "kRAAAAAAAAAAAFAAAAAk",
    "kRARRAAAARRAAFAAAAAk",
    "bkAAAAppAAAAFAAAAAAk",
    ".kFAAAkkAAAFAAAAAAAk",
    "..kFAAAAAAFAAAAAAAAk",
    ".kRRRRRRRRRRRRRRAAk.",
    "kRAAAAAAAAAAAAAAAk..",
    ".kkkkkkkkkkkkkkkk...",
  ],
  // Jess (CR-006, refined from Leon's photos; 16x20): long straight glossy black hair (I/J) parted
  // in the middle and past the shoulders, black sunglasses pushed up on her head, small gold hoops,
  // golden-beige skin (N/O), calm closed-mouth smile, fitted black sleeveless top with a high round
  // neck, long pale blue-white satin/linen maxi skirt (L/M, a sheen), gold bracelet, brown paper
  // tote (T/U) held low by its handles.
  jess: [
    "....kkkkkkkk....",
    "...kIJIIIIJIk...",
    "..kIdbdkkdbdIk..",
    "..kIJIINNIIJIk..",
    "..kIIINNNNIIIk..",
    "..kIINNNNNNIIk..",
    "..kINkNNNNkNIk..",
    "..kINkNNNNkNIk..",
    "..kIpNONNONpIk..",
    "..kIyNNOONNyIk..",
    "..kIIkONNOkIIk..",
    ".kIINddddddNIIk.",
    "kNkIIdJddddIIkNk",
    "kNkIddJdddddIkyk",
    "kOkkLLLLLLLMkkOk",
    "U.UkLaLLLLLMk...",
    "kUUkLaMLLLMMk...",
    "kTUkLLMLLLMMk...",
    "kTUkLLMLLLMMMk..",
    "kkkkkkOkkkkOkk..",
  ],
  // Leon (CR-007, refined from Leon's photos; 16x20): warm medium-brown skin (B/C), rounded tight-curly
  // black hair (I with J curl highlights) with slightly receding temples, full dark beard and
  // mustache (i), black rectangular sunglasses, silver hoop earring, curb chain and bracelet (S),
  // oversized short-sleeve navy/blue/gray tartan shirt (Q v b c), baggy brown canvas pants (D/E),
  // white socks, dark gray-green suede low-tops (G/H) with a plain white side stripe.
  leon: [
    "....kkkkkkkk....",
    "...kJIIJIIJIk...",
    "..kIIJIIJIIJIk..",
    "..kIBIJIIJIBIk..",
    "..kBBBBBBBBBBk..",
    "..kBkkkkkkkkBk..",
    "..kBkcdkkcdkBk..",
    "..kiBBBCCBBBiS..",
    "..kiiiiiiiiiik..",
    "...kiiaaaaiik...",
    "....kiiiiiik....",
    ".kvQvkBBBBkvQvk.",
    "kvQvvQkSSkQvvQvk",
    "kbcbbcbccbcbbcbk",
    "kBkvQvvccvvQvkBk",
    "kBkDDDDDDDDDDkSk",
    "kCkDDDDEDDDDEkCk",
    "..kaaakkkkaaak..",
    "..kGaGGkkGGaGk..",
    ".kGGGGHkkHGGGGk.",
  ],
  // Leon with a comically swollen upper lip (pink highlight, coral, dark red underside).
  leon_lips: [
    "....kkkkkkkk....",
    "...kJIIJIIJIk...",
    "..kIIJIIJIIJIk..",
    "..kIBIJIIJIBIk..",
    "..kBBBBBBBBBBk..",
    "..kBkkkkkkkkBk..",
    "..kBkcdkkcdkBk..",
    ".kkkkkkkkkkkkkS.",
    ".kpppprrrrpppqk.",
    ".krrrrrrrrrrrqk.",
    "..kqqkiiiikqqk..",
    ".kvQvkBBBBkvQvk.",
    "kvQvvQkSSkQvvQvk",
    "kbcbbcbccbcbbcbk",
    "kBkvQvvccvvQvkBk",
    "kBkDDDDDDDDDDkSk",
    "kCkDDDDEDDDDEkCk",
    "..kaaakkkkaaak..",
    "..kGaGGkkGGaGk..",
    ".kGGGGHkkHGGGGk.",
  ],
  // 24x10: Leon asleep on his back across a doorway (head left, sneakers right), sunglasses off,
  // eyes closed. Silver chain across the collar, earring at the ear, white socks above the sneakers.
  leon_asleep: [
    ".kkkkkkkk..kkkkkkkkkkkk.",
    "kJIJBBBiikkvQvvQDDDakGGk",
    "kIIJBkBiikBbcbbcDDEakaHk",
    "kJIIBkBiikSvQvvQDDEakGHk",
    "kIIJBBCiikSvQvvQDDDkkkk.",
    "kIJIBBCiikSvQvvQDDDkkkk.",
    "kJIJBkBiikSbcbbcDDEakGGk",
    "kIIIBkBiikBvQvvQDDEakaHk",
    "kJIJBBBiikkvQvvQDDDakGHk",
    ".kkkkkSkk..kkkkkkkkkkkk.",
  ],
  // Dr. Andy Josephson, the "Tea Professor" (16x20, from Leon's photo): short grey hair combed back
  // with a few darker strands (b/c), slightly receding temples, fair clean-shaven slim face, calm
  // half-smile; white shirt (e) with a gold tie of small light squares (x/z) under a long open white
  // lab coat (a, shadow b); slate trousers; coral mug of tea in one hand.
  professor: [
    "................",
    ".....kkkkkk.....",
    "....kbbcbbbk....",
    "...kbcbbcbbck...",
    "...kbsbbbcsbk...",
    "...kbssssssbk...",
    "...kskssssksk...",
    "...kssstssstk...",
    "...ksssstttsk...",
    "....ktsssstk....",
    "..kaakexxekaak..",
    ".kaabkexzekbaak.",
    ".kaabkezxekknnnk",
    ".kaabkexzekkrrrk",
    ".kaabkezxesskrrk",
    ".kssbkeexekkrrrk",
    ".kssbkjjjjkbkkk.",
    "..kabkjjjjkbak..",
    "..kkkkjkkjkkkk..",
    "...kiiik.kiiik..",
  ],
  // Lactaid box: white and blue, with a little face.
  lactaid: [
    "................",
    "................",
    "...kkkkkkkkkk...",
    "...kvvvvvvvvk...",
    "...kuuuuuuuvk...",
    "...kaaaaaaauk...",
    "...kaakaakauk...",
    "...kapakkapuk...",
    "...kaaaaaaauk...",
    "...kvvvvvvvvk...",
    "...kvavavavvk...",
    "...kvvvvvvvvk...",
    "...kaaaaaaauk...",
    "...kuuuuuuuuk...",
    "...kkkkkkkkkk...",
    "................",
  ],
  // Three tennis balls stacked in a little pyramid.
  tennis: [
    "................",
    "......kkkk......",
    ".....kewwwk.....",
    "....kewwwwgk....",
    "....kawwwagk....",
    "....kwaaawgk....",
    "....kwwwwggk....",
    ".....kggggk.....",
    "..kkkkkkkkkkkk..",
    ".kewwwk..kewwwk.",
    "kewwwwgkkewwwwgk",
    "kawwwagkkawwwagk",
    "kwaaawgkkwaaawgk",
    "kwwwwggkkwwwwggk",
    ".kggggk..kggggk.",
    "..kkkk....kkkk..",
  ],
  // Generic coastal hiker: blue beanie, yellow rain jacket, brown boots.
  npc: [
    "................",
    ".....kkkkkk.....",
    "....kvvvvvvk....",
    "...kvvuvvvvvk...",
    "...kuuuuuuuuk...",
    "...kssssssssk...",
    "...kskssssksk...",
    "...ktssttsstk...",
    "....kssssssk....",
    "...kyyksskyyk...",
    "..kyyyyyyyyyxk..",
    ".kskyyyyyyyxksk.",
    ".kskyyyyyyyxksk.",
    ".ktkjjjjjjjjktk.",
    "...kjjjkkjjjk...",
    "..khhhk..khhhk..",
  ],
  trophy: [
    "................",
    "..kkkkkkkkkkkk..",
    ".kkayyyyyyyyxkk.",
    "k.kayyyyyyyyxk.k",
    "k.kayyyyyyyyxk.k",
    ".kkyyyyyyyyyxkk.",
    "...kyyyyyyyxk...",
    "....kyyyyyxk....",
    ".....kyyyxk.....",
    "......kyxk......",
    "......kyxk......",
    ".....kyyxxk.....",
    "....kkkkkkkk....",
    "....khhhhhik....",
    "....kkkkkkkk....",
    "................",
  ],
  item: [
    "................",
    "......kkkk......",
    ".....khhhhk.....",
    "....kkkkkkkk....",
    "...kpprrrrrrk...",
    "..kprrrrrrrrqk..",
    "..krrrrkkrrrqk..",
    "..kkkkkyykkkkk..",
    "..kzzzkyykzzxk..",
    "..kzzzzkkzzzxk..",
    "..kzzzzzzzzzxk..",
    "..kzzzzzzzzxxk..",
    "...kkkkkkkkkk...",
    "................",
    "................",
    "................",
  ],
  status: [
    "................",
    ".......kk.......",
    "......kyxk......",
    "......kyxk......",
    ".....kyyyxk.....",
    ".....kykkxk.....",
    "....kyykkyxk....",
    "....kyykkyxk....",
    "...kyyykkyyxk...",
    "...kyyyyyyyxk...",
    "..kyyyykkyyyxk..",
    "..kyyyykkyyyxk..",
    ".kyyyyyyyyyyyxk.",
    ".kkkkkkkkkkkkkk.",
    "................",
    "................",
  ],
};

// ---------- badge icons (16x16, drawn on a round badge) ----------
export const BADGE_ICONS = {
  glamour: [
    "............y...",
    "...........yay..",
    "............y...",
    "....kkkkkkkk....",
    "...kaakuukvvk...",
    "..kaaakuukvvvk..",
    ".kkkkkkkkkkkkkk.",
    "..kauuuaauuuvk..",
    "...kauuaauuvk...",
    "....kuuaauvk....",
    ".....kuaavk..y..",
    "......kaak......",
    ".......kk.......",
    "..y.............",
    ".yay............",
    "..y.............",
  ],
  snooze: [
    "................",
    "................",
    "................",
    ".vvvvvvv........",
    ".kkkkkvv........",
    ".....vvk........",
    "....vvk.........",
    "...vvk...lllll..",
    "..vvk....kkkll..",
    ".vvvvvvv...llk..",
    ".kkkkkkk..llk...",
    ".........lllll..",
    ".........kkkkk..",
    "................",
    "................",
    "................",
  ],
  bloom: [
    "................",
    ".....x.xx.x.....",
    "...x.yyyyyy.x...",
    "..xyyyhhhhyyyx..",
    "...xyhihihhyx...",
    "..xyyihihihyyx..",
    "..xyyhihihiyyx..",
    "...xyhhihhhyx...",
    "..xyyyhhhhyyyx..",
    "...x.yyyyyy.x...",
    ".....x.xx.x.....",
    ".......gf.......",
    "..gg...gf...gg..",
    "...ggf.gf.fgg...",
    "....fffgfff.....",
    ".......gf.......",
  ],
  tide: [
    "................",
    "................",
    ".......kkkk.....",
    ".....kkaaaak....",
    "....kauukkak....",
    "...kauk..kak....",
    "..kauk....k.....",
    ".kauk...........",
    "kauk.......kk...",
    "kuuk.....kaak...",
    "kuuuk..kauuuuk..",
    "kuuvukkuuuvuuuuk",
    "vvvvvvvvvvvvvvvv",
    ".vuvvvuvvvvuvvv.",
    "................",
    "................",
  ],
  compass: [
    "................",
    ".....xxxxxx.....",
    "...xx......xx...",
    "..x....rr....x..",
    ".x.....rr.....x.",
    ".x....rrrr....x.",
    "x.....rrrr.....x",
    "x....rraarr....x",
    "x....vvaavv....x",
    "x.....vvvv.....x",
    ".x....vvvv....x.",
    ".x.....vv.....x.",
    "..x....vv....x..",
    "...xx......xx...",
    ".....xxxxxx.....",
    "................",
  ],
  sunset: [
    "................",
    "...........qqq..",
    ".............q..",
    "...........qqq..",
    "...........q....",
    "......xxxx.qqq..",
    ".....xyyyyx.....",
    "...xyyyyyyyyx...",
    "..xmmmmmmmmmmx..",
    ".xrrrrrrrrrrrrx.",
    "vvvvvvvvvvvvvvvv",
    "vvvvyyyyyyyyvvvv",
    "vvvvvvmmmmvvvvvv",
    ".vvvvvvrrvvvvvv.",
    "................",
    "................",
  ],
  // Canele Key (CR-009): Gidget's head wearing her canele hat.
  canele: [
    "................",
    "......kkkk......",
    ".....koonok.....",
    "..k..kzmnnk..k..",
    ".kRk.kzmnnk.kFk.",
    ".kRpkknnnnkkpFk.",
    ".kRAAkkkkkkAAFk.",
    ".kRAAAAAAAAAAFk.",
    ".kRAawAAAAawAFk.",
    ".kRAwkAAAAkwAFk.",
    "bkRAAAAppAAAAFkb",
    ".bkFAAkAAkAAFkb.",
    "..kFAAAkkAAAFk..",
    "...kkFAAAAFkk...",
    "....kkkkkkkk....",
    "................",
  ],
};

// ---------- drawing ----------
export function drawGrid(ctx, grid, x, y, scale = 1, flip = false) {
  const h = grid.length;
  for (let r = 0; r < h; r++) {
    const row = grid[r];
    const w = row.length;
    for (let c = 0; c < w; c++) {
      const ch = row[c];
      if (ch === ".") continue;
      ctx.fillStyle = PAL[ch] || "#ff00ff"; // magenta = unknown letter
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
      ctx.fillStyle = d > R - 1.5 ? PAL.j : d > R - 3.5 ? PAL.r : d > R - 4.5 ? PAL.x : PAL.e;
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
// Each scene has a static `base` (painted once per size into a cached canvas) and an optional
// cheap `anim` overlay drawn every frame. Colors are hex strings or PAL letters.
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function pen(ctx) {
  const col = (c) => (c.length === 1 ? PAL[c] : c);
  const R = (c, x, y, w, h) => { if (w <= 0 || h <= 0) return; ctx.fillStyle = col(c); ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h)); };
  const P = (c, x, y) => R(c, x, y, 1, 1);
  // horizontal color bands from y0 to y1, with a checker dither row at each seam
  const bands = (cols, x0, y0, w, y1) => {
    const n = cols.length, hh = (y1 - y0) / n;
    for (let i = 0; i < n; i++) { const a = Math.round(y0 + i * hh), b = Math.round(y0 + (i + 1) * hh); R(cols[i], x0, a, w, b - a); }
    for (let i = 1; i < n; i++) { const y = Math.round(y0 + i * hh); for (let x = Math.floor(x0) + (y & 1); x < x0 + w; x += 2) P(cols[i - 1], x, y); }
  };
  // filled ellipse (rows), optionally clipped to y < ymax
  const ell = (c, cx, cy, rx, ry, ymax = 1e9) => {
    cx = Math.round(cx); cy = Math.round(cy);
    const iry = Math.ceil(ry);
    for (let dy = -iry; dy <= iry; dy++) {
      if (cy + dy >= ymax) break;
      const k = 1 - (dy * dy) / ((ry + 0.5) * (ry + 0.5));
      if (k <= 0) continue;
      const hw = Math.round((rx + 0.3) * Math.sqrt(k));
      R(c, cx - hw, cy + dy, hw * 2, 1);
    }
  };
  const disc = (c, cx, cy, r, ymax) => ell(c, cx, cy, r, r, ymax);
  const speck = (c, x0, y0, w, h, n, seed) => { const r = rng(seed); for (let i = 0; i < n; i++) P(c, x0 + r() * w, y0 + r() * h); };
  const grid = (rows, x, y) => drawGrid(ctx, rows, Math.round(x), Math.round(y), 1);
  return { R, P, bands, ell, disc, speck, grid };
}

const SKY_DAY = ["#5890d8", "#70a8e8", "#90c0f0", "#b0d4f0", "#d0e4f0"];

function cloud(p, x, y, w) {
  p.ell("#c8dcf0", x, y + 1, w / 2, 2);
  p.ell("#f8f8f8", x, y, w / 2, 2);
  p.ell("#f8f8f8", x - w / 6, y - 2, w / 4, 2);
  p.ell("#f8f8f8", x + w / 8, y - 3, w / 5, 2);
}
// Monterey cypress: flat, wind-swept canopy on a crooked trunk.
function cypress(p, x, base, dk, mid, trunk) {
  p.R(trunk, x, base - 8, 2, 8); p.R(trunk, x + 1, base - 11, 2, 4); p.R(trunk, x - 2, base - 7, 2, 1);
  p.ell(dk, x + 3, base - 12, 9, 2.5); p.ell(mid, x + 2, base - 13, 7, 1.5);
  p.ell(dk, x - 4, base - 8, 5, 1.5); p.ell(mid, x - 4, base - 9, 3, 1);
  if (mid !== dk) p.R("#80b060", x - 1, base - 14, 5, 1);
}
function gull(p, x, y, t) {
  x = Math.round(x); y = Math.round(y);
  const up = ((t / 220) | 0) % 2;
  p.P("#f8f8f8", x, y);
  if (up) { p.P("#f8f8f8", x - 1, y - 1); p.P("#f8f8f8", x + 1, y - 1); p.P("#586070", x - 2, y - 2); p.P("#586070", x + 2, y - 2); }
  else { p.P("#f8f8f8", x - 1, y); p.P("#f8f8f8", x + 1, y); p.P("#586070", x - 2, y + 1); p.P("#586070", x + 2, y + 1); }
}
// sunflower heads: size 0 (2px), 1 (3x3), 2 (5x5), 3 (7x7)
function sunflower(p, x, y, size) {
  x = Math.round(x); y = Math.round(y);
  const Y = "#f8d048", X = "#d89830", C = "#6a3a18", C2 = "#9a6030", G = "#4a9038";
  if (size === 0) { p.R(Y, x, y, 2, 1); p.P(X, x + 1, y + 1); p.P(G, x, y + 1); return; }
  if (size === 1) { p.P(Y, x, y - 1); p.P(Y, x - 1, y); p.P(Y, x + 1, y); p.P(X, x, y + 1); p.P(C, x, y); p.P(G, x, y + 2); return; }
  if (size === 2) {
    p.R(G, x, y + 3, 1, 4); p.P(G, x + 1, y + 5);
    p.R(Y, x - 1, y - 2, 3, 1); p.R(Y, x - 2, y - 1, 5, 3); p.R(X, x - 1, y + 2, 3, 1); p.P(X, x + 2, y + 1);
    p.R(C, x - 1, y - 1, 2, 2); p.P(C2, x - 1, y - 1); return;
  }
  p.R(G, x, y + 4, 1, 9); p.R("#6ab048", x - 3, y + 7, 3, 1); p.R(G, x - 2, y + 8, 2, 1); p.R("#6ab048", x + 1, y + 9, 3, 1); p.R(G, x + 1, y + 10, 2, 1);
  p.R(Y, x - 1, y - 3, 3, 1); p.R(Y, x - 2, y - 2, 5, 1); p.R(Y, x - 3, y - 1, 7, 3); p.R(Y, x - 2, y + 2, 5, 1); p.R(X, x - 1, y + 3, 3, 1);
  p.P(X, x + 3, y + 1); p.P(X, x + 2, y + 2); p.P("#f8e890", x - 2, y - 2);
  p.R(C, x - 1, y - 1, 3, 3); p.P(C2, x - 1, y - 1); p.P("#4a2410", x + 1, y + 1);
}
function stringBulbs(W) { const out = []; for (let x = 4; x < W; x += 8) out.push([x, 7 + Math.round(3 * Math.sin((Math.PI * (x % 32)) / 32))]); return out; }

const SCENES = {
  beach: {
    base(p, W, H) {
      const hz = Math.round(H * 0.5), shore = Math.round(H * 0.72), cx0 = Math.round(W * 0.7);
      p.bands(SKY_DAY, 0, 0, W, hz);
      cloud(p, W * 0.2, H * 0.12, 22); cloud(p, W * 0.6, H * 0.22, 28);
      p.ell("#88a8c8", W * 0.06, hz, W * 0.14, 4, hz); // far headland
      p.bands(["#3070b0", "#3a80c0", "#4890cc", "#58a4d8"], 0, hz, W, shore);
      p.R("#b8dcf0", 0, hz, W, 1);
      for (let x = cx0; x < W; x++) { // cliff
        const k = (x - cx0) / Math.max(1, W - cx0);
        const top = Math.round(hz - 3 - Math.min(1, k * 2.5) * H * 0.17) + ((x * 7) % 3 === 0 ? 1 : 0);
        const bot = shore + 3;
        p.R(x - cx0 < 2 ? "#6e4e34" : "#9a7050", x, top, 1, bot - top);
        for (let y = top + 4 + (x % 4); y < bot; y += 5) p.P("#7a583c", x, y);
        if (x % 5 === 0) p.P("#b88c64", x, top + 3);
        p.R("#5a8a38", x, top, 1, 2); p.P("#88b850", x, top);
      }
      p.R("#c8a870", 0, shore, W, 3); // wet sand
      p.bands(["#e0c488", "#e8d098", "#f0dca8"], 0, shore + 3, W, H);
      p.speck("#d0b078", 0, shore + 4, W, H - shore - 4, W * 0.4, 5);
      p.speck("#f8ecc8", 0, shore + 4, W, H - shore - 4, W * 0.2, 9);
      const r = rng(4);
      for (let i = 0; i < 4; i++) p.P(i % 2 ? "#f0a0b0" : "#f8f0e0", r() * W, shore + 6 + r() * (H - shore - 8));
      const sx = Math.round(W * 0.1), sy = H - 6; // starfish
      p.R("#e87858", sx - 1, sy, 3, 1); p.R("#e87858", sx, sy - 1, 1, 3); p.P("#c05838", sx + 1, sy + 1); p.P("#c05838", sx - 1, sy + 1);
      p.R("#8a6a4a", W * 0.78, H - 5, 12, 2); p.R("#b08c68", W * 0.78 + 1, H - 5, 9, 1); // driftwood
    },
    anim(p, W, H, t) {
      const hz = Math.round(H * 0.5), shore = Math.round(H * 0.72), n = shore - hz;
      for (let row = 0; row < 3; row++) {
        const y = hz + 3 + Math.round((row * n) / 3.2), gap = 12 + row * 3;
        const off = ((t / (160 - row * 40)) | 0) % gap;
        for (let x = off - gap + row * 5; x < W * 0.68; x += gap) p.R("#a8d4f0", x, y, 3 + row, 1);
      }
      const sw = Math.round(Math.sin(t / 900) * 1.5);
      p.R("#d8ecf8", 0, shore - 2 + sw, W, 1); p.R("#f8f8f8", 0, shore - 1 + sw, W, 1);
      for (let x = ((t / 120) | 0) % 7 - 7; x < W; x += 7) p.R("#f8f8f8", x, shore + sw, 4, 1);
      gull(p, ((t / 45) % (W + 20)) - 10, H * 0.16 + Math.sin(t / 700) * 2, t);
    },
  },

  road: {
    base(p, W, H) {
      const hz = Math.round(H * 0.46), rt = Math.round(H * 0.74), rb = Math.round(H * 0.96), bl = rt - 6;
      p.bands(SKY_DAY, 0, 0, W, hz);
      cloud(p, W * 0.7, H * 0.1, 26);
      p.bands(["#4a88c8", "#3c78b8", "#3470b0"], 0, hz, W, bl);
      p.R("#b8dcf0", 0, hz, W, 1);
      for (let x = 0; x < W; x++) { // golden coastal hills, land side on the left
        const ss = (v) => v * v * (3 - 2 * v);
        const f = ss(Math.max(0, 1 - x / (W * 0.7))), n = ss(Math.max(0, 1 - x / (W * 0.5)));
        const far = Math.round(hz - H * 0.2 * f * (0.85 + 0.15 * Math.sin(x * 0.11)));
        if (f > 0) { p.R("#9aa860", x, far, 1, bl - far); p.P("#b0bc78", x, far); }
        const near = Math.round(bl - H * 0.15 * n);
        if (n > 0) { p.R("#c8a858", x, near, 1, bl - near); p.P("#e0c070", x, near); }
      }
      p.speck("#b09048", 0, hz, W * 0.4, bl - hz, W * 0.3, 21);
      const r = rng(8); // oaks on the far ridge
      for (let i = 0; i < 4; i++) { const x = r() * W * 0.45, y = hz - H * 0.12 + r() * H * 0.1; p.ell("#587840", x, y, 2, 1); }
      p.R("#88a048", 0, bl, W, 6); p.speck("#a8c060", 0, bl, W, 6, W * 0.3, 2); p.speck("#f8d048", 0, bl + 2, W, 4, W * 0.06, 3);
      for (let x = Math.round(W * 0.46); x < W; x += 7) p.R("#805838", x, rt - 5, 1, 5); // guardrail
      p.R("#e8e0d0", W * 0.46, rt - 4, W, 1);
      cypress(p, Math.round(W * 0.84), rt - 5, "#2f5a38", "#407848", "#5a3a28");
      p.R("#5c5c6c", 0, rt, W, rb - rt);
      p.speck("#6c6c7c", 0, rt, W, rb - rt, W * 0.5, 13); p.speck("#50505e", 0, rt, W, rb - rt, W * 0.4, 14);
      p.R("#e8e8e8", 0, rt + 1, W, 1); p.R("#e8e8e8", 0, rb - 2, W, 1);
      const mid = Math.round((rt + rb) / 2); p.R("#f8d048", 0, mid - 1, W, 1); p.R("#f8d048", 0, mid + 1, W, 1);
      p.R("#78a040", 0, rb, W, H - rb); p.speck("#f0a0b0", 0, rb, W, H - rb, W * 0.05, 6);
      const sx = Math.round(W * 0.58); // Route 1 shield
      p.R("#5a3a28", sx + 3, rt - 12, 1, 12);
      p.grid(["kkkkkkk", "kffaffk", "kfaaffk", "kffaffk", "kffaffk", ".kaaak.", "..kkk.."], sx, rt - 19);
    },
    anim(p, W, H, t) {
      const hz = Math.round(H * 0.46), span = W * 0.24;
      const x = Math.round(W * 0.73 + ((t / 220) % span));
      p.R("#f8f8f8", x - 2, hz + 3, 5, 1); p.R("#a03828", x - 1, hz + 4, 3, 1); // sailboat
      p.R("#f8f8f8", x, hz, 1, 3); p.P("#f8f8f8", x + 1, hz + 1); p.R("#f8f8f8", x + 1, hz + 2, 2, 1);
    },
  },

  sunset: {
    base(p, W, H) {
      const hz = Math.round(H * 0.5), shore = Math.round(H * 0.76);
      p.bands(["#503880", "#704898", "#9a5098", "#c85c88", "#e8707a", "#f08c68", "#f8a860", "#f8c870"], 0, 0, W, hz);
      p.R("#e07890", W * 0.06, H * 0.1, W * 0.3, 1); p.R("#b85890", W * 0.1, H * 0.1 + 1, W * 0.22, 1);
      p.R("#f89080", W * 0.58, H * 0.2, W * 0.34, 1); p.R("#c86080", W * 0.62, H * 0.2 + 1, W * 0.2, 1);
      const r = Math.max(8, Math.round(Math.min(W, H) * 0.13)), cx = Math.round(W / 2);
      p.disc("#f8b058", cx, hz, r + 2, hz); p.disc("#f8d068", cx, hz, r, hz); p.disc("#f8e8a0", cx, hz, r - 3, hz); p.disc("#f8f8d8", cx, hz, r - 6, hz);
      p.R("#e88078", cx - r - 6, hz - Math.round(r * 0.55), r * 2 + 12, 1); // cloud streak across the sun
      p.bands(["#b870a0", "#8a5c98", "#6a5090", "#504888"], 0, hz, W, shore);
      p.R("#f8d890", 0, hz, W, 1);
      for (let x = 0; x < W * 0.34; x++) { // headland silhouette
        const k = x / (W * 0.34), top = Math.round(hz - H * 0.13 * Math.sqrt(1 - k * k) - (x % 5 === 0 ? 1 : 0));
        p.R("#3c2a58", x, top, 1, hz + 2 - top);
      }
      cypress(p, Math.round(W * 0.12), Math.round(hz - H * 0.12), "#2a1c40", "#2a1c40", "#2a1c40");
      p.R("#a87078", 0, shore, W, 2);
      p.bands(["#c88878", "#d09880", "#d8a888"], 0, shore + 2, W, H);
      p.speck("#b87c70", 0, shore + 3, W, H - shore - 3, W * 0.4, 5);
    },
    anim(p, W, H, t) {
      const hz = Math.round(H * 0.5), shore = Math.round(H * 0.76), cx = Math.round(W / 2);
      const r = Math.max(8, Math.round(Math.min(W, H) * 0.13));
      for (let y = hz + 2, i = 0; y < shore - 1; y += 2, i++) {
        const w = Math.round(r * 0.5 + (y - hz) * 0.7), j = ((i * 5 + ((t / 240) | 0)) % 4) - 1;
        p.R(i % 2 ? "#f8c860" : "#f8e8a0", cx - w + j, y, Math.max(1, w * 0.7), 1);
        p.R("#f8a860", cx + 2 - j, y, Math.max(1, w * 0.6), 1);
      }
      const sw = Math.round(Math.sin(t / 900) * 1.5);
      p.R("#f8d0c0", 0, shore - 1 + sw, W, 1);
    },
  },

  night: {
    base(p, W, H) {
      const hz = Math.round(H * 0.52), shore = Math.round(H * 0.78);
      const mx = Math.round(W * 0.7), my = Math.round(H * 0.16);
      p.bands(["#0c1030", "#121a40", "#18244e", "#20305e", "#2a3c70"], 0, 0, W, hz);
      const r = rng(7);
      for (let i = 0; i < 50; i++) { const x = r() * W, y = r() * (hz - 4), c = r() > 0.7 ? "#a8b8e8" : "#f8f8e8"; if (Math.abs(x - mx) + Math.abs(y - my) > 12) p.P(c, x, y); }
      p.disc("#1c2858", mx, my, 10); p.disc("#243468", mx, my, 8);
      p.disc("#f0e8c0", mx, my, 5); p.P("#d0c8a0", mx - 2, my - 1); p.R("#d0c8a0", mx + 1, my + 1, 2, 1); p.P("#d0c8a0", mx - 1, my + 3); p.P("#f8f8e8", mx - 3, my - 3);
      p.bands(["#1c2c64", "#182656", "#142048"], 0, hz, W, shore);
      p.R("#3a4c88", 0, hz, W, 1);
      const x0 = Math.round(W * 0.76); // headland + lighthouse
      for (let x = x0; x < W; x++) { const top = Math.round(hz - H * 0.1 * Math.min(1, (x - x0) / (W * 0.1))); p.R("#0a1028", x, top, 1, hz + 3 - top); }
      const lx = Math.round(W * 0.9), lb = Math.round(hz - H * 0.1);
      p.R("#a8b0c8", lx - 1, lb - 9, 3, 9); p.R("#a04050", lx - 1, lb - 6, 3, 2); p.R("#f8e890", lx - 1, lb - 11, 3, 2); p.R("#202838", lx - 2, lb - 12, 5, 1);
      p.bands(["#383c60", "#40446a", "#484c74"], 0, shore, W, H);
      p.speck("#30344e", 0, shore + 2, W, H - shore - 2, W * 0.4, 5);
    },
    anim(p, W, H, t) {
      const hz = Math.round(H * 0.52), shore = Math.round(H * 0.78), mx = Math.round(W * 0.7);
      const r = rng(11);
      for (let i = 0; i < 10; i++) {
        const x = Math.round(r() * W), y = Math.round(r() * hz * 0.8);
        if (Math.abs(x - mx) < 14 && y < H * 0.35) continue;
        if (((t / 300 + i * 3) | 0) % 10 === 0) { p.P("#f8f8e8", x, y); p.P("#a8b8e8", x - 1, y); p.P("#a8b8e8", x + 1, y); p.P("#a8b8e8", x, y - 1); p.P("#a8b8e8", x, y + 1); }
        else p.P("#8898d0", x, y);
      }
      for (let y = hz + 2, i = 0; y < shore - 1; y += 2, i++) {
        const w = 3 + (y - hz) / 3, j = ((i * 3 + ((t / 280) | 0)) % 3) - 1;
        p.R("#d8d0a8", mx - w / 2 + j, y, Math.max(1, w * 0.5), 1); p.R("#7880b0", mx + w * 0.2 - j, y, Math.max(1, w * 0.35), 1);
      }
      const lx = Math.round(W * 0.9), ly = Math.round(hz - H * 0.1) - 11, ph = ((t / 600) | 0) % 4;
      if (ph !== 3) p.R("#f8f8d0", lx - 1, ly, 3, 2);
      if (ph === 0) { p.R("#6870a8", lx - 24, ly, 22, 1); p.R("#9098c8", lx - 8, ly, 6, 1); }
      if (ph === 2) { p.R("#6870a8", lx + 2, ly, W - lx, 1); p.R("#9098c8", lx + 2, ly, 5, 1); }
      const sw = Math.round(Math.sin(t / 1000) * 1.5);
      p.R("#6878b0", 0, shore - 1 + sw, W, 1);
      for (let x = ((t / 140) | 0) % 9 - 9; x < W; x += 9) p.R("#8898c8", x, shore + sw, 4, 1);
    },
  },

  field: {
    base(p, W, H) {
      const hz = Math.round(H * 0.42), p0 = Math.round(H * 0.84), p1 = Math.round(H * 0.95);
      p.bands(["#68a8e8", "#80b8f0", "#a0ccf0", "#c0dcf0"], 0, 0, W, hz);
      cloud(p, W * 0.28, H * 0.1, 24); cloud(p, W * 0.78, H * 0.16, 18);
      let bx = Math.round(W * 0.74), barnTop = hz;
      for (let x = 0; x < W; x++) {
        const far = Math.round(hz - 7 - 3 * Math.sin(x * 0.05 + 1)); p.R("#98c0b0", x, far, 1, hz - far);
        const near = Math.round(hz - 3 - 3 * Math.sin(x * 0.035 + 2.5)); p.R("#78a858", x, near, 1, hz - near);
        if (x === bx) barnTop = near;
      }
      p.R("#c04838", bx - 4, barnTop - 5, 8, 5); p.R("#e8e0d0", bx - 1, barnTop - 3, 2, 3); // little red barn
      p.R("#803028", bx - 5, barnTop - 6, 10, 1); p.R("#803028", bx - 3, barnTop - 7, 6, 1);
      p.R("#3e7030", 0, hz, W, H - hz);
      p.R("#e8c040", 0, hz + 1, W, 3); p.speck("#4e8038", 0, hz + 1, W, 3, W * 0.5, 2); p.speck("#f8e070", 0, hz + 1, W, 3, W * 0.3, 3);
      const r = rng(3), rowY = [hz + 7, hz + 10, Math.round(hz + (p0 - hz) * 0.5), p0 - 7];
      p.speck("#58a040", 0, hz + 4, W, p0 - hz - 4, W * 1.2, 4); p.speck("#2e5a28", 0, hz + 4, W, p0 - hz - 4, W * 0.8, 6);
      for (let x = 1 + r() * 3; x < W; x += 3 + r() * 2) sunflower(p, x, rowY[0] + r() * 2, 0);
      for (let x = 2 + r() * 4; x < W; x += 5 + r() * 2) sunflower(p, x, rowY[1] + r() * 3, 1);
      for (let x = 3 + r() * 5; x < W; x += 8 + r() * 3) sunflower(p, x, rowY[2] + r() * 3, 2);
      for (let x = 4 + r() * 6; x < W; x += 11 + r() * 3) sunflower(p, x, rowY[3] - 5 + r() * 3, 3);
      p.R("#b08858", 0, p0, W, p1 - p0); p.R("#8a6a40", 0, p0, W, 1); // dirt path
      p.speck("#c8a070", 0, p0 + 1, W, p1 - p0 - 1, W * 0.3, 8); p.speck("#987048", 0, p0 + 1, W, p1 - p0 - 1, W * 0.2, 9);
      p.R("#3e7030", 0, p1, W, H - p1);
      for (let x = 6 + r() * 4; x < W; x += 16 + r() * 6) sunflower(p, x, H - 1, 3);
    },
    anim(p, W, H, t) {
      const hz = Math.round(H * 0.42);
      const x = Math.round(W * 0.5 + Math.sin(t / 1300) * W * 0.38), y = Math.round(hz + 12 + Math.sin(t / 470) * 4);
      const up = ((t / 140) | 0) % 2;
      p.P("#202028", x, y);
      if (up) { p.P("#f8f8f8", x - 1, y - 1); p.P("#f8f8f8", x + 1, y - 1); } else { p.R("#f8f8f8", x - 2, y, 2, 1); p.R("#f8f8f8", x + 1, y, 2, 1); }
    },
  },

  town: {
    base(p, W, H) {
      const hz = Math.round(H * 0.5), walk = Math.round(H * 0.8), curb = Math.round(H * 0.94);
      p.bands(SKY_DAY, 0, 0, W, walk);
      cloud(p, W * 0.3, H * 0.08, 24);
      for (let x = 0; x < W; x++) { const top = Math.round(hz - 16 - 5 * Math.sin(x * 0.04)); p.R("#90b890", x, top, 1, walk - top); }
      const FILL = ["#e89888", "#f0d488", "#90c8d0", "#c0a8d8", "#f0e8d8", "#a8d098"];
      const DARK = ["#c07068", "#c8a860", "#68a0b0", "#9880b8", "#c8c0b0", "#80a870"];
      const AWN = ["#d86040", "#3868a8", "#58a848", "#8870b8", "#d86040", "#3868a8"];
      const r = rng(12);
      let i = 0;
      for (let x = -4; x < W; i++) {
        const bw = 24 + ((r() * 10) | 0), bh = Math.round(H * 0.3 + r() * H * 0.12), top = walk - bh, c = i % FILL.length;
        p.R(FILL[c], x, top, bw, bh); p.R(DARK[c], x + bw - 2, top, 2, bh);
        p.R("#f8f0e0", x - 1, top, bw + 2, 2); p.R(DARK[c], x - 1, top + 2, bw + 2, 1); // false-front cornice
        p.R("#f8f0d8", x + 3, top + 4, bw - 7, 5); p.R("#8a6038", x + 3, top + 8, bw - 7, 1); // sign
        for (let k = x + 5; k < x + bw - 6; k += 2) p.P(AWN[c], k, top + 6);
        for (const wx of [x + 4, x + bw - 10]) { p.R("#f8f0e0", wx, top + 11, 6, 7); p.R("#5078a8", wx + 1, top + 12, 4, 5); p.P("#b8d8f0", wx + 1, top + 12); }
        const ay = walk - 17; // striped awning
        for (let k = 0; k < bw - 2; k++) p.R(((k >> 1) & 1) ? "#f8f8f0" : AWN[c], x + 1 + k, ay, 1, 3 + (k & 1));
        p.R("#384878", x + 3, walk - 12, Math.round(bw * 0.5), 10); p.P("#98b8e0", x + 4, walk - 11); p.P("#98b8e0", x + 5, walk - 10); p.R("#f8f0e0", x + 3, walk - 3, Math.round(bw * 0.5), 1);
        p.R("#6a4020", x + bw - 10, walk - 13, 7, 13); p.R("#8a5a30", x + bw - 9, walk - 12, 5, 12); p.P("#f8d048", x + bw - 6, walk - 6);
        if (i % 2 === 0) { const px = x + 3 + Math.round(bw * 0.5) + 1; p.ell("#b85820", px, walk - 2, 2, 1.5); p.ell("#e87830", px, walk - 2, 1.5, 1); p.P("#4a9038", px, walk - 4); } // pumpkin
        x += bw + 1; p.R("#586070", x - 1, top + 2, 1, bh - 2);
      }
      p.R("#d8ccb8", 0, walk, W, curb - walk); p.R("#a89c88", 0, walk, W, 1);
      for (let x = 5; x < W; x += 10) p.R("#c0b4a0", x, walk + 1, 1, curb - walk - 1);
      for (const lx of [Math.round(W * 0.38), Math.round(W * 0.9)]) { p.R("#2e4a40", lx, walk - 22, 1, 22); p.R("#2e4a40", lx - 1, walk - 25, 3, 1); p.R("#f8e8a0", lx - 1, walk - 24, 3, 2); p.R("#2e4a40", lx - 1, walk - 1, 3, 1); }
      p.R("#e8e0d0", 0, curb, W, 1); p.R("#6a6a78", 0, curb + 1, W, H - curb);
      p.speck("#5a5a68", 0, curb + 1, W, H - curb, W * 0.2, 3);
    },
    anim(p, W, H, t) { gull(p, W + 10 - ((t / 50) % (W + 20)), H * 0.12 + Math.sin(t / 600) * 2, t); },
  },

  inn: {
    base(p, W, H) {
      const wain = Math.round(H * 0.56), wb = Math.round(H * 0.78);
      p.R("#f0dcb4", 0, 0, W, wain); // wallpaper
      for (let x = 3; x < W; x += 8) p.R("#e4c898", x, 0, 2, wain);
      for (let y = 8; y < wain - 2; y += 8) for (let x = 7 + ((y / 8) & 1) * 4; x < W; x += 8) p.P("#d8a878", x, y);
      p.R("#8a5a30", 0, 0, W, 3); p.R("#b07a48", 0, 3, W, 1);
      p.R("#9a6238", 0, wain, W, wb - wain); p.R("#c08850", 0, wain, W, 2); p.R("#6a4020", 0, wain + 2, W, 1);
      for (let x = 2; x < W; x += 16) { p.R("#7e4c2c", x, wain + 5, 12, wb - wain - 9); p.R("#a86c40", x + 1, wain + 6, 10, wb - wain - 11); }
      p.R("#6a4020", 0, wb - 2, W, 2);
      p.R("#b88050", 0, wb, W, H - wb); // floor
      for (let y = wb + 3, k = 0; y < H; y += 4, k++) { p.R("#9a6840", 0, y, W, 1); for (let x = (k * 13) % 24; x < W; x += 24) p.R("#9a6840", x, y - 3, 1, 3); }
      const rx = Math.round(W * 0.18), rw = Math.round(W * 0.64), ry = wb + 5; // rug
      p.R("#f0e0c0", rx - 1, ry + 1, rw + 2, H - ry - 2); p.R("#a83838", rx, ry, rw, H - ry); p.R("#d05848", rx + 2, ry + 2, rw - 4, H - ry - 3);
      for (let x = rx + 4; x < rx + rw - 4; x += 4) p.P("#e8c060", x, ry + 3 + ((x >> 2) & 1));
      const wx = Math.round(W * 0.06), wy = Math.round(H * 0.12), ww = Math.round(W * 0.22), wh = Math.round(H * 0.3); // window
      p.R("#f8f0e0", wx, wy, ww, wh); p.bands(["#90c8f0", "#b0d8f0"], wx + 2, wy + 2, ww - 4, wy + Math.round(wh * 0.6));
      p.R("#4888c8", wx + 2, wy + Math.round(wh * 0.6), ww - 4, wh - Math.round(wh * 0.6) - 2); p.R("#c8e0f0", wx + 2, wy + Math.round(wh * 0.6), ww - 4, 1);
      p.R("#f8f0e0", wx + Math.round(ww / 2) - 1, wy, 2, wh); p.R("#f8f0e0", wx, wy + Math.round(wh * 0.45), ww, 2);
      p.R("#8a5a30", wx - 3, wy - 3, ww + 6, 1);
      p.R("#d86040", wx - 2, wy - 2, 4, wh + 4); p.R("#d86040", wx + ww - 2, wy - 2, 4, wh + 4); p.R("#a03828", wx - 1, wy, 1, wh + 2); p.R("#a03828", wx + ww, wy, 1, wh + 2);
      const fx = Math.round(W * 0.42), fy = Math.round(H * 0.14); // framed sunflower picture
      p.R("#8a6420", fx, fy, 16, 13); p.R("#c89830", fx + 1, fy + 1, 14, 11); p.R("#90c8f0", fx + 2, fy + 2, 12, 9); p.R("#58a848", fx + 2, fy + 8, 12, 3);
      sunflower(p, fx + 8, fy + 5, 2);
      const lx = Math.round(W * 0.6); // pendant lamp
      p.R("#4a3020", lx, 0, 1, Math.round(H * 0.1)); p.R("#e8b048", lx - 2, Math.round(H * 0.1), 5, 2); p.R("#e8b048", lx - 3, Math.round(H * 0.1) + 2, 7, 2); p.R("#f8f0b0", lx - 2, Math.round(H * 0.1) + 4, 5, 1);
      const kx = Math.round(W * 0.78), ky = Math.round(H * 0.2); // key board
      p.R("#6a4020", kx, ky, 16, 11); p.R("#8a5430", kx + 1, ky + 1, 14, 9);
      for (let k = 0; k < 4; k++) { p.P("#f8d048", kx + 2 + k * 4, ky + 3); p.R("#f8d048", kx + 2 + k * 4, ky + 5, 1, 2); }
      const dx = Math.round(W * 0.64), dt = Math.round(H * 0.52); // reception desk
      p.R("#6a4020", dx, dt, W - dx, wb - dt); p.R("#d8a060", dx - 1, dt, W - dx + 1, 2); p.R("#b07a48", dx - 1, dt + 2, W - dx + 1, 1);
      for (let x = dx + 3; x < W - 3; x += 10) p.R("#8a5430", x, dt + 5, 7, wb - dt - 8);
      const bx = dx + 6; p.R("#c89830", bx - 2, dt - 1, 5, 1); p.R("#f8d048", bx - 1, dt - 3, 3, 2); p.P("#f8f8e8", bx - 1, dt - 3); p.P("#c89830", bx, dt - 4);
      p.R("#f8f0e0", dx + 13, dt - 1, 6, 1); p.R("#a03828", dx + 13, dt - 2, 6, 1);
      const px = Math.round(W * 0.05); // potted plant
      p.R("#a04838", px - 3, wb - 8, 7, 6); p.R("#c86848", px - 2, wb - 8, 5, 5); p.R("#a04838", px - 4, wb - 9, 9, 1);
      p.ell("#307838", px, wb - 13, 5, 3); p.ell("#58a848", px - 1, wb - 14, 3, 2); p.P("#88c860", px - 2, wb - 15);
    },
  },

  hideout: {
    base(p, W, H) {
      const wb = Math.round(H * 0.78);
      for (let y = 4, k = 0; y < wb; y += 6, k++) { // log walls
        p.R("#b07850", 0, y, W, 6); p.R("#c89060", 0, y + 1, W, 1); p.R("#6a4428", 0, y + 5, W, 1);
        for (let x = (k * 17) % 40; x < W; x += 40) p.R("#8a5a38", x, y + 2, 1, 3);
      }
      p.speck("#8a5a38", 0, 4, W, wb - 4, W * 0.15, 31);
      p.R("#5a3820", 0, 0, W, 4); p.R("#7a5030", 0, 3, W, 1);
      for (let x = 0; x < W; x++) p.P("#3a2818", x, 6 + Math.round(3 * Math.sin((Math.PI * (x % 32)) / 32))); // string-light wire
      const wx = Math.round(W * 0.1), wy = Math.round(H * 0.16), ww = Math.round(W * 0.3), wh = Math.round(H * 0.3); // window
      p.R("#5a3820", wx - 1, wy - 1, ww + 2, wh + 2); p.R("#e8d8b8", wx, wy, ww, wh);
      p.bands(["#9878b8", "#d88898", "#f0a878"], wx + 2, wy + 2, ww - 4, wy + wh - 2);
      for (let x = wx + 2; x < wx + ww - 2; x++) { const h = 3 + ((x * 7) % 5) + (x % 6 === 0 ? 4 : 0); p.R("#3a4a48", x, wy + wh - 2 - h, 1, h); }
      p.R("#e8d8b8", wx + Math.round(ww / 2) - 1, wy, 2, wh); p.R("#e8d8b8", wx, wy + Math.round(wh / 2) - 1, ww, 2);
      p.R("#c8a878", wx - 2, wy + wh, ww + 4, 2);
      const cx0 = Math.round(W * 0.04), cw = Math.round(W * 0.44), ct = wb - 15; // couch
      p.R("#3a5088", cx0, ct, cw, wb - ct); p.R("#5878b0", cx0 + 1, ct + 1, cw - 2, 7); p.R("#6a8ac0", cx0 + 4, ct + 8, cw - 8, 3);
      p.R("#4a68a0", cx0 + 1, ct + 4, 4, wb - ct - 5); p.R("#4a68a0", cx0 + cw - 5, ct + 4, 4, wb - ct - 5); p.R("#3a5088", cx0 + 4, wb - 3, cw - 8, 1);
      p.R("#f0a0b0", cx0 + 6, ct + 3, 6, 5); p.R("#f8d048", cx0 + cw - 12, ct + 3, 6, 5); p.P("#f8e890", cx0 + cw - 11, ct + 4); p.P("#f8c8d0", cx0 + 7, ct + 4);
      const fx = Math.round(W * 0.64), fw = Math.round(W * 0.3), ft = Math.round(H * 0.24); // stone fireplace
      p.R("#8c7c68", fx, 4, fw, wb - 4);
      for (let y = ft, k = 0; y < wb; y += 4, k++) for (let x = fx + (k & 1) * 3; x < fx + fw - 1; x += 6) p.R("#b0a088", x, y + 1, 5, 3);
      p.R("#8c7c68", fx + 3, 4, fw - 6, ft - 4); p.R("#a09078", fx + 4, 4, fw - 8, ft - 4);
      const ox = fx + Math.round(fw * 0.2), ow = Math.round(fw * 0.6), ot = Math.round(H * 0.5);
      p.R("#6a4020", fx - 2, ot - 5, fw + 4, 3); p.R("#8a5a30", fx - 2, ot - 5, fw + 4, 1); // mantel
      p.R("#f8f0e0", fx + 3, ot - 9, 2, 4); p.P("#f8d048", fx + 3, ot - 10); // candle
      p.R("#d86040", fx + fw - 8, ot - 8, 4, 3); p.P("#d86040", fx + fw - 4, ot - 7); // mug
      p.R("#281818", ox, ot, ow, wb - ot); p.R("#3a2420", ox + 1, ot + 1, ow - 2, 2);
      p.R("#6a4020", ox + 2, wb - 3, ow - 4, 2); p.R("#8a5a30", ox + 3, wb - 4, ow - 6, 1);
      p.R("#8a5a38", 0, wb, W, H - wb); // floor
      for (let y = wb + 3; y < H; y += 4) p.R("#6a4428", 0, y, W, 1);
      p.R("#5a3820", 0, wb, W, 1);
      const rx = Math.round(W * 0.26), rw = Math.round(W * 0.48), ry = wb + 5; // rug
      p.R("#f0e0c0", rx - 1, ry + 1, rw + 2, H - ry - 2); p.R("#5878b0", rx, ry, rw, H - ry); p.R("#d8a8a0", rx + 2, ry + 2, rw - 4, H - ry - 3);
      for (let x = rx + 3; x < rx + rw - 3; x += 3) p.P("#f8f0e0", x, ry + 4 + ((x / 3) & 1));
    },
    anim(p, W, H, t) {
      const wb = Math.round(H * 0.78), fx = Math.round(W * 0.64), fw = Math.round(W * 0.3);
      const ox = fx + Math.round(fw * 0.2), ow = Math.round(fw * 0.6);
      for (let i = 0; i < ow - 4; i += 2) {
        const h = 3 + (((t / 110) | 0) + i * 7) % 4 + (i > 1 && i < ow - 7 ? 2 : 0);
        p.R("#d86040", ox + 2 + i, wb - 3 - h, 2, h); p.R("#f8a040", ox + 2 + i, wb - 3 - h + 2, 1, h - 2); if (h > 5) p.P("#f8e070", ox + 2 + i, wb - 5);
      }
      const COL = ["#f8d048", "#f07860", "#80c0e8", "#88d070"];
      stringBulbs(W).forEach(([x, y], i) => p.R(((t / 500 + i) | 0) % 3 ? COL[i % 4] : "#6a5040", x, y + 1, 2, 2));
    },
  },

  doorway: {
    base(p, W, H) {
      const wb = Math.round(H * 0.9) - 1, rail = Math.round(H * 0.58);
      p.R("#e8d4b0", 0, 0, W, rail);
      for (let x = 4; x < W; x += 10) p.R("#dcc49c", x, 0, 1, rail);
      p.R("#d8bc90", 0, rail, W, wb - rail); p.R("#b08858", 0, rail, W, 2); p.R("#8a6038", 0, rail + 2, W, 1);
      p.R("#8a6038", 0, wb - 2, W, 2);
      const dw = Math.max(34, Math.round(W * 0.32)), dx = Math.round(W / 2 - dw / 2), dt = Math.round(H * 0.2);
      p.R("#6a4020", dx - 4, dt - 4, dw + 8, wb - dt + 4); p.R("#a06a3a", dx - 3, dt - 3, dw + 6, wb - dt + 3); p.R("#c08850", dx - 3, dt - 3, dw + 6, 1);
      p.R("#6a5a80", dx, dt, dw, wb - dt); // dim bedroom beyond
      p.R("#7a5a4a", dx, wb - 7, dw, 7); p.R("#6a4a40", dx, wb - 7, dw, 1);
      const ix = dx + Math.round(dw * 0.55), iy = dt + 5; // bedroom window with moon
      p.R("#6a6088", ix - 1, iy - 1, 12, 11); p.R("#3a4a88", ix, iy, 10, 9); p.disc("#f0e8c0", ix + 6, iy + 3, 1.6); p.R("#6a6088", ix + 4, iy, 1, 9);
      const bx = dx + 2, bw = Math.round(dw * 0.5); // bed
      p.R("#4a3428", bx, wb - 17, 3, 12); p.R("#e8e0f0", bx + 3, wb - 12, 6, 3); p.R("#8870b8", bx + 3, wb - 10, bw, 4); p.R("#a890d0", bx + 3, wb - 10, bw, 1);
      p.R("#9a6434", dx + dw - 7, dt + 1, 6, wb - dt - 1); p.R("#b07840", dx + dw - 6, dt + 3, 4, wb - dt - 6); p.P("#f8d048", dx + dw - 6, Math.round((dt + wb) / 2)); // open door leaf
      p.R("#c89868", dx - 4, wb - 1, dw + 8, 2); // threshold
      const tx = Math.round(W * 0.1); // side table + lamp
      p.R("#6a4020", tx, wb - 12, 14, 2); p.R("#8a5a30", tx + 1, wb - 10, 2, 10); p.R("#8a5a30", tx + 11, wb - 10, 2, 10);
      for (let y = wb - 27; y < wb - 12; y++) for (let x = tx + (y & 1); x < tx + 15; x += 2) if (Math.hypot(x - tx - 7, y - wb + 20) < 7.5) p.P("#f0e0b8", x, y); p.R("#6a4020", tx + 6, wb - 17, 2, 5); p.R("#f8d890", tx + 3, wb - 23, 8, 5); p.R("#e8b868", tx + 3, wb - 19, 8, 1);
      const px = Math.round(W * 0.8), py = Math.round(H * 0.28); // framed photo with a heart
      p.R("#8a6420", px, py, 13, 11); p.R("#c89830", px + 1, py + 1, 11, 9); p.R("#f8f0e0", px + 2, py + 2, 9, 7);
      p.grid(["pp.pp", "ppppp", ".ppp.", "..p.."], px + 4, py + 3);
      p.R("#a87450", 0, wb, W, H - wb);
      for (let y = wb + 3; y < H; y += 3) p.R("#8a5a38", 0, y, W, 1);
    },
  },

  battle: {
    base(p, W, H) {
      const hz = Math.round(H * 0.24);
      p.bands(["#78b8f0", "#98ccf0", "#b8dcf0"], 0, 0, W, hz - 4);
      cloud(p, W * 0.25, H * 0.08, 20);
      p.R("#5898d0", 0, hz - 4, W, 4); p.R("#b8dcf0", 0, hz - 4, W, 1);
      for (let y = hz, k = 0; y < H; y += 6, k++) p.R(k % 2 ? "#a8d878" : "#98cc68", 0, y, W, 6);
      p.speck("#78b050", 0, hz, W, H - hz, W * 0.25, 5);
      const plat = (cx, cy, rx, ry) => { p.ell("#6a9a48", cx, cy + 1, rx, ry + 1); p.ell("#c8e8a0", cx, cy, rx - 1, ry); p.ell("#e0f4c0", cx - rx * 0.2, cy - 1, rx * 0.5, Math.max(1, ry * 0.4)); };
      plat(W * 0.73, H * 0.34 + 3, W * 0.21, 5);
      plat(W * 0.25, H * 0.84 + 3, W * 0.21, 6);
    },
  },

  title: {
    base(p, W, H) {
      const hz = Math.round(H * 0.55);
      p.bands(["#c0a8d8", "#e8b8c8", "#f8c8b8", "#f8d8b0", "#f8e8c0"], 0, 0, W, hz);
      p.disc("#f8e8a0", W * 0.5, hz, Math.max(6, Math.round(W * 0.1)), hz); p.disc("#f8f8d8", W * 0.5, hz, Math.max(3, Math.round(W * 0.06)), hz);
      p.bands(["#7ab0e0", "#5a98d0", "#4888c0"], 0, hz, W, H);
      p.R("#f8f0d0", 0, hz, W, 1);
    },
    anim(p, W, H, t) {
      const hz = Math.round(H * 0.55);
      for (let y = hz + 4, i = 0; y < H; y += 5, i++) { const gap = 14, off = ((t / (120 + i * 20)) | 0) % gap; for (let x = off - gap + i * 5; x < W; x += gap) p.R("#b8dcf0", x, y, 3, 1); }
    },
  },

  plain: { base(p, W, H) { p.bands(SKY_DAY, 0, 0, W, H); } },
};

// Static layers are painted once per (scene, size) into an offscreen canvas.
const _layers = new Map();
function layer(name, W, H, paint) {
  if (typeof document === "undefined") return null;
  const key = name + ":" + W + "x" + H;
  let c = _layers.get(key);
  if (!c) {
    if (_layers.size > 16) _layers.clear();
    c = document.createElement("canvas"); c.width = W; c.height = H;
    paint(pen(c.getContext("2d")));
    _layers.set(key, c);
  }
  return c;
}

export function drawBg(ctx, name, W, H, t = 0) {
  let scene;
  switch (name) {
    case "beach": scene = SCENES.beach; break;
    case "road": scene = SCENES.road; break;
    case "sunset": scene = SCENES.sunset; break;
    case "night": scene = SCENES.night; break;
    case "field": scene = SCENES.field; break;
    case "town": scene = SCENES.town; break;
    case "inn": scene = SCENES.inn; break;
    case "hideout": scene = SCENES.hideout; break;
    case "doorway": scene = SCENES.doorway; break;
    case "battle": scene = SCENES.battle; break;
    case "title": scene = SCENES.title; break;
    default: scene = SCENES.plain; name = "plain";
  }
  const base = layer(name, W, H, (p) => scene.base(p, W, H));
  if (base) ctx.drawImage(base, 0, 0); else scene.base(pen(ctx), W, H);
  if (scene.anim) scene.anim(pen(ctx), W, H, t);
}
