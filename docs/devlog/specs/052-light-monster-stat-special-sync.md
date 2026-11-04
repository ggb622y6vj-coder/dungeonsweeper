# 052 [light] Sync monster stats and specials with the Notion monster DB (keep petrification and fear)

## Background
The Notion monster DB is the source of truth. The user confirmed that every numeric and special-ability difference from data/monsters.csv is intentional, including 邪眼's XP 460→3000, which is meant as a Will-o'-the-wisp-style high-XP monster.
There is one exception. The game's 石化 (petrification) and 恐怖 (fear) were added after the DB was made, so Notion is missing them. **Keep every 石化 and 恐怖 entry that is in the CSV now** (8 monsters: ガーゴイル, 石巨人, 邪眼, 混沌の落とし子, 亡霊, 地獄の犬, 魔界の猟犬, 死神).
This batch is the monster tuning the user asked for. Do not add balance changes or commentary beyond the values below.

Depends on: 051 (same rows, and the names below are the post-051 names). The values do not depend on 053 or 054.

## Spec
Change only the cells listed in data/monsters.csv. Keep the column formats as they are (for example `行動20%/同種1体/列上限6体`, `ハリト/単体/40%`, `可`/`不可`).

| ID | Name | Column | Current | Target |
|---|---|---|---|---|
| rat | 大鼠 | Lv | 3 | 1 |
| rat | 大鼠 | AC | 8 | 9 |
| rat | 大鼠 | 仲間呼び | 行動40%/同種1体/列上限6体 | 行動20%/同種1体/列上限6体 |
| spider | 髑髏蜘蛛 | 状態異常 | 毒/命中時15% | なし |
| apprentice | 迷宮の詐欺師 | 呪文 | ハリト/単体/50% | なし |
| apprentice | 迷宮の詐欺師 | 後衛攻撃 | 可 | 不可 |
| darkpriest | 闇の司祭 | 呪文 | モンティノ/全体/30% | ハリト/単体/40% |
| witch | 魔女 | 呪文 | モンティノ/全体/25% | ダルト/全体/25% |
| evileye | 邪眼 | 経験値 | 460 | 3000 |

Leave these alone even though Notion lacks them:
- 状態異常 for gargoyle (石化5%), stonegiant (石化8%), evileye (麻痺30% 石化10%), chaosspawn (毒30% 麻痺10% 石化5%), wraith (恐怖15%), hellhound (恐怖15%), fiendhound (恐怖15%), reaper (恐怖20%).
- Every other column of every monster. Notion already matches main there, including physical damage, HP and group size.

### Knock-on effects (expected; update the tests to match)
- After this change, no monster casts モンティノ (silence). tests/silence.cjs assumes darkpriest/witch cast it (chance table [['darkpriest',.3],['witch',.25]], `effect==='silence'` count 2, the 図鑑 text 「モンティノ（沈黙・全体 30%）」, and the log 「闇の司祭はモンティノを唱えた。」). Rewrite those tests so they no longer depend on CSV data: inject a test-only spellInfo for montino on a monster in the test, the way the test already overrides `enemyDefinition('darkpriest').spell`, so the monster silence path stays covered. Do not delete the montino engine code or the MONSTER_SPELLS entry. Player-cast montino tests are unaffected.
- tests/petrify.cjs and tests/fear*.{cjs,py} should still pass unchanged (apart from 051's rename), because petrification and fear are kept.
- Rebuild dist/monster-data.js, and update the catalog docs (docs/DATA_CATALOG.md, data/catalog.snapshot.json, BALANCE.md special-ability column) for the changed rows.

### Sim
Run the usual combat sim (scripts/sim, from a clean checkout as the README-handoff says) for floors 1F, 4F, 8F (and any floor you normally report), before and after. **Death or win rates may change. Report the numbers, but do not treat a change as an NG and do not retune anything.**

## How to check it's OK
1. `python3 scripts/compile-monsters.py --check` passes (88 definitions).
2. The full suite passes (all tests/*.cjs, the browser tests or a note on which were not run, and scripts/sim/selftest.cjs).
3. Spot checks in dist/monster-data.js:
   - rat: level 1, ac 9, summon 0.2, summonCap 6
   - spider: statuses []
   - apprentice: spell 0, spellInfo null, rear false
   - darkpriest: spell 0.4, spellInfo.id 'halito', target 'one', and summon still 0.1
   - witch: spell 0.25, spellInfo.id 'dalto', target 'all'
   - evileye: xp 3000, statuses [paralysis .3, stone .1], and spellInfo still halito 40%
4. All 8 petrification and fear entries are still present. For example: `ENEMIES.filter(d=>d.statuses.some(s=>s.type==='stone'||s.type==='fear')).length === 8`.
5. `git diff --word-diff data/monsters.csv` shows only the 9 cell changes in the table.
6. The sim before/after numbers are in the report, labeled as informational.

## Amendment (user decision 2026-11-03 16:40 JST: 「モンティノはゲーム側のまま残してください」)
- Do NOT change 闇の司祭 or 魔女's モンティノ (silence); keep the game's current spell values as they are, the same as for petrification and fear.
- So the 闇の司祭 → ハリト and 魔女 → ダルト changes above are dropped. tests/silence.cjs stays unchanged, using the real data.
- Every other change in this spec stays.
