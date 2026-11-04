OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-luna
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: low
reasoning summaries: none
session id: 01a198a0-20a5-7c93-88f6-0fbdba6cca24
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
# 017c-bugfix-sim-gear-ignored
ティア：LIGHT　依存：017b（eee76ad）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- このファイルの「変更内容」以外は変更しない。変更した挙動には回帰テストを追加する。npm依存を追加しない。
- 報告は日本語で簡潔に書く。

## バグ
017b で追加した `--gear shop|drop` が結果に効いていない。固定seedで `--gear` なし／shop／drop の結果が完全一致する。
- 例：`--jobs 0,0,2,3,1,2 --level 9 --floor 4 --n 30` と、同じ条件に `--gear drop` を付けたもので、averageRounds まで同じ値になる。
- 原因：scripts/sim/combat.cjs の `createParty` が、装備前に `simBase = structuredClone(partyRecords())` を保存している。`prepareTrial` は毎試行、この simBase から PARTY_FIELDS（inventory/equipped/armor を含む）を復元する。そのため、`gearParty` で付けた装備が毎回消える。

## 変更内容
- 装備が試行ごとの復元に含まれるようにする。たとえば `gearParty` の最後で simBase を取り直す。
- 試行ごとの成長リセット（Lv1基準への復元）は今までどおりに保つ。
- selftest に回帰テストを追加する。内容：`--gear drop` を付けると、少なくとも1つの条件で、`--gear` なしと結果（または装備後の攻撃力・AC）が異なる。また、prepareTrial 後も装備が残っている。

## OKの判定方法
- `node scripts/sim/selftest.cjs`、tests/game.cjs、tests/training.cjs がPASSする。
- `--level 9 --floor 4 --n 30` で、`--gear drop` の結果が `--gear` なしと異なる。
- `--gear` 指定なしの結果が変更前と同一になる（固定seed）。


## 追加OK条件（試遊より）
- 固定seedで --gear なし / shop / drop の結果がそれぞれ異なること
- Lv15・10F守護者で --gear drop の勝率が装備なしより大幅に上がること（数値を報告に記載）

codex
指示書に沿って、まず必読ドキュメントとシミュレータ実装を確認し、装備の復元経路と既存seed結果を特定してから、対象箇所だけ直して指定テストを実行します。
exec
/bin/bash -lc "pwd && rg --files -g 'AGENTS.md' -g 'README*' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g 'scripts/sim/**' -g 'tests/**'" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
AGENTS.md
README.md
scripts/sim/harness.cjs
scripts/sim/combat.cjs
scripts/sim/selftest.cjs
tests/training.cjs
tests/game.cjs
tests/training-browser.py
data/README.md
docs/SPECIFICATION.md
docs/HANDOFF.md

exec
/bin/bash -lc 'cat AGENTS.md && cat README.md && cat docs/HANDOFF.md && cat docs/SPECIFICATION.md' in /workspace/dungeonsweeper
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

codex
必読資料を確認しました。シミュレータの初期化順とCLIの固定seed条件を読み、まず装備なし結果を記録してから修正に入ります。
exec
/bin/bash -lc "sed -n '1,260p' scripts/sim/combat.cjs && sed -n '1,280p' scripts/sim/selftest.cjs && sed -n '1,240p' scripts/sim/harness.cjs" in /workspace/dungeonsweeper
 succeeded in 0ms:
#!/usr/bin/env node
const { game } = require('./harness.cjs');

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!['--jobs', '--level', '--floor', '--n', '--boss', '--gear'].includes(key)) throw Error(`不明な引数: ${key}`);
    if (Object.hasOwn(out, key.slice(2))) throw Error(`重複した引数: ${key}`);
    if (key === '--boss') { out.boss = true; continue; }
    if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`値が必要です: ${key}`);
    out[key.slice(2)] = argv[++i];
  }
  if (!/^[0-3](,[0-3]){0,5}$/.test(out.jobs || '')) throw Error('--jobs は0〜3の職業IDを1〜6個指定してください');
  const jobs = out.jobs.split(',').map(Number);
  const level = Number(out.level), floor = Number(out.floor), n = Number(out.n);
  if (!Number.isInteger(level) || level < 1 || level > 30) throw Error('--level は1〜30で指定してください');
  if (!Number.isInteger(floor) || floor < 1 || floor > 10) throw Error('--floor は1〜10で指定してください');
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw Error('--n は1〜100000で指定してください');
  if (out.gear !== undefined && !['shop', 'drop'].includes(out.gear)) throw Error('--gear はshopまたはdropで指定してください');
  return { jobs, level, floor, n, boss: !!out.boss, gear: out.gear };
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

function gearParty(g, floor, gear) {
  if (!gear) return;
  g.run(`(() => {
    const items = WEAPONS.filter(w => (w.minFloor || 1) <= ${floor} && (${gear === 'drop' ? 'true' : 'w.shop !== false'}));
    const score = w => w.dice ? w.dice[0] * (w.dice[1] + 1) / 2 + w.dice[2] + (w.hitBonus || 0) * 0.5 : 0;
    for (let i = 0; i < s.members.length; i++) {
      const job = jobOf(i), rear = i >= 3;
      const weapons = items.filter(w => w.dice && w.classes.includes(job) && (!rear || w.range === 'ranged'));
      weapons.sort((a,b) => score(b) - score(a) || a.price - b.price);
      if (weapons[0]) { s.inventory[i].push(weapons[0].id); s.equipped[i] = s.inventory[i].length - 1; }
      const armor = items.filter(w => w.part && w.classes.includes(job));
      for (const part of ['head','body','feet']) {
        const candidates = armor.filter(w => w.part === part).sort((a,b) => b.ac - a.ac || a.price - b.price);
        if (candidates[0]) { s.inventory[i].push(candidates[0].id); s.armor[i][part] = s.inventory[i].length - 1; }
      }
    }
  })()`);
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
  gearParty(g, opt.floor, opt.gear);
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
module.exports = { args, simulate, seededRandom, createParty, gearParty, prepareTrial, planTurn, resolveBattle };
// Kept beside the simulator because task 010 explicitly excludes tests/ edits.
const assert = require('node:assert/strict');
const { game } = require('./harness.cjs');
const { args, simulate, seededRandom, createParty, gearParty, prepareTrial, planTurn, resolveBattle } = require('./combat.cjs');
const opt = args(['--jobs','0,0,2,3,1,2','--level','1','--floor','3','--n','2']);
for (const argv of [[], ['--jobs',''], ['--jobs','0,'], ['--wat','1'], ['--boss','--boss'],
  ['--jobs','0','--level','1','--floor','11','--n','1'], ['--gear','bad']]) assert.throws(() => args(argv));
const floor10 = args(['--jobs','0,0,2,3,1,2','--level','15','--floor','10','--boss','--gear','drop','--n','1']);
assert.equal(floor10.floor, 10);
assert.equal(floor10.gear, 'drop');

const g = game(null, seededRandom());
createParty(g, opt.jobs);
assert.equal(g.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
assert.equal(g.run('s.reserve.length'), 0);
assert.equal(g.run('s.inventory.every(a => a.length === 1)'), true, 'gear omitted must retain starter inventory');
gearParty(g, 10, 'drop');
assert.equal(g.run("s.inventory[0].map(id=>weapon(id).name).includes('聖剣')"), true, 'drop gear should consider minFloor 9 equipment');
assert.equal(g.run("s.inventory[3].map(id=>weapon(id).name).some(n=>['魔弓','竜骨の弓'].includes(n))"), true, 'rear thief should receive a ranged weapon');
const shopGear = game(null, seededRandom());
createParty(shopGear, opt.jobs);
gearParty(shopGear, 10, 'shop');
assert.equal(shopGear.run("s.inventory[0].map(id=>weapon(id).name).includes('炎の剣')"), false, 'shop gear excludes shop:false items');
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
assert.deepEqual(simulate({...opt, gear: undefined}), report, 'omitted gear keeps the original deterministic result');
assert(Object.values(simulate(floor10)).every(Number.isFinite), 'floor 10 boss simulation with drop gear must run');
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

codex
原因と修正点が一致しています。既存テストには装備の毎試行リセット確認がないので、`gearParty` 後の基準スナップショット更新と、試行復元後の装備保持・装備別シミュレーション差分を `selftest` に加えます。
exec
/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 9 --floor 4 --n 30 && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 9 --floor 4 --n 30 --gear shop && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 9 --floor 4 --n 30 --gear drop' in /workspace/dungeonsweeper
 succeeded in 6357ms:
{"winRate":1,"wipeRate":0,"deathsPerBattle":0,"hpLossRate":0.07602956529180015,"averageRounds":2.8333333333333335}
{"winRate":1,"wipeRate":0,"deathsPerBattle":0,"hpLossRate":0.07602956529180015,"averageRounds":2.8333333333333335}
{"winRate":1,"wipeRate":0,"deathsPerBattle":0,"hpLossRate":0.07602956529180015,"averageRounds":2.8333333333333335}

apply patch
patch: completed
/workspace/dungeonsweeper/scripts/sim/combat.cjs
diff --git a/scripts/sim/combat.cjs b/scripts/sim/combat.cjs
index b2bded3434fd5e46a81e4c978ffd254afec0b99e..150a08b838ae28b7a956a40ac730addfc0d6524c
--- a/scripts/sim/combat.cjs
+++ b/scripts/sim/combat.cjs
@@ -88,6 +88,9 @@
       }
     }
   })()`);
+  // Keep the selected loadout when prepareTrial restores party state.
+  // The snapshot is taken after equipping, while growth is still reset from Lv1 each trial.
+  g.run('simBase = structuredClone(partyRecords())');
 }
 
 function planTurn(g) {

apply patch
patch: completed
/workspace/dungeonsweeper/scripts/sim/selftest.cjs
diff --git a/scripts/sim/combat.cjs b/scripts/sim/combat.cjs
index b2bded3434fd5e46a81e4c978ffd254afec0b99e..150a08b838ae28b7a956a40ac730addfc0d6524c
--- a/scripts/sim/combat.cjs
+++ b/scripts/sim/combat.cjs
@@ -88,6 +88,9 @@
       }
     }
   })()`);
