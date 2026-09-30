#!/usr/bin/env python3
"""Generate secret badge tokens + backup words, and write their SHA-256 hashes into story/story.json.

  python3 tools/gen_tokens.py            # fill in only badges that have no token yet
  python3 tools/gen_tokens.py --force    # regenerate ALL (invalidates any printed QR stickers!)
  python3 tools/gen_tokens.py --new-words  # new backup words only; tokens and QR links stay the same

Tokens are random hex, so an unlock link (#b=<token>) never shows a key id. Backup words come from
NEUTRAL_WORDS: nothing about the coast, food, flowers or the trip, never a badge/key id, and never a
word that appears anywhere in story.json (checked on every run).

Secrets go to tools/tokens.local.json (git-ignored, never deployed). tools/qr.html reads that file
when served locally to print the stickers. Only hashes go into story.json.
"""
import hashlib, json, re, secrets, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STORY = ROOT / "story" / "story.json"
SECRETS = ROOT / "tools" / "tokens.local.json"
SALT = "tidepool:"
# CR-015: neutral household / abstract words, easy to type on a phone.
NEUTRAL_WORDS = [
    "pencil", "marble", "tuba", "ladder", "button", "mitten", "doorknob", "stapler", "ruler", "funnel",
    "drawer", "hammer", "bookend", "ribbon", "thimble", "zipper", "puzzle", "tripod", "crayon", "domino",
    "eraser", "folder", "gadget", "hinge", "jigsaw", "magnet", "gizmo", "sprocket", "lever", "rocket",
    "saddle", "tassel", "trumpet", "cymbal", "yarn", "zigzag", "bobbin", "cobalt", "dimple", "fiddle",
    "gravel", "hopscotch", "igloo", "jumper", "kazoo", "locket", "muffler", "nickel", "orbit", "pixel",
    "quiver", "stencil", "scooter", "tinsel", "banjo", "vortex", "widget", "xylophone", "yodel", "zeppelin",
]

def h(s: str) -> str:
    return hashlib.sha256((SALT + s.strip().lower().replace(" ", "")).encode()).hexdigest()

def story_words(story) -> set:
    """Every word in every string (and key) of the story, lowercased."""
    found = set()
    def walk(n):
        if isinstance(n, str): found.update(w.lower() for w in re.findall(r"[A-Za-z]+", n))
        elif isinstance(n, list):
            for x in n: walk(x)
        elif isinstance(n, dict):
            for k, v in n.items(): walk(k); walk(v)
    walk(story)
    return found

def allowed_words(story) -> list:
    banned = story_words(story) | {b.lower() for b in story["badges"]}
    ok = [w for w in NEUTRAL_WORDS if w not in banned]
    if len(ok) < len(story["badges"]):
        sys.exit("Not enough neutral words left; add more to NEUTRAL_WORDS")
    return ok

def main():
    force = "--force" in sys.argv
    new_words = "--new-words" in sys.argv
    text = STORY.read_text()
    story = json.loads(text)
    old = json.loads(SECRETS.read_text()) if SECRETS.exists() else {}
    if new_words and not old:
        sys.exit("--new-words needs tools/tokens.local.json (run without flags first)")
    pool = allowed_words(story)
    # With --new-words, none of the old words are reused.
    used = {v["word"] for v in old.values()} if not force else set()
    out = {}
    for bid in story["badges"]:
        if bid in old and not force:
            out[bid] = dict(old[bid])
            if new_words:
                word = secrets.choice([w for w in pool if w not in used]); used.add(word)
                out[bid]["word"] = word
            continue
        word = secrets.choice([w for w in pool if w not in used]); used.add(word)
        out[bid] = {"token": secrets.token_hex(6), "word": word}
    for bid, s in out.items():
        # Replace hash/wordHash inside this badge's object without reformatting the file.
        pat = re.compile(r'("%s"\s*:\s*\{(?:[^{}]|\{[^{}]*\})*?"hash"\s*:\s*")[0-9a-f]*(".*?"wordHash"\s*:\s*")[0-9a-f]*(")' % re.escape(bid), re.S)
        start = text.index('"badges"')
        head, body = text[:start], text[start:]
        body, n = pat.subn(lambda m: m.group(1) + h(s["token"]) + m.group(2) + h(s["word"]) + m.group(3), body, count=1)
        text = head + body
        if n != 1:
            sys.exit(f"Could not find hash fields for badge '{bid}' in story.json")
    json.loads(text)  # sanity check
    STORY.write_text(text)
    SECRETS.write_text(json.dumps(out, indent=2) + "\n")
    print(f"Wrote hashes for {len(out)} badges to story/story.json")
    print(f"Secrets saved to {SECRETS.relative_to(ROOT)} (keep private)")
    for bid, s in out.items():
        print(f"  {bid:10} word={s['word']}")

if __name__ == "__main__":
    main()
