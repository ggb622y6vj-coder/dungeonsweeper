OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-luna
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: low
reasoning summaries: none
session id: 01a19842-2769-7df1-829b-b0cc19c831bc
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
# 014-light-trap-count
ティア：LIGHT　依存：013

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
罠が全階10個固定で深い階ほど密度が下がるため、階層ごとに増やす（1〜3F）。

## 変更内容
- dist/balance.js に `function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22), Math.round(size*size*(0.14+0.01*(floor-1))))}` を追加。
- dist/game.js `fresh()`：罠10個固定を `trapCount(floor, size())` に（安全マス不足なら配置可能数まで）。開始周囲・守護者への安全経路は従来通り。docs更新。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：1F=9、2F=15、3F=23。1000回生成で開始周囲・安全経路に罠なし。
- 手動：2F・3Fで数字が以前より大きめに出ること。

codex
指示どおり、まず既存のルールと仕様、引き継ぎ資料を確認してから、罠数の階層調整と回帰テストを実装します。
exec
/bin/bash -lc "pwd && rg --files -g 'AGENTS.md' -g 'README*' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g 'balance.js' -g 'game.js' -g 'game.cjs' -g 'training.cjs'" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
dist/game.js
dist/balance.js
AGENTS.md
tests/training.cjs
tests/game.cjs
README.md
docs/HANDOFF.md
docs/SPECIFICATION.md
data/README.md

exec
/bin/bash -lc 'cat AGENTS.md README.md docs/HANDOFF.md docs/SPECIFICATION.md' in /workspace/dungeonsweeper
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
開始位置と守護者位置は乱数。チェビシェフ距離2以内（縦横の最大差が2以下）には守護者を置かない。開始位置の周囲と、守護者までの生成経路は安全。罠は各階10個。
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
正しい旗n本の種類別発動率＝min(50%,0.5%×n²)。1本0.5%、10本50%。戦闘開始時に旗配置のスナップショットを取る。
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

exec
/bin/bash -lc "rg -n \"trap|fresh\\(|function size|function safe|guardian|守護\" dist/game.js dist/balance.js tests/game.cjs docs/SPECIFICATION.md" in /workspace/dungeonsweeper
 succeeded in 0ms:
