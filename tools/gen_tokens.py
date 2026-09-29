#!/usr/bin/env python3
"""Generate secret badge tokens + backup words, and write their SHA-256 hashes into story/story.json.

  python3 tools/gen_tokens.py            # fill in only badges that have no token yet
  python3 tools/gen_tokens.py --force    # regenerate ALL (invalidates any printed QR stickers!)

Secrets go to tools/tokens.local.json (git-ignored, never deployed). tools/qr.html reads that file
when served locally to print the stickers. Only hashes go into story.json.
"""
import hashlib, json, re, secrets, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STORY = ROOT / "story" / "story.json"
SECRETS = ROOT / "tools" / "tokens.local.json"
SALT = "tidepool:"
WORDS = ["pearl", "kelp", "otter", "puffin", "driftwood", "lantern", "saltwater", "seaglass", "starfish",
         "harbor", "pelican", "sandpiper", "moonbeam", "anchor", "periwinkle", "abalone", "marigold", "zephyr"]

def h(s: str) -> str:
    return hashlib.sha256((SALT + s.strip().lower().replace(" ", "")).encode()).hexdigest()

def main():
    force = "--force" in sys.argv
    text = STORY.read_text()
    story = json.loads(text)
    old = json.loads(SECRETS.read_text()) if SECRETS.exists() else {}
    used = {v["word"] for v in old.values()}
    out = {}
    for bid in story["badges"]:
        if bid in old and not force:
            out[bid] = old[bid]
            continue
        word = secrets.choice([w for w in WORDS if w not in used]); used.add(word)
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
