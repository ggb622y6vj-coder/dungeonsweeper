OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-astra
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: high
reasoning summaries: none
session id: 01a19938-92ef-79d3-a382-86416906527d
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

## sim 実行時の注意（検証担当より）
- sim のハーネスは、必ずクリーンなチェックアウトから dist を読むこと。
  - 使ってよいもの：/workspace/verify-clone、または HEAD の git worktree / git archive。
  - /workspace/dungeonsweeper の作業ツリーは読まない。未コミットの作業中 dist を読み、019b で 55% や 01Ab で 0% のような誤った値が出た。

# 030-heavy-corpse-on-wipe
ティア：HEAVY　依存：023

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【遺体と救出 手順1/2】全滅時に即町へ戻して全快するのをやめ、遺体を迷宮に残す。

## 変更内容
- データ：`s.corpses = [{id(UUID), floor, cell, records:[訓練所recordの完全コピー], gold}]`。dist/recruits.js `rosterSaveState()/restoreRoster()` で保存・復元（旧セーブは[]）。
- dist/game.js `defeat()`：全員 status 'dead'。s.corpses に {floor:s.floor, cell:s.pos, records:パーティ全員のrecord, gold:s.gold} を追加、s.gold=0。パーティを空にし（控えにも入れない）、町へ（s.done解除、resetDungeon）。
- dist/training.js：訓練所に「迷宮に残された遺体：地下◯階（名前…）」を表示。
- 触らない：救出処理（次の031）、寺院、戦闘。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：全滅→パーティ0人・金貨0・corpses 1件・セーブ/リロードで保持・旧セーブで例外なし。
- 手動：全滅後に町で遺体表示が出ること。

codex
030の全滅時の遺体保存を実装します。先に引き継ぎ資料と現行コードを確認し、保存・復元と訓練所表示まで検証します。

exec
/bin/bash -lc "pwd; rg --files -g 'AGENTS.md' -g 'README*' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g '*030*'" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
AGENTS.md
README.md
data/README.md
docs/SPECIFICATION.md
docs/HANDOFF.md

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


## 宿屋（2026-11-02）

町への帰還ではHP/MP回復とレベルアップを行わない。宿屋の馬小屋は無料で正常なメンバーのMPを全快し、普通の部屋は正常なメンバーの人数×各人Lv×10 Gで正常なメンバーのHP/MPを全快する。いずれも宿泊後にレベルアップ処理を行う。死亡・灰・ロストは回復対象外。詳細は `docs/SPECIFICATION.md`。
# 現行仕様書

作成日：2026-11-01（日本時間）。**この資料は実装の記録であり、初代Wizardryの完全再現を保証する資料ではありません。** 数値の正本はコードとDATA_CATALOG.mdを参照。

## 1. ゲームループ・階層

町（酒場・宿屋・鍛冶屋・寺院・迷宮入口）→探索→遭遇／宝箱／守護者→階段で上下移動→町。
1Fは8×8、2Fは10×10、3F以降12×12。上下左右の隣接移動、左右旋回、後退、左右横移動。盤面クリックは旗の操作で、任意マスへ移動する操作ではない。
開始位置と守護者位置は乱数。チェビシェフ距離2以内（縦横の最大差が2以下）には守護者を置かない。開始位置の周囲と、守護者までの生成経路は安全。罠数は1F=9、2F=15、3F=23。階層・盤面サイズに応じて増え、盤面の22%を上限とする。
守護者マスへ入ると確認。いいえで直前マスへ戻る。1〜9Fでは撃破後その場所が下り階段になる。各階に固有守護者がおり、最深部は10F（MAX_FLOOR=10）。階段・転移とも11F以降へは移動できない。
10Fの守護者「迷宮の主」（labyrinthlord）を随伴の敵も含めて撃破するとゲームクリア。下り階段は作らず、クリアログを表示する。ログ再生終了後に「迷宮踏破」の表示と町へ戻るボタンを出す。宝箱がある場合は開封か放棄を済ませてから帰還できる。探索も続行でき、帰還後は再び探索できる。再度10Fを攻略しても下り階段は作らない。
踏破記録は `ash-v1` の `cleared` として保存し、未設定の旧セーブではfalseとする。帰還・階層移動・再探索でも保持し、町に「迷宮踏破済み」を表示する。旧セーブに残る10F以降の下り階段も無効化する。
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
町への帰還ではHP/MPを回復せず、レベルアップもしない。宿屋で宿泊すると経験値に応じて複数回レベルアップし、結果をポップアップする。馬小屋は無料で正常なメンバーのMPのみ全快。普通の部屋は正常なメンバーの人数×各人Lv×10 Gを合計して支払い、正常なメンバーのHP/MPを全快する。死亡・灰・ロストのHP/MPは回復しない。Lv上限30。HP/MP成長は職業別ダイス、ACはレベルアップで変化しない。
死亡状態は本作の暫定仕様。メンバーの `status` は `ok`（正常）・`dead`（死亡）・`ash`（灰）・`lost`（ロスト）。HPが0になると正常から死亡へ移行し、死亡・灰・ロストは帰還後もHP0のまま、MPも回復しない。帰還時の毒・麻痺解除は全員が対象。状態タグはログのスナップショットに同期して「死亡」「灰」「ロスト」を表示する。正常以外のメンバーがいるパーティーは迷宮に入れず、寺院で蘇生するか、酒場で外す必要がある。
寺院では町で操作待ちのときのみ、パーティーと控えの死亡・灰のメンバーを蘇生できる。費用と成功率は**本作の暫定式**。死亡の費用は100×Lv G、成功率はclamp(50＋3×Lv,50,95)%、灰の費用は250×Lv G、成功率はclamp(40＋3×Lv,40,90)%（clampは下限・上限で制限）。成功時は正常・HP1に戻り、MPは変化しない。失敗時は死亡→灰、灰→ロストとなり、HP0を維持する。費用は成否にかかわらず消費し、金貨不足時は実行できない。正常・ロストは蘇生対象外。結果の状態・HP・金貨は既存の `ash-v1` に保存する。
旧セーブの状態未設定メンバーは、町なら正常、迷宮内でHP0以下なら死亡、その他は正常とする。状態未設定の控えは正常とし、設定済みの状態は保存・再読込・編成変更で保持する。
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
蘇生呪文はなし。死亡したメンバーは町帰還でも回復しない（3章参照）。

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
/bin/bash -lc 'git status --short; cat dist/recruits.js' in /workspace/dungeonsweeper
 succeeded in 0ms:
// 本作用の配分。Wizardryの能力値範囲を参考にし、原作の生成式とは区別する。
const RECRUIT_BASES = [[12,8,8],[8,12,8],[10,8,12],[10,10,8]];
const RECRUIT_WEIGHTS = [[0,0,0,1,2],[0,1,1,1,2],[0,1,2,2,2],[0,0,1,1,2]];
function generateRecruit(name, job) {
 name = String(name).trim().replace(/[<>&"'\u0000-\u001f]/g, '').slice(0,20);
 if (!name || !Number.isInteger(job) || !CLASSES[job]) return null;
 const c = CLASSES[job], stats = RECRUIT_BASES[job].slice();
 const bonus = 3 + Math.floor(Math.random()*7);
 for (let n=0;n<bonus;n++) {
  const choices = RECRUIT_WEIGHTS[job].filter(i=>stats[i]<18);
  stats[choices[Math.floor(Math.random()*choices.length)]]++;
 }
 const hp=c.hp-3+Math.floor(Math.random()*7), mp=c.mp?c.mp-2+Math.floor(Math.random()*5):0;
 const m={id:crypto.randomUUID(),name,job,level:1,xp:0,maxHP:hp,maxMP:mp,attack:c.attack,ac:c.ac,str:stats[0],baseStr:stats[0],intelligence:stats[1],piety:stats[2],creationBonus:bonus,xpTargets:[0,0],xpCurveVersion:2,
  known:MAGIC.filter(x=>x.job===job&&x.level===1&&x.guaranteed).map(x=>x.id)};
 for(let l=2;l<=LEVEL_CAP;l++)m.xpTargets[l]=m.xpTargets[l-1]+Math.round(115*(l-1)*c.xpFactor*(.9+Math.random()*.2));
 return {members:m,hp,mp,inventory:[['sword','staff','mace','dagger'][job]],equipped:0,armor:{},ailments:{poison:false,paralysis:0}};
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
 (s.reserve??=[]).push(structuredClone(record));render();return true;
}
function changeRecruitParty(id, join) {
 const roster=trainingRoster(), index=roster.findIndex(r=>r.members.id===id);
 if(index<0)return false;
 if(join&&roster[index].members.status==='lost')return false;
 let order=s.members.map((_,i)=>i);
 if(join){if(index<order.length||order.length>=6)return false;order.push(index)}
 else {if(index>=order.length)return false;order=order.filter(i=>i!==index)}
 return setPartyFromRoster(roster,order);
}
function deleteRecruit(id) {
 if(s.area!=='town'||!idle())return false;
 const roster=trainingRoster().filter(r=>r.members.id!==id);
 if(roster.length===trainingRoster().length)return false;
 const ids=s.members.map(m=>m.id).filter(i=>i!==id);
 return setPartyFromRoster(roster,ids.map(i=>roster.findIndex(r=>r.members.id===i)));
}
function recruitAC(record){return record.members.ac-Object.values(record.armor).reduce((sum,slot)=>sum+(weapon(record.inventory[slot])?.ac||0),0)}

exec
/bin/bash -lc "cat /workspace/dsw-queue/README-handoff.md; rg --files /workspace/dsw-queue | sort; rg -n 'defeat|wipe|全滅|save|reload|roster' tests/training.cjs tests/game.cjs; cat tests/training-browser.py" in /workspace/dungeonsweeper
 succeeded in 0ms:
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

## sim 実行時の注意（検証担当より）
- sim のハーネスは、必ずクリーンなチェックアウトから dist を読むこと。
  - 使ってよいもの：/workspace/verify-clone、または HEAD の git worktree / git archive。
  - /workspace/dungeonsweeper の作業ツリーは読まない。未コミットの作業中 dist を読み、019b で 55% や 01Ab で 0% のような誤った値が出た。
/workspace/dsw-queue/README-handoff.md
/workspace/dsw-queue/assets/compile-monsters.py
/workspace/dsw-queue/assets/items.js
/workspace/dsw-queue/assets/monsters.csv
/workspace/dsw-queue/assets/proto/apply_015.py
/workspace/dsw-queue/assets/proto/apply_017.py
/workspace/dsw-queue/assets/proto/tests-game-diff-015-017.txt
/workspace/dsw-queue/assets/weapons.js
/workspace/dsw-queue/design-10f.md
/workspace/dsw-queue/done/001-bugfix-name-regex.md
/workspace/dsw-queue/done/001b-bugfix-row-hit-modifier-retry.md
/workspace/dsw-queue/done/002-bugfix-poison-death-log-retry.md
/workspace/dsw-queue/done/003-bugfix-attack-dead-branch.md
/workspace/dsw-queue/done/004-bugfix-magicplans-length.md
/workspace/dsw-queue/done/005-bugfix-chest-item-pool.md
/workspace/dsw-queue/done/005a-bugfix-chest-unequippable-message.md
/workspace/dsw-queue/done/006-bugfix-summon-cap.md
/workspace/dsw-queue/done/007-bugfix-combat-hide-numbers.md
/workspace/dsw-queue/done/010-light-sim-tool-retry.md
/workspace/dsw-queue/done/010a-bugfix-sim-katino-policy.md
/workspace/dsw-queue/done/011-light-exp-split.md
/workspace/dsw-queue/done/012-light-escape-rate.md
/workspace/dsw-queue/done/013-light-guardian-escort.md
/workspace/dsw-queue/done/014-light-trap-count.md
/workspace/dsw-queue/done/015-light-flag-tuning.md
/workspace/dsw-queue/done/016-light-floor-config-10f.md
/workspace/dsw-queue/done/017-light-monsters-4-10f.md
/workspace/dsw-queue/done/017b-light-sim-floor-range.md
/workspace/dsw-queue/done/017c-bugfix-sim-gear-ignored.md
/workspace/dsw-queue/done/018-light-items-4-10f.md
/workspace/dsw-queue/done/019-light-chest-loot-table.md
/workspace/dsw-queue/done/019a-light-guardian-8f-9f-tuning.md
/workspace/dsw-queue/done/019b-light-ancientdragon-tuning.md
/workspace/dsw-queue/done/01A-heavy-10f-final-boss.md
/workspace/dsw-queue/done/01Ab-light-final-boss-tuning.md
/workspace/dsw-queue/done/020-heavy-death-status.md
/workspace/dsw-queue/done/020a-bugfix-town-entry-message.md
/workspace/dsw-queue/done/021-heavy-temple.md
/workspace/dsw-queue/done/022-light-lost-roster.md
/workspace/dsw-queue/done/023-light-inn.md
/workspace/dsw-queue/done/023a-bugfix-inn-dead-levelup.md
/workspace/dsw-queue/report/001-bugfix-name-regex-verify.md
/workspace/dsw-queue/report/001-bugfix-name-regex.md
/workspace/dsw-queue/report/001b-attempt1.diff
/workspace/dsw-queue/report/001b-bugfix-row-hit-modifier-verify.md
/workspace/dsw-queue/report/001b-bugfix-row-hit-modifier.md
/workspace/dsw-queue/report/001b-codex-retry-output.md
/workspace/dsw-queue/report/002-attempt1.diff
/workspace/dsw-queue/report/002-bugfix-poison-death-log-verify.md
/workspace/dsw-queue/report/002-bugfix-poison-death-log.md
/workspace/dsw-queue/report/003-bugfix-attack-dead-branch-verify.md
/workspace/dsw-queue/report/003-bugfix-attack-dead-branch.md
/workspace/dsw-queue/report/004-bugfix-magicplans-length-verify.md
/workspace/dsw-queue/report/004-bugfix-magicplans-length.md
/workspace/dsw-queue/report/005-bugfix-chest-item-pool-verify.md
/workspace/dsw-queue/report/005-bugfix-chest-item-pool.md
/workspace/dsw-queue/report/005a-bugfix-chest-unequippable-message-verify.md
/workspace/dsw-queue/report/005a-bugfix-chest-unequippable-message.md
/workspace/dsw-queue/report/006-bugfix-summon-cap-verify.md
/workspace/dsw-queue/report/006-bugfix-summon-cap.md
/workspace/dsw-queue/report/007-bugfix-combat-hide-numbers-verify.md
/workspace/dsw-queue/report/007-bugfix-combat-hide-numbers.md
/workspace/dsw-queue/report/010-attempt1.diff
/workspace/dsw-queue/report/010-light-sim-tool-codex-retry.md
/workspace/dsw-queue/report/010-light-sim-tool-retry.md
/workspace/dsw-queue/report/010-light-sim-tool-verify.md
/workspace/dsw-queue/report/010-light-sim-tool.md
/workspace/dsw-queue/report/010a-bugfix-sim-katino-policy-verify.md
/workspace/dsw-queue/report/010a-bugfix-sim-katino-policy.md
/workspace/dsw-queue/report/011-attempt1.diff
/workspace/dsw-queue/report/011-light-exp-split-codex-attempt1-output.md
/workspace/dsw-queue/report/011-light-exp-split-codex-retry-output.md
/workspace/dsw-queue/report/011-light-exp-split-verify.md
/workspace/dsw-queue/report/011-light-exp-split.md
/workspace/dsw-queue/report/012-light-escape-rate-codex-output.md
/workspace/dsw-queue/report/012-light-escape-rate-verify.md
/workspace/dsw-queue/report/012-light-escape-rate.md
/workspace/dsw-queue/report/013-light-guardian-escort-codex-output.md
/workspace/dsw-queue/report/013-light-guardian-escort-verify.md
/workspace/dsw-queue/report/013-light-guardian-escort.md
/workspace/dsw-queue/report/014-light-trap-count-codex-output.md
/workspace/dsw-queue/report/014-light-trap-count-verify.md
/workspace/dsw-queue/report/014-light-trap-count.md
/workspace/dsw-queue/report/015-light-flag-tuning-codex-output.md
/workspace/dsw-queue/report/015-light-flag-tuning-verify.md
/workspace/dsw-queue/report/015-light-flag-tuning.md
/workspace/dsw-queue/report/015-sim-after.txt
/workspace/dsw-queue/report/015-sim-before.txt
/workspace/dsw-queue/report/016-light-floor-config-10f-codex-output.md
/workspace/dsw-queue/report/016-light-floor-config-10f-verify.md
/workspace/dsw-queue/report/016-light-floor-config-10f.md
/workspace/dsw-queue/report/017-light-monsters-4-10f-codex-output.md
/workspace/dsw-queue/report/017-light-monsters-4-10f-verify.md
/workspace/dsw-queue/report/017-light-monsters-4-10f.md
/workspace/dsw-queue/report/017-sim-after.txt
/workspace/dsw-queue/report/017-sim-before.txt
/workspace/dsw-queue/report/017b-light-sim-floor-range-codex-output.md
/workspace/dsw-queue/report/017b-light-sim-floor-range.md
/workspace/dsw-queue/report/017b-sim-after.txt
/workspace/dsw-queue/report/017b-sim-before.txt
/workspace/dsw-queue/report/017c-bugfix-sim-gear-ignored-codex-output.md
/workspace/dsw-queue/report/017c-bugfix-sim-gear-ignored.md
/workspace/dsw-queue/report/017c-sim-after.txt
/workspace/dsw-queue/report/017c-sim-before.txt
/workspace/dsw-queue/report/018-light-items-4-10f-codex-output.md
/workspace/dsw-queue/report/018-light-items-4-10f-verify.md
/workspace/dsw-queue/report/018-light-items-4-10f.md
/workspace/dsw-queue/report/018-sim-after.txt
/workspace/dsw-queue/report/018-sim-before.txt
/workspace/dsw-queue/report/019-light-chest-loot-table-codex-output.md
/workspace/dsw-queue/report/019-light-chest-loot-table-verify.md
/workspace/dsw-queue/report/019-light-chest-loot-table.md
/workspace/dsw-queue/report/019-sim-after.txt
/workspace/dsw-queue/report/019-sim-before.txt
/workspace/dsw-queue/report/019a-light-guardian-8f-9f-tuning-codex-output.md
/workspace/dsw-queue/report/019a-light-guardian-8f-9f-tuning-verify.md
/workspace/dsw-queue/report/019a-light-guardian-8f-9f-tuning.md
/workspace/dsw-queue/report/019a-sim-after.txt
/workspace/dsw-queue/report/019a-sim-before.txt
/workspace/dsw-queue/report/019b-light-ancientdragon-tuning-codex-output.md
/workspace/dsw-queue/report/019b-light-ancientdragon-tuning-verify.md
/workspace/dsw-queue/report/019b-light-ancientdragon-tuning.md
/workspace/dsw-queue/report/019b-sim-after.txt
/workspace/dsw-queue/report/019b-sim-before.txt
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-output.md
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-report.md
/workspace/dsw-queue/report/01A-heavy-10f-final-boss-verify.md
/workspace/dsw-queue/report/01A-heavy-10f-final-boss.md
/workspace/dsw-queue/report/01A-sim-after.txt
/workspace/dsw-queue/report/01A-sim-before.txt
/workspace/dsw-queue/report/01Ab-light-final-boss-tuning-codex-output.md
/workspace/dsw-queue/report/01Ab-light-final-boss-tuning-codex-report.md
/workspace/dsw-queue/report/01Ab-light-final-boss-tuning-verify.md
/workspace/dsw-queue/report/01Ab-sim-after.txt
/workspace/dsw-queue/report/01Ab-sim-before.txt
/workspace/dsw-queue/report/020-heavy-death-status-codex-output.md
/workspace/dsw-queue/report/020-heavy-death-status-codex-report.md
/workspace/dsw-queue/report/020-heavy-death-status-verify.md
/workspace/dsw-queue/report/020-heavy-death-status.md
/workspace/dsw-queue/report/020a-bugfix-town-entry-message-codex-output.md
/workspace/dsw-queue/report/020a-bugfix-town-entry-message-codex-report.md
/workspace/dsw-queue/report/021-heavy-temple-codex-output.md
/workspace/dsw-queue/report/021-heavy-temple-codex-report.md
/workspace/dsw-queue/report/021-heavy-temple-report.md
/workspace/dsw-queue/report/021-heavy-temple-verify.md
/workspace/dsw-queue/report/022-light-lost-roster-codex-output.md
/workspace/dsw-queue/report/022-light-lost-roster-report.md
/workspace/dsw-queue/report/022-light-lost-roster-verify.md
/workspace/dsw-queue/report/023-light-inn-codex-output.md
/workspace/dsw-queue/report/023-light-inn-report.md
/workspace/dsw-queue/report/023-light-inn-verify.md
/workspace/dsw-queue/report/023a-bugfix-inn-dead-levelup-codex-output.md
/workspace/dsw-queue/report/023a-bugfix-inn-dead-levelup-report.md
/workspace/dsw-queue/report/023a-bugfix-inn-dead-levelup-verify.md
/workspace/dsw-queue/report/030-heavy-corpse-on-wipe-codex-output.md
/workspace/dsw-queue/todo/023b-light-early-inn-economy.md
/workspace/dsw-queue/todo/030-heavy-corpse-on-wipe.md
/workspace/dsw-queue/todo/031-heavy-corpse-rescue.md
tests/game.cjs:6:console.log('PASS XP deferred to town, multi-level growth, living refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
tests/game.cjs:75:console.log('PASS three rows, independent member targeting, group spell isolation, hidden exploration controls, medicine effects, slot shifts, battle action/reset, drops and save compatibility');
tests/game.cjs:118:s.enemy=null;s.area='town';let records=partyRecords();if(!setPartyFromRoster(records,[0,1,2,3,4,-1])||s.reserve.length!==1||thiefMember()!==-1)throw Error('bench thief');var all=[...partyRecords(),...s.reserve];if(!setPartyFromRoster(all,[0,1,2,3,4,5])||thiefMember()!==5)throw Error('restore thief');var saved=JSON.stringify(s);s=JSON.parse(saved);ensureProfile();if(s.members.length!==6||equippedWeapon(0).id!=='runestaff')throw Error('reload six');
tests/game.cjs:127:console.log('PASS six-person defaults/migration, reordered jobs and gear, bench/restore/save, doubled survey/accuracy/reset, thief success/failure, front/rear combat and six XP/commands');
tests/game.cjs:137:let savedState=structuredClone(s),savedRandom=Math.random;
tests/game.cjs:162:} finally {s=savedState;Math.random=savedRandom;}
tests/game.cjs:164:drain();run(`{let savedNamesState=structuredClone(s);s.area='town';s.enemy=null;s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.cells[s.pos].chest=null;s.members=[];s.reserve=[];for(let name of ['(','[x','a.b','a*']){let recruit=generateRecruit(name,0);if(!recruit||!registerRecruit(recruit))throw Error('special name register');let roster=trainingRoster(),index=roster.findIndex(r=>r.members.id===recruit.members.id);if(!setPartyFromRoster(roster,[index]))throw Error('special name join');refreshNames();if(coloredLog('テスト').includes('log-ally'))throw Error('unrelated name color');if(coloredLog('aXbの攻撃').includes('log-ally'))throw Error('regex metacharacter interpreted');s.members=[];s.reserve=[];refreshNames();}s=savedNamesState;refreshNames();}`);console.log('PASS special character names do not break log coloring or match as regex');
tests/game.cjs:169:{let savedMonstersState=structuredClone(s);
tests/game.cjs:170:function resetMonstersTest(id){s=structuredClone(savedMonstersState);s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;delete s.cells[s.pos].chest;s.hp=s.members.map(()=>1000);s.mp=s.members.map(()=>100);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.enemy={dataVersion:1,units:[{id,uid:0,row:0,hp:999,identified:true,rewarded:false}],chestBattle:false};displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;resetPartyCommands();s.commands=s.members.map(()=>'fight');}
tests/game.cjs:187:s=structuredClone(savedMonstersState);s.enemy=null;logQueue=[];clearTimeout(logTimer);logTimer=null;displayCombat=undefined;displayVitals=null;
tests/game.cjs:188:}`);console.log('PASS monster floor pools, guardians, flee rewards, mixed victory, summon cap/timing, multi-hit/rear, spell/breath, statuses, instant death, drain, theft, resistances and save migration');
tests/game.cjs:193:run(`var savedPoisonState=structuredClone(s),savedPoisonRandom=Math.random,savedPoisonMode=mode;
tests/game.cjs:220:s=savedPoisonState;Math.random=savedPoisonRandom;mode=savedPoisonMode;refreshNames();`);
tests/game.cjs:225:console.log('PASS magic plans pad to party length and preserve legacy three-member saves');
tests/game.cjs:238:let savedState=structuredClone(s),savedRandom=Math.random;
tests/game.cjs:255:}finally{s=savedState;Math.random=savedRandom;displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;renderShop();}
tests/game.cjs:259:run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[{item:dagger,weight:1}];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
tests/game.cjs:263:drain();run(`{let savedXPState=structuredClone(s);try{
tests/game.cjs:276:}finally{s=savedXPState;}}`);drain();
tests/training.cjs:2:function game(saved=null){
tests/training.cjs:3: let timers=[],els={},storage=saved;
tests/training.cjs:8: return {run:code=>vm.runInContext(code,ctx),saved:()=>storage,drain:()=>{for(let n=0;timers.length;n++){if(n>300)throw Error('timer loop');timers.shift()()}}};
tests/training.cjs:37:g.run("s.gold=1000;buy('helm',0);equip(0,1);s.members[0].xp=50;s.hp[0]-=2;s.inventory[0].push('healingPotion');save();var retained=JSON.stringify(partyRecords()[0]);");
tests/training.cjs:41:let saved=g.saved(),decoded=JSON.parse(saved);assert.equal(decoded.roster.length,7);assert.equal(decoded.partyIds.length,6);assert(!('members'in decoded));
tests/training.cjs:42:g=game(saved);assert.equal(g.run('s.members.length'),6);assert.equal(g.run('s.inventory[0][1]'), 'helm');assert.equal(g.run('effectiveAC(0)'),4);assert.equal(g.run('s.members[0].xp'),50);
tests/training.cjs:43:console.log('PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload');
tests/training.cjs:54:g=game(g.saved());assert.equal(g.run('trainingRoster().length'),0);g.run('enterDungeon()');assert.equal(g.run('s.area'),'town');
tests/training.cjs:55:console.log('PASS deletion including last active member and empty save reload');
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
/bin/bash -lc "rg -n 'defeat|resetDungeon|rosterSaveState|restoreRoster|PARTY_FIELDS|function save|function load|s.done' dist/game.js; cat dist/training.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
16:function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function markDeaths(){s.members.forEach((m,i)=>{if(s.hp[i]<=0&&m.status==='ok')m.status='dead'})}
17:function hurt(n){s.hp=s.hp.map(h=>Math.max(0,h-n));markDeaths();if(s.hp.every(h=>h===0)){defeat()}}
18:function cell(i,action='forward'){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;let c=s.cells[i];if(mode==='flag'){if(!c.open)c.flag=c.flag?false:(s.flagKind||'power');render();return}if(!adjacent(s.pos,i)){log('現在地の上下左右に隣接するマスを選んでください。');render();return}if(c.flag){log('旗のあるマスには移動できない。旗を外すと進めます。');render();return}tickAilments(false);if(s.done){render();return}let previous=s.pos,wasOpen=c.open;s.previousPos=previous;s.pos=i;if(c.type==='boss'&&!s.relic){c.open=true;s.pendingBoss={previous};log('守護者と戦いますか？');render();return}if(!c.open){c.open=true;if(c.trap){if(triggerFloorTrap(c)){render();return}}else log(num(i)?`警告：周囲に罠が${num(i)}個。`:'静かな部屋。周囲に罠はない。')}if(!s.done){if(c.type==='down'){s.pendingStairs='down';log(`地下${s.floor+1}階に移動しますか？`)}else if(c.type==='stairs'){s.pendingStairs=true;log(s.floor===1?'町に移動しますか？':`地下${s.floor-1}階に移動しますか？`)}else if(Math.random()<encounterRate(i,wasOpen,action))encounter(i,!wasOpen,action)}render()}
19:function finish(){s.done=true;log(s.relic?`秘宝を持ち帰った！ 探索成功。金貨 ${s.gold}枚。`:`無事に帰還。金貨 ${s.gold}枚を持ち帰った。`)}const MAX_HP=[32,24,26],NAMES=['戦士','魔法使い','僧侶'];
31:function attack(){if(logBusy()||!s.enemy||s.done)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}identifyEnemies();let cmds=s.commands.slice();log('── ターン開始 ──');for(let i=0;i<s.members.length;i++)if(s.hp[i]>0&&cmds[i]==='guard')log(`${NAMES[i]}は身を守る。`);for(let i=0;i<s.members.length;i++){if(s.hp[i]<=0)continue;if(s.ailments[i].paralysis>0){log(`${NAMES[i]}は麻痺して動けない。`);continue}if(cmds[i]==='guard')continue;if(cmds[i]==='dispel'){dispelUndead(i);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(cmds[i]==='item'){let plan=s.itemPlans[i];if(plan)useMedicine(i,plan.slot,plan.target,true,plan.id);continue}if(cmds[i]==='spell'){let plan=s.magicPlans[i];if(plan){let x=magic(plan.id),t=plan.target;if(x&&(x.target==='enemy'||x.target==='group')&&!validMagicTarget(x,t)){let original=s.enemy.units.find(e=>e.uid===t);t=s.enemy.units.find(e=>e.hp>0&&original&&rowKey(e)===rowKey(original))?.uid??s.enemy.units.find(e=>e.hp>0)?.uid}castMagic(i,plan.id,t)}else log(`${NAMES[i]}の呪文が選ばれていない。`);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(!canWeaponAttack(i)){log(`${NAMES[i]}の近接攻撃は後衛から届かない。`);continue}let e=selectedEnemy(i);if(!e){log(`${NAMES[i]}の攻撃対象の列は全滅している。`);continue;}let d=enemyDefinition(e.id);let result=physicalAttack(i,e);if(!result.hitsCount){log(`${NAMES[i]}の攻撃は${enemyDisplay(e)}にかわされた。`);continue}let damage=flagDamage(result.damage);e.hp=Math.max(0,e.hp-damage);log(`${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。`);if(e.hp===0)killReward(e);if(!s.enemy.units.some(e=>e.hp>0))break}if(!s.enemy.units.some(e=>e.hp>0)){finishMonsterBattle()}else if(s.enemy.initiative==='party'){s.enemy.initiative='normal'}else{enemyTurn(cmds)}resetCommandEntry();resetPartyCommands();if(s.enemy){let next=s.enemy.units.find(e=>e.hp>0);s.attackRows=s.attackRows.map(key=>s.enemy.units.some(e=>String(rowKey(e))===String(key)&&e.hp>0)?key:rowKey(next))}render()}
36:function renderStats(){ $('#partyreorder').disabled=!idle()||s.done; $('#statsbody').innerHTML=s.members.map((_,i)=>{let m=shownMember(i);let values=[['HP',`${(displayVitals?.hp||s.hp)[i]}/${m.maxHP}`],['MP',`${(displayVitals?.mp||s.mp)[i]}/${m.maxMP}`],['STR',m.str],['AC',effectiveAC(i)],['IQ',m.intelligence],['PIE',m.piety],['経験値',m.xp],['NEXT',m.level>=LEVEL_CAP?'上限':Math.max(0,requiredXP(m.level+1,i)-m.xp)]];return `<article class="statcard"><h3>${NAMES[i]} <small>Lv.${m.level} · ${i<3?'前衛':'後衛'}</small>${ailmentTags(i)}</h3><dl class="stat-metrics">${values.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div class="stat-actions"><button data-stat-inventory="${i}" ${!idle()?'disabled':''}>アイテム</button>${hasSpells(i)?`<button data-stat-cast="${i}" ${s.enemy||logBusy()?'disabled':''}>呪文</button>`:''}</div></article>`}).join('')}
47:function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render()}
50:function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
51:function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.members.some(m=>m.status!=='ok')){$('#townnotice').textContent='死亡したメンバーを外してください。';render();return;}$('#townnotice').textContent='';if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
53:function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
100:function move(action){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;if(action==='left'||action==='right'){s.dir=(s.dir+(action==='left'?3:1))%4;render();return}let i=target(({back:2,strafeLeft:-1,strafeRight:1})[action]??0);if(i<0){log('外壁が行く手を塞いでいる。');render();return}mode='move';cell(i,action)}
101:function flag(i){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss||i<0)return;let c=s.cells[i];if(c.open){log('探索済みのマスには旗を立てられません。');render();return}c.flag=c.flag?false:(s.flagKind||'power');render()}
104:function render(){ensureProfile();$('#clearresult').hidden=s.area!=='dungeon'||!s.clearNotice||s.done||logBusy()||!!visibleCombat();$('#cleartown').disabled=!idle();$('#clearchestnotice').hidden=!currentChest();$('#clearedmark').hidden=!s.cleared;$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();$('#maptoggle').hidden=s.area!=='dungeon';if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic?' / 秘宝 ✦':''}`;$('#party').innerHTML=NAMES.map((n,i)=>`${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`).join('');$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${s.pos===i?num(i):c.open?(c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div><button id="flee">逃げる</button>`;$('#flee').onclick=flee;$('#flee').disabled=logBusy()||combat.boss||combat.flagEffect?.bad;renderCommandEntry()}$('#frontflag').disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();scene()}
110:try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type=s.floor<MAX_FLOOR?'down':''}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
122:function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);markDeaths();if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});markDeaths();if(s.hp.every(h=>h===0))defeat()}
124:function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);markDeaths();log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
127:function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
132:function travelFloor(next,fromTown=false){if(!Number.isInteger(next)||next<1||next>MAX_FLOOR)return false;let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.clearNotice=false;s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}
137:function enemyTurn(cmds){for(const e of s.enemy.units.filter(e=>e.hp>0)){if(s.hp.every(h=>h<=0))break;if(e.sleep>0){e.sleep--;log(`${enemyDisplay(e)}は眠っている。`);continue}if(monsterAction(e,cmds))continue;let d=enemyDefinition(e.id);for(let n=0;n<d.swings;n++){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),front=alive.filter(i=>i<3),pool=d.rear||!front.length?alive:front;if(!pool.length)break;let i=pool[Math.random()*pool.length|0];if(!hits(d.hit,effectiveAC(i))){log(`${NAMES[i]}は${enemyDisplay(e)}の攻撃をかわした。`);continue}monsterHurt(i,dice(...d.attack).value,cmds,enemyDisplay(e));if(s.hp[i]>0)monsterOnHit(e,i)}}if(s.hp.every(h=>h===0)){defeat();return}if(!s.enemy.units.some(e=>e.hp>0))finishMonsterBattle()}
141:function flee(){if(logBusy()||!s.enemy||s.done||s.enemy.boss||s.enemy.flagEffect?.bad)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}if(Math.random()*100<escapeChance()){let from=s.pos,to=s.enemy.escapeTo??s.previousPos??s.start;if(!adjacent(from,to)){to=around(from).find(i=>adjacent(from,i)&&s.cells[i].open&&!s.cells[i].trap)??from}s.enemy=null;s.pos=to;s.previousPos=from;log('逃走に成功。一歩前のマスへ戻った。')}else{log('逃走に失敗！');if(s.enemy.initiative==='party')s.enemy.initiative='normal';else enemyTurn(s.members.map(()=>'flee'))}render()}
// UI uses textContent for player names and stable IDs for roster actions.
let recruitDraft=null, previousRecruit=null, pendingDelete=null;
function trainingNotice(text){$('#trainingnotice').textContent=text}
function resetRecruitDraft(){recruitDraft=null;previousRecruit=null;$('#registerrecruit').disabled=true;$('#recruitpreview').replaceChildren()}
function showRecruitPreview(){
 const m=recruitDraft.members, old=previousRecruit?.members;
 $('#recruitpreview').replaceChildren();
 const title=document.createElement('p');title.textContent=`${m.name} · ${CLASSES[m.job].name}　ボーナス ${m.creationBonus}点`;$('#recruitpreview').append(title);
 const grid=document.createElement('dl');grid.className='recruit-metrics';
 for(const [label,key] of [['STR','str'],['IQ','intelligence'],['PIE','piety'],['HP','maxHP'],['MP','maxMP'],['AC','ac']]){
  const item=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;
  const delta=old?m[key]-old[key]:0;dd.textContent=String(m[key])+(old&&key!=='ac'?` (${delta>0?'+':''}${delta})`:'');item.append(dt,dd);grid.append(item);
 }
 $('#recruitpreview').append(grid);const note=document.createElement('p');note.textContent=`Lv.1 / 経験値 0 / NEXT ${m.xpTargets[2]}。括弧内は前回生成との差。`;$('#recruitpreview').append(note);
}
function renderTraining(){
 const list=$('#recruitlist');list.replaceChildren();const roster=trainingRoster();
 $('#trainingcount').textContent=`登録 ${roster.length}人 / パーティ ${s.members.length}/6人。先頭3人が前衛です。`;
 if(!roster.length){const p=document.createElement('p');p.textContent='名前と職業を選んで、最初の冒険者を作成してください。';list.append(p)}
 for(const r of roster){
  const m=r.members,index=s.members.findIndex(x=>x.id===m.id),row=document.createElement('section');row.dataset.recruitId=m.id;
  const title=document.createElement('h4');title.textContent=`${m.name} · ${CLASSES[m.job].name} Lv.${m.level}`;
  const status=document.createElement('p'),ailment={dead:'死亡',ash:'灰',lost:'ロスト'}[m.status];status.textContent=ailment?`${index<0?'控え':`${index+1}番・${index<3?'前衛':'後衛'}`}・${ailment}`:index<0?'控え':`${index+1}番・${index<3?'前衛':'後衛'}`;
  const stats=document.createElement('p');stats.textContent=`STR ${m.str} / IQ ${m.intelligence??10} / PIE ${m.piety??10} / AC ${recruitAC(r)} / HP ${r.hp}/${m.maxHP} / MP ${r.mp}/${m.maxMP} / 経験値 ${m.xp}`;
  row.append(title,status,stats);const actions=document.createElement('div');actions.className='recruit-actions';row.append(actions);
  const button=(text,action,disabled=false)=>{const b=document.createElement('button');b.textContent=text;b.disabled=disabled;b.onclick=action;actions.append(b)};
  button(index<0?'加入':'離脱',()=>{if(changeRecruitParty(m.id,index<0)){trainingNotice(index<0?'パーティに加入しました。':'控えに移しました。');renderTraining()}},index<0&&(s.members.length>=6||m.status==='lost'));
  if(index>=0)for(const [text,offset] of [['前へ',-1],['後ろへ',1]])button(text,()=>{const order=s.members.map((_,i)=>i);[order[index],order[index+offset]]=[order[index+offset],order[index]];reorderParty(order);renderTraining()},index+offset<0||index+offset>=s.members.length);
  button('登録抹消',()=>{pendingDelete=m.id;$('#recruitdeletename').textContent=`${m.name}を登録抹消しますか？装備・所持品も削除され、元に戻せません。`;$('#recruitdeletedialog').showModal()});list.append(row);
 }
}
$('#trainingopen').onclick=()=>{if(s.area!=='town'||!idle())return;resetRecruitDraft();trainingNotice('');renderTraining();$('#training').showModal()};
$('#trainingclose').onclick=()=>$('#training').close();
$('#training').addEventListener('close',resetRecruitDraft);
$('#rollrecruit').onclick=()=>{const record=generateRecruit($('#recruitname').value,+$('#recruitjob').value);if(!record){trainingNotice('名前を入力してください。');return}previousRecruit=recruitDraft;recruitDraft=record;showRecruitPreview();$('#registerrecruit').disabled=false;trainingNotice('能力値を確認して登録してください。')};
for(const id of ['recruitname','recruitjob'])$('#'+id).oninput=resetRecruitDraft;
$('#registerrecruit').onclick=()=>{if(registerRecruit(recruitDraft)){resetRecruitDraft();renderTraining();trainingNotice('控えに登録しました。「加入」でパーティに加えてください。')}};
$('#recruitdeletecancel').onclick=()=>$('#recruitdeletedialog').close();
$('#recruitdeleteconfirm').onclick=()=>{if(deleteRecruit(pendingDelete)){renderTraining();trainingNotice('登録を抹消しました。')}$('#recruitdeletedialog').close()};
$('#recruitdeletedialog').addEventListener('close',()=>{pendingDelete=null});

exec
/bin/bash -lc 'cat dist/training.js; cat tests/training.cjs' in /workspace/dungeonsweeper
 succeeded in 0ms:
// UI uses textContent for player names and stable IDs for roster actions.
let recruitDraft=null, previousRecruit=null, pendingDelete=null;
function trainingNotice(text){$('#trainingnotice').textContent=text}
function resetRecruitDraft(){recruitDraft=null;previousRecruit=null;$('#registerrecruit').disabled=true;$('#recruitpreview').replaceChildren()}
function showRecruitPreview(){
 const m=recruitDraft.members, old=previousRecruit?.members;
 $('#recruitpreview').replaceChildren();
 const title=document.createElement('p');title.textContent=`${m.name} · ${CLASSES[m.job].name}　ボーナス ${m.creationBonus}点`;$('#recruitpreview').append(title);
 const grid=document.createElement('dl');grid.className='recruit-metrics';
 for(const [label,key] of [['STR','str'],['IQ','intelligence'],['PIE','piety'],['HP','maxHP'],['MP','maxMP'],['AC','ac']]){
  const item=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;
  const delta=old?m[key]-old[key]:0;dd.textContent=String(m[key])+(old&&key!=='ac'?` (${delta>0?'+':''}${delta})`:'');item.append(dt,dd);grid.append(item);
 }
 $('#recruitpreview').append(grid);const note=document.createElement('p');note.textContent=`Lv.1 / 経験値 0 / NEXT ${m.xpTargets[2]}。括弧内は前回生成との差。`;$('#recruitpreview').append(note);
}
function renderTraining(){
 const list=$('#recruitlist');list.replaceChildren();const roster=trainingRoster();
 $('#trainingcount').textContent=`登録 ${roster.length}人 / パーティ ${s.members.length}/6人。先頭3人が前衛です。`;
 if(!roster.length){const p=document.createElement('p');p.textContent='名前と職業を選んで、最初の冒険者を作成してください。';list.append(p)}
 for(const r of roster){
  const m=r.members,index=s.members.findIndex(x=>x.id===m.id),row=document.createElement('section');row.dataset.recruitId=m.id;
  const title=document.createElement('h4');title.textContent=`${m.name} · ${CLASSES[m.job].name} Lv.${m.level}`;
  const status=document.createElement('p'),ailment={dead:'死亡',ash:'灰',lost:'ロスト'}[m.status];status.textContent=ailment?`${index<0?'控え':`${index+1}番・${index<3?'前衛':'後衛'}`}・${ailment}`:index<0?'控え':`${index+1}番・${index<3?'前衛':'後衛'}`;
  const stats=document.createElement('p');stats.textContent=`STR ${m.str} / IQ ${m.intelligence??10} / PIE ${m.piety??10} / AC ${recruitAC(r)} / HP ${r.hp}/${m.maxHP} / MP ${r.mp}/${m.maxMP} / 経験値 ${m.xp}`;
  row.append(title,status,stats);const actions=document.createElement('div');actions.className='recruit-actions';row.append(actions);
  const button=(text,action,disabled=false)=>{const b=document.createElement('button');b.textContent=text;b.disabled=disabled;b.onclick=action;actions.append(b)};
  button(index<0?'加入':'離脱',()=>{if(changeRecruitParty(m.id,index<0)){trainingNotice(index<0?'パーティに加入しました。':'控えに移しました。');renderTraining()}},index<0&&(s.members.length>=6||m.status==='lost'));
  if(index>=0)for(const [text,offset] of [['前へ',-1],['後ろへ',1]])button(text,()=>{const order=s.members.map((_,i)=>i);[order[index],order[index+offset]]=[order[index+offset],order[index]];reorderParty(order);renderTraining()},index+offset<0||index+offset>=s.members.length);
  button('登録抹消',()=>{pendingDelete=m.id;$('#recruitdeletename').textContent=`${m.name}を登録抹消しますか？装備・所持品も削除され、元に戻せません。`;$('#recruitdeletedialog').showModal()});list.append(row);
 }
}
$('#trainingopen').onclick=()=>{if(s.area!=='town'||!idle())return;resetRecruitDraft();trainingNotice('');renderTraining();$('#training').showModal()};
$('#trainingclose').onclick=()=>$('#training').close();
$('#training').addEventListener('close',resetRecruitDraft);
$('#rollrecruit').onclick=()=>{const record=generateRecruit($('#recruitname').value,+$('#recruitjob').value);if(!record){trainingNotice('名前を入力してください。');return}previousRecruit=recruitDraft;recruitDraft=record;showRecruitPreview();$('#registerrecruit').disabled=false;trainingNotice('能力値を確認して登録してください。')};
for(const id of ['recruitname','recruitjob'])$('#'+id).oninput=resetRecruitDraft;
$('#registerrecruit').onclick=()=>{if(registerRecruit(recruitDraft)){resetRecruitDraft();renderTraining();trainingNotice('控えに登録しました。「加入」でパーティに加えてください。')}};
$('#recruitdeletecancel').onclick=()=>$('#recruitdeletedialog').close();
$('#recruitdeleteconfirm').onclick=()=>{if(deleteRecruit(pendingDelete)){renderTraining();trainingNotice('登録を抹消しました。')}$('#recruitdeletedialog').close()};
$('#recruitdeletedialog').addEventListener('close',()=>{pendingDelete=null});
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function game(saved=null){
 let timers=[],els={},storage=saved;
 const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});
 const ctx={crypto:require('node:crypto').webcrypto,structuredClone,document:{addEventListener(){},querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el},localStorage:{getItem:()=>storage,setItem:(k,v)=>{storage=v}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math)};
 vm.createContext(ctx);
 for(const f of ['weapons','monster-data','balance','spells','items','flags','traps','combatui','party','monsters','recruits','game'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f+'.js'),'utf8'),ctx);
 return {run:code=>vm.runInContext(code,ctx),saved:()=>storage,drain:()=>{for(let n=0;timers.length;n++){if(n>300)throw Error('timer loop');timers.shift()()}}};
}
let g=game();
assert.equal(g.run('s.members.length'),0);assert.equal(g.run('s.reserve.length'),0);
g.run('enterDungeon()');assert.equal(g.run('s.area'),'town');
console.log('PASS new game starts empty; dungeon blocked');
assert.equal(g.run("generateRecruit('',0)"),null);assert.equal(g.run("generateRecruit('x',4)"),null);
const ids=new Set();
for(let job=0;job<4;job++){
 const values=new Set();
 for(let n=0;n<100;n++){
  const r=g.run(`generateRecruit('冒険者',${job})`),m=r.members;
  assert(!ids.has(m.id));ids.add(m.id);assert.equal(m.level,1);assert.equal(m.xp,0);
  const base=[[12,8,8],[8,12,8],[10,8,12],[10,10,8]][job],stats=[m.str,m.intelligence,m.piety];
  stats.forEach((v,i)=>assert(v>=base[i]&&v<=18));assert.equal(stats.reduce((a,b)=>a+b)-base.reduce((a,b)=>a+b),m.creationBonus);
  assert(m.creationBonus>=3&&m.creationBonus<=9);assert(m.maxHP>=[29,21,23,22][job]&&m.maxHP<=[35,27,29,28][job]);
  assert(m.maxMP>=[0,18,13,0][job]&&m.maxMP<=[0,22,17,0][job]);assert.equal(m.ac,[6,9,7,8][job]);
  assert(m.xpTargets[2]>=Math.round(115*[.8,1.2,1,.85][job]*.9));assert(m.xpTargets[2]<=Math.round(115*[.8,1.2,1,.85][job]*1.1));
  values.add(JSON.stringify(stats)+m.maxHP+','+m.maxMP);
 }
 assert(values.size>1);
}
assert.equal(g.run('trainingRoster().length'),0);
console.log('PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation');
g.run("var recruits=[0,0,0,2,1,3,1].map((job,i)=>generateRecruit('登録'+i,job));recruits.forEach(registerRecruit)");
assert.equal(g.run('s.reserve.length'),7);assert.equal(g.run('registerRecruit(recruits[0])'),false);
g.run('recruits.slice(0,6).forEach(r=>changeRecruitParty(r.members.id,true))');
assert.equal(g.run('s.members.length'),6);assert.equal(g.run('changeRecruitParty(recruits[6].members.id,true)'),false);
assert.equal(g.run('setPartyFromRoster(trainingRoster(),[0,0])'),false);
g.run("s.gold=1000;buy('helm',0);equip(0,1);s.members[0].xp=50;s.hp[0]-=2;s.inventory[0].push('healingPotion');save();var retained=JSON.stringify(partyRecords()[0]);");
assert.equal(g.run('effectiveAC(0)'),4);
g.run('changeRecruitParty(recruits[0].members.id,false)');assert.equal(g.run('JSON.stringify(s.reserve.find(r=>r.members.id===recruits[0].members.id))'),g.run('retained'));
g.run('changeRecruitParty(recruits[0].members.id,true);reorderParty([5,0,1,2,3,4])');assert.equal(g.run('JSON.stringify(partyRecords()[0])'),g.run('retained'));
let saved=g.saved(),decoded=JSON.parse(saved);assert.equal(decoded.roster.length,7);assert.equal(decoded.partyIds.length,6);assert(!('members'in decoded));
g=game(saved);assert.equal(g.run('s.members.length'),6);assert.equal(g.run('s.inventory[0][1]'), 'helm');assert.equal(g.run('effectiveAC(0)'),4);assert.equal(g.run('s.members[0].xp'),50);
console.log('PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload');
g.run('var strength=s.members[0].baseStr;s.members[0].xp=s.members[0].xpTargets[6];levelUp()');assert.equal(g.run('s.members[0].str'),Math.min(18,g.run('strength')+1));
g.run("Math.random=()=>0;monsterOnHit({id:'terror'},0)");assert.equal(g.run('s.members[0].level'),5);assert.equal(g.run('s.members[0].str'),g.run('strength'));
g.drain();g.run('s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));enterDungeon()');g.drain();
assert.equal(g.run('s.area'),'dungeon');assert.equal(g.run('deleteRecruit(s.members[0].id)'),false);
g.run("s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,rewarded:false}],initiative:'party'};s.commands=s.members.map(()=> 'guard');s.commands[0]='fight';s.attackRows=s.members.map(()=>0);Math.random=()=>.999;attack()");g.drain();assert(g.run('s.enemy.units[0].hp')<999);
g.run("var mage=s.members.findIndex(m=>m.job===1),priest=s.members.findIndex(m=>m.job===2);var oldMP=s.mp[mage];castMagic(mage,'halito',0)");g.drain();assert(g.run('s.mp[mage]')<g.run('oldMP'));
g.run("s.hp[0]=1;castMagic(priest,'dios',0)");g.drain();assert(g.run('s.hp[0]')>1);
g.run('s.enemy=null;var oldCells=s.cells;enterTown()');g.drain();assert.equal(g.run('s.area'),'town');assert.equal(g.run('s.cells===oldCells'),false);assert.equal(g.run('trainingRoster().length'),7);
console.log('PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration');
g.run('trainingRoster().map(r=>r.members.id).forEach(deleteRecruit)');assert.equal(g.run('trainingRoster().length'),0);assert.equal(g.run('s.members.length'),0);
g=game(g.saved());assert.equal(g.run('trainingRoster().length'),0);g.run('enterDungeon()');assert.equal(g.run('s.area'),'town');
console.log('PASS deletion including last active member and empty save reload');
g=game();g.run("s.area='town';s.pos=0;var st=[0,1,2].map(i=>generateRecruit('状態'+i,0));st.forEach(registerRecruit);s.reserve[0].members.status='lost';s.reserve[1].members.status='dead';s.reserve[2].members.status='ash'");
assert.equal(g.run('changeRecruitParty(st[0].members.id,true)'),false);assert.equal(g.run('changeRecruitParty(st[1].members.id,true)'),true);assert.equal(g.run('changeRecruitParty(st[2].members.id,true)'),true);
assert.equal(g.run('deleteRecruit(st[0].members.id)'),true);assert.equal(g.run('trainingRoster().some(r=>r.members.id===st[0].members.id)'),false);
console.log('PASS lost recruits cannot join but can be deleted; dead/ash can join');

exec
/bin/bash -lc "sed -n '1,16p' dist/game.js; sed -n '45,55p' dist/game.js; sed -n '120,140p' dist/game.js; rg -n 'partyRecords|PARTY_FIELDS|ensureProfile|setPartyFromRoster|function log|function nextLog' dist/*.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
function enemyDefinition(id){return ENEMIES.find(e=>e.id===id)||ENEMIES[0]}
const UNKNOWN_NAMES=Object.fromEntries(ENEMIES.map(e=>[e.id,e.unknown]));
function enemyDisplay(e){return e?.identified?enemyDefinition(e.id).name:(UNKNOWN_NAMES[e?.id]||'正体不明')}
function identifyEnemies(force=false){if(!s.enemy)return;let chance=Math.min(1,Math.max(0,...s.members.map((m,i)=>s.hp[i]>0?(m.intelligence||0)*.03:0)));for(const g of enemyGroups(s.enemy)){if(!g.units.some(e=>e.hp>0)||g.units.some(e=>e.identified))continue;if(force||Math.random()<chance){for(const e of g.units)e.identified=true}}}
function makeEnemy(id,index){let d=enemyDefinition(id);return {id,uid:index,hp:dice(...d.hp).value,rewarded:false}}
function visibleCombat(){return displayCombat===undefined?s.enemy:displayCombat}
function rowKey(e){return e.row??e.id}
function enemyGroups(combat=s.enemy){return [...new Set(combat.units.filter(e=>!e.rewarded).map(rowKey))].map((key,index)=>{let units=combat.units.filter(e=>rowKey(e)===key);return {key,index,id:units[0].id,units}})}
function attackRowUI(i){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat).filter(g=>g.units.some(e=>!e.rewarded)),chosen=s.attackRows[i];if(!groups.some(g=>String(g.key)===String(chosen)))chosen=groups[0]?.key;return `<label class="attackrow"><span class="sr-only">${NAMES[i]}の攻撃対象の列</span><select data-attack-row="${i}" ${logBusy()||s.commands[i]!=='fight'||s.hp[i]<=0?'disabled':''}>${groups.map(g=>`<option value="${g.key}" ${String(chosen)===String(g.key)?'selected':''}>${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>!e.rewarded).length}</option>`).join('')}</select></label>`}
function encounterRate(i,wasOpen,action='forward'){return (wasOpen ? .10+num(i)*.005 : .16)+(['strafeLeft','strafeRight'].includes(action) ? .01 : 0)}
function rollInitiative(action='forward',boss=false){if(boss)return 'normal';let r=Math.random(),enemyChance=action==='back' ? .12 : .10;if(r<enemyChance)return s.watchful?'normal':'enemy';return r<enemyChance+.10?'party':'normal'}
function encounter(i,unexplored=false,action='forward'){let boss=s.cells[i].type==='boss',formation=monsterFormation(boss),units=[];for(let [row,id] of formation.slice(0,3).entries()){let [min,max]=enemyDefinition(id).groupSize,n=min+(Math.random()*(max-min+1)|0);for(let j=0;j<n;j++)units.push({...makeEnemy(id,units.length),row})}resetCommandEntry();s.attackRows=s.members.map(()=>0);s.enemy={dataVersion:1,flagEffect:flagEffect(),boss,chestBattle:unexplored,lootGold:0,units,target:0,escapeTo:s.previousPos??s.start,initiative:rollInitiative(action,boss)};identifyEnemies();let message={normal:'敵が現れた！',enemy:'敵の奇襲！',party:'敵はまだ気づいていない！'}[s.enemy.initiative];log(message,{encounter:true});if(s.enemy.flagEffect.bad)log('誤った旗がパーティーを惑わせた！');if(s.enemy.initiative==='enemy'){s.enemy.initiative='normal';enemyTurn(s.members.map(()=>'fight'))}}
function answerBoss(yes){if(logBusy()||!s.pendingBoss)return;let pending=s.pendingBoss;s.pendingBoss=null;if(yes)encounter(s.pos);else{s.pos=pending.previous;log('戦闘を避け、一歩前のマスへ戻った。')}render()}
function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function markDeaths(){s.members.forEach((m,i)=>{if(s.hp[i]<=0&&m.status==='ok')m.status='dead'})}
function diceLabel(w){if(w.kind==='medicine')return w.description;if(w.part)return `${{head:"頭",body:"胴体",feet:"足"}[w.part]} AC −${w.ac}`;return `${w.dice[0]}d${w.dice[1]}${w.dice[2]?'+'+w.dice[2]:''}`}
function idle(){return !currentChest()&&!logBusy()&&!s.enemy&&!s.pendingBoss&&!s.pendingStairs}
function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render()}
function innCost(){return s.members.reduce((sum,m)=>sum+(m.status==='ok'?m.level*10:0),0)}
function stayAtInn(kind){if(s.area!=='town'||!idle()||!['stable','room'].includes(kind))return;let cost=kind==='room'?innCost():0;if(s.gold<cost)return false;if(cost)s.gold-=cost;levelUp(s.members.flatMap((m,i)=>m.status==='ok'?[i]:[]));s.mp=s.members.map((m,i)=>m.status==='ok'?m.maxMP:s.mp[i]);if(kind==='room')s.hp=s.members.map((m,i)=>m.status==='ok'?m.maxHP:s.hp[i]);render();$('#inndialog').close();showLevelReport();return true}
function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.members.some(m=>m.status!=='ok')){$('#townnotice').textContent='死亡したメンバーを外してください。';render();return;}$('#townnotice').textContent='';if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop);if(!pool.length)return;let w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
function ailmentTags(i){return visibleAilments(i).map(([kind,label])=>`<span class="ailment-tag ailment-${kind}">${label}</span>`).join('')}
function afflict(i,type){if(type==='poison')s.ailments[i].poison=true;else s.ailments[i].paralysis=4;log(`${NAMES[i]}は${type==='poison'?'毒':'麻痺'}に侵された。`)}
function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);markDeaths();if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});markDeaths();if(s.hp.every(h=>h===0))defeat()}
function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);markDeaths();log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
$('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
$('#chestopen').onclick=()=>openChest(false);

function rememberFloor(){s.floors??={};s.floors[s.floor]={floor:s.floor,size:s.size,cells:structuredClone(s.cells),start:s.start,boss:s.boss,relic:s.relic};}
function travelFloor(next,fromTown=false){if(!Number.isInteger(next)||next<1||next>MAX_FLOOR)return false;let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.clearNotice=false;s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}

function abandonChest(){if(logBusy()||s.enemy||!currentChest())return;delete s.cells[s.pos].chest;log('宝箱を放棄した。');render()}
$('#chestabandon').onclick=abandonChest;

function enemyTurn(cmds){for(const e of s.enemy.units.filter(e=>e.hp>0)){if(s.hp.every(h=>h<=0))break;if(e.sleep>0){e.sleep--;log(`${enemyDisplay(e)}は眠っている。`);continue}if(monsterAction(e,cmds))continue;let d=enemyDefinition(e.id);for(let n=0;n<d.swings;n++){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),front=alive.filter(i=>i<3),pool=d.rear||!front.length?alive:front;if(!pool.length)break;let i=pool[Math.random()*pool.length|0];if(!hits(d.hit,effectiveAC(i))){log(`${NAMES[i]}は${enemyDisplay(e)}の攻撃をかわした。`);continue}monsterHurt(i,dice(...d.attack).value,cmds,enemyDisplay(e));if(s.hp[i]>0)monsterOnHit(e,i)}}if(s.hp.every(h=>h===0)){defeat();return}if(!s.enemy.units.some(e=>e.hp>0))finishMonsterBattle()}

function monsterLevel(e){return enemyDefinition(e.id).level}
function escapeChance(){if(!s.enemy||s.enemy.boss||s.enemy.flagEffect?.bad)return 0;let party=s.members.reduce((a,m,i)=>{if(s.hp[i]>0&&!s.ailments[i].poison&&!s.ailments[i].paralysis){a.total+=m.level;a.count++}return a},{total:0,count:0}),enemies=s.enemy.units.reduce((a,e)=>{if(e.hp>0&&!e.sleep){a.total+=monsterLevel(e);a.count++}return a},{total:0,count:0});if(!party.count)return 10;let bonus=party.count===1?15:party.count===2?10:party.count===3?5:0,partyAverage=party.total/party.count,enemyAverage=enemies.count?enemies.total/enemies.count:0;return Math.max(10,Math.min(95,50+5*(partyAverage-enemyAverage)+bonus))}
dist/game.js:1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
dist/game.js:15:function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
dist/game.js:42:function ensureProfile(){s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.status??=s.area!=='town'&&s.hp[i]<=0?'dead':'ok';m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members){r.members.status??='ok';migrateStrength(r.members,r.members.job??0)}ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
dist/game.js:104:function render(){ensureProfile();$('#clearresult').hidden=s.area!=='dungeon'||!s.clearNotice||s.done||logBusy()||!!visibleCombat();$('#cleartown').disabled=!idle();$('#clearchestnotice').hidden=!currentChest();$('#clearedmark').hidden=!s.cleared;$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();$('#maptoggle').hidden=s.area!=='dungeon';if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic?' / 秘宝 ✦':''}`;$('#party').innerHTML=NAMES.map((n,i)=>`${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`).join('');$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${s.pos===i?num(i):c.open?(c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div><button id="flee">逃げる</button>`;$('#flee').onclick=flee;$('#flee').disabled=logBusy()||combat.boss||combat.flagEffect?.bad;renderCommandEntry()}$('#frontflag').disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();scene()}
dist/game.js:110:try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type=s.floor<MAX_FLOOR?'down':''}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
dist/party.js:6:const PARTY_FIELDS=['members','hp','mp','inventory','equipped','armor','ailments'];
dist/party.js:14: let order=[0,3,4,2,1,5];for(let key of PARTY_FIELDS)s[key]=order.map(i=>s[key][i]);s.partyVersion=1;resetPartyCommands();refreshNames();
dist/party.js:17:function reorderParty(order){if(s.area!=='town'||!idle()||order.length!==s.members.length||new Set(order).size!==order.length||order.some(i=>!Number.isInteger(i)||i<0||i>=s.members.length))return false;for(let key of PARTY_FIELDS)s[key]=order.map(i=>s[key][i]);displayVitals=null;resetPartyCommands();refreshNames();render();return true}
dist/party.js:19:function partyRecords(){return s.members.map((m,i)=>Object.fromEntries(PARTY_FIELDS.map(key=>[key,s[key][i]])))}
dist/party.js:20:function setPartyFromRoster(roster,order){let active=order.filter(i=>i>=0);if(s.area!=='town'||!idle()||active.length>6||new Set(active).size!==active.length||active.some(i=>!Number.isInteger(i)||!roster[i]))return false;for(let key of PARTY_FIELDS)s[key]=active.map(i=>roster[i][key]);s.reserve=roster.filter((r,i)=>!active.includes(i));displayVitals=null;resetPartyCommands();refreshNames();render();return true}
dist/party.js:22:function partyUI(){ $('#tavernopen').onclick=()=>{if(s.area!=='town'||!idle())return;tavernRoster=[...partyRecords(),...(s.reserve||[])];tavernOrder=Array.from({length:6},(_,i)=>i<s.members.length?i:-1);renderTavern();$('#taverndialog').showModal()};$('#tavernclose').onclick=()=>$('#taverndialog').close();$('#tavernslots').onchange=e=>{let slot=Number(e.target.dataset.tavernSlot),id=Number(e.target.value),other=id<0?-1:tavernOrder.indexOf(id);if(!Number.isInteger(slot))return;if(other>=0)tavernOrder[other]=tavernOrder[slot];tavernOrder[slot]=id;renderTavern()};$('#tavernsave').onclick=()=>{if(setPartyFromRoster(tavernRoster,tavernOrder))$('#taverndialog').close()};$('#chestthief').onclick=thiefOpenChest}
dist/party.js:31:function applyPartyOrder(order){if(!idle()||s.done||order.length!==s.members.length||new Set(order).size!==order.length||order.some(i=>!Number.isInteger(i)||i<0||i>=s.members.length))return false;for(let key of PARTY_FIELDS)s[key]=order.map(i=>s[key][i]);displayVitals=null;resetPartyCommands();refreshNames();render();renderStats();return true}
dist/recruits.js:19:function trainingRoster(){return [...partyRecords(),...(s.reserve||[])]}
dist/recruits.js:25: for(const key of PARTY_FIELDS)delete snapshot[key];
dist/recruits.js:33: for(const key of PARTY_FIELDS)state[key]=ids.map(id=>records.get(id)[key]);
dist/recruits.js:50: return setPartyFromRoster(roster,order);
dist/recruits.js:57: return setPartyFromRoster(roster,ids.map(i=>roster.findIndex(r=>r.members.id===i)));

exec
/bin/bash -lc "cat /workspace/dsw-queue/todo/030-heavy-corpse-on-wipe.md; rg -n '全滅|遺体' /workspace/dungeonsweeper-review.md; sed -n '190,223p' tests/game.cjs; rg -n 'defeat|全滅|s.done|tickAilments' tests/*status* tests/*inn*; rg --files tests; command -v chromium; python3 -c 'import playwright'" in /workspace/dungeonsweeper
 exited 1 in 0ms:
# 030-heavy-corpse-on-wipe
ティア：HEAVY　依存：023

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【遺体と救出 手順1/2】全滅時に即町へ戻して全快するのをやめ、遺体を迷宮に残す。

## 変更内容
- データ：`s.corpses = [{id(UUID), floor, cell, records:[訓練所recordの完全コピー], gold}]`。dist/recruits.js `rosterSaveState()/restoreRoster()` で保存・復元（旧セーブは[]）。
- dist/game.js `defeat()`：全員 status 'dead'。s.corpses に {floor:s.floor, cell:s.pos, records:パーティ全員のrecord, gold:s.gold} を追加、s.gold=0。パーティを空にし（控えにも入れない）、町へ（s.done解除、resetDungeon）。
- dist/training.js：訓練所に「迷宮に残された遺体：地下◯階（名前…）」を表示。
- 触らない：救出処理（次の031）、寺院、戦闘。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：全滅→パーティ0人・金貨0・corpses 1件・セーブ/リロードで保持・旧セーブで例外なし。
- 手動：全滅後に町で遺体表示が出ること。
44:- 数値（Lv1戦士、STR補正0、classHit=2）：AC9の敵に 1列目65%／2列目80%／3列目95%。AC5でも 1列目45%→3列目75%。前列が全滅して列が詰まると、同じ敵の命中率が下がる。
59:- 再現：守護者戦をLv1パーティで100戦→1F/2F/3Fすべて勝率99〜100%、3F守護者でもHP損耗22%（通常の3F戦闘はLv1で勝率57%・全滅7%）。
63:### B6【中】全滅にペナルティが無い／帰還で死者が無料復活
64:- 再現：全滅→「町へ戻る」→`enterTown()` で全員HP全快・金貨そのまま・装備そのまま。
110:- 戦闘879〜983回中、**全滅0回**、逃走16〜21回。宝箱650〜700個（戦闘の約7割が宝箱戦）。
115:| パーティLv | 1F 勝率/全滅/死者 | 2F | 3F |
134:8. **全滅・死亡にコストがない**（B6）。
152:検証方法：`/workspace/sim/combat.cjs` と `run.cjs` を `tests/` 外の`scripts/sim/`として取り込み、変更前後で「Lv別×階層別 勝率・全滅率」「探索回数あたり平均Lv」を比較する（codex-tasks.md T-B1）。目標例：その階の推奨Lv（1F:1〜3、2F:4〜6、3F:7〜9、4F:10〜…）で勝率90〜95%・全滅0.5〜2%、推奨Lv−2で全滅5〜10%。
163:- 原作：死亡→寺院で寄付して蘇生（失敗で灰）、灰→蘇生（失敗でロスト＝抹消）。全滅すると死体は迷宮に残り救出隊が必要。
165:- 全滅時：パーティは迷宮に「遺体」として残る（その階のマスに記録）。他の登録冒険者で救出に行くと回収できる。救出しない限り所持金貨は失われる、等。
166:- マインスイーパー統合：**遺体のマスは地図上で旗のようにマークされ、救出隊はそこまで罠を避けて到達する必要**がある。全滅時に旗配置も残すと再挑戦がマインスイーパーの「続き」になる。
202:- 原作は呪文レベル1〜7ごとの回数制。現状のMP制は本作独自として明記済み。移行は大工事なので、まず**蘇生呪文（ディ・カドルト）**、**マピロ・マハマ／ラツマピック（敵の識別）**、**カンディ（遺体の位置）**、**ロクトフェイト（町へ帰還、装備喪失）**、**マポーフィック（AC−2の持続）**、**マカニト・マダルト・ラハリト・モンティノ（沈黙）・バディ（即死）** を追加候補とする。
203:- 統合：カンディ＝遺体マスを地図に表示、ロクトフェイト＝盤面ごと放棄、**デュマピックを「周囲8マスの罠数を1つ確定表示」に強化**するなど、呪文を盤面情報操作として設計。
221:**C18. 町の掲示（ギルガメッシュの酒場）での遺体回収・メンバー交代**：C1と連動。

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

rg: tests/*inn*: No such file or directory (os error 2)
tests/death-status.cjs:73:  ['exploration poison', 's.ailments[0].poison=true;tickAilments(false)', 1],
tests/death-status.cjs:74:  ['battle poison', 's.ailments[0].poison=true;tickAilments()', 1],
tests/death-status.cjs:83:  // Damage and defeat entries must already contain the updated status, not just the final state.
tests/death-status.cjs:87:  if (count === 6 && g.run('s.done')) {
tests/death-status.cjs
tests/temple.cjs
tests/final-boss.cjs
tests/training.cjs
tests/game.cjs
tests/training-browser.py
Traceback (most recent call last):
  File "<string>", line 1, in <module>
    import playwright
ModuleNotFoundError: No module named 'playwright'

codex
全滅処理の直後も、呼び出し元は `s.done` を使って処理を打ち切っています。死亡ログの再生後にパーティーを空にして町へ戻す形にし、ログ中の再読み込みでも遺体が重複・消失しないようにします。

exec
/bin/bash -lc "cat tests/death-status.cjs; cat dist/party.js; tail -n 50 tests/game.cjs; cat dist/traps.js; sed -n '123,139p' dist/game.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');

function party() {
  const g = game(null, () => .5);
  g.run(`[0,1,2,3,1,2,0].forEach((job,i)=>{
    const r=generateRecruit('冒険者'+i,job);registerRecruit(r);
    if(i<6)changeRecruitParty(r.members.id,true);
  });enterDungeon();`);
  g.drain();
  return g;
}
function reload(g) {
  return game(g.run("save();localStorage.getItem('ash-v1')"));
}
function stepLog(g) {
  g.run('clearTimeout(logTimer);logTimer=null;pumpLog();');
}

// Use attack(), log playback, return and the actual tavern handlers end to end.
const combat = party();
combat.run(`s.hp[2]=1;s.mp[1]=0;s.mp[2]=1;
  s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,identified:true}]};
  s.commands=s.members.map(()=> 'guard');Math.random=()=>.999;attack();`);
assert.equal(combat.run('s.hp[2]'), 0);
assert.equal(combat.run('s.members[2].status'), 'dead');
assert.equal(combat.run('ailmentLabel(2)'), '正常', 'death must not leak ahead of the damage log');
assert.equal(combat.run("logQueue.find(e=>e.text.includes('ダメージ')).members[2].status"), 'dead');
while (combat.run("logQueue.length && !logQueue[0].text.includes('ダメージ')")) {
  stepLog(combat);
  assert.equal(combat.run('ailmentLabel(2)'), '正常');
}
stepLog(combat);
assert.equal(combat.run('ailmentLabel(2)'), '死亡');
assert.equal(combat.run('displayVitals.hp[2]'), 0);
combat.drain();
combat.run('s.enemy.units[0].hp=1;s.commands[0]="fight";attack();');
combat.drain();
assert.equal(combat.run('s.enemy'), null);
combat.run(`s.ailments=s.members.map(()=>({poison:true,paralysis:4}));var beforeTownHP=s.hp.slice(),beforeTownMP=s.mp.slice();enterTown();`);
assert.equal(combat.run('s.area'), 'town');
assert.equal(combat.run('s.hp[2]'), 0);
assert.equal(combat.run('s.mp[2]'), 1, 'dead members do not refill MP');
assert.equal(combat.run('s.mp[1]===beforeTownMP[1]'), true, 'town return preserves MP');
assert.equal(combat.run('s.hp.every((h,i)=>h===beforeTownHP[i])'), true, 'town return preserves HP');
assert.equal(combat.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
assert.match(combat.run("$('#party').innerHTML"), /ailment-dead.*死亡/);
const town = reload(combat);
assert.equal(town.run('s.members[2].status'), 'dead');
assert.equal(town.run('s.hp[2]'), 0);
town.run('enterDungeon();');
assert.equal(town.run('s.area'), 'town');
assert.equal(town.run("$('#townnotice').textContent"), '死亡したメンバーを外してください。');
town.drain();
town.run(`var deadId=s.members[2].id;
  $('#tavernopen').onclick();
  $('#tavernslots').onchange({target:{dataset:{tavernSlot:'2'},value:'-1'}});
  $('#tavernsave').onclick();enterDungeon();`);
town.drain();
assert.equal(town.run("$('#townnotice').textContent"), '');
assert.equal(town.run('s.area'), 'dungeon');
assert.equal(town.run('s.reserve.find(r=>r.members.id===deadId).members.status'), 'dead');
assert.equal(reload(town).run("s.reserve.find(r=>r.members.status==='dead').hp"), 0);
console.log('PASS combat death snapshot, town HP/MP policy, death persistence, tavern removal and dungeon reentry');

// Cover every HP-zero path, including both floor-damage branches and party-wide attacks.
for (const [name, action, count] of [
  ['physical damage', "monsterHurt(0,999,s.commands,'敵')", 1],
  ['instant death', "Math.random=()=>0;monsterOnHit({id:'rabbit'},0)", 1],
  ['floor needle', 'Math.random=()=>0;triggerFloorTrap(s.cells[s.pos])', 1],
  ['floor blast', 'Math.random=()=>.3;triggerFloorTrap(s.cells[s.pos])', 6],
  ['chest needle', "Math.random=()=>0;triggerChestTrap({trap:'needle'})", 1],
  ['exploration poison', 's.ailments[0].poison=true;tickAilments(false)', 1],
  ['battle poison', 's.ailments[0].poison=true;tickAilments()', 1],
  ['generic damage', 'hurt(999)', 6],
  ['breath', "Math.random=()=>.2;monsterAction({id:'dragon'},s.commands)", 6],
  ['spell', "Math.random=()=>.2;monsterAction({id:'sorcerer'},s.commands)", 6],
]) {
  const g = party();
  g.run(`s.hp=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');${action};`);
  assert.equal(g.run("s.members.filter(m=>m.status==='dead').length"), count, name);
  assert.equal(g.run("s.hp.every((h,i)=>h>0?s.members[i].status==='ok':s.members[i].status==='dead')"), true, name);
  // Damage and defeat entries must already contain the updated status, not just the final state.
  assert.equal(g.run("logQueue.every(e=>e.hp.every((h,i)=>h>0||e.members[i].status==='dead'))"), true, name);
  g.drain();
  assert.equal(g.run("s.members.every((m,i)=>m.status!=='dead'||ailmentLabel(i)==='死亡')"), true, name);
  if (count === 6 && g.run('s.done')) {
    g.run('enterTown();');
    assert.equal(g.run('s.hp.every(h=>h===0)'), true, 'wipe return cannot resurrect anyone');
    assert.equal(g.run('s.area'), 'town');
  }
}
console.log('PASS HP-zero paths: physical, instant death, floor/chest traps, field/battle poison, hurt, breath and spell');

// Already recorded states never downgrade to dead/ok, including on return or reload.
const states = party();
states.run(`['dead','ash','lost'].forEach((status,i)=>{s.members[i].status=status;s.hp[i]=0;s.mp[i]=0});
  s.ailments=s.members.map(()=>({poison:true,paralysis:4}));markDeaths();enterTown();`);
assert.equal(states.run("s.members.slice(0,3).map(m=>m.status).join()"), 'dead,ash,lost');
assert.equal(states.run('s.hp.slice(0,3).join()'), '0,0,0');
assert.equal(states.run('s.mp.slice(0,3).join()'), '0,0,0');
assert.equal(states.run('[0,1,2].map(ailmentLabel).join()'), '死亡,灰,ロスト');
assert.equal(states.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
for (const i of [0,1,2]) {
  const g = reload(states);
  g.run(`setPartyFromRoster(trainingRoster(),[${i},3]);enterDungeon();`);
  assert.equal(g.run('s.area'), 'town', 'each non-ok state independently blocks entry');
  g.drain();
  g.run('reorderParty([1,0]);');
  assert.equal(g.run('ailmentLabel(1)'), ['死亡','灰','ロスト'][i], 'status follows member identity');
}
states.run("log('状態の記録');s.members[1].status='lost';");
assert.equal(states.run('ailmentLabel(1)'), '灰', 'status display reads the snapshot member');
stepLog(states);
assert.equal(states.run('ailmentLabel(1)'), '灰');
states.drain();
assert.equal(states.run('ailmentLabel(1)'), 'ロスト');
console.log('PASS dead/ash/lost preservation, labels, independent entry blocks, reorder and snapshot display');

// Load actual old ash-v1 payloads, both roster-based and parallel-array formats.
const legacySource = party();
for (const format of ['roster','parallel','three-member']) {
  for (const area of ['town','dungeon']) {
    const legacy = JSON.parse(legacySource.run(format==='roster'
      ? 'JSON.stringify(rosterSaveState())' : 'JSON.stringify(s)'));
    legacy.area = area;
    if (format === 'roster') {
      legacy.roster.forEach(r=>{delete r.members.status;r.hp=0});
    } else {
      legacy.members.forEach(m=>delete m.status);
      legacy.hp.fill(0);
      legacy.reserve.forEach(r=>{delete r.members.status;r.hp=0});
      if (format === 'three-member') {
        delete legacy.partyVersion;
        for (const key of ['members','hp','mp','inventory','equipped','armor','ailments']) legacy[key]=legacy[key].slice(0,3);
      }
    }
    const g = game(JSON.stringify(legacy));
    assert.equal(g.run("s.members.every((m,i)=>m.status===(s.area==='town'||s.hp[i]>0?'ok':'dead'))"), true, `${format} ${area}`);
    assert.equal(g.run("s.reserve.every(r=>r.members.status==='ok')"), true, 'legacy reserve defaults to ok even at HP0');
    const before = g.run('s.members.map(m=>m.status).join()');
    g.run('ensureProfile();');
    assert.equal(g.run('s.members.map(m=>m.status).join()'), before, 'migration is idempotent');
    assert.equal(reload(g).run('s.members.map(m=>m.status).join()'), before);
  }
}
assert.equal(legacySource.run("s.members.every(m=>m.status==='ok')&&s.reserve.every(r=>r.members.status==='ok')"), true);
console.log('PASS new members, old town/dungeon/reserve saves, roster/parallel/three-member migration and reload');
// Member identity and profession are independent of formation position.
function jobOf(i){return s.members[i].job??i}
function memberClass(i){return CLASSES[jobOf(i)]}
function hasSpells(i){return [1,2].includes(jobOf(i))}
function starterWeapon(i){return ['sword','staff','mace','dagger'][jobOf(i)]}
const PARTY_FIELDS=['members','hp','mp','inventory','equipped','armor','ailments'];
function refreshNames(){NAMES.splice(0,NAMES.length,...s.members.map((m,i)=>m.name||memberClass(i).name))}
function ensureSixParty(){
 if(s.partyVersion===1){refreshNames();return}
 s.members.forEach((m,i)=>{m.job??=i;m.id??='member-'+i;m.name??=CLASSES[m.job].name});
 s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.armor??=[{},{},{}];s.ailments??=s.members.map(()=>({poison:false,paralysis:0}));
 s.members[0].name='戦士Ⅰ';
 for(let [job,name] of [[0,'戦士Ⅱ'],[0,'戦士Ⅲ'],[3,'盗賊']]){let c=CLASSES[job],id='member-'+s.members.length;s.members.push({id,job,name,level:1,xp:0,maxHP:c.hp,maxMP:c.mp,attack:c.attack,ac:c.ac});s.hp.push(c.hp);s.mp.push(c.mp);s.inventory.push([['sword','staff','mace','dagger'][job]]);s.equipped.push(0);s.armor.push({});s.ailments.push({poison:false,paralysis:0})}
 let order=[0,3,4,2,1,5];for(let key of PARTY_FIELDS)s[key]=order.map(i=>s[key][i]);s.partyVersion=1;resetPartyCommands();refreshNames();
}
function resetPartyCommands(){s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.magicPlans=s.members.map(()=>null);s.itemPlans=s.members.map(()=>null);s.attackRows=s.members.map(()=>0);resetCommandEntry()}
function reorderParty(order){if(s.area!=='town'||!idle()||order.length!==s.members.length||new Set(order).size!==order.length||order.some(i=>!Number.isInteger(i)||i<0||i>=s.members.length))return false;for(let key of PARTY_FIELDS)s[key]=order.map(i=>s[key][i]);displayVitals=null;resetPartyCommands();refreshNames();render();return true}
let tavernOrder=[],tavernRoster=[];
function partyRecords(){return s.members.map((m,i)=>Object.fromEntries(PARTY_FIELDS.map(key=>[key,s[key][i]])))}
function setPartyFromRoster(roster,order){let active=order.filter(i=>i>=0);if(s.area!=='town'||!idle()||active.length>6||new Set(active).size!==active.length||active.some(i=>!Number.isInteger(i)||!roster[i]))return false;for(let key of PARTY_FIELDS)s[key]=active.map(i=>roster[i][key]);s.reserve=roster.filter((r,i)=>!active.includes(i));displayVitals=null;resetPartyCommands();refreshNames();render();return true}
function renderTavern(){ $('#tavernslots').innerHTML=tavernOrder.map((id,slot)=>`<label>${slot<3?'前衛':'後衛'} ${slot%3+1}<select data-tavern-slot="${slot}"><option value="-1" ${id<0?'selected':''}>空き</option>${tavernRoster.map((r,i)=>`<option value="${i}" ${id===i?'selected':''}>${r.members.name} · Lv.${r.members.level}</option>`).join('')}</select></label>`).join('');$('#tavernsave').disabled=false}
function partyUI(){ $('#tavernopen').onclick=()=>{if(s.area!=='town'||!idle())return;tavernRoster=[...partyRecords(),...(s.reserve||[])];tavernOrder=Array.from({length:6},(_,i)=>i<s.members.length?i:-1);renderTavern();$('#taverndialog').showModal()};$('#tavernclose').onclick=()=>$('#taverndialog').close();$('#tavernslots').onchange=e=>{let slot=Number(e.target.dataset.tavernSlot),id=Number(e.target.value),other=id<0?-1:tavernOrder.indexOf(id);if(!Number.isInteger(slot))return;if(other>=0)tavernOrder[other]=tavernOrder[slot];tavernOrder[slot]=id;renderTavern()};$('#tavernsave').onclick=()=>{if(setPartyFromRoster(tavernRoster,tavernOrder))$('#taverndialog').close()};$('#chestthief').onclick=thiefOpenChest}
function thiefMember(){return s.members.findIndex((m,i)=>jobOf(i)===3&&s.hp[i]>0&&!s.ailments[i].paralysis)}
function thiefOpenChest(){let c=currentChest(),i=thiefMember();if(!c||i<0||logBusy()||s.enemy||s.done)return;fixChestTrap(c);if(Math.random()<.85){log(NAMES[i]+'が宝箱の罠を解除した。');rewardChest(c)}else{c.opened=true;log(NAMES[i]+'は宝箱の解除に失敗した！');triggerChestTrap(c);delete s.cells[s.pos].chest;log('宝箱は失われた。')}render()}

function renderEquipmentSummary(i){$('#equipmentsummary').innerHTML=[['武器',s.equipped[i]],['頭',s.armor[i].head],['胴体',s.armor[i].body],['足',s.armor[i].feet]].map(([label,slot])=>`<div><small>${label}</small><b>${weapon(s.inventory[i][slot])?.name||'−'}</b></div>`).join('')}
function renderTransfer(i){let slots=s.inventory[i].map((id,slot)=>({id,slot})).filter(x=>!isEquipped(i,x.slot));$('#transferitem').innerHTML=slots.map(x=>`<option value="${x.slot}">${x.slot+1}. ${weapon(x.id).name}</option>`).join('');$('#transfermember').innerHTML=NAMES.map((name,j)=>j===i?'':`<option value="${j}" ${s.inventory[j].length>=10?'disabled':''}>${name} (${s.inventory[j].length}/10)</option>`).join('');$('#transfergive').disabled=!idle()||!slots.length||!s.inventory.some((a,j)=>j!==i&&a.length<10);$('#transfernotice').textContent=slots.length?'':'装備中のアイテムは渡せません。'}
function transferItem(from,slot,to){if(!idle()||s.done||![from,slot,to].every(Number.isInteger)||from===to||!s.inventory[from]?.[slot]||!s.inventory[to]||s.inventory[to].length>=10||isEquipped(from,slot))return false;let id=s.inventory[from][slot];removeInventorySlot(from,slot);s.inventory[to].push(id);render();renderInventory();$('#transfernotice').textContent=`${NAMES[to]}に${weapon(id).name}を渡した。`;return true}
let partyOrderDraft=[];
function renderPartyOrder(){ $('#partyorder').innerHTML=partyOrderDraft.map((id,slot)=>`<label>${slot<3?'前衛':'後衛'} ${slot%3+1}<select data-party-position="${slot}">${NAMES.map((name,i)=>`<option value="${i}" ${id===i?'selected':''}>${name}</option>`).join('')}</select></label>`).join('')+'<button id="partyordersave">この順番にする</button> <button id="partyordercancel">キャンセル</button>';$('#partyordersave').onclick=()=>{if(applyPartyOrder(partyOrderDraft))$('#partyorder').hidden=true};$('#partyordercancel').onclick=()=>$('#partyorder').hidden=true}
function applyPartyOrder(order){if(!idle()||s.done||order.length!==s.members.length||new Set(order).size!==order.length||order.some(i=>!Number.isInteger(i)||i<0||i>=s.members.length))return false;for(let key of PARTY_FIELDS)s[key]=order.map(i=>s[key][i]);displayVitals=null;resetPartyCommands();refreshNames();render();renderStats();return true}
function inventoryPartyUI(){ $('#transfergive').onclick=()=>transferItem(inventoryMember,+$('#transferitem').value,+$('#transfermember').value);$('#partyreorder').onclick=()=>{if(!idle()||s.done)return;partyOrderDraft=s.members.map((m,i)=>i);renderPartyOrder();$('#partyorder').hidden=false};$('#partyorder').onchange=e=>{let slot=Number(e.target.dataset.partyPosition),id=Number(e.target.value);if(!Number.isInteger(slot)||slot<0||slot>=partyOrderDraft.length)return;let other=partyOrderDraft.indexOf(id);if(other<0)return;[partyOrderDraft[slot],partyOrderDraft[other]]=[partyOrderDraft[other],partyOrderDraft[slot]];renderPartyOrder()};$('#statsdialog').addEventListener('close',()=>$('#partyorder').hidden=true)}

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
  if(!chestItemPool(4).some(x=>x.item.id==='knightsword')||chestItemPool(1).some(x=>x.item.id==='knightsword'))throw Error('equipment minFloor pool');
  s.members[0].job=0;s.members[0].level=1;s.members[0].str=10;s.inventory[0]=['flamesword'];s.equipped[0]=0;
  s.enemy={units:[{id:'slime',uid:0,row:0,hp:100,rewarded:false}]};Math.random=()=>.525;
  let result=physicalAttack(0,s.enemy.units[0]);if(result.hitsCount!==1)throw Error('weapon hitBonus not applied');
}finally{s=savedState;Math.random=savedRandom;displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;renderShop();}
}`);
console.log('PASS expanded equipment ids, shop:false gate, floor loot gates, and hitBonus');

run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[{item:dagger,weight:1}];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
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

// 10-floor trap configuration and scaling regression.
drain();run(`if(trapPower(1)!==1||trapPower(5)!==2||trapPower(10)!==3.25||trapPower(11)!==3.25)throw Error('trap power bounds');for(let f=1;f<=10;f++){fresh(f);if(size()!==Math.min(12,6+2*f)||trapCount(f,size())!==[9,15,23,24,26,27,29,30,31,31][f-1])throw Error('floor config '+f)}s.members=s.members.slice(0,1);s.hp=[100];s.ailments=[{poison:false,paralysis:0}];Math.random=()=>0;s.floor=1;let needle=s.cells[s.pos];needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-7)throw Error('floor 1 needle baseline');s.hp[0]=100;s.floor=10;needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('floor 10 needle scaling');s.hp[0]=100;triggerChestTrap({trap:'needle'});if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('chest needle scaling');`);drain();console.log('PASS 10-floor trap configuration and scaling');

require('./final-boss.cjs');

require('./death-status.cjs');
require('./temple.cjs');
const FLOOR_TRAPS=[{id:'needle',name:'針',weight:25},{id:'blast',name:'爆発',weight:25},{id:'poison',name:'毒霧',weight:20},{id:'paralysis',name:'麻痺の針',weight:15},{id:'teleport',name:'転移',weight:15}];
function triggerFloorTrap(c){log('罠だ！',{trap:true});let roll=Math.random()*100,t=FLOOR_TRAPS.find(t=>(roll-=t.weight)<0)||FLOOR_TRAPS[0];c.trap=false;c.spent=true;c.trapKind=t.id;let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;displayVitals??={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};
 if(t.id==='needle'){let n=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-n);markDeaths();log(`針の罠！ ${NAMES[i]}に${n}ダメージ。`)}
 else if(t.id==='blast'){let n=Math.max(1,Math.floor(dice(2,6,3).value*trapPower(s.floor)));for(let j of alive)s.hp[j]=Math.max(0,s.hp[j]-n);markDeaths();log(`爆発の罠！ 全員に${n}ダメージ。`)}
 else if(t.id==='poison'){log('毒霧の罠！ 毒霧が噴き出した。');for(let j of alive)afflict(j,'poison')}
 else if(t.id==='paralysis'){log('麻痺の針の罠！ 針が飛び出した。');afflict(i,'paralysis')}
 else {let candidates=s.cells.map((v,j)=>j!==s.pos&&!v.type&&!v.trap&&!v.flag&&!v.chest?j:-1).filter(j=>j>=0);if(candidates.length){s.previousPos=s.pos;s.pos=candidates[Math.random()*candidates.length|0];s.cells[s.pos].open=true;log('転移の罠！ 一行は別の部屋に飛ばされた。');log(`警告：周囲に罠が${num(s.pos)}個。`)}else log('転移の罠は不発に終わった。')}
 if(s.hp.every(h=>h===0))defeat();return t.id==='teleport';
}
function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);markDeaths();log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
$('#chestcalfo').onclick=()=>{let i=calfoCaster();if(i>=0&&!logBusy()){castMagic(i,'calfo',null);render()}};
$('#chestopen').onclick=()=>openChest(false);

function rememberFloor(){s.floors??={};s.floors[s.floor]={floor:s.floor,size:s.size,cells:structuredClone(s.cells),start:s.start,boss:s.boss,relic:s.relic};}
function travelFloor(next,fromTown=false){if(!Number.isInteger(next)||next<1||next>MAX_FLOOR)return false;let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.clearNotice=false;s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}

function abandonChest(){if(logBusy()||s.enemy||!currentChest())return;delete s.cells[s.pos].chest;log('宝箱を放棄した。');render()}
$('#chestabandon').onclick=abandonChest;

function enemyTurn(cmds){for(const e of s.enemy.units.filter(e=>e.hp>0)){if(s.hp.every(h=>h<=0))break;if(e.sleep>0){e.sleep--;log(`${enemyDisplay(e)}は眠っている。`);continue}if(monsterAction(e,cmds))continue;let d=enemyDefinition(e.id);for(let n=0;n<d.swings;n++){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),front=alive.filter(i=>i<3),pool=d.rear||!front.length?alive:front;if(!pool.length)break;let i=pool[Math.random()*pool.length|0];if(!hits(d.hit,effectiveAC(i))){log(`${NAMES[i]}は${enemyDisplay(e)}の攻撃をかわした。`);continue}monsterHurt(i,dice(...d.attack).value,cmds,enemyDisplay(e));if(s.hp[i]>0)monsterOnHit(e,i)}}if(s.hp.every(h=>h===0)){defeat();return}if(!s.enemy.units.some(e=>e.hp>0))finishMonsterBattle()}

function monsterLevel(e){return enemyDefinition(e.id).level}

exec
/bin/bash -lc "rg --files -g '*report*' -g '*030*'; sed -n '34,44p' dist/game.js; cat scripts/sim/harness.cjs; rg -n 'const |let ' dist/game.js | tail -n 12" in /workspace/dungeonsweeper
 succeeded in 0ms:
function maxHP(i){return s.members[i].maxHP}
function levelUp(indices=s.members.map((_,i)=>i)){let reports=[];indices.forEach(i=>{let m=s.members[i];if(!m)return;let old={...m};while(m.level<LEVEL_CAP&&m.xp>=requiredXP(m.level+1,i)){m.level++;m.maxHP+=dice(...memberClass(i).hpGrowth).value;m.maxMP+=dice(...memberClass(i).mpGrowth).value;m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));let learned=learnMagic(i,m.level);if(learned.length)reports.push(`${NAMES[i]}は${learned.join("・")}を習得した。`);}if(m.level!==old.level)reports.push(`${NAMES[i]} Lv.${old.level} → ${m.level}　HP +${m.maxHP-old.maxHP} / MP +${m.maxMP-old.maxMP} / STR +${m.str-(old.str??strengthFor(jobOf(i),old.level))}`)});s.levelReport=reports}
function renderStats(){ $('#partyreorder').disabled=!idle()||s.done; $('#statsbody').innerHTML=s.members.map((_,i)=>{let m=shownMember(i);let values=[['HP',`${(displayVitals?.hp||s.hp)[i]}/${m.maxHP}`],['MP',`${(displayVitals?.mp||s.mp)[i]}/${m.maxMP}`],['STR',m.str],['AC',effectiveAC(i)],['IQ',m.intelligence],['PIE',m.piety],['経験値',m.xp],['NEXT',m.level>=LEVEL_CAP?'上限':Math.max(0,requiredXP(m.level+1,i)-m.xp)]];return `<article class="statcard"><h3>${NAMES[i]} <small>Lv.${m.level} · ${i<3?'前衛':'後衛'}</small>${ailmentTags(i)}</h3><dl class="stat-metrics">${values.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div class="stat-actions"><button data-stat-inventory="${i}" ${!idle()?'disabled':''}>アイテム</button>${hasSpells(i)?`<button data-stat-cast="${i}" ${s.enemy||logBusy()?'disabled':''}>呪文</button>`:''}</div></article>`}).join('')}
function showLevelReport(){if(!s.levelReport?.length)return;$('#levelreport').textContent=s.levelReport.join('\n');if(!$('#leveldialog').open)$('#leveldialog').showModal()}
function canWeaponAttack(i){return i<3||equippedWeapon(i)?.range==='ranged'}
function itemDescription(w){return diceLabel(w)+(w.dice?' · '+(w.range==='ranged'?'遠距離':'近距離'):'')}
function renderCatalog(){ $('#catalogbody').innerHTML=`<table><thead><tr><th>敵</th><th>HP</th><th>攻撃</th><th>AC</th><th>経験値</th><th>群れ</th><th>金貨</th></tr></thead><tbody>${ENEMIES.map(e=>`<tr><td>${e.name}</td><td>${diceLabel({dice:e.hp})}</td><td>${diceLabel({dice:e.attack})}</td><td>${e.ac}</td><td>${e.xp}</td><td>${e.groupSize.join("〜")}体</td><td>${diceLabel({dice:e.gold})} ÷3（切捨）</td></tr>`).join('')}</tbody></table>`}
function drawEnemies(){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat),height=Math.min(130,260/groups.length);return groups.map((g,row)=>{let y=62+row*height;let visible=g.units.filter(e=>!e.rewarded);return visible.map((e,col)=>{if(e.rewarded)return '';let width=Math.min(108,560/visible.length-8),x=320+(col-(visible.length-1)/2)*(width+8);return `<g data-enemy-uid="${e.uid}"><rect x="${x-width/2}" y="${y}" width="${width}" height="${height-9}" rx="6" fill="#20271f" stroke="#66725d"/><text x="${x}" y="${y+height*.65}" text-anchor="middle" fill="#dac595" font-size="52">${enemyDefinition(e.id).icon}</text><text x="${x}" y="${y+height-18}" text-anchor="middle" fill="#dac595" font-size="16">${e.sleep>0?'Zzz':''}</text></g>`}).join('')}).join('')}
function ensureProfile(){s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.status??=s.area!=='town'&&s.hp[i]<=0?'dead':'ok';m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members){r.members.status??='ok';migrateStrength(r.members,r.members.job??0)}ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
function weapon(id){return WEAPONS.find(w=>w.id===id)||MEDICINES.find(w=>w.id===id)}
function equippedWeapon(i){return weapon(s.inventory[i][s.equipped[i]])}
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
140:function escapeChance(){if(!s.enemy||s.enemy.boss||s.enemy.flagEffect?.bad)return 0;let party=s.members.reduce((a,m,i)=>{if(s.hp[i]>0&&!s.ailments[i].poison&&!s.ailments[i].paralysis){a.total+=m.level;a.count++}return a},{total:0,count:0}),enemies=s.enemy.units.reduce((a,e)=>{if(e.hp>0&&!e.sleep){a.total+=monsterLevel(e);a.count++}return a},{total:0,count:0});if(!party.count)return 10;let bonus=party.count===1?15:party.count===2?10:party.count===3?5:0,partyAverage=party.total/party.count,enemyAverage=enemies.count?enemies.total/enemies.count:0;return Math.max(10,Math.min(95,50+5*(partyAverage-enemyAverage)+bonus))}
141:function flee(){if(logBusy()||!s.enemy||s.done||s.enemy.boss||s.enemy.flagEffect?.bad)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}if(Math.random()*100<escapeChance()){let from=s.pos,to=s.enemy.escapeTo??s.previousPos??s.start;if(!adjacent(from,to)){to=around(from).find(i=>adjacent(from,i)&&s.cells[i].open&&!s.cells[i].trap)??from}s.enemy=null;s.pos=to;s.previousPos=from;log('逃走に成功。一歩前のマスへ戻った。')}else{log('逃走に失敗！');if(s.enemy.initiative==='party')s.enemy.initiative='normal';else enemyTurn(s.members.map(()=>'flee'))}render()}
146: const foes=[...ENEMIES.flatMap(e=>[e.name,e.unknown]),'毒スライム','亡霊騎士','地獄の猟犬','オーク戦士','深層の魔将'];
147: const spells=MAGIC.map(x=>x.name);
148: const flagNames=Object.values(FLAG_NAMES);const names=[...foes,...NAMES,...spells,...flagNames].filter(Boolean).sort((a,b)=>b.length-a.length);
149: const escape=t=>t.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
150: const pattern=new RegExp(names.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')+'|\\d+(?:\\.\\d+)?(?:ダメージ|回復)','g');
151: let result='',last=0;
152: for(const match of text.matchAll(pattern)){
153:  const word=match[0],at=match.index;
154:  const kind=flagNames.includes(word)?'flag-'+Object.keys(FLAG_NAMES).find(k=>FLAG_NAMES[k]===word):foes.includes(word)?'enemy':NAMES.includes(word)?'ally':spells.includes(word)?'spell':word.endsWith('回復')?'heal':'damage';
162:$('#innopen').onclick=()=>{let cost=innCost();$('#inncost').textContent=`普通の部屋：${cost} G（正常な冒険者の Lv × 10 G の合計）　所持金：${s.gold} G`;$('#stable').disabled=!s.members.some(m=>m.status==='ok');$('#room').disabled=!s.members.some(m=>m.status==='ok')||s.gold<cost;$('#room').textContent=`普通の部屋に泊まる（${cost} G）`;$('#inndialog').showModal()};

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('dist/game.js')
s=p.read_text()
s=s.replace('reserve:s.reserve,dumapicUses:', 'reserve:s.reserve,corpses:s.corpses,dumapicUses:',1)
s=s.replace(\"area:'dungeon',cleared:false,clearNotice:false\", \"area:'dungeon',corpses:[],cleared:false,clearNotice:false\",1)
s=s.replace('displayCombat=undefined;render();return}let entry=logQueue.shift()', 'displayCombat=undefined;if(s.defeatPending){finishDefeat();return}render();return}let entry=logQueue.shift()',1)
s=s.replace('function ensureProfile(){s.cleared??=false;', 'function ensureProfile(){s.corpses??=[];s.cleared??=false;',1)
s=s.replace(\"function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}\", \"\"\"function defeat(){
 if(s.defeatPending||"'!s.members.length)return;
 s.members.forEach((m,i)=>{m.status='"'dead';s.hp[i]=0});
 (s.corpses??=[]).push({id:crypto.randomUUID(),floor:s.floor,cell:s.pos,records:structuredClone(partyRecords()),gold:s.gold});
 s.gold=0;s.defeatPending=true;s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;
 // Keep the party visible until its queued damage/death snapshots have played.
 log('一行は全滅した。遺体は迷宮に残された。町で態勢を立て直そう。');save();
}
function finishDefeat(){
 if("'!s.defeatPending)return;
 for(const key of PARTY_FIELDS)s[key]=[];
 delete s.defeatPending;s.done=false;s.light=false;s.watchful=false;s.dumapicUses=0;s.levelReport=[];
 resetPartyCommands();resetDungeon();render();
}""",1)
needle="render()}'"\\n\"
# Resume a saved wipe after startup migration; queued logs themselves are not persisted.
lines=s.splitlines(keepends=True)
for i,line in enumerate(lines):
 if line.startswith('try{s=restoreRoster('):
  lines.insert(i+1,'if(s.defeatPending)finishDefeat();\\n')
  break
else: raise RuntimeError('startup not found')
p.write_text(''.join(lines))
p=Path('dist/recruits.js');s=p.read_text()
s=s.replace('const records=trainingRoster(), seen=new Set();','const records=s.defeatPending?(s.reserve||[]):trainingRoster(), seen=new Set();',1)
s=s.replace('roster:records,partyIds:s.members.map(m=>m.id)', 'roster:records,partyIds:s.defeatPending?[]:s.members.map(m=>m.id),corpses:structuredClone(s.corpses||[])',1)
s=s.replace(\"function restoreRoster(state) {\\n\", \"function restoreRoster(state) {\\n if(state)state.corpses??=[];\\n\",1)
p.write_text(s)
p=Path('dist/training.js');s=p.read_text()
s=s.replace(\" const list="'$('"'#recruitlist');list.replaceChildren();const roster=trainingRoster();\", \"\"\" const list="'$('"'#recruitlist');list.replaceChildren();const roster=trainingRoster();
 for(const corpse of s.corpses||[]){
  const p=document.createElement('p');p.textContent="'`迷宮に残された遺体：地下${corpse.floor}階（${corpse.records.map(r=>r.members.name).join('"'、')}）"'`;list.append(p);
 }""",1)
p.write_text(s)
PY' in /workspace/dungeonsweeper
 succeeded in 0ms:
exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('tests/training.cjs');s=p.read_text()
s=s.replace(\"const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},\", \"const el=()=>({style:{},dataset:{},children:[],setAttribute(){},addEventListener(){},append(...items){this.children.push(...items)},replaceChildren(...items){this.children=items},\",1)
s=s.replace(\"'monsters','recruits','game']\", \"'monsters','recruits','game','training']\",1)
p.write_text(s)
PY" in /workspace/dungeonsweeper
 succeeded in 0ms:
apply patch
patch: completed
/workspace/dungeonsweeper/tests/training.cjs
diff --git a/tests/training.cjs b/tests/training.cjs
index c7d23334a7860f5f064e511d1f4ac4893031ca8b..9c44e264c8f18ece4519148b683537cb8c1a2ac1
--- a/tests/training.cjs
+++ b/tests/training.cjs
@@ -57,3 +57,113 @@
 assert.equal(g.run('changeRecruitParty(st[0].members.id,true)'),false);assert.equal(g.run('changeRecruitParty(st[1].members.id,true)'),true);assert.equal(g.run('changeRecruitParty(st[2].members.id,true)'),true);
 assert.equal(g.run('deleteRecruit(st[0].members.id)'),true);assert.equal(g.run('trainingRoster().some(r=>r.members.id===st[0].members.id)'),false);
 console.log('PASS lost recruits cannot join but can be deleted; dead/ash can join');
+
+// Wipes must preserve complete records separately from the playable roster.
+function corpseParty(count=6){
+ const g=game();
+ g.run(`Math.random=()=>.5;[3,2,0,1,0,2,1].slice(0,${count+1}).forEach((job,i)=>{
+  const r=generateRecruit('遺体'+i,job);registerRecruit(r);if(i<${count})changeRecruitParty(r.members.id,true);
+ });enterDungeon();`);
+ g.drain();return g;
+}
+g=corpseParty();
+g.run(`fresh(3);s.pos=17;s.gold=321;s.cleared=true;s.light=true;s.watchful=true;s.dumapicUses=4;
+ s.inventory[0].push('helm','healingPotion');s.armor[0].head=1;s.members[0].xp=123;
+ s.members[0].extra={history:[1,2]};s.mp[1]=3;s.ailments[0]={poison:true,paralysis:2};
+ var reserveBefore=JSON.stringify(s.reserve),recordsBefore=structuredClone(partyRecords());
+ recordsBefore.forEach(r=>{r.hp=0;r.members.status='dead'});
+ log('全滅直前');hurt(999);`);
+assert.equal(g.run('s.corpses.length'),1);
+assert.equal(g.run('s.gold'),0);
+assert.equal(g.run('s.corpses[0].floor'),3);
+assert.equal(g.run('s.corpses[0].cell'),17);
+assert.equal(g.run('s.corpses[0].gold'),321);
+assert.match(g.run('s.corpses[0].id'),/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
+assert.equal(g.run('JSON.stringify(s.corpses[0].records)===JSON.stringify(recordsBefore)'),true);
+assert.equal(g.run("displayVitals.hp.every(h=>h>0)&&displayVitals.members.every(m=>m.status==='ok')"),true,'death must not leak before its log');
+assert.equal(g.run("logQueue.at(-1).hp.every(h=>h===0)&&logQueue.at(-1).members.every(m=>m.status==='dead')"),true);
+g.run('defeat();');assert.equal(g.run('s.corpses.length'),1,'repeated defeat must not duplicate corpses');
+const duringWipe=g.saved();
+assert.equal(JSON.parse(duringWipe).partyIds.length,0);
+assert.equal(JSON.parse(duringWipe).roster.length,1,'pending wipe save contains only the existing reserve');
+g.drain();
+function assertWipeTown(g){
+ assert.equal(g.run('s.area'),'town');assert.equal(g.run('s.done'),false);
+ assert.equal(g.run('s.members.length'),0);assert.equal(g.run('s.gold'),0);
+ assert.equal(g.run('PARTY_FIELDS.every(key=>s[key].length===0)'),true);
+ assert.equal(g.run('s.enemy'),null);assert.equal(g.run('s.pendingStairs'),false);
+ assert.equal(g.run('s.pendingBoss'),null);assert.equal(g.run('idle()'),true);
+ assert.equal(g.run('Object.keys(s.floors).length'),0);
+ assert.equal(g.run('s.cells.some(c=>c.open)'),false);
+ assert.equal(g.run('s.light||s.watchful||s.dumapicUses>0'),false);
+ assert.equal(g.run("$('#entrance').disabled"),true);
+}
+assertWipeTown(g);
+assert.equal(g.run('JSON.stringify(s.reserve)===reserveBefore'),true);
+assert.equal(g.run('s.cleared'),true);
+g.run("s.corpses[0].records[0].members.name='遺体(<印>)';renderTraining();");
+assert.equal(g.run("$('#recruitlist').children[0].textContent"),'迷宮に残された遺体：地下3階（遺体(<印>)、遺体1、遺体2、遺体3、遺体4、遺体5）');
+assert.equal(g.run("$('#recruitlist').children[0].innerHTML"),undefined,'names must be rendered as text');
+const corpses=g.run('JSON.stringify(s.corpses)');
+g.run("recordsBefore[0].members.extra.history.push(9);recordsBefore[0].inventory.push('sword');save();");
+assert.equal(g.run('JSON.stringify(s.corpses)'),corpses,'corpse records must be independent copies');
+let restored=game(g.saved());assertWipeTown(restored);
+assert.equal(restored.run('JSON.stringify(s.corpses)'),corpses);
+restored=game(duringWipe);assertWipeTown(restored);
+assert.equal(restored.run('s.corpses.length'),1);
+assert.equal(restored.run('s.reserve.length'),1);
+assert.equal(restored.run("s.corpses[0].records.every(r=>r.members.status==='dead'&&r.hp===0)"),true);
+restored=game(restored.saved());assertWipeTown(restored);
+assert.equal(restored.run('s.corpses.length'),1,'reloading completed wipe must not create another corpse');
+console.log('PASS wipe snapshots, UUID/location/gold, complete corpse records, empty party, reserve isolation, training text and reload during/after logs');
+
+// Corpses survive new labyrinths and additional wipes without entering the reserve.
+g.run('var firstCorpse=JSON.stringify(s.corpses[0]);changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();');g.drain();
+g.run('travelFloor(2,true);'); // An unvisited floor is rejected; use fresh to set up floor 2.
+g.drain();g.run('fresh(2);s.pos=10;s.gold=45;hurt(999);');g.drain();
+assertWipeTown(g);assert.equal(g.run('s.corpses.length'),2);
+assert.equal(g.run('JSON.stringify(s.corpses[0])===firstCorpse'),true);
+assert.equal(g.run('s.corpses[1].floor'),2);assert.equal(g.run('s.corpses[1].cell'),10);
+assert.equal(g.run('s.corpses[1].gold'),45);assert.equal(g.run('s.corpses[1].records.length'),1);
+assert.equal(g.run('s.corpses[0].id!==s.corpses[1].id'),true);
+assert.equal(g.run('trainingRoster().length'),0);
+g.run('defeat();');assert.equal(g.run('s.corpses.length'),2,'empty party cannot leave another corpse');
+assert.equal(game(g.saved()).run('s.corpses.length'),2);
+console.log('PASS corpses persist across dungeon regeneration, multiple wipes and empty-party calls');
+
+for(const [name,action,count] of [
+ ['exploration poison','s.ailments.forEach(a=>a.poison=true);cell(1)',6],
+ ['battle poison',"s.ailments.forEach(a=>a.poison=true);s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}]};attack()",6],
+ ['floor blast','s.cells[1].trap=true;Math.random=()=>.3;cell(1)',6],
+ ['floor needle','s.cells[1].trap=true;Math.random=()=>0;cell(1)',1],
+ ['chest needle',"s.cells[0].chest={trap:'needle',gold:999};Math.random=()=>0;openChest()",1],
+ ['enemy attack',"s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}],initiative:'normal'};s.commands=['guard'];Math.random=()=>.999;attack()",1],
+]){
+ const g=corpseParty(count);
+ g.run(`s.pos=0;s.hp=s.members.map(()=>1);s.gold=17;
+ s.cells.forEach(c=>{c.type='';c.trap=false;c.flag=false;c.open=false;delete c.chest});${action};`);
+ assert.equal(g.run('s.corpses.length'),1,name);
+ assert.equal(g.run('s.corpses[0].records.length'),count,name);
+ assert.equal(g.run('s.corpses[0].cell'),name.startsWith('floor')?1:0,name);
+ assert.equal(g.run('s.corpses[0].gold'),17,name);
+ g.drain();assertWipeTown(g);
+ assert.equal(g.run('s.corpses.length'),1,name);
+ assert.equal(g.run('s.gold'),0,name+' cannot gain a chest reward after death');
+}
+console.log('PASS end-to-end wipes from movement/battle poison, floor traps, chest trap and enemy attack');
+
+const legacySource=corpseParty();
+for(const format of ['roster','parallel','three-member']){
+ const legacy=JSON.parse(legacySource.run(format==='roster'?'JSON.stringify(rosterSaveState())':'JSON.stringify(s)'));
+ delete legacy.corpses;
+ if(format==='three-member'){
+  delete legacy.partyVersion;
+  for(const key of ['members','hp','mp','inventory','equipped','armor','ailments'])legacy[key]=legacy[key].slice(0,3);
+ }
+ const g=game(JSON.stringify(legacy));
+ assert.equal(g.run('s.corpses.length'),0,format);
+ assert.equal(g.run('s.members.length'),6,format);
+ g.run('renderTraining();save();');assert.equal(game(g.saved()).run('s.corpses.length'),0,format);
+}
+assert.equal(game().run('s.corpses.length'),0);
+console.log('PASS missing corpses defaults to [] for new and old roster/parallel/three-member saves');

codex
遺体の保存・復元と訓練所表示を追加しました。戦闘、移動中の毒、床罠、宝箱罠での全滅に加え、ログ再生中の再読み込みと複数回の全滅を回帰テストで確認しています。

exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
 succeeded in 3387ms:
PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log
PASS inn skips dead/ash level-up and levels after revival
PASS XP deferred to town, multi-level growth, living refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration
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
PASS combat death snapshot, town HP/MP policy, death persistence, tavern removal and dungeon reentry
PASS HP-zero paths: physical, instant death, floor/chest traps, field/battle poison, hurt, breath and spell
PASS dead/ash/lost preservation, labels, independent entry blocks, reorder and snapshot display
PASS new members, old town/dungeon/reserve saves, roster/parallel/three-member migration and reload
PASS temple: all four outcomes for party/reserve, fees, HP1, MP/XP preservation, save/reload and dungeon reentry
PASS temple formulas, caps, probability boundaries, exact gold and insufficient-gold rejection
PASS temple town/idle guards, invalid targets and repeated attempts
PASS temple UI handlers: active/reserve list, fees/chances, disabled state, stable IDs, notices and empty state
PASS new game starts empty; dungeon blocked
PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation
PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload
PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration
PASS deletion including last active member and empty save reload
PASS lost recruits cannot join but can be deleted; dead/ash can join
PASS wipe snapshots, UUID/location/gold, complete corpse records, empty party, reserve isolation, training text and reload during/after logs
PASS corpses persist across dungeon regeneration, multiple wipes and empty-party calls
PASS end-to-end wipes from movement/battle poison, floor traps, chest trap and enemy attack
PASS missing corpses defaults to [] for new and old roster/parallel/three-member saves
88 monster definitions validated

exec
/bin/bash -lc "git diff --stat; git diff -- dist/recruits.js dist/training.js; rg --files /usr/bin /opt /tmp /home/box 2>/dev/null | rg '(chrom(e|ium)(/|"'$|-)|playwright[''^/]*$)'"' | head -n 30" in /workspace/dungeonsweeper
 succeeded in 0ms:
 dist/game.js       |  22 +++++++++--
 dist/recruits.js   |   5 ++-
 dist/training.js   |   3 ++
 tests/training.cjs | 114 ++++++++++++++++++++++++++++++++++++++++++++++++++++-
 4 files changed, 136 insertions(+), 8 deletions(-)
diff --git a/dist/recruits.js b/dist/recruits.js
index 762ab5f..6ce07db 100644
--- a/dist/recruits.js
+++ b/dist/recruits.js
@@ -19,14 +19,15 @@ function generateRecruit(name, job) {
 function trainingRoster(){return [...partyRecords(),...(s.reserve||[])]}
 // Combat retains its parallel arrays. Save files keep a single roster plus ordered IDs.
 function rosterSaveState() {
- const records=trainingRoster(), seen=new Set();
+ const records=s.defeatPending?(s.reserve||[]):trainingRoster(), seen=new Set();
  for(const r of records){if(!r.members.id||seen.has(r.members.id))r.members.id=crypto.randomUUID();seen.add(r.members.id)}
- const snapshot={...s,rosterVersion:1,roster:records,partyIds:s.members.map(m=>m.id)};
+ const snapshot={...s,rosterVersion:1,roster:records,partyIds:s.defeatPending?[]:s.members.map(m=>m.id),corpses:structuredClone(s.corpses||[])};
  for(const key of PARTY_FIELDS)delete snapshot[key];
  delete snapshot.reserve;
  return snapshot;
 }
 function restoreRoster(state) {
+ if(state)state.corpses??=[];
  if(state?.rosterVersion!==1)return state;
  const records=new Map(state.roster.map(r=>[r.members.id,r]));
  const ids=[...new Set(state.partyIds)].filter(id=>records.has(id)).slice(0,6);
diff --git a/dist/training.js b/dist/training.js
index 34000c2..b6980b1 100644
--- a/dist/training.js
+++ b/dist/training.js
@@ -15,6 +15,9 @@ function showRecruitPreview(){
 }
 function renderTraining(){
  const list=$('#recruitlist');list.replaceChildren();const roster=trainingRoster();
+ for(const corpse of s.corpses||[]){
+  const p=document.createElement('p');p.textContent=`迷宮に残された遺体：地下${corpse.floor}階（${corpse.records.map(r=>r.members.name).join('、')}）`;list.append(p);
+ }
  $('#trainingcount').textContent=`登録 ${roster.length}人 / パーティ ${s.members.length}/6人。先頭3人が前衛です。`;
  if(!roster.length){const p=document.createElement('p');p.textContent='名前と職業を選んで、最初の冒険者を作成してください。';list.append(p)}
  for(const r of roster){
/home/box/chrome-profile/machine-id
/opt/ungoogled-chromium/chrome_crashpad_handler
/opt/ungoogled-chromium/product_logo_48.png
/opt/ungoogled-chromium/libEGL.so
/opt/ungoogled-chromium/libqt5_shim.so
/opt/ungoogled-chromium/chrome_100_percent.pak
/opt/ungoogled-chromium/resources.pak
/opt/ungoogled-chromium/chrome
/home/box/chrome-profile/Fork-2/Subresource Filter/Unindexed Rules/9.72.0/_metadata/verified_contents.json
/home/box/chrome-profile/Fork-2/Subresource Filter/Unindexed Rules/9.72.0/LICENSE.txt
/home/box/chrome-profile/Fork-2/Subresource Filter/Unindexed Rules/9.72.0/Filtering Rules
/home/box/chrome-profile/Fork-2/Subresource Filter/Unindexed Rules/9.72.0/manifest.json
/tmp/sand-box-chrome-extra-flags
/tmp/sand-chrome-disable-quic
/home/box/chrome-profile/Fork-2/Subresource Filter/Indexed Rules/38/9.72.0/Ruleset Data
/home/box/chrome-profile/Fork-2/Last Version
/opt/ungoogled-chromium/locales/hr.pak
/opt/ungoogled-chromium/locales/el.pak.info
/opt/ungoogled-chromium/locales/id.pak
/opt/ungoogled-chromium/locales/sl.pak.info
/opt/ungoogled-chromium/locales/ta.pak
/opt/ungoogled-chromium/locales/it.pak
/opt/ungoogled-chromium/locales/te.pak
/opt/ungoogled-chromium/locales/zh-TW.pak.info
/opt/ungoogled-chromium/locales/fr-CA.pak.info
/opt/ungoogled-chromium/locales/cs.pak
/opt/ungoogled-chromium/locales/he.pak.info
/opt/ungoogled-chromium/locales/zh-CN.pak
/opt/ungoogled-chromium/locales/pt-BR.pak
/opt/ungoogled-chromium/locales/or.pak.info

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('tests/training.cjs');s=p.read_text().replace('recordsBefore=structuredClone(partyRecords());','liveRecords=partyRecords(),recordsBefore=structuredClone(liveRecords);',1).replace(\"recordsBefore[0].members.extra.history.push(9);recordsBefore[0].inventory.push('sword');save();\", \"liveRecords[0].members.extra.history.push(9);liveRecords[0].inventory.push('sword');save();\",1).replace(\"g.run('travelFloor(2,true);'); // An unvisited floor is rejected; use fresh to set up floor 2.\\ng.drain();g.run('fresh(2);\", \"g.run('fresh(2);\",1)
p.write_text(s)
PY" in /workspace/dungeonsweeper
 succeeded in 0ms:
exec
/bin/bash -lc 'python3 -m http.server 8000 --directory dist' in /workspace/dungeonsweeper
exec
/bin/bash -lc '/opt/ungoogled-chromium/chrome --headless --no-sandbox --disable-dev-shm-usage --user-data-dir=/tmp/dsw-corpse-chromium --remote-debugging-port=9224 about:blank' in /workspace/dungeonsweeper
 exited 1 in 4ms:
Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  File "<frozen runpy>", line 88, in _run_code
  File "/usr/lib/python3.13/http/server.py", line 1323, in <module>
    test(
    ~~~~^
        HandlerClass=handler_class,
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
        protocol=args.protocol,
        ^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "/usr/lib/python3.13/http/server.py", line 1270, in test
    with ServerClass(addr, HandlerClass) as httpd:
         ~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3.13/socketserver.py", line 453, in __init__
    self.socket = socket.socket(self.address_family,
                  ~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^
                                self.socket_type)
                                ^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3.13/socket.py", line 233, in __init__
    _socket.socket.__init__(self, family, type, proto, fileno)
    ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
PermissionError: [Errno 1] Operation not permitted

 exited 134 in 159ms:
[2:2:1102/072825.881275:FATAL:content/browser/sandbox_host_linux.cc:41] Check failed: . shutdown: Operation not permitted (1)

codex
共通テスト3本はすべてPASSしました。ブラウザ確認も試みましたが、この環境ではローカルサーバーとChromiumの起動が権限制限で拒否されました。

また、`/workspace/dsw-queue` は書き込み許可範囲外のため、`done/` への移動は未実施です。報告書はリポジトリ内の `report/` に保存します。

exec
/bin/bash -lc 'git diff -- dist/game.js; git diff --check; node tests/training.cjs' in /workspace/dungeonsweeper
 succeeded in 124ms:
diff --git a/dist/game.js b/dist/game.js
index bf06dd6..d52f81d 100644
--- a/dist/game.js
+++ b/dist/game.js
@@ -1,4 +1,4 @@
-const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
+const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,corpses:s.corpses,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',corpses:[],cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
 function enemyDefinition(id){return ENEMIES.find(e=>e.id===id)||ENEMIES[0]}
 const UNKNOWN_NAMES=Object.fromEntries(ENEMIES.map(e=>[e.id,e.unknown]));
 function enemyDisplay(e){return e?.identified?enemyDefinition(e.id).name:(UNKNOWN_NAMES[e?.id]||'正体不明')}
@@ -12,7 +12,7 @@ function encounterRate(i,wasOpen,action='forward'){return (wasOpen ? .10+num(i)*
 function rollInitiative(action='forward',boss=false){if(boss)return 'normal';let r=Math.random(),enemyChance=action==='back' ? .12 : .10;if(r<enemyChance)return s.watchful?'normal':'enemy';return r<enemyChance+.10?'party':'normal'}
 function encounter(i,unexplored=false,action='forward'){let boss=s.cells[i].type==='boss',formation=monsterFormation(boss),units=[];for(let [row,id] of formation.slice(0,3).entries()){let [min,max]=enemyDefinition(id).groupSize,n=min+(Math.random()*(max-min+1)|0);for(let j=0;j<n;j++)units.push({...makeEnemy(id,units.length),row})}resetCommandEntry();s.attackRows=s.members.map(()=>0);s.enemy={dataVersion:1,flagEffect:flagEffect(),boss,chestBattle:unexplored,lootGold:0,units,target:0,escapeTo:s.previousPos??s.start,initiative:rollInitiative(action,boss)};identifyEnemies();let message={normal:'敵が現れた！',enemy:'敵の奇襲！',party:'敵はまだ気づいていない！'}[s.enemy.initiative];log(message,{encounter:true});if(s.enemy.flagEffect.bad)log('誤った旗がパーティーを惑わせた！');if(s.enemy.initiative==='enemy'){s.enemy.initiative='normal';enemyTurn(s.members.map(()=>'fight'))}}
 function answerBoss(yes){if(logBusy()||!s.pendingBoss)return;let pending=s.pendingBoss;s.pendingBoss=null;if(yes)encounter(s.pos);else{s.pos=pending.previous;log('戦闘を避け、一歩前のマスへ戻った。')}render()}
-function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
+function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;if(s.defeatPending){finishDefeat();return}render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
 function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function markDeaths(){s.members.forEach((m,i)=>{if(s.hp[i]<=0&&m.status==='ok')m.status='dead'})}
 function hurt(n){s.hp=s.hp.map(h=>Math.max(0,h-n));markDeaths();if(s.hp.every(h=>h===0)){defeat()}}
 function cell(i,action='forward'){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;let c=s.cells[i];if(mode==='flag'){if(!c.open)c.flag=c.flag?false:(s.flagKind||'power');render();return}if(!adjacent(s.pos,i)){log('現在地の上下左右に隣接するマスを選んでください。');render();return}if(c.flag){log('旗のあるマスには移動できない。旗を外すと進めます。');render();return}tickAilments(false);if(s.done){render();return}let previous=s.pos,wasOpen=c.open;s.previousPos=previous;s.pos=i;if(c.type==='boss'&&!s.relic){c.open=true;s.pendingBoss={previous};log('守護者と戦いますか？');render();return}if(!c.open){c.open=true;if(c.trap){if(triggerFloorTrap(c)){render();return}}else log(num(i)?`警告：周囲に罠が${num(i)}個。`:'静かな部屋。周囲に罠はない。')}if(!s.done){if(c.type==='down'){s.pendingStairs='down';log(`地下${s.floor+1}階に移動しますか？`)}else if(c.type==='stairs'){s.pendingStairs=true;log(s.floor===1?'町に移動しますか？':`地下${s.floor-1}階に移動しますか？`)}else if(Math.random()<encounterRate(i,wasOpen,action))encounter(i,!wasOpen,action)}render()}
@@ -39,7 +39,7 @@ function canWeaponAttack(i){return i<3||equippedWeapon(i)?.range==='ranged'}
 function itemDescription(w){return diceLabel(w)+(w.dice?' · '+(w.range==='ranged'?'遠距離':'近距離'):'')}
 function renderCatalog(){ $('#catalogbody').innerHTML=`<table><thead><tr><th>敵</th><th>HP</th><th>攻撃</th><th>AC</th><th>経験値</th><th>群れ</th><th>金貨</th></tr></thead><tbody>${ENEMIES.map(e=>`<tr><td>${e.name}</td><td>${diceLabel({dice:e.hp})}</td><td>${diceLabel({dice:e.attack})}</td><td>${e.ac}</td><td>${e.xp}</td><td>${e.groupSize.join("〜")}体</td><td>${diceLabel({dice:e.gold})} ÷3（切捨）</td></tr>`).join('')}</tbody></table>`}
 function drawEnemies(){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat),height=Math.min(130,260/groups.length);return groups.map((g,row)=>{let y=62+row*height;let visible=g.units.filter(e=>!e.rewarded);return visible.map((e,col)=>{if(e.rewarded)return '';let width=Math.min(108,560/visible.length-8),x=320+(col-(visible.length-1)/2)*(width+8);return `<g data-enemy-uid="${e.uid}"><rect x="${x-width/2}" y="${y}" width="${width}" height="${height-9}" rx="6" fill="#20271f" stroke="#66725d"/><text x="${x}" y="${y+height*.65}" text-anchor="middle" fill="#dac595" font-size="52">${enemyDefinition(e.id).icon}</text><text x="${x}" y="${y+height-18}" text-anchor="middle" fill="#dac595" font-size="16">${e.sleep>0?'Zzz':''}</text></g>`}).join('')}).join('')}
-function ensureProfile(){s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.status??=s.area!=='town'&&s.hp[i]<=0?'dead':'ok';m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members){r.members.status??='ok';migrateStrength(r.members,r.members.job??0)}ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
+function ensureProfile(){s.corpses??=[];s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.status??=s.area!=='town'&&s.hp[i]<=0?'dead':'ok';m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members){r.members.status??='ok';migrateStrength(r.members,r.members.job??0)}ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
 function weapon(id){return WEAPONS.find(w=>w.id===id)||MEDICINES.find(w=>w.id===id)}
 function equippedWeapon(i){return weapon(s.inventory[i][s.equipped[i]])}
 function diceLabel(w){if(w.kind==='medicine')return w.description;if(w.part)return `${{head:"頭",body:"胴体",feet:"足"}[w.part]} AC −${w.ac}`;return `${w.dice[0]}d${w.dice[1]}${w.dice[2]?'+'+w.dice[2]:''}`}
@@ -50,7 +50,20 @@ function stayAtInn(kind){if(s.area!=='town'||!idle()||!['stable','room'].include
 function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
 function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.members.some(m=>m.status!=='ok')){$('#townnotice').textContent='死亡したメンバーを外してください。';render();return;}$('#townnotice').textContent='';if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
-function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
+function defeat(){
+ if(s.defeatPending||!s.members.length)return;
+ s.members.forEach((m,i)=>{m.status='dead';s.hp[i]=0});
+ (s.corpses??=[]).push({id:crypto.randomUUID(),floor:s.floor,cell:s.pos,records:structuredClone(partyRecords()),gold:s.gold});
+ s.gold=0;s.defeatPending=true;s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;
+ // Keep the party visible until its queued damage/death snapshots have played.
+ log('一行は全滅した。遺体は迷宮に残された。町で態勢を立て直そう。');save();
+}
+function finishDefeat(){
+ if(!s.defeatPending)return;
+ for(const key of PARTY_FIELDS)s[key]=[];
+ delete s.defeatPending;s.done=false;s.light=false;s.watchful=false;s.dumapicUses=0;s.levelReport=[];
+ resetPartyCommands();resetDungeon();render();
+}
 function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
 function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop);if(!pool.length)return;let w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
@@ -108,6 +121,7 @@ $('#party').onclick=$('#statsopen').onclick;
 $('#party').onchange=e=>{if(e.target.matches('[data-attack-row]')&&!logBusy()&&s.enemy){s.attackRows[+e.target.dataset.attackRow]=e.target.value;render();return}if(!e.target.matches('input[data-person]')||logBusy()||!s.enemy)return;s.commands[+e.target.dataset.person]=e.target.value;render()};
 $('#cleartown').onclick=enterTown;$('#backtown').onclick=enterTown;$('#entrance').onclick=enterDungeon;$('#blacksmith').onclick=()=>{if(!s.members.length)return;renderShop();$('#shopdialog').showModal()};$('#shopclose').onclick=()=>$('#shopdialog').close();$('#inventoryclose').onclick=()=>$('#inventorydialog').close();$('#shopmember').onchange=()=>{renderShop();$('#shopnotice').textContent=''};$('#shopitems').onclick=e=>{let b=e.target.closest('[data-buy]');if(b)buy(b.dataset.buy,+$('#shopmember').value)};$('#shopinventory').onclick=()=>openInventory(+$('#shopmember').value);$('#inventoryslots').onclick=e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.useMedicine!==undefined)openMedicine(inventoryMember,+b.dataset.useMedicine);if(b.dataset.equip!==undefined)equip(inventoryMember,+b.dataset.equip);if(b.dataset.sell!==undefined)sell(inventoryMember,+b.dataset.sell)};
 try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type=s.floor<MAX_FLOOR?'down':''}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
+if(s.defeatPending)finishDefeat();
 
 for(const id of ['mapdialog','statsdialog','leveldialog']){const d=$('#'+id);d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()})}
 
PASS new game starts empty; dungeon blocked
PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation
PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload
PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration
PASS deletion including last active member and empty save reload
PASS lost recruits cannot join but can be deleted; dead/ash can join
PASS wipe snapshots, UUID/location/gold, complete corpse records, empty party, reserve isolation, training text and reload during/after logs
PASS corpses persist across dungeon regeneration, multiple wipes and empty-party calls
PASS end-to-end wipes from movement/battle poison, floor traps, chest trap and enemy attack
PASS missing corpses defaults to [] for new and old roster/parallel/three-member saves

apply patch
patch: completed
/workspace/dungeonsweeper/report/030-heavy-corpse-on-wipe.md
diff --git a/report/030-heavy-corpse-on-wipe.md b/report/030-heavy-corpse-on-wipe.md
new file mode 100644
index 0000000000000000000000000000000000000000..0987452159778627d66576bd8d7ecda89fb6e314
--- /dev/null
+++ b/report/030-heavy-corpse-on-wipe.md
@@ -0,0 +1,26 @@
+# 030-heavy-corpse-on-wipe 作業報告
+
+実装・自動検証：完了。ブラウザ確認・外部キューの移動：未完了。
+
+## 変更ファイル
+
+- `dist/game.js`：全滅時に全員を死亡・HP0とし、UUID、階層、マス、全員のrecordの完全コピー、所持金を `s.corpses` に保存。金貨を0にし、死亡ログの再生後にパーティーを空にして町へ戻り、迷宮を再生成する。既存の控えは維持し、遺体を控えへ追加しない。階層移動・再生成でも遺体を保持する。
+- `dist/recruits.js`：`ash-v1` に遺体を保存・復元し、未設定の旧セーブでは `[]` を補う。全滅ログ再生中のセーブでは遺体を通常名簿から除外し、再読み込み時に町への移行を完了する。
+- `dist/training.js`：訓練所に「迷宮に残された遺体：地下◯階（名前…）」を表示。名前は `textContent` で扱う。
+- `tests/training.cjs`：全滅、完全コピー、控えの維持、訓練所表示、保存・復元、旧セーブ移行などの回帰テストを追加。
+
+## 検証
+
+- `node tests/game.cjs`：PASS。
+- `node tests/training.cjs`：PASS。
+- `python3 scripts/compile-monsters.py --check`：PASS（88種）。
+- `git diff --check`：PASS。
+
+戦闘、移動中・戦闘中の毒、床の針・爆発、宝箱の針による全滅を検証。ログ再生前の死亡表示の漏れ、全滅後の宝箱報酬、二重保存を防ぎ、ログ再生中／完了後の再読み込み、複数の遺体、パーティー0人・金貨0・旧セーブ互換を確認した。
+
+戦闘計算と寺院は変更していない。救出処理031は未実装。
+
+## 残作業と環境制約
+
+- ブラウザでの手動確認は未実施。ローカルHTTPサーバーはソケット作成時に `Operation not permitted`、Chromiumは起動時に同エラーで終了した。訓練所表示はDOMスタブによる自動テストで確認済み。
+- `/workspace/dsw-queue` は環境の書き込み許可範囲外のため、`todo/030-heavy-corpse-on-wipe.md` の `done/` への移動と同ディレクトリの `report/` への保存は未実施。本報告をリポジトリ内の `report/` に保存した。
diff --git a/tests/training.cjs b/tests/training.cjs
index c7d23334a7860f5f064e511d1f4ac4893031ca8b..9c44e264c8f18ece4519148b683537cb8c1a2ac1
--- a/tests/training.cjs
+++ b/tests/training.cjs
@@ -57,3 +57,113 @@
 assert.equal(g.run('changeRecruitParty(st[0].members.id,true)'),false);assert.equal(g.run('changeRecruitParty(st[1].members.id,true)'),true);assert.equal(g.run('changeRecruitParty(st[2].members.id,true)'),true);
 assert.equal(g.run('deleteRecruit(st[0].members.id)'),true);assert.equal(g.run('trainingRoster().some(r=>r.members.id===st[0].members.id)'),false);
 console.log('PASS lost recruits cannot join but can be deleted; dead/ash can join');
+
+// Wipes must preserve complete records separately from the playable roster.
+function corpseParty(count=6){
+ const g=game();
+ g.run(`Math.random=()=>.5;[3,2,0,1,0,2,1].slice(0,${count+1}).forEach((job,i)=>{
+  const r=generateRecruit('遺体'+i,job);registerRecruit(r);if(i<${count})changeRecruitParty(r.members.id,true);
+ });enterDungeon();`);
+ g.drain();return g;
+}
+g=corpseParty();
+g.run(`fresh(3);s.pos=17;s.gold=321;s.cleared=true;s.light=true;s.watchful=true;s.dumapicUses=4;
+ s.inventory[0].push('helm','healingPotion');s.armor[0].head=1;s.members[0].xp=123;
+ s.members[0].extra={history:[1,2]};s.mp[1]=3;s.ailments[0]={poison:true,paralysis:2};
+ var reserveBefore=JSON.stringify(s.reserve),recordsBefore=structuredClone(partyRecords());
+ recordsBefore.forEach(r=>{r.hp=0;r.members.status='dead'});
+ log('全滅直前');hurt(999);`);
+assert.equal(g.run('s.corpses.length'),1);
+assert.equal(g.run('s.gold'),0);
+assert.equal(g.run('s.corpses[0].floor'),3);
+assert.equal(g.run('s.corpses[0].cell'),17);
+assert.equal(g.run('s.corpses[0].gold'),321);
+assert.match(g.run('s.corpses[0].id'),/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
+assert.equal(g.run('JSON.stringify(s.corpses[0].records)===JSON.stringify(recordsBefore)'),true);
+assert.equal(g.run("displayVitals.hp.every(h=>h>0)&&displayVitals.members.every(m=>m.status==='ok')"),true,'death must not leak before its log');
+assert.equal(g.run("logQueue.at(-1).hp.every(h=>h===0)&&logQueue.at(-1).members.every(m=>m.status==='dead')"),true);
+g.run('defeat();');assert.equal(g.run('s.corpses.length'),1,'repeated defeat must not duplicate corpses');
+const duringWipe=g.saved();
+assert.equal(JSON.parse(duringWipe).partyIds.length,0);
+assert.equal(JSON.parse(duringWipe).roster.length,1,'pending wipe save contains only the existing reserve');
+g.drain();
+function assertWipeTown(g){
+ assert.equal(g.run('s.area'),'town');assert.equal(g.run('s.done'),false);
+ assert.equal(g.run('s.members.length'),0);assert.equal(g.run('s.gold'),0);
+ assert.equal(g.run('PARTY_FIELDS.every(key=>s[key].length===0)'),true);
+ assert.equal(g.run('s.enemy'),null);assert.equal(g.run('s.pendingStairs'),false);
+ assert.equal(g.run('s.pendingBoss'),null);assert.equal(g.run('idle()'),true);
+ assert.equal(g.run('Object.keys(s.floors).length'),0);
+ assert.equal(g.run('s.cells.some(c=>c.open)'),false);
+ assert.equal(g.run('s.light||s.watchful||s.dumapicUses>0'),false);
+ assert.equal(g.run("$('#entrance').disabled"),true);
+}
+assertWipeTown(g);
+assert.equal(g.run('JSON.stringify(s.reserve)===reserveBefore'),true);
+assert.equal(g.run('s.cleared'),true);
+g.run("s.corpses[0].records[0].members.name='遺体(<印>)';renderTraining();");
+assert.equal(g.run("$('#recruitlist').children[0].textContent"),'迷宮に残された遺体：地下3階（遺体(<印>)、遺体1、遺体2、遺体3、遺体4、遺体5）');
+assert.equal(g.run("$('#recruitlist').children[0].innerHTML"),undefined,'names must be rendered as text');
+const corpses=g.run('JSON.stringify(s.corpses)');
+g.run("recordsBefore[0].members.extra.history.push(9);recordsBefore[0].inventory.push('sword');save();");
+assert.equal(g.run('JSON.stringify(s.corpses)'),corpses,'corpse records must be independent copies');
+let restored=game(g.saved());assertWipeTown(restored);
+assert.equal(restored.run('JSON.stringify(s.corpses)'),corpses);
+restored=game(duringWipe);assertWipeTown(restored);
+assert.equal(restored.run('s.corpses.length'),1);
+assert.equal(restored.run('s.reserve.length'),1);
+assert.equal(restored.run("s.corpses[0].records.every(r=>r.members.status==='dead'&&r.hp===0)"),true);
+restored=game(restored.saved());assertWipeTown(restored);
+assert.equal(restored.run('s.corpses.length'),1,'reloading completed wipe must not create another corpse');
+console.log('PASS wipe snapshots, UUID/location/gold, complete corpse records, empty party, reserve isolation, training text and reload during/after logs');
+
+// Corpses survive new labyrinths and additional wipes without entering the reserve.
+g.run('var firstCorpse=JSON.stringify(s.corpses[0]);changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();');g.drain();
+g.run('travelFloor(2,true);'); // An unvisited floor is rejected; use fresh to set up floor 2.
+g.drain();g.run('fresh(2);s.pos=10;s.gold=45;hurt(999);');g.drain();
+assertWipeTown(g);assert.equal(g.run('s.corpses.length'),2);
+assert.equal(g.run('JSON.stringify(s.corpses[0])===firstCorpse'),true);
+assert.equal(g.run('s.corpses[1].floor'),2);assert.equal(g.run('s.corpses[1].cell'),10);
+assert.equal(g.run('s.corpses[1].gold'),45);assert.equal(g.run('s.corpses[1].records.length'),1);
+assert.equal(g.run('s.corpses[0].id!==s.corpses[1].id'),true);
+assert.equal(g.run('trainingRoster().length'),0);
+g.run('defeat();');assert.equal(g.run('s.corpses.length'),2,'empty party cannot leave another corpse');
+assert.equal(game(g.saved()).run('s.corpses.length'),2);
+console.log('PASS corpses persist across dungeon regeneration, multiple wipes and empty-party calls');
+
+for(const [name,action,count] of [
+ ['exploration poison','s.ailments.forEach(a=>a.poison=true);cell(1)',6],
+ ['battle poison',"s.ailments.forEach(a=>a.poison=true);s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}]};attack()",6],
+ ['floor blast','s.cells[1].trap=true;Math.random=()=>.3;cell(1)',6],
+ ['floor needle','s.cells[1].trap=true;Math.random=()=>0;cell(1)',1],
+ ['chest needle',"s.cells[0].chest={trap:'needle',gold:999};Math.random=()=>0;openChest()",1],
+ ['enemy attack',"s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}],initiative:'normal'};s.commands=['guard'];Math.random=()=>.999;attack()",1],
+]){
+ const g=corpseParty(count);
+ g.run(`s.pos=0;s.hp=s.members.map(()=>1);s.gold=17;
+ s.cells.forEach(c=>{c.type='';c.trap=false;c.flag=false;c.open=false;delete c.chest});${action};`);
+ assert.equal(g.run('s.corpses.length'),1,name);
+ assert.equal(g.run('s.corpses[0].records.length'),count,name);
+ assert.equal(g.run('s.corpses[0].cell'),name.startsWith('floor')?1:0,name);
+ assert.equal(g.run('s.corpses[0].gold'),17,name);
+ g.drain();assertWipeTown(g);
+ assert.equal(g.run('s.corpses.length'),1,name);
+ assert.equal(g.run('s.gold'),0,name+' cannot gain a chest reward after death');
+}
+console.log('PASS end-to-end wipes from movement/battle poison, floor traps, chest trap and enemy attack');
+
+const legacySource=corpseParty();
+for(const format of ['roster','parallel','three-member']){
+ const legacy=JSON.parse(legacySource.run(format==='roster'?'JSON.stringify(rosterSaveState())':'JSON.stringify(s)'));
+ delete legacy.corpses;
+ if(format==='three-member'){
+  delete legacy.partyVersion;
+  for(const key of ['members','hp','mp','inventory','equipped','armor','ailments'])legacy[key]=legacy[key].slice(0,3);
+ }
+ const g=game(JSON.stringify(legacy));
+ assert.equal(g.run('s.corpses.length'),0,format);
+ assert.equal(g.run('s.members.length'),6,format);
+ g.run('renderTraining();save();');assert.equal(game(g.saved()).run('s.corpses.length'),0,format);
+}
+assert.equal(game().run('s.corpses.length'),0);
+console.log('PASS missing corpses defaults to [] for new and old roster/parallel/three-member saves');

exec
/bin/bash -lc 'git status --short; git diff --check' in /workspace/dungeonsweeper
 succeeded in 0ms:
 M dist/game.js
 M dist/recruits.js
 M dist/training.js
 M tests/training.cjs
?? report/

codex
030の実装・自動検証は完了しました。遺体と金貨を保存し、死亡ログ再生後にパーティー0人で町へ戻ります。訓練所表示・旧セーブ互換も対応済みです。

- 変更：`dist/game.js`、`dist/recruits.js`、`dist/training.js`、`tests/training.cjs`
- 指定テスト3本：すべてPASS
- 未完了：ブラウザ確認、外部キューの `done/` 移動（環境の権限制限）

詳細：[作業報告](/workspace/dungeonsweeper/report/030-heavy-corpse-on-wipe.md)
tokens used
68,585
030の実装・自動検証は完了しました。遺体と金貨を保存し、死亡ログ再生後にパーティー0人で町へ戻ります。訓練所表示・旧セーブ互換も対応済みです。

- 変更：`dist/game.js`、`dist/recruits.js`、`dist/training.js`、`tests/training.cjs`
- 指定テスト3本：すべてPASS
- 未完了：ブラウザ確認、外部キューの `done/` 移動（環境の権限制限）

詳細：[作業報告](/workspace/dungeonsweeper/report/030-heavy-corpse-on-wipe.md)
