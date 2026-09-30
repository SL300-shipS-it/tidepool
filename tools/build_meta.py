#!/usr/bin/env python3
"""Build link-preview tags, Home Screen icons and the web manifest from config.js + js/art.js (CR-016/018).

    python3 tools/build_meta.py

Reads GAME_TITLE / SHORT_TITLE / SUBTITLE / BASE_URL from config.js and the `gidget` sprite + PAL
from js/art.js, then writes (idempotent, safe to rerun after art or title changes):
  assets/icons/og-card.png          1200x630 link-preview title card (iMessage, etc.)
  assets/icons/apple-touch-icon.png 180x180 Home Screen icon
  assets/icons/icon-512.png         512x512 manifest icon
  assets/icons/favicon-32.png       32x32 tab icon
  manifest.webmanifest
  index.html: the <head> block between <!-- meta:start --> and <!-- meta:end -->,
              plus the title-screen text (#titleText, #titleSub).
Uses Pillow if present, else a tiny built-in PNG writer. Python 3.8+.
"""
import html
import json
import re
import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "assets" / "icons"
DESCRIPTION = "A letter from DR. JOSEPHSON has arrived."

# UI tokens (match :root in styles.css)
BG = "#e0f0f8"
SLATE = "#384850"
SLATE2 = "#506878"
PAPER = "#f8f8f8"
CORAL = "#d86040"
CREAM = "#f8f8e8"


def die(msg):
    sys.exit("build_meta: " + msg)


# ---------- inputs ----------
def read_config():
    src = (ROOT / "config.js").read_text(encoding="utf-8")
    out = {}
    for key in ("GAME_TITLE", "SHORT_TITLE", "SUBTITLE", "BASE_URL"):
        m = re.search(r"\b%s\s*:\s*\"([^\"]*)\"" % key, src)
        if not m:
            die("config.js is missing %s" % key)
        out[key] = m.group(1)
    if not out["BASE_URL"].startswith("https://") or not out["BASE_URL"].endswith("/"):
        die("BASE_URL must be an absolute https URL ending in '/' (og:image needs it)")
    return out


def read_art(name="gidget"):
    src = (ROOT / "js" / "art.js").read_text(encoding="utf-8")
    m = re.search(r"export\s+const\s+PAL\s*=\s*\{(.*?)\};", src, re.S)
    if not m:
        die("could not find `export const PAL = {...};` in js/art.js")
    pal = {k: v for k, v in re.findall(r"\b([A-Za-z])\s*:\s*\"(#[0-9a-fA-F]{6})\"", m.group(1))}
    m = re.search(r"\n\s*%s\s*:\s*\[(.*?)\]" % re.escape(name), src, re.S)
    if not m:
        die("could not find sprite `%s: [ ... ]` in js/art.js" % name)
    body = re.sub(r"//[^\n]*", "", m.group(1))
    rows = re.findall(r"\"([^\"]*)\"", body)
    if not rows or len({len(r) for r in rows}) != 1:
        die("sprite `%s` is not a rectangular list of strings" % name)
    for r in rows:
        for ch in r:
            if ch != "." and ch not in pal:
                die("sprite `%s` uses letter %r that is not in PAL" % (name, ch))
    return rows, pal


# ---------- tiny raster ----------
def rgb(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


class Canvas:
    def __init__(self, w, h, fill):
        self.w, self.h = w, h
        c = rgb(fill)
        self.px = [bytearray(bytes(c) * w) for _ in range(h)]

    def rect(self, x, y, w, h, color):
        c = bytes(rgb(color))
        x0, y0, x1, y1 = max(0, x), max(0, y), min(self.w, x + w), min(self.h, y + h)
        if x1 <= x0:
            return
        for yy in range(y0, y1):
            self.px[yy][x0 * 3:x1 * 3] = c * (x1 - x0)

    def frame(self, x, y, w, h, t, color):
        self.rect(x, y, w, t, color)
        self.rect(x, y + h - t, w, t, color)
        self.rect(x, y, t, h, color)
        self.rect(x + w - t, y, t, h, color)

    def sprite(self, rows, pal, x, y, s):
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch != ".":
                    self.rect(x + i * s, y + j * s, s, s, pal[ch])

    def save(self, path):
        try:
            from PIL import Image
            img = Image.frombytes("RGB", (self.w, self.h), b"".join(bytes(r) for r in self.px))
            img.save(str(path), optimize=True)
            return "PIL"
        except ImportError:
            raw = b"".join(b"\x00" + bytes(r) for r in self.px)
            def chunk(t, d):
                return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
            data = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", self.w, self.h, 8, 2, 0, 0, 0))
                    + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
            Path(path).write_bytes(data)
            return "zlib"


def box(cv, x, y, w, h, ring, border, fill_color, corner):
    """The game's framed box: slate ring, coral border, paper inside, stepped corners."""
    cv.rect(x, y, w, h, SLATE)
    cv.rect(x + ring, y + ring, w - 2 * ring, h - 2 * ring, CORAL)
    cv.rect(x + ring + border, y + ring + border, w - 2 * (ring + border), h - 2 * (ring + border), fill_color)
    # stepped corners on the coral/paper edge
    for i in range(corner):
        for (cx, cy, dx, dy) in ((x + ring, y + ring, 1, 1), (x + w - ring - 1, y + ring, -1, 1),
                                 (x + ring, y + h - ring - 1, 1, -1), (x + w - ring - 1, y + h - ring - 1, -1, -1)):
            ln = corner - i
            px = cx if dx > 0 else cx - ln + 1
            py = cy + i * dy
            cv.rect(px, py, ln, 1, SLATE)


# ---------- 5x7 pixel font (original, blocky) ----------
FONT = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "J": ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
    "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
    ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
    "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
    "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
    " ": ["00000"] * 7,
}


