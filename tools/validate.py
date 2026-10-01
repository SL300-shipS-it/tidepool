#!/usr/bin/env python3
"""Story checker. Run after every story edit:  python3 tools/validate.py

Checks story/story.json for broken links, unknown art/backgrounds/items, flags that are read but
never set, lines too long for the text box, and walks EVERY branch combination of the whole game
to make sure each path reaches the end without getting stuck. The walk runs once per combination of
config.js TOGGLES (read in conditions as "cfg.<name>"). Exit code 1 on errors.
"""
import hashlib, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ---------- prologue lock ----------
# Later-chapter work must leave the prologue byte-identical. The "prologue surface" is everything the
# prologue shows or depends on; tools/prologue.lock holds its sha256 (plus one hash per part, so a
# mismatch can say what changed). Relock on purpose with --relock-prologue.
PROLOGUE_LOCK = ROOT / "tools" / "prologue.lock"
# Label keys that belong to the prologue (plus any flag a pro_ scene sets, e.g. the starter flags).
# NOT lunch / recover / breakfast: those are later-chapter flags.
PROLOGUE_LABEL_FLAGS = {"lodging", "sunflowers", "dinner", "restaurant"}

def canon(x):
    return json.dumps(x, sort_keys=True, ensure_ascii=False)

def prologue_flags_set(st):
    out = set()
    for sid, sc in st.get("scenes", {}).items():
        if not sid.startswith("pro_"): continue
        for e in sc.get("do") or []: out.update((e.get("set") or {}).keys())
        for c in sc.get("choices") or []:
            out.update((c.get("set") or {}).keys())
            for e in c.get("do") or []: out.update((e.get("set") or {}).keys())
        if sc.get("choiceFlag"): out.add(sc["choiceFlag"])
        if sc.get("type") == "input": out.add(sc.get("flag", "name"))
    return out

def prologue_items(st):
    """Item ids a pro_ scene awards (scene `do` or a choice's `do`)."""
    out = set()
    for sid, sc in st.get("scenes", {}).items():
        if not sid.startswith("pro_"): continue
        effects = list(sc.get("do") or [])
        for c in sc.get("choices") or []: effects += c.get("do") or []
        out.update(e["item"] for e in effects if isinstance(e, dict) and e.get("item"))
    return out

def prologue_surface(st):
    """Dict of part name -> JSON-able value. Part names are flat ("scenes.pro_intro", "labels.lodging").
    Items: only those a pro_ scene awards, so later-chapter items never trip the lock. Badges: all of
    them (names/icons show in the badge case from the prologue on)."""
    parts = {}
    for sid, sc in st.get("scenes", {}).items():
        if sid.startswith("pro_"): parts[f"scenes.{sid}"] = sc
    parts["chapter.prologue"] = next((c for c in st.get("chapters", []) if c.get("id") == "prologue"), None)
    for k in ("meta", "card", "lists"): parts[k] = st.get(k)
    all_items = st.get("items") or {}
    for iid in sorted(prologue_items(st)): parts[f"items.{iid}"] = all_items.get(iid)
    labels = st.get("labels", {})
    for k in sorted((PROLOGUE_LABEL_FLAGS | prologue_flags_set(st)) - {"name"}):
        if k in labels: parts[f"labels.{k}"] = labels[k]
    for bid, b in st.get("badges", {}).items():
        parts[f"badges.{bid}"] = {"name": b.get("name"), "icon": b.get("icon")}
    return parts

def prologue_lock_data(st):
    parts = prologue_surface(st)
    return {"sha256": hashlib.sha256(canon(parts).encode("utf-8")).hexdigest(),
            "parts": {k: hashlib.sha256(canon(v).encode("utf-8")).hexdigest() for k, v in sorted(parts.items())}}

story = json.loads((ROOT / "story" / "story.json").read_text())
art_js = (ROOT / "js" / "art.js").read_text()
cfg_js = (ROOT / "config.js").read_text()

# Deploy-time toggles from config.js TOGGLES (read in story conditions as "cfg.<name>").
_tg = re.search(r"TOGGLES:\s*\{(.*?)\n\s*\}", cfg_js, re.S)
TOGGLES = {k: v == "true" for k, v in re.findall(r"^\s*(\w+):\s*(true|false)", _tg.group(1), re.M)} if _tg else {}

