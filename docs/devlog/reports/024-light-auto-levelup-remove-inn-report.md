# 024 light auto-levelup / remove inn — report

- Model: gpt-6-luna (reasoning low), 1 try (~1.5 min). Log: report/codex024.log
- Commit: 141d142 (pushed to origin/main)

## Changes
- dist/game.js: enterTown() now runs levelUp for status==='ok' members, then refills HP/MP to new max for ok members, then showLevelReport() (only shows when someone leveled; levelReport is replaced each levelUp). stayAtInn and the #innopen/#innclose/#stable handlers removed.
- dist/index.html: 宿屋 button and #inndialog removed.
- docs/SPECIFICATION.md, docs/HANDOFF.md: updated by Codex. BALANCE.md: stale inn/stable text updated by me (Codex missed it).
- Save compat: no save fields changed; ash-v1 loading untouched (migration test in tests/game.cjs passes).

## Tests (all PASS)
- node tests/*.cjs (death-status, final-boss, game, temple, training)
- compile-monsters.py --check (88 defs), sim selftest
- training-browser.py 1280px + 390px (needs `python3 -m http.server 8000 -d dist` running; Codex couldn't run it in its sandbox, I ran it myself)

## Test edits (reviewed)
- Inn-specific asserts (stable levels/MP-only/free, "no level popup on return") replaced by return-time equivalents: ok members level up with report, HP/MP full at new max, dead/ash/lost keep level 1 + XP 650 + HP/MP 0, no popup when no level gain, no inn handlers/HTML ids/宿屋/馬小屋 text, browser: no #innopen/#inndialog/#stable, dead keeps XP after reload. Removed only the `s.gold===0` stable-cost check (obsolete). Nothing unrelated weakened.
- No stray files.
