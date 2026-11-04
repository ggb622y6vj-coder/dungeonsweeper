OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-luna
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: low
reasoning summaries: none
session id: 01a19886-59b7-7510-842b-fab2715d1492
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

# 019-light-chest-loot-table
ティア：LIGHT　依存：005、018

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
宝箱と敵ドロップの中身を階ごとの抽選表で決め、深い階ほど良い物が出るようにする。005の chestItemPool（価格≤階×150）を置き換えて拡張する。

## 変更内容
- dist/balance.js に `CHEST_LOOT` を追加する（添字＝階−1）。
  - itemChance：[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45]
  - priceCap：[150,200,350,500,1800,2200,3000,3600,6000,6000]
- `chestItemPool(floor)` を次の重み付き抽選にする。
  - 候補：武器（drop:true）と防具（part あり）のうち、price≤priceCap かつ (minFloor??1)≤floor のもの。
  - 重み：
    - shop:false の品は、minFloor の階では 0.5、それより深い階では 1。
    - minFloor が floor−3 以下の古い品は 0.3。
    - それ以外は 1。
  - 候補が空なら最安品1つ（005と同じ）。
- rewardChest：品が出る確率を .25 から `CHEST_LOOT.itemChance[floor-1]` に変える。
- dropWeapon：抽選を `chestItemPool(s.floor)` からにする（ドロップ率5%はそのまま）。
- 呪い・未鑑定のアイテムは現仕様に無いので扱わない（将来課題として BALANCE.md に記載）。
- 005のテスト「2Fで plate が出うる」は、plate が minFloor:3 になったので「3Fで出うる・2Fでは出ない」に更新する。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト（1万回抽選）：
  - 1Fで price>150 や minFloor>1 の品が出ない。
  - 5Fで炎の剣（shop:false・minFloor5）が出うる。
  - 10Fで聖剣が出うる。
  - 宝箱から品が出る率が itemChance ±2pt。
- 手動：不要。

codex
まず指定どおり `README`、`docs/HANDOFF.md`、`docs/SPECIFICATION.md` と関連コード・テストを確認し、019の範囲だけ実装します。
exec
/bin/bash -lc "pwd && rg --files -g 'README*' -g 'AGENTS.md' -g 'docs/HANDOFF.md' -g 'docs/SPECIFICATION.md' -g 'dist/balance.js' -g 'tests/*' -g 'BALANCE.md' -g '*.js' | head -200" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
dist/monster-data.js
dist/training.js
dist/items.js
dist/game.js
dist/balance.js
dist/combatui.js
dist/traps.js
dist/party.js
dist/monsters.js
dist/weapons.js
dist/spells.js
dist/recruits.js
dist/flags.js
AGENTS.md
BALANCE.md
README.md
data/README.md
tests/training.cjs
tests/game.cjs
tests/training-browser.py
docs/HANDOFF.md
docs/SPECIFICATION.md

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

codex
仕様を読みました。実装箇所を絞るため、`CHEST_LOOT` の定義場所、宝箱・ドロップ抽選経路、既存テストの抽選用フックを確認しています。
exec
/bin/bash -lc 'rg -n "chestItemPool|rewardChest|dropWeapon|WEAPONS|drop:|minFloor|plate|炎の剣|聖剣|CHEST_LOOT" dist tests BALANCE.md' in /workspace/dungeonsweeper
 succeeded in 0ms:
BALANCE.md:27:|武器|35|従来17品を維持し、4〜9F向け18品を追加。`minFloor`は宝箱・直接ドロップの出現開始階。|
dist/items.js:3: {id:'healingPotion',name:'傷薬',kind:'medicine',spell:'dios',description:'ディオス相当：味方1人のHPを1d8回復',classes:[0,1,2,3],sell:8,weight:70,minFloor:1},
dist/items.js:4: {id:'antidote',name:'解毒剤',kind:'medicine',spell:'latumofis',description:'ラツモフィス相当：味方1人の毒を解除',classes:[0,1,2,3],sell:6,weight:30,minFloor:1},
dist/items.js:5: {id:'paralysisCure',name:'気付け薬',kind:'medicine',spell:'dialko',description:'ディアルコ相当：味方1人の麻痺を解除',classes:[0,1,2,3],sell:15,weight:20,minFloor:3},
dist/items.js:6: {id:'greaterPotion',name:'上傷薬',kind:'medicine',spell:'dial',description:'ディアル相当：味方1人のHPを4d4回復',classes:[0,1,2,3],sell:30,weight:35,minFloor:4},
dist/items.js:7: {id:'elixir',name:'霊薬',kind:'medicine',spell:'dialma',description:'ディアルマ相当：味方1人のHPを8d3回復',classes:[0,1,2,3],sell:80,weight:20,minFloor:7}
dist/items.js:15: const pool=MEDICINES.filter(w=>(w.minFloor||1)<=(s.floor||1)),total=pool.reduce((n,w)=>n+w.weight,0);let roll=Math.random()*total,w=pool[0];for(let item of pool){roll-=item.weight;if(roll<0){w=item;break}}
dist/party.js:24:function thiefOpenChest(){let c=currentChest(),i=thiefMember();if(!c||i<0||logBusy()||s.enemy||s.done)return;fixChestTrap(c);if(Math.random()<.85){log(NAMES[i]+'が宝箱の罠を解除した。');rewardChest(c)}else{c.opened=true;log(NAMES[i]+'は宝箱の解除に失敗した！');triggerChestTrap(c);delete s.cells[s.pos].chest;log('宝箱は失われた。')}render()}
tests/game.cjs:227:run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
tests/game.cjs:234:  let legacyIds=['shortbow','longbow','compositebow','dagger','thiefblade','sword','staff','mace','longsword','battleaxe','greatsword','oakstaff','runestaff','starstaff','ironmace','warhammer','sacredmace','cap','helm','robe','leather','chain','plate','boots','greaves','wardrobe'];
tests/game.cjs:243:  if(available.has('greaterPotion')||available.has('elixir')||available.has('paralysisCure'))throw Error('medicine below minFloor');
tests/game.cjs:244:  if(!chestItemPool(4).some(w=>w.id==='knightsword')||chestItemPool(1).some(w=>w.id==='knightsword'))throw Error('equipment minFloor pool');
tests/game.cjs:252:run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[dagger];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
dist/game.js:28:function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0,survivors=s.members.filter((_,i)=>s.hp[i]>0).length,share=xp>0&&survivors>0?Math.max(1,Math.floor(xp/survivors)):0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=share;if(share)log(`生存者は経験値${share}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}
dist/game.js:42:function weapon(id){return WEAPONS.find(w=>w.id===id)||MEDICINES.find(w=>w.id===id)}
dist/game.js:51:function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
dist/game.js:55:function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
dist/game.js:63:function render(){ensureProfile();$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();$('#maptoggle').hidden=s.area!=='dungeon';if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic?' / 秘宝 ✦':''}`;$('#party').innerHTML=NAMES.map((n,i)=>`${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`).join('');$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${s.pos===i?num(i):c.open?(c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div><button id="flee">逃げる</button>`;$('#flee').onclick=flee;$('#flee').disabled=logBusy()||combat.boss||combat.flagEffect?.bad;renderCommandEntry()}$('#frontflag').disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();scene()}
dist/game.js:84:function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
dist/game.js:85:function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
dist/game.js:86:function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
dist/weapons.js:3:// minFloor：宝箱・ドロップに出る最も浅い階（省略時1）。shop:false は鍛冶屋に並ばない迷宮産の品（売却は可）。
dist/weapons.js:4:const WEAPONS = [
dist/weapons.js:5: {id:'shortbow',name:'短弓',range:'ranged',dice:[1,6,0],classes:[0,3],price:45,sell:22,drop:true},
dist/weapons.js:6: {id:'longbow',name:'長弓',range:'ranged',dice:[1,8,1],classes:[0,3],price:95,sell:47,drop:true},
dist/weapons.js:7: {id:'compositebow',name:'合成弓',range:'ranged',dice:[2,4,1],classes:[0,3],price:160,sell:80,drop:true,minFloor:2},
dist/weapons.js:8: {id:'dagger',name:'短剣',dice:[1,4,1],classes:[3],price:15,sell:7,drop:true},
dist/weapons.js:9: {id:'thiefblade',name:'盗賊の小剣',dice:[1,6,2],classes:[3],price:60,sell:30,drop:true},
dist/weapons.js:10: {id:'sword',name:'剣',dice:[1,6,2],classes:[0],price:20,sell:10,drop:true},
dist/weapons.js:11: {id:'staff',name:'杖',dice:[1,3,0],classes:[1],price:12,sell:6,drop:true},
dist/weapons.js:12: {id:'mace',name:'メイス',dice:[1,6,0],classes:[2],price:18,sell:9,drop:true},
dist/weapons.js:13: {id:'longsword',name:'長剣',dice:[1,8,3],classes:[0],price:60,sell:30,drop:true},
dist/weapons.js:14: {id:'battleaxe',name:'戦斧',dice:[2,6,1],classes:[0],price:110,sell:55,drop:true,minFloor:2},
dist/weapons.js:15: {id:'greatsword',name:'大剣',dice:[2,8,2],classes:[0],price:190,sell:95,drop:true,minFloor:2},
dist/weapons.js:16: {id:'oakstaff',name:'樫の杖',dice:[1,6,1],classes:[1],price:45,sell:22,drop:true},
dist/weapons.js:17: {id:'runestaff',name:'ルーンの杖',dice:[2,4,2],classes:[1],price:100,sell:50,drop:true,minFloor:2},
dist/weapons.js:18: {id:'starstaff',name:'星鉄の杖',dice:[2,6,2],classes:[1],price:180,sell:90,drop:true,minFloor:2},
dist/weapons.js:19: {id:'ironmace',name:'鉄のメイス',dice:[1,8,1],classes:[2],price:50,sell:25,drop:true},
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
dist/index.html:2::root{color-scheme:dark;--gold:#d7b881;--line:#393832}*{box-sizing:border-box}body{margin:0;background:#101513;color:#e7e3d8;font-family:system-ui,sans-serif}main{max-width:1120px;margin:auto;padding:24px}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:20px}small,.muted{color:#979f92;font-size:12px;letter-spacing:2px}h1{font-family:serif;font-weight:400;letter-spacing:8px;margin:8px 0;font-size:36px}button{font:inherit;background:#242c26;color:#e7e3d8;border:1px solid #4a5143;border-radius:5px;padding:11px;cursor:pointer;touch-action:manipulation}button:hover{border-color:var(--gold)}button:disabled{opacity:.4;cursor:default}.layout{display:grid;grid-template-columns:1.15fr 1fr;gap:24px;margin-top:24px}.panel{border:1px solid var(--line);background:#171d19;border-radius:8px;overflow:hidden}.heading{display:flex;justify-content:space-between;padding:16px;border-bottom:1px solid var(--line);font-size:13px;color:var(--gold)}#scene{height:290px;background:radial-gradient(ellipse at center,#455044,#101612 65%);position:relative;overflow:hidden;display:grid;place-items:center}.corridor{position:absolute;inset:0;width:100%;height:100%;opacity:.65}.figure{font-size:72px;z-index:1;filter:drop-shadow(0 0 20px #d1ab5c)}#caption{position:absolute;bottom:15px;z-index:2;letter-spacing:3px;font-family:serif}.party{padding:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.card{background:#222b24;padding:12px;border-radius:4px;font-size:13px}.card b{display:block;margin-bottom:8px;color:var(--gold)}progress{width:100%;height:6px;accent-color:#9ea87c}.toolbar{display:flex;gap:6px;padding:12px}.toolbar button{flex:1;font-size:13px;padding:10px 4px}.active{background:#bba06b!important;color:#151b17!important}.board{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;padding:0 14px 14px}.cell{aspect-ratio:1;padding:0;border-radius:3px;background:#2b352d;font-weight:700;font-size:19px;position:relative;min-width:0}.cell.open{background:#18201a;border-color:#303b31;color:#9bb7a0}.cell.near{border-color:#9c8b62}.cell.here{outline:2px solid var(--gold);outline-offset:-2px;background:#454830}.cell em{position:absolute;font-size:9px;right:2px;bottom:1px;font-style:normal}.legend{padding:4px 16px 16px;color:#aeb5a7;font-size:12px;line-height:1.8}.actions{display:flex;gap:8px;padding:0 16px 16px}.actions button{flex:1}#log{padding:16px;font-size:13px;line-height:1.9;min-height:130px;color:#b9c1b0}#log div:first-child{color:#ead8b7}details{margin-top:22px;line-height:1.9;color:#b7beaf;font-size:13px}summary{cursor:pointer;color:var(--gold)}footer{margin-top:24px;color:#748172;font-size:11px;letter-spacing:2px}#status{color:var(--gold);font-size:13px}#battle{padding:16px;border-top:1px solid var(--line)}@media(max-width:700px){main{padding:14px}h1{font-size:28px}.layout{grid-template-columns:1fr;gap:16px;margin-top:16px}#scene{height:170px}.party{padding:10px;gap:6px}.card{padding:9px}.cell{font-size:20px}header{padding-bottom:12px}.heading{padding:12px}}
dist/index.html:4:.layout{grid-template-columns:minmax(0,1.7fr) minmax(260px,1fr)}#scene{height:auto;aspect-ratio:1.65;background:#101612}#scene svg{width:100%;height:100%;display:block}.cell.here{background:#d3b780;color:#171e19!important;outline:2px solid #fff0ca;font-family:system-ui,sans-serif;font-weight:900;font-size:24px}.cell.here::after{content:attr(data-dir);position:absolute;font-size:12px;top:-5px;right:0;color:#fff0ca;background:#293329;padding:0 2px}.maphint{font-size:12px;color:#acb3a6;padding:12px 16px;line-height:1.7}.navinfo{display:flex;justify-content:space-between;padding:10px 16px;color:#d7b881;font-size:13px}.movement{display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 16px 16px}.movement>div{display:grid;gap:7px}.movement button{min-width:95px;font-size:22px;padding:7px 12px}.movement small{display:block;font-size:11px;color:inherit;letter-spacing:1px}.actions button{font-size:13px}.board{gap:4px}.cell{font-family:system-ui,sans-serif;font-weight:800}.layout>section:last-child{align-self:start}#battle{background:#34271f}#battle button{width:100%}@media(max-width:700px){.layout{grid-template-columns:1fr}.movement button{min-width:80px}.layout>section:last-child{width:100%}#scene{height:auto;aspect-ratio:1.6}.cell.here{font-size:23px}}
dist/index.html:6:#scene{aspect-ratio:auto;height:245px}#scene svg{height:100%;width:100%}.controls{display:grid;grid-template-columns:minmax(85px,1fr) auto minmax(110px,1fr);gap:10px;align-items:center;padding:12px}.navinfo{padding:0;display:flex;flex-direction:column;gap:6px;font-size:12px;line-height:1.5;min-width:0}.movement{padding:0;gap:5px}.movement>div{gap:5px}.movement button{min-width:48px;padding:6px;font-size:19px}.movement small{font-size:10px;letter-spacing:0}.frontactions{display:grid;gap:7px}.frontactions button{font-size:12px;padding:10px 6px;min-height:42px}.cell.here::after{content:none}.direction-marker{position:absolute;inset:1px;width:calc(100% - 2px);height:calc(100% - 2px);pointer-events:none;z-index:0}.cell-number{position:relative;z-index:1}.cell.here{background:#e0c58b}.cell.here .cell-number{text-shadow:0 0 3px #ffe2a4,0 0 3px #ffe2a4}#log{height:110px}.party{padding-top:6px}@media(max-width:700px){#scene{height:190px}.controls{gap:6px;padding:9px;grid-template-columns:minmax(70px,1fr) auto minmax(90px,1fr)}.navinfo{font-size:10px}.movement button{min-width:37px;padding:6px 3px}.movement small{font-size:9px}.frontactions button{font-size:10px;padding:8px 4px}.movement{gap:3px}#log{height:105px}}
dist/index.html:10:header{gap:12px;flex-wrap:wrap}.headeractions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.headeractions button{font-size:12px;padding:9px}.controls{grid-template-columns:auto minmax(120px,1fr);justify-content:center;gap:18px}.movement{justify-content:center}.maplocation{padding:16px;color:var(--gold);font-size:13px}.cell.in-view{background:#364238;border-color:#819079;box-shadow:inset 0 0 0 1px #74856d55}.cell.here{border-color:var(--gold)}.hpbar{position:relative;height:24px;border:1px solid #60705a;background:#141c16;border-radius:3px;overflow:hidden;margin:8px 0}.hpfill{height:100%;background:#758a60;transition:width .2s}.hpvalue{position:absolute;right:6px;top:0;line-height:22px;font-size:13px;font-weight:800;color:#fff6df;text-shadow:0 1px 2px #000}.hpbar.low{border-color:#b95353}.hpbar.low .hpfill{background:#8f3030}.hpbar.low .hpvalue{color:#ff8d8d}dialog{background:#19211c;color:#d9dfd1;border:1px solid #8c805f;border-radius:9px;width:min(620px,94vw);max-height:85vh;padding:22px;line-height:1.8;font-size:13px}dialog::backdrop{background:#000b}.dialoghead{display:flex;align-items:center;justify-content:space-between;gap:12px}.dialoghead h2{font-size:18px;margin:0}.dialoghead button{font-size:23px;padding:0 12px}.cell.boss-cell .cell-number{color:#dc9e7d}#log div:first-child{color:#ead8b7}@media(max-width:700px){.controls{grid-template-columns:auto minmax(100px,1fr);gap:12px}.headeractions{gap:6px}.headeractions button{font-size:11px}.hpvalue{font-size:12px}.maplocation{padding:12px}}
dist/index.html:14:.mpbar{height:19px;background:#111e20;border:1px solid #405c62;position:relative;border-radius:3px;overflow:hidden;margin:-3px 0 9px}.mpbar>div{height:100%;background:#466c79}.mpbar>span{position:absolute;inset:0 5px 0 0;text-align:right;font-size:11px;font-weight:700;line-height:17px;color:#d3edf2}.card b small{font-size:10px;letter-spacing:0;color:#acb29a}.enemytargets{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px}.enemytargets label{font-size:12px;background:#222a21;padding:7px;border:1px solid #525d46;border-radius:4px;display:flex;align-items:center;gap:5px}.statcard{border-top:1px solid #475140;padding:12px 0}.statcard h3{margin:4px 0 10px;color:var(--gold)}.statcard dl{display:grid;grid-template-columns:120px 1fr;gap:6px;margin:0 0 12px}.statcard dd{margin:0;text-align:right}.statcard dt{color:#aeb79f}#levelreport{white-space:pre-line;color:#d5c28c;font-size:13px}#catalogbody{overflow:auto}#catalogbody table{width:100%;border-collapse:collapse;white-space:nowrap}#catalogbody th,#catalogbody td{border-bottom:1px solid #40513d;padding:8px;font-size:12px;text-align:left}#maptoggle{display:none}#mapdialog{width:min(410px,95vw);padding:12px}#mapdialog #mappanel{border:0}#mapdialog .maplocation{display:none}#mapdialog .board{padding:12px 0 0}#mapdock{min-width:0}@media(max-width:700px){#mapdock{display:none}#maptoggle{display:block;position:fixed;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:50;border-color:#d2b67f;box-shadow:0 4px 20px #0008;background:#2c382b;padding:14px 19px;border-radius:30px}main{padding-bottom:85px}#mapdialog{margin:auto auto 80px auto;max-height:80vh}#statsdialog{padding:15px}.statcard dl{grid-template-columns:85px 1fr}.enemytargets label{font-size:11px}}
dist/index.html:16:header{border-bottom:0}.viewlog{display:grid;grid-template-columns:1fr 1fr;min-width:0}#scene{height:225px}#log{height:225px;border-top:0;border-left:1px solid #46513f}dialog{max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;padding:12px;line-height:1.4}.dialoghead{position:sticky;top:-12px;background:#19211c;z-index:5;padding:8px 0;margin-bottom:8px}.dialoghead button{min-width:44px;min-height:44px;flex-shrink:0}.dialoghead h2{font-size:16px}.statcard{padding:7px 0}.statcard h3{margin:0 0 5px}.statcard dl{gap:2px;margin-bottom:5px;font-size:12px;line-height:1.3}.statcard button{padding:6px 10px}.statcard dd{overflow-wrap:anywhere}#mapdialog{margin:auto;max-height:calc(100dvh - 32px)}@media(max-width:700px){.viewlog{grid-template-columns:1fr}#scene{height:170px}#log{height:120px;border-left:0;border-top:1px solid #46513f}#statsdialog{padding:10px}.dialoghead{top:-10px}.statcard dl{grid-template-columns:90px 1fr}}
dist/index.html:21:.enemytargets{display:grid;gap:8px}.enemygroup>b{font-size:12px;color:var(--gold)}.enemygroup>div{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px}.enemygroup label{min-width:50px;justify-content:center}.log-ally{color:#78b7ff}.log-enemy{color:#ff8686}.log-heal{color:#85d99b}.log-damage{color:#ffb05f}.log-spell{color:#d2a0ff}.headeractions .iconbutton{width:44px;height:44px;padding:9px;display:grid;place-items:center;font-size:24px;font-weight:700}.iconbutton svg{width:24px;height:24px;fill:currentColor}header.in-dungeon{justify-content:flex-end;padding-bottom:0}.movement button{width:44px;min-width:44px;height:44px;padding:5px;font-size:24px}header.in-dungeon+.panel[hidden]{display:none}.controls[hidden]{display:none}.attackrow{display:block;margin:7px 0}.attackrow select{width:100%;min-width:0;font-size:11px;background:#1c271f;color:#e7e3d8;border:1px solid #52634e;border-radius:4px;padding:8px 3px}.card [data-medicine]{width:100%;margin-top:7px;font-size:12px;padding:9px 4px}#medicinedialog select{max-width:100%;padding:10px;background:#273328;color:#eee}#medicinedialog>label{display:block;margin:10px 0}#medicineuse{display:block;width:100%;margin-top:14px}.flag-power{color:#ffaaaa;border-color:#a85050;background:#3a2424}.flag-guard{color:#acd2ff;border-color:#527caa;background:#202f40}.flag-magic{color:#d9b7ff;border-color:#8861ad;background:#31243f}.flag-button:disabled{opacity:.85}.party{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.card{min-width:0;padding:9px}.card b{margin-bottom:5px}.commandchoices,.commandreview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:10px 0}#commandentry{padding:10px 0}#commandentry b small{color:#aab4a1;font-weight:400}.commandchoices button,.commandreview button{min-height:44px;padding:9px;font-size:13px}@media(max-width:700px){.party{grid-template-columns:repeat(2,minmax(0,1fr))}.card{font-size:12px}.statcard dl{line-height:1.3}}header.in-dungeon{display:none}#statsopen{position:fixed;left:16px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:20;width:48px;height:48px;border-radius:50%;box-shadow:0 3px 14px #0008}#maptoggle{bottom:calc(14px + env(safe-area-inset-bottom));z-index:20}main{padding-bottom:80px}.flagactions{display:flex;gap:6px}.flagactions #flagopen{flex:0 0 44px;padding:8px}.flagactions #frontflag{flex:1}.mapheading{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px}.mapheading .maplocation{padding:0}#mapflagopen{padding:8px;font-size:12px}.party{grid-template-columns:repeat(3,minmax(0,1fr));padding:7px;gap:5px}.card{padding:6px;font-size:11px}.card b{margin:0 0 3px}.card b small{font-size:9px}.hpbar{height:18px}.hpvalue{line-height:18px;font-size:11px}.mpbar{height:13px;font-size:10px}.mpbar span{line-height:13px}#status{font-size:12px;white-space:nowrap}.dialoghead{gap:8px}#battle{padding:8px}.enemytargets{margin-bottom:4px;font-size:11px}#commandentry{padding:4px 0}.commandchoices,.commandreview{margin:6px 0}.controls{padding:7px}@media(max-width:700px){main{padding-top:8px}.party{grid-template-columns:repeat(3,minmax(0,1fr))}#scene{height:clamp(110px,22svh,165px)}#log{height:clamp(65px,12svh,100px)}.viewlog{gap:0}.movement button{min-height:38px;padding:5px}.frontactions button{font-size:11px}.controls{grid-template-columns:auto minmax(0,1fr)}.card b small{display:block}.commandchoices button,.commandreview button{min-height:40px;padding:7px}#battle>button{padding:9px}}
dist/index.html:23:.party-rank{grid-column:1/-1;font-size:10px;color:#b9c3b1;line-height:12px}.log-flag-power{color:#ffb05f}.log-flag-guard{color:#85d99b}.log-flag-magic{color:#d2a0ff}#tavernslots{display:grid;gap:8px;margin:12px 0}#tavernslots label{display:flex;align-items:center;gap:12px}#tavernslots select{flex:1;min-width:0;padding:10px;background:#263128;color:#eee;border:1px solid #53634e}#tavernsave{width:100%}@media(max-width:700px){.card{padding:4px}.party{gap:3px}.party-rank{line-height:10px}.hpbar{height:16px}.hpvalue{line-height:16px}} #statsbody{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px}#statsdialog{width:min(720px,96vw)}.statcard{min-width:0}.statcard h3{font-size:14px}.statcard h3 small{font-size:10px;white-space:nowrap}.statcard dl{grid-template-columns:auto minmax(0,1fr);font-size:11px;gap:1px 5px}.statcard button{margin:2px 0;padding:7px;font-size:11px;min-height:32px}.statcard>button{width:100%}#party{cursor:pointer}#party:focus-visible{outline:2px solid var(--gold)}header.in-dungeon+#statsopen{display:none}#equipmentsummary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:10px 0}#equipmentsummary>div{padding:8px 4px;border:1px solid #46513f;text-align:center;font-size:12px}#equipmentsummary small{display:block;color:#b6bfa9;font-size:10px}#equipmentsummary b{display:block;margin-top:4px}#transfersection{border-block:1px solid #46513f;padding:10px 0}#transfersection summary{cursor:pointer;color:var(--gold)}#transfersection label{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:12px}#transfersection select{flex:1;min-width:0}#transfernotice{font-size:12px;margin:6px 0}#partyorder{margin:8px 0}#partyorder label{display:flex;gap:8px;align-items:center;margin:5px 0;font-size:12px}#partyorder select{flex:1;min-width:0;padding:7px}#partyreorder{font-size:12px;padding:7px 10px}@media(max-width:420px){#statsbody{gap:5px 9px}.statcard h3{font-size:12px}.statcard h3 small{display:block}.statcard dl{font-size:10px}.statcard button{padding:5px}.statcard{padding:5px 0}#equipmentsummary{gap:3px}#equipmentsummary>div{font-size:11px}} @media(max-width:700px){#statsdialog .statcard dl{line-height:1.15;margin-bottom:4px}#statsdialog .statcard h3{line-height:1.2;margin-bottom:4px}#statsdialog .statcard h3 small{display:inline;font-size:9px}#statsdialog .statcard>button{min-height:28px;padding:4px;font-size:10px}#statsdialog .statcard{padding:4px 0}#statsdialog .dialoghead{padding:3px 0}} #scene{position:relative}.encounter-notice{position:absolute;inset:0;display:grid;place-items:center;background:#0b120bd9;color:#f1d7a5;font-size:clamp(17px,2.5vw,24px);font-weight:700;letter-spacing:1px;text-align:center;padding:10px;pointer-events:none} .stat-actions{display:flex;gap:5px;align-items:center}.stat-actions button{flex:1;min-width:0;white-space:nowrap;margin:2px 0;padding:7px 3px;letter-spacing:0}.ailment-tag{display:inline-block;vertical-align:middle;border:1px solid;border-radius:4px;padding:1px 4px;margin-left:4px;font-size:10px;line-height:1.25;letter-spacing:0;font-weight:600;white-space:nowrap}.ailment-poison{color:#c0a1ed;background:#352743;border-color:#73578d}.ailment-paralysis{color:#f3d18c;background:#40371e;border-color:#8d7946}.ailment-dead{color:#ffaaa5;background:#452728;border-color:#925251}.ailment-sleep{color:#a9c8ef;background:#243344;border-color:#536f93}#party .card b small{display:inline;margin-left:3px}#party .ailment-tag{font-size:9px;padding:0 3px;margin-left:3px}@media(max-width:700px){#statsdialog .stat-actions button{font-size:11px;min-height:32px;padding:5px 2px}.statcard h3 .ailment-tag{font-size:9px;margin-left:3px;padding:0 3px}} #statsdialog .stat-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 9px}.stat-metrics>div{display:grid;grid-template-columns:auto minmax(0,1fr);gap:3px;align-items:baseline;min-width:0}.stat-metrics dt,.stat-metrics dd{font-size:10px;letter-spacing:0}.stat-metrics dd{font-variant-numeric:tabular-nums}#statsdialog .dialoghead{gap:7px}#statsdialog .dialoghead h2{margin-right:auto;white-space:nowrap}#statsdialog #partyreorder{min-width:0;min-height:34px;padding:6px;font-size:11px;white-space:nowrap}#statsdialog #status{font-size:11px}#leveldialog{width:min(560px,94vw)}#levelreport{font-size:13px;line-height:1.8;white-space:pre-line}.spellrow:disabled{opacity:.4;cursor:not-allowed}@media(max-width:420px){#statsdialog .dialoghead h2{font-size:13px}#statsdialog .dialoghead{gap:4px}#statsdialog .stat-metrics{gap:4px 6px}.stat-metrics dt,.stat-metrics dd{font-size:10px}} .party-wrap{position:relative}.party-wrap #commandreviewpopup{position:absolute;inset:0;z-index:3;background:#172018f2;border:1px solid #8c9879;border-radius:5px;padding:5px 9px;overflow:auto;box-shadow:0 5px 18px #000a}.party-wrap #commandreviewpopup[hidden]{display:none}.party-wrap #commandreviewpopup>b{color:var(--gold);font-size:12px}.party-wrap .commandreview{font-size:11px}.party-wrap .commandreview th,.party-wrap .commandreview td{padding:2px 5px}.scene-enemies{position:absolute;left:6px;top:6px;z-index:1;background:#172018e8;border:1px solid #69745f;border-radius:4px;color:#e1cca2;padding:4px 6px;font-size:clamp(9px,1.4vw,11px);line-height:1.35;pointer-events:none}
dist/index.html:24:.townmenu{flex-wrap:wrap}#training{width:min(720px,94vw)}.recruit-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.recruit-fields label{display:grid;gap:5px}.recruit-fields input,.recruit-fields select{width:100%;min-width:0;font:inherit;padding:10px;background:#222d24;color:#e0d8bb;border:1px solid #66715a;border-radius:4px}#training button{min-height:44px}.recruit-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.recruit-metrics div{background:#222b24;padding:8px}.recruit-metrics dd{margin:0;color:var(--gold)}#recruitlist section{border-top:1px solid var(--line);padding:12px 0;overflow-wrap:anywhere}#recruitlist h4{margin:0;color:var(--gold)}.recruit-actions{display:flex;flex-wrap:wrap;gap:8px}#emptyparty{text-align:center}@media(max-width:420px){#training{padding:14px}.recruit-fields{grid-template-columns:1fr}.recruit-actions button{flex:1;white-space:nowrap}}

exec
/bin/bash -lc "cat dist/balance.js && sed -n '190,270p' tests/game.cjs && sed -n '1,80p' dist/weapons.js && sed -n '20,36p' BALANCE.md" in /workspace/dungeonsweeper
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
const MAX_FLOOR=10;
function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
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

// Exercise movement itself: stale flags/chests or queued logs must not block cell().
drain();
run(`var savedPoisonState=structuredClone(s),savedPoisonRandom=Math.random,savedPoisonMode=mode;
s.area='dungeon';s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;
mode='move';s.logs=[];s.hp=s.members.map(()=>20);
s.ailments=s.members.map(()=>({poison:false,paralysis:0}));
s.cells.forEach(c=>{c.type='';c.trap=false;c.flag=false;c.open=true;delete c.chest});
s.pos=0;s.hp[0]=2;s.ailments[0].poison=true;Math.random=()=>.99;`);
try {
  run(`cell(1);
if(s.pos!==1||s.hp[0]!==0)throw Error('poison death on movement');
var poisonDeathText=NAMES[0]+'は毒で倒れた。';
var poisonDeathEntries=logQueue.filter(e=>e.text===poisonDeathText);
if(poisonDeathEntries.length!==1||poisonDeathEntries[0].hp[0]!==0)throw Error('poison death log / snapshot');
if(logQueue.some(e=>e.text.includes('毒で2ダメージ')))throw Error('exploration poison damage log');`);
  drain();
  run(`cell(0);
if(s.pos!==0||s.hp[0]!==0||logQueue.some(e=>e.text===poisonDeathText))throw Error('duplicate poison death');
if(s.logs.filter(t=>t===poisonDeathText).length!==1)throw Error('rendered poison death count');
s.logs=[];s.hp[0]=10;cell(1);
if(s.pos!==1||s.hp[0]!==8)throw Error('nonfatal poison on movement');
if(logQueue.some(e=>e.text.includes('毒')))throw Error('nonfatal poison queued log');`);
  drain();
  run(`if(s.logs.some(t=>t.includes('毒')))throw Error('nonfatal poison rendered log');
s.hp[0]=2;tickAilments();
if(s.hp[0]!==0||logQueue.filter(e=>e.text===poisonDeathText).length!==1||!logQueue.some(e=>e.text===NAMES[0]+'は毒で2ダメージ。'))throw Error('combat poison death and damage logs');`);
  drain();
} finally {
  run(`clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;
s=savedPoisonState;Math.random=savedPoisonRandom;mode=savedPoisonMode;refreshNames();`);
}
console.log('PASS exploration poison death once with HP snapshot, silent nonfatal movement and combat poison logs');

run(`s=structuredClone(sixInitial);ensureProfile();if(s.magicPlans.length!==6)throw Error('six-member magic plans');s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==6)throw Error('short plan padding');s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==3)throw Error('legacy three-member magic plans');`);
console.log('PASS magic plans pad to party length and preserve legacy three-member saves');

run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
console.log('PASS chest item pool price cap and 10,000 floor 1 draws');

run(`{
let savedState=structuredClone(s),savedRandom=Math.random;
try{
  s=structuredClone(sixInitial);ensureProfile();s.area='town';s.floor=1;s.gold=10000;
  let legacyIds=['shortbow','longbow','compositebow','dagger','thiefblade','sword','staff','mace','longsword','battleaxe','greatsword','oakstaff','runestaff','starstaff','ironmace','warhammer','sacredmace','cap','helm','robe','leather','chain','plate','boots','greaves','wardrobe'];
  if(legacyIds.some(id=>!weapon(id)))throw Error('legacy equipment ids lost');
  renderShop();let shop=$('#shopitems').innerHTML;
  if(shop.includes('flamesword')||shop.includes('magichelm'))throw Error('shop:false item visible');
  let gold=s.gold,count=s.inventory[0].length;buy('flamesword',0);
  if(s.gold!==gold||s.inventory[0].length!==count)throw Error('shop:false item bought');
  s.floor=1;let old=Math.random,available=new Set();
  for(let n=0;n<100;n++){let rolls=[0,n/100];Math.random=()=>rolls.shift()??.99;dropMedicine();available.add(s.inventory[0].at(-1));s.inventory[0].pop()}
  Math.random=old;
  if(available.has('greaterPotion')||available.has('elixir')||available.has('paralysisCure'))throw Error('medicine below minFloor');
  if(!chestItemPool(4).some(w=>w.id==='knightsword')||chestItemPool(1).some(w=>w.id==='knightsword'))throw Error('equipment minFloor pool');
  s.members[0].job=0;s.members[0].level=1;s.members[0].str=10;s.inventory[0]=['flamesword'];s.equipped[0]=0;
  s.enemy={units:[{id:'slime',uid:0,row:0,hp:100,rewarded:false}]};Math.random=()=>.525;
  let result=physicalAttack(0,s.enemy.units[0]);if(result.hitsCount!==1)throw Error('weapon hitBonus not applied');
}finally{s=savedState;Math.random=savedRandom;displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;renderShop();}
}`);
console.log('PASS expanded equipment ids, shop:false gate, floor loot gates, and hitBonus');

run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[dagger];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
console.log('PASS chest item unusable, full inventory and normal receipt logs');

// Isolate reward cases from the shared combat fixtures and their random overrides.
drain();run(`{let savedXPState=structuredClone(s);try{
  s=structuredClone(sixInitial);s.area='dungeon';s.done=false;
  s.enemy={units:[],chestBattle:true};
  for(let [total,alive,expected] of [[100,[0,2,5],33],[100,[4],100],[2,[0,2,5],1],[0,[0,2,5],0],[100,[],0]]){
    s.hp=s.members.map((_,i)=>alive.includes(i)?20:0);
    let before=s.members.map(m=>m.xp),logCount=logQueue.length;
    s.enemy.pendingXP=total;awardVictory(s.enemy);
    if(s.members.some((m,i)=>m.xp!==before[i]+(alive.includes(i)?expected:0)))throw Error('survivor XP split / dead exclusion');
    let rewardLogs=logQueue.slice(logCount).filter(x=>x.text.startsWith('生存者は経験値'));
    if(expected?rewardLogs.length!==1||rewardLogs[0].text!=='生存者は経験値'+expected+'を獲得。':rewardLogs.length!==0)throw Error('per survivor XP log');
    let paid=s.members.map(m=>m.xp).join();awardVictory(s.enemy);
    if(s.members.map(m=>m.xp).join()!==paid||s.enemy.pendingXP!==0)throw Error('duplicate XP award');
  }
}finally{s=savedXPState;}}`);drain();
console.log('PASS XP split 100/3=33, 100/1=100, dead exclusion, minimum 1, zero reward, no survivors, per-person log and duplicate guard');
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

実装の正本は `dist/balance.js`（職業・魔法・敵・編成・経験値）と `dist/weapons.js`（武器）。ダイス配列は `[個数, 面数, 固定加算]`。テストは `node tests/game.cjs`。

## 武器・防具

|区分|品数|補足|
|---|---:|---|
|武器|35|従来17品を維持し、4〜9F向け18品を追加。`minFloor`は宝箱・直接ドロップの出現開始階。|
|防具|21|従来9品を維持し、4〜9F向け12品を追加。|
|合計|56|うち迷宮限定（`shop:false`）は武器10品、防具6品。鍛冶屋では販売せず、宝箱・敵ドロップの対象。|

各品のID、価格、売値、使用職、ダイス、AC、出現階、命中補正は `dist/weapons.js` を参照。武器の `hitBonus` は味方物理攻撃の命中閾値に加算する。旧装備IDは維持している。

## 薬

|薬|出現開始階|効果|
|---|---:|---|

apply patch
patch: completed
/workspace/dungeonsweeper/dist/balance.js
/workspace/dungeonsweeper/dist/game.js
diff --git a/dist/balance.js b/dist/balance.js
index 4bb2fa7902df21b4f3b9b782c2c2b399d5359b3e..bca0c9cc2f1530d6afaa37c55860e5f7b92f9f6b
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -8,6 +8,7 @@
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
 const MAX_FLOOR=10;
+const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
 function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
 function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
diff --git a/dist/game.js b/dist/game.js
index 0d9ae2a4f37754df15f7353c830c67463e7f9448..68ca3f18fb0651570297053c3a0a10a5ec6c8102
--- a/dist/game.js
+++ b/dist/game.js
@@ -48,7 +48,7 @@
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
-function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
+function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(w=>w.drop),w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(!w)return;if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
@@ -81,8 +81,8 @@
 function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
 function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
-function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
-function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
+function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [item]}let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return [entry.item]}return [pool.at(-1).item]}
+function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=chestItemPool(s.floor)[0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
 $('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
 $('#chestopen').onclick=()=>openChest(false);

codex
抽選を「重み付きで選んだ1品」を返す形にしています。これにより宝箱と直接ドロップが同じ階層表を使えます。次に既存テストの `includes()` 前提を新仕様に合わせ、固定乱数で候補品・出現率を再現確認します。
exec
/bin/bash -lc "head -80 tests/game.cjs && rg -n \"vm|run\\(|createContext|load\" tests/game.cjs | head -30" in /workspace/dungeonsweeper
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
1:const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
2:drain();run(`
3:s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');if(s.hp.some((h,i)=>h!==maxHP(i))||s.mp.some((h,i)=>h!==s.members[i].maxMP))throw Error('refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
5:s.enemy={boss:false,target:1,units:[{id:'slime',uid:0,hp:1000,rewarded:false},{id:'wolf',uid:1,hp:1,rewarded:false}]};s.commands=['fight','guard','guard'];var oldxp=s.members[0].xp;attack();if(!s.enemy||s.enemy.units[0].hp!==1000||s.enemy.units[1].hp!==0||s.members[0].xp!==oldxp||s.enemy.pendingXP!==14)throw Error('target or reward');`);drain();run(`var ex=s.members[0].xp;killReward(s.enemy.units[1]);if(s.members[0].xp!==ex)throw Error('double reward');s.enemy.units[0].hp=1000;s.mp[1]=2;s.magicPlans[1]={id:'halito',target:0};s.commands=['guard','spell','guard'];attack();if(s.mp[1]!==0||s.enemy.units[0].hp!==992)throw Error('spell MP damage');`);drain();run(`s.enemy=null;s.mp[2]=1;var before=s.hp.join();castMagic(2,'dios',0);if(s.hp.join()!==before||s.mp[2]!==1)throw Error('insufficient MP');s.area='dungeon';delete s.members;delete s.mp;s.spell=2;s.heal=1;s.enemy={boss:false,hp:11};ensureProfile();if(s.mp[1]!==8||s.mp[2]!==3||s.enemy.units[0].hp!==11)throw Error('migration');`);
7:drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
8:drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.cells[s.pos].chest={gold:7,opened:false,trap:'none'};s.scan=2;var oldgold=s.gold;Math.random=()=>.99;openChest(true);if(s.gold!==oldgold+21||currentChest())throw Error('safe chest');`);drain();run(`openChest(false);if(s.gold!==oldgold+21)throw Error('double chest');s.cells[s.pos].chest={gold:9,opened:false};s.scan=0;if(!currentChest())throw Error('new chest');s.hp=[32,24,26];afflict(0,'poison');tickAilments();if(s.hp[0]!==30)throw Error('poison');afflict(1,'paralysis');tickAilments();if(s.ailments[1].paralysis!==3)throw Error('paralysis');`);drain();run(`abandonChest()`);drain();run(`enterTown();if(s.ailments.some(a=>a.poison||a.paralysis))throw Error('town cure');`);console.log('PASS direct chest, once-only rewards, poison, paralysis, town cure');
10:drain();run(`for(let floor of [1,2,3]){let expected=[9,15,23][floor-1],boardSize=6+floor*2;if(trapCount(floor,boardSize)!==expected)throw Error('trap count formula');for(let trial=0;trial<1000;trial++){fresh(floor);if(s.cells.filter(c=>c.trap).length!==expected)throw Error('generated trap count');let path=[s.start],p=s.start;while(p!==s.boss){let choices=[];if(p%size()!==s.boss%size())choices.push(p+(p%size()<s.boss%size()?1:-1));if((p/size()|0)!==(s.boss/size()|0))choices.push(p+(p<s.boss?size():-size()));p=choices.find(i=>i===s.boss||!s.cells[i].trap);if(p===undefined)throw Error('trapped guardian path');path.push(p)}if([s.start,...around(s.start),...path].some(i=>s.cells[i].trap))throw Error('unsafe start/guardian path')}}`);drain();console.log('PASS floor trap counts and 1000 generated maps per floor preserve start area and guardian path');
11:drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');
13:drain();run(`s.area='dungeon';s.cells[s.pos].chest={gold:100,opened:false};var chestPos=s.pos,chestGold=s.gold;move('forward');if(s.pos!==chestPos)throw Error('chest movement');abandonChest();if(currentChest()||s.gold!==chestGold)throw Error('abandon');`);drain();run(`if(s.cells[chestPos].chest)throw Error('chest remains');s.score={total:100};s.history=[{}];s.immediateChestVersion=0;ensureProfile();if('score' in s||'history' in s)throw Error('legacy cleanup');`);console.log('PASS mandatory chest decision, abandonment without reward, legacy score cleanup');
14:drain();run(`var escapeOriginalMembers=structuredClone(s.members),escapeOriginalHP=s.hp.slice(),escapeOriginalAilments=structuredClone(s.ailments);fresh(1);s.members=Array.from({length:6},(_,i)=>({...structuredClone(s.members[i%3]),level:1}));s.hp=Array(6).fill(20);s.ailments=Array.from({length:6},()=>({poison:false,paralysis:0}));s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'wolf',uid:0,hp:20}]};if(escapeChance()!==45)throw Error('escape six level 1 vs level 2');s.members.forEach(m=>m.level=10);if(escapeChance()!==90)throw Error('escape six level 10 vs level 2');s.members=s.members.slice(0,1);s.hp=s.hp.slice(0,1);s.ailments=s.ailments.slice(0,1);s.members[0].level=1;if(escapeChance()!==60)throw Error('escape one level 1 vs level 2');s.members[0].level=20;if(escapeChance()!==95)throw Error('escape upper clamp');s.hp[0]=0;if(escapeChance()!==10)throw Error('escape no eligible party');s.hp[0]=20;s.members[0].level=1;s.enemy.units[0].id='goblin';if(escapeChance()!==60)throw Error('escape one level 1 vs level 2 after eligibility restore');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members[0].level=20;s.enemy.units[0].id='wolf';if(escapeChance()!==95)throw Error('escape clamp at 95');Math.random=()=>0;var oldGold=s.gold;flee();if(s.enemy||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape');s.members=escapeOriginalMembers;s.hp=escapeOriginalHP;s.ailments=escapeOriginalAilments`);console.log('PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction');
15:drain();run(`
31:`);drain();run(`enterTown();if(s.light)throw Error('town light');`);console.log('PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp');
32:drain();run(`
42:drain();run(`
47:while(timers.length){timers.shift()();run(`if(s.logs[0]==='敵を倒した。金貨2枚を獲得。'){if(drawEnemies().includes('data-enemy-uid="0"')||!drawEnemies().includes('data-enemy-uid="1"'))throw Error('kill sync')}else if(s.logs[0].includes('ダメージ')&&!s.logs.some(t=>t==='敵を倒した。金貨2枚を獲得。')){if(!drawEnemies().includes('data-enemy-uid="0"'))throw Error('damage early removal')}`)}
48:run(`
51:let killsShown=0;while(timers.length){timers.shift()();if(run("s.logs[0]==='敵を倒した。'")){killsShown++;let icons=run("(drawEnemies().match(/data-enemy-uid=/g)||[]).length");if(icons!==Math.max(0,2-killsShown))throw Error('group kill sequence')}}
52:run(`
58:drain();run(`s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;s.area='dungeon';s.floor=1;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.cells.forEach(c=>{c.type='';c.trap=false;c.open=true;c.flag=false;delete c.chest});Math.random=()=>.99;`);
60:run(`s.pos=size()*3+3;s.dir=${dir};var origin=s.pos;var leftTile=target(-1);move('strafeLeft');if(s.pos!==leftTile||s.dir!==${dir})throw Error('left strafe');`);drain();
61:run(`move('strafeRight');if(s.pos!==origin||s.dir!==${dir})throw Error('right strafe');`);drain();
63:run(`s.pos=0;s.dir=0;move('strafeLeft');if(s.pos!==0||s.dir!==0)throw Error('wall strafe');`);drain();
64:run(`s.pos=size()*3+3;s.dir=0;var stay=s.pos;s.enemy={boss:false,units:[{id:'slime',uid:0,hp:10}]};move('strafeRight');if(s.pos!==stay)throw Error('combat strafe');s.enemy=null;s.pendingStairs=true;move('strafeRight');if(s.pos!==stay)throw Error('stairs strafe');s.pendingStairs=false;
68:drain();run(`
74:`);drain();run(`s.enemy=null;render();if($('.controls').hidden)throw Error('exploration controls');s.inventory[0]=['healingPotion','sword','helm','antidote'];s.equipped[0]=1;s.armor[0]={head:2,body:null,feet:null};s.hp[1]=1;var medicineMP=s.mp.join();Math.random=()=>.999;if(!useMedicine(0,0,1)||s.hp[1]!==9||s.inventory[0].length!==3||s.equipped[0]!==0||s.armor[0].head!==1||s.mp.join()!==medicineMP)throw Error('healing medicine / equipment indices');`);drain();run(`s.ailments[1].poison=true;if(!useMedicine(0,2,1)||s.ailments[1].poison||s.inventory[0].length!==2)throw Error('antidote');`);drain();run(`s.inventory[0].push('healingPotion');s.hp[1]=maxHP(1);if(useMedicine(0,2,1)||s.inventory[0].length!==3)throw Error('wasted medicine');`);drain();run(`s.hp[1]=1;s.enemy={boss:false,units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['item','guard','guard'];s.itemPlans[0]={slot:2,target:1,id:'healingPotion'};Math.random=()=>0;var medicineMP=s.mp.join();attack();if(s.inventory[0].length!==2||s.commands.some(c=>c!=='fight')||s.itemPlans.some(Boolean)||s.mp.join()!==medicineMP)throw Error('battle medicine');`);drain();run(`s.enemy=null;s.inventory[0]=['sword'];Math.random=()=>0;dropMedicine();if(s.inventory[0][1]!=='healingPotion')throw Error('medicine drop');var rolls=[0,.99];Math.random=()=>rolls.shift()??.99;dropMedicine();if(s.inventory[0][2]!=='antidote')throw Error('antidote drop');ensureProfile();if(s.inventory[0][2]!=='antidote')throw Error('medicine migration');`);drain();
76:drain();run(`
79:`);drain();run(`
81:`);drain();run(`attack()`);drain();run(`if(s.enemy){s.attackRows=[1,1,1];attack()}`);drain();run(`
82:if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=s.members.map(()=>0);s.commands=s.members.map(()=> 'fight');attack();`);drain();run(`if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
85:`);drain();run(`

apply patch
patch: completed
/workspace/dungeonsweeper/tests/game.cjs
diff --git a/dist/balance.js b/dist/balance.js
index 4bb2fa7902df21b4f3b9b782c2c2b399d5359b3e..bca0c9cc2f1530d6afaa37c55860e5f7b92f9f6b
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -8,6 +8,7 @@
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
 const MAX_FLOOR=10;
+const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
 function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
 function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
diff --git a/dist/game.js b/dist/game.js
index 0d9ae2a4f37754df15f7353c830c67463e7f9448..68ca3f18fb0651570297053c3a0a10a5ec6c8102
--- a/dist/game.js
+++ b/dist/game.js
@@ -48,7 +48,7 @@
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
-function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
+function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(w=>w.drop),w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(!w)return;if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
@@ -81,8 +81,8 @@
 function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
 function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
-function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
-function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
+function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [item]}let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return [entry.item]}return [pool.at(-1).item]}
+function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=chestItemPool(s.floor)[0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
 $('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
 $('#chestopen').onclick=()=>openChest(false);
diff --git a/tests/game.cjs b/tests/game.cjs
index f0ccf4b99cad65540baeab4c9b8a31ca86e66826..2a0beceb9b010d716a4e5bec58f0e99861dc03e8
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -224,8 +224,8 @@
 run(`s=structuredClone(sixInitial);ensureProfile();if(s.magicPlans.length!==6)throw Error('six-member magic plans');s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==6)throw Error('short plan padding');s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==3)throw Error('legacy three-member magic plans');`);
 console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
 
-run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
-console.log('PASS chest item pool price cap and 10,000 floor 1 draws');
+run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest minFloor');`);
+console.log('PASS chest item pool respects plate minFloor');
 
 run(`{
 let savedState=structuredClone(s),savedRandom=Math.random;

codex
回帰テストを追加します。既存の宝箱テストは「1品を返す」APIに合わせて調整し、1F候補制限、炎の剣・聖剣の深層抽選、宝箱の階別出現率を各1万回で確認する形にします。
apply patch
patch: completed
/workspace/dungeonsweeper/tests/game.cjs
diff --git a/dist/balance.js b/dist/balance.js
index 4bb2fa7902df21b4f3b9b782c2c2b399d5359b3e..bca0c9cc2f1530d6afaa37c55860e5f7b92f9f6b
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -8,6 +8,7 @@
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
 const MAX_FLOOR=10;
+const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
 function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
 function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
diff --git a/dist/game.js b/dist/game.js
index 0d9ae2a4f37754df15f7353c830c67463e7f9448..68ca3f18fb0651570297053c3a0a10a5ec6c8102
--- a/dist/game.js
+++ b/dist/game.js
@@ -48,7 +48,7 @@
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
-function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
+function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(w=>w.drop),w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(!w)return;if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
@@ -81,8 +81,8 @@
 function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
 function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
-function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
-function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
+function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [item]}let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return [entry.item]}return [pool.at(-1).item]}
+function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=chestItemPool(s.floor)[0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
 $('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
 $('#chestopen').onclick=()=>openChest(false);
diff --git a/tests/game.cjs b/tests/game.cjs
index f0ccf4b99cad65540baeab4c9b8a31ca86e66826..c32e3c3a70b9993f9f09daa0f16891dbca4b9c71
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -224,8 +224,15 @@
 run(`s=structuredClone(sixInitial);ensureProfile();if(s.magicPlans.length!==6)throw Error('six-member magic plans');s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==6)throw Error('short plan padding');s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==3)throw Error('legacy three-member magic plans');`);
 console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
 
-run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
-console.log('PASS chest item pool price cap and 10,000 floor 1 draws');
+run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest minFloor');`);
+console.log('PASS chest item pool respects plate minFloor');
+
+run(`{let oldRandom=Math.random;try{
+let floor1Ids=new Set();for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=chestItemPool(1)[0];if(item.price>150||(item.minFloor??1)>1)throw Error('floor 1 loot cap');floor1Ids.add(item.id)}
+let foundFlame=false,foundHoly=false;for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=chestItemPool(5)[0];if(item.id==='flamesword')foundFlame=true;Math.random=()=>((i*7919+173)%10000)/10000;item=chestItemPool(10)[0];if(item.id==='holysword')foundHoly=true}if(!foundFlame||!foundHoly)throw Error('deep floor weighted loot reachability');
+for(let floor of [1,5,10]){let chance=CHEST_LOOT.itemChance[floor-1],items=0;for(let i=0;i<10000;i++){s.floor=floor;s.inventory=s.members.map(()=>[]);s.gold=0;let rolls=[(i+.5)/10000,.99,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length))items++}if(Math.abs(items/10000-chance)>.02)throw Error('chest item chance floor '+floor+': '+items/10000)}
+}finally{Math.random=oldRandom;}}`);
+console.log('PASS weighted chest loot floor gates, deep items, and 10,000-draw item chance rates');
 
 run(`{
 let savedState=structuredClone(s),savedRandom=Math.random;

exec
/bin/bash -lc 'node tests/game.cjs' in /workspace/dungeonsweeper
 exited 1 in 1127ms:
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
evalmachine.<anonymous>:1
var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest minFloor');
                                                                                                                         ^

Error: floor chest minFloor
    at evalmachine.<anonymous>:1:128
    at Script.runInContext (node:vm:149:12)
    at Object.runInContext (node:vm:301:6)
    at run (/workspace/dungeonsweeper/tests/game.cjs:1:888)
    at Object.<anonymous> (/workspace/dungeonsweeper/tests/game.cjs:227:1)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)

Node.js v24.22.1

codex
テストで、候補プールの意味を明確にする必要が分かりました。`chestItemPool(floor)` は抽選結果1品ではなく、重み付き候補表を返すべきで、呼び出し側がその表から抽選します。指定の「候補」「重み」の形に揃えて修正します。
apply patch
patch: completed
/workspace/dungeonsweeper/dist/game.js
diff --git a/dist/balance.js b/dist/balance.js
index 4bb2fa7902df21b4f3b9b782c2c2b399d5359b3e..bca0c9cc2f1530d6afaa37c55860e5f7b92f9f6b
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -8,6 +8,7 @@
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
 const MAX_FLOOR=10;
+const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
 function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
 function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
diff --git a/dist/game.js b/dist/game.js
index 0d9ae2a4f37754df15f7353c830c67463e7f9448..1daa32f69e76917d99b6b36c79b577ca54386cef
--- a/dist/game.js
+++ b/dist/game.js
@@ -48,7 +48,8 @@
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
-function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
+function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
+function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop),w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(!w)return;if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
@@ -81,8 +82,8 @@
 function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
 function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
-function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
-function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
+function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
+function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
 $('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
 $('#chestopen').onclick=()=>openChest(false);
diff --git a/tests/game.cjs b/tests/game.cjs
index f0ccf4b99cad65540baeab4c9b8a31ca86e66826..c32e3c3a70b9993f9f09daa0f16891dbca4b9c71
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -224,8 +224,15 @@
 run(`s=structuredClone(sixInitial);ensureProfile();if(s.magicPlans.length!==6)throw Error('six-member magic plans');s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==6)throw Error('short plan padding');s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==3)throw Error('legacy three-member magic plans');`);
 console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
 
-run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
-console.log('PASS chest item pool price cap and 10,000 floor 1 draws');
+run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest minFloor');`);
+console.log('PASS chest item pool respects plate minFloor');
+
+run(`{let oldRandom=Math.random;try{
+let floor1Ids=new Set();for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=chestItemPool(1)[0];if(item.price>150||(item.minFloor??1)>1)throw Error('floor 1 loot cap');floor1Ids.add(item.id)}
+let foundFlame=false,foundHoly=false;for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=chestItemPool(5)[0];if(item.id==='flamesword')foundFlame=true;Math.random=()=>((i*7919+173)%10000)/10000;item=chestItemPool(10)[0];if(item.id==='holysword')foundHoly=true}if(!foundFlame||!foundHoly)throw Error('deep floor weighted loot reachability');
+for(let floor of [1,5,10]){let chance=CHEST_LOOT.itemChance[floor-1],items=0;for(let i=0;i<10000;i++){s.floor=floor;s.inventory=s.members.map(()=>[]);s.gold=0;let rolls=[(i+.5)/10000,.99,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length))items++}if(Math.abs(items/10000-chance)>.02)throw Error('chest item chance floor '+floor+': '+items/10000)}
+}finally{Math.random=oldRandom;}}`);
+console.log('PASS weighted chest loot floor gates, deep items, and 10,000-draw item chance rates');
 
 run(`{
 let savedState=structuredClone(s),savedRandom=Math.random;

apply patch
patch: completed
/workspace/dungeonsweeper/tests/game.cjs
diff --git a/dist/balance.js b/dist/balance.js
index 4bb2fa7902df21b4f3b9b782c2c2b399d5359b3e..bca0c9cc2f1530d6afaa37c55860e5f7b92f9f6b
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -8,6 +8,7 @@
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
 const MAX_FLOOR=10;
+const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
 function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
 function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
diff --git a/dist/game.js b/dist/game.js
index 0d9ae2a4f37754df15f7353c830c67463e7f9448..1daa32f69e76917d99b6b36c79b577ca54386cef
--- a/dist/game.js
+++ b/dist/game.js
@@ -48,7 +48,8 @@
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
-function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
+function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
+function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop),w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(!w)return;if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
@@ -81,8 +82,8 @@
 function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
 function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
-function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
-function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
+function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
+function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
 $('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
 $('#chestopen').onclick=()=>openChest(false);
diff --git a/tests/game.cjs b/tests/game.cjs
index f0ccf4b99cad65540baeab4c9b8a31ca86e66826..432687bf58328cc6494068f3e2bd971822f116ba
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -224,8 +224,15 @@
 run(`s=structuredClone(sixInitial);ensureProfile();if(s.magicPlans.length!==6)throw Error('six-member magic plans');s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==6)throw Error('short plan padding');s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==3)throw Error('legacy three-member magic plans');`);
 console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
 
-run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
-console.log('PASS chest item pool price cap and 10,000 floor 1 draws');
+run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).some(x=>x.item===plate)||!chestItemPool(3).some(x=>x.item===plate))throw Error('floor chest minFloor');`);
+console.log('PASS chest item pool respects plate minFloor');
+
+run(`{let oldRandom=Math.random;try{
+for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool.some(x=>x.item.price>150||(x.item.minFloor??1)>1))throw Error('floor 1 loot cap')}
+let foundFlame=false,foundHoly=false;for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=weightedLoot(chestItemPool(5));if(item.id==='flamesword')foundFlame=true;Math.random=()=>((i*7919+173)%10000)/10000;item=weightedLoot(chestItemPool(10));if(item.id==='holysword')foundHoly=true}if(!foundFlame||!foundHoly)throw Error('deep floor weighted loot reachability');
+for(let floor of [1,5,10]){let chance=CHEST_LOOT.itemChance[floor-1],items=0;for(let i=0;i<10000;i++){s.floor=floor;s.inventory=s.members.map(()=>[]);s.gold=0;let rolls=[(i+.5)/10000,.99,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length))items++}if(Math.abs(items/10000-chance)>.02)throw Error('chest item chance floor '+floor+': '+items/10000)}
+}finally{Math.random=oldRandom;}}`);
+console.log('PASS weighted chest loot floor gates, deep items, and 10,000-draw item chance rates');
 
 run(`{
 let savedState=structuredClone(s),savedRandom=Math.random;

exec
/bin/bash -lc "rg -n \"chestItemPool\\(\" tests/game.cjs dist/*.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
dist/game.js:52:function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop),w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(!w)return;if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
dist/game.js:85:function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
dist/game.js:86:function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
tests/game.cjs:227:run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).some(x=>x.item===plate)||!chestItemPool(3).some(x=>x.item===plate))throw Error('floor chest minFloor');`);
tests/game.cjs:231:for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool.some(x=>x.item.price>150||(x.item.minFloor??1)>1))throw Error('floor 1 loot cap')}
tests/game.cjs:232:let foundFlame=false,foundHoly=false;for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=weightedLoot(chestItemPool(5));if(item.id==='flamesword')foundFlame=true;Math.random=()=>((i*7919+173)%10000)/10000;item=weightedLoot(chestItemPool(10));if(item.id==='holysword')foundHoly=true}if(!foundFlame||!foundHoly)throw Error('deep floor weighted loot reachability');
tests/game.cjs:251:  if(!chestItemPool(4).some(w=>w.id==='knightsword')||chestItemPool(1).some(w=>w.id==='knightsword'))throw Error('equipment minFloor pool');