_sprites_src = art_js.split("export const SPRITES")[1].split("\n};")[0]  # only the SPRITES table
SPRITES = set(re.findall(r"^\s{2}(\w+): (?:withTail\(\[|\[)", _sprites_src, re.M))
BADGE_ICONS = set(re.findall(r"^\s{2}(\w+): \[", art_js.split("BADGE_ICONS = {")[1], re.M)) | {"canele"}
BGS = set(re.findall(r'case "(\w+)"', art_js.split("export function drawBg")[1]))
TYPES = {"dialogue", "choice", "input", "encounter", "obstacle", "battle", "trainerCard", "letter", "photos", "credits", "minigame"}
# Minigame ids from the registry in js/minigames/index.js (`GAMES = { id: module, ... }`).
_mg = ROOT / "js" / "minigames" / "index.js"
_mg_block = re.search(r"GAMES\s*=\s*\{(.*?)\};", _mg.read_text(), re.S) if _mg.exists() else None
MINIGAMES = set(re.findall(r"^\s*(\w+)\s*:", _mg_block.group(1), re.M)) if _mg_block else set()
REPLAY_SCENE = "pro_replay_start"  # CR-019: the menu's REPLAY PROLOGUE opens this scene
SPECIAL_TARGETS = ("@end", "@hub", "@replay", "@cancel")
# CR-028: config.js LEON_MESSAGE = { scene: "...", from: "YYYY-MM-DD" }: a once-only standalone scene.
_lm = re.search(r"LEON_MESSAGE:\s*\{([^}]*)\}", cfg_js)
LEON_MESSAGE = dict(re.findall(r'(\w+):\s*"([^"]*)"', _lm.group(1))) if _lm else {}
LEON_SCENE = LEON_MESSAGE.get("scene")
LOCKED_TEXT = "Your next badge will find you."  # js/scenes.js fallback for a locked chapter
# CR-015: words that would give away the destination. Case-insensitive.
BLOCKLIST = ["Half Moon Bay", "HMB", "Miramar", "Montara", "El Granada", "Princeton", "Pillar Point",
             "Cypress", "Pasta Moon", "Mavericks", "Johnny's", "tidepool",
             "Pilot Light", "Cantina", "San Benito", "Andreotti", "Ritz"]  # CR-022
BLOCK_RE = re.compile(r"\b(?:%s)\b" % "|".join(re.escape(w).replace("'", "['’]") for w in BLOCKLIST), re.I)
EXAMPLE_PREFIX = "ex_"  # admin-only example scenes: not warned about when unreachable
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
PRO = next((c for c in story["chapters"] if not c.get("key")), story["chapters"][0])
PRO_PREFIX = PRO.get("prefix", PRO["id"])

def read_cond(cond, where):
    for k, want in (cond or {}).items():
        if k.startswith("cfg."):
            if k[4:] not in TOGGLES: err(f"{where}: condition uses toggle '{k}' but config.js TOGGLES has no '{k[4:]}'")
            elif not isinstance(want, bool): err(f"{where}: toggle condition '{k}' must be true or false")
        elif k.startswith("@"):
            check_cond_keys({k: want}, where)
        elif k != "hasKey":
            flags_read.add(k)

def check_cond_keys(cond, where):
    for k, want in (cond or {}).items():
        if k == "@replaying" and not isinstance(want, bool): err(f"{where}: '@replaying' must be true or false")
        elif k.startswith("@") and k != "@replaying": err(f"{where}: unknown reserved condition key '{k}'")

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
        if t not in scenes and t not in SPECIAL_TARGETS:
            err(f"{where}: next -> '{t}' does not exist")
        if t in ("@replay", "@cancel") and not where.startswith(f"scene {PRO_PREFIX}"):
            err(f"{where}: '{t}' only works in prologue scenes ({PRO_PREFIX}*)")
    return out

