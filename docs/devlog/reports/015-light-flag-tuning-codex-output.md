OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-luna
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: low
reasoning summaries: none
session id: 01a19851-83b1-7c53-a77d-24e55c427049
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

# 015-light-flag-tuning
ティア：LIGHT　依存：なし（014の後に実行）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
旗の効果がほぼ攻略に影響していない（実測：正しい旗が平均3〜4本＝発動率約5%、戦闘勝率差 +0.3〜0.7pt＝誤差）。
発動率を「二乗式」から「1本あたり4%・上限40%」の線形式に変え、旗を立てる価値を体感できる強さにする。
誤った旗の呪い（威力×0.65／被ダメ×1.5／MP×1.5・逃走不可）はそのまま残し、リスクとリターンを両立させる。

## 変更内容
- dist/flags.js `flagChance(f,kind)`：
  - 現在：`Math.min(.50,.005*n**2)`
  - 変更後：`const FLAG_CHANCE_PER=.04,FLAG_CHANCE_CAP=.40;` を追加し、`Math.min(FLAG_CHANCE_CAP,FLAG_CHANCE_PER*n)` にする（n＝その種類の正しい旗の数）。
  - 参考パッチ：/workspace/dsw-queue/assets/proto/apply_015.py
- 発動時の効果（怪力×1.5／堅牢×0.5／呪禁MP半減）と呪いの効果は変更しない。
- tests/game.cjs の旗の確率テスト2か所（'0.5-50 percent' と 'flag curve'）を新しい式の値に更新する。
  - 期待値：0本→0、1本→.04、5本→.2、10本→.4、100本→.4
  - 参考：/workspace/dsw-queue/assets/proto/tests-game-diff-015-017.txt
- docs/SPECIFICATION.md と BALANCE.md の旗の確率の記述を更新する。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：上の期待値。誤った旗があると bad=true（逃走不可）であることも維持されている。
- 手動：1Fで正しい怪力旗を3本立てて戦闘し、何度か「怪力」の発動ログが出ること（12%）。

codex
この015の1ファイルだけを対象に、まず指定の引き継ぎ資料と関連する実装・テスト箇所を確認します。変更後に共通テストを実行します。
exec
/bin/bash -lc "pwd && rg --files -g 'AGENTS.md' -g 'README*' -g 'docs/HANDOFF.md' -g 'docs/SPECIFICATION.md' -g 'BALANCE.md' -g 'dist/flags.js' -g 'tests/game.cjs' -g 'tests/training.cjs' -g 'scripts/compile-monsters.py'" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
dist/flags.js
AGENTS.md
BALANCE.md
scripts/compile-monsters.py
docs/HANDOFF.md
docs/SPECIFICATION.md
tests/training.cjs
tests/game.cjs
README.md
data/README.md

