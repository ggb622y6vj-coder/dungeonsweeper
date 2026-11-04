OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-luna
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: low
reasoning summaries: none
session id: 01a19895-a437-7aa2-b4ab-51277846ed1f
--------
user
# Codex引き継ぎ指示書（迷宮スイーパー）キュー版

根拠資料：`/workspace/dungeonsweeper-review.md`。旧版：`/workspace/codex-tasks-v1.md`、`/workspace/codex-handoff/`、分割前のキューは `/workspace/dsw-queue-old/`。
対象：1〜3Fのみ実装済み。4F以降は保留。

## 運用
- `todo/` をファイル名順に1回1ファイル処理（1ファイル＝1機能/1修正）。完了したら `done/` へ移動、報告は `report/`。
- bugfix（001〜009）を先に、その後に機能・バランス（010〜）。番号は依存順。
- 失敗時は同じファイルを最初からやり直さず、エラーを添えて続きから修正させる。
- ファイル名の light / heavy：LIGHT＝軽量・安価なモデル、HEAVY＝最上位モデル（設計は決定済み）。

## 実行順
| ファイル | ティア | 依存 | 内容 |
|---|---|---|---|
| 001-bugfix-name-regex | LIGHT | なし | キャラクター名に ( や [ を含むとログ描画で例外が出てゲームが止まるバグを直す（最優先）。 |
| 002-bugfix-poison-death-log | LIGHT | なし | 探索中（移動時）に毒でHPが0になってもログに何も出ないバグを直す。 |
| 003-bugfix-attack-dead-branch | LIGHT | なし | attack() 内の到達不能な分岐を削除する（挙動不変の整理）。 |
| 004-bugfix-magicplans-length | LIGHT | なし | 呪文・アイテム予約配列が旧3人前提の長さで初期化されるのを、パーティ人数に合わせる。 |
| 005-bugfix-chest-item-pool | LIGHT | なし | 宝箱から店専用品（例：板金鎧300G）が1Fでも出るのを、階層の価格上限で制限する。 |
| 006-bugfix-summon-cap | LIGHT | なし | 仲間呼び（例：大鼠40%）で敵が増え続け、XPを無限に稼げる問題を直す。 |
| 007-bugfix-combat-hide-numbers | LIGHT | なし | 戦闘中、一人称視界に迷宮の数字が敵シルエットの背後に重なって見えるのを直す。 |
| 010-light-sim-tool | LIGHT | なし（ゲーム本体は変えない） | 数値調整の前後比較用の戦闘シミュレータを追加する。 |
| 011-light-exp-split | LIGHT | 010推奨 | 成長が速すぎる（探索約20回でLv30）ため、撃破XPを生存者数で分配する。 |
| 012-light-escape-rate | LIGHT | 011 | 逃走率が最低75%で簡単すぎるため、レベル差で決まる式にする。 |
| 013-light-guardian-escort | LIGHT | 012 | 守護者が単独で通常戦より弱い（Lv1でも勝率99%）ため、随伴の敵を付ける。 |
| 014-light-trap-count | LIGHT | 013 | 罠が全階10個固定で深い階ほど密度が下がるため、階層ごとに増やす（1〜3F）。 |
| 015-light-flag-tuning | LIGHT | なし | 旗の発動率を1本4%・上限40%の線形に。 |
| 016-light-floor-config-10f | LIGHT | 014 | MAX_FLOOR=10、罠ダメージの階層倍率。 |
| 017-light-monsters-4-10f | LIGHT | 013,016 | 88種のモンスターCSVと全体呪文（assets/）。 |
| 018-light-items-4-10f | LIGHT | 017 | 武器・防具・薬の追加、迷宮限定品（shop:false）、hitBonus。 |
| 019-light-chest-loot-table | LIGHT | 005,018 | 階層別の宝箱・ドロップ抽選表。 |
| 01A-heavy-10f-final-boss | HEAVY | 016,017 | 10Fの迷宮の主を倒すとクリア。 |
| 020-heavy-death-status | HEAVY | 011（XP分配後） | 【死亡・灰・ロスト 手順1/3】死亡状態を導入し、帰還で死者が無料復活しないようにする（寺院は次の021）。 |
| 021-heavy-temple | HEAVY | 020 | 【死亡・灰・ロスト 手順2/3】町に寺院を作り、死亡/灰を蘇生できるようにする。 |
| 022-light-lost-roster | LIGHT | 021 | 【死亡・灰・ロスト 手順3/3】ロストしたキャラクターを訓練所で表示し、加入不可・抹消のみ可能にする。 |
| 023-light-inn | LIGHT | 022 | 帰還時の無料全快をやめ、宿屋で回復とレベルアップを行うようにする。 |
| 030-heavy-corpse-on-wipe | HEAVY | 023 | 【遺体と救出 手順1/2】全滅時に即町へ戻して全快するのをやめ、遺体を迷宮に残す。 |
| 031-heavy-corpse-rescue | HEAVY | 030 | 【遺体と救出 手順2/2】別パーティが遺体マスへ到達すると回収できるようにする（マインスイーパー統合：救出隊は新しく生成された罠を推論して進む）。 |

## 保留（todoに入れない）
- 物理命中の列補正：ユーザー確認済み（バグ）→ todo/001b-bugfix-row-hit-modifier.md へ移動
- 4F以降の敵スケーリング・階層テーブル・最終目標。
- 宝箱罠の拡充と盗賊「調べる→解除」、未鑑定・呪い装備、VIT/AGI/LUC・種族・属性・転職、呪文追加。

## 共通ルール（各ファイルにも記載）
## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

共通テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check`

---
# 017b-light-sim-floor-range
ティア：LIGHT　依存：017

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- このファイルの「変更内容」以外は変更しない。変更した挙動には回帰テストを追加する。npm依存を追加しない。
- 報告は日本語で簡潔に書く。

## 目的
10階化に合わせて、戦闘sim（scripts/sim/combat.cjs）で4F〜10Fを測れるようにする。

## 変更内容
- `--floor` の上限を 3 から 10 にする（エラー文も「1〜10」に直す）。
- 任意の `--gear shop|drop` を追加する。
  - shop：その階の minFloor 以下で、shop!==false の品から職業ごとに最良の武器・防具を装備する。
  - drop：shop:false の品も含めて同じように選ぶ。
  - 後衛は遠距離武器を優先する。
  - 指定しない場合は今までどおり初期装備。
- selftest に、floor 10 と --gear が通るケースを追加する。

## OKの判定方法
- `node scripts/sim/selftest.cjs` がPASSする。
- `--level 15 --floor 10 --boss --gear drop` が動く。
- 指定なしのときの結果が変更前と同一になる（固定seed）。

codex
まず指定どおり AGENTS.md、README、HANDOFF、SPECIFICATION とシミュレータ周辺を確認し、このキュー項目だけを実装します。既存の固定seed結果との比較も確認します。
exec
/bin/bash -lc "pwd && rg --files -g 'AGENTS.md' -g 'README*' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g 'scripts/sim/**' -g 'tests/**' | sort" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
AGENTS.md
README.md
data/README.md
docs/HANDOFF.md
docs/SPECIFICATION.md
scripts/sim/combat.cjs
scripts/sim/harness.cjs
scripts/sim/selftest.cjs
tests/game.cjs
tests/training-browser.py
tests/training.cjs

exec
/bin/bash -lc "cat AGENTS.md README.md docs/HANDOFF.md docs/SPECIFICATION.md && sed -n '1,260p' scripts/sim/combat.cjs && sed -n '1,260p' scripts/sim/selftest.cjs && sed -n '1,260p' scripts/sim/harness.cjs" in /workspace/dungeonsweeper
 succeeded in 0ms:
# Codex開発ルール

- README、docs/HANDOFF.md、docs/SPECIFICATION.mdを先に読む。実行コードが現行挙動の正本。古いBALANCE.md等の説明より現コードと新docsを優先。
- ユーザーには日本語で簡潔に報告。作業は実装→検証まで完了し、完了／未完了を区別する。
- 既存のUI・バランスを依頼なしに全面変更しない。個人名・個人情報を画面、URL、公開資料へ追加しない。
- 敵のHP・能力値をプレイ画面に出さない。ダイスの内部計算をログに出さない。
- 戦闘は実データを先に計算し、ログのスナップショットを順に表示する。描画でs.enemyやs.hpだけを参照すると先の結果が漏れる。visibleCombat、displayVitalsを尊重する。
- 敵グループのrow/keyは安定ID。表示上のindexとは別。前列消滅後も予約済み攻撃の対象IDを他の列へ誤転送しない。
- パーティーの職業はjobOf(i)。添字0/1/2で職業を決めない。並び替えはPARTY_FIELDS全体を一緒に動かす。
- セーブキーash-v1と既存移行処理を維持。破壊的なデータ初期化を勝手に行わない。
- 敵の編集はdata/monsters.csv→scripts/compile-monsters.py→dist/monster-data.js。生成JSだけ直さない。
- node tests/game.cjs と python3 scripts/compile-monsters.py --check を実行。変更箇所に応じて意味のある回帰テストを追加。ブラウザ未検証ならその旨を明記。
- package依存なし。不要なフレームワーク・サーバー・データベースを導入しない。
- 原作準拠と主張する計算式には根拠が必要。暫定仕様を原作そのものと説明しない。
- 公開は別工程。既存Sitesの認証・権限を確認する。GitHub push=本番反映と誤報しない。
# 迷宮スイーパー — Codex引き継ぎ版

Wizardry風の一人称迷宮探索とマインスイーパーを組み合わせた日本語ブラウザゲーム。PC・スマートフォン対応。外部ライブラリ・ビルド不要のHTML/CSS/JavaScriptです。

## 最初に読むもの

1. `AGENTS.md` — Codexの作業ルール
2. `docs/HANDOFF.md` — 現在地、注意点、未検証事項
3. `docs/SPECIFICATION.md` — 現行仕様
4. `docs/DATA_CATALOG.md` — 現コードから抽出した全データ
5. `docs/ARCHITECTURE.md` — ファイル構成、セーブ、ログ同期

## 起動・テスト

必要環境：Node.js 22以上、Python 3。npmパッケージのインストールは不要。

```sh
python3 -m http.server 8000 --directory dist
# ブラウザで http://localhost:8000 を開く
```

クラウド環境のプレビューURLは、その環境が案内するものを使用してください。

```sh
node tests/game.cjs
python3 scripts/compile-monsters.py --check
node tests/training.cjs
```

戦闘バランスを比較するには `node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 100` を実行します（職業IDは戦士0・魔法使い1・僧侶2・盗賊3、指定順に最大6人、Lv1〜30・1〜3F、`--boss` で守護者戦）。魔法使いAIは守護者戦と生存敵が1体以下の列ではカティノを使いません。初期装備の同じパーティーを各戦全快・指定レベルに戻し、試行間で継続する固定シードの乱数列で比較します。出力は勝率 `winRate`・全滅率 `wipeRate`・1戦あたり死者数 `deathsPerBattle`・HP損耗率 `hpLossRate`（奇襲前の総HPに対する終了時の純減割合）・平均ラウンド `averageRounds` のJSON 1行です。率は0〜1、勝率と全滅率の残りが逃走率です。敵の退散は戦闘終了として勝利に含め、味方の逃走は区別します。逃走失敗も1ラウンドで、敵の初手奇襲はラウンド数に含めません。200ラウンドで未決着ならエラー終了します。シミュレータの回帰検証は `node scripts/sim/selftest.cjs` です。

敵CSVを編集した場合：

```sh
python3 scripts/compile-monsters.py
node tests/game.cjs
```

## 訓練所

新規ゲームは冒険者0人で開始します。町の「訓練所」で名前・職業を選び、生成された能力値を確認して登録してください。登録直後は控えです。「加入」で最大6人をパーティに加えます。先頭3人が前衛です。
再生成時には前回との差を表示します。登録メンバーは離脱しても能力・経験値・装備・所持品を保持します。抹消は確認画面で確定します。

ブラウザ検証（Playwright PythonとChromiumがある環境で、上記HTTPサーバー起動後）：

```sh
python3 tests/training-browser.py
```

これは独立したブラウザコンテキストでPC・スマートフォン幅を検証します。アプリ自体に追加依存はありません。

## GitHubへ渡す

ZIPを展開し、このREADMEとdist・data・tests・docs・scriptsをリポジトリ直下に配置します。ZIPそのものだけを置いても開発用のファイル配置になりません。`.github`を含めると自動テストが使えます。個人名を避けたい場合、リポジトリ名や公開方法も別途設定してください。

Codex Cloudでそのリポジトリを選び、最初に `docs/CODEX_PROMPT.md` の文を渡してください。GitHubへのアップロードとCodex Cloud環境作成は、この配布物の作成とは別で、まだ実行していません。

## 現在の公開サイト

https://labyrinth-signs.amusedgnome1024.chatgpt.site

GitHubへのpushだけでこのSitesのURLが更新される仕組みは設定していません。`.openai/hosting.json` は既存サイトを識別するメタデータで、認証情報ではありません。公開の接続方法は `docs/HANDOFF.md` を参照してください。

コードの基準コミット：42aa8ff6ca866cda67d014df9a6ced7fe49122ff（2026-11-01）。ゲーム本体はそのまま収録し、この配布版では説明書とCIのみ追加しています。

GitHub Pages用の `.github/workflows/pages.yml` は `main` 更新時に回帰テスト・敵CSV検証・訓練所テストを実行し、成功した場合に `dist/` を配信します。既存Sitesの公開とは別です。
# 引き継ぎ事項

## 基準

2026-11-01時点の公開済みソース42aa8ff6ca866cda67d014df9a6ced7fe49122ffをそのまま収録。最終変更は「近接武器は敵前方2列のみ」「前列消滅時に後続列が詰まる」。直前に僧侶の呪いを解く、PIE表記、未装備−表記、識別成功専用ログ削除を実装。

現行ソースはGitHubのユーザーリポジトリにまだアップロードしていない。このパッケージにGit認証情報、Sites認証情報、ブラウザCookie、個人のゲームセーブはない。過去のGitオブジェクト履歴は含めず、現行全ファイルと直近コミット要約を含む。

## 新環境でまずすること

1. READMEとAGENTSを読む。
2. Node 22以上・Python 3を用意。依存ライブラリ追加不要。
3. node tests/game.cjs／python3 scripts/compile-monsters.py --check。
4. distを配信し、町→迷宮→戦闘→宝箱→階段とスマホ画面を確認。
5. docs/DATA_CATALOG.mdとdata/monsters.csvを使い変更箇所を特定。

## 暫定仕様・確認が必要な点

- 解呪の成功率は独自の暫定式。原作完全準拠ではない。全不死個体が対象でMP不要、経験値・金貨なし。内部ではescaped=trueを流用するため、逃走と解呪の区別を別フィールドに分離する余地がある。
- 4F以降の敵は3Fを再利用。階層別の床罠数・宝箱・出現ウェイトの独立設定テーブルは未実装。
- 物理命中式の敵列補正はユーザー確認済みのバグとして修正済み。閾値に＋3×現在の列index（0始まり）を加え、後列ほど命中しにくくする。前列消滅時は既存の列一覧に従って詰める。原作への一致は未保証。
- 列内の攻撃対象は先頭生存個体固定。過去の原作同様という要望に対する厳密検証は未実施。
- 近接範囲はUIとselectedEnemyで制限される。低レベルphysicalAttack単体は範囲を検査しない。追加攻撃経路を作る際は必ず範囲ガードを通す。
- 旧attackRowUI関数は新コマンド画面とは別に残っている。再利用時は射程制限を合わせること。
- 原作にないMP・旗・マインスイーパー・迷宮再生成を持つ。原作の全面移植ではない。
- 毒無効は敵用関数に実装済みだが、味方から毒を与える攻撃がなく通常のプレイでは使用されない。
- IQ/PIE成長なし。Lv吸収で最大HP/MPは平均値を減らす方式。元の成長履歴の厳密な巻戻しではない。
- テストには旧3人時代のfixture・説明文が残る。通過しても新機能の全経路を検証したことにはならない。
- docs以外のBALANCE.md、SPELLS.md、ITEMS.mdには過去の説明が残りうる。参照資料として保持し、正本はコードと本docs。
- 実行コードの多くは長い1行で構成。大規模整理をするなら動作テストを先に拡充し、機能変更とは分ける。

## 公開・運用

現在URL：https://labyrinth-signs.amusedgnome1024.chatgpt.site
Sites project_id：appgprj_6ae2ad2e8d1881918d4dc813e0e1df34
既存公開版：appgprj_6ae2ad2e8d1881918d4dc813e0e1df34~appgver_8ae5b5974854819189643264976e7cb6
現時点で確認済みの公開範囲は所有者のみ。リンクがあっても第三者に一般公開されているわけではない。

既存Sitesを更新するには、その環境でSitesツール／認証が使用できることと既存プロジェクトへの書込み権限が必要。GitHubとの自動連携は設定されていない。`.openai/hosting.json`だけでは公開できない。新しいSiteを勝手に作らず、既存IDを使う。
別ホストへ公開する場合の配信ルートはdist。URLが変わるとブラウザの既存セーブは自動では移らない。GitHub Pagesの設定はこのパッケージでは行っていない。

## 引き継ぎ範囲

含む：全ゲームソース、インラインCSS/SVG、編集用CSV、全ゲームデータ抽出表、テスト、生成スクリプト、公開識別メタデータ、仕様・設計・既知の制限、GitHub CI。
含まない：利用者ブラウザ内の進行データ、認証情報、過去の全会話・画像、全Git履歴、公開サービス自体の管理データ。会話の古い要求をそのまま再実装せず、現行仕様から開始する。
# 現行仕様書

作成日：2026-11-01（日本時間）。**この資料は実装の記録であり、初代Wizardryの完全再現を保証する資料ではありません。** 数値の正本はコードとDATA_CATALOG.mdを参照。

## 1. ゲームループ・階層

町（酒場・鍛冶屋・迷宮入口）→探索→遭遇／宝箱／守護者→階段で上下移動→町。
1Fは8×8、2Fは10×10、3F以降12×12。上下左右の隣接移動、左右旋回、後退、左右横移動。盤面クリックは旗の操作で、任意マスへ移動する操作ではない。
開始位置と守護者位置は乱数。チェビシェフ距離2以内（縦横の最大差が2以下）には守護者を置かない。開始位置の周囲と、守護者までの生成経路は安全。罠数は1F=9、2F=15、3F=23。階層・盤面サイズに応じて増え、盤面の22%を上限とする。
守護者マスへ入ると確認。いいえで直前マスへ戻る。撃破後その場所が下り階段になる。各階に固有守護者、4F以降は3F設定を使用。
上り階段は一つ前の階へ。1Fからのみ町へ。階段で「いいえ」はその場に留まり、同じマスに居続けても再発火しない。
同じ探索中は各階の探索状況を維持。町へ帰ると全階の記録を破棄し、新しいランダム迷宮にする。スコアとスコア履歴は廃止済み。

## 2. 探索・罠・遭遇

数字は周囲8マスの残っている罠数。作動した罠は消費され、周囲の数字も減る。
未探索へ移動時の遭遇率16%。探索済みは10%＋周囲罠数×0.5ポイント。左右横移動はさらに1ポイント加算。通常マスのみで遭遇判定。
通常は敵奇襲10%、味方先制10%。後退時は敵奇襲12%、味方先制10%。守護者戦は通常開始。警戒結界は敵奇襲を通常開始へ置換。
遭遇バナーは0.5秒。「敵が現れた！」「敵の奇襲！」「敵はまだ気づいていない！」をログにも出す。
床罠は針25%（1人3d6+4）、爆発25%（生存者全員に同一の2d6+3）、毒霧20%（全員毒）、麻痺の針15%（1人麻痺）、転移15%（同じ階の安全な通常マス）。「！」を0.5秒表示し「罠だ！」→罠名と結果の順で表示。
毒は移動・戦闘ターン開始時にHP−2。探索中の毒ダメージログは出さない。麻痺はカウンタ4から同じタイミングで減少し、解除時はログ。HP0は死亡・行動不能。

## 3. パーティー・成長

新規ゲームは0人。訓練所で作成・登録した冒険者から0〜6人を編成。先頭3人が前衛、残りが後衛。0人では迷宮入場不可。酒場での編成とパーティー画面での順番変更も利用可能。
表示能力：Lv、HP、MP、STR、AC、IQ、PIE、経験値、NEXT。正常時の状態表示はなし。異常時のみ色付きタグ。
町帰還時に経験値が足りていれば複数回レベルアップ。Lv上限30。HP/MP成長は職業別ダイス、ACはレベルアップで変化しない。帰還でHP/MPと状態を回復し、レベルアップ結果はポップアップ。
必要経験値は個体ごとに抽選・保存。次Lvの増分＝round(115×(次Lv−1)×職業係数×[0.9,1.1))。係数：戦士0.8、魔法使い1.2、僧侶1、盗賊0.85。旧セーブには専用移行処理あり。
新規生成キャラクターのSTR＝min(18, 生成時STR＋floor((Lv−1)/5))。レベル吸収時も生成時STRを基準とする。
IQ/PIEは生成時の配分値を保持。既存キャラクターの未設定値のみ従来値で補完。現在のレベルアップではIQ/PIEは増減しない。

## 4. 装備・アイテム

各メンバー10枠。武器・防具・薬は同じ枠を消費。装備は武器1、頭1、胴体1、足1。装備一覧の空欄は「−」。職業制限あり。
鍛冶屋で購入・売却。装備中の品は売却・譲渡不可。探索中のアイテム譲渡と順番変更が可能だが、戦闘・ログ再生・確認中などでは不可。
遠距離武器（短弓・長弓・合成弓）は戦士・盗賊用で後衛からも攻撃可。近接武器は味方前衛のみ、敵前方2列まで。遠距離は敵全列。
薬：傷薬＝ディオス相当1d8回復、解毒剤＝毒解除。MP・習得不要、使用すると1個消費。装備品の各数値はDATA_CATALOG参照。

## 5. 戦闘と列

通常遭遇は同階の非守護者から1〜3列を抽選。同じ敵が複数列になることもある。1列は同種で、頭数はその敵の群れ範囲。敵のHPは非表示。
行動可能なメンバー順にコマンドを決める。戦う・守る・呪文・アイテム、僧侶には呪いを解く。後衛の近接装備では戦うを出さない。呪文選択ウィンドウでは呪文のみを決定し、対象は元の画面で選ぶ。対象候補が1列なら選択画面を省略。
全員決定後は行動確認表をパーティー表示上へ出す。「この行動で戦う」「戻る」。処理後は前衛が戦う、後衛が守るへリセット（過去の「全員攻撃へ戻す」要望とは差がある）。
味方全員→敵全員の順で処理。速度による交互行動は未実装。味方先制では最初の敵ターンを省略。敵奇襲では入力前に敵が行動。
敵列の内部row/keyは変えず、全員rewardedとなった列を列一覧から除外し、表示indexを詰める。撃破ログ前はスナップショットにより元の位置に残る。
選択した列の敵が全滅した場合は自動で他列を殴らない。現状、列内では最初の生存個体を選ぶ（ランダム選択ではない）。

### 味方物理攻撃の現在の式

攻撃回数＝min(10,max(武器最低回数,戦士なら1+floor(Lv/5)、他は1))。
STR補正はSTR≤5ならSTR−6、STR≥16ならSTR−15、他0。STR18は+3。
職業命中補正＝戦士・僧侶なら2+floor(Lv/3)、他はfloor(Lv/5)。
現在のコードの閾値＝clamp(21−敵有効AC−職業命中補正−武器命中補正−STR補正＋3×現在の列index,1,19)。0〜19の乱数が閾値以上なら命中。
1命中ダメージ＝max(1,武器ダイス＋STR補正)。合計後に旗効果。列indexは残っている列の並びで0から数え、前列消滅時は詰める。1列目の補正は0、2列目は命中率−15ポイント、3列目は−30ポイント（閾値の上限・下限に達しない場合）。原作への一致は未保証。
敵物理攻撃は別式：1d20で20は命中、1は失敗、他は出目＋敵hit＋味方AC≥20で命中。ACはダメージ減算に使わない。
守るは被ダメージを半分（切上げ）。味方AC＝職業基本AC−装備AC合計−戦闘補助呪文。補助呪文の重ね掛けは最大効果を使用。

### 逃走・報酬

ボス・誤旗デバフ時は逃走不可。それ以外の逃走率は本作の暫定式：50＋5×（生存かつ非毒・非麻痺の味方平均Lv−生存かつ非睡眠の敵平均Lv）＋味方人数補正（1人15、2人10、3人5、その他0）を10〜95%に制限する。有効な味方が0人なら10%。失敗は敵ターン（味方先制権があればそれを消費）。
撃破時は経験値・金貨・ドロップ回数を戦闘内へ蓄積し、敵が全員いなくなった後に配分。合計XPが正の場合、勝利確定時の生存者数で分割し、各生存者に `Math.max(1, Math.floor(合計XP / 生存者数))` を付与。戦闘不能者には付与せず、報酬ログは1人あたりのXPを表示。合計XPが0なら付与しない。逃げた敵・解呪で消えた敵は報酬なし。
敵識別は各列について、生存メンバー最大IQ×3%（最大100%）を開始時・毎ターンに抽選。成功後は戦闘中保持。確定名を知らせる専用ログは削除済み。敵一覧・対象選択・攻撃ログは識別状態に従う。

### 呪いを解く（暫定）

僧侶の特殊行動。MP不要、敵全列の生存する不死それぞれに判定。成功率clamp(50%＋(僧侶Lv−敵Lv)×5ポイント,5%,95%)。成功すると消滅、XP・金貨・ドロップなし。全員解呪のみなら宝箱なし。原作の正確な計算式を確認できず暫定導入したもの。

## 6. 魔法

MP1本制。本作独自の消費MP。全25呪文のレベル・MP・対象・効果はDATA_CATALOGを参照。
指定レベル到達時、確定習得の呪文は必ず習得。それ以外は魔法使いIQ/30、僧侶PIE/30で抽選し、後のレベルアップでも未習得分を再抽選。
デュマピック：探索専用、前方未探索のみ調査。85%正しい判定・15%逆転。「前方は罠の可能性あり」「前方にはなにもない」。マスを開けず解除もしない。初回2MP、以降4,8,16…（指数上限あり）。帰還で回数リセット。
ロミルワ：左右斜め前の状態を正面方形内に薄い実線で透かす。未探索の数字は明かさない。帰還まで持続。
識別：敵全列を識別。警戒結界：帰還まで敵奇襲防止。マロール：訪問済み階の上り階段へ移動。
蘇生呪文はなし。町帰還ではHP0のメンバーも回復する。

## 7. 宝箱

未探索マスの遭遇戦で報酬対象の敵を倒すと出現。敵撃破とログ再生が終わるまで操作ボタンを出さない。即開ける・放棄・使える場合カルフォ・盗賊の開封。後回しにはできない。
罠はfixChestTrapが一度設定。カルフォは95%で正しく判別し解除はしない。通常開封は罠を作動させ、生存していれば報酬。盗賊の開封成功率85%、失敗15%では罠作動・箱消滅。
金貨は敵ダイス÷3切捨てを蓄積し、宝箱開封時に3倍。装備品は25%で全WEAPONS（防具含む）から1個。薬は別に30%で1個（傷薬70：解毒剤30）。職業に合う枠のあるメンバーへ自動配布。
通常戦闘の直接装備ドロップは倒した敵ごとに5%でdrop:trueの武器から。階層ごとの宝箱テーブルはまだない。

## 8. 旗

怪力・堅牢・呪禁をループ切替し、設置時の種類をマスに保存。切替しても既設旗は変わらない。地図と視界で色を反映。
正しい旗n本の種類別発動率＝min(40%,4%×n)。1本4%、5本20%、10本以上40%。戦闘開始時に旗配置のスナップショットを取る。
怪力：合計物理ダメージ×1.5、堅牢：被ダメージ×0.5、呪禁：MP消費半減（切上げ）。呪禁は探索時にも現在配置で抽選。
誤旗が一つでもあれば全種類の正旗抽選を停止、逃走不可。誤旗の種類に応じ、怪力は攻撃×0.65切捨て、堅牢は被害×1.5四捨五入、呪禁は戦闘MP×1.5切上げ。
正旗は発動時だけ「○○の旗がはためいた！」。誤旗のみ戦闘開始時「誤った旗がパーティーを惑わせた！」。ログ色：怪力橙・堅牢緑・呪禁紫。

## 9. UI・ログ

日本語。町のみゲーム題名を表示。探索中ヘッダーを圧縮、パーティー表示を操作ボタンより上へ。パーティー表示のクリックで詳細。スマホ地図は右下のフローティングボタン。
パーティー詳細は2列、アイテム／呪文の短いボタン、金貨右に順番変更。装備詳細は武器・頭・胴体・足の一覧を上部へ。
地図は正方形、現在地は向きを示す三角形、視界対応のマスは控えめな枠。数字は中央。探索者視界は一人称SVG。
ログは0.3秒刻み、遭遇・罠警告は0.5秒。色は味方青／敵赤／ダメージ句橙／回復句緑／呪文紫。ダイスを出さない。

## 10. 訓練所の生成・登録

名前は1〜20文字（前後空白・HTMLに使う記号・制御文字を除く）。職業は戦士・僧侶・魔法使い・盗賊。登録確定前の再生成はセーブ対象外。登録時にUUIDを持つ独立したキャラクターとして控えに保存し、二重登録を防止。

基本STR/IQ/PIEは戦士12/8/8、魔法使い8/12/8、僧侶10/8/12、盗賊10/10/8。この値を下回らず上限18。3〜9点を乱数で自動配分し、戦士はSTR、魔法使いはIQ、僧侶はPIEの選択重みを3、他を1とする。盗賊はSTR/IQ/PIEの重み2/2/1。上限に達した能力は抽選候補から外す。原作の完全再現ではなく、本作向けの生成式。

HPは従来の職業初期値±3、MPは魔法使い20±2・僧侶15±2・戦士と盗賊0。ACは既存バランス維持のため職業別基礎ACを固定し、装備のAC補正を減算する。ACの直接乱数化はしない。Lv.1・XP0で、必要経験値は従来の職業係数と乱数幅で一度生成して保存。初期習得呪文も従来の職業ルールを使用。

訓練所で全登録者の職業・Lv・能力値・参加状態を表示。加入・離脱・前後の並べ替えを行える。満員時は加入不可。登録抹消は別の確認画面で確定し、キャンセル時は変更しない。最後の1人も抹消可能。町の迷宮再生成処理は従来通り。
#!/usr/bin/env node
const { game } = require('./harness.cjs');

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!['--jobs', '--level', '--floor', '--n', '--boss'].includes(key)) throw Error(`不明な引数: ${key}`);
    if (Object.hasOwn(out, key.slice(2))) throw Error(`重複した引数: ${key}`);
    if (key === '--boss') { out.boss = true; continue; }
    if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`値が必要です: ${key}`);
    out[key.slice(2)] = argv[++i];
  }
  if (!/^[0-3](,[0-3]){0,5}$/.test(out.jobs || '')) throw Error('--jobs は0〜3の職業IDを1〜6個指定してください');
  const jobs = out.jobs.split(',').map(Number);
  const level = Number(out.level), floor = Number(out.floor), n = Number(out.n);
  if (!Number.isInteger(level) || level < 1 || level > 30) throw Error('--level は1〜30で指定してください');
  if (!Number.isInteger(floor) || floor < 1 || floor > 3) throw Error('--floor は1〜3で指定してください');
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw Error('--n は1〜100000で指定してください');
  return { jobs, level, floor, n, boss: !!out.boss };
}

// One reproducible stream per invocation; never rewind it between trials.
function seededRandom(seed = 0x6d2b79f5) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function createParty(g, jobs) {
  // The harness starts with the current game's empty town roster.
  for (let i = 0; i < jobs.length; i++) {
    const ok = g.run(`(() => {
      const recruit = generateRecruit('sim${i}', ${jobs[i]});
      return registerRecruit(recruit) && changeRecruitParty(recruit.members.id, true);
    })()`);
    if (!ok) throw Error('パーティ作成に失敗しました');
  }
  if (g.run('s.members.length') !== jobs.length) throw Error('パーティ人数が一致しません');
  // Observe the real completion path, even if enemies all flee during an ambush.
  g.run(`var simBase = structuredClone(partyRecords());
    var simBattleFinished = false, simFinishMonsterBattle = finishMonsterBattle;
    finishMonsterBattle = function() { simBattleFinished = true; return simFinishMonsterBattle(); };`);
}

function prepareTrial(g, opt) {
  g.run(`
    // Restore every parallel party field, including Lv1 growth and spells.
    for (const key of PARTY_FIELDS) s[key] = structuredClone(simBase.map(r => r[key]));
    fresh(1);
    s.members.forEach(m => { m.xp = m.xpTargets[${opt.level}]; });
    levelUp();
    s.hp = s.members.map(m => m.maxHP);
    s.mp = s.members.map(m => m.maxMP);
    s.ailments = s.members.map(() => ({poison:false, paralysis:0}));
    if (${opt.floor} > 1) fresh(${opt.floor});
    s.area = 'dungeon';
    resetPartyCommands();
    simBattleFinished = false;
    s.cells[s.pos].type = ${opt.boss ? "'boss'" : "'stairs'"};
  `);
  // Include damage from the initial enemy ambush in HP loss.
  const initialHP = g.run('s.hp.reduce((a,b) => a+b, 0)');
  g.run('encounter(s.pos, false);');
  g.drain();
  return initialHP;
}

function planTurn(g) {
  g.run(`
    s.magicPlans = s.members.map(() => null);
    s.commands = s.members.map((m,i) => {
      if (s.hp[i] <= 0 || s.ailments[i].paralysis > 0) return 'guard';
      if (jobOf(i) === 2) {
        const target = s.hp.map((_,j) => j)
          .filter(j => s.hp[j] > 0 && s.hp[j] / s.members[j].maxHP < .45)
          .sort((a,b) => s.hp[a] / s.members[a].maxHP - s.hp[b] / s.members[b].maxHP)[0];
        const id = ['dialma','dial','dios'].find(id => m.known.includes(id) && s.mp[i] >= spellCost(magic(id)));
        if (target !== undefined && id) { s.magicPlans[i] = {id,target}; return 'spell'; }
      }
      if (jobOf(i) === 1 && s.mp[i] >= 6) {
        const targetGroup = enemyGroups().find(g => g.units.some(e => e.hp > 0));
        const target = targetGroup?.units.find(e => e.hp > 0)?.uid;
        const spellOrder = ['tiltowait','lakanito','dalto','mahalito'];
        if (!s.enemy.boss && (targetGroup?.units.filter(e => e.hp > 0).length || 0) >= 2) spellOrder.push('katino');
        spellOrder.push('halito');
        const id = spellOrder
          .find(id => m.known.includes(id) && s.mp[i] >= spellCost(magic(id)));
        if (id && target !== undefined) { s.magicPlans[i] = {id,target}; return 'spell'; }
      }
      if (canWeaponAttack(i)) {
        const group = reachableEnemyGroups(i)[0];
        if (group) { s.attackRows[i] = group.key; return 'fight'; }
      }
      return 'guard';
    });
  `);
}

function resolveBattle(g, maxRounds = 200) {
  let rounds = 0;
  while (g.run('!!s.enemy && !s.done')) {
    if (rounds >= maxRounds) throw Error(`${maxRounds}ラウンド以内に決着しませんでした（未決着を勝利には数えません）`);
    const retreat = g.run('s.hp.reduce((a,b) => a+b, 0) < .25 * s.members.reduce((a,m) => a+m.maxHP, 0) && escapeChance() > 0');
    if (retreat) g.run('flee()');
    else { planTurn(g); g.run('attack()'); }
    // A failed escape already spends a turn. Do not also attack this round.
    g.drain();
    rounds++;
  }
  const result = g.run(`({
    alive: s.hp.filter(h => h > 0).length,
    deaths: s.hp.filter(h => h <= 0).length,
    total: s.hp.reduce((a,b) => a+b, 0),
    cleared: simBattleFinished
  })`);
  return { ...result, outcome: result.alive === 0 ? 'wipe' : result.cleared ? 'win' : 'escape', rounds };
}

function simulate(opt) {
  const g = game(null, seededRandom());
  createParty(g, opt.jobs);
  let wins = 0, wipes = 0, deaths = 0, hpLoss = 0, rounds = 0;
  for (let trial = 0; trial < opt.n; trial++) {
    const initialHP = prepareTrial(g, opt);
    let result;
    try { result = resolveBattle(g); }
    catch (error) { throw Error(`試行${trial + 1}: ${error.message}`); }
    if (result.outcome === 'win') wins++;
    if (result.outcome === 'wipe') wipes++;
    deaths += result.deaths;
    hpLoss += 1 - result.total / initialHP;
    rounds += result.rounds;
  }
  return { winRate: wins / opt.n, wipeRate: wipes / opt.n, deathsPerBattle: deaths / opt.n, hpLossRate: hpLoss / opt.n, averageRounds: rounds / opt.n };
}

if (require.main === module) {
  try { process.stdout.write(JSON.stringify(simulate(args(process.argv.slice(2)))) + '\n'); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle };
// Kept beside the simulator because task 010 explicitly excludes tests/ edits.
const assert = require('node:assert/strict');
const { game } = require('./harness.cjs');
const { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle } = require('./combat.cjs');
const opt = args(['--jobs','0,0,2,3,1,2','--level','1','--floor','3','--n','2']);
for (const argv of [[], ['--jobs',''], ['--jobs','0,'], ['--wat','1'], ['--boss','--boss'],
  ['--jobs','0','--level','1','--floor','4','--n','1']]) assert.throws(() => args(argv));

const g = game(null, seededRandom());
createParty(g, opt.jobs);
assert.equal(g.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
assert.equal(g.run('s.reserve.length'), 0);
const formations = new Set();
for (let i = 0; i < 10; i++) {
  const total = prepareTrial(g, opt);
  assert.equal(total, g.run('s.members.reduce((a,m) => a+m.maxHP, 0)'));
  formations.add(g.run('JSON.stringify(s.enemy?.units.map(e => [e.id,e.hp]))'));
  assert.equal(g.run('s.members.length'), 6);
  assert.equal(g.run('s.members.every(m => m.level === 1)'), true);
  assert.equal(g.run("s.members[4].known.includes('halito')"), true);
  assert.equal(g.run('s.mp.every((mp,i) => mp === s.members[i].maxMP)'), true);
}
assert(formations.size > 1, 'trials must not repeat one RNG sequence');

// Force an opening attack to verify that prepareTrial returns pre-ambush HP.
g.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
  rollInitiative=()=> 'enemy'; enemyTurn=()=>{s.hp[0]-=5};`);
const beforeAmbush = prepareTrial(g, opt);
assert.equal(beforeAmbush - g.run('s.hp.reduce((a,b)=>a+b,0)'), 5);
g.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
prepareTrial(g, opt);
assert.equal(resolveBattle(g).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
g.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');

for (let i = 0; i < 10; i++) {
  prepareTrial(g, {...opt, level:6, floor:1, boss:true});
  assert.equal(g.run('s.members.every(m => m.level === 6)'), true);
  assert.equal(g.run(`s.members.every((m,i) => {
    const base = simBase[i].members, c = memberClass(i);
    return m.maxHP >= base.maxHP + 5 * (c.hpGrowth[0] + c.hpGrowth[2]) &&
      m.maxHP <= base.maxHP + 5 * (c.hpGrowth[0] * c.hpGrowth[1] + c.hpGrowth[2]);
  })`), true, 'growth must start from Lv1 every trial');
  // Mimic battle rewards, drain, gear drops and ailments before the next reset.
  g.run("s.members[0].level=2; s.members[0].xp=999999; s.inventory[0].push('healingPotion'); s.ailments[0].poison=true");
}
prepareTrial(g, opt);
assert.equal(g.run('s.members[0].xp'), 0);
assert.equal(g.run('s.inventory[0].length'), 1);
assert.equal(g.run('s.ailments.some(a => a.poison)'), false);

// AI uses professions and stable row IDs; the mage gets the front living unit UID.
g.run(`s.enemy = {units:[{...makeEnemy('slime',8),row:12}], flagEffect:{}, initiative:'party'};
  var simTestCombat=s.enemy; simBattleFinished=false; s.hp=s.members.map(m=>m.maxHP); s.mp=s.members.map(m=>m.maxMP);`);
planTurn(g);
assert.equal(g.run('s.attackRows[0]'), 12);
assert.equal(g.run('s.commands[3]'), 'guard');
assert.equal(g.run('s.commands[4]'), 'spell');
assert.equal(g.run('s.magicPlans[4].target'), 8);
assert.equal(g.run('s.magicPlans[4].id'), 'halito', 'a single living target must not attract katino');
g.run(`s.enemy.units.push({...makeEnemy('slime',9),row:12});`);
planTurn(g);
assert.equal(g.run('s.magicPlans[4].id'), 'katino', 'katino remains available against two or more living enemies');
g.run('s.enemy.boss=true');
planTurn(g);
assert.equal(g.run('s.magicPlans[4].id'), 'halito', 'boss encounters must not use katino');
g.run('s.enemy.boss=false; s.enemy.units.pop()');
g.run('s.hp[0]=1');
planTurn(g);
assert.equal(g.run('s.magicPlans[2].id'), 'dios');
assert.equal(g.run('s.magicPlans[2].target'), 0);
g.run('s.mp[4]=5');
planTurn(g);
assert.equal(g.run('s.commands[4]'), 'guard');

// Failed fleeing spends one turn, including a party initiative, with no attack.
g.run('s.hp=s.hp.map(()=>1); Math.random=()=>.999; var simEnemyHP=s.enemy.units[0].hp;');
assert.throws(() => resolveBattle(g, 1), /未決着/);
assert.equal(g.run('s.enemy.initiative'), 'normal');
assert.equal(g.run('s.hp.every(h=>h===1)'), true);
assert.equal(g.run('s.enemy.units[0].hp'), g.run('simEnemyHP'));
g.run('Math.random=()=>0');
assert.equal(resolveBattle(g).outcome, 'escape');
g.run('s.enemy=simTestCombat; s.ailments=s.ailments.map(()=>({poison:true,paralysis:0}))');
const wipe = resolveBattle(g);
assert.equal(wipe.outcome, 'wipe');
assert.equal(wipe.deaths, 6);
g.run(`s.done=false; s.hp=s.members.map(m=>m.maxHP); s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));
  s.enemy={units:[{...makeEnemy('slime',0),row:0,hp:0,rewarded:true}],lootXP:0,lootGold:0};
  finishMonsterBattle();`);
g.drain();
assert.equal(resolveBattle(g).outcome, 'win');

const report = simulate(opt);
assert.deepEqual(simulate(opt), report, 'same invocation must be reproducible');
for (const value of Object.values(report)) assert(Number.isFinite(value));
assert(report.winRate + report.wipeRate <= 1);
assert(report.deathsPerBattle >= 0 && report.deathsPerBattle <= 6);
console.log('PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function game(saved = null, random = Math.random) {
  const timers = new Map();
  let nextTimer = 0;
  let storage = saved;
  const elements = new Map();
  const element = () => ({ style: {}, value: '0', classList: { toggle() {} }, setAttribute() {}, addEventListener() {}, append() {}, replaceChildren() {}, showModal() { this.open = true; }, close() { this.open = false; } });
  const ctx = {
    crypto: require('node:crypto').webcrypto,
    structuredClone,
    document: { addEventListener() {}, querySelector: key => { if (!elements.has(key)) elements.set(key, element()); return elements.get(key); }, querySelectorAll: () => [], createElement: element },
    localStorage: { getItem: () => storage, setItem: (key, value) => { storage = value; } },
    setTimeout: fn => { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearTimeout: id => timers.delete(id),
    Math: Object.assign(Object.create(Math), { random }),
  };
  vm.createContext(ctx);
  for (const file of ['weapons', 'monster-data', 'balance', 'spells', 'items', 'flags', 'traps', 'combatui', 'party', 'monsters', 'recruits', 'game']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../../dist', `${file}.js`), 'utf8'), ctx);
  }
  return {
    run: code => vm.runInContext(code, ctx),
    drain() {
      for (let n = 0; timers.size; n++) {
        if (n >= 10000) throw Error('timer loop');
        const [id, fn] = timers.entries().next().value;
        timers.delete(id);
        fn();
      }
    },
  };
}

module.exports = { game };

exec
/bin/bash -lc 'rg -n "minFloor|shop|range|ranged|WEAPONS|ARMOR|weapon|armor|hitBonus|items|WEAPONS" dist/*.js data/*.csv scripts' in /workspace/dungeonsweeper
 succeeded in 0ms:
dist/monsters.js:4:function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}
dist/items.js:3: {id:'healingPotion',name:'傷薬',kind:'medicine',spell:'dios',description:'ディオス相当：味方1人のHPを1d8回復',classes:[0,1,2,3],sell:8,weight:70,minFloor:1},
dist/items.js:4: {id:'antidote',name:'解毒剤',kind:'medicine',spell:'latumofis',description:'ラツモフィス相当：味方1人の毒を解除',classes:[0,1,2,3],sell:6,weight:30,minFloor:1},
dist/items.js:5: {id:'paralysisCure',name:'気付け薬',kind:'medicine',spell:'dialko',description:'ディアルコ相当：味方1人の麻痺を解除',classes:[0,1,2,3],sell:15,weight:20,minFloor:3},
dist/items.js:6: {id:'greaterPotion',name:'上傷薬',kind:'medicine',spell:'dial',description:'ディアル相当：味方1人のHPを4d4回復',classes:[0,1,2,3],sell:30,weight:35,minFloor:4},
dist/items.js:7: {id:'elixir',name:'霊薬',kind:'medicine',spell:'dialma',description:'ディアルマ相当：味方1人のHPを8d3回復',classes:[0,1,2,3],sell:80,weight:20,minFloor:7}
dist/items.js:10:function medicineSlots(i){return s.inventory[i].flatMap((id,slot)=>MEDICINES.some(w=>w.id===id)?[{slot,item:weapon(id)}]:[])}
dist/items.js:12:function medicineAction(i){if(!s.enemy||!medicineSlots(i).length)return '';let plan=s.itemPlans[i],w=plan&&weapon(plan.id);return `<button data-medicine="${i}" ${!canChooseMedicine(i)?'disabled':''}>${s.commands[i]==='item'&&w?w.name+' → '+NAMES[plan.target]:'薬を使う'}</button>`}
dist/items.js:15: const pool=MEDICINES.filter(w=>(w.minFloor||1)<=(s.floor||1)),total=pool.reduce((n,w)=>n+w.weight,0);let roll=Math.random()*total,w=pool[0];for(let item of pool){roll-=item.weight;if(roll<0){w=item;break}}
dist/items.js:19:function removeInventorySlot(i,slot){s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let part in s.armor[i])if(s.armor[i][part]>slot)s.armor[i][part]--}
dist/items.js:21: let w=weapon(s.inventory[i]?.[slot]);
dist/items.js:35:function renderMedicineDescription(){let w=weapon(s.inventory[medicineMember][+$('#medicineitem').value]);$('#medicinedescription').textContent=w?.description||''}
dist/items.js:38: $('#medicineuse').onclick=()=>{let i=medicineMember,slot=+$('#medicineitem').value,target=+$('#medicinetarget').value,w=weapon(s.inventory[i][slot]);if(!canChooseMedicine(i)||w?.kind!=='medicine'||s.hp[target]<=0)return;if(s.enemy){s.itemPlans[i]={slot,target,id:w.id};s.commands[i]='item'}else useMedicine(i,slot,target);$('#medicinedialog').close();if($('#inventorydialog').open)$('#inventorydialog').close();if(!s.enemy&&$('#statsdialog').open)$('#statsdialog').close();s.enemy?confirmCommand(i):render()};
dist/weapons.js:1:// 武器の定義。dice=[個数,面数,固定加算]。classes=0:戦士、1:魔法使い、2:僧侶、3:盗賊。range=melee:近距離、ranged:遠距離。
dist/weapons.js:3:// minFloor：宝箱・ドロップに出る最も浅い階（省略時1）。shop:false は鍛冶屋に並ばない迷宮産の品（売却は可）。
dist/weapons.js:4:const WEAPONS = [
dist/weapons.js:5: {id:'shortbow',name:'短弓',range:'ranged',dice:[1,6,0],classes:[0,3],price:45,sell:22,drop:true},
dist/weapons.js:6: {id:'longbow',name:'長弓',range:'ranged',dice:[1,8,1],classes:[0,3],price:95,sell:47,drop:true},
dist/weapons.js:7: {id:'compositebow',name:'合成弓',range:'ranged',dice:[2,4,1],classes:[0,3],price:160,sell:80,drop:true,minFloor:2},
dist/weapons.js:14: {id:'battleaxe',name:'戦斧',dice:[2,6,1],classes:[0],price:110,sell:55,drop:true,minFloor:2},
dist/weapons.js:15: {id:'greatsword',name:'大剣',dice:[2,8,2],classes:[0],price:190,sell:95,drop:true,minFloor:2},
dist/weapons.js:17: {id:'runestaff',name:'ルーンの杖',dice:[2,4,2],classes:[1],price:100,sell:50,drop:true,minFloor:2},
dist/weapons.js:18: {id:'starstaff',name:'星鉄の杖',dice:[2,6,2],classes:[1],price:180,sell:90,drop:true,minFloor:2},
dist/weapons.js:20: {id:'warhammer',name:'戦槌',dice:[2,5,2],classes:[2],price:105,sell:52,drop:true,minFloor:2},
dist/weapons.js:21: {id:'sacredmace',name:'聖銀のメイス',dice:[2,6,3],classes:[2],price:185,sell:92,drop:true,minFloor:2},
dist/weapons.js:23: {id:'knightsword',name:'騎士の剣',dice:[2,8,4],classes:[0],price:450,sell:225,drop:true,minFloor:4,hitBonus:1},
dist/weapons.js:24: {id:'heavybow',name:'強弓',range:'ranged',dice:[2,6,2],classes:[0,3],price:380,sell:190,drop:true,minFloor:4},
dist/weapons.js:25: {id:'keenblade',name:'鋭い小剣',dice:[2,4,3],classes:[3],price:320,sell:160,drop:true,minFloor:4,hitBonus:1},
dist/weapons.js:26: {id:'blessedhammer',name:'祝福の槌',dice:[2,8,3],classes:[2],price:420,sell:210,drop:true,minFloor:4},
dist/weapons.js:27: {id:'magestaff',name:'魔樫の杖',dice:[2,6,3],classes:[1],price:400,sell:200,drop:true,minFloor:4},
dist/weapons.js:29: {id:'flamesword',name:'炎の剣',dice:[3,6,4],classes:[0],price:1500,sell:750,drop:true,minFloor:5,shop:false,hitBonus:2},
dist/weapons.js:30: {id:'magicbow',name:'魔弓',range:'ranged',dice:[2,8,3],classes:[0,3],price:1700,sell:850,drop:true,minFloor:5,shop:false,hitBonus:2},
dist/weapons.js:31: {id:'powerstaff',name:'魔力の杖',dice:[2,6,4],classes:[1],price:1400,sell:700,drop:true,minFloor:5,shop:false,hitBonus:1},
dist/weapons.js:32: {id:'holyhammer',name:'聖なる戦槌',dice:[3,6,4],classes:[2],price:1600,sell:800,drop:true,minFloor:5,shop:false,hitBonus:2},
dist/weapons.js:33: {id:'assassinknife',name:'暗殺の短刀',dice:[2,6,4],classes:[3],price:1800,sell:900,drop:true,minFloor:6,shop:false,hitBonus:3},
dist/weapons.js:35: {id:'ogreslayer',name:'鬼斬りの大剣',dice:[3,8,4],classes:[0],price:2600,sell:1300,drop:true,minFloor:7,shop:false,hitBonus:2},
dist/weapons.js:36: {id:'sagestaff',name:'賢者の杖',dice:[3,6,4],classes:[1],price:3000,sell:1500,drop:true,minFloor:7,shop:false,hitBonus:2},
dist/weapons.js:37: {id:'judgehammer',name:'天罰の槌',dice:[3,8,5],classes:[2],price:3200,sell:1600,drop:true,minFloor:8,shop:false,hitBonus:2},
dist/weapons.js:38: {id:'ninjato',name:'忍びの刀',dice:[3,6,5],classes:[3],price:3500,sell:1750,drop:true,minFloor:8,shop:false,hitBonus:3},
dist/weapons.js:39: {id:'dragonbow',name:'竜骨の弓',range:'ranged',dice:[3,6,5],classes:[0,3],price:3400,sell:1700,drop:true,minFloor:8,shop:false,hitBonus:3},
dist/weapons.js:40: {id:'holysword',name:'聖剣',dice:[4,8,5],classes:[0],price:6000,sell:3000,drop:true,minFloor:9,shop:false,hitBonus:3,minAttacks:2}
dist/weapons.js:41:] .map(w=>({range:'melee',hitBonus:0,minAttacks:1,minFloor:1,...w}));
dist/weapons.js:43:const ARMOR=[
dist/weapons.js:49:{id:'plate',name:'板金鎧',part:'body',ac:5,classes:[0],price:300,sell:150,minFloor:3},
dist/weapons.js:52:{id:'wardrobe',name:'守りの法衣',part:'body',ac:3,classes:[1,2],price:180,sell:90,minFloor:2},
dist/weapons.js:54:{id:'steelhelm',name:'鋼の兜',part:'head',ac:3,classes:[0,2],price:380,sell:190,minFloor:4},
dist/weapons.js:55:{id:'hardleather',name:'硬革鎧',part:'body',ac:3,classes:[0,2,3],price:260,sell:130,minFloor:4},
dist/weapons.js:56:{id:'magecloak',name:'魔術師の外套',part:'body',ac:4,classes:[1,2],price:520,sell:260,minFloor:4},
dist/weapons.js:57:{id:'steelgreaves',name:'鋼の脛当て',part:'feet',ac:3,classes:[0,2],price:420,sell:210,minFloor:4},
dist/weapons.js:59:{id:'magichelm',name:'魔法の兜',part:'head',ac:4,classes:[0,1,2,3],price:1800,sell:900,minFloor:5,shop:false},
dist/weapons.js:60:{id:'ninjagarb',name:'忍び装束',part:'body',ac:5,classes:[3],price:2000,sell:1000,minFloor:6,shop:false},
dist/weapons.js:61:{id:'holyvestment',name:'聖衣',part:'body',ac:6,classes:[1,2],price:2200,sell:1100,minFloor:6,shop:false},
dist/weapons.js:62:{id:'galeboots',name:'疾風の靴',part:'feet',ac:4,classes:[0,1,2,3],price:2200,sell:1100,minFloor:6,shop:false},
dist/weapons.js:63:{id:'knightplate',name:'騎士の板金鎧',part:'body',ac:7,classes:[0],price:2400,sell:1200,minFloor:7,shop:false},
dist/weapons.js:64:{id:'dragonmail',name:'竜鱗の鎧',part:'body',ac:9,classes:[0],price:6000,sell:3000,minFloor:9,shop:false}
dist/weapons.js:65:].map(a=>({minFloor:1,...a}));
dist/weapons.js:66:WEAPONS.push(...ARMOR);
dist/recruits.js:17: return {members:m,hp,mp,inventory:[['sword','staff','mace','dagger'][job]],equipped:0,armor:{},ailments:{poison:false,paralysis:0}};
dist/recruits.js:58:function recruitAC(record){return record.members.ac-Object.values(record.armor).reduce((sum,slot)=>sum+(weapon(record.inventory[slot])?.ac||0),0)}
scripts/compile-monsters.py:40:  "オーガ": "ogre", "屍兵": "zombie", "ハーピー": "harpy", "大毒蛇": "viper", "鎧蟻": "armorant", "闇の司祭": "darkpriest", "迷宮の妖術師": "sorcerer", "ガーゴイル": "gargoyle", "牛頭の門番": "minogate",
scripts/sim/harness.cjs:21:  for (const file of ['weapons', 'monster-data', 'balance', 'spells', 'items', 'flags', 'traps', 'combatui', 'party', 'monsters', 'recruits', 'game']) {
dist/party.js:6:const PARTY_FIELDS=['members','hp','mp','inventory','equipped','armor','ailments'];
dist/party.js:11: s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.armor??=[{},{},{}];s.ailments??=s.members.map(()=>({poison:false,paralysis:0}));
dist/party.js:13: for(let [job,name] of [[0,'戦士Ⅱ'],[0,'戦士Ⅲ'],[3,'盗賊']]){let c=CLASSES[job],id='member-'+s.members.length;s.members.push({id,job,name,level:1,xp:0,maxHP:c.hp,maxMP:c.mp,attack:c.attack,ac:c.ac});s.hp.push(c.hp);s.mp.push(c.mp);s.inventory.push([['sword','staff','mace','dagger'][job]]);s.equipped.push(0);s.armor.push({});s.ailments.push({poison:false,paralysis:0})}
dist/party.js:26:function renderEquipmentSummary(i){$('#equipmentsummary').innerHTML=[['武器',s.equipped[i]],['頭',s.armor[i].head],['胴体',s.armor[i].body],['足',s.armor[i].feet]].map(([label,slot])=>`<div><small>${label}</small><b>${weapon(s.inventory[i][slot])?.name||'−'}</b></div>`).join('')}
dist/party.js:27:function renderTransfer(i){let slots=s.inventory[i].map((id,slot)=>({id,slot})).filter(x=>!isEquipped(i,x.slot));$('#transferitem').innerHTML=slots.map(x=>`<option value="${x.slot}">${x.slot+1}. ${weapon(x.id).name}</option>`).join('');$('#transfermember').innerHTML=NAMES.map((name,j)=>j===i?'':`<option value="${j}" ${s.inventory[j].length>=10?'disabled':''}>${name} (${s.inventory[j].length}/10)</option>`).join('');$('#transfergive').disabled=!idle()||!slots.length||!s.inventory.some((a,j)=>j!==i&&a.length<10);$('#transfernotice').textContent=slots.length?'':'装備中のアイテムは渡せません。'}
dist/party.js:28:function transferItem(from,slot,to){if(!idle()||s.done||![from,slot,to].every(Number.isInteger)||from===to||!s.inventory[from]?.[slot]||!s.inventory[to]||s.inventory[to].length>=10||isEquipped(from,slot))return false;let id=s.inventory[from][slot];removeInventorySlot(from,slot);s.inventory[to].push(id);render();renderInventory();$('#transfernotice').textContent=`${NAMES[to]}に${weapon(id).name}を渡した。`;return true}
dist/combatui.js:5:function commandSummary(i){let c=s.commands[i];if(c==='dispel')return '呪いを解く';if(c==='guard')return '守る';if(c==='spell')return magic(s.magicPlans[i]?.id)?.name||'呪文';if(c==='item')return weapon(s.itemPlans[i]?.id)?.name||'アイテム';let g=enemyGroups().find(g=>String(g.key)===String(s.attackRows[i]));return '戦う'+(g?' → '+(g.index+1)+'列':'')}
dist/monster-data.js:1729:    "id": "armorant",
dist/game.js:1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
dist/game.js:23:function physicalAttack(i,e){let m=s.members[i],w=equippedWeapon(i),bonus=strengthBonus(m.str),count=Math.min(10,Math.max(w.minAttacks??1,jobOf(i)===0?1+Math.floor(m.level/5):1)),classHit=[0,2].includes(jobOf(i))?2+Math.floor(m.level/3):Math.floor(m.level/5),threshold=Math.max(1,Math.min(19,21-(enemyDefinition(e.id).ac+(e.acPenalty||0))-classHit-(w.hitBonus||0)-bonus+3*(s.enemy?enemyGroups().findIndex(g=>g.key===rowKey(e)):(e.row||0)))),damage=0,hitsCount=0;for(let n=0;n<count;n++)if((Math.random()*20|0)>=threshold){hitsCount++;damage+=Math.max(1,dice(...w.dice).value+bonus)}return {damage,hitsCount,count}}
dist/game.js:25:function reachableEnemyGroups(i,combat=s.enemy){let groups=enemyGroups(combat).filter(g=>g.units.some(e=>e.hp>0));return equippedWeapon(i)?.range==='ranged'?groups:groups.slice(0,2)}
dist/game.js:37:function canWeaponAttack(i){return i<3||equippedWeapon(i)?.range==='ranged'}
dist/game.js:38:function itemDescription(w){return diceLabel(w)+(w.dice?' · '+(w.range==='ranged'?'遠距離':'近距離'):'')}
dist/game.js:41:function ensureProfile(){ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members)migrateStrength(r.members,r.members.job??0);ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
dist/game.js:42:function weapon(id){return WEAPONS.find(w=>w.id===id)||MEDICINES.find(w=>w.id===id)}
dist/game.js:43:function equippedWeapon(i){return weapon(s.inventory[i][s.equipped[i]])}
dist/game.js:53:function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
dist/game.js:54:function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
dist/game.js:55:function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
dist/game.js:56:function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
dist/game.js:57:function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
dist/game.js:69:$('#backtown').onclick=enterTown;$('#entrance').onclick=enterDungeon;$('#blacksmith').onclick=()=>{if(!s.members.length)return;renderShop();$('#shopdialog').showModal()};$('#shopclose').onclick=()=>$('#shopdialog').close();$('#inventoryclose').onclick=()=>$('#inventorydialog').close();$('#shopmember').onchange=()=>{renderShop();$('#shopnotice').textContent=''};$('#shopitems').onclick=e=>{let b=e.target.closest('[data-buy]');if(b)buy(b.dataset.buy,+$('#shopmember').value)};$('#shopinventory').onclick=()=>openInventory(+$('#shopmember').value);$('#inventoryslots').onclick=e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.useMedicine!==undefined)openMedicine(inventoryMember,+b.dataset.useMedicine);if(b.dataset.equip!==undefined)equip(inventoryMember,+b.dataset.equip);if(b.dataset.sell!==undefined)sell(inventoryMember,+b.dataset.sell)};
dist/game.js:74:function isEquipped(i,slot){return s.equipped[i]===slot||Object.values(s.armor[i]).includes(slot)}
dist/game.js:75:function effectiveAC(i){return memberClass(i).ac-Object.values(s.armor[i]).reduce((n,k)=>n+(weapon(s.inventory[i][k])?.ac||0),0)-(s.enemy?.partyAC||0)}
dist/game.js:85:function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}