docs/SPECIFICATION.md:7:町（酒場・鍛冶屋・迷宮入口）→探索→遭遇／宝箱／守護者→階段で上下移動→町。
docs/SPECIFICATION.md:9:開始位置と守護者位置は乱数。チェビシェフ距離2以内（縦横の最大差が2以下）には守護者を置かない。開始位置の周囲と、守護者までの生成経路は安全。罠は各階10個。
docs/SPECIFICATION.md:10:守護者マスへ入ると確認。いいえで直前マスへ戻る。撃破後その場所が下り階段になる。各階に固有守護者、4F以降は3F設定を使用。
docs/SPECIFICATION.md:18:通常は敵奇襲10%、味方先制10%。後退時は敵奇襲12%、味方先制10%。守護者戦は通常開始。警戒結界は敵奇襲を通常開始へ置換。
docs/SPECIFICATION.md:41:通常遭遇は同階の非守護者から1〜3列を抽選。同じ敵が複数列になることもある。1列は同種で、頭数はその敵の群れ範囲。敵のHPは非表示。
tests/game.cjs:1:const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
tests/game.cjs:7:drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
tests/game.cjs:8:drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.cells[s.pos].chest={gold:7,opened:false,trap:'none'};s.scan=2;var oldgold=s.gold;Math.random=()=>.99;openChest(true);if(s.gold!==oldgold+21||currentChest())throw Error('safe chest');`);drain();run(`openChest(false);if(s.gold!==oldgold+21)throw Error('double chest');s.cells[s.pos].chest={gold:9,opened:false};s.scan=0;if(!currentChest())throw Error('new chest');s.hp=[32,24,26];afflict(0,'poison');tickAilments();if(s.hp[0]!==30)throw Error('poison');afflict(1,'paralysis');tickAilments();if(s.ailments[1].paralysis!==3)throw Error('paralysis');`);drain();run(`abandonChest()`);drain();run(`enterTown();if(s.ailments.some(a=>a.poison||a.paralysis))throw Error('town cure');`);console.log('PASS direct chest, once-only rewards, poison, paralysis, town cure');
tests/game.cjs:10:drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');
tests/game.cjs:13:drain();run(`var escapeOriginalMembers=structuredClone(s.members),escapeOriginalHP=s.hp.slice(),escapeOriginalAilments=structuredClone(s.ailments);fresh(1);s.members=Array.from({length:6},(_,i)=>({...structuredClone(s.members[i%3]),level:1}));s.hp=Array(6).fill(20);s.ailments=Array.from({length:6},()=>({poison:false,paralysis:0}));s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'wolf',uid:0,hp:20}]};if(escapeChance()!==45)throw Error('escape six level 1 vs level 2');s.members.forEach(m=>m.level=10);if(escapeChance()!==90)throw Error('escape six level 10 vs level 2');s.members=s.members.slice(0,1);s.hp=s.hp.slice(0,1);s.ailments=s.ailments.slice(0,1);s.members[0].level=1;if(escapeChance()!==60)throw Error('escape one level 1 vs level 2');s.members[0].level=20;if(escapeChance()!==95)throw Error('escape upper clamp');s.hp[0]=0;if(escapeChance()!==10)throw Error('escape no eligible party');s.hp[0]=20;s.members[0].level=1;s.enemy.units[0].id='goblin';if(escapeChance()!==60)throw Error('escape one level 1 vs level 2 after eligibility restore');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members[0].level=20;s.enemy.units[0].id='wolf';if(escapeChance()!==95)throw Error('escape clamp at 95');Math.random=()=>0;var oldGold=s.gold;flee();if(s.enemy||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape');s.members=escapeOriginalMembers;s.hp=escapeOriginalHP;s.ailments=escapeOriginalAilments`);console.log('PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction');
tests/game.cjs:27:s.hp[0]=10;s.cells[s.pos].chest={gold:3,opened:false,trap:'poison'};castMagic(2,'calfo',null);if(currentChest().reading!=='毒'||currentChest().trap!=='poison'||currentChest().opened)throw Error('identify');delete s.cells[s.pos].chest;
tests/game.cjs:38:s.cells[s.pos].type='boss';var formationRolls=[0,.99,0];Math.random=()=>formationRolls.shift()??.99;encounter(s.pos);if(s.enemy.units.length!==3||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian'||s.enemy.units[2].id==='guardian')throw Error('guardian escort formation');
tests/game.cjs:40:`);drain();console.log('PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth');
tests/game.cjs:57:drain();run(`s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;s.area='dungeon';s.floor=1;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.cells.forEach(c=>{c.type='';c.trap=false;c.open=true;c.flag=false;delete c.chest});Math.random=()=>.99;`);
tests/game.cjs:76:s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
tests/game.cjs:77:var lockedFloor=s.floor;if(travelFloor(2)!==false||s.floor!==lockedFloor||s.cells[s.boss].type!=='boss')throw Error('guardian bypass');
tests/game.cjs:79:s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss,expectedFormation=monsterFormation(true);if(expectedFormation.length!==2||expectedFormation[0]!=='guardian'||expectedFormation[1]==='guardian')throw Error('guardian escort encounter');Math.random=()=>.999;encounter(s.boss);s.enemy.units.forEach(e=>e.row=e.id==='guardian'?0:1);s.enemy.boss=true;s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');Math.random=()=>.999;
tests/game.cjs:81:if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=s.members.map(()=>0);s.commands=s.members.map(()=> 'fight');attack();`);drain();run(`if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
tests/game.cjs:87:`);console.log('PASS guardian gates / same-tile stairs, floor round trips and town reset, profile retention, XP +15% migration once, first living target and empty-row action');
tests/game.cjs:89:s.enemy=null;s.cells.forEach(c=>c.flag=false);var ts=s.cells.filter(c=>c.trap);ts[0].flag='power';ts[1].flag='guard';ts[2].flag='magic';var ef=flagEffect();if(ef.counts.power!==1||ef.counts.guard!==1||ef.counts.magic!==1)throw Error('typed flags');s.flagKind='guard';if(placedFlag(ts[0])!=='power')throw Error('recolor');Math.random=()=>0;s.enemy={units:[{id:'slime',uid:0,hp:10}],flagEffect:ef};if(flagDamage(20)!==30||flagDamage(20,true)!==10)throw Error('mixed procs');s.mp[1]=10;flagConsumeMP(1,3);if(s.mp[1]!==8)throw Error('half MP combat');s.enemy=null;flagConsumeMP(1,3);if(s.mp[1]!==6)throw Error('half MP field');s.cells.find(c=>!c.trap).flag='guard';s.enemy={units:[{id:'slime',uid:0,hp:10}],flagEffect:flagEffect()};if(flagDamage(20)!==20||flagDamage(20,true)!==30||escapeChance()!==0)throw Error('mixed curse');s.enemy=null;
tests/game.cjs:92:s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;fresh(1);s.cells.forEach(c=>{c.trap=false;c.flag=false;c.chest=undefined});
tests/game.cjs:95:for (const [r,kind] of [[.1,'needle'],[.3,'blast'],[.6,'poison'],[.8,'paralysis'],[.95,'teleport']]){drain();run(`s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.done=false;var orig=s.pos,c=s.cells[orig];c.trap=true;Math.random=()=>${r};triggerFloorTrap(c);if(c.trap||!c.spent||c.trapKind!=='${kind}')throw Error('trap consume');if('${kind}'==='needle'&&s.hp.filter((h,i)=>h<maxHP(i)).length!==1)throw Error('single damage');if('${kind}'==='blast'&&s.hp.some((h,i)=>h>=maxHP(i)))throw Error('party damage');if('${kind}'==='poison'&&s.ailments.some(a=>!a.poison))throw Error('poison gas');if('${kind}'==='paralysis'&&!s.ailments.some(a=>a.paralysis>0))throw Error('paralysis');if('${kind}'==='teleport'&&(s.pos===orig||s.cells[s.pos].type||s.cells[s.pos].trap||!s.cells[s.pos].open||s.enemy||s.pendingStairs))throw Error('safe teleport');`)}
tests/game.cjs:98:`);console.log('PASS 0.5-50% flags, five floor traps, safe teleport and sequential command entry/review');
tests/game.cjs:110:drain();run(`s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;s.area='dungeon';s.cells[s.pos].chest={opened:false};s.members[2].known.push('calfo');s.mp[2]=10;s.hp[2]=20;s.ailments[2].paralysis=0;if(calfoCaster()!==2)throw Error('chest calfo available');s.mp[2]=0;if(calfoCaster()!==-1)throw Error('calfo insufficient MP');s.mp[2]=10;s.ailments[2].paralysis=1;if(calfoCaster()!==-1)throw Error('calfo paralysis');s.ailments[2].paralysis=0;delete s.cells[s.pos].chest;if(calfoCaster()!==-1)throw Error('no chest');s.light=true;s.pos=3*size()+3;for(let d=0;d<4;d++){s.dir=d;let ids=diagonalSight();if(ids.length!==2||ids.some(i=>!around(s.pos).includes(i)||adjacent(s.pos,i)))throw Error('diagonal direction');}s.pos=0;s.dir=0;if(diagonalSight().some(i=>i!==-1)||distantSight())throw Error('outer wall');s.pos=3*size()+3;scene();if(!$('#scene').innerHTML.includes('class="透視"')||$('#scene').innerHTML.includes('歩先'))throw Error('SVG light view');s.light=false;if(diagonalSight().length||distantSight())throw Error('light off');s.cells[s.pos].open=true;s.cells[s.pos+1].open=true;for(let i of around(s.pos).slice(0,2))s.cells[i].trap=true;s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}]};scene();if($('#scene').innerHTML.includes('>2</text>')||$('#scene').innerHTML.includes('>1</text>'))throw Error('combat scene trap numbers');s.enemy=null;scene();if(!$('#scene').innerHTML.includes('>2</text>'))throw Error('exploration scene number restored');`);console.log('PASS chest Calfo availability, all-facing diagonal sight and wall boundaries');
tests/game.cjs:118:s.area='dungeon';s.pos=27;s.dir=0;s.cells[target()].open=false;s.cells[target()].trap=true;s.mp[0]=100;s.dumapicUses=0;Math.random=()=>.5;castMagic(0,'dumapic',null);if(s.mp[0]!==98||spellCost(magic('dumapic'))!==4||!s.cells[target()].trap||s.cells[target()].open)throw Error('survey cost or mutates cell');
tests/game.cjs:120:s.area='dungeon';s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.cells[s.pos].chest={gold:10,trap:'poison',opened:false};var goldBefore=s.gold;Math.random=()=>.5;thiefOpenChest();if(currentChest()||s.gold!==goldBefore+30||s.ailments.some(a=>a.poison))throw Error('thief success');
tests/game.cjs:121:`);drain();run(`s.cells[s.pos].chest={gold:10,trap:'needle',opened:false};var goldBefore=s.gold,hpBefore=s.hp.reduce((a,b)=>a+b);Math.random=()=>.99;thiefOpenChest();if(currentChest()||s.cells[s.pos].chest||s.gold!==goldBefore||s.hp.reduce((a,b)=>a+b)>=hpBefore)throw Error('thief failure trap and destroy');`);drain();run(`
tests/game.cjs:128:drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, 0.5-50% curve');
tests/game.cjs:133:drain();run(`s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.hp=s.members.map(()=>100);s.ailments=s.members.map(()=>({}));Math.random=()=>0;var beforeTrap=s.hp.slice();triggerFloorTrap(s.cells[s.pos]);if(logQueue[0].text!=='罠だ！'||!logQueue[0].trap||logQueue[0].hp.join()!==beforeTrap.join()||s.hp[0]!==93)throw Error('trap sequence/damage');`);timers.shift()();run(`if(encounterNotice!=='！'||displayVitals.hp[0]!==100)throw Error('trap warning snapshot');`);drain();run(`s.cells[s.pos].chest={opened:false,gold:1};log('敵を倒した。');render();if(!$('#chestactions').hidden)throw Error('chest spoiler');`);drain();run(`if($('#chestactions').hidden)throw Error('chest not revealed after logs');`);console.log('PASS trap warning before damage and chest reveal after log playback');
tests/game.cjs:170:for(let f=1;f<=4;f++){s.floor=f;for(let r of [0,.2,.5,.999]){Math.random=()=>r;let formation=monsterFormation(false);if(formation.length<1||formation.length>3||formation.some(id=>enemyDefinition(id).floor!==Math.min(3,f)||enemyDefinition(id).boss))throw Error('floor pool');if(monsterFormation(true)[0]!==['guardian','general','watcher'][Math.min(3,f)-1])throw Error('guardian floor')}}
tests/game.cjs:184:resetMonstersTest('guardian');s.floor=3;delete s.enemy.dataVersion;migrateMonsterBattle();if(s.enemy.units[0].id!=='watcher'||s.enemy.dataVersion!==1)throw Error('old battle migration');migrateMonsterBattle();if(s.enemy.units[0].id!=='watcher')throw Error('repeat migration');
tests/game.cjs:186:}`);console.log('PASS monster floor pools, guardians, flee rewards, mixed victory, summon cap/timing, multi-hit/rear, spell/breath, statuses, instant death, drain, theft, resistances and save migration');
tests/game.cjs:195:s.cells.forEach(c=>{c.type='';c.trap=false;c.flag=false;c.open=true;delete c.chest});
dist/game.js:1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i));for(let n=0;n<10;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
dist/game.js:15:function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
dist/game.js:16:function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function hurt(n){s.hp=s.hp.map(h=>Math.max(0,h-n));if(s.hp.every(h=>h===0)){defeat()}}
dist/game.js:17:function cell(i,action='forward'){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;let c=s.cells[i];if(mode==='flag'){if(!c.open)c.flag=c.flag?false:(s.flagKind||'power');render();return}if(!adjacent(s.pos,i)){log('現在地の上下左右に隣接するマスを選んでください。');render();return}if(c.flag){log('旗のあるマスには移動できない。旗を外すと進めます。');render();return}tickAilments(false);if(s.done){render();return}let previous=s.pos,wasOpen=c.open;s.previousPos=previous;s.pos=i;if(c.type==='boss'&&!s.relic){c.open=true;s.pendingBoss={previous};log('守護者と戦いますか？');render();return}if(!c.open){c.open=true;if(c.trap){if(triggerFloorTrap(c)){render();return}}else log(num(i)?`警告：周囲に罠が${num(i)}個。`:'静かな部屋。周囲に罠はない。')}if(!s.done){if(c.type==='down'){s.pendingStairs='down';log(`地下${s.floor+1}階に移動しますか？`)}else if(c.type==='stairs'){s.pendingStairs=true;log(s.floor===1?'町に移動しますか？':`地下${s.floor-1}階に移動しますか？`)}else if(Math.random()<encounterRate(i,wasOpen,action))encounter(i,!wasOpen,action)}render()}
dist/game.js:31:function ensureStats(){if(!s.members){s.members=CLASSES.slice(0,3).map(c=>({level:1,xp:0,maxHP:c.hp,maxMP:c.mp,attack:c.attack,ac:c.ac}));s.mp=CLASSES.slice(0,3).map((c,i)=>i===1?Math.min(c.mp,(s.spell===undefined?c.mp:s.spell*SPELLS.blast.cost)):i===2?Math.min(c.mp,(s.heal===undefined?c.mp:s.heal*SPELLS.heal.cost)):0);if(s.area==='town')s.mp=s.members.map(m=>m.maxMP);delete s.spell;delete s.heal}s.mp??=s.members.map(m=>m.maxMP);if(s.enemy&&!s.enemy.units){let old=s.enemy,id=old.boss?'guardian':'skeleton';s.enemy={boss:old.boss,target:0,units:[{id,uid:0,hp:old.hp,rewarded:false}]}}}
dist/game.js:47:function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
dist/game.js:69:try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type='down'}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
dist/game.js:75:$('#resetopen').onclick=()=>$('#resetdialog').showModal();$('#resetcancel').onclick=()=>$('#resetdialog').close();$('#resetconfirm').onclick=()=>{s=null;fresh();s.area='town';s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);$('#resetdialog').close();render()};
dist/game.js:83:function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=dice(3,6,4).value;s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
dist/game.js:91:function travelFloor(next,fromTown=false){let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}
dist/game.js:100:function flee(){if(logBusy()||!s.enemy||s.done||s.enemy.boss||s.enemy.flagEffect?.bad)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}if(Math.random()*100<escapeChance()){let from=s.pos,to=s.enemy.escapeTo??s.previousPos??s.start;if(!adjacent(from,to)){to=around(from).find(i=>adjacent(from,i)&&s.cells[i].open&&!s.cells[i].trap)??from}s.enemy=null;s.pos=to;s.previousPos=from;log('逃走に成功。一歩前のマスへ戻った。')}else{log('逃走に失敗！');if(s.enemy.initiative==='party')s.enemy.initiative='normal';else enemyTurn(s.members.map(()=>'flee'))}render()}

