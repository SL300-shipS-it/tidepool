"""Export every line of dialogue from story/story.json in play order, for the Full Script doc."""
import json, re, sys, os
# Writes one markdown file per Full Script doc section (s1..s9) into tools/.script_out/.
# The orchestrator pastes each section into the Full Script doc (one docs update per section).
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "tools", ".script_out")
os.makedirs(OUT, exist_ok=True)
d = json.load(open(os.path.join(ROOT, "story", "story.json")))
S, B = d["scenes"], d["battles"]
cfg = open(os.path.join(ROOT, "config.js")).read()
TOG = {m[0]: m[1] == "true" for m in re.findall(r"(\w+):\s*(true|false)", cfg.split("TOGGLES")[1].split("}")[0])}
def cfg_ok(c):
    return all(TOG.get(k[4:], False) == v for k, v in (c or {}).items() if k.startswith("cfg."))
def t(x):
    x = x.replace("{name}", "[NAME]").replace("{partner}", "GIDGET")
    x = re.sub(r"\{L\.(\w+)\}", r"[\1]", x); x = re.sub(r"\{f\.(\w+)\}", r"[\1]", x)
    return x.replace("|", "\\|")
def cond(c):
    parts = []
    for k, v in c.items():
        if k == "@replaying": parts.append("replaying the prologue" if v else "not replaying"); continue
        if k.startswith("cfg."): parts.append(f"switch {k[4:]} is {'on' if v else 'off'}"); continue
        if isinstance(v, str) and v.startswith("!"): parts.append(f"{k} is not {v[1:]}"); continue
        if isinstance(v, list): parts.append(f"{k} is {' or '.join(v)}"); continue
        parts.append(f"{k} = {v}")
    return " and ".join(parts)
def nxt(n):
    if n is None: return []
    if isinstance(n, str): return [n]
    xs = sorted(n, key=lambda x: "@replaying" in (x.get("if") or {}))  # normal play first
    out = []
    for x in xs:
        c = x.get("if") or {}
        if any(k.startswith("cfg.") for k in c):
            if cfg_ok(c): return out + [x["next"]]   # first matching switch branch wins
            continue
        out.append(x["next"])
    return out
def fmt_next(n):
    if isinstance(n, list):
        return "; ".join((f"if {cond(x['if'])} → " if x.get("if") else "otherwise → ") + f"`{x['next']}`" for x in n)
    return f"`{n}`"
seen = set()
def kids(sid):
    k = emit(sid, []); seen.discard(sid); return k
def walk(start, out):
    # Reverse postorder: every branch is listed before the scene it rejoins; loops back are ignored.
    visited, post = set(), []
    def dfs(n):
        visited.add(n)
        for k in reversed(kids(n)):
            if k and not k.startswith("@") and k in S and k not in visited and k not in seen: dfs(k)
        post.append(n)
    if start in S and start not in seen: dfs(start)
    for sid in reversed(post):
        if sid not in seen: emit(sid, out)
def emit(sid, out):
    seen.add(sid); s = S[sid]; typ = s.get("type", "dialogue")
    skip = s.get("if") and any(k.startswith("cfg.") for k in s["if"]) and not cfg_ok(s["if"])
    if skip:
        seen.discard(sid); return nxt(s.get("else") or s.get("next"))
    head = f"**`{sid}`**" + (f" · {typ}" if typ != "dialogue" else "")
    if s.get("if"): head += f" · plays only if {cond(s['if'])}, else `{s.get('else') or s.get('next')}`"
    out.append(head)
    spk = s.get("speaker")
    if typ == "encounter": out.append(f"> ⚡ {t(s.get('text','A wild LEON appeared!'))}")
    if typ == "input": out.append(f"> **{t(spk or '')}:** {t(s.get('prompt',''))}  *(she types her name)*")
    for l in s.get("lines", []): out.append(f"> " + (f"**{t(spk)}:** " if spk else "") + t(l))
    if s.get("prompt"): 
        if typ != "input": out.append(f"> *{t(s['prompt'])}*")
    for e in s.get("do", []) or []:
        if "item" in e: out.append(f"*(Bag: {d['items'].get(e['item'],{}).get('name',e['item'])}{' — quiet' if e.get('quiet') else ' — ITEM GET popup'})*")
        if "achievement" in e: out.append(f"*(Achievement: {t(e['achievement'])})*")
        if "status" in e: out.append(f"*(Status: {e['status']})*")
    ch = s.get("choices")
    if s.get("choicesFrom"):
        items = d["lists"][s["choicesFrom"]]
        for it in items:
            ls = it.get("lines") or ([it["line"]] if it.get("line") else [])
            out.append(f"- ▶ **{t(it['name'])}**" + (": " + " / ".join(t(x) for x in ls) if ls else ""))
    if ch:
        for c in ch:
            line = f"- ▶ **{t(c['label'])}**"
            if c.get("if"): line += f" *(shown if {cond(c['if'])})*"
            if c.get("fail"): line += " → " + " / ".join(t(x) for x in c["fail"]) + " *(loops back)*"
            elif c.get("lines"): line += " → " + " / ".join(t(x) for x in c["lines"])
            if c.get("next"): line += f" → {fmt_next(c['next'])}"
            out.append(line)
    if typ == "battle": out.append(f"*(Battle: `{s['battle']}` — full script below)*")
    if s.get("next") is not None and not ch: out.append(f"→ {fmt_next(s['next'])}")
    out.append("")
    kids = []
    for c in ch or []: kids += nxt(c.get("next"))
    return kids + nxt(s.get("next")) + nxt(s.get("else"))
