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
| `chapters` | Ordered list. `id`, `prefix` (scene id prefix), `title` (no "CH.N" prefix: numbers are computed, see "Chapter numbers"), `numbered` (optional, `false` = no number, e.g. the post-game), `start` scene, `key` (badge id, `"continue"` for a tap-to-continue chapter, or omitted for the prologue), optional `if` (chapter only exists when flags match), `lockedText` (see "Locked screens"), `intro`. |
| `badges` | Unlock keys by id: `name`, `icon` (glamour, snooze, bloom, tide, compass, sunset, canele), optional `if`, `kind: "key"` (says "obtained the ... Key"), `revealOn: "battle"` + `scanText` (scan starts the chapter; the badge itself is awarded by a battle). `hash`/`wordHash` are written by `tools/gen_tokens.py`; never edit them by hand. No `hint` field: the validator errors on it (locked badges reveal nothing). |
| `items` | `{ id: { name, desc } }` |
| `statuses` | `{ id: { name, desc } }` (flavor conditions like PUFFED) |
| `labels` | Display names for flag values: `{ lodging: { inn: "Seaside Inn" } }` |
| `lists` | Editable lists. `restaurants: [{ id, name, lines?, line?, available? }]`; set `"available": false` to hide one. `id` and `name` are required (`name` is the choice label, max ~28 chars, and what `{L.restaurant}` shows). Optional `lines: ["..."]` (or one `line: "..."`) play after that item is picked, with the scene's `speaker`, before `next`. |
| `card` | Trainer card rows: `{ label, value, if? }` |
| `meta` | Game-wide text. `shareTitle` (first line of the old card-rows share message). `shareText` (optional, placeholders work): the Share message everywhere the card is opened (hub, menu, `trainerCard` scenes without their own `shareText`). It sends exactly that text plus the restore link and no card rows, so lodging and dinner stay private. Keep it under ~280 chars (validator warns). |
| `battles` | Battle definitions (see below) |
| `scenes` | All scenes by id |

## Scene fields (all types)

| Field | Meaning |
| --- | --- |
| `type` | One of the types below. Omit for plain dialogue. |
| `bg` | Background: `beach`, `road`, `sunset`, `night`, `field`, `town`, `inn`, `hideout`, `doorway`, `battle`, `title`. Omit to keep the previous one. |
| `sprites` | `[{ "art": "gidget", "at": "left", "anim": "bounce", "flip": true, "zzz": true }]`. `at`: left, center, right, farleft, farright, or 0–1. `anim`: bounce, bob. `[]` clears; omit to keep previous. Art: `gidget`, `gidget_sleep`, `jess`, `leon`, `leon_lips`, `leon_asleep`, `lactaid`, `tennis`, `npc`, `professor`. |
| `speaker` | Name tag on the text box (supports `{partner}` etc.). |
| `lines` | Array of text boxes. |
| `do` | Effects after the lines: `{ "item": id }`, `{ "status": id }`, `{ "clearStatus": id }`, `{ "achievement": "Text" }`, `{ "badge": id }`, `{ "set": { flag: value } }`, `{ "sfx": name }`, `{ "wait": ms }`. |
| `if` / `else` | Skip this scene unless flags match; go to `else` (or `next`) instead. |
| `next` | Scene id, `"@end"` (finish chapter), `"@hub"`, `"@replay"` / `"@cancel"` (prologue replay only, see below), or a conditional list: `[{ "if": { "lodging": "hideout" }, "next": "a" }, { "next": "b" }]`. |

Conditions (`if`): `{ "flag": "value" }`, `{ "flag": ["a", "b"] }` (any of), `{ "flag": "!value" }` (not),
`{ "cfg.toggle": true }` (a deploy-time toggle, see below), `{ "@replaying": true }` (true only while the
prologue is being replayed, see below). All keys must match.

## Locked screens reveal nothing (CR-015)

- **Badge case:** an unearned badge shows one shared `locked` icon and `???`, never its name, icon or a hint.
  Earned badges show normally. A badge hidden by `if` (Bloom when `sunflowers` = no) has no slot.