exec
/bin/bash -lc 'cat dist/balance.js && cat docs/ARCHITECTURE.md' in /workspace/dungeonsweeper
 succeeded in 0ms:
// 調整用データ。ダイスは [個数, 面数, 固定加算]。
const CLASSES = [
 {id:'fighter',name:'戦士',hp:32,mp:0,attack:3,ac:6,hit:4,hpGrowth:[1,6,3],xpFactor:.8,mpGrowth:[0,1,0],attackEvery:1},
 {id:'mage',name:'魔法使い',hp:24,mp:20,attack:0,ac:9,hit:1,hpGrowth:[1,4,2],xpFactor:1.2,mpGrowth:[1,2,0],attackEvery:2},
 {id:'priest',name:'僧侶',hp:26,mp:15,attack:1,ac:7,hit:2,hpGrowth:[1,5,2],xpFactor:1,mpGrowth:[1,2,0],attackEvery:2},
 {id:'thief',name:'盗賊',hp:25,mp:0,attack:1,ac:8,hit:3,hpGrowth:[1,5,2],xpFactor:.85,mpGrowth:[0,1,0],attackEvery:2}
];
const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
const LEVEL_CAP=30;
// 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
function ensureProgression(){
 s.members.forEach((m,i)=>{
  if(m.xpTargets){
   if(m.xpCurveVersion!==2){
    let old=m.xpTargets.slice();
    for(let level=m.level+1;level<=LEVEL_CAP;level++)m.xpTargets[level]=m.xpTargets[level-1]+Math.round((old[level]-old[level-1])*1.15);
    m.xpCurveVersion=2;
   }
   return;
  }
  m.xpTargets=[0,0];
  for(let level=2;level<=LEVEL_CAP;level++){
   m.xpTargets[level]=level<=m.level?50*level*(level-1):
    m.xpTargets[level-1]+Math.round(115*(level-1)*memberClass(i).xpFactor*(.9+Math.random()*.2));
  }
  m.xpCurveVersion=2;
 });
}
const requiredXP=(level,i)=>s.members[i].xpTargets[level];

