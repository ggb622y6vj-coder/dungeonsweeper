OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-astra
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: high
reasoning summaries: none
session id: 01a19950-c7df-7fc2-8183-7ba8c04ab2ea
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

# 031-heavy-corpse-rescue
ティア：HEAVY　依存：030

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【遺体と救出 手順2/2】別パーティが遺体マスへ到達すると回収できるようにする（マインスイーパー統合：救出隊は新しく生成された罠を推論して進む）。

## 変更内容
- dist/game.js `fresh(floor)` の後処理：その階の corpses の cell を罠なし・type '' にする。開始位置・守護者位置と重なる場合は最寄りの通常マスへ cell を移して保存。罠数は維持（他の空きマスへ再配置）。
- 地図描画：corpse の cell に骨アイコン（常時表示）。
- `cell()`：遭遇判定の前に、遺体マスなら「遺体を回収した。」→ records を s.reserve に戻す（status dead のまま）、gold を s.gold に加算、corpse を削除。
- 触らない：寺院、戦闘、030のデータ形式。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：遺体マスが開始・守護者と重ならない（1000回生成）、罠なし。到達で回収→控えに dead で戻り金貨復帰→寺院で蘇生可能。
- 手動：全滅→控えで新パーティ→該当階で骨アイコンへ到達→回収。

codex
引き継ぎ資料と030の実装を確認し、031の遺体回収を実装・検証します。変更は遺体マスの配置、骨アイコン、到達時の回収に絞ります。

exec
/bin/bash -lc "pwd && rg --files -g 'AGENTS.md' -g 'README*' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g '*031*' -g '*corpse*' -g 'game.cjs' -g 'training.cjs'" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
README.md
AGENTS.md
tests/training.cjs
tests/game.cjs
docs/HANDOFF.md
docs/SPECIFICATION.md
data/README.md