codex
確認できました。武器・防具データはすでに minFloor/shop/range を持つので、それを利用し、装備性能を実際の攻撃・防御スコアで比較する形にします。まず現状の指定なし固定seed出力を保存し、回帰条件にします。
exec
/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 10 && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 15 --floor 3 --n 10 && node scripts/sim/selftest.cjs' in /workspace/dungeonsweeper
 succeeded in 2970ms:
{"winRate":0.3,"wipeRate":0.5,"deathsPerBattle":3.9,"hpLossRate":0.7161290322580645,"averageRounds":7.2}
{"winRate":1,"wipeRate":0,"deathsPerBattle":0,"hpLossRate":0.0018151815181518204,"averageRounds":1.1}
PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout

exec
/bin/bash -lc 'cat dist/weapons.js' in /workspace/dungeonsweeper
 succeeded in 0ms:
// 武器の定義。dice=[個数,面数,固定加算]。classes=0:戦士、1:魔法使い、2:僧侶、3:盗賊。range=melee:近距離、ranged:遠距離。
// 価格・売却額・ドロップ対象もここだけで管理します。
// minFloor：宝箱・ドロップに出る最も浅い階（省略時1）。shop:false は鍛冶屋に並ばない迷宮産の品（売却は可）。
const WEAPONS = [
 {id:'shortbow',name:'短弓',range:'ranged',dice:[1,6,0],classes:[0,3],price:45,sell:22,drop:true},
 {id:'longbow',name:'長弓',range:'ranged',dice:[1,8,1],classes:[0,3],price:95,sell:47,drop:true},
 {id:'compositebow',name:'合成弓',range:'ranged',dice:[2,4,1],classes:[0,3],price:160,sell:80,drop:true,minFloor:2},
 {id:'dagger',name:'短剣',dice:[1,4,1],classes:[3],price:15,sell:7,drop:true},
 {id:'thiefblade',name:'盗賊の小剣',dice:[1,6,2],classes:[3],price:60,sell:30,drop:true},
 {id:'sword',name:'剣',dice:[1,6,2],classes:[0],price:20,sell:10,drop:true},
 {id:'staff',name:'杖',dice:[1,3,0],classes:[1],price:12,sell:6,drop:true},
 {id:'mace',name:'メイス',dice:[1,6,0],classes:[2],price:18,sell:9,drop:true},
 {id:'longsword',name:'長剣',dice:[1,8,3],classes:[0],price:60,sell:30,drop:true},
 {id:'battleaxe',name:'戦斧',dice:[2,6,1],classes:[0],price:110,sell:55,drop:true,minFloor:2},
 {id:'greatsword',name:'大剣',dice:[2,8,2],classes:[0],price:190,sell:95,drop:true,minFloor:2},
 {id:'oakstaff',name:'樫の杖',dice:[1,6,1],classes:[1],price:45,sell:22,drop:true},
 {id:'runestaff',name:'ルーンの杖',dice:[2,4,2],classes:[1],price:100,sell:50,drop:true,minFloor:2},
 {id:'starstaff',name:'星鉄の杖',dice:[2,6,2],classes:[1],price:180,sell:90,drop:true,minFloor:2},
 {id:'ironmace',name:'鉄のメイス',dice:[1,8,1],classes:[2],price:50,sell:25,drop:true},
 {id:'warhammer',name:'戦槌',dice:[2,5,2],classes:[2],price:105,sell:52,drop:true,minFloor:2},
 {id:'sacredmace',name:'聖銀のメイス',dice:[2,6,3],classes:[2],price:185,sell:92,drop:true,minFloor:2},
 // 4F〜：鍛冶屋の上位品（迷宮でも出る）
 {id:'knightsword',name:'騎士の剣',dice:[2,8,4],classes:[0],price:450,sell:225,drop:true,minFloor:4,hitBonus:1},
 {id:'heavybow',name:'強弓',range:'ranged',dice:[2,6,2],classes:[0,3],price:380,sell:190,drop:true,minFloor:4},
 {id:'keenblade',name:'鋭い小剣',dice:[2,4,3],classes:[3],price:320,sell:160,drop:true,minFloor:4,hitBonus:1},
 {id:'blessedhammer',name:'祝福の槌',dice:[2,8,3],classes:[2],price:420,sell:210,drop:true,minFloor:4},
 {id:'magestaff',name:'魔樫の杖',dice:[2,6,3],classes:[1],price:400,sell:200,drop:true,minFloor:4},
 // 5F〜：迷宮産（鍛冶屋に並ばない）
 {id:'flamesword',name:'炎の剣',dice:[3,6,4],classes:[0],price:1500,sell:750,drop:true,minFloor:5,shop:false,hitBonus:2},
 {id:'magicbow',name:'魔弓',range:'ranged',dice:[2,8,3],classes:[0,3],price:1700,sell:850,drop:true,minFloor:5,shop:false,hitBonus:2},
 {id:'powerstaff',name:'魔力の杖',dice:[2,6,4],classes:[1],price:1400,sell:700,drop:true,minFloor:5,shop:false,hitBonus:1},
 {id:'holyhammer',name:'聖なる戦槌',dice:[3,6,4],classes:[2],price:1600,sell:800,drop:true,minFloor:5,shop:false,hitBonus:2},
 {id:'assassinknife',name:'暗殺の短刀',dice:[2,6,4],classes:[3],price:1800,sell:900,drop:true,minFloor:6,shop:false,hitBonus:3},
 // 7F〜：深層の秘宝
 {id:'ogreslayer',name:'鬼斬りの大剣',dice:[3,8,4],classes:[0],price:2600,sell:1300,drop:true,minFloor:7,shop:false,hitBonus:2},
 {id:'sagestaff',name:'賢者の杖',dice:[3,6,4],classes:[1],price:3000,sell:1500,drop:true,minFloor:7,shop:false,hitBonus:2},
 {id:'judgehammer',name:'天罰の槌',dice:[3,8,5],classes:[2],price:3200,sell:1600,drop:true,minFloor:8,shop:false,hitBonus:2},
 {id:'ninjato',name:'忍びの刀',dice:[3,6,5],classes:[3],price:3500,sell:1750,drop:true,minFloor:8,shop:false,hitBonus:3},
 {id:'dragonbow',name:'竜骨の弓',range:'ranged',dice:[3,6,5],classes:[0,3],price:3400,sell:1700,drop:true,minFloor:8,shop:false,hitBonus:3},
 {id:'holysword',name:'聖剣',dice:[4,8,5],classes:[0],price:6000,sell:3000,drop:true,minFloor:9,shop:false,hitBonus:3,minAttacks:2}
] .map(w=>({range:'melee',hitBonus:0,minAttacks:1,minFloor:1,...w}));

