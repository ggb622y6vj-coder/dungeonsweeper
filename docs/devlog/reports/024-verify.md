# 024 verify — OK

- Clone: /workspace/verify-clone2 @ origin/main = 141d142 (includes 141d142). Live game.js byte-identical to dist (Pages deployed).
- node tests/*.cjs: death-status, final-boss, game, temple, training all PASS
- compile-monsters.py --check: 88 defs OK; sim selftest PASS
- training-browser.py (live URL) 1280px / 390px PASS
- Independent playwright check (live, /tmp/v024b.py):
  - inn UI: #innopen/#inndialog/#stable 0, "宿屋" text 0, stayAtInn undefined
  - Return with XP 650: ok members Lv1→3/3/4/3, HP/MP full at new max, level report shown
  - dead + ash members: Lv1, XP 650 kept, HP 0
  - Return with no level gain: no popup
  - ash-v1 save patched with innCost/stableUsed/innStay loads (6 members, levels/XP intact, no JS errors)
- Test diff review: only inn/stable asserts replaced by return-time equivalents; removed only obsolete stable gold check — matches the 024 report. No unrelated weakening.
- Note: todo/024 spec was already in done/ before this verify.
