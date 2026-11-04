# 057 [light] Priest spell: flood-fill exploration (minesweeper-style auto-reveal)

## Background
(Code as of origin/main 3ec9448.)
- **Cells:** a floor is a size×size grid, `s.cells[i] = {trap, open, flag, type, ...}`. `type` is '' / 'stairs' (up) / 'down' / 'boss' (guardian room). `open` means explored. Traps are the "mines". `num(i)` = the number of trap cells among the **8 neighbours** (`around(i)`; diagonals included; the grid edge is the outer wall). Zero = `num(i)===0`, shown as 「静かな部屋。周囲に罠はない。」. There are no inner walls or doors; the only walls are outside the grid (`face(i<0)` = 外壁). `flag` is a player marker; you can't step onto a flagged cell.
- **Stepping onto a cell** (`cell()` in dist/game.js), in this order:
  1. Guardian room with `!s.relic` → open it and show the guardian prompt.
  2. Unopened cell → `open=true`. A trap fires `triggerFloorTrap`. Otherwise the log shows the warning or the quiet-room line.
  3. `recoverCorpses(i)`.
  4. A 'down' or 'stairs' cell shows its stairs prompt. Otherwise there is an encounter roll, `encounterRate(i,wasOpen)`: 16% for an unopened cell, 10% + 0.5% × num for an opened one.
- **デュマピック:** a mage spell, `where:'field'`. Its cost is `baseSpellCost` = `2**(s.dumapicUses+1)` (2, 4, 8, …). Each cast adds 1 to `s.dumapicUses`. The counter goes back to 0 on `enterTown()` and in `finishDefeat()`, and `fresh()` keeps it across floors.
- **Spells:** each one is a `MAGIC` row in dist/spells.js (`[id,name,job(2=priest),level,mp,guaranteed,where,target,effect,value,description]`). They are learned in `learnMagic(i,level)` at level-up: a guaranteed spell is always learned; otherwise the chance is piety/30 for priests. `spellReason()` blocks a spell outside its `where`: a `field` spell in battle shows 「探索専用」. The spell list shows cost via `spellCost(x)` (flag modifier on top of `baseSpellCost`). Library (dist/library.js, spells tab): a spell is shown as 「？？？」 until any adventurer has learned it (`s.library.spells`); then it shows 職業, 習得レベル, 消費MP (`spell.mp`), 使用場所 and 効果.

## Spec
**Values marked [PROPOSAL] are placeholders until the user confirms them. Implement them as given, in a way that makes them easy to change later.**

- New MAGIC row, priest (job 2):
  - id `floodfill`
  - name **[PROPOSAL] 「ミルワピック」**
  - level **[PROPOSAL] 5**
  - base MP **[PROPOSAL] 4**
  - `guaranteed: true`
  - where `'field'`, target `'party'`, effect `'floodfill'`
  - description: 「現在地から周囲に罠のないマスを連鎖的に探索済みにする（マインスイーパーの自動展開）。敵とは遭遇しない。使用ごとにMP倍増、帰還でリセット」