const ARMOR=[
{id:'cap',name:'革帽子',part:'head',ac:1,classes:[0,1,2,3],price:30,sell:15},
{id:'helm',name:'鉄兜',part:'head',ac:2,classes:[0,2],price:90,sell:45},
{id:'robe',name:'ローブ',part:'body',ac:1,classes:[0,1,2,3],price:25,sell:12},
{id:'leather',name:'革鎧',part:'body',ac:2,classes:[0,2,3],price:65,sell:32},
{id:'chain',name:'鎖帷子',part:'body',ac:3,classes:[0,2],price:130,sell:65},
{id:'plate',name:'板金鎧',part:'body',ac:5,classes:[0],price:300,sell:150,minFloor:3},
{id:'boots',name:'革靴',part:'feet',ac:1,classes:[0,1,2,3],price:30,sell:15},
{id:'greaves',name:'鉄の脛当て',part:'feet',ac:2,classes:[0,2],price:100,sell:50},
{id:'wardrobe',name:'守りの法衣',part:'body',ac:3,classes:[1,2],price:180,sell:90,minFloor:2},
// 4F〜：鍛冶屋の上位品
{id:'steelhelm',name:'鋼の兜',part:'head',ac:3,classes:[0,2],price:380,sell:190,minFloor:4},
{id:'hardleather',name:'硬革鎧',part:'body',ac:3,classes:[0,2,3],price:260,sell:130,minFloor:4},
{id:'magecloak',name:'魔術師の外套',part:'body',ac:4,classes:[1,2],price:520,sell:260,minFloor:4},
{id:'steelgreaves',name:'鋼の脛当て',part:'feet',ac:3,classes:[0,2],price:420,sell:210,minFloor:4},
// 5F〜：迷宮産
{id:'magichelm',name:'魔法の兜',part:'head',ac:4,classes:[0,1,2,3],price:1800,sell:900,minFloor:5,shop:false},
{id:'ninjagarb',name:'忍び装束',part:'body',ac:5,classes:[3],price:2000,sell:1000,minFloor:6,shop:false},
{id:'holyvestment',name:'聖衣',part:'body',ac:6,classes:[1,2],price:2200,sell:1100,minFloor:6,shop:false},
{id:'galeboots',name:'疾風の靴',part:'feet',ac:4,classes:[0,1,2,3],price:2200,sell:1100,minFloor:6,shop:false},
{id:'knightplate',name:'騎士の板金鎧',part:'body',ac:7,classes:[0],price:2400,sell:1200,minFloor:7,shop:false},
{id:'dragonmail',name:'竜鱗の鎧',part:'body',ac:9,classes:[0],price:6000,sell:3000,minFloor:9,shop:false}
].map(a=>({minFloor:1,...a}));
WEAPONS.push(...ARMOR);