apply patch
patch: completed
/workspace/dungeonsweeper/tests/game.cjs
diff --git a/dist/balance.js b/dist/balance.js
index 4bb2fa7902df21b4f3b9b782c2c2b399d5359b3e..bca0c9cc2f1530d6afaa37c55860e5f7b92f9f6b
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -8,6 +8,7 @@
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
 const MAX_FLOOR=10;
+const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
 function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
 function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
diff --git a/dist/game.js b/dist/game.js
index 0d9ae2a4f37754df15f7353c830c67463e7f9448..1daa32f69e76917d99b6b36c79b577ca54386cef
--- a/dist/game.js
+++ b/dist/game.js
@@ -48,7 +48,8 @@
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
-function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
+function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
+function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop),w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(!w)return;if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
@@ -81,8 +82,8 @@
 function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
 function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
-function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
-function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
+function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
+function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
 $('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
 $('#chestopen').onclick=()=>openChest(false);
diff --git a/tests/game.cjs b/tests/game.cjs
index f0ccf4b99cad65540baeab4c9b8a31ca86e66826..9d77eb6187bc9287bd82e1f071df0157b67c12d5
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -224,9 +224,16 @@
 run(`s=structuredClone(sixInitial);ensureProfile();if(s.magicPlans.length!==6)throw Error('six-member magic plans');s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==6)throw Error('short plan padding');s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==3)throw Error('legacy three-member magic plans');`);
 console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
 
-run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
-console.log('PASS chest item pool price cap and 10,000 floor 1 draws');
+run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).some(x=>x.item===plate)||!chestItemPool(3).some(x=>x.item===plate))throw Error('floor chest minFloor');`);
+console.log('PASS chest item pool respects plate minFloor');
 
+run(`{let oldRandom=Math.random;try{
+for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool.some(x=>x.item.price>150||(x.item.minFloor??1)>1))throw Error('floor 1 loot cap')}
+let foundFlame=false,foundHoly=false;for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=weightedLoot(chestItemPool(5));if(item.id==='flamesword')foundFlame=true;Math.random=()=>((i*7919+173)%10000)/10000;item=weightedLoot(chestItemPool(10));if(item.id==='holysword')foundHoly=true}if(!foundFlame||!foundHoly)throw Error('deep floor weighted loot reachability');
+for(let floor of [1,5,10]){let chance=CHEST_LOOT.itemChance[floor-1],items=0;for(let i=0;i<10000;i++){s.floor=floor;s.inventory=s.members.map(()=>[]);s.gold=0;let rolls=[(i+.5)/10000,.99,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length))items++}if(Math.abs(items/10000-chance)>.02)throw Error('chest item chance floor '+floor+': '+items/10000)}
+}finally{Math.random=oldRandom;}}`);
+console.log('PASS weighted chest loot floor gates, deep items, and 10,000-draw item chance rates');
+
 run(`{
 let savedState=structuredClone(s),savedRandom=Math.random;
 try{
@@ -241,7 +248,7 @@
   for(let n=0;n<100;n++){let rolls=[0,n/100];Math.random=()=>rolls.shift()??.99;dropMedicine();available.add(s.inventory[0].at(-1));s.inventory[0].pop()}
   Math.random=old;
   if(available.has('greaterPotion')||available.has('elixir')||available.has('paralysisCure'))throw Error('medicine below minFloor');
-  if(!chestItemPool(4).some(w=>w.id==='knightsword')||chestItemPool(1).some(w=>w.id==='knightsword'))throw Error('equipment minFloor pool');
+  if(!chestItemPool(4).some(x=>x.item.id==='knightsword')||chestItemPool(1).some(x=>x.item.id==='knightsword'))throw Error('equipment minFloor pool');
   s.members[0].job=0;s.members[0].level=1;s.members[0].str=10;s.inventory[0]=['flamesword'];s.equipped[0]=0;
   s.enemy={units:[{id:'slime',uid:0,row:0,hp:100,rewarded:false}]};Math.random=()=>.525;
   let result=physicalAttack(0,s.enemy.units[0]);if(result.hitsCount!==1)throw Error('weapon hitBonus not applied');

exec
/bin/bash -lc 'node tests/game.cjs' in /workspace/dungeonsweeper
 exited 1 in 2116ms:
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
evalmachine.<anonymous>:86
function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
                                                                                                                                                                                                                       ^

TypeError: Cannot read properties of undefined (reading 'classes')
    at evalmachine.<anonymous>:86:216
    at Array.some (<anonymous>)
    at rewardChest (evalmachine.<anonymous>:86:202)
    at evalmachine.<anonymous>:1:474
    at Script.runInContext (node:vm:149:12)
    at Object.runInContext (node:vm:301:6)
    at run (/workspace/dungeonsweeper/tests/game.cjs:1:888)
    at Object.<anonymous> (/workspace/dungeonsweeper/tests/game.cjs:259:1)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)

Node.js v24.22.1

codex
抽選回帰は通りましたが、後続の既存テストが `chestItemPool` を一時的に差し替え、旧形式の品配列を返すため失敗しました。テスト差し替えを重み付き候補形式に更新して再実行します。
apply patch
patch: completed
/workspace/dungeonsweeper/tests/game.cjs
diff --git a/dist/balance.js b/dist/balance.js
index 4bb2fa7902df21b4f3b9b782c2c2b399d5359b3e..bca0c9cc2f1530d6afaa37c55860e5f7b92f9f6b
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -8,6 +8,7 @@
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
 const MAX_FLOOR=10;
+const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
 function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
 function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
diff --git a/dist/game.js b/dist/game.js
index 0d9ae2a4f37754df15f7353c830c67463e7f9448..1daa32f69e76917d99b6b36c79b577ca54386cef
--- a/dist/game.js
+++ b/dist/game.js
@@ -48,7 +48,8 @@
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
-function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
+function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
+function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop),w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(!w)return;if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
@@ -81,8 +82,8 @@
 function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
 function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