// 逃走判定用の敵レベル。本作の敵用の設定値。深層では階ごとに+2。
# 実装構成と保存

## ファイル

| パス | 役割 |
|---|---|
| dist/index.html | HTML全画面・CSS・dialog・script読込順 |
| dist/game.js | 中央状態s、迷宮生成、移動、戦闘、描画、保存、ログ、商店・宝箱 |
| dist/combatui.js | 順番コマンド、対象選択、行動確認 |
| dist/recruits.js | キャラクター生成、登録・編成・抹消、登録簿の保存復元 |
| dist/training.js | 訓練所のUIと確認ダイアログ |
| dist/party.js | 職業識別、6人移行、酒場、並べ替え、譲渡、装備概要、盗賊開封 |
| dist/balance.js | 職業、経験値曲線と移行 |
| dist/weapons.js | 武器17・防具9。防具もWEAPONS配列に追加 |
| dist/items.js | 薬2・消費・対象選択・スロット削除 |
| dist/spells.js | 呪文25・習得・MP・効果・選択UI |
| dist/flags.js | 旗種・発動・デバフ・ボタン |
| dist/traps.js | 床罠5種類 |
| data/monsters.csv | 敵31種類の編集正本 |
| scripts/compile-monsters.py | CSV検証・JS生成。固定IDは確定名に紐付く |
| dist/monster-data.js | 生成されたENEMIES。直接編集しない |
| dist/monsters.js | 敵特殊行動、戦闘終了、旧敵移行、解呪 |
| tests/game.cjs | Node vm＋簡易DOM＋タイマーによる回帰テスト |

ビルド不要、classic scriptのグローバル共有。index.htmlのscript順を維持。外部画像・フォント・CDN依存・バックエンドAPIなし。図形はSVGと文字。単独でdistフォルダを配信すれば動作する。

## 状態と保存

sが状態本体。localStorageのキー`ash-v1`にJSON保存。別端末・別ブラウザ・別ドメインとは共有しない。サーバーDB、アカウント別セーブ、クラウド同期はない。

- members：id,job,name,level,xp,maxHP,maxMP,str,ac,intelligence,piety,known,xpTargets等。
- hp,mp,inventory,equipped,armor,ailments：membersと同順の並行配列。装備はアイテムIDではなくinventory内の添字。
- reserve：控えのレコード。PARTY_FIELDSごとに1名分の状態を保持。
- floor,size,start,boss,pos,dir,cells：現在階。cellsはtrap,open,flag,type,spent,trapKind,chest等。
- floors：訪問階のマップ保存。帰還時破棄。
- enemy：units（id,uid,row,hp,rewarded,identified,sleep等）、boss,chestBattle,lootGold,pendingXP,pendingGold,pendingDrops,initiative,flagEffect等。
- commands,attackRows,magicPlans,itemPlans：選択した行動。UI側にcommandIndex等の一時変数もある。
- light,watchful,dumapicUses：帰還までの魔法状態。
- pendingBoss,pendingStairs,done,area：画面・イベント遷移のガード。

ensureProfile→ensureStats/ensureSixParty/ensureMagic/ensureProgression等が旧セーブを補完。migrateMonsterBattleは読込時の旧敵IDを移行する。初期状態生成と移行は同じではない。

## ログ同期

計算は同期で完了するが、log()でenemy・hp・mp・ailments・membersをstructuredCloneしキューへ格納。pumpLogが順番にdisplayCombat/displayVitalsへ適用。visibleCombat()はスナップショット優先。logBusy中は操作を抑止。ログ再生末尾で実状態へ復帰。

敵のhp=0とrewarded=trueは別の瞬間。ダメージログではまだ姿を残し、撃破ログで消す。enemyGroupsはrewardedのない列を表示順に詰める。rowは内部ID、indexが現在の表示位置。保存するのは実状態sで、ログ再生途中のキューは永続化しない。そのため途中リロード時は計算済みの結果で再開する。

## セーブを移す場合

このZIPに利用者のブラウザのlocalStorageは含まれない。開発用の空セーブから動く。元サイトの進行を移す必要がある場合は、別途セーブのエクスポート／インポート機能を追加すること。現時点で既存の機能と説明してはいけない。

## テストの限界

tests/game.cjsはブラウザではない。DOMの見た目、タッチ操作、dialogのフォーカス、スクロール、モバイルサイズは実ブラウザで確認が必要。テストのPASSは原作仕様の正しさや全ての境界条件を証明しない。

## 訓練所導入後の保存形式

`rosterVersion: 1` のセーブは `roster` に全登録者のPARTY_FIELDSレコードを保存し、`partyIds` に参加者のIDを隊列順に保存する。保存時に従来のmembers/hp等とreserveは重複して書き込まない。`restoreRoster` は起動時に戦闘処理が使用する並行配列と控えに復元する。実行中は既存処理がこれらの配列を更新し、保存時に最新値から登録簿を組み立てるため、戦闘・装備・レベルアップ後の値を失わない。

