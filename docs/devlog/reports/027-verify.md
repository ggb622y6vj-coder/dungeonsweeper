# 027 verify — OK（軽微な所見あり）

- origin/main = ad11a9c (included); live dist/*.js + index.html byte-identical.
- Suite: node tests/*.cjs 7本 PASS (incl. target-select.cjs), compile-monsters --check 88 OK, sim selftest PASS, training-browser.py 1280/390 PASS, target-select-browser.py (live) 1280/390 PASS. Test diff = additions only (+1 require in game.cjs).
- target-select-browser.py covers: field/battle spell & medicine, fallback select/button parity, dead/ash/lost/HP0 untargetable, cancel/Esc/戻る returning to dialog with selection kept, Tab/Enter/Space, rerender focus, 44px taps at 390, no overflow, no JS errors.
- Independent checks (/tmp/ts.py, live, 1280 & 390):
  - Field spell mode: move('forward'/'left') and ArrowUp blocked, move buttons disabled.
  - Battle booking: dios → card tap sets magicPlans[1]={dios,target:2}, commandIndex advances; medicine → itemPlans[1] set.
  - Booked target dies before resolution: dios not cast, MP unchanged, log 「冒険者2は呪文を使えなかった。」, no error.
  - Battle forced to start while field mode open: mode is ended (bar hidden, no dangling pick); no MP spent; no error. (Real encounters can't occur since movement is blocked.)
  - Outside mode, tapping a card opens #statsdialog. Esc in field medicine mode returns to the dialog.
  - Card boxes identical in size (1280: 211×81-82, 390: 113×75-76 ≥44px); highlight uses outline (no size change).
  - No JS errors.
- 所見（NGにしない）: #allytargetbar（案内＋キャンセル＋従来select/発動）がパーティー欄の上に挿入されるため、モード開始時にパーティー欄全体が約144px下へずれる（カード寸法は不変、タップ前に確定するため誤タップ要因ではない）。気になるなら将来 bar をパーティー欄の下/オーバーレイにする案。
- Screenshots: /workspace/sim/ts-390-explore-spell.png, ts-390-explore-medicine.png, ts-390-battle-spell.png, ts-390-battle-medicine.png (+ ts-1280-*).
