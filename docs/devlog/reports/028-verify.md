# 028 verify — OK

- origin/main = afd33ae (included); live dist/*.js + index.html byte-identical.
- Suite: node tests/*.cjs 7本 PASS, compile-monsters --check 88 OK, sim selftest PASS, training-browser / target-select-browser / town-layout-browser (live) 1280・390 全 PASS.
- Test change: new tests/town-layout-browser.py only; no existing test lines changed/removed → stricter (additive).
- Independent check (/tmp/town028.py, live, party of 6):
  - Header: .townhead h=40 at panel top-left (x=panel+17), icon 22×24.
  - #entrance first child, full menu width (560 @1280 / 328 @390), h=64 / 56; bottom y=233 at 390 → in first view.
  - Others 2 columns (274 / 159 wide, h=52); 5 non-entrance buttons → 図書館 (last, odd) spans full width.
  - #resetopen below menu, 146×44, centered, smaller.
  - All tap targets ≥44px; no horizontal scroll.
  - Forced #townnotice text and s.cleared: both visible (notice under header, 迷宮踏破済み badge at header right).
  - Buttons open: 訓練所→#training, 酒場→#taverndialog, 鍛冶屋→#shopdialog, 寺院→#templedialog, 図書館→#librarydialog, 入り口→dungeon. No JS errors.
- Screenshots: /workspace/sim/town-1280-verify.png, town-390-verify.png