apply patch
patch: completed
/workspace/dungeonsweeper/scripts/sim/combat.cjs
diff --git a/scripts/sim/combat.cjs b/scripts/sim/combat.cjs
index 36cd945e6149875281f9488f9ee34dba55c211c2..b2bded3434fd5e46a81e4c978ffd254afec0b99e
--- a/scripts/sim/combat.cjs
+++ b/scripts/sim/combat.cjs
@@ -5,7 +5,7 @@
   const out = {};
   for (let i = 0; i < argv.length; i++) {
     const key = argv[i];
-    if (!['--jobs', '--level', '--floor', '--n', '--boss'].includes(key)) throw Error(`不明な引数: ${key}`);
+    if (!['--jobs', '--level', '--floor', '--n', '--boss', '--gear'].includes(key)) throw Error(`不明な引数: ${key}`);
     if (Object.hasOwn(out, key.slice(2))) throw Error(`重複した引数: ${key}`);
     if (key === '--boss') { out.boss = true; continue; }
     if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`値が必要です: ${key}`);
@@ -15,9 +15,10 @@
   const jobs = out.jobs.split(',').map(Number);
   const level = Number(out.level), floor = Number(out.floor), n = Number(out.n);
   if (!Number.isInteger(level) || level < 1 || level > 30) throw Error('--level は1〜30で指定してください');