- **Hub:** a locked chapter shows `CHAPTER N: ???` (or just `???` if it is unnumbered) and its `lockedText`,
  or `Your next badge will find you.` if it has none. No chapter title, time of day or background; the HUD
  shows no title either. N is computed (see "Chapter numbers"). Set `lockedText` only on ch1 ("Your first badge awaits at the GALA."); leave it off later chapters.
- **Trainer Card:** the badge row shows earned (and visible) badges only.
- **Scanned early:** the SAVED FOR LATER popup names the badge but never the chapter.
- Validator: errors if any `lockedText` (or the fallback) contains a badge name, a chapter title, or a
  blocklisted word (Half Moon Bay, HMB, Miramar, Montara, El Granada, Princeton, Pillar Point, Cypress,
  Pasta Moon, Mavericks, Johnny's, tidepool, Pilot Light, Cantina, San Benito, Andreotti, Ritz), and if any badge has `hint`. It warns if prologue scenes,
  `meta`, `card` or `lists` contain a blocklisted word.
- Unlock links use random tokens (`#b=<hex>`), never key ids. Backup words are neutral words
  (`python3 tools/gen_tokens.py --new-words` redraws only the words; tokens and QR links stay the same).

## Chapter numbers (CR-022)

Titles never contain the number. The hub and the HUD show:

| Chapter | Open | Locked |
| --- | --- | --- |
| numbered | `CHAPTER N: TITLE` | `CHAPTER N: ???` |
| unnumbered | `TITLE` | `???` |

- N counts, in story order, the numbered chapters that currently pass their `if` (ch1 = 1). Hiding the
  sunflower chapter (`sunflowers` = no) keeps the numbers consecutive. Reordering chapters renumbers them.
- Unnumbered: the prologue (always; id `prologue`) and any chapter with `"numbered": false` (the post-game).
- Validator: warns if a numbered chapter's `title` still starts with `CH.` or `CHAPTER`; errors if
  `numbered` isn't `true`/`false`.

```json
{ "id": "post", "prefix": "post_", "title": "POST-GAME", "numbered": false, "start": "post_start", "key": "legendary" }
```

## Prologue lock

Later-chapter work must leave the prologue byte-identical. `tools/prologue.lock` holds a sha256 of the
"prologue surface": every `pro_` scene, the `prologue` chapter object, `meta`, `card`, `items`, `lists`,
the `labels` for prologue flags (`lodging`, `sunflowers`, `dinner`, `restaurant`, plus any flag a `pro_`
scene sets) and each badge's `name` and `icon` (not hashes). Other labels (`lunch`, `breakfast`,
`recover`, ...) and everything else in later chapters are outside it.

The validator errors with `prologue changed (tools/prologue.lock)` and lists the parts that differ
(`~scenes.pro_intro` changed, `+x` added, `-x` removed). If the change is intended (an approved prologue
CR), relock: `python3 tools/validate.py --relock-prologue`.

## Prologue replay (CR-019)

Once the prologue is done, the menu and the hub show **REPLAY PROLOGUE**. It opens the scene
`pro_replay_start` (if the story lacks it, a built-in REPLAY / NEVER MIND popup is used instead).

| Target / key | Meaning |
| --- | --- |
| `"@replay"` | Play the prologue from its `start` scene in replay mode. |
| `"@cancel"` | End the replay; nothing changes. Back to where she was. |
| `{ "@replaying": true }` | Condition that is true only during a replay (e.g. `pro_intro` skips to `pro_recognize`). |

- Her name, Bag, badges, keys and achievements are kept. The name input is skipped automatically
  during a replay (any `input` scene with `flag: "name"` just follows `next`).
- Each pick overwrites the old value the moment she chooses it; picks she doesn't reach keep their old
  value. Quitting mid-replay keeps the new picks so far.
- The prologue's `@end` (or `@hub`/`@cancel`) during a replay does not touch `done`: it returns to where
  she was (the chapter scene she left, if that chapter still applies, else the hub).