+  // Keep the selected loadout when prepareTrial restores party state.
+  // The snapshot is taken after equipping, while growth is still reset from Lv1 each trial.
+  g.run('simBase = structuredClone(partyRecords())');
 }
 
 function planTurn(g) {
diff --git a/scripts/sim/selftest.cjs b/scripts/sim/selftest.cjs
index ab4e5e2ff014ad35b8dd46e20f752414d6f46072..afc69bb778e1d1eca5b8fdddcfeb8250685e3176
--- a/scripts/sim/selftest.cjs
+++ b/scripts/sim/selftest.cjs
@@ -17,10 +17,19 @@
 gearParty(g, 10, 'drop');
 assert.equal(g.run("s.inventory[0].map(id=>weapon(id).name).includes('聖剣')"), true, 'drop gear should consider minFloor 9 equipment');
 assert.equal(g.run("s.inventory[3].map(id=>weapon(id).name).some(n=>['魔弓','竜骨の弓'].includes(n))"), true, 'rear thief should receive a ranged weapon');
+const equippedDrop = g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})');
+prepareTrial(g, {...opt, level:9, floor:4});
+assert.equal(g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})'), equippedDrop,
+  'drop gear must survive per-trial party restoration');
+const noGearResult = simulate({...opt, level:9, floor:4, n:30, gear:undefined});
+const dropGearResult = simulate({...opt, level:9, floor:4, n:30, gear:'drop'});
+assert.notDeepEqual(dropGearResult, noGearResult, 'drop gear must affect a fixed-seed simulation');
 const shopGear = game(null, seededRandom());
 createParty(shopGear, opt.jobs);
 gearParty(shopGear, 10, 'shop');
 assert.equal(shopGear.run("s.inventory[0].map(id=>weapon(id).name).includes('炎の剣')"), false, 'shop gear excludes shop:false items');
+assert.notDeepEqual(simulate({...opt, level:9, floor:4, n:30, gear:'shop'}), noGearResult,
+  'shop gear must affect a fixed-seed simulation');
 const formations = new Set();
 for (let i = 0; i < 10; i++) {
   const total = prepareTrial(g, opt);

codex
修正と回帰テストを追加しました。ここから指定の3テストを実行し、さらに要求されたLv15・10F守護者戦で装備なし／shop／dropの勝率を同一条件で比較します。
exec
/bin/bash -lc 'node scripts/sim/selftest.cjs && node tests/game.cjs && node tests/training.cjs' in /workspace/dungeonsweeper
 exited 1 in 4886ms:
node:assert:152
  throw new AssertionError(obj);
  ^

AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

5 !== 1

    at Object.<anonymous> (/workspace/dungeonsweeper/scripts/sim/selftest.cjs:68:8)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: 5,
  expected: 1,
  operator: 'strictEqual',
  diff: 'simple'
}

Node.js v24.22.1

