# 026 verify — OK

- origin/main = e54494b (includes e54494b); all live dist/*.js byte-identical to repo.
- templeCost Lv1-6 (dead/ash): 25/60, 100/240, 225/540, 400/960, 500/1250, 600/1500 — matches min(100L,25L²) / min(250L,60L²).
- Live temple UI (1280 & 390): dead Lv1/2/3/5 = 25/100/225/500 G, ash = 60/240/540/1250 G shown; button disabled at cost-1 G, enabled at exact cost.
- Lv1 dead raise (Math.random=0): gold 100→75, status ok, HP/MP full, notice 「蘇生した。HP・MPが全快した。」 (023f holds). No JS errors.
- tests/training.cjs: hardcoded gold 221 replaced by formula check of raisedCost (= min(100L,25L²)) plus exact gold 321−cost — equivalent strength, not weakened. temple.cjs table extended (Lv2-4 added), Lv5+ values unchanged.
- Suite: node tests/*.cjs (6) PASS, compile-monsters --check 88 OK, sim selftest PASS.
- /workspace/sim/harness.cjs: library.js loaded only if it exists (before game.js); loads fine with DIST=verify-clone2/dist (templeCost, recordLibraryItem defined). OK.
- 026 todo already in done/.
