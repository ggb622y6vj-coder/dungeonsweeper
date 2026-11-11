# 指示書101：セーブデータの JSON 書き出し・読み込み

## 依頼（ユーザーの言葉）

「実装のお願いです。セーブデータの.jsonでの拡張をお願いします。Notionにchatgtpの試案がありますからそれを元に実装してください。」（2026-11-11）

## 元にした試案

Notion「セーブデータのJSON書き出し・読み込み（Muse向け試案／未承認）」（迷宮スイーパー仕様書／実装予定、ページ 414058da-5cf8-817b-8da0-e815c60fb779、検証基準 main `094409f`）。試案の内容と §8 の推奨案をすべて採用する。試案が「暫定・要承認」とした点の確定値は本指示書に固定する。

## 現行実装の確認（実測、main 094409f）

- `save()`（dist/game.js:70）は `localStorage.setItem('ash-v1', JSON.stringify(rosterSaveState()))`、例外は空の catch で無視。
- 起動時の読み込み（dist/game.js:335）は `s = restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))` の後、`s.cells` の長さが 64/100/144 でなければ新規開始、そうでなければ移行・補正チェーンを大域 `s` に直接適用して `render()` する。独立した関数にはなっていない。
- `rosterSaveState()`（dist/recruits.js:22）は `{...s, rosterVersion:1, roster, partyIds, corpses}` から PARTY_FIELDS と reserve を除いた保存オブジェクトを返す。`restoreRoster()`（同:30）は入力を破壊的に変換する（roster/partyIds/rosterVersion を消し、並列配列へ展開）。
- 町の設定ダイアログ `#keysettingsdialog` には現在キーヒント切替だけがある。リセットは別ボタン＋ `#resetdialog`。
- セーブサイズ実測：序盤の実状態で約 6.7KB。階層アーカイブ（最大9階分×144セル）とロスターを最大級に見積もっても数百KBに収まる。試案の暫定上限 5MiB は十分な余裕があり、そのまま確定する。

## 仕様

### 1. 書き出し（エクスポート）

- 町の「設定」ダイアログ（`#keysettingsdialog`）に、キーヒント切替の下へボタン「セーブデータを書き出す」と状態表示 `<p id="savenotice" role="status">` を追加する。
- 処理（`exportSaveData()`）：`idle()` でなければ何もせず `savenotice` にその旨を表示する。通常は次を行う。
  - エンベロープ `{format:'dungeonsweeper-save', formatVersion:1, exportedAt:new Date().toISOString(), data:rosterSaveState()}` を作る。テスト用にエンベロープ生成を `saveExportEnvelope()` として分離し、オブジェクトを返すこと。
  - `JSON.stringify(envelope, null, 2)` を `Blob`（`application/json`）＋一時 Object URL ＋ `<a download>` のクリックでダウンロードし、URL は使用後に解放する。
  - ファイル名は端末の現地時刻で `ds_YYYYMMDD_HHMMSS.json`。
  - ゲーム状態と `ash-v1` は変更しない（`rosterSaveState()` 自体の既存の ID 補修という副作用は、通常の `save()` と同じもので許容する）。
  - 成功時は `savenotice` に「セーブデータを書き出しました。」、例外時は「書き出しに失敗しました。」を表示する。

### 2. 読み込み（インポート）

- 同じ設定ダイアログにボタン「セーブデータを読み込む」と、隠しファイル入力 `<input type="file" id="savefileinput" accept=".json,application/json" hidden>` を追加する。ボタンは `idle()` のときだけ入力を開く。
- ファイルが選ばれたら、**確定までは `s` も `localStorage` も一切変更しない**で次を順に行う。
  1. サイズ検査：`file.size > 5*1024*1024` なら拒否し、`savenotice` に表示する。
  2. `await file.text()` を `JSON.parse` する。例外は拒否（JSON ではない）。
  3. エンベロープ検査：プレーンなオブジェクト、`format === 'dungeonsweeper-save'`、`formatVersion === 1`、`data` がプレーンなオブジェクト。未対応バージョンは明示的に拒否する。`exportedAt` は表示用で、必須としない（欠ければ「日時不明」と表示）。
  4. `validateSaveData(data)`（真偽値を返す純粋関数として実装する）で次を検査する。
     - `rosterVersion === 1`
     - `roster` は配列。各要素はプレーンなオブジェクトで、`members`（プレーンなオブジェクト、`id` が空でない文字列、`name` が文字列、`job` が 0〜7 の整数、`level` が 1〜30 の整数）、`hp`/`mp` が有限数、`inventory` が配列、`equipped` が 0 以上の整数、`armor` と `ailments` がプレーンなオブジェクト。`members.id` はロスター内で一意。
     - `partyIds` は文字列の配列、長さ 6 以下、重複なし、全 ID がロスターに存在する。
     - `corpses` は配列で、各要素はプレーンなオブジェクト。
     - `floor` は 1〜10 の整数。`size` は整数、`cells` は配列で `cells.length === size*size` かつ 64/100/144 のいずれか、各セルはプレーンなオブジェクト。
     - `gold` は 0 以上の有限数。
     - `guardiansDefeated`/`elevatorFloors` はあれば配列、`floors` はあればプレーンなオブジェクト（値はプレーンなオブジェクトで、`cells` があれば長さ 64/100/144）、`logs` はあれば配列。
     - 上記以外のフィールドは検査せず通す（rosterVersion 1 の範囲での前方互換）。
  5. クローン評価：`restoreRoster(structuredClone(data))` を try/catch で実行し、結果が存在し、`cells` の長さが 64/100/144、`members` が配列であることを確認する。失敗したら拒否する。
  6. ここまで通ったら確認ダイアログ `#importdialog` を開く。要約（書き出し日時＝ `exportedAt` を現地時刻表示／登録冒険者数＝ `roster.length`／パーティ人数＝ `partyIds.length`／現在階＝ `floor` で「地下N階」）はすべて `textContent` で設定する。固定文言「読み込むと現在の冒険データは上書きされます。」も表示する。キャンセル（閉じる）では保留データを破棄し、ファイル入力の値を空に戻す。状態は不変。
  7. 「上書きする」で確定する。
     - 現在の `localStorage.getItem('ash-v1')` が null でなければ、その生テキストを `localStorage.setItem('ash-v1-backup', raw)` に退避する。退避に失敗したら `#importnotice`（確認ダイアログ内の状態表示）に表示して中止する（何も書き換えない）。
     - `localStorage.setItem('ash-v1', JSON.stringify(data))` を try/catch で行い、失敗したら通知して中止する。
     - 読み戻して `JSON.parse` し、`rosterVersion === 1` かつ `roster` の長さが `data.roster.length` と一致することを確認する。不一致なら退避から `ash-v1` を復元（元が null なら `removeItem`）し、通知して中止する。
     - すべて通ったら `location.reload()` する。以後の初期化・移行は既存の起動処理に委ねる。
