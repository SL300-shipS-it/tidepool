---
name: playtest
description: Run the automated full-game playtest in the browser pane (every choice option and battle answer at least once, badges unlocked by code word). Use before deploys and after engine or flow changes.
---
# Playtest

Runs silently (`?fast=1` disables all sound) and wipes the LOCAL save only.

1. Start the server with the browser pane's `preview_start` (name `game`, from `.claude/launch.json`).
   The pane blocks servers started from Bash. If the pane's server can't read the Desktop folder (404s),
   rsync the project (minus .git) into the session scratch folder and serve that copy instead.
2. Before the playtest, refresh cached files: in the pane, `fetch()` each `js/*.js` with `{cache: "reload"}`
   and confirm `js/audio.js` contains `SILENT`. A stale cached copy could play sound. Then open
   http://localhost:8123/tools/playtest.html.
3. Poll with short javascript_tool calls (each under ~30 s):
   `document.getElementById('status').textContent`, until it says PASSED, FAILED or CRASHED
   (usually 1–2 min). A hidden pane runs slower. That's fine, keep polling.
4. Read `JSON.stringify(window.__result)`: `problems` (blockers), `unvisited` scenes (warn; a scene
   only reachable via admin is OK), `paths`.
5. Close the playtest tab when done (`tabs_close`) so nothing keeps running.
6. Report PASS/FAIL with the problems list.
