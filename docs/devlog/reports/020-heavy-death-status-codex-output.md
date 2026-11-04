OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-astra
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: high
reasoning summaries: none
session id: 01a198d9-1036-7ca0-937b-031f1349a8fc
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
# 020-heavy-death-status
ティア：HEAVY　依存：011（XP分配後）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【死亡・灰・ロスト 手順1/3】死亡状態を導入し、帰還で死者が無料復活しないようにする（寺院は次の021）。

## 変更内容
- データ：`s.members[i].status`：'ok'|'dead'|'ash'|'lost'。移行（ensureProfile 内）：未設定なら、町にいれば 'ok'、迷宮内で s.hp[i]<=0 なら 'dead'、他 'ok'。控え（s.reserve の record.members）も未設定は 'ok'。
- 新規 `markDeaths()`（dist/game.js）：s.hp[i]<=0 かつ status==='ok' なら 'dead'。HP0化の全経路の末尾で呼ぶ：monsterHurt・monsterOnHit（dist/monsters.js）、床罠（dist/traps.js triggerFloorTrap）、triggerChestTrap・tickAilments・hurt（dist/game.js）。
- `enterTown()`：HP/MP全快は status==='ok' のみ。dead/ash/lost は HP0 のまま。毒・麻痺解除は全員。
- `enterDungeon()`：パーティに status!=='ok' がいれば入場せず「死亡したメンバーを外してください。」をlog。
- `visibleAilments(i)`：status が dead/ash/lost なら 死亡/灰/ロスト を表示。
- 「帰還で全員回復」前提の既存テストは新仕様に合わせて修正し理由をコメント。docs/SPECIFICATION.md 3章を更新（本作の暫定仕様と明記）。
- 触らない：戦闘式、XP、寺院（まだ作らない）、セーブキー名。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：戦闘でHP0→status 'dead'→帰還後もHP0。deadを含むパーティは入場不可、酒場で外せば入場可。旧セーブ（statusなし）で例外なし、町では全員ok。セーブ→リロードで保持。
- 手動：迷宮で1人死亡→帰還→その人がHP0「死亡」表示のまま。

codex
020の死亡状態導入を進めます。先に引き継ぎ資料と現行コードを確認し、実装・回帰テスト・仕様書更新まで行います。

exec
/bin/bash -lc "pwd && rg --files -g 'AGENTS.md' -g 'README*' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g '*020*'" in /workspace/dungeonsweeper
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
# 現行仕様書

作成日：2026-11-01（日本時間）。**この資料は実装の記録であり、初代Wizardryの完全再現を保証する資料ではありません。** 数値の正本はコードとDATA_CATALOG.mdを参照。

## 1. ゲームループ・階層

