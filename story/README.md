# Story data format

All game content lives in `story/story.json`. The engine never needs code changes for dialogue,
choices, trivia, badges, items or photos. After any edit run:

```bash
python3 tools/validate.py
```

It walks every branch combination and reports broken links, unknown art, unset flags and text boxes
that are too long.

## Text rules

- Each string in `lines` is **one text box**. Keep it under ~90 characters (about 3 short lines).
- Placeholders: `{name}` (trainer name), `{partner}` (GIDGET), `{L.flag}` (display label for a flag,
  e.g. `{L.lodging}` → "Seaside Inn"), `{f.flag}` (raw flag value).
- Choice labels: under 28 characters.

## Top-level sections

| Key | What it holds |
| --- | --- |
| `chapters` | Ordered list. `id`, `prefix` (scene id prefix), `title`, `start` scene, `key` (badge id, `"continue"` for a tap-to-continue chapter, or omitted for the prologue), optional `if` (chapter only exists when flags match), `lockedText`, `intro`. |
| `badges` | Unlock keys by id: `name`, `icon` (glamour, snooze, bloom, tide, compass, sunset, canele), `hint` (badge case tease), optional `if`, `kind: "key"` (says "obtained the ... Key"), `revealOn: "battle"` + `scanText` (scan starts the chapter; the badge itself is awarded by a battle). `hash`/`wordHash` are written by `tools/gen_tokens.py`; never edit them by hand. |
| `items` | `{ id: { name, desc } }` |
| `statuses` | `{ id: { name, desc } }` (flavor conditions like PUFFED) |
| `labels` | Display names for flag values: `{ lodging: { inn: "Seaside Inn" } }` |
| `lists` | Editable lists. `restaurants: [{ id, name, available? }]`; set `"available": false` to hide one. |
| `card` | Trainer card rows: `{ label, value, if? }` |
| `battles` | Battle definitions (see below) |
| `scenes` | All scenes by id |

## Scene fields (all types)

| Field | Meaning |
| --- | --- |
| `type` | One of the types below. Omit for plain dialogue. |
| `bg` | Background: `beach`, `road`, `sunset`, `night`, `field`, `town`, `inn`, `hideout`, `doorway`, `battle`, `title`. Omit to keep the previous one. |
| `sprites` | `[{ "art": "gidget", "at": "left", "anim": "bounce", "flip": true, "zzz": true }]`. `at`: left, center, right, farleft, farright, or 0–1. `anim`: bounce, bob. `[]` clears; omit to keep previous. Art: `gidget`, `gidget_sleep`, `jess`, `leon`, `leon_lips`, `leon_asleep`, `lactaid`, `tennis`, `npc`. |
| `speaker` | Name tag on the text box (supports `{partner}` etc.). |
| `lines` | Array of text boxes. |
| `do` | Effects after the lines: `{ "item": id }`, `{ "status": id }`, `{ "clearStatus": id }`, `{ "achievement": "Text" }`, `{ "badge": id }`, `{ "set": { flag: value } }`, `{ "sfx": name }`, `{ "wait": ms }`. |
| `if` / `else` | Skip this scene unless flags match; go to `else` (or `next`) instead. |
| `next` | Scene id, `"@end"` (finish chapter), or a conditional list: `[{ "if": { "lodging": "hideout" }, "next": "a" }, { "next": "b" }]`. |

Conditions (`if`): `{ "flag": "value" }`, `{ "flag": ["a", "b"] }` (any of), `{ "flag": "!value" }` (not),
`{ "cfg.toggle": true }` (a deploy-time toggle, see below). All keys must match.

## Toggles (`cfg.` conditions)

`config.js` has `TOGGLES`: on/off switches Leon sets before a deploy (they are not flags and are not
saved; the admin panel shows them read-only). A condition key starting with `cfg.` reads a toggle and
compares it to `true` or `false`, anywhere `if` is allowed (scenes, conditional `next`, choices, chapters,
badges, card rows). Example (`pro_lodging`):

```json
"next": [{ "if": { "cfg.fakeLodging": true }, "next": "pro_lodging_fake" }, { "next": "pro_sunflower" }]
```

The validator walks the whole game once per toggle combination and errors if a story condition names a
toggle that `config.js` doesn't have. Adding a toggle needs no engine work: add it to `TOGGLES`, use it
in the story, run the validator.

| Toggle | Default | Effect |
| --- | --- | --- |
| `fakeLodging` | `false` | Off: the prologue lodging pick is real (`lodging` = `inn` or `hideout`, shown on the Trainer Card). On: after either pick, `pro_lodging_fake` plays ({partner} knocks the other brochure off the table) and sets `lodging` = `inn`. Nothing later depends on `lodging`. |

## Scene types

