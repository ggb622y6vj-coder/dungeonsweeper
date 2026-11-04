# 027c verify — OK

- origin/main = baec29f (included); live dist/*.js + index.html byte-identical.
- Suite: node tests/*.cjs 8本 PASS, compile-monsters --check 88 OK, sim selftest PASS, training / target-select / town-layout browser (live) 1280・390 PASS.
- Test diff: battle 「戻る」-as-cancel case removed (spec: back hidden in mode; covered by cancel button + Esc cases). Fallback coverage kept (select + [data-spell-target] buttons + new dropdown). Position asserts added → net stricter.
- Independent (/tmp/ts2.py, live, 1280 & 390), field/battle × spell/medicine × cancel/Esc/confirm (24 cases): #party y within ±1px before/in/after in all; battle #commandentry y within ±1px; battle cancel = last child of #commandentry, x/width/height match back (±2px); visible back count 0 during mode; back restored to same box after cancel/Esc; normal back height 48px. No JS errors.
- Battle spell dropdown (#allytargetspellselect + この呪文で行動する) sets magicPlans {dios,target:2} and advances command; no breakage.
- Action-confirm screen: 「この行動で戦う」「戻る」 no class added, heights 44px @1280 / 40px @390 (same as before 027c per executor report). 所見: 390px で 40px は 44px 未満だが 027c 以前からの既存仕様で今回の範囲外。
- Screenshots: /workspace/sim/ts-390-v2-explore-spell.png, -explore-medicine, -battle-spell, -battle-medicine, ts-390-v2-confirm.png (+1280 confirm).