- `eval`・`Function`・スクリプト実行は絶対に使わない。JSON 由来の文字列を DOM に入れるときは `textContent` のみを使う。
- 保留中のインポートデータは UI 専用の一時変数に置き、`s` には入れない（保存対象にもしない）。

### 3. UI・配置

- 2つのボタンは設定ダイアログ内でリセットボタン（ダイアログ外）と混同しない並びにする。確認ダイアログは既存ダイアログの流儀（`data-key-default`/`data-key-back` はキャンセル側）に合わせる。
- 1280px／390px の両幅で操作でき、キーボード操作（keynav）の既存挙動を壊さない。

### 4. 仕様書

- docs/SPECIFICATION.md に、書き出し・読み込みの仕様（エンベロープ形式、ファイル名、上限 5MiB、検証項目、退避キー `ash-v1-backup`、再読込で反映すること、端末設定 `ash-keyhint` は対象外であること）を追記する。

## 変更しないこと

- 自動保存（`ash-v1`、キー・形式とも）、`rosterVersion:1`、起動時の読み込み処理そのもの（335 行のチェーンには触れない）。
- `ash-keyhint` など端末固有設定は書き出し対象に含めず、読み込みでも変更しない。読み込みが書き込むキーは `ash-v1` と `ash-v1-backup` だけ。
- `save()` の通常時の例外処理（今回の対象は書き出し・読み込み経路の失敗通知のみ。通常の自動保存への警告 UI 追加はしない）。
- 合併（マージ）機能、複数スロット、クラウド同期、暗号化は実装しない。Notion は変更しない。
- セーブデータの項目追加・削除（`rosterSaveState()` の範囲を変えない）。

## テスト

- `tests/save-transfer.cjs` を新設し `tests/game.cjs` に登録する：
  - 実状態から `saveExportEnvelope()` を作り、形式（format／formatVersion／exportedAt／data.rosterVersion===1）を確認。
  - `validateSaveData` が実際の `rosterSaveState()` 出力を受け付ける。
  - 拒否ケース：rosterVersion 不一致、roster 欠落・非配列、ID 重複、partyIds の宙吊り参照・重複・7人、cells 長の不一致と不正値、floor 範囲外、gold 負値、レコードの型崩れ（hp 非数値・inventory 非配列など）。
  - 往復：状態 → エンベロープ → JSON 文字列 → parse → 検証 → クローンに `restoreRoster` → ロスターの ID・編成順・VIT・xpTargets が不変（再抽選されない）。
- `tests/save-transfer-browser.py` を新設する：
  - 設定ダイアログに両ボタンがある。書き出しで `ds_*.json` のダウンロードが発生し、中身がエンベロープ形式である。
  - 有効なファイル（ページ内で現在の `rosterSaveState()` を取り出して金貨だけ番兵値に変えたもの）を読み込み、確認後に再読込され、金貨が番兵値・ロスターが不変である。
  - 不正なファイル（JSON でない文字列）では通知が出て、状態（金貨）が変わらず再読込も起きない。
  - 有効なファイルを選んでキャンセルすると状態が変わらない。
- 既存テストはすべて従来どおり PASS すること（node は現行 145 件＋追加分、ブラウザは現行 40 件＋1 件）。

## 検証

- `node tests/game.cjs` 全PASS。
- ブラウザテスト全件 PASS。
- `python3 scripts/compile-monsters.py --check`、`node -e "process.argv=['node','sim','selftest'];require('./scripts/sim/selftest.cjs')"` PASS。
- MANIFEST.sha256 を再生成し不一致0を確認する。
- 報告書 `docs/devlog/reports/101.md` を作成する（使ったモデル・推論設定も記載）。

## 作業の進め方（Codex向け）

- 作業ブランチは `hold/101`（このブランチで作業すること）。コミットはこちらで行うので、作業ツリーに変更を残すだけでよい。
- 実装は dist/game.js と dist/index.html を中心とし、新規ファイルは作らない（テストは除く）。対象範囲を厳密に守り、範囲外のリファクタリングや整形をしないこと。
- テストが落ちたら、期待値を緩めたりテストを削除したりせず、原因を切り分けて報告書に書くこと。
- 敵のHP・能力値をプレイ画面に出す変更、ダイスの内部計算のログ出力は禁止です。
