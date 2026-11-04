# 054 [light] Add サッキュバス and ダイダラボチ (10F) from the Notion monster DB

## Background
The Notion monster DB has 2 monsters the game lacks. Both appear on 10F and neither is a boss (labyrinthlord stays the 10F boss). Notion keeps specials in one free-text field. The CSV splits them into columns, and compile-monsters.py needs an `ids` entry for each new 確定名.

Depends on: 053 (ダイダラボチ needs `炎半減・氷半減`). Run after 051 and 052 so the CSV edits don't conflict.

## Spec
Add 2 rows to data/monsters.csv. Put them with the other 10F monsters, before 迷宮の主, or follow whatever order the file uses. Add these entries to `ids`: `"サッキュバス": "succubus"`, `"ダイダラボチ": "daidaraboti"`. Do not add either one to BOSSES.

| Column | サッキュバス | ダイダラボチ |
|---|---|---|
| 確定名 | サッキュバス | ダイダラボチ |
| 不確定名 | 悪魔 | 巨大な影 |
| 出現階層 | 10F | 10F |
| Lv | 12 | 10 |
| HP | 10d7+8 | 15d10 |
| AC | 1 | -3 |
| 命中補正 | 11 | 12 |
| 物理ダメージ | 2d10 | 5d9 |
| 経験値 | 1000 | 4500 |
| 群れの数 | 1〜2 | 1 |
| 金貨 | 10d8+30 | 10d8+80 |
| 種族 | 悪魔 | 人型 |
| 攻撃回数 | 1 | 2 |
| 状態異常 | なし | 麻痺/命中時20% |
| ブレス | なし | なし |
| 呪文 | なし | なし |
| アイテム奪取 | なし | なし |
| 逃走 | なし | なし |
| 仲間呼び | なし | なし |
| Lv吸収 | なし | なし |
| 後衛攻撃 | 不可 | 可 |
| 即死 | なし | なし |
| 耐性 | なし | 炎半減・氷半減 |

Notes:
- Group 「1〜1」 in Notion = `1` in the CSV (the existing convention).
- サッキュバス has no specials in Notion. Do not invent any (no Lv吸収 or charm).
- Icons come automatically from race (悪魔 ♜, 人型 ♟). No new art unless the game needs a per-ID asset. If the game does need one, reuse the generic fallback and say so in the report.
- Monster-count assertions elsewhere (tests or docs that say 88 types) go to 90. Update the catalog docs (docs/DATA_CATALOG.md, data/catalog.snapshot.json, BALANCE.md 10F table).
- Floor encounter tables: if 10F encounters come from ENEMIES by floor, nothing else is needed. If there is a hand-made 10F table, add both with the same weight as the other 10F normal monsters, and note it in the report.

### Sim
Run the 10F sim before and after. **Death and win rates may change. Report them, but they are not an NG, and do not retune.**

## How to check it's OK
1. `python3 scripts/compile-monsters.py --check` passes and reports **90** monster definitions. The per-floor boss assertion still holds.
2. The full suite passes (all tests/*.cjs, the browser tests or a note on which were not run, and scripts/sim/selftest.cjs).
3. Spot checks in dist/monster-data.js:
   - succubus: floor 10, level 12, hp [10,7,8], ac 1, hit 11, attack [2,10,0], xp 1000, groupSize [1,2], gold [10,8,30], race 悪魔, swings 1, statuses [], resistance なし, rear false, boss false
   - daidaraboti: floor 10, level 10, hp [15,10,0], ac -3, hit 12, attack [5,9,0], xp 4500, groupSize [1,1], gold [10,8,80], race 人型, swings 2, rear true, statuses [{paralysis, .2}], resistance '炎半減・氷半減', boss false
4. A 10F encounter can spawn each new monster (a forced-encounter test or a seeded check). The unidentified name shows before identification, and the 図鑑 entry appears after defeating one.
5. ダイダラボチ takes half damage from ダルト and ハリト (053 helper), rounded down.
6. The 10F sim before/after numbers are in the report, labeled as informational.
