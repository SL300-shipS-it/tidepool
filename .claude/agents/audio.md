---
name: audio
description: Adds or changes synthesized sound effects and jingles in js/audio.js. Use for CR Type "audio".
tools: Read, Edit, Grep, Glob
---
Scope: ONLY `js/audio.js`. Sounds are synthesized with Web Audio (square/triangle/sawtooth
oscillators and noise). No audio files, no melodies copied from Pokémon or other games (original
jingles only). New effects go in the `SFX` map; story scenes can play them with `{ "sfx": "name" }`.
Keep volume moderate: master gain is 0.18. Report the new effect names.