町（酒場・鍛冶屋・迷宮入口）→探索→遭遇／宝箱／守護者→階段で上下移動→町。
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
/bin/bash -lc 'git status --short && ls /workspace/dsw-queue && cat /workspace/dsw-queue/README-handoff.md' in /workspace/dungeonsweeper
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
/bin/bash -lc "rg -n 'ensureProfile|markDeaths|enterTown|enterDungeon|visibleAilments|tickAilments|function hurt|triggerChestTrap|snapshot|PARTY_FIELDS|s\\.hp\\[' dist/game.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
5:function identifyEnemies(force=false){if(!s.enemy)return;let chance=Math.min(1,Math.max(0,...s.members.map((m,i)=>s.hp[i]>0?(m.intelligence||0)*.03:0)));for(const g of enemyGroups(s.enemy)){if(!g.units.some(e=>e.hp>0)||g.units.some(e=>e.identified))continue;if(force||Math.random()<chance){for(const e of g.units)e.identified=true}}}
10:function attackRowUI(i){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat).filter(g=>g.units.some(e=>!e.rewarded)),chosen=s.attackRows[i];if(!groups.some(g=>String(g.key)===String(chosen)))chosen=groups[0]?.key;return `<label class="attackrow"><span class="sr-only">${NAMES[i]}の攻撃対象の列</span><select data-attack-row="${i}" ${logBusy()||s.commands[i]!=='fight'||s.hp[i]<=0?'disabled':''}>${groups.map(g=>`<option value="${g.key}" ${String(chosen)===String(g.key)?'selected':''}>${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>!e.rewarded).length}</option>`).join('')}</select></label>`}
16:function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function hurt(n){s.hp=s.hp.map(h=>Math.max(0,h-n));if(s.hp.every(h=>h===0)){defeat()}}
17:function cell(i,action='forward'){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;let c=s.cells[i];if(mode==='flag'){if(!c.open)c.flag=c.flag?false:(s.flagKind||'power');render();return}if(!adjacent(s.pos,i)){log('現在地の上下左右に隣接するマスを選んでください。');render();return}if(c.flag){log('旗のあるマスには移動できない。旗を外すと進めます。');render();return}tickAilments(false);if(s.done){render();return}let previous=s.pos,wasOpen=c.open;s.previousPos=previous;s.pos=i;if(c.type==='boss'&&!s.relic){c.open=true;s.pendingBoss={previous};log('守護者と戦いますか？');render();return}if(!c.open){c.open=true;if(c.trap){if(triggerFloorTrap(c)){render();return}}else log(num(i)?`警告：周囲に罠が${num(i)}個。`:'静かな部屋。周囲に罠はない。')}if(!s.done){if(c.type==='down'){s.pendingStairs='down';log(`地下${s.floor+1}階に移動しますか？`)}else if(c.type==='stairs'){s.pendingStairs=true;log(s.floor===1?'町に移動しますか？':`地下${s.floor-1}階に移動しますか？`)}else if(Math.random()<encounterRate(i,wasOpen,action))encounter(i,!wasOpen,action)}render()}
28:function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0,survivors=s.members.filter((_,i)=>s.hp[i]>0).length,share=xp>0&&survivors>0?Math.max(1,Math.floor(xp/survivors)):0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=share;if(share)log(`生存者は経験値${share}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}
30:function attack(){if(logBusy()||!s.enemy||s.done)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}identifyEnemies();let cmds=s.commands.slice();log('── ターン開始 ──');for(let i=0;i<s.members.length;i++)if(s.hp[i]>0&&cmds[i]==='guard')log(`${NAMES[i]}は身を守る。`);for(let i=0;i<s.members.length;i++){if(s.hp[i]<=0)continue;if(s.ailments[i].paralysis>0){log(`${NAMES[i]}は麻痺して動けない。`);continue}if(cmds[i]==='guard')continue;if(cmds[i]==='dispel'){dispelUndead(i);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(cmds[i]==='item'){let plan=s.itemPlans[i];if(plan)useMedicine(i,plan.slot,plan.target,true,plan.id);continue}if(cmds[i]==='spell'){let plan=s.magicPlans[i];if(plan){let x=magic(plan.id),t=plan.target;if(x&&(x.target==='enemy'||x.target==='group')&&!validMagicTarget(x,t)){let original=s.enemy.units.find(e=>e.uid===t);t=s.enemy.units.find(e=>e.hp>0&&original&&rowKey(e)===rowKey(original))?.uid??s.enemy.units.find(e=>e.hp>0)?.uid}castMagic(i,plan.id,t)}else log(`${NAMES[i]}の呪文が選ばれていない。`);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(!canWeaponAttack(i)){log(`${NAMES[i]}の近接攻撃は後衛から届かない。`);continue}let e=selectedEnemy(i);if(!e){log(`${NAMES[i]}の攻撃対象の列は全滅している。`);continue;}let d=enemyDefinition(e.id);let result=physicalAttack(i,e);if(!result.hitsCount){log(`${NAMES[i]}の攻撃は${enemyDisplay(e)}にかわされた。`);continue}let damage=flagDamage(result.damage);e.hp=Math.max(0,e.hp-damage);log(`${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。`);if(e.hp===0)killReward(e);if(!s.enemy.units.some(e=>e.hp>0))break}if(!s.enemy.units.some(e=>e.hp>0)){finishMonsterBattle()}else if(s.enemy.initiative==='party'){s.enemy.initiative='normal'}else{enemyTurn(cmds)}resetCommandEntry();resetPartyCommands();if(s.enemy){let next=s.enemy.units.find(e=>e.hp>0);s.attackRows=s.attackRows.map(key=>s.enemy.units.some(e=>String(rowKey(e))===String(key)&&e.hp>0)?key:rowKey(next))}render()}
41:function ensureProfile(){s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members)migrateStrength(r.members,r.members.job??0);ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
46:function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));levelUp();s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render();showLevelReport()}
48:function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
49:function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
64:function render(){ensureProfile();$('#clearresult').hidden=s.area!=='dungeon'||!s.clearNotice||s.done||logBusy()||!!visibleCombat();$('#cleartown').disabled=!idle();$('#clearchestnotice').hidden=!currentChest();$('#clearedmark').hidden=!s.cleared;$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();$('#maptoggle').hidden=s.area!=='dungeon';if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic?' / 秘宝 ✦':''}`;$('#party').innerHTML=NAMES.map((n,i)=>`${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`).join('');$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${s.pos===i?num(i):c.open?(c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div><button id="flee">逃げる</button>`;$('#flee').onclick=flee;$('#flee').disabled=logBusy()||combat.boss||combat.flagEffect?.bad;renderCommandEntry()}$('#frontflag').disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();scene()}
69:$('#cleartown').onclick=enterTown;$('#backtown').onclick=enterTown;$('#entrance').onclick=enterDungeon;$('#blacksmith').onclick=()=>{if(!s.members.length)return;renderShop();$('#shopdialog').showModal()};$('#shopclose').onclick=()=>$('#shopdialog').close();$('#inventoryclose').onclick=()=>$('#inventorydialog').close();$('#shopmember').onchange=()=>{renderShop();$('#shopnotice').textContent=''};$('#shopitems').onclick=e=>{let b=e.target.closest('[data-buy]');if(b)buy(b.dataset.buy,+$('#shopmember').value)};$('#shopinventory').onclick=()=>openInventory(+$('#shopmember').value);$('#inventoryslots').onclick=e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.useMedicine!==undefined)openMedicine(inventoryMember,+b.dataset.useMedicine);if(b.dataset.equip!==undefined)equip(inventoryMember,+b.dataset.equip);if(b.dataset.sell!==undefined)sell(inventoryMember,+b.dataset.sell)};
70:try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type=s.floor<MAX_FLOOR?'down':''}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
78:function visibleAilments(i){let a=(displayVitals?.ailments||s.ailments)[i]||{},hp=(displayVitals?.hp||s.hp)[i];return hp<=0?[['dead','死亡']]:[[a.poison,'poison','毒'],[a.paralysis>0,'paralysis','麻痺'],[a.sleep>0,'sleep','睡眠']].filter(([active])=>active).map(([,kind,label])=>[kind,label])}
79:function ailmentLabel(i){return visibleAilments(i).map(([,label])=>label).join('・')||'正常'}
80:function ailmentTags(i){return visibleAilments(i).map(([kind,label])=>`<span class="ailment-tag ailment-${kind}">${label}</span>`).join('')}
82:function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
84:function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
87:function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
97:function enemyTurn(cmds){for(const e of s.enemy.units.filter(e=>e.hp>0)){if(s.hp.every(h=>h<=0))break;if(e.sleep>0){e.sleep--;log(`${enemyDisplay(e)}は眠っている。`);continue}if(monsterAction(e,cmds))continue;let d=enemyDefinition(e.id);for(let n=0;n<d.swings;n++){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),front=alive.filter(i=>i<3),pool=d.rear||!front.length?alive:front;if(!pool.length)break;let i=pool[Math.random()*pool.length|0];if(!hits(d.hit,effectiveAC(i))){log(`${NAMES[i]}は${enemyDisplay(e)}の攻撃をかわした。`);continue}monsterHurt(i,dice(...d.attack).value,cmds,enemyDisplay(e));if(s.hp[i]>0)monsterOnHit(e,i)}}if(s.hp.every(h=>h===0)){defeat();return}if(!s.enemy.units.some(e=>e.hp>0))finishMonsterBattle()}
100:function escapeChance(){if(!s.enemy||s.enemy.boss||s.enemy.flagEffect?.bad)return 0;let party=s.members.reduce((a,m,i)=>{if(s.hp[i]>0&&!s.ailments[i].poison&&!s.ailments[i].paralysis){a.total+=m.level;a.count++}return a},{total:0,count:0}),enemies=s.enemy.units.reduce((a,e)=>{if(e.hp>0&&!e.sleep){a.total+=monsterLevel(e);a.count++}return a},{total:0,count:0});if(!party.count)return 10;let bonus=party.count===1?15:party.count===2?10:party.count===3?5:0,partyAverage=party.total/party.count,enemyAverage=enemies.count?enemies.total/enemies.count:0;return Math.max(10,Math.min(95,50+5*(partyAverage-enemyAverage)+bonus))}
101:function flee(){if(logBusy()||!s.enemy||s.done||s.enemy.boss||s.enemy.flagEffect?.bad)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}if(Math.random()*100<escapeChance()){let from=s.pos,to=s.enemy.escapeTo??s.previousPos??s.start;if(!adjacent(from,to)){to=around(from).find(i=>adjacent(from,i)&&s.cells[i].open&&!s.cells[i].trap)??from}s.enemy=null;s.pos=to;s.previousPos=from;log('逃走に成功。一歩前のマスへ戻った。')}else{log('逃走に失敗！');if(s.enemy.initiative==='party')s.enemy.initiative='normal';else enemyTurn(s.members.map(()=>'flee'))}render()}

exec
/bin/bash -lc 'cat dist/monsters.js dist/traps.js' in /workspace/dungeonsweeper
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
 if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){
  s.relic=true;
  if(s.floor===MAX_FLOOR&&defeated.some(e=>e.id==='labyrinthlord')){
   s.cells[s.boss].type='';s.pendingStairs=false;s.cleared=true;s.clearNotice=true;
   log('迷宮の主は倒れた。迷宮に静寂が戻った……');
  }else if(s.floor<MAX_FLOOR){s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log(`地下${s.floor+1}階に移動しますか？`)}
 }
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
const FLOOR_TRAPS=[{id:'needle',name:'針',weight:25},{id:'blast',name:'爆発',weight:25},{id:'poison',name:'毒霧',weight:20},{id:'paralysis',name:'麻痺の針',weight:15},{id:'teleport',name:'転移',weight:15}];
function triggerFloorTrap(c){log('罠だ！',{trap:true});let roll=Math.random()*100,t=FLOOR_TRAPS.find(t=>(roll-=t.weight)<0)||FLOOR_TRAPS[0];c.trap=false;c.spent=true;c.trapKind=t.id;let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;displayVitals??={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};
 if(t.id==='needle'){let n=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-n);log(`針の罠！ ${NAMES[i]}に${n}ダメージ。`)}
 else if(t.id==='blast'){let n=Math.max(1,Math.floor(dice(2,6,3).value*trapPower(s.floor)));for(let j of alive)s.hp[j]=Math.max(0,s.hp[j]-n);log(`爆発の罠！ 全員に${n}ダメージ。`)}
 else if(t.id==='poison'){log('毒霧の罠！ 毒霧が噴き出した。');for(let j of alive)afflict(j,'poison')}
 else if(t.id==='paralysis'){log('麻痺の針の罠！ 針が飛び出した。');afflict(i,'paralysis')}
 else {let candidates=s.cells.map((v,j)=>j!==s.pos&&!v.type&&!v.trap&&!v.flag&&!v.chest?j:-1).filter(j=>j>=0);if(candidates.length){s.previousPos=s.pos;s.pos=candidates[Math.random()*candidates.length|0];s.cells[s.pos].open=true;log('転移の罠！ 一行は別の部屋に飛ばされた。');log(`警告：周囲に罠が${num(s.pos)}個。`)}else log('転移の罠は不発に終わった。')}
 if(s.hp.every(h=>h===0))defeat();return t.id==='teleport';
}

exec
/bin/bash -lc "rg -n 'enterTown|enterDungeon|hp.*0|town|load|ailment|snapshot' tests/game.cjs tests/training.cjs && ls /workspace/dsw-queue/todo /workspace/dsw-queue/report && cat /workspace/dsw-queue/todo/020-heavy-death-status.md" in /workspace/dungeonsweeper
 succeeded in 0ms:
tests/training.cjs:12:g.run('enterDungeon()');assert.equal(g.run('s.area'),'town');
tests/training.cjs:37:g.run("s.gold=1000;buy('helm',0);equip(0,1);s.members[0].xp=50;s.hp[0]-=2;s.inventory[0].push('healingPotion');save();var retained=JSON.stringify(partyRecords()[0]);");
tests/training.cjs:43:console.log('PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload');
tests/training.cjs:46:g.drain();g.run('s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));enterDungeon()');g.drain();
tests/training.cjs:48:g.run("s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,rewarded:false}],initiative:'party'};s.commands=s.members.map(()=> 'guard');s.commands[0]='fight';s.attackRows=s.members.map(()=>0);Math.random=()=>.999;attack()");g.drain();assert(g.run('s.enemy.units[0].hp')<999);
tests/training.cjs:50:g.run("s.hp[0]=1;castMagic(priest,'dios',0)");g.drain();assert(g.run('s.hp[0]')>1);
tests/training.cjs:51:g.run('s.enemy=null;var oldCells=s.cells;enterTown()');g.drain();assert.equal(g.run('s.area'),'town');assert.equal(g.run('s.cells===oldCells'),false);assert.equal(g.run('trainingRoster().length'),7);
tests/training.cjs:52:console.log('PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration');
tests/training.cjs:54:g=game(g.saved());assert.equal(g.run('trainingRoster().length'),0);g.run('enterDungeon()');assert.equal(g.run('s.area'),'town');
tests/training.cjs:55:console.log('PASS deletion including last active member and empty save reload');
tests/game.cjs:1:const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
tests/game.cjs:3:s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');if(s.hp.some((h,i)=>h!==maxHP(i))||s.mp.some((h,i)=>h!==s.members[i].maxMP))throw Error('refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
tests/game.cjs:5:s.enemy={boss:false,target:1,units:[{id:'slime',uid:0,hp:1000,rewarded:false},{id:'wolf',uid:1,hp:1,rewarded:false}]};s.commands=['fight','guard','guard'];var oldxp=s.members[0].xp;attack();if(!s.enemy||s.enemy.units[0].hp!==1000||s.enemy.units[1].hp!==0||s.members[0].xp!==oldxp||s.enemy.pendingXP!==14)throw Error('target or reward');`);drain();run(`var ex=s.members[0].xp;killReward(s.enemy.units[1]);if(s.members[0].xp!==ex)throw Error('double reward');s.enemy.units[0].hp=1000;s.mp[1]=2;s.magicPlans[1]={id:'halito',target:0};s.commands=['guard','spell','guard'];attack();if(s.mp[1]!==0||s.enemy.units[0].hp!==992)throw Error('spell MP damage');`);drain();run(`s.enemy=null;s.mp[2]=1;var before=s.hp.join();castMagic(2,'dios',0);if(s.hp.join()!==before||s.mp[2]!==1)throw Error('insufficient MP');s.area='dungeon';delete s.members;delete s.mp;s.spell=2;s.heal=1;s.enemy={boss:false,hp:11};ensureProfile();if(s.mp[1]!==8||s.mp[2]!==3||s.enemy.units[0].hp!==11)throw Error('migration');`);
tests/game.cjs:6:console.log('PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
tests/game.cjs:7:drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
tests/game.cjs:8:drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.cells[s.pos].chest={gold:7,opened:false,trap:'none'};s.scan=2;var oldgold=s.gold;Math.random=()=>.99;openChest(true);if(s.gold!==oldgold+21||currentChest())throw Error('safe chest');`);drain();run(`openChest(false);if(s.gold!==oldgold+21)throw Error('double chest');s.cells[s.pos].chest={gold:9,opened:false};s.scan=0;if(!currentChest())throw Error('new chest');s.hp=[32,24,26];afflict(0,'poison');tickAilments();if(s.hp[0]!==30)throw Error('poison');afflict(1,'paralysis');tickAilments();if(s.ailments[1].paralysis!==3)throw Error('paralysis');`);drain();run(`abandonChest()`);drain();run(`enterTown();if(s.ailments.some(a=>a.poison||a.paralysis))throw Error('town cure');`);console.log('PASS direct chest, once-only rewards, poison, paralysis, town cure');
tests/game.cjs:11:drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');
tests/game.cjs:14:drain();run(`var escapeOriginalMembers=structuredClone(s.members),escapeOriginalHP=s.hp.slice(),escapeOriginalAilments=structuredClone(s.ailments);fresh(1);s.members=Array.from({length:6},(_,i)=>({...structuredClone(s.members[i%3]),level:1}));s.hp=Array(6).fill(20);s.ailments=Array.from({length:6},()=>({poison:false,paralysis:0}));s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'wolf',uid:0,hp:20}]};if(escapeChance()!==45)throw Error('escape six level 1 vs level 2');s.members.forEach(m=>m.level=10);if(escapeChance()!==90)throw Error('escape six level 10 vs level 2');s.members=s.members.slice(0,1);s.hp=s.hp.slice(0,1);s.ailments=s.ailments.slice(0,1);s.members[0].level=1;if(escapeChance()!==60)throw Error('escape one level 1 vs level 2');s.members[0].level=20;if(escapeChance()!==95)throw Error('escape upper clamp');s.hp[0]=0;if(escapeChance()!==10)throw Error('escape no eligible party');s.hp[0]=20;s.members[0].level=1;s.enemy.units[0].id='goblin';if(escapeChance()!==60)throw Error('escape one level 1 vs level 2 after eligibility restore');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members[0].level=20;s.enemy.units[0].id='wolf';if(escapeChance()!==95)throw Error('escape clamp at 95');Math.random=()=>0;var oldGold=s.gold;flee();if(s.enemy||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape');s.members=escapeOriginalMembers;s.hp=escapeOriginalHP;s.ailments=escapeOriginalAilments`);console.log('PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction');
tests/game.cjs:16:s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.done=false;s.area='dungeon';s.hp=[32,24,26];s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.members[1].level=13;s.members[2].level=13;delete s.members[1].known;delete s.members[2].known;Math.random=()=>0;ensureMagic();
tests/game.cjs:19:s.mp=[0,200,200];s.enemy={boss:false,units:[{id:'goblin',uid:0,hp:500},{id:'goblin',uid:1,hp:500},{id:'wolf',uid:2,hp:500}]};
tests/game.cjs:20:castMagic(1,'mahalito',0);if(s.enemy.units[0].hp!==476||s.enemy.units[1].hp!==476||s.enemy.units[2].hp!==500)throw Error('group');
tests/game.cjs:24:var beforeSleepHP=s.hp.join();enemyTurn(['fight','fight','fight']);if(s.hp.join()!==beforeSleepHP||s.enemy.units[0].sleep!==1)throw Error('sleep turn');
tests/game.cjs:26:s.hp[0]=1;s.ailments[0]={poison:true,paralysis:3};castMagic(2,'madi',0);if(s.hp[0]!==maxHP(0)||s.ailments[0].poison||s.ailments[0].paralysis)throw Error('restore');
tests/game.cjs:27:s.hp[0]=0;var mp=s.mp[2];castMagic(2,'dios',0);if(s.hp[0]||s.mp[2]!==mp)throw Error('no revive');
tests/game.cjs:28:s.hp[0]=10;s.cells[s.pos].chest={gold:3,opened:false,trap:'poison'};castMagic(2,'calfo',null);if(currentChest().reading!=='毒'||currentChest().trap!=='poison'||currentChest().opened)throw Error('identify');delete s.cells[s.pos].chest;
tests/game.cjs:31:`);drain();run(`enterTown();if(s.light)throw Error('town light');`);console.log('PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp');
tests/game.cjs:43:s.floor=1;s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={boss:false,units:[{id:'slime',uid:0,hp:1,rewarded:false},{id:'slime',uid:1,hp:999,rewarded:false}],target:0};s.commands=['fight','guard','guard'];Math.random=()=>.99;attack();
tests/game.cjs:49:s.enemy={boss:false,chestBattle:true,lootGold:0,units:[{id:'slime',uid:0,hp:1,rewarded:false},{id:'slime',uid:1,hp:1,rewarded:false}],target:0};s.members[1].known.push('mahalito');s.mp[1]=100;s.magicPlans[1]={id:'mahalito',target:0};s.commands=['guard','spell','guard'];attack();if(s.enemy!==null||s.commands.some(c=>c!=='fight')||s.magicPlans.some(Boolean))throw Error('spell reset');if(!drawEnemies().includes('data-enemy-uid="0"')||!drawEnemies().includes('data-enemy-uid="1"'))throw Error('last battle early removal');
tests/game.cjs:58:drain();run(`s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;s.area='dungeon';s.floor=1;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.cells.forEach(c=>{c.type='';c.trap=false;c.open=true;c.flag=false;delete c.chest});Math.random=()=>.99;`);
tests/game.cjs:64:run(`s.pos=size()*3+3;s.dir=0;var stay=s.pos;s.enemy={boss:false,units:[{id:'slime',uid:0,hp:10}]};move('strafeRight');if(s.pos!==stay)throw Error('combat strafe');s.enemy=null;s.pendingStairs=true;move('strafeRight');if(s.pos!==stay)throw Error('stairs strafe');s.pendingStairs=false;
tests/game.cjs:66:render();if(!$('#gametitle').hidden||$('#party').innerHTML.includes('data-inventory')||$('#party').innerHTML.includes('<span>MP ')||$('#party').innerHTML.includes('⚔'))throw Error('compact UI');s.area='town';render();if($('#gametitle').hidden)throw Error('town title');
tests/game.cjs:69:s.area='dungeon';s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;delete s.cells[s.pos].chest;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.cells[s.pos].type='';Math.random=()=>.999;encounter(s.pos);
tests/game.cjs:74:`);drain();run(`s.enemy=null;render();if($('.controls').hidden)throw Error('exploration controls');s.inventory[0]=['healingPotion','sword','helm','antidote'];s.equipped[0]=1;s.armor[0]={head:2,body:null,feet:null};s.hp[1]=1;var medicineMP=s.mp.join();Math.random=()=>.999;if(!useMedicine(0,0,1)||s.hp[1]!==9||s.inventory[0].length!==3||s.equipped[0]!==0||s.armor[0].head!==1||s.mp.join()!==medicineMP)throw Error('healing medicine / equipment indices');`);drain();run(`s.ailments[1].poison=true;if(!useMedicine(0,2,1)||s.ailments[1].poison||s.inventory[0].length!==2)throw Error('antidote');`);drain();run(`s.inventory[0].push('healingPotion');s.hp[1]=maxHP(1);if(useMedicine(0,2,1)||s.inventory[0].length!==3)throw Error('wasted medicine');`);drain();run(`s.hp[1]=1;s.enemy={boss:false,units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['item','guard','guard'];s.itemPlans[0]={slot:2,target:1,id:'healingPotion'};Math.random=()=>0;var medicineMP=s.mp.join();attack();if(s.inventory[0].length!==2||s.commands.some(c=>c!=='fight')||s.itemPlans.some(Boolean)||s.mp.join()!==medicineMP)throw Error('battle medicine');`);drain();run(`s.enemy=null;s.inventory[0]=['sword'];Math.random=()=>0;dropMedicine();if(s.inventory[0][1]!=='healingPotion')throw Error('medicine drop');var rolls=[0,.99];Math.random=()=>rolls.shift()??.99;dropMedicine();if(s.inventory[0][2]!=='antidote')throw Error('antidote drop');ensureProfile();if(s.inventory[0][2]!=='antidote')throw Error('medicine migration');`);drain();
tests/game.cjs:80:s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss,expectedFormation=monsterFormation(true);if(expectedFormation.length!==2||expectedFormation[0]!=='guardian'||expectedFormation[1]==='guardian')throw Error('guardian escort encounter');Math.random=()=>.999;encounter(s.boss);s.enemy.units.forEach(e=>e.row=e.id==='guardian'?0:1);s.enemy.boss=true;s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');Math.random=()=>.999;
tests/game.cjs:82:if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=s.members.map(()=>0);s.commands=s.members.map(()=> 'fight');attack();`);drain();run(`if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
tests/game.cjs:84:var inventoryBefore=JSON.stringify(s.inventory),goldBefore=s.gold,xpBefore=s.members.map(m=>m.xp).join();enterTown();if(s.area!=='town'||s.floor!==1||Object.keys(s.floors).length||s.cells.some(c=>c.open||c.flag||c.spent||c.disarmed)||s.cells[s.boss].type!=='boss')throw Error('town reset all floors');if(JSON.stringify(s.inventory)!==inventoryBefore||s.gold!==goldBefore||s.members.map(m=>m.xp).join()!==xpBefore)throw Error('town reset profile');enterDungeon();if(s.cells.filter(c=>c.open).length!==1||!s.cells[s.start].open)throw Error('new expedition');
tests/game.cjs:87:s.enemy={units:[{id:'wolf',uid:0,row:0,hp:0},{id:'wolf',uid:1,row:0,hp:10},{id:'wolf',uid:2,row:0,hp:20},{id:'slime',uid:3,row:1,hp:10}],target:2};s.attackRows=[0,1,0];if(selectedEnemy(0).uid!==1||selectedEnemy(1).uid!==3)throw Error('first living per row');s.enemy.units[1].hp=0;if(selectedEnemy(0).uid!==2)throw Error('advance within row');s.enemy.units[2].hp=0;if(selectedEnemy(0)!==undefined)throw Error('do not switch rows mid turn');
tests/game.cjs:88:`);console.log('PASS guardian gates / same-tile stairs, floor round trips and town reset, profile retention, XP +15% migration once, first living target and empty-row action');
tests/game.cjs:90:s.enemy=null;s.cells.forEach(c=>c.flag=false);var ts=s.cells.filter(c=>c.trap);ts[0].flag='power';ts[1].flag='guard';ts[2].flag='magic';var ef=flagEffect();if(ef.counts.power!==1||ef.counts.guard!==1||ef.counts.magic!==1)throw Error('typed flags');s.flagKind='guard';if(placedFlag(ts[0])!=='power')throw Error('recolor');Math.random=()=>0;s.enemy={units:[{id:'slime',uid:0,hp:10}],flagEffect:ef};if(flagDamage(20)!==30||flagDamage(20,true)!==10)throw Error('mixed procs');s.mp[1]=10;flagConsumeMP(1,3);if(s.mp[1]!==8)throw Error('half MP combat');s.enemy=null;flagConsumeMP(1,3);if(s.mp[1]!==6)throw Error('half MP field');s.cells.find(c=>!c.trap).flag='guard';s.enemy={units:[{id:'slime',uid:0,hp:10}],flagEffect:flagEffect()};if(flagDamage(20)!==20||flagDamage(20,true)!==30||escapeChance()!==0)throw Error('mixed curse');s.enemy=null;
tests/game.cjs:96:for (const [r,kind] of [[.1,'needle'],[.3,'blast'],[.6,'poison'],[.8,'paralysis'],[.95,'teleport']]){drain();run(`s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.done=false;var orig=s.pos,c=s.cells[orig];c.trap=true;Math.random=()=>${r};triggerFloorTrap(c);if(c.trap||!c.spent||c.trapKind!=='${kind}')throw Error('trap consume');if('${kind}'==='needle'&&s.hp.filter((h,i)=>h<maxHP(i)).length!==1)throw Error('single damage');if('${kind}'==='blast'&&s.hp.some((h,i)=>h>=maxHP(i)))throw Error('party damage');if('${kind}'==='poison'&&s.ailments.some(a=>!a.poison))throw Error('poison gas');if('${kind}'==='paralysis'&&!s.ailments.some(a=>a.paralysis>0))throw Error('paralysis');if('${kind}'==='teleport'&&(s.pos===orig||s.cells[s.pos].type||s.cells[s.pos].trap||!s.cells[s.pos].open||s.enemy||s.pendingStairs))throw Error('safe teleport');`)}
tests/game.cjs:98:s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}],target:0};resetCommandEntry();render();if(!$('#commandentry').innerHTML.includes('戦士：行動')||!$('#attack').hidden)throw Error('first prompt');s.commands[0]='guard';confirmCommand(0);if(!$('#commandentry').innerHTML.includes('魔法使い：行動'))throw Error('second prompt');confirmCommand(1);if(!$('#commandentry').innerHTML.includes('僧侶：行動'))throw Error('third prompt');confirmCommand(2);if($('#attack').hidden||!$('#commandreviewpopup').innerHTML.includes('<td>守る</td>'))throw Error('review');resetCommandEntry();s.hp[0]=0;s.ailments[1].paralysis=3;render();if(!$('#commandentry').innerHTML.includes('僧侶：行動'))throw Error('skip incapacitated');
tests/game.cjs:101:s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.mp=[0,100,100];s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.area='dungeon';s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}]};resetCommandEntry();render();
tests/game.cjs:109:drain();run(`s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}],target:0};resetCommandEntry();confirmCommand(0);confirmCommand(1);confirmCommand(2);if(!$('#flee').hidden||$('#attack').hidden||!$('#commandreviewpopup').innerHTML.includes('<table')||$('#commandentry').innerHTML.includes('data-edit-command'))throw Error('review layout');$('#commandentry').onclick({target:{closest:q=>q==='[data-command-back]'?{}:null}});if(commandIndex!==2||!$('#attack').hidden||$('#flee').hidden)throw Error('review back');if(spellTargetButtons(magic('halito')).includes('<span>'))throw Error('target grid extra cell');`);console.log('PASS review table, back to final member, hidden flee in review, aligned target grid');
tests/game.cjs:111:drain();run(`s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;s.area='dungeon';s.cells[s.pos].chest={opened:false};s.members[2].known.push('calfo');s.mp[2]=10;s.hp[2]=20;s.ailments[2].paralysis=0;if(calfoCaster()!==2)throw Error('chest calfo available');s.mp[2]=0;if(calfoCaster()!==-1)throw Error('calfo insufficient MP');s.mp[2]=10;s.ailments[2].paralysis=1;if(calfoCaster()!==-1)throw Error('calfo paralysis');s.ailments[2].paralysis=0;delete s.cells[s.pos].chest;if(calfoCaster()!==-1)throw Error('no chest');s.light=true;s.pos=3*size()+3;for(let d=0;d<4;d++){s.dir=d;let ids=diagonalSight();if(ids.length!==2||ids.some(i=>!around(s.pos).includes(i)||adjacent(s.pos,i)))throw Error('diagonal direction');}s.pos=0;s.dir=0;if(diagonalSight().some(i=>i!==-1)||distantSight())throw Error('outer wall');s.pos=3*size()+3;scene();if(!$('#scene').innerHTML.includes('class="透視"')||$('#scene').innerHTML.includes('歩先'))throw Error('SVG light view');s.light=false;if(diagonalSight().length||distantSight())throw Error('light off');s.cells[s.pos].open=true;s.cells[s.pos+1].open=true;for(let i of around(s.pos).slice(0,2))s.cells[i].trap=true;s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}]};scene();if($('#scene').innerHTML.includes('>2</text>')||$('#scene').innerHTML.includes('>1</text>'))throw Error('combat scene trap numbers');s.enemy=null;scene();if(!$('#scene').innerHTML.includes('>2</text>'))throw Error('exploration scene number restored');`);console.log('PASS chest Calfo availability, all-facing diagonal sight and wall boundaries');
tests/game.cjs:115:s.members[4].xp=123;s.inventory[4].push('runestaff');s.equipped[4]=1;s.armor[4]={};var mageID=s.members[4].id;s.area='town';reorderParty([4,1,2,3,0,5]);if(jobOf(0)!==1||s.members[0].id!==mageID||s.members[0].xp!==123||equippedWeapon(0).id!=='runestaff'||effectiveAC(0)!==9)throw Error('formation profile identity');
tests/game.cjs:116:s.area='dungeon';if(reorderParty([0,1,2,3,4,5]))throw Error('field formation');s.mp[0]=100;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}]};s.cells.forEach(c=>c.flag=false);Math.random=()=>.5;var enemyBefore=s.enemy.units[0].hp;castMagic(0,'halito',0);if(s.enemy.units[0].hp>=enemyBefore||s.mp[0]!==98)throw Error('reordered spell');
tests/game.cjs:118:s.enemy=null;s.area='town';let records=partyRecords();if(!setPartyFromRoster(records,[0,1,2,3,4,-1])||s.reserve.length!==1||thiefMember()!==-1)throw Error('bench thief');var all=[...partyRecords(),...s.reserve];if(!setPartyFromRoster(all,[0,1,2,3,4,5])||thiefMember()!==5)throw Error('restore thief');var saved=JSON.stringify(s);s=JSON.parse(saved);ensureProfile();if(s.members.length!==6||equippedWeapon(0).id!=='runestaff')throw Error('reload six');
tests/game.cjs:120:`);drain();run(`if(s.logs[0]!=='前方は罠の可能性あり')throw Error('survey correct');Math.random=()=>.99;castMagic(0,'dumapic',null);if(s.mp[0]!==94||spellCost(magic('dumapic'))!==8)throw Error('survey double');`);drain();run(`if(s.logs[0]!=='前方にはなにもない')throw Error('survey wrong');s.cells[target()].open=true;castMagic(0,'dumapic',null);if(s.mp[0]!==86||s.dumapicUses!==3)throw Error('failed survey cost');`);drain();run(`if(s.logs[0]!=='調査に失敗した。')throw Error('explored survey');s.dumapicUses=4;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.dumapicUses!==4||s.commands.length!==6||s.magicPlans.length!==6)throw Error('floor profile preservation');enterTown();if(s.dumapicUses!==0)throw Error('survey town reset');`);drain();run(`
tests/game.cjs:121:s.area='dungeon';s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.cells[s.pos].chest={gold:10,trap:'poison',opened:false};var goldBefore=s.gold;Math.random=()=>.5;thiefOpenChest();if(currentChest()||s.gold!==goldBefore+30||s.ailments.some(a=>a.poison))throw Error('thief success');
tests/game.cjs:123:s.hp=s.members.map(m=>m.maxHP);s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['guard','guard','guard','fight','fight','fight'];var rear=s.hp.slice(3).join(),enemyBefore=s.enemy.units[0].hp;Math.random=()=>.99;attack();if(s.enemy.units[0].hp!==enemyBefore||s.hp.slice(3).join()!==rear||s.commands.length!==6)throw Error('front rear reach');
tests/game.cjs:125:s.hp=s.members.map(m=>m.maxHP);var xpBefore=s.members.map(m=>m.xp);killReward({id:'slime',hp:0,rewarded:false});if(s.members.some((m,i)=>m.xp!==xpBefore[i]))throw Error('premature xp');let earned=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members.some((m,i)=>m.xp!==xpBefore[i]+Math.max(1,Math.floor(earned/s.members.length))))throw Error('all six split xp');
tests/game.cjs:126:`);drain();run(`s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};resetCommandEntry();for(let i=0;i<6;i++){s.commands[i]='guard';confirmCommand(i)}if(commandIndex!==6||$('#attack').hidden)throw Error('six sequential');for(let [name,kind] of Object.entries({怪力:'power',堅牢:'guard',呪禁:'magic'}))if(!coloredLog(name+'の旗がはためいた！').includes('log-flag-'+kind))throw Error('flag log color');`);
tests/game.cjs:129:drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.04||flagChance({counts:{[kind]:5}},kind)!==.2||flagChance({counts:{[kind]:10}},kind)!==.4||flagChance({counts:{[kind]:100}},kind)!==.4)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, linear 4-40% flag curve');
tests/game.cjs:131:drain();run(`s.enemy={boss:false,initiative:'party',units:[{id:'goblin',uid:0,row:0,hp:100}]};s.done=false;s.hp=s.members.map(m=>m.maxHP);s.members.forEach(m=>m.level=1);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));Math.random=()=>.999;var escapeHP=s.hp.join();flee();if(!s.enemy||s.hp.join()!==escapeHP||s.enemy.initiative!=='normal')throw Error('surprise flee failure consumes free turn');`);drain();console.log('PASS failed escape consumes party surprise without enemy retaliation');
tests/game.cjs:132:drain();run(`s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0,sleep:0}));displayVitals=null;if(ailmentTags(0)!=='')throw Error('normal status hidden');displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};s.hp[0]=0;s.ailments[1].paralysis=2;if(ailmentTags(0)||ailmentTags(1))throw Error('status shown before log');displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};if(!ailmentTags(0).includes('死亡')||!ailmentTags(1).includes('麻痺'))throw Error('status missing at log');s.hp[0]=maxHP(0);s.ailments[1].paralysis=0;if(!ailmentTags(0).includes('死亡')||!ailmentTags(1).includes('麻痺'))throw Error('status recovery shown early');displayVitals=null;if(ailmentTags(0)||ailmentTags(1))throw Error('status recovery');`);console.log('PASS status tags follow displayed HP/ailments through damage and recovery');
tests/game.cjs:133:drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='town';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.gold=500;buy('shortbow',5);equip(5,1);if(equippedWeapon(5).id!=='shortbow'||!canWeaponAttack(5)||canWeaponAttack(4))throw Error('ranged equip/rear reach');var price=s.gold;buy('shortbow',4);if(s.gold!==price)throw Error('bow class lock');s.area='dungeon';s.cells.forEach(c=>{c.flag=false;delete c.chest});s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999,rewarded:false}],initiative:'party'};s.commands=s.members.map(()=> 'guard');s.commands[5]='fight';s.attackRows=s.members.map(()=>0);Math.random=()=>.999;var oldEnemyHP=s.enemy.units[0].hp;attack();if(s.enemy.units[0].hp>=oldEnemyHP)throw Error('rear bow no damage');`);drain();run(`s.enemy.initiative='party';s.equipped[5]=0;s.commands=s.members.map(()=> 'guard');s.commands[5]='fight';var oldEnemyHP=s.enemy.units[0].hp;attack();if(s.enemy.units[0].hp!==oldEnemyHP)throw Error('rear melee reached');`);drain();run(`s.equipped[5]=1;s.enemy.initiative='party';resetCommandEntry();commandIndex=5;renderCommandEntry();if(!$('#commandentry').innerHTML.includes('data-command-choice="fight"'))throw Error('rear bow UI');var mage=s.members.findIndex((m,i)=>jobOf(i)===1);s.mp[mage]=20;var oldMP=s.mp[mage],surveyCount=s.dumapicUses||0;if(castMagic(mage,'dumapic',null)||s.mp[mage]!==oldMP||(s.dumapicUses||0)!==surveyCount)throw Error('battle survey executed');spellMember=mage;spellBrowse=false;renderMagic();if(!/data-spell="dumapic" disabled/.test($('#magiclist').innerHTML))throw Error('survey not disabled');`);drain();run(`s.enemy=null;s.area='dungeon';s.members[0].xp=requiredXP(s.members[0].level+1,0);$('#leveldialog').open=false;enterTown();if(!$('#leveldialog').open||!$('#levelreport').textContent.includes('戦士Ⅰ'))throw Error('level popup missing');$('#leveldialog').close();render();if($('#leveldialog').open)throw Error('popup reopened on render');enterTown();if($('#leveldialog').open)throw Error('popup without level gain');`);console.log('PASS ranged shop/class/rear damage/UI, melee rear restriction, battle survey disabled/no spend and once-per-return level popup');
tests/game.cjs:134:drain();run(`s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.hp=s.members.map(()=>100);s.ailments=s.members.map(()=>({}));Math.random=()=>0;var beforeTrap=s.hp.slice();triggerFloorTrap(s.cells[s.pos]);if(logQueue[0].text!=='罠だ！'||!logQueue[0].trap||logQueue[0].hp.join()!==beforeTrap.join()||s.hp[0]!==93)throw Error('trap sequence/damage');`);timers.shift()();run(`if(encounterNotice!=='！'||displayVitals.hp[0]!==100)throw Error('trap warning snapshot');`);drain();run(`s.cells[s.pos].chest={opened:false,gold:1};log('敵を倒した。');render();if(!$('#chestactions').hidden)throw Error('chest spoiler');`);drain();run(`if($('#chestactions').hidden)throw Error('chest not revealed after logs');`);console.log('PASS trap warning before damage and chest reveal after log playback');
tests/game.cjs:144:  s.enemy={units:[10,20,30].map((row,uid)=>({id:'slime',row,uid,hp:100,rewarded:false}))};
tests/game.cjs:158:  s.enemy.units[0].hp=0;s.enemy.units[0].rewarded=true;
tests/game.cjs:164:drain();run(`{let savedNamesState=structuredClone(s);s.area='town';s.enemy=null;s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.cells[s.pos].chest=null;s.members=[];s.reserve=[];for(let name of ['(','[x','a.b','a*']){let recruit=generateRecruit(name,0);if(!recruit||!registerRecruit(recruit))throw Error('special name register');let roster=trainingRoster(),index=roster.findIndex(r=>r.members.id===recruit.members.id);if(!setPartyFromRoster(roster,[index]))throw Error('special name join');refreshNames();if(coloredLog('テスト').includes('log-ally'))throw Error('unrelated name color');if(coloredLog('aXbの攻撃').includes('log-ally'))throw Error('regex metacharacter interpreted');s.members=[];s.reserve=[];refreshNames();}s=savedNamesState;refreshNames();}`);console.log('PASS special character names do not break log coloring or match as regex');
tests/game.cjs:165:drain();run(`s.area='dungeon';s.done=false;s.hp=s.members.map(()=>20);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.ailments[0].poison=true;var poisonBefore34=s.hp[0],count34=logQueue.length;tickAilments(false);if(s.hp[0]!==poisonBefore34-2||logQueue.length!==count34)throw Error('silent exploration poison');s.ailments[0].poison=false;s.enemy={chestBattle:false,units:[{id:'slime',uid:1,row:0,hp:0,rewarded:false},{id:'wolf',uid:2,row:1,hp:5,rewarded:false}]};var xp34=s.members[0].xp,gold34=s.gold;Math.random=()=>.99;killReward(s.enemy.units[0]);if(s.members[0].xp!==xp34||s.gold!==gold34)throw Error('premature rewards');killReward(s.enemy.units[0]);if(s.enemy.pendingXP!==enemyDefinition('slime').xp)throw Error('duplicate rewards');var reward34=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members[0].xp!==xp34+Math.max(1,Math.floor(reward34/s.members.length))||s.gold<=gold34)throw Error('victory rewards');var paid34=s.gold;awardVictory(s.enemy);if(s.gold!==paid34)throw Error('duplicate victory');`);console.log('PASS silent exploration poison and deferred victory rewards');
tests/game.cjs:166:drain();run(`s.done=false;s.area='dungeon';s.hp=s.members.map(()=>20);s.enemy={units:[{id:'wolf',uid:0,row:0,hp:10},{id:'slime',uid:1,row:1,hp:10}]};s.members.forEach(m=>m.intelligence=10);Math.random=()=>.99;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!=='素早い牙')throw Error('unknown');Math.random=()=>0;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!==enemyDefinition('wolf').name||!s.enemy.units[1].identified)throw Error('identify');Math.random=()=>.99;identifyEnemies();if(!s.enemy.units[0].identified)throw Error('identification persistence');s.enemy.units.forEach(e=>e.identified=false);identifyEnemies(true);if(!s.enemy.units.every(e=>e.identified))throw Error('identify spell effect');`);console.log('PASS identification failure, success, persistence and spell effect');
tests/game.cjs:170:function resetMonstersTest(id){s=structuredClone(savedMonstersState);s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;delete s.cells[s.pos].chest;s.hp=s.members.map(()=>1000);s.mp=s.members.map(()=>100);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.enemy={dataVersion:1,units:[{id,uid:0,row:0,hp:999,identified:true,rewarded:false}],chestBattle:false};displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;resetPartyCommands();s.commands=s.members.map(()=>'fight');}
tests/game.cjs:173:resetMonstersTest('goblin');s.enemy.chestBattle=true;s.enemy.units.push({id:'slime',uid:1,row:1,hp:0,rewarded:false});Math.random=()=>.01;killReward(s.enemy.units[1]);enemyTurn(s.commands);if(s.enemy||!s.cells[s.pos].chest||s.members[0].xp!==xp+Math.max(1,Math.floor(6/s.members.length)))throw Error('mixed escape victory');
tests/game.cjs:174:resetMonstersTest('rat');Math.random=()=>.01;enemyTurn(s.commands);if(s.enemy.units.length!==2||s.hp.some(h=>h!==1000))throw Error('summon acts same turn');for(let n=0;n<10;n++)monsterAction(s.enemy.units[0],s.commands);if(s.enemy.units.length!==5||s.enemy.summoned!==4||new Set(s.enemy.units.map(e=>e.uid)).size!==5||!logQueue.some(x=>x.text.includes('仲間を呼んだが、現れなかった。')))throw Error('battle summon cap');displayCombat=undefined;let svg=drawEnemies();if((svg.match(/data-enemy-uid/g)||[]).length!==5)throw Error('five icons');
tests/game.cjs:176:resetMonstersTest('apprentice');Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands);if(s.hp[0]!==999||s.hp.slice(1).some(h=>h!==1000))throw Error('single spell');
tests/game.cjs:177:resetMonstersTest('sorcerer');s.enemy.units[0].identified=true;s.enemy.units[0].spell=undefined;s.enemy.units[0].summoned=0;s.commands=s.members.map(()=> 'fight');let spellData=enemyDefinition('sorcerer'),oldSpellChance=spellData.spell,oldFlee=spellData.flee,oldSummon=spellData.summon,oldDice=dice;spellData.spell=1;spellData.flee=spellData.summon=0;Math.random=()=>.5;dice=()=>({value:16,text:''});monsterAction(s.enemy.units[0],s.commands);dice=oldDice;spellData.spell=oldSpellChance;spellData.flee=oldFlee;spellData.summon=oldSummon;if(s.hp.length<3||s.hp.slice(0,3).some(h=>h>=1000)||logQueue.length<2||!logQueue.some(x=>x.text.includes('マハリト')))throw Error('group spell targets all living party');
tests/game.cjs:178:resetMonstersTest('general');Math.random=()=>.99;enemyTurn(s.commands);if(logQueue.filter(x=>x.text.includes('ダメージ')).length!==2||s.hp.slice(3).some(h=>h!==1000))throw Error('multi attacks/front target');
tests/game.cjs:179:resetMonstersTest('archer');Math.random=()=>.99;enemyTurn(s.commands);if(s.hp[5]===1000||s.hp.slice(0,5).some(h=>h!==1000))throw Error('rear target');
tests/game.cjs:180:resetMonstersTest('acidslime');Math.random=()=>0;monsterOnHit(s.enemy.units[0],0);if(!s.ailments[0].poison||!s.ailments[0].paralysis)throw Error('multiple afflictions');
tests/game.cjs:181:resetMonstersTest('rabbit');Math.random=()=>0;monsterOnHit(s.enemy.units[0],0);if(s.hp[0]!==0)throw Error('instant death');
tests/game.cjs:182:resetMonstersTest('terror');s.members[0].level=5;s.members[0].maxHP=100;s.members[0].maxMP=0;s.members[0].xp=10000;Math.random=()=>0;monsterOnHit(s.enemy.units[0],0);if(s.members[0].level!==4||s.members[0].xp!==requiredXP(4,0)||s.hp[0]>s.members[0].maxHP||s.members[0].maxMP<0)throw Error('level drain');s.members[0].level=1;monsterOnHit(s.enemy.units[0],0);if(s.members[0].level!==1)throw Error('drain floor');
tests/game.cjs:189:drain();run(`{s.done=false;s.hp=s.members.map(()=>20);s.enemy={units:[{id:'skeleton',uid:0,row:0,hp:10},{id:'wolf',uid:1,row:1,hp:10}]};let priest=s.members.findIndex((m,i)=>jobOf(i)===2),mp=s.mp[priest];Math.random=()=>0;dispelUndead(priest);if(s.enemy.units[0].hp!==0||s.enemy.units[1].hp!==10||s.enemy.pendingXP||s.mp[priest]!==mp)throw Error('dispel effect');s.enemy.units[0].hp=10;s.enemy.units[0].rewarded=false;s.enemy.units[0].escaped=false;Math.random=()=>.999;dispelUndead(priest);if(s.enemy.units[0].hp!==10)throw Error('dispel failure');}`);console.log('PASS dispel success/failure, undead only, no MP or XP');
tests/game.cjs:195:mode='move';s.logs=[];s.hp=s.members.map(()=>20);
tests/game.cjs:196:s.ailments=s.members.map(()=>({poison:false,paralysis:0}));
tests/game.cjs:198:s.pos=0;s.hp[0]=2;s.ailments[0].poison=true;Math.random=()=>.99;`);
tests/game.cjs:201:if(s.pos!==1||s.hp[0]!==0)throw Error('poison death on movement');
tests/game.cjs:204:if(poisonDeathEntries.length!==1||poisonDeathEntries[0].hp[0]!==0)throw Error('poison death log / snapshot');
tests/game.cjs:208:if(s.pos!==0||s.hp[0]!==0||logQueue.some(e=>e.text===poisonDeathText))throw Error('duplicate poison death');
tests/game.cjs:210:s.logs=[];s.hp[0]=10;cell(1);
tests/game.cjs:211:if(s.pos!==1||s.hp[0]!==8)throw Error('nonfatal poison on movement');
tests/game.cjs:215:s.hp[0]=2;tickAilments();
tests/game.cjs:216:if(s.hp[0]!==0||logQueue.filter(e=>e.text===poisonDeathText).length!==1||!logQueue.some(e=>e.text===NAMES[0]+'は毒で2ダメージ。'))throw Error('combat poison death and damage logs');`);
tests/game.cjs:222:console.log('PASS exploration poison death once with HP snapshot, silent nonfatal movement and combat poison logs');
tests/game.cjs:240:  s=structuredClone(sixInitial);ensureProfile();s.area='town';s.floor=1;s.gold=10000;
tests/game.cjs:253:  s.enemy={units:[{id:'slime',uid:0,row:0,hp:100,rewarded:false}]};Math.random=()=>.525;
tests/game.cjs:267:    s.hp=s.members.map((_,i)=>alive.includes(i)?20:0);
tests/game.cjs:280:drain();run(`if(trapPower(1)!==1||trapPower(5)!==2||trapPower(10)!==3.25||trapPower(11)!==3.25)throw Error('trap power bounds');for(let f=1;f<=10;f++){fresh(f);if(size()!==Math.min(12,6+2*f)||trapCount(f,size())!==[9,15,23,24,26,27,29,30,31,31][f-1])throw Error('floor config '+f)}s.members=s.members.slice(0,1);s.hp=[100];s.ailments=[{poison:false,paralysis:0}];Math.random=()=>0;s.floor=1;let needle=s.cells[s.pos];needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-7)throw Error('floor 1 needle baseline');s.hp[0]=100;s.floor=10;needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('floor 10 needle scaling');s.hp[0]=100;triggerChestTrap({trap:'needle'});if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('chest needle scaling');`);drain();console.log('PASS 10-floor trap configuration and scaling');
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
019b-light-ancientdragon-tuning-codex-output.md
019b-light-ancientdragon-tuning.md
019b-sim-after.txt
019b-sim-before.txt
01A-heavy-10f-final-boss-codex-output.md
01A-heavy-10f-final-boss-codex-report.md
01A-heavy-10f-final-boss.md
01A-sim-after.txt
01A-sim-before.txt

