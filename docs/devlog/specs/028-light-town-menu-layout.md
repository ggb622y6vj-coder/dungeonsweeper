# 028-light-town-menu-layout：町メニューのレイアウト整理
ティア: light / 依存: 027 の後に実行（024 宿屋削除済み、025 図書館は未マージでも可）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
町画面（dist/index.html `#town`）は ♜アイコン（.townart font-size:80px）と「灯の町」見出しが中央に大きく、パネル上部の padding 36px と合わせて画面上部を占有している。最もよく押す「迷宮への入り口」(#entrance) は .townmenu の最後にあり、390px では縦1列の最下段（スクロール位置次第で画面外）になる。
見出しを左上の小さなヘッダーにまとめ、#entrance を最上段に全幅で目立たせ、残りのボタンを2列グリッドで並べる。

## 現状（141d142）
- HTML: `<section id="town" class="panel"><div class="townart">♜</div><h2>灯の町</h2><p id="townnotice" role="status"></p><small id="clearedmark" hidden>迷宮踏破済み</small><button id="resetopen">冒険データをリセット</button><div class="townmenu"> #trainingopen #tavernopen #blacksmith #templeopen #entrance </div></section>`
- CSS: `#town{text-align:center;padding:36px 20px}` `.townart{font-size:80px}` `#town h2{letter-spacing:7px}` `.townmenu{display:flex;gap:16px;padding:20px}` `.townmenu button{min-width:180px;padding:22px}`、`@media(max-width:700px){.townmenu{flex-direction:column}}`、別箇所に `.townmenu{flex-wrap:wrap}`。

## 変更内容（dist/index.html のみ。JS は原則変更しない）
1. ヘッダー：.townart と h2 を `<div class="townhead">` で包み、左上に横並び（display:flex;align-items:center;gap:8px;justify-content:flex-start）。
   - ヘッダー高さ 40px 以下（390px でも）。アイコン font-size 24px（≒24×24px）、text-shadow は弱める。h2 は font-size 18-20px、letter-spacing 2px、margin 0。
   - #town の padding を 16px 程度に、text-align:left（ボタン内は中央揃えのまま）。
   - #clearedmark はヘッダー右端のバッジとして表示（hidden 制御は既存のまま）。#townnotice はヘッダー直下に全幅で表示し、空でないときは必ず見える。
2. #entrance を .townmenu の先頭へ移動（DOM 順も先頭＝Tab 順も先頭）。全幅（grid-column:1/-1）、高さ 64px 以上（390px は 56px 以上）、アクセント色の枠/背景・太字・やや大きい文字で最も目立たせる。disabled 時は既存どおり無効表示が分かる。
3. 残りのボタン（#trainingopen #tavernopen #blacksmith #templeopen、将来の図書館ボタン等）：`.townmenu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}`。ボタン高さ 52px 以上、min-width は撤廃（min-width:0）。1280px でも2列、メニュー全体の max-width 560px 程度で中央寄せ。
   - ボタン数は任意。entrance を除く数が奇数のとき、最後のボタンを全幅に広げる：`.townmenu > button:not(#entrance):last-child:nth-child(even){grid-column:1/-1}`（entrance が先頭の1番目なので、他ボタンが奇数個なら last-child は偶数番目）。JS でボタン数を数えない。
   - 旧 `.townmenu{flex-direction:column}`/`flex-wrap` 指定は削除または grid と矛盾しないよう整理。
4. #resetopen（破壊的操作）はメニューの下に小さく控えめに移動（グリッドに含めない、高さ 44px 以上）。
5. 既存の id・onclick・hidden/disabled 制御は全て維持。#gametitle（迷宮スイーパー）の表示条件は変えない。
6. テストのセレクタが DOM 順や見出しに依存していれば更新する（id 参照なら変更不要）。

## OKの判定方法
- 既存テスト（node tests/*.cjs、compile-monsters.py --check、sim selftest、training-browser.py 1280/390）が全て PASS。
- tests/ にブラウザテスト（例 tests/town-layout-browser.py、/tmp/pyv/bin/python、1280 と 390）を追加：
  - .townhead の高さ ≤40px、♜アイコンの boundingBox ≤28px、ヘッダーが #town の左上（x がパネル左端+24px 以内）。
  - #entrance が .townmenu の最初の子で、上端が他のどのメニューボタンより上、幅＝.townmenu 幅（±2px）、高さ ≥56px（390）/≥64px（1280）。
  - 他ボタンが2列：1行目の2ボタンの top が等しく left が異なる。全メニューボタンと #resetopen の幅・高さが 390px で ≥44px。
  - JS で .townmenu に一時的にボタンを1つ追加（奇数→偶数）/2つ追加して、奇数個時に最後が全幅、偶数個時に2列で空きが無いことを確認（図書館追加を想定）。
  - document.documentElement.scrollWidth ≤ innerWidth（横スクロールなし）、JS エラーなし。
  - #townnotice に文言を入れると表示され見える（boundingBox 高さ>0、ビューポート内）、s.cleared で #clearedmark が見える。
  - 390px で #entrance がページ初期表示のビューポート内に完全に収まる。
- スクリーンショット /workspace/sim/town-1280-after.png・town-390-after.png を保存し、報告に添付。
