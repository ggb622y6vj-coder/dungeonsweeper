OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-astra
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: high
reasoning summaries: none
session id: 01a198bb-6d9d-7800-bfb0-5be60067f649
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
# 01A-heavy-10f-final-boss
ティア：HEAVY　依存：016、017

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
10Fの守護者「迷宮の主」を倒すとゲームクリアになり、11Fへは進めないようにする。

## 変更内容
- 10Fで迷宮の主（labyrinthlord）を倒した時：
  - 下り階段を作らない。
  - `s.cleared=true` を保存する（ash-v1。旧セーブでは undefined を false として扱う）。
  - クリアのログ「迷宮の主は倒れた。迷宮に静寂が戻った……」と、クリア表示（町に戻るボタン付き）を出す。
- travelFloor：MAX_FLOOR(10) より深い階には行けないようにする。
- クリア後もパーティーは町に戻れ、続けて探索もできる（10Fで再び守護者に会っても階段は出ない）。
- 町の画面のどこかに「迷宮踏破済み」の印を出す（小さく、UIの大きな変更はしない）。
- docs/SPECIFICATION.md に終わりの条件を書く。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：
  - 10Fで boss を倒すと cleared=true で、s.cells[s.boss].type が 'down' にならない。
  - travelFloor(11) が false になる。
  - 9Fの守護者を倒すと従来どおり下り階段になる。
  - cleared が保存・復元される。
- シミュレーション：推奨Lv18の6人パーティーで迷宮の主（取り巻き込み）の勝率 65〜90%（当方シム：約78%）。
- 手動：ブラウザで10Fクリア表示が出ること（できなければ未確認と報告）。


## 追加要件（試遊 016検証より）
現状11F以降にも降りられる。ラスボス実装時に必ず10Fで階段を止め、11Fへ降りられないようにし、回帰テストで確認すること。

codex
指定の01A（10Fクリア処理）を進めます。引き継ぎ資料と現行コードを確認し、実装・回帰テスト・共通テストまで行います。

exec
/bin/bash -lc "pwd; rg --files -g 'AGENTS.md' -g 'README*' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g '*01A*' -g '*sim*' -g '*game*' -g '*training*'" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
dist/training.js
dist/game.js
AGENTS.md
README.md
docs/HANDOFF.md
docs/SPECIFICATION.md
data/README.md
tests/training.cjs
tests/game.cjs
tests/training-browser.py

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

exec
/bin/bash -lc 'git status --short; ls /workspace/dsw-queue; cat /workspace/dsw-queue/README-handoff.md' in /workspace/dungeonsweeper
 succeeded in 0ms:
README-handoff.md
assets
design-10f.md
done
report
todo
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