/workspace/dsw-queue/todo:
020-heavy-death-status.md
021-heavy-temple.md
022-light-lost-roster.md
023-light-inn.md
030-heavy-corpse-on-wipe.md
031-heavy-corpse-rescue.md
# 020-heavy-death-status
ティア：HEAVY　依存：011（XP分配後）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【死亡・灰・ロスト 手順1/3】死亡状態を導入し、帰還で死者が無料復活しないようにする（寺院は次の021）。

## 変更内容
- データ：`s.members[i].status`：'ok'|'dead'|'ash'|'lost'。移行（ensureProfile 内）：未設定なら、町にいれば 'ok'、迷宮内で s.hp[i]<=0 なら 'dead'、他 'ok'。控え（s.reserve の record.members）も未設定は 'ok'。
- 新規 `markDeaths()`（dist/game.js）：s.hp[i]<=0 かつ status==='ok' なら 'dead'。HP0化の全経路の末尾で呼ぶ：monsterHurt・monsterOnHit（dist/monsters.js）、床罠（dist/traps.js triggerFloorTrap）、triggerChestTrap・tickAilments・hurt（dist/game.js）。
- `enterTown()`：HP/MP全快は status==='ok' のみ。dead/ash/lost は HP0 のまま。毒・麻痺解除は全員。
- `enterDungeon()`：パーティに status!=='ok' がいれば入場せず「死亡したメンバーを外してください。」をlog。
- `visibleAilments(i)`：status が dead/ash/lost なら 死亡/灰/ロスト を表示。
- 「帰還で全員回復」前提の既存テストは新仕様に合わせて修正し理由をコメント。docs/SPECIFICATION.md 3章を更新（本作の暫定仕様と明記）。
- 触らない：戦闘式、XP、寺院（まだ作らない）、セーブキー名。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：戦闘でHP0→status 'dead'→帰還後もHP0。deadを含むパーティは入場不可、酒場で外せば入場可。旧セーブ（statusなし）で例外なし、町では全員ok。セーブ→リロードで保持。
- 手動：迷宮で1人死亡→帰還→その人がHP0「死亡」表示のまま。

exec
/bin/bash -lc "sed -n '1,100p' tests/game.cjs; cat tests/training.cjs; cat dist/party.js" in /workspace/dungeonsweeper
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

