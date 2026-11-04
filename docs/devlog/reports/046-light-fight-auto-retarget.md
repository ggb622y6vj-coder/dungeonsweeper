# 046 fight auto-retarget — report
Commit 6559121 (hold/046 → main, fast-forwarded and pushed). Codex: gpt-6-luna left it incomplete (game.cjs failed), so it was reset and rerun with gpt-6.1-sol (medium), which passed.
## Changes
- dist/game.js partyAction: `selectedEnemy(i)||reachableEnemyGroups(i)[0]?.units.find(e=>e.hp>0)`. The row switch makes no log. The "全滅している" log now appears only when no reachable group is alive.
- tests/attack-retarget.cjs (new, required from game.cjs): two fighters on the same row, no extra log, melee limited to the front 2 rows, ranged reaches all rows, empty battlefield, spell retarget unchanged.
- tests/battle-keys-browser.py: a 046 case through real key input (1280/390).
- tests/game.cjs: the guardian case now has only 1 fighter, because the other attacks now retarget instead of being wasted. The kill-sync check was fixed: it waited for a log line that never appears, so it never ran. It now runs, which makes it stricter.
- docs/HANDOFF.md, docs/SPECIFICATION.md, MANIFEST.sha256 updated.
## Checks
All node tests/*.cjs pass. compile-monsters --check: 88 OK. The sim selftest passes in a clean worktree. All 15 browser tests pass, and battle-keys-browser passes 10/10. sha256sum -c OK.
## Sim (jobs 0,0,1,2,3,2, main→046)
- F1 (n=300): win .993→.997, rounds 6.29→5.64
- F5 (n=2000): win .965→.9635, deaths .204→.220 (noise)
- F10 (n=300): no change
No balance regression.
