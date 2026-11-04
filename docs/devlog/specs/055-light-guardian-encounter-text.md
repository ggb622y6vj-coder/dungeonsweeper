# 055 [light] Guardian encounter: new message and 「戦う」/「戻る」 choices

## Background
(Code as of origin/main 3ec9448.) Every floor has one guardian room (`s.boss`, cell type `'boss'`). When the party steps onto it while `!s.relic`, `cell()` in dist/game.js opens the cell, sets `s.pendingBoss={previous}`, logs 「守護者と戦いますか？」 and shows `#bosschoice`. `#bosschoice` holds 2 buttons from dist/index.html, `#bossyes`「はい」 and `#bossno`「いいえ」, which the stairs prompt (`s.pendingStairs`, 「地下N階に移動しますか？」) also uses. `answerBoss(yes)`:
- はい → `encounter(s.pos)` (a guardian-group battle; `monsterFormation(true)` = the floor's boss plus 1–2 normal monsters)
- いいえ → `s.pos = pending.previous`, log 「戦闘を避け、一歩前のマスへ戻った。」

Keyboard (dist/keynav.js): for layer `boss`, the back/default target is `#bossno`. For `stairs`, it is `#bossyes`.
The user wants the guardian prompt to read like a scene.

Depends on: none. Do it before 056 (056 touches the same prompt).

## Spec
- When the guardian prompt appears, log 「階段の上に長い手足の男が覆いかぶさっている」 instead of 「守護者と戦いますか？」. Use the same text on every floor 1F–10F (see open questions). Write it exactly as given, with no trailing 。 unless the user says otherwise.
- During the guardian prompt only, the buttons read **「戦う」** (left, `#bossyes`) and **「戻る」** (right, `#bossno`). While a stairs prompt shows, they stay 「はい」/「いいえ」. Set the labels in `render()` based on `s.pendingBoss` vs `s.pendingStairs`. Keep the button IDs, so keynav and the tests keep working.
- 戦う = the current はい behavior (start the guardian battle). No change.
- 戻る = the current いいえ behavior, unchanged: move back to the cell the party came from (`pending.previous`), log 「戦闘を避け、一歩前のマスへ戻った。」, no battle, no turn or ailment tick beyond what happens now, and the guardian cell stays open. Stepping onto it again shows the prompt again.
- Keyboard: the guardian prompt's back key and default focus stay on 戻る (`#bossno`), as now.
- Change nothing else (layout, stairs prompt, battle).
- Add a regression test (in tests/game.cjs or a new tests/guardian-prompt.cjs) that checks:
  - after stepping onto the boss cell, the last log is the new text and the button labels are 戦う/戻る
  - answerBoss(false) returns to the previous cell with the existing log
  - a following stairs prompt shows はい/いいえ again

## How to check it's OK
1. Live site at 1280 and 390 widths: walking into the guardian room shows 「階段の上に長い手足の男が覆いかぶさっている」 in the log, and the buttons 「戦う」「戻る」 fit without wrapping or overflowing.
2. 戦う starts the guardian battle as before.
3. 戻る moves the party back one cell, no battle starts, and the log says 「戦闘を避け、一歩前のマスへ戻った。」. Re-entering the cell shows the prompt again.
4. After beating the guardian, the 「地下N階に移動しますか？」 prompt shows 「はい」「いいえ」. Normal stairs prompts are unchanged.
5. Keyboard: Esc or Back selects 戻る, and Enter on the default does not start a fight unless focus is on 戦う (same as now).
6. Save/load while the guardian prompt is open (reload the page): the prompt comes back with the new labels, or behaves exactly as it does today. Note which.
7. Full suite passes: all tests/*.cjs, the browser tests (or a note on which were not run), `python3 scripts/compile-monsters.py --check`, and scripts/sim/selftest.cjs.

## Amendment (user answers, 2026-11-03 19:54 JST)
- The same text on every floor (1F–10F).
- Add a final period to the text: 「階段の上に長い手足の男が覆いかぶさっている。」
- 戻る: the behavior and the log 「戦闘を避け、一歩前のマスへ戻った。」 stay as they are now.