exec
/bin/bash -lc "cat dist/monsters.js dist/traps.js; rg -n 'function (log|flushLog|levelUp|shownMember|ensureSixParty|ensureStats|rosterSaveState|restoreRoster|setPartyFromRoster|generateRecruit)|hp\\[.*=' dist/*.js" in /workspace/dungeonsweeper
exec
/bin/bash -lc "rg --files tests; sed -n '35,62p' dist/game.js; sed -n '72,85p' dist/game.js; ls /workspace; cat /workspace/dsw-queue/report/01A-heavy-10f-final-boss-codex-report.md" in /workspace/dungeonsweeper
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
 if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){
  s.relic=true;
  if(s.floor===MAX_FLOOR&&defeated.some(e=>e.id==='labyrinthlord')){
   s.cells[s.boss].type='';s.pendingStairs=false;s.cleared=true;s.clearNotice=true;
   log('迷宮の主は倒れた。迷宮に静寂が戻った……');
  }else if(s.floor<MAX_FLOOR){s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log(`地下${s.floor+1}階に移動しますか？`)}
 }
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
const FLOOR_TRAPS=[{id:'needle',name:'針',weight:25},{id:'blast',name:'爆発',weight:25},{id:'poison',name:'毒霧',weight:20},{id:'paralysis',name:'麻痺の針',weight:15},{id:'teleport',name:'転移',weight:15}];
function triggerFloorTrap(c){log('罠だ！',{trap:true});let roll=Math.random()*100,t=FLOOR_TRAPS.find(t=>(roll-=t.weight)<0)||FLOOR_TRAPS[0];c.trap=false;c.spent=true;c.trapKind=t.id;let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;displayVitals??={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};
 if(t.id==='needle'){let n=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-n);log(`針の罠！ ${NAMES[i]}に${n}ダメージ。`)}
 else if(t.id==='blast'){let n=Math.max(1,Math.floor(dice(2,6,3).value*trapPower(s.floor)));for(let j of alive)s.hp[j]=Math.max(0,s.hp[j]-n);log(`爆発の罠！ 全員に${n}ダメージ。`)}
 else if(t.id==='poison'){log('毒霧の罠！ 毒霧が噴き出した。');for(let j of alive)afflict(j,'poison')}
 else if(t.id==='paralysis'){log('麻痺の針の罠！ 針が飛び出した。');afflict(i,'paralysis')}
 else {let candidates=s.cells.map((v,j)=>j!==s.pos&&!v.type&&!v.trap&&!v.flag&&!v.chest?j:-1).filter(j=>j>=0);if(candidates.length){s.previousPos=s.pos;s.pos=candidates[Math.random()*candidates.length|0];s.cells[s.pos].open=true;log('転移の罠！ 一行は別の部屋に飛ばされた。');log(`警告：周囲に罠が${num(s.pos)}個。`)}else log('転移の罠は不発に終わった。')}
 if(s.hp.every(h=>h===0))defeat();return t.id==='teleport';
}
dist/items.js:22: if(!w||w.kind!=='medicine'||(expectedId&&w.id!==expectedId)||s.hp[i]<=0||s.ailments[i].paralysis||!Number.isInteger(target)||s.hp[target]<=0||s.done||(!inTurn&&(!canChooseMedicine(i)||s.enemy)))return false;
dist/items.js:24: if(heal&&s.hp[target]>=maxHP(target)){log(NAMES[target]+'のHPは満タンだ。');return false}
dist/items.js:29: if(heal){let before=s.hp[target];s.hp[target]=Math.min(maxHP(target),before+dice(...magic(w.spell).value).value);log(NAMES[target]+'のHPが'+(s.hp[target]-before)+'回復した。')}
dist/items.js:38: $('#medicineuse').onclick=()=>{let i=medicineMember,slot=+$('#medicineitem').value,target=+$('#medicinetarget').value,w=weapon(s.inventory[i][slot]);if(!canChooseMedicine(i)||w?.kind!=='medicine'||s.hp[target]<=0)return;if(s.enemy){s.itemPlans[i]={slot,target,id:w.id};s.commands[i]='item'}else useMedicine(i,slot,target);$('#medicinedialog').close();if($('#inventorydialog').open)$('#inventorydialog').close();if(!s.enemy&&$('#statsdialog').open)$('#statsdialog').close();s.enemy?confirmCommand(i):render()};
dist/traps.js:3: if(t.id==='needle'){let n=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-n);log(`針の罠！ ${NAMES[i]}に${n}ダメージ。`)}
dist/traps.js:4: else if(t.id==='blast'){let n=Math.max(1,Math.floor(dice(2,6,3).value*trapPower(s.floor)));for(let j of alive)s.hp[j]=Math.max(0,s.hp[j]-n);log(`爆発の罠！ 全員に${n}ダメージ。`)}
dist/spells.js:35:function spellReason(i,x){if(!s.members[i].known.includes(x.id))return s.members[i].level<x.level?`Lv.${x.level}で解禁`:'未習得';if(s.hp[i]<=0)return '死亡';if(s.ailments[i].paralysis>0)return '麻痺';if(s.area!=='dungeon'||s.done||s.pendingBoss||s.pendingStairs)return '今は使用不可';let ctx=magicContext();if(x.where!==ctx&&!(x.where==='both'&&(ctx==='battle'||ctx==='field')))return {battle:'戦闘専用',field:'探索専用',chest:'宝箱専用'}[x.where]||'今は使用不可';if(s.mp[i]<spellCost(x))return 'MP不足';return ''}
dist/spells.js:36:function validMagicTarget(x,t){if(x.target==='ally')return Number.isInteger(t)&&s.hp[t]>0;if(x.target==='enemy'||x.target==='group')return !!s.enemy?.units.some(e=>e.uid===t&&e.hp>0);if(x.target==='floor')return Number.isInteger(t)&&(t===s.floor||!!s.floors[t]);return true}
dist/spells.js:41: else if(x.effect==='heal'||x.effect==='restore'){let before=s.hp[t];s.hp[t]=x.effect==='restore'?maxHP(t):Math.min(maxHP(t),s.hp[t]+dice(...x.value).value);if(x.effect==='restore')s.ailments[t]={poison:false,paralysis:0,sleep:0};log(`${NAMES[t]}のHPが${s.hp[t]-before}回復した。`)}
dist/game.js:5:function identifyEnemies(force=false){if(!s.enemy)return;let chance=Math.min(1,Math.max(0,...s.members.map((m,i)=>s.hp[i]>0?(m.intelligence||0)*.03:0)));for(const g of enemyGroups(s.enemy)){if(!g.units.some(e=>e.hp>0)||g.units.some(e=>e.identified))continue;if(force||Math.random()<chance){for(const e of g.units)e.identified=true}}}
dist/game.js:10:function attackRowUI(i){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat).filter(g=>g.units.some(e=>!e.rewarded)),chosen=s.attackRows[i];if(!groups.some(g=>String(g.key)===String(chosen)))chosen=groups[0]?.key;return `<label class="attackrow"><span class="sr-only">${NAMES[i]}の攻撃対象の列</span><select data-attack-row="${i}" ${logBusy()||s.commands[i]!=='fight'||s.hp[i]<=0?'disabled':''}>${groups.map(g=>`<option value="${g.key}" ${String(chosen)===String(g.key)?'selected':''}>${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>!e.rewarded).length}</option>`).join('')}</select></label>`}
dist/game.js:15:function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
dist/game.js:28:function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0,survivors=s.members.filter((_,i)=>s.hp[i]>0).length,share=xp>0&&survivors>0?Math.max(1,Math.floor(xp/survivors)):0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=share;if(share)log(`生存者は経験値${share}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}
dist/game.js:30:function attack(){if(logBusy()||!s.enemy||s.done)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}identifyEnemies();let cmds=s.commands.slice();log('── ターン開始 ──');for(let i=0;i<s.members.length;i++)if(s.hp[i]>0&&cmds[i]==='guard')log(`${NAMES[i]}は身を守る。`);for(let i=0;i<s.members.length;i++){if(s.hp[i]<=0)continue;if(s.ailments[i].paralysis>0){log(`${NAMES[i]}は麻痺して動けない。`);continue}if(cmds[i]==='guard')continue;if(cmds[i]==='dispel'){dispelUndead(i);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(cmds[i]==='item'){let plan=s.itemPlans[i];if(plan)useMedicine(i,plan.slot,plan.target,true,plan.id);continue}if(cmds[i]==='spell'){let plan=s.magicPlans[i];if(plan){let x=magic(plan.id),t=plan.target;if(x&&(x.target==='enemy'||x.target==='group')&&!validMagicTarget(x,t)){let original=s.enemy.units.find(e=>e.uid===t);t=s.enemy.units.find(e=>e.hp>0&&original&&rowKey(e)===rowKey(original))?.uid??s.enemy.units.find(e=>e.hp>0)?.uid}castMagic(i,plan.id,t)}else log(`${NAMES[i]}の呪文が選ばれていない。`);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(!canWeaponAttack(i)){log(`${NAMES[i]}の近接攻撃は後衛から届かない。`);continue}let e=selectedEnemy(i);if(!e){log(`${NAMES[i]}の攻撃対象の列は全滅している。`);continue;}let d=enemyDefinition(e.id);let result=physicalAttack(i,e);if(!result.hitsCount){log(`${NAMES[i]}の攻撃は${enemyDisplay(e)}にかわされた。`);continue}let damage=flagDamage(result.damage);e.hp=Math.max(0,e.hp-damage);log(`${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。`);if(e.hp===0)killReward(e);if(!s.enemy.units.some(e=>e.hp>0))break}if(!s.enemy.units.some(e=>e.hp>0)){finishMonsterBattle()}else if(s.enemy.initiative==='party'){s.enemy.initiative='normal'}else{enemyTurn(cmds)}resetCommandEntry();resetPartyCommands();if(s.enemy){let next=s.enemy.units.find(e=>e.hp>0);s.attackRows=s.attackRows.map(key=>s.enemy.units.some(e=>String(rowKey(e))===String(key)&&e.hp>0)?key:rowKey(next))}render()}
dist/game.js:31:function ensureStats(){if(!s.members){s.members=CLASSES.slice(0,3).map(c=>({level:1,xp:0,maxHP:c.hp,maxMP:c.mp,attack:c.attack,ac:c.ac}));s.mp=CLASSES.slice(0,3).map((c,i)=>i===1?Math.min(c.mp,(s.spell===undefined?c.mp:s.spell*SPELLS.blast.cost)):i===2?Math.min(c.mp,(s.heal===undefined?c.mp:s.heal*SPELLS.heal.cost)):0);if(s.area==='town')s.mp=s.members.map(m=>m.maxMP);delete s.spell;delete s.heal}s.mp??=s.members.map(m=>m.maxMP);if(s.enemy&&!s.enemy.units){let old=s.enemy,id=old.boss?'guardian':'skeleton';s.enemy={boss:old.boss,target:0,units:[{id,uid:0,hp:old.hp,rewarded:false}]}}}
dist/game.js:32:function shownMember(i){return displayVitals?.members?.[i]||s.members[i]}
dist/game.js:34:function levelUp(){let reports=[];s.members.forEach((m,i)=>{let old={...m};while(m.level<LEVEL_CAP&&m.xp>=requiredXP(m.level+1,i)){m.level++;m.maxHP+=dice(...memberClass(i).hpGrowth).value;m.maxMP+=dice(...memberClass(i).mpGrowth).value;m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));let learned=learnMagic(i,m.level);if(learned.length)reports.push(`${NAMES[i]}は${learned.join("・")}を習得した。`);}if(m.level!==old.level)reports.push(`${NAMES[i]} Lv.${old.level} → ${m.level}　HP +${m.maxHP-old.maxHP} / MP +${m.maxMP-old.maxMP} / STR +${m.str-(old.str??strengthFor(jobOf(i),old.level))}`)});s.levelReport=reports}
dist/game.js:82:function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
dist/game.js:84:function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
dist/game.js:97:function enemyTurn(cmds){for(const e of s.enemy.units.filter(e=>e.hp>0)){if(s.hp.every(h=>h<=0))break;if(e.sleep>0){e.sleep--;log(`${enemyDisplay(e)}は眠っている。`);continue}if(monsterAction(e,cmds))continue;let d=enemyDefinition(e.id);for(let n=0;n<d.swings;n++){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),front=alive.filter(i=>i<3),pool=d.rear||!front.length?alive:front;if(!pool.length)break;let i=pool[Math.random()*pool.length|0];if(!hits(d.hit,effectiveAC(i))){log(`${NAMES[i]}は${enemyDisplay(e)}の攻撃をかわした。`);continue}monsterHurt(i,dice(...d.attack).value,cmds,enemyDisplay(e));if(s.hp[i]>0)monsterOnHit(e,i)}}if(s.hp.every(h=>h===0)){defeat();return}if(!s.enemy.units.some(e=>e.hp>0))finishMonsterBattle()}
dist/game.js:100:function escapeChance(){if(!s.enemy||s.enemy.boss||s.enemy.flagEffect?.bad)return 0;let party=s.members.reduce((a,m,i)=>{if(s.hp[i]>0&&!s.ailments[i].poison&&!s.ailments[i].paralysis){a.total+=m.level;a.count++}return a},{total:0,count:0}),enemies=s.enemy.units.reduce((a,e)=>{if(e.hp>0&&!e.sleep){a.total+=monsterLevel(e);a.count++}return a},{total:0,count:0});if(!party.count)return 10;let bonus=party.count===1?15:party.count===2?10:party.count===3?5:0,partyAverage=party.total/party.count,enemyAverage=enemies.count?enemies.total/enemies.count:0;return Math.max(10,Math.min(95,50+5*(partyAverage-enemyAverage)+bonus))}
dist/recruits.js:4:function generateRecruit(name, job) {
dist/recruits.js:21:function rosterSaveState() {
dist/recruits.js:29:function restoreRoster(state) {
dist/monsters.js:2:function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
dist/monsters.js:3:function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){let sp=d.spellInfo||{name:'ハリト',target:'one',dice:[1,8,0]};log(`${name}は${sp.name}を唱えた。`);for(let i of sp.target==='all'?alive:[alive[Math.random()*alive.length|0]])monsterHurt(i,dice(...sp.dice).value,cmds,name)}return true}return false}
dist/monsters.js:4:function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}
dist/party.js:8:function ensureSixParty(){
dist/party.js:20:function setPartyFromRoster(roster,order){let active=order.filter(i=>i>=0);if(s.area!=='town'||!idle()||active.length>6||new Set(active).size!==active.length||active.some(i=>!Number.isInteger(i)||!roster[i]))return false;for(let key of PARTY_FIELDS)s[key]=active.map(i=>roster[i][key]);s.reserve=roster.filter((r,i)=>!active.includes(i));displayVitals=null;resetPartyCommands();refreshNames();render();return true}

 succeeded in 0ms:
tests/final-boss.cjs
tests/training.cjs
tests/game.cjs
tests/training-browser.py
function renderStats(){ $('#partyreorder').disabled=!idle()||s.done; $('#statsbody').innerHTML=s.members.map((_,i)=>{let m=shownMember(i);let values=[['HP',`${(displayVitals?.hp||s.hp)[i]}/${m.maxHP}`],['MP',`${(displayVitals?.mp||s.mp)[i]}/${m.maxMP}`],['STR',m.str],['AC',effectiveAC(i)],['IQ',m.intelligence],['PIE',m.piety],['経験値',m.xp],['NEXT',m.level>=LEVEL_CAP?'上限':Math.max(0,requiredXP(m.level+1,i)-m.xp)]];return `<article class="statcard"><h3>${NAMES[i]} <small>Lv.${m.level} · ${i<3?'前衛':'後衛'}</small>${ailmentTags(i)}</h3><dl class="stat-metrics">${values.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div class="stat-actions"><button data-stat-inventory="${i}" ${!idle()?'disabled':''}>アイテム</button>${hasSpells(i)?`<button data-stat-cast="${i}" ${s.enemy||logBusy()?'disabled':''}>呪文</button>`:''}</div></article>`}).join('')}
function showLevelReport(){if(!s.levelReport?.length)return;$('#levelreport').textContent=s.levelReport.join('\n');if(!$('#leveldialog').open)$('#leveldialog').showModal()}
function canWeaponAttack(i){return i<3||equippedWeapon(i)?.range==='ranged'}
function itemDescription(w){return diceLabel(w)+(w.dice?' · '+(w.range==='ranged'?'遠距離':'近距離'):'')}
function renderCatalog(){ $('#catalogbody').innerHTML=`<table><thead><tr><th>敵</th><th>HP</th><th>攻撃</th><th>AC</th><th>経験値</th><th>群れ</th><th>金貨</th></tr></thead><tbody>${ENEMIES.map(e=>`<tr><td>${e.name}</td><td>${diceLabel({dice:e.hp})}</td><td>${diceLabel({dice:e.attack})}</td><td>${e.ac}</td><td>${e.xp}</td><td>${e.groupSize.join("〜")}体</td><td>${diceLabel({dice:e.gold})} ÷3（切捨）</td></tr>`).join('')}</tbody></table>`}
function drawEnemies(){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat),height=Math.min(130,260/groups.length);return groups.map((g,row)=>{let y=62+row*height;let visible=g.units.filter(e=>!e.rewarded);return visible.map((e,col)=>{if(e.rewarded)return '';let width=Math.min(108,560/visible.length-8),x=320+(col-(visible.length-1)/2)*(width+8);return `<g data-enemy-uid="${e.uid}"><rect x="${x-width/2}" y="${y}" width="${width}" height="${height-9}" rx="6" fill="#20271f" stroke="#66725d"/><text x="${x}" y="${y+height*.65}" text-anchor="middle" fill="#dac595" font-size="52">${enemyDefinition(e.id).icon}</text><text x="${x}" y="${y+height-18}" text-anchor="middle" fill="#dac595" font-size="16">${e.sleep>0?'Zzz':''}</text></g>`}).join('')}).join('')}
function ensureProfile(){s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members)migrateStrength(r.members,r.members.job??0);ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
function weapon(id){return WEAPONS.find(w=>w.id===id)||MEDICINES.find(w=>w.id===id)}
function equippedWeapon(i){return weapon(s.inventory[i][s.equipped[i]])}
function diceLabel(w){if(w.kind==='medicine')return w.description;if(w.part)return `${{head:"頭",body:"胴体",feet:"足"}[w.part]} AC −${w.ac}`;return `${w.dice[0]}d${w.dice[1]}${w.dice[2]?'+'+w.dice[2]:''}`}
function idle(){return !currentChest()&&!logBusy()&&!s.enemy&&!s.pendingBoss&&!s.pendingStairs}
function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));levelUp();s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render();showLevelReport()}
function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop);if(!pool.length)return;let w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
function openInventory(i){if(!idle())return;inventoryMember=i;renderInventory();$('#inventorydialog').showModal()}
function target(turn=0){const d=((s.dir||0)+turn+4)%4;const dx=[0,1,0,-1][d],dy=[-1,0,1,0][d];const x=s.pos%size()+dx,y=(s.pos/size()|0)+dy;return x<0||x>=size()||y<0||y>=size()?-1:y*size()+x}
function move(action){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;if(action==='left'||action==='right'){s.dir=(s.dir+(action==='left'?3:1))%4;render();return}let i=target(({back:2,strafeLeft:-1,strafeRight:1})[action]??0);if(i<0){log('外壁が行く手を塞いでいる。');render();return}mode='move';cell(i,action)}
function flag(i){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss||i<0)return;let c=s.cells[i];if(c.open){log('探索済みのマスには旗を立てられません。');render();return}c.flag=c.flag?false:(s.flagKind||'power');render()}
function face(i){if(i<0)return {fill:'#202722',label:'外壁',symbol:'',sub:''};let c=s.cells[i];return {color:c.flag?FLAG_COLORS[placedFlag(c)]:'#e8d2a2',fill:c.open?'#3b493c':c.safe?'#34413a':'#151f1b',label:c.open?'探索済み':c.safe?'安全確認済み':'未探索',symbol:c.open&&c.type==='boss'?'☠':c.open&&c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.flag?'⚑':c.open?(c.spent?'×':String(num(i))):c.disarmed?'✓':c.safe?'✓':'？',sub:c.disarmed?'罠を解除済み':c.spent?'作動済みの罠':c.flag?'旗あり':c.open?'周囲の罠の数':''}}
for(const id of ['mapdialog','statsdialog','leveldialog']){const d=$('#'+id);d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()})}

function isEquipped(i,slot){return s.equipped[i]===slot||Object.values(s.armor[i]).includes(slot)}
function effectiveAC(i){return memberClass(i).ac-Object.values(s.armor[i]).reduce((n,k)=>n+(weapon(s.inventory[i][k])?.ac||0),0)-(s.enemy?.partyAC||0)}
$('#resetopen').onclick=()=>$('#resetdialog').showModal();$('#resetcancel').onclick=()=>$('#resetdialog').close();$('#resetconfirm').onclick=()=>{s=null;fresh();s.area='town';s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);$('#resetdialog').close();render()};

function visibleAilments(i){let a=(displayVitals?.ailments||s.ailments)[i]||{},hp=(displayVitals?.hp||s.hp)[i];return hp<=0?[['dead','死亡']]:[[a.poison,'poison','毒'],[a.paralysis>0,'paralysis','麻痺'],[a.sleep>0,'sleep','睡眠']].filter(([active])=>active).map(([,kind,label])=>[kind,label])}
function ailmentLabel(i){return visibleAilments(i).map(([,label])=>label).join('・')||'正常'}
function ailmentTags(i){return visibleAilments(i).map(([kind,label])=>`<span class="ailment-tag ailment-${kind}">${label}</span>`).join('')}
function afflict(i,type){if(type==='poison')s.ailments[i].poison=true;else s.ailments[i].paralysis=4;log(`${NAMES[i]}は${type==='poison'?'毒':'麻痺'}に侵された。`)}
function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
agent-tools
ai-news
bl.log
bl2.log
bl52.log
blender
blender.tar.xz
blender52.tar.xz
codex-handoff
codex-tasks-v1.md
codex-tasks.md
deno.zip
denobin
dsw-queue
dsw-queue-old
dsw-scratch
dsw-valid
dungeonsweeper
dungeonsweeper-review.md
inspect.py
pp
sim
t2.py
t3.py
t_array.py
thumb.jpg
transcript.txt
verify-clone
video
wallpaper
wallpaper2
wallpaper3
wallpaper4
wallpaper5
wallpaper6
# 01A-heavy-10f-final-boss 作業報告

実装・自動回帰検証は完了。総合判定は未完了（指定の勝率条件を満たさず、ブラウザ表示も未確認）。

## 変更ファイル

- `dist/monsters.js`：10Fの迷宮の主を含む守護者戦の勝利時に `cleared=true` とクリア通知を設定。下り階段を作らず指定文を `log()` に追加。1〜9Fの階段は従来どおり。
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

codex
HPが0になる経路とセーブ形式を確認しました。死亡状態はダメージのログを記録する前に更新し、表示はログのスナップショットを参照して、死亡表示が先に出ないようにします。

外部キュー `/workspace/dsw-queue` は書込み許可範囲外のため、報告はリポジトリ内の `report/` に保存し、キューファイルの移動は未実施として明記します。

exec
/bin/bash -lc 'cat dist/party.js dist/recruits.js' in /workspace/dungeonsweeper
 succeeded in 0ms:
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
/bin/bash -lc 'cat tests/final-boss.cjs; head -n 25 tests/game.cjs; cat tests/training.cjs' in /workspace/dungeonsweeper
 succeeded in 0ms:
const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');

const g = game(null, () => .5);
assert.equal(g.run('s.cleared'), false);
assert.equal(g.run("$('#clearedmark').hidden"), true);
g.run(`const recruit=generateRecruit('冒険者',0);
registerRecruit(recruit);changeRecruitParty(recruit.members.id,true);
s.members[0].level=18;s.members[0].maxHP=9999;
Math.random=()=>.999;`);

function startBoss(floor) {
  g.run(`fresh(${floor});s.hp[0]=9999;s.pos=s.boss;encounter(s.pos,true);`);
  g.drain();
  // Real formations and attack/reward paths, with deterministic kills.
  g.run('s.enemy.units.forEach(e=>{e.hp=1;e.sleep=99});');
}
function defeatBoss() {
  let turns = 0;
  const wasCleared = g.run('s.cleared');
  while (g.run('!!s.enemy')) {
    assert.ok(++turns < 30, 'boss battle terminates');
    g.run('attack();');
    if (g.run('!!s.enemy')) {
      assert.equal(g.run('s.clearNotice'), false, 'escorts must also be defeated');
      assert.equal(g.run('s.cleared'), wasCleared, 'boss death alone cannot clear the battle');
      g.drain();
    }
  }
}

g.run(`fresh(10);s.enemy={boss:false,chestBattle:false,units:[{id:'goblin',uid:0,row:0,hp:1}]};attack();`);
g.drain();
assert.equal(g.run('s.cleared'), false, 'ordinary 10F encounters do not clear the game');
startBoss(10);defeatBoss();
assert.equal(g.run('s.cleared'), true);
assert.equal(g.run("s.cells[s.boss].type"), '');
assert.equal(g.run('s.pendingStairs'), false);
assert.equal(g.run('s.done'), false, 'clear permits continued exploration');
assert.equal(g.run("logQueue.at(-1).text"), '迷宮の主は倒れた。迷宮に静寂が戻った……');
assert.equal(g.run("$('#clearresult').hidden"), true, 'clear cannot leak before log playback');
assert.equal(g.run('travelFloor(11)'), false);
assert.equal(g.run('s.floor'), 10);
g.run('enterTown();');
assert.equal(g.run('s.area'), 'dungeon', 'return waits for battle logs');

// Reload the actual ash-v1 payload, including roster migration and startup code.
const saved = g.run("save();localStorage.getItem('ash-v1')");
const restored = game(saved);
assert.equal(restored.run('s.cleared'), true);
assert.equal(restored.run("s.cells[s.boss].type"), '');
assert.equal(restored.run("$('#clearresult').hidden"), false);
g.drain();
assert.equal(g.run("$('#clearresult').hidden"), false);
assert.equal(g.run("$('#cleartown').disabled"), true, 'resolve treasure before returning');
assert.equal(g.run('!!currentChest()'), true, 'boss treasure remains available');
g.run('abandonChest();');g.drain();
assert.equal(g.run("$('#cleartown').disabled"), false);
g.run("$('#cleartown').onclick();");
assert.equal(g.run('s.area'), 'town');
assert.equal(g.run('s.cleared'), true);
assert.equal(g.run('s.clearNotice'), false);
assert.equal(g.run("$('#clearedmark').hidden"), false);
assert.equal(g.run("$('#clearresult').hidden"), true);
const townReload = game(g.run("localStorage.getItem('ash-v1')"));
assert.equal(townReload.run('s.cleared'), true);
assert.equal(townReload.run("$('#clearedmark').hidden"), false);
g.run('enterDungeon();');g.drain();
assert.equal(g.run('s.area'), 'dungeon');
assert.equal(g.run('s.cleared'), true);

startBoss(9);defeatBoss();g.drain();
assert.equal(g.run("s.cells[s.boss].type"), 'down');
assert.equal(g.run('s.pendingStairs'), 'down');
assert.equal(g.run('s.clearNotice'), false);
g.run('answerStairs(true);');
assert.equal(g.run('s.floor'), 10);
assert.equal(g.run('s.cleared'), true, 'new floor preserves global clear flag');
startBoss(10);defeatBoss();g.drain();
assert.equal(g.run('s.clearNotice'), true);
assert.equal(g.run("s.cells[s.boss].type"), '');
g.run('travelFloor(9);');
assert.equal(g.run('s.clearNotice'), false);
assert.equal(g.run('s.cleared'), true, 'cached floor preserves global clear flag');

// Old saves may already contain a down stair or cached floors beyond 10F.
const legacy = JSON.parse(saved);
delete legacy.cleared;delete legacy.clearNotice;
legacy.cells[legacy.boss].type='down';legacy.pendingStairs='down';
legacy.floors[10]={floor:10,cells:structuredClone(legacy.cells)};
legacy.floors[11]={floor:11,cells:structuredClone(legacy.cells)};
const old = game(JSON.stringify(legacy));
assert.equal(old.run('s.cleared'), false);
assert.equal(old.run('s.pendingStairs'), false);
assert.equal(old.run("s.cells[s.boss].type"), '');
assert.equal(old.run("s.floors[10].cells.some(c=>c.type==='down')"), false);
const before = old.run('JSON.stringify(s)');
for (const target of [11,12,0,-1,1.5,NaN,Infinity]) {
  assert.equal(old.run(`travelFloor(${target},true)`), false);
  assert.equal(old.run('JSON.stringify(s)'), before, 'invalid travel leaves state intact');
}
old.run("s.cells[s.boss].type='down';s.relic=true;s.pos=s.boss;s.pendingStairs='down';answerStairs(true);");
assert.equal(old.run('s.floor'), 10, 'even an obsolete stair cannot reach 11F');
legacy.relic=true;legacy.done=true;
const oldDone = game(JSON.stringify(legacy));
assert.equal(oldDone.run("s.cells[s.boss].type"), '', 'legacy relic migration cannot recreate final stairs');
console.log('PASS final boss clear, escort completion, log timing, town/replay, 9F stairs, ash-v1 reload, legacy saves and 11F travel rejection');
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

exec
/bin/bash -lc "cat scripts/sim/harness.cjs; tail -n 8 tests/game.cjs; rg -n '全滅|refill|hp\\[0\\]=0|hp=\\[0|hp.*map.*0' tests/game.cjs; rg -n '死亡|HP.*0|帰還' /workspace/dungeonsweeper-review.md" in /workspace/dungeonsweeper
 succeeded in 0ms:
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
  }
}finally{s=savedXPState;}}`);drain();
console.log('PASS XP split 100/3=33, 100/1=100, dead exclusion, minimum 1, zero reward, no survivors, per-person log and duplicate guard');

// 10-floor trap configuration and scaling regression.
drain();run(`if(trapPower(1)!==1||trapPower(5)!==2||trapPower(10)!==3.25||trapPower(11)!==3.25)throw Error('trap power bounds');for(let f=1;f<=10;f++){fresh(f);if(size()!==Math.min(12,6+2*f)||trapCount(f,size())!==[9,15,23,24,26,27,29,30,31,31][f-1])throw Error('floor config '+f)}s.members=s.members.slice(0,1);s.hp=[100];s.ailments=[{poison:false,paralysis:0}];Math.random=()=>0;s.floor=1;let needle=s.cells[s.pos];needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-7)throw Error('floor 1 needle baseline');s.hp[0]=100;s.floor=10;needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('floor 10 needle scaling');s.hp[0]=100;triggerChestTrap({trap:'needle'});if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('chest needle scaling');`);drain();console.log('PASS 10-floor trap configuration and scaling');

require('./final-boss.cjs');
1:const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
3:s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');if(s.hp.some((h,i)=>h!==maxHP(i))||s.mp.some((h,i)=>h!==s.members[i].maxMP))throw Error('refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
6:console.log('PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
14:drain();run(`var escapeOriginalMembers=structuredClone(s.members),escapeOriginalHP=s.hp.slice(),escapeOriginalAilments=structuredClone(s.ailments);fresh(1);s.members=Array.from({length:6},(_,i)=>({...structuredClone(s.members[i%3]),level:1}));s.hp=Array(6).fill(20);s.ailments=Array.from({length:6},()=>({poison:false,paralysis:0}));s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'wolf',uid:0,hp:20}]};if(escapeChance()!==45)throw Error('escape six level 1 vs level 2');s.members.forEach(m=>m.level=10);if(escapeChance()!==90)throw Error('escape six level 10 vs level 2');s.members=s.members.slice(0,1);s.hp=s.hp.slice(0,1);s.ailments=s.ailments.slice(0,1);s.members[0].level=1;if(escapeChance()!==60)throw Error('escape one level 1 vs level 2');s.members[0].level=20;if(escapeChance()!==95)throw Error('escape upper clamp');s.hp[0]=0;if(escapeChance()!==10)throw Error('escape no eligible party');s.hp[0]=20;s.members[0].level=1;s.enemy.units[0].id='goblin';if(escapeChance()!==60)throw Error('escape one level 1 vs level 2 after eligibility restore');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members[0].level=20;s.enemy.units[0].id='wolf';if(escapeChance()!==95)throw Error('escape clamp at 95');Math.random=()=>0;var oldGold=s.gold;flee();if(s.enemy||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape');s.members=escapeOriginalMembers;s.hp=escapeOriginalHP;s.ailments=escapeOriginalAilments`);console.log('PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction');
27:s.hp[0]=0;var mp=s.mp[2];castMagic(2,'dios',0);if(s.hp[0]||s.mp[2]!==mp)throw Error('no revive');
43:s.floor=1;s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={boss:false,units:[{id:'slime',uid:0,hp:1,rewarded:false},{id:'slime',uid:1,hp:999,rewarded:false}],target:0};s.commands=['fight','guard','guard'];Math.random=()=>.99;attack();
58:drain();run(`s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;s.area='dungeon';s.floor=1;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.cells.forEach(c=>{c.type='';c.trap=false;c.open=true;c.flag=false;delete c.chest});Math.random=()=>.99;`);
69:s.area='dungeon';s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;delete s.cells[s.pos].chest;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.cells[s.pos].type='';Math.random=()=>.999;encounter(s.pos);
80:s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss,expectedFormation=monsterFormation(true);if(expectedFormation.length!==2||expectedFormation[0]!=='guardian'||expectedFormation[1]==='guardian')throw Error('guardian escort encounter');Math.random=()=>.999;encounter(s.boss);s.enemy.units.forEach(e=>e.row=e.id==='guardian'?0:1);s.enemy.boss=true;s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');Math.random=()=>.999;
82:if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=s.members.map(()=>0);s.commands=s.members.map(()=> 'fight');attack();`);drain();run(`if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
96:for (const [r,kind] of [[.1,'needle'],[.3,'blast'],[.6,'poison'],[.8,'paralysis'],[.95,'teleport']]){drain();run(`s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.done=false;var orig=s.pos,c=s.cells[orig];c.trap=true;Math.random=()=>${r};triggerFloorTrap(c);if(c.trap||!c.spent||c.trapKind!=='${kind}')throw Error('trap consume');if('${kind}'==='needle'&&s.hp.filter((h,i)=>h<maxHP(i)).length!==1)throw Error('single damage');if('${kind}'==='blast'&&s.hp.some((h,i)=>h>=maxHP(i)))throw Error('party damage');if('${kind}'==='poison'&&s.ailments.some(a=>!a.poison))throw Error('poison gas');if('${kind}'==='paralysis'&&!s.ailments.some(a=>a.paralysis>0))throw Error('paralysis');if('${kind}'==='teleport'&&(s.pos===orig||s.cells[s.pos].type||s.cells[s.pos].trap||!s.cells[s.pos].open||s.enemy||s.pendingStairs))throw Error('safe teleport');`)}
98:s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}],target:0};resetCommandEntry();render();if(!$('#commandentry').innerHTML.includes('戦士：行動')||!$('#attack').hidden)throw Error('first prompt');s.commands[0]='guard';confirmCommand(0);if(!$('#commandentry').innerHTML.includes('魔法使い：行動'))throw Error('second prompt');confirmCommand(1);if(!$('#commandentry').innerHTML.includes('僧侶：行動'))throw Error('third prompt');confirmCommand(2);if($('#attack').hidden||!$('#commandreviewpopup').innerHTML.includes('<td>守る</td>'))throw Error('review');resetCommandEntry();s.hp[0]=0;s.ailments[1].paralysis=3;render();if(!$('#commandentry').innerHTML.includes('僧侶：行動'))throw Error('skip incapacitated');
101:s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.mp=[0,100,100];s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.area='dungeon';s.enemy={units:[{id:'slime',uid:0,row:0,hp:99}]};resetCommandEntry();render();
116:s.area='dungeon';if(reorderParty([0,1,2,3,4,5]))throw Error('field formation');s.mp[0]=100;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}]};s.cells.forEach(c=>c.flag=false);Math.random=()=>.5;var enemyBefore=s.enemy.units[0].hp;castMagic(0,'halito',0);if(s.enemy.units[0].hp>=enemyBefore||s.mp[0]!==98)throw Error('reordered spell');
121:s.area='dungeon';s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.cells[s.pos].chest={gold:10,trap:'poison',opened:false};var goldBefore=s.gold;Math.random=()=>.5;thiefOpenChest();if(currentChest()||s.gold!==goldBefore+30||s.ailments.some(a=>a.poison))throw Error('thief success');
123:s.hp=s.members.map(m=>m.maxHP);s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['guard','guard','guard','fight','fight','fight'];var rear=s.hp.slice(3).join(),enemyBefore=s.enemy.units[0].hp;Math.random=()=>.99;attack();if(s.enemy.units[0].hp!==enemyBefore||s.hp.slice(3).join()!==rear||s.commands.length!==6)throw Error('front rear reach');
125:s.hp=s.members.map(m=>m.maxHP);var xpBefore=s.members.map(m=>m.xp);killReward({id:'slime',hp:0,rewarded:false});if(s.members.some((m,i)=>m.xp!==xpBefore[i]))throw Error('premature xp');let earned=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members.some((m,i)=>m.xp!==xpBefore[i]+Math.max(1,Math.floor(earned/s.members.length))))throw Error('all six split xp');
129:drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.04||flagChance({counts:{[kind]:5}},kind)!==.2||flagChance({counts:{[kind]:10}},kind)!==.4||flagChance({counts:{[kind]:100}},kind)!==.4)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, linear 4-40% flag curve');
131:drain();run(`s.enemy={boss:false,initiative:'party',units:[{id:'goblin',uid:0,row:0,hp:100}]};s.done=false;s.hp=s.members.map(m=>m.maxHP);s.members.forEach(m=>m.level=1);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));Math.random=()=>.999;var escapeHP=s.hp.join();flee();if(!s.enemy||s.hp.join()!==escapeHP||s.enemy.initiative!=='normal')throw Error('surprise flee failure consumes free turn');`);drain();console.log('PASS failed escape consumes party surprise without enemy retaliation');
132:drain();run(`s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0,sleep:0}));displayVitals=null;if(ailmentTags(0)!=='')throw Error('normal status hidden');displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};s.hp[0]=0;s.ailments[1].paralysis=2;if(ailmentTags(0)||ailmentTags(1))throw Error('status shown before log');displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};if(!ailmentTags(0).includes('死亡')||!ailmentTags(1).includes('麻痺'))throw Error('status missing at log');s.hp[0]=maxHP(0);s.ailments[1].paralysis=0;if(!ailmentTags(0).includes('死亡')||!ailmentTags(1).includes('麻痺'))throw Error('status recovery shown early');displayVitals=null;if(ailmentTags(0)||ailmentTags(1))throw Error('status recovery');`);console.log('PASS status tags follow displayed HP/ailments through damage and recovery');
133:drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='town';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.gold=500;buy('shortbow',5);equip(5,1);if(equippedWeapon(5).id!=='shortbow'||!canWeaponAttack(5)||canWeaponAttack(4))throw Error('ranged equip/rear reach');var price=s.gold;buy('shortbow',4);if(s.gold!==price)throw Error('bow class lock');s.area='dungeon';s.cells.forEach(c=>{c.flag=false;delete c.chest});s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999,rewarded:false}],initiative:'party'};s.commands=s.members.map(()=> 'guard');s.commands[5]='fight';s.attackRows=s.members.map(()=>0);Math.random=()=>.999;var oldEnemyHP=s.enemy.units[0].hp;attack();if(s.enemy.units[0].hp>=oldEnemyHP)throw Error('rear bow no damage');`);drain();run(`s.enemy.initiative='party';s.equipped[5]=0;s.commands=s.members.map(()=> 'guard');s.commands[5]='fight';var oldEnemyHP=s.enemy.units[0].hp;attack();if(s.enemy.units[0].hp!==oldEnemyHP)throw Error('rear melee reached');`);drain();run(`s.equipped[5]=1;s.enemy.initiative='party';resetCommandEntry();commandIndex=5;renderCommandEntry();if(!$('#commandentry').innerHTML.includes('data-command-choice="fight"'))throw Error('rear bow UI');var mage=s.members.findIndex((m,i)=>jobOf(i)===1);s.mp[mage]=20;var oldMP=s.mp[mage],surveyCount=s.dumapicUses||0;if(castMagic(mage,'dumapic',null)||s.mp[mage]!==oldMP||(s.dumapicUses||0)!==surveyCount)throw Error('battle survey executed');spellMember=mage;spellBrowse=false;renderMagic();if(!/data-spell="dumapic" disabled/.test($('#magiclist').innerHTML))throw Error('survey not disabled');`);drain();run(`s.enemy=null;s.area='dungeon';s.members[0].xp=requiredXP(s.members[0].level+1,0);$('#leveldialog').open=false;enterTown();if(!$('#leveldialog').open||!$('#levelreport').textContent.includes('戦士Ⅰ'))throw Error('level popup missing');$('#leveldialog').close();render();if($('#leveldialog').open)throw Error('popup reopened on render');enterTown();if($('#leveldialog').open)throw Error('popup without level gain');`);console.log('PASS ranged shop/class/rear damage/UI, melee rear restriction, battle survey disabled/no spend and once-per-return level popup');
134:drain();run(`s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.hp=s.members.map(()=>100);s.ailments=s.members.map(()=>({}));Math.random=()=>0;var beforeTrap=s.hp.slice();triggerFloorTrap(s.cells[s.pos]);if(logQueue[0].text!=='罠だ！'||!logQueue[0].trap||logQueue[0].hp.join()!==beforeTrap.join()||s.hp[0]!==93)throw Error('trap sequence/damage');`);timers.shift()();run(`if(encounterNotice!=='！'||displayVitals.hp[0]!==100)throw Error('trap warning snapshot');`);drain();run(`s.cells[s.pos].chest={opened:false,gold:1};log('敵を倒した。');render();if(!$('#chestactions').hidden)throw Error('chest spoiler');`);drain();run(`if($('#chestactions').hidden)throw Error('chest not revealed after logs');`);console.log('PASS trap warning before damage and chest reveal after log playback');
165:drain();run(`s.area='dungeon';s.done=false;s.hp=s.members.map(()=>20);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.ailments[0].poison=true;var poisonBefore34=s.hp[0],count34=logQueue.length;tickAilments(false);if(s.hp[0]!==poisonBefore34-2||logQueue.length!==count34)throw Error('silent exploration poison');s.ailments[0].poison=false;s.enemy={chestBattle:false,units:[{id:'slime',uid:1,row:0,hp:0,rewarded:false},{id:'wolf',uid:2,row:1,hp:5,rewarded:false}]};var xp34=s.members[0].xp,gold34=s.gold;Math.random=()=>.99;killReward(s.enemy.units[0]);if(s.members[0].xp!==xp34||s.gold!==gold34)throw Error('premature rewards');killReward(s.enemy.units[0]);if(s.enemy.pendingXP!==enemyDefinition('slime').xp)throw Error('duplicate rewards');var reward34=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members[0].xp!==xp34+Math.max(1,Math.floor(reward34/s.members.length))||s.gold<=gold34)throw Error('victory rewards');var paid34=s.gold;awardVictory(s.enemy);if(s.gold!==paid34)throw Error('duplicate victory');`);console.log('PASS silent exploration poison and deferred victory rewards');
166:drain();run(`s.done=false;s.area='dungeon';s.hp=s.members.map(()=>20);s.enemy={units:[{id:'wolf',uid:0,row:0,hp:10},{id:'slime',uid:1,row:1,hp:10}]};s.members.forEach(m=>m.intelligence=10);Math.random=()=>.99;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!=='素早い牙')throw Error('unknown');Math.random=()=>0;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!==enemyDefinition('wolf').name||!s.enemy.units[1].identified)throw Error('identify');Math.random=()=>.99;identifyEnemies();if(!s.enemy.units[0].identified)throw Error('identification persistence');s.enemy.units.forEach(e=>e.identified=false);identifyEnemies(true);if(!s.enemy.units.every(e=>e.identified))throw Error('identify spell effect');`);console.log('PASS identification failure, success, persistence and spell effect');
170:function resetMonstersTest(id){s=structuredClone(savedMonstersState);s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;delete s.cells[s.pos].chest;s.hp=s.members.map(()=>1000);s.mp=s.members.map(()=>100);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.enemy={dataVersion:1,units:[{id,uid:0,row:0,hp:999,identified:true,rewarded:false}],chestBattle:false};displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;resetPartyCommands();s.commands=s.members.map(()=>'fight');}
189:drain();run(`{s.done=false;s.hp=s.members.map(()=>20);s.enemy={units:[{id:'skeleton',uid:0,row:0,hp:10},{id:'wolf',uid:1,row:1,hp:10}]};let priest=s.members.findIndex((m,i)=>jobOf(i)===2),mp=s.mp[priest];Math.random=()=>0;dispelUndead(priest);if(s.enemy.units[0].hp!==0||s.enemy.units[1].hp!==10||s.enemy.pendingXP||s.mp[priest]!==mp)throw Error('dispel effect');s.enemy.units[0].hp=10;s.enemy.units[0].rewarded=false;s.enemy.units[0].escaped=false;Math.random=()=>.999;dispelUndead(priest);if(s.enemy.units[0].hp!==10)throw Error('dispel failure');}`);console.log('PASS dispel success/failure, undead only, no MP or XP');
195:mode='move';s.logs=[];s.hp=s.members.map(()=>20);
267:    s.hp=s.members.map((_,i)=>alive.includes(i)?20:0);
22:- 町：訓練所（作成・登録・加入/離脱/抹消）、酒場（編成）、鍛冶屋（売買）、迷宮入口。宿・寺院・ボルタック相当の鑑定はなし。帰還で**無料**全回復（死者も復活）。
49:- 再現：HP2で毒のメンバーがいる状態で1歩移動→HP0になるがログは「警告：周囲に罠が2個。」のみ（Nodeで確認）。
50:- 場所：`dist/game.js` `tickAilments(false)`（`cell()`から呼ばれる）。毒ダメージログを抑制した結果、死亡も無告知。
51:- 修正案：`logPoison=false` でも HP が0になった瞬間は「○○は毒で倒れた。」を出す。
63:### B6【中】全滅にペナルティが無い／帰還で死者が無料復活
100:### 3.1 通しプレイBot（6人：戦士2・僧侶2・盗賊・魔法使い、帰還判断は総HP50%未満かMP枯渇）
131:5. **金貨の使い道がない**：全装備を揃えても1人あたり最大約500〜600G。帰還・回復・蘇生が無料なので、20回探索後は1万G以上が死蔵。
134:8. **全滅・死亡にコストがない**（B6）。
143:| 4F以降の敵 | 3F流用 | 階差d=階−3につき HP×(1+0.25d)、命中+1/d、攻撃+2/d、Lv+2/d、XP×(1+0.3d)、AC−1/2d | B4解消 |
147:| 帰還時回復 | 無料全快・死者復活 | 宿（有料・休むとHP回復）と寺院（蘇生有料・失敗で灰）へ移行（C1） | 金貨の使い道・緊張感 |
163:- 原作：死亡→寺院で寄付して蘇生（失敗で灰）、灰→蘇生（失敗でロスト＝抹消）。全滅すると死体は迷宮に残り救出隊が必要。
164:- 提案：HP0＝「死亡」を帰還で自動回復させない。寺院で `寄付額=100×Lv` 程度、成功率 `50+3×VIT(またはLv)`%（本作向け暫定）。失敗で灰、灰の失敗でロスト（訓練所から抹消）。
170:- 提案：帰還時の無料全快を廃止し、宿で「馬小屋：MP全快・HP回復なし（無料）」「簡易寝台：HP+1/週×…」等。簡素化するなら「HP全快は1人 Lv×10G」。レベルアップは宿泊時に判定（今の帰還時判定を移動）。
202:- 原作は呪文レベル1〜7ごとの回数制。現状のMP制は本作独自として明記済み。移行は大工事なので、まず**蘇生呪文（ディ・カドルト）**、**マピロ・マハマ／ラツマピック（敵の識別）**、**カンディ（遺体の位置）**、**ロクトフェイト（町へ帰還、装備喪失）**、**マポーフィック（AC−2の持続）**、**マカニト・マダルト・ラハリト・モンティノ（沈黙）・バディ（即死）** を追加候補とする。
220:**C17. 最終目標（ワードナの魔除け相当）と最深階**：現状は無限に階が続くだけ。10階程度にラスボスと帰還クリアを設定。

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('dist/game.js')
s=p.read_text()
def sub(old,new):
 global s
 assert s.count(old)==1,(old,s.count(old))
 s=s.replace(old,new)
sub('function hurt(n){s.hp=s.hp.map(h=>Math.max(0,h-n));if(', 'function markDeaths(){s.members.forEach((m,i)=>{if(s.hp[i]<=0&&m.status===\\'ok\\')m.status=\\'dead\\'})}\\nfunction hurt(n){s.hp=s.hp.map(h=>Math.max(0,h-n));markDeaths();if(')
sub('s.members.forEach((m,i)=>{m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members)migrateStrength(r.members,r.members.job??0);', \"s.members.forEach((m,i)=>{m.status??=s.area"'!=='"'town'&&s.hp[i]<=0?'dead':'ok';m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members){r.members.status??='ok';migrateStrength(r.members,r.members.job??0)}\")
sub('levelUp();s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);', \"levelUp();s.hp=s.members.map(m=>m.status==='ok'?m.maxHP:0);s.mp=s.members.map((m,i)=>m.status==='ok'?m.maxMP:s.mp[i]);\")
sub(\"function enterDungeon(){if("'!s.members.length||s.area!=='"'town'||"'!idle())return;", "function enterDungeon(){if(!s.members.length||s.area!=='"'town'||"'!idle())return;if(s.members.some(m=>m.status!=='"'ok')){log('死亡したメンバーを外してください。');render();return;}\")
sub(\"hp=(displayVitals?.hp||s.hp)[i];return hp<=0?\", \"hp=(displayVitals?.hp||s.hp)[i],status=shownMember(i).status,label={dead:'死亡',ash:'灰',lost:'ロスト'}[status];return label?[[status,label]]:hp<=0?\")
sub('s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)', 's.hp[i]=Math.max(0,s.hp[i]-2);markDeaths();if(logPoison)')
sub('}});if(s.hp.every(h=>h===0))defeat()}', '}});markDeaths();if(s.hp.every(h=>h===0))defeat()}')
sub('s.hp[i]=Math.max(0,s.hp[i]-damage);log("'`針の罠！'"', 's.hp[i]=Math.max(0,s.hp[i]-damage);markDeaths();log("'`針の罠！'"')
p.write_text(s)
p=Path('dist/monsters.js');s=p.read_text()
sub('s.hp[i]=Math.max(0,s.hp[i]-n);log(', 's.hp[i]=Math.max(0,s.hp[i]-n);markDeaths();log(')
sub('s.hp[i]=0;log(', 's.hp[i]=0;markDeaths();log(')
p.write_text(s)
p=Path('dist/traps.js');s=p.read_text()
sub('s.hp[i]=Math.max(0,s.hp[i]-n);log(', 's.hp[i]=Math.max(0,s.hp[i]-n);markDeaths();log(')
sub('for(let j of alive)s.hp[j]=Math.max(0,s.hp[j]-n);log(', 'for(let j of alive)s.hp[j]=Math.max(0,s.hp[j]-n);markDeaths();log(')
p.write_text(s)
p=Path('docs/SPECIFICATION.md');s=p.read_text()
sub('帰還でHP/MPと状態を回復し、レベルアップ結果はポップアップ。', '帰還で正常なメンバーのみHP/MPを全快し、レベルアップ結果はポップアップ。')
sub('必要経験値は個体ごとに抽選・保存。', \"死亡状態は本作の暫定仕様。メンバーの "'`status` は `ok`（正常）・`dead`（死亡）・`ash`（灰）・`lost`（ロスト）。HPが0になると正常から死亡へ移行し、死亡・灰・ロストは帰還後もHP0のまま、MPも回復しない。帰還時の毒・麻痺解除は全員が対象。状態タグはログのスナップショットに同期して「死亡」「灰」「ロスト」を表示する。正常以外のメンバーがいるパーティーは迷宮に入れず、酒場で外す必要がある。寺院と灰・ロストへの移行はまだ未実装。'"\\n旧セーブの状態未設定メンバーは、町なら正常、迷宮内でHP0以下なら死亡、その他は正常とする。状態未設定の控えは正常とし、設定済みの状態は保存・再読込・編成変更で保持する。\\n必要経験値は個体ごとに抽選・保存。\")
sub('蘇生呪文はなし。町帰還ではHP0のメンバーも回復する。', '蘇生呪文はなし。死亡したメンバーは町帰還でも回復しない（3章参照）。')
p.write_text(s)
PY" in /workspace/dungeonsweeper
 succeeded in 0ms:
exec
/bin/bash -lc "sed -n '95,125p' tests/game.cjs; cat tests/training-browser.py; rg --files /usr/bin /opt /tmp /workspace/agent-tools | rg 'chrom(e|ium)|playwright' | head -n 20" in /workspace/dungeonsweeper
 succeeded in 0ms:
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
/tmp/sand-box-chrome-extra-flags
/tmp/playwright_chromiumdev_profile-ff6hSF/Local State
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/manifest.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/summarizer_nano_v3_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/writing_assistance_gemma4_4b_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/summarizer_small_expert_model_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/prompt_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/writing_assistance_gemma4_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/_metadata/verified_contents.json
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/summarizer_gemma4_12b_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/summarizer_gemma4_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/writing_assistance_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/laya_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/scam_detection_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/writing_assistance_gemma4_12b_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/prompt_gemma4_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/prompt_gemma4_4b_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/summarizer_gemma4_4b_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/speech_recognition_small_expert_model_solution_config.binarypb
/tmp/playwright_chromiumdev_profile-ff6hSF/OptimizationGuideModelsManifest/1.20261018.2/proofreader_small_expert_model_solution_config.binarypb
rg: /tmp/sand-box-store-pack: Permission denied (os error 13)

exec
/bin/bash -lc 'node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
 succeeded in 0ms:
PASS new game starts empty; dungeon blocked
PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation
PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload
PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration
PASS deletion including last active member and empty save reload
88 monster definitions validated

exec
/bin/bash -lc 'node tests/game.cjs' in /workspace/dungeonsweeper
 succeeded in 2088ms:
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

exec
/bin/bash -lc "python3 -c 'import importlib.util; print(importlib.util.find_spec(\"playwright\"))'; command -v chromium chromium-browser google-chrome" in /workspace/dungeonsweeper
 succeeded in 0ms:
None
/usr/bin/google-chrome

codex
基本実装後の既存テストはすべて通りました。現在は、戦闘・即死・毒・各罠での死亡、帰還後のHP0維持、酒場での離脱後の再入場、旧セーブ移行と再読込を確認する回帰テストを追加しています。

apply patch
patch: completed
/workspace/dungeonsweeper/tests/death-status.cjs
diff --git a/tests/death-status.cjs b/tests/death-status.cjs
new file mode 100644
index 0000000000000000000000000000000000000000..3caeecc404540f5acc46829e05015578d0d0519f
--- /dev/null
+++ b/tests/death-status.cjs
@@ -0,0 +1,147 @@
+const assert = require('node:assert/strict');
+const { game } = require('../scripts/sim/harness.cjs');
+
+function party() {
+  const g = game(null, () => .5);
+  g.run(`[0,1,2,3,1,2,0].forEach((job,i)=>{
+    const r=generateRecruit('冒険者'+i,job);registerRecruit(r);
+    if(i<6)changeRecruitParty(r.members.id,true);
+  });enterDungeon();`);
+  g.drain();
+  return g;
+}
+function reload(g) {
+  return game(g.run("save();localStorage.getItem('ash-v1')"));
+}
+function stepLog(g) {
+  g.run('clearTimeout(logTimer);logTimer=null;pumpLog();');
+}
+
+// Use attack(), log playback, return and the actual tavern handlers end to end.
+const combat = party();
+combat.run(`s.hp[2]=1;s.mp[1]=0;s.mp[2]=1;
+  s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,identified:true}]};
+  s.commands=s.members.map(()=> 'guard');Math.random=()=>.999;attack();`);
+assert.equal(combat.run('s.hp[2]'), 0);
+assert.equal(combat.run('s.members[2].status'), 'dead');
+assert.equal(combat.run('ailmentLabel(2)'), '正常', 'death must not leak ahead of the damage log');
+assert.equal(combat.run("logQueue.find(e=>e.text.includes('ダメージ')).members[2].status"), 'dead');
+while (combat.run("logQueue.length && !logQueue[0].text.includes('ダメージ')")) {
+  stepLog(combat);
+  assert.equal(combat.run('ailmentLabel(2)'), '正常');
+}
+stepLog(combat);
+assert.equal(combat.run('ailmentLabel(2)'), '死亡');
+assert.equal(combat.run('displayVitals.hp[2]'), 0);
+combat.drain();
+combat.run('s.enemy.units[0].hp=1;s.commands[0]="fight";attack();');
+combat.drain();
+assert.equal(combat.run('s.enemy'), null);
+combat.run(`s.ailments=s.members.map(()=>({poison:true,paralysis:4}));enterTown();`);
+assert.equal(combat.run('s.area'), 'town');
+assert.equal(combat.run('s.hp[2]'), 0);
+assert.equal(combat.run('s.mp[2]'), 1, 'dead members do not refill MP');
+assert.equal(combat.run('s.mp[1]===s.members[1].maxMP'), true);
+assert.equal(combat.run("s.hp.every((h,i)=>i===2?h===0:h===s.members[i].maxHP)"), true);
+assert.equal(combat.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
+assert.match(combat.run("$('#party').innerHTML"), /ailment-dead.*死亡/);
+const town = reload(combat);
+assert.equal(town.run('s.members[2].status'), 'dead');
+assert.equal(town.run('s.hp[2]'), 0);
+town.run('enterDungeon();');
+assert.equal(town.run('s.area'), 'town');
+assert.equal(town.run('logQueue.at(-1).text'), '死亡したメンバーを外してください。');
+town.drain();
+town.run(`var deadId=s.members[2].id;
+  $('#tavernopen').onclick();
+  $('#tavernslots').onchange({target:{dataset:{tavernSlot:'2'},value:'-1'}});
+  $('#tavernsave').onclick();enterDungeon();`);
+town.drain();
+assert.equal(town.run('s.area'), 'dungeon');
+assert.equal(town.run('s.reserve.find(r=>r.members.id===deadId).members.status'), 'dead');
+assert.equal(reload(town).run("s.reserve.find(r=>r.members.status==='dead').hp"), 0);
+console.log('PASS combat death snapshot, town HP/MP policy, death persistence, tavern removal and dungeon reentry');
+
+// Cover every HP-zero path, including both floor-damage branches and party-wide attacks.
+for (const [name, action, count] of [
+  ['physical damage', "monsterHurt(0,999,s.commands,'敵')", 1],
+  ['instant death', "Math.random=()=>0;monsterOnHit({id:'rabbit'},0)", 1],
+  ['floor needle', 'Math.random=()=>0;triggerFloorTrap(s.cells[s.pos])', 1],
+  ['floor blast', 'Math.random=()=>.3;triggerFloorTrap(s.cells[s.pos])', 6],
+  ['chest needle', "Math.random=()=>0;triggerChestTrap({trap:'needle'})", 1],
+  ['exploration poison', 's.ailments[0].poison=true;tickAilments(false)', 1],
+  ['battle poison', 's.ailments[0].poison=true;tickAilments()', 1],
+  ['generic damage', 'hurt(999)', 6],
+  ['breath', "Math.random=()=>.5;monsterAction({id:'dragon'},s.commands)", 6],
+  ['spell', "Math.random=()=>.5;monsterAction({id:'sorcerer'},s.commands)", 6],
+]) {
+  const g = party();
+  g.run(`s.hp=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');${action};`);
+  assert.equal(g.run("s.members.filter(m=>m.status==='dead').length"), count, name);
+  assert.equal(g.run("s.hp.every((h,i)=>h>0?s.members[i].status==='ok':s.members[i].status==='dead')"), true, name);
+  // Damage and defeat entries must already contain the updated status, not just the final state.
+  assert.equal(g.run("logQueue.every(e=>e.hp.every((h,i)=>h>0||e.members[i].status==='dead'))"), true, name);
+  g.drain();
+  assert.equal(g.run("s.members.every((m,i)=>m.status!=='dead'||ailmentLabel(i)==='死亡')"), true, name);
+  if (count === 6 && g.run('s.done')) {
+    g.run('enterTown();');
+    assert.equal(g.run('s.hp.every(h=>h===0)'), true, 'wipe return cannot resurrect anyone');
+    assert.equal(g.run('s.area'), 'town');
+  }
+}
+console.log('PASS HP-zero paths: physical, instant death, floor/chest traps, field/battle poison, hurt, breath and spell');
+
+// Already recorded states never downgrade to dead/ok, including on return or reload.
+const states = party();
+states.run(`['dead','ash','lost'].forEach((status,i)=>{s.members[i].status=status;s.hp[i]=0;s.mp[i]=0});
+  s.ailments=s.members.map(()=>({poison:true,paralysis:4}));markDeaths();enterTown();`);
+assert.equal(states.run("s.members.slice(0,3).map(m=>m.status).join()"), 'dead,ash,lost');
+assert.equal(states.run('s.hp.slice(0,3).join()'), '0,0,0');
+assert.equal(states.run('s.mp.slice(0,3).join()'), '0,0,0');
+assert.equal(states.run('[0,1,2].map(ailmentLabel).join()'), '死亡,灰,ロスト');
+assert.equal(states.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
+for (const i of [0,1,2]) {
+  const g = reload(states);
+  g.run(`setPartyFromRoster(trainingRoster(),[${i},3]);enterDungeon();`);
+  assert.equal(g.run('s.area'), 'town', 'each non-ok state independently blocks entry');
+  g.drain();
+  g.run('reorderParty([1,0]);');
+  assert.equal(g.run('ailmentLabel(1)'), ['死亡','灰','ロスト'][i], 'status follows member identity');
+}
+states.run("log('状態の記録');s.members[1].status='lost';");
+assert.equal(states.run('ailmentLabel(1)'), '灰', 'status display reads the snapshot member');
+stepLog(states);
+assert.equal(states.run('ailmentLabel(1)'), '灰');
+states.drain();
+assert.equal(states.run('ailmentLabel(1)'), 'ロスト');
+console.log('PASS dead/ash/lost preservation, labels, independent entry blocks, reorder and snapshot display');
+
+// Load actual old ash-v1 payloads, both roster-based and parallel-array formats.
+const legacySource = party();
+for (const format of ['roster','parallel','three-member']) {
+  for (const area of ['town','dungeon']) {
+    const legacy = JSON.parse(legacySource.run(format==='roster'
+      ? 'JSON.stringify(rosterSaveState())' : 'JSON.stringify(s)'));
+    legacy.area = area;
+    if (format === 'roster') {
+      legacy.roster.forEach(r=>{delete r.members.status;r.hp=0});
+    } else {
+      legacy.members.forEach(m=>delete m.status);
+      legacy.hp.fill(0);
+      legacy.reserve.forEach(r=>{delete r.members.status;r.hp=0});
+      if (format === 'three-member') {
+        delete legacy.partyVersion;
+        for (const key of ['members','hp','mp','inventory','equipped','armor','ailments']) legacy[key]=legacy[key].slice(0,3);
+      }
+    }
+    const g = game(JSON.stringify(legacy));
+    assert.equal(g.run("s.members.every((m,i)=>m.status===(s.area==='town'||s.hp[i]>0?'ok':'dead'))"), true, `${format} ${area}`);
+    assert.equal(g.run("s.reserve.every(r=>r.members.status==='ok')"), true, 'legacy reserve defaults to ok even at HP0');
+    const before = g.run('s.members.map(m=>m.status).join()');
+    g.run('ensureProfile();');
+    assert.equal(g.run('s.members.map(m=>m.status).join()'), before, 'migration is idempotent');
+    assert.equal(reload(g).run('s.members.map(m=>m.status).join()'), before);
+  }
+}
+assert.equal(legacySource.run("s.members.every(m=>m.status==='ok')&&s.reserve.every(r=>r.members.status==='ok')"), true);
+console.log('PASS new members, old town/dungeon/reserve saves, roster/parallel/three-member migration and reload');

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('tests/game.cjs');s=p.read_text()
s=s.replace(\"if(s.hp.some((h,i)=>h"'!==maxHP(i))||s.mp.some((h,i)=>h!==s.members[i].maxMP))throw Error('"'refill');\", \"/* 020: 帰還の全快対象は正常なメンバーのみ。死者は新しい死亡回帰テストで検証する。 */ if(s.hp.some((h,i)=>h"'!==(s.members[i].status==='"'ok'?maxHP(i):0))||s.mp.some((h,i)=>s.members[i].status==='ok'&&h"'!==s.members[i].maxMP))throw Error('"'living refill');\")
s=s.replace('multi-level growth, full refill,', 'multi-level growth, living refill,')
s += \"\\nrequire('./death-status.cjs');\\n\"
p.write_text(s)
PY
node tests/death-status.cjs" in /workspace/dungeonsweeper
 exited 1 in 61ms:
PASS combat death snapshot, town HP/MP policy, death persistence, tavern removal and dungeon reentry
node:assert:152
  throw new AssertionError(obj);
  ^

AssertionError [ERR_ASSERTION]: breath

0 !== 6

    at Object.<anonymous> (/workspace/dungeonsweeper/tests/death-status.cjs:80:10)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: 0,
  expected: 6,
  operator: 'strictEqual',
  diff: 'simple'
}

Node.js v24.22.1

exec
/bin/bash -lc "rg '"'^(dragon|sorcerer),'"' data/monsters.csv; sed -n '1,7p' data/monsters.csv; git diff --stat; git diff -- dist/traps.js dist/monsters.js docs/SPECIFICATION.md" in /workspace/dungeonsweeper
 succeeded in 0ms:
確定名,不確定名,出現階層,Lv,HP,AC,命中補正,物理ダメージ,経験値,群れの数,金貨,種族,攻撃回数,状態異常,ブレス,呪文,アイテム奪取,逃走,仲間呼び,Lv吸収,後衛攻撃,即死,耐性
洞窟スライム,不定形,1F,2,1d6+3,9,1,1d4,6,1〜2,1d4+2,不定形,1,毒/命中時15%,なし,なし,なし,なし,なし,なし,不可,なし,なし
骸骨の衛兵,動く死体,1F,2,2d6+4,7,3,1d6+1,12,2〜3,2d4+2,不死,1,なし,なし,なし,なし,なし,なし,なし,不可,なし,毒無効
灰狼,素早い牙,1F,2,2d5+3,6,4,1d6+2,14,2〜3,2d5+2,獣,1,なし,なし,なし,なし,なし,なし,なし,不可,なし,なし
迷宮ゴブリン,小鬼,1F,2,2d6+5,5,4,1d8,17,2〜3,2d6+2,人型,1,なし,なし,なし,なし,行動40%,行動10%/同種1体/列上限4体,なし,不可,なし,なし
洞窟蝙蝠,羽ばたく影,1F,3,1d6+2,8,2,1d4,13,1〜2,1d6+2,獣,1,なし,なし,なし,なし,なし,なし,なし,不可,なし,なし
大鼠,小さな獣,1F,3,1d6+2,8,2,1d5,15,2〜4,1d6+2,獣,1,なし,なし,なし,なし,なし,行動40%/同種1体/列上限6体,なし,不可,なし,なし
 dist/game.js          | 15 ++++++++-------
 dist/monsters.js      |  4 ++--
 dist/traps.js         |  4 ++--
 docs/SPECIFICATION.md |  6 ++++--
 tests/game.cjs        |  6 ++++--
 5 files changed, 20 insertions(+), 15 deletions(-)
diff --git a/dist/monsters.js b/dist/monsters.js
index 6aee47b..ed7b9c0 100644
--- a/dist/monsters.js
+++ b/dist/monsters.js
@@ -1,7 +1,7 @@
 function monsterFormation(boss){let floor=Math.min(Math.max(...ENEMIES.map(d=>d.floor)),s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss){let guardian=ENEMIES.find(d=>d.floor===floor&&d.boss);return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[]) ]}return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