def check_effects(do, where):
    for e in do or []:
        if "set" in e: flags_set.update(e["set"])
        if "item" in e and e["item"] not in items: err(f"{where}: unknown item '{e['item']}'")
        if "quiet" in e:  # { "item": id, "quiet": true }: no ITEM GET popup
            if not isinstance(e["quiet"], bool): err(f"{where}: quiet must be true or false")
            elif "item" not in e: warn(f"{where}: quiet only applies to an item effect; it does nothing here")
        if "status" in e and e["status"] not in statuses: err(f"{where}: unknown status '{e['status']}'")
        if "badge" in e and e["badge"] not in badges: err(f"{where}: unknown badge '{e['badge']}'")

def check_share_text(st, where):
    """trainerCard shareText / meta.shareText: sent as-is (plus the restore link) by the Share button."""
    if not isinstance(st, str) or not st.strip(): err(f"{where}: shareText must be a non-empty string"); return
    text_flags(st)
    n = len(re.sub(r"\{[^}]+\}", "X" * 10, st))
    if n > 280: warn(f"{where}: shareText is {n} chars (keep it under ~280 so the text message stays short)")

if "shareText" in story.get("meta", {}): check_share_text(story["meta"]["shareText"], "meta")

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
    if t == "minigame":
        if s.get("game") not in MINIGAMES:
            err(f"{w}: unknown minigame '{s.get('game')}' (known: {', '.join(sorted(MINIGAMES)) or 'none'}; see js/minigames/index.js)")
        if "params" in s and not isinstance(s["params"], dict): err(f"{w}: minigame params must be an object")
        targets(s.get("win"), f"{w} win")
        targets(s.get("lose"), f"{w} lose")
        if not s.get("next") and not (s.get("win") and s.get("lose")):
            err(f"{w}: minigame needs next, or both win and lose (a win or loss would go nowhere)")
        if s.get("retryPrompt"): check_line(s["retryPrompt"], f"{w} retryPrompt")
        if s.get("scoreFlag"): flags_set.add(s["scoreFlag"])
        if s.get("choices") or s.get("choicesFrom"): err(f"{w}: minigame scenes can't have choices (use win/lose)")
    if s.get("choicesFrom"):
        if s["choicesFrom"] not in lists: err(f"{w}: choicesFrom list '{s['choicesFrom']}' missing")
        if not s.get("choiceFlag"): err(f"{w}: choicesFrom needs choiceFlag")
        flags_set.add(s.get("choiceFlag"))
    if t == "trainerCard" and "shareText" in s: check_share_text(s["shareText"], w)
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

# ---------- lists (choicesFrom items) ----------
for lid, items_ in lists.items():
    if not isinstance(items_, list): err(f"list {lid}: must be an array"); continue
    ids = set()
    for i, x in enumerate(items_):
        lw = f"list {lid}[{i}]"
        if not isinstance(x, dict): err(f"{lw}: must be an object with id and name"); continue
        if not x.get("id"): err(f"{lw}: missing id")
        elif x["id"] in ids: err(f"{lw}: duplicate id '{x['id']}'")
        else: ids.add(x["id"])
        if not x.get("name"): err(f"{lw}: missing name")
        elif len(x["name"]) > 28: warn(f"{lw}: name longer than 28 chars (it is a choice label)")
        if "lines" in x and "line" in x: err(f"{lw}: use lines or line, not both")
        ls = x.get("lines", [x["line"]] if "line" in x else [])
        if not isinstance(ls, list) or not all(isinstance(l, str) for l in ls):
            err(f"{lw}: lines must be an array of strings (or line a single string)"); continue
        for j, line in enumerate(ls): check_line(line, f"{lw} ({x.get('id')}) line {j+1}")