exec
/bin/bash -lc "rg -n 'travelFloor|function win|boss|cleared|function save|function load|function log|visibleCombat|function render|town' dist/game.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
7:function visibleCombat(){return displayCombat===undefined?s.enemy:displayCombat}
10:function attackRowUI(i){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat).filter(g=>g.units.some(e=>!e.rewarded)),chosen=s.attackRows[i];if(!groups.some(g=>String(g.key)===String(chosen)))chosen=groups[0]?.key;return `<label class="attackrow"><span class="sr-only">${NAMES[i]}の攻撃対象の列</span><select data-attack-row="${i}" ${logBusy()||s.commands[i]!=='fight'||s.hp[i]<=0?'disabled':''}>${groups.map(g=>`<option value="${g.key}" ${String(chosen)===String(g.key)?'selected':''}>${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>!e.rewarded).length}</option>`).join('')}</select></label>`}
12:function rollInitiative(action='forward',boss=false){if(boss)return 'normal';let r=Math.random(),enemyChance=action==='back' ? .12 : .10;if(r<enemyChance)return s.watchful?'normal':'enemy';return r<enemyChance+.10?'party':'normal'}
13:function encounter(i,unexplored=false,action='forward'){let boss=s.cells[i].type==='boss',formation=monsterFormation(boss),units=[];for(let [row,id] of formation.slice(0,3).entries()){let [min,max]=enemyDefinition(id).groupSize,n=min+(Math.random()*(max-min+1)|0);for(let j=0;j<n;j++)units.push({...makeEnemy(id,units.length),row})}resetCommandEntry();s.attackRows=s.members.map(()=>0);s.enemy={dataVersion:1,flagEffect:flagEffect(),boss,chestBattle:unexplored,lootGold:0,units,target:0,escapeTo:s.previousPos??s.start,initiative:rollInitiative(action,boss)};identifyEnemies();let message={normal:'敵が現れた！',enemy:'敵の奇襲！',party:'敵はまだ気づいていない！'}[s.enemy.initiative];log(message,{encounter:true});if(s.enemy.flagEffect.bad)log('誤った旗がパーティーを惑わせた！');if(s.enemy.initiative==='enemy'){s.enemy.initiative='normal';enemyTurn(s.members.map(()=>'fight'))}}
15:function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
16:function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function hurt(n){s.hp=s.hp.map(h=>Math.max(0,h-n));if(s.hp.every(h=>h===0)){defeat()}}
17:function cell(i,action='forward'){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;let c=s.cells[i];if(mode==='flag'){if(!c.open)c.flag=c.flag?false:(s.flagKind||'power');render();return}if(!adjacent(s.pos,i)){log('現在地の上下左右に隣接するマスを選んでください。');render();return}if(c.flag){log('旗のあるマスには移動できない。旗を外すと進めます。');render();return}tickAilments(false);if(s.done){render();return}let previous=s.pos,wasOpen=c.open;s.previousPos=previous;s.pos=i;if(c.type==='boss'&&!s.relic){c.open=true;s.pendingBoss={previous};log('守護者と戦いますか？');render();return}if(!c.open){c.open=true;if(c.trap){if(triggerFloorTrap(c)){render();return}}else log(num(i)?`警告：周囲に罠が${num(i)}個。`:'静かな部屋。周囲に罠はない。')}if(!s.done){if(c.type==='down'){s.pendingStairs='down';log(`地下${s.floor+1}階に移動しますか？`)}else if(c.type==='stairs'){s.pendingStairs=true;log(s.floor===1?'町に移動しますか？':`地下${s.floor-1}階に移動しますか？`)}else if(Math.random()<encounterRate(i,wasOpen,action))encounter(i,!wasOpen,action)}render()}
31:function ensureStats(){if(!s.members){s.members=CLASSES.slice(0,3).map(c=>({level:1,xp:0,maxHP:c.hp,maxMP:c.mp,attack:c.attack,ac:c.ac}));s.mp=CLASSES.slice(0,3).map((c,i)=>i===1?Math.min(c.mp,(s.spell===undefined?c.mp:s.spell*SPELLS.blast.cost)):i===2?Math.min(c.mp,(s.heal===undefined?c.mp:s.heal*SPELLS.heal.cost)):0);if(s.area==='town')s.mp=s.members.map(m=>m.maxMP);delete s.spell;delete s.heal}s.mp??=s.members.map(m=>m.maxMP);if(s.enemy&&!s.enemy.units){let old=s.enemy,id=old.boss?'guardian':'skeleton';s.enemy={boss:old.boss,target:0,units:[{id,uid:0,hp:old.hp,rewarded:false}]}}}
35:function renderStats(){ $('#partyreorder').disabled=!idle()||s.done; $('#statsbody').innerHTML=s.members.map((_,i)=>{let m=shownMember(i);let values=[['HP',`${(displayVitals?.hp||s.hp)[i]}/${m.maxHP}`],['MP',`${(displayVitals?.mp||s.mp)[i]}/${m.maxMP}`],['STR',m.str],['AC',effectiveAC(i)],['IQ',m.intelligence],['PIE',m.piety],['経験値',m.xp],['NEXT',m.level>=LEVEL_CAP?'上限':Math.max(0,requiredXP(m.level+1,i)-m.xp)]];return `<article class="statcard"><h3>${NAMES[i]} <small>Lv.${m.level} · ${i<3?'前衛':'後衛'}</small>${ailmentTags(i)}</h3><dl class="stat-metrics">${values.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div class="stat-actions"><button data-stat-inventory="${i}" ${!idle()?'disabled':''}>アイテム</button>${hasSpells(i)?`<button data-stat-cast="${i}" ${s.enemy||logBusy()?'disabled':''}>呪文</button>`:''}</div></article>`}).join('')}
39:function renderCatalog(){ $('#catalogbody').innerHTML=`<table><thead><tr><th>敵</th><th>HP</th><th>攻撃</th><th>AC</th><th>経験値</th><th>群れ</th><th>金貨</th></tr></thead><tbody>${ENEMIES.map(e=>`<tr><td>${e.name}</td><td>${diceLabel({dice:e.hp})}</td><td>${diceLabel({dice:e.attack})}</td><td>${e.ac}</td><td>${e.xp}</td><td>${e.groupSize.join("〜")}体</td><td>${diceLabel({dice:e.gold})} ÷3（切捨）</td></tr>`).join('')}</tbody></table>`}
40:function drawEnemies(){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat),height=Math.min(130,260/groups.length);return groups.map((g,row)=>{let y=62+row*height;let visible=g.units.filter(e=>!e.rewarded);return visible.map((e,col)=>{if(e.rewarded)return '';let width=Math.min(108,560/visible.length-8),x=320+(col-(visible.length-1)/2)*(width+8);return `<g data-enemy-uid="${e.uid}"><rect x="${x-width/2}" y="${y}" width="${width}" height="${height-9}" rx="6" fill="#20271f" stroke="#66725d"/><text x="${x}" y="${y+height*.65}" text-anchor="middle" fill="#dac595" font-size="52">${enemyDefinition(e.id).icon}</text><text x="${x}" y="${y+height-18}" text-anchor="middle" fill="#dac595" font-size="16">${e.sleep>0?'Zzz':''}</text></g>`}).join('')}).join('')}
41:function ensureProfile(){ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members)migrateStrength(r.members,r.members.job??0);ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
46:function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));levelUp();s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render();showLevelReport()}
47:function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
48:function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
49:function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
53:function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
55:function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
56:function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
57:function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
62:function face(i){if(i<0)return {fill:'#202722',label:'外壁',symbol:'',sub:''};let c=s.cells[i];return {color:c.flag?FLAG_COLORS[placedFlag(c)]:'#e8d2a2',fill:c.open?'#3b493c':c.safe?'#34413a':'#151f1b',label:c.open?'探索済み':c.safe?'安全確認済み':'未探索',symbol:c.open&&c.type==='boss'?'☠':c.open&&c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.flag?'⚑':c.open?(c.spent?'×':String(num(i))):c.disarmed?'✓':c.safe?'✓':'？',sub:c.disarmed?'罠を解除済み':c.spent?'作動済みの罠':c.flag?'旗あり':c.open?'周囲の罠の数':''}}
63:function scene(){let combat=!!visibleCombat(),f=face(target()),l=face(target(-1)),r=face(target(1));if(combat){for(const v of [f,l,r])if(/^\d+$/.test(v.symbol))v.symbol='';}let txt=(x,y,t,size=17,color='#d6d9c9')=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="700">${t}</text>`;let panel=(v,x,y)=>txt(x,y+24,v.symbol,x===320&&s.light&&diagonalSight().some(i=>i>=0)?38:58,v.color);let battle=visibleCombat()?drawEnemies():s.pendingBoss?`<rect x="200" y="90" width="240" height="170" rx="8" fill="#231b18" stroke="#b58663"/>${txt(320,196,'☠',55)}`:'';$('#scene').innerHTML=`<svg viewBox="0 0 640 400" preserveAspectRatio="none" role="img" aria-label="正面：${f.label} ${f.symbol}、左：${l.label} ${l.symbol}、右：${r.label} ${r.symbol}"><path d="M0 0H640L440 100H200Z" fill="#121914"/><path d="M0 400H640L440 300H200Z" fill="#2d382d"/><path d="M0 0L200 100V300L0 400Z" fill="${l.fill}"/><path d="M640 0L440 100V300L640 400Z" fill="${r.fill}"/><path d="M200 100H440V300H200Z" fill="${f.fill}"/><g fill="none" stroke="#829079" stroke-width="1.5"><path d="M0 0L200 100H440L640 0M0 400L200 300H440L640 400M200 100V300M440 100V300"/></g>${panel(l,96,185,'左のマス')}${panel(f,320,185,'正面のマス')}${panel(r,544,185,'右のマス')}${combat?'':txt(320,378,String(num(s.pos)),36,'#ffdf9e')}${distantSight()}${battle}</svg>${visibleCombat()?`<div class="scene-enemies" aria-label="敵の列">${enemyGroups(visibleCombat()).filter(g=>g.units.some(e=>!e.rewarded)).map(g=>`<div>${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>!e.rewarded).length}</div>`).join('')}</div>`:''}${encounterNotice?`<div class="encounter-notice" role="status">${encounterNotice}</div>`:''}`}
64:function render(){ensureProfile();$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();$('#maptoggle').hidden=s.area!=='dungeon';if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic?' / 秘宝 ✦':''}`;$('#party').innerHTML=NAMES.map((n,i)=>`${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`).join('');$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${s.pos===i?num(i):c.open?(c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div><button id="flee">逃げる</button>`;$('#flee').onclick=flee;$('#flee').disabled=logBusy()||combat.boss||combat.flagEffect?.bad;renderCommandEntry()}$('#frontflag').disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();scene()}
66:$('#bossyes').onclick=()=>s.pendingStairs?answerStairs(true):answerBoss(true);$('#bossno').onclick=()=>s.pendingStairs?answerStairs(false):answerBoss(false);$('#board').onclick=e=>{let b=e.target.closest('[data-i]');if(b)flag(+b.dataset.i)};document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>move(b.dataset.action));$('#frontflag').onclick=()=>flag(target());document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;let action={ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right',a:'strafeLeft',A:'strafeLeft',d:'strafeRight',D:'strafeRight'}[e.key];if(action){e.preventDefault();if(!e.repeat)move(action)}});
69:$('#backtown').onclick=enterTown;$('#entrance').onclick=enterDungeon;$('#blacksmith').onclick=()=>{if(!s.members.length)return;renderShop();$('#shopdialog').showModal()};$('#shopclose').onclick=()=>$('#shopdialog').close();$('#inventoryclose').onclick=()=>$('#inventorydialog').close();$('#shopmember').onchange=()=>{renderShop();$('#shopnotice').textContent=''};$('#shopitems').onclick=e=>{let b=e.target.closest('[data-buy]');if(b)buy(b.dataset.buy,+$('#shopmember').value)};$('#shopinventory').onclick=()=>openInventory(+$('#shopmember').value);$('#inventoryslots').onclick=e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.useMedicine!==undefined)openMedicine(inventoryMember,+b.dataset.useMedicine);if(b.dataset.equip!==undefined)equip(inventoryMember,+b.dataset.equip);if(b.dataset.sell!==undefined)sell(inventoryMember,+b.dataset.sell)};
70:try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type='down'}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
76:$('#resetopen').onclick=()=>$('#resetdialog').showModal();$('#resetcancel').onclick=()=>$('#resetdialog').close();$('#resetconfirm').onclick=()=>{s=null;fresh();s.area='town';s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);$('#resetdialog').close();render()};
91:function rememberFloor(){s.floors??={};s.floors[s.floor]={floor:s.floor,size:s.size,cells:structuredClone(s.cells),start:s.start,boss:s.boss,relic:s.relic};}
92:function travelFloor(next,fromTown=false){let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}
100:function escapeChance(){if(!s.enemy||s.enemy.boss||s.enemy.flagEffect?.bad)return 0;let party=s.members.reduce((a,m,i)=>{if(s.hp[i]>0&&!s.ailments[i].poison&&!s.ailments[i].paralysis){a.total+=m.level;a.count++}return a},{total:0,count:0}),enemies=s.enemy.units.reduce((a,e)=>{if(e.hp>0&&!e.sleep){a.total+=monsterLevel(e);a.count++}return a},{total:0,count:0});if(!party.count)return 10;let bonus=party.count===1?15:party.count===2?10:party.count===3?5:0,partyAverage=party.total/party.count,enemyAverage=enemies.count?enemies.total/enemies.count:0;return Math.max(10,Math.min(95,50+5*(partyAverage-enemyAverage)+bonus))}
101:function flee(){if(logBusy()||!s.enemy||s.done||s.enemy.boss||s.enemy.flagEffect?.bad)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}if(Math.random()*100<escapeChance()){let from=s.pos,to=s.enemy.escapeTo??s.previousPos??s.start;if(!adjacent(from,to)){to=around(from).find(i=>adjacent(from,i)&&s.cells[i].open&&!s.cells[i].trap)??from}s.enemy=null;s.pos=to;s.previousPos=from;log('逃走に成功。一歩前のマスへ戻った。')}else{log('逃走に失敗！');if(s.enemy.initiative==='party')s.enemy.initiative='normal';else enemyTurn(s.members.map(()=>'flee'))}render()}

exec
/bin/bash -lc "head -130 tests/game.cjs; rg -n 'boss|travelFloor|save|restore|load|MAX_FLOOR' tests/game.cjs; cat tests/training-browser.py" in /workspace/dungeonsweeper
 succeeded in 0ms:
const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
drain();run(`
s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');if(s.hp.some((h,i)=>h!==maxHP(i))||s.mp.some((h,i)=>h!==s.members[i].maxMP))throw Error('refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
Math.random=()=>.5;if(hits(3,3)||!hits(3,9))throw Error('AC direction');Math.random=()=>0;if(hits(100,9))throw Error('natural1');Math.random=()=>.999;if(!hits(-100,-10))throw Error('natural20');
s.enemy={boss:false,target:1,units:[{id:'slime',uid:0,hp:1000,rewarded:false},{id:'wolf',uid:1,hp:1,rewarded:false}]};s.commands=['fight','guard','guard'];var oldxp=s.members[0].xp;attack();if(!s.enemy||s.enemy.units[0].hp!==1000||s.enemy.units[1].hp!==0||s.members[0].xp!==oldxp||s.enemy.pendingXP!==14)throw Error('target or reward');`);drain();run(`var ex=s.members[0].xp;killReward(s.enemy.units[1]);if(s.members[0].xp!==ex)throw Error('double reward');s.enemy.units[0].hp=1000;s.mp[1]=2;s.magicPlans[1]={id:'halito',target:0};s.commands=['guard','spell','guard'];attack();if(s.mp[1]!==0||s.enemy.units[0].hp!==992)throw Error('spell MP damage');`);drain();run(`s.enemy=null;s.mp[2]=1;var before=s.hp.join();castMagic(2,'dios',0);if(s.hp.join()!==before||s.mp[2]!==1)throw Error('insufficient MP');s.area='dungeon';delete s.members;delete s.mp;s.spell=2;s.heal=1;s.enemy={boss:false,hp:11};ensureProfile();if(s.mp[1]!==8||s.mp[2]!==3||s.enemy.units[0].hp!==11)throw Error('migration');`);
console.log('PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.cells[s.pos].chest={gold:7,opened:false,trap:'none'};s.scan=2;var oldgold=s.gold;Math.random=()=>.99;openChest(true);if(s.gold!==oldgold+21||currentChest())throw Error('safe chest');`);drain();run(`openChest(false);if(s.gold!==oldgold+21)throw Error('double chest');s.cells[s.pos].chest={gold:9,opened:false};s.scan=0;if(!currentChest())throw Error('new chest');s.hp=[32,24,26];afflict(0,'poison');tickAilments();if(s.hp[0]!==30)throw Error('poison');afflict(1,'paralysis');tickAilments();if(s.ailments[1].paralysis!==3)throw Error('paralysis');`);drain();run(`abandonChest()`);drain();run(`enterTown();if(s.ailments.some(a=>a.poison||a.paralysis))throw Error('town cure');`);console.log('PASS direct chest, once-only rewards, poison, paralysis, town cure');

drain();run(`for(let floor of [1,2,3]){let expected=[9,15,23][floor-1],boardSize=6+floor*2;if(trapCount(floor,boardSize)!==expected)throw Error('trap count formula');for(let trial=0;trial<1000;trial++){fresh(floor);if(s.cells.filter(c=>c.trap).length!==expected)throw Error('generated trap count');let path=[s.start],p=s.start;while(p!==s.boss){let choices=[];if(p%size()!==s.boss%size())choices.push(p+(p%size()<s.boss%size()?1:-1));if((p/size()|0)!==(s.boss/size()|0))choices.push(p+(p<s.boss?size():-size()));p=choices.find(i=>i===s.boss||!s.cells[i].trap);if(p===undefined)throw Error('trapped guardian path');path.push(p)}if([s.start,...around(s.start),...path].some(i=>s.cells[i].trap))throw Error('unsafe start/guardian path')}}`);drain();console.log('PASS floor trap counts and 1000 generated maps per floor preserve start area and guardian path');
drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');

drain();run(`s.area='dungeon';s.cells[s.pos].chest={gold:100,opened:false};var chestPos=s.pos,chestGold=s.gold;move('forward');if(s.pos!==chestPos)throw Error('chest movement');abandonChest();if(currentChest()||s.gold!==chestGold)throw Error('abandon');`);drain();run(`if(s.cells[chestPos].chest)throw Error('chest remains');s.score={total:100};s.history=[{}];s.immediateChestVersion=0;ensureProfile();if('score' in s||'history' in s)throw Error('legacy cleanup');`);console.log('PASS mandatory chest decision, abandonment without reward, legacy score cleanup');
drain();run(`var escapeOriginalMembers=structuredClone(s.members),escapeOriginalHP=s.hp.slice(),escapeOriginalAilments=structuredClone(s.ailments);fresh(1);s.members=Array.from({length:6},(_,i)=>({...structuredClone(s.members[i%3]),level:1}));s.hp=Array(6).fill(20);s.ailments=Array.from({length:6},()=>({poison:false,paralysis:0}));s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'wolf',uid:0,hp:20}]};if(escapeChance()!==45)throw Error('escape six level 1 vs level 2');s.members.forEach(m=>m.level=10);if(escapeChance()!==90)throw Error('escape six level 10 vs level 2');s.members=s.members.slice(0,1);s.hp=s.hp.slice(0,1);s.ailments=s.ailments.slice(0,1);s.members[0].level=1;if(escapeChance()!==60)throw Error('escape one level 1 vs level 2');s.members[0].level=20;if(escapeChance()!==95)throw Error('escape upper clamp');s.hp[0]=0;if(escapeChance()!==10)throw Error('escape no eligible party');s.hp[0]=20;s.members[0].level=1;s.enemy.units[0].id='goblin';if(escapeChance()!==60)throw Error('escape one level 1 vs level 2 after eligibility restore');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members[0].level=20;s.enemy.units[0].id='wolf';if(escapeChance()!==95)throw Error('escape clamp at 95');Math.random=()=>0;var oldGold=s.gold;flee();if(s.enemy||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape');s.members=escapeOriginalMembers;s.hp=escapeOriginalHP;s.ailments=escapeOriginalAilments`);console.log('PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction');
drain();run(`
s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.done=false;s.area='dungeon';s.hp=[32,24,26];s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.members[1].level=13;s.members[2].level=13;delete s.members[1].known;delete s.members[2].known;Math.random=()=>0;ensureMagic();
if(MAGIC.length!==25||s.members[1].known.length!==12||s.members[2].known.length!==13)throw Error('learning migration');
var known=JSON.stringify(s.members.map(m=>m.known));Math.random=()=>.99;ensureMagic();if(JSON.stringify(s.members.map(m=>m.known))!==known)throw Error('reroll');
s.mp=[0,200,200];s.enemy={boss:false,units:[{id:'goblin',uid:0,hp:500},{id:'goblin',uid:1,hp:500},{id:'wolf',uid:2,hp:500}]};
castMagic(1,'mahalito',0);if(s.enemy.units[0].hp!==476||s.enemy.units[1].hp!==476||s.enemy.units[2].hp!==500)throw Error('group');
castMagic(1,'mamorlis',null);if(s.enemy.units.some(e=>e.acPenalty!==3))throw Error('debuff');
var base=effectiveAC(0);castMagic(2,'matu',null);castMagic(2,'kalki',null);if(effectiveAC(0)!==base-2)throw Error('strongest buff');
Math.random=()=>0;castMagic(1,'katino',0);if(s.enemy.units[0].sleep!==2||s.enemy.units[1].sleep!==2||s.enemy.units[2].sleep)throw Error('sleep group');
var beforeSleepHP=s.hp.join();enemyTurn(['fight','fight','fight']);if(s.hp.join()!==beforeSleepHP||s.enemy.units[0].sleep!==1)throw Error('sleep turn');
s.enemy=null;if(effectiveAC(0)!==base)throw Error('buff expires');
s.hp[0]=1;s.ailments[0]={poison:true,paralysis:3};castMagic(2,'madi',0);if(s.hp[0]!==maxHP(0)||s.ailments[0].poison||s.ailments[0].paralysis)throw Error('restore');
s.hp[0]=0;var mp=s.mp[2];castMagic(2,'dios',0);if(s.hp[0]||s.mp[2]!==mp)throw Error('no revive');
s.hp[0]=10;s.cells[s.pos].chest={gold:3,opened:false,trap:'poison'};castMagic(2,'calfo',null);if(currentChest().reading!=='毒'||currentChest().trap!=='poison'||currentChest().opened)throw Error('identify');delete s.cells[s.pos].chest;
castMagic(2,'lomilwa',null);if(!s.light)throw Error('light');
if(validMagicTarget(magic('malor'),999))throw Error('unvisited warp');castMagic(1,'malor',s.floor);if(s.pos!==s.start||s.pendingStairs)throw Error('warp');
`);drain();run(`enterTown();if(s.light)throw Error('town light');`);console.log('PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp');
drain();run(`
s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.done=false;s.area='dungeon';s.floor=1;s.hp=s.members.map(m=>m.maxHP);
if(ENEMIES.length!==88)throw Error('CSV count');for(let f=1;f<=10;f++){s.floor=f;ENEMIES.filter(e=>e.floor===f).forEach(e=>{if(enemyDefinition(e.id).xp!==e.xp)throw Error('fixed CSV XP')})}s.floor=1;
var thresholds=s.members.map(m=>JSON.stringify(m.xpTargets));Math.random=()=>{throw Error('unexpected reroll')};ensureProgression();if(s.members.some((m,i)=>JSON.stringify(m.xpTargets)!==thresholds[i]))throw Error('persistent thresholds');
var previousMembers=s.members;s.members=CLASSES.map(c=>({level:1,xp:0}));Math.random=()=>.5;ensureProgression();if(requiredXP(2,0)!==92||requiredXP(2,2)!==115||requiredXP(2,1)!==138)throw Error('class thresholds');for(let i=0;i<3;i++)for(let lv=2;lv<=30;lv++)if(requiredXP(lv,i)<=requiredXP(lv-1,i))throw Error('nonmonotonic');
s.members=[{level:8,xp:2900},{level:8,xp:2900},{level:8,xp:2900}];ensureProgression();if(s.members.some(m=>m.level!==8||m.xp!==2900||m.xpTargets[8]!==2800))throw Error('legacy migration');s.members=previousMembers;
for(let r of [0,.999]){Math.random=()=>r;s.cells[s.pos].type='';encounter(s.pos);if(new Set(s.enemy.units.map(e=>e.uid)).size!==s.enemy.units.length)throw Error('uids');for(let g of enemyGroups()){let range=enemyDefinition(g.id).groupSize;if(g.units.length!==range[r===0?0:1])throw Error('group bound');}if(!drawEnemies().includes('<rect'))throw Error('group drawing');}
s.cells[s.pos].type='boss';var formationRolls=[0,.99,0];Math.random=()=>formationRolls.shift()??.99;encounter(s.pos);if(s.enemy.units.length!==3||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian'||s.enemy.units[2].id==='guardian')throw Error('guardian escort formation');
s.enemy=null;s.cells[s.pos].type='';s.members.forEach((m,i)=>{m.level=1;m.xp=m.xpTargets[2]});var beforeGrowth=s.members.map(m=>m.maxMP);levelUp();if(s.members.some((m,i)=>m.maxMP-beforeGrowth[i]!== (i===0?0:2)))throw Error('MP growth');
`);drain();console.log('PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth');
drain();run(`
s.floor=1;s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={boss:false,units:[{id:'slime',uid:0,hp:1,rewarded:false},{id:'slime',uid:1,hp:999,rewarded:false}],target:0};s.commands=['fight','guard','guard'];Math.random=()=>.99;attack();
if(s.commands.some(c=>c!=='fight'))throw Error('guard reset');
if(!drawEnemies().includes('data-enemy-uid="0"'))throw Error('early removal');
`);
while(timers.length){timers.shift()();run(`if(s.logs[0]==='敵を倒した。金貨2枚を獲得。'){if(drawEnemies().includes('data-enemy-uid="0"')||!drawEnemies().includes('data-enemy-uid="1"'))throw Error('kill sync')}else if(s.logs[0].includes('ダメージ')&&!s.logs.some(t=>t==='敵を倒した。金貨2枚を獲得。')){if(!drawEnemies().includes('data-enemy-uid="0"'))throw Error('damage early removal')}`)}
run(`
s.enemy={boss:false,chestBattle:true,lootGold:0,units:[{id:'slime',uid:0,hp:1,rewarded:false},{id:'slime',uid:1,hp:1,rewarded:false}],target:0};s.members[1].known.push('mahalito');s.mp[1]=100;s.magicPlans[1]={id:'mahalito',target:0};s.commands=['guard','spell','guard'];attack();if(s.enemy!==null||s.commands.some(c=>c!=='fight')||s.magicPlans.some(Boolean))throw Error('spell reset');if(!drawEnemies().includes('data-enemy-uid="0"')||!drawEnemies().includes('data-enemy-uid="1"'))throw Error('last battle early removal');
`);
let killsShown=0;while(timers.length){timers.shift()();if(run("s.logs[0]==='敵を倒した。'")){killsShown++;let icons=run("(drawEnemies().match(/data-enemy-uid=/g)||[]).length");if(icons!==Math.max(0,2-killsShown))throw Error('group kill sequence')}}
run(`
if(drawEnemies()!=='')throw Error('battle icons remain');
var colored=coloredLog('戦士の攻撃。オーク戦士に12ダメージ。僧侶のHPが8回復した。');
if(!colored.includes('class="log-ally">戦士</span>')||!colored.includes('class="log-enemy">オーク戦士</span>')||!colored.includes('class="log-damage">12ダメージ</span>')||!colored.includes('class="log-heal">8回復</span>'))throw Error('log colors');
if(coloredLog('<img src=x onerror=alert(1)>').includes('<img'))throw Error('log escaping');
`);console.log('PASS single/group/last kill log synchronization, guard and spell reset, log colors and escaping');
drain();run(`s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;s.area='dungeon';s.floor=1;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.cells.forEach(c=>{c.type='';c.trap=false;c.open=true;c.flag=false;delete c.chest});Math.random=()=>.99;`);
for(let dir=0;dir<4;dir++){
run(`s.pos=size()*3+3;s.dir=${dir};var origin=s.pos;var leftTile=target(-1);move('strafeLeft');if(s.pos!==leftTile||s.dir!==${dir})throw Error('left strafe');`);drain();
run(`move('strafeRight');if(s.pos!==origin||s.dir!==${dir})throw Error('right strafe');`);drain();
}
run(`s.pos=0;s.dir=0;move('strafeLeft');if(s.pos!==0||s.dir!==0)throw Error('wall strafe');`);drain();
run(`s.pos=size()*3+3;s.dir=0;var stay=s.pos;s.enemy={boss:false,units:[{id:'slime',uid:0,hp:10}]};move('strafeRight');if(s.pos!==stay)throw Error('combat strafe');s.enemy=null;s.pendingStairs=true;move('strafeRight');if(s.pos!==stay)throw Error('stairs strafe');s.pendingStairs=false;
if(!coloredLog('僧侶はディアルマを唱えた。HPが12回復した。').includes('class="log-spell">ディアルマ</span>'))throw Error('spell color or prefix');
render();if(!$('#gametitle').hidden||$('#party').innerHTML.includes('data-inventory')||$('#party').innerHTML.includes('<span>MP ')||$('#party').innerHTML.includes('⚔'))throw Error('compact UI');s.area='town';render();if($('#gametitle').hidden)throw Error('town title');
`);console.log('PASS strafe all directions, orientation, walls, battle/stairs locks, spell color, compact party and title visibility');
drain();run(`
s.area='dungeon';s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;delete s.cells[s.pos].chest;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.cells[s.pos].type='';Math.random=()=>.999;encounter(s.pos);
if(enemyGroups().length!==3||enemyGroups()[0].id!==enemyGroups()[2].id)throw Error('three independent rows');
s.attackRows=[2,1,0];if(selectedEnemy(0)!==undefined||rowKey(selectedEnemy(1))!==1||rowKey(selectedEnemy(2))!==0)throw Error('member targeting');
render();if(!$('.controls').hidden)throw Error('combat controls');
s.members[1].known.push('dilto');s.mp[1]=100;castMagic(1,'dilto',s.enemy.units.find(e=>e.row===2).uid);if(s.enemy.units.some(e=>e.row===0&&e.acPenalty)||s.enemy.units.some(e=>e.row===2&&!e.acPenalty))throw Error('spell crosses rows');
`);drain();run(`s.enemy=null;render();if($('.controls').hidden)throw Error('exploration controls');s.inventory[0]=['healingPotion','sword','helm','antidote'];s.equipped[0]=1;s.armor[0]={head:2,body:null,feet:null};s.hp[1]=1;var medicineMP=s.mp.join();Math.random=()=>.999;if(!useMedicine(0,0,1)||s.hp[1]!==9||s.inventory[0].length!==3||s.equipped[0]!==0||s.armor[0].head!==1||s.mp.join()!==medicineMP)throw Error('healing medicine / equipment indices');`);drain();run(`s.ailments[1].poison=true;if(!useMedicine(0,2,1)||s.ailments[1].poison||s.inventory[0].length!==2)throw Error('antidote');`);drain();run(`s.inventory[0].push('healingPotion');s.hp[1]=maxHP(1);if(useMedicine(0,2,1)||s.inventory[0].length!==3)throw Error('wasted medicine');`);drain();run(`s.hp[1]=1;s.enemy={boss:false,units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['item','guard','guard'];s.itemPlans[0]={slot:2,target:1,id:'healingPotion'};Math.random=()=>0;var medicineMP=s.mp.join();attack();if(s.inventory[0].length!==2||s.commands.some(c=>c!=='fight')||s.itemPlans.some(Boolean)||s.mp.join()!==medicineMP)throw Error('battle medicine');`);drain();run(`s.enemy=null;s.inventory[0]=['sword'];Math.random=()=>0;dropMedicine();if(s.inventory[0][1]!=='healingPotion')throw Error('medicine drop');var rolls=[0,.99];Math.random=()=>rolls.shift()??.99;dropMedicine();if(s.inventory[0][2]!=='antidote')throw Error('antidote drop');ensureProfile();if(s.inventory[0][2]!=='antidote')throw Error('medicine migration');`);drain();
console.log('PASS three rows, independent member targeting, group spell isolation, hidden exploration controls, medicine effects, slot shifts, battle action/reset, drops and save compatibility');
drain();run(`
s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
var lockedFloor=s.floor;if(travelFloor(2)!==false||s.floor!==lockedFloor||s.cells[s.boss].type!=='boss')throw Error('guardian bypass');
`);drain();run(`
s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss,expectedFormation=monsterFormation(true);if(expectedFormation.length!==2||expectedFormation[0]!=='guardian'||expectedFormation[1]==='guardian')throw Error('guardian escort encounter');Math.random=()=>.999;encounter(s.boss);s.enemy.units.forEach(e=>e.row=e.id==='guardian'?0:1);s.enemy.boss=true;s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');Math.random=()=>.999;
`);drain();run(`attack()`);drain();run(`if(s.enemy){s.attackRows=[1,1,1];attack()}`);drain();run(`
if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=s.members.map(()=>0);s.commands=s.members.map(()=> 'fight');attack();`);drain();run(`if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
s.cells[2].open=true;s.cells[3].flag='power';rememberFloor();var oldFloor2=JSON.stringify(s.cells);travelFloor(1);if(s.cells[s.boss].type!=='down')throw Error('cleared floor retained');s.pos=s.boss;travelFloor(2);if(JSON.stringify(s.cells)!==oldFloor2)throw Error('dungeon roundtrip');
var inventoryBefore=JSON.stringify(s.inventory),goldBefore=s.gold,xpBefore=s.members.map(m=>m.xp).join();enterTown();if(s.area!=='town'||s.floor!==1||Object.keys(s.floors).length||s.cells.some(c=>c.open||c.flag||c.spent||c.disarmed)||s.cells[s.boss].type!=='boss')throw Error('town reset all floors');if(JSON.stringify(s.inventory)!==inventoryBefore||s.gold!==goldBefore||s.members.map(m=>m.xp).join()!==xpBefore)throw Error('town reset profile');enterDungeon();if(s.cells.filter(c=>c.open).length!==1||!s.cells[s.start].open)throw Error('new expedition');
`);drain();run(`
var oldMembers=s.members;s.members=[{level:2,xp:105,xpTargets:Array.from({length:31},(_,l)=>50*l*(l-1))},{level:2,xp:105,xpTargets:Array.from({length:31},(_,l)=>50*l*(l-1))},{level:2,xp:105,xpTargets:Array.from({length:31},(_,l)=>50*l*(l-1))}];Math.random=()=>{throw Error('migration must not reroll')};ensureProgression();if(s.members.some(m=>m.level!==2||m.xp!==105||m.xpTargets[2]!==100||m.xpTargets[3]!==330))throw Error('15 percent XP migration');var targets=JSON.stringify(s.members);ensureProgression();if(JSON.stringify(s.members)!==targets)throw Error('double XP inflation');s.members=oldMembers;
s.enemy={units:[{id:'wolf',uid:0,row:0,hp:0},{id:'wolf',uid:1,row:0,hp:10},{id:'wolf',uid:2,row:0,hp:20},{id:'slime',uid:3,row:1,hp:10}],target:2};s.attackRows=[0,1,0];if(selectedEnemy(0).uid!==1||selectedEnemy(1).uid!==3)throw Error('first living per row');s.enemy.units[1].hp=0;if(selectedEnemy(0).uid!==2)throw Error('advance within row');s.enemy.units[2].hp=0;if(selectedEnemy(0)!==undefined)throw Error('do not switch rows mid turn');
`);console.log('PASS guardian gates / same-tile stairs, floor round trips and town reset, profile retention, XP +15% migration once, first living target and empty-row action');
drain();run(`
s.enemy=null;s.cells.forEach(c=>c.flag=false);var ts=s.cells.filter(c=>c.trap);ts[0].flag='power';ts[1].flag='guard';ts[2].flag='magic';var ef=flagEffect();if(ef.counts.power!==1||ef.counts.guard!==1||ef.counts.magic!==1)throw Error('typed flags');s.flagKind='guard';if(placedFlag(ts[0])!=='power')throw Error('recolor');Math.random=()=>0;s.enemy={units:[{id:'slime',uid:0,hp:10}],flagEffect:ef};if(flagDamage(20)!==30||flagDamage(20,true)!==10)throw Error('mixed procs');s.mp[1]=10;flagConsumeMP(1,3);if(s.mp[1]!==8)throw Error('half MP combat');s.enemy=null;flagConsumeMP(1,3);if(s.mp[1]!==6)throw Error('half MP field');s.cells.find(c=>!c.trap).flag='guard';s.enemy={units:[{id:'slime',uid:0,hp:10}],flagEffect:flagEffect()};if(flagDamage(20)!==20||flagDamage(20,true)!==30||escapeChance()!==0)throw Error('mixed curse');s.enemy=null;
`);console.log('PASS typed flags, independent procs, no recoloring, half MP in combat and field, exclusive curses');
drain();run(`
s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;fresh(1);s.cells.forEach(c=>{c.trap=false;c.flag=false;c.chest=undefined});
if(flagChance({counts:{power:0}},'power')!==0||flagChance({counts:{power:1}},'power')!==.04||flagChance({counts:{power:5}},'power')!==.2||flagChance({counts:{power:10}},'power')!==.4||flagChance({counts:{power:100}},'power')!==.4)throw Error('4-40 percent linear');
`);
for (const [r,kind] of [[.1,'needle'],[.3,'blast'],[.6,'poison'],[.8,'paralysis'],[.95,'teleport']]){drain();run(`s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.done=false;var orig=s.pos,c=s.cells[orig];c.trap=true;Math.random=()=>${r};triggerFloorTrap(c);if(c.trap||!c.spent||c.trapKind!=='${kind}')throw Error('trap consume');if('${kind}'==='needle'&&s.hp.filter((h,i)=>h<maxHP(i)).length!==1)throw Error('single damage');if('${kind}'==='blast'&&s.hp.some((h,i)=>h>=maxHP(i)))throw Error('party damage');if('${kind}'==='poison'&&s.ailments.some(a=>!a.poison))throw Error('poison gas');if('${kind}'==='paralysis'&&!s.ailments.some(a=>a.paralysis>0))throw Error('paralysis');if('${kind}'==='teleport'&&(s.pos===orig||s.cells[s.pos].type||s.cells[s.pos].trap||!s.cells[s.pos].open||s.enemy||s.pendingStairs))throw Error('safe teleport');`)}
drain();run(`
s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}],target:0};resetCommandEntry();render();if(!$('#commandentry').innerHTML.includes('戦士：行動')||!$('#attack').hidden)throw Error('first prompt');s.commands[0]='guard';confirmCommand(0);if(!$('#commandentry').innerHTML.includes('魔法使い：行動'))throw Error('second prompt');confirmCommand(1);if(!$('#commandentry').innerHTML.includes('僧侶：行動'))throw Error('third prompt');confirmCommand(2);if($('#attack').hidden||!$('#commandreviewpopup').innerHTML.includes('<td>守る</td>'))throw Error('review');resetCommandEntry();s.hp[0]=0;s.ailments[1].paralysis=3;render();if(!$('#commandentry').innerHTML.includes('僧侶：行動'))throw Error('skip incapacitated');
`);console.log('PASS linear 4-40% flags, five floor traps, safe teleport and sequential command entry/review');
drain();run(`
s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.mp=[0,100,100];s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.area='dungeon';s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}]};resetCommandEntry();render();
$('#commandentry').onclick({target:{closest:q=>q==='[data-command-choice]'?{dataset:{commandChoice:'fight'}}:null}});if(commandIndex!==1||choosingRow||s.attackRows[0]!==0)throw Error('single row attack auto target');
openMagic(1);chooseBattleSpell(1,magic('halito'));if($('#magicdialog').open||pendingSpell||commandIndex!==2||s.magicPlans[1].target!==0)throw Error('single row spell auto target');
s.enemy.units.push({id:'wolf',uid:1,row:1,hp:99});resetCommandEntry();commandIndex=1;openMagic(1);chooseBattleSpell(1,magic('halito'));if($('#magicdialog').open||!pendingSpell||!$('#commandentry').innerHTML.includes('data-spell-target'))throw Error('main spell target');
$('#commandentry').onclick({target:{closest:q=>q==='[data-spell-target]'?{dataset:{spellTarget:'1'}}:null}});if(s.magicPlans[1].target!==1||commandIndex!==2||pendingSpell)throw Error('spell target confirmed');
s.enemy=null;render();renderStats();if($('#party').innerHTML.includes('data-magic')||!$('#statsbody').innerHTML.includes('data-stat-cast'))throw Error('field spell placement');s.flagKind='magic';renderFlags();if(!$('#flagopen').textContent.includes('呪禁')||!$('#mapflagopen').textContent.includes('呪禁'))throw Error('flag labels');
`);console.log('PASS automatic single-row targets, battle spell modal closure and main-screen targets, field spell placement, linked flag labels');

drain();run(`s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}],target:0};resetCommandEntry();confirmCommand(0);confirmCommand(1);confirmCommand(2);if(!$('#flee').hidden||$('#attack').hidden||!$('#commandreviewpopup').innerHTML.includes('<table')||$('#commandentry').innerHTML.includes('data-edit-command'))throw Error('review layout');$('#commandentry').onclick({target:{closest:q=>q==='[data-command-back]'?{}:null}});if(commandIndex!==2||!$('#attack').hidden||$('#flee').hidden)throw Error('review back');if(spellTargetButtons(magic('halito')).includes('<span>'))throw Error('target grid extra cell');`);console.log('PASS review table, back to final member, hidden flee in review, aligned target grid');

drain();run(`s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;s.area='dungeon';s.cells[s.pos].chest={opened:false};s.members[2].known.push('calfo');s.mp[2]=10;s.hp[2]=20;s.ailments[2].paralysis=0;if(calfoCaster()!==2)throw Error('chest calfo available');s.mp[2]=0;if(calfoCaster()!==-1)throw Error('calfo insufficient MP');s.mp[2]=10;s.ailments[2].paralysis=1;if(calfoCaster()!==-1)throw Error('calfo paralysis');s.ailments[2].paralysis=0;delete s.cells[s.pos].chest;if(calfoCaster()!==-1)throw Error('no chest');s.light=true;s.pos=3*size()+3;for(let d=0;d<4;d++){s.dir=d;let ids=diagonalSight();if(ids.length!==2||ids.some(i=>!around(s.pos).includes(i)||adjacent(s.pos,i)))throw Error('diagonal direction');}s.pos=0;s.dir=0;if(diagonalSight().some(i=>i!==-1)||distantSight())throw Error('outer wall');s.pos=3*size()+3;scene();if(!$('#scene').innerHTML.includes('class="透視"')||$('#scene').innerHTML.includes('歩先'))throw Error('SVG light view');s.light=false;if(diagonalSight().length||distantSight())throw Error('light off');s.cells[s.pos].open=true;s.cells[s.pos+1].open=true;for(let i of around(s.pos).slice(0,2))s.cells[i].trap=true;s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}]};scene();if($('#scene').innerHTML.includes('>2</text>')||$('#scene').innerHTML.includes('>1</text>'))throw Error('combat scene trap numbers');s.enemy=null;scene();if(!$('#scene').innerHTML.includes('>2</text>'))throw Error('exploration scene number restored');`);console.log('PASS chest Calfo availability, all-facing diagonal sight and wall boundaries');
// Six-person migration, profession-independent formation and new exploration rules.
drain();run(`
s=structuredClone(sixInitial);ensureProfile();if(s.members.length!==6||s.members.map(m=>m.job).join()!=='0,0,0,2,1,3'||s.inventory[5][0]!=='dagger')throw Error('default six');var initialIDs=s.members.map(m=>m.id).join();ensureProfile();if(s.members.map(m=>m.id).join()!==initialIDs)throw Error('migration twice');
s.members[4].xp=123;s.inventory[4].push('runestaff');s.equipped[4]=1;s.armor[4]={};var mageID=s.members[4].id;s.area='town';reorderParty([4,1,2,3,0,5]);if(jobOf(0)!==1||s.members[0].id!==mageID||s.members[0].xp!==123||equippedWeapon(0).id!=='runestaff'||effectiveAC(0)!==9)throw Error('formation profile identity');
s.area='dungeon';if(reorderParty([0,1,2,3,4,5]))throw Error('field formation');s.mp[0]=100;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}]};s.cells.forEach(c=>c.flag=false);Math.random=()=>.5;var enemyBefore=s.enemy.units[0].hp;castMagic(0,'halito',0);if(s.enemy.units[0].hp>=enemyBefore||s.mp[0]!==98)throw Error('reordered spell');
`);drain();run(`
s.enemy=null;s.area='town';let records=partyRecords();if(!setPartyFromRoster(records,[0,1,2,3,4,-1])||s.reserve.length!==1||thiefMember()!==-1)throw Error('bench thief');var all=[...partyRecords(),...s.reserve];if(!setPartyFromRoster(all,[0,1,2,3,4,5])||thiefMember()!==5)throw Error('restore thief');var saved=JSON.stringify(s);s=JSON.parse(saved);ensureProfile();if(s.members.length!==6||equippedWeapon(0).id!=='runestaff')throw Error('reload six');
s.area='dungeon';s.pos=27;s.dir=0;s.cells[target()].open=false;s.cells[target()].trap=true;s.mp[0]=100;s.dumapicUses=0;Math.random=()=>.5;castMagic(0,'dumapic',null);if(s.mp[0]!==98||spellCost(magic('dumapic'))!==4||!s.cells[target()].trap||s.cells[target()].open)throw Error('survey cost or mutates cell');
`);drain();run(`if(s.logs[0]!=='前方は罠の可能性あり')throw Error('survey correct');Math.random=()=>.99;castMagic(0,'dumapic',null);if(s.mp[0]!==94||spellCost(magic('dumapic'))!==8)throw Error('survey double');`);drain();run(`if(s.logs[0]!=='前方にはなにもない')throw Error('survey wrong');s.cells[target()].open=true;castMagic(0,'dumapic',null);if(s.mp[0]!==86||s.dumapicUses!==3)throw Error('failed survey cost');`);drain();run(`if(s.logs[0]!=='調査に失敗した。')throw Error('explored survey');s.dumapicUses=4;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.dumapicUses!==4||s.commands.length!==6||s.magicPlans.length!==6)throw Error('floor profile preservation');enterTown();if(s.dumapicUses!==0)throw Error('survey town reset');`);drain();run(`
s.area='dungeon';s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.cells[s.pos].chest={gold:10,trap:'poison',opened:false};var goldBefore=s.gold;Math.random=()=>.5;thiefOpenChest();if(currentChest()||s.gold!==goldBefore+30||s.ailments.some(a=>a.poison))throw Error('thief success');
`);drain();run(`s.cells[s.pos].chest={gold:10,trap:'needle',opened:false};var goldBefore=s.gold,hpBefore=s.hp.reduce((a,b)=>a+b);Math.random=()=>.99;thiefOpenChest();if(currentChest()||s.cells[s.pos].chest||s.gold!==goldBefore||s.hp.reduce((a,b)=>a+b)>=hpBefore)throw Error('thief failure trap and destroy');`);drain();run(`
s.hp=s.members.map(m=>m.maxHP);s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['guard','guard','guard','fight','fight','fight'];var rear=s.hp.slice(3).join(),enemyBefore=s.enemy.units[0].hp;Math.random=()=>.99;attack();if(s.enemy.units[0].hp!==enemyBefore||s.hp.slice(3).join()!==rear||s.commands.length!==6)throw Error('front rear reach');
`);drain();run(`
s.hp=s.members.map(m=>m.maxHP);var xpBefore=s.members.map(m=>m.xp);killReward({id:'slime',hp:0,rewarded:false});if(s.members.some((m,i)=>m.xp!==xpBefore[i]))throw Error('premature xp');let earned=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members.some((m,i)=>m.xp!==xpBefore[i]+Math.max(1,Math.floor(earned/s.members.length))))throw Error('all six split xp');
`);drain();run(`s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};resetCommandEntry();for(let i=0;i<6;i++){s.commands[i]='guard';confirmCommand(i)}if(commandIndex!==6||$('#attack').hidden)throw Error('six sequential');for(let [name,kind] of Object.entries({怪力:'power',堅牢:'guard',呪禁:'magic'}))if(!coloredLog(name+'の旗がはためいた！').includes('log-flag-'+kind))throw Error('flag log color');`);
console.log('PASS six-person defaults/migration, reordered jobs and gear, bench/restore/save, doubled survey/accuracy/reset, thief success/failure, front/rear combat and six XP/commands');
drain();run(`s=structuredClone(sixInitial);s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.enemy=null;s.done=false;delete s.cells[s.pos].chest;ensureProfile();s.inventory[0]=['healingPotion','sword','helm'];s.equipped[0]=1;s.armor[0]={head:2};var beforeTotal=s.inventory.reduce((n,a)=>n+a.length,0);if(!transferItem(0,0,4)||s.inventory[4].at(-1)!=='healingPotion'||s.equipped[0]!==0||s.armor[0].head!==1||equippedWeapon(0).id!=='sword')throw Error('transfer / shifted gear');if(s.inventory.reduce((n,a)=>n+a.length,0)!==beforeTotal||transferItem(0,0,4)||transferItem(0,1,4)||transferItem(0,0,0))throw Error('equipped / self transfer');s.inventory[0].push('antidote');s.inventory[1]=Array(10).fill('sword');if(transferItem(0,2,1))throw Error('full recipient');s.enemy={units:[]};if(transferItem(0,2,4)||applyPartyOrder([5,1,2,3,4,0]))throw Error('combat lock');s.enemy=null;var identity=s.members[0].id;var gear=s.inventory[0].join();if(!applyPartyOrder([5,1,2,3,4,0])||s.members[5].id!==identity||s.inventory[5].join()!==gear||equippedWeapon(5).id!=='sword'||s.armor[5].head!==1)throw Error('field reorder identity');if(applyPartyOrder([0,0,2,3,4,5]))throw Error('duplicate formation');if($('#party').onclick!==$('#statsopen').onclick)throw Error('party entry');renderStats();if($('#statsbody').innerHTML.includes('習得状況')||!$('#statsbody').innerHTML.includes('>アイテム</button>'))throw Error('labels');`);console.log('PASS item transfer/capacity/equipped guard, slot remapping, field reorder identity, combat locks and party entry');
drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.04||flagChance({counts:{[kind]:5}},kind)!==.2||flagChance({counts:{[kind]:10}},kind)!==.4||flagChance({counts:{[kind]:100}},kind)!==.4)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, linear 4-40% flag curve');