codex
自己テストが装備済みパーティーを後続の「装備なし初期所持品」確認にも使っており、テスト同士が干渉していました。これはテスト配置の問題なので、装備復元専用のゲーム状態に分離してから再実行します。
2026-11-01T19:40:26.479605Z ERROR codex_core::tools::router: error=apply_patch verification failed: Failed to find expected lines in /workspace/dungeonsweeper/scripts/sim/selftest.cjs:
g.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
  rollInitiative=()=> 'enemy'; enemyTurn=()=>{s.hp[0]-=5};`);
const beforeAmbush = prepareTrial(g, opt);
assert.equal(beforeAmbush - g.run('s.hp.reduce((a,b) => a+b, 0)'), 5);
g.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
prepareTrial(g, opt);
assert.equal(resolveBattle(g).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
g.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');
exec
/bin/bash -lc "nl -ba scripts/sim/selftest.cjs | sed -n '1,100p'" in /workspace/dungeonsweeper
 succeeded in 0ms:
     1	// Kept beside the simulator because task 010 explicitly excludes tests/ edits.
     2	const assert = require('node:assert/strict');
     3	const { game } = require('./harness.cjs');
     4	const { args, simulate, seededRandom, createParty, gearParty, prepareTrial, planTurn, resolveBattle } = require('./combat.cjs');
     5	const opt = args(['--jobs','0,0,2,3,1,2','--level','1','--floor','3','--n','2']);
     6	for (const argv of [[], ['--jobs',''], ['--jobs','0,'], ['--wat','1'], ['--boss','--boss'],
     7	  ['--jobs','0','--level','1','--floor','11','--n','1'], ['--gear','bad']]) assert.throws(() => args(argv));
     8	const floor10 = args(['--jobs','0,0,2,3,1,2','--level','15','--floor','10','--boss','--gear','drop','--n','1']);
     9	assert.equal(floor10.floor, 10);
    10	assert.equal(floor10.gear, 'drop');
    11	
    12	const g = game(null, seededRandom());
    13	createParty(g, opt.jobs);
    14	assert.equal(g.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
    15	assert.equal(g.run('s.reserve.length'), 0);
    16	assert.equal(g.run('s.inventory.every(a => a.length === 1)'), true, 'gear omitted must retain starter inventory');
    17	gearParty(g, 10, 'drop');
    18	assert.equal(g.run("s.inventory[0].map(id=>weapon(id).name).includes('聖剣')"), true, 'drop gear should consider minFloor 9 equipment');
    19	assert.equal(g.run("s.inventory[3].map(id=>weapon(id).name).some(n=>['魔弓','竜骨の弓'].includes(n))"), true, 'rear thief should receive a ranged weapon');
    20	const equippedDrop = g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})');
    21	prepareTrial(g, {...opt, level:9, floor:4});
    22	assert.equal(g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})'), equippedDrop,
    23	  'drop gear must survive per-trial party restoration');
    24	const noGearResult = simulate({...opt, level:9, floor:4, n:30, gear:undefined});
    25	const dropGearResult = simulate({...opt, level:9, floor:4, n:30, gear:'drop'});
    26	assert.notDeepEqual(dropGearResult, noGearResult, 'drop gear must affect a fixed-seed simulation');
    27	const shopGear = game(null, seededRandom());
    28	createParty(shopGear, opt.jobs);
    29	gearParty(shopGear, 10, 'shop');
    30	assert.equal(shopGear.run("s.inventory[0].map(id=>weapon(id).name).includes('炎の剣')"), false, 'shop gear excludes shop:false items');
    31	assert.notDeepEqual(simulate({...opt, level:9, floor:4, n:30, gear:'shop'}), noGearResult,
    32	  'shop gear must affect a fixed-seed simulation');
    33	const formations = new Set();
    34	for (let i = 0; i < 10; i++) {
    35	  const total = prepareTrial(g, opt);
    36	  assert.equal(total, g.run('s.members.reduce((a,m) => a+m.maxHP, 0)'));
    37	  formations.add(g.run('JSON.stringify(s.enemy?.units.map(e => [e.id,e.hp]))'));
    38	  assert.equal(g.run('s.members.length'), 6);
    39	  assert.equal(g.run('s.members.every(m => m.level === 1)'), true);
    40	  assert.equal(g.run("s.members[4].known.includes('halito')"), true);
    41	  assert.equal(g.run('s.mp.every((mp,i) => mp === s.members[i].maxMP)'), true);
    42	}
    43	assert(formations.size > 1, 'trials must not repeat one RNG sequence');
    44	
    45	// Force an opening attack to verify that prepareTrial returns pre-ambush HP.
    46	g.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
    47	  rollInitiative=()=> 'enemy'; enemyTurn=()=>{s.hp[0]-=5};`);
    48	const beforeAmbush = prepareTrial(g, opt);
    49	assert.equal(beforeAmbush - g.run('s.hp.reduce((a,b)=>a+b,0)'), 5);
    50	g.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
    51	prepareTrial(g, opt);
    52	assert.equal(resolveBattle(g).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
    53	g.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');
    54	
    55	for (let i = 0; i < 10; i++) {
    56	  prepareTrial(g, {...opt, level:6, floor:1, boss:true});
    57	  assert.equal(g.run('s.members.every(m => m.level === 6)'), true);
    58	  assert.equal(g.run(`s.members.every((m,i) => {
    59	    const base = simBase[i].members, c = memberClass(i);
    60	    return m.maxHP >= base.maxHP + 5 * (c.hpGrowth[0] + c.hpGrowth[2]) &&
    61	      m.maxHP <= base.maxHP + 5 * (c.hpGrowth[0] * c.hpGrowth[1] + c.hpGrowth[2]);
    62	  })`), true, 'growth must start from Lv1 every trial');
    63	  // Mimic battle rewards, drain, gear drops and ailments before the next reset.
    64	  g.run("s.members[0].level=2; s.members[0].xp=999999; s.inventory[0].push('healingPotion'); s.ailments[0].poison=true");
    65	}
    66	prepareTrial(g, opt);
    67	assert.equal(g.run('s.members[0].xp'), 0);
    68	assert.equal(g.run('s.inventory[0].length'), 1);
    69	assert.equal(g.run('s.ailments.some(a => a.poison)'), false);
    70	
    71	// AI uses professions and stable row IDs; the mage gets the front living unit UID.
    72	g.run(`s.enemy = {units:[{...makeEnemy('slime',8),row:12}], flagEffect:{}, initiative:'party'};
    73	  var simTestCombat=s.enemy; simBattleFinished=false; s.hp=s.members.map(m=>m.maxHP); s.mp=s.members.map(m=>m.maxMP);`);
    74	planTurn(g);
    75	assert.equal(g.run('s.attackRows[0]'), 12);
    76	assert.equal(g.run('s.commands[3]'), 'guard');
    77	assert.equal(g.run('s.commands[4]'), 'spell');
    78	assert.equal(g.run('s.magicPlans[4].target'), 8);
    79	assert.equal(g.run('s.magicPlans[4].id'), 'halito', 'a single living target must not attract katino');
    80	g.run(`s.enemy.units.push({...makeEnemy('slime',9),row:12});`);
    81	planTurn(g);
    82	assert.equal(g.run('s.magicPlans[4].id'), 'katino', 'katino remains available against two or more living enemies');
    83	g.run('s.enemy.boss=true');
    84	planTurn(g);
    85	assert.equal(g.run('s.magicPlans[4].id'), 'halito', 'boss encounters must not use katino');
    86	g.run('s.enemy.boss=false; s.enemy.units.pop()');
    87	g.run('s.hp[0]=1');
    88	planTurn(g);
    89	assert.equal(g.run('s.magicPlans[2].id'), 'dios');
    90	assert.equal(g.run('s.magicPlans[2].target'), 0);
    91	g.run('s.mp[4]=5');
    92	planTurn(g);
    93	assert.equal(g.run('s.commands[4]'), 'guard');
    94	
    95	// Failed fleeing spends one turn, including a party initiative, with no attack.
    96	g.run('s.hp=s.hp.map(()=>1); Math.random=()=>.999; var simEnemyHP=s.enemy.units[0].hp;');
    97	assert.throws(() => resolveBattle(g, 1), /未決着/);
    98	assert.equal(g.run('s.enemy.initiative'), 'normal');
    99	assert.equal(g.run('s.hp.every(h=>h===1)'), true);
   100	assert.equal(g.run('s.enemy.units[0].hp'), g.run('simEnemyHP'));

apply patch
patch: completed
/workspace/dungeonsweeper/scripts/sim/selftest.cjs
diff --git a/scripts/sim/combat.cjs b/scripts/sim/combat.cjs
index b2bded3434fd5e46a81e4c978ffd254afec0b99e..150a08b838ae28b7a956a40ac730addfc0d6524c
--- a/scripts/sim/combat.cjs
+++ b/scripts/sim/combat.cjs
@@ -88,6 +88,9 @@
       }
     }
   })()`);
+  // Keep the selected loadout when prepareTrial restores party state.
+  // The snapshot is taken after equipping, while growth is still reset from Lv1 each trial.
+  g.run('simBase = structuredClone(partyRecords())');
 }
 
 function planTurn(g) {
diff --git a/scripts/sim/selftest.cjs b/scripts/sim/selftest.cjs
index ab4e5e2ff014ad35b8dd46e20f752414d6f46072..db018b26cd0f7508ecefff63cdccbb55fbb87e7e
--- a/scripts/sim/selftest.cjs
+++ b/scripts/sim/selftest.cjs
@@ -17,47 +17,61 @@
 gearParty(g, 10, 'drop');
 assert.equal(g.run("s.inventory[0].map(id=>weapon(id).name).includes('聖剣')"), true, 'drop gear should consider minFloor 9 equipment');
 assert.equal(g.run("s.inventory[3].map(id=>weapon(id).name).some(n=>['魔弓','竜骨の弓'].includes(n))"), true, 'rear thief should receive a ranged weapon');
+const equippedDrop = g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})');
+prepareTrial(g, {...opt, level:9, floor:4});
+assert.equal(g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})'), equippedDrop,
+  'drop gear must survive per-trial party restoration');
+const gBase = game(null, seededRandom());
+createParty(gBase, opt.jobs);
+assert.equal(gBase.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
+assert.equal(gBase.run('s.reserve.length'), 0);
+assert.equal(gBase.run('s.inventory.every(a => a.length === 1)'), true, 'gear omitted must retain starter inventory');
+const noGearResult = simulate({...opt, level:9, floor:4, n:30, gear:undefined});
+const dropGearResult = simulate({...opt, level:9, floor:4, n:30, gear:'drop'});
+assert.notDeepEqual(dropGearResult, noGearResult, 'drop gear must affect a fixed-seed simulation');
 const shopGear = game(null, seededRandom());
 createParty(shopGear, opt.jobs);
 gearParty(shopGear, 10, 'shop');
 assert.equal(shopGear.run("s.inventory[0].map(id=>weapon(id).name).includes('炎の剣')"), false, 'shop gear excludes shop:false items');
+assert.notDeepEqual(simulate({...opt, level:9, floor:4, n:30, gear:'shop'}), noGearResult,
+  'shop gear must affect a fixed-seed simulation');
 const formations = new Set();
 for (let i = 0; i < 10; i++) {
-  const total = prepareTrial(g, opt);
-  assert.equal(total, g.run('s.members.reduce((a,m) => a+m.maxHP, 0)'));
-  formations.add(g.run('JSON.stringify(s.enemy?.units.map(e => [e.id,e.hp]))'));
-  assert.equal(g.run('s.members.length'), 6);
-  assert.equal(g.run('s.members.every(m => m.level === 1)'), true);
-  assert.equal(g.run("s.members[4].known.includes('halito')"), true);
-  assert.equal(g.run('s.mp.every((mp,i) => mp === s.members[i].maxMP)'), true);
+  const total = prepareTrial(gBase, opt);
+  assert.equal(total, gBase.run('s.members.reduce((a,m) => a+m.maxHP, 0)'));
+  formations.add(gBase.run('JSON.stringify(s.enemy?.units.map(e => [e.id,e.hp]))'));
+  assert.equal(gBase.run('s.members.length'), 6);
+  assert.equal(gBase.run('s.members.every(m => m.level === 1)'), true);
+  assert.equal(gBase.run("s.members[4].known.includes('halito')"), true);
+  assert.equal(gBase.run('s.mp.every((mp,i) => mp === s.members[i].maxMP)'), true);
 }
 assert(formations.size > 1, 'trials must not repeat one RNG sequence');
 
 // Force an opening attack to verify that prepareTrial returns pre-ambush HP.
-g.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
+gBase.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
   rollInitiative=()=> 'enemy'; enemyTurn=()=>{s.hp[0]-=5};`);