for bid, b in battles.items():
    for i, q in enumerate(b.get("questions", [])):
        if not (0 <= q.get("answer", -1) < len(q.get("options", []))):
            err(f"battle {bid} Q{i+1}: answer index out of range")
    if b.get("award") and b["award"] not in badges: err(f"battle {bid}: unknown award badge")
    if b.get("foeSprite") and b["foeSprite"] not in SPRITES: err(f"battle {bid}: unknown foeSprite")
    # Line arrays. distracted/nap/wake are Gidget's harmless stand-ins for hurt/faint/revive (CR-010).
    for key in ("intro", "revive", "finisher", "win", "distracted", "nap", "wake"):
        if key not in b: continue
        v = b[key]
        if not isinstance(v, list) or not all(isinstance(x, str) for x in v):
            err(f"battle {bid}: '{key}' must be an array of strings"); continue
        for i, line in enumerate(v): check_line(line, f"battle {bid} {key} line {i+1}")
    for i, q in enumerate(b.get("questions", [])):
        for key in ("q", "hitText", "missText"):
            if isinstance(q.get(key), str): check_line(q[key], f"battle {bid} Q{i+1} {key}")
        # CR-021: leonMove plays before the question: one string or an array of strings (text boxes).
        if "leonMove" in q:
            lm = q["leonMove"]
            lm = [lm] if isinstance(lm, str) else lm
            if not isinstance(lm, list) or not lm or not all(isinstance(x, str) and x.strip() for x in lm):
                err(f"battle {bid} Q{i+1}: leonMove must be a non-empty string or an array of non-empty strings")
            else:
                for j, line in enumerate(lm): check_line(line, f"battle {bid} Q{i+1} leonMove line {j+1}")
    for i, m in enumerate(b.get("foeMoves", [])):
        if isinstance(m.get("text"), str) and m["text"]: check_line(m["text"], f"battle {bid} foeMove {i+1} text")

# ---------- Gidget never faints (CR-010) ----------
# Gidget was Jess's real cat: no faint/hurt/KO wording may apply to her anywhere. Checks every string in
# the story that mentions her ({partner} or GIDGET), plus every battle's revive/nap/wake/distracted lines
# (those are always about her). Lines about {name} or LEON alone may still take silly hits.
GIDGET_RE = re.compile(r"\{partner\}|gidget", re.I)
HARM_RE = re.compile(r"\b(?:faint(?:s|ed|ing)?|hurts?|hurting|injur(?:ed|y|ies)|died|dies|dead|ko(?:'?d)?)\b|\bk\.o\.?", re.I)
GIDGET_KEYS = ("revive", "nap", "wake", "distracted")

def gidget_harm(node, path, always=False):
    if isinstance(node, str):
        m = HARM_RE.search(node)
        if m and (always or GIDGET_RE.search(node)):
            err(f"{path}: '{m.group(0)}' wording tied to Gidget (she only gets distracted or naps): {node[:60]}")
    elif isinstance(node, list):
        for i, x in enumerate(node): gidget_harm(x, f"{path}[{i}]", always)
    elif isinstance(node, dict):
        for k, x in node.items():
            gidget_harm(x, f"{path}.{k}", always or (path.startswith("battles.") and path.count(".") == 1 and k in GIDGET_KEYS))

for top, val in story.items():
    gidget_harm(val, top)

for bid, b in badges.items():
    if b.get("icon") not in BADGE_ICONS: err(f"badge {bid}: unknown icon '{b.get('icon')}'")
    if not re.fullmatch(r"[0-9a-f]{64}", b.get("hash", "")): err(f"badge {bid}: missing hash (run tools/gen_tokens.py)")
    read_cond(b.get("if"), f"badge {bid}")
    if "hint" in b: err(f"badge {bid}: 'hint' is no longer allowed (locked badges reveal nothing, CR-015); remove it")

def is_numbered(ch):
    """Mirror of js/scenes.js isNumbered: chapters with a key, minus the prologue and numbered: false."""
    return ch is not PRO and ch.get("id") != "prologue" and bool(ch.get("key")) and ch.get("numbered") is not False

for ch in story["chapters"]:
    if ch["start"] not in scenes: err(f"chapter {ch['id']}: start '{ch['start']}' missing")
    k = ch.get("key")
    if k and k != "continue" and k not in badges: err(f"chapter {ch['id']}: key '{k}' is not a badge")
    read_cond(ch.get("if"), f"chapter {ch['id']}")
    if "lockedTitle" in ch: warn(f"chapter {ch['id']}: lockedTitle is ignored (locked chapters show CHAPTER N: ???)")
    # CR-022: numbers are computed ("CHAPTER N: title"); the prologue is never numbered.
    if "numbered" in ch and not isinstance(ch["numbered"], bool): err(f"chapter {ch['id']}: numbered must be true or false")
    if is_numbered(ch) and re.match(r"\s*(CH\.|CHAPTER\b)", ch.get("title", ""), re.I):
        warn(f"chapter {ch['id']}: title '{ch['title']}' starts with CH./CHAPTER; the number is added automatically, remove it")

