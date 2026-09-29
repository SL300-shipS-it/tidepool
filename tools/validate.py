#!/usr/bin/env python3
"""Story checker. Run after every story edit:  python3 tools/validate.py

Checks story/story.json for broken links, unknown art/backgrounds/items, flags that are read but
never set, lines too long for the text box, and walks EVERY branch combination of the whole game
to make sure each path reaches the end without getting stuck. The walk runs once per combination of
config.js TOGGLES (read in conditions as "cfg.<name>"). Exit code 1 on errors.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
story = json.loads((ROOT / "story" / "story.json").read_text())
art_js = (ROOT / "js" / "art.js").read_text()
cfg_js = (ROOT / "config.js").read_text()

# Deploy-time toggles from config.js TOGGLES (read in story conditions as "cfg.<name>").
_tg = re.search(r"TOGGLES:\s*\{(.*?)\n\s*\}", cfg_js, re.S)
TOGGLES = {k: v == "true" for k, v in re.findall(r"^\s*(\w+):\s*(true|false)", _tg.group(1), re.M)} if _tg else {}

SPRITES = set(re.findall(r"^\s{2}(\w+): (?:withTail\(\[|\[)", art_js, re.M))
BADGE_ICONS = set(re.findall(r"^\s{2}(\w+): \[", art_js.split("BADGE_ICONS = {")[1], re.M)) | {"canele"}
BGS = set(re.findall(r'case "(\w+)"', art_js.split("export function drawBg")[1]))
TYPES = {"dialogue", "choice", "input", "encounter", "obstacle", "battle", "trainerCard", "letter", "photos", "credits"}
MAX_BOX = 90  # characters per text box (after {name} etc. expand to ~10 chars)

errors, warnings = [], []
err = errors.append
warn = warnings.append

scenes = story["scenes"]
badges = story["badges"]
items = story.get("items", {})
statuses = story.get("statuses", {})
battles = story.get("battles", {})
lists = story.get("lists", {})

flags_set, flags_read = {"name"}, set()

def read_cond(cond, where):
    for k, want in (cond or {}).items():
        if k.startswith("cfg."):
            if k[4:] not in TOGGLES: err(f"{where}: condition uses toggle '{k}' but config.js TOGGLES has no '{k[4:]}'")
            elif not isinstance(want, bool): err(f"{where}: toggle condition '{k}' must be true or false")
        elif k != "hasKey":
            flags_read.add(k)

def text_flags(s):
    for m in re.findall(r"\{(?:L|f)\.(\w+)\}", s or ""):
        flags_read.add(m)

def check_line(line, where):
    text_flags(line)
    n = len(re.sub(r"\{[^}]+\}", "X" * 10, line))
    if n > MAX_BOX:
        warn(f"{where}: text box is {n} chars (max ~{MAX_BOX}); split it: {line[:40]}...")

def targets(next_, where):
    out = []
    if next_ is None:
        return out
    if isinstance(next_, str):
        out.append(next_)
    else:
        for n in next_:
            read_cond(n.get("if"), where)
            out.append(n["next"])
    for t in out:
        if t not in scenes and t not in ("@end", "@hub"):
            err(f"{where}: next -> '{t}' does not exist")
    return out

def check_effects(do, where):
    for e in do or []:
        if "set" in e: flags_set.update(e["set"])
        if "item" in e and e["item"] not in items: err(f"{where}: unknown item '{e['item']}'")
        if "status" in e and e["status"] not in statuses: err(f"{where}: unknown status '{e['status']}'")
        if "badge" in e and e["badge"] not in badges: err(f"{where}: unknown badge '{e['badge']}'")

# ---------- static checks ----------
for sid, s in scenes.items():
    w = f"scene {sid}"
    t = s.get("type", "dialogue")
    if t not in TYPES: err(f"{w}: unknown type '{t}'")
    if "bg" in s and s["bg"] not in BGS: err(f"{w}: unknown bg '{s['bg']}' (known: {', '.join(sorted(BGS))})")
    for key in ("sprites", "afterSprites"):
        for sp in s.get(key) or []:
            if sp.get("art") not in SPRITES: err(f"{w}: unknown sprite '{sp.get('art')}' (known: {', '.join(sorted(SPRITES))})")
    read_cond(s.get("if"), w)
    for i, line in enumerate(s.get("lines", [])): check_line(line, f"{w} line {i+1}")
    if s.get("prompt"): check_line(s["prompt"], f"{w} prompt")
    if s.get("text") and t == "encounter": check_line(s["text"], f"{w} text")
    check_effects(s.get("do"), w)
    targets(s.get("next"), w)
    targets(s.get("else"), w)
    if t == "input": flags_set.add(s.get("flag", "name"))
    if t == "battle" and s.get("battle") not in battles: err(f"{w}: unknown battle '{s.get('battle')}'")
    if s.get("choicesFrom"):
        if s["choicesFrom"] not in lists: err(f"{w}: choicesFrom list '{s['choicesFrom']}' missing")
        if not s.get("choiceFlag"): err(f"{w}: choicesFrom needs choiceFlag")
        flags_set.add(s.get("choiceFlag"))
    for c in s.get("choices") or []:
        cw = f"{w} choice '{c.get('label')}'"
        if len(c.get("label", "")) > 28: warn(f"{cw}: label longer than 28 chars")
        read_cond(c.get("if"), cw)
        if c.get("set"): flags_set.update(c["set"])
        check_effects(c.get("do"), cw)
        for i, line in enumerate(c.get("lines", []) + c.get("fail", [])): check_line(line, f"{cw} line {i+1}")
        targets(c.get("next"), cw)
        if not c.get("fail") and not c.get("next") and not s.get("next"):
            err(f"{cw}: no next (and scene has no next)")
    if t in ("choice", "obstacle") and not s.get("choices") and not s.get("choicesFrom"):
        err(f"{w}: type {t} needs choices")
    if s.get("choices") and all(c.get("fail") for c in s["choices"]):
        err(f"{w}: every choice fails, player would be stuck")
    if t == "photos":
        for p in s.get("photos", []):
            if not (ROOT / p["src"]).exists(): err(f"{w}: photo file missing: {p['src']}")

for bid, b in battles.items():
    for i, q in enumerate(b.get("questions", [])):
        if not (0 <= q.get("answer", -1) < len(q.get("options", []))):
            err(f"battle {bid} Q{i+1}: answer index out of range")
    if b.get("award") and b["award"] not in badges: err(f"battle {bid}: unknown award badge")
    if b.get("foeSprite") and b["foeSprite"] not in SPRITES: err(f"battle {bid}: unknown foeSprite")

for bid, b in badges.items():
    if b.get("icon") not in BADGE_ICONS: err(f"badge {bid}: unknown icon '{b.get('icon')}'")
    if not re.fullmatch(r"[0-9a-f]{64}", b.get("hash", "")): err(f"badge {bid}: missing hash (run tools/gen_tokens.py)")
    read_cond(b.get("if"), f"badge {bid}")

for ch in story["chapters"]:
    if ch["start"] not in scenes: err(f"chapter {ch['id']}: start '{ch['start']}' missing")
    k = ch.get("key")
    if k and k != "continue" and k not in badges: err(f"chapter {ch['id']}: key '{k}' is not a badge")
    read_cond(ch.get("if"), f"chapter {ch['id']}")
for r in story.get("card", []):
    read_cond(r.get("if"), "card"); text_flags(r.get("value"))

for f in sorted(flags_read - flags_set):
    err(f"flag '{f}' is read somewhere but never set")

# ---------- walk every branch of the whole game (once per toggle combination) ----------
TG = {}  # toggle values for the current walk

def test(cond, flags):
    for k, want in (cond or {}).items():
        if k == "hasKey": continue
        have = TG.get(k[4:], False) if k.startswith("cfg.") else flags.get(k)
        if isinstance(want, list):
            if have not in want: return False
        elif isinstance(want, str) and want.startswith("!"):
            if have == want[1:]: return False
        elif have != want: return False
    return True

def resolve(next_, flags):
    if next_ is None: return None
    if isinstance(next_, str): return next_
    for n in next_:
        if test(n.get("if"), flags): return n["next"]
    return None

def successors(sid, flags):
    """Yield (next_scene, new_flags) for each way out of a scene."""
    s = scenes[sid]
    if s.get("if") and not test(s["if"], flags):
        yield resolve(s.get("else") or s.get("next"), flags), flags; return
    f = dict(flags)
    for e in s.get("do") or []:
        if "set" in e: f.update(e["set"])
    if s.get("type") == "input" and s.get("flag", "name") != "name":
        f[s["flag"]] = "TEXT"
    choices = s.get("choices")
    if s.get("choicesFrom"):
        choices = [{"set": {s["choiceFlag"]: x["id"]}} for x in lists.get(s["choicesFrom"], []) if x.get("available", True) is not False]
    if choices and s.get("type") not in ("battle", "input", "trainerCard", "letter", "photos", "credits"):
        vis = [c for c in choices if test(c.get("if"), f) and not c.get("fail")]
        if not vis:
            yield "__STUCK__", f; return
        for c in vis:
            g = dict(f); g.update(c.get("set") or {})
            for e in c.get("do") or []:
                if "set" in e: g.update(e["set"])
            yield resolve(c.get("next") or s.get("next"), g), g
    else:
        yield resolve(s.get("next"), f), f

chapters = story["chapters"]

def walk(prefix):
    """Walk every branch of the whole game with the current TG. Returns (reached, endings, steps)."""
    reached, endings, seen = set(), 0, set()
    stack = [(0, chapters[0]["start"], ())]
    steps = 0
    while stack:
        ci, sid, fl = stack.pop()
        key = (ci, sid, fl)
        if key in seen: continue
        seen.add(key); steps += 1
        if steps > 200000: err(f"{prefix}branch walk exploded (>200k states); check for loops"); break
        flags = dict(fl)
        if sid in ("@end", "@hub"):
            nxt = ci + 1
            while nxt < len(chapters) and not test(chapters[nxt].get("if"), flags): nxt += 1
            if nxt >= len(chapters): endings += 1
            else: stack.append((nxt, chapters[nxt]["start"], fl))
            continue
        if sid is None:
            err(f"{prefix}dead end: a scene in chapter {chapters[ci]['id']} has no next (flags {flags})"); continue
        if sid == "__STUCK__":
            err(f"{prefix}stuck: all visible choices fail in chapter {chapters[ci]['id']} (flags {flags})"); continue
        if sid not in scenes: continue  # already reported
        reached.add(sid)
        for n, f in successors(sid, flags):
            stack.append((ci, n, tuple(sorted(f.items()))))
    return reached, endings, steps

names = sorted(TOGGLES)
reached, walk_lines, endings, steps = set(), [], 0, 0
for mask in range(2 ** len(names)):
    TG = {n: bool(mask >> i & 1) for i, n in enumerate(names)}
    tag = ", ".join(f"{n}={'on' if v else 'off'}" for n, v in TG.items()) or "no toggles"
    r, e, st = walk(f"[{tag}] " if names else "")
    reached |= r
    if mask == 0: endings, steps = e, st  # headline numbers: all toggles off
    walk_lines.append(f"  [{tag}] {len(r)} reachable, {e} complete playthroughs, {st} states walked")

for sid in scenes:
    if sid not in reached: warn(f"scene {sid} is never reached in normal play")

# ---------- offline cache + version ----------
sw = (ROOT / "sw.js").read_text()
cfg = cfg_js
core = set(re.findall(r'"([^"]+)"', sw.split("const CORE = [")[1].split("];")[0]))
for js in sorted((ROOT / "js").glob("*.js")):
    if f"js/{js.name}" not in core: err(f"sw.js CORE is missing js/{js.name}: the game would break offline")
for f in ("index.html", "styles.css", "config.js", "story/story.json"):
    if f not in core: err(f"sw.js CORE is missing {f}")
sw_v = re.search(r'VERSION = "tp-v([\d.]+)"', sw)
cfg_v = re.search(r'VERSION: "([\d.]+)"', cfg)
if not (sw_v and cfg_v and sw_v.group(1) == cfg_v.group(1)):
    err(f"version mismatch: sw.js {sw_v and sw_v.group(1)} vs config.js {cfg_v and cfg_v.group(1)}")

# ---------- frozen ids (things Jess's save depends on) ----------
# tools/frozen.json lists ids that must never disappear once she is playing:
# chapter ids, badge ids, and flag values her prologue picks can hold.
frozen_path = ROOT / "tools" / "frozen.json"
if "--freeze" in sys.argv:
    vals = {}
    for sc in scenes.values():
        for c in sc.get("choices") or []:
            for k, v in (c.get("set") or {}).items(): vals.setdefault(k, set()).add(v)
    frozen = {"chapters": [c["id"] for c in story["chapters"]], "badges": list(badges),
              "flags": {k: sorted(v) for k, v in sorted(vals.items())}}
    frozen_path.write_text(json.dumps(frozen, indent=1) + "\n")
    print("Wrote tools/frozen.json")
if frozen_path.exists():
    frozen = json.loads(frozen_path.read_text())
    ch_ids = {c["id"] for c in story["chapters"]}
    for c in frozen["chapters"]:
        if c not in ch_ids: err(f"frozen chapter id '{c}' was removed or renamed (would break Jess's save)")
    for b in frozen["badges"]:
        if b not in badges: err(f"frozen badge id '{b}' was removed or renamed (printed stickers depend on it)")
    now = {}
    for sc in scenes.values():
        for c in sc.get("choices") or []:
            for k, v in (c.get("set") or {}).items(): now.setdefault(k, set()).add(v)
    for k, vs in frozen["flags"].items():
        for v in vs:
            if v not in now.get(k, set()): warn(f"frozen flag value {k}={v} no longer set anywhere; saves holding it may misbehave")

# ---------- report ----------
for w in warnings: print("WARN ", w)
for e in errors: print("ERROR", e)
print(f"\n{len(scenes)} scenes, {len(reached)} reachable across all toggle combinations.")
for line in walk_lines: print(line)
print("OK" if not errors else f"{len(errors)} error(s)")
sys.exit(1 if errors else 0)