-function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
-function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
+function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
+function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
 $('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
 $('#chestopen').onclick=()=>openChest(false);
diff --git a/tests/game.cjs b/tests/game.cjs
index f0ccf4b99cad65540baeab4c9b8a31ca86e66826..3ce03cecdce515e69a4b70b9b29547d03cfab25b
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -224,9 +224,16 @@
 run(`s=structuredClone(sixInitial);ensureProfile();if(s.magicPlans.length!==6)throw Error('six-member magic plans');s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==6)throw Error('short plan padding');s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==3)throw Error('legacy three-member magic plans');`);
 console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
 
-run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
-console.log('PASS chest item pool price cap and 10,000 floor 1 draws');
+run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).some(x=>x.item===plate)||!chestItemPool(3).some(x=>x.item===plate))throw Error('floor chest minFloor');`);
+console.log('PASS chest item pool respects plate minFloor');
 
+run(`{let oldRandom=Math.random;try{
+for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool.some(x=>x.item.price>150||(x.item.minFloor??1)>1))throw Error('floor 1 loot cap')}
+let foundFlame=false,foundHoly=false;for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=weightedLoot(chestItemPool(5));if(item.id==='flamesword')foundFlame=true;Math.random=()=>((i*7919+173)%10000)/10000;item=weightedLoot(chestItemPool(10));if(item.id==='holysword')foundHoly=true}if(!foundFlame||!foundHoly)throw Error('deep floor weighted loot reachability');
+for(let floor of [1,5,10]){let chance=CHEST_LOOT.itemChance[floor-1],items=0;for(let i=0;i<10000;i++){s.floor=floor;s.inventory=s.members.map(()=>[]);s.gold=0;let rolls=[(i+.5)/10000,.99,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length))items++}if(Math.abs(items/10000-chance)>.02)throw Error('chest item chance floor '+floor+': '+items/10000)}
+}finally{Math.random=oldRandom;}}`);
+console.log('PASS weighted chest loot floor gates, deep items, and 10,000-draw item chance rates');
+
 run(`{
 let savedState=structuredClone(s),savedRandom=Math.random;
 try{
@@ -241,7 +248,7 @@
   for(let n=0;n<100;n++){let rolls=[0,n/100];Math.random=()=>rolls.shift()??.99;dropMedicine();available.add(s.inventory[0].at(-1));s.inventory[0].pop()}
   Math.random=old;
   if(available.has('greaterPotion')||available.has('elixir')||available.has('paralysisCure'))throw Error('medicine below minFloor');
-  if(!chestItemPool(4).some(w=>w.id==='knightsword')||chestItemPool(1).some(w=>w.id==='knightsword'))throw Error('equipment minFloor pool');
+  if(!chestItemPool(4).some(x=>x.item.id==='knightsword')||chestItemPool(1).some(x=>x.item.id==='knightsword'))throw Error('equipment minFloor pool');
   s.members[0].job=0;s.members[0].level=1;s.members[0].str=10;s.inventory[0]=['flamesword'];s.equipped[0]=0;
   s.enemy={units:[{id:'slime',uid:0,row:0,hp:100,rewarded:false}]};Math.random=()=>.525;
   let result=physicalAttack(0,s.enemy.units[0]);if(result.hitsCount!==1)throw Error('weapon hitBonus not applied');
@@ -249,7 +256,7 @@
 }`);
 console.log('PASS expanded equipment ids, shop:false gate, floor loot gates, and hitBonus');
 
-run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[dagger];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
+run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[{item:dagger,weight:1}];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
 console.log('PASS chest item unusable, full inventory and normal receipt logs');
 
 // Isolate reward cases from the shared combat fixtures and their random overrides.

exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
 succeeded in 2224ms:
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
88 monster definitions validated

codex
実装と指定の共通テストがすべて通りました。最後に差分を確認し、BALANCE.md には将来課題として「呪い・未鑑定は未実装」を必要最小限で追記します。
apply patch
patch: completed
/workspace/dungeonsweeper/BALANCE.md
diff --git a/BALANCE.md b/BALANCE.md
index 89fedbbfd98f2c6b70b322b1a3fa90c43a67daa8..c73ef451b6299ace0ac6f1378ce004a919e0958a
--- a/BALANCE.md
+++ b/BALANCE.md
@@ -32,6 +32,8 @@
 
 ## 薬
 
+宝箱・敵ドロップの階層別抽選は `CHEST_LOOT` と `chestItemPool()` を参照。呪い・未鑑定アイテムは現仕様に存在せず、将来課題。
+
 |薬|出現開始階|効果|
 |---|---:|---|
 |傷薬|1F|1d8回復|
diff --git a/dist/balance.js b/dist/balance.js
index 4bb2fa7902df21b4f3b9b782c2c2b399d5359b3e..bca0c9cc2f1530d6afaa37c55860e5f7b92f9f6b
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -8,6 +8,7 @@
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
 const MAX_FLOOR=10;
+const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
 function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
 function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
diff --git a/dist/game.js b/dist/game.js
index 0d9ae2a4f37754df15f7353c830c67463e7f9448..1daa32f69e76917d99b6b36c79b577ca54386cef
--- a/dist/game.js
+++ b/dist/game.js
@@ -48,7 +48,8 @@
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
-function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
+function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
+function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop),w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(!w)return;if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
@@ -81,8 +82,8 @@
 function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
 function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
-function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
-function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
+function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
+function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
 $('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
 $('#chestopen').onclick=()=>openChest(false);
diff --git a/tests/game.cjs b/tests/game.cjs
index f0ccf4b99cad65540baeab4c9b8a31ca86e66826..3ce03cecdce515e69a4b70b9b29547d03cfab25b
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -224,9 +224,16 @@
 run(`s=structuredClone(sixInitial);ensureProfile();if(s.magicPlans.length!==6)throw Error('six-member magic plans');s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==6)throw Error('short plan padding');s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==3)throw Error('legacy three-member magic plans');`);
 console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
 
-run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
-console.log('PASS chest item pool price cap and 10,000 floor 1 draws');
+run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).some(x=>x.item===plate)||!chestItemPool(3).some(x=>x.item===plate))throw Error('floor chest minFloor');`);
+console.log('PASS chest item pool respects plate minFloor');
 
