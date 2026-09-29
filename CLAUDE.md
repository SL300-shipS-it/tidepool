# Tidepool — orchestrator guide

A retro Game Boy–style adventure game Leon is making for Jess (2-year anniversary trip, Half Moon Bay,
Oct 10–12). She plays it in Safari on her iPhone. Chapters unlock with physical QR badges.

## Deadlines
- Tue Sep 30: engine working with placeholder content (done Sep 28)
- Thu Oct 1: real prologue loaded, deployed, phone-tested
- Oct 10–12: live play. Nothing risky ships after Oct 9.

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

## Hard rules
- Story is data. Dialogue edits never touch JS.
- No Pokémon IP: no official sprites, sounds, music, fonts, logos. Mechanics-style text is fine.
- No CDNs at runtime. Everything is bundled (`vendor/`, `assets/fonts/`).
- `tools/tokens.local.json` holds the badge secrets. It is git-ignored; never commit, deploy or paste it.
- Every deploy: bump `VERSION` in `sw.js` and `config.js` so phones pick up the change.

## Checks (run after every change)
1. `python3 tools/validate.py` must print OK.
2. Serve: `python3 -m http.server 8123` in the project root, open http://localhost:8123 in the browser pane at mobile size.
3. `/playtest` before any deploy (silent; `?fast=1` mutes audio). Leon may be on calls: never play the game
   with sound in the browser pane unless he asks.
4. The desktop browser pane can't register service workers; test offline on the phone.

## Deploy
- Live: https://sl300-ships-it.github.io/tidepool/ · Repo: github.com/SL300-shipS-it/tidepool (public; Pages from `main` /root)
- Steps: bump `VERSION` in `sw.js` and `config.js` → validate → commit → `git push`. Pages rebuilds in ~1 min.
- `gh` is installed at /usr/local/bin and logged in as SL300-shipS-it. No Homebrew or Node on this Mac; use Python.

## Map
- `index.html`, `styles.css`, `config.js` (PIN, base URL, version)
- `js/main.js` boot + `#b=` / `#r=` links · `js/core.js` state, save, flags, text placeholders
- `js/scenes.js` scene runner, chapter hub, trainer card, letter, photos, credits, menu
- `js/battle.js` trivia battle · `js/badges.js` unlocks, scanner, badge case · `js/admin.js` admin panel
- `js/ui.js` stage canvas, text box, choices, popups · `js/art.js` pixel art · `js/audio.js` sound
- `story/story.json` content · `story/README.md` format spec
- `tools/validate.py` (`--freeze` locks ids once Jess plays) · `tools/playtest.html` · `tools/gen_tokens.py` · `tools/qr.html` (sticker sheet; local only) · `tools/optimize_photos.sh`
- `sw.js` offline cache