5:s.enemy={boss:false,target:1,units:[{id:'slime',uid:0,hp:1000,rewarded:false},{id:'wolf',uid:1,hp:1,rewarded:false}]};s.commands=['fight','guard','guard'];var oldxp=s.members[0].xp;attack();if(!s.enemy||s.enemy.units[0].hp!==1000||s.enemy.units[1].hp!==0||s.members[0].xp!==oldxp||s.enemy.pendingXP!==14)throw Error('target or reward');`);drain();run(`var ex=s.members[0].xp;killReward(s.enemy.units[1]);if(s.members[0].xp!==ex)throw Error('double reward');s.enemy.units[0].hp=1000;s.mp[1]=2;s.magicPlans[1]={id:'halito',target:0};s.commands=['guard','spell','guard'];attack();if(s.mp[1]!==0||s.enemy.units[0].hp!==992)throw Error('spell MP damage');`);drain();run(`s.enemy=null;s.mp[2]=1;var before=s.hp.join();castMagic(2,'dios',0);if(s.hp.join()!==before||s.mp[2]!==1)throw Error('insufficient MP');s.area='dungeon';delete s.members;delete s.mp;s.spell=2;s.heal=1;s.enemy={boss:false,hp:11};ensureProfile();if(s.mp[1]!==8||s.mp[2]!==3||s.enemy.units[0].hp!==11)throw Error('migration');`);
6:console.log('PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
10:drain();run(`for(let floor of [1,2,3]){let expected=[9,15,23][floor-1],boardSize=6+floor*2;if(trapCount(floor,boardSize)!==expected)throw Error('trap count formula');for(let trial=0;trial<1000;trial++){fresh(floor);if(s.cells.filter(c=>c.trap).length!==expected)throw Error('generated trap count');let path=[s.start],p=s.start;while(p!==s.boss){let choices=[];if(p%size()!==s.boss%size())choices.push(p+(p%size()<s.boss%size()?1:-1));if((p/size()|0)!==(s.boss/size()|0))choices.push(p+(p<s.boss?size():-size()));p=choices.find(i=>i===s.boss||!s.cells[i].trap);if(p===undefined)throw Error('trapped guardian path');path.push(p)}if([s.start,...around(s.start),...path].some(i=>s.cells[i].trap))throw Error('unsafe start/guardian path')}}`);drain();console.log('PASS floor trap counts and 1000 generated maps per floor preserve start area and guardian path');
11:drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');
14:drain();run(`var escapeOriginalMembers=structuredClone(s.members),escapeOriginalHP=s.hp.slice(),escapeOriginalAilments=structuredClone(s.ailments);fresh(1);s.members=Array.from({length:6},(_,i)=>({...structuredClone(s.members[i%3]),level:1}));s.hp=Array(6).fill(20);s.ailments=Array.from({length:6},()=>({poison:false,paralysis:0}));s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'wolf',uid:0,hp:20}]};if(escapeChance()!==45)throw Error('escape six level 1 vs level 2');s.members.forEach(m=>m.level=10);if(escapeChance()!==90)throw Error('escape six level 10 vs level 2');s.members=s.members.slice(0,1);s.hp=s.hp.slice(0,1);s.ailments=s.ailments.slice(0,1);s.members[0].level=1;if(escapeChance()!==60)throw Error('escape one level 1 vs level 2');s.members[0].level=20;if(escapeChance()!==95)throw Error('escape upper clamp');s.hp[0]=0;if(escapeChance()!==10)throw Error('escape no eligible party');s.hp[0]=20;s.members[0].level=1;s.enemy.units[0].id='goblin';if(escapeChance()!==60)throw Error('escape one level 1 vs level 2 after eligibility restore');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members[0].level=20;s.enemy.units[0].id='wolf';if(escapeChance()!==95)throw Error('escape clamp at 95');Math.random=()=>0;var oldGold=s.gold;flee();if(s.enemy||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape');s.members=escapeOriginalMembers;s.hp=escapeOriginalHP;s.ailments=escapeOriginalAilments`);console.log('PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction');
19:s.mp=[0,200,200];s.enemy={boss:false,units:[{id:'goblin',uid:0,hp:500},{id:'goblin',uid:1,hp:500},{id:'wolf',uid:2,hp:500}]};
26:s.hp[0]=1;s.ailments[0]={poison:true,paralysis:3};castMagic(2,'madi',0);if(s.hp[0]!==maxHP(0)||s.ailments[0].poison||s.ailments[0].paralysis)throw Error('restore');
31:`);drain();run(`enterTown();if(s.light)throw Error('town light');`);console.log('PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp');
39:s.cells[s.pos].type='boss';var formationRolls=[0,.99,0];Math.random=()=>formationRolls.shift()??.99;encounter(s.pos);if(s.enemy.units.length!==3||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian'||s.enemy.units[2].id==='guardian')throw Error('guardian escort formation');
43:s.floor=1;s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={boss:false,units:[{id:'slime',uid:0,hp:1,rewarded:false},{id:'slime',uid:1,hp:999,rewarded:false}],target:0};s.commands=['fight','guard','guard'];Math.random=()=>.99;attack();
49:s.enemy={boss:false,chestBattle:true,lootGold:0,units:[{id:'slime',uid:0,hp:1,rewarded:false},{id:'slime',uid:1,hp:1,rewarded:false}],target:0};s.members[1].known.push('mahalito');s.mp[1]=100;s.magicPlans[1]={id:'mahalito',target:0};s.commands=['guard','spell','guard'];attack();if(s.enemy!==null||s.commands.some(c=>c!=='fight')||s.magicPlans.some(Boolean))throw Error('spell reset');if(!drawEnemies().includes('data-enemy-uid="0"')||!drawEnemies().includes('data-enemy-uid="1"'))throw Error('last battle early removal');
64:run(`s.pos=size()*3+3;s.dir=0;var stay=s.pos;s.enemy={boss:false,units:[{id:'slime',uid:0,hp:10}]};move('strafeRight');if(s.pos!==stay)throw Error('combat strafe');s.enemy=null;s.pendingStairs=true;move('strafeRight');if(s.pos!==stay)throw Error('stairs strafe');s.pendingStairs=false;
74:`);drain();run(`s.enemy=null;render();if($('.controls').hidden)throw Error('exploration controls');s.inventory[0]=['healingPotion','sword','helm','antidote'];s.equipped[0]=1;s.armor[0]={head:2,body:null,feet:null};s.hp[1]=1;var medicineMP=s.mp.join();Math.random=()=>.999;if(!useMedicine(0,0,1)||s.hp[1]!==9||s.inventory[0].length!==3||s.equipped[0]!==0||s.armor[0].head!==1||s.mp.join()!==medicineMP)throw Error('healing medicine / equipment indices');`);drain();run(`s.ailments[1].poison=true;if(!useMedicine(0,2,1)||s.ailments[1].poison||s.inventory[0].length!==2)throw Error('antidote');`);drain();run(`s.inventory[0].push('healingPotion');s.hp[1]=maxHP(1);if(useMedicine(0,2,1)||s.inventory[0].length!==3)throw Error('wasted medicine');`);drain();run(`s.hp[1]=1;s.enemy={boss:false,units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['item','guard','guard'];s.itemPlans[0]={slot:2,target:1,id:'healingPotion'};Math.random=()=>0;var medicineMP=s.mp.join();attack();if(s.inventory[0].length!==2||s.commands.some(c=>c!=='fight')||s.itemPlans.some(Boolean)||s.mp.join()!==medicineMP)throw Error('battle medicine');`);drain();run(`s.enemy=null;s.inventory[0]=['sword'];Math.random=()=>0;dropMedicine();if(s.inventory[0][1]!=='healingPotion')throw Error('medicine drop');var rolls=[0,.99];Math.random=()=>rolls.shift()??.99;dropMedicine();if(s.inventory[0][2]!=='antidote')throw Error('antidote drop');ensureProfile();if(s.inventory[0][2]!=='antidote')throw Error('medicine migration');`);drain();
75:console.log('PASS three rows, independent member targeting, group spell isolation, hidden exploration controls, medicine effects, slot shifts, battle action/reset, drops and save compatibility');
77:s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
78:var lockedFloor=s.floor;if(travelFloor(2)!==false||s.floor!==lockedFloor||s.cells[s.boss].type!=='boss')throw Error('guardian bypass');
80:s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss,expectedFormation=monsterFormation(true);if(expectedFormation.length!==2||expectedFormation[0]!=='guardian'||expectedFormation[1]==='guardian')throw Error('guardian escort encounter');Math.random=()=>.999;encounter(s.boss);s.enemy.units.forEach(e=>e.row=e.id==='guardian'?0:1);s.enemy.boss=true;s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');Math.random=()=>.999;
82:if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=s.members.map(()=>0);s.commands=s.members.map(()=> 'fight');attack();`);drain();run(`if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
83:s.cells[2].open=true;s.cells[3].flag='power';rememberFloor();var oldFloor2=JSON.stringify(s.cells);travelFloor(1);if(s.cells[s.boss].type!=='down')throw Error('cleared floor retained');s.pos=s.boss;travelFloor(2);if(JSON.stringify(s.cells)!==oldFloor2)throw Error('dungeon roundtrip');
84:var inventoryBefore=JSON.stringify(s.inventory),goldBefore=s.gold,xpBefore=s.members.map(m=>m.xp).join();enterTown();if(s.area!=='town'||s.floor!==1||Object.keys(s.floors).length||s.cells.some(c=>c.open||c.flag||c.spent||c.disarmed)||s.cells[s.boss].type!=='boss')throw Error('town reset all floors');if(JSON.stringify(s.inventory)!==inventoryBefore||s.gold!==goldBefore||s.members.map(m=>m.xp).join()!==xpBefore)throw Error('town reset profile');enterDungeon();if(s.cells.filter(c=>c.open).length!==1||!s.cells[s.start].open)throw Error('new expedition');
111:drain();run(`s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;s.area='dungeon';s.cells[s.pos].chest={opened:false};s.members[2].known.push('calfo');s.mp[2]=10;s.hp[2]=20;s.ailments[2].paralysis=0;if(calfoCaster()!==2)throw Error('chest calfo available');s.mp[2]=0;if(calfoCaster()!==-1)throw Error('calfo insufficient MP');s.mp[2]=10;s.ailments[2].paralysis=1;if(calfoCaster()!==-1)throw Error('calfo paralysis');s.ailments[2].paralysis=0;delete s.cells[s.pos].chest;if(calfoCaster()!==-1)throw Error('no chest');s.light=true;s.pos=3*size()+3;for(let d=0;d<4;d++){s.dir=d;let ids=diagonalSight();if(ids.length!==2||ids.some(i=>!around(s.pos).includes(i)||adjacent(s.pos,i)))throw Error('diagonal direction');}s.pos=0;s.dir=0;if(diagonalSight().some(i=>i!==-1)||distantSight())throw Error('outer wall');s.pos=3*size()+3;scene();if(!$('#scene').innerHTML.includes('class="透視"')||$('#scene').innerHTML.includes('歩先'))throw Error('SVG light view');s.light=false;if(diagonalSight().length||distantSight())throw Error('light off');s.cells[s.pos].open=true;s.cells[s.pos+1].open=true;for(let i of around(s.pos).slice(0,2))s.cells[i].trap=true;s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}]};scene();if($('#scene').innerHTML.includes('>2</text>')||$('#scene').innerHTML.includes('>1</text>'))throw Error('combat scene trap numbers');s.enemy=null;scene();if(!$('#scene').innerHTML.includes('>2</text>'))throw Error('exploration scene number restored');`);console.log('PASS chest Calfo availability, all-facing diagonal sight and wall boundaries');
118:s.enemy=null;s.area='town';let records=partyRecords();if(!setPartyFromRoster(records,[0,1,2,3,4,-1])||s.reserve.length!==1||thiefMember()!==-1)throw Error('bench thief');var all=[...partyRecords(),...s.reserve];if(!setPartyFromRoster(all,[0,1,2,3,4,5])||thiefMember()!==5)throw Error('restore thief');var saved=JSON.stringify(s);s=JSON.parse(saved);ensureProfile();if(s.members.length!==6||equippedWeapon(0).id!=='runestaff')throw Error('reload six');
120:`);drain();run(`if(s.logs[0]!=='前方は罠の可能性あり')throw Error('survey correct');Math.random=()=>.99;castMagic(0,'dumapic',null);if(s.mp[0]!==94||spellCost(magic('dumapic'))!==8)throw Error('survey double');`);drain();run(`if(s.logs[0]!=='前方にはなにもない')throw Error('survey wrong');s.cells[target()].open=true;castMagic(0,'dumapic',null);if(s.mp[0]!==86||s.dumapicUses!==3)throw Error('failed survey cost');`);drain();run(`if(s.logs[0]!=='調査に失敗した。')throw Error('explored survey');s.dumapicUses=4;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.dumapicUses!==4||s.commands.length!==6||s.magicPlans.length!==6)throw Error('floor profile preservation');enterTown();if(s.dumapicUses!==0)throw Error('survey town reset');`);drain();run(`
127:console.log('PASS six-person defaults/migration, reordered jobs and gear, bench/restore/save, doubled survey/accuracy/reset, thief success/failure, front/rear combat and six XP/commands');
129:drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.04||flagChance({counts:{[kind]:5}},kind)!==.2||flagChance({counts:{[kind]:10}},kind)!==.4||flagChance({counts:{[kind]:100}},kind)!==.4)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, linear 4-40% flag curve');
131:drain();run(`s.enemy={boss:false,initiative:'party',units:[{id:'goblin',uid:0,row:0,hp:100}]};s.done=false;s.hp=s.members.map(m=>m.maxHP);s.members.forEach(m=>m.level=1);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));Math.random=()=>.999;var escapeHP=s.hp.join();flee();if(!s.enemy||s.hp.join()!==escapeHP||s.enemy.initiative!=='normal')throw Error('surprise flee failure consumes free turn');`);drain();console.log('PASS failed escape consumes party surprise without enemy retaliation');
137:let savedState=structuredClone(s),savedRandom=Math.random;
162:} finally {s=savedState;Math.random=savedRandom;}
164:drain();run(`{let savedNamesState=structuredClone(s);s.area='town';s.enemy=null;s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.cells[s.pos].chest=null;s.members=[];s.reserve=[];for(let name of ['(','[x','a.b','a*']){let recruit=generateRecruit(name,0);if(!recruit||!registerRecruit(recruit))throw Error('special name register');let roster=trainingRoster(),index=roster.findIndex(r=>r.members.id===recruit.members.id);if(!setPartyFromRoster(roster,[index]))throw Error('special name join');refreshNames();if(coloredLog('テスト').includes('log-ally'))throw Error('unrelated name color');if(coloredLog('aXbの攻撃').includes('log-ally'))throw Error('regex metacharacter interpreted');s.members=[];s.reserve=[];refreshNames();}s=savedNamesState;refreshNames();}`);console.log('PASS special character names do not break log coloring or match as regex');
169:{let savedMonstersState=structuredClone(s);
170:function resetMonstersTest(id){s=structuredClone(savedMonstersState);s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;delete s.cells[s.pos].chest;s.hp=s.members.map(()=>1000);s.mp=s.members.map(()=>100);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.enemy={dataVersion:1,units:[{id,uid:0,row:0,hp:999,identified:true,rewarded:false}],chestBattle:false};displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;resetPartyCommands();s.commands=s.members.map(()=>'fight');}
171:for(let f=1;f<=11;f++){s.floor=f;for(let r of [0,.2,.5,.999]){Math.random=()=>r;let formation=monsterFormation(false);if(formation.length<1||formation.length>3||formation.some(id=>enemyDefinition(id).floor!==Math.min(10,f)||enemyDefinition(id).boss))throw Error('floor pool');if(monsterFormation(true)[0]!==['guardian','general','watcher','minogate','necromancer','vampire','ettin','demongeneral','ancientdragon','labyrinthlord'][Math.min(10,f)-1])throw Error('guardian floor')}}
187:s=structuredClone(savedMonstersState);s.enemy=null;logQueue=[];clearTimeout(logTimer);logTimer=null;displayCombat=undefined;displayVitals=null;
188:}`);console.log('PASS monster floor pools, guardians, flee rewards, mixed victory, summon cap/timing, multi-hit/rear, spell/breath, statuses, instant death, drain, theft, resistances and save migration');
193:run(`var savedPoisonState=structuredClone(s),savedPoisonRandom=Math.random,savedPoisonMode=mode;
220:s=savedPoisonState;Math.random=savedPoisonRandom;mode=savedPoisonMode;refreshNames();`);
225:console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
238:let savedState=structuredClone(s),savedRandom=Math.random;
255:}finally{s=savedState;Math.random=savedRandom;displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;renderShop();}
259:run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[{item:dagger,weight:1}];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
263:drain();run(`{let savedXPState=structuredClone(s);try{
276:}finally{s=savedXPState;}}`);drain();
from playwright.sync_api import sync_playwright
import sys
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in (1280,390):
  ctx=browser.new_context(viewport={'width':width,'height':900},has_touch=width<700)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8000/')
  assert page.locator('#entrance').is_disabled()
  page.locator('#trainingopen').click()
  page.locator('#rollrecruit').click();assert page.locator('#registerrecruit').is_disabled()
  for i,job in enumerate([0,0,0,2,1,3,1]):
   page.locator('#recruitname').fill('冒険者'+str(i));page.locator('#recruitjob').select_option(str(job))
   page.locator('#rollrecruit').click()
   if i==0:
    page.locator('#rollrecruit').click();assert '(' in page.locator('#recruitpreview').inner_text()
   page.locator('#registerrecruit').click();assert page.locator('#registerrecruit').is_disabled()
   if i<6:page.locator('#recruitlist section').last.get_by_role('button',name='加入',exact=True).click()
  assert page.locator('#recruitlist section').last.get_by_role('button',name='加入',exact=True).is_disabled()
  page.locator('#recruitlist section').first.get_by_role('button',name='後ろへ',exact=True).click()
  page.locator('#recruitlist section').first.get_by_role('button',name='離脱',exact=True).click()
  page.locator('#recruitlist section').last.get_by_role('button',name='加入',exact=True).click()
  page.locator('#recruitlist section').first.get_by_role('button',name='登録抹消',exact=True).click()
  page.locator('#recruitdeletecancel').click();assert page.locator('#recruitlist section').count()==7
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert page.locator('#training').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
  page.screenshot(path=f'/tmp/training-{width}.png')
  before=page.evaluate('JSON.stringify(trainingRoster())');order=page.evaluate('s.members.map(m=>m.id)')
  page.reload();assert page.evaluate('JSON.stringify(trainingRoster())')==before;assert page.evaluate('s.members.map(m=>m.id)')==order
  page.locator('#entrance').click();page.wait_for_function('!logBusy()')
  assert page.locator('#party .card').count()==6
  page.locator('#party').click();page.locator('#statsclose').click()
  page.evaluate("s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,rewarded:false}],initiative:'party'};resetPartyCommands();render()")
  assert page.locator('#battle').is_visible()
  page.evaluate('Math.random=()=>.999')
  page.locator('[data-command-choice="fight"]').click()
  for _ in range(5):page.locator('[data-command-choice="guard"]').click()
  page.locator('#attack').click()
  page.wait_for_function('!logBusy()');assert page.evaluate('s.enemy.units[0].hp<999')
  page.evaluate('s.enemy=null;enterTown()');page.wait_for_function('!logBusy()')
  page.locator('#trainingopen').click()
  while page.locator('#recruitlist section').count():
   page.locator('#recruitlist section').first.get_by_role('button',name='登録抹消',exact=True).click();page.locator('#recruitdeleteconfirm').click()
  page.locator('#trainingclose').click();assert page.locator('#entrance').is_disabled()
  page.reload();assert page.evaluate('trainingRoster().length')==0
  assert not errors,errors
  print(f'PASS Chromium {width}px: create/reroll/confirm, seven recruits, cap, reorder/bench/join, delete cancel/confirm, reload, combat, empty party; no JS errors or overflow')
  ctx.close()
 browser.close()