-function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
+function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);markDeaths();log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
 function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){let sp=d.spellInfo||{name:'ハリト',target:'one',dice:[1,8,0]};log(`${name}は${sp.name}を唱えた。`);for(let i of sp.target==='all'?alive:[alive[Math.random()*alive.length|0]])monsterHurt(i,dice(...sp.dice).value,cmds,name)}return true}return false}
-function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}
+function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;markDeaths();log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}
 
 // A completed battle pays only for defeated enemies, never escaped enemies.
 function finishMonsterBattle(){
diff --git a/dist/traps.js b/dist/traps.js
index 06ac563..35b223e 100644
--- a/dist/traps.js
+++ b/dist/traps.js
@@ -1,7 +1,7 @@
 const FLOOR_TRAPS=[{id:'needle',name:'針',weight:25},{id:'blast',name:'爆発',weight:25},{id:'poison',name:'毒霧',weight:20},{id:'paralysis',name:'麻痺の針',weight:15},{id:'teleport',name:'転移',weight:15}];
 function triggerFloorTrap(c){log('罠だ！',{trap:true});let roll=Math.random()*100,t=FLOOR_TRAPS.find(t=>(roll-=t.weight)<0)||FLOOR_TRAPS[0];c.trap=false;c.spent=true;c.trapKind=t.id;let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;displayVitals??={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};
- if(t.id==='needle'){let n=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-n);log(`針の罠！ ${NAMES[i]}に${n}ダメージ。`)}
- else if(t.id==='blast'){let n=Math.max(1,Math.floor(dice(2,6,3).value*trapPower(s.floor)));for(let j of alive)s.hp[j]=Math.max(0,s.hp[j]-n);log(`爆発の罠！ 全員に${n}ダメージ。`)}
+ if(t.id==='needle'){let n=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-n);markDeaths();log(`針の罠！ ${NAMES[i]}に${n}ダメージ。`)}
+ else if(t.id==='blast'){let n=Math.max(1,Math.floor(dice(2,6,3).value*trapPower(s.floor)));for(let j of alive)s.hp[j]=Math.max(0,s.hp[j]-n);markDeaths();log(`爆発の罠！ 全員に${n}ダメージ。`)}
  else if(t.id==='poison'){log('毒霧の罠！ 毒霧が噴き出した。');for(let j of alive)afflict(j,'poison')}
  else if(t.id==='paralysis'){log('麻痺の針の罠！ 針が飛び出した。');afflict(i,'paralysis')}
  else {let candidates=s.cells.map((v,j)=>j!==s.pos&&!v.type&&!v.trap&&!v.flag&&!v.chest?j:-1).filter(j=>j>=0);if(candidates.length){s.previousPos=s.pos;s.pos=candidates[Math.random()*candidates.length|0];s.cells[s.pos].open=true;log('転移の罠！ 一行は別の部屋に飛ばされた。');log(`警告：周囲に罠が${num(s.pos)}個。`)}else log('転移の罠は不発に終わった。')}
