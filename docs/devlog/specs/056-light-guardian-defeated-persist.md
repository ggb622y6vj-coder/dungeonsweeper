# 056 [light] A defeated guardian never reappears (persists across town, regeneration and save/load)

## Background
(Code as of origin/main 3ec9448.) Each floor's guardian lives in cell `s.boss` (type `'boss'`). Beating the guardian group (`monsters.js`, battle end) sets `s.relic=true`, turns the cell into `'down'` and asks to go down. On 10F, beating the labyrinth lord sets `s.cleared=true` instead. `travelFloor()` refuses to go down unless `s.relic` and the party is on the `'down'` cell (「次の階層へ進むには守護者を倒す必要がある。」).
Nothing remembers a defeat beyond the current dungeon run. `enterTown()` always calls `resetDungeon()` → `fresh(1)` and `s.floors={}`, so every trip starts again on 1F with freshly generated floors, `relic:false`, and every guardian alive again. `fresh()` keeps only a whitelist of profile fields (gold, library, cleared, members, …). The save is the whole `s` (`rosterSaveState`, key `ash-v1`), so a field that `fresh()` keeps is saved automatically.

User request: once a guardian is beaten it is gone for good. Returning to town still resets the dungeon layout, but the guardian is gone and the party can go straight to the next floor.

Depends on: 055 (same prompt code; do it after).

## Spec
- Add a profile field `s.guardiansDefeated`: a sorted array of floor numbers, saved, default `[]`. Add it to the whitelist in `fresh()`'s profile, so `resetDungeon()` and `travelFloor()` keep it.
- When the guardian group is beaten on floor F (the branch that sets `s.relic=true`), add F (no duplicates).
- When a floor is generated (`fresh(floor)`) or restored, and the floor is in `guardiansDefeated` and is below 10F:
  - The guardian cell is generated at a random position as now, but with type `'down'` instead of `'boss'`. It works like normal down stairs: stepping on it shows 「地下N階に移動しますか？」, and no guardian prompt or battle happens.
  - Set `s.relic=true` for that floor so `travelFloor()` allows going down. Do **not** pay the relic bonus again: check how `relic` affects the return message and gold (`秘宝を持ち帰った！`) and keep that reward tied to an actual kill this run. If needed, use a separate flag such as `s.guardianGone` and let `travelFloor` accept either one. Pick whichever is less invasive, and explain why in the report.
  - The intro log 「迷宮に到着。守護者のいる部屋を探そう。」 may stay. Do not change it unless the user answers otherwise.
- 10F (labyrinth lord, the final boss): out of scope. Its clear state is already `s.cleared`, so don't change its behavior (see open questions).
- Old saves: no migration of past kills (there is no record of them). A missing `guardiansDefeated` counts as `[]`, so existing players fight each guardian once more, after which it is remembered. Don't break `ash-v1` loading or any older-save migration.
- 図鑑 and library are not affected.
- Tests (new tests/guardian-persist.cjs):
  - beat the 1F guardian → `guardiansDefeated` includes 1
  - enterTown, then enter the dungeon → 1F has no `'boss'` cell and has a `'down'` cell, and stepping on it gives the stairs prompt and allows travelFloor(2)
  - 2F still has its guardian
  - save() then restore (rosterSaveState → restoreRoster) keeps `[1]`
  - a save with no field loads as `[]`
  - the relic gold or message is not granted for a floor whose guardian was already gone

## How to check it's OK
1. Live at 1280 and 390: beat the 1F guardian, return to town, and re-enter. The layout is new, the former guardian room is a ⇩ down-stairs cell, there is no guardian prompt or battle, and going down to 2F works.
2. 2F's guardian still appears (with 055's text) until it is beaten. Then the same thing holds for 2F.
3. Save/load: after step 1, reload the page (and also export and import, if the game has that). The defeat is remembered. An old save without the field loads without errors, and its guardians are alive.
4. Going back to town is not rewarded with the relic bonus for a guardian-less floor. Only an actual kill gives it.
5. 10F labyrinth lord and clear behavior are unchanged (tests/final-boss.cjs passes).
6. Full suite passes: all tests/*.cjs, the browser tests (or a note on which were not run), `python3 scripts/compile-monsters.py --check`, and scripts/sim/selftest.cjs.

## Amendment (user answers, 2026-11-03 19:54 JST)
- On a floor whose guardian is defeated, the guardian room becomes down stairs (OK).
- The 秘宝 bonus is given only for the first defeat.
- 10F's 迷宮の主 is excluded and keeps its current behavior.
- Existing saves treat every guardian as not yet defeated; it is recorded when defeated again.