-  if (!Number.isInteger(floor) || floor < 1 || floor > 3) throw Error('--floor は1〜3で指定してください');
+  if (!Number.isInteger(floor) || floor < 1 || floor > 10) throw Error('--floor は1〜10で指定してください');
   if (!Number.isInteger(n) || n < 1 || n > 100000) throw Error('--n は1〜100000で指定してください');
-  return { jobs, level, floor, n, boss: !!out.boss };
+  if (out.gear !== undefined && !['shop', 'drop'].includes(out.gear)) throw Error('--gear はshopまたはdropで指定してください');
+  return { jobs, level, floor, n, boss: !!out.boss, gear: out.gear };
 }
 
 // One reproducible stream per invocation; never rewind it between trials.
@@ -70,6 +71,25 @@
   return initialHP;
 }
 
+function gearParty(g, floor, gear) {
+  if (!gear) return;
+  g.run(`(() => {
+    const items = WEAPONS.filter(w => (w.minFloor || 1) <= ${floor} && (${gear === 'drop' ? 'true' : 'w.shop !== false'}));
+    const score = w => w.dice ? w.dice[0] * (w.dice[1] + 1) / 2 + w.dice[2] + (w.hitBonus || 0) * 0.5 : 0;
+    for (let i = 0; i < s.members.length; i++) {
+      const job = jobOf(i), rear = i >= 3;
+      const weapons = items.filter(w => w.dice && w.classes.includes(job) && (!rear || w.range === 'ranged'));
+      weapons.sort((a,b) => score(b) - score(a) || a.price - b.price);
+      if (weapons[0]) { s.inventory[i].push(weapons[0].id); s.equipped[i] = s.inventory[i].length - 1; }
+      const armor = items.filter(w => w.part && w.classes.includes(job));
+      for (const part of ['head','body','feet']) {
+        const candidates = armor.filter(w => w.part === part).sort((a,b) => b.ac - a.ac || a.price - b.price);
+        if (candidates[0]) { s.inventory[i].push(candidates[0].id); s.armor[i][part] = s.inventory[i].length - 1; }
+      }
+    }
+  })()`);
+}
+
 function planTurn(g) {
   g.run(`
     s.magicPlans = s.members.map(() => null);
@@ -124,6 +144,7 @@
 function simulate(opt) {
   const g = game(null, seededRandom());
   createParty(g, opt.jobs);
+  gearParty(g, opt.floor, opt.gear);
   let wins = 0, wipes = 0, deaths = 0, hpLoss = 0, rounds = 0;
   for (let trial = 0; trial < opt.n; trial++) {
     const initialHP = prepareTrial(g, opt);
@@ -143,4 +164,4 @@
   try { process.stdout.write(JSON.stringify(simulate(args(process.argv.slice(2)))) + '\n'); }
   catch (error) { console.error(error.message); process.exitCode = 1; }
 }
-module.exports = { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle };
+module.exports = { args, simulate, seededRandom, createParty, gearParty, prepareTrial, planTurn, resolveBattle };

apply patch
patch: completed
/workspace/dungeonsweeper/scripts/sim/selftest.cjs
diff --git a/scripts/sim/combat.cjs b/scripts/sim/combat.cjs
index 36cd945e6149875281f9488f9ee34dba55c211c2..b2bded3434fd5e46a81e4c978ffd254afec0b99e
--- a/scripts/sim/combat.cjs
+++ b/scripts/sim/combat.cjs
@@ -5,7 +5,7 @@
   const out = {};
   for (let i = 0; i < argv.length; i++) {
     const key = argv[i];
-    if (!['--jobs', '--level', '--floor', '--n', '--boss'].includes(key)) throw Error(`不明な引数: ${key}`);
+    if (!['--jobs', '--level', '--floor', '--n', '--boss', '--gear'].includes(key)) throw Error(`不明な引数: ${key}`);
     if (Object.hasOwn(out, key.slice(2))) throw Error(`重複した引数: ${key}`);
     if (key === '--boss') { out.boss = true; continue; }
     if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`値が必要です: ${key}`);
@@ -15,9 +15,10 @@
   const jobs = out.jobs.split(',').map(Number);
   const level = Number(out.level), floor = Number(out.floor), n = Number(out.n);
   if (!Number.isInteger(level) || level < 1 || level > 30) throw Error('--level は1〜30で指定してください');
-  if (!Number.isInteger(floor) || floor < 1 || floor > 3) throw Error('--floor は1〜3で指定してください');
+  if (!Number.isInteger(floor) || floor < 1 || floor > 10) throw Error('--floor は1〜10で指定してください');
   if (!Number.isInteger(n) || n < 1 || n > 100000) throw Error('--n は1〜100000で指定してください');
-  return { jobs, level, floor, n, boss: !!out.boss };
+  if (out.gear !== undefined && !['shop', 'drop'].includes(out.gear)) throw Error('--gear はshopまたはdropで指定してください');
+  return { jobs, level, floor, n, boss: !!out.boss, gear: out.gear };
 }
 
 // One reproducible stream per invocation; never rewind it between trials.
@@ -70,6 +71,25 @@
   return initialHP;
 }
 
+function gearParty(g, floor, gear) {
+  if (!gear) return;
+  g.run(`(() => {
+    const items = WEAPONS.filter(w => (w.minFloor || 1) <= ${floor} && (${gear === 'drop' ? 'true' : 'w.shop !== false'}));
+    const score = w => w.dice ? w.dice[0] * (w.dice[1] + 1) / 2 + w.dice[2] + (w.hitBonus || 0) * 0.5 : 0;
+    for (let i = 0; i < s.members.length; i++) {
+      const job = jobOf(i), rear = i >= 3;
+      const weapons = items.filter(w => w.dice && w.classes.includes(job) && (!rear || w.range === 'ranged'));
+      weapons.sort((a,b) => score(b) - score(a) || a.price - b.price);
+      if (weapons[0]) { s.inventory[i].push(weapons[0].id); s.equipped[i] = s.inventory[i].length - 1; }
+      const armor = items.filter(w => w.part && w.classes.includes(job));
+      for (const part of ['head','body','feet']) {
+        const candidates = armor.filter(w => w.part === part).sort((a,b) => b.ac - a.ac || a.price - b.price);
+        if (candidates[0]) { s.inventory[i].push(candidates[0].id); s.armor[i][part] = s.inventory[i].length - 1; }
+      }
+    }
+  })()`);
+}
+
 function planTurn(g) {
   g.run(`
     s.magicPlans = s.members.map(() => null);
@@ -124,6 +144,7 @@
 function simulate(opt) {
   const g = game(null, seededRandom());
   createParty(g, opt.jobs);
+  gearParty(g, opt.floor, opt.gear);
   let wins = 0, wipes = 0, deaths = 0, hpLoss = 0, rounds = 0;
   for (let trial = 0; trial < opt.n; trial++) {
     const initialHP = prepareTrial(g, opt);
@@ -143,4 +164,4 @@
   try { process.stdout.write(JSON.stringify(simulate(args(process.argv.slice(2)))) + '\n'); }
   catch (error) { console.error(error.message); process.exitCode = 1; }
 }
-module.exports = { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle };
+module.exports = { args, simulate, seededRandom, createParty, gearParty, prepareTrial, planTurn, resolveBattle };
diff --git a/scripts/sim/selftest.cjs b/scripts/sim/selftest.cjs
index b2a56d101a6b7cdb13639fdef41757db0834a4b4..f65b2935302be4d88b133495531a434ce7fd4652
--- a/scripts/sim/selftest.cjs
+++ b/scripts/sim/selftest.cjs
@@ -1,15 +1,26 @@
 // Kept beside the simulator because task 010 explicitly excludes tests/ edits.
 const assert = require('node:assert/strict');
 const { game } = require('./harness.cjs');
-const { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle } = require('./combat.cjs');
+const { args, simulate, seededRandom, createParty, gearParty, prepareTrial, planTurn, resolveBattle } = require('./combat.cjs');
 const opt = args(['--jobs','0,0,2,3,1,2','--level','1','--floor','3','--n','2']);
 for (const argv of [[], ['--jobs',''], ['--jobs','0,'], ['--wat','1'], ['--boss','--boss'],
-  ['--jobs','0','--level','1','--floor','4','--n','1']]) assert.throws(() => args(argv));
+  ['--jobs','0','--level','1','--floor','11','--n','1'], ['--gear','bad']]) assert.throws(() => args(argv));
+const floor10 = args(['--jobs','0,0,2,3,1,2','--level','15','--floor','10','--boss','--gear','drop','--n','1']);
+assert.equal(floor10.floor, 10);
+assert.equal(floor10.gear, 'drop');
 
 const g = game(null, seededRandom());
 createParty(g, opt.jobs);
 assert.equal(g.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
 assert.equal(g.run('s.reserve.length'), 0);
+assert.equal(g.run('s.inventory.every(a => a.length === 1)'), true, 'gear omitted must retain starter inventory');
+gearParty(g, 10, 'drop');
+assert.equal(g.run("s.inventory[0].map(id=>weapon(id).name).includes('聖剣')"), true, 'drop gear should consider minFloor 9 equipment');
+assert.equal(g.run("s.inventory[4].map(id=>weapon(id).name).some(n=>['魔弓','竜骨の弓'].includes(n))"), true, 'rear members should receive a ranged weapon');
+const shopGear = game(null, seededRandom());
+createParty(shopGear, opt.jobs);
+gearParty(shopGear, 10, 'shop');
+assert.equal(shopGear.run("s.inventory[0].map(id=>weapon(id).name).includes('炎の剣')"), false, 'shop gear excludes shop:false items');
 const formations = new Set();
 for (let i = 0; i < 10; i++) {
   const total = prepareTrial(g, opt);
@@ -92,6 +103,8 @@
 
 const report = simulate(opt);
 assert.deepEqual(simulate(opt), report, 'same invocation must be reproducible');
+assert.deepEqual(simulate({...opt, gear: undefined}), report, 'omitted gear keeps the original deterministic result');
+assert(Object.values(simulate(floor10)).every(Number.isFinite), 'floor 10 boss simulation with drop gear must run');
 for (const value of Object.values(report)) assert(Number.isFinite(value));
 assert(report.winRate + report.wipeRate <= 1);
 assert(report.deathsPerBattle >= 0 && report.deathsPerBattle <= 6);

codex
実装とセルフテストを更新しました。装備スコアは期待平均ダメージを基準にし、命中補正も小さく評価しています。後衛の武器選定は遠距離品だけに限定しました。これからテストを回し、指定の10Fボス実行も確認します。
exec
/bin/bash -lc 'node scripts/sim/selftest.cjs && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 15 --floor 10 --boss --gear drop --n 1 && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 10' in /workspace/dungeonsweeper
 exited 1 in 0ms:
node:assert:152
  throw new AssertionError(obj);
  ^

AssertionError [ERR_ASSERTION]: rear members should receive a ranged weapon

false !== true

    at Object.<anonymous> (/workspace/dungeonsweeper/scripts/sim/selftest.cjs:19:8)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: false,
  expected: true,
  operator: 'strictEqual',
  diff: 'simple'
}

Node.js v24.22.1

apply patch
patch: completed
/workspace/dungeonsweeper/scripts/sim/selftest.cjs
diff --git a/scripts/sim/combat.cjs b/scripts/sim/combat.cjs
index 36cd945e6149875281f9488f9ee34dba55c211c2..b2bded3434fd5e46a81e4c978ffd254afec0b99e
--- a/scripts/sim/combat.cjs
+++ b/scripts/sim/combat.cjs
@@ -5,7 +5,7 @@
   const out = {};
   for (let i = 0; i < argv.length; i++) {
     const key = argv[i];
-    if (!['--jobs', '--level', '--floor', '--n', '--boss'].includes(key)) throw Error(`不明な引数: ${key}`);
+    if (!['--jobs', '--level', '--floor', '--n', '--boss', '--gear'].includes(key)) throw Error(`不明な引数: ${key}`);
     if (Object.hasOwn(out, key.slice(2))) throw Error(`重複した引数: ${key}`);
     if (key === '--boss') { out.boss = true; continue; }
     if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`値が必要です: ${key}`);
@@ -15,9 +15,10 @@
   const jobs = out.jobs.split(',').map(Number);
   const level = Number(out.level), floor = Number(out.floor), n = Number(out.n);
   if (!Number.isInteger(level) || level < 1 || level > 30) throw Error('--level は1〜30で指定してください');
-  if (!Number.isInteger(floor) || floor < 1 || floor > 3) throw Error('--floor は1〜3で指定してください');
+  if (!Number.isInteger(floor) || floor < 1 || floor > 10) throw Error('--floor は1〜10で指定してください');
   if (!Number.isInteger(n) || n < 1 || n > 100000) throw Error('--n は1〜100000で指定してください');
-  return { jobs, level, floor, n, boss: !!out.boss };
+  if (out.gear !== undefined && !['shop', 'drop'].includes(out.gear)) throw Error('--gear はshopまたはdropで指定してください');
+  return { jobs, level, floor, n, boss: !!out.boss, gear: out.gear };
 }
 
 // One reproducible stream per invocation; never rewind it between trials.
@@ -70,6 +71,25 @@
   return initialHP;
 }
 