新規ゲームは空のパーティから開始。旧形式は既存の移行経路で読み取れるが、新機能は旧データ破棄を必要としない。迷宮再生成で登録者を初期化しない。生成時STRはbaseStrとして記録し、成長・レベル吸収に使用する。

`node tests/training.cjs` は生成範囲・400人のID/個体差・編成・装備保持・保存復元・成長/吸収・戦闘/呪文・全員抹消を検証。`tests/training-browser.py` は実Chromiumで訓練所操作と戦闘コマンド、保存復元、空パーティの導線をPC/スマートフォン幅で検証する。

exec
/bin/bash -lc "rg -n \"balance.js|trapCount|s\\.size|fresh\\(\" dist/index.html dist tests" in /workspace/dungeonsweeper
 succeeded in 0ms:
tests/training.cjs:28: assert(values.size>1);
dist/game.js:1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i));for(let n=0;n<10;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
dist/game.js:41:function ensureProfile(){ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members)migrateStrength(r.members,r.members.job??0);ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
dist/game.js:47:function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
dist/game.js:69:try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type='down'}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
dist/game.js:75:$('#resetopen').onclick=()=>$('#resetdialog').showModal();$('#resetcancel').onclick=()=>$('#resetdialog').close();$('#resetconfirm').onclick=()=>{s=null;fresh();s.area='town';s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);$('#resetdialog').close();render()};
dist/game.js:90:function rememberFloor(){s.floors??={};s.floors[s.floor]={floor:s.floor,size:s.size,cells:structuredClone(s.cells),start:s.start,boss:s.boss,relic:s.relic};}
dist/game.js:91:function travelFloor(next,fromTown=false){let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}
dist/index.html:27:<dialog id="inventorydialog" aria-labelledby="inventorytitle"><div class="dialoghead"><h2 id="inventorytitle"></h2><button id="inventoryclose" aria-label="閉じる">×</button></div><div id="equipmentsummary"></div><details id="transfersection"><summary>アイテムを渡す</summary><label>アイテム<select id="transferitem"></select></label><label>渡す相手<select id="transfermember"></select></label><button id="transfergive">渡す</button><p id="transfernotice" role="status"></p></details><div id="inventoryslots"></div></dialog><button id="maptoggle" aria-haspopup="dialog" aria-label="迷宮の地図を開く">▦ 地図</button><dialog id="mapdialog" aria-label="迷宮の地図"><div class="dialoghead"><span>地図</span><button id="mapclose" aria-label="地図を閉じる">×</button></div><div id="mapdialogbody"></div></dialog><dialog id="statsdialog" aria-labelledby="statstitle"><div class="dialoghead"><h2 id="statstitle">パーティー</h2><span id="status"></span><button id="partyreorder">順番変更</button><button id="statsclose" aria-label="閉じる">×</button></div><div id="partyorder" hidden></div><div id="statsbody"></div></dialog><dialog id="catalogdialog" aria-labelledby="catalogtitle"><div class="dialoghead"><h2 id="catalogtitle">敵データ一覧</h2><button id="catalogclose" aria-label="閉じる">×</button></div><div id="catalogbody"></div></dialog><dialog id="resetdialog"><h2>冒険データをリセットしますか？</h2><p>レベル・経験値・アイテム・装備・金貨・迷宮の進行を初期化します。元に戻せません。</p><button id="resetcancel">キャンセル</button><button id="resetconfirm">リセットを実行</button></dialog><dialog id="magicdialog" aria-labelledby="magictitle"><div class="dialoghead"><h2 id="magictitle"></h2><button id="magicclose" aria-label="閉じる">×</button></div><div id="magiclist"></div><div class="magicfooter"><div id="magictargets"></div><p id="magicnotice" role="status"></p><button id="magiccast" hidden>発動する</button></div></dialog><dialog id="medicinedialog" aria-labelledby="medicinetitle"><div class="dialoghead"><h2 id="medicinetitle">薬</h2><button id="medicineclose" aria-label="閉じる">×</button></div><label>薬 <select id="medicineitem"></select></label><p id="medicinedescription"></p><label>対象 <select id="medicinetarget"></select></label><button id="medicineuse">使う</button></dialog><dialog id="taverndialog" aria-labelledby="taverntitle"><div class="dialoghead"><h2 id="taverntitle">酒場</h2><button id="tavernclose" aria-label="閉じる">×</button></div><div id="tavernslots"></div><p class="tavernhint">空きを除いた先頭3人が前衛、続く3人が後衛になります。</p><button id="tavernsave">この編成にする</button></dialog><dialog id="leveldialog" aria-labelledby="leveltitle"><div class="dialoghead"><h2 id="leveltitle">レベルアップ</h2><button id="levelclose" aria-label="閉じる">×</button></div><div id="levelreport"></div></dialog><dialog id="training" aria-labelledby="trainingtitle"><div class="dialoghead"><h2 id="trainingtitle">訓練所</h2><button id="trainingclose" aria-label="訓練所を閉じる">×</button></div><h3>新規作成</h3><div class="recruit-fields"><label>名前<input id="recruitname" maxlength="20" autocomplete="off"></label><label>職業<select id="recruitjob"><option value="0">戦士</option><option value="2">僧侶</option><option value="1">魔法使い</option><option value="3">盗賊</option></select></label></div><p>職業に適した基本能力に3〜9点を自動配分します。能力値の上限は18です。</p><button id="rollrecruit">生成・再生成</button><div id="recruitpreview" aria-live="polite"></div><button id="registerrecruit" disabled>この能力で登録</button><p id="trainingnotice" role="status"></p><h3>登録メンバー・パーティ編成</h3><p id="trainingcount"></p><div id="recruitlist"></div></dialog><dialog id="recruitdeletedialog" aria-labelledby="recruitdeletetitle"><h2 id="recruitdeletetitle">登録抹消の確認</h2><p id="recruitdeletename"></p><button id="recruitdeletecancel" autofocus>キャンセル</button><button id="recruitdeleteconfirm">登録を抹消する</button></dialog></main><script src="weapons.js"></script><script src="monster-data.js"></script><script src="balance.js"></script><script src="spells.js"></script><script src="items.js"></script><script src="flags.js"></script><script src="traps.js"></script><script src="combatui.js"></script><script src="party.js"></script><script src="monsters.js"></script><script src="recruits.js"></script><script src="game.js"></script><script src="training.js"></script></html>
tests/game.cjs:1:const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
tests/game.cjs:7:drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
tests/game.cjs:10:drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');
tests/game.cjs:13:drain();run(`var escapeOriginalMembers=structuredClone(s.members),escapeOriginalHP=s.hp.slice(),escapeOriginalAilments=structuredClone(s.ailments);fresh(1);s.members=Array.from({length:6},(_,i)=>({...structuredClone(s.members[i%3]),level:1}));s.hp=Array(6).fill(20);s.ailments=Array.from({length:6},()=>({poison:false,paralysis:0}));s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'wolf',uid:0,hp:20}]};if(escapeChance()!==45)throw Error('escape six level 1 vs level 2');s.members.forEach(m=>m.level=10);if(escapeChance()!==90)throw Error('escape six level 10 vs level 2');s.members=s.members.slice(0,1);s.hp=s.hp.slice(0,1);s.ailments=s.ailments.slice(0,1);s.members[0].level=1;if(escapeChance()!==60)throw Error('escape one level 1 vs level 2');s.members[0].level=20;if(escapeChance()!==95)throw Error('escape upper clamp');s.hp[0]=0;if(escapeChance()!==10)throw Error('escape no eligible party');s.hp[0]=20;s.members[0].level=1;s.enemy.units[0].id='goblin';if(escapeChance()!==60)throw Error('escape one level 1 vs level 2 after eligibility restore');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members[0].level=20;s.enemy.units[0].id='wolf';if(escapeChance()!==95)throw Error('escape clamp at 95');Math.random=()=>0;var oldGold=s.gold;flee();if(s.enemy||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape');s.members=escapeOriginalMembers;s.hp=escapeOriginalHP;s.ailments=escapeOriginalAilments`);console.log('PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction');
tests/game.cjs:76:s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
tests/game.cjs:92:s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;fresh(1);s.cells.forEach(c=>{c.trap=false;c.flag=false;c.chest=undefined});
dist/index.html:27:<dialog id="inventorydialog" aria-labelledby="inventorytitle"><div class="dialoghead"><h2 id="inventorytitle"></h2><button id="inventoryclose" aria-label="閉じる">×</button></div><div id="equipmentsummary"></div><details id="transfersection"><summary>アイテムを渡す</summary><label>アイテム<select id="transferitem"></select></label><label>渡す相手<select id="transfermember"></select></label><button id="transfergive">渡す</button><p id="transfernotice" role="status"></p></details><div id="inventoryslots"></div></dialog><button id="maptoggle" aria-haspopup="dialog" aria-label="迷宮の地図を開く">▦ 地図</button><dialog id="mapdialog" aria-label="迷宮の地図"><div class="dialoghead"><span>地図</span><button id="mapclose" aria-label="地図を閉じる">×</button></div><div id="mapdialogbody"></div></dialog><dialog id="statsdialog" aria-labelledby="statstitle"><div class="dialoghead"><h2 id="statstitle">パーティー</h2><span id="status"></span><button id="partyreorder">順番変更</button><button id="statsclose" aria-label="閉じる">×</button></div><div id="partyorder" hidden></div><div id="statsbody"></div></dialog><dialog id="catalogdialog" aria-labelledby="catalogtitle"><div class="dialoghead"><h2 id="catalogtitle">敵データ一覧</h2><button id="catalogclose" aria-label="閉じる">×</button></div><div id="catalogbody"></div></dialog><dialog id="resetdialog"><h2>冒険データをリセットしますか？</h2><p>レベル・経験値・アイテム・装備・金貨・迷宮の進行を初期化します。元に戻せません。</p><button id="resetcancel">キャンセル</button><button id="resetconfirm">リセットを実行</button></dialog><dialog id="magicdialog" aria-labelledby="magictitle"><div class="dialoghead"><h2 id="magictitle"></h2><button id="magicclose" aria-label="閉じる">×</button></div><div id="magiclist"></div><div class="magicfooter"><div id="magictargets"></div><p id="magicnotice" role="status"></p><button id="magiccast" hidden>発動する</button></div></dialog><dialog id="medicinedialog" aria-labelledby="medicinetitle"><div class="dialoghead"><h2 id="medicinetitle">薬</h2><button id="medicineclose" aria-label="閉じる">×</button></div><label>薬 <select id="medicineitem"></select></label><p id="medicinedescription"></p><label>対象 <select id="medicinetarget"></select></label><button id="medicineuse">使う</button></dialog><dialog id="taverndialog" aria-labelledby="taverntitle"><div class="dialoghead"><h2 id="taverntitle">酒場</h2><button id="tavernclose" aria-label="閉じる">×</button></div><div id="tavernslots"></div><p class="tavernhint">空きを除いた先頭3人が前衛、続く3人が後衛になります。</p><button id="tavernsave">この編成にする</button></dialog><dialog id="leveldialog" aria-labelledby="leveltitle"><div class="dialoghead"><h2 id="leveltitle">レベルアップ</h2><button id="levelclose" aria-label="閉じる">×</button></div><div id="levelreport"></div></dialog><dialog id="training" aria-labelledby="trainingtitle"><div class="dialoghead"><h2 id="trainingtitle">訓練所</h2><button id="trainingclose" aria-label="訓練所を閉じる">×</button></div><h3>新規作成</h3><div class="recruit-fields"><label>名前<input id="recruitname" maxlength="20" autocomplete="off"></label><label>職業<select id="recruitjob"><option value="0">戦士</option><option value="2">僧侶</option><option value="1">魔法使い</option><option value="3">盗賊</option></select></label></div><p>職業に適した基本能力に3〜9点を自動配分します。能力値の上限は18です。</p><button id="rollrecruit">生成・再生成</button><div id="recruitpreview" aria-live="polite"></div><button id="registerrecruit" disabled>この能力で登録</button><p id="trainingnotice" role="status"></p><h3>登録メンバー・パーティ編成</h3><p id="trainingcount"></p><div id="recruitlist"></div></dialog><dialog id="recruitdeletedialog" aria-labelledby="recruitdeletetitle"><h2 id="recruitdeletetitle">登録抹消の確認</h2><p id="recruitdeletename"></p><button id="recruitdeletecancel" autofocus>キャンセル</button><button id="recruitdeleteconfirm">登録を抹消する</button></dialog></main><script src="weapons.js"></script><script src="monster-data.js"></script><script src="balance.js"></script><script src="spells.js"></script><script src="items.js"></script><script src="flags.js"></script><script src="traps.js"></script><script src="combatui.js"></script><script src="party.js"></script><script src="monsters.js"></script><script src="recruits.js"></script><script src="game.js"></script><script src="training.js"></script></html>