-const beforeAmbush = prepareTrial(g, opt);
-assert.equal(beforeAmbush - g.run('s.hp.reduce((a,b)=>a+b,0)'), 5);
-g.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
-prepareTrial(g, opt);
-assert.equal(resolveBattle(g).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
-g.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');
+const beforeAmbush = prepareTrial(gBase, opt);
+assert.equal(beforeAmbush - gBase.run('s.hp.reduce((a,b)=>a+b,0)'), 5);
+gBase.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
+prepareTrial(gBase, opt);
+assert.equal(resolveBattle(gBase).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
+gBase.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');
 
 for (let i = 0; i < 10; i++) {
-  prepareTrial(g, {...opt, level:6, floor:1, boss:true});
-  assert.equal(g.run('s.members.every(m => m.level === 6)'), true);
-  assert.equal(g.run(`s.members.every((m,i) => {
+  prepareTrial(gBase, {...opt, level:6, floor:1, boss:true});
+  assert.equal(gBase.run('s.members.every(m => m.level === 6)'), true);
+  assert.equal(gBase.run(`s.members.every((m,i) => {
     const base = simBase[i].members, c = memberClass(i);
     return m.maxHP >= base.maxHP + 5 * (c.hpGrowth[0] + c.hpGrowth[2]) &&
       m.maxHP <= base.maxHP + 5 * (c.hpGrowth[0] * c.hpGrowth[1] + c.hpGrowth[2]);
   })`), true, 'growth must start from Lv1 every trial');
   // Mimic battle rewards, drain, gear drops and ailments before the next reset.
-  g.run("s.members[0].level=2; s.members[0].xp=999999; s.inventory[0].push('healingPotion'); s.ailments[0].poison=true");
+  gBase.run("s.members[0].level=2; s.members[0].xp=999999; s.inventory[0].push('healingPotion'); s.ailments[0].poison=true");
 }
-prepareTrial(g, opt);
-assert.equal(g.run('s.members[0].xp'), 0);
-assert.equal(g.run('s.inventory[0].length'), 1);
-assert.equal(g.run('s.ailments.some(a => a.poison)'), false);
+prepareTrial(gBase, opt);
+assert.equal(gBase.run('s.members[0].xp'), 0);
+assert.equal(gBase.run('s.inventory[0].length'), 1);
+assert.equal(gBase.run('s.ailments.some(a => a.poison)'), false);
 
 // AI uses professions and stable row IDs; the mage gets the front living unit UID.
 g.run(`s.enemy = {units:[{...makeEnemy('slime',8),row:12}], flagEffect:{}, initiative:'party'};

exec
/bin/bash -lc 'node scripts/sim/selftest.cjs && node tests/game.cjs && node tests/training.cjs' in /workspace/dungeonsweeper
 exited 1 in 4920ms:
node:assert:152
  throw new AssertionError(obj);
  ^

AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

'fight' !== 'guard'

    at Object.<anonymous> (/workspace/dungeonsweeper/scripts/sim/selftest.cjs:81:8)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: 'fight',
  expected: 'guard',
  operator: 'strictEqual',
  diff: 'simple'
}

Node.js v24.22.1

exec
/bin/bash -lc "nl -ba scripts/sim/selftest.cjs | sed -n '72,88p' && rg -n 'function resetPartyCommands|attackRows' dist/*.js | head" in /workspace/dungeonsweeper
 succeeded in 0ms:
    72	assert.equal(gBase.run('s.members[0].xp'), 0);
    73	assert.equal(gBase.run('s.inventory[0].length'), 1);
    74	assert.equal(gBase.run('s.ailments.some(a => a.poison)'), false);
    75	
    76	// AI uses professions and stable row IDs; the mage gets the front living unit UID.
    77	g.run(`s.enemy = {units:[{...makeEnemy('slime',8),row:12}], flagEffect:{}, initiative:'party'};
    78	  var simTestCombat=s.enemy; simBattleFinished=false; s.hp=s.members.map(m=>m.maxHP); s.mp=s.members.map(m=>m.maxMP);`);
    79	planTurn(g);
    80	assert.equal(g.run('s.attackRows[0]'), 12);
    81	assert.equal(g.run('s.commands[3]'), 'guard');
    82	assert.equal(g.run('s.commands[4]'), 'spell');
    83	assert.equal(g.run('s.magicPlans[4].target'), 8);
    84	assert.equal(g.run('s.magicPlans[4].id'), 'halito', 'a single living target must not attract katino');
    85	g.run(`s.enemy.units.push({...makeEnemy('slime',9),row:12});`);
    86	planTurn(g);
    87	assert.equal(g.run('s.magicPlans[4].id'), 'katino', 'katino remains available against two or more living enemies');
    88	g.run('s.enemy.boss=true');
dist/game.js:10:function attackRowUI(i){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat).filter(g=>g.units.some(e=>!e.rewarded)),chosen=s.attackRows[i];if(!groups.some(g=>String(g.key)===String(chosen)))chosen=groups[0]?.key;return `<label class="attackrow"><span class="sr-only">${NAMES[i]}の攻撃対象の列</span><select data-attack-row="${i}" ${logBusy()||s.commands[i]!=='fight'||s.hp[i]<=0?'disabled':''}>${groups.map(g=>`<option value="${g.key}" ${String(chosen)===String(g.key)?'selected':''}>${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>!e.rewarded).length}</option>`).join('')}</select></label>`}
dist/game.js:13:function encounter(i,unexplored=false,action='forward'){let boss=s.cells[i].type==='boss',formation=monsterFormation(boss),units=[];for(let [row,id] of formation.slice(0,3).entries()){let [min,max]=enemyDefinition(id).groupSize,n=min+(Math.random()*(max-min+1)|0);for(let j=0;j<n;j++)units.push({...makeEnemy(id,units.length),row})}resetCommandEntry();s.attackRows=s.members.map(()=>0);s.enemy={dataVersion:1,flagEffect:flagEffect(),boss,chestBattle:unexplored,lootGold:0,units,target:0,escapeTo:s.previousPos??s.start,initiative:rollInitiative(action,boss)};identifyEnemies();let message={normal:'敵が現れた！',enemy:'敵の奇襲！',party:'敵はまだ気づいていない！'}[s.enemy.initiative];log(message,{encounter:true});if(s.enemy.flagEffect.bad)log('誤った旗がパーティーを惑わせた！');if(s.enemy.initiative==='enemy'){s.enemy.initiative='normal';enemyTurn(s.members.map(()=>'fight'))}}
dist/game.js:26:function selectedEnemy(i){let key=s.attackRows?.[i];if(key==null){let legacy=s.enemy.units.find(e=>e.uid===s.enemy.target);key=legacy?rowKey(legacy):rowKey(s.enemy.units[0])}if(!reachableEnemyGroups(i).some(g=>String(g.key)===String(key)))return undefined;return s.enemy.units.find(e=>String(rowKey(e))===String(key)&&e.hp>0)}
dist/game.js:30:function attack(){if(logBusy()||!s.enemy||s.done)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}identifyEnemies();let cmds=s.commands.slice();log('── ターン開始 ──');for(let i=0;i<s.members.length;i++)if(s.hp[i]>0&&cmds[i]==='guard')log(`${NAMES[i]}は身を守る。`);for(let i=0;i<s.members.length;i++){if(s.hp[i]<=0)continue;if(s.ailments[i].paralysis>0){log(`${NAMES[i]}は麻痺して動けない。`);continue}if(cmds[i]==='guard')continue;if(cmds[i]==='dispel'){dispelUndead(i);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(cmds[i]==='item'){let plan=s.itemPlans[i];if(plan)useMedicine(i,plan.slot,plan.target,true,plan.id);continue}if(cmds[i]==='spell'){let plan=s.magicPlans[i];if(plan){let x=magic(plan.id),t=plan.target;if(x&&(x.target==='enemy'||x.target==='group')&&!validMagicTarget(x,t)){let original=s.enemy.units.find(e=>e.uid===t);t=s.enemy.units.find(e=>e.hp>0&&original&&rowKey(e)===rowKey(original))?.uid??s.enemy.units.find(e=>e.hp>0)?.uid}castMagic(i,plan.id,t)}else log(`${NAMES[i]}の呪文が選ばれていない。`);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(!canWeaponAttack(i)){log(`${NAMES[i]}の近接攻撃は後衛から届かない。`);continue}let e=selectedEnemy(i);if(!e){log(`${NAMES[i]}の攻撃対象の列は全滅している。`);continue;}let d=enemyDefinition(e.id);let result=physicalAttack(i,e);if(!result.hitsCount){log(`${NAMES[i]}の攻撃は${enemyDisplay(e)}にかわされた。`);continue}let damage=flagDamage(result.damage);e.hp=Math.max(0,e.hp-damage);log(`${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。`);if(e.hp===0)killReward(e);if(!s.enemy.units.some(e=>e.hp>0))break}if(!s.enemy.units.some(e=>e.hp>0)){finishMonsterBattle()}else if(s.enemy.initiative==='party'){s.enemy.initiative='normal'}else{enemyTurn(cmds)}resetCommandEntry();resetPartyCommands();if(s.enemy){let next=s.enemy.units.find(e=>e.hp>0);s.attackRows=s.attackRows.map(key=>s.enemy.units.some(e=>String(rowKey(e))===String(key)&&e.hp>0)?key:rowKey(next))}render()}
dist/game.js:41:function ensureProfile(){ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members)migrateStrength(r.members,r.members.job??0);ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
dist/game.js:68:$('#party').onchange=e=>{if(e.target.matches('[data-attack-row]')&&!logBusy()&&s.enemy){s.attackRows[+e.target.dataset.attackRow]=e.target.value;render();return}if(!e.target.matches('input[data-person]')||logBusy()||!s.enemy)return;s.commands[+e.target.dataset.person]=e.target.value;render()};
dist/party.js:16:function resetPartyCommands(){s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.magicPlans=s.members.map(()=>null);s.itemPlans=s.members.map(()=>null);s.attackRows=s.members.map(()=>0);resetCommandEntry()}
dist/combatui.js:5:function commandSummary(i){let c=s.commands[i];if(c==='dispel')return '呪いを解く';if(c==='guard')return '守る';if(c==='spell')return magic(s.magicPlans[i]?.id)?.name||'呪文';if(c==='item')return weapon(s.itemPlans[i]?.id)?.name||'アイテム';let g=enemyGroups().find(g=>String(g.key)===String(s.attackRows[i]));return '戦う'+(g?' → '+(g.index+1)+'列':'')}
dist/combatui.js:9: box.onclick=e=>{if(logBusy()||!s.enemy)return;if(e.target.closest('[data-command-back]')){if(pendingSpell)pendingSpell=null;else if(choosingRow)choosingRow=false;else commandIndex=Math.max(0,commandIndex-1);render();return}let st=e.target.closest('[data-spell-target]');if(st&&pendingSpell){s.commands[i]='spell';s.magicPlans[i]={id:pendingSpell.id,target:+st.dataset.spellTarget};confirmCommand(i);return}let row=e.target.closest('[data-row-choice]');if(row){if(!reachableEnemyGroups(i).some(g=>String(g.key)===row.dataset.rowChoice))return;s.commands[i]='fight';s.attackRows[i]=row.dataset.rowChoice;confirmCommand(i);return}let b=e.target.closest('[data-command-choice]');if(!b)return;let c=b.dataset.commandChoice;if(c==='fight'){if(!canWeaponAttack(i))return;let groups=reachableEnemyGroups(i);if(groups.length===1){s.commands[i]='fight';s.attackRows[i]=groups[0].key;confirmCommand(i)}else{choosingRow=true;render()}}else if(c==='dispel'){s.commands[i]='dispel';confirmCommand(i)}else if(c==='guard'){s.commands[i]='guard';confirmCommand(i)}else if(c==='spell')openMagic(i);else openMedicine(i)};

codex
回帰テストを分離した結果、装備選択自体が前衛以外の攻撃コマンド期待値に影響することが分かりました（シミュレータAIテストは準備済みの装備を意図していません）。AI検証用パーティーも独立させ、装備条件のテストとは切り離します。
apply patch
patch: completed
/workspace/dungeonsweeper/scripts/sim/selftest.cjs
diff --git a/scripts/sim/combat.cjs b/scripts/sim/combat.cjs
index b2bded3434fd5e46a81e4c978ffd254afec0b99e..150a08b838ae28b7a956a40ac730addfc0d6524c
--- a/scripts/sim/combat.cjs
+++ b/scripts/sim/combat.cjs
@@ -88,6 +88,9 @@
       }
     }
   })()`);
+  // Keep the selected loadout when prepareTrial restores party state.
+  // The snapshot is taken after equipping, while growth is still reset from Lv1 each trial.
+  g.run('simBase = structuredClone(partyRecords())');
 }
 
 function planTurn(g) {
diff --git a/scripts/sim/selftest.cjs b/scripts/sim/selftest.cjs
index ab4e5e2ff014ad35b8dd46e20f752414d6f46072..1fc577897a73e935bebae92f473561ec0795148b
--- a/scripts/sim/selftest.cjs
+++ b/scripts/sim/selftest.cjs
@@ -17,89 +17,105 @@
 gearParty(g, 10, 'drop');
 assert.equal(g.run("s.inventory[0].map(id=>weapon(id).name).includes('聖剣')"), true, 'drop gear should consider minFloor 9 equipment');
 assert.equal(g.run("s.inventory[3].map(id=>weapon(id).name).some(n=>['魔弓','竜骨の弓'].includes(n))"), true, 'rear thief should receive a ranged weapon');
+const equippedDrop = g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})');
+prepareTrial(g, {...opt, level:9, floor:4});
+assert.equal(g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})'), equippedDrop,
+  'drop gear must survive per-trial party restoration');
+const gBase = game(null, seededRandom());
+createParty(gBase, opt.jobs);
+assert.equal(gBase.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
+assert.equal(gBase.run('s.reserve.length'), 0);
+assert.equal(gBase.run('s.inventory.every(a => a.length === 1)'), true, 'gear omitted must retain starter inventory');
+const noGearResult = simulate({...opt, level:9, floor:4, n:30, gear:undefined});
+const dropGearResult = simulate({...opt, level:9, floor:4, n:30, gear:'drop'});
+assert.notDeepEqual(dropGearResult, noGearResult, 'drop gear must affect a fixed-seed simulation');
 const shopGear = game(null, seededRandom());
 createParty(shopGear, opt.jobs);
 gearParty(shopGear, 10, 'shop');
 assert.equal(shopGear.run("s.inventory[0].map(id=>weapon(id).name).includes('炎の剣')"), false, 'shop gear excludes shop:false items');
+assert.notDeepEqual(simulate({...opt, level:9, floor:4, n:30, gear:'shop'}), noGearResult,
+  'shop gear must affect a fixed-seed simulation');
 const formations = new Set();
 for (let i = 0; i < 10; i++) {
-  const total = prepareTrial(g, opt);
-  assert.equal(total, g.run('s.members.reduce((a,m) => a+m.maxHP, 0)'));
-  formations.add(g.run('JSON.stringify(s.enemy?.units.map(e => [e.id,e.hp]))'));
-  assert.equal(g.run('s.members.length'), 6);
-  assert.equal(g.run('s.members.every(m => m.level === 1)'), true);
-  assert.equal(g.run("s.members[4].known.includes('halito')"), true);
-  assert.equal(g.run('s.mp.every((mp,i) => mp === s.members[i].maxMP)'), true);
+  const total = prepareTrial(gBase, opt);
+  assert.equal(total, gBase.run('s.members.reduce((a,m) => a+m.maxHP, 0)'));
+  formations.add(gBase.run('JSON.stringify(s.enemy?.units.map(e => [e.id,e.hp]))'));
+  assert.equal(gBase.run('s.members.length'), 6);
+  assert.equal(gBase.run('s.members.every(m => m.level === 1)'), true);
+  assert.equal(gBase.run("s.members[4].known.includes('halito')"), true);
+  assert.equal(gBase.run('s.mp.every((mp,i) => mp === s.members[i].maxMP)'), true);
 }
 assert(formations.size > 1, 'trials must not repeat one RNG sequence');
 
 // Force an opening attack to verify that prepareTrial returns pre-ambush HP.
-g.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
+gBase.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
   rollInitiative=()=> 'enemy'; enemyTurn=()=>{s.hp[0]-=5};`);
