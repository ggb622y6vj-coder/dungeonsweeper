# 028 town-menu-layout 報告

- 結果: push 済み afd33ae（main == origin/main）
- モデル: gpt-6-luna / reasoning low、1回目で実装（約1.5分）。Codex サンドボックスでは HTTP サーバー/Chromium が起動できずブラウザテスト未実行 → executor 側で実行。
- executor 修正: tests/town-layout-browser.py の「#entrance 上端 == .townmenu 上端」判定が .townmenu の padding-top(16px/12px) を考慮しておらず失敗 → padding-top を加味した比較に修正し、「#entrance の下端が他の全メニューボタンの上端より上」の判定を追加（強化方向。既存テストは変更なし）。
- 変更ファイル: dist/index.html（HTML 構造＋CSS のみ、JS 変更なし）, 新規 tests/town-layout-browser.py, MANIFEST.sha256
- 内容:
  - .townhead（♜ 24px＋「灯の町」19px/letter-spacing 2px、左上横並び、#clearedmark は右端バッジ）。#town は padding 16px・text-align:left。#townnotice はヘッダー直下に全幅。
  - #entrance を .townmenu 先頭（DOM/Tab 順先頭）・全幅・高さ 64px（≤700px は 56px）・金枠/背景/太字。disabled は opacity .55。
  - 他ボタン（訓練所・酒場・鍛冶屋・寺院・図書館）は2列グリッド（max-width 560px 中央寄せ、高さ 52px 以上、min-width:0）。奇数個のとき最後のボタンを全幅（CSS のみ）。旧 flex/column 指定を削除。
  - #resetopen はメニュー下に小さく（高さ 44px 以上、グリッド外）。id・onclick・hidden/disabled 制御は全て維持。
- テスト:
  - node tests/*.cjs 7本 PASS（death-status, final-boss, game, library, target-select, temple, training）
  - compile-monsters.py --check: 88 OK
  - sim selftest（node scripts/sim/selftest.cjs）: PASS
  - training-browser.py 1280/390 PASS、target-select-browser.py 1280/390 PASS
  - 新規 town-layout-browser.py 1280/390 PASS（ヘッダー≤40px、アイコン≤28px、左上配置、entrance 先頭/全幅/高さ、2列、ボタン追加で奇数→全幅・偶数→2列、reset 44px、横スクロールなし、notice/踏破バッジ表示、390px で entrance がビューポート内、JS エラーなし）
- スクリーンショット: /workspace/sim/town-1280-after.png, /workspace/sim/town-390-after.png（比較用 before: town-1280-before.png / town-390-before.png）
- バランス変更なしのため sim 前後比較なし。
- 試遊への送信: executor に SendToAgent ツールがないため未送信（親エージェントから送信）。