def text_width(s, scale):
    return (len(s) * 6 - 1) * scale if s else 0


def draw_text(cv, s, x, y, scale, color, shadow=None, sh=0):
    for pass_color, off in (((shadow, sh),) if shadow else ()) + ((color, 0),):
        cx = x + off
        for ch in s.upper():
            g = FONT.get(ch)
            if g is None:
                die("the pixel font has no glyph for %r (add it to FONT)" % ch)
            for j, row in enumerate(g):
                for i, bit in enumerate(row):
                    if bit == "1":
                        cv.rect(cx + i * scale, y + off + j * scale, scale, scale, pass_color)
            cx += 6 * scale


def wrap(s, scale, max_w):
    lines, cur = [], ""
    for word in s.split():
        t = (cur + " " + word).strip()
        if cur and text_width(t, scale) > max_w:
            lines.append(cur)
            cur = word
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines


# ---------- images ----------
def og_card(cfg, rows, pal):
    W, H = 1200, 630
    cv = Canvas(W, H, SLATE)
    m = 36
    box(cv, m, m, W - 2 * m, H - 2 * m, 10, 8, PAPER, 6)
    inner_x, inner_y, inner_w, inner_h = m + 18, m + 18, W - 2 * m - 36, H - 2 * m - 36
    sh, sw = len(rows), len(rows[0])
    # Gidget on a cream pad, left side
    pad = 400
    px, py = inner_x + 34, inner_y + (inner_h - pad) // 2
    cv.rect(px, py, pad, pad, CREAM)
    s = min((pad - 24) // sw, (pad - 24) // sh)
    cv.sprite(rows, pal, px + (pad - sw * s) // 2, py + (pad - sh * s) // 2, s)
    # Title, right side (SHORT_TITLE big, SUBTITLE small), slate with a coral drop shadow like the h1
    tx = px + pad + 44
    tw = inner_x + inner_w - 30 - tx
    big = cfg["SHORT_TITLE"].upper()
    sub = cfg["SUBTITLE"].upper()
    bscale = 13
    blines = wrap(big, bscale, tw)
    while bscale > 4 and (len(blines) > 3 or any(text_width(l, bscale) > tw for l in blines)):
        bscale -= 1
        blines = wrap(big, bscale, tw)
    sscale = 5
    slines = wrap(sub, sscale, tw)
    bh = len(blines) * 7 * bscale + (len(blines) - 1) * 4 * bscale
    rule = 36
    shh = len(slines) * 7 * sscale + (len(slines) - 1) * 5 * sscale
    total = bh + rule + shh
    y = inner_y + (inner_h - total) // 2
    for l in blines:
        draw_text(cv, l, tx + (tw - text_width(l, bscale)) // 2, y, bscale, SLATE, CORAL, max(3, bscale // 3))
        y += 11 * bscale
    y += rule - 4 * bscale
    cv.rect(tx + 20, y - rule // 2 - 3, tw - 40, 6, CORAL)
    for l in slines:
        draw_text(cv, l, tx + (tw - text_width(l, sscale)) // 2, y, sscale, SLATE2)
        y += 12 * sscale
    return cv


def icon(size, rows, pal, framed=True):
    cv = Canvas(size, size, BG)
    sh, sw = len(rows), len(rows[0])
    if framed:
        ring = max(2, round(size * 0.055))
        border = max(1, round(size * 0.022))
        box(cv, 0, 0, size, size, ring, border, BG, 0)
        room = size - 2 * (ring + border) - max(2, round(size * 0.06))
    else:
        room = size
    s = max(1, min(room // sw, room // sh))
    cv.sprite(rows, pal, (size - sw * s) // 2, (size - sh * s) // 2, s)
    return cv


# ---------- text outputs ----------
def meta_block(cfg):
    e = lambda v: html.escape(v, quote=True)
    base = cfg["BASE_URL"]
    img = base + "assets/icons/og-card.png"
    t = cfg["GAME_TITLE"]
    lines = [
        "<!-- meta:start (generated by tools/build_meta.py from config.js; edits here are overwritten) -->",
        "<title>%s</title>" % e(cfg["SHORT_TITLE"]),
        '<meta name="description" content="%s">' % e(DESCRIPTION),
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="%s">' % e(cfg["SHORT_TITLE"]),
        '<meta property="og:title" content="%s">' % e(t),
        '<meta property="og:description" content="%s">' % e(DESCRIPTION),
        '<meta property="og:url" content="%s">' % e(base),
        '<meta property="og:image" content="%s">' % e(img),
        '<meta property="og:image:secure_url" content="%s">' % e(img),
        '<meta property="og:image:type" content="image/png">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta property="og:image:alt" content="%s">' % e(t),
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="%s">' % e(t),
        '<meta name="twitter:description" content="%s">' % e(DESCRIPTION),
        '<meta name="twitter:image" content="%s">' % e(img),
        '<meta name="apple-mobile-web-app-title" content="%s">' % e(cfg["SHORT_TITLE"]),
        '<meta name="application-name" content="%s">' % e(cfg["SHORT_TITLE"]),
        '<link rel="apple-touch-icon" sizes="180x180" href="assets/icons/apple-touch-icon.png">',
        '<link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon-32.png">',
        '<link rel="manifest" href="manifest.webmanifest">',
        "<!-- meta:end -->",
    ]
    return "\n".join(lines)


def update_index(cfg):
    p = ROOT / "index.html"
    src = p.read_text(encoding="utf-8")
    new, n = re.subn(r"<!-- meta:start.*?<!-- meta:end -->", lambda _: meta_block(cfg), src, flags=re.S)
    if n != 1:
        die("index.html needs exactly one <!-- meta:start --> ... <!-- meta:end --> block in <head>")
    if 'name="robots"' not in new:
        die("index.html lost its robots noindex tag")
    # Title screen text: each word of SHORT_TITLE on its own line (styles.css: #titleText span).
    spans = " ".join("<span>%s</span>" % html.escape(w) for w in cfg["SHORT_TITLE"].split())
    new, n1 = re.subn(r'(<h1 id="titleText"[^>]*>).*?(</h1>)', lambda m: m.group(1) + spans + m.group(2), new, flags=re.S)
    new, n2 = re.subn(r'(<p [^>]*id="titleSub"[^>]*>).*?(</p>)', lambda m: m.group(1) + html.escape(cfg["SUBTITLE"]) + m.group(2), new, flags=re.S)
    if n1 != 1 or n2 != 1:
        die("index.html needs one <h1 id=\"titleText\"> and one <p id=\"titleSub\">")
    if new != src:
        p.write_text(new, encoding="utf-8")
    return new != src


def write_manifest(cfg):
    m = {
        "name": cfg["GAME_TITLE"],
        "short_name": cfg["SHORT_TITLE"],
        "description": DESCRIPTION,
        "start_url": "./",
        "scope": "./",
        "display": "browser",  # CR-017 switches this to "standalone" together with canonSave
        "orientation": "portrait",
        "background_color": BG,
        "theme_color": BG,
        "icons": [
            {"src": "assets/icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png"},
            {"src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        ],
    }
    (ROOT / "manifest.webmanifest").write_text(json.dumps(m, indent=2) + "\n", encoding="utf-8")


def main():
    cfg = read_config()
    rows, pal = read_art("gidget")
    ICONS.mkdir(parents=True, exist_ok=True)
    how = og_card(cfg, rows, pal).save(ICONS / "og-card.png")
    icon(180, rows, pal).save(ICONS / "apple-touch-icon.png")
    icon(512, rows, pal).save(ICONS / "icon-512.png")
    icon(32, rows, pal, framed=False).save(ICONS / "favicon-32.png")
    write_manifest(cfg)
    changed = update_index(cfg)
    print("build_meta: OK (%s; gidget %dx%d; index.html %s)" % (how, len(rows[0]), len(rows), "updated" if changed else "unchanged"))


if __name__ == "__main__":
    main()