exec
/bin/bash -lc 'git status --short && cat AGENTS.md README.md docs/HANDOFF.md docs/SPECIFICATION.md' in /workspace/dungeonsweeper
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
/bin/bash -lc "rg --files /workspace -g '*031*' -g 'README-handoff.md' -g 'dungeonsweeper-review.md' -g 'AGENTS.md' && rg -n 'corpses|function fresh|function cell\\(|function render|function save|temple' dist/game.js tests/game.cjs tests/training.cjs" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dsw-queue/README-handoff.md
/workspace/dsw-queue/report/031-heavy-corpse-rescue-codex-output.md
/workspace/dsw-valid/AGENTS.md
/workspace/dsw-queue/todo/031-heavy-corpse-rescue.md
/workspace/wallpaper2/anim_frames/f_0031.png
/workspace/wallpaper/anim_frames/f_0031.png
/workspace/verify-clone/AGENTS.md
/workspace/dungeonsweeper/AGENTS.md
/workspace/wallpaper3/anim_frames/f_0031.png
/workspace/dsw-scratch/AGENTS.md
/workspace/blender/blender-4.2.23-linux-x64/4.2/scripts/addons_core/cycles/lib/kernel_gfx1031.fatbin.zst
/workspace/blender/blender-5.2.2-linux-x64/5.2/scripts/addons_core/cycles/lib/kernel_rt_gfx1031.hipfb.zst
/workspace/blender/blender-5.2.2-linux-x64/5.2/scripts/addons_core/cycles/lib/kernel_gfx1031.fatbin.zst
tests/game.cjs:285:require('./temple.cjs');
tests/training.cjs:76:assert.equal(g.run('s.corpses.length'),1);
tests/training.cjs:78:assert.equal(g.run('s.corpses[0].floor'),3);
tests/training.cjs:79:assert.equal(g.run('s.corpses[0].cell'),17);
tests/training.cjs:80:assert.equal(g.run('s.corpses[0].gold'),321);
tests/training.cjs:81:assert.match(g.run('s.corpses[0].id'),/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
tests/training.cjs:82:assert.equal(g.run('JSON.stringify(s.corpses[0].records)===JSON.stringify(recordsBefore)'),true);
tests/training.cjs:85:g.run('defeat();');assert.equal(g.run('s.corpses.length'),1,'repeated defeat must not duplicate corpses');
tests/training.cjs:104:g.run("s.corpses[0].records[0].members.name='遺体(<印>)';renderTraining();");
tests/training.cjs:107:const corpses=g.run('JSON.stringify(s.corpses)');
tests/training.cjs:109:assert.equal(g.run('JSON.stringify(s.corpses)'),corpses,'corpse records must be independent copies');
tests/training.cjs:111:assert.equal(restored.run('JSON.stringify(s.corpses)'),corpses);
tests/training.cjs:113:assert.equal(restored.run('s.corpses.length'),1);
tests/training.cjs:115:assert.equal(restored.run("s.corpses[0].records.every(r=>r.members.status==='dead'&&r.hp===0)"),true);
tests/training.cjs:117:assert.equal(restored.run('s.corpses.length'),1,'reloading completed wipe must not create another corpse');
tests/training.cjs:121:g.run('var firstCorpse=JSON.stringify(s.corpses[0]);changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();');g.drain();
tests/training.cjs:123:assertWipeTown(g);assert.equal(g.run('s.corpses.length'),2);
tests/training.cjs:124:assert.equal(g.run('JSON.stringify(s.corpses[0])===firstCorpse'),true);
tests/training.cjs:125:assert.equal(g.run('s.corpses[1].floor'),2);assert.equal(g.run('s.corpses[1].cell'),10);
tests/training.cjs:126:assert.equal(g.run('s.corpses[1].gold'),45);assert.equal(g.run('s.corpses[1].records.length'),1);
tests/training.cjs:127:assert.equal(g.run('s.corpses[0].id!==s.corpses[1].id'),true);
tests/training.cjs:129:g.run('defeat();');assert.equal(g.run('s.corpses.length'),2,'empty party cannot leave another corpse');
tests/training.cjs:130:assert.equal(game(g.saved()).run('s.corpses.length'),2);
tests/training.cjs:131:console.log('PASS corpses persist across dungeon regeneration, multiple wipes and empty-party calls');
tests/training.cjs:144: assert.equal(g.run('s.corpses.length'),1,name);
tests/training.cjs:145: assert.equal(g.run('s.corpses[0].records.length'),count,name);
tests/training.cjs:146: assert.equal(g.run('s.corpses[0].cell'),name.startsWith('floor')?1:0,name);
tests/training.cjs:147: assert.equal(g.run('s.corpses[0].gold'),17,name);
tests/training.cjs:149: assert.equal(g.run('s.corpses.length'),1,name);
tests/training.cjs:157: delete legacy.corpses;
tests/training.cjs:163: assert.equal(g.run('s.corpses.length'),0,format);
tests/training.cjs:165: g.run('renderTraining();save();');assert.equal(game(g.saved()).run('s.corpses.length'),0,format);
tests/training.cjs:167:assert.equal(game().run('s.corpses.length'),0);
tests/training.cjs:168:console.log('PASS missing corpses defaults to [] for new and old roster/parallel/three-member saves');
dist/game.js:1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,corpses:s.corpses,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',corpses:[],cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
dist/game.js:16:function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function markDeaths(){s.members.forEach((m,i)=>{if(s.hp[i]<=0&&m.status==='ok')m.status='dead'})}
dist/game.js:18:function cell(i,action='forward'){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;let c=s.cells[i];if(mode==='flag'){if(!c.open)c.flag=c.flag?false:(s.flagKind||'power');render();return}if(!adjacent(s.pos,i)){log('現在地の上下左右に隣接するマスを選んでください。');render();return}if(c.flag){log('旗のあるマスには移動できない。旗を外すと進めます。');render();return}tickAilments(false);if(s.done){render();return}let previous=s.pos,wasOpen=c.open;s.previousPos=previous;s.pos=i;if(c.type==='boss'&&!s.relic){c.open=true;s.pendingBoss={previous};log('守護者と戦いますか？');render();return}if(!c.open){c.open=true;if(c.trap){if(triggerFloorTrap(c)){render();return}}else log(num(i)?`警告：周囲に罠が${num(i)}個。`:'静かな部屋。周囲に罠はない。')}if(!s.done){if(c.type==='down'){s.pendingStairs='down';log(`地下${s.floor+1}階に移動しますか？`)}else if(c.type==='stairs'){s.pendingStairs=true;log(s.floor===1?'町に移動しますか？':`地下${s.floor-1}階に移動しますか？`)}else if(Math.random()<encounterRate(i,wasOpen,action))encounter(i,!wasOpen,action)}render()}
dist/game.js:36:function renderStats(){ $('#partyreorder').disabled=!idle()||s.done; $('#statsbody').innerHTML=s.members.map((_,i)=>{let m=shownMember(i);let values=[['HP',`${(displayVitals?.hp||s.hp)[i]}/${m.maxHP}`],['MP',`${(displayVitals?.mp||s.mp)[i]}/${m.maxMP}`],['STR',m.str],['AC',effectiveAC(i)],['IQ',m.intelligence],['PIE',m.piety],['経験値',m.xp],['NEXT',m.level>=LEVEL_CAP?'上限':Math.max(0,requiredXP(m.level+1,i)-m.xp)]];return `<article class="statcard"><h3>${NAMES[i]} <small>Lv.${m.level} · ${i<3?'前衛':'後衛'}</small>${ailmentTags(i)}</h3><dl class="stat-metrics">${values.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div class="stat-actions"><button data-stat-inventory="${i}" ${!idle()?'disabled':''}>アイテム</button>${hasSpells(i)?`<button data-stat-cast="${i}" ${s.enemy||logBusy()?'disabled':''}>呪文</button>`:''}</div></article>`}).join('')}
dist/game.js:40:function renderCatalog(){ $('#catalogbody').innerHTML=`<table><thead><tr><th>敵</th><th>HP</th><th>攻撃</th><th>AC</th><th>経験値</th><th>群れ</th><th>金貨</th></tr></thead><tbody>${ENEMIES.map(e=>`<tr><td>${e.name}</td><td>${diceLabel({dice:e.hp})}</td><td>${diceLabel({dice:e.attack})}</td><td>${e.ac}</td><td>${e.xp}</td><td>${e.groupSize.join("〜")}体</td><td>${diceLabel({dice:e.gold})} ÷3（切捨）</td></tr>`).join('')}</tbody></table>`}
dist/game.js:42:function ensureProfile(){s.corpses??=[];s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.status??=s.area!=='town'&&s.hp[i]<=0?'dead':'ok';m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members){r.members.status??='ok';migrateStrength(r.members,r.members.job??0)}ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
dist/game.js:56: (s.corpses??=[]).push({id:crypto.randomUUID(),floor:s.floor,cell:s.pos,records:structuredClone(partyRecords()),gold:s.gold});
dist/game.js:73:function templeCost(m){return m.status==='dead'?100*m.level:m.status==='ash'?250*m.level:0}
dist/game.js:74:function templeChance(m){return m.status==='dead'?Math.max(50,Math.min(95,50+3*m.level)):m.status==='ash'?Math.max(40,Math.min(90,40+3*m.level)):0}
dist/game.js:75:function templeRaise(id){
dist/game.js:79: const m=r.members,cost=templeCost(m);
dist/game.js:82: const success=Math.random()*100<templeChance(m);
dist/game.js:90:function renderTemple(result=null){
dist/game.js:91: $('#templegold').textContent=`金貨 ${s.gold} G`;
dist/game.js:92: if(result)$('#templenotice').textContent=result.success?`${result.name}は蘇生した。HPが1になった。`:`${result.name}の蘇生に失敗した。${result.status==='ash'?'灰になった。':'ロストした。'}`;
dist/game.js:93: const list=$('#templemembers');list.replaceChildren();
dist/game.js:100:  detail.textContent=`${s.members.some(p=>p.id===m.id)?'パーティ':'控え'} · Lv.${m.level} · ${m.status==='dead'?'死亡':'灰'} · 成功率 ${templeChance(m)}%`;
dist/game.js:101:  price.textContent=`${templeCost(m)} G`;button.textContent='蘇生';
dist/game.js:102:  button.disabled=s.area!=='town'||!idle()||s.gold<templeCost(m);
dist/game.js:103:  button.onclick=()=>templeRaise(m.id);
dist/game.js:107:$('#templeopen').onclick=()=>{if(s.area!=='town'||!idle())return;$('#templenotice').textContent='';renderTemple();$('#templedialog').showModal()};
dist/game.js:108:$('#templeclose').onclick=()=>$('#templedialog').close();
dist/game.js:109:function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
dist/game.js:110:function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
dist/game.js:117:function render(){ensureProfile();$('#clearresult').hidden=s.area!=='dungeon'||!s.clearNotice||s.done||logBusy()||!!visibleCombat();$('#cleartown').disabled=!idle();$('#clearchestnotice').hidden=!currentChest();$('#clearedmark').hidden=!s.cleared;$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();$('#maptoggle').hidden=s.area!=='dungeon';if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic?' / 秘宝 ✦':''}`;$('#party').innerHTML=NAMES.map((n,i)=>`${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`).join('');$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${s.pos===i?num(i):c.open?(c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div><button id="flee">逃げる</button>`;$('#flee').onclick=flee;$('#flee').disabled=logBusy()||combat.boss||combat.flagEffect?.bad;renderCommandEntry()}$('#frontflag').disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();scene()}

exec
/bin/bash -lc "sed -n '1,180p' tests/training.cjs && cat tests/temple.cjs && sed -n '1,115p' dist/game.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function game(saved=null){
 let timers=[],els={},storage=saved;
 const el=()=>({style:{},dataset:{},children:[],setAttribute(){},addEventListener(){},append(...items){this.children.push(...items)},replaceChildren(...items){this.children=items},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});
 const ctx={crypto:require('node:crypto').webcrypto,structuredClone,document:{addEventListener(){},querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el},localStorage:{getItem:()=>storage,setItem:(k,v)=>{storage=v}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math)};
 vm.createContext(ctx);
 for(const f of ['weapons','monster-data','balance','spells','items','flags','traps','combatui','party','monsters','recruits','game','training'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f+'.js'),'utf8'),ctx);
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

// Wipes must preserve complete records separately from the playable roster.
function corpseParty(count=6){
 const g=game();
 g.run(`Math.random=()=>.5;[3,2,0,1,0,2,1].slice(0,${count+1}).forEach((job,i)=>{
  const r=generateRecruit('遺体'+i,job);registerRecruit(r);if(i<${count})changeRecruitParty(r.members.id,true);
 });enterDungeon();`);
 g.drain();return g;
}
g=corpseParty();
g.run(`fresh(3);s.pos=17;s.gold=321;s.cleared=true;s.light=true;s.watchful=true;s.dumapicUses=4;
 s.inventory[0].push('helm','healingPotion');s.armor[0].head=1;s.members[0].xp=123;
 s.members[0].extra={history:[1,2]};s.mp[1]=3;s.ailments[0]={poison:true,paralysis:2};
 var reserveBefore=JSON.stringify(s.reserve),liveRecords=partyRecords(),recordsBefore=structuredClone(liveRecords);
 recordsBefore.forEach(r=>{r.hp=0;r.members.status='dead'});
 log('全滅直前');hurt(999);`);
assert.equal(g.run('s.corpses.length'),1);
assert.equal(g.run('s.gold'),0);
assert.equal(g.run('s.corpses[0].floor'),3);
assert.equal(g.run('s.corpses[0].cell'),17);
assert.equal(g.run('s.corpses[0].gold'),321);
assert.match(g.run('s.corpses[0].id'),/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
assert.equal(g.run('JSON.stringify(s.corpses[0].records)===JSON.stringify(recordsBefore)'),true);
assert.equal(g.run("displayVitals.hp.every(h=>h>0)&&displayVitals.members.every(m=>m.status==='ok')"),true,'death must not leak before its log');
assert.equal(g.run("logQueue.at(-1).hp.every(h=>h===0)&&logQueue.at(-1).members.every(m=>m.status==='dead')"),true);
g.run('defeat();');assert.equal(g.run('s.corpses.length'),1,'repeated defeat must not duplicate corpses');
const duringWipe=g.saved();
assert.equal(JSON.parse(duringWipe).partyIds.length,0);
assert.equal(JSON.parse(duringWipe).roster.length,1,'pending wipe save contains only the existing reserve');
g.drain();
function assertWipeTown(g){
 assert.equal(g.run('s.area'),'town');assert.equal(g.run('s.done'),false);
 assert.equal(g.run('s.members.length'),0);assert.equal(g.run('s.gold'),0);
 assert.equal(g.run('PARTY_FIELDS.every(key=>s[key].length===0)'),true);
 assert.equal(g.run('s.enemy'),null);assert.equal(g.run('s.pendingStairs'),false);
 assert.equal(g.run('s.pendingBoss'),null);assert.equal(g.run('idle()'),true);
 assert.equal(g.run('Object.keys(s.floors).length'),0);
 assert.equal(g.run('s.cells.some(c=>c.open)'),false);
 assert.equal(g.run('s.light||s.watchful||s.dumapicUses>0'),false);
 assert.equal(g.run("$('#entrance').disabled"),true);
}
assertWipeTown(g);
assert.equal(g.run('JSON.stringify(s.reserve)===reserveBefore'),true);
assert.equal(g.run('s.cleared'),true);
g.run("s.corpses[0].records[0].members.name='遺体(<印>)';renderTraining();");
assert.equal(g.run("$('#recruitlist').children[0].textContent"),'迷宮に残された遺体：地下3階（遺体(<印>)、遺体1、遺体2、遺体3、遺体4、遺体5）');
assert.equal(g.run("$('#recruitlist').children[0].innerHTML"),undefined,'names must be rendered as text');
const corpses=g.run('JSON.stringify(s.corpses)');
g.run("liveRecords[0].members.extra.history.push(9);liveRecords[0].inventory.push('sword');save();");
assert.equal(g.run('JSON.stringify(s.corpses)'),corpses,'corpse records must be independent copies');
let restored=game(g.saved());assertWipeTown(restored);
assert.equal(restored.run('JSON.stringify(s.corpses)'),corpses);
restored=game(duringWipe);assertWipeTown(restored);
assert.equal(restored.run('s.corpses.length'),1);
assert.equal(restored.run('s.reserve.length'),1);
assert.equal(restored.run("s.corpses[0].records.every(r=>r.members.status==='dead'&&r.hp===0)"),true);
restored=game(restored.saved());assertWipeTown(restored);
assert.equal(restored.run('s.corpses.length'),1,'reloading completed wipe must not create another corpse');
console.log('PASS wipe snapshots, UUID/location/gold, complete corpse records, empty party, reserve isolation, training text and reload during/after logs');

// Corpses survive new labyrinths and additional wipes without entering the reserve.
g.run('var firstCorpse=JSON.stringify(s.corpses[0]);changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();');g.drain();
g.run('fresh(2);s.pos=10;s.gold=45;hurt(999);');g.drain();
assertWipeTown(g);assert.equal(g.run('s.corpses.length'),2);
assert.equal(g.run('JSON.stringify(s.corpses[0])===firstCorpse'),true);
assert.equal(g.run('s.corpses[1].floor'),2);assert.equal(g.run('s.corpses[1].cell'),10);
assert.equal(g.run('s.corpses[1].gold'),45);assert.equal(g.run('s.corpses[1].records.length'),1);
assert.equal(g.run('s.corpses[0].id!==s.corpses[1].id'),true);
assert.equal(g.run('trainingRoster().length'),0);
g.run('defeat();');assert.equal(g.run('s.corpses.length'),2,'empty party cannot leave another corpse');
assert.equal(game(g.saved()).run('s.corpses.length'),2);
console.log('PASS corpses persist across dungeon regeneration, multiple wipes and empty-party calls');

for(const [name,action,count] of [
 ['exploration poison','s.ailments.forEach(a=>a.poison=true);cell(1)',6],
 ['battle poison',"s.ailments.forEach(a=>a.poison=true);s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}]};attack()",6],
 ['floor blast','s.cells[1].trap=true;Math.random=()=>.3;cell(1)',6],
 ['floor needle','s.cells[1].trap=true;Math.random=()=>0;cell(1)',1],
 ['chest needle',"s.cells[0].chest={trap:'needle',gold:999};Math.random=()=>0;openChest()",1],
 ['enemy attack',"s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}],initiative:'normal'};s.commands=['guard'];Math.random=()=>.999;attack()",1],
]){
 const g=corpseParty(count);
 g.run(`s.pos=0;s.hp=s.members.map(()=>1);s.gold=17;
 s.cells.forEach(c=>{c.type='';c.trap=false;c.flag=false;c.open=false;delete c.chest});${action};`);
 assert.equal(g.run('s.corpses.length'),1,name);
 assert.equal(g.run('s.corpses[0].records.length'),count,name);
 assert.equal(g.run('s.corpses[0].cell'),name.startsWith('floor')?1:0,name);
 assert.equal(g.run('s.corpses[0].gold'),17,name);
 g.drain();assertWipeTown(g);
 assert.equal(g.run('s.corpses.length'),1,name);
 assert.equal(g.run('s.gold'),0,name+' cannot gain a chest reward after death');
}
console.log('PASS end-to-end wipes from movement/battle poison, floor traps, chest trap and enemy attack');

const legacySource=corpseParty();
for(const format of ['roster','parallel','three-member']){
 const legacy=JSON.parse(legacySource.run(format==='roster'?'JSON.stringify(rosterSaveState())':'JSON.stringify(s)'));
 delete legacy.corpses;
 if(format==='three-member'){
  delete legacy.partyVersion;
  for(const key of ['members','hp','mp','inventory','equipped','armor','ailments'])legacy[key]=legacy[key].slice(0,3);
 }
 const g=game(JSON.stringify(legacy));
 assert.equal(g.run('s.corpses.length'),0,format);
 assert.equal(g.run('s.members.length'),6,format);
 g.run('renderTraining();save();');assert.equal(game(g.saved()).run('s.corpses.length'),0,format);
}
assert.equal(game().run('s.corpses.length'),0);
console.log('PASS missing corpses defaults to [] for new and old roster/parallel/three-member saves');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { game } = require('../scripts/sim/harness.cjs');

function fixture(status = 'dead', reserve = false, level = 5) {
  const g = game(null, () => .5);
  g.run(`var recruit=generateRecruit('蘇生([対象',2);registerRecruit(recruit);
    ${reserve ? '' : 'changeRecruitParty(recruit.members.id,true);'}
    var id=recruit.members.id,r=trainingRoster()[0];
    r.members.status='${status}';r.members.level=${level};
    if(s.members.length){s.hp[0]=0;s.mp[0]=2}else{r.hp=0;r.mp=2}
    s.gold=10000;render();`);
  return g;
}
function reload(g) { return game(g.run("localStorage.getItem('ash-v1')")); }

for (const reserve of [false, true]) {
  for (const [status, roll, expected, cost] of [
    ['dead', 0, 'ok', 500], ['dead', .999, 'ash', 500],
    ['ash', 0, 'ok', 1250], ['ash', .999, 'lost', 1250],
  ]) {
    const g = fixture(status, reserve);
    const before = JSON.parse(g.run('JSON.stringify(trainingRoster()[0])'));
    g.run(`Math.random=()=>${roll};var result=templeRaise(id)`);
    assert.equal(g.run('result.status'), expected);
    assert.equal(g.run('result.success'), expected === 'ok');
    assert.equal(g.run('result.cost'), cost);
    assert.equal(g.run('result.id===id'), true);
    assert.equal(g.run('s.gold'), 10000 - cost);
    const after = JSON.parse(g.run('JSON.stringify(trainingRoster()[0])'));
    before.members.status = expected; before.hp = expected === 'ok' ? 1 : 0;
    assert.deepEqual(after, before, 'only status and HP change; MP, XP, equipment and identity stay intact');
    const restored = reload(g);
    assert.equal(restored.run('s.gold'), 10000 - cost);
    assert.equal(restored.run('s.members.length'), reserve ? 0 : 1);
    assert.deepEqual(JSON.parse(restored.run('JSON.stringify(trainingRoster()[0])')), after);
    assert.match(g.run("$('#templenotice').textContent"), expected === 'ok' ? /蘇生した/ : expected === 'ash' ? /灰になった/ : /ロストした/);
    if (expected === 'ok') {
      if (reserve) restored.run('changeRecruitParty(s.reserve[0].members.id,true)');
      restored.run('enterDungeon()'); restored.drain();
      assert.equal(restored.run('s.area'), 'dungeon');
      assert.equal(restored.run('s.hp[0]'), 1);
    }
  }
}
console.log('PASS temple: all four outcomes for party/reserve, fees, HP1, MP/XP preservation, save/reload and dungeon reentry');

for (const [status, level, cost, chance] of [
  ['dead', 1, 100, 53], ['dead', 5, 500, 65], ['dead', 15, 1500, 95], ['dead', 30, 3000, 95],
  ['ash', 1, 250, 43], ['ash', 5, 1250, 55], ['ash', 17, 4250, 90], ['ash', 30, 7500, 90],
]) {
  const g = fixture(status, false, level);
  assert.equal(g.run('templeCost(s.members[0])'), cost);
  assert.equal(g.run('templeChance(s.members[0])'), chance);
  g.run(`s.gold=${cost};Math.random=()=>${chance}/100;var result=templeRaise(id)`);
  assert.equal(g.run('result.success'), false, 'at threshold fails');
  assert.equal(g.run('s.gold'), 0, 'exact balance is sufficient even on failure');
  g.run(`s.members[0].status='${status}';s.gold=${cost};Math.random=()=>(${chance}-.001)/100`);
  assert.equal(g.run('templeRaise(id).success'), true, 'below threshold succeeds');
}
for (const status of ['dead', 'ash']) {
  const g = fixture(status);
  assert.equal(g.run(`templeChance({status:'${status}',level:0})`), status === 'dead' ? 50 : 40);
  g.run('s.gold=templeCost(s.members[0])-1;Math.random=()=>{throw Error("must not roll")};save()');
  const before = g.run('JSON.stringify(s)');
  assert.equal(g.run('templeRaise(id)'), false);
  assert.equal(g.run('JSON.stringify(s)'), before);
}
console.log('PASS temple formulas, caps, probability boundaries, exact gold and insufficient-gold rejection');

for (const setup of [
  "s.area='dungeon'", "s.enemy={units:[]}", 's.pendingBoss=1', "s.pendingStairs='up'",
  "s.cells[s.pos].chest={opened:false}", "log('表示待ち')",
  "s.members[0].status='ok'", "s.members[0].status='lost'", "id='missing'",
]) {
  const g = fixture();
  g.run(setup);
  g.run('Math.random=()=>{throw Error("must not roll")};save()');
  const before = g.run('JSON.stringify(s)');
  assert.equal(g.run('templeRaise(id)'), false, setup);
  assert.equal(g.run('JSON.stringify(s)'), before, setup);
  if (g.run("s.area!=='town'||!idle()")) {
    g.run("$('#templeopen').onclick()");
    assert.equal(g.run("!!$('#templedialog').open"), false, setup);
  }
}
const retry = fixture();
retry.run('Math.random=()=>.999;templeRaise(id);templeRaise(id)');
assert.equal(retry.run('s.members[0].status'), 'lost');
assert.equal(retry.run('s.gold'), 8250, 'dead fee then ash fee');
assert.equal(retry.run('templeRaise(id)'), false, 'lost cannot be raised again');
const success = fixture();
success.run('Math.random=()=>0;templeRaise(id)');
assert.equal(success.run('templeRaise(id)'), false, 'successful raise cannot be charged twice');
console.log('PASS temple town/idle guards, invalid targets and repeated attempts');

// Capture the temple DOM only, keeping the shared game harness unchanged.
const ui = fixture();
ui.run(`document.createElement=()=>({children:[],append(...nodes){this.children.push(...nodes)}});
  Object.assign($('#templemembers'),{children:[],append(...nodes){this.children.push(...nodes)},replaceChildren(...nodes){this.children=nodes}});
  registerRecruit(generateRecruit('控え',0));s.reserve[0].members.status='ash';s.reserve[0].hp=0;
  registerRecruit(generateRecruit('正常',0));registerRecruit(generateRecruit('ロスト',0));s.reserve[2].members.status='lost';
  s.gold=499;$('#templeopen').onclick();`);
assert.equal(ui.run("$('#templedialog').open"), true);
assert.equal(ui.run("$('#templemembers').children.length"), 2, 'only dead/ash are listed');
assert.equal(ui.run("$('#templemembers').children[0].children[2].disabled"), true);
assert.equal(ui.run("$('#templemembers').children[1].children[2].disabled"), false);
assert.match(ui.run("$('#templemembers').children[0].children[0].children[1].textContent"), /パーティ.*死亡.*65%/);
assert.match(ui.run("$('#templemembers').children[1].children[0].children[1].textContent"), /控え.*灰.*43%/);
assert.equal(ui.run("$('#templemembers').children[0].children[0].children[0].textContent"), '蘇生([対象');
ui.run(`s.gold=1000;renderTemple();var raiseButton=$('#templemembers').children[0].children[2];
  changeRecruitParty(id,false);Math.random=()=>0;raiseButton.onclick();`);
assert.equal(ui.run("s.reserve.find(r=>r.members.id===id).hp"), 1, 'button resolves stable ID after benching');
assert.equal(ui.run("$('#templemembers').children.length"), 1);
assert.equal(ui.run("$('#templegold').textContent"), '金貨 500 G');
assert.match(ui.run("$('#templenotice').textContent"), /蘇生した/);
ui.run("$('#templemembers').children[0].children[2].onclick()");
assert.equal(ui.run("$('#templemembers').children[0].textContent"), '蘇生が必要な冒険者はいません。');
ui.run("$('#templeclose').onclick();$('#templeopen').onclick()");
assert.equal(ui.run("$('#templenotice').textContent"), '');
const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
assert.match(html, /<button id="templeopen">寺院<\/button>/);
assert.match(html, /<dialog id="templedialog" aria-labelledby="templetitle">/);
assert.match(html, /id="templenotice" role="status"/);
console.log('PASS temple UI handlers: active/reserve list, fees/chances, disabled state, stable IDs, notices and empty state');
const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,corpses:s.corpses,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',corpses:[],cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
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
function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;if(s.defeatPending){finishDefeat();return}render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function markDeaths(){s.members.forEach((m,i)=>{if(s.hp[i]<=0&&m.status==='ok')m.status='dead'})}
function hurt(n){s.hp=s.hp.map(h=>Math.max(0,h-n));markDeaths();if(s.hp.every(h=>h===0)){defeat()}}
function cell(i,action='forward'){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;let c=s.cells[i];if(mode==='flag'){if(!c.open)c.flag=c.flag?false:(s.flagKind||'power');render();return}if(!adjacent(s.pos,i)){log('現在地の上下左右に隣接するマスを選んでください。');render();return}if(c.flag){log('旗のあるマスには移動できない。旗を外すと進めます。');render();return}tickAilments(false);if(s.done){render();return}let previous=s.pos,wasOpen=c.open;s.previousPos=previous;s.pos=i;if(c.type==='boss'&&!s.relic){c.open=true;s.pendingBoss={previous};log('守護者と戦いますか？');render();return}if(!c.open){c.open=true;if(c.trap){if(triggerFloorTrap(c)){render();return}}else log(num(i)?`警告：周囲に罠が${num(i)}個。`:'静かな部屋。周囲に罠はない。')}if(!s.done){if(c.type==='down'){s.pendingStairs='down';log(`地下${s.floor+1}階に移動しますか？`)}else if(c.type==='stairs'){s.pendingStairs=true;log(s.floor===1?'町に移動しますか？':`地下${s.floor-1}階に移動しますか？`)}else if(Math.random()<encounterRate(i,wasOpen,action))encounter(i,!wasOpen,action)}render()}
function finish(){s.done=true;log(s.relic?`秘宝を持ち帰った！ 探索成功。金貨 ${s.gold}枚。`:`無事に帰還。金貨 ${s.gold}枚を持ち帰った。`)}const MAX_HP=[32,24,26],NAMES=['戦士','魔法使い','僧侶'];
function dice(n,d,add=0){let rolls=Array.from({length:n},()=>1+(Math.random()*d|0));return {value:rolls.reduce((a,b)=>a+b,add),text:`${n}d${d}${add?'+'+add:''} [${rolls.join(', ')}]${add?' + '+add:''}`}}
function strengthFor(job,level){return Math.min(18,([15,9,12,12][job]??10)+Math.floor((Math.max(1,level)-1)/5))}
function strengthBonus(str){return str<=5?str-6:str>=16?str-15:0}
function migrateStrength(m,job){if(m.str==null)m.str=strengthFor(job,m.level);}
function physicalAttack(i,e){let m=s.members[i],w=equippedWeapon(i),bonus=strengthBonus(m.str),count=Math.min(10,Math.max(w.minAttacks??1,jobOf(i)===0?1+Math.floor(m.level/5):1)),classHit=[0,2].includes(jobOf(i))?2+Math.floor(m.level/3):Math.floor(m.level/5),threshold=Math.max(1,Math.min(19,21-(enemyDefinition(e.id).ac+(e.acPenalty||0))-classHit-(w.hitBonus||0)-bonus+3*(s.enemy?enemyGroups().findIndex(g=>g.key===rowKey(e)):(e.row||0)))),damage=0,hitsCount=0;for(let n=0;n<count;n++)if((Math.random()*20|0)>=threshold){hitsCount++;damage+=Math.max(1,dice(...w.dice).value+bonus)}return {damage,hitsCount,count}}
function hits(hit,ac){let roll=dice(1,20).value;return roll===20||(roll!==1&&roll+hit+ac>=20)}
function reachableEnemyGroups(i,combat=s.enemy){let groups=enemyGroups(combat).filter(g=>g.units.some(e=>e.hp>0));return equippedWeapon(i)?.range==='ranged'?groups:groups.slice(0,2)}
function selectedEnemy(i){let key=s.attackRows?.[i];if(key==null){let legacy=s.enemy.units.find(e=>e.uid===s.enemy.target);key=legacy?rowKey(legacy):rowKey(s.enemy.units[0])}if(!reachableEnemyGroups(i).some(g=>String(g.key)===String(key)))return undefined;return s.enemy.units.find(e=>String(rowKey(e))===String(key)&&e.hp>0)}
function killReward(e){if(e.rewarded)return;e.rewarded=true;let d=enemyDefinition(e.id);s.enemy.pendingXP=(s.enemy.pendingXP||0)+d.xp;s.enemy.pendingGold=(s.enemy.pendingGold||0)+Math.floor(dice(...d.gold).value/3);s.enemy.pendingDrops=(s.enemy.pendingDrops||0)+1;log('敵を倒した。')}
function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0,survivors=s.members.filter((_,i)=>s.hp[i]>0).length,share=xp>0&&survivors>0?Math.max(1,Math.floor(xp/survivors)):0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=share;if(share)log(`生存者は経験値${share}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}

function attack(){if(logBusy()||!s.enemy||s.done)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}identifyEnemies();let cmds=s.commands.slice();log('── ターン開始 ──');for(let i=0;i<s.members.length;i++)if(s.hp[i]>0&&cmds[i]==='guard')log(`${NAMES[i]}は身を守る。`);for(let i=0;i<s.members.length;i++){if(s.hp[i]<=0)continue;if(s.ailments[i].paralysis>0){log(`${NAMES[i]}は麻痺して動けない。`);continue}if(cmds[i]==='guard')continue;if(cmds[i]==='dispel'){dispelUndead(i);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(cmds[i]==='item'){let plan=s.itemPlans[i];if(plan)useMedicine(i,plan.slot,plan.target,true,plan.id);continue}if(cmds[i]==='spell'){let plan=s.magicPlans[i];if(plan){let x=magic(plan.id),t=plan.target;if(x&&(x.target==='enemy'||x.target==='group')&&!validMagicTarget(x,t)){let original=s.enemy.units.find(e=>e.uid===t);t=s.enemy.units.find(e=>e.hp>0&&original&&rowKey(e)===rowKey(original))?.uid??s.enemy.units.find(e=>e.hp>0)?.uid}castMagic(i,plan.id,t)}else log(`${NAMES[i]}の呪文が選ばれていない。`);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(!canWeaponAttack(i)){log(`${NAMES[i]}の近接攻撃は後衛から届かない。`);continue}let e=selectedEnemy(i);if(!e){log(`${NAMES[i]}の攻撃対象の列は全滅している。`);continue;}let d=enemyDefinition(e.id);let result=physicalAttack(i,e);if(!result.hitsCount){log(`${NAMES[i]}の攻撃は${enemyDisplay(e)}にかわされた。`);continue}let damage=flagDamage(result.damage);e.hp=Math.max(0,e.hp-damage);log(`${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。`);if(e.hp===0)killReward(e);if(!s.enemy.units.some(e=>e.hp>0))break}if(!s.enemy.units.some(e=>e.hp>0)){finishMonsterBattle()}else if(s.enemy.initiative==='party'){s.enemy.initiative='normal'}else{enemyTurn(cmds)}resetCommandEntry();resetPartyCommands();if(s.enemy){let next=s.enemy.units.find(e=>e.hp>0);s.attackRows=s.attackRows.map(key=>s.enemy.units.some(e=>String(rowKey(e))===String(key)&&e.hp>0)?key:rowKey(next))}render()}
function ensureStats(){if(!s.members){s.members=CLASSES.slice(0,3).map(c=>({level:1,xp:0,maxHP:c.hp,maxMP:c.mp,attack:c.attack,ac:c.ac}));s.mp=CLASSES.slice(0,3).map((c,i)=>i===1?Math.min(c.mp,(s.spell===undefined?c.mp:s.spell*SPELLS.blast.cost)):i===2?Math.min(c.mp,(s.heal===undefined?c.mp:s.heal*SPELLS.heal.cost)):0);if(s.area==='town')s.mp=s.members.map(m=>m.maxMP);delete s.spell;delete s.heal}s.mp??=s.members.map(m=>m.maxMP);if(s.enemy&&!s.enemy.units){let old=s.enemy,id=old.boss?'guardian':'skeleton';s.enemy={boss:old.boss,target:0,units:[{id,uid:0,hp:old.hp,rewarded:false}]}}}
function shownMember(i){return displayVitals?.members?.[i]||s.members[i]}
function maxHP(i){return s.members[i].maxHP}
function levelUp(indices=s.members.map((_,i)=>i)){let reports=[];indices.forEach(i=>{let m=s.members[i];if(!m)return;let old={...m};while(m.level<LEVEL_CAP&&m.xp>=requiredXP(m.level+1,i)){m.level++;m.maxHP+=dice(...memberClass(i).hpGrowth).value;m.maxMP+=dice(...memberClass(i).mpGrowth).value;m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));let learned=learnMagic(i,m.level);if(learned.length)reports.push(`${NAMES[i]}は${learned.join("・")}を習得した。`);}if(m.level!==old.level)reports.push(`${NAMES[i]} Lv.${old.level} → ${m.level}　HP +${m.maxHP-old.maxHP} / MP +${m.maxMP-old.maxMP} / STR +${m.str-(old.str??strengthFor(jobOf(i),old.level))}`)});s.levelReport=reports}
function renderStats(){ $('#partyreorder').disabled=!idle()||s.done; $('#statsbody').innerHTML=s.members.map((_,i)=>{let m=shownMember(i);let values=[['HP',`${(displayVitals?.hp||s.hp)[i]}/${m.maxHP}`],['MP',`${(displayVitals?.mp||s.mp)[i]}/${m.maxMP}`],['STR',m.str],['AC',effectiveAC(i)],['IQ',m.intelligence],['PIE',m.piety],['経験値',m.xp],['NEXT',m.level>=LEVEL_CAP?'上限':Math.max(0,requiredXP(m.level+1,i)-m.xp)]];return `<article class="statcard"><h3>${NAMES[i]} <small>Lv.${m.level} · ${i<3?'前衛':'後衛'}</small>${ailmentTags(i)}</h3><dl class="stat-metrics">${values.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div class="stat-actions"><button data-stat-inventory="${i}" ${!idle()?'disabled':''}>アイテム</button>${hasSpells(i)?`<button data-stat-cast="${i}" ${s.enemy||logBusy()?'disabled':''}>呪文</button>`:''}</div></article>`}).join('')}
function showLevelReport(){if(!s.levelReport?.length)return;$('#levelreport').textContent=s.levelReport.join('\n');if(!$('#leveldialog').open)$('#leveldialog').showModal()}
function canWeaponAttack(i){return i<3||equippedWeapon(i)?.range==='ranged'}
function itemDescription(w){return diceLabel(w)+(w.dice?' · '+(w.range==='ranged'?'遠距離':'近距離'):'')}
function renderCatalog(){ $('#catalogbody').innerHTML=`<table><thead><tr><th>敵</th><th>HP</th><th>攻撃</th><th>AC</th><th>経験値</th><th>群れ</th><th>金貨</th></tr></thead><tbody>${ENEMIES.map(e=>`<tr><td>${e.name}</td><td>${diceLabel({dice:e.hp})}</td><td>${diceLabel({dice:e.attack})}</td><td>${e.ac}</td><td>${e.xp}</td><td>${e.groupSize.join("〜")}体</td><td>${diceLabel({dice:e.gold})} ÷3（切捨）</td></tr>`).join('')}</tbody></table>`}
function drawEnemies(){let combat=visibleCombat();if(!combat)return '';let groups=enemyGroups(combat),height=Math.min(130,260/groups.length);return groups.map((g,row)=>{let y=62+row*height;let visible=g.units.filter(e=>!e.rewarded);return visible.map((e,col)=>{if(e.rewarded)return '';let width=Math.min(108,560/visible.length-8),x=320+(col-(visible.length-1)/2)*(width+8);return `<g data-enemy-uid="${e.uid}"><rect x="${x-width/2}" y="${y}" width="${width}" height="${height-9}" rx="6" fill="#20271f" stroke="#66725d"/><text x="${x}" y="${y+height*.65}" text-anchor="middle" fill="#dac595" font-size="52">${enemyDefinition(e.id).icon}</text><text x="${x}" y="${y+height-18}" text-anchor="middle" fill="#dac595" font-size="16">${e.sleep>0?'Zzz':''}</text></g>`}).join('')}).join('')}
function ensureProfile(){s.corpses??=[];s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.status??=s.area!=='town'&&s.hp[i]<=0?'dead':'ok';m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members){r.members.status??='ok';migrateStrength(r.members,r.members.job??0)}ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
function weapon(id){return WEAPONS.find(w=>w.id===id)||MEDICINES.find(w=>w.id===id)}
function equippedWeapon(i){return weapon(s.inventory[i][s.equipped[i]])}
function diceLabel(w){if(w.kind==='medicine')return w.description;if(w.part)return `${{head:"頭",body:"胴体",feet:"足"}[w.part]} AC −${w.ac}`;return `${w.dice[0]}d${w.dice[1]}${w.dice[2]?'+'+w.dice[2]:''}`}
function idle(){return !currentChest()&&!logBusy()&&!s.enemy&&!s.pendingBoss&&!s.pendingStairs}
function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render()}
function innCost(){return s.members.reduce((sum,m)=>sum+(m.status==='ok'?m.level*10:0),0)}
function stayAtInn(kind){if(s.area!=='town'||!idle()||!['stable','room'].includes(kind))return;let cost=kind==='room'?innCost():0;if(s.gold<cost)return false;if(cost)s.gold-=cost;levelUp(s.members.flatMap((m,i)=>m.status==='ok'?[i]:[]));s.mp=s.members.map((m,i)=>m.status==='ok'?m.maxMP:s.mp[i]);if(kind==='room')s.hp=s.members.map((m,i)=>m.status==='ok'?m.maxHP:s.hp[i]);render();$('#inndialog').close();showLevelReport();return true}
function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.members.some(m=>m.status!=='ok')){$('#townnotice').textContent='死亡したメンバーを外してください。';render();return;}$('#townnotice').textContent='';if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
function defeat(){
 if(s.defeatPending||!s.members.length)return;
 s.members.forEach((m,i)=>{m.status='dead';s.hp[i]=0});
 (s.corpses??=[]).push({id:crypto.randomUUID(),floor:s.floor,cell:s.pos,records:structuredClone(partyRecords()),gold:s.gold});
 s.gold=0;s.defeatPending=true;s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;
 // Keep the party visible until its queued damage/death snapshots have played.
 log('一行は全滅した。遺体は迷宮に残された。町で態勢を立て直そう。');save();
}
function finishDefeat(){
 if(!s.defeatPending)return;
 for(const key of PARTY_FIELDS)s[key]=[];
 delete s.defeatPending;s.done=false;s.light=false;s.watchful=false;s.dumapicUses=0;s.levelReport=[];
 resetPartyCommands();resetDungeon();render();
}
function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop);if(!pool.length)return;let w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
// 寺院の費用・成功率は本作の暫定式。成功率は百分率で返す。
function templeCost(m){return m.status==='dead'?100*m.level:m.status==='ash'?250*m.level:0}
function templeChance(m){return m.status==='dead'?Math.max(50,Math.min(95,50+3*m.level)):m.status==='ash'?Math.max(40,Math.min(90,40+3*m.level)):0}
function templeRaise(id){
 if(s.area!=='town'||!idle())return false;
 const r=trainingRoster().find(r=>r.members.id===id);
 if(!r||!['dead','ash'].includes(r.members.status))return false;
 const m=r.members,cost=templeCost(m);
 if(s.gold<cost)return false;
 s.gold-=cost;
 const success=Math.random()*100<templeChance(m);
 m.status=success?'ok':m.status==='dead'?'ash':'lost';
 const i=s.members.findIndex(m=>m.id===id),hp=success?1:0;
 if(i>=0)s.hp[i]=hp;else r.hp=hp;
 const result={id,name:m.name||CLASSES[m.job??0].name,success,status:m.status,cost};
 render();renderTemple(result);
 return result;
}
function renderTemple(result=null){
 $('#templegold').textContent=`金貨 ${s.gold} G`;
 if(result)$('#templenotice').textContent=result.success?`${result.name}は蘇生した。HPが1になった。`:`${result.name}の蘇生に失敗した。${result.status==='ash'?'灰になった。':'ロストした。'}`;
 const list=$('#templemembers');list.replaceChildren();
 const records=trainingRoster().filter(r=>['dead','ash'].includes(r.members.status));
 if(!records.length){const p=document.createElement('p');p.textContent='蘇生が必要な冒険者はいません。';list.append(p)}
 for(const r of records){
  const m=r.members,row=document.createElement('div'),info=document.createElement('div'),name=document.createElement('b'),detail=document.createElement('small'),price=document.createElement('span'),button=document.createElement('button');
  row.className='shopitem';
  name.textContent=m.name||CLASSES[m.job??0].name;
  detail.textContent=`${s.members.some(p=>p.id===m.id)?'パーティ':'控え'} · Lv.${m.level} · ${m.status==='dead'?'死亡':'灰'} · 成功率 ${templeChance(m)}%`;
  price.textContent=`${templeCost(m)} G`;button.textContent='蘇生';
  button.disabled=s.area!=='town'||!idle()||s.gold<templeCost(m);
  button.onclick=()=>templeRaise(m.id);
  info.append(name,detail);row.append(info,price,button);list.append(row);
 }
}
$('#templeopen').onclick=()=>{if(s.area!=='town'||!idle())return;$('#templenotice').textContent='';renderTemple();$('#templedialog').showModal()};
$('#templeclose').onclick=()=>$('#templedialog').close();
function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
function openInventory(i){if(!idle())return;inventoryMember=i;renderInventory();$('#inventorydialog').showModal()}
function target(turn=0){const d=((s.dir||0)+turn+4)%4;const dx=[0,1,0,-1][d],dy=[-1,0,1,0][d];const x=s.pos%size()+dx,y=(s.pos/size()|0)+dy;return x<0||x>=size()||y<0||y>=size()?-1:y*size()+x}
function move(action){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;if(action==='left'||action==='right'){s.dir=(s.dir+(action==='left'?3:1))%4;render();return}let i=target(({back:2,strafeLeft:-1,strafeRight:1})[action]??0);if(i<0){log('外壁が行く手を塞いでいる。');render();return}mode='move';cell(i,action)}
function flag(i){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss||i<0)return;let c=s.cells[i];if(c.open){log('探索済みのマスには旗を立てられません。');render();return}c.flag=c.flag?false:(s.flagKind||'power');render()}
function face(i){if(i<0)return {fill:'#202722',label:'外壁',symbol:'',sub:''};let c=s.cells[i];return {color:c.flag?FLAG_COLORS[placedFlag(c)]:'#e8d2a2',fill:c.open?'#3b493c':c.safe?'#34413a':'#151f1b',label:c.open?'探索済み':c.safe?'安全確認済み':'未探索',symbol:c.open&&c.type==='boss'?'☠':c.open&&c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.flag?'⚑':c.open?(c.spent?'×':String(num(i))):c.disarmed?'✓':c.safe?'✓':'？',sub:c.disarmed?'罠を解除済み':c.spent?'作動済みの罠':c.flag?'旗あり':c.open?'周囲の罠の数':''}}

exec
/bin/bash -lc "rg -n 'function (game|floor|enterDungeon|returnTown|rosterSaveState|partyRecords|applyPartyRecords)|fresh\\(|floors\\[|const PARTY_FIELDS' dist tests && sed -n '1,65p' tests/game.cjs && tail -25 tests/game.cjs && rg --files tests" in /workspace/dungeonsweeper
 succeeded in 0ms:
tests/final-boss.cjs:13:  g.run(`fresh(${floor});s.hp[0]=9999;s.pos=s.boss;encounter(s.pos,true);`);
tests/final-boss.cjs:32:g.run(`fresh(10);s.enemy={boss:false,chestBattle:false,units:[{id:'goblin',uid:0,row:0,hp:1}]};attack();`);
tests/final-boss.cjs:90:legacy.floors[10]={floor:10,cells:structuredClone(legacy.cells)};
tests/final-boss.cjs:91:legacy.floors[11]={floor:11,cells:structuredClone(legacy.cells)};
tests/final-boss.cjs:96:assert.equal(old.run("s.floors[10].cells.some(c=>c.type==='down')"), false);
tests/training.cjs:2:function game(saved=null){
tests/training.cjs:70:g.run(`fresh(3);s.pos=17;s.gold=321;s.cleared=true;s.light=true;s.watchful=true;s.dumapicUses=4;
tests/training.cjs:122:g.run('fresh(2);s.pos=10;s.gold=45;hurt(999);');g.drain();
tests/game.cjs:7:drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
tests/game.cjs:10:drain();run(`for(let floor of [1,2,3]){let expected=[9,15,23][floor-1],boardSize=6+floor*2;if(trapCount(floor,boardSize)!==expected)throw Error('trap count formula');for(let trial=0;trial<1000;trial++){fresh(floor);if(s.cells.filter(c=>c.trap).length!==expected)throw Error('generated trap count');let path=[s.start],p=s.start;while(p!==s.boss){let choices=[];if(p%size()!==s.boss%size())choices.push(p+(p%size()<s.boss%size()?1:-1));if((p/size()|0)!==(s.boss/size()|0))choices.push(p+(p<s.boss?size():-size()));p=choices.find(i=>i===s.boss||!s.cells[i].trap);if(p===undefined)throw Error('trapped guardian path');path.push(p)}if([s.start,...around(s.start),...path].some(i=>s.cells[i].trap))throw Error('unsafe start/guardian path')}}`);drain();console.log('PASS floor trap counts and 1000 generated maps per floor preserve start area and guardian path');
tests/game.cjs:11:drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');
tests/game.cjs:14:drain();run(`var escapeOriginalMembers=structuredClone(s.members),escapeOriginalHP=s.hp.slice(),escapeOriginalAilments=structuredClone(s.ailments);fresh(1);s.members=Array.from({length:6},(_,i)=>({...structuredClone(s.members[i%3]),level:1}));s.hp=Array(6).fill(20);s.ailments=Array.from({length:6},()=>({poison:false,paralysis:0}));s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'wolf',uid:0,hp:20}]};if(escapeChance()!==45)throw Error('escape six level 1 vs level 2');s.members.forEach(m=>m.level=10);if(escapeChance()!==90)throw Error('escape six level 10 vs level 2');s.members=s.members.slice(0,1);s.hp=s.hp.slice(0,1);s.ailments=s.ailments.slice(0,1);s.members[0].level=1;if(escapeChance()!==60)throw Error('escape one level 1 vs level 2');s.members[0].level=20;if(escapeChance()!==95)throw Error('escape upper clamp');s.hp[0]=0;if(escapeChance()!==10)throw Error('escape no eligible party');s.hp[0]=20;s.members[0].level=1;s.enemy.units[0].id='goblin';if(escapeChance()!==60)throw Error('escape one level 1 vs level 2 after eligibility restore');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members[0].level=20;s.enemy.units[0].id='wolf';if(escapeChance()!==95)throw Error('escape clamp at 95');Math.random=()=>0;var oldGold=s.gold;flee();if(s.enemy||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape');s.members=escapeOriginalMembers;s.hp=escapeOriginalHP;s.ailments=escapeOriginalAilments`);console.log('PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction');
tests/game.cjs:77:s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
tests/game.cjs:93:s.enemy=null;s.done=false;s.pendingBoss=null;s.pendingStairs=false;fresh(1);s.cells.forEach(c=>{c.trap=false;c.flag=false;c.chest=undefined});
tests/game.cjs:280:drain();run(`if(trapPower(1)!==1||trapPower(5)!==2||trapPower(10)!==3.25||trapPower(11)!==3.25)throw Error('trap power bounds');for(let f=1;f<=10;f++){fresh(f);if(size()!==Math.min(12,6+2*f)||trapCount(f,size())!==[9,15,23,24,26,27,29,30,31,31][f-1])throw Error('floor config '+f)}s.members=s.members.slice(0,1);s.hp=[100];s.ailments=[{poison:false,paralysis:0}];Math.random=()=>0;s.floor=1;let needle=s.cells[s.pos];needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-7)throw Error('floor 1 needle baseline');s.hp[0]=100;s.floor=10;needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('floor 10 needle scaling');s.hp[0]=100;triggerChestTrap({trap:'needle'});if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('chest needle scaling');`);drain();console.log('PASS 10-floor trap configuration and scaling');
dist/party.js:6:const PARTY_FIELDS=['members','hp','mp','inventory','equipped','armor','ailments'];
dist/party.js:19:function partyRecords(){return s.members.map((m,i)=>Object.fromEntries(PARTY_FIELDS.map(key=>[key,s[key][i]])))}
dist/recruits.js:21:function rosterSaveState() {
dist/game.js:1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,corpses:s.corpses,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',corpses:[],cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
dist/game.js:50:function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
dist/game.js:51:function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.members.some(m=>m.status!=='ok')){$('#townnotice').textContent='死亡したメンバーを外してください。';render();return;}$('#townnotice').textContent='';if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
dist/game.js:123:try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type=s.floor<MAX_FLOOR?'down':''}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
dist/game.js:130:$('#resetopen').onclick=()=>$('#resetdialog').showModal();$('#resetcancel').onclick=()=>$('#resetdialog').close();$('#resetconfirm').onclick=()=>{s=null;fresh();s.area='town';s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);$('#resetdialog').close();render()};
dist/game.js:145:function rememberFloor(){s.floors??={};s.floors[s.floor]={floor:s.floor,size:s.size,cells:structuredClone(s.cells),start:s.start,boss:s.boss,relic:s.relic};}
dist/game.js:146:function travelFloor(next,fromTown=false){if(!Number.isInteger(next)||next<1||next>MAX_FLOOR)return false;let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.clearNotice=false;s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}
dist/spells.js:36:function validMagicTarget(x,t){if(x.target==='ally')return Number.isInteger(t)&&s.hp[t]>0;if(x.target==='enemy'||x.target==='group')return !!s.enemy?.units.some(e=>e.uid===t&&e.hp>0);if(x.target==='floor')return Number.isInteger(t)&&(t===s.floor||!!s.floors[t]);return true}
const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`let hpBeforeTown=s.hp[0];answerStairs(true);if(s.area!=='town'||s.hp[0]!==hpBeforeTown||s.scan!==5)throw Error('town return preserves HP');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');run(`s.area='town';s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.members.forEach((m,i)=>{m.status=i===0?'dead':i===1?'ash':'ok';m.level=1;m.xp=650});s.hp=[0,0,10];s.mp=[0,0,0];let deadMax=s.members[0].maxHP,ashMax=s.members[1].maxHP;s.gold=0;levelUp([2]);if(s.members[0].level!==1||s.members[1].level!==1||s.members[0].maxHP!==deadMax||s.members[1].maxHP!==ashMax||s.members[2].level<=1)throw Error('inn dead/ash level exclusion');s.members[0].status='ok';levelUp([0]);if(s.members[0].level<=1)throw Error('inn level after revival');s.members.forEach(m=>{m.level=1;m.xp=0;m.status='ok'});`);console.log('PASS inn skips dead/ash level-up and levels after revival');
drain();run(`
s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);s.hp[0]=7;s.mp[0]=0;if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==1)||s.hp[0]!==7||s.mp[0]!==0)throw Error('return must not heal or level');let innCostBefore=innCost();s.gold=innCostBefore-1;$('#innopen').onclick();if(!$('#room').disabled)throw Error('room enabled without funds');s.gold=innCostBefore;$('#innopen').onclick();if(!$('#inncost').textContent.includes('Lv × 10 G の合計'))throw Error('inn cost wording');if(!stayAtInn('stable')||s.hp[0]!==7||s.mp[0]!==s.members[0].maxMP||s.members[0].level!==s.members[0].xpTargets.filter((v,j)=>j>=1&&v<=650).length)throw Error('stable heal and level');s.hp[0]=3;s.mp[0]=0;let cost=innCost();s.gold=cost+5;if(!stayAtInn('room')||s.gold!==5||s.hp[0]!==s.members[0].maxHP||s.mp[0]!==s.members[0].maxMP)throw Error('room heal and cost');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
Math.random=()=>.5;if(hits(3,3)||!hits(3,9))throw Error('AC direction');Math.random=()=>0;if(hits(100,9))throw Error('natural1');Math.random=()=>.999;if(!hits(-100,-10))throw Error('natural20');
s.enemy={boss:false,target:1,units:[{id:'slime',uid:0,hp:1000,rewarded:false},{id:'wolf',uid:1,hp:1,rewarded:false}]};s.commands=['fight','guard','guard'];var oldxp=s.members[0].xp;attack();if(!s.enemy||s.enemy.units[0].hp!==1000||s.enemy.units[1].hp!==0||s.members[0].xp!==oldxp||s.enemy.pendingXP!==14)throw Error('target or reward');`);drain();run(`var ex=s.members[0].xp;killReward(s.enemy.units[1]);if(s.members[0].xp!==ex)throw Error('double reward');s.enemy.units[0].hp=1000;s.mp[1]=2;s.magicPlans[1]={id:'halito',target:0};s.commands=['guard','spell','guard'];attack();if(s.mp[1]!==0||s.enemy.units[0].hp!==992)throw Error('spell MP damage');`);drain();run(`s.enemy=null;s.mp[2]=1;var before=s.hp.join();castMagic(2,'dios',0);if(s.hp.join()!==before||s.mp[2]!==1)throw Error('insufficient MP');s.area='dungeon';delete s.members;delete s.mp;s.spell=2;s.heal=1;s.enemy={boss:false,hp:11};ensureProfile();if(s.mp[1]!==8||s.mp[2]!==3||s.enemy.units[0].hp!==11)throw Error('migration');`);
console.log('PASS XP deferred to town, multi-level growth, living refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
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
tests/death-status.cjs
tests/temple.cjs
tests/final-boss.cjs
tests/training.cjs
tests/game.cjs
tests/training-browser.py

exec
/bin/bash -lc "sed -n '1,45p' tests/training.cjs && sed -n '55,135p' tests/training.cjs && sed -n '43,91p' dist/game.js && cat dist/recruits.js | head -25 && tail -14 /workspace/dsw-queue/report/031-heavy-corpse-rescue-codex-output.md" in /workspace/dungeonsweeper
 succeeded in 0ms:
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function game(saved=null){
 let timers=[],els={},storage=saved;
 const el=()=>({style:{},dataset:{},children:[],setAttribute(){},addEventListener(){},append(...items){this.children.push(...items)},replaceChildren(...items){this.children=items},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});
 const ctx={crypto:require('node:crypto').webcrypto,structuredClone,document:{addEventListener(){},querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el},localStorage:{getItem:()=>storage,setItem:(k,v)=>{storage=v}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math)};
 vm.createContext(ctx);
 for(const f of ['weapons','monster-data','balance','spells','items','flags','traps','combatui','party','monsters','recruits','game','training'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f+'.js'),'utf8'),ctx);
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
console.log('PASS deletion including last active member and empty save reload');
g=game();g.run("s.area='town';s.pos=0;var st=[0,1,2].map(i=>generateRecruit('状態'+i,0));st.forEach(registerRecruit);s.reserve[0].members.status='lost';s.reserve[1].members.status='dead';s.reserve[2].members.status='ash'");
assert.equal(g.run('changeRecruitParty(st[0].members.id,true)'),false);assert.equal(g.run('changeRecruitParty(st[1].members.id,true)'),true);assert.equal(g.run('changeRecruitParty(st[2].members.id,true)'),true);
assert.equal(g.run('deleteRecruit(st[0].members.id)'),true);assert.equal(g.run('trainingRoster().some(r=>r.members.id===st[0].members.id)'),false);
console.log('PASS lost recruits cannot join but can be deleted; dead/ash can join');

// Wipes must preserve complete records separately from the playable roster.
function corpseParty(count=6){
 const g=game();
 g.run(`Math.random=()=>.5;[3,2,0,1,0,2,1].slice(0,${count+1}).forEach((job,i)=>{
  const r=generateRecruit('遺体'+i,job);registerRecruit(r);if(i<${count})changeRecruitParty(r.members.id,true);
 });enterDungeon();`);
 g.drain();return g;
}
g=corpseParty();
g.run(`fresh(3);s.pos=17;s.gold=321;s.cleared=true;s.light=true;s.watchful=true;s.dumapicUses=4;
 s.inventory[0].push('helm','healingPotion');s.armor[0].head=1;s.members[0].xp=123;
 s.members[0].extra={history:[1,2]};s.mp[1]=3;s.ailments[0]={poison:true,paralysis:2};
 var reserveBefore=JSON.stringify(s.reserve),liveRecords=partyRecords(),recordsBefore=structuredClone(liveRecords);
 recordsBefore.forEach(r=>{r.hp=0;r.members.status='dead'});
 log('全滅直前');hurt(999);`);
assert.equal(g.run('s.corpses.length'),1);
assert.equal(g.run('s.gold'),0);
assert.equal(g.run('s.corpses[0].floor'),3);
assert.equal(g.run('s.corpses[0].cell'),17);
assert.equal(g.run('s.corpses[0].gold'),321);
assert.match(g.run('s.corpses[0].id'),/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
assert.equal(g.run('JSON.stringify(s.corpses[0].records)===JSON.stringify(recordsBefore)'),true);
assert.equal(g.run("displayVitals.hp.every(h=>h>0)&&displayVitals.members.every(m=>m.status==='ok')"),true,'death must not leak before its log');
assert.equal(g.run("logQueue.at(-1).hp.every(h=>h===0)&&logQueue.at(-1).members.every(m=>m.status==='dead')"),true);
g.run('defeat();');assert.equal(g.run('s.corpses.length'),1,'repeated defeat must not duplicate corpses');
const duringWipe=g.saved();
assert.equal(JSON.parse(duringWipe).partyIds.length,0);
assert.equal(JSON.parse(duringWipe).roster.length,1,'pending wipe save contains only the existing reserve');
g.drain();
function assertWipeTown(g){
 assert.equal(g.run('s.area'),'town');assert.equal(g.run('s.done'),false);
 assert.equal(g.run('s.members.length'),0);assert.equal(g.run('s.gold'),0);
 assert.equal(g.run('PARTY_FIELDS.every(key=>s[key].length===0)'),true);
 assert.equal(g.run('s.enemy'),null);assert.equal(g.run('s.pendingStairs'),false);
 assert.equal(g.run('s.pendingBoss'),null);assert.equal(g.run('idle()'),true);
 assert.equal(g.run('Object.keys(s.floors).length'),0);
 assert.equal(g.run('s.cells.some(c=>c.open)'),false);
 assert.equal(g.run('s.light||s.watchful||s.dumapicUses>0'),false);
 assert.equal(g.run("$('#entrance').disabled"),true);
}
assertWipeTown(g);
assert.equal(g.run('JSON.stringify(s.reserve)===reserveBefore'),true);
assert.equal(g.run('s.cleared'),true);
g.run("s.corpses[0].records[0].members.name='遺体(<印>)';renderTraining();");
assert.equal(g.run("$('#recruitlist').children[0].textContent"),'迷宮に残された遺体：地下3階（遺体(<印>)、遺体1、遺体2、遺体3、遺体4、遺体5）');
assert.equal(g.run("$('#recruitlist').children[0].innerHTML"),undefined,'names must be rendered as text');
const corpses=g.run('JSON.stringify(s.corpses)');
g.run("liveRecords[0].members.extra.history.push(9);liveRecords[0].inventory.push('sword');save();");
assert.equal(g.run('JSON.stringify(s.corpses)'),corpses,'corpse records must be independent copies');
let restored=game(g.saved());assertWipeTown(restored);
assert.equal(restored.run('JSON.stringify(s.corpses)'),corpses);
restored=game(duringWipe);assertWipeTown(restored);
assert.equal(restored.run('s.corpses.length'),1);
assert.equal(restored.run('s.reserve.length'),1);
assert.equal(restored.run("s.corpses[0].records.every(r=>r.members.status==='dead'&&r.hp===0)"),true);
restored=game(restored.saved());assertWipeTown(restored);
assert.equal(restored.run('s.corpses.length'),1,'reloading completed wipe must not create another corpse');
console.log('PASS wipe snapshots, UUID/location/gold, complete corpse records, empty party, reserve isolation, training text and reload during/after logs');

// Corpses survive new labyrinths and additional wipes without entering the reserve.
g.run('var firstCorpse=JSON.stringify(s.corpses[0]);changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();');g.drain();
g.run('fresh(2);s.pos=10;s.gold=45;hurt(999);');g.drain();
assertWipeTown(g);assert.equal(g.run('s.corpses.length'),2);
assert.equal(g.run('JSON.stringify(s.corpses[0])===firstCorpse'),true);
assert.equal(g.run('s.corpses[1].floor'),2);assert.equal(g.run('s.corpses[1].cell'),10);
assert.equal(g.run('s.corpses[1].gold'),45);assert.equal(g.run('s.corpses[1].records.length'),1);
assert.equal(g.run('s.corpses[0].id!==s.corpses[1].id'),true);
assert.equal(g.run('trainingRoster().length'),0);
g.run('defeat();');assert.equal(g.run('s.corpses.length'),2,'empty party cannot leave another corpse');
assert.equal(game(g.saved()).run('s.corpses.length'),2);
console.log('PASS corpses persist across dungeon regeneration, multiple wipes and empty-party calls');

for(const [name,action,count] of [
 ['exploration poison','s.ailments.forEach(a=>a.poison=true);cell(1)',6],
 ['battle poison',"s.ailments.forEach(a=>a.poison=true);s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}]};attack()",6],
function weapon(id){return WEAPONS.find(w=>w.id===id)||MEDICINES.find(w=>w.id===id)}
function equippedWeapon(i){return weapon(s.inventory[i][s.equipped[i]])}
function diceLabel(w){if(w.kind==='medicine')return w.description;if(w.part)return `${{head:"頭",body:"胴体",feet:"足"}[w.part]} AC −${w.ac}`;return `${w.dice[0]}d${w.dice[1]}${w.dice[2]?'+'+w.dice[2]:''}`}
function idle(){return !currentChest()&&!logBusy()&&!s.enemy&&!s.pendingBoss&&!s.pendingStairs}
function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render()}
function innCost(){return s.members.reduce((sum,m)=>sum+(m.status==='ok'?m.level*10:0),0)}
function stayAtInn(kind){if(s.area!=='town'||!idle()||!['stable','room'].includes(kind))return;let cost=kind==='room'?innCost():0;if(s.gold<cost)return false;if(cost)s.gold-=cost;levelUp(s.members.flatMap((m,i)=>m.status==='ok'?[i]:[]));s.mp=s.members.map((m,i)=>m.status==='ok'?m.maxMP:s.mp[i]);if(kind==='room')s.hp=s.members.map((m,i)=>m.status==='ok'?m.maxHP:s.hp[i]);render();$('#inndialog').close();showLevelReport();return true}
function resetDungeon(){let report=s.levelReport;fresh(1);s.area='town';s.floors={};s.cells.forEach(c=>c.open=false);s.logs=[];s.levelReport=report;s.dungeonCycleVersion=1;}
function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.members.some(m=>m.status!=='ok')){$('#townnotice').textContent='死亡したメンバーを外してください。';render();return;}$('#townnotice').textContent='';if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
function defeat(){
 if(s.defeatPending||!s.members.length)return;
 s.members.forEach((m,i)=>{m.status='dead';s.hp[i]=0});
 (s.corpses??=[]).push({id:crypto.randomUUID(),floor:s.floor,cell:s.pos,records:structuredClone(partyRecords()),gold:s.gold});
 s.gold=0;s.defeatPending=true;s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;
 // Keep the party visible until its queued damage/death snapshots have played.
 log('一行は全滅した。遺体は迷宮に残された。町で態勢を立て直そう。');save();
}
function finishDefeat(){
 if(!s.defeatPending)return;
 for(const key of PARTY_FIELDS)s[key]=[];
 delete s.defeatPending;s.done=false;s.light=false;s.watchful=false;s.dumapicUses=0;s.levelReport=[];
 resetPartyCommands();resetDungeon();render();
}
function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop);if(!pool.length)return;let w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
// 寺院の費用・成功率は本作の暫定式。成功率は百分率で返す。
function templeCost(m){return m.status==='dead'?100*m.level:m.status==='ash'?250*m.level:0}
function templeChance(m){return m.status==='dead'?Math.max(50,Math.min(95,50+3*m.level)):m.status==='ash'?Math.max(40,Math.min(90,40+3*m.level)):0}
function templeRaise(id){
 if(s.area!=='town'||!idle())return false;
 const r=trainingRoster().find(r=>r.members.id===id);
 if(!r||!['dead','ash'].includes(r.members.status))return false;
 const m=r.members,cost=templeCost(m);
 if(s.gold<cost)return false;
 s.gold-=cost;
 const success=Math.random()*100<templeChance(m);
 m.status=success?'ok':m.status==='dead'?'ash':'lost';
 const i=s.members.findIndex(m=>m.id===id),hp=success?1:0;
 if(i>=0)s.hp[i]=hp;else r.hp=hp;
 const result={id,name:m.name||CLASSES[m.job??0].name,success,status:m.status,cost};
 render();renderTemple(result);
 return result;
}
function renderTemple(result=null){
 $('#templegold').textContent=`金貨 ${s.gold} G`;
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
 const records=s.defeatPending?(s.reserve||[]):trainingRoster(), seen=new Set();
 for(const r of records){if(!r.members.id||seen.has(r.members.id))r.members.id=crypto.randomUUID();seen.add(r.members.id)}
 const snapshot={...s,rosterVersion:1,roster:records,partyIds:s.defeatPending?[]:s.members.map(m=>m.id),corpses:structuredClone(s.corpses||[])};
 for(const key of PARTY_FIELDS)delete snapshot[key];
// 10-floor trap configuration and scaling regression.
drain();run(`if(trapPower(1)!==1||trapPower(5)!==2||trapPower(10)!==3.25||trapPower(11)!==3.25)throw Error('trap power bounds');for(let f=1;f<=10;f++){fresh(f);if(size()!==Math.min(12,6+2*f)||trapCount(f,size())!==[9,15,23,24,26,27,29,30,31,31][f-1])throw Error('floor config '+f)}s.members=s.members.slice(0,1);s.hp=[100];s.ailments=[{poison:false,paralysis:0}];Math.random=()=>0;s.floor=1;let needle=s.cells[s.pos];needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-7)throw Error('floor 1 needle baseline');s.hp[0]=100;s.floor=10;needle.trap=true;triggerFloorTrap(needle);if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('floor 10 needle scaling');s.hp[0]=100;triggerChestTrap({trap:'needle'});if(s.hp[0]!==100-Math.floor(7*3.25))throw Error('chest needle scaling');`);drain();console.log('PASS 10-floor trap configuration and scaling');

require('./final-boss.cjs');

require('./death-status.cjs');
require('./temple.cjs');
tests/death-status.cjs
tests/temple.cjs
tests/final-boss.cjs
tests/training.cjs
tests/game.cjs
tests/training-browser.py


exec
/bin/bash -lc "sed -n '1,55p' tests/temple.cjs && sed -n '1,60p' tests/training-browser.py && rg -n 'function (log|pumpLog|partyRecords|applyPartyRecords|rosterSaveState)|PARTY_FIELDS' dist/game.js dist/party.js dist/recruits.js && ls -ld /workspace/dsw-queue /workspace/dungeonsweeper-review.md && git log -3 --oneline" in /workspace/dungeonsweeper
 succeeded in 0ms:
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { game } = require('../scripts/sim/harness.cjs');

function fixture(status = 'dead', reserve = false, level = 5) {
  const g = game(null, () => .5);
  g.run(`var recruit=generateRecruit('蘇生([対象',2);registerRecruit(recruit);
    ${reserve ? '' : 'changeRecruitParty(recruit.members.id,true);'}
    var id=recruit.members.id,r=trainingRoster()[0];
    r.members.status='${status}';r.members.level=${level};
    if(s.members.length){s.hp[0]=0;s.mp[0]=2}else{r.hp=0;r.mp=2}
    s.gold=10000;render();`);
  return g;
}
function reload(g) { return game(g.run("localStorage.getItem('ash-v1')")); }

for (const reserve of [false, true]) {
  for (const [status, roll, expected, cost] of [
    ['dead', 0, 'ok', 500], ['dead', .999, 'ash', 500],
    ['ash', 0, 'ok', 1250], ['ash', .999, 'lost', 1250],
  ]) {
    const g = fixture(status, reserve);
    const before = JSON.parse(g.run('JSON.stringify(trainingRoster()[0])'));
    g.run(`Math.random=()=>${roll};var result=templeRaise(id)`);
    assert.equal(g.run('result.status'), expected);
    assert.equal(g.run('result.success'), expected === 'ok');
    assert.equal(g.run('result.cost'), cost);
    assert.equal(g.run('result.id===id'), true);
    assert.equal(g.run('s.gold'), 10000 - cost);
    const after = JSON.parse(g.run('JSON.stringify(trainingRoster()[0])'));
    before.members.status = expected; before.hp = expected === 'ok' ? 1 : 0;
    assert.deepEqual(after, before, 'only status and HP change; MP, XP, equipment and identity stay intact');
    const restored = reload(g);
    assert.equal(restored.run('s.gold'), 10000 - cost);
    assert.equal(restored.run('s.members.length'), reserve ? 0 : 1);
    assert.deepEqual(JSON.parse(restored.run('JSON.stringify(trainingRoster()[0])')), after);
    assert.match(g.run("$('#templenotice').textContent"), expected === 'ok' ? /蘇生した/ : expected === 'ash' ? /灰になった/ : /ロストした/);
    if (expected === 'ok') {
      if (reserve) restored.run('changeRecruitParty(s.reserve[0].members.id,true)');
      restored.run('enterDungeon()'); restored.drain();
      assert.equal(restored.run('s.area'), 'dungeon');
      assert.equal(restored.run('s.hp[0]'), 1);
    }
  }
}
console.log('PASS temple: all four outcomes for party/reserve, fees, HP1, MP/XP preservation, save/reload and dungeon reentry');

for (const [status, level, cost, chance] of [
  ['dead', 1, 100, 53], ['dead', 5, 500, 65], ['dead', 15, 1500, 95], ['dead', 30, 3000, 95],
  ['ash', 1, 250, 43], ['ash', 5, 1250, 55], ['ash', 17, 4250, 90], ['ash', 30, 7500, 90],
]) {
  const g = fixture(status, false, level);
  assert.equal(g.run('templeCost(s.members[0])'), cost);
  assert.equal(g.run('templeChance(s.members[0])'), chance);
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
dist/recruits.js:21:function rosterSaveState() {
dist/recruits.js:25: for(const key of PARTY_FIELDS)delete snapshot[key];
dist/recruits.js:34: for(const key of PARTY_FIELDS)state[key]=ids.map(id=>records.get(id)[key]);
dist/party.js:6:const PARTY_FIELDS=['members','hp','mp','inventory','equipped','armor','ailments'];
dist/party.js:14: let order=[0,3,4,2,1,5];for(let key of PARTY_FIELDS)s[key]=order.map(i=>s[key][i]);s.partyVersion=1;resetPartyCommands();refreshNames();
dist/party.js:17:function reorderParty(order){if(s.area!=='town'||!idle()||order.length!==s.members.length||new Set(order).size!==order.length||order.some(i=>!Number.isInteger(i)||i<0||i>=s.members.length))return false;for(let key of PARTY_FIELDS)s[key]=order.map(i=>s[key][i]);displayVitals=null;resetPartyCommands();refreshNames();render();return true}
dist/party.js:19:function partyRecords(){return s.members.map((m,i)=>Object.fromEntries(PARTY_FIELDS.map(key=>[key,s[key][i]])))}
dist/party.js:20:function setPartyFromRoster(roster,order){let active=order.filter(i=>i>=0);if(s.area!=='town'||!idle()||active.length>6||new Set(active).size!==active.length||active.some(i=>!Number.isInteger(i)||!roster[i]))return false;for(let key of PARTY_FIELDS)s[key]=active.map(i=>roster[i][key]);s.reserve=roster.filter((r,i)=>!active.includes(i));displayVitals=null;resetPartyCommands();refreshNames();render();return true}
dist/party.js:31:function applyPartyOrder(order){if(!idle()||s.done||order.length!==s.members.length||new Set(order).size!==order.length||order.some(i=>!Number.isInteger(i)||i<0||i>=s.members.length))return false;for(let key of PARTY_FIELDS)s[key]=order.map(i=>s[key][i]);displayVitals=null;resetPartyCommands();refreshNames();render();renderStats();return true}
dist/game.js:1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,corpses:s.corpses,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',corpses:[],cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
dist/game.js:15:function log(t,options={}){if(displayCombat===undefined)displayCombat=structuredClone(s.enemy);if(!displayVitals)displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};logQueue.push({enemy:structuredClone(s.enemy),text:t,encounter:!!options.encounter,trap:!!options.trap,hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)});if(logTimer===null)logTimer=setTimeout(pumpLog,0)}function pumpLog(){encounterNotice='';if(!logQueue.length){logTimer=null;displayVitals=null;displayCombat=undefined;if(s.defeatPending){finishDefeat();return}render();return}let entry=logQueue.shift();if(entry.encounter)encounterNotice=entry.text;if(entry.trap)encounterNotice='！';displayCombat=entry.enemy;displayVitals={hp:entry.hp,mp:entry.mp,ailments:entry.ailments,members:entry.members};s.logs.unshift(entry.text);s.logs=s.logs.slice(0,30);logTimer=setTimeout(pumpLog,entry.encounter||entry.trap?500:300);render();$('#log').scrollTop=0}
dist/game.js:63: for(const key of PARTY_FIELDS)s[key]=[];
drwxr-xr-x 6 box box  4096 Nov  2 00:10 /workspace/dsw-queue
-rw-r--r-- 1 box box 23042 Nov  1 22:31 /workspace/dungeonsweeper-review.md
9b17e17 030a: シミュレータが全滅時の死者数を finishDefeat 前に記録するよう修正（selftest 復旧）
62fac1d 030: 全滅時に遺体（記録・所持金）を迷宮に残し、パーティを空にして町へ。訓練所に遺体表示
08c7b6e 023a: 宿屋のレベルアップを正常メンバーに限定（死亡/灰はXP保持で据え置き）、費用文言を式に合わせる

codex
030の遺体データは、装備・経験値・所持金を保持しています。この形式を維持し、遺体マスの罠だけを移します。移動先から開始地点周辺と守護者への安全経路を除外し、回収後は既存の寺院で蘇生できることも検証します。

exec
/bin/bash -lc "rg -n '遺体|救出' /workspace/dungeonsweeper-review.md && rg --files -g '*report*' -g '*031*' && python3 -c \"import importlib.util; print('playwright:', bool(importlib.util.find_spec('playwright')))\" && command -v chromium" in /workspace/dungeonsweeper
 exited 1 in 0ms:
163:- 原作：死亡→寺院で寄付して蘇生（失敗で灰）、灰→蘇生（失敗でロスト＝抹消）。全滅すると死体は迷宮に残り救出隊が必要。
165:- 全滅時：パーティは迷宮に「遺体」として残る（その階のマスに記録）。他の登録冒険者で救出に行くと回収できる。救出しない限り所持金貨は失われる、等。
166:- マインスイーパー統合：**遺体のマスは地図上で旗のようにマークされ、救出隊はそこまで罠を避けて到達する必要**がある。全滅時に旗配置も残すと再挑戦がマインスイーパーの「続き」になる。
202:- 原作は呪文レベル1〜7ごとの回数制。現状のMP制は本作独自として明記済み。移行は大工事なので、まず**蘇生呪文（ディ・カドルト）**、**マピロ・マハマ／ラツマピック（敵の識別）**、**カンディ（遺体の位置）**、**ロクトフェイト（町へ帰還、装備喪失）**、**マポーフィック（AC−2の持続）**、**マカニト・マダルト・ラハリト・モンティノ（沈黙）・バディ（即死）** を追加候補とする。
203:- 統合：カンディ＝遺体マスを地図に表示、ロクトフェイト＝盤面ごと放棄、**デュマピックを「周囲8マスの罠数を1つ確定表示」に強化**するなど、呪文を盤面情報操作として設計。
221:**C18. 町の掲示（ギルガメッシュの酒場）での遺体回収・メンバー交代**：C1と連動。

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('dist/game.js')
s=p.read_text()
old='ensureProfile();render()}\\n'
assert s.count(old)==1
s=s.replace(old,'ensureProfile();placeCorpses(safe);render()}\\n',1)
helper=\"\"\"// Keep corpse locations across regenerated floors; protect the generated safe route.
function placeCorpses(safe){
 const corpses=s.corpses.filter(c=>c.floor===s.floor);
 const distance=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0));
 for(const corpse of corpses){
  if(corpse.cell===s.start||corpse.cell===s.boss){
   const normal=s.cells.map((c,i)=>c.type===''?i:-1).filter(i=>i>=0);
   corpse.cell=normal.reduce((best,i)=>distance(i,corpse.cell)<distance(best,corpse.cell)?i:best);
  }
 }
 const occupied=new Set(corpses.map(c=>c.cell));let displaced=0;
 for(const i of occupied){if(s.cells[i].trap)displaced++;s.cells[i].trap=false;s.cells[i].type=''}
 const pool=s.cells.flatMap((c,i)=>"'!c.trap&&c.type==='"''&&"'!safe.has(i)&&!occupied.has(i)?[i]:[]);
 for(let n=0;n<displaced&&pool.length;n++)s.cells[pool.splice(Math.random()*pool.length|0,1)[0]].trap=true;
}
function recoverCorpses(i){
 const corpses=s.corpses.filter(c=>c.floor===s.floor&&c.cell===i);
 if(!corpses.length)return;
 for(const corpse of corpses){s.reserve.push(...corpse.records);s.gold+=corpse.gold}
 s.corpses=s.corpses.filter(c=>!corpses.includes(c));
 log('"'遺体を回収した。');
}
\"\"\"
s=s.replace('\\n', '\\n'+helper,1)
old=\"if("'!s.done){if(c.type==='"'down')\"
assert s.count(old)==1
s=s.replace(old,\"if("'!s.done){recoverCorpses(i);if(c.type==='"'down')\",1)
old=\""'$('"'#board').innerHTML=s.cells.map\"
assert s.count(old)==1
s=s.replace(old,\"const corpseCells=new Set(s.corpses.filter(c=>c.floor===s.floor).map(c=>c.cell));"'$('"'#board').innerHTML=s.cells.map\",1)
old=\""'${s.pos===i?'"'現在地 ':''}"'${c.open?"
assert s.count(old)==1
s=s.replace(old,"${s.pos===i?'"'現在地 ':''}"'${corpseCells.has(i)?'"'遺体 ':''}"'${c.open?",1)
old='"'"'${s.pos===i?num(i):c.open?'"'
assert s.count(old)==1
s=s.replace(old,\""'${corpseCells.has(i)?'"'🦴':s.pos===i?num(i):c.open?\",1)
p.write_text(s)
PY
python3 -c \"import importlib.util; print('playwright:', bool(importlib.util.find_spec('playwright')))\"
command -v chromium" in /workspace/dungeonsweeper
 exited 1 in 0ms:
playwright: False

exec
/bin/bash -lc "cat >> tests/training.cjs <<'EOF'

// 031: regenerate each floor from the same seed with corpses on stairs, boss and traps.
g=game();
g.run("'`
 var rescueSeed=1;
 Math.random=()=>{rescueSeed=(Math.imul(rescueSeed,1664525)+1013904223)>>>0;return rescueSeed/4294967296};
 for(let floor=1;floor<=3;floor++)for(let n=1;n<=1000;n++){
  const seed=floor*10000+n;
  s.corpses=[];rescueSeed=seed;fresh(floor);
  const start=s.start,boss=s.boss,traps=s.cells.flatMap((c,i)=>c.trap?[i]:[]);
  const locations=[start,boss,traps[0],traps[1],traps[0]];
  s.corpses=locations.map((cell,i)=>({id:'"'corpse-'+i,floor,cell,records:[],gold:i}));
  s.corpses.push({id:'other-floor',floor:floor+1,cell:start,records:[],gold:99});
  rescueSeed=seed;fresh(floor);
  if(s.start"'!==start||s.boss!==boss)throw Error('"'generation seed changed');
  if(s.cells.filter(c=>c.trap).length"'!==traps.length)throw Error('"'corpse relocation changed trap count');
  if(s.cells[start].type"'!=='"'stairs'||s.cells[boss].type"'!=='"'boss')throw Error('special cell overwritten');
  for(const [i,corpse] of s.corpses.slice(0,5).entries()){
   if(corpse.cell===start||corpse.cell===boss||s.cells[corpse.cell].trap||s.cells[corpse.cell].type"'!=='"'')throw Error('unsafe corpse');
   if(i<2){
    const from=locations[i],to=corpse.cell;
    if(Math.abs(from%size()-to%size())+Math.abs((from/size()|0)-(to/size()|0))"'!==1)throw Error('"'not nearest normal cell');
   }else if(corpse.cell"'!==locations[i])throw Error('"'ordinary corpse moved');
  }
  if(s.corpses[5].cell"'!==start)throw Error('"'other floor corpse moved');
  if([start,...around(start)].some(i=>s.cells[i].trap))throw Error('unsafe entrance');
  const reached=new Set([start]),pending=[start];
  while(pending.length){const p=pending.shift();for(let i=0;i<s.cells.length;i++)if(adjacent(p,i)&&"'!s.cells[i].trap&&!reached.has(i)){reached.add(i);pending.push(i)}}
  if(!reached.has(boss))throw Error('"'guardian safe route broken');
  if(JSON.stringify(JSON.parse(localStorage.getItem('ash-v1')).corpses)"'!==JSON.stringify(s.corpses))throw Error('"'relocation not saved');
 }
"'`);
console.log('"'PASS rescue generation: 1000 maps per floor (1–3F), nearest relocation, trap counts, safe entrance/route, other floors and persistence');

// Wipe -> reserve rescue party -> visible bones -> recover -> reload -> temple.
g=corpseParty(2);
g.run("'`s.gold=321;s.inventory[0].push('"'helm','healingPotion');s.armor[0].head=1;
 s.members[0].xp=42;s.mp[1]=2;hurt(999);"'`);g.drain();
const rescuedRecords=g.run('"'JSON.stringify(s.corpses[0].records)');
const rescuedIds=g.run('s.corpses[0].records.map(r=>r.members.id).join()');
g.run('changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();');g.drain();
assert.equal(g.run('s.members.length'),1);
assert.equal(g.run('s.reserve.length'),0);
g.run('var rescueCell=s.corpses[0].cell;');
assert.equal(g.run('s.cells[rescueCell].open'),false);
function corpseMarkup(g){return g.run(\""'$('"'#board').innerHTML.match(new RegExp('<button["'^>]*data-i='"\\\"'+rescueCell+'\\\"["'^>]*>['"\\\\s\\\\S]*?</button>'))[0]\");}
assert.match(corpseMarkup(g),/🦴/);
assert.match(corpseMarkup(g),/遺体/);
g.run('s.cells[rescueCell].flag=\"power\";render()');assert.match(corpseMarkup(g),/🦴/);
g.run('mode=\"move\";cell(rescueCell)');g.drain();
assert.equal(g.run('s.corpses.length'),1,'a flagged corpse cell must still block movement');
g.run('s.cells[rescueCell].flag=false;save()');
g=game(g.saved());
g.run('var rescueCell=s.corpses[0].cell;Math.random=()=>.99;');
assert.match(corpseMarkup(g),/🦴/);
assert.equal(g.run('adjacent(s.pos,rescueCell)'),true);
g.run('cell(rescueCell);');g.drain();
assert.equal(g.run('s.corpses.length'),0);
assert.equal(g.run('s.gold'),321);
assert.equal(g.run('s.members.length'),1);
assert.equal(g.run('JSON.stringify(s.reserve)'),rescuedRecords,'recover every field without reviving or altering equipment');
assert.equal(g.run(\"s.reserve.every(r=>r.hp===0&&r.members.status==='dead')\"),true);
assert.equal(g.run(\"s.logs.filter(t=>t==='遺体を回収した。').length\"),1);
assert.doesNotMatch(corpseMarkup(g),/🦴/);
g.run('cell(s.start)');g.drain();g.run('answerStairs(false)');g.drain();g.run('cell(rescueCell)');g.drain();
assert.equal(g.run('s.gold'),321,'revisiting must not duplicate rewards');
assert.equal(g.run('s.reserve.length'),2);
g=game(g.saved());
assert.equal(g.run('s.corpses.length'),0);
assert.equal(g.run('s.reserve.map(r=>r.members.id).join()'),rescuedIds);
assert.equal(g.run('s.gold'),321);
g.run('enterTown();Math.random=()=>0;var rescuedId=s.reserve[0].members.id;var raised=templeRaise(rescuedId);');
assert.equal(g.run('raised.success'),true);
assert.equal(g.run('s.reserve[0].members.status'),'ok');
assert.equal(g.run('s.reserve[0].hp'),1);
assert.equal(g.run('s.gold'),221);
assert.equal(g.run('changeRecruitParty(rescuedId,true)'),true);
console.log('PASS rescue: real wipe, replacement party, hidden/flagged/reloaded bone icon, full dead records/gold recovered once, temple and rejoining');

// Several wipes may share a cell; collect all before rolling the normal encounter.
g=corpseParty(1);
g.run('s.gold=123;hurt(999)');g.drain();
g.run("'`changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();`);g.drain();
g.run(`var rescueCell=s.corpses[0].cell;
 var extra=generateRecruit('"'追加遺体',2);extra.members.status='dead';extra.hp=0;
 s.corpses.push({id:'same-cell',floor:1,cell:rescueCell,records:[extra],gold:45},
  {id:'other-cell',floor:1,cell:s.boss,records:[],gold:99},
  {id:'other-floor',floor:2,cell:rescueCell,records:[],gold:88});
 var realEncounter=encounter, encounterSawRecovery=false;
 encounter=(...args)=>{encounterSawRecovery=s.reserve.length===2&&s.gold===168&&s.corpses.length===2;return realEncounter(...args)};
 Math.random=()=>0;cell(rescueCell);"'`);
assert.equal(g.run('"'encounterSawRecovery'),true);
assert.equal(g.run('s.corpses.map(c=>c.id).join()'),'other-cell,other-floor');
assert.equal(g.run(\"logQueue.findIndex(e=>e.text==='遺体を回収した。')<logQueue.findIndex(e=>e.encounter)\"),true);
assert.equal(g.run(\"logQueue.find(e=>e.text==='遺体を回収した。').enemy\"),null);
g.drain();
assert.equal(g.run('s.reserve.length'),2);
assert.equal(g.run('s.gold'),168);
console.log('PASS rescue: overlapping corpses collected together, other cells/floors retained, normal encounter and snapshot order preserved');
EOF
node tests/training.cjs > /tmp/dsw-training-031.log 2>&1" in /workspace/dungeonsweeper
codex
遺体の配置・骨アイコン・回収処理を追加しました。1〜3Fを各1,000回生成する検証と、全滅から回収・寺院での蘇生までの回帰テストを実行中です。同じマスに複数の遺体がある場合と、回収直後に敵と遭遇する場合も確認します。

exec
/bin/bash -lc 'tail -20 /tmp/dsw-training-031.log && git diff --stat && git diff --check && ls /usr/bin/*chrom* /opt/*/chrome 2>/dev/null' in /workspace/dungeonsweeper
 succeeded in 0ms:
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
 dist/game.js       | 28 +++++++++++++--
 tests/training.cjs | 99 ++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 124 insertions(+), 3 deletions(-)
/opt/ungoogled-chromium/chrome
/usr/bin/google-chrome
/usr/bin/google-chrome-stable

/opt/google/chrome:
CHROME_VERSION_EXTRA
MEIPreload
WidevineCdm
apparmor.d
chrome
chrome-management-service
chrome-sandbox
chrome_100_percent.pak
chrome_200_percent.pak
chrome_crashpad_handler
cron
default-app-block
google-chrome
icudtl.dat
libLiteRtWebGpuAccelerator.so
liboptimization_guide_internal.so
libqt5_shim.so
libqt6_shim.so
libvk_swiftshader.so
libvulkan.so.1
locales
product_logo_128.png
product_logo_16.png
product_logo_24.png
product_logo_256.png
product_logo_32.png
product_logo_48.png
product_logo_64.png
resources.pak
v8_context_snapshot.bin
vk_swiftshader_icd.json

 exited 1 in 6072ms:
exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('tests/training.cjs')
s=p.read_text()
old='[\\\\\\\\s\\\\\\\\S]*?</button>'
new='[\\\\\\\\\\\\\\\\s\\\\\\\\\\\\\\\\S]*?</button>'
assert s.count(old)==1
p.write_text(s.replace(old,new))
PY
rg --files /opt /tmp /usr/local/lib /usr/lib -g '*playwright*' -g '*puppeteer*' -g 'websocket*' 2>/dev/null | head -25" in /workspace/dungeonsweeper
 succeeded in 127ms:
/usr/local/lib/node_modules/npm/node_modules/undici/lib/web/websocket/websocket.js
/usr/local/lib/node_modules/pptxgenjs/node_modules/undici-types/websocket.d.ts
/usr/local/lib/node_modules/docx/node_modules/undici-types/websocket.d.ts
/usr/lib/python3/dist-packages/websockify/__pycache__/websocketproxy.cpython-313.pyc
/usr/lib/python3/dist-packages/websockify/__pycache__/websocket.cpython-313.pyc
/usr/lib/python3/dist-packages/websockify/__pycache__/websocketserver.cpython-313.pyc
/usr/lib/python3/dist-packages/websockify/websocket.py
/usr/lib/python3/dist-packages/websockify/websocketserver.py
/usr/lib/python3/dist-packages/websockify/websocketproxy.py

exec
/bin/bash -lc 'tail -24 /tmp/dsw-training-031.log && node --version && git diff --numstat' in /workspace/dungeonsweeper
 succeeded in 0ms:
PASS deletion including last active member and empty save reload
PASS lost recruits cannot join but can be deleted; dead/ash can join
PASS wipe snapshots, UUID/location/gold, complete corpse records, empty party, reserve isolation, training text and reload during/after logs
PASS corpses persist across dungeon regeneration, multiple wipes and empty-party calls
PASS end-to-end wipes from movement/battle poison, floor traps, chest trap and enemy attack
PASS missing corpses defaults to [] for new and old roster/parallel/three-member saves
PASS rescue generation: 1000 maps per floor (1–3F), nearest relocation, trap counts, safe entrance/route, other floors and persistence
evalmachine.<anonymous>:1
$('#board').innerHTML.match(new RegExp('<button[^>]*data-i="'+rescueCell+'"[^>]*>[\s\S]*?</button>'))[0]
                                                                                                     ^

TypeError: Cannot read properties of null (reading '0')
    at evalmachine.<anonymous>:1:102
    at Script.runInContext (node:vm:149:12)
    at Object.runInContext (node:vm:301:6)
    at Object.run (/workspace/dungeonsweeper/tests/training.cjs:8:23)
    at corpseMarkup (/workspace/dungeonsweeper/tests/training.cjs:214:35)
    at Object.<anonymous> (/workspace/dungeonsweeper/tests/training.cjs:215:14)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)

Node.js v24.22.1
v24.22.1
25	3	dist/game.js
99	0	tests/training.cjs

exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
 succeeded in 9383ms:
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
PASS rescue generation: 1000 maps per floor (1–3F), nearest relocation, trap counts, safe entrance/route, other floors and persistence
PASS rescue: real wipe, replacement party, hidden/flagged/reloaded bone icon, full dead records/gold recovered once, temple and rejoining
PASS rescue: overlapping corpses collected together, other cells/floors retained, normal encounter and snapshot order preserved
88 monster definitions validated

exec
/bin/bash -lc "git diff --check && sed -n '1,29p' dist/game.js && sed -n '208,221p' tests/training.cjs && git status --short" in /workspace/dungeonsweeper
 succeeded in 0ms:
const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,corpses:s.corpses,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',corpses:[],cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();placeCorpses(safe);render()}
// Keep corpse locations across regenerated floors; protect the generated safe route.
function placeCorpses(safe){
 const corpses=s.corpses.filter(c=>c.floor===s.floor);
 const distance=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0));
 for(const corpse of corpses){
  if(corpse.cell===s.start||corpse.cell===s.boss){
   const normal=s.cells.map((c,i)=>c.type===''?i:-1).filter(i=>i>=0);
   corpse.cell=normal.reduce((best,i)=>distance(i,corpse.cell)<distance(best,corpse.cell)?i:best);
  }
 }
 const occupied=new Set(corpses.map(c=>c.cell));let displaced=0;
 for(const i of occupied){if(s.cells[i].trap)displaced++;s.cells[i].trap=false;s.cells[i].type=''}
 const pool=s.cells.flatMap((c,i)=>!c.trap&&c.type===''&&!safe.has(i)&&!occupied.has(i)?[i]:[]);
 for(let n=0;n<displaced&&pool.length;n++)s.cells[pool.splice(Math.random()*pool.length|0,1)[0]].trap=true;
}
function recoverCorpses(i){
 const corpses=s.corpses.filter(c=>c.floor===s.floor&&c.cell===i);
 if(!corpses.length)return;
 for(const corpse of corpses){s.reserve.push(...corpse.records);s.gold+=corpse.gold}
 s.corpses=s.corpses.filter(c=>!corpses.includes(c));
 log('遺体を回収した。');
}
function enemyDefinition(id){return ENEMIES.find(e=>e.id===id)||ENEMIES[0]}
const UNKNOWN_NAMES=Object.fromEntries(ENEMIES.map(e=>[e.id,e.unknown]));
function enemyDisplay(e){return e?.identified?enemyDefinition(e.id).name:(UNKNOWN_NAMES[e?.id]||'正体不明')}
function identifyEnemies(force=false){if(!s.enemy)return;let chance=Math.min(1,Math.max(0,...s.members.map((m,i)=>s.hp[i]>0?(m.intelligence||0)*.03:0)));for(const g of enemyGroups(s.enemy)){if(!g.units.some(e=>e.hp>0)||g.units.some(e=>e.identified))continue;if(force||Math.random()<chance){for(const e of g.units)e.identified=true}}}
function makeEnemy(id,index){let d=enemyDefinition(id);return {id,uid:index,hp:dice(...d.hp).value,rewarded:false}}
function visibleCombat(){return displayCombat===undefined?s.enemy:displayCombat}
const rescuedIds=g.run('s.corpses[0].records.map(r=>r.members.id).join()');
g.run('changeRecruitParty(s.reserve[0].members.id,true);enterDungeon();');g.drain();
assert.equal(g.run('s.members.length'),1);
assert.equal(g.run('s.reserve.length'),0);
g.run('var rescueCell=s.corpses[0].cell;');
assert.equal(g.run('s.cells[rescueCell].open'),false);
function corpseMarkup(g){return g.run("$('#board').innerHTML.match(new RegExp('<button[^>]*data-i=\"'+rescueCell+'\"[^>]*>[\\\\s\\\\S]*?</button>'))[0]");}
assert.match(corpseMarkup(g),/🦴/);
assert.match(corpseMarkup(g),/遺体/);
g.run('s.cells[rescueCell].flag="power";render()');assert.match(corpseMarkup(g),/🦴/);
g.run('mode="move";cell(rescueCell)');g.drain();
assert.equal(g.run('s.corpses.length'),1,'a flagged corpse cell must still block movement');
g.run('s.cells[rescueCell].flag=false;save()');
g=game(g.saved());
 M dist/game.js
 M tests/training.cjs

codex
共通テストはすべてPASSしました。計3,000回の生成で罠数と安全経路の維持を確認し、回収・再読込・寺院での蘇生も通っています。

ブラウザ確認は環境のソケット制限で実行できませんでした。また、外部キューは書込み許可範囲外のため、`done/`への移動は未実施とし、作業フォルダ内の`report/`に結果を残します。

apply patch
patch: completed
/workspace/dungeonsweeper/report/031-heavy-corpse-rescue.md
diff --git a/report/031-heavy-corpse-rescue.md b/report/031-heavy-corpse-rescue.md
new file mode 100644
index 0000000000000000000000000000000000000000..0466a5c758be3b1b98ee0a36a88637174601212d
--- /dev/null
+++ b/report/031-heavy-corpse-rescue.md
@@ -0,0 +1,29 @@
+# 031 遺体回収 実装報告
+
+実装・自動検証：完了。
+
+## 変更ファイル
+
+- `dist/game.js`：迷宮生成後、その階の遺体マスを通常マス・罠なしにする。開始位置・守護者位置と重なる遺体はマンハッタン距離で最寄りの通常マスへ移し、既存の保存処理で保存する。除去した罠は遺体・開始地点周辺・守護者への生成経路を避けて再配置する。
+- `dist/game.js`：未探索・旗付きでも地図に骨アイコンを表示する。到達時、通常の遭遇判定より前に同じマスの遺体をすべて回収し、記録を死亡状態のまま控えへ戻し、所持金を加算して遺体を削除する。「遺体を回収した。」は既存のスナップショット式ログを使用する。
+- `tests/training.cjs`：生成・回収・保存・寺院までの回帰テストを追加。
+
+寺院・戦闘・030の遺体データ形式・セーブキー `ash-v1` は変更していない。
+
+## 検証
+
+以下を連続実行し、終了コード0・全PASS。
+
+```sh
+node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check
+```
+
+- 1〜3Fを各1,000回生成。開始・守護者との重なり解消、最寄り移動、遺体マスの罠除去、罠数維持、開始地点周辺と守護者への安全経路、他階への非干渉、保存を確認。
+- 全滅→控えの救出隊加入→骨アイコン→移動回収→再訪・再読込→帰還→寺院で蘇生→再加入を確認。HP0・死亡状態、装備・経験値・MP・IDの保持と金貨復帰、二重回収防止を確認。
+- 同じマスの複数遺体の同時回収、他マス・他階の遺体保持、回収直後の通常遭遇とログ順序を確認。
+- モンスターデータ88種の整合性検証PASS。戦闘シミュレーションは実行していない。
+
+## 未完了
+
+- ブラウザ確認：ローカルHTTPサーバーはソケット生成時の `Operation not permitted`、Chromeはソケット設定時の同エラーで起動できず、画面の目視・手動操作は未検証。DOM出力の骨アイコンは自動テストで確認済み。
+- 外部キューの完了移動：`/workspace/dsw-queue/` はこのセッションの書込み許可範囲外のため、`todo/031-heavy-corpse-rescue.md` の `done/` への移動と外部 `report/` への報告書配置は未実施。本書を作業フォルダ内に保存した。

exec
/bin/bash -lc 'git diff --check && git status --short' in /workspace/dungeonsweeper
 succeeded in 0ms:
 M dist/game.js
 M tests/training.cjs
?? report/

codex
031の実装・自動検証は完了しました。

- 変更：`dist/game.js`、`tests/training.cjs`
- 遺体マスの安全化、骨アイコン、死亡状態のままの回収・金貨復帰を実装。
- 共通テスト全PASS。1〜3F各1,000回生成と寺院での蘇生まで確認。

未完了：ブラウザ確認（環境制限）、外部キューのdone移動（書込み範囲外）。

[作業報告](/workspace/dungeonsweeper/report/031-heavy-corpse-rescue.md)
tokens used
57,361
031の実装・自動検証は完了しました。

- 変更：`dist/game.js`、`tests/training.cjs`
- 遺体マスの安全化、骨アイコン、死亡状態のままの回収・金貨復帰を実装。
- 共通テスト全PASS。1〜3F各1,000回生成と寺院での蘇生まで確認。

未完了：ブラウザ確認（環境制限）、外部キューのdone移動（書込み範囲外）。

[作業報告](/workspace/dungeonsweeper/report/031-heavy-corpse-rescue.md)