+run(`{let oldRandom=Math.random;try{
+for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool.some(x=>x.item.price>150||(x.item.minFloor??1)>1))throw Error('floor 1 loot cap')}
+let foundFlame=false,foundHoly=false;for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=weightedLoot(chestItemPool(5));if(item.id==='flamesword')foundFlame=true;Math.random=()=>((i*7919+173)%10000)/10000;item=weightedLoot(chestItemPool(10));if(item.id==='holysword')foundHoly=true}if(!foundFlame||!foundHoly)throw Error('deep floor weighted loot reachability');
+for(let floor of [1,5,10]){let chance=CHEST_LOOT.itemChance[floor-1],items=0;for(let i=0;i<10000;i++){s.floor=floor;s.inventory=s.members.map(()=>[]);s.gold=0;let rolls=[(i+.5)/10000,.99,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length))items++}if(Math.abs(items/10000-chance)>.02)throw Error('chest item chance floor '+floor+': '+items/10000)}
+}finally{Math.random=oldRandom;}}`);
+console.log('PASS weighted chest loot floor gates, deep items, and 10,000-draw item chance rates');
+
 run(`{
 let savedState=structuredClone(s),savedRandom=Math.random;
 try{
@@ -241,7 +248,7 @@
   for(let n=0;n<100;n++){let rolls=[0,n/100];Math.random=()=>rolls.shift()??.99;dropMedicine();available.add(s.inventory[0].at(-1));s.inventory[0].pop()}
   Math.random=old;
   if(available.has('greaterPotion')||available.has('elixir')||available.has('paralysisCure'))throw Error('medicine below minFloor');
-  if(!chestItemPool(4).some(w=>w.id==='knightsword')||chestItemPool(1).some(w=>w.id==='knightsword'))throw Error('equipment minFloor pool');
+  if(!chestItemPool(4).some(x=>x.item.id==='knightsword')||chestItemPool(1).some(x=>x.item.id==='knightsword'))throw Error('equipment minFloor pool');
   s.members[0].job=0;s.members[0].level=1;s.members[0].str=10;s.inventory[0]=['flamesword'];s.equipped[0]=0;
   s.enemy={units:[{id:'slime',uid:0,row:0,hp:100,rewarded:false}]};Math.random=()=>.525;
   let result=physicalAttack(0,s.enemy.units[0]);if(result.hitsCount!==1)throw Error('weapon hitBonus not applied');
@@ -249,7 +256,7 @@
 }`);
 console.log('PASS expanded equipment ids, shop:false gate, floor loot gates, and hitBonus');
 