2026-11-01T17:57:37.358556Z ERROR codex_core::tools::router: error=apply_patch verification failed: Failed to find expected lines in /workspace/dungeonsweeper/dist/game.js:
function fresh(floor=1){let profile=s?{gold:s.gold,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i));for(let n=0;n<10;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('dist/balance.js'); s=p.read_text(); s=s.replace('const LEVEL_CAP=30;','const LEVEL_CAP=30;\\nfunction trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}'); p.write_text(s)
p=Path('dist/game.js'); s=p.read_text(); old='let pool=s.cells.map((_,i)=>i).filter(i=>"'!safe.has(i));for(let n=0;n<10;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}'"'; new='let pool=s.cells.map((_,i)=>i).filter(i=>"'!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}'"'; assert old in s; p.write_text(s.replace(old,new))
p=Path('docs/SPECIFICATION.md'); s=p.read_text(); assert '罠は各階10個。' in s; p.write_text(s.replace('罠は各階10個。','罠数は1F=9、2F=15、3F=23。階層・盤面サイズに応じて増え、盤面の22%を上限とする。'))
p=Path('tests/game.cjs'); s=p.read_text(); needle=\"drain();run("'`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='"'dungeon';fresh(1);s.scan=2;\"; assert needle in s; test=\"drain();run("'`for(let floor of [1,2,3]){let expected=[9,15,23][floor-1],boardSize=6+floor*2;if(trapCount(floor,boardSize)!==expected)throw Error('"'trap count formula');for(let trial=0;trial<1000;trial++){fresh(floor);if(s.cells.filter(c=>c.trap).length"'!==expected)throw Error('"'generated trap count');let path=[s.start],p=s.start;while(p"'!==s.boss){let choices=[];if(p%size()!==s.boss%size())choices.push(p+(p%size()<s.boss%size()?1:-1));if((p/size()|0)!==(s.boss/size()|0))choices.push(p+(p<s.boss?size():-size()));p=choices.find(i=>i===s.boss||!s.cells[i].trap);if(p===undefined)throw Error('"'trapped guardian path');path.push(p)}if([s.start,...around(s.start),...path].some(i=>s.cells[i].trap))throw Error('unsafe start/guardian path')}}"'`);drain();console.log('"'PASS floor trap counts and 1000 generated maps per floor preserve start area and guardian path');\\n\"; p.write_text(s.replace(needle,test+needle))
PY
" in /workspace/dungeonsweeper
 succeeded in 0ms:
