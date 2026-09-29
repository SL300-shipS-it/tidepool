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

When Leon says "intake" (or pastes change requests):
1. Read the doc's Inbox (docs tools; read the outline first, then only the Inbox section).
2. Classify each CR by `Type` and route it (table below). Independent CRs can run in parallel.
3. Make the change, then run the checks below.
4. Move each finished CR to the doc's Done log (date · item · one-line outcome) and delete it from the Inbox.
5. Conflicts with Locked decisions: leave the CR in the Inbox, comment on it, and ask Leon.

| CR type | Files | Notes |
| --- | --- | --- |
| story | `story/story.json` | Follow `story/README.md`. No code changes. |
| character | `js/art.js` (SPRITES, BADGE_ICONS) | 4-color grids, `.abcd`; all rows the same width. |
| ui | `styles.css`, `js/ui.js`, `index.html` | Test at 375px wide; tap targets ≥ 44px. |
| engine | `js/scenes.js`, `js/battle.js`, `js/core.js`, `js/main.js` | New scene fields must be documented in `story/README.md` and checked in `tools/validate.py`. |
| audio | `js/audio.js` | Synth only, no files. |
| assets | `assets/photos/` | Reference photos in a `photos` scene; the SW caches them automatically. |
| badges | `story.json` badges, `tools/gen_tokens.py` | Never regenerate tokens after stickers are printed (`--force` invalidates them). |

## Hard rules
- Story is data. Dialogue edits never touch JS.
- No Pokémon IP: no official sprites, sounds, music, fonts, logos. Mechanics-style text is fine.
- No CDNs at runtime. Everything is bundled (`vendor/`, `assets/fonts/`).
- `tools/tokens.local.json` holds the badge secrets. It is git-ignored; never commit, deploy or paste it.
- Every deploy: bump `VERSION` in `sw.js` and `config.js` so phones pick up the change.

## Checks (run after every change)
1. `python3 tools/validate.py` must print OK.
2. Serve: `python3 -m http.server 8123` in the project root, open http://localhost:8123 in the browser pane at mobile size.
3. For flow changes, play the affected chapter (admin mode → Jump to scene). For engine changes, play the whole game.
4. Note: the desktop browser pane can't register service workers; test offline on the phone.

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
- `tools/validate.py` · `tools/gen_tokens.py` · `tools/qr.html` (sticker sheet; local only)
- `sw.js` offline cache

## Later (after the engine phase)
Split the routing table into `.claude/agents/*` subagents and an `/intake` skill once real content
starts flowing.