-run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[dagger];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
+run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[{item:dagger,weight:1}];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
 console.log('PASS chest item unusable, full inventory and normal receipt logs');
 
 // Isolate reward cases from the shared combat fixtures and their random overrides.

exec
/bin/bash -lc 'git diff --stat && git diff -- dist/balance.js dist/game.js BALANCE.md tests/game.cjs | tail -130' in /workspace/dungeonsweeper
 succeeded in 0ms:
 BALANCE.md      |  2 ++
 dist/balance.js |  1 +
 dist/game.js    |  7 ++++---
 tests/game.cjs  | 15 +++++++++++----
 4 files changed, 18 insertions(+), 7 deletions(-)
diff --git a/BALANCE.md b/BALANCE.md
index 89fedbb..c73ef45 100644
--- a/BALANCE.md
+++ b/BALANCE.md
@@ -32,6 +32,8 @@
 
 ## 薬
 
+宝箱・敵ドロップの階層別抽選は `CHEST_LOOT` と `chestItemPool()` を参照。呪い・未鑑定アイテムは現仕様に存在せず、将来課題。
+
 |薬|出現開始階|効果|
 |---|---:|---|
 |傷薬|1F|1d8回復|
diff --git a/dist/balance.js b/dist/balance.js
index 4bb2fa7..bca0c9c 100644
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -8,6 +8,7 @@ const CLASSES = [
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
 const MAX_FLOOR=10;
+const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
 function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
 function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
diff --git a/dist/game.js b/dist/game.js
index 0d9ae2a..1daa32f 100644
--- a/dist/game.js
+++ b/dist/game.js
@@ -48,7 +48,8 @@ function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
-function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
+function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
+function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop),w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(!w)return;if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
@@ -81,8 +82,8 @@ function afflict(i,type){if(type==='poison')s.ailments[i].poison=true;else s.ail
 function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
 function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
-function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
-function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
+function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
+function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
 $('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
 $('#chestopen').onclick=()=>openChest(false);
diff --git a/tests/game.cjs b/tests/game.cjs
index f0ccf4b..3ce03ce 100644
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -224,8 +224,15 @@ console.log('PASS exploration poison death once with HP snapshot, silent nonfata
 run(`s=structuredClone(sixInitial);ensureProfile();if(s.magicPlans.length!==6)throw Error('six-member magic plans');s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==6)throw Error('short plan padding');s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==3)throw Error('legacy three-member magic plans');`);
 console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
 
-run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
-console.log('PASS chest item pool price cap and 10,000 floor 1 draws');
+run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).some(x=>x.item===plate)||!chestItemPool(3).some(x=>x.item===plate))throw Error('floor chest minFloor');`);
+console.log('PASS chest item pool respects plate minFloor');
+
+run(`{let oldRandom=Math.random;try{
+for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool.some(x=>x.item.price>150||(x.item.minFloor??1)>1))throw Error('floor 1 loot cap')}
+let foundFlame=false,foundHoly=false;for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=weightedLoot(chestItemPool(5));if(item.id==='flamesword')foundFlame=true;Math.random=()=>((i*7919+173)%10000)/10000;item=weightedLoot(chestItemPool(10));if(item.id==='holysword')foundHoly=true}if(!foundFlame||!foundHoly)throw Error('deep floor weighted loot reachability');
+for(let floor of [1,5,10]){let chance=CHEST_LOOT.itemChance[floor-1],items=0;for(let i=0;i<10000;i++){s.floor=floor;s.inventory=s.members.map(()=>[]);s.gold=0;let rolls=[(i+.5)/10000,.99,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length))items++}if(Math.abs(items/10000-chance)>.02)throw Error('chest item chance floor '+floor+': '+items/10000)}
+}finally{Math.random=oldRandom;}}`);
+console.log('PASS weighted chest loot floor gates, deep items, and 10,000-draw item chance rates');
 
 run(`{
 let savedState=structuredClone(s),savedRandom=Math.random;
@@ -241,7 +248,7 @@ try{
   for(let n=0;n<100;n++){let rolls=[0,n/100];Math.random=()=>rolls.shift()??.99;dropMedicine();available.add(s.inventory[0].at(-1));s.inventory[0].pop()}
   Math.random=old;
   if(available.has('greaterPotion')||available.has('elixir')||available.has('paralysisCure'))throw Error('medicine below minFloor');
-  if(!chestItemPool(4).some(w=>w.id==='knightsword')||chestItemPool(1).some(w=>w.id==='knightsword'))throw Error('equipment minFloor pool');
+  if(!chestItemPool(4).some(x=>x.item.id==='knightsword')||chestItemPool(1).some(x=>x.item.id==='knightsword'))throw Error('equipment minFloor pool');
   s.members[0].job=0;s.members[0].level=1;s.members[0].str=10;s.inventory[0]=['flamesword'];s.equipped[0]=0;
   s.enemy={units:[{id:'slime',uid:0,row:0,hp:100,rewarded:false}]};Math.random=()=>.525;
   let result=physicalAttack(0,s.enemy.units[0]);if(result.hitsCount!==1)throw Error('weapon hitBonus not applied');
@@ -249,7 +256,7 @@ try{
 }`);
 console.log('PASS expanded equipment ids, shop:false gate, floor loot gates, and hitBonus');
 
-run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[dagger];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
+run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[{item:dagger,weight:1}];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
 console.log('PASS chest item unusable, full inventory and normal receipt logs');
 
 // Isolate reward cases from the shared combat fixtures and their random overrides.

apply patch
patch: completed
/workspace/dungeonsweeper/dist/game.js
diff --git a/BALANCE.md b/BALANCE.md
index 89fedbbfd98f2c6b70b322b1a3fa90c43a67daa8..c73ef451b6299ace0ac6f1378ce004a919e0958a
--- a/BALANCE.md
+++ b/BALANCE.md
@@ -32,6 +32,8 @@
 
 ## 薬
 
+宝箱・敵ドロップの階層別抽選は `CHEST_LOOT` と `chestItemPool()` を参照。呪い・未鑑定アイテムは現仕様に存在せず、将来課題。
+
 |薬|出現開始階|効果|
 |---|---:|---|
 |傷薬|1F|1d8回復|
diff --git a/dist/balance.js b/dist/balance.js
index 4bb2fa7902df21b4f3b9b782c2c2b399d5359b3e..bca0c9cc2f1530d6afaa37c55860e5f7b92f9f6b
--- a/dist/balance.js
+++ b/dist/balance.js
@@ -8,6 +8,7 @@
 const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
 const LEVEL_CAP=30;
 const MAX_FLOOR=10;
+const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
 function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
 function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
 // 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
diff --git a/dist/game.js b/dist/game.js
index 0d9ae2a4f37754df15f7353c830c67463e7f9448..a0ae0a169e815743ab35de3863d68a8f04bbf53e
--- a/dist/game.js
+++ b/dist/game.js
@@ -48,7 +48,8 @@
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
-function dropWeapon(){if(Math.random()>=.05)return;let pool=WEAPONS.filter(w=>w.drop&&(w.minFloor||1)<=(s.floor||1));if(!pool.length)return;let w=pool[Math.random()*pool.length|0],i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
+function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
+function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop);if(!pool.length)return;let w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
@@ -81,8 +82,8 @@
 function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
 function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
-function chestItemPool(floor){let pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&(w.minFloor||1)<=floor&&w.price<=floor*150);return pool.length?pool:[WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b)]}
-function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<.25){let pool=chestItemPool(s.floor),w=pool[Math.random()*pool.length|0],eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
+function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
+function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
 $('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
 $('#chestopen').onclick=()=>openChest(false);
diff --git a/tests/game.cjs b/tests/game.cjs
index f0ccf4b99cad65540baeab4c9b8a31ca86e66826..3ce03cecdce515e69a4b70b9b29547d03cfab25b
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -224,9 +224,16 @@
 run(`s=structuredClone(sixInitial);ensureProfile();if(s.magicPlans.length!==6)throw Error('six-member magic plans');s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==6)throw Error('short plan padding');s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.magicPlans=[null,null,null];ensureMagic();if(s.magicPlans.length!==3)throw Error('legacy three-member magic plans');`);
 console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
 
-run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(3).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
-console.log('PASS chest item pool price cap and 10,000 floor 1 draws');
+run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(2).some(x=>x.item===plate)||!chestItemPool(3).some(x=>x.item===plate))throw Error('floor chest minFloor');`);
+console.log('PASS chest item pool respects plate minFloor');
 
