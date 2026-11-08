# 指示書090：階層移動の骨格共通化リファクタリング

## ユーザーの要望（原文）

> リファクタリングの検討をしてみてください。Codexに送る前に、指示書をchatgtpに渡して指示書が妥当かどうか判断してもらってください。何もする必要がないなら、そのままで結構です。（2026-11-08）

> その上で、階段のリファクタリングを実装し、ブランチにPushしてchatgtpにレビューをもらってください。（2026-11-09）

## 経緯

- 検討下書き（旧・指示書089下書き）について ChatGPT と Grok Bot の両方から妥当性レビューを受け、両者とも「一部のみ実施すべき」で一致した。統合結論は下書きファイルに確定案として記録されている。
- ユーザーは「特性テストだけ先に入れる」を選択し、特性テストは指示書089として実施・main 統合済み（tests/travel-characterization.cjs、main f543171）。本書はその続きとして、リファクタリング本体を実施する。
- 本書の実施範囲は統合結論どおりに限定する。範囲を広げない。

## 実施範囲

### 1. 階層移動の骨格ヘルパー（dist/game.js、dist/traps.js）

内部ヘルパー（例：`enterFloor(next, {keepLog})`）を新設し、次の骨格だけを担わせる。

- 現在階の保存（rememberFloor()）。
- 移動先が s.floors に保存済みなら `Object.assign(s, structuredClone(saved))` で復元し、共通の状態整理（area='dungeon'、done=false、enemy=null、pendingBoss=null、pendingStairs=false）を行う。
- 保存がなければ fresh(next) で新規生成し、生成前に退避した s.floors と s.scan を引き継ぐ。
- 戻り値で「新規生成したかどうか」を返す。
- オプション keepLog（落とし穴専用の例外）：fresh() がログキューを消去する前に logQueue を退避し、生成後にキューへ戻して、ポンプが止まっていれば再開する。現行 descendPitfall() の挙動（退避・復元・順序・再生状態）をそのまま移す。

travelFloor()、travelElevator()、descendPitfall() はこのヘルパーを使う形に寄せる。

### 2. 到着後処理は各関数に残す（共通化しない）

次は現行どおり各関数の側に置き、呼び出し位置・回数・条件を変えない。

- 到着位置の決定、階段マスの開閉（076・087 の仕様どおり）。
- milwaSteps のリセット条件（travelFloor は階が変わったときだけ、他2経路は常時）。
- pendingElevator のクリア（昇降機と落とし穴だけ。travelFloor は触らない現行の非対称を維持）。
- clearNotice、到着ログの出し分け（保存済みの階への復元時のみ、travelFloor は町からと同一階を除く）、render() の呼び出し（階段・昇降機は呼ぶ、落とし穴は呼ばない）、各関数の戻り値（travelFloor は現行どおり undefined を含む）。
- 到着ログは、ログキューの中身と順序が現行と一致する位置で出すこと（復元直後・他のログが割り込まない位置）。

### 3. rememberFloor の保存項目コメント（dist/game.js）

rememberFloor() の先頭に、保存項目が floor、size、cells、start、boss、relic、guardianKilledThisRun の7項目であることと、項目を増やすときは特性テスト（tests/travel-characterization.cjs）の保存項目の期待値もあわせて更新する旨のコメントを置く。保存項目そのものは変えない。

### 4. 罠効果の相互コメント（dist/traps.js、dist/game.js）

罠効果の共通部品化（旧案 B）は実施しない。代わりに triggerFloorTrap() と triggerChestTrap() の先頭へ、針のダメージ式と締めの処理（全滅判定と並び替え）がもう一方と意図的に対応づけられているため、片方を変更するときはもう一方も確認して同期させる旨の相互コメントを追加する。理由文字列などの意図的な違いはそのまま残す。

## 変更してよいファイル

- dist/game.js、dist/traps.js のみ。index.html のスクリプト読み込み順は変えない（ヘルパーは実行時にのみ参照されるグローバル関数として置く）。
- テスト、データ、セーブ形式（ash-v1）は変更しない。

## 中止・縮小条件

- 共通化に多数の条件分岐、読み込み順の変更、保存仕様の変更、既存テストの期待値変更が必要になったら、拡大せず縮小または中止して報告する。目的は行数削減ではなく、保存・復元の修正漏れを減らすこと。

## 検証

- 変更前に現行 main で全テストが合格していることを土台にする（特性テストを含む node 全件は統合済みの 089 で固定済み）。
- node テスト全件（tests/game.cjs、特性テストを含む）を無変更で全合格。特に travel-characterization.cjs、elevator.cjs、pitfall.cjs、arrival 系、reload.cjs の合格を必須とする。
- ブラウザテスト全37件、compile-monsters --check、sim selftest、MANIFEST 照合。
- 差分は実施者が全レビューし、「外部から見た挙動が変わっていないこと」を確認する。

## 進め方

- ブランチ hold/090 で実装し、ユーザーの指示でブランチを push して ChatGPT のレビューを受ける。main への統合はユーザーの別途の指示を待つ。