- Closing Safari mid-replay: CONTINUE resumes the replay and still returns there at the end.
- Restore links made mid-replay carry the replay (save field `replayReturn`), so a restore continues it.
- `@replay` / `@cancel` only work in prologue scenes (validator). The validator also walks the replay
  from `pro_replay_start` with `@replaying` true.

Example:

```json
"pro_replay_start": {
  "type": "choice", "bg": "town", "sprites": [{ "art": "professor", "at": "center" }],
  "speaker": "DR. JOSEPHSON", "lines": ["Back already? Want to redo your picks?"],
  "choices": [{ "label": "REPLAY", "next": "@replay" }, { "label": "NEVER MIND", "next": "@cancel" }]
},
"pro_intro": { "...": "...", "next": [{ "if": { "@replaying": true }, "next": "pro_recognize" }, { "next": "pro_name" }] }
```

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
| `coastsideFeast` | `true` | Offer the coastside dinner as a choice. Off: skip straight to the city restaurant list. Story reads it as `{ "cfg.coastsideFeast": true }`. |
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
| `trainerCard` | Shows the card with the Share button. Optional `shareText` (placeholders like `{name}` work): when set, Share sends exactly that text plus `\n\nRestore link: <link>` and no card rows. Without it, Share falls back to `meta.shareText`, then to the card title and every card row. Keep it under ~280 chars (validator warns). | `pro_card` |
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
  "questions": [{ "q": "Question?", "options": ["A", "B", "C"], "answer": 0, "move": "MOVE NAME", "hitText": "optional", "missText": "optional",
                  "leonMove": ["LEON used FINGER GUNS!", "{name} is not impressed."] }],
  "foeMoves": [{ "name": "DAD JOKE", "text": "..." }],
  "distracted": ["{partner} got distracted by a bug!", "{partner} started grooming mid-battle."],
  "nap": ["{partner} curled up for a nap..."],
  "revive": ["All letters received at 11:59 PM!", "{name} was revived!"],
  "wake": ["{partner} woke up and stretched! Ready to go!"],
  "finisher": ["{partner} used TWO YEARS!", "It's super effective!"],
  "win": ["..."],
  "award": "twoyear"
}
```

`leonMove` (optional, CR-021): LEON's move before that question is asked. One string or an array of
strings, each one text box (placeholders like `{name}` work, ~90 chars each). After the first box LEON
lunges with a hit sound and a screen shake; nobody takes damage. Then the question appears.

`answer` is the index of the right option, counting from 0. A right answer is Gidget's attack. A wrong
answer is a random foe move. The player can't lose: HP never reaches 0. If the foe still has HP after the
last question, `finisher` knocks it out.

**Gidget never gets hurt or faints.** Gidget was Jess's real cat; she stays playful and safe:

| Moment | What plays | Field (all optional arrays of lines) |
| --- | --- | --- |
| Wrong answer | Foe move name + its `text` (only {name} blinks), then ONE random line while {partner} turns away and hops, then `missText` | `distracted`. Default pool: "{partner} got distracted by a bug!", "{partner} started grooming mid-battle.", "{partner} is staring at absolutely nothing." |
| HP runs low (once per battle) | {partner} switches to the sleeping sprite with a zzz: all `nap` lines, then all `revive` lines, then she wakes up, HP refills, all `wake` lines | `nap` (default "{partner} curled up for a nap..."), `revive` (default none), `wake` (default "{partner} woke up and stretched! Ready to go!") |

Omitted or empty arrays use the defaults. The nap/wake happens in every battle whose HP gets low, even
without `revive`. The HP bar stays the team's ("{name} & {partner}").

Wording rule (the validator errors on it): no text anywhere in the story that mentions {partner} or
GIDGET, and no `distracted`/`nap`/`revive`/`wake` line, may say faint/fainted, KO/K.O./KO'd,
hurt, injured, died or dead. Silly hits on {name} or LEON are fine (e.g. foe move `text`
"Somehow that hurt YOU.").

## Adding a chapter's real script

1. Replace the TODO scenes with the chapter prefix (e.g. `ch2_`); keep `start` pointing at the first.
2. The last scene in the chapter uses `"next": "@end"`.
3. Run `python3 tools/validate.py`.
