---
name: deploy
description: Ship the current committed state of Tidepool to GitHub Pages safely (checks, version bump, tag, push, live verification). Use when Leon says "deploy", "ship it", or "push it live".
---
# Deploy

Live: https://sl300-ships-it.github.io/tidepool/ · repo SL300-shipS-it/tidepool (branch main).

1. **Freeze check**: on or after 2026-10-10 (the trip), deploy only if the changes since the last
   `deploy-*` tag touch `story/story.json` alone, unless Leon said "override".
   (`git diff --name-only $(git describe --tags --abbrev=0 --match 'deploy-*')`)
2. **Clean tree**: `git status`. Everything must be committed; `tools/tokens.local.json` must not be tracked.
3. **Checks**: `python3 tools/validate.py` must print OK. Run /playtest; it must PASS. No exceptions.
4. **Bump version** (patch: 0.1.0 → 0.1.1) in BOTH `config.js` (`VERSION`) and `sw.js`
   (`tp-v...`); rerun validate (it checks they match). Commit `Release vX.Y.Z`.
5. **Tag + push**: `git tag deploy-vX.Y.Z && git push && git push --tags`.
6. **Verify live**: use Monitor to wait until
   `curl -s https://sl300-ships-it.github.io/tidepool/config.js` contains the new version (usually
   1–2 min), then confirm `/tools/tokens.local.json` returns 404.
7. **Tell Leon**: version, what shipped, and that phones pick it up on their next open (the page loads
   the old version once while the new one downloads; the reload after that shows it).
8. **Freeze ids**: after the first deploy Jess actually plays (real prologue), run
   `python3 tools/validate.py --freeze` once and commit `tools/frozen.json`.

Rollback: `git revert <bad commit>` (or `git checkout deploy-vPREV -- .`), then run this skill again.
Never force-push.