diff --git a/docs/SPECIFICATION.md b/docs/SPECIFICATION.md
index 2378cbb..43c11fb 100644
--- a/docs/SPECIFICATION.md
+++ b/docs/SPECIFICATION.md
@@ -26,7 +26,9 @@
 
 新規ゲームは0人。訓練所で作成・登録した冒険者から0〜6人を編成。先頭3人が前衛、残りが後衛。0人では迷宮入場不可。酒場での編成とパーティー画面での順番変更も利用可能。
 表示能力：Lv、HP、MP、STR、AC、IQ、PIE、経験値、NEXT。正常時の状態表示はなし。異常時のみ色付きタグ。
-町帰還時に経験値が足りていれば複数回レベルアップ。Lv上限30。HP/MP成長は職業別ダイス、ACはレベルアップで変化しない。帰還でHP/MPと状態を回復し、レベルアップ結果はポップアップ。
+町帰還時に経験値が足りていれば複数回レベルアップ。Lv上限30。HP/MP成長は職業別ダイス、ACはレベルアップで変化しない。帰還で正常なメンバーのみHP/MPを全快し、レベルアップ結果はポップアップ。
+死亡状態は本作の暫定仕様。メンバーの `status` は `ok`（正常）・`dead`（死亡）・`ash`（灰）・`lost`（ロスト）。HPが0になると正常から死亡へ移行し、死亡・灰・ロストは帰還後もHP0のまま、MPも回復しない。帰還時の毒・麻痺解除は全員が対象。状態タグはログのスナップショットに同期して「死亡」「灰」「ロスト」を表示する。正常以外のメンバーがいるパーティーは迷宮に入れず、酒場で外す必要がある。寺院と灰・ロストへの移行はまだ未実装。
+旧セーブの状態未設定メンバーは、町なら正常、迷宮内でHP0以下なら死亡、その他は正常とする。状態未設定の控えは正常とし、設定済みの状態は保存・再読込・編成変更で保持する。
 必要経験値は個体ごとに抽選・保存。次Lvの増分＝round(115×(次Lv−1)×職業係数×[0.9,1.1))。係数：戦士0.8、魔法使い1.2、僧侶1、盗賊0.85。旧セーブには専用移行処理あり。
 新規生成キャラクターのSTR＝min(18, 生成時STR＋floor((Lv−1)/5))。レベル吸収時も生成時STRを基準とする。
 IQ/PIEは生成時の配分値を保持。既存キャラクターの未設定値のみ従来値で補完。現在のレベルアップではIQ/PIEは増減しない。
