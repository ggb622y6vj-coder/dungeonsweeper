# 037 report
Commit: 68b57d8 (origin/main). Model: gpt-6-astra (high), single run.
Change: ailments.fear (3 turns, tickBattleFear/clearBattleFear mirroring silence; cleared on win/flee/defeat/town), Fight disabled with 「恐怖で攻撃できない」 (canWeaponAttack + partyAction guard), guard/spell/item allowed, not in auto-reorder; Dialko/Madi/気付け薬 cure; CSV 恐怖/命中時 for wraith/hellhound/fiendhound 15%, reaper 20%; library 「恐怖 N%」; tag + CSS; Morlis/Mamorlis text; sim: feared member casts (cure>damage>buff) else guards.
Review: full diff reviewed; no fixes needed.
Test changes: silence.cjs/silence-browser.py now expect fear cured by Dialko/気付け薬 (spec change, in commit msg).
Results: 14 tests/*.cjs PASS (fear rates 14.59% x3, reaper 20.28%); compile-monsters --check PASS; sim selftest (clean worktree) PASS; 10 browser tests PASS (1280/390).
Note: the three 15% monsters show identical rates (same seeded RNG per trial) — valid but not independent samples.
