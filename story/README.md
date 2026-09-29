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

Conditions (`if`): `{ "flag": "value" }`, `{ "flag": ["a", "b"] }` (any of), `{ "flag": "!value" }` (not). All keys must match.

## Scene types

| Type | Extra fields | Example scene |
| --- | --- | --- |
| dialogue (default) | `lines`, optional `choices` | `pro_start` |
| `choice` | `choices: [{ label, set?, next?, lines?, do?, if? }]`, `prompt?`. Or `choicesFrom: "restaurants"` + `choiceFlag` to build choices from a list. | `pro_lodging`, `pro_restaurant` |
| `input` | `flag` (`"name"` = trainer name), `prompt`, `placeholder`, `max` | `pro_name` |
| `encounter` | `text` ("A wild LEON appeared!"), `sprites` slide in with a flash | `ch1_wild` |
| `obstacle` | Choices with `fail: [lines]` show a funny fail line and loop back; the right choice has `next`. Any choice in any scene can use `fail`. | `ch2_obstacle` |
| `battle` | `battle` (id in `battles`), `afterBg`, `afterSprites` | `ch1_trainer` (mini NPC), `ch7_battle` |
| `trainerCard` | Shows the card with the Share button | `pro_card` |
| `letter` | `title`, `text` (blank line = new paragraph, each fades in) or `paragraphs: []`, `msPerParagraph` | `ch7_letter` |
| `photos` | `photos: [{ src: "assets/photos/x.jpg", caption }]`, tap to advance | `ch7_photos` |
| `credits` | `lines` (a line starting `#` is a big heading), `speed` | `post_credits` |

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