| Type | Extra fields | Example scene |
| --- | --- | --- |
| dialogue (default) | `lines`, optional `choices` | `pro_start` |
| `choice` | `choices: [{ label, set?, next?, lines?, do?, if? }]`, `prompt?`. Or `choicesFrom: "restaurants"` + `choiceFlag` to build choices from a list. | `pro_lodging`, `pro_restaurant`, `ch2_breakfast` |
| `input` | `flag` (`"name"` = trainer name), `prompt`, `placeholder`, `max` | `pro_name` |
| `encounter` | `text` ("A wild LEON appeared!"), `sprites` slide in with a flash | `ch1_wild` |
| `obstacle` | Choices with `fail: [lines]` show a funny fail line and loop back; the right choice has `next`. Any choice in any scene can use `fail`. | `ch2_obstacle` |
| `battle` | `battle` (id in `battles`), `afterBg`, `afterSprites` | `ch1_trainer` (mini NPC), `ch7_battle` |
| `trainerCard` | Shows the card with the Share button | `pro_card` |
| `letter` | `title`, `text` (blank line = new paragraph, each fades in) or `paragraphs: []`, `msPerParagraph` | `ch7_letter` |
| `photos` | `photos: [{ src: "assets/photos/x.jpg", caption }]`, tap to advance | `ch7_photos` |
| `credits` | `lines` (a line starting `#` is a big heading), `speed` | `post_credits` |
| `minigame` | `game` (id in `js/minigames/index.js`), `params` (passed to the game), `win`, `lose`, `next`, optional `retry`, `retryPrompt`, `scoreFlag`. See below. | `ex_minigame` (admin-only example) |

## Minigames

```json
"ch3_buds": {
  "type": "minigame", "game": "tap", "params": { "taps": 10, "seconds": 5 },
  "lines": ["Pick the sunflower buds! Tap fast!"],
  "win": "ch3_buds_won", "lose": "ch3_buds_meh", "next": "ch3_after"
}
```

- `lines` play first as an intro, then the game runs on the stage (`bg`/`sprites` work as usual).
- `win` / `lose`: where to go after a win or a loss. Either can be a scene id or a conditional list,
  like `next`. **If `win` or `lose` is omitted, that outcome goes to `next`.** A scene needs `next`, or
  both `win` and `lose`.
- The player can't get stuck: after a loss a menu offers TRY AGAIN / MOVE ON (MOVE ON follows `lose`).
  `retryPrompt` changes the question (default "So close! Try again?"). `"retry": false` skips the menu
  and goes straight to `lose`.
- `do` effects run after the game, for either outcome. For win-only rewards, put them on the win scene.
- `scoreFlag` (optional): stores the game's score in that flag, e.g. `{f.buds}` in later text.
- If a game file is missing or crashes, it counts as a win. In `?fast=1` (playtest) every minigame
  wins instantly.
- `ex_` scenes are admin-only examples (reach them via the admin panel's JUMP TO SCENE). The validator
  doesn't warn that they're unreachable. They end at `@hub`.

| Game | Params | What it is |
| --- | --- | --- |
| `tap` | `taps` (10), `seconds` (5) | Stub/example: tap the stage N times before the timer runs out. |

### Adding a minigame (engine work)

1. Create `js/minigames/<id>.js` exporting `async function play(ctx)` that resolves `{ won, score? }`.
2. Register it in `js/minigames/index.js` (`GAMES = { <id>: module, ... }`, one per line: the
   validator reads the ids from there).
3. Add the file to `CORE` in `sw.js` (the validator errors if any `js/**/*.js` is missing).
4. Add a row to the table above, run `python3 tools/validate.py`.

`ctx` gives the game everything it needs without touching `ui.js`:

| Field | What |
| --- | --- |
| `params` | The scene's `params` object (`{}` if none). |
| `canvas` | The stage canvas (low-res pixel canvas, CSS-scaled up). |
| `size()` | `{ W, H, scale }`: logical canvas size and the CSS scale factor. |
| `draw(fn)` | `fn(g2d, t)` runs every frame after the background (sprites are not drawn while it's set). Cleared after the game. Sprite art can be drawn with `drawGrid`/`SPRITES` from `js/art.js`. |
| `container` | An empty DOM layer exactly over the stage for buttons/touch targets (use inline styles). Removed after the game. Sits under the menu and popups. |
| `sfx(name)`, `sleep(ms)`, `fmt(text)` | Sound (silent in playtest), fast-aware sleep, placeholder expansion. |

Games must always finish (use a timer), shouldn't read or write the save directly, and shouldn't
edit `index.html` or `styles.css`: create any DOM they need inside `container`.

## Battles

```json
"champion": {
  "foe": "CHAMPION LEON", "foeSprite": "leon", "hp": 100, "damage": 30,
  "intro": ["..."],
  "questions": [{ "q": "Question?", "options": ["A", "B", "C"], "answer": 0, "move": "MOVE NAME", "hitText": "optional", "missText": "optional" }],
  "foeMoves": [{ "name": "DAD JOKE", "text": "..." }],
  "revive": ["All letters received at 11:59 PM!", "{name} was revived!"],
  "finisher": ["{partner} used TWO YEARS!", "It's super effective!"],
  "win": ["..."],
  "award": "twoyear"
}
```

`answer` is the index of the right option, counting from 0. A right answer is Gidget's attack. A wrong
answer is a random foe move. The player can't lose: `revive` fires once when HP gets low, and HP never
reaches 0. If the foe still has HP after the last question, `finisher` knocks it out.

## Adding a chapter's real script

1. Replace the TODO scenes with the chapter prefix (e.g. `ch2_`); keep `start` pointing at the first.
2. The last scene in the chapter uses `"next": "@end"`.
3. Run `python3 tools/validate.py`.