+function gearParty(g, floor, gear) {
+  if (!gear) return;
+  g.run(`(() => {
+    const items = WEAPONS.filter(w => (w.minFloor || 1) <= ${floor} && (${gear === 'drop' ? 'true' : 'w.shop !== false'}));
+    const score = w => w.dice ? w.dice[0] * (w.dice[1] + 1) / 2 + w.dice[2] + (w.hitBonus || 0) * 0.5 : 0;
+    for (let i = 0; i < s.members.length; i++) {
+      const job = jobOf(i), rear = i >= 3;
+      const weapons = items.filter(w => w.dice && w.classes.includes(job) && (!rear || w.range === 'ranged'));
+      weapons.sort((a,b) => score(b) - score(a) || a.price - b.price);
+      if (weapons[0]) { s.inventory[i].push(weapons[0].id); s.equipped[i] = s.inventory[i].length - 1; }
+      const armor = items.filter(w => w.part && w.classes.includes(job));
+      for (const part of ['head','body','feet']) {
+        const candidates = armor.filter(w => w.part === part).sort((a,b) => b.ac - a.ac || a.price - b.price);
+        if (candidates[0]) { s.inventory[i].push(candidates[0].id); s.armor[i][part] = s.inventory[i].length - 1; }
+      }
+    }
+  })()`);
+}
+
 function planTurn(g) {
   g.run(`
     s.magicPlans = s.members.map(() => null);
@@ -124,6 +144,7 @@
 function simulate(opt) {
   const g = game(null, seededRandom());
   createParty(g, opt.jobs);
+  gearParty(g, opt.floor, opt.gear);
   let wins = 0, wipes = 0, deaths = 0, hpLoss = 0, rounds = 0;
   for (let trial = 0; trial < opt.n; trial++) {
     const initialHP = prepareTrial(g, opt);
@@ -143,4 +164,4 @@
   try { process.stdout.write(JSON.stringify(simulate(args(process.argv.slice(2)))) + '\n'); }
   catch (error) { console.error(error.message); process.exitCode = 1; }
 }
-module.exports = { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle };
+module.exports = { args, simulate, seededRandom, createParty, gearParty, prepareTrial, planTurn, resolveBattle };
diff --git a/scripts/sim/selftest.cjs b/scripts/sim/selftest.cjs
index b2a56d101a6b7cdb13639fdef41757db0834a4b4..ab4e5e2ff014ad35b8dd46e20f752414d6f46072
--- a/scripts/sim/selftest.cjs
+++ b/scripts/sim/selftest.cjs
@@ -1,15 +1,26 @@
 // Kept beside the simulator because task 010 explicitly excludes tests/ edits.
 const assert = require('node:assert/strict');
 const { game } = require('./harness.cjs');
-const { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle } = require('./combat.cjs');
+const { args, simulate, seededRandom, createParty, gearParty, prepareTrial, planTurn, resolveBattle } = require('./combat.cjs');
 const opt = args(['--jobs','0,0,2,3,1,2','--level','1','--floor','3','--n','2']);
 for (const argv of [[], ['--jobs',''], ['--jobs','0,'], ['--wat','1'], ['--boss','--boss'],
-  ['--jobs','0','--level','1','--floor','4','--n','1']]) assert.throws(() => args(argv));
+  ['--jobs','0','--level','1','--floor','11','--n','1'], ['--gear','bad']]) assert.throws(() => args(argv));
+const floor10 = args(['--jobs','0,0,2,3,1,2','--level','15','--floor','10','--boss','--gear','drop','--n','1']);
+assert.equal(floor10.floor, 10);
+assert.equal(floor10.gear, 'drop');
 
 const g = game(null, seededRandom());
 createParty(g, opt.jobs);
 assert.equal(g.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
 assert.equal(g.run('s.reserve.length'), 0);
+assert.equal(g.run('s.inventory.every(a => a.length === 1)'), true, 'gear omitted must retain starter inventory');
+gearParty(g, 10, 'drop');
+assert.equal(g.run("s.inventory[0].map(id=>weapon(id).name).includes('聖剣')"), true, 'drop gear should consider minFloor 9 equipment');
+assert.equal(g.run("s.inventory[3].map(id=>weapon(id).name).some(n=>['魔弓','竜骨の弓'].includes(n))"), true, 'rear thief should receive a ranged weapon');
+const shopGear = game(null, seededRandom());
+createParty(shopGear, opt.jobs);
+gearParty(shopGear, 10, 'shop');
+assert.equal(shopGear.run("s.inventory[0].map(id=>weapon(id).name).includes('炎の剣')"), false, 'shop gear excludes shop:false items');
 const formations = new Set();
 for (let i = 0; i < 10; i++) {
   const total = prepareTrial(g, opt);
@@ -92,6 +103,8 @@
 
 const report = simulate(opt);
 assert.deepEqual(simulate(opt), report, 'same invocation must be reproducible');
+assert.deepEqual(simulate({...opt, gear: undefined}), report, 'omitted gear keeps the original deterministic result');
+assert(Object.values(simulate(floor10)).every(Number.isFinite), 'floor 10 boss simulation with drop gear must run');
 for (const value of Object.values(report)) assert(Number.isFinite(value));
 assert(report.winRate + report.wipeRate <= 1);
 assert(report.deathsPerBattle >= 0 && report.deathsPerBattle <= 6);

exec
/bin/bash -lc 'node scripts/sim/selftest.cjs && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 15 --floor 10 --boss --gear drop --n 1 && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 10 && git diff --check && git status --short' in /workspace/dungeonsweeper
 succeeded in 3579ms:
PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout
{"winRate":0,"wipeRate":1,"deathsPerBattle":6,"hpLossRate":1,"averageRounds":11}
{"winRate":0.3,"wipeRate":0.5,"deathsPerBattle":3.9,"hpLossRate":0.7161290322580645,"averageRounds":7.2}
 M scripts/sim/combat.cjs
 M scripts/sim/selftest.cjs

codex
**完了**しました。

- [combat.cjs](/workspace/dungeonsweeper/scripts/sim/combat.cjs)：`--floor` を1〜10に拡張し、任意の `--gear shop|drop` を追加しました。省略時は従来どおり初期装備です。
- [selftest.cjs](/workspace/dungeonsweeper/scripts/sim/selftest.cjs)：10F、装備選択、後衛の遠距離武器、装備指定なしの固定seed結果を検証するケースを追加しました。

`node scripts/sim/selftest.cjs` はPASSし、指定の `--level 15 --floor 10 --boss --gear drop` も実行できました。装備指定なしの結果は変更前と一致しました。ブラウザ確認は対象外のため行っていません。
tokens used
36,777
**完了**しました。

- [combat.cjs](/workspace/dungeonsweeper/scripts/sim/combat.cjs)：`--floor` を1〜10に拡張し、任意の `--gear shop|drop` を追加しました。省略時は従来どおり初期装備です。
- [selftest.cjs](/workspace/dungeonsweeper/scripts/sim/selftest.cjs)：10F、装備選択、後衛の遠距離武器、装備指定なしの固定seed結果を検証するケースを追加しました。

`node scripts/sim/selftest.cjs` はPASSし、指定の `--level 15 --floor 10 --boss --gear drop` も実行できました。装備指定なしの結果は変更前と一致しました。ブラウザ確認は対象外のため行っていません。
