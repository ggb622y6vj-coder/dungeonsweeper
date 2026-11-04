# 041 戦闘・確認・各種ダイアログのキーボード操作: pushed

- コミット: a19f5ae（main、origin/main へ push 済み）。親は 3f94b4c。040（hold/040）は含まない。
- モデル: codex gpt-6-astra high（1回で完了、約15分）。ログ: report/codex041.log

## Codex の実装
- keynav.js:
  - ボス／階段／宝箱を専用の確認レイヤーにした。WASD で循環。
  - 既定: ボスは「いいえ」、階段は「はい」、宝箱は「盗賊が調べて開ける」（盗賊がいなければ「直接開ける」）。
  - Esc: ボス／階段では「いいえ」、宝箱では何もしない。
  - クリア報告を報告レイヤーにした（Space/Enter/Esc で町へ）。
  - logBusy 中は決定と Esc を無効にした。
  - 無効なボタンの理由をキーヒントに出す。
  - 列・呪文対象・呪文・薬の一覧は W/S で順に移動する。
  - 味方カードとステータスカードは表示どおりの行・列で移動する（gridMove）。
  - ステータスカードで Space を押すと持ち物を開く。
  - 味方対象の Esc で取り消すと、元のコマンドにフォーカスを戻す。
- 味方対象のキー候補: 死亡などに加えて、石化も飛ばす（マディは例外で石化を選べる）。ポインター操作は従来どおり。
- 薬ダイアログ: キーボード用の一覧ボタン（#medicinelist）を追加。
- 呪文ボタンと逃げるボタンに理由の title を付けた。ステータスカードに tabindex を付けた。
- 新規 tests/battle-keys-browser.py（1280/390。page.keyboard のみで操作し、evaluate は状態確認だけ。セーブと乱数は 039 と同じく起動前の init_script で用意）。
- docs: SPECIFICATION/HANDOFF を更新。
- Codex はブラウザを起動できず、ブラウザテストを一度も実行していなかった。

## レビューでの修正
1. 戦闘コマンド欄（2列＋全幅の 戻る/逃げる）の移動:
   - 038 の中心距離だけだと、「戦う」で D →「戻る」、列選択で D →「戻る」になっていた（battle-keys が FAIL）。
   - コマンドレイヤーと一覧の A/D は、同じ行・列の帯を優先する KeyNav.gridMove を使い、該当がなければ 038 の nearest に戻すようにした。
   - 町など他のレイヤーは 038 のまま。040 の保留論点（町の帯優先）には触れていない。
   - keynav.cjs に回帰テストを追加。
2. #medicinelist の表示:
   - 表示が html.keynav-keyboard に連動していたため、pointerdown で一覧が消えてボタンがずれ、クリックが外れていた（target-select-browser.py が FAIL：キーボードで Esc を押した後に薬の「対象を選ぶ」をクリックする場面）。
   - 薬ダイアログを開いた時点の状態で hidden を決めるように変更した。
3. Node ハーネスに document.documentElement がなく、game.cjs と target-select.cjs が FAIL していた。参照を optional chaining にした。

## テスト（a19f5ae のクリーンな worktree で実行）
- node tests/*.cjs: 15本 PASS
- compile-monsters --check: PASS
- sim selftest: 4行 PASS
- ブラウザ全13本（各 1280/390）: PASS、JSエラーなし
- battle-keys-browser.py: 10/10 連続 PASS
- MANIFEST.sha256 を再生成し、sha256sum -c で OK を確認。

## 試遊への確認事項
1. 石化したメンバーは、キーボードではマディ以外で飛ばす（マウス・タッチでは従来どおり選べる）。これでよいか。
2. 確認ダイアログ（ボス・階段・宝箱）の表示中は、その選択肢だけを操作できる。C（ステータス）などは使えない。これでよいか。
3. 薬の一覧ボタンは、キーボードで開いたときだけ表示する。これでよいか。