exec
/bin/bash -lc 'rg --files scripts tests dist; ls /workspace/dsw-queue/todo /workspace/dsw-queue/report; cat /workspace/dsw-queue/todo/01A-heavy-10f-final-boss.md; cat scripts/sim/combat.cjs' in /workspace/dungeonsweeper
 succeeded in 0ms:
tests/training.cjs
tests/game.cjs
tests/training-browser.py
dist/flags.js
dist/weapons.js
dist/spells.js
dist/recruits.js
dist/combatui.js
dist/index.html
dist/traps.js
dist/party.js
dist/monsters.js
dist/items.js
dist/game.js
dist/balance.js
dist/training.js
dist/monster-data.js
scripts/compile-monsters.py
scripts/sim/harness.cjs
scripts/sim/combat.cjs
scripts/sim/selftest.cjs
/workspace/dsw-queue/report:
001-bugfix-name-regex-verify.md
001-bugfix-name-regex.md
001b-attempt1.diff
001b-bugfix-row-hit-modifier-verify.md
001b-bugfix-row-hit-modifier.md
001b-codex-retry-output.md
002-attempt1.diff
002-bugfix-poison-death-log-verify.md
002-bugfix-poison-death-log.md
003-bugfix-attack-dead-branch-verify.md
003-bugfix-attack-dead-branch.md
004-bugfix-magicplans-length-verify.md
004-bugfix-magicplans-length.md
005-bugfix-chest-item-pool-verify.md
005-bugfix-chest-item-pool.md
005a-bugfix-chest-unequippable-message-verify.md
005a-bugfix-chest-unequippable-message.md
006-bugfix-summon-cap-verify.md
006-bugfix-summon-cap.md
007-bugfix-combat-hide-numbers-verify.md
007-bugfix-combat-hide-numbers.md
010-attempt1.diff
010-light-sim-tool-codex-retry.md
010-light-sim-tool-retry.md
010-light-sim-tool-verify.md
010-light-sim-tool.md
010a-bugfix-sim-katino-policy-verify.md
010a-bugfix-sim-katino-policy.md
011-attempt1.diff
011-light-exp-split-codex-attempt1-output.md
011-light-exp-split-codex-retry-output.md
011-light-exp-split-verify.md
011-light-exp-split.md
012-light-escape-rate-codex-output.md
012-light-escape-rate-verify.md
012-light-escape-rate.md
013-light-guardian-escort-codex-output.md
013-light-guardian-escort-verify.md
013-light-guardian-escort.md
014-light-trap-count-codex-output.md
014-light-trap-count-verify.md
014-light-trap-count.md
015-light-flag-tuning-codex-output.md
015-light-flag-tuning-verify.md
015-light-flag-tuning.md
015-sim-after.txt
015-sim-before.txt
016-light-floor-config-10f-codex-output.md
016-light-floor-config-10f-verify.md
016-light-floor-config-10f.md
017-light-monsters-4-10f-codex-output.md
017-light-monsters-4-10f-verify.md
017-light-monsters-4-10f.md
017-sim-after.txt
017-sim-before.txt
017b-light-sim-floor-range-codex-output.md
017b-light-sim-floor-range.md
017b-sim-after.txt
017b-sim-before.txt
017c-bugfix-sim-gear-ignored-codex-output.md
017c-bugfix-sim-gear-ignored.md
017c-sim-after.txt
017c-sim-before.txt
018-light-items-4-10f-codex-output.md
018-light-items-4-10f-verify.md
018-light-items-4-10f.md
018-sim-after.txt
018-sim-before.txt
019-light-chest-loot-table-codex-output.md
019-light-chest-loot-table-verify.md
019-light-chest-loot-table.md
019-sim-after.txt
019-sim-before.txt
019a-light-guardian-8f-9f-tuning-codex-output.md
019a-light-guardian-8f-9f-tuning-verify.md
019a-light-guardian-8f-9f-tuning.md
019a-sim-after.txt
019a-sim-before.txt
01A-heavy-10f-final-boss-codex-output.md
01A-sim-before.txt

/workspace/dsw-queue/todo:
019b-light-ancientdragon-tuning.md
01A-heavy-10f-final-boss.md
020-heavy-death-status.md
021-heavy-temple.md
022-light-lost-roster.md
023-light-inn.md
030-heavy-corpse-on-wipe.md
031-heavy-corpse-rescue.md
# 01A-heavy-10f-final-boss
ティア：HEAVY　依存：016、017

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
10Fの守護者「迷宮の主」を倒すとゲームクリアになり、11Fへは進めないようにする。

## 変更内容
- 10Fで迷宮の主（labyrinthlord）を倒した時：
  - 下り階段を作らない。
  - `s.cleared=true` を保存する（ash-v1。旧セーブでは undefined を false として扱う）。
  - クリアのログ「迷宮の主は倒れた。迷宮に静寂が戻った……」と、クリア表示（町に戻るボタン付き）を出す。
- travelFloor：MAX_FLOOR(10) より深い階には行けないようにする。
- クリア後もパーティーは町に戻れ、続けて探索もできる（10Fで再び守護者に会っても階段は出ない）。
- 町の画面のどこかに「迷宮踏破済み」の印を出す（小さく、UIの大きな変更はしない）。
- docs/SPECIFICATION.md に終わりの条件を書く。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：
  - 10Fで boss を倒すと cleared=true で、s.cells[s.boss].type が 'down' にならない。
  - travelFloor(11) が false になる。
  - 9Fの守護者を倒すと従来どおり下り階段になる。
  - cleared が保存・復元される。
