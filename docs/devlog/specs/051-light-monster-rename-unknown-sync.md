# 051 [light] Sync monster names and unidentified names with the Notion monster DB

## Background
The user's Notion monster DB is the source of truth for monster data. Compared with data/monsters.csv (main b2526e1; unchanged at fed7246), 11 monsters have a different display name (確定名) and 13 have a different unidentified name (不確定名). The internal IDs are the same, so these are renames, not deletions plus additions.
scripts/compile-monsters.py maps 確定名 → ID with its `ids` table, so a rename in the CSV must also rename the key in `ids`. Otherwise the compiler fails with a KeyError, or the ID changes.

Depends on: none. Do this first. 052 and 054 edit the same CSV rows and the same `ids` table.

## Spec
Change only the 確定名 and 不確定名 columns of data/monsters.csv, plus the matching keys in the `ids` table in scripts/compile-monsters.py. Keep every ID string as it is. Do not touch any other column (stats and specials are handled in 052).

### Renames (確定名), with the ID unchanged
| ID | Current | New |
|---|---|---|
| spider | 毒蜘蛛 | 髑髏蜘蛛 |
| apprentice | 迷宮の見習い | 迷宮の詐欺師 |
| bigspider | 大蜘蛛 | 武者蜘蛛 |
| acidslime | 酸性スライム | 硫化スライム |
| venomspider | 猛毒蜘蛛 | 髑髏武者蜘蛛 |
| zombie | 屍兵 | ゾンビ |
| blob | 粘液の塊 | ブロブ |
| darkelf | 闇エルフの術師 | ダークエルフ |
| hellhound | 地獄の猟犬 | 地獄の犬 |
| lesserdemon | 小悪魔 | レッサーデーモン |
| greaterdemon | 大悪魔 | グレーターデーモン |

### Unidentified names (不確定名)
| ID (new name) | Current | New |
|---|---|---|
| spider (髑髏蜘蛛) | 虫 | うごめく虫 |
| venomspider (髑髏武者蜘蛛) | 巨大な虫 | おぞましい虫 |
| troll (トロル) | 大きな鬼 | 醜い大男 |
| scorpion (大蠍) | 巨大な虫 | 巨大な甲虫 |
| blob (ブロブ) | 不定形 | 泡立つ膜 |
| darkelf (ダークエルフ) | 杖を持つ人影 | 邪悪な妖精 |
| vampire (吸血鬼) | 青白い貴人 | 黒い死体 |
| fleshgolem (肉の巨像) | 巨大な人影 | 蠢く石像 |
| ettin (双頭の巨人) | 巨大な人影 | 異形の大男 |
| lesserdemon (レッサーデーモン) | 異形の人影 | 悪魔 |
| evileye (邪眼) | 浮かぶ目玉 | 跳ねる眼球 |
| greaterdemon (グレーターデーモン) | 異形の巨人 | 悪魔 |
| fallenangel (堕天使) | 翼ある人影 | 醜いカラス |

### Other places that hard-code the old names (update them to the new names)
- dist/game.js `coloredLog()`: the extra `foes` list has the literal '地獄の猟犬'. Replace it with '地獄の犬', or drop it because ENEMIES already provides the name. Keep the log coloring working.
- tests/monster-dice.cjs: '大蜘蛛', '酸性スライム' and similar old names (rows and the floor assertion) → new names.
- tests/fear-browser.py: '地獄の猟犬' → '地獄の犬' (2 places).
- Docs that list monsters by name (docs/SPECIFICATION.md, docs/HANDOFF.md, docs/DATA_CATALOG.md, data/catalog.snapshot.json, BALANCE.md, docs/042-MONSTER-LEVEL-HIT.md): update the names. If the repo has a generator for the catalog files, regenerate them instead of hand-editing.
- Rebuild dist/monster-data.js with `python3 scripts/compile-monsters.py`, and update MANIFEST.sha256 if the repo's flow requires it.
- Saves store enemies by ID, so old saves need no migration. Check that nothing stores or looks up a monster by its 確定名 (grep for each old name across dist/ and tests/ after the change. Nothing should be left except docs history, if any).

## How to check it's OK
1. `python3 scripts/compile-monsters.py --check` passes and reports 88 monster definitions.
2. The full suite passes: every tests/*.cjs, the browser tests tests/*-browser.py (or say which were not run), and scripts/sim/selftest.cjs.
3. Spot checks in dist/monster-data.js: `spider` has name 髑髏蜘蛛 and unknown うごめく虫; `hellhound` has name 地獄の犬; `greaterdemon` has name グレーターデーモン and unknown 悪魔; `fallenangel` has unknown 醜いカラス.
4. The set of IDs in dist/monster-data.js is exactly the same as before; diff the sorted ID lists.
5. The CSV diff touches only the 確定名 and 不確定名 columns. Check this with `git diff --word-diff data/monsters.csv`.
6. `grep -rn` for each of the 11 old names in dist/ and tests/ returns nothing.
7. In battle, a log line with 地獄の犬 is still colored as an enemy name.