+run(`{let oldRandom=Math.random;try{
+for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool.some(x=>x.item.price>150||(x.item.minFloor??1)>1))throw Error('floor 1 loot cap')}
+let foundFlame=false,foundHoly=false;for(let i=0;i<10000;i++){Math.random=()=>((i*7919)%10000)/10000;let item=weightedLoot(chestItemPool(5));if(item.id==='flamesword')foundFlame=true;Math.random=()=>((i*7919+173)%10000)/10000;item=weightedLoot(chestItemPool(10));if(item.id==='holysword')foundHoly=true}if(!foundFlame||!foundHoly)throw Error('deep floor weighted loot reachability');
+for(let floor of [1,5,10]){let chance=CHEST_LOOT.itemChance[floor-1],items=0;for(let i=0;i<10000;i++){s.floor=floor;s.inventory=s.members.map(()=>[]);s.gold=0;let rolls=[(i+.5)/10000,.99,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length))items++}if(Math.abs(items/10000-chance)>.02)throw Error('chest item chance floor '+floor+': '+items/10000)}
+}finally{Math.random=oldRandom;}}`);
+console.log('PASS weighted chest loot floor gates, deep items, and 10,000-draw item chance rates');
+
 run(`{
 let savedState=structuredClone(s),savedRandom=Math.random;
 try{
@@ -241,7 +248,7 @@
   for(let n=0;n<100;n++){let rolls=[0,n/100];Math.random=()=>rolls.shift()??.99;dropMedicine();available.add(s.inventory[0].at(-1));s.inventory[0].pop()}
   Math.random=old;
   if(available.has('greaterPotion')||available.has('elixir')||available.has('paralysisCure'))throw Error('medicine below minFloor');
-  if(!chestItemPool(4).some(w=>w.id==='knightsword')||chestItemPool(1).some(w=>w.id==='knightsword'))throw Error('equipment minFloor pool');
+  if(!chestItemPool(4).some(x=>x.item.id==='knightsword')||chestItemPool(1).some(x=>x.item.id==='knightsword'))throw Error('equipment minFloor pool');
   s.members[0].job=0;s.members[0].level=1;s.members[0].str=10;s.inventory[0]=['flamesword'];s.equipped[0]=0;
   s.enemy={units:[{id:'slime',uid:0,row:0,hp:100,rewarded:false}]};Math.random=()=>.525;
   let result=physicalAttack(0,s.enemy.units[0]);if(result.hitsCount!==1)throw Error('weapon hitBonus not applied');
@@ -249,7 +256,7 @@
 }`);
 console.log('PASS expanded equipment ids, shop:false gate, floor loot gates, and hitBonus');
 