# ---------- locked screens reveal nothing (CR-015) ----------
# A locked chapter shows "CHAPTER N: ???" and its lockedText (or LOCKED_TEXT). That text may not name a
# badge, a chapter title, or a blocklisted place.
badge_names = [b["name"] for b in badges.values() if b.get("name")]
ch_titles = [c["title"] for c in story["chapters"] if c.get("title")]
def locked_leaks(text):
    low = text.lower()
    out = [f"badge name '{n}'" for n in badge_names if n.lower() in low]
    out += [f"chapter title '{n}'" for n in ch_titles if n.lower() in low]
    out += [f"blocklisted '{m}'" for m in BLOCK_RE.findall(text)]
    return out
for leak in locked_leaks(LOCKED_TEXT): err(f"locked-chapter fallback text: contains {leak}")
for ch in story["chapters"]:
    if not ch.get("key") or ch["key"] == "continue": continue
    lt = ch.get("lockedText")
    if lt is None: continue
    if not isinstance(lt, str): err(f"chapter {ch['id']}: lockedText must be a string"); continue
    for leak in locked_leaks(lt): err(f"chapter {ch['id']}: lockedText contains {leak} (a locked screen must reveal nothing)")

# Prologue-era text she sees before anything unlocks: warn on destination words.
def block_warn(node, where):
    if isinstance(node, str):
        for m in BLOCK_RE.findall(node): warn(f"{where}: contains '{m}' (gives away the destination before it unlocks)")
    elif isinstance(node, list):
        for i, x in enumerate(node): block_warn(x, f"{where}[{i}]")
    elif isinstance(node, dict):
        for k, x in node.items():
            if k not in ("hash", "wordHash", "src"): block_warn(x, f"{where}.{k}")
for sid, s in scenes.items():
    if sid.startswith(PRO_PREFIX): block_warn(s, f"scene {sid}")
block_warn(story.get("meta", {}), "meta")
block_warn(story.get("card", []), "card")
block_warn(story.get("lists", {}), "lists")
for r in story.get("card", []):
    read_cond(r.get("if"), "card"); text_flags(r.get("value"))

# ---------- message from Leon (CR-028) ----------
# Played standalone (outside any chapter); "@" targets just end it. Everything it leads to counts as
# reached; its text gets the length checks (above) and the blocklist check.
leon_reached = set()
if LEON_MESSAGE:
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", LEON_MESSAGE.get("from", "")):
        err(f"config.js LEON_MESSAGE.from must be a YYYY-MM-DD date (got '{LEON_MESSAGE.get('from')}')")
    if not LEON_SCENE: err("config.js LEON_MESSAGE has no scene")
    elif LEON_SCENE not in scenes: warn(f"config.js LEON_MESSAGE scene '{LEON_SCENE}' is not in the story yet (nothing will play)")
    else:
        todo = [LEON_SCENE]
        while todo:
            sid = todo.pop()
            if sid in leon_reached or sid not in scenes: continue
            leon_reached.add(sid)
            sc = scenes[sid]
            if sc.get("type") == "input": warn(f"scene {sid}: an input scene inside Leon's message would overwrite her answer")
            nxt = [sc.get("next"), sc.get("else"), sc.get("win"), sc.get("lose")] + [c.get("next") for c in sc.get("choices") or []]
            for n in nxt:
                for t in ([n] if isinstance(n, str) else [x.get("next") for x in n] if isinstance(n, list) else []):
                    if t and not t.startswith("@"): todo.append(t)
        for sid in leon_reached: block_warn(scenes[sid], f"scene {sid}")

for f in sorted(flags_read - flags_set):
    err(f"flag '{f}' is read somewhere but never set")