@@ -74,7 +76,7 @@ MP1本制。本作独自の消費MP。全25呪文のレベル・MP・対象・
 デュマピック：探索専用、前方未探索のみ調査。85%正しい判定・15%逆転。「前方は罠の可能性あり」「前方にはなにもない」。マスを開けず解除もしない。初回2MP、以降4,8,16…（指数上限あり）。帰還で回数リセット。
 ロミルワ：左右斜め前の状態を正面方形内に薄い実線で透かす。未探索の数字は明かさない。帰還まで持続。
 識別：敵全列を識別。警戒結界：帰還まで敵奇襲防止。マロール：訪問済み階の上り階段へ移動。
-蘇生呪文はなし。町帰還ではHP0のメンバーも回復する。
+蘇生呪文はなし。死亡したメンバーは町帰還でも回復しない（3章参照）。
 
 ## 7. 宝箱
 

exec
/bin/bash -lc "node - <<'JS'
const {game}=require('./scripts/sim/harness.cjs');const g=game();console.log(g.run(\"['dragon','sorcerer'].map(id=>{let d=enemyDefinition(id);return {id,breath:d.breath,spell:d.spell,flee:d.flee,summon:d.summon,spellInfo:d.spellInfo}})\"));
JS" in /workspace/dungeonsweeper
 succeeded in 0ms:
[
  {
    id: 'dragon',
    breath: { element: '炎', dice: [Array], chance: 0.5 },
    spell: 0,
    flee: 0,
    summon: 0,
    spellInfo: null
  },
  {
    id: 'sorcerer',
    breath: null,
    spell: 0.25,
    flee: 0.1,
    summon: 0,
    spellInfo: { id: 'mahalito', name: 'マハリト', target: 'all', dice: [Array] }
  }
]

apply patch
patch: completed
/workspace/dungeonsweeper/tests/death-status.cjs
diff --git a/tests/death-status.cjs b/tests/death-status.cjs
new file mode 100644
index 0000000000000000000000000000000000000000..60003d7ce1356cd3a2f877b56d58d532c7fc2f3c
--- /dev/null
+++ b/tests/death-status.cjs
@@ -0,0 +1,147 @@
+const assert = require('node:assert/strict');
+const { game } = require('../scripts/sim/harness.cjs');
+
+function party() {
+  const g = game(null, () => .5);
+  g.run(`[0,1,2,3,1,2,0].forEach((job,i)=>{
+    const r=generateRecruit('冒険者'+i,job);registerRecruit(r);
+    if(i<6)changeRecruitParty(r.members.id,true);
+  });enterDungeon();`);
+  g.drain();
+  return g;
+}
+function reload(g) {
+  return game(g.run("save();localStorage.getItem('ash-v1')"));
+}
+function stepLog(g) {
+  g.run('clearTimeout(logTimer);logTimer=null;pumpLog();');
+}
+
+// Use attack(), log playback, return and the actual tavern handlers end to end.
+const combat = party();
+combat.run(`s.hp[2]=1;s.mp[1]=0;s.mp[2]=1;
+  s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,identified:true}]};
+  s.commands=s.members.map(()=> 'guard');Math.random=()=>.999;attack();`);
+assert.equal(combat.run('s.hp[2]'), 0);
+assert.equal(combat.run('s.members[2].status'), 'dead');
+assert.equal(combat.run('ailmentLabel(2)'), '正常', 'death must not leak ahead of the damage log');
+assert.equal(combat.run("logQueue.find(e=>e.text.includes('ダメージ')).members[2].status"), 'dead');
+while (combat.run("logQueue.length && !logQueue[0].text.includes('ダメージ')")) {
+  stepLog(combat);
+  assert.equal(combat.run('ailmentLabel(2)'), '正常');
+}
+stepLog(combat);
+assert.equal(combat.run('ailmentLabel(2)'), '死亡');
+assert.equal(combat.run('displayVitals.hp[2]'), 0);
+combat.drain();
+combat.run('s.enemy.units[0].hp=1;s.commands[0]="fight";attack();');
+combat.drain();
+assert.equal(combat.run('s.enemy'), null);
+combat.run(`s.ailments=s.members.map(()=>({poison:true,paralysis:4}));enterTown();`);
+assert.equal(combat.run('s.area'), 'town');
+assert.equal(combat.run('s.hp[2]'), 0);
+assert.equal(combat.run('s.mp[2]'), 1, 'dead members do not refill MP');
+assert.equal(combat.run('s.mp[1]===s.members[1].maxMP'), true);
+assert.equal(combat.run("s.hp.every((h,i)=>i===2?h===0:h===s.members[i].maxHP)"), true);
+assert.equal(combat.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
+assert.match(combat.run("$('#party').innerHTML"), /ailment-dead.*死亡/);
+const town = reload(combat);
+assert.equal(town.run('s.members[2].status'), 'dead');
+assert.equal(town.run('s.hp[2]'), 0);
+town.run('enterDungeon();');
+assert.equal(town.run('s.area'), 'town');
+assert.equal(town.run('logQueue.at(-1).text'), '死亡したメンバーを外してください。');
+town.drain();
+town.run(`var deadId=s.members[2].id;
+  $('#tavernopen').onclick();
+  $('#tavernslots').onchange({target:{dataset:{tavernSlot:'2'},value:'-1'}});
+  $('#tavernsave').onclick();enterDungeon();`);
+town.drain();
+assert.equal(town.run('s.area'), 'dungeon');
+assert.equal(town.run('s.reserve.find(r=>r.members.id===deadId).members.status'), 'dead');
+assert.equal(reload(town).run("s.reserve.find(r=>r.members.status==='dead').hp"), 0);
+console.log('PASS combat death snapshot, town HP/MP policy, death persistence, tavern removal and dungeon reentry');
+
+// Cover every HP-zero path, including both floor-damage branches and party-wide attacks.
+for (const [name, action, count] of [
+  ['physical damage', "monsterHurt(0,999,s.commands,'敵')", 1],
+  ['instant death', "Math.random=()=>0;monsterOnHit({id:'rabbit'},0)", 1],
+  ['floor needle', 'Math.random=()=>0;triggerFloorTrap(s.cells[s.pos])', 1],
+  ['floor blast', 'Math.random=()=>.3;triggerFloorTrap(s.cells[s.pos])', 6],
+  ['chest needle', "Math.random=()=>0;triggerChestTrap({trap:'needle'})", 1],
+  ['exploration poison', 's.ailments[0].poison=true;tickAilments(false)', 1],
+  ['battle poison', 's.ailments[0].poison=true;tickAilments()', 1],
+  ['generic damage', 'hurt(999)', 6],
+  ['breath', "Math.random=()=>.2;monsterAction({id:'dragon'},s.commands)", 6],
+  ['spell', "Math.random=()=>.2;monsterAction({id:'sorcerer'},s.commands)", 6],
+]) {
+  const g = party();
+  g.run(`s.hp=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');${action};`);
+  assert.equal(g.run("s.members.filter(m=>m.status==='dead').length"), count, name);
+  assert.equal(g.run("s.hp.every((h,i)=>h>0?s.members[i].status==='ok':s.members[i].status==='dead')"), true, name);
+  // Damage and defeat entries must already contain the updated status, not just the final state.
+  assert.equal(g.run("logQueue.every(e=>e.hp.every((h,i)=>h>0||e.members[i].status==='dead'))"), true, name);
+  g.drain();
+  assert.equal(g.run("s.members.every((m,i)=>m.status!=='dead'||ailmentLabel(i)==='死亡')"), true, name);
+  if (count === 6 && g.run('s.done')) {
+    g.run('enterTown();');
+    assert.equal(g.run('s.hp.every(h=>h===0)'), true, 'wipe return cannot resurrect anyone');
+    assert.equal(g.run('s.area'), 'town');
+  }
+}
+console.log('PASS HP-zero paths: physical, instant death, floor/chest traps, field/battle poison, hurt, breath and spell');
+
+// Already recorded states never downgrade to dead/ok, including on return or reload.
+const states = party();
+states.run(`['dead','ash','lost'].forEach((status,i)=>{s.members[i].status=status;s.hp[i]=0;s.mp[i]=0});
+  s.ailments=s.members.map(()=>({poison:true,paralysis:4}));markDeaths();enterTown();`);
+assert.equal(states.run("s.members.slice(0,3).map(m=>m.status).join()"), 'dead,ash,lost');
+assert.equal(states.run('s.hp.slice(0,3).join()'), '0,0,0');
+assert.equal(states.run('s.mp.slice(0,3).join()'), '0,0,0');
+assert.equal(states.run('[0,1,2].map(ailmentLabel).join()'), '死亡,灰,ロスト');
+assert.equal(states.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
+for (const i of [0,1,2]) {
+  const g = reload(states);
+  g.run(`setPartyFromRoster(trainingRoster(),[${i},3]);enterDungeon();`);
+  assert.equal(g.run('s.area'), 'town', 'each non-ok state independently blocks entry');
+  g.drain();
+  g.run('reorderParty([1,0]);');
+  assert.equal(g.run('ailmentLabel(1)'), ['死亡','灰','ロスト'][i], 'status follows member identity');
+}
+states.run("log('状態の記録');s.members[1].status='lost';");
+assert.equal(states.run('ailmentLabel(1)'), '灰', 'status display reads the snapshot member');
+stepLog(states);
+assert.equal(states.run('ailmentLabel(1)'), '灰');
+states.drain();
+assert.equal(states.run('ailmentLabel(1)'), 'ロスト');
+console.log('PASS dead/ash/lost preservation, labels, independent entry blocks, reorder and snapshot display');
+
+// Load actual old ash-v1 payloads, both roster-based and parallel-array formats.
+const legacySource = party();
+for (const format of ['roster','parallel','three-member']) {
+  for (const area of ['town','dungeon']) {
+    const legacy = JSON.parse(legacySource.run(format==='roster'
+      ? 'JSON.stringify(rosterSaveState())' : 'JSON.stringify(s)'));
+    legacy.area = area;
+    if (format === 'roster') {
+      legacy.roster.forEach(r=>{delete r.members.status;r.hp=0});
+    } else {
+      legacy.members.forEach(m=>delete m.status);
+      legacy.hp.fill(0);
+      legacy.reserve.forEach(r=>{delete r.members.status;r.hp=0});
+      if (format === 'three-member') {
+        delete legacy.partyVersion;
+        for (const key of ['members','hp','mp','inventory','equipped','armor','ailments']) legacy[key]=legacy[key].slice(0,3);
+      }
+    }
+    const g = game(JSON.stringify(legacy));
+    assert.equal(g.run("s.members.every((m,i)=>m.status===(s.area==='town'||s.hp[i]>0?'ok':'dead'))"), true, `${format} ${area}`);
+    assert.equal(g.run("s.reserve.every(r=>r.members.status==='ok')"), true, 'legacy reserve defaults to ok even at HP0');
+    const before = g.run('s.members.map(m=>m.status).join()');
+    g.run('ensureProfile();');
+    assert.equal(g.run('s.members.map(m=>m.status).join()'), before, 'migration is idempotent');
+    assert.equal(reload(g).run('s.members.map(m=>m.status).join()'), before);
+  }
+}
+assert.equal(legacySource.run("s.members.every(m=>m.status==='ok')&&s.reserve.every(r=>r.members.status==='ok')"), true);
+console.log('PASS new members, old town/dungeon/reserve saves, roster/parallel/three-member migration and reload');

exec
/bin/bash -lc 'node tests/death-status.cjs' in /workspace/dungeonsweeper
 succeeded in 113ms:
PASS combat death snapshot, town HP/MP policy, death persistence, tavern removal and dungeon reentry
PASS HP-zero paths: physical, instant death, floor/chest traps, field/battle poison, hurt, breath and spell
PASS dead/ash/lost preservation, labels, independent entry blocks, reorder and snapshot display
PASS new members, old town/dungeon/reserve saves, roster/parallel/three-member migration and reload

exec
/bin/bash -lc 'git diff -- dist/game.js tests/game.cjs; git status --short' in /workspace/dungeonsweeper
 succeeded in 0ms:
diff --git a/dist/game.js b/dist/game.js
index 62ebd8a..ed2f275 100644
--- a/dist/game.js
+++ b/dist/game.js
@@ -13,7 +13,8 @@ function rollInitiative(action='forward',boss=false){if(boss)return 'normal';let
 function encounter(i,unexplored=false,action='forward'){let boss=s.cells[i].type==='boss',formation=monsterFormation(boss),units=[];for(let [row,id] of formation.slice(0,3).entries()){let [min,max]=enemyDefinition(id).groupSize,n=min+(Math.random()*(max-min+1)|0);for(let j=0;j<n;j++)units.push({...makeEnemy(id,units.length),row})}resetCommandEntry();s.attackRows=s.members.map(()=>0);s.enemy={dataVersion:1,flagEffect:flagEffect(),boss,chestBattle:unexplored,lootGold:0,units,target:0,escapeTo:s.previousPos??s.start,initiative:rollInitiative(action,boss)};identifyEnemies();let message={normal:'敵が現れた！',enemy:'敵の奇襲！',party:'敵はまだ気づいていない！'}[s.enemy.initiative];log(message,{encounter:true});if(s.enemy.flagEffect.bad)log('誤った旗がパーティーを惑わせた！');if(s.enemy.initiative==='enemy'){s.enemy.initiative='normal';enemyTurn(s.members.map(()=>'fight'))}}
 function answerBoss(yes){if(logBusy()||!s.pendingBoss)return;let pending=s.pendingBoss;s.pendingBoss=null;if(yes)encounter(s.pos);else{s.pos=pending.previous;log('戦闘を避け、一歩前のマスへ戻った。')}render()}
 function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
-function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function hurt(n){s.hp=s.hp.map(h=>Math.max(0,h-n));if(s.hp.every(h=>h===0)){defeat()}}
+function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function markDeaths(){s.members.forEach((m,i)=>{if(s.hp[i]<=0&&m.status==='ok')m.status='dead'})}
+function hurt(n){s.hp=s.hp.map(h=>Math.max(0,h-n));markDeaths();if(s.hp.every(h=>h===0)){defeat()}}
 function cell(i,action='forward'){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;let c=s.cells[i];if(mode==='flag'){if(!c.open)c.flag=c.flag?false:(s.flagKind||'power');render();return}if(!adjacent(s.pos,i)){log('現在地の上下左右に隣接するマスを選んでください。');render();return}if(c.flag){log('旗のあるマスには移動できない。旗を外すと進めます。');render();return}tickAilments(false);if(s.done){render();return}let previous=s.pos,wasOpen=c.open;s.previousPos=previous;s.pos=i;if(c.type==='boss'&&!s.relic){c.open=true;s.pendingBoss={previous};log('守護者と戦いますか？');render();return}if(!c.open){c.open=true;if(c.trap){if(triggerFloorTrap(c)){render();return}}else log(num(i)?`警告：周囲に罠が${num(i)}個。`:'静かな部屋。周囲に罠はない。')}if(!s.done){if(c.type==='down'){s.pendingStairs='down';log(`地下${s.floor+1}階に移動しますか？`)}else if(c.type==='stairs'){s.pendingStairs=true;log(s.floor===1?'町に移動しますか？':`地下${s.floor-1}階に移動しますか？`)}else if(Math.random()<encounterRate(i,wasOpen,action))encounter(i,!wasOpen,action)}render()}
 function finish(){s.done=true;log(s.relic?`秘宝を持ち帰った！ 探索成功。金貨 ${s.gold}枚。`:`無事に帰還。金貨 ${s.gold}枚を持ち帰った。`)}const MAX_HP=[32,24,26],NAMES=['戦士','魔法使い','僧侶'];
 function dice(n,d,add=0){let rolls=Array.from({length:n},()=>1+(Math.random()*d|0));return {value:rolls.reduce((a,b)=>a+b,add),text:`${n}d${d}${add?'+'+add:''} [${rolls.join(', ')}]${add?' + '+add:''}`}}
@@ -38,14 +39,14 @@ function canWeaponAttack(i){return i<3||equippedWeapon(i)?.range==='ranged'}
 function itemDescription(w){return diceLabel(w)+(w.dice?' · '+(w.range==='ranged'?'遠距離':'近距離'):'')}
 function renderCatalog(){ $('#catalogbody').innerHTML=`<table><thead><tr><th>敵</th><th>HP</th><th>攻撃</th><th>AC</th><th>経験値</th><th>群れ</th><th>金貨</th></tr></thead><tbody>${ENEMIES.map(e=>`<tr><td>${e.name}</td><td>${diceLabel({dice:e.hp})}</td><td>${diceLabel({dice:e.attack})}</td><td>${e.ac}</td><td>${e.xp}</td><td>${e.groupSize.join("〜")}体</td><td>${diceLabel({dice:e.gold})} ÷3（切捨）</td></tr>`).join('')}</tbody></table>`}
 function drawEnemies(){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat),height=Math.min(130,260/groups.length);return groups.map((g,row)=>{let y=62+row*height;let visible=g.units.filter(e=>!e.rewarded);return visible.map((e,col)=>{if(e.rewarded)return '';let width=Math.min(108,560/visible.length-8),x=320+(col-(visible.length-1)/2)*(width+8);return `<g data-enemy-uid="${e.uid}"><rect x="${x-width/2}" y="${y}" width="${width}" height="${height-9}" rx="6" fill="#20271f" stroke="#66725d"/><text x="${x}" y="${y+height*.65}" text-anchor="middle" fill="#dac595" font-size="52">${enemyDefinition(e.id).icon}</text><text x="${x}" y="${y+height-18}" text-anchor="middle" fill="#dac595" font-size="16">${e.sleep>0?'Zzz':''}</text></g>`}).join('')}).join('')}
-function ensureProfile(){s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members)migrateStrength(r.members,r.members.job??0);ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
+function ensureProfile(){s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.status??=s.area!=='town'&&s.hp[i]<=0?'dead':'ok';m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members){r.members.status??='ok';migrateStrength(r.members,r.members.job??0)}ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
 function weapon(id){return WEAPONS.find(w=>w.id===id)||MEDICINES.find(w=>w.id===id)}
 function equippedWeapon(i){return weapon(s.inventory[i][s.equipped[i]])}
 function diceLabel(w){if(w.kind==='medicine')return w.description;if(w.part)return `${{head:"頭",body:"胴体",feet:"足"}[w.part]} AC −${w.ac}`;return `${w.dice[0]}d${w.dice[1]}${w.dice[2]?'+'+w.dice[2]:''}`}
 function idle(){return !currentChest()&&!logBusy()&&!s.enemy&&!s.pendingBoss&&!s.pendingStairs}
-function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));levelUp();s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render();showLevelReport()}
+function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));levelUp();s.hp=s.members.map(m=>m.status==='ok'?m.maxHP:0);s.mp=s.members.map((m,i)=>m.status==='ok'?m.maxMP:s.mp[i]);s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render();showLevelReport()}
 function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
-function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
+function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.members.some(m=>m.status!=='ok')){log('死亡したメンバーを外してください。');render();return;}if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
 function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
 function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
 function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
@@ -75,13 +76,13 @@ function isEquipped(i,slot){return s.equipped[i]===slot||Object.values(s.armor[i
 function effectiveAC(i){return memberClass(i).ac-Object.values(s.armor[i]).reduce((n,k)=>n+(weapon(s.inventory[i][k])?.ac||0),0)-(s.enemy?.partyAC||0)}
 $('#resetopen').onclick=()=>$('#resetdialog').showModal();$('#resetcancel').onclick=()=>$('#resetdialog').close();$('#resetconfirm').onclick=()=>{s=null;fresh();s.area='town';s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);$('#resetdialog').close();render()};
 
-function visibleAilments(i){let a=(displayVitals?.ailments||s.ailments)[i]||{},hp=(displayVitals?.hp||s.hp)[i];return hp<=0?[['dead','死亡']]:[[a.poison,'poison','毒'],[a.paralysis>0,'paralysis','麻痺'],[a.sleep>0,'sleep','睡眠']].filter(([active])=>active).map(([,kind,label])=>[kind,label])}
+function visibleAilments(i){let a=(displayVitals?.ailments||s.ailments)[i]||{},hp=(displayVitals?.hp||s.hp)[i],status=shownMember(i).status,label={dead:'死亡',ash:'灰',lost:'ロスト'}[status];return label?[[status,label]]:hp<=0?[['dead','死亡']]:[[a.poison,'poison','毒'],[a.paralysis>0,'paralysis','麻痺'],[a.sleep>0,'sleep','睡眠']].filter(([active])=>active).map(([,kind,label])=>[kind,label])}
 function ailmentLabel(i){return visibleAilments(i).map(([,label])=>label).join('・')||'正常'}
 function ailmentTags(i){return visibleAilments(i).map(([kind,label])=>`<span class="ailment-tag ailment-${kind}">${label}</span>`).join('')}
 function afflict(i,type){if(type==='poison')s.ailments[i].poison=true;else s.ailments[i].paralysis=4;log(`${NAMES[i]}は${type==='poison'?'毒':'麻痺'}に侵された。`)}
-function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});if(s.hp.every(h=>h===0))defeat()}
+function tickAilments(logPoison=true){s.ailments.forEach((a,i)=>{if(s.hp[i]<=0)return;if(a.paralysis>0){a.paralysis--;if(a.paralysis===0)log(`${NAMES[i]}の麻痺が解けた。`)}if(a.poison){s.hp[i]=Math.max(0,s.hp[i]-2);markDeaths();if(logPoison)log(`${NAMES[i]}は毒で2ダメージ。`);if(s.hp[i]===0)log(`${NAMES[i]}は毒で倒れた。`)}});markDeaths();if(s.hp.every(h=>h===0))defeat()}
 function currentChest(){let c=s.cells[s.pos]?.chest;return c&&!c.opened?c:null}
