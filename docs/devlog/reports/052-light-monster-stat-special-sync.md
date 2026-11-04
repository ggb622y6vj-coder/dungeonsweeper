# 052 report
- Branch hold/052 on hold/051, commit c38e216. Codex gpt-6-luna (low), 1 try.
- Amendment applied: darkpriest/witch モンティノ unchanged; tests/silence.cjs unchanged.
- CSV changes (7 cells): rat Lv 3→1, AC 8→9, 仲間呼び 40%→20%; spider 状態異常 毒15%→なし; apprentice 呪文 ハリト50%→なし, 後衛攻撃 可→不可; evileye 経験値 460→3000. All 8 石化/恐怖 entries kept (count check = 8).
- tests/game.cjs: the 'single spell' check used apprentice's CSV ハリト. Now it injects the spell for that test only and restores it afterwards, so the monster single-target spell path is still covered.
- Reviewer fix: Codex rewrote docs/DATA_CATALOG.md and data/catalog.snapshot.json into a full 88-monster resync, which goes beyond scope. I reverted that and edited only the changed cells of rows that are already in those stale 31-entry catalogs (evileye isn't in them). BALANCE.md rows updated.
- Tests: all cjs, compile --check (88), selftest, all 16 browser tests PASS. MANIFEST OK.
- sim: scripts/sim/combat.cjs --jobs 0,0,1,2,2,3 --level 階×3 --n 400, clean worktrees, base = origin/main fed7246. Wipe rate 0% on every floor 1F–10F for base and this branch. Informational: 1F deaths/battle 0.0525→0.0225, win 1.000→0.9975, avg rounds 6.52→6.06. 2F–10F identical to base.