exec
/bin/bash -lc "cat AGENTS.md README.md docs/HANDOFF.md docs/SPECIFICATION.md && rg -n \"flagChance|0\\.5-50 percent|flag curve|旗|二乗|50%|0\\.005|BALANCE\" dist/flags.js tests/game.cjs docs/SPECIFICATION.md BALANCE.md" in /workspace/dungeonsweeper
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
docs/SPECIFICATION.md:8:1Fは8×8、2Fは10×10、3F以降12×12。上下左右の隣接移動、左右旋回、後退、左右横移動。盤面クリックは旗の操作で、任意マスへ移動する操作ではない。
docs/SPECIFICATION.md:54:1命中ダメージ＝max(1,武器ダイス＋STR補正)。合計後に旗効果。列indexは残っている列の並びで0から数え、前列消滅時は詰める。1列目の補正は0、2列目は命中率−15ポイント、3列目は−30ポイント（閾値の上限・下限に達しない場合）。原作への一致は未保証。
docs/SPECIFICATION.md:60:ボス・誤旗デバフ時は逃走不可。それ以外の逃走率は本作の暫定式：50＋5×（生存かつ非毒・非麻痺の味方平均Lv−生存かつ非睡眠の敵平均Lv）＋味方人数補正（1人15、2人10、3人5、その他0）を10〜95%に制限する。有効な味方が0人なら10%。失敗は敵ターン（味方先制権があればそれを消費）。
docs/SPECIFICATION.md:66:僧侶の特殊行動。MP不要、敵全列の生存する不死それぞれに判定。成功率clamp(50%＋(僧侶Lv−敵Lv)×5ポイント,5%,95%)。成功すると消滅、XP・金貨・ドロップなし。全員解呪のみなら宝箱なし。原作の正確な計算式を確認できず暫定導入したもの。
docs/SPECIFICATION.md:84:## 8. 旗
docs/SPECIFICATION.md:86:怪力・堅牢・呪禁をループ切替し、設置時の種類をマスに保存。切替しても既設旗は変わらない。地図と視界で色を反映。
docs/SPECIFICATION.md:87:正しい旗n本の種類別発動率＝min(50%,0.5%×n²)。1本0.5%、10本50%。戦闘開始時に旗配置のスナップショットを取る。
docs/SPECIFICATION.md:89:誤旗が一つでもあれば全種類の正旗抽選を停止、逃走不可。誤旗の種類に応じ、怪力は攻撃×0.65切捨て、堅牢は被害×1.5四捨五入、呪禁は戦闘MP×1.5切上げ。
docs/SPECIFICATION.md:90:正旗は発動時だけ「○○の旗がはためいた！」。誤旗のみ戦闘開始時「誤った旗がパーティーを惑わせた！」。ログ色：怪力橙・堅牢緑・呪禁紫。
BALANCE.md:31:通常編成は同階の非守護者から1〜3列をランダムに選ぶ。守護者戦は守護者を1列目に置き、同階の非守護者から1列を随伴させる。さらに50%で別の随伴列を追加し、最大3列となる。各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
BALANCE.md:47:旗はマスごとにpower/guard/magicを保存、旧booleanは選択中の種類へ移行。正旗は種類別に `min(50%, 0.5% × 本数²)`。0本は発動なし、1本0.5%、2本2%、5本12.5%、10本以上50%。誤旗があると全ボーナス停止、誤旗の各種類のデバフを適用し逃走不可。遭遇時は誤旗のみ「誤った旗がパーティーを惑わせた！」。正旗は発動時に「怪力／堅牢／呪禁の旗がはためいた！」と表示し、旗名をオレンジ／緑／紫に着色。呪禁は消費MP半減・切上げ、探索中は現在階の旗で都度抽選（探索中の誤旗ではボーナス停止のみ）。地図と視界に旗色を表示。
BALANCE.md:49:床罠は dist/traps.js。単体3d6+4（25%）、全体2d6+3（25%）、全員毒（20%）、単体麻痺（15%）、同一階転移（15%）。転移は通常の安全な部屋のみ、旗・罠・宝箱・階段・守護者を除外し、連鎖移動や遭遇は起こさない。罠は一度で消え周囲の数値も減る。
BALANCE.md:56:デュマピックは魔法使いLv1で確定習得。消費MPは2→4→8→16…、使用回数は階移動・再読み込みで維持し町への帰還でリセット。未探索の正面を85%で正しく、15%で逆に判定。調査は探索・罠解除・旗変更をしない。探索済み・外壁では失敗し、MPと使用回数は消費する。呪禁の旗は通常通り半減判定する。
dist/flags.js:2:const FLAG_NAMES={power:'怪力の旗',guard:'堅牢の旗',magic:'呪禁の旗'};
dist/flags.js:7:function flagChance(f,kind){return Math.min(.50,.005*(f?.counts?.[kind]||0)**2)}
dist/flags.js:8:function flagProc(kind){let f=currentFlagEffect();return !f.bad&&flagChance(f,kind)>0&&Math.random()<flagChance(f,kind)}
dist/flags.js:11:function flagConsumeMP(i,cost){if(flagProc('magic')){log('呪禁の旗がはためいた！');s.mp[i]-=Math.ceil(cost/2);return}s.mp[i]-=flagSpellCost(cost)}
tests/game.cjs:94:if(flagChance({counts:{power:1}},'power')!==.005||flagChance({counts:{power:10}},'power')!==.5)throw Error('0.5-50 percent');
tests/game.cjs:99:`);console.log('PASS 0.5-50% flags, five floor traps, safe teleport and sequential command entry/review');
tests/game.cjs:126:`);drain();run(`s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};resetCommandEntry();for(let i=0;i<6;i++){s.commands[i]='guard';confirmCommand(i)}if(commandIndex!==6||$('#attack').hidden)throw Error('six sequential');for(let [name,kind] of Object.entries({怪力:'power',堅牢:'guard',呪禁:'magic'}))if(!coloredLog(name+'の旗がはためいた！').includes('log-flag-'+kind))throw Error('flag log color');`);
tests/game.cjs:129:drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, 0.5-50% curve');
tests/game.cjs:163:}`);console.log('PASS physical row hit thresholds 10/13/16 (50%/35%/20%) and collapse with stable row IDs');

exec
/bin/bash -lc "cat dist/flags.js && sed -n '82,102p' tests/game.cjs && sed -n '122,132p' tests/game.cjs && git status --short" in /workspace/dungeonsweeper
 succeeded in 0ms:
const FLAG_KINDS=['power','guard','magic'];
const FLAG_NAMES={power:'怪力の旗',guard:'堅牢の旗',magic:'呪禁の旗'};
const FLAG_COLORS={power:'#ffaaaa',guard:'#acd2ff',magic:'#d9b7ff'};
function placedFlag(c){return FLAG_KINDS.includes(c.flag)?c.flag:(s.flagKind||'power')}
function flagEffect(){let counts={power:0,guard:0,magic:0},curses=[];for(let c of s.cells.filter(c=>c.flag)){let kind=placedFlag(c);if(c.trap)counts[kind]++;else if(!curses.includes(kind))curses.push(kind)}return {counts,curses,bad:!!curses.length}}
function currentFlagEffect(){let f=s.enemy?.flagEffect;if(!s.enemy)return flagEffect();if(!f)return {counts:{},curses:[],bad:false};if(f.counts)return f;return {counts:{[f.kind]:f.count},curses:f.bad?[f.kind]:[],bad:f.bad}}
function flagChance(f,kind){return Math.min(.50,.005*(f?.counts?.[kind]||0)**2)}
function flagProc(kind){let f=currentFlagEffect();return !f.bad&&flagChance(f,kind)>0&&Math.random()<flagChance(f,kind)}
function flagDamage(value,incoming=false){if(!s.enemy)return value;let f=currentFlagEffect(),kind=incoming?'guard':'power';if(f.curses.includes(kind))return Math.max(1,incoming?Math.round(value*1.5):Math.floor(value*.65));if(!flagProc(kind))return value;log(FLAG_NAMES[kind]+'がはためいた！');return Math.max(1,Math.round(value*(incoming?.5:1.5)))}
function flagSpellCost(cost){return s.enemy&&currentFlagEffect().curses.includes('magic')?Math.ceil(cost*1.5):cost}
function flagConsumeMP(i,cost){if(flagProc('magic')){log('呪禁の旗がはためいた！');s.mp[i]-=Math.ceil(cost/2);return}s.mp[i]-=flagSpellCost(cost)}
function renderFlags(){let kind=s.flagKind||'power';for(let id of ['#flagopen','#mapflagopen']){let b=$(id);b.textContent='⚑ '+FLAG_NAMES[kind];b.className='flag-button flag-'+kind;b.title=FLAG_NAMES[kind]+'：押すと切り替え';b.disabled=!!s.enemy||!!visibleCombat()||logBusy();b.setAttribute('aria-label',FLAG_NAMES[kind]+'：種類を切り替え')}}
function flagUI(){for(let id of ['#flagopen','#mapflagopen'])$(id).onclick=()=>{if(s.enemy||visibleCombat()||logBusy())return;s.flagKind=FLAG_KINDS[(FLAG_KINDS.indexOf(s.flagKind||'power')+1)%FLAG_KINDS.length];render()}}
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
if(flagChance({counts:{power:1}},'power')!==.005||flagChance({counts:{power:10}},'power')!==.5)throw Error('0.5-50 percent');
`);
for (const [r,kind] of [[.1,'needle'],[.3,'blast'],[.6,'poison'],[.8,'paralysis'],[.95,'teleport']]){drain();run(`s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.done=false;var orig=s.pos,c=s.cells[orig];c.trap=true;Math.random=()=>${r};triggerFloorTrap(c);if(c.trap||!c.spent||c.trapKind!=='${kind}')throw Error('trap consume');if('${kind}'==='needle'&&s.hp.filter((h,i)=>h<maxHP(i)).length!==1)throw Error('single damage');if('${kind}'==='blast'&&s.hp.some((h,i)=>h>=maxHP(i)))throw Error('party damage');if('${kind}'==='poison'&&s.ailments.some(a=>!a.poison))throw Error('poison gas');if('${kind}'==='paralysis'&&!s.ailments.some(a=>a.paralysis>0))throw Error('paralysis');if('${kind}'==='teleport'&&(s.pos===orig||s.cells[s.pos].type||s.cells[s.pos].trap||!s.cells[s.pos].open||s.enemy||s.pendingStairs))throw Error('safe teleport');`)}
drain();run(`
s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}],target:0};resetCommandEntry();render();if(!$('#commandentry').innerHTML.includes('戦士：行動')||!$('#attack').hidden)throw Error('first prompt');s.commands[0]='guard';confirmCommand(0);if(!$('#commandentry').innerHTML.includes('魔法使い：行動'))throw Error('second prompt');confirmCommand(1);if(!$('#commandentry').innerHTML.includes('僧侶：行動'))throw Error('third prompt');confirmCommand(2);if($('#attack').hidden||!$('#commandreviewpopup').innerHTML.includes('<td>守る</td>'))throw Error('review');resetCommandEntry();s.hp[0]=0;s.ailments[1].paralysis=3;render();if(!$('#commandentry').innerHTML.includes('僧侶：行動'))throw Error('skip incapacitated');
`);console.log('PASS 0.5-50% flags, five floor traps, safe teleport and sequential command entry/review');
drain();run(`
s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.mp=[0,100,100];s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.area='dungeon';s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}]};resetCommandEntry();render();
$('#commandentry').onclick({target:{closest:q=>q==='[data-command-choice]'?{dataset:{commandChoice:'fight'}}:null}});if(commandIndex!==1||choosingRow||s.attackRows[0]!==0)throw Error('single row attack auto target');
`);drain();run(`s.cells[s.pos].chest={gold:10,trap:'needle',opened:false};var goldBefore=s.gold,hpBefore=s.hp.reduce((a,b)=>a+b);Math.random=()=>.99;thiefOpenChest();if(currentChest()||s.cells[s.pos].chest||s.gold!==goldBefore||s.hp.reduce((a,b)=>a+b)>=hpBefore)throw Error('thief failure trap and destroy');`);drain();run(`
s.hp=s.members.map(m=>m.maxHP);s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['guard','guard','guard','fight','fight','fight'];var rear=s.hp.slice(3).join(),enemyBefore=s.enemy.units[0].hp;Math.random=()=>.99;attack();if(s.enemy.units[0].hp!==enemyBefore||s.hp.slice(3).join()!==rear||s.commands.length!==6)throw Error('front rear reach');
`);drain();run(`
s.hp=s.members.map(m=>m.maxHP);var xpBefore=s.members.map(m=>m.xp);killReward({id:'slime',hp:0,rewarded:false});if(s.members.some((m,i)=>m.xp!==xpBefore[i]))throw Error('premature xp');let earned=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members.some((m,i)=>m.xp!==xpBefore[i]+Math.max(1,Math.floor(earned/s.members.length))))throw Error('all six split xp');
`);drain();run(`s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};resetCommandEntry();for(let i=0;i<6;i++){s.commands[i]='guard';confirmCommand(i)}if(commandIndex!==6||$('#attack').hidden)throw Error('six sequential');for(let [name,kind] of Object.entries({怪力:'power',堅牢:'guard',呪禁:'magic'}))if(!coloredLog(name+'の旗がはためいた！').includes('log-flag-'+kind))throw Error('flag log color');`);
console.log('PASS six-person defaults/migration, reordered jobs and gear, bench/restore/save, doubled survey/accuracy/reset, thief success/failure, front/rear combat and six XP/commands');
drain();run(`s=structuredClone(sixInitial);s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.enemy=null;s.done=false;delete s.cells[s.pos].chest;ensureProfile();s.inventory[0]=['healingPotion','sword','helm'];s.equipped[0]=1;s.armor[0]={head:2};var beforeTotal=s.inventory.reduce((n,a)=>n+a.length,0);if(!transferItem(0,0,4)||s.inventory[4].at(-1)!=='healingPotion'||s.equipped[0]!==0||s.armor[0].head!==1||equippedWeapon(0).id!=='sword')throw Error('transfer / shifted gear');if(s.inventory.reduce((n,a)=>n+a.length,0)!==beforeTotal||transferItem(0,0,4)||transferItem(0,1,4)||transferItem(0,0,0))throw Error('equipped / self transfer');s.inventory[0].push('antidote');s.inventory[1]=Array(10).fill('sword');if(transferItem(0,2,1))throw Error('full recipient');s.enemy={units:[]};if(transferItem(0,2,4)||applyPartyOrder([5,1,2,3,4,0]))throw Error('combat lock');s.enemy=null;var identity=s.members[0].id;var gear=s.inventory[0].join();if(!applyPartyOrder([5,1,2,3,4,0])||s.members[5].id!==identity||s.inventory[5].join()!==gear||equippedWeapon(5).id!=='sword'||s.armor[5].head!==1)throw Error('field reorder identity');if(applyPartyOrder([0,0,2,3,4,5]))throw Error('duplicate formation');if($('#party').onclick!==$('#statsopen').onclick)throw Error('party entry');renderStats();if($('#statsbody').innerHTML.includes('習得状況')||!$('#statsbody').innerHTML.includes('>アイテム</button>'))throw Error('labels');`);console.log('PASS item transfer/capacity/equipped guard, slot remapping, field reorder identity, combat locks and party entry');
drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, 0.5-50% curve');