- シミュレーション：推奨Lv18の6人パーティーで迷宮の主（取り巻き込み）の勝率 65〜90%（当方シム：約78%）。
- 手動：ブラウザで10Fクリア表示が出ること（できなければ未確認と報告）。


## 追加要件（試遊 016検証より）
現状11F以降にも降りられる。ラスボス実装時に必ず10Fで階段を止め、11Fへ降りられないようにし、回帰テストで確認すること。
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
  // Keep the selected loadout when prepareTrial restores party state.
  // The snapshot is taken after equipping, while growth is still reset from Lv1 each trial.
  g.run('simBase = structuredClone(partyRecords())');
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

exec
/bin/bash -lc "rg -n 'finishBattle|victory|travelFloor|backtown|done=true' dist/*.js; cat scripts/sim/combat.cjs; head -35 tests/game.cjs; rg -n 'town|backtown|script' dist/index.html; ls /workspace/dsw-queue/todo /workspace/dsw-queue/report" in /workspace/dungeonsweeper
 succeeded in 0ms:
dist/spells.js:48: else if(x.effect==='warp'){if(t!==s.floor)travelFloor(t,true);else{s.pos=s.start;s.pendingStairs=false}log(`地下${t}階の上り階段へ転移した。`)}return true}
dist/game.js:18:function finish(){s.done=true;log(s.relic?`秘宝を持ち帰った！ 探索成功。金貨 ${s.gold}枚。`:`無事に帰還。金貨 ${s.gold}枚を持ち帰った。`)}const MAX_HP=[32,24,26],NAMES=['戦士','魔法使い','僧侶'];
dist/game.js:49:function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
dist/game.js:50:function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
dist/game.js:64:function render(){ensureProfile();$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();$('#maptoggle').hidden=s.area!=='dungeon';if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic?' / 秘宝 ✦':''}`;$('#party').innerHTML=NAMES.map((n,i)=>`${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`).join('');$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${s.pos===i?num(i):c.open?(c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div><button id="flee">逃げる</button>`;$('#flee').onclick=flee;$('#flee').disabled=logBusy()||combat.boss||combat.flagEffect?.bad;renderCommandEntry()}$('#frontflag').disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();scene()}
dist/game.js:69:$('#backtown').onclick=enterTown;$('#entrance').onclick=enterDungeon;$('#blacksmith').onclick=()=>{if(!s.members.length)return;renderShop();$('#shopdialog').showModal()};$('#shopclose').onclick=()=>$('#shopdialog').close();$('#inventoryclose').onclick=()=>$('#inventorydialog').close();$('#shopmember').onchange=()=>{renderShop();$('#shopnotice').textContent=''};$('#shopitems').onclick=e=>{let b=e.target.closest('[data-buy]');if(b)buy(b.dataset.buy,+$('#shopmember').value)};$('#shopinventory').onclick=()=>openInventory(+$('#shopmember').value);$('#inventoryslots').onclick=e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.useMedicine!==undefined)openMedicine(inventoryMember,+b.dataset.useMedicine);if(b.dataset.equip!==undefined)equip(inventoryMember,+b.dataset.equip);if(b.dataset.sell!==undefined)sell(inventoryMember,+b.dataset.sell)};
dist/game.js:92:function travelFloor(next,fromTown=false){let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}
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
  // Keep the selected loadout when prepareTrial restores party state.
  // The snapshot is taken after equipping, while growth is still reset from Lv1 each trial.
  g.run('simBase = structuredClone(partyRecords())');
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
const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
drain();run(`
s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');if(s.hp.some((h,i)=>h!==maxHP(i))||s.mp.some((h,i)=>h!==s.members[i].maxMP))throw Error('refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
Math.random=()=>.5;if(hits(3,3)||!hits(3,9))throw Error('AC direction');Math.random=()=>0;if(hits(100,9))throw Error('natural1');Math.random=()=>.999;if(!hits(-100,-10))throw Error('natural20');
s.enemy={boss:false,target:1,units:[{id:'slime',uid:0,hp:1000,rewarded:false},{id:'wolf',uid:1,hp:1,rewarded:false}]};s.commands=['fight','guard','guard'];var oldxp=s.members[0].xp;attack();if(!s.enemy||s.enemy.units[0].hp!==1000||s.enemy.units[1].hp!==0||s.members[0].xp!==oldxp||s.enemy.pendingXP!==14)throw Error('target or reward');`);drain();run(`var ex=s.members[0].xp;killReward(s.enemy.units[1]);if(s.members[0].xp!==ex)throw Error('double reward');s.enemy.units[0].hp=1000;s.mp[1]=2;s.magicPlans[1]={id:'halito',target:0};s.commands=['guard','spell','guard'];attack();if(s.mp[1]!==0||s.enemy.units[0].hp!==992)throw Error('spell MP damage');`);drain();run(`s.enemy=null;s.mp[2]=1;var before=s.hp.join();castMagic(2,'dios',0);if(s.hp.join()!==before||s.mp[2]!==1)throw Error('insufficient MP');s.area='dungeon';delete s.members;delete s.mp;s.spell=2;s.heal=1;s.enemy={boss:false,hp:11};ensureProfile();if(s.mp[1]!==8||s.mp[2]!==3||s.enemy.units[0].hp!==11)throw Error('migration');`);
console.log('PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.cells[s.pos].chest={gold:7,opened:false,trap:'none'};s.scan=2;var oldgold=s.gold;Math.random=()=>.99;openChest(true);if(s.gold!==oldgold+21||currentChest())throw Error('safe chest');`);drain();run(`openChest(false);if(s.gold!==oldgold+21)throw Error('double chest');s.cells[s.pos].chest={gold:9,opened:false};s.scan=0;if(!currentChest())throw Error('new chest');s.hp=[32,24,26];afflict(0,'poison');tickAilments();if(s.hp[0]!==30)throw Error('poison');afflict(1,'paralysis');tickAilments();if(s.ailments[1].paralysis!==3)throw Error('paralysis');`);drain();run(`abandonChest()`);drain();run(`enterTown();if(s.ailments.some(a=>a.poison||a.paralysis))throw Error('town cure');`);console.log('PASS direct chest, once-only rewards, poison, paralysis, town cure');

drain();run(`for(let floor of [1,2,3]){let expected=[9,15,23][floor-1],boardSize=6+floor*2;if(trapCount(floor,boardSize)!==expected)throw Error('trap count formula');for(let trial=0;trial<1000;trial++){fresh(floor);if(s.cells.filter(c=>c.trap).length!==expected)throw Error('generated trap count');let path=[s.start],p=s.start;while(p!==s.boss){let choices=[];if(p%size()!==s.boss%size())choices.push(p+(p%size()<s.boss%size()?1:-1));if((p/size()|0)!==(s.boss/size()|0))choices.push(p+(p<s.boss?size():-size()));p=choices.find(i=>i===s.boss||!s.cells[i].trap);if(p===undefined)throw Error('trapped guardian path');path.push(p)}if([s.start,...around(s.start),...path].some(i=>s.cells[i].trap))throw Error('unsafe start/guardian path')}}`);drain();console.log('PASS floor trap counts and 1000 generated maps per floor preserve start area and guardian path');
drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');

drain();run(`s.area='dungeon';s.cells[s.pos].chest={gold:100,opened:false};var chestPos=s.pos,chestGold=s.gold;move('forward');if(s.pos!==chestPos)throw Error('chest movement');abandonChest();if(currentChest()||s.gold!==chestGold)throw Error('abandon');`);drain();run(`if(s.cells[chestPos].chest)throw Error('chest remains');s.score={total:100};s.history=[{}];s.immediateChestVersion=0;ensureProfile();if('score' in s||'history' in s)throw Error('legacy cleanup');`);console.log('PASS mandatory chest decision, abandonment without reward, legacy score cleanup');
drain();run(`var escapeOriginalMembers=structuredClone(s.members),escapeOriginalHP=s.hp.slice(),escapeOriginalAilments=structuredClone(s.ailments);fresh(1);s.members=Array.from({length:6},(_,i)=>({...structuredClone(s.members[i%3]),level:1}));s.hp=Array(6).fill(20);s.ailments=Array.from({length:6},()=>({poison:false,paralysis:0}));s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'wolf',uid:0,hp:20}]};if(escapeChance()!==45)throw Error('escape six level 1 vs level 2');s.members.forEach(m=>m.level=10);if(escapeChance()!==90)throw Error('escape six level 10 vs level 2');s.members=s.members.slice(0,1);s.hp=s.hp.slice(0,1);s.ailments=s.ailments.slice(0,1);s.members[0].level=1;if(escapeChance()!==60)throw Error('escape one level 1 vs level 2');s.members[0].level=20;if(escapeChance()!==95)throw Error('escape upper clamp');s.hp[0]=0;if(escapeChance()!==10)throw Error('escape no eligible party');s.hp[0]=20;s.members[0].level=1;s.enemy.units[0].id='goblin';if(escapeChance()!==60)throw Error('escape one level 1 vs level 2 after eligibility restore');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members[0].level=20;s.enemy.units[0].id='wolf';if(escapeChance()!==95)throw Error('escape clamp at 95');Math.random=()=>0;var oldGold=s.gold;flee();if(s.enemy||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape');s.members=escapeOriginalMembers;s.hp=escapeOriginalHP;s.ailments=escapeOriginalAilments`);console.log('PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction');
drain();run(`
s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.done=false;s.area='dungeon';s.hp=[32,24,26];s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.members[1].level=13;s.members[2].level=13;delete s.members[1].known;delete s.members[2].known;Math.random=()=>0;ensureMagic();
if(MAGIC.length!==25||s.members[1].known.length!==12||s.members[2].known.length!==13)throw Error('learning migration');
var known=JSON.stringify(s.members.map(m=>m.known));Math.random=()=>.99;ensureMagic();if(JSON.stringify(s.members.map(m=>m.known))!==known)throw Error('reroll');
s.mp=[0,200,200];s.enemy={boss:false,units:[{id:'goblin',uid:0,hp:500},{id:'goblin',uid:1,hp:500},{id:'wolf',uid:2,hp:500}]};
castMagic(1,'mahalito',0);if(s.enemy.units[0].hp!==476||s.enemy.units[1].hp!==476||s.enemy.units[2].hp!==500)throw Error('group');
castMagic(1,'mamorlis',null);if(s.enemy.units.some(e=>e.acPenalty!==3))throw Error('debuff');
var base=effectiveAC(0);castMagic(2,'matu',null);castMagic(2,'kalki',null);if(effectiveAC(0)!==base-2)throw Error('strongest buff');
Math.random=()=>0;castMagic(1,'katino',0);if(s.enemy.units[0].sleep!==2||s.enemy.units[1].sleep!==2||s.enemy.units[2].sleep)throw Error('sleep group');
var beforeSleepHP=s.hp.join();enemyTurn(['fight','fight','fight']);if(s.hp.join()!==beforeSleepHP||s.enemy.units[0].sleep!==1)throw Error('sleep turn');
s.enemy=null;if(effectiveAC(0)!==base)throw Error('buff expires');
s.hp[0]=1;s.ailments[0]={poison:true,paralysis:3};castMagic(2,'madi',0);if(s.hp[0]!==maxHP(0)||s.ailments[0].poison||s.ailments[0].paralysis)throw Error('restore');
s.hp[0]=0;var mp=s.mp[2];castMagic(2,'dios',0);if(s.hp[0]||s.mp[2]!==mp)throw Error('no revive');
s.hp[0]=10;s.cells[s.pos].chest={gold:3,opened:false,trap:'poison'};castMagic(2,'calfo',null);if(currentChest().reading!=='毒'||currentChest().trap!=='poison'||currentChest().opened)throw Error('identify');delete s.cells[s.pos].chest;
castMagic(2,'lomilwa',null);if(!s.light)throw Error('light');
if(validMagicTarget(magic('malor'),999))throw Error('unvisited warp');castMagic(1,'malor',s.floor);if(s.pos!==s.start||s.pendingStairs)throw Error('warp');
`);drain();run(`enterTown();if(s.light)throw Error('town light');`);console.log('PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp');
drain();run(`
s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.done=false;s.area='dungeon';s.floor=1;s.hp=s.members.map(m=>m.maxHP);
if(ENEMIES.length!==88)throw Error('CSV count');for(let f=1;f<=10;f++){s.floor=f;ENEMIES.filter(e=>e.floor===f).forEach(e=>{if(enemyDefinition(e.id).xp!==e.xp)throw Error('fixed CSV XP')})}s.floor=1;
var thresholds=s.members.map(m=>JSON.stringify(m.xpTargets));Math.random=()=>{throw Error('unexpected reroll')};ensureProgression();if(s.members.some((m,i)=>JSON.stringify(m.xpTargets)!==thresholds[i]))throw Error('persistent thresholds');
12:[hidden]{display:none!important}.cell.in-view{background:#2b352d;border-color:#69735e;box-shadow:0 0 4px #c8bd7a22}.cell.open.in-view{background:#18201a}.equipment{width:100%;font-size:11px;padding:6px 3px;color:#d7b881;margin:0 0 5px}#town{margin-top:24px;text-align:center;padding:36px 20px;background:radial-gradient(ellipse at top,#364333,#131a16)}.townart{font-size:80px;color:#d7b881;text-shadow:0 0 45px #bcb16644}#town h2{font-family:serif;letter-spacing:7px;font-weight:400}.townmenu{display:flex;justify-content:center;gap:16px;padding:20px}.townmenu button{min-width:180px;padding:22px}.shoptoolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:16px;flex-wrap:wrap}select{padding:10px;background:#222d24;color:#e0d8bb;border:1px solid #66715a;border-radius:4px}.shopitem{display:flex;gap:16px;align-items:center;border-top:1px solid #3c483b;padding:13px 0}.shopitem>div{flex:1}.shopitem small{display:block;letter-spacing:0}.slot{display:flex;align-items:center;gap:10px;min-height:55px;border-bottom:1px solid #354333;padding:8px 0}.slot>b{flex:1}.slot>small{width:18px;letter-spacing:0}.slot>button{font-size:11px;padding:7px}.slot>span{font-size:12px;color:#a5b198}#backtown{margin-top:15px}.shopitem button{font-size:12px}@media(max-width:700px){.townmenu{flex-direction:column}.slot{gap:6px}.slot>b{font-size:12px}.slot>span{font-size:10px}.equipment{font-size:10px}}
24:.townmenu{flex-wrap:wrap}#training{width:min(720px,94vw)}.recruit-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.recruit-fields label{display:grid;gap:5px}.recruit-fields input,.recruit-fields select{width:100%;min-width:0;font:inherit;padding:10px;background:#222d24;color:#e0d8bb;border:1px solid #66715a;border-radius:4px}#training button{min-height:44px}.recruit-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.recruit-metrics div{background:#222b24;padding:8px}.recruit-metrics dd{margin:0;color:var(--gold)}#recruitlist section{border-top:1px solid var(--line);padding:12px 0;overflow-wrap:anywhere}#recruitlist h4{margin:0;color:var(--gold)}.recruit-actions{display:flex;flex-wrap:wrap;gap:8px}#emptyparty{text-align:center}@media(max-width:420px){#training{padding:14px}.recruit-fields{grid-template-columns:1fr}.recruit-actions button{flex:1;white-space:nowrap}}
25:</style><main><header><div id="gametitle"><h1>迷宮スイーパー</h1></div></header><button id="statsopen" class="iconbutton" aria-label="ステータス" title="ステータス"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3Z"/></svg></button><section id="town" class="panel" hidden><div class="townart" aria-hidden="true">♜</div><h2>灯の町</h2><button id="resetopen">冒険データをリセット</button><div class="townmenu"><button id="trainingopen">訓練所</button><button id="tavernopen">酒場</button><button id="blacksmith">鍛冶屋</button><button id="entrance">迷宮への入り口</button></div></section><p id="emptyparty" role="status">訓練所で冒険者を作成し、パーティに加入させてください。</p><button id="backtown" hidden>町へ戻る</button><div class="layout" id="dungeon"><section><div class="panel"><div class="viewlog"><div id="scene" aria-label="現在地からの視界"></div><div id="log" aria-live="polite" role="log"></div></div><div class="party-wrap"><div id="commandreviewpopup" hidden></div><div class="party" id="party" role="button" tabindex="0" aria-label="パーティーを開く" aria-haspopup="dialog"></div></div><div id="bosschoice" hidden><button id="bossyes">はい</button><button id="bossno">いいえ</button></div><div class="controls"><div class="movement"><div><button data-action="left" aria-label="左旋回" title="左旋回"><span aria-hidden="true">↶</span></button><button data-action="strafeLeft" aria-label="左へ横移動" title="左へ横移動"><span aria-hidden="true">←</span></button></div><div><button data-action="forward" aria-label="前進" title="前進"><span aria-hidden="true">↑</span></button><button data-action="back" aria-label="後退" title="後退"><span aria-hidden="true">↓</span></button></div><div><button data-action="right" aria-label="右旋回" title="右旋回"><span aria-hidden="true">↷</span></button><button data-action="strafeRight" aria-label="右へ横移動" title="右へ横移動"><span aria-hidden="true">→</span></button></div></div><div class="frontactions"><div class="flagactions"><button id="flagopen" aria-label="旗の種類を切り替え">⚑</button><button id="frontflag">正面に旗</button></div></div></div><div id="chestactions" hidden><button id="chestthief" hidden>盗賊が調べて開ける</button><button id="chestcalfo" hidden>カルフォ</button><button id="chestopen">宝箱を直接開ける</button><button id="chestabandon">放棄する</button></div><div id="battle" hidden></div></div></section><section id="mapdock"><div class="panel" id="mappanel"><div class="mapheading"><div class="maplocation">地下1階</div><button id="mapflagopen">⚑ 怪力の旗</button></div><div class="board" id="board"></div></div></section></div>
27:<dialog id="inventorydialog" aria-labelledby="inventorytitle"><div class="dialoghead"><h2 id="inventorytitle"></h2><button id="inventoryclose" aria-label="閉じる">×</button></div><div id="equipmentsummary"></div><details id="transfersection"><summary>アイテムを渡す</summary><label>アイテム<select id="transferitem"></select></label><label>渡す相手<select id="transfermember"></select></label><button id="transfergive">渡す</button><p id="transfernotice" role="status"></p></details><div id="inventoryslots"></div></dialog><button id="maptoggle" aria-haspopup="dialog" aria-label="迷宮の地図を開く">▦ 地図</button><dialog id="mapdialog" aria-label="迷宮の地図"><div class="dialoghead"><span>地図</span><button id="mapclose" aria-label="地図を閉じる">×</button></div><div id="mapdialogbody"></div></dialog><dialog id="statsdialog" aria-labelledby="statstitle"><div class="dialoghead"><h2 id="statstitle">パーティー</h2><span id="status"></span><button id="partyreorder">順番変更</button><button id="statsclose" aria-label="閉じる">×</button></div><div id="partyorder" hidden></div><div id="statsbody"></div></dialog><dialog id="catalogdialog" aria-labelledby="catalogtitle"><div class="dialoghead"><h2 id="catalogtitle">敵データ一覧</h2><button id="catalogclose" aria-label="閉じる">×</button></div><div id="catalogbody"></div></dialog><dialog id="resetdialog"><h2>冒険データをリセットしますか？</h2><p>レベル・経験値・アイテム・装備・金貨・迷宮の進行を初期化します。元に戻せません。</p><button id="resetcancel">キャンセル</button><button id="resetconfirm">リセットを実行</button></dialog><dialog id="magicdialog" aria-labelledby="magictitle"><div class="dialoghead"><h2 id="magictitle"></h2><button id="magicclose" aria-label="閉じる">×</button></div><div id="magiclist"></div><div class="magicfooter"><div id="magictargets"></div><p id="magicnotice" role="status"></p><button id="magiccast" hidden>発動する</button></div></dialog><dialog id="medicinedialog" aria-labelledby="medicinetitle"><div class="dialoghead"><h2 id="medicinetitle">薬</h2><button id="medicineclose" aria-label="閉じる">×</button></div><label>薬 <select id="medicineitem"></select></label><p id="medicinedescription"></p><label>対象 <select id="medicinetarget"></select></label><button id="medicineuse">使う</button></dialog><dialog id="taverndialog" aria-labelledby="taverntitle"><div class="dialoghead"><h2 id="taverntitle">酒場</h2><button id="tavernclose" aria-label="閉じる">×</button></div><div id="tavernslots"></div><p class="tavernhint">空きを除いた先頭3人が前衛、続く3人が後衛になります。</p><button id="tavernsave">この編成にする</button></dialog><dialog id="leveldialog" aria-labelledby="leveltitle"><div class="dialoghead"><h2 id="leveltitle">レベルアップ</h2><button id="levelclose" aria-label="閉じる">×</button></div><div id="levelreport"></div></dialog><dialog id="training" aria-labelledby="trainingtitle"><div class="dialoghead"><h2 id="trainingtitle">訓練所</h2><button id="trainingclose" aria-label="訓練所を閉じる">×</button></div><h3>新規作成</h3><div class="recruit-fields"><label>名前<input id="recruitname" maxlength="20" autocomplete="off"></label><label>職業<select id="recruitjob"><option value="0">戦士</option><option value="2">僧侶</option><option value="1">魔法使い</option><option value="3">盗賊</option></select></label></div><p>職業に適した基本能力に3〜9点を自動配分します。能力値の上限は18です。</p><button id="rollrecruit">生成・再生成</button><div id="recruitpreview" aria-live="polite"></div><button id="registerrecruit" disabled>この能力で登録</button><p id="trainingnotice" role="status"></p><h3>登録メンバー・パーティ編成</h3><p id="trainingcount"></p><div id="recruitlist"></div></dialog><dialog id="recruitdeletedialog" aria-labelledby="recruitdeletetitle"><h2 id="recruitdeletetitle">登録抹消の確認</h2><p id="recruitdeletename"></p><button id="recruitdeletecancel" autofocus>キャンセル</button><button id="recruitdeleteconfirm">登録を抹消する</button></dialog></main><script src="weapons.js"></script><script src="monster-data.js"></script><script src="balance.js"></script><script src="spells.js"></script><script src="items.js"></script><script src="flags.js"></script><script src="traps.js"></script><script src="combatui.js"></script><script src="party.js"></script><script src="monsters.js"></script><script src="recruits.js"></script><script src="game.js"></script><script src="training.js"></script></html>
/workspace/dsw-queue/report:
001-bugfix-name-regex-verify.md
001-bugfix-name-regex.md
001b-attempt1.diff
001b-bugfix-row-hit-modifier-verify.md
001b-bugfix-row-hit-modifier.md
001b-codex-retry-output.md
002-attempt1.diff
002-bugfix-poison-death-log-verify.md
002-bugfix-poison-death-log.md
003-bugfix-attack-dead-branch-verify.md
003-bugfix-attack-dead-branch.md
004-bugfix-magicplans-length-verify.md
004-bugfix-magicplans-length.md
005-bugfix-chest-item-pool-verify.md
005-bugfix-chest-item-pool.md
005a-bugfix-chest-unequippable-message-verify.md
005a-bugfix-chest-unequippable-message.md
006-bugfix-summon-cap-verify.md
006-bugfix-summon-cap.md
007-bugfix-combat-hide-numbers-verify.md
007-bugfix-combat-hide-numbers.md
010-attempt1.diff
010-light-sim-tool-codex-retry.md
010-light-sim-tool-retry.md
010-light-sim-tool-verify.md
010-light-sim-tool.md
010a-bugfix-sim-katino-policy-verify.md
010a-bugfix-sim-katino-policy.md
011-attempt1.diff
011-light-exp-split-codex-attempt1-output.md
011-light-exp-split-codex-retry-output.md
011-light-exp-split-verify.md
011-light-exp-split.md
012-light-escape-rate-codex-output.md
012-light-escape-rate-verify.md
012-light-escape-rate.md
013-light-guardian-escort-codex-output.md
013-light-guardian-escort-verify.md
013-light-guardian-escort.md
014-light-trap-count-codex-output.md
014-light-trap-count-verify.md
014-light-trap-count.md
015-light-flag-tuning-codex-output.md
015-light-flag-tuning-verify.md
015-light-flag-tuning.md
015-sim-after.txt
015-sim-before.txt
016-light-floor-config-10f-codex-output.md
016-light-floor-config-10f-verify.md
016-light-floor-config-10f.md
017-light-monsters-4-10f-codex-output.md
017-light-monsters-4-10f-verify.md
017-light-monsters-4-10f.md
017-sim-after.txt
017-sim-before.txt
017b-light-sim-floor-range-codex-output.md
017b-light-sim-floor-range.md
017b-sim-after.txt
017b-sim-before.txt
017c-bugfix-sim-gear-ignored-codex-output.md
017c-bugfix-sim-gear-ignored.md
017c-sim-after.txt
017c-sim-before.txt
018-light-items-4-10f-codex-output.md
018-light-items-4-10f-verify.md
018-light-items-4-10f.md
018-sim-after.txt
018-sim-before.txt
019-light-chest-loot-table-codex-output.md
019-light-chest-loot-table-verify.md
019-light-chest-loot-table.md
019-sim-after.txt
019-sim-before.txt
019a-light-guardian-8f-9f-tuning-codex-output.md
019a-light-guardian-8f-9f-tuning-verify.md
019a-light-guardian-8f-9f-tuning.md
019a-sim-after.txt
019a-sim-before.txt
01A-heavy-10f-final-boss-codex-output.md
01A-sim-before.txt

/workspace/dsw-queue/todo:
019b-light-ancientdragon-tuning.md
01A-heavy-10f-final-boss.md
020-heavy-death-status.md
021-heavy-temple.md
022-light-lost-roster.md
023-light-inn.md
030-heavy-corpse-on-wipe.md
031-heavy-corpse-rescue.md

codex
現行コードでは10F撃破後も下り階段ができ、階層移動にも上限チェックがありません。クリア情報を帰還・再探索後も保持し、戦闘ログの再生が終わってからクリア表示と帰還ボタンを出す形で修正します。

exec
/bin/bash -lc "cat dist/monsters.js; sed -n '82,95p' dist/game.js; cat scripts/sim/harness.cjs" in /workspace/dungeonsweeper
 succeeded in 0ms:
function monsterFormation(boss){let floor=Math.min(Math.max(...ENEMIES.map(d=>d.floor)),s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss){let guardian=ENEMIES.find(d=>d.floor===floor&&d.boss);return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[]) ]}return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){let sp=d.spellInfo||{name:'ハリト',target:'one',dice:[1,8,0]};log(`${name}は${sp.name}を唱えた。`);for(let i of sp.target==='all'?alive:[alive[Math.random()*alive.length|0]])monsterHurt(i,dice(...sp.dice).value,cmds,name)}return true}return false}
function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}

// A completed battle pays only for defeated enemies, never escaped enemies.
function finishMonsterBattle(){
 const combat=s.enemy,defeated=combat.units.filter(e=>e.rewarded&&!e.escaped);
 awardVictory(combat);
 if(combat.chestBattle&&defeated.length){s.cells[s.pos].chest={gold:combat.lootGold,opened:false};fixChestTrap(s.cells[s.pos].chest);log('宝箱が現れた。開けるか、放棄するか。')}
 s.enemy=null;
 if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){s.relic=true;s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log(`地下${s.floor+1}階に移動しますか？`)}
 else if(!defeated.length)log('敵はいなくなった。');
}
function migrateMonsterBattle(){
 if(!s.enemy||s.enemy.dataVersion===1)return;
 const mapping=s.floor>=3?{slime:'acidslime',skeleton:'archer',wolf:'blackwolf',goblin:'shaman',guardian:'watcher'}:s.floor===2?{slime:'poisonslime',skeleton:'ghostknight',wolf:'wolf',goblin:'orc',guardian:'general'}:{};
 for(const e of s.enemy.units){e.row??=e.id;e.id=mapping[e.id]||e.id;if(!ENEMIES.some(d=>d.id===e.id))e.id='slime';const d=enemyDefinition(e.id);e.hp=Math.min(e.hp,d.hp[0]*d.hp[1]+d.hp[2]);}
 s.enemy.dataVersion=1;
}
function monsterResists(e,effect){return effect==='poison'&&enemyDefinition(e.id).resistance.includes('毒無効')}
function afflictMonster(e,effect){if(monsterResists(e,effect))return false;e[effect]=true;return true}

// Dispel checks every living undead separately. The exact original formula is undocumented here.
function dispelUndead(i){
 log(`${NAMES[i]}は呪いを解こうとした。`);
 let targets=s.enemy.units.filter(e=>e.hp>0&&enemyDefinition(e.id).race==='不死');
 if(!targets.length){log('効果はなかった。');return}
 for(const e of targets){let chance=Math.max(.05,Math.min(.95,.5+.05*(s.members[i].level-monsterLevel(e))));if(Math.random()<chance){let name=enemyDisplay(e);e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は消え去った。`)}else log(`${enemyDisplay(e)}には効かなかった。`)}
}
function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
$('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
$('#chestopen').onclick=()=>openChest(false);

function rememberFloor(){s.floors??={};s.floors[s.floor]={floor:s.floor,size:s.size,cells:structuredClone(s.cells),start:s.start,boss:s.boss,relic:s.relic};}
function travelFloor(next,fromTown=false){let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}

function abandonChest(){if(logBusy()||s.enemy||!currentChest())return;delete s.cells[s.pos].chest;log('宝箱を放棄した。');render()}
$('#chestabandon').onclick=abandonChest;
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
/bin/bash -lc "tail -35 /workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md; cat /workspace/dsw-queue/report/01A-sim-before.txt; sed -n '18,40p' dist/recruits.js; rg -n 'killReward|finishMonsterBattle|awardVictory' dist/game.js; rg --files -g '*report*' -g '*01*'; cat /workspace/dsw-queue/report/019a-sim-after.txt" in /workspace/dungeonsweeper
 succeeded in 0ms:

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

== L18 F10 --boss --gear none n=300
--gear はshopまたはdropで指定してください
== L18 F10 --boss --gear shop n=300
{"winRate":0.9533333333333334,"wipeRate":0.04666666666666667,"deathsPerBattle":0.41,"hpLossRate":0.32636915608950295,"averageRounds":4.953333333333333}
== L18 F10 --boss --gear drop n=300
{"winRate":1,"wipeRate":0,"deathsPerBattle":0.0033333333333333335,"hpLossRate":0.10217772711951607,"averageRounds":2.4966666666666666}
== L18 F10 --boss nogear: {"winRate":0.15666666666666668,"wipeRate":0.8433333333333334,"deathsPerBattle":5.163333333333333,"hpLossRate":0.9175040791397775,"averageRounds":10.703333333333333}
}
function trainingRoster(){return [...partyRecords(),...(s.reserve||[])]}
// Combat retains its parallel arrays. Save files keep a single roster plus ordered IDs.
function rosterSaveState() {
 const records=trainingRoster(), seen=new Set();
 for(const r of records){if(!r.members.id||seen.has(r.members.id))r.members.id=crypto.randomUUID();seen.add(r.members.id)}
 const snapshot={...s,rosterVersion:1,roster:records,partyIds:s.members.map(m=>m.id)};
 for(const key of PARTY_FIELDS)delete snapshot[key];
 delete snapshot.reserve;
 return snapshot;
}
function restoreRoster(state) {
 if(state?.rosterVersion!==1)return state;
 const records=new Map(state.roster.map(r=>[r.members.id,r]));
 const ids=[...new Set(state.partyIds)].filter(id=>records.has(id)).slice(0,6);
 for(const key of PARTY_FIELDS)state[key]=ids.map(id=>records.get(id)[key]);
 state.reserve=state.roster.filter(r=>!ids.includes(r.members.id));
 state.partyVersion=1;
 delete state.roster;delete state.partyIds;delete state.rosterVersion;
 return state;
}
function registerRecruit(record) {
 if(s.area!=='town'||!idle()||!record||trainingRoster().some(r=>r.members.id===record.members.id))return false;
27:function killReward(e){if(e.rewarded)return;e.rewarded=true;let d=enemyDefinition(e.id);s.enemy.pendingXP=(s.enemy.pendingXP||0)+d.xp;s.enemy.pendingGold=(s.enemy.pendingGold||0)+Math.floor(dice(...d.gold).value/3);s.enemy.pendingDrops=(s.enemy.pendingDrops||0)+1;log('敵を倒した。')}
28:function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0,survivors=s.members.filter((_,i)=>s.hp[i]>0).length,share=xp>0&&survivors>0?Math.max(1,Math.floor(xp/survivors)):0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=share;if(share)log(`生存者は経験値${share}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}
30:function attack(){if(logBusy()||!s.enemy||s.done)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}identifyEnemies();let cmds=s.commands.slice();log('── ターン開始 ──');for(let i=0;i<s.members.length;i++)if(s.hp[i]>0&&cmds[i]==='guard')log(`${NAMES[i]}は身を守る。`);for(let i=0;i<s.members.length;i++){if(s.hp[i]<=0)continue;if(s.ailments[i].paralysis>0){log(`${NAMES[i]}は麻痺して動けない。`);continue}if(cmds[i]==='guard')continue;if(cmds[i]==='dispel'){dispelUndead(i);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(cmds[i]==='item'){let plan=s.itemPlans[i];if(plan)useMedicine(i,plan.slot,plan.target,true,plan.id);continue}if(cmds[i]==='spell'){let plan=s.magicPlans[i];if(plan){let x=magic(plan.id),t=plan.target;if(x&&(x.target==='enemy'||x.target==='group')&&!validMagicTarget(x,t)){let original=s.enemy.units.find(e=>e.uid===t);t=s.enemy.units.find(e=>e.hp>0&&original&&rowKey(e)===rowKey(original))?.uid??s.enemy.units.find(e=>e.hp>0)?.uid}castMagic(i,plan.id,t)}else log(`${NAMES[i]}の呪文が選ばれていない。`);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(!canWeaponAttack(i)){log(`${NAMES[i]}の近接攻撃は後衛から届かない。`);continue}let e=selectedEnemy(i);if(!e){log(`${NAMES[i]}の攻撃対象の列は全滅している。`);continue;}let d=enemyDefinition(e.id);let result=physicalAttack(i,e);if(!result.hitsCount){log(`${NAMES[i]}の攻撃は${enemyDisplay(e)}にかわされた。`);continue}let damage=flagDamage(result.damage);e.hp=Math.max(0,e.hp-damage);log(`${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。`);if(e.hp===0)killReward(e);if(!s.enemy.units.some(e=>e.hp>0))break}if(!s.enemy.units.some(e=>e.hp>0)){finishMonsterBattle()}else if(s.enemy.initiative==='party'){s.enemy.initiative='normal'}else{enemyTurn(cmds)}resetCommandEntry();resetPartyCommands();if(s.enemy){let next=s.enemy.units.find(e=>e.hp>0);s.attackRows=s.attackRows.map(key=>s.enemy.units.some(e=>String(rowKey(e))===String(key)&&e.hp>0)?key:rowKey(next))}render()}
97:function enemyTurn(cmds){for(const e of s.enemy.units.filter(e=>e.hp>0)){if(s.hp.every(h=>h<=0))break;if(e.sleep>0){e.sleep--;log(`${enemyDisplay(e)}は眠っている。`);continue}if(monsterAction(e,cmds))continue;let d=enemyDefinition(e.id);for(let n=0;n<d.swings;n++){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),front=alive.filter(i=>i<3),pool=d.rear||!front.length?alive:front;if(!pool.length)break;let i=pool[Math.random()*pool.length|0];if(!hits(d.hit,effectiveAC(i))){log(`${NAMES[i]}は${enemyDisplay(e)}の攻撃をかわした。`);continue}monsterHurt(i,dice(...d.attack).value,cmds,enemyDisplay(e));if(s.hp[i]>0)monsterOnHit(e,i)}}if(s.hp.every(h=>h===0)){defeat();return}if(!s.enemy.units.some(e=>e.hp>0))finishMonsterBattle()}
== L11 F7 --boss --gear drop n=300
{"winRate":0.97,"wipeRate":0.03,"deathsPerBattle":0.2833333333333333,"hpLossRate":0.22795544534945814,"averageRounds":4.96}
== L12 F8  --gear drop n=300
{"winRate":0.9733333333333334,"wipeRate":0.0033333333333333335,"deathsPerBattle":0.13666666666666666,"hpLossRate":0.13924904779798591,"averageRounds":3.4966666666666666}
== L12 F8 --boss --gear drop n=300
{"winRate":0.9233333333333333,"wipeRate":0.07666666666666666,"deathsPerBattle":0.6,"hpLossRate":0.36348129937589313,"averageRounds":5.8533333333333335}
== L13 F9  --gear drop n=300
{"winRate":0.9666666666666667,"wipeRate":0.01,"deathsPerBattle":0.14333333333333334,"hpLossRate":0.10088907636527403,"averageRounds":2.4066666666666667}
== L13 F9 --boss --gear drop n=300
{"winRate":0.96,"wipeRate":0.04,"deathsPerBattle":0.31333333333333335,"hpLossRate":0.19698336951526177,"averageRounds":3.0633333333333335}
== L15 F10 --boss --gear drop n=300
{"winRate":0.99,"wipeRate":0.01,"deathsPerBattle":0.08333333333333333,"hpLossRate":0.15537952627963644,"averageRounds":2.9}

exec
/bin/bash -lc "rg -n 'jobs|65|78|Lv18' /workspace/dsw-queue/design-10f.md /workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md | tail -12; rg -n 'validMagicTarget|warp' dist/spells.js; cat dist/balance.js | head -16; git status --short" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:981:  createParty(g, opt.jobs);
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1021:    if (!['--jobs', '--level', '--floor', '--n', '--boss', '--gear'].includes(key)) throw Error(`不明な引数: ${key}`);
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1027:  if (!/^[0-3](,[0-3]){0,5}$/.test(out.jobs || '')) throw Error('--jobs は0〜3の職業IDを1〜6個指定してください');
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1028:  const jobs = out.jobs.split(',').map(Number);
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1034:  return { jobs, level, floor, n, boss: !!out.boss, gear: out.gear };
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1048:function createParty(g, jobs) {
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1050:  for (let i = 0; i < jobs.length; i++) {
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1052:      const recruit = generateRecruit('sim${i}', ${jobs[i]});
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1057:  if (g.run('s.members.length') !== jobs.length) throw Error('パーティ人数が一致しません');
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1162:  createParty(g, opt.jobs);
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1186:s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');if(s.hp.some((h,i)=>h!==maxHP(i))||s.mp.some((h,i)=>h!==s.members[i].maxMP))throw Error('refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1482:{"winRate":0.9666666666666667,"wipeRate":0.01,"deathsPerBattle":0.14333333333333334,"hpLossRate":0.10088907636527403,"averageRounds":2.4066666666666667}
13: ['malor','マロール',1,13,20,true,'field','floor','warp',null,'訪問済み階の上り階段へ転移。未訪問階は選択不可'],
36:function validMagicTarget(x,t){if(x.target==='ally')return Number.isInteger(t)&&s.hp[t]>0;if(x.target==='enemy'||x.target==='group')return !!s.enemy?.units.some(e=>e.uid===t&&e.hp>0);if(x.target==='floor')return Number.isInteger(t)&&(t===s.floor||!!s.floors[t]);return true}
37:function castMagic(i,id,t){let x=magic(id);if(!x||x.job!==jobOf(i)||spellReason(i,x)||!validMagicTarget(x,t)){log(`${NAMES[i]}は呪文を使えなかった。`);return false}flagConsumeMP(i,baseSpellCost(x));log(`${NAMES[i]}は${x.name}を唱えた。`);
48: else if(x.effect==='warp'){if(t!==s.floor)travelFloor(t,true);else{s.pos=s.start;s.pendingStairs=false}log(`地下${t}階の上り階段へ転移した。`)}return true}
57:function magicUI(){ $('#magicclose').onclick=()=>$('#magicdialog').close();$('#magiclist').onclick=e=>{let b=e.target.closest('[data-spell]');if(b){if(s.enemy&&!spellBrowse){let x=magic(b.dataset.spell);if(x&&!spellReason(spellMember,x))chooseBattleSpell(spellMember,x);return}let top=$('#magiclist').scrollTop;spellSelected=b.dataset.spell;renderMagic();$('#magiclist').scrollTop=top}};$('#magiccast').onclick=()=>{let x=magic(spellSelected),i=spellMember;if(!x||logBusy()||spellReason(i,x))return;let t=['ally','enemy','group','floor'].includes(x.target)?Number($('#magictarget').value):null;if(!validMagicTarget(x,t))return;if(s.enemy){s.magicPlans[i]={id:x.id,target:t};s.commands[i]='spell'}else{displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};castMagic(i,x.id,t)}$('#magicdialog').close();s.enemy?confirmCommand(i):render()};$('#magicdialog').addEventListener('click',e=>{let d=e.currentTarget,r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close()})}
// 調整用データ。ダイスは [個数, 面数, 固定加算]。
const CLASSES = [
 {id:'fighter',name:'戦士',hp:32,mp:0,attack:3,ac:6,hit:4,hpGrowth:[1,6,3],xpFactor:.8,mpGrowth:[0,1,0],attackEvery:1},
 {id:'mage',name:'魔法使い',hp:24,mp:20,attack:0,ac:9,hit:1,hpGrowth:[1,4,2],xpFactor:1.2,mpGrowth:[1,2,0],attackEvery:2},
 {id:'priest',name:'僧侶',hp:26,mp:15,attack:1,ac:7,hit:2,hpGrowth:[1,5,2],xpFactor:1,mpGrowth:[1,2,0],attackEvery:2},
 {id:'thief',name:'盗賊',hp:25,mp:0,attack:1,ac:8,hit:3,hpGrowth:[1,5,2],xpFactor:.85,mpGrowth:[0,1,0],attackEvery:2}
];
const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
const LEVEL_CAP=30;
const MAX_FLOOR=10;
const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
// 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
function ensureProgression(){
 s.members.forEach((m,i)=>{

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('dist/game.js')
s=p.read_text()
s=s.replace('gold:s.gold,flagKind:', 'gold:s.gold,cleared:"'!!s.cleared,flagKind:'"',1)
s=s.replace(\"area:'dungeon',pendingStairs:false\", \"area:'dungeon',cleared:false,clearNotice:false,pendingStairs:false\",1)
s=s.replace('function ensureProfile(){ensureStats();', 'function ensureProfile(){s.cleared??=false;s.clearNotice??=false;ensureStats();',1)
s=s.replace(\""'$('"'#entrance').disabled="'!s.members.length;", "$('"'#clearresult').hidden=s.area"'!=='"'dungeon'||"'!s.clearNotice||s.done||logBusy()||!!visibleCombat();$('"'#cleartown').disabled="'!idle();$('"'#clearedmark').hidden="'!s.cleared;$('"'#entrance').disabled="'!s.members.length;",1)
s=s.replace("$('"'#backtown').onclick=enterTown;\", \""'$('"'#cleartown').onclick=enterTown;"'$('"'#backtown').onclick=enterTown;\",1)
s=s.replace(\"s.cells[s.boss].type='down'}if(s.cells[s.start]\", \"s.cells[s.boss].type=s.floor<MAX_FLOOR?'down':''}if(s.cells[s.start]\",1)
s=s.replace(\"function travelFloor(next,fromTown=false){let previous=s.floor;\", \"function travelFloor(next,fromTown=false){if("'!Number.isInteger(next)||next<1||next>MAX_FLOOR)return false;let previous=s.floor;",1)
s=s.replace("s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;", "s.clearNotice=false;s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;",1)
# Remove obsolete final-floor stairs from active and cached maps on old saves.
s=s.replace("s.floor??=1;s.size??=8;s.floors??={};", "s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='"'down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;\",1)
p.write_text(s)
p=Path('dist/monsters.js');s=p.read_text()
old=\" if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){s.relic=true;s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log("'`地下${s.floor+1}階に移動しますか？`)}"
new=""" if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){
  s.relic=true;
  if(s.floor===MAX_FLOOR&&defeated.some(e=>e.id==='"'labyrinthlord')){
   s.cells[s.boss].type='';s.pendingStairs=false;s.cleared=true;s.clearNotice=true;
   log('迷宮の主は倒れた。迷宮に静寂が戻った……');
  }else if(s.floor<MAX_FLOOR){s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log("'`地下${s.floor+1}階に移動しますか？`)}
 }"""
assert old in s;s=s.replace(old,new);p.write_text(s)
p=Path('"'dist/index.html');s=p.read_text();s=s.replace('<h2>灯の町</h2>', '<h2>灯の町</h2><small id=\"clearedmark\" hidden>迷宮踏破済み</small>',1);s=s.replace('<button id=\"backtown\" hidden>', '<section id=\"clearresult\" class=\"panel\" aria-labelledby=\"cleartitle\" hidden><h2 id=\"cleartitle\">迷宮踏破</h2><p>迷宮の主は倒れた。迷宮に静寂が戻った……</p><button id=\"cleartown\">町へ戻る</button></section><button id=\"backtown\" hidden>',1);p.write_text(s)
p=Path('docs/SPECIFICATION.md');s=p.read_text();s=s.replace('撃破後その場所が下り階段になる。各階に固有守護者、4F以降は3F設定を使用。','1〜9Fでは撃破後その場所が下り階段になる。各階に固有守護者がおり、最深部は10F（MAX_FLOOR=10）。階段・転移とも11F以降へは移動できない。\\n10Fの守護者「迷宮の主」（labyrinthlord）を随伴の敵も含めて撃破するとゲームクリア。下り階段は作らず、クリアログを表示する。ログ再生終了後に「迷宮踏破」の表示と町へ戻るボタンを出す。宝箱の処理や探索も続行でき、帰還後は再び探索できる。再度10Fを攻略しても下り階段は作らない。\\n踏破記録は "'`ash-v1` の `cleared` として保存し、未設定の旧セーブではfalseとする。帰還・階層移動・再探索でも保持し、町に「迷宮踏破済み」を表示する。旧セーブに残る10F以降の下り階段も無効化する。'"');p.write_text(s)
PY" in /workspace/dungeonsweeper
 succeeded in 0ms:
codex
クリア処理を追加しました。旧セーブに残る10Fの下り階段も無効化します。これから保存・復元、9Fの階段、再攻略、ログ再生中の表示を検証します。既存のシミュレーション記録では勝率が指定範囲を外れているため、今回も測定して結果を分けて報告します。

2026-11-01T20:11:41.035772Z ERROR codex_core::tools::router: error=apply_patch verification failed: Failed to find expected lines in /workspace/dungeonsweeper/tests/game.cjs:
const vm=require('vm'),fs=require('fs');
exec
/bin/bash -lc 'test -f tests/final-boss.cjs && wc -l tests/final-boss.cjs; tail -3 tests/game.cjs' in /workspace/dungeonsweeper
 succeeded in 0ms:

// 10-floor trap configuration and scaling regression.
drain();run(`if(trapPower(1)!==1||trapPower(5)!==2||trapPower(10)!==3.25||trapPower(11)!==3.25)throw Error('trap power bounds');for(let f=1;f<=10;f++){fresh(f);if(size()!==Math.min(12,6+2*f)||trapCount(f,size())!==[9,15,23,24,26,27,29,30,31,31][f-1])throw Error('floor config '+f)}s.members=s.members.slice(0,1);s.hp=[100];s.ailments=[{poison:false,paralysis:0}];Math.random=()=>0;s.floor=1;let needle=s.cells[s.pos];needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-7)throw Error('floor 1 needle baseline');s.hp[0]=100;s.floor=10;needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('floor 10 needle scaling');s.hp[0]=100;triggerChestTrap({trap:'needle'});if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('chest needle scaling');`);drain();console.log('PASS 10-floor trap configuration and scaling');

apply patch
patch: completed
/workspace/dungeonsweeper/tests/final-boss.cjs
diff --git a/tests/final-boss.cjs b/tests/final-boss.cjs
new file mode 100644
index 0000000000000000000000000000000000000000..71cd97c6b0cb2bf6697ba30387abea7dbb9a746b
--- /dev/null
+++ b/tests/final-boss.cjs
@@ -0,0 +1,101 @@
+const assert = require('node:assert/strict');
+const { game } = require('../scripts/sim/harness.cjs');
+
+const g = game(null, () => .5);
+assert.equal(g.run('s.cleared'), false);
+assert.equal(g.run("$('#clearedmark').hidden"), true);
+g.run(`const recruit=generateRecruit('冒険者',0);
+registerRecruit(recruit);changeRecruitParty(recruit.members.id,true);
+s.members[0].level=18;s.members[0].maxHP=9999;
+Math.random=()=>.999;`);
+
+function startBoss(floor) {
+  g.run(`fresh(${floor});s.hp[0]=9999;s.pos=s.boss;encounter(s.pos,true);`);
+  g.drain();
+  // Real formations and attack/reward paths, with deterministic kills.
+  g.run('s.enemy.units.forEach(e=>{e.hp=1;e.sleep=99});');
+}
+function defeatBoss() {
+  let turns = 0;
+  while (g.run('!!s.enemy')) {
+    assert.ok(++turns < 30, 'boss battle terminates');
+    g.run('attack();');
+    if (g.run('!!s.enemy')) {
+      assert.equal(g.run('s.clearNotice'), false, 'escorts must also be defeated');
+      g.drain();
+    }
+  }
+}
+
+startBoss(10);defeatBoss();
+assert.equal(g.run('s.cleared'), true);
+assert.equal(g.run("s.cells[s.boss].type"), '');
+assert.equal(g.run('s.pendingStairs'), false);
+assert.equal(g.run('s.done'), false, 'clear permits continued exploration');
+assert.equal(g.run("logQueue.at(-1).text"), '迷宮の主は倒れた。迷宮に静寂が戻った……');
+assert.equal(g.run("$('#clearresult').hidden"), true, 'clear cannot leak before log playback');
+assert.equal(g.run('travelFloor(11)'), false);
+assert.equal(g.run('s.floor'), 10);
+g.run('enterTown();');
+assert.equal(g.run('s.area'), 'dungeon', 'return waits for battle logs');
+
+// Reload the actual ash-v1 payload, including roster migration and startup code.
+const saved = g.run("save();localStorage.getItem('ash-v1')");
+const restored = game(saved);
+assert.equal(restored.run('s.cleared'), true);
+assert.equal(restored.run("s.cells[s.boss].type"), '');
+assert.equal(restored.run("$('#clearresult').hidden"), false);
+g.drain();
+assert.equal(g.run("$('#clearresult').hidden"), false);
+assert.equal(g.run("$('#cleartown').disabled"), false);
+assert.equal(g.run('!!currentChest()'), true, 'boss treasure remains available');
+g.run('abandonChest();');g.drain();
+g.run("$('#cleartown').onclick();");
+assert.equal(g.run('s.area'), 'town');
+assert.equal(g.run('s.cleared'), true);
+assert.equal(g.run('s.clearNotice'), false);
+assert.equal(g.run("$('#clearedmark').hidden"), false);
+assert.equal(g.run("$('#clearresult').hidden"), true);
+const townReload = game(g.run("localStorage.getItem('ash-v1')"));
+assert.equal(townReload.run('s.cleared'), true);
+assert.equal(townReload.run("$('#clearedmark').hidden"), false);
+g.run('enterDungeon();');g.drain();
+assert.equal(g.run('s.area'), 'dungeon');
+assert.equal(g.run('s.cleared'), true);
+
+startBoss(9);defeatBoss();g.drain();
+assert.equal(g.run("s.cells[s.boss].type"), 'down');
+assert.equal(g.run('s.pendingStairs'), 'down');
+assert.equal(g.run('s.clearNotice'), false);
+g.run('answerStairs(true);');
+assert.equal(g.run('s.floor'), 10);
+assert.equal(g.run('s.cleared'), true, 'new floor preserves global clear flag');
+startBoss(10);defeatBoss();g.drain();
+assert.equal(g.run('s.clearNotice'), true);
+assert.equal(g.run("s.cells[s.boss].type"), '');
+g.run('travelFloor(9);');
+assert.equal(g.run('s.clearNotice'), false);
+assert.equal(g.run('s.cleared'), true, 'cached floor preserves global clear flag');
+
+// Old saves may already contain a down stair or cached floors beyond 10F.
+const legacy = JSON.parse(saved);
+delete legacy.cleared;delete legacy.clearNotice;
+legacy.cells[legacy.boss].type='down';legacy.pendingStairs='down';
+legacy.floors[10]={floor:10,cells:structuredClone(legacy.cells)};
+legacy.floors[11]={floor:11,cells:structuredClone(legacy.cells)};
+const old = game(JSON.stringify(legacy));
+assert.equal(old.run('s.cleared'), false);
+assert.equal(old.run('s.pendingStairs'), false);
+assert.equal(old.run("s.cells[s.boss].type"), '');
+assert.equal(old.run("s.floors[10].cells.some(c=>c.type==='down')"), false);
+const before = old.run('JSON.stringify(s)');
+for (const target of [11,12,0,-1,1.5,NaN,Infinity]) {
+  assert.equal(old.run(`travelFloor(${target},true)`), false);
+  assert.equal(old.run('JSON.stringify(s)'), before, 'invalid travel leaves state intact');
+}
+old.run("s.cells[s.boss].type='down';s.relic=true;s.pos=s.boss;s.pendingStairs='down';answerStairs(true);");
+assert.equal(old.run('s.floor'), 10, 'even an obsolete stair cannot reach 11F');
+legacy.relic=true;legacy.done=true;
+const oldDone = game(JSON.stringify(legacy));
+assert.equal(oldDone.run("s.cells[s.boss].type"), '', 'legacy relic migration cannot recreate final stairs');
+console.log('PASS final boss clear, escort completion, log timing, town/replay, 9F stairs, ash-v1 reload, legacy saves and 11F travel rejection');

exec
/bin/bash -lc "cat >> tests/game.cjs <<'EOF'

require('./final-boss.cjs');
EOF
node tests/final-boss.cjs" in /workspace/dungeonsweeper
 exited 1 in 0ms:
node:assert:152
  throw new AssertionError(obj);
  ^

AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

true !== false

    at Object.<anonymous> (/workspace/dungeonsweeper/tests/final-boss.cjs:50:8)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: true,
  expected: false,
  operator: 'strictEqual',
  diff: 'simple'
}

Node.js v24.22.1

exec
/bin/bash -lc "rg -n 'function idle' dist/game.js; nl -ba tests/final-boss.cjs | sed -n '44,56p'; git diff --stat" in /workspace/dungeonsweeper
 succeeded in 0ms:
45:function idle(){return !currentChest()&&!logBusy()&&!s.enemy&&!s.pendingBoss&&!s.pendingStairs}
    44	const restored = game(saved);
    45	assert.equal(restored.run('s.cleared'), true);
    46	assert.equal(restored.run("s.cells[s.boss].type"), '');
    47	assert.equal(restored.run("$('#clearresult').hidden"), false);
    48	g.drain();
    49	assert.equal(g.run("$('#clearresult').hidden"), false);
    50	assert.equal(g.run("$('#cleartown').disabled"), false);
    51	assert.equal(g.run('!!currentChest()'), true, 'boss treasure remains available');
    52	g.run('abandonChest();');g.drain();
    53	g.run("$('#cleartown').onclick();");
    54	assert.equal(g.run('s.area'), 'town');
    55	assert.equal(g.run('s.cleared'), true);
    56	assert.equal(g.run('s.clearNotice'), false);
 dist/game.js          | 12 ++++++------
 dist/index.html       |  2 +-
 dist/monsters.js      |  8 +++++++-
 docs/SPECIFICATION.md |  4 +++-
 tests/game.cjs        |  2 ++
 5 files changed, 19 insertions(+), 9 deletions(-)

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('dist/game.js');s=p.read_text().replace(\""'$('"'#cleartown').disabled="'!idle();", "$('"'#cleartown').disabled="'!idle();$('"'#clearchestnotice').hidden="'!currentChest();",1);p.write_text(s)
p=Path('"'dist/index.html');s=p.read_text().replace('<button id=\"cleartown\">', '<p id=\"clearchestnotice\" hidden>宝箱を開けるか、放棄すると町へ戻れます。</p><button id=\"cleartown\">',1);p.write_text(s)
p=Path('tests/final-boss.cjs');s=p.read_text().replace('assert.equal(g.run(\""'$('"\\'#cleartown\\').disabled\"), false);','assert.equal(g.run(\""'$('"\\'#cleartown\\').disabled\"), true, \\'resolve treasure before returning\\');',1).replace(\"g.run('abandonChest();');g.drain();\", \"g.run('abandonChest();');g.drain();\\nassert.equal(g.run(\\\""'$('"'#cleartown').disabled\\\"), false);\");p.write_text(s)
PY
node tests/final-boss.cjs" in /workspace/dungeonsweeper
 succeeded in 24ms:
PASS final boss clear, escort completion, log timing, town/replay, 9F stairs, ash-v1 reload, legacy saves and 11F travel rejection

exec
/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 18 --floor 10 --boss --gear drop --n 300' in /workspace/dungeonsweeper
exec
/bin/bash -lc 'node scripts/sim/selftest.cjs' in /workspace/dungeonsweeper
exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
exec
/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 18 --floor 10 --boss --gear shop --n 300' in /workspace/dungeonsweeper
 succeeded in 2273ms:
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
PASS final boss clear, escort completion, log timing, town/replay, 9F stairs, ash-v1 reload, legacy saves and 11F travel rejection
PASS new game starts empty; dungeon blocked
PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation
PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload
PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration
PASS deletion including last active member and empty save reload
88 monster definitions validated

 succeeded in 6429ms:
PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout

 succeeded in 14627ms:
{"winRate":1,"wipeRate":0,"deathsPerBattle":0.0033333333333333335,"hpLossRate":0.10217772711951607,"averageRounds":2.4966666666666666}

exec
/bin/bash -lc "git diff --check; git diff -- dist/monsters.js docs/SPECIFICATION.md; rg -n 'cleared|clearNotice|MAX_FLOOR' dist/game.js | cut -c 1-650" in /workspace/dungeonsweeper
 succeeded in 0ms:
diff --git a/dist/monsters.js b/dist/monsters.js
index 3dbbfbe..6aee47b 100644
--- a/dist/monsters.js
+++ b/dist/monsters.js
@@ -9,7 +9,13 @@ function finishMonsterBattle(){
  awardVictory(combat);
  if(combat.chestBattle&&defeated.length){s.cells[s.pos].chest={gold:combat.lootGold,opened:false};fixChestTrap(s.cells[s.pos].chest);log('宝箱が現れた。開けるか、放棄するか。')}
  s.enemy=null;
- if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){s.relic=true;s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log(`地下${s.floor+1}階に移動しますか？`)}
+ if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){
+  s.relic=true;
+  if(s.floor===MAX_FLOOR&&defeated.some(e=>e.id==='labyrinthlord')){
+   s.cells[s.boss].type='';s.pendingStairs=false;s.cleared=true;s.clearNotice=true;
+   log('迷宮の主は倒れた。迷宮に静寂が戻った……');
+  }else if(s.floor<MAX_FLOOR){s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log(`地下${s.floor+1}階に移動しますか？`)}
+ }
  else if(!defeated.length)log('敵はいなくなった。');
 }
 function migrateMonsterBattle(){
diff --git a/docs/SPECIFICATION.md b/docs/SPECIFICATION.md
index 8863b15..6458515 100644
--- a/docs/SPECIFICATION.md
+++ b/docs/SPECIFICATION.md
@@ -7,7 +7,9 @@
 町（酒場・鍛冶屋・迷宮入口）→探索→遭遇／宝箱／守護者→階段で上下移動→町。
 1Fは8×8、2Fは10×10、3F以降12×12。上下左右の隣接移動、左右旋回、後退、左右横移動。盤面クリックは旗の操作で、任意マスへ移動する操作ではない。
 開始位置と守護者位置は乱数。チェビシェフ距離2以内（縦横の最大差が2以下）には守護者を置かない。開始位置の周囲と、守護者までの生成経路は安全。罠数は1F=9、2F=15、3F=23。階層・盤面サイズに応じて増え、盤面の22%を上限とする。
-守護者マスへ入ると確認。いいえで直前マスへ戻る。撃破後その場所が下り階段になる。各階に固有守護者、4F以降は3F設定を使用。
+守護者マスへ入ると確認。いいえで直前マスへ戻る。1〜9Fでは撃破後その場所が下り階段になる。各階に固有守護者がおり、最深部は10F（MAX_FLOOR=10）。階段・転移とも11F以降へは移動できない。
+10Fの守護者「迷宮の主」（labyrinthlord）を随伴の敵も含めて撃破するとゲームクリア。下り階段は作らず、クリアログを表示する。ログ再生終了後に「迷宮踏破」の表示と町へ戻るボタンを出す。宝箱の処理や探索も続行でき、帰還後は再び探索できる。再度10Fを攻略しても下り階段は作らない。
+踏破記録は `ash-v1` の `cleared` として保存し、未設定の旧セーブではfalseとする。帰還・階層移動・再探索でも保持し、町に「迷宮踏破済み」を表示する。旧セーブに残る10F以降の下り階段も無効化する。
 上り階段は一つ前の階へ。1Fからのみ町へ。階段で「いいえ」はその場に留まり、同じマスに居続けても再発火しない。
 同じ探索中は各階の探索状況を維持。町へ帰ると全階の記録を破棄し、新しいランダム迷宮にする。スコアとスコア履歴は廃止済み。
 
1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.h
41:function ensureProfile(){s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>
64:function render(){ensureProfile();$('#clearresult').hidden=s.area!=='dungeon'||!s.clearNotice||s.done||logBusy()||!!visibleCombat();$('#cleartown').disabled=!idle();$('#clearchestnotice').hidden=!currentChest();$('#clearedmark').hidden=!s.cleared;$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hid
70:try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type=s.floor<MAX_FLOOR?'down':''}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
92:function travelFloor(next,fromTown=false){if(!Number.isInteger(next)||next<1||next>MAX_FLOOR)return false;let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.clearNotice=false;s.pos=fromTown||next>previou

exec
/bin/bash -lc "git status --short; rg --files /usr/bin /opt /tmp /home/box 2>/dev/null | rg '/(chromium|chrome|firefox|playwright)(/|"'$|-)'"' | head -15; rg -n '01A.*jobs|--jobs.*--level 18' /workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md" in /workspace/dungeonsweeper
 succeeded in 0ms:
 M dist/game.js
 M dist/index.html
 M dist/monsters.js
 M docs/SPECIFICATION.md
 M tests/game.cjs
?? tests/final-boss.cjs
/home/box/chrome-profile/machine-id
/home/box/chrome-profile/Fork-2/Subresource Filter/Unindexed Rules/9.72.0/_metadata/verified_contents.json
/home/box/chrome-profile/Fork-2/Subresource Filter/Unindexed Rules/9.72.0/LICENSE.txt
/home/box/chrome-profile/Fork-2/Subresource Filter/Unindexed Rules/9.72.0/Filtering Rules
/home/box/chrome-profile/Fork-2/Subresource Filter/Unindexed Rules/9.72.0/manifest.json
/home/box/chrome-profile/Fork-2/Subresource Filter/Indexed Rules/38/9.72.0/Ruleset Data
/home/box/sand-data/chrome-cookie-seed.json
/home/box/chrome-profile/Fork-2/FirstPartySetsPreloaded/2025.7.24.0/LICENSE
/home/box/chrome-profile/Fork-2/Crowd Deny/2026.10.1.64/_metadata/verified_contents.json
/home/box/chrome-profile/Fork-2/Crowd Deny/2026.10.1.64/Preload Data
/home/box/chrome-profile/Fork-2/Crowd Deny/2026.10.1.64/manifest.json
/home/box/chrome-profile/Fork-2/AmountExtractionHeuristicRegexes/4/_metadata/verified_contents.json
/home/box/chrome-profile/Fork-2/AmountExtractionHeuristicRegexes/4/heuristic_regexes.binarypb
/home/box/chrome-profile/Fork-2/AmountExtractionHeuristicRegexes/4/manifest.json
/home/box/chrome-profile/Fork-2/VariationsSafeSeedV2
1491:/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:981:  createParty(g, opt.jobs);
1492:/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1021:    if (!['--jobs', '--level', '--floor', '--n', '--boss', '--gear'].includes(key)) throw Error(`不明な引数: ${key}`);
1493:/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1027:  if (!/^[0-3](,[0-3]){0,5}$/.test(out.jobs || '')) throw Error('--jobs は0〜3の職業IDを1〜6個指定してください');
1494:/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1028:  const jobs = out.jobs.split(',').map(Number);
1495:/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1034:  return { jobs, level, floor, n, boss: !!out.boss, gear: out.gear };
1496:/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1048:function createParty(g, jobs) {
1497:/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1050:  for (let i = 0; i < jobs.length; i++) {
1498:/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1052:      const recruit = generateRecruit('sim${i}', ${jobs[i]});
1499:/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1057:  if (g.run('s.members.length') !== jobs.length) throw Error('パーティ人数が一致しません');
1500:/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md:1162:  createParty(g, opt.jobs);
1747:/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 18 --floor 10 --boss --gear drop --n 300' in /workspace/dungeonsweeper
1753:/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 18 --floor 10 --boss --gear shop --n 300' in /workspace/dungeonsweeper

 succeeded in 35275ms:
{"winRate":0.9533333333333334,"wipeRate":0.04666666666666667,"deathsPerBattle":0.41,"hpLossRate":0.32636915608950295,"averageRounds":4.953333333333333}

codex
共通テストと追加回帰テストはすべてPASSしました。Lv18・6人・随伴ありの300戦では、迷宮装備で勝率100%となり、指定の65〜90%を超えています。店装備の測定も進行中です。ブラウザ検証環境がないため、実ブラウザでの表示は未確認です。

exec
/bin/bash -lc "ls /opt; ls /usr/bin/*chrom* /opt/google/chrome/chrome /opt/chromium/chrome /home/box/.cache/ms-playwright/*/chrome-linux/chrome 2>/dev/null; ps -eo pid,etime,args | rg '[n]ode scripts/sim/combat.cjs'" in /workspace/dungeonsweeper
 exited 1 in 0ms:
google
sand
sand-managed
ungoogled-chromium
/opt/google/chrome/chrome
/usr/bin/google-chrome
/usr/bin/google-chrome-stable

apply patch
patch: completed
/workspace/dungeonsweeper/tests/final-boss.cjs
diff --git a/tests/final-boss.cjs b/tests/final-boss.cjs
new file mode 100644
index 0000000000000000000000000000000000000000..86d282a53fad2c6ffa5abede57051c333d091132
--- /dev/null
+++ b/tests/final-boss.cjs
@@ -0,0 +1,107 @@
+const assert = require('node:assert/strict');
+const { game } = require('../scripts/sim/harness.cjs');
+
+const g = game(null, () => .5);
+assert.equal(g.run('s.cleared'), false);
+assert.equal(g.run("$('#clearedmark').hidden"), true);
+g.run(`const recruit=generateRecruit('冒険者',0);
+registerRecruit(recruit);changeRecruitParty(recruit.members.id,true);
+s.members[0].level=18;s.members[0].maxHP=9999;
+Math.random=()=>.999;`);
+
+function startBoss(floor) {
+  g.run(`fresh(${floor});s.hp[0]=9999;s.pos=s.boss;encounter(s.pos,true);`);
+  g.drain();
+  // Real formations and attack/reward paths, with deterministic kills.
+  g.run('s.enemy.units.forEach(e=>{e.hp=1;e.sleep=99});');
+}
+function defeatBoss() {
+  let turns = 0;
+  const wasCleared = g.run('s.cleared');
+  while (g.run('!!s.enemy')) {
+    assert.ok(++turns < 30, 'boss battle terminates');
+    g.run('attack();');
+    if (g.run('!!s.enemy')) {
+      assert.equal(g.run('s.clearNotice'), false, 'escorts must also be defeated');
+      assert.equal(g.run('s.cleared'), wasCleared, 'boss death alone cannot clear the battle');
+      g.drain();
+    }
+  }
+}
+
+g.run(`fresh(10);s.enemy={boss:false,chestBattle:false,units:[{id:'goblin',uid:0,row:0,hp:1}]};attack();`);
+g.drain();
+assert.equal(g.run('s.cleared'), false, 'ordinary 10F encounters do not clear the game');
+startBoss(10);defeatBoss();
+assert.equal(g.run('s.cleared'), true);
+assert.equal(g.run("s.cells[s.boss].type"), '');
+assert.equal(g.run('s.pendingStairs'), false);
+assert.equal(g.run('s.done'), false, 'clear permits continued exploration');
+assert.equal(g.run("logQueue.at(-1).text"), '迷宮の主は倒れた。迷宮に静寂が戻った……');
+assert.equal(g.run("$('#clearresult').hidden"), true, 'clear cannot leak before log playback');
+assert.equal(g.run('travelFloor(11)'), false);
+assert.equal(g.run('s.floor'), 10);
+g.run('enterTown();');
+assert.equal(g.run('s.area'), 'dungeon', 'return waits for battle logs');
+
+// Reload the actual ash-v1 payload, including roster migration and startup code.
+const saved = g.run("save();localStorage.getItem('ash-v1')");
+const restored = game(saved);
+assert.equal(restored.run('s.cleared'), true);
+assert.equal(restored.run("s.cells[s.boss].type"), '');
+assert.equal(restored.run("$('#clearresult').hidden"), false);
+g.drain();
+assert.equal(g.run("$('#clearresult').hidden"), false);
+assert.equal(g.run("$('#cleartown').disabled"), true, 'resolve treasure before returning');
+assert.equal(g.run('!!currentChest()'), true, 'boss treasure remains available');
+g.run('abandonChest();');g.drain();
+assert.equal(g.run("$('#cleartown').disabled"), false);
+g.run("$('#cleartown').onclick();");
+assert.equal(g.run('s.area'), 'town');
+assert.equal(g.run('s.cleared'), true);
+assert.equal(g.run('s.clearNotice'), false);
+assert.equal(g.run("$('#clearedmark').hidden"), false);
+assert.equal(g.run("$('#clearresult').hidden"), true);
+const townReload = game(g.run("localStorage.getItem('ash-v1')"));
+assert.equal(townReload.run('s.cleared'), true);
+assert.equal(townReload.run("$('#clearedmark').hidden"), false);
+g.run('enterDungeon();');g.drain();
+assert.equal(g.run('s.area'), 'dungeon');
+assert.equal(g.run('s.cleared'), true);
+
+startBoss(9);defeatBoss();g.drain();
+assert.equal(g.run("s.cells[s.boss].type"), 'down');
+assert.equal(g.run('s.pendingStairs'), 'down');
+assert.equal(g.run('s.clearNotice'), false);
+g.run('answerStairs(true);');
+assert.equal(g.run('s.floor'), 10);
+assert.equal(g.run('s.cleared'), true, 'new floor preserves global clear flag');
+startBoss(10);defeatBoss();g.drain();
+assert.equal(g.run('s.clearNotice'), true);
+assert.equal(g.run("s.cells[s.boss].type"), '');
+g.run('travelFloor(9);');
+assert.equal(g.run('s.clearNotice'), false);
+assert.equal(g.run('s.cleared'), true, 'cached floor preserves global clear flag');
+
+// Old saves may already contain a down stair or cached floors beyond 10F.
+const legacy = JSON.parse(saved);
+delete legacy.cleared;delete legacy.clearNotice;
+legacy.cells[legacy.boss].type='down';legacy.pendingStairs='down';
+legacy.floors[10]={floor:10,cells:structuredClone(legacy.cells)};
+legacy.floors[11]={floor:11,cells:structuredClone(legacy.cells)};
+const old = game(JSON.stringify(legacy));
+assert.equal(old.run('s.cleared'), false);
+assert.equal(old.run('s.pendingStairs'), false);
+assert.equal(old.run("s.cells[s.boss].type"), '');
+assert.equal(old.run("s.floors[10].cells.some(c=>c.type==='down')"), false);
+const before = old.run('JSON.stringify(s)');
+for (const target of [11,12,0,-1,1.5,NaN,Infinity]) {
+  assert.equal(old.run(`travelFloor(${target},true)`), false);
+  assert.equal(old.run('JSON.stringify(s)'), before, 'invalid travel leaves state intact');
+}
+old.run("s.cells[s.boss].type='down';s.relic=true;s.pos=s.boss;s.pendingStairs='down';answerStairs(true);");
+assert.equal(old.run('s.floor'), 10, 'even an obsolete stair cannot reach 11F');
+legacy.relic=true;legacy.done=true;
+const oldDone = game(JSON.stringify(legacy));
+assert.equal(oldDone.run("s.cells[s.boss].type"), '', 'legacy relic migration cannot recreate final stairs');
+console.log('PASS final boss clear, escort completion, log timing, town/replay, 9F stairs, ash-v1 reload, legacy saves and 11F travel rejection');

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('docs/SPECIFICATION.md');s=p.read_text().replace('宝箱の処理や探索も続行でき、帰還後は再び探索できる。','宝箱がある場合は開封か放棄を済ませてから帰還できる。探索も続行でき、帰還後は再び探索できる。');p.write_text(s)
PY
node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check" in /workspace/dungeonsweeper
 succeeded in 2219ms:
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
PASS final boss clear, escort completion, log timing, town/replay, 9F stairs, ash-v1 reload, legacy saves and 11F travel rejection
PASS new game starts empty; dungeon blocked
PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation
PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload
PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration
PASS deletion including last active member and empty save reload
88 monster definitions validated

exec
/bin/bash -lc "mkdir -p report
cat > report/01A-heavy-10f-final-boss.md <<'EOF'
# 01A-heavy-10f-final-boss 作業報告

実装・自動回帰検証は完了。総合判定は未完了（指定の勝率条件を満たさず、ブラウザ表示も未確認）。

## 変更ファイル

- "'`dist/monsters.js`：10Fの迷宮の主を含む守護者戦の勝利時に `cleared=true` とクリア通知を設定。下り階段を作らず指定文を `log()` に追加。1〜9Fの階段は従来どおり。
- `dist/game.js`：踏破記録を帰還・階層移動・再探索でも保持。旧セーブの未設定値をfalseに補完。`travelFloor` は1〜10の整数以外をfalseで拒否し、訪問済み階への転移も上限を越えられない。旧セーブの10F以降の下り階段も無効化。ログ再生後にクリア表示を出す。
- `dist/index.html`：クリア表示・町への帰還ボタン・町の小さな「迷宮踏破済み」表示。既存の宝箱処理を維持し、開封／放棄が必要な場合は説明を表示。
- `docs/SPECIFICATION.md`：最深階、クリア条件、保存・再探索、宝箱処理後の帰還を記載。
- `tests/final-boss.cjs`：実際の守護者編成・attack経路を使い、随伴が残る間の未クリア、通常10F戦では未クリア、10Fクリア、ログ表示順、帰還・再攻略、9F階段、ash-v1の保存復元、旧セーブ移行、11Fへの階段／転移拒否を検証。
- `tests/game.cjs`：上記回帰テストを共通テストに組み込み。

## 検証

- `node tests/game.cjs`：PASS。
- `node tests/training.cjs`：PASS。
- `python3 scripts/compile-monsters.py --check`：PASS（88種）。
- `node scripts/sim/selftest.cjs`：PASS。
- `git diff --check`：PASS。
- ブラウザ：未確認。Python Playwrightは未導入。既存Chromeのheadless起動も `crashpad ... setsockopt: Operation not permitted (1)`（終了コード133）で失敗した。UI状態の自動テストはDOMスタブであり、実ブラウザ確認の代用とはしていない。

## 勝率条件：未達

いずれも固定シード、Lv18、6人（戦士・戦士・僧侶・盗賊・魔法使い・僧侶）、10F守護者・随伴込み、300戦。

```sh
node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 18 --floor 10 --boss --gear shop --n 300
node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 18 --floor 10 --boss --gear drop --n 300
```

| 装備 | 勝率 | 全滅率 | 平均死者 | HP損耗率 | 平均ラウンド |
| --- | ---: | ---: | ---: | ---: | ---: |
| 店装備 | 95.33% | 4.67% | 0.41 | 0.3263691561 | 4.9533333333 |
| 迷宮装備を含む | 100% | 0% | 0.0033333333 | 0.1021777271 | 2.4966666667 |

指定の65〜90%を超える。既存の `/workspace/dsw-queue/report/01A-sim-before.txt` にある変更前の両装備の結果と一致。今回の変更内容に敵能力・装備・戦闘AIの調整は含まれないため、数値は変更していない。約78%の再現条件の確認または別途バランス調整が残る。

## キュー管理

総合判定が未完了のため `todo/01A-heavy-10f-final-boss.md` はdoneへ移していない。また、外部キュー `/workspace/dsw-queue` はこの実行環境の書込み許可範囲外（許可は作業リポジトリと `/tmp` のみ）。報告は書込み可能な本リポジトリの `report/` に保存した。
EOF
git diff --check' in /workspace/dungeonsweeper
 succeeded in 0ms:
codex
10Fクリア処理、11Fへの移動禁止、踏破記録の保存、帰還・再探索を実装しました。

- 共通3テスト・追加回帰テスト・シミュレータ検証：全PASS。
- 勝率条件は未達：Lv18・6人・300戦で店装備95.3%、迷宮装備100%。
- ブラウザ表示は未確認：Chromeが環境制限で起動失敗。
- 総合判定は未完了として、キューはtodoのままです。

変更ファイル一覧と検証詳細は[作業報告](/workspace/dungeonsweeper/report/01A-heavy-10f-final-boss.md)に保存しました。外部キューのreportは書込み許可範囲外です。
tokens used
71,428
10Fクリア処理、11Fへの移動禁止、踏破記録の保存、帰還・再探索を実装しました。

- 共通3テスト・追加回帰テスト・シミュレータ検証：全PASS。
- 勝率条件は未達：Lv18・6人・300戦で店装備95.3%、迷宮装備100%。
- ブラウザ表示は未確認：Chromeが環境制限で起動失敗。
- 総合判定は未完了として、キューはtodoのままです。

変更ファイル一覧と検証詳細は[作業報告](/workspace/dungeonsweeper/report/01A-heavy-10f-final-boss.md)に保存しました。外部キューのreportは書込み許可範囲外です。
EXIT=0
