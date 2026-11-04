# 051 report
- Branch hold/051 (local, not pushed), commit c58a6bd, parent origin/main fed7246.
- Codex: gpt-6-luna (low), 1 try. Reviewer fixes: none to code; MANIFEST.sha256 regenerated (Codex skipped it).
- Changes: 11 確定名 and 13 不確定名 in data/monsters.csv plus the ids keys in scripts/compile-monsters.py; dist/monster-data.js rebuilt; coloredLog foes literal 地獄の猟犬→地獄の犬; tests/monster-dice.cjs and tests/fear-browser.py renamed; docs (SPECIFICATION, HANDOFF, DATA_CATALOG, 042, BALANCE.md, catalog.snapshot.json) renamed.
- Checks: CSV diff only touches 確定名/不確定名 (column-wise compare); ID set is the same 88 IDs; every other field in monster-data.js is identical; spot checks OK; old names grep is clean in dist/ tests/ docs/ data/ scripts/ BALANCE.md.
- Tests: all tests/*.cjs PASS, compile --check PASS (88), selftest PASS, all 16 *-browser.py PASS (served dist/ on :8000). MANIFEST sha256sum -c OK.
- sim: scripts/sim/combat.cjs --jobs 0,0,1,2,2,3 --level 階×3 --n 400, clean worktrees, base = origin/main fed7246. Wipe rate 0% on every floor 1F–10F for base and this branch. All metrics byte-identical to base (rename only).
- Note for user: lesserdemon and greaterdemon now share the 不確定名 「悪魔」 (and 054's サッキュバス is 悪魔 as well). This follows the DB as written.
