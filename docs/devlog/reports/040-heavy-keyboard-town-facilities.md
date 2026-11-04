# 040 町と施設のキーボード操作: 完了（main a3f9cac、push済み）

hold/040（3eac9b7）を main（041 a19f5ae → 作業中に push された 042 ad6d6a0）の上へ統合し、単一コミット a3f9cac として push。HANDOFF は 041・042・040 の節を順に並べた。

## オーナー決定の反映
- (a) KeyNav の帯優先を採用。`nearest` が同じ行・列の帯を優先し、該当がなければ中心距離。041 の `gridMove`/`step`（戦闘コマンド・列・呪文・薬一覧・味方/ステータスカード）はそのまま残して両立。書き換えた keynav-browser.py の期待値（同じ厳しさ）を採用。tests/keynav.cjs の 041 チェック「中心距離だけだと全幅の戻るを選ぶ」は、新ルールに合わせて「nearest でも同じ行の防御を選ぶ」＋「同じ行がなければ中心距離で戻る」に置き換え（チェック数は1→2）。
- 図書館の呪文タブ: 現在の登録冒険者（パーティ・控え）の誰も習得していない呪文は「？？？」のみ表示し、名前・詳細を隠す（他タブの未発見と同じ）。保存データの形式は変更なし。library.cjs と town-keys-browser.py に検証を追加。
- 酒場から訓練所を重ねて開く方式: そのまま。
- 名前欄で Enter: 未生成なら生成してから登録（そのまま）。
- 確認 dialog（抹消・リセット）: 文言は「キャンセル」のまま戻し、既定フォーカスもキャンセル。town-keys-browser.py の期待値も「キャンセル」に変更。

## 競合の解消
keynav.js（ヒント文言は宝箱 Esc＋Q/E タブを両立、defaultItem はボス/階段/ステータスの特例＋040 の既定選択、back は宝箱/logBusy＋順番変更の選択解除、keydown は logBusy/ステータスカード＋タブ操作/順番変更）。index.html は 040 版に 041 の #medicinelist（CSS・div）を戻す。docs は両方の節を残し、統合メモを追加。

## テスト（a3f9cac、042 統合後に全件再実行）
- node tests/*.cjs: 16本 PASS（monster-level-hit 含む）
- compile-monsters --check: PASS
- sim selftest（クリーンな worktree a3f9cac）: 4行 PASS
- ブラウザ全14本（各 1280/390）: PASS
- 10回連続: town-keys・keynav・explore-keys・battle-keys が各 10/10
- MANIFEST.sha256: 再生成（65ファイル）、sha256sum -c OK

## 試遊で確認してほしいこと
- 町・施設・戦闘の WASD 移動（帯優先）が自然か（特に 390px）。
- 呪文タブの「？？？」は、現在の登録者から判定する。習得者を抹消したりロストしたりすると、その呪文は再び「？？？」になる。これでよいか。
- 抹消・リセットの確認が「キャンセル」の既定で、D→Space で実行できること。

## 040b follow-up (2026-11-03): permanent spell record
- Library spell tab now uses a permanent `s.library.spells` record (saved in ash-v1 with monsters/items) instead of currently registered adventurers' `known`. Recorded on recruit registration, `learnMagic` (level up), `ensureMagic`, every `save()`, and on render. Legacy saves without the record are seeded from party + reserve. Survives deletion/wipe/loss; explicit full reset still clears the library. Never-learned spells stay 「？？？」.
- tests/library.cjs: new block (creation, level-up, saved record, learned spells shown after deleting the only learner + reload, legacy migration from party + reserve).
- Checks: all node tests/*.cjs, compile-monsters --check, sim selftest (clean worktree), all 14 browser tests at 1280/390, town-keys-browser 10/10; MANIFEST regenerated, sha256sum -c OK. Commit 223d427 pushed to origin main.
