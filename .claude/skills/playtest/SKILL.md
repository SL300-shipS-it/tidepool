---
name: playtest
description: Run the automated full-game playtest in the browser pane (every choice option and battle answer at least once, badges unlocked by code word). Use before deploys and after engine or flow changes.
---
# Playtest

Runs silently (`?fast=1` disables all sound) and wipes the LOCAL save only.

1. Make sure the local server is running: `curl -s -o /dev/null -w '%{http_code}' http://localhost:8123/`.
   If it isn't, start it in the background: `python3 -m http.server 8123` from the project root.
2. Open http://localhost:8123/tools/playtest.html in the browser pane.
3. Poll with short javascript_tool calls (each under ~30 s):
   `document.getElementById('status').textContent`, until it says PASSED, FAILED or CRASHED
   (usually 1–2 min). A hidden pane runs slower. That's fine, keep polling.
4. Read `JSON.stringify(window.__result)`: `problems` (blockers), `unvisited` scenes (warn; a scene
   only reachable via admin is OK), `paths`.
5. Close the playtest tab when done (`tabs_close`) so nothing keeps running.
6. Report PASS/FAIL with the problems list.
