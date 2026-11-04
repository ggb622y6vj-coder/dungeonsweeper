# 034 report
Commit: b7e6069 (pushed to origin/main). Model: gpt-6-luna (low), first try.
Change: templeRaise now sets MP=maxMP on any success incl. petrified; Madi cure untouched. Tests: petrify.cjs MP check updated from "preserves MP" to "restores maxMP" (spec change) + reload check; petrify-browser.py MP asserts added. Specs/handoff docs updated.
Fixes by reviewer: none needed.
Results: all 11 tests/*.cjs PASS; compile-monsters --check PASS; sim selftest (clean worktree) PASS; all 8 browser tests PASS (1280/390).