codex
罠数関数と生成処理を追加し、各階の期待数・生成地図の安全性を確認する回帰テストを入れました。指定された共通テストを実行します。
exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
 succeeded in 1116ms:
PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log
PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration
PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling
PASS direct chest, once-only rewards, poison, paralysis, town cure
PASS floor trap counts and 1000 generated maps per floor preserve start area and guardian path
PASS floor round trips, exploration persistence, charge persistence and town entrance
PASS mandatory chest decision, abandonment without reward, legacy score cleanup
PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction
PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp
PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth
PASS single/group/last kill log synchronization, guard and spell reset, log colors and escaping
PASS strafe all directions, orientation, walls, battle/stairs locks, spell color, compact party and title visibility
PASS three rows, independent member targeting, group spell isolation, hidden exploration controls, medicine effects, slot shifts, battle action/reset, drops and save compatibility
PASS guardian gates / same-tile stairs, floor round trips and town reset, profile retention, XP +15% migration once, first living target and empty-row action
PASS typed flags, independent procs, no recoloring, half MP in combat and field, exclusive curses
PASS 0.5-50% flags, five floor traps, safe teleport and sequential command entry/review
PASS automatic single-row targets, battle spell modal closure and main-screen targets, field spell placement, linked flag labels
PASS review table, back to final member, hidden flee in review, aligned target grid
PASS chest Calfo availability, all-facing diagonal sight and wall boundaries
PASS six-person defaults/migration, reordered jobs and gear, bench/restore/save, doubled survey/accuracy/reset, thief success/failure, front/rear combat and six XP/commands
PASS item transfer/capacity/equipped guard, slot remapping, field reorder identity, combat locks and party entry
PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, 0.5-50% curve
PASS failed escape consumes party surprise without enemy retaliation
PASS status tags follow displayed HP/ailments through damage and recovery
PASS ranged shop/class/rear damage/UI, melee rear restriction, battle survey disabled/no spend and once-per-return level popup
PASS trap warning before damage and chest reveal after log playback
PASS STR migration and per-swing attack count
PASS physical row hit thresholds 10/13/16 (50%/35%/20%) and collapse with stable row IDs
PASS special character names do not break log coloring or match as regex
PASS silent exploration poison and deferred victory rewards
PASS identification failure, success, persistence and spell effect
PASS monster floor pools, guardians, flee rewards, mixed victory, summon cap/timing, multi-hit/rear, spell/breath, statuses, instant death, drain, theft, resistances and save migration
PASS dispel success/failure, undead only, no MP or XP
PASS exploration poison death once with HP snapshot, silent nonfatal movement and combat poison logs
PASS magic plans pad to party length and preserve legacy three-member saves
PASS chest item pool price cap and 10,000 floor 1 draws
PASS chest item unusable, full inventory and normal receipt logs
PASS XP split 100/3=33, 100/1=100, dead exclusion, minimum 1, zero reward, no survivors, per-person log and duplicate guard
PASS new game starts empty; dungeon blocked
PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation
PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload
PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration
PASS deletion including last active member and empty save reload
31 monster definitions validated

codex
共通テストはすべて通過しました。最後に差分を確認し、変更が罠数調整とその仕様・テストに収まっているか確認します。
exec
/bin/bash -lc 'git diff --stat && git diff -- dist/balance.js dist/game.js docs/SPECIFICATION.md tests/game.cjs' in /workspace/dungeonsweeper
 succeeded in 0ms:
 dist/balance.js       | 1 +
 dist/game.js          | 2 +-
 docs/SPECIFICATION.md | 2 +-
 tests/game.cjs        | 1 +
 4 files changed, 4 insertions(+), 2 deletions(-)