# ---------- walk every branch of the whole game (once per toggle combination) ----------
TG = {}  # toggle values for the current walk

def test(cond, flags):
    for k, want in (cond or {}).items():
        if k == "hasKey": continue
        if k == "@replaying":
            if bool(flags.get("@replaying")) != want: return False
            continue
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
    if s.get("type") == "minigame":
        if s.get("scoreFlag"): f[s["scoreFlag"]] = "SCORE"
        # Both outcomes are possible (a loss can also retry, which changes nothing).
        for key in ("win", "lose"):
            yield resolve(s.get(key) if s.get(key) is not None else s.get("next"), f), f
        return
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

PRO_CI = chapters.index(PRO)

def walk(prefix):
    """Walk every branch of the whole game with the current TG. Returns (reached, endings, steps).
    Also walks the prologue replay (CR-019) from REPLAY_SCENE with "@replaying" set: @replay restarts
    the chapter, @cancel/@end/@hub end the replay (back to where she was)."""
    reached, endings, seen = set(), 0, set()
    stack = [(0, chapters[0]["start"], ())]
    if REPLAY_SCENE in scenes: stack.append((PRO_CI, REPLAY_SCENE, (("@replaying", True),)))
    steps = 0
    while stack:
        ci, sid, fl = stack.pop()
        key = (ci, sid, fl)
        if key in seen: continue
        seen.add(key); steps += 1
        if steps > 200000: err(f"{prefix}branch walk exploded (>200k states); check for loops"); break
        flags = dict(fl)
        if flags.get("@replaying"):
            if sid in ("@end", "@hub", "@cancel"): continue  # replay over: back to where she was
            if sid == "@replay": sid = chapters[ci]["start"]
        elif sid == "@replay": sid = chapters[ci]["start"]
        elif sid == "@cancel": sid = "@hub"
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
    if sid not in reached and sid not in leon_reached and not sid.startswith(EXAMPLE_PREFIX): warn(f"scene {sid} is never reached in normal play")

# ---------- offline cache + version ----------
sw = (ROOT / "sw.js").read_text()
cfg = cfg_js
core = set(re.findall(r'"([^"]+)"', sw.split("const CORE = [")[1].split("];")[0]))
for js in sorted((ROOT / "js").rglob("*.js")):
    rel = js.relative_to(ROOT).as_posix()
    if rel not in core: err(f"sw.js CORE is missing {rel}: the game would break offline")
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

# ---------- prologue lock (see prologue_surface at the top) ----------
cur_lock = prologue_lock_data(story)
if "--relock-prologue" in sys.argv:
    PROLOGUE_LOCK.write_text(json.dumps(cur_lock, indent=1, sort_keys=True) + "\n")
    print(f"Wrote tools/prologue.lock ({cur_lock['sha256'][:12]}...)")
if not PROLOGUE_LOCK.exists():
    warn("tools/prologue.lock is missing; run python3 tools/validate.py --relock-prologue")
else:
    try:
        old_lock = json.loads(PROLOGUE_LOCK.read_text())
    except ValueError:
        old_lock = {"sha256": PROLOGUE_LOCK.read_text().strip(), "parts": {}}
    if old_lock.get("sha256") != cur_lock["sha256"]:
        op, np_ = old_lock.get("parts", {}), cur_lock["parts"]
        diff = [f"~{k}" for k in sorted(op.keys() & np_.keys()) if op[k] != np_[k]]
        diff += [f"-{k}" for k in sorted(op.keys() - np_.keys())] + [f"+{k}" for k in sorted(np_.keys() - op.keys())]
        err("prologue changed (tools/prologue.lock); if intended, run python3 tools/validate.py --relock-prologue"
            + (f"\n      differs: {', '.join(diff)}" if diff else ""))

# ---------- report ----------
for w in warnings: print("WARN ", w)
for e in errors: print("ERROR", e)
print(f"\n{len(scenes)} scenes, {len(reached)} reachable across all toggle combinations.")
for line in walk_lines: print(line)
print("OK" if not errors else f"{len(errors)} error(s)")
sys.exit(1 if errors else 0)