drain();run(`s.enemy={boss:false,initiative:'party',units:[{id:'goblin',uid:0,row:0,hp:100}]};s.done=false;s.hp=s.members.map(m=>m.maxHP);s.members.forEach(m=>m.level=1);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));Math.random=()=>.999;var escapeHP=s.hp.join();flee();if(!s.enemy||s.hp.join()!==escapeHP||s.enemy.initiative!=='normal')throw Error('surprise flee failure consumes free turn');`);drain();console.log('PASS failed escape consumes party surprise without enemy retaliation');
drain();run(`s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0,sleep:0}));displayVitals=null;if(ailmentTags(0)!=='')throw Error('normal status hidden');displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};s.hp[0]=0;s.ailments[1].paralysis=2;if(ailmentTags(0)||ailmentTags(1))throw Error('status shown before log');displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};if(!ailmentTags(0).includes('死亡')||!ailmentTags(1).includes('麻痺'))throw Error('status missing at log');s.hp[0]=maxHP(0);s.ailments[1].paralysis=0;if(!ailmentTags(0).includes('死亡')||!ailmentTags(1).includes('麻痺'))throw Error('status recovery shown early');displayVitals=null;if(ailmentTags(0)||ailmentTags(1))throw Error('status recovery');`);console.log('PASS status tags follow displayed HP/ailments through damage and recovery');

