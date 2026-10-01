# Tidepool — orchestrator guide

A retro Game Boy–style adventure game Leon is making for Jess (2-year anniversary trip on the coast,
Oct 10–11). She plays it in Safari on her iPhone. Chapters unlock with physical QR badges.

## Deadlines
- Tue Sep 30: engine working with placeholder content (done Sep 28)
- Thu Oct 1: real prologue loaded, deployed, phone-tested
- Oct 10–11 (Sat–Sun): live play. Nothing risky ships after Oct 9.

## Handoff: the Build Log doc
Brainstorming happens in Claude chat. Approved changes land in the Inbox of the **Build Log** doc:
https://claude.ai/code/artifact/960f56ce-520a-467d-8ae6-7fcd51375cf2

When Leon says "intake" (or pastes change requests), run the `/intake` skill. It triages each CR,
routes it to a subagent in `.claude/agents/`, reviews, verifies and updates the doc.

| CR type | Agent | Owns |
| --- | --- | --- |
| story | story-writer → story-reviewer | `story/story.json` |
| character | art | `js/art.js` |
| ui | ui | `styles.css`, `js/ui.js`, `index.html` |
| engine | engine | other `js/*.js`, `sw.js`, `config.js`, validator, format spec |
| audio | audio | `js/audio.js` |
| assets | (orchestrator) `tools/optimize_photos.sh`, then story-writer | `assets/photos/` |
| verification | qa (read-only) + `/playtest` | none |

Commands: `/intake`, `/deploy` (checks, version bump, tag, push, verify), `/playtest` (silent automated playthrough).

Small, exact line edits (a CR that gives the old and new text) can be applied by the orchestrator directly
with exact string replacement in story.json; use agents for anything structural, art, ui or engine work.
On "intake", read the Build Log Inbox with `{"kind":"view","sinceRev":<last rev>}`; CRs Leon added earlier
may sit in unchanged blocks, so also `search` for "CR-0" when the numbering skips.

## Full Script doc ("sync script")
Every line of dialogue in play order, generated from the game:
https://claude.ai/code/artifact/6f1e2a88-b0b2-41c2-9533-6c8a828c1fe8
- Leon (or a Claude chat) edits lines directly in that doc. The `scene_id` labels map lines back to story.json.
- "sync script": read the doc's changes since your last-seen rev, apply each changed line to `story/story.json`
  by exact replacement (prologue edits need Leon's OK + relock), validate, playtest, report what changed.
- "refresh the script": run `python3 tools/export_script.py` (writes `tools/.script_out/s1..s9.md`) and replace
  each doc section with its file, one docs update per section. Edits made in the doc after the export are lost,
  so sync first.

## Status (Oct 1)
- Live: v0.1.6. Jess plays the prologue Fri Oct 2. Chapters 1–7 and the post-game unlock by badge during the trip.
- After Jess has played: run `python3 tools/validate.py --freeze` once and commit `tools/frozen.json`
  (locks chapter, badge and flag ids her save depends on). Prologue edits after that only reach her on a replay.
- Prologue lock: `tools/prologue.lock` makes the validator fail if any prologue text/data changes. Relock with
  `--relock-prologue` only when a CR says Leon approved the prologue change.
- Open: CR-017 (canon save + storage.persist) is on HOLD until Sat Oct 3. The letter and photos (ch7_letter,
  ch7_photos, ch7_end) are unreachable until Leon decides where they go (open note in the Inbox). Ch3 lunch's
  painting stop (ch5_easel, ch5_paint, ch5_end) still shows TODO placeholder text. Post-game credits are placeholders.
- Switches in config.js: fakeLodging off, coastsideFeast off.
- Badge stickers: print only from `tools/qr.html` (local server) — the /tq/ address and the code words changed on Sep 30.

## Lessons (don't repeat these)
- Agents must never run state-changing git commands (one `git stash` nearly wiped parallel work). Only the orchestrator commits.
- Sprites go in the `SPRITES` table in js/art.js, badge icons in `BADGE_ICONS`; the stage only draws SPRITES.
- Before any browser check, refresh the preview copy and bypass caches (unregister the service worker, `fetch(..., {cache:"reload"})`
  for `/`, index.html and every js file); otherwise the pane runs stale files and tests lie.
- Verify scene edits by parsing the JSON, not by searching text: an id can appear first as another scene's `next`.
- Keep every visible string free of the destination (validator blocklist) and of Gidget before her reveal.

## Hard rules
- Story is data. Dialogue edits never touch JS.
- No Pokémon IP: no official sprites, sounds, music, fonts, logos. Mechanics-style text is fine.
- No CDNs at runtime. Everything is bundled (`vendor/`, `assets/fonts/`).
- `tools/tokens.local.json` holds the badge secrets. It is git-ignored; never commit, deploy or paste it.
- Every deploy: bump `VERSION` in `sw.js` and `config.js` so phones pick up the change.

## Checks (run after every change)
1. `python3 tools/validate.py` must print OK.
2. Preview: rsync the project to ~/.tidepool-preview (see /playtest), then `preview_start` name `game` → http://localhost:8123 at mobile size.
3. `/playtest` before any deploy (silent; `?fast=1` mutes audio). Leon may be on calls: never play the game
   with sound in the browser pane unless he asks.
4. The desktop browser pane can't register service workers; test offline on the phone.

## Deploy
- Live: https://sl300-ships-it.github.io/tq/ · Repo: github.com/SL300-shipS-it/tq (public; Pages from `main` /root). Never rename again: her save and offline copy are tied to this address.
- Steps: bump `VERSION` in `sw.js` and `config.js` → validate → commit → `git push`. Pages rebuilds in ~1 min.
- `gh` is installed at /usr/local/bin and logged in as SL300-shipS-it. No Homebrew or Node on this Mac; use Python.

## Map
- `index.html`, `styles.css`, `config.js` (PIN, base URL, version)
- `js/main.js` boot + `#b=` / `#r=` links · `js/core.js` state, save, flags, text placeholders
- `js/scenes.js` scene runner, chapter hub, trainer card, letter, photos, credits, menu
- `js/battle.js` trivia battle · `js/badges.js` unlocks, scanner, badge case · `js/admin.js` admin panel
- `js/ui.js` stage canvas, text box, choices, popups · `js/art.js` pixel art · `js/audio.js` sound
- `story/story.json` content · `story/README.md` format spec
- `tools/validate.py` (`--freeze` locks ids once Jess plays; `--relock-prologue`) · `tools/export_script.py` (Full Script) · `tools/build_meta.py` (preview tags, icons) · `tools/playtest.html` · `tools/gen_tokens.py` · `tools/qr.html` (sticker sheet; local only) · `tools/optimize_photos.sh`
- `sw.js` offline cache