-const beforeAmbush = prepareTrial(g, opt);
-assert.equal(beforeAmbush - g.run('s.hp.reduce((a,b)=>a+b,0)'), 5);
-g.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
-prepareTrial(g, opt);
-assert.equal(resolveBattle(g).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
-g.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');
+const beforeAmbush = prepareTrial(gBase, opt);
+assert.equal(beforeAmbush - gBase.run('s.hp.reduce((a,b)=>a+b,0)'), 5);
+gBase.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
+prepareTrial(gBase, opt);
+assert.equal(resolveBattle(gBase).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
+gBase.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');
 
 for (let i = 0; i < 10; i++) {
-  prepareTrial(g, {...opt, level:6, floor:1, boss:true});
-  assert.equal(g.run('s.members.every(m => m.level === 6)'), true);
-  assert.equal(g.run(`s.members.every((m,i) => {
+  prepareTrial(gBase, {...opt, level:6, floor:1, boss:true});
+  assert.equal(gBase.run('s.members.every(m => m.level === 6)'), true);
+  assert.equal(gBase.run(`s.members.every((m,i) => {
     const base = simBase[i].members, c = memberClass(i);
     return m.maxHP >= base.maxHP + 5 * (c.hpGrowth[0] + c.hpGrowth[2]) &&
       m.maxHP <= base.maxHP + 5 * (c.hpGrowth[0] * c.hpGrowth[1] + c.hpGrowth[2]);
   })`), true, 'growth must start from Lv1 every trial');
   // Mimic battle rewards, drain, gear drops and ailments before the next reset.
-  g.run("s.members[0].level=2; s.members[0].xp=999999; s.inventory[0].push('healingPotion'); s.ailments[0].poison=true");
+  gBase.run("s.members[0].level=2; s.members[0].xp=999999; s.inventory[0].push('healingPotion'); s.ailments[0].poison=true");
 }
-prepareTrial(g, opt);
-assert.equal(g.run('s.members[0].xp'), 0);
-assert.equal(g.run('s.inventory[0].length'), 1);
-assert.equal(g.run('s.ailments.some(a => a.poison)'), false);
+prepareTrial(gBase, opt);
+assert.equal(gBase.run('s.members[0].xp'), 0);
+assert.equal(gBase.run('s.inventory[0].length'), 1);
+assert.equal(gBase.run('s.ailments.some(a => a.poison)'), false);
 
 // AI uses professions and stable row IDs; the mage gets the front living unit UID.
-g.run(`s.enemy = {units:[{...makeEnemy('slime',8),row:12}], flagEffect:{}, initiative:'party'};
+const gAI = game(null, seededRandom());
+createParty(gAI, opt.jobs);
+gAI.run(`s.enemy = {units:[{...makeEnemy('slime',8),row:12}], flagEffect:{}, initiative:'party'};
   var simTestCombat=s.enemy; simBattleFinished=false; s.hp=s.members.map(m=>m.maxHP); s.mp=s.members.map(m=>m.maxMP);`);
-planTurn(g);
-assert.equal(g.run('s.attackRows[0]'), 12);
-assert.equal(g.run('s.commands[3]'), 'guard');
-assert.equal(g.run('s.commands[4]'), 'spell');
-assert.equal(g.run('s.magicPlans[4].target'), 8);
-assert.equal(g.run('s.magicPlans[4].id'), 'halito', 'a single living target must not attract katino');
-g.run(`s.enemy.units.push({...makeEnemy('slime',9),row:12});`);
-planTurn(g);
-assert.equal(g.run('s.magicPlans[4].id'), 'katino', 'katino remains available against two or more living enemies');
-g.run('s.enemy.boss=true');
-planTurn(g);
-assert.equal(g.run('s.magicPlans[4].id'), 'halito', 'boss encounters must not use katino');
-g.run('s.enemy.boss=false; s.enemy.units.pop()');
-g.run('s.hp[0]=1');
-planTurn(g);
-assert.equal(g.run('s.magicPlans[2].id'), 'dios');
-assert.equal(g.run('s.magicPlans[2].target'), 0);
-g.run('s.mp[4]=5');
-planTurn(g);
-assert.equal(g.run('s.commands[4]'), 'guard');
+planTurn(gAI);
+assert.equal(gAI.run('s.attackRows[0]'), 12);
+assert.equal(gAI.run('s.commands[3]'), 'guard');
+assert.equal(gAI.run('s.commands[4]'), 'spell');
+assert.equal(gAI.run('s.magicPlans[4].target'), 8);
+assert.equal(gAI.run('s.magicPlans[4].id'), 'halito', 'a single living target must not attract katino');
+gAI.run(`s.enemy.units.push({...makeEnemy('slime',9),row:12});`);
+planTurn(gAI);
+assert.equal(gAI.run('s.magicPlans[4].id'), 'katino', 'katino remains available against two or more living enemies');
+gAI.run('s.enemy.boss=true');
+planTurn(gAI);
+assert.equal(gAI.run('s.magicPlans[4].id'), 'halito', 'boss encounters must not use katino');
+gAI.run('s.enemy.boss=false; s.enemy.units.pop()');
+gAI.run('s.hp[0]=1');
+planTurn(gAI);
+assert.equal(gAI.run('s.magicPlans[2].id'), 'dios');
+assert.equal(gAI.run('s.magicPlans[2].target'), 0);
+gAI.run('s.mp[4]=5');
+planTurn(gAI);
+assert.equal(gAI.run('s.commands[4]'), 'guard');
 
 // Failed fleeing spends one turn, including a party initiative, with no attack.
-g.run('s.hp=s.hp.map(()=>1); Math.random=()=>.999; var simEnemyHP=s.enemy.units[0].hp;');
-assert.throws(() => resolveBattle(g, 1), /未決着/);
-assert.equal(g.run('s.enemy.initiative'), 'normal');
-assert.equal(g.run('s.hp.every(h=>h===1)'), true);
-assert.equal(g.run('s.enemy.units[0].hp'), g.run('simEnemyHP'));
-g.run('Math.random=()=>0');
-assert.equal(resolveBattle(g).outcome, 'escape');
-g.run('s.enemy=simTestCombat; s.ailments=s.ailments.map(()=>({poison:true,paralysis:0}))');
-const wipe = resolveBattle(g);
+gAI.run('s.hp=s.hp.map(()=>1); Math.random=()=>.999; var simEnemyHP=s.enemy.units[0].hp;');
+assert.throws(() => resolveBattle(gAI, 1), /未決着/);
+assert.equal(gAI.run('s.enemy.initiative'), 'normal');
+assert.equal(gAI.run('s.hp.every(h=>h===1)'), true);
+assert.equal(gAI.run('s.enemy.units[0].hp'), gAI.run('simEnemyHP'));
+gAI.run('Math.random=()=>0');
+assert.equal(resolveBattle(gAI).outcome, 'escape');
+gAI.run('s.enemy=simTestCombat; s.ailments=s.ailments.map(()=>({poison:true,paralysis:0}))');
+const wipe = resolveBattle(gAI);
 assert.equal(wipe.outcome, 'wipe');
 assert.equal(wipe.deaths, 6);
-g.run(`s.done=false; s.hp=s.members.map(m=>m.maxHP); s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));
+gAI.run(`s.done=false; s.hp=s.members.map(m=>m.maxHP); s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));
   s.enemy={units:[{...makeEnemy('slime',0),row:0,hp:0,rewarded:true}],lootXP:0,lootGold:0};
   finishMonsterBattle();`);
-g.drain();
-assert.equal(resolveBattle(g).outcome, 'win');
+gAI.drain();
+assert.equal(resolveBattle(gAI).outcome, 'win');
 
 const report = simulate(opt);
 assert.deepEqual(simulate(opt), report, 'same invocation must be reproducible');

exec
/bin/bash -lc 'node scripts/sim/selftest.cjs && node tests/game.cjs && node tests/training.cjs' in /workspace/dungeonsweeper
 succeeded in 9275ms:
PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout
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
PASS linear 4-40% flags, five floor traps, safe teleport and sequential command entry/review
PASS automatic single-row targets, battle spell modal closure and main-screen targets, field spell placement, linked flag labels
PASS review table, back to final member, hidden flee in review, aligned target grid
PASS chest Calfo availability, all-facing diagonal sight and wall boundaries
PASS six-person defaults/migration, reordered jobs and gear, bench/restore/save, doubled survey/accuracy/reset, thief success/failure, front/rear combat and six XP/commands
PASS item transfer/capacity/equipped guard, slot remapping, field reorder identity, combat locks and party entry
PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, linear 4-40% flag curve
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
PASS chest item pool respects plate minFloor
PASS weighted chest loot floor gates, deep items, and 10,000-draw item chance rates
PASS expanded equipment ids, shop:false gate, floor loot gates, and hitBonus
PASS chest item unusable, full inventory and normal receipt logs
PASS XP split 100/3=33, 100/1=100, dead exclusion, minimum 1, zero reward, no survivors, per-person log and duplicate guard
PASS 10-floor trap configuration and scaling
PASS new game starts empty; dungeon blocked
PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation
PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload
PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration
PASS deletion including last active member and empty save reload

codex
指定のシミュレータ自己テストとゲーム・訓練所テストはすべて通りました。最後に固定seedのLv9・4Fで3種の装備結果、Lv15・10F守護者の勝率を測り、差分と変更ファイルを確認します。
exec
/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 9 --floor 4 --n 30 && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 9 --floor 4 --n 30 --gear shop && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 9 --floor 4 --n 30 --gear drop && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 15 --floor 10 --boss --n 30 && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 15 --floor 10 --boss --gear shop --n 30 && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 15 --floor 10 --boss --gear drop --n 30 && git status --short && git diff --check && git diff --stat && git diff -- scripts/sim/combat.cjs scripts/sim/selftest.cjs' in /workspace/dungeonsweeper
 succeeded in 19001ms:
{"winRate":1,"wipeRate":0,"deathsPerBattle":0,"hpLossRate":0.07602956529180015,"averageRounds":2.8333333333333335}
{"winRate":1,"wipeRate":0,"deathsPerBattle":0,"hpLossRate":0.025000458700234793,"averageRounds":2.3}
{"winRate":1,"wipeRate":0,"deathsPerBattle":0,"hpLossRate":0.025000458700234793,"averageRounds":2.3}
{"winRate":0,"wipeRate":1,"deathsPerBattle":6,"hpLossRate":1,"averageRounds":9.966666666666667}
{"winRate":0.7333333333333333,"wipeRate":0.26666666666666666,"deathsPerBattle":1.9333333333333333,"hpLossRate":0.558496061763357,"averageRounds":6.5}
{"winRate":0.9666666666666667,"wipeRate":0.03333333333333333,"deathsPerBattle":0.2,"hpLossRate":0.1659744929267137,"averageRounds":2.966666666666667}
 M scripts/sim/combat.cjs
 M scripts/sim/selftest.cjs
 scripts/sim/combat.cjs   |   3 ++
 scripts/sim/selftest.cjs | 126 ++++++++++++++++++++++++++---------------------
 2 files changed, 74 insertions(+), 55 deletions(-)
diff --git a/scripts/sim/combat.cjs b/scripts/sim/combat.cjs
index b2bded3..150a08b 100644
--- a/scripts/sim/combat.cjs
+++ b/scripts/sim/combat.cjs
@@ -88,6 +88,9 @@ function gearParty(g, floor, gear) {
       }
     }
   })()`);
+  // Keep the selected loadout when prepareTrial restores party state.
+  // The snapshot is taken after equipping, while growth is still reset from Lv1 each trial.
+  g.run('simBase = structuredClone(partyRecords())');
 }
 
 function planTurn(g) {
diff --git a/scripts/sim/selftest.cjs b/scripts/sim/selftest.cjs
index ab4e5e2..1fc5778 100644
--- a/scripts/sim/selftest.cjs
+++ b/scripts/sim/selftest.cjs
@@ -17,89 +17,105 @@ assert.equal(g.run('s.inventory.every(a => a.length === 1)'), true, 'gear omitte
 gearParty(g, 10, 'drop');
 assert.equal(g.run("s.inventory[0].map(id=>weapon(id).name).includes('聖剣')"), true, 'drop gear should consider minFloor 9 equipment');
 assert.equal(g.run("s.inventory[3].map(id=>weapon(id).name).some(n=>['魔弓','竜骨の弓'].includes(n))"), true, 'rear thief should receive a ranged weapon');
+const equippedDrop = g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})');
+prepareTrial(g, {...opt, level:9, floor:4});
+assert.equal(g.run('JSON.stringify({inventory:s.inventory,equipped:s.equipped,armor:s.armor})'), equippedDrop,
+  'drop gear must survive per-trial party restoration');
+const gBase = game(null, seededRandom());
+createParty(gBase, opt.jobs);
+assert.equal(gBase.run('JSON.stringify(s.members.map((m,i) => jobOf(i)))'), JSON.stringify(opt.jobs));
+assert.equal(gBase.run('s.reserve.length'), 0);
+assert.equal(gBase.run('s.inventory.every(a => a.length === 1)'), true, 'gear omitted must retain starter inventory');
+const noGearResult = simulate({...opt, level:9, floor:4, n:30, gear:undefined});
+const dropGearResult = simulate({...opt, level:9, floor:4, n:30, gear:'drop'});
+assert.notDeepEqual(dropGearResult, noGearResult, 'drop gear must affect a fixed-seed simulation');
 const shopGear = game(null, seededRandom());
 createParty(shopGear, opt.jobs);
 gearParty(shopGear, 10, 'shop');
 assert.equal(shopGear.run("s.inventory[0].map(id=>weapon(id).name).includes('炎の剣')"), false, 'shop gear excludes shop:false items');
+assert.notDeepEqual(simulate({...opt, level:9, floor:4, n:30, gear:'shop'}), noGearResult,
+  'shop gear must affect a fixed-seed simulation');
 const formations = new Set();
 for (let i = 0; i < 10; i++) {
-  const total = prepareTrial(g, opt);
-  assert.equal(total, g.run('s.members.reduce((a,m) => a+m.maxHP, 0)'));
-  formations.add(g.run('JSON.stringify(s.enemy?.units.map(e => [e.id,e.hp]))'));
-  assert.equal(g.run('s.members.length'), 6);
-  assert.equal(g.run('s.members.every(m => m.level === 1)'), true);
-  assert.equal(g.run("s.members[4].known.includes('halito')"), true);
-  assert.equal(g.run('s.mp.every((mp,i) => mp === s.members[i].maxMP)'), true);
+  const total = prepareTrial(gBase, opt);
+  assert.equal(total, gBase.run('s.members.reduce((a,m) => a+m.maxHP, 0)'));
+  formations.add(gBase.run('JSON.stringify(s.enemy?.units.map(e => [e.id,e.hp]))'));
+  assert.equal(gBase.run('s.members.length'), 6);
+  assert.equal(gBase.run('s.members.every(m => m.level === 1)'), true);
+  assert.equal(gBase.run("s.members[4].known.includes('halito')"), true);
+  assert.equal(gBase.run('s.mp.every((mp,i) => mp === s.members[i].maxMP)'), true);
 }
 assert(formations.size > 1, 'trials must not repeat one RNG sequence');
 
 // Force an opening attack to verify that prepareTrial returns pre-ambush HP.
-g.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
+gBase.run(`var simOriginalInitiative=rollInitiative, simOriginalEnemyTurn=enemyTurn;
   rollInitiative=()=> 'enemy'; enemyTurn=()=>{s.hp[0]-=5};`);
-const beforeAmbush = prepareTrial(g, opt);
-assert.equal(beforeAmbush - g.run('s.hp.reduce((a,b)=>a+b,0)'), 5);
-g.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
-prepareTrial(g, opt);
-assert.equal(resolveBattle(g).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
-g.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');
+const beforeAmbush = prepareTrial(gBase, opt);
+assert.equal(beforeAmbush - gBase.run('s.hp.reduce((a,b)=>a+b,0)'), 5);
+gBase.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
+prepareTrial(gBase, opt);
+assert.equal(resolveBattle(gBase).outcome, 'win', 'enemy retreat during an ambush is a completed battle');
+gBase.run('rollInitiative=simOriginalInitiative; enemyTurn=simOriginalEnemyTurn');
 
 for (let i = 0; i < 10; i++) {
-  prepareTrial(g, {...opt, level:6, floor:1, boss:true});
-  assert.equal(g.run('s.members.every(m => m.level === 6)'), true);
-  assert.equal(g.run(`s.members.every((m,i) => {
+  prepareTrial(gBase, {...opt, level:6, floor:1, boss:true});
+  assert.equal(gBase.run('s.members.every(m => m.level === 6)'), true);
+  assert.equal(gBase.run(`s.members.every((m,i) => {
     const base = simBase[i].members, c = memberClass(i);
     return m.maxHP >= base.maxHP + 5 * (c.hpGrowth[0] + c.hpGrowth[2]) &&
       m.maxHP <= base.maxHP + 5 * (c.hpGrowth[0] * c.hpGrowth[1] + c.hpGrowth[2]);
   })`), true, 'growth must start from Lv1 every trial');
   // Mimic battle rewards, drain, gear drops and ailments before the next reset.
-  g.run("s.members[0].level=2; s.members[0].xp=999999; s.inventory[0].push('healingPotion'); s.ailments[0].poison=true");
+  gBase.run("s.members[0].level=2; s.members[0].xp=999999; s.inventory[0].push('healingPotion'); s.ailments[0].poison=true");
 }
-prepareTrial(g, opt);
-assert.equal(g.run('s.members[0].xp'), 0);
-assert.equal(g.run('s.inventory[0].length'), 1);
-assert.equal(g.run('s.ailments.some(a => a.poison)'), false);
+prepareTrial(gBase, opt);
+assert.equal(gBase.run('s.members[0].xp'), 0);
+assert.equal(gBase.run('s.inventory[0].length'), 1);
+assert.equal(gBase.run('s.ailments.some(a => a.poison)'), false);
 
 // AI uses professions and stable row IDs; the mage gets the front living unit UID.
-g.run(`s.enemy = {units:[{...makeEnemy('slime',8),row:12}], flagEffect:{}, initiative:'party'};
+const gAI = game(null, seededRandom());
+createParty(gAI, opt.jobs);
+gAI.run(`s.enemy = {units:[{...makeEnemy('slime',8),row:12}], flagEffect:{}, initiative:'party'};
   var simTestCombat=s.enemy; simBattleFinished=false; s.hp=s.members.map(m=>m.maxHP); s.mp=s.members.map(m=>m.maxMP);`);
-planTurn(g);
-assert.equal(g.run('s.attackRows[0]'), 12);
-assert.equal(g.run('s.commands[3]'), 'guard');
-assert.equal(g.run('s.commands[4]'), 'spell');
-assert.equal(g.run('s.magicPlans[4].target'), 8);
-assert.equal(g.run('s.magicPlans[4].id'), 'halito', 'a single living target must not attract katino');
-g.run(`s.enemy.units.push({...makeEnemy('slime',9),row:12});`);
-planTurn(g);
-assert.equal(g.run('s.magicPlans[4].id'), 'katino', 'katino remains available against two or more living enemies');
-g.run('s.enemy.boss=true');
-planTurn(g);
-assert.equal(g.run('s.magicPlans[4].id'), 'halito', 'boss encounters must not use katino');
-g.run('s.enemy.boss=false; s.enemy.units.pop()');
-g.run('s.hp[0]=1');
-planTurn(g);
-assert.equal(g.run('s.magicPlans[2].id'), 'dios');
-assert.equal(g.run('s.magicPlans[2].target'), 0);
-g.run('s.mp[4]=5');
-planTurn(g);
-assert.equal(g.run('s.commands[4]'), 'guard');
+planTurn(gAI);
+assert.equal(gAI.run('s.attackRows[0]'), 12);
+assert.equal(gAI.run('s.commands[3]'), 'guard');
+assert.equal(gAI.run('s.commands[4]'), 'spell');
+assert.equal(gAI.run('s.magicPlans[4].target'), 8);
+assert.equal(gAI.run('s.magicPlans[4].id'), 'halito', 'a single living target must not attract katino');
+gAI.run(`s.enemy.units.push({...makeEnemy('slime',9),row:12});`);
+planTurn(gAI);
+assert.equal(gAI.run('s.magicPlans[4].id'), 'katino', 'katino remains available against two or more living enemies');
+gAI.run('s.enemy.boss=true');
+planTurn(gAI);
+assert.equal(gAI.run('s.magicPlans[4].id'), 'halito', 'boss encounters must not use katino');
+gAI.run('s.enemy.boss=false; s.enemy.units.pop()');
+gAI.run('s.hp[0]=1');
+planTurn(gAI);
+assert.equal(gAI.run('s.magicPlans[2].id'), 'dios');
+assert.equal(gAI.run('s.magicPlans[2].target'), 0);
+gAI.run('s.mp[4]=5');
+planTurn(gAI);
+assert.equal(gAI.run('s.commands[4]'), 'guard');
 
 // Failed fleeing spends one turn, including a party initiative, with no attack.
-g.run('s.hp=s.hp.map(()=>1); Math.random=()=>.999; var simEnemyHP=s.enemy.units[0].hp;');
-assert.throws(() => resolveBattle(g, 1), /未決着/);
-assert.equal(g.run('s.enemy.initiative'), 'normal');
-assert.equal(g.run('s.hp.every(h=>h===1)'), true);
-assert.equal(g.run('s.enemy.units[0].hp'), g.run('simEnemyHP'));
-g.run('Math.random=()=>0');
-assert.equal(resolveBattle(g).outcome, 'escape');
-g.run('s.enemy=simTestCombat; s.ailments=s.ailments.map(()=>({poison:true,paralysis:0}))');
-const wipe = resolveBattle(g);
+gAI.run('s.hp=s.hp.map(()=>1); Math.random=()=>.999; var simEnemyHP=s.enemy.units[0].hp;');
+assert.throws(() => resolveBattle(gAI, 1), /未決着/);
+assert.equal(gAI.run('s.enemy.initiative'), 'normal');
+assert.equal(gAI.run('s.hp.every(h=>h===1)'), true);
+assert.equal(gAI.run('s.enemy.units[0].hp'), gAI.run('simEnemyHP'));
+gAI.run('Math.random=()=>0');
+assert.equal(resolveBattle(gAI).outcome, 'escape');
+gAI.run('s.enemy=simTestCombat; s.ailments=s.ailments.map(()=>({poison:true,paralysis:0}))');
+const wipe = resolveBattle(gAI);
 assert.equal(wipe.outcome, 'wipe');
 assert.equal(wipe.deaths, 6);
-g.run(`s.done=false; s.hp=s.members.map(m=>m.maxHP); s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));
+gAI.run(`s.done=false; s.hp=s.members.map(m=>m.maxHP); s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));
   s.enemy={units:[{...makeEnemy('slime',0),row:0,hp:0,rewarded:true}],lootXP:0,lootGold:0};
   finishMonsterBattle();`);
-g.drain();
-assert.equal(resolveBattle(g).outcome, 'win');
+gAI.drain();
+assert.equal(resolveBattle(gAI).outcome, 'win');
 
 const report = simulate(opt);
 assert.deepEqual(simulate(opt), report, 'same invocation must be reproducible');

codex
**完了**しました。装備済み状態を `simBase` に保存し、`prepareTrial` 後も残るようにしました。Lv1基準への成長リセットは維持しています。変更は [combat.cjs](/workspace/dungeonsweeper/scripts/sim/combat.cjs) と [selftest.cjs](/workspace/dungeonsweeper/scripts/sim/selftest.cjs) です。

回帰テストで装備保持を確認し、固定seedのLv9・4Fでは装備なしとshop／dropの結果がそれぞれ異なることを確認しました。Lv15・10F守護者戦（各30戦）では、勝率が装備なし **0%**、shop **73.3%**、drop **96.7%** でした。

`node scripts/sim/selftest.cjs`、`node tests/game.cjs`、`node tests/training.cjs` はすべてPASSし、`git diff --check` も通過しました。ブラウザでは未確認です。
tokens used
45,799
**完了**しました。装備済み状態を `simBase` に保存し、`prepareTrial` 後も残るようにしました。Lv1基準への成長リセットは維持しています。変更は [combat.cjs](/workspace/dungeonsweeper/scripts/sim/combat.cjs) と [selftest.cjs](/workspace/dungeonsweeper/scripts/sim/selftest.cjs) です。

回帰テストで装備保持を確認し、固定seedのLv9・4Fでは装備なしとshop／dropの結果がそれぞれ異なることを確認しました。Lv15・10F守護者戦（各30戦）では、勝率が装備なし **0%**、shop **73.3%**、drop **96.7%** でした。

`node scripts/sim/selftest.cjs`、`node tests/game.cjs`、`node tests/training.cjs` はすべてPASSし、`git diff --check` も通過しました。ブラウザでは未確認です。