codex
現行コードは指定どおり二乗式で、仕様書とBALANCE.mdにも旧式の記述が残っています。発動効果や呪いの処理には触れず、確率定数・期待値テスト・説明文だけを更新します。誤旗時の `bad` と逃走不可も回帰テストで明示します。
2026-11-01T18:14:17.201264Z ERROR codex_core::tools::router: error=apply_patch verification failed: Failed to find expected lines in /workspace/dungeonsweeper/tests/game.cjs:
Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5)throw Error('flag curve');}
2026-11-01T18:14:23.073317Z ERROR codex_core::tools::router: error=apply_patch verification failed: Failed to find expected lines in /workspace/dungeonsweeper/tests/game.cjs:
if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5)throw Error('flag curve');
exec
/bin/bash -lc "rg -n -o \"for\\(let kind of FLAG_KINDS\\).*flag curve.*\" tests/game.cjs" in /workspace/dungeonsweeper
 succeeded in 0ms:
129:for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, 0.5-50% curve');

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('dist/flags.js'); s=p.read_text(); s=s.replace(\"const FLAG_KINDS=['power','guard','magic'];\", \"const FLAG_KINDS=['power','guard','magic'];\\nconst FLAG_CHANCE_PER=.04,FLAG_CHANCE_CAP=.40;\").replace(\"function flagChance(f,kind){return Math.min(.50,.005*(f?.counts?.[kind]||0)**2)}\", \"function flagChance(f,kind){return Math.min(FLAG_CHANCE_CAP,FLAG_CHANCE_PER*(f?.counts?.[kind]||0))}\"); p.write_text(s)
p=Path('tests/game.cjs'); s=p.read_text(); s=s.replace(\"if(flagChance({counts:{power:1}},'power')"'!==.005||flagChance({counts:{power:10}},'"'power')"'!==.5)throw Error('"'0.5-50 percent');\", \"if(flagChance({counts:{power:0}},'power')"'!==0||flagChance({counts:{power:1}},'"'power')"'!==.04||flagChance({counts:{power:5}},'"'power')"'!==.2||flagChance({counts:{power:10}},'"'power')"'!==.4||flagChance({counts:{power:100}},'"'power')"'!==.4)throw Error('"'4-40 percent linear');\")
s=s.replace(\"flagChance({counts:{[kind]:1}},kind)"'!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5", "flagChance({counts:{[kind]:1}},kind)!==.04||flagChance({counts:{[kind]:5}},kind)!==.2||flagChance({counts:{[kind]:10}},kind)!==.4||flagChance({counts:{[kind]:100}},kind)!==.4")
s=s.replace("0.5-50% curve", "linear 4-40% flag curve")
p.write_text(s)
p=Path('"'docs/SPECIFICATION.md'); s=p.read_text().replace(\"正しい旗n本の種類別発動率＝min(50%,0.5%×n²)。1本0.5%、10本50%。\", \"正しい旗n本の種類別発動率＝min(40%,4%×n)。1本4%、5本20%、10本以上40%。\"); p.write_text(s)
p=Path('BALANCE.md'); s=p.read_text().replace(\""'`min(50%, 0.5% × 本数²)`。0本は発動なし、1本0.5%、2本2%、5本12.5%、10本以上50%。", "`min(40%, 4% × 本数)`。0本は発動なし、1本4%、5本20%、10本以上40%。"); p.write_text(s)
PY
node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
 succeeded in 1124ms:
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
更新と共通テストは完了しました。確率テストの実行ログには古い説明文字列が一か所残っているので、表示名も新式に合わせてから差分を確認します。ブラウザ操作での手動検証はこの環境では行っていません。
exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('tests/game.cjs');s=p.read_text().replace(\"PASS 0.5-50% flags, five floor traps\", \"PASS linear 4-40% flags, five floor traps\");p.write_text(s)
PY
git diff --check && git status --short && git diff --stat && git diff -- dist/flags.js tests/game.cjs docs/SPECIFICATION.md BALANCE.md" in /workspace/dungeonsweeper
 succeeded in 0ms:
 M BALANCE.md
 M dist/flags.js
 M docs/SPECIFICATION.md
 M tests/game.cjs
 BALANCE.md            | 2 +-
 dist/flags.js         | 3 ++-
 docs/SPECIFICATION.md | 2 +-
 tests/game.cjs        | 6 +++---
 4 files changed, 7 insertions(+), 6 deletions(-)
diff --git a/BALANCE.md b/BALANCE.md
index e7d98f3..6e250b2 100644
--- a/BALANCE.md
+++ b/BALANCE.md
@@ -44,7 +44,7 @@ HPは出現時に決定、戦闘中の残りHPは非表示。撃破ごとにそ
 町への帰還で全階層の探索記録を破棄。1階は再生成し全マス未探索、次回入場時に現在地だけ開く。2階以降も初回到達時に再生成する。迷宮内の階段往復では探索状態を保存。各階の下り階段は守護者マスと同一で、一団を全滅させて初めて開く。キャラクター・経験値・所持品・金貨は維持。
 
 
-旗はマスごとにpower/guard/magicを保存、旧booleanは選択中の種類へ移行。正旗は種類別に `min(50%, 0.5% × 本数²)`。0本は発動なし、1本0.5%、2本2%、5本12.5%、10本以上50%。誤旗があると全ボーナス停止、誤旗の各種類のデバフを適用し逃走不可。遭遇時は誤旗のみ「誤った旗がパーティーを惑わせた！」。正旗は発動時に「怪力／堅牢／呪禁の旗がはためいた！」と表示し、旗名をオレンジ／緑／紫に着色。呪禁は消費MP半減・切上げ、探索中は現在階の旗で都度抽選（探索中の誤旗ではボーナス停止のみ）。地図と視界に旗色を表示。
+旗はマスごとにpower/guard/magicを保存、旧booleanは選択中の種類へ移行。正旗は種類別に `min(40%, 4% × 本数)`。0本は発動なし、1本4%、5本20%、10本以上40%。誤旗があると全ボーナス停止、誤旗の各種類のデバフを適用し逃走不可。遭遇時は誤旗のみ「誤った旗がパーティーを惑わせた！」。正旗は発動時に「怪力／堅牢／呪禁の旗がはためいた！」と表示し、旗名をオレンジ／緑／紫に着色。呪禁は消費MP半減・切上げ、探索中は現在階の旗で都度抽選（探索中の誤旗ではボーナス停止のみ）。地図と視界に旗色を表示。
 
 床罠は dist/traps.js。単体3d6+4（25%）、全体2d6+3（25%）、全員毒（20%）、単体麻痺（15%）、同一階転移（15%）。転移は通常の安全な部屋のみ、旗・罠・宝箱・階段・守護者を除外し、連鎖移動や遭遇は起こさない。罠は一度で消え周囲の数値も減る。
 戦闘UIは dist/combatui.js。生存かつ行動可能なメンバー順で入力→最終確認→1ターン実行。戻るで順に修正可能。状態カードはPC・スマホとも3列、前衛と後衛の2段。最大6人。
diff --git a/dist/flags.js b/dist/flags.js
index 5fb414e..2b98fb6 100644
--- a/dist/flags.js
+++ b/dist/flags.js
@@ -1,10 +1,11 @@
 const FLAG_KINDS=['power','guard','magic'];
+const FLAG_CHANCE_PER=.04,FLAG_CHANCE_CAP=.40;
 const FLAG_NAMES={power:'怪力の旗',guard:'堅牢の旗',magic:'呪禁の旗'};
 const FLAG_COLORS={power:'#ffaaaa',guard:'#acd2ff',magic:'#d9b7ff'};
 function placedFlag(c){return FLAG_KINDS.includes(c.flag)?c.flag:(s.flagKind||'power')}
 function flagEffect(){let counts={power:0,guard:0,magic:0},curses=[];for(let c of s.cells.filter(c=>c.flag)){let kind=placedFlag(c);if(c.trap)counts[kind]++;else if(!curses.includes(kind))curses.push(kind)}return {counts,curses,bad:!!curses.length}}
 function currentFlagEffect(){let f=s.enemy?.flagEffect;if(!s.enemy)return flagEffect();if(!f)return {counts:{},curses:[],bad:false};if(f.counts)return f;return {counts:{[f.kind]:f.count},curses:f.bad?[f.kind]:[],bad:f.bad}}
-function flagChance(f,kind){return Math.min(.50,.005*(f?.counts?.[kind]||0)**2)}
+function flagChance(f,kind){return Math.min(FLAG_CHANCE_CAP,FLAG_CHANCE_PER*(f?.counts?.[kind]||0))}
 function flagProc(kind){let f=currentFlagEffect();return !f.bad&&flagChance(f,kind)>0&&Math.random()<flagChance(f,kind)}
 function flagDamage(value,incoming=false){if(!s.enemy)return value;let f=currentFlagEffect(),kind=incoming?'guard':'power';if(f.curses.includes(kind))return Math.max(1,incoming?Math.round(value*1.5):Math.floor(value*.65));if(!flagProc(kind))return value;log(FLAG_NAMES[kind]+'がはためいた！');return Math.max(1,Math.round(value*(incoming?.5:1.5)))}
 function flagSpellCost(cost){return s.enemy&&currentFlagEffect().curses.includes('magic')?Math.ceil(cost*1.5):cost}
diff --git a/docs/SPECIFICATION.md b/docs/SPECIFICATION.md
index d635a76..8863b15 100644
--- a/docs/SPECIFICATION.md
+++ b/docs/SPECIFICATION.md
@@ -84,7 +84,7 @@ MP1本制。本作独自の消費MP。全25呪文のレベル・MP・対象・
 ## 8. 旗
 
 怪力・堅牢・呪禁をループ切替し、設置時の種類をマスに保存。切替しても既設旗は変わらない。地図と視界で色を反映。
-正しい旗n本の種類別発動率＝min(50%,0.5%×n²)。1本0.5%、10本50%。戦闘開始時に旗配置のスナップショットを取る。
+正しい旗n本の種類別発動率＝min(40%,4%×n)。1本4%、5本20%、10本以上40%。戦闘開始時に旗配置のスナップショットを取る。
 怪力：合計物理ダメージ×1.5、堅牢：被ダメージ×0.5、呪禁：MP消費半減（切上げ）。呪禁は探索時にも現在配置で抽選。
 誤旗が一つでもあれば全種類の正旗抽選を停止、逃走不可。誤旗の種類に応じ、怪力は攻撃×0.65切捨て、堅牢は被害×1.5四捨五入、呪禁は戦闘MP×1.5切上げ。
 正旗は発動時だけ「○○の旗がはためいた！」。誤旗のみ戦闘開始時「誤った旗がパーティーを惑わせた！」。ログ色：怪力橙・堅牢緑・呪禁紫。
diff --git a/tests/game.cjs b/tests/game.cjs
index dbd71bf..8c2e0c5 100644
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -91,12 +91,12 @@ s.enemy=null;s.cells.forEach(c=>c.flag=false);var ts=s.cells.filter(c=>c.trap);t
 `);console.log('PASS typed flags, independent procs, no recoloring, half MP in combat and field, exclusive curses');
 drain();run(`
 s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;fresh(1);s.cells.forEach(c=>{c.trap=false;c.flag=false;c.chest=undefined});
-if(flagChance({counts:{power:1}},'power')!==.005||flagChance({counts:{power:10}},'power')!==.5)throw Error('0.5-50 percent');
+if(flagChance({counts:{power:0}},'power')!==0||flagChance({counts:{power:1}},'power')!==.04||flagChance({counts:{power:5}},'power')!==.2||flagChance({counts:{power:10}},'power')!==.4||flagChance({counts:{power:100}},'power')!==.4)throw Error('4-40 percent linear');
 `);
 for (const [r,kind] of [[.1,'needle'],[.3,'blast'],[.6,'poison'],[.8,'paralysis'],[.95,'teleport']]){drain();run(`s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.done=false;var orig=s.pos,c=s.cells[orig];c.trap=true;Math.random=()=>${r};triggerFloorTrap(c);if(c.trap||!c.spent||c.trapKind!=='${kind}')throw Error('trap consume');if('${kind}'==='needle'&&s.hp.filter((h,i)=>h<maxHP(i)).length!==1)throw Error('single damage');if('${kind}'==='blast'&&s.hp.some((h,i)=>h>=maxHP(i)))throw Error('party damage');if('${kind}'==='poison'&&s.ailments.some(a=>!a.poison))throw Error('poison gas');if('${kind}'==='paralysis'&&!s.ailments.some(a=>a.paralysis>0))throw Error('paralysis');if('${kind}'==='teleport'&&(s.pos===orig||s.cells[s.pos].type||s.cells[s.pos].trap||!s.cells[s.pos].open||s.enemy||s.pendingStairs))throw Error('safe teleport');`)}
 drain();run(`
 s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}],target:0};resetCommandEntry();render();if(!$('#commandentry').innerHTML.includes('戦士：行動')||!$('#attack').hidden)throw Error('first prompt');s.commands[0]='guard';confirmCommand(0);if(!$('#commandentry').innerHTML.includes('魔法使い：行動'))throw Error('second prompt');confirmCommand(1);if(!$('#commandentry').innerHTML.includes('僧侶：行動'))throw Error('third prompt');confirmCommand(2);if($('#attack').hidden||!$('#commandreviewpopup').innerHTML.includes('<td>守る</td>'))throw Error('review');resetCommandEntry();s.hp[0]=0;s.ailments[1].paralysis=3;render();if(!$('#commandentry').innerHTML.includes('僧侶：行動'))throw Error('skip incapacitated');
-`);console.log('PASS 0.5-50% flags, five floor traps, safe teleport and sequential command entry/review');
+`);console.log('PASS linear 4-40% flags, five floor traps, safe teleport and sequential command entry/review');
 drain();run(`
 s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.mp=[0,100,100];s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.area='dungeon';s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}]};resetCommandEntry();render();
 $('#commandentry').onclick({target:{closest:q=>q==='[data-command-choice]'?{dataset:{commandChoice:'fight'}}:null}});if(commandIndex!==1||choosingRow||s.attackRows[0]!==0)throw Error('single row attack auto target');
@@ -126,7 +126,7 @@ s.hp=s.members.map(m=>m.maxHP);var xpBefore=s.members.map(m=>m.xp);killReward({i
 `);drain();run(`s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};resetCommandEntry();for(let i=0;i<6;i++){s.commands[i]='guard';confirmCommand(i)}if(commandIndex!==6||$('#attack').hidden)throw Error('six sequential');for(let [name,kind] of Object.entries({怪力:'power',堅牢:'guard',呪禁:'magic'}))if(!coloredLog(name+'の旗がはためいた！').includes('log-flag-'+kind))throw Error('flag log color');`);
 console.log('PASS six-person defaults/migration, reordered jobs and gear, bench/restore/save, doubled survey/accuracy/reset, thief success/failure, front/rear combat and six XP/commands');
 drain();run(`s=structuredClone(sixInitial);s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.enemy=null;s.done=false;delete s.cells[s.pos].chest;ensureProfile();s.inventory[0]=['healingPotion','sword','helm'];s.equipped[0]=1;s.armor[0]={head:2};var beforeTotal=s.inventory.reduce((n,a)=>n+a.length,0);if(!transferItem(0,0,4)||s.inventory[4].at(-1)!=='healingPotion'||s.equipped[0]!==0||s.armor[0].head!==1||equippedWeapon(0).id!=='sword')throw Error('transfer / shifted gear');if(s.inventory.reduce((n,a)=>n+a.length,0)!==beforeTotal||transferItem(0,0,4)||transferItem(0,1,4)||transferItem(0,0,0))throw Error('equipped / self transfer');s.inventory[0].push('antidote');s.inventory[1]=Array(10).fill('sword');if(transferItem(0,2,1))throw Error('full recipient');s.enemy={units:[]};if(transferItem(0,2,4)||applyPartyOrder([5,1,2,3,4,0]))throw Error('combat lock');s.enemy=null;var identity=s.members[0].id;var gear=s.inventory[0].join();if(!applyPartyOrder([5,1,2,3,4,0])||s.members[5].id!==identity||s.inventory[5].join()!==gear||equippedWeapon(5).id!=='sword'||s.armor[5].head!==1)throw Error('field reorder identity');if(applyPartyOrder([0,0,2,3,4,5]))throw Error('duplicate formation');if($('#party').onclick!==$('#statsopen').onclick)throw Error('party entry');renderStats();if($('#statsbody').innerHTML.includes('習得状況')||!$('#statsbody').innerHTML.includes('>アイテム</button>'))throw Error('labels');`);console.log('PASS item transfer/capacity/equipped guard, slot remapping, field reorder identity, combat locks and party entry');
-drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, 0.5-50% curve');
+drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.04||flagChance({counts:{[kind]:5}},kind)!==.2||flagChance({counts:{[kind]:10}},kind)!==.4||flagChance({counts:{[kind]:100}},kind)!==.4)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, linear 4-40% flag curve');
 
 drain();run(`s.enemy={boss:false,initiative:'party',units:[{id:'goblin',uid:0,row:0,hp:100}]};s.done=false;s.hp=s.members.map(m=>m.maxHP);s.members.forEach(m=>m.level=1);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));Math.random=()=>.999;var escapeHP=s.hp.join();flee();if(!s.enemy||s.hp.join()!==escapeHP||s.enemy.initiative!=='normal')throw Error('surprise flee failure consumes free turn');`);drain();console.log('PASS failed escape consumes party surprise without enemy retaliation');
 drain();run(`s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0,sleep:0}));displayVitals=null;if(ailmentTags(0)!=='')throw Error('normal status hidden');displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};s.hp[0]=0;s.ailments[1].paralysis=2;if(ailmentTags(0)||ailmentTags(1))throw Error('status shown before log');displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};if(!ailmentTags(0).includes('死亡')||!ailmentTags(1).includes('麻痺'))throw Error('status missing at log');s.hp[0]=maxHP(0);s.ailments[1].paralysis=0;if(!ailmentTags(0).includes('死亡')||!ailmentTags(1).includes('麻痺'))throw Error('status recovery shown early');displayVitals=null;if(ailmentTags(0)||ailmentTags(1))throw Error('status recovery');`);console.log('PASS status tags follow displayed HP/ailments through damage and recovery');

codex
**完了** — 旗の発動率を種類ごとに `min(40%, 4% × 正しい旗の本数)` へ変更し、仕様書・BALANCE.md・確率テストを更新しました。発動効果と誤旗の呪いは変更していません。

変更ファイル：[dist/flags.js](/workspace/dungeonsweeper/dist/flags.js)、[tests/game.cjs](/workspace/dungeonsweeper/tests/game.cjs)、[docs/SPECIFICATION.md](/workspace/dungeonsweeper/docs/SPECIFICATION.md)、[BALANCE.md](/workspace/dungeonsweeper/BALANCE.md)

指定の共通テスト3件はすべてPASSし、`git diff --check` もPASSしました。ブラウザでの手動確認は未実施です。
tokens used
38,349
**完了** — 旗の発動率を種類ごとに `min(40%, 4% × 正しい旗の本数)` へ変更し、仕様書・BALANCE.md・確率テストを更新しました。発動効果と誤旗の呪いは変更していません。

変更ファイル：[dist/flags.js](/workspace/dungeonsweeper/dist/flags.js)、[tests/game.cjs](/workspace/dungeonsweeper/tests/game.cjs)、[docs/SPECIFICATION.md](/workspace/dungeonsweeper/docs/SPECIFICATION.md)、[BALANCE.md](/workspace/dungeonsweeper/BALANCE.md)

指定の共通テスト3件はすべてPASSし、`git diff --check` もPASSしました。ブラウザでの手動確認は未実施です。
EXIT 0
