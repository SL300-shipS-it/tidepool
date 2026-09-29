// Minigame registry. A story scene { "type": "minigame", "game": "<id>" } plays GAMES[id].
// Each module exports `async function play(ctx)` that resolves { won: boolean, score?: number }.
// See story/README.md "Adding a minigame". tools/validate.py reads the ids below (one per line,
// `id: module,`), so keep this format, and add every new file to sw.js CORE.
import * as tap from "./tap.js";

export const GAMES = {
  tap: tap,
};
