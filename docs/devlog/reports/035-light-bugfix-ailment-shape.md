# 035 report
Commit: 6aa4723 (pushed to origin/main). Model: gpt-6-luna (low), first try.
Change: freshAilments() {poison,paralysis,sleep,silence,fear} replaces all dist init sites; normalizeAilments() fills missing keys for party and reserve on load; afflict branches poison/paralysis/stone explicitly, silence/fear are no-op placeholders (036/037), unknown types warn and do nothing. New tests/ailments.cjs; petrify.cjs expected shapes extended with silence/fear.
Review: verified all afflict callers (traps, monster CSV statuses) pass only poison/paralysis/stone. No fixes needed.
Note: scripts/sim/combat.cjs and selftest.cjs still init {poison,paralysis} (outside dist, untouched).
Results: 12 tests/*.cjs PASS; compile-monsters --check PASS; sim selftest (clean worktree) PASS; 8 browser tests PASS (1280/390). rg "paralysis:0}" dist hits only freshAilments.