def battle(bid):
    b = B[bid]; o = [f"#### Battle: {t(b['foe'])}"]
    for k in ("intro",): 
        for l in b.get(k, []): o.append("> " + t(l))
    for i, q in enumerate(b["questions"], 1):
        lm = q.get("leonMove"); lm = lm if isinstance(lm, list) else ([lm] if lm else [])
        o.append(f"**Q{i}.** " + " / ".join(f"*{t(x)}*" for x in lm))
        o.append(f"> {t(q['q'])}")
        for j, op in enumerate(q["options"]):
            o.append(f"- {'✅' if j == q['answer'] else '▫️'} {t(op)}")
        o.append(f"Right: GIDGET used {t(q.get('move','TACKLE'))}! It's super effective!" + (f" {t(q['hitText'])}" if q.get('hitText') else ""))
        o.append("")
    o.append("**Wrong answer:** " + t(b['foe']) + " uses one of: " + ", ".join(m["name"] + (f" ({t(m['text'])})" if m.get('text') else "") for m in b.get("foeMoves", [])) + ", then one of:")
    for l in b.get("distracted", []): o.append(f"- {t(l)}")
    for k, lab in (("nap","When HP runs low"),("revive","Then"),("wake","Then"),("finisher","If the Champion still has HP after Q" + str(len(b['questions']))),("win","Win")):
        if b.get(k): o.append(f"**{lab}:** " + " / ".join(t(x) for x in b[k]))
    if b.get("award"): o.append(f"*(Awards: {d['badges'][b['award']]['name']})*")
    return o
chap = {c["id"]: c for c in d["chapters"]}
def section(cid, title):
    out = [f"## {title}"]
    c = chap[cid]
    if c.get("intro"): out.append(f"*Hub, when open:* {t(c['intro'])}")
    if c.get("lockedText"): out.append(f"*Hub, when locked:* {t(c['lockedText'])}")
    out.append("")
    walk(c["start"], out); return out
secs = {
 "s1": section("prologue", "Prologue"),
 "s2": section("ch1", "Chapter 1: Night Route"),
 "s3": section("ch2", "Chapter 2: Morning"),
 "s4": section("ch5", "Chapter 3: Lunch"),
 "s5": section("ch6", "Chapter 4: Fight or Flight / Rest and Digest"),
 "s6": section("ch3", "Chapter 5: Sunflower Field (only if sunflowers = yes)"),
 "s7": section("ch4", "Chapter 6 (or 5): Route South"),
}
s8 = section("ch7", "Chapter 7 (or 6): The Champion"); s8 += battle("champion"); secs["s8"] = s8
s9 = ["## Post-game, Leon's message and unreachable scenes"] ; s9 += section("post", "x")[1:]
s9 += ["### Leon's message (plays once from Oct 6)", ""]; walk("leon_message", s9)
rest = [k for k in S if k not in seen and not k.startswith("ex_")]
s9 += [f"*Switch settings used for this script: " + ", ".join(f"{k} {'on' if v else 'off'}" for k, v in TOG.items()) + ". Scenes only reached with a switch flipped are listed below too.*", ""]
s9 += ["### Not reachable right now", "These are in the story file but no path leads to them (the letter and photos are waiting on a decision; the others are placeholders).", ""]
for k in rest:
    if k not in seen: emit(k, s9)
secs["s9"] = s9
def spaced(lines):
    out = []
    for l in lines:
        if out and l and out[-1]:
            a, b = out[-1], l
            if a.startswith(">") and b.startswith(">"): out.append(">")
            elif a.startswith("- ") and b.startswith("- "): pass
            else: out.append("")
        out.append(l)
    return "\n".join(out).strip() + "\n"
for k, v in secs.items(): open(f"{OUT}/{k}.md", "w").write(spaced(v))
print({k: len("\n".join(v)) for k, v in secs.items()}, "unseen:", [k for k in S if k not in seen])