-function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
+function triggerChestTrap(c){if(c.trap==='none')return;log('罠だ！',{trap:true});let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),i=alive[Math.random()*alive.length|0];if(i===undefined)return;if(c.trap==='needle'){let damage=Math.max(1,Math.floor(dice(3,6,4).value*trapPower(s.floor)));s.hp[i]=Math.max(0,s.hp[i]-damage);markDeaths();log(`針の罠！ ${NAMES[i]}に${damage}ダメージ。`)}else{log((c.trap==='poison'?'毒':'麻痺')+'の罠！');afflict(i,c.trap)}if(s.hp.every(h=>h===0))defeat()}
 function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
 function rewardChest(c){c.opened=true;s.gold+=c.gold*3;log(`宝箱を開けた。金貨${c.gold*3}枚を獲得。`);if(Math.random()<CHEST_LOOT.itemChance[s.floor-1]){let w=weightedLoot(chestItemPool(s.floor)),eligible=s.members.some((m,i)=>w.classes.includes(jobOf(i))),i=s.members.findIndex((m,i)=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i>=0){s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}else if(!eligible)log(`${w.name}を見つけたが、誰も扱えないので置いていった。`);else log('アイテムがいっぱいで装備品を持ち帰れなかった。')}dropMedicine()}
 function openChest(){let c=currentChest();if(!c||logBusy()||s.enemy||s.done)return;fixChestTrap(c);c.opened=true;triggerChestTrap(c);if(!s.done)rewardChest(c);render()}
diff --git a/tests/game.cjs b/tests/game.cjs
index 2b66c35..a7f1d3d 100644
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -1,9 +1,9 @@
 const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
 drain();run(`
-s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');if(s.hp.some((h,i)=>h!==maxHP(i))||s.mp.some((h,i)=>h!==s.members[i].maxMP))throw Error('refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
+s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');/* 020: 帰還の全快対象は正常なメンバーのみ。死者は新しい死亡回帰テストで検証する。 */ if(s.hp.some((h,i)=>h!==(s.members[i].status==='ok'?maxHP(i):0))||s.mp.some((h,i)=>s.members[i].status==='ok'&&h!==s.members[i].maxMP))throw Error('living refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
 Math.random=()=>.5;if(hits(3,3)||!hits(3,9))throw Error('AC direction');Math.random=()=>0;if(hits(100,9))throw Error('natural1');Math.random=()=>.999;if(!hits(-100,-10))throw Error('natural20');
 s.enemy={boss:false,target:1,units:[{id:'slime',uid:0,hp:1000,rewarded:false},{id:'wolf',uid:1,hp:1,rewarded:false}]};s.commands=['fight','guard','guard'];var oldxp=s.members[0].xp;attack();if(!s.enemy||s.enemy.units[0].hp!==1000||s.enemy.units[1].hp!==0||s.members[0].xp!==oldxp||s.enemy.pendingXP!==14)throw Error('target or reward');`);drain();run(`var ex=s.members[0].xp;killReward(s.enemy.units[1]);if(s.members[0].xp!==ex)throw Error('double reward');s.enemy.units[0].hp=1000;s.mp[1]=2;s.magicPlans[1]={id:'halito',target:0};s.commands=['guard','spell','guard'];attack();if(s.mp[1]!==0||s.enemy.units[0].hp!==992)throw Error('spell MP damage');`);drain();run(`s.enemy=null;s.mp[2]=1;var before=s.hp.join();castMagic(2,'dios',0);if(s.hp.join()!==before||s.mp[2]!==1)throw Error('insufficient MP');s.area='dungeon';delete s.members;delete s.mp;s.spell=2;s.heal=1;s.enemy={boss:false,hp:11};ensureProfile();if(s.mp[1]!==8||s.mp[2]!==3||s.enemy.units[0].hp!==11)throw Error('migration');`);
-console.log('PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
+console.log('PASS XP deferred to town, multi-level growth, living refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
 drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
 drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.cells[s.pos].chest={gold:7,opened:false,trap:'none'};s.scan=2;var oldgold=s.gold;Math.random=()=>.99;openChest(true);if(s.gold!==oldgold+21||currentChest())throw Error('safe chest');`);drain();run(`openChest(false);if(s.gold!==oldgold+21)throw Error('double chest');s.cells[s.pos].chest={gold:9,opened:false};s.scan=0;if(!currentChest())throw Error('new chest');s.hp=[32,24,26];afflict(0,'poison');tickAilments();if(s.hp[0]!==30)throw Error('poison');afflict(1,'paralysis');tickAilments();if(s.ailments[1].paralysis!==3)throw Error('paralysis');`);drain();run(`abandonChest()`);drain();run(`enterTown();if(s.ailments.some(a=>a.poison||a.paralysis))throw Error('town cure');`);console.log('PASS direct chest, once-only rewards, poison, paralysis, town cure');
 
@@ -280,3 +280,5 @@ console.log('PASS XP split 100/3=33, 100/1=100, dead exclusion, minimum 1, zero
 drain();run(`if(trapPower(1)!==1||trapPower(5)!==2||trapPower(10)!==3.25||trapPower(11)!==3.25)throw Error('trap power bounds');for(let f=1;f<=10;f++){fresh(f);if(size()!==Math.min(12,6+2*f)||trapCount(f,size())!==[9,15,23,24,26,27,29,30,31,31][f-1])throw Error('floor config '+f)}s.members=s.members.slice(0,1);s.hp=[100];s.ailments=[{poison:false,paralysis:0}];Math.random=()=>0;s.floor=1;let needle=s.cells[s.pos];needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-7)throw Error('floor 1 needle baseline');s.hp[0]=100;s.floor=10;needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('floor 10 needle scaling');s.hp[0]=100;triggerChestTrap({trap:'needle'});if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('chest needle scaling');`);drain();console.log('PASS 10-floor trap configuration and scaling');
 
 require('./final-boss.cjs');
+
+require('./death-status.cjs');
 M dist/game.js
 M dist/monsters.js
 M dist/traps.js
 M docs/SPECIFICATION.md
 M tests/game.cjs
?? tests/death-status.cjs

exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
exec
/bin/bash -lc 'node scripts/sim/selftest.cjs && git diff --check' in /workspace/dungeonsweeper
 succeeded in 2386ms:
PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log
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
PASS new game starts empty; dungeon blocked
PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation
PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload
PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration
PASS deletion including last active member and empty save reload
88 monster definitions validated

 succeeded in 6100ms:
PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout

codex
追加した回帰テストを含め、共通テスト3件とシミュレータの自己テストがすべて通りました。死亡表示のログ同期、帰還後のHP0維持、保存・再読込も確認できています。

実ブラウザ確認は未完了です。Chromeが環境の権限制約で起動できなかったため、報告に理由を記録します。

apply patch
patch: completed
/workspace/dungeonsweeper/report/020-heavy-death-status.md
diff --git a/report/020-heavy-death-status.md b/report/020-heavy-death-status.md
new file mode 100644
index 0000000000000000000000000000000000000000..108a41a0efb8877826a1cde992ad5bd80c013898
--- /dev/null
+++ b/report/020-heavy-death-status.md
@@ -0,0 +1,31 @@
+# 020-heavy-death-status 作業報告
+
+実装・自動検証は完了。実ブラウザ確認と外部キューのdone移動は未完了。
+
+## 変更ファイル
+
+- `dist/game.js`：状態 `ok/dead/ash/lost` の旧セーブ移行、`markDeaths()`、毒・宝箱罠・共通ダメージでの死亡確定を追加。帰還時は正常者だけHP/MP全快、死亡・灰・ロストはHP0と残MPを維持。毒・麻痺は全員解除。正常以外を含むパーティーの入場を指定ログで拒否。状態表示は `shownMember()` を通じてログのスナップショットを参照。
+- `dist/monsters.js`：敵のダメージ・即死で、結果のログを記録する前に死亡状態を確定。
+- `dist/traps.js`：針・爆発による死亡状態を結果ログの記録前に確定。
+- `tests/death-status.cjs`：戦闘から帰還・酒場での離脱・再入場までの回帰テスト、各HP0経路、全滅帰還、死亡・灰・ロストの表示・保持・入場拒否、並べ替え、旧セーブ移行とash-v1再読込を追加。
+- `tests/game.cjs`：帰還時全快の検証を正常者対象に修正し、理由をコメント。死亡回帰テストを共通実行に組み込み。
+- `docs/SPECIFICATION.md`：3章に本作の暫定仕様として死亡状態・帰還・入場制限・旧セーブ移行を記載。6章の旧帰還仕様も整合。
+
+セーブキー `ash-v1`、既存のロスターと旧3人編成の移行を維持。戦闘式・XP・寺院は変更していない。
+
+## 検証結果
+
+- `node tests/game.cjs`：PASS（追加の死亡回帰テストを含む）。
+- `node tests/training.cjs`：PASS。
+- `python3 scripts/compile-monsters.py --check`：PASS（88種）。
+- `node scripts/sim/selftest.cjs`：PASS。
+- `git diff --check`：PASS。
+
+回帰テストでは、物理攻撃・即死・敵ブレス・敵呪文・床の針/爆発・宝箱の針・探索/戦闘中の毒・hurtでHP0から死亡になることを検証。結果ログにも死亡状態が保存され、それ以前のログ再生中は死亡表示が先に出ないことを確認した。帰還後のHP0とMP据え置き、正常者の全快、全員の毒・麻痺解除、酒場から死亡者を外した後の入場を確認した。
+
+状態未設定の旧セーブは、町・迷宮・控えそれぞれの移行を検証。ロスター形式・並列配列形式・旧3人形式で起動し、移行の再実行と保存・再読込でも状態が保持されることを確認した。
+
+## 未完了
+
+- 実ブラウザの手動確認：Python Playwrightは未導入。既存Chromeをheadlessで起動したが、`crashpad ... setsockopt: Operation not permitted (1)`（終了コード133）で失敗。DOMスタブによる表示・操作検証は実ブラウザ確認の代用とはしていない。
+- キュー管理：`/workspace/dsw-queue` は実行環境の書込み許可範囲外（許可範囲は `/workspace/dungeonsweeper` と `/tmp`）。`todo/020-heavy-death-status.md` のdone移動および外部reportへの書込みは未実施。本報告をリポジトリ内の `report/` に保存した。
diff --git a/tests/death-status.cjs b/tests/death-status.cjs
new file mode 100644
index 0000000000000000000000000000000000000000..60003d7ce1356cd3a2f877b56d58d532c7fc2f3c
--- /dev/null
+++ b/tests/death-status.cjs
@@ -0,0 +1,147 @@
+const assert = require('node:assert/strict');
+const { game } = require('../scripts/sim/harness.cjs');
+
+function party() {
+  const g = game(null, () => .5);
+  g.run(`[0,1,2,3,1,2,0].forEach((job,i)=>{
+    const r=generateRecruit('冒険者'+i,job);registerRecruit(r);
+    if(i<6)changeRecruitParty(r.members.id,true);
+  });enterDungeon();`);
+  g.drain();
+  return g;
+}
+function reload(g) {
+  return game(g.run("save();localStorage.getItem('ash-v1')"));
+}
+function stepLog(g) {
+  g.run('clearTimeout(logTimer);logTimer=null;pumpLog();');
+}
+
+// Use attack(), log playback, return and the actual tavern handlers end to end.
+const combat = party();
+combat.run(`s.hp[2]=1;s.mp[1]=0;s.mp[2]=1;
+  s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,identified:true}]};
+  s.commands=s.members.map(()=> 'guard');Math.random=()=>.999;attack();`);
+assert.equal(combat.run('s.hp[2]'), 0);
+assert.equal(combat.run('s.members[2].status'), 'dead');
+assert.equal(combat.run('ailmentLabel(2)'), '正常', 'death must not leak ahead of the damage log');
+assert.equal(combat.run("logQueue.find(e=>e.text.includes('ダメージ')).members[2].status"), 'dead');
+while (combat.run("logQueue.length && !logQueue[0].text.includes('ダメージ')")) {
+  stepLog(combat);
+  assert.equal(combat.run('ailmentLabel(2)'), '正常');
+}
+stepLog(combat);
+assert.equal(combat.run('ailmentLabel(2)'), '死亡');
+assert.equal(combat.run('displayVitals.hp[2]'), 0);
+combat.drain();
+combat.run('s.enemy.units[0].hp=1;s.commands[0]="fight";attack();');
+combat.drain();
+assert.equal(combat.run('s.enemy'), null);
+combat.run(`s.ailments=s.members.map(()=>({poison:true,paralysis:4}));enterTown();`);
+assert.equal(combat.run('s.area'), 'town');
+assert.equal(combat.run('s.hp[2]'), 0);
+assert.equal(combat.run('s.mp[2]'), 1, 'dead members do not refill MP');
+assert.equal(combat.run('s.mp[1]===s.members[1].maxMP'), true);
+assert.equal(combat.run("s.hp.every((h,i)=>i===2?h===0:h===s.members[i].maxHP)"), true);
+assert.equal(combat.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
+assert.match(combat.run("$('#party').innerHTML"), /ailment-dead.*死亡/);
+const town = reload(combat);
+assert.equal(town.run('s.members[2].status'), 'dead');
+assert.equal(town.run('s.hp[2]'), 0);
+town.run('enterDungeon();');
+assert.equal(town.run('s.area'), 'town');
+assert.equal(town.run('logQueue.at(-1).text'), '死亡したメンバーを外してください。');
+town.drain();
+town.run(`var deadId=s.members[2].id;
+  $('#tavernopen').onclick();
+  $('#tavernslots').onchange({target:{dataset:{tavernSlot:'2'},value:'-1'}});
+  $('#tavernsave').onclick();enterDungeon();`);
+town.drain();
+assert.equal(town.run('s.area'), 'dungeon');
+assert.equal(town.run('s.reserve.find(r=>r.members.id===deadId).members.status'), 'dead');
+assert.equal(reload(town).run("s.reserve.find(r=>r.members.status==='dead').hp"), 0);
+console.log('PASS combat death snapshot, town HP/MP policy, death persistence, tavern removal and dungeon reentry');
+
+// Cover every HP-zero path, including both floor-damage branches and party-wide attacks.
+for (const [name, action, count] of [
+  ['physical damage', "monsterHurt(0,999,s.commands,'敵')", 1],
+  ['instant death', "Math.random=()=>0;monsterOnHit({id:'rabbit'},0)", 1],
+  ['floor needle', 'Math.random=()=>0;triggerFloorTrap(s.cells[s.pos])', 1],
+  ['floor blast', 'Math.random=()=>.3;triggerFloorTrap(s.cells[s.pos])', 6],
+  ['chest needle', "Math.random=()=>0;triggerChestTrap({trap:'needle'})", 1],
+  ['exploration poison', 's.ailments[0].poison=true;tickAilments(false)', 1],
+  ['battle poison', 's.ailments[0].poison=true;tickAilments()', 1],
+  ['generic damage', 'hurt(999)', 6],
+  ['breath', "Math.random=()=>.2;monsterAction({id:'dragon'},s.commands)", 6],
+  ['spell', "Math.random=()=>.2;monsterAction({id:'sorcerer'},s.commands)", 6],
+]) {
+  const g = party();
+  g.run(`s.hp=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');${action};`);
+  assert.equal(g.run("s.members.filter(m=>m.status==='dead').length"), count, name);
+  assert.equal(g.run("s.hp.every((h,i)=>h>0?s.members[i].status==='ok':s.members[i].status==='dead')"), true, name);
+  // Damage and defeat entries must already contain the updated status, not just the final state.
+  assert.equal(g.run("logQueue.every(e=>e.hp.every((h,i)=>h>0||e.members[i].status==='dead'))"), true, name);
+  g.drain();
+  assert.equal(g.run("s.members.every((m,i)=>m.status!=='dead'||ailmentLabel(i)==='死亡')"), true, name);
+  if (count === 6 && g.run('s.done')) {
+    g.run('enterTown();');
+    assert.equal(g.run('s.hp.every(h=>h===0)'), true, 'wipe return cannot resurrect anyone');
+    assert.equal(g.run('s.area'), 'town');
+  }
+}
+console.log('PASS HP-zero paths: physical, instant death, floor/chest traps, field/battle poison, hurt, breath and spell');
+
+// Already recorded states never downgrade to dead/ok, including on return or reload.
+const states = party();
+states.run(`['dead','ash','lost'].forEach((status,i)=>{s.members[i].status=status;s.hp[i]=0;s.mp[i]=0});
+  s.ailments=s.members.map(()=>({poison:true,paralysis:4}));markDeaths();enterTown();`);
+assert.equal(states.run("s.members.slice(0,3).map(m=>m.status).join()"), 'dead,ash,lost');
+assert.equal(states.run('s.hp.slice(0,3).join()'), '0,0,0');
+assert.equal(states.run('s.mp.slice(0,3).join()'), '0,0,0');
+assert.equal(states.run('[0,1,2].map(ailmentLabel).join()'), '死亡,灰,ロスト');
+assert.equal(states.run('s.ailments.some(a=>a.poison||a.paralysis)'), false);
+for (const i of [0,1,2]) {
+  const g = reload(states);
+  g.run(`setPartyFromRoster(trainingRoster(),[${i},3]);enterDungeon();`);
+  assert.equal(g.run('s.area'), 'town', 'each non-ok state independently blocks entry');
+  g.drain();
+  g.run('reorderParty([1,0]);');
+  assert.equal(g.run('ailmentLabel(1)'), ['死亡','灰','ロスト'][i], 'status follows member identity');
+}
+states.run("log('状態の記録');s.members[1].status='lost';");
+assert.equal(states.run('ailmentLabel(1)'), '灰', 'status display reads the snapshot member');
+stepLog(states);
+assert.equal(states.run('ailmentLabel(1)'), '灰');
+states.drain();
+assert.equal(states.run('ailmentLabel(1)'), 'ロスト');
+console.log('PASS dead/ash/lost preservation, labels, independent entry blocks, reorder and snapshot display');
+
+// Load actual old ash-v1 payloads, both roster-based and parallel-array formats.
+const legacySource = party();
+for (const format of ['roster','parallel','three-member']) {
+  for (const area of ['town','dungeon']) {
+    const legacy = JSON.parse(legacySource.run(format==='roster'
+      ? 'JSON.stringify(rosterSaveState())' : 'JSON.stringify(s)'));
+    legacy.area = area;
+    if (format === 'roster') {
+      legacy.roster.forEach(r=>{delete r.members.status;r.hp=0});
+    } else {
+      legacy.members.forEach(m=>delete m.status);
+      legacy.hp.fill(0);
+      legacy.reserve.forEach(r=>{delete r.members.status;r.hp=0});
+      if (format === 'three-member') {
+        delete legacy.partyVersion;
+        for (const key of ['members','hp','mp','inventory','equipped','armor','ailments']) legacy[key]=legacy[key].slice(0,3);
+      }
+    }
+    const g = game(JSON.stringify(legacy));
+    assert.equal(g.run("s.members.every((m,i)=>m.status===(s.area==='town'||s.hp[i]>0?'ok':'dead'))"), true, `${format} ${area}`);
+    assert.equal(g.run("s.reserve.every(r=>r.members.status==='ok')"), true, 'legacy reserve defaults to ok even at HP0');
+    const before = g.run('s.members.map(m=>m.status).join()');
+    g.run('ensureProfile();');
+    assert.equal(g.run('s.members.map(m=>m.status).join()'), before, 'migration is idempotent');
+    assert.equal(reload(g).run('s.members.map(m=>m.status).join()'), before);
+  }
+}
+assert.equal(legacySource.run("s.members.every(m=>m.status==='ok')&&s.reserve.every(r=>r.members.status==='ok')"), true);
+console.log('PASS new members, old town/dungeon/reserve saves, roster/parallel/three-member migration and reload');

exec
/bin/bash -lc 'git diff --check && git status --short' in /workspace/dungeonsweeper
 succeeded in 0ms:
 M dist/game.js
 M dist/monsters.js
 M dist/traps.js
 M docs/SPECIFICATION.md
 M tests/game.cjs
?? report/
?? tests/death-status.cjs

codex
020の実装・自動検証は完了しました。死亡状態の保存、帰還後のHP0維持、入場制限、ログに同期した状態表示を追加しました。

- 変更：`dist/game.js`、`monsters.js`、`traps.js`、仕様書、回帰テスト。
- 共通テスト3件・シミュレータ自己テスト：すべてPASS。
- 未完了：ブラウザ確認（Chrome起動制限）、外部キューのdone移動（書込み権限外）。

詳細は[作業報告](/workspace/dungeonsweeper/report/020-heavy-death-status.md)に保存しました。
tokens used
88,660
020の実装・自動検証は完了しました。死亡状態の保存、帰還後のHP0維持、入場制限、ログに同期した状態表示を追加しました。

- 変更：`dist/game.js`、`monsters.js`、`traps.js`、仕様書、回帰テスト。
- 共通テスト3件・シミュレータ自己テスト：すべてPASS。
- 未完了：ブラウザ確認（Chrome起動制限）、外部キューのdone移動（書込み権限外）。

詳細は[作業報告](/workspace/dungeonsweeper/report/020-heavy-death-status.md)に保存しました。