- **Cost:** `base × 2**s.floodUses` (4, 8, 16, …), with its own counter `s.floodUses`, separate from デュマピック. Handle it in `baseSpellCost` with the same Math.min(50, …) cap style. +1 on each successful cast. Reset to 0 wherever `dumapicUses` is reset (`enterTown`, `finishDefeat`), and keep it in `fresh()`'s profile list like `dumapicUses`. Saved automatically (whole `s`).
- **Unusable in battle:** `where:'field'` already gives 「探索専用」 in battle. It is also unusable in town, during a guardian or stairs prompt, and while a chest is open, through the existing `spellReason` checks.
- **Algorithm** (BFS from the caster's cell `s.pos`):
  1. Mark the start cell open; it already is.
  2. If `num(start) > 0`, nothing else opens. Log 「周囲に罠の気配がある。展開できなかった。」, but MP is still spent and the counter still goes up (see question 5).
  3. Queue = [start]. Pop a cell p. **Only if `num(p)===0`**, look at each 8-neighbour q (inside the grid) that is not open, not flagged and not a trap: set `q.open=true`, and push q if `num(q)===0`. Cells with num > 0 are opened as the boundary and not expanded. Already-open cells with num 0 are also expanded, so the fill goes through explored areas, like minesweeper.
  4. Because only neighbours of 0-cells are opened, a trap cell is never opened. The `!trap` check is just a guard.
  5. Flagged cells are skipped and not expanded through, as in minesweeper. The grid edge stops it; there are no inner walls or doors.
- **Revealed cells just become explored:** no encounter roll, no trap trigger (none can be reached), no corpse recovery, no stairs or guardian prompt, no per-cell log. The party does not move. Guardian rooms that get revealed show ☠ (they are open). The guardian prompt still fires when the party actually steps onto that cell, because `cell()` checks `type==='boss'&&!relic` regardless of `open`. Stairs and corpses work normally when stepped on.
- Later, stepping onto a flood-revealed cell uses the "already open" encounter rate (10% + 0.5% × num), the same as any explored cell. No special case.
- **Log:** 「{caster}はミルワピックを唱えた。」 (existing), then 「Nマスを探索済みにした。」 (N = newly opened cells; 0 → the message from step 2, or 「新たに探索できるマスはなかった。」 if num(start)===0 but nothing new opened).
- **Learning:**
  - New priests get it at level-up through learnMagic.
  - Existing priests already at or above level 5: `ensureMagic` must add it (like it does for watchful at Lv3), so current saves get it.
  - Library: shown as ？？？ until learned, then the normal fields. 消費MP shows the base cost plus 「（使用ごとに倍増）」, or follow how デュマピック shows now. Keep both consistent.
- The spell list in the field shows the current doubled cost, as デュマピック does.
- Update SPELLS.md and docs listing priest spells.
- Tests (tests/floodfill.cjs). Build a fixed small grid by hand and check:
  - from a 0-cell, exactly the expected region plus its boundary opens
  - no trap opens
  - flagged cells are skipped
  - no encounter: stub Math.random to 0, and s.enemy stays null
  - no stairs, guardian or corpse side effects
  - start num > 0 → nothing opens, MP spent
  - cost 4 → 8 → 16, and back to 4 after enterTown
  - unusable in battle (spellReason 「探索専用」)
  - library ？？？ before learning
  - an existing Lv5+ priest gets the spell after load

## How to check it's OK
1. Live at 1280 and 390: a Lv5+ priest on a quiet (0) cell casts it. The surrounding safe region and its numbered border become explored at once, and no battle starts.
2. On a cell with a number, it opens nothing else and says so.
3. Each cast doubles the cost shown in the spell list (4 → 8 → 16); it is back to 4 after returning to town. デュマピック's cost is unaffected, and vice versa.
4. In battle the spell is grayed out with 「探索専用」.
5. Library: 「？？？」 before any priest learns it, and the full entry after.
6. Save/load: reload mid-dungeon after 2 casts. Revealed cells stay explored and the next cost is still 16.
7. Full suite passes: all tests/*.cjs, the browser tests (or a note on which were not run), `python3 scripts/compile-monsters.py --check`, and scripts/sim/selftest.cjs.

## Open questions (defaults above are used until answered)
1. Spell name (default 「ミルワピック」)
2. Level and base MP (default Lv5, MP 4)
3. Own counter, reset on return to town (default) vs. sharing デュマピック's counter
4. Revealed cells only become explored (default), or their contents also fire
5. Caster's cell number > 0: nothing opens, MP is spent (default), or the spell can't be cast and no MP is spent
6. Flagged cells are skipped (default)
7. Guaranteed learn (default) vs. the piety-based chance

## Amendment (user answers, 2026-11-03 20:01 JST — these override the proposals above)
1. Name: ミルワピック.
2. Learned at priest Lv5. Base MP 4, doubling with each use (4→8→16).
3. Its own use counter, separate from デュマピック; it resets on returning to town or a party wipe.
4. Revealed cells only become explored. Corpse pickup, stairs and the guardian prompt happen when the party actually enters the cell.
5. If cast on a cell with a nonzero number: nothing opens, and the MP is still spent.
6. Flagged cells are skipped.
7. Every priest learns it on reaching Lv5. Existing saves give it to priests already at Lv5 or above on load.