-run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[dagger];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
+run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[{item:dagger,weight:1}];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
 console.log('PASS chest item unusable, full inventory and normal receipt logs');
 
 // Isolate reward cases from the shared combat fixtures and their random overrides.

exec
/bin/bash -lc 'git status --short && node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
 succeeded in 2072ms:
 M BALANCE.md
 M dist/balance.js
 M dist/game.js
 M tests/game.cjs
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
88 monster definitions validated

codex
**019完了。**

`CHEST_LOOT` に階別の品物出現率と価格上限を追加し、宝箱と敵ドロップを階層・価格・重みに応じた抽選に変更しました。板金鎧の出現階、深層アイテム、宝箱の品物出現率を確認する回帰テストも追加しています。

変更ファイル：[dist/balance.js](/workspace/dungeonsweeper/dist/balance.js)、[dist/game.js](/workspace/dungeonsweeper/dist/game.js)、[tests/game.cjs](/workspace/dungeonsweeper/tests/game.cjs)、[BALANCE.md](/workspace/dungeonsweeper/BALANCE.md)

指定の共通テストはすべてPASSしました。ブラウザでは未確認です。
tokens used
62,262
**019完了。**

`CHEST_LOOT` に階別の品物出現率と価格上限を追加し、宝箱と敵ドロップを階層・価格・重みに応じた抽選に変更しました。板金鎧の出現階、深層アイテム、宝箱の品物出現率を確認する回帰テストも追加しています。

変更ファイル：[dist/balance.js](/workspace/dungeonsweeper/dist/balance.js)、[dist/game.js](/workspace/dungeonsweeper/dist/game.js)、[tests/game.cjs](/workspace/dungeonsweeper/tests/game.cjs)、[BALANCE.md](/workspace/dungeonsweeper/BALANCE.md)

指定の共通テストはすべてPASSしました。ブラウザでは未確認です。