diff --git a/dist/balance.js b/dist/balance.js
index fd656cd..bbca6a0 100644
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -7,6 +7,7 @@ const CLASSES = [
 ];
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
+function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
 function ensureProgression(){
  s.members.forEach((m,i)=>{
diff --git a/dist/game.js b/dist/game.js
index 955629a..aea9014 100644
--- a/dist/game.js
+++ b/dist/game.js
@@ -1,4 +1,4 @@
-const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i));for(let n=0;n<10;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
+const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
 function enemyDefinition(id){return ENEMIES.find(e=>e.id===id)||ENEMIES[0]}
 const UNKNOWN_NAMES=Object.fromEntries(ENEMIES.map(e=>[e.id,e.unknown]));
 function enemyDisplay(e){return e?.identified?enemyDefinition(e.id).name:(UNKNOWN_NAMES[e?.id]||'正体不明')}
diff --git a/docs/SPECIFICATION.md b/docs/SPECIFICATION.md
index aa14606..d635a76 100644
--- a/docs/SPECIFICATION.md
+++ b/docs/SPECIFICATION.md
@@ -6,7 +6,7 @@
 
 町（酒場・鍛冶屋・迷宮入口）→探索→遭遇／宝箱／守護者→階段で上下移動→町。
 1Fは8×8、2Fは10×10、3F以降12×12。上下左右の隣接移動、左右旋回、後退、左右横移動。盤面クリックは旗の操作で、任意マスへ移動する操作ではない。
-開始位置と守護者位置は乱数。チェビシェフ距離2以内（縦横の最大差が2以下）には守護者を置かない。開始位置の周囲と、守護者までの生成経路は安全。罠は各階10個。
+開始位置と守護者位置は乱数。チェビシェフ距離2以内（縦横の最大差が2以下）には守護者を置かない。開始位置の周囲と、守護者までの生成経路は安全。罠数は1F=9、2F=15、3F=23。階層・盤面サイズに応じて増え、盤面の22%を上限とする。
 守護者マスへ入ると確認。いいえで直前マスへ戻る。撃破後その場所が下り階段になる。各階に固有守護者、4F以降は3F設定を使用。
 上り階段は一つ前の階へ。1Fからのみ町へ。階段で「いいえ」はその場に留まり、同じマスに居続けても再発火しない。
 同じ探索中は各階の探索状況を維持。町へ帰ると全階の記録を破棄し、新しいランダム迷宮にする。スコアとスコア履歴は廃止済み。
diff --git a/tests/game.cjs b/tests/game.cjs
index 6b6e8a4..dbd71bf 100644
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -7,6 +7,7 @@ console.log('PASS XP deferred to town, multi-level growth, full refill, persiste
 drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
 drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.cells[s.pos].chest={gold:7,opened:false,trap:'none'};s.scan=2;var oldgold=s.gold;Math.random=()=>.99;openChest(true);if(s.gold!==oldgold+21||currentChest())throw Error('safe chest');`);drain();run(`openChest(false);if(s.gold!==oldgold+21)throw Error('double chest');s.cells[s.pos].chest={gold:9,opened:false};s.scan=0;if(!currentChest())throw Error('new chest');s.hp=[32,24,26];afflict(0,'poison');tickAilments();if(s.hp[0]!==30)throw Error('poison');afflict(1,'paralysis');tickAilments();if(s.ailments[1].paralysis!==3)throw Error('paralysis');`);drain();run(`abandonChest()`);drain();run(`enterTown();if(s.ailments.some(a=>a.poison||a.paralysis))throw Error('town cure');`);console.log('PASS direct chest, once-only rewards, poison, paralysis, town cure');
 
+drain();run(`for(let floor of [1,2,3]){let expected=[9,15,23][floor-1],boardSize=6+floor*2;if(trapCount(floor,boardSize)!==expected)throw Error('trap count formula');for(let trial=0;trial<1000;trial++){fresh(floor);if(s.cells.filter(c=>c.trap).length!==expected)throw Error('generated trap count');let path=[s.start],p=s.start;while(p!==s.boss){let choices=[];if(p%size()!==s.boss%size())choices.push(p+(p%size()<s.boss%size()?1:-1));if((p/size()|0)!==(s.boss/size()|0))choices.push(p+(p<s.boss?size():-size()));p=choices.find(i=>i===s.boss||!s.cells[i].trap);if(p===undefined)throw Error('trapped guardian path');path.push(p)}if([s.start,...around(s.start),...path].some(i=>s.cells[i].trap))throw Error('unsafe start/guardian path')}}`);drain();console.log('PASS floor trap counts and 1000 generated maps per floor preserve start area and guardian path');
 drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');
 
 drain();run(`s.area='dungeon';s.cells[s.pos].chest={gold:100,opened:false};var chestPos=s.pos,chestGold=s.gold;move('forward');if(s.pos!==chestPos)throw Error('chest movement');abandonChest();if(currentChest()||s.gold!==chestGold)throw Error('abandon');`);drain();run(`if(s.cells[chestPos].chest)throw Error('chest remains');s.score={total:100};s.history=[{}];s.immediateChestVersion=0;ensureProfile();if('score' in s||'history' in s)throw Error('legacy cleanup');`);console.log('PASS mandatory chest decision, abandonment without reward, legacy score cleanup');

codex
完了しました。**変更した挙動と回帰テストは実装済み**です。

- [dist/balance.js](/workspace/dungeonsweeper/dist/balance.js)、[dist/game.js](/workspace/dungeonsweeper/dist/game.js)：階層と盤面サイズに応じて罠数を決め、配置可能数を超えないようにしました。1F=9、2F=15、3F=23個です。
- [tests/game.cjs](/workspace/dungeonsweeper/tests/game.cjs)：各階1000回の生成で罠数と開始周囲・守護者への経路の安全性を確認します。
- [docs/SPECIFICATION.md](/workspace/dungeonsweeper/docs/SPECIFICATION.md)：現行の罠数を記載しました。

`node tests/game.cjs`、`node tests/training.cjs`、`python3 scripts/compile-monsters.py --check` はすべてPASSです。ブラウザでの手動確認は未実施です。
tokens used
41,972
完了しました。**変更した挙動と回帰テストは実装済み**です。

- [dist/balance.js](/workspace/dungeonsweeper/dist/balance.js)、[dist/game.js](/workspace/dungeonsweeper/dist/game.js)：階層と盤面サイズに応じて罠数を決め、配置可能数を超えないようにしました。1F=9、2F=15、3F=23個です。
- [tests/game.cjs](/workspace/dungeonsweeper/tests/game.cjs)：各階1000回の生成で罠数と開始周囲・守護者への経路の安全性を確認します。
- [docs/SPECIFICATION.md](/workspace/dungeonsweeper/docs/SPECIFICATION.md)：現行の罠数を記載しました。

`node tests/game.cjs`、`node tests/training.cjs`、`python3 scripts/compile-monsters.py --check` はすべてPASSです。ブラウザでの手動確認は未実施です。
