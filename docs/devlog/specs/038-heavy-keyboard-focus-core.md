# 038 [heavy] キーボード操作の基盤（フォーカス移動・決定・戻る）

## 共通ルール
- 作業ツリーは担当者自身のもの。push はオーナー指示があるまでしない。既存テストのチェックは削除・緩和しない。
- タッチ／マウス操作と 390px レイアウトを壊さない（既存ブラウザテスト全件PASS）。
- テキスト入力（#recruitname など INPUT/TEXTAREA/SELECT）にフォーカスがある間は、Esc 以外のキーをゲームが奪わない。
- Ctrl/Alt/Meta 付きのキーは無視する（ブラウザのショートカットを妨げない）。
- 完了条件: node tests 全件・compile-monsters --check・selftest・ブラウザテスト全件（1280/390）PASS、JSエラーなし。新規テストはキーボードだけで操作する Playwright（page.keyboard のみ、click・evaluate での直接操作は禁止。evaluate は状態の確認だけに使う）。

## 目的
PCで全画面をキーボードだけで操作できるようにする土台（オーナー要望 pt90u）。039〜041 はこの仕組みの上に作る。

## 変更内容
- 新規 dist/keynav.js。すべての keydown をここに集約する（既存の game.js:196 のハンドラは 039 で統合）。
- 「操作レイヤー」を上から順に判定する。
  1. 開いている最前面の dialog
  2. 味方対象選択（allyTargetPick、027c の対象バー）
  3. 戦闘コマンド欄（#commandentry）
  4. 町メニュー
  5. 探索
- 各レイヤーで「選べる要素」を集める: button / [data-*-choice] / タブ。hidden・disabled・非表示のものは除く。
  - disabled の項目はフォーカスを通過させるが決定はできない、とする。理由（恐怖・沈黙など）の title を読めるようにするため。
- 移動: W/↑ 上、S/↓ 下、A/← 左、D/→ 右。
  - 要素の画面上の位置（getBoundingClientRect の中心）で、その方向にある一番近い要素へ移る。2列メニューやグリッドでも上下左右が自然に動く。
  - 端では止まる（ループしない）。
  - スクロール領域内では scrollIntoView({block:'nearest'})。
- 決定: Space（主）と Enter。フォーカス中の要素の click() を呼び、マウスと同じ経路を通す。
- 戻る: Esc。
  - 最前面の dialog の閉じる（×）または「いいえ／キャンセル／戻る」系ボタンを押す。
  - 各画面のボタンに data-key-back を付けて明示する。
  - 閉じたら、開く前にフォーカスしていた要素へフォーカスを戻す。
- フォーカスリング: 全画面共通の CSS クラス `.kfocus`。
  - 例: outline 3px solid var(--gold)、outline-offset 2px、box-shadow で外側を暗くして背景色に依存せず見えるようにする。
  - キーを押した時だけ表示し、マウスやタッチの操作で消える（pointerdown で解除）。:focus-visible とも矛盾しないようにする。
- レイヤーが切り替わったら（dialog が開く、戦闘が始まる等）、先頭の「既定項目」にフォーカスを置く。各画面のボタンに data-key-default を付けて指定する。
- キーヒント（PCのみ）:
  - `(hover:hover) and (pointer:fine)` かつ 幅701px以上 のときだけ、画面下に小さく表示する。例:「W/A/S/D・矢印：選択　Space：決定　Esc：戻る」。
  - レイヤーに応じて文言を変える。
  - 町の設定（ローカル保存、ash-v1 とは別キー `ash-keyhint`）で表示／非表示を切り替えられる。390px とタッチ端末では出さない。

## OKの判定方法
1. node（tests/keynav.cjs）:
   - 要素配置を模した座標で、方向移動が最寄り要素を選ぶ（2×3グリッドで W/A/S/D それぞれ期待どおり、端で停止）。
   - disabled はフォーカスできるが決定は無効。
2. Playwright（tests/keynav-browser.py、1280）:
   - 町でキーだけで dialog を開き、W/S/A/D と矢印で移動、Space と Enter で決定、Esc で閉じる。
   - 閉じた後、元のボタンにフォーカスが戻る。
   - .kfocus 要素の computed outline の幅が 3px 以上。
3. #recruitname に入力中、w/a/s/d/space/e/f が文字として入り、フォーカスも動かない。Esc で入力欄から抜けられる。
4. マウスでクリックすると .kfocus が消える。390px（タッチ相当の hasTouch）ではキーヒントが表示されない。1280 では表示され、設定で消せる。
5. 既存ブラウザテスト全件PASS。
