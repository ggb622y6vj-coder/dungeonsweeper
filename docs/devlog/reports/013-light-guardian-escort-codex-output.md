OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-luna
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: low
reasoning summaries: none
session id: 01a19838-1cd5-7bc0-89d7-530c823063e0
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
# 013-light-guardian-escort
ティア：LIGHT　依存：012

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
守護者が単独で通常戦より弱い（Lv1でも勝率99%）ため、随伴の敵を付ける。

## 変更内容
- dist/monsters.js `monsterFormation(boss)`：boss時は [守護者ID, 同階の非守護者からランダム1種] に、50%でさらに1種追加（最大3列、守護者は1列目）。
- 下り階段化の条件（finishMonsterBattle の defeated.some(boss)）と逃走不可は従来通り。BALANCE.md の守護者記述を現仕様に合わせる。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：守護者戦が2〜3列で1列目が守護者。随伴だけ倒しても戦闘継続。全滅で下り階段化。
- sim：`--boss` で Lv1/1F〜3F の勝率を報告。
- 手動：守護者戦で複数列表示されること。

codex
指示書に沿って、まず必読ドキュメントとキュー内の013ファイルを確認し、現在の守護者編成・戦闘終了条件・シミュレータの状態を調べてから変更します。
exec
/bin/bash -lc "pwd && rg --files -g 'AGENTS.md' -g 'README*' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g '*013*' -g '*sim*' -g 'BALANCE.md' -g 'game.cjs' -g 'training.cjs'" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
AGENTS.md
BALANCE.md
docs/HANDOFF.md
docs/SPECIFICATION.md
data/README.md
README.md
tests/training.cjs
tests/game.cjs

exec
/bin/bash -lc "cat AGENTS.md && cat README.md && cat docs/HANDOFF.md && cat docs/SPECIFICATION.md && sed -n '1,240p' BALANCE.md" in /workspace/dungeonsweeper
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
# 迷宮スイーパー 調整データ

実装の正本は `dist/balance.js`（職業・魔法・敵・編成・経験値）と `dist/weapons.js`（武器）。ダイス配列は `[個数, 面数, 固定加算]`。テストは `node tests/game.cjs`。

## 初期ステータスと成長

|職業|HP|MP|攻撃力|AC|毎レベルHP増加|MP増加|攻撃力増加|
|---|---:|---:|---:|---:|---|---|---|
|戦士|32|0|3|6|1d6+3|0|毎レベル+1|
|魔法使い|24|20|0|9|1d4+2|1d2|偶数レベルで+1|
|僧侶|26|15|1|7|1d5+2|1d2|偶数レベルで+1|
|盗賊|25|0|1|8|1d5+2|0|偶数レベルで+1|

全員Lv.1・経験値0で開始。レベルL→L+1の必要経験値は `round(115×L×職業係数×乱数0.9〜1.1)`（最大30）。職業係数は戦士0.8／盗賊0.85／僧侶1.0／魔法使い1.2。メンバー・レベルごとに一度抽選して累計閾値を保存。表示・再読込では再抽選しない。町への帰還時にまとめて成長しHP・MP全回復。ACは成長しない。職業基礎ACから装備防具のAC合計を減算する。戦士のMPは増加しない。既存のレベル・経験値・HP・MPは維持し、成長率は次回以降に適用。既存セーブの達成済み閾値は維持し、将来レベルの必要経験値の増分を15%増加。一度だけ移行し乱数は引き直さない。

物理命中：1d20＋命中補正＋相手AC≧20。出目1は失敗、20は成功。味方命中補正は職業基礎（戦士4／魔法使い1／僧侶2）＋レベル。ACは軽減値ではない。このゲーム用の簡略式。
通常攻撃は本人の攻撃力＋武器ダイス。防御は被ダメージを半分に切り上げ。
呪文は dist/spells.js の MAGIC が正本（23種類）。一覧は SPELLS.md を参照。回復は対象を選ぶ単体回復。迷宮で蘇生はしない。

## 敵一覧

|ID|名前|HP|攻撃|AC|命中補正|経験値|金貨|
|---|---|---|---|---:|---:|---:|---|
|slime|洞窟スライム|1d6+3|1d4|9|1|6|1d4+2|
|skeleton|骸骨の衛兵|2d6+4|1d6+1|7|3|12|2d4+2|
|wolf|灰狼|2d5+3|1d6+2|6|4|14|2d5+2|
|goblin|迷宮ゴブリン|2d6+5|1d8|5|4|17.5|2d6+2|
|guardian|迷宮の守護者|4d8+14|2d6+2|3|6|75|4d10+20|

HPは出現時に決定、戦闘中の残りHPは非表示。撃破ごとにその時点の生存者全員へ表の経験値を付与（分配なし）。金貨は撃破時に決定。金貨は表のダイス結果÷3を切り捨て。各撃破に5%で武器ドロップ。
通常編成は `FORMATIONS` の10パターンから等確率で選択。最大3列で、各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。守護者には衛兵2〜3体が随伴。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。

## セーブ互換・表示

旧セーブの所持品・金貨・探索状態は維持。旧呪文回数×4、旧回復回数×3をMPに変換（最大MPまで、町なら全回復）。旧戦闘は1体の敵として移行。
幅700px以下は地図を通常レイアウトから外し、右下の固定ボタンからモーダル表示。閉じると探索画面に戻る。

防具は dist/weapons.js の ARMOR に定義。頭・胴体・足各1個、所持品10枠を共有。地下2階は10×10、3階以降12×12。深層の敵は種別名を変更し、階ごとにHPダイス1個・固定HP4・攻撃2・命中1を加算、ACを1減算。未探索16%、探索済みは10%＋周囲の残存罠の数字×0.5ポイント（最大14%）。左右横移動は未探索・探索済みとも1ポイント加算。

宝箱は戦闘後その場で開封または放棄。未決定中は移動不可。旧探索回数による安全開封を廃止。盗賊の調査開封は85%で安全に報酬獲得、15%で罠を発動して宝箱消滅・報酬なし。罠なしの箱の失敗は被害なしで消滅。直接開封は罠判定あり。放棄すると報酬なしで消滅。金貨は元報酬の3倍、装備品入手25%。

敵経験値は全階層で旧値の厳密な半分。ゴブリンの17.5は端数を保持して加算する。

町への帰還で全階層の探索記録を破棄。1階は再生成し全マス未探索、次回入場時に現在地だけ開く。2階以降も初回到達時に再生成する。迷宮内の階段往復では探索状態を保存。各階の下り階段は守護者マスと同一で、一団を全滅させて初めて開く。キャラクター・経験値・所持品・金貨は維持。


旗はマスごとにpower/guard/magicを保存、旧booleanは選択中の種類へ移行。正旗は種類別に `min(50%, 0.5% × 本数²)`。0本は発動なし、1本0.5%、2本2%、5本12.5%、10本以上50%。誤旗があると全ボーナス停止、誤旗の各種類のデバフを適用し逃走不可。遭遇時は誤旗のみ「誤った旗がパーティーを惑わせた！」。正旗は発動時に「怪力／堅牢／呪禁の旗がはためいた！」と表示し、旗名をオレンジ／緑／紫に着色。呪禁は消費MP半減・切上げ、探索中は現在階の旗で都度抽選（探索中の誤旗ではボーナス停止のみ）。地図と視界に旗色を表示。

床罠は dist/traps.js。単体3d6+4（25%）、全体2d6+3（25%）、全員毒（20%）、単体麻痺（15%）、同一階転移（15%）。転移は通常の安全な部屋のみ、旗・罠・宝箱・階段・守護者を除外し、連鎖移動や遭遇は起こさない。罠は一度で消え周囲の数値も減る。
戦闘UIは dist/combatui.js。生存かつ行動可能なメンバー順で入力→最終確認→1ターン実行。戻るで順に修正可能。状態カードはPC・スマホとも3列、前衛と後衛の2段。最大6人。

## 酒場・隊列（dist/party.js）

初期登録は戦士3人・僧侶1人・魔法使い1人・盗賊1人。酒場では並べ替え・待機・再加入が可能（1〜6人）。空きを除いて先頭3人が前衛、残りが後衛。近距離武器での攻撃は前衛のみ。遠距離武器は後衛でも使用可能。敵の通常攻撃は前衛の生存者を優先し、前衛全滅後に後衛を狙う。呪文と薬は隊列によらず使用可能。職業・成長・装備・呪文習得は配列位置ではなくメンバーのjobに紐づく。旧3人のレベル・経験値・装備を維持し、Lv1戦士2人・盗賊1人を一度だけ追加する。

デュマピックは魔法使いLv1で確定習得。消費MPは2→4→8→16…、使用回数は階移動・再読み込みで維持し町への帰還でリセット。未探索の正面を85%で正しく、15%で逆に判定。調査は探索・罠解除・旗変更をしない。探索済み・外壁では失敗し、MPと使用回数は消費する。呪禁の旗は通常通り半減判定する。

## 遭遇と先制（dist/game.js）

通常遭遇では敵の奇襲10%、味方の先制10%、通常80%。後退時は敵の奇襲12%、味方10%、通常78%。守護者戦は通常開始。敵の奇襲では防御や呪文を選ぶ前に敵だけが1回行動、味方先制では最初のコマンド実行後の敵行動のみ省略し、次から通常戦闘。いずれも経験値・金貨・宝箱は通常通り。警戒結界は敵の奇襲分を通常開始に置き換え、味方の先制率を変えない。

遭遇ログは「敵が現れた！」「敵の奇襲！」「敵はまだ気づいていない！」のいずれか。同じログの表示タイミングで視界上に500ms表示、その後のログは従来の300ms間隔。HPもログのスナップショットに同期。警戒結界は僧侶Lv3確定習得・MP4、探索専用。階移動やセーブをまたいで町への帰還まで有効。既存のLv3以上の僧侶にも追加する。

exec
/bin/bash -lc 'cat /workspace/dsw-queue/README-handoff.md 2>/dev/null; cat /workspace/dsw-queue/todo/013-light-guardian-escort.md 2>/dev/null; rg -n "monsterFormation|finishMonsterBattle|boss|FORMATIONS" dist tests scripts/sim; rg --files scripts/sim' in /workspace/dungeonsweeper
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
# 013-light-guardian-escort
ティア：LIGHT　依存：012

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
守護者が単独で通常戦より弱い（Lv1でも勝率99%）ため、随伴の敵を付ける。

## 変更内容
- dist/monsters.js `monsterFormation(boss)`：boss時は [守護者ID, 同階の非守護者からランダム1種] に、50%でさらに1種追加（最大3列、守護者は1列目）。
- 下り階段化の条件（finishMonsterBattle の defeated.some(boss)）と逃走不可は従来通り。BALANCE.md の守護者記述を現仕様に合わせる。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：守護者戦が2〜3列で1列目が守護者。随伴だけ倒しても戦闘継続。全滅で下り階段化。
- sim：`--boss` で Lv1/1F〜3F の勝率を報告。
- 手動：守護者戦で複数列表示されること。
scripts/sim/combat.cjs:8:    if (!['--jobs', '--level', '--floor', '--n', '--boss'].includes(key)) throw Error(`不明な引数: ${key}`);
scripts/sim/combat.cjs:10:    if (key === '--boss') { out.boss = true; continue; }
scripts/sim/combat.cjs:20:  return { jobs, level, floor, n, boss: !!out.boss };
scripts/sim/combat.cjs:46:    var simBattleFinished = false, simFinishMonsterBattle = finishMonsterBattle;
scripts/sim/combat.cjs:47:    finishMonsterBattle = function() { simBattleFinished = true; return simFinishMonsterBattle(); };`);
scripts/sim/combat.cjs:64:    s.cells[s.pos].type = ${opt.boss ? "'boss'" : "'stairs'"};
scripts/sim/combat.cjs:89:        if (!s.enemy.boss && (targetGroup?.units.filter(e => e.hp > 0).length || 0) >= 2) spellOrder.push('katino');
scripts/sim/selftest.cjs:6:for (const argv of [[], ['--jobs',''], ['--jobs','0,'], ['--wat','1'], ['--boss','--boss'],
scripts/sim/selftest.cjs:30:g.run(`enemyTurn=()=>{s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=true});finishMonsterBattle()}`);
scripts/sim/selftest.cjs:36:  prepareTrial(g, {...opt, level:6, floor:1, boss:true});
scripts/sim/selftest.cjs:63:g.run('s.enemy.boss=true');
scripts/sim/selftest.cjs:65:assert.equal(g.run('s.magicPlans[4].id'), 'halito', 'boss encounters must not use katino');
scripts/sim/selftest.cjs:66:g.run('s.enemy.boss=false; s.enemy.units.pop()');
scripts/sim/selftest.cjs:89:  finishMonsterBattle();`);
tests/game.cjs:5:s.enemy={boss:false,target:1,units:[{id:'slime',uid:0,hp:1000,rewarded:false},{id:'wolf',uid:1,hp:1,rewarded:false}]};s.commands=['fight','guard','guard'];var oldxp=s.members[0].xp;attack();if(!s.enemy||s.enemy.units[0].hp!==1000||s.enemy.units[1].hp!==0||s.members[0].xp!==oldxp||s.enemy.pendingXP!==14)throw Error('target or reward');`);drain();run(`var ex=s.members[0].xp;killReward(s.enemy.units[1]);if(s.members[0].xp!==ex)throw Error('double reward');s.enemy.units[0].hp=1000;s.mp[1]=2;s.magicPlans[1]={id:'halito',target:0};s.commands=['guard','spell','guard'];attack();if(s.mp[1]!==0||s.enemy.units[0].hp!==992)throw Error('spell MP damage');`);drain();run(`s.enemy=null;s.mp[2]=1;var before=s.hp.join();castMagic(2,'dios',0);if(s.hp.join()!==before||s.mp[2]!==1)throw Error('insufficient MP');s.area='dungeon';delete s.members;delete s.mp;s.spell=2;s.heal=1;s.enemy={boss:false,hp:11};ensureProfile();if(s.mp[1]!==8||s.mp[2]!==3||s.enemy.units[0].hp!==11)throw Error('migration');`);
tests/game.cjs:10:drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');
tests/game.cjs:13:drain();run(`var escapeOriginalMembers=structuredClone(s.members),escapeOriginalHP=s.hp.slice(),escapeOriginalAilments=structuredClone(s.ailments);fresh(1);s.members=Array.from({length:6},(_,i)=>({...structuredClone(s.members[i%3]),level:1}));s.hp=Array(6).fill(20);s.ailments=Array.from({length:6},()=>({poison:false,paralysis:0}));s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'wolf',uid:0,hp:20}]};if(escapeChance()!==45)throw Error('escape six level 1 vs level 2');s.members.forEach(m=>m.level=10);if(escapeChance()!==90)throw Error('escape six level 10 vs level 2');s.members=s.members.slice(0,1);s.hp=s.hp.slice(0,1);s.ailments=s.ailments.slice(0,1);s.members[0].level=1;if(escapeChance()!==60)throw Error('escape one level 1 vs level 2');s.members[0].level=20;if(escapeChance()!==95)throw Error('escape upper clamp');s.hp[0]=0;if(escapeChance()!==10)throw Error('escape no eligible party');s.hp[0]=20;s.members[0].level=1;s.enemy.units[0].id='goblin';if(escapeChance()!==60)throw Error('escape one level 1 vs level 2 after eligibility restore');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members[0].level=20;s.enemy.units[0].id='wolf';if(escapeChance()!==95)throw Error('escape clamp at 95');Math.random=()=>0;var oldGold=s.gold;flee();if(s.enemy||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape');s.members=escapeOriginalMembers;s.hp=escapeOriginalHP;s.ailments=escapeOriginalAilments`);console.log('PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction');
tests/game.cjs:18:s.mp=[0,200,200];s.enemy={boss:false,units:[{id:'goblin',uid:0,hp:500},{id:'goblin',uid:1,hp:500},{id:'wolf',uid:2,hp:500}]};
tests/game.cjs:38:s.cells[s.pos].type='boss';encounter(s.pos);if(s.enemy.units.length!==1||s.enemy.units[0].id!=='guardian')throw Error('floor guardian');
tests/game.cjs:42:s.floor=1;s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={boss:false,units:[{id:'slime',uid:0,hp:1,rewarded:false},{id:'slime',uid:1,hp:999,rewarded:false}],target:0};s.commands=['fight','guard','guard'];Math.random=()=>.99;attack();
tests/game.cjs:48:s.enemy={boss:false,chestBattle:true,lootGold:0,units:[{id:'slime',uid:0,hp:1,rewarded:false},{id:'slime',uid:1,hp:1,rewarded:false}],target:0};s.members[1].known.push('mahalito');s.mp[1]=100;s.magicPlans[1]={id:'mahalito',target:0};s.commands=['guard','spell','guard'];attack();if(s.enemy!==null||s.commands.some(c=>c!=='fight')||s.magicPlans.some(Boolean))throw Error('spell reset');if(!drawEnemies().includes('data-enemy-uid="0"')||!drawEnemies().includes('data-enemy-uid="1"'))throw Error('last battle early removal');
tests/game.cjs:63:run(`s.pos=size()*3+3;s.dir=0;var stay=s.pos;s.enemy={boss:false,units:[{id:'slime',uid:0,hp:10}]};move('strafeRight');if(s.pos!==stay)throw Error('combat strafe');s.enemy=null;s.pendingStairs=true;move('strafeRight');if(s.pos!==stay)throw Error('stairs strafe');s.pendingStairs=false;
tests/game.cjs:73:`);drain();run(`s.enemy=null;render();if($('.controls').hidden)throw Error('exploration controls');s.inventory[0]=['healingPotion','sword','helm','antidote'];s.equipped[0]=1;s.armor[0]={head:2,body:null,feet:null};s.hp[1]=1;var medicineMP=s.mp.join();Math.random=()=>.999;if(!useMedicine(0,0,1)||s.hp[1]!==9||s.inventory[0].length!==3||s.equipped[0]!==0||s.armor[0].head!==1||s.mp.join()!==medicineMP)throw Error('healing medicine / equipment indices');`);drain();run(`s.ailments[1].poison=true;if(!useMedicine(0,2,1)||s.ailments[1].poison||s.inventory[0].length!==2)throw Error('antidote');`);drain();run(`s.inventory[0].push('healingPotion');s.hp[1]=maxHP(1);if(useMedicine(0,2,1)||s.inventory[0].length!==3)throw Error('wasted medicine');`);drain();run(`s.hp[1]=1;s.enemy={boss:false,units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['item','guard','guard'];s.itemPlans[0]={slot:2,target:1,id:'healingPotion'};Math.random=()=>0;var medicineMP=s.mp.join();attack();if(s.inventory[0].length!==2||s.commands.some(c=>c!=='fight')||s.itemPlans.some(Boolean)||s.mp.join()!==medicineMP)throw Error('battle medicine');`);drain();run(`s.enemy=null;s.inventory[0]=['sword'];Math.random=()=>0;dropMedicine();if(s.inventory[0][1]!=='healingPotion')throw Error('medicine drop');var rolls=[0,.99];Math.random=()=>rolls.shift()??.99;dropMedicine();if(s.inventory[0][2]!=='antidote')throw Error('antidote drop');ensureProfile();if(s.inventory[0][2]!=='antidote')throw Error('medicine migration');`);drain();
tests/game.cjs:76:s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
tests/game.cjs:77:var lockedFloor=s.floor;if(travelFloor(2)!==false||s.floor!==lockedFloor||s.cells[s.boss].type!=='boss')throw Error('guardian bypass');
tests/game.cjs:79:s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss;encounter(s.boss);s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[0,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
tests/game.cjs:81:if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
tests/game.cjs:82:s.cells[2].open=true;s.cells[3].flag='power';rememberFloor();var oldFloor2=JSON.stringify(s.cells);travelFloor(1);if(s.cells[s.boss].type!=='down')throw Error('cleared floor retained');s.pos=s.boss;travelFloor(2);if(JSON.stringify(s.cells)!==oldFloor2)throw Error('dungeon roundtrip');
tests/game.cjs:83:var inventoryBefore=JSON.stringify(s.inventory),goldBefore=s.gold,xpBefore=s.members.map(m=>m.xp).join();enterTown();if(s.area!=='town'||s.floor!==1||Object.keys(s.floors).length||s.cells.some(c=>c.open||c.flag||c.spent||c.disarmed)||s.cells[s.boss].type!=='boss')throw Error('town reset all floors');if(JSON.stringify(s.inventory)!==inventoryBefore||s.gold!==goldBefore||s.members.map(m=>m.xp).join()!==xpBefore)throw Error('town reset profile');enterDungeon();if(s.cells.filter(c=>c.open).length!==1||!s.cells[s.start].open)throw Error('new expedition');
tests/game.cjs:119:`);drain();run(`if(s.logs[0]!=='前方は罠の可能性あり')throw Error('survey correct');Math.random=()=>.99;castMagic(0,'dumapic',null);if(s.mp[0]!==94||spellCost(magic('dumapic'))!==8)throw Error('survey double');`);drain();run(`if(s.logs[0]!=='前方にはなにもない')throw Error('survey wrong');s.cells[target()].open=true;castMagic(0,'dumapic',null);if(s.mp[0]!==86||s.dumapicUses!==3)throw Error('failed survey cost');`);drain();run(`if(s.logs[0]!=='調査に失敗した。')throw Error('explored survey');s.dumapicUses=4;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.dumapicUses!==4||s.commands.length!==6||s.magicPlans.length!==6)throw Error('floor profile preservation');enterTown();if(s.dumapicUses!==0)throw Error('survey town reset');`);drain();run(`
tests/game.cjs:128:drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, 0.5-50% curve');
tests/game.cjs:130:drain();run(`s.enemy={boss:false,initiative:'party',units:[{id:'goblin',uid:0,row:0,hp:100}]};s.done=false;s.hp=s.members.map(m=>m.maxHP);s.members.forEach(m=>m.level=1);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));Math.random=()=>.999;var escapeHP=s.hp.join();flee();if(!s.enemy||s.hp.join()!==escapeHP||s.enemy.initiative!=='normal')throw Error('surprise flee failure consumes free turn');`);drain();console.log('PASS failed escape consumes party surprise without enemy retaliation');
tests/game.cjs:170:for(let f=1;f<=4;f++){s.floor=f;for(let r of [0,.2,.5,.999]){Math.random=()=>r;let formation=monsterFormation(false);if(formation.length<1||formation.length>3||formation.some(id=>enemyDefinition(id).floor!==Math.min(3,f)||enemyDefinition(id).boss))throw Error('floor pool');if(monsterFormation(true)[0]!==['guardian','general','watcher'][Math.min(3,f)-1])throw Error('guardian floor')}}
dist/monster-data.js:46:    "boss": false,
dist/monster-data.js:90:    "boss": false,
dist/monster-data.js:134:    "boss": false,
dist/monster-data.js:178:    "boss": false,
dist/monster-data.js:222:    "boss": false,
dist/monster-data.js:266:    "boss": false,
dist/monster-data.js:315:    "boss": false,
dist/monster-data.js:359:    "boss": false,
dist/monster-data.js:403:    "boss": false,
dist/monster-data.js:447:    "boss": true,
dist/monster-data.js:496:    "boss": false,
dist/monster-data.js:540:    "boss": false,
dist/monster-data.js:584:    "boss": false,
dist/monster-data.js:636:    "boss": false,
dist/monster-data.js:680:    "boss": false,
dist/monster-data.js:724:    "boss": false,
dist/monster-data.js:773:    "boss": false,
dist/monster-data.js:822:    "boss": false,
dist/monster-data.js:866:    "boss": false,
dist/monster-data.js:915:    "boss": true,
dist/monster-data.js:976:    "boss": false,
dist/monster-data.js:1020:    "boss": false,
dist/monster-data.js:1064:    "boss": false,
dist/monster-data.js:1108:    "boss": false,
dist/monster-data.js:1152:    "boss": false,
dist/monster-data.js:1196:    "boss": false,
dist/monster-data.js:1245:    "boss": false,
dist/monster-data.js:1297:    "boss": false,
dist/monster-data.js:1346:    "boss": false,
dist/monster-data.js:1390:    "boss": false,
dist/monster-data.js:1439:    "boss": true,
dist/game.js:1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i));for(let n=0;n<10;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
dist/game.js:12:function rollInitiative(action='forward',boss=false){if(boss)return 'normal';let r=Math.random(),enemyChance=action==='back' ? .12 : .10;if(r<enemyChance)return s.watchful?'normal':'enemy';return r<enemyChance+.10?'party':'normal'}
dist/game.js:13:function encounter(i,unexplored=false,action='forward'){let boss=s.cells[i].type==='boss',formation=monsterFormation(boss),units=[];for(let [row,id] of formation.slice(0,3).entries()){let [min,max]=enemyDefinition(id).groupSize,n=min+(Math.random()*(max-min+1)|0);for(let j=0;j<n;j++)units.push({...makeEnemy(id,units.length),row})}resetCommandEntry();s.attackRows=s.members.map(()=>0);s.enemy={dataVersion:1,flagEffect:flagEffect(),boss,chestBattle:unexplored,lootGold:0,units,target:0,escapeTo:s.previousPos??s.start,initiative:rollInitiative(action,boss)};identifyEnemies();let message={normal:'敵が現れた！',enemy:'敵の奇襲！',party:'敵はまだ気づいていない！'}[s.enemy.initiative];log(message,{encounter:true});if(s.enemy.flagEffect.bad)log('誤った旗がパーティーを惑わせた！');if(s.enemy.initiative==='enemy'){s.enemy.initiative='normal';enemyTurn(s.members.map(()=>'fight'))}}
dist/game.js:17:function cell(i,action='forward'){if(currentChest()||s.area!=='dungeon'||s.pendingStairs||logBusy()||s.done||s.enemy||s.pendingBoss)return;let c=s.cells[i];if(mode==='flag'){if(!c.open)c.flag=c.flag?false:(s.flagKind||'power');render();return}if(!adjacent(s.pos,i)){log('現在地の上下左右に隣接するマスを選んでください。');render();return}if(c.flag){log('旗のあるマスには移動できない。旗を外すと進めます。');render();return}tickAilments(false);if(s.done){render();return}let previous=s.pos,wasOpen=c.open;s.previousPos=previous;s.pos=i;if(c.type==='boss'&&!s.relic){c.open=true;s.pendingBoss={previous};log('守護者と戦いますか？');render();return}if(!c.open){c.open=true;if(c.trap){if(triggerFloorTrap(c)){render();return}}else log(num(i)?`警告：周囲に罠が${num(i)}個。`:'静かな部屋。周囲に罠はない。')}if(!s.done){if(c.type==='down'){s.pendingStairs='down';log(`地下${s.floor+1}階に移動しますか？`)}else if(c.type==='stairs'){s.pendingStairs=true;log(s.floor===1?'町に移動しますか？':`地下${s.floor-1}階に移動しますか？`)}else if(Math.random()<encounterRate(i,wasOpen,action))encounter(i,!wasOpen,action)}render()}
dist/game.js:30:function attack(){if(logBusy()||!s.enemy||s.done)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}identifyEnemies();let cmds=s.commands.slice();log('── ターン開始 ──');for(let i=0;i<s.members.length;i++)if(s.hp[i]>0&&cmds[i]==='guard')log(`${NAMES[i]}は身を守る。`);for(let i=0;i<s.members.length;i++){if(s.hp[i]<=0)continue;if(s.ailments[i].paralysis>0){log(`${NAMES[i]}は麻痺して動けない。`);continue}if(cmds[i]==='guard')continue;if(cmds[i]==='dispel'){dispelUndead(i);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(cmds[i]==='item'){let plan=s.itemPlans[i];if(plan)useMedicine(i,plan.slot,plan.target,true,plan.id);continue}if(cmds[i]==='spell'){let plan=s.magicPlans[i];if(plan){let x=magic(plan.id),t=plan.target;if(x&&(x.target==='enemy'||x.target==='group')&&!validMagicTarget(x,t)){let original=s.enemy.units.find(e=>e.uid===t);t=s.enemy.units.find(e=>e.hp>0&&original&&rowKey(e)===rowKey(original))?.uid??s.enemy.units.find(e=>e.hp>0)?.uid}castMagic(i,plan.id,t)}else log(`${NAMES[i]}の呪文が選ばれていない。`);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(!canWeaponAttack(i)){log(`${NAMES[i]}の近接攻撃は後衛から届かない。`);continue}let e=selectedEnemy(i);if(!e){log(`${NAMES[i]}の攻撃対象の列は全滅している。`);continue;}let d=enemyDefinition(e.id);let result=physicalAttack(i,e);if(!result.hitsCount){log(`${NAMES[i]}の攻撃は${enemyDisplay(e)}にかわされた。`);continue}let damage=flagDamage(result.damage);e.hp=Math.max(0,e.hp-damage);log(`${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。`);if(e.hp===0)killReward(e);if(!s.enemy.units.some(e=>e.hp>0))break}if(!s.enemy.units.some(e=>e.hp>0)){finishMonsterBattle()}else if(s.enemy.initiative==='party'){s.enemy.initiative='normal'}else{enemyTurn(cmds)}resetCommandEntry();resetPartyCommands();if(s.enemy){let next=s.enemy.units.find(e=>e.hp>0);s.attackRows=s.attackRows.map(key=>s.enemy.units.some(e=>String(rowKey(e))===String(key)&&e.hp>0)?key:rowKey(next))}render()}
dist/game.js:31:function ensureStats(){if(!s.members){s.members=CLASSES.slice(0,3).map(c=>({level:1,xp:0,maxHP:c.hp,maxMP:c.mp,attack:c.attack,ac:c.ac}));s.mp=CLASSES.slice(0,3).map((c,i)=>i===1?Math.min(c.mp,(s.spell===undefined?c.mp:s.spell*SPELLS.blast.cost)):i===2?Math.min(c.mp,(s.heal===undefined?c.mp:s.heal*SPELLS.heal.cost)):0);if(s.area==='town')s.mp=s.members.map(m=>m.maxMP);delete s.spell;delete s.heal}s.mp??=s.members.map(m=>m.maxMP);if(s.enemy&&!s.enemy.units){let old=s.enemy,id=old.boss?'guardian':'skeleton';s.enemy={boss:old.boss,target:0,units:[{id,uid:0,hp:old.hp,rewarded:false}]}}}
dist/game.js:61:function face(i){if(i<0)return {fill:'#202722',label:'外壁',symbol:'',sub:''};let c=s.cells[i];return {color:c.flag?FLAG_COLORS[placedFlag(c)]:'#e8d2a2',fill:c.open?'#3b493c':c.safe?'#34413a':'#151f1b',label:c.open?'探索済み':c.safe?'安全確認済み':'未探索',symbol:c.open&&c.type==='boss'?'☠':c.open&&c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.flag?'⚑':c.open?(c.spent?'×':String(num(i))):c.disarmed?'✓':c.safe?'✓':'？',sub:c.disarmed?'罠を解除済み':c.spent?'作動済みの罠':c.flag?'旗あり':c.open?'周囲の罠の数':''}}
dist/game.js:63:function render(){ensureProfile();$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();$('#maptoggle').hidden=s.area!=='dungeon';if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic?' / 秘宝 ✦':''}`;$('#party').innerHTML=NAMES.map((n,i)=>`${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`).join('');$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${s.pos===i?num(i):c.open?(c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div><button id="flee">逃げる</button>`;$('#flee').onclick=flee;$('#flee').disabled=logBusy()||combat.boss||combat.flagEffect?.bad;renderCommandEntry()}$('#frontflag').disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();scene()}
dist/game.js:65:$('#bossyes').onclick=()=>s.pendingStairs?answerStairs(true):answerBoss(true);$('#bossno').onclick=()=>s.pendingStairs?answerStairs(false):answerBoss(false);$('#board').onclick=e=>{let b=e.target.closest('[data-i]');if(b)flag(+b.dataset.i)};document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>move(b.dataset.action));$('#frontflag').onclick=()=>flag(target());document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;let action={ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right',a:'strafeLeft',A:'strafeLeft',d:'strafeRight',D:'strafeRight'}[e.key];if(action){e.preventDefault();if(!e.repeat)move(action)}});
dist/game.js:69:try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type='down'}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
dist/game.js:90:function rememberFloor(){s.floors??={};s.floors[s.floor]={floor:s.floor,size:s.size,cells:structuredClone(s.cells),start:s.start,boss:s.boss,relic:s.relic};}
dist/game.js:91:function travelFloor(next,fromTown=false){let previous=s.floor;if(next>previous&&!(fromTown&&s.floors?.[next])&&(next!==previous+1||!s.relic||s.cells[s.boss].type!=='down'||s.pos!==s.boss)){log('次の階層へ進むには守護者を倒す必要がある。');render();return false;}rememberFloor();let floors=s.floors,scan=s.scan;let saved=floors[next];if(saved){Object.assign(s,structuredClone(saved));s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false}else{fresh(next);s.floors=floors;s.scan=scan;}s.pos=fromTown||next>previous||!s.relic?s.start:s.boss;s.pendingStairs=false;render();}
dist/game.js:96:function enemyTurn(cmds){for(const e of s.enemy.units.filter(e=>e.hp>0)){if(s.hp.every(h=>h<=0))break;if(e.sleep>0){e.sleep--;log(`${enemyDisplay(e)}は眠っている。`);continue}if(monsterAction(e,cmds))continue;let d=enemyDefinition(e.id);for(let n=0;n<d.swings;n++){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0),front=alive.filter(i=>i<3),pool=d.rear||!front.length?alive:front;if(!pool.length)break;let i=pool[Math.random()*pool.length|0];if(!hits(d.hit,effectiveAC(i))){log(`${NAMES[i]}は${enemyDisplay(e)}の攻撃をかわした。`);continue}monsterHurt(i,dice(...d.attack).value,cmds,enemyDisplay(e));if(s.hp[i]>0)monsterOnHit(e,i)}}if(s.hp.every(h=>h===0)){defeat();return}if(!s.enemy.units.some(e=>e.hp>0))finishMonsterBattle()}
dist/game.js:99:function escapeChance(){if(!s.enemy||s.enemy.boss||s.enemy.flagEffect?.bad)return 0;let party=s.members.reduce((a,m,i)=>{if(s.hp[i]>0&&!s.ailments[i].poison&&!s.ailments[i].paralysis){a.total+=m.level;a.count++}return a},{total:0,count:0}),enemies=s.enemy.units.reduce((a,e)=>{if(e.hp>0&&!e.sleep){a.total+=monsterLevel(e);a.count++}return a},{total:0,count:0});if(!party.count)return 10;let bonus=party.count===1?15:party.count===2?10:party.count===3?5:0,partyAverage=party.total/party.count,enemyAverage=enemies.count?enemies.total/enemies.count:0;return Math.max(10,Math.min(95,50+5*(partyAverage-enemyAverage)+bonus))}
dist/game.js:100:function flee(){if(logBusy()||!s.enemy||s.done||s.enemy.boss||s.enemy.flagEffect?.bad)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}if(Math.random()*100<escapeChance()){let from=s.pos,to=s.enemy.escapeTo??s.previousPos??s.start;if(!adjacent(from,to)){to=around(from).find(i=>adjacent(from,i)&&s.cells[i].open&&!s.cells[i].trap)??from}s.enemy=null;s.pos=to;s.previousPos=from;log('逃走に成功。一歩前のマスへ戻った。')}else{log('逃走に失敗！');if(s.enemy.initiative==='party')s.enemy.initiative='normal';else enemyTurn(s.members.map(()=>'flee'))}render()}
dist/index.html:8:#log{height:175px}#bosschoice{display:flex;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line);background:#20291f}#bosschoice[hidden]{display:none}#bosschoice button{flex:1}#battle{padding:8px 14px 12px;background:transparent;border-top:0}#battle button{border-color:#ad976c;background:#353c2b}.cell.here{background:#303b2e!important;color:#f0dbb1!important;outline:1px solid #c6b180}.cell.here .cell-number{text-shadow:0 1px 3px #101513,0 0 4px #101513}.direction-marker{inset:2px;width:calc(100% - 4px);height:calc(100% - 4px)}@media(max-width:700px){#log{height:155px}}
dist/index.html:10:header{gap:12px;flex-wrap:wrap}.headeractions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.headeractions button{font-size:12px;padding:9px}.controls{grid-template-columns:auto minmax(120px,1fr);justify-content:center;gap:18px}.movement{justify-content:center}.maplocation{padding:16px;color:var(--gold);font-size:13px}.cell.in-view{background:#364238;border-color:#819079;box-shadow:inset 0 0 0 1px #74856d55}.cell.here{border-color:var(--gold)}.hpbar{position:relative;height:24px;border:1px solid #60705a;background:#141c16;border-radius:3px;overflow:hidden;margin:8px 0}.hpfill{height:100%;background:#758a60;transition:width .2s}.hpvalue{position:absolute;right:6px;top:0;line-height:22px;font-size:13px;font-weight:800;color:#fff6df;text-shadow:0 1px 2px #000}.hpbar.low{border-color:#b95353}.hpbar.low .hpfill{background:#8f3030}.hpbar.low .hpvalue{color:#ff8d8d}dialog{background:#19211c;color:#d9dfd1;border:1px solid #8c805f;border-radius:9px;width:min(620px,94vw);max-height:85vh;padding:22px;line-height:1.8;font-size:13px}dialog::backdrop{background:#000b}.dialoghead{display:flex;align-items:center;justify-content:space-between;gap:12px}.dialoghead h2{font-size:18px;margin:0}.dialoghead button{font-size:23px;padding:0 12px}.cell.boss-cell .cell-number{color:#dc9e7d}#log div:first-child{color:#ead8b7}@media(max-width:700px){.controls{grid-template-columns:auto minmax(100px,1fr);gap:12px}.headeractions{gap:6px}.headeractions button{font-size:11px}.hpvalue{font-size:12px}.maplocation{padding:12px}}
dist/index.html:25:</style><main><header><div id="gametitle"><h1>迷宮スイーパー</h1></div></header><button id="statsopen" class="iconbutton" aria-label="ステータス" title="ステータス"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3Z"/></svg></button><section id="town" class="panel" hidden><div class="townart" aria-hidden="true">♜</div><h2>灯の町</h2><button id="resetopen">冒険データをリセット</button><div class="townmenu"><button id="trainingopen">訓練所</button><button id="tavernopen">酒場</button><button id="blacksmith">鍛冶屋</button><button id="entrance">迷宮への入り口</button></div></section><p id="emptyparty" role="status">訓練所で冒険者を作成し、パーティに加入させてください。</p><button id="backtown" hidden>町へ戻る</button><div class="layout" id="dungeon"><section><div class="panel"><div class="viewlog"><div id="scene" aria-label="現在地からの視界"></div><div id="log" aria-live="polite" role="log"></div></div><div class="party-wrap"><div id="commandreviewpopup" hidden></div><div class="party" id="party" role="button" tabindex="0" aria-label="パーティーを開く" aria-haspopup="dialog"></div></div><div id="bosschoice" hidden><button id="bossyes">はい</button><button id="bossno">いいえ</button></div><div class="controls"><div class="movement"><div><button data-action="left" aria-label="左旋回" title="左旋回"><span aria-hidden="true">↶</span></button><button data-action="strafeLeft" aria-label="左へ横移動" title="左へ横移動"><span aria-hidden="true">←</span></button></div><div><button data-action="forward" aria-label="前進" title="前進"><span aria-hidden="true">↑</span></button><button data-action="back" aria-label="後退" title="後退"><span aria-hidden="true">↓</span></button></div><div><button data-action="right" aria-label="右旋回" title="右旋回"><span aria-hidden="true">↷</span></button><button data-action="strafeRight" aria-label="右へ横移動" title="右へ横移動"><span aria-hidden="true">→</span></button></div></div><div class="frontactions"><div class="flagactions"><button id="flagopen" aria-label="旗の種類を切り替え">⚑</button><button id="frontflag">正面に旗</button></div></div></div><div id="chestactions" hidden><button id="chestthief" hidden>盗賊が調べて開ける</button><button id="chestcalfo" hidden>カルフォ</button><button id="chestopen">宝箱を直接開ける</button><button id="chestabandon">放棄する</button></div><div id="battle" hidden></div></div></section><section id="mapdock"><div class="panel" id="mappanel"><div class="mapheading"><div class="maplocation">地下1階</div><button id="mapflagopen">⚑ 怪力の旗</button></div><div class="board" id="board"></div></div></section></div>
dist/monsters.js:1:function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss)return [ENEMIES.find(d=>d.floor===floor&&d.boss).id];return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
dist/monsters.js:3:function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){log(`${name}はハリトを唱えた。`);monsterHurt(alive[Math.random()*alive.length|0],dice(1,8).value,cmds,name)}return true}return false}
dist/monsters.js:7:function finishMonsterBattle(){
dist/monsters.js:12: if(combat.boss&&defeated.some(e=>enemyDefinition(e.id).boss)){s.relic=true;s.cells[s.boss].type='down';s.pendingStairs='down';log('守護者の一団を撃破！ 下り階段が現れた。');log(`地下${s.floor+1}階に移動しますか？`)}
dist/spells.js:38: if(['damage','sleep','debuff','death'].includes(x.effect)){let picked=s.enemy.units.find(e=>e.uid===t);let targets=s.enemy.units.filter(e=>e.hp>0&&(x.target==='all'||(x.target==='group'?rowKey(e)===rowKey(picked):e.uid===t)));for(let e of targets){let name=enemyDisplay(e);if(x.effect==='damage'){let n=dice(...x.value).value;if(['halito','mahalito'].includes(x.id)&&enemyDefinition(e.id).resistance.includes('炎半減'))n=Math.floor(n/2);e.hp=Math.max(0,e.hp-n);log(`${name}に${n}ダメージ。`)}else if(x.effect==='sleep'){let chance=Math.max(0,Math.min(94,49+5*(s.members[i].level-monsterLevel(e))));if(!enemyDefinition(e.id).boss&&Math.random()*100<chance){e.sleep=Math.max(e.sleep||0,2);log(`${name}は眠った。`)}else log(`${name}には効かなかった。`)}else if(x.effect==='debuff'){e.acPenalty=Math.max(e.acPenalty||0,x.value);log(`${name}の守りが弱まった。`)}else{if(enemyDefinition(e.id).race!=='不死'&&!enemyDefinition(e.id).boss&&Math.random()*100<Math.max(0,100-monsterLevel(e)*6)){e.hp=0;log(`${name}は息絶えた。`)}else log(`${name}には効かなかった。`)}if(e.hp===0)killReward(e)}}
scripts/sim/selftest.cjs
scripts/sim/combat.cjs
scripts/sim/harness.cjs

codex
現行コードでは守護者は単独編成で、ボス撃破判定は既に守護者個体の撃破に結びついています。指定どおり編成関数を変更し、テスト側で随伴のみ撃破時の継続と一団全滅時の階段化を確認します。
exec
/bin/bash -lc "sed -n '1,180p' tests/game.cjs; sed -n '1,130p' scripts/sim/selftest.cjs; sed -n '1,100p' scripts/sim/combat.cjs; sed -n '1,60p' dist/monsters.js; cat BALANCE.md" in /workspace/dungeonsweeper
 succeeded in 0ms:
const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
drain();run(`
s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');if(s.hp.some((h,i)=>h!==maxHP(i))||s.mp.some((h,i)=>h!==s.members[i].maxMP))throw Error('refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
Math.random=()=>.5;if(hits(3,3)||!hits(3,9))throw Error('AC direction');Math.random=()=>0;if(hits(100,9))throw Error('natural1');Math.random=()=>.999;if(!hits(-100,-10))throw Error('natural20');
s.enemy={boss:false,target:1,units:[{id:'slime',uid:0,hp:1000,rewarded:false},{id:'wolf',uid:1,hp:1,rewarded:false}]};s.commands=['fight','guard','guard'];var oldxp=s.members[0].xp;attack();if(!s.enemy||s.enemy.units[0].hp!==1000||s.enemy.units[1].hp!==0||s.members[0].xp!==oldxp||s.enemy.pendingXP!==14)throw Error('target or reward');`);drain();run(`var ex=s.members[0].xp;killReward(s.enemy.units[1]);if(s.members[0].xp!==ex)throw Error('double reward');s.enemy.units[0].hp=1000;s.mp[1]=2;s.magicPlans[1]={id:'halito',target:0};s.commands=['guard','spell','guard'];attack();if(s.mp[1]!==0||s.enemy.units[0].hp!==992)throw Error('spell MP damage');`);drain();run(`s.enemy=null;s.mp[2]=1;var before=s.hp.join();castMagic(2,'dios',0);if(s.hp.join()!==before||s.mp[2]!==1)throw Error('insufficient MP');s.area='dungeon';delete s.members;delete s.mp;s.spell=2;s.heal=1;s.enemy={boss:false,hp:11};ensureProfile();if(s.mp[1]!==8||s.mp[2]!==3||s.enemy.units[0].hp!==11)throw Error('migration');`);
console.log('PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.cells[s.pos].chest={gold:7,opened:false,trap:'none'};s.scan=2;var oldgold=s.gold;Math.random=()=>.99;openChest(true);if(s.gold!==oldgold+21||currentChest())throw Error('safe chest');`);drain();run(`openChest(false);if(s.gold!==oldgold+21)throw Error('double chest');s.cells[s.pos].chest={gold:9,opened:false};s.scan=0;if(!currentChest())throw Error('new chest');s.hp=[32,24,26];afflict(0,'poison');tickAilments();if(s.hp[0]!==30)throw Error('poison');afflict(1,'paralysis');tickAilments();if(s.ailments[1].paralysis!==3)throw Error('paralysis');`);drain();run(`abandonChest()`);drain();run(`enterTown();if(s.ailments.some(a=>a.poison||a.paralysis))throw Error('town cure');`);console.log('PASS direct chest, once-only rewards, poison, paralysis, town cure');

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
if(ENEMIES.length!==31)throw Error('CSV count');for(let f=1;f<=3;f++){s.floor=f;ENEMIES.forEach(e=>{if(enemyDefinition(e.id).xp!==e.xp)throw Error('fixed CSV XP')})}s.floor=1;
var thresholds=s.members.map(m=>JSON.stringify(m.xpTargets));Math.random=()=>{throw Error('unexpected reroll')};ensureProgression();if(s.members.some((m,i)=>JSON.stringify(m.xpTargets)!==thresholds[i]))throw Error('persistent thresholds');
var previousMembers=s.members;s.members=CLASSES.map(c=>({level:1,xp:0}));Math.random=()=>.5;ensureProgression();if(requiredXP(2,0)!==92||requiredXP(2,2)!==115||requiredXP(2,1)!==138)throw Error('class thresholds');for(let i=0;i<3;i++)for(let lv=2;lv<=30;lv++)if(requiredXP(lv,i)<=requiredXP(lv-1,i))throw Error('nonmonotonic');
s.members=[{level:8,xp:2900},{level:8,xp:2900},{level:8,xp:2900}];ensureProgression();if(s.members.some(m=>m.level!==8||m.xp!==2900||m.xpTargets[8]!==2800))throw Error('legacy migration');s.members=previousMembers;
for(let r of [0,.999]){Math.random=()=>r;s.cells[s.pos].type='';encounter(s.pos);if(new Set(s.enemy.units.map(e=>e.uid)).size!==s.enemy.units.length)throw Error('uids');for(let g of enemyGroups()){let range=enemyDefinition(g.id).groupSize;if(g.units.length!==range[r===0?0:1])throw Error('group bound');}if(!drawEnemies().includes('<rect'))throw Error('group drawing');}
s.cells[s.pos].type='boss';encounter(s.pos);if(s.enemy.units.length!==1||s.enemy.units[0].id!=='guardian')throw Error('floor guardian');
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
s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss;encounter(s.boss);s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[0,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
`);drain();run(`attack()`);drain();run(`if(s.enemy){s.attackRows=[1,1,1];attack()}`);drain();run(`
if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
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
drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, 0.5-50% curve');

drain();run(`s.enemy={boss:false,initiative:'party',units:[{id:'goblin',uid:0,row:0,hp:100}]};s.done=false;s.hp=s.members.map(m=>m.maxHP);s.members.forEach(m=>m.level=1);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));Math.random=()=>.999;var escapeHP=s.hp.join();flee();if(!s.enemy||s.hp.join()!==escapeHP||s.enemy.initiative!=='normal')throw Error('surprise flee failure consumes free turn');`);drain();console.log('PASS failed escape consumes party surprise without enemy retaliation');
drain();run(`s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0,sleep:0}));displayVitals=null;if(ailmentTags(0)!=='')throw Error('normal status hidden');displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};s.hp[0]=0;s.ailments[1].paralysis=2;if(ailmentTags(0)||ailmentTags(1))throw Error('status shown before log');displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments)};if(!ailmentTags(0).includes('死亡')||!ailmentTags(1).includes('麻痺'))throw Error('status missing at log');s.hp[0]=maxHP(0);s.ailments[1].paralysis=0;if(!ailmentTags(0).includes('死亡')||!ailmentTags(1).includes('麻痺'))throw Error('status recovery shown early');displayVitals=null;if(ailmentTags(0)||ailmentTags(1))throw Error('status recovery');`);console.log('PASS status tags follow displayed HP/ailments through damage and recovery');
drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='town';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.gold=500;buy('shortbow',5);equip(5,1);if(equippedWeapon(5).id!=='shortbow'||!canWeaponAttack(5)||canWeaponAttack(4))throw Error('ranged equip/rear reach');var price=s.gold;buy('shortbow',4);if(s.gold!==price)throw Error('bow class lock');s.area='dungeon';s.cells.forEach(c=>{c.flag=false;delete c.chest});s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999,rewarded:false}],initiative:'party'};s.commands=s.members.map(()=> 'guard');s.commands[5]='fight';s.attackRows=s.members.map(()=>0);Math.random=()=>.999;var oldEnemyHP=s.enemy.units[0].hp;attack();if(s.enemy.units[0].hp>=oldEnemyHP)throw Error('rear bow no damage');`);drain();run(`s.enemy.initiative='party';s.equipped[5]=0;s.commands=s.members.map(()=> 'guard');s.commands[5]='fight';var oldEnemyHP=s.enemy.units[0].hp;attack();if(s.enemy.units[0].hp!==oldEnemyHP)throw Error('rear melee reached');`);drain();run(`s.equipped[5]=1;s.enemy.initiative='party';resetCommandEntry();commandIndex=5;renderCommandEntry();if(!$('#commandentry').innerHTML.includes('data-command-choice="fight"'))throw Error('rear bow UI');var mage=s.members.findIndex((m,i)=>jobOf(i)===1);s.mp[mage]=20;var oldMP=s.mp[mage],surveyCount=s.dumapicUses||0;if(castMagic(mage,'dumapic',null)||s.mp[mage]!==oldMP||(s.dumapicUses||0)!==surveyCount)throw Error('battle survey executed');spellMember=mage;spellBrowse=false;renderMagic();if(!/data-spell="dumapic" disabled/.test($('#magiclist').innerHTML))throw Error('survey not disabled');`);drain();run(`s.enemy=null;s.area='dungeon';s.members[0].xp=requiredXP(s.members[0].level+1,0);$('#leveldialog').open=false;enterTown();if(!$('#leveldialog').open||!$('#levelreport').textContent.includes('戦士Ⅰ'))throw Error('level popup missing');$('#leveldialog').close();render();if($('#leveldialog').open)throw Error('popup reopened on render');enterTown();if($('#leveldialog').open)throw Error('popup without level gain');`);console.log('PASS ranged shop/class/rear damage/UI, melee rear restriction, battle survey disabled/no spend and once-per-return level popup');
drain();run(`s.area='dungeon';s.done=false;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.hp=s.members.map(()=>100);s.ailments=s.members.map(()=>({}));Math.random=()=>0;var beforeTrap=s.hp.slice();triggerFloorTrap(s.cells[s.pos]);if(logQueue[0].text!=='罠だ！'||!logQueue[0].trap||logQueue[0].hp.join()!==beforeTrap.join()||s.hp[0]!==93)throw Error('trap sequence/damage');`);timers.shift()();run(`if(encounterNotice!=='！'||displayVitals.hp[0]!==100)throw Error('trap warning snapshot');`);drain();run(`s.cells[s.pos].chest={opened:false,gold:1};log('敵を倒した。');render();if(!$('#chestactions').hidden)throw Error('chest spoiler');`);drain();run(`if($('#chestactions').hidden)throw Error('chest not revealed after logs');`);console.log('PASS trap warning before damage and chest reveal after log playback');
drain();run(`if(strengthFor(0,1)!==15||strengthFor(0,30)!==18||strengthFor(1,1)!==9||strengthBonus(18)!==3||strengthBonus(3)!==-3)throw Error('STR migration');let m=s.members[0];m.job=0;m.level=5;m.str=18;let w=equippedWeapon(0),oldMin=w.minAttacks,oldHit=w.hitBonus;w.minAttacks=3;w.hitBonus=0;Math.random=()=>.99;let result=physicalAttack(0,{id:'slime',row:0});if(result.count!==3||result.hitsCount!==3)throw Error('multi attack');w.minAttacks=oldMin;w.hitBonus=oldHit;`);console.log('PASS STR migration and per-swing attack count');
drain();run(`{
let savedState=structuredClone(s),savedRandom=Math.random;
try {
  // Enumerate every d20 bucket, so the exact hit boundary and rate are checked.
  s.members[0].job=0;s.members[0].level=1;s.members[0].str=10;
  s.inventory[0]=['sword'];s.equipped[0]=0;
  if(equippedWeapon(0).hitBonus||enemyDefinition('slime').ac!==9)throw Error('row hit fixture');
  // Stable row IDs deliberately differ from their current positions.
  s.enemy={units:[10,20,30].map((row,uid)=>({id:'slime',row,uid,hp:100,rewarded:false}))};
  function checkRowHits(enemy,threshold,expectedHits){
    let total=0;
    for(let roll=0;roll<20;roll++){
      Math.random=()=> (roll+.5)/20;
      let result=physicalAttack(0,enemy);
      if(result.count!==1||result.hitsCount!==Number(roll>=threshold))throw Error('row hit boundary '+enemy.row+' roll '+roll);
      total+=result.hitsCount;
    }
    if(total!==expectedHits)throw Error('row hit rate '+enemy.row);
  }
  checkRowHits(s.enemy.units[0],10,10);
  checkRowHits(s.enemy.units[1],13,7);
  checkRowHits(s.enemy.units[2],16,4);
  s.enemy.units[0].hp=0;s.enemy.units[0].rewarded=true;
  if(enemyGroups()[0].key!==20||s.enemy.units[1].row!==20)throw Error('stable row ID after collapse');
  checkRowHits(s.enemy.units[1],10,10);
  checkRowHits(s.enemy.units[2],13,7);
} finally {s=savedState;Math.random=savedRandom;}
}`);console.log('PASS physical row hit thresholds 10/13/16 (50%/35%/20%) and collapse with stable row IDs');
drain();run(`{let savedNamesState=structuredClone(s);s.area='town';s.enemy=null;s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.cells[s.pos].chest=null;s.members=[];s.reserve=[];for(let name of ['(','[x','a.b','a*']){let recruit=generateRecruit(name,0);if(!recruit||!registerRecruit(recruit))throw Error('special name register');let roster=trainingRoster(),index=roster.findIndex(r=>r.members.id===recruit.members.id);if(!setPartyFromRoster(roster,[index]))throw Error('special name join');refreshNames();if(coloredLog('テスト').includes('log-ally'))throw Error('unrelated name color');if(coloredLog('aXbの攻撃').includes('log-ally'))throw Error('regex metacharacter interpreted');s.members=[];s.reserve=[];refreshNames();}s=savedNamesState;refreshNames();}`);console.log('PASS special character names do not break log coloring or match as regex');
drain();run(`s.area='dungeon';s.done=false;s.hp=s.members.map(()=>20);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.ailments[0].poison=true;var poisonBefore34=s.hp[0],count34=logQueue.length;tickAilments(false);if(s.hp[0]!==poisonBefore34-2||logQueue.length!==count34)throw Error('silent exploration poison');s.ailments[0].poison=false;s.enemy={chestBattle:false,units:[{id:'slime',uid:1,row:0,hp:0,rewarded:false},{id:'wolf',uid:2,row:1,hp:5,rewarded:false}]};var xp34=s.members[0].xp,gold34=s.gold;Math.random=()=>.99;killReward(s.enemy.units[0]);if(s.members[0].xp!==xp34||s.gold!==gold34)throw Error('premature rewards');killReward(s.enemy.units[0]);if(s.enemy.pendingXP!==enemyDefinition('slime').xp)throw Error('duplicate rewards');var reward34=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members[0].xp!==xp34+Math.max(1,Math.floor(reward34/s.members.length))||s.gold<=gold34)throw Error('victory rewards');var paid34=s.gold;awardVictory(s.enemy);if(s.gold!==paid34)throw Error('duplicate victory');`);console.log('PASS silent exploration poison and deferred victory rewards');
drain();run(`s.done=false;s.area='dungeon';s.hp=s.members.map(()=>20);s.enemy={units:[{id:'wolf',uid:0,row:0,hp:10},{id:'slime',uid:1,row:1,hp:10}]};s.members.forEach(m=>m.intelligence=10);Math.random=()=>.99;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!=='素早い牙')throw Error('unknown');Math.random=()=>0;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!==enemyDefinition('wolf').name||!s.enemy.units[1].identified)throw Error('identify');Math.random=()=>.99;identifyEnemies();if(!s.enemy.units[0].identified)throw Error('identification persistence');s.enemy.units.forEach(e=>e.identified=false);identifyEnemies(true);if(!s.enemy.units.every(e=>e.identified))throw Error('identify spell effect');`);console.log('PASS identification failure, success, persistence and spell effect');
// CSV monster implementation: deterministic branch and integration checks.
drain();run(`
{let savedMonstersState=structuredClone(s);
function resetMonstersTest(id){s=structuredClone(savedMonstersState);s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;delete s.cells[s.pos].chest;s.hp=s.members.map(()=>1000);s.mp=s.members.map(()=>100);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.enemy={dataVersion:1,units:[{id,uid:0,row:0,hp:999,identified:true,rewarded:false}],chestBattle:false};displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;resetPartyCommands();s.commands=s.members.map(()=>'fight');}
for(let f=1;f<=4;f++){s.floor=f;for(let r of [0,.2,.5,.999]){Math.random=()=>r;let formation=monsterFormation(false);if(formation.length<1||formation.length>3||formation.some(id=>enemyDefinition(id).floor!==Math.min(3,f)||enemyDefinition(id).boss))throw Error('floor pool');if(monsterFormation(true)[0]!==['guardian','general','watcher'][Math.min(3,f)-1])throw Error('guardian floor')}}
resetMonstersTest('goblin');Math.random=()=>.01;let xp=s.members[0].xp,gold=s.gold;s.enemy.chestBattle=true;enemyTurn(s.commands);if(s.enemy||s.gold!==gold||s.members[0].xp!==xp||s.cells[s.pos].chest)throw Error('flee rewards');
resetMonstersTest('goblin');s.enemy.chestBattle=true;s.enemy.units.push({id:'slime',uid:1,row:1,hp:0,rewarded:false});Math.random=()=>.01;killReward(s.enemy.units[1]);enemyTurn(s.commands);if(s.enemy||!s.cells[s.pos].chest||s.members[0].xp!==xp+Math.max(1,Math.floor(6/s.members.length)))throw Error('mixed escape victory');
resetMonstersTest('rat');Math.random=()=>.01;enemyTurn(s.commands);if(s.enemy.units.length!==2||s.hp.some(h=>h!==1000))throw Error('summon acts same turn');for(let n=0;n<10;n++)monsterAction(s.enemy.units[0],s.commands);if(s.enemy.units.length!==5||s.enemy.summoned!==4||new Set(s.enemy.units.map(e=>e.uid)).size!==5||!logQueue.some(x=>x.text.includes('仲間を呼んだが、現れなかった。')))throw Error('battle summon cap');displayCombat=undefined;let svg=drawEnemies();if((svg.match(/data-enemy-uid/g)||[]).length!==5)throw Error('five icons');
resetMonstersTest('firefly');Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands);if(s.hp.some(h=>h!==998))throw Error('breath all targets');
resetMonstersTest('apprentice');Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands);if(s.hp[0]!==999||s.hp.slice(1).some(h=>h!==1000))throw Error('single spell');
resetMonstersTest('general');Math.random=()=>.99;enemyTurn(s.commands);if(logQueue.filter(x=>x.text.includes('ダメージ')).length!==2||s.hp.slice(3).some(h=>h!==1000))throw Error('multi attacks/front target');
resetMonstersTest('archer');Math.random=()=>.99;enemyTurn(s.commands);if(s.hp[5]===1000||s.hp.slice(0,5).some(h=>h!==1000))throw Error('rear target');
resetMonstersTest('acidslime');Math.random=()=>0;monsterOnHit(s.enemy.units[0],0);if(!s.ailments[0].poison||!s.ailments[0].paralysis)throw Error('multiple afflictions');
resetMonstersTest('rabbit');Math.random=()=>0;monsterOnHit(s.enemy.units[0],0);if(s.hp[0]!==0)throw Error('instant death');
resetMonstersTest('terror');s.members[0].level=5;s.members[0].maxHP=100;s.members[0].maxMP=0;s.members[0].xp=10000;Math.random=()=>0;monsterOnHit(s.enemy.units[0],0);if(s.members[0].level!==4||s.members[0].xp!==requiredXP(4,0)||s.hp[0]>s.members[0].maxHP||s.members[0].maxMP<0)throw Error('level drain');s.members[0].level=1;monsterOnHit(s.enemy.units[0],0);if(s.members[0].level!==1)throw Error('drain floor');
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
function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss)return [ENEMIES.find(d=>d.floor===floor&&d.boss).id];return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){log(`${name}はハリトを唱えた。`);monsterHurt(alive[Math.random()*alive.length|0],dice(1,8).value,cmds,name)}return true}return false}
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
# 迷宮スイーパー 調整データ

実装の正本は `dist/balance.js`（職業・魔法・敵・編成・経験値）と `dist/weapons.js`（武器）。ダイス配列は `[個数, 面数, 固定加算]`。テストは `node tests/game.cjs`。

## 初期ステータスと成長

|職業|HP|MP|攻撃力|AC|毎レベルHP増加|MP増加|攻撃力増加|
|---|---:|---:|---:|---:|---|---|---|
|戦士|32|0|3|6|1d6+3|0|毎レベル+1|
|魔法使い|24|20|0|9|1d4+2|1d2|偶数レベルで+1|
|僧侶|26|15|1|7|1d5+2|1d2|偶数レベルで+1|
|盗賊|25|0|1|8|1d5+2|0|偶数レベルで+1|

全員Lv.1・経験値0で開始。レベルL→L+1の必要経験値は `round(115×L×職業係数×乱数0.9〜1.1)`（最大30）。職業係数は戦士0.8／盗賊0.85／僧侶1.0／魔法使い1.2。メンバー・レベルごとに一度抽選して累計閾値を保存。表示・再読込では再抽選しない。町への帰還時にまとめて成長しHP・MP全回復。ACは成長しない。職業基礎ACから装備防具のAC合計を減算する。戦士のMPは増加しない。既存のレベル・経験値・HP・MPは維持し、成長率は次回以降に適用。既存セーブの達成済み閾値は維持し、将来レベルの必要経験値の増分を15%増加。一度だけ移行し乱数は引き直さない。

物理命中：1d20＋命中補正＋相手AC≧20。出目1は失敗、20は成功。味方命中補正は職業基礎（戦士4／魔法使い1／僧侶2）＋レベル。ACは軽減値ではない。このゲーム用の簡略式。
通常攻撃は本人の攻撃力＋武器ダイス。防御は被ダメージを半分に切り上げ。
呪文は dist/spells.js の MAGIC が正本（23種類）。一覧は SPELLS.md を参照。回復は対象を選ぶ単体回復。迷宮で蘇生はしない。

## 敵一覧

|ID|名前|HP|攻撃|AC|命中補正|経験値|金貨|
|---|---|---|---|---:|---:|---:|---|
|slime|洞窟スライム|1d6+3|1d4|9|1|6|1d4+2|
|skeleton|骸骨の衛兵|2d6+4|1d6+1|7|3|12|2d4+2|
|wolf|灰狼|2d5+3|1d6+2|6|4|14|2d5+2|
|goblin|迷宮ゴブリン|2d6+5|1d8|5|4|17.5|2d6+2|
|guardian|迷宮の守護者|4d8+14|2d6+2|3|6|75|4d10+20|

HPは出現時に決定、戦闘中の残りHPは非表示。撃破ごとにその時点の生存者全員へ表の経験値を付与（分配なし）。金貨は撃破時に決定。金貨は表のダイス結果÷3を切り捨て。各撃破に5%で武器ドロップ。
通常編成は `FORMATIONS` の10パターンから等確率で選択。最大3列で、各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。守護者には衛兵2〜3体が随伴。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。

## セーブ互換・表示

旧セーブの所持品・金貨・探索状態は維持。旧呪文回数×4、旧回復回数×3をMPに変換（最大MPまで、町なら全回復）。旧戦闘は1体の敵として移行。
幅700px以下は地図を通常レイアウトから外し、右下の固定ボタンからモーダル表示。閉じると探索画面に戻る。

防具は dist/weapons.js の ARMOR に定義。頭・胴体・足各1個、所持品10枠を共有。地下2階は10×10、3階以降12×12。深層の敵は種別名を変更し、階ごとにHPダイス1個・固定HP4・攻撃2・命中1を加算、ACを1減算。未探索16%、探索済みは10%＋周囲の残存罠の数字×0.5ポイント（最大14%）。左右横移動は未探索・探索済みとも1ポイント加算。

宝箱は戦闘後その場で開封または放棄。未決定中は移動不可。旧探索回数による安全開封を廃止。盗賊の調査開封は85%で安全に報酬獲得、15%で罠を発動して宝箱消滅・報酬なし。罠なしの箱の失敗は被害なしで消滅。直接開封は罠判定あり。放棄すると報酬なしで消滅。金貨は元報酬の3倍、装備品入手25%。

敵経験値は全階層で旧値の厳密な半分。ゴブリンの17.5は端数を保持して加算する。

町への帰還で全階層の探索記録を破棄。1階は再生成し全マス未探索、次回入場時に現在地だけ開く。2階以降も初回到達時に再生成する。迷宮内の階段往復では探索状態を保存。各階の下り階段は守護者マスと同一で、一団を全滅させて初めて開く。キャラクター・経験値・所持品・金貨は維持。


旗はマスごとにpower/guard/magicを保存、旧booleanは選択中の種類へ移行。正旗は種類別に `min(50%, 0.5% × 本数²)`。0本は発動なし、1本0.5%、2本2%、5本12.5%、10本以上50%。誤旗があると全ボーナス停止、誤旗の各種類のデバフを適用し逃走不可。遭遇時は誤旗のみ「誤った旗がパーティーを惑わせた！」。正旗は発動時に「怪力／堅牢／呪禁の旗がはためいた！」と表示し、旗名をオレンジ／緑／紫に着色。呪禁は消費MP半減・切上げ、探索中は現在階の旗で都度抽選（探索中の誤旗ではボーナス停止のみ）。地図と視界に旗色を表示。

床罠は dist/traps.js。単体3d6+4（25%）、全体2d6+3（25%）、全員毒（20%）、単体麻痺（15%）、同一階転移（15%）。転移は通常の安全な部屋のみ、旗・罠・宝箱・階段・守護者を除外し、連鎖移動や遭遇は起こさない。罠は一度で消え周囲の数値も減る。
戦闘UIは dist/combatui.js。生存かつ行動可能なメンバー順で入力→最終確認→1ターン実行。戻るで順に修正可能。状態カードはPC・スマホとも3列、前衛と後衛の2段。最大6人。

## 酒場・隊列（dist/party.js）

初期登録は戦士3人・僧侶1人・魔法使い1人・盗賊1人。酒場では並べ替え・待機・再加入が可能（1〜6人）。空きを除いて先頭3人が前衛、残りが後衛。近距離武器での攻撃は前衛のみ。遠距離武器は後衛でも使用可能。敵の通常攻撃は前衛の生存者を優先し、前衛全滅後に後衛を狙う。呪文と薬は隊列によらず使用可能。職業・成長・装備・呪文習得は配列位置ではなくメンバーのjobに紐づく。旧3人のレベル・経験値・装備を維持し、Lv1戦士2人・盗賊1人を一度だけ追加する。

デュマピックは魔法使いLv1で確定習得。消費MPは2→4→8→16…、使用回数は階移動・再読み込みで維持し町への帰還でリセット。未探索の正面を85%で正しく、15%で逆に判定。調査は探索・罠解除・旗変更をしない。探索済み・外壁では失敗し、MPと使用回数は消費する。呪禁の旗は通常通り半減判定する。

## 遭遇と先制（dist/game.js）

通常遭遇では敵の奇襲10%、味方の先制10%、通常80%。後退時は敵の奇襲12%、味方10%、通常78%。守護者戦は通常開始。敵の奇襲では防御や呪文を選ぶ前に敵だけが1回行動、味方先制では最初のコマンド実行後の敵行動のみ省略し、次から通常戦闘。いずれも経験値・金貨・宝箱は通常通り。警戒結界は敵の奇襲分を通常開始に置き換え、味方の先制率を変えない。

遭遇ログは「敵が現れた！」「敵の奇襲！」「敵はまだ気づいていない！」のいずれか。同じログの表示タイミングで視界上に500ms表示、その後のログは従来の300ms間隔。HPもログのスナップショットに同期。警戒結界は僧侶Lv3確定習得・MP4、探索専用。階移動やセーブをまたいで町への帰還まで有効。既存のLv3以上の僧侶にも追加する。

apply patch
patch: completed
/workspace/dungeonsweeper/dist/monsters.js
diff --git a/dist/monsters.js b/dist/monsters.js
index 7dd31d149645109d8e3e52b6588d284a88b79e06..f8976599b54ef4b054483c42a1b8143700555684
--- a/dist/monsters.js
+++ b/dist/monsters.js
@@ -1,4 +1,4 @@
-function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss)return [ENEMIES.find(d=>d.floor===floor&&d.boss).id];return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
+function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss){let guardian=ENEMIES.find(d=>d.floor===floor&&d.boss);return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[]) ]}return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
 function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
 function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){log(`${name}はハリトを唱えた。`);monsterHurt(alive[Math.random()*alive.length|0],dice(1,8).value,cmds,name)}return true}return false}
 function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}

apply patch
patch: completed
/workspace/dungeonsweeper/BALANCE.md
diff --git a/BALANCE.md b/BALANCE.md
index 677ba13ad570ec0dfb901c95aa75e37dac3e05cc..e7d98f3303fefaa2e3a9c9a880cc6e5e56bd04b6
--- a/BALANCE.md
+++ b/BALANCE.md
@@ -28,7 +28,7 @@
 |guardian|迷宮の守護者|4d8+14|2d6+2|3|6|75|4d10+20|
 
 HPは出現時に決定、戦闘中の残りHPは非表示。撃破ごとにその時点の生存者全員へ表の経験値を付与（分配なし）。金貨は撃破時に決定。金貨は表のダイス結果÷3を切り捨て。各撃破に5%で武器ドロップ。
-通常編成は `FORMATIONS` の10パターンから等確率で選択。最大3列で、各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。守護者には衛兵2〜3体が随伴。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
+通常編成は同階の非守護者から1〜3列をランダムに選ぶ。守護者戦は守護者を1列目に置き、同階の非守護者から1列を随伴させる。さらに50%で別の随伴列を追加し、最大3列となる。各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
 
 ## セーブ互換・表示
 
diff --git a/dist/monsters.js b/dist/monsters.js
index 7dd31d149645109d8e3e52b6588d284a88b79e06..f8976599b54ef4b054483c42a1b8143700555684
--- a/dist/monsters.js
+++ b/dist/monsters.js
@@ -1,4 +1,4 @@
-function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss)return [ENEMIES.find(d=>d.floor===floor&&d.boss).id];return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
+function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss){let guardian=ENEMIES.find(d=>d.floor===floor&&d.boss);return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[]) ]}return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
 function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
 function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){log(`${name}はハリトを唱えた。`);monsterHurt(alive[Math.random()*alive.length|0],dice(1,8).value,cmds,name)}return true}return false}
 function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}

exec
/bin/bash -lc "rg -n \"s.cells\\[s.pos\\].type='boss'|floor guardian|守護者の一団|finishMonsterBattle\\(\\)\" tests/game.cjs" in /workspace/dungeonsweeper
 succeeded in 0ms:
38:s.cells[s.pos].type='boss';encounter(s.pos);if(s.enemy.units.length!==1||s.enemy.units[0].id!=='guardian')throw Error('floor guardian');
40:`);drain();console.log('PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth');
81:if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');

exec
/bin/bash -lc "sed -n '72,86p' tests/game.cjs" in /workspace/dungeonsweeper
 succeeded in 0ms:
s.members[1].known.push('dilto');s.mp[1]=100;castMagic(1,'dilto',s.enemy.units.find(e=>e.row===2).uid);if(s.enemy.units.some(e=>e.row===0&&e.acPenalty)||s.enemy.units.some(e=>e.row===2&&!e.acPenalty))throw Error('spell crosses rows');
`);drain();run(`s.enemy=null;render();if($('.controls').hidden)throw Error('exploration controls');s.inventory[0]=['healingPotion','sword','helm','antidote'];s.equipped[0]=1;s.armor[0]={head:2,body:null,feet:null};s.hp[1]=1;var medicineMP=s.mp.join();Math.random=()=>.999;if(!useMedicine(0,0,1)||s.hp[1]!==9||s.inventory[0].length!==3||s.equipped[0]!==0||s.armor[0].head!==1||s.mp.join()!==medicineMP)throw Error('healing medicine / equipment indices');`);drain();run(`s.ailments[1].poison=true;if(!useMedicine(0,2,1)||s.ailments[1].poison||s.inventory[0].length!==2)throw Error('antidote');`);drain();run(`s.inventory[0].push('healingPotion');s.hp[1]=maxHP(1);if(useMedicine(0,2,1)||s.inventory[0].length!==3)throw Error('wasted medicine');`);drain();run(`s.hp[1]=1;s.enemy={boss:false,units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['item','guard','guard'];s.itemPlans[0]={slot:2,target:1,id:'healingPotion'};Math.random=()=>0;var medicineMP=s.mp.join();attack();if(s.inventory[0].length!==2||s.commands.some(c=>c!=='fight')||s.itemPlans.some(Boolean)||s.mp.join()!==medicineMP)throw Error('battle medicine');`);drain();run(`s.enemy=null;s.inventory[0]=['sword'];Math.random=()=>0;dropMedicine();if(s.inventory[0][1]!=='healingPotion')throw Error('medicine drop');var rolls=[0,.99];Math.random=()=>rolls.shift()??.99;dropMedicine();if(s.inventory[0][2]!=='antidote')throw Error('antidote drop');ensureProfile();if(s.inventory[0][2]!=='antidote')throw Error('medicine migration');`);drain();
console.log('PASS three rows, independent member targeting, group spell isolation, hidden exploration controls, medicine effects, slot shifts, battle action/reset, drops and save compatibility');
drain();run(`
s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
var lockedFloor=s.floor;if(travelFloor(2)!==false||s.floor!==lockedFloor||s.cells[s.boss].type!=='boss')throw Error('guardian bypass');
`);drain();run(`
s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss;encounter(s.boss);s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[0,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
`);drain();run(`attack()`);drain();run(`if(s.enemy){s.attackRows=[1,1,1];attack()}`);drain();run(`
if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
s.cells[2].open=true;s.cells[3].flag='power';rememberFloor();var oldFloor2=JSON.stringify(s.cells);travelFloor(1);if(s.cells[s.boss].type!=='down')throw Error('cleared floor retained');s.pos=s.boss;travelFloor(2);if(JSON.stringify(s.cells)!==oldFloor2)throw Error('dungeon roundtrip');
var inventoryBefore=JSON.stringify(s.inventory),goldBefore=s.gold,xpBefore=s.members.map(m=>m.xp).join();enterTown();if(s.area!=='town'||s.floor!==1||Object.keys(s.floors).length||s.cells.some(c=>c.open||c.flag||c.spent||c.disarmed)||s.cells[s.boss].type!=='boss')throw Error('town reset all floors');if(JSON.stringify(s.inventory)!==inventoryBefore||s.gold!==goldBefore||s.members.map(m=>m.xp).join()!==xpBefore)throw Error('town reset profile');enterDungeon();if(s.cells.filter(c=>c.open).length!==1||!s.cells[s.start].open)throw Error('new expedition');
`);drain();run(`
var oldMembers=s.members;s.members=[{level:2,xp:105,xpTargets:Array.from({length:31},(_,l)=>50*l*(l-1))},{level:2,xp:105,xpTargets:Array.from({length:31},(_,l)=>50*l*(l-1))},{level:2,xp:105,xpTargets:Array.from({length:31},(_,l)=>50*l*(l-1))}];Math.random=()=>{throw Error('migration must not reroll')};ensureProgression();if(s.members.some(m=>m.level!==2||m.xp!==105||m.xpTargets[2]!==100||m.xpTargets[3]!==330))throw Error('15 percent XP migration');var targets=JSON.stringify(s.members);ensureProgression();if(JSON.stringify(s.members)!==targets)throw Error('double XP inflation');s.members=oldMembers;
s.enemy={units:[{id:'wolf',uid:0,row:0,hp:0},{id:'wolf',uid:1,row:0,hp:10},{id:'wolf',uid:2,row:0,hp:20},{id:'slime',uid:3,row:1,hp:10}],target:2};s.attackRows=[0,1,0];if(selectedEnemy(0).uid!==1||selectedEnemy(1).uid!==3)throw Error('first living per row');s.enemy.units[1].hp=0;if(selectedEnemy(0).uid!==2)throw Error('advance within row');s.enemy.units[2].hp=0;if(selectedEnemy(0)!==undefined)throw Error('do not switch rows mid turn');

codex
`tests/game.cjs`には守護者クリア後の階段遷移テストが既にあります。そこを複数列前提に拡張し、列の安定IDを使って随伴列だけ倒した状態では戦闘が残ること、最後に守護者を倒すと従来どおり階段化することも検証します。
apply patch
patch: completed
/workspace/dungeonsweeper/tests/game.cjs
diff --git a/BALANCE.md b/BALANCE.md
index 677ba13ad570ec0dfb901c95aa75e37dac3e05cc..e7d98f3303fefaa2e3a9c9a880cc6e5e56bd04b6
--- a/BALANCE.md
+++ b/BALANCE.md
@@ -28,7 +28,7 @@
 |guardian|迷宮の守護者|4d8+14|2d6+2|3|6|75|4d10+20|
 
 HPは出現時に決定、戦闘中の残りHPは非表示。撃破ごとにその時点の生存者全員へ表の経験値を付与（分配なし）。金貨は撃破時に決定。金貨は表のダイス結果÷3を切り捨て。各撃破に5%で武器ドロップ。
-通常編成は `FORMATIONS` の10パターンから等確率で選択。最大3列で、各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。守護者には衛兵2〜3体が随伴。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
+通常編成は同階の非守護者から1〜3列をランダムに選ぶ。守護者戦は守護者を1列目に置き、同階の非守護者から1列を随伴させる。さらに50%で別の随伴列を追加し、最大3列となる。各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
 
 ## セーブ互換・表示
 
diff --git a/dist/monsters.js b/dist/monsters.js
index 7dd31d149645109d8e3e52b6588d284a88b79e06..f8976599b54ef4b054483c42a1b8143700555684
--- a/dist/monsters.js
+++ b/dist/monsters.js
@@ -1,4 +1,4 @@
-function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss)return [ENEMIES.find(d=>d.floor===floor&&d.boss).id];return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
+function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss){let guardian=ENEMIES.find(d=>d.floor===floor&&d.boss);return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[]) ]}return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
 function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
 function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){log(`${name}はハリトを唱えた。`);monsterHurt(alive[Math.random()*alive.length|0],dice(1,8).value,cmds,name)}return true}return false}
 function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}
diff --git a/tests/game.cjs b/tests/game.cjs
index 0d966b0ffa9b4ec74cb9c0838b97f3dd23e4185f..702403a96207fa9a63b6553d9539c54fe06c5d21
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -35,7 +35,7 @@
 var previousMembers=s.members;s.members=CLASSES.map(c=>({level:1,xp:0}));Math.random=()=>.5;ensureProgression();if(requiredXP(2,0)!==92||requiredXP(2,2)!==115||requiredXP(2,1)!==138)throw Error('class thresholds');for(let i=0;i<3;i++)for(let lv=2;lv<=30;lv++)if(requiredXP(lv,i)<=requiredXP(lv-1,i))throw Error('nonmonotonic');
 s.members=[{level:8,xp:2900},{level:8,xp:2900},{level:8,xp:2900}];ensureProgression();if(s.members.some(m=>m.level!==8||m.xp!==2900||m.xpTargets[8]!==2800))throw Error('legacy migration');s.members=previousMembers;
 for(let r of [0,.999]){Math.random=()=>r;s.cells[s.pos].type='';encounter(s.pos);if(new Set(s.enemy.units.map(e=>e.uid)).size!==s.enemy.units.length)throw Error('uids');for(let g of enemyGroups()){let range=enemyDefinition(g.id).groupSize;if(g.units.length!==range[r===0?0:1])throw Error('group bound');}if(!drawEnemies().includes('<rect'))throw Error('group drawing');}
-s.cells[s.pos].type='boss';encounter(s.pos);if(s.enemy.units.length!==1||s.enemy.units[0].id!=='guardian')throw Error('floor guardian');
+s.cells[s.pos].type='boss';var formationRolls=[0,.99,0];Math.random=()=>formationRolls.shift()??.99;encounter(s.pos);if(s.enemy.units.length!==3||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian'||s.enemy.units[2].id==='guardian')throw Error('guardian escort formation');
 s.enemy=null;s.cells[s.pos].type='';s.members.forEach((m,i)=>{m.level=1;m.xp=m.xpTargets[2]});var beforeGrowth=s.members.map(m=>m.maxMP);levelUp();if(s.members.some((m,i)=>m.maxMP-beforeGrowth[i]!== (i===0?0:2)))throw Error('MP growth');
 `);drain();console.log('PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth');
 drain();run(`
@@ -76,9 +76,9 @@
 s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
 var lockedFloor=s.floor;if(travelFloor(2)!==false||s.floor!==lockedFloor||s.cells[s.boss].type!=='boss')throw Error('guardian bypass');
 `);drain();run(`
-s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss;encounter(s.boss);s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[0,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
+s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss;Math.random=()=>.999;encounter(s.boss);if(s.enemy.units.length!==2||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian')throw Error('guardian escort encounter');s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[1,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
 `);drain();run(`attack()`);drain();run(`if(s.enemy){s.attackRows=[1,1,1];attack()}`);drain();run(`
-if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
+if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=[0,0,0];s.commands=['fight','fight','fight'];attack();drain();if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
 s.cells[2].open=true;s.cells[3].flag='power';rememberFloor();var oldFloor2=JSON.stringify(s.cells);travelFloor(1);if(s.cells[s.boss].type!=='down')throw Error('cleared floor retained');s.pos=s.boss;travelFloor(2);if(JSON.stringify(s.cells)!==oldFloor2)throw Error('dungeon roundtrip');
 var inventoryBefore=JSON.stringify(s.inventory),goldBefore=s.gold,xpBefore=s.members.map(m=>m.xp).join();enterTown();if(s.area!=='town'||s.floor!==1||Object.keys(s.floors).length||s.cells.some(c=>c.open||c.flag||c.spent||c.disarmed)||s.cells[s.boss].type!=='boss')throw Error('town reset all floors');if(JSON.stringify(s.inventory)!==inventoryBefore||s.gold!==goldBefore||s.members.map(m=>m.xp).join()!==xpBefore)throw Error('town reset profile');enterDungeon();if(s.cells.filter(c=>c.open).length!==1||!s.cells[s.start].open)throw Error('new expedition');
 `);drain();run(`

exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 1 --n 100 --boss && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 2 --n 100 --boss && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 100 --boss && node scripts/sim/selftest.cjs' in /workspace/dungeonsweeper
 exited 1 in 80ms:
PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log
PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration
PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling
PASS direct chest, once-only rewards, poison, paralysis, town cure
PASS floor round trips, exploration persistence, charge persistence and town entrance
PASS mandatory chest decision, abandonment without reward, legacy score cleanup
PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction
PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp
PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth
PASS single/group/last kill log synchronization, guard and spell reset, log colors and escaping
PASS strafe all directions, orientation, walls, battle/stairs locks, spell color, compact party and title visibility
PASS three rows, independent member targeting, group spell isolation, hidden exploration controls, medicine effects, slot shifts, battle action/reset, drops and save compatibility
evalmachine.<anonymous>:2
s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss;Math.random=()=>.999;encounter(s.boss);if(s.enemy.units.length!==2||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian')throw Error('guardian escort encounter');s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[1,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
                                                                                                                                                                                                                                                                 ^

Error: guardian escort encounter
    at evalmachine.<anonymous>:2:264
    at Script.runInContext (node:vm:149:12)
    at Object.runInContext (node:vm:301:6)
    at run (/workspace/dungeonsweeper/tests/game.cjs:1:888)
    at Object.<anonymous> (/workspace/dungeonsweeper/tests/game.cjs:78:12)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)

Node.js v24.22.1

codex
回帰テストが一箇所失敗しました。テストでは乱数0.999を使って2列を期待していましたが、追加列判定は50%未満で発生するため、遭遇処理用の乱数列を確認してテスト条件を合わせます。
exec
/bin/bash -lc 'rg -n "function encounter|function makeEnemy|function groupSize" dist/monsters.js' in /workspace/dungeonsweeper
 exited 1 in 0ms:
exec
/bin/bash -lc "rg -n \"function encounter|makeEnemy\\(\" dist/game.js dist/monsters.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
dist/monsters.js:3:function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){log(`${name}はハリトを唱えた。`);monsterHurt(alive[Math.random()*alive.length|0],dice(1,8).value,cmds,name)}return true}return false}
dist/game.js:6:function makeEnemy(id,index){let d=enemyDefinition(id);return {id,uid:index,hp:dice(...d.hp).value,rewarded:false}}
dist/game.js:11:function encounterRate(i,wasOpen,action='forward'){return (wasOpen ? .10+num(i)*.005 : .16)+(['strafeLeft','strafeRight'].includes(action) ? .01 : 0)}
dist/game.js:13:function encounter(i,unexplored=false,action='forward'){let boss=s.cells[i].type==='boss',formation=monsterFormation(boss),units=[];for(let [row,id] of formation.slice(0,3).entries()){let [min,max]=enemyDefinition(id).groupSize,n=min+(Math.random()*(max-min+1)|0);for(let j=0;j<n;j++)units.push({...makeEnemy(id,units.length),row})}resetCommandEntry();s.attackRows=s.members.map(()=>0);s.enemy={dataVersion:1,flagEffect:flagEffect(),boss,chestBattle:unexplored,lootGold:0,units,target:0,escapeTo:s.previousPos??s.start,initiative:rollInitiative(action,boss)};identifyEnemies();let message={normal:'敵が現れた！',enemy:'敵の奇襲！',party:'敵はまだ気づいていない！'}[s.enemy.initiative];log(message,{encounter:true});if(s.enemy.flagEffect.bad)log('誤った旗がパーティーを惑わせた！');if(s.enemy.initiative==='enemy'){s.enemy.initiative='normal';enemyTurn(s.members.map(()=>'fight'))}}

apply patch
patch: completed
/workspace/dungeonsweeper/tests/game.cjs
diff --git a/BALANCE.md b/BALANCE.md
index 677ba13ad570ec0dfb901c95aa75e37dac3e05cc..e7d98f3303fefaa2e3a9c9a880cc6e5e56bd04b6
--- a/BALANCE.md
+++ b/BALANCE.md
@@ -28,7 +28,7 @@
 |guardian|迷宮の守護者|4d8+14|2d6+2|3|6|75|4d10+20|
 
 HPは出現時に決定、戦闘中の残りHPは非表示。撃破ごとにその時点の生存者全員へ表の経験値を付与（分配なし）。金貨は撃破時に決定。金貨は表のダイス結果÷3を切り捨て。各撃破に5%で武器ドロップ。
-通常編成は `FORMATIONS` の10パターンから等確率で選択。最大3列で、各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。守護者には衛兵2〜3体が随伴。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
+通常編成は同階の非守護者から1〜3列をランダムに選ぶ。守護者戦は守護者を1列目に置き、同階の非守護者から1列を随伴させる。さらに50%で別の随伴列を追加し、最大3列となる。各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
 
 ## セーブ互換・表示
 
diff --git a/dist/monsters.js b/dist/monsters.js
index 7dd31d149645109d8e3e52b6588d284a88b79e06..f8976599b54ef4b054483c42a1b8143700555684
--- a/dist/monsters.js
+++ b/dist/monsters.js
@@ -1,4 +1,4 @@
-function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss)return [ENEMIES.find(d=>d.floor===floor&&d.boss).id];return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
+function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss){let guardian=ENEMIES.find(d=>d.floor===floor&&d.boss);return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[]) ]}return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
 function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
 function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){log(`${name}はハリトを唱えた。`);monsterHurt(alive[Math.random()*alive.length|0],dice(1,8).value,cmds,name)}return true}return false}
 function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}
diff --git a/tests/game.cjs b/tests/game.cjs
index 0d966b0ffa9b4ec74cb9c0838b97f3dd23e4185f..09ec3db552c8b2c3a718275f77a4833c56e9cab1
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -35,7 +35,7 @@
 var previousMembers=s.members;s.members=CLASSES.map(c=>({level:1,xp:0}));Math.random=()=>.5;ensureProgression();if(requiredXP(2,0)!==92||requiredXP(2,2)!==115||requiredXP(2,1)!==138)throw Error('class thresholds');for(let i=0;i<3;i++)for(let lv=2;lv<=30;lv++)if(requiredXP(lv,i)<=requiredXP(lv-1,i))throw Error('nonmonotonic');
 s.members=[{level:8,xp:2900},{level:8,xp:2900},{level:8,xp:2900}];ensureProgression();if(s.members.some(m=>m.level!==8||m.xp!==2900||m.xpTargets[8]!==2800))throw Error('legacy migration');s.members=previousMembers;
 for(let r of [0,.999]){Math.random=()=>r;s.cells[s.pos].type='';encounter(s.pos);if(new Set(s.enemy.units.map(e=>e.uid)).size!==s.enemy.units.length)throw Error('uids');for(let g of enemyGroups()){let range=enemyDefinition(g.id).groupSize;if(g.units.length!==range[r===0?0:1])throw Error('group bound');}if(!drawEnemies().includes('<rect'))throw Error('group drawing');}
-s.cells[s.pos].type='boss';encounter(s.pos);if(s.enemy.units.length!==1||s.enemy.units[0].id!=='guardian')throw Error('floor guardian');
+s.cells[s.pos].type='boss';var formationRolls=[0,.99,0];Math.random=()=>formationRolls.shift()??.99;encounter(s.pos);if(s.enemy.units.length!==3||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian'||s.enemy.units[2].id==='guardian')throw Error('guardian escort formation');
 s.enemy=null;s.cells[s.pos].type='';s.members.forEach((m,i)=>{m.level=1;m.xp=m.xpTargets[2]});var beforeGrowth=s.members.map(m=>m.maxMP);levelUp();if(s.members.some((m,i)=>m.maxMP-beforeGrowth[i]!== (i===0?0:2)))throw Error('MP growth');
 `);drain();console.log('PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth');
 drain();run(`
@@ -76,9 +76,9 @@
 s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
 var lockedFloor=s.floor;if(travelFloor(2)!==false||s.floor!==lockedFloor||s.cells[s.boss].type!=='boss')throw Error('guardian bypass');
 `);drain();run(`
-s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss;encounter(s.boss);s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[0,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
+s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss,encounterRolls=[.999,.999,.999,0,.999,.999];Math.random=()=>encounterRolls.shift()??.999;encounter(s.boss);if(s.enemy.units.length!==2||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian')throw Error('guardian escort encounter');s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[1,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
 `);drain();run(`attack()`);drain();run(`if(s.enemy){s.attackRows=[1,1,1];attack()}`);drain();run(`
-if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
+if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=[0,0,0];s.commands=['fight','fight','fight'];attack();drain();if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
 s.cells[2].open=true;s.cells[3].flag='power';rememberFloor();var oldFloor2=JSON.stringify(s.cells);travelFloor(1);if(s.cells[s.boss].type!=='down')throw Error('cleared floor retained');s.pos=s.boss;travelFloor(2);if(JSON.stringify(s.cells)!==oldFloor2)throw Error('dungeon roundtrip');
 var inventoryBefore=JSON.stringify(s.inventory),goldBefore=s.gold,xpBefore=s.members.map(m=>m.xp).join();enterTown();if(s.area!=='town'||s.floor!==1||Object.keys(s.floors).length||s.cells.some(c=>c.open||c.flag||c.spent||c.disarmed)||s.cells[s.boss].type!=='boss')throw Error('town reset all floors');if(JSON.stringify(s.inventory)!==inventoryBefore||s.gold!==goldBefore||s.members.map(m=>m.xp).join()!==xpBefore)throw Error('town reset profile');enterDungeon();if(s.cells.filter(c=>c.open).length!==1||!s.cells[s.start].open)throw Error('new expedition');
 `);drain();run(`

exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 1 --n 100 --boss && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 2 --n 100 --boss && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 100 --boss && node scripts/sim/selftest.cjs' in /workspace/dungeonsweeper
 exited 1 in 93ms:
PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log
PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration
PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling
PASS direct chest, once-only rewards, poison, paralysis, town cure
PASS floor round trips, exploration persistence, charge persistence and town entrance
PASS mandatory chest decision, abandonment without reward, legacy score cleanup
PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction
PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp
PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth
PASS single/group/last kill log synchronization, guard and spell reset, log colors and escaping
PASS strafe all directions, orientation, walls, battle/stairs locks, spell color, compact party and title visibility
PASS three rows, independent member targeting, group spell isolation, hidden exploration controls, medicine effects, slot shifts, battle action/reset, drops and save compatibility
evalmachine.<anonymous>:2
s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss,encounterRolls=[.999,.999,.999,0,.999,.999];Math.random=()=>encounterRolls.shift()??.999;encounter(s.boss);if(s.enemy.units.length!==2||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian')throw Error('guardian escort encounter');s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[1,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
                                                                                                                                                                                                                                                                                                                                     ^

Error: guardian escort encounter
    at evalmachine.<anonymous>:2:332
    at Script.runInContext (node:vm:149:12)
    at Object.runInContext (node:vm:301:6)
    at run (/workspace/dungeonsweeper/tests/game.cjs:1:888)
    at Object.<anonymous> (/workspace/dungeonsweeper/tests/game.cjs:78:12)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)

Node.js v24.22.1

codex
乱数列が遭遇後の識別処理まで考慮できていませんでした。まず編成単体の期待列数を確認するテストと、戦闘終了経路のテストを分け、偶発的な識別判定に依存しない形へ修正します。
exec
/bin/bash -lc "rg -n \"function identifyEnemies|function rollInitiative\" dist/*.js; python3 - <<'PY'
p='tests/game.cjs'
s=open(p).read().replace(\"var guardianTile=s.boss,encounterRolls=[.999,.999,.999,0,.999,.999];Math.random=()=>encounterRolls.shift()??.999;encounter(s.boss);if(s.enemy.units.length"'!==2||s.enemy.units[0].id!=='"'guardian'||s.enemy.units[1].id==='guardian')throw Error('guardian escort encounter');\", \"var guardianTile=s.boss,expectedFormation=monsterFormation(true);if(expectedFormation.length"'!==2||expectedFormation[0]!=='"'guardian'||expectedFormation[1]==='guardian')throw Error('guardian escort encounter');Math.random=()=>.999;encounter(s.boss);s.enemy.units.forEach(e=>e.row=e.id==='guardian'?0:1);\")
open(p,'w').write(s)
PY
" in /workspace/dungeonsweeper
 succeeded in 0ms:
dist/game.js:5:function identifyEnemies(force=false){if(!s.enemy)return;let chance=Math.min(1,Math.max(0,...s.members.map((m,i)=>s.hp[i]>0?(m.intelligence||0)*.03:0)));for(const g of enemyGroups(s.enemy)){if(!g.units.some(e=>e.hp>0)||g.units.some(e=>e.identified))continue;if(force||Math.random()<chance){for(const e of g.units)e.identified=true}}}
dist/game.js:12:function rollInitiative(action='forward',boss=false){if(boss)return 'normal';let r=Math.random(),enemyChance=action==='back' ? .12 : .10;if(r<enemyChance)return s.watchful?'normal':'enemy';return r<enemyChance+.10?'party':'normal'}

exec
/bin/bash -lc 'node tests/game.cjs' in /workspace/dungeonsweeper
 exited 1 in 101ms:
PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log
PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration
PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling
PASS direct chest, once-only rewards, poison, paralysis, town cure
PASS floor round trips, exploration persistence, charge persistence and town entrance
PASS mandatory chest decision, abandonment without reward, legacy score cleanup
PASS escape average-level formula, party-count bonus, clamp, empty party, flee outcomes, boss restriction
PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp
PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth
PASS single/group/last kill log synchronization, guard and spell reset, log colors and escaping
PASS strafe all directions, orientation, walls, battle/stairs locks, spell color, compact party and title visibility
PASS three rows, independent member targeting, group spell isolation, hidden exploration controls, medicine effects, slot shifts, battle action/reset, drops and save compatibility
evalmachine.<anonymous>:2
if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=[0,0,0];s.commands=['fight','fight','fight'];attack();drain();if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
                                                                                                                                                                                                                                          ^

ReferenceError: drain is not defined
    at evalmachine.<anonymous>:2:235
    at Script.runInContext (node:vm:149:12)
    at Object.runInContext (node:vm:301:6)
    at run (/workspace/dungeonsweeper/tests/game.cjs:1:888)
    at Object.<anonymous> (/workspace/dungeonsweeper/tests/game.cjs:80:94)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)

Node.js v24.22.1

apply patch
patch: completed
/workspace/dungeonsweeper/tests/game.cjs
diff --git a/BALANCE.md b/BALANCE.md
index 677ba13ad570ec0dfb901c95aa75e37dac3e05cc..e7d98f3303fefaa2e3a9c9a880cc6e5e56bd04b6
--- a/BALANCE.md
+++ b/BALANCE.md
@@ -28,7 +28,7 @@
 |guardian|迷宮の守護者|4d8+14|2d6+2|3|6|75|4d10+20|
 
 HPは出現時に決定、戦闘中の残りHPは非表示。撃破ごとにその時点の生存者全員へ表の経験値を付与（分配なし）。金貨は撃破時に決定。金貨は表のダイス結果÷3を切り捨て。各撃破に5%で武器ドロップ。
-通常編成は `FORMATIONS` の10パターンから等確率で選択。最大3列で、各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。守護者には衛兵2〜3体が随伴。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
+通常編成は同階の非守護者から1〜3列をランダムに選ぶ。守護者戦は守護者を1列目に置き、同階の非守護者から1列を随伴させる。さらに50%で別の随伴列を追加し、最大3列となる。各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
 
 ## セーブ互換・表示
 
diff --git a/dist/monsters.js b/dist/monsters.js
index 7dd31d149645109d8e3e52b6588d284a88b79e06..f8976599b54ef4b054483c42a1b8143700555684
--- a/dist/monsters.js
+++ b/dist/monsters.js
@@ -1,4 +1,4 @@
-function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss)return [ENEMIES.find(d=>d.floor===floor&&d.boss).id];return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
+function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss){let guardian=ENEMIES.find(d=>d.floor===floor&&d.boss);return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[]) ]}return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
 function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
 function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){log(`${name}はハリトを唱えた。`);monsterHurt(alive[Math.random()*alive.length|0],dice(1,8).value,cmds,name)}return true}return false}
 function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}
diff --git a/tests/game.cjs b/tests/game.cjs
index 0d966b0ffa9b4ec74cb9c0838b97f3dd23e4185f..d3383f76042a24978abbba9c91478b299a5eddfe
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -35,7 +35,7 @@
 var previousMembers=s.members;s.members=CLASSES.map(c=>({level:1,xp:0}));Math.random=()=>.5;ensureProgression();if(requiredXP(2,0)!==92||requiredXP(2,2)!==115||requiredXP(2,1)!==138)throw Error('class thresholds');for(let i=0;i<3;i++)for(let lv=2;lv<=30;lv++)if(requiredXP(lv,i)<=requiredXP(lv-1,i))throw Error('nonmonotonic');
 s.members=[{level:8,xp:2900},{level:8,xp:2900},{level:8,xp:2900}];ensureProgression();if(s.members.some(m=>m.level!==8||m.xp!==2900||m.xpTargets[8]!==2800))throw Error('legacy migration');s.members=previousMembers;
 for(let r of [0,.999]){Math.random=()=>r;s.cells[s.pos].type='';encounter(s.pos);if(new Set(s.enemy.units.map(e=>e.uid)).size!==s.enemy.units.length)throw Error('uids');for(let g of enemyGroups()){let range=enemyDefinition(g.id).groupSize;if(g.units.length!==range[r===0?0:1])throw Error('group bound');}if(!drawEnemies().includes('<rect'))throw Error('group drawing');}
-s.cells[s.pos].type='boss';encounter(s.pos);if(s.enemy.units.length!==1||s.enemy.units[0].id!=='guardian')throw Error('floor guardian');
+s.cells[s.pos].type='boss';var formationRolls=[0,.99,0];Math.random=()=>formationRolls.shift()??.99;encounter(s.pos);if(s.enemy.units.length!==3||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian'||s.enemy.units[2].id==='guardian')throw Error('guardian escort formation');
 s.enemy=null;s.cells[s.pos].type='';s.members.forEach((m,i)=>{m.level=1;m.xp=m.xpTargets[2]});var beforeGrowth=s.members.map(m=>m.maxMP);levelUp();if(s.members.some((m,i)=>m.maxMP-beforeGrowth[i]!== (i===0?0:2)))throw Error('MP growth');
 `);drain();console.log('PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth');
 drain();run(`
@@ -76,9 +76,9 @@
 s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
 var lockedFloor=s.floor;if(travelFloor(2)!==false||s.floor!==lockedFloor||s.cells[s.boss].type!=='boss')throw Error('guardian bypass');
 `);drain();run(`
-s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss;encounter(s.boss);s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[0,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
+s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss,expectedFormation=monsterFormation(true);if(expectedFormation.length!==2||expectedFormation[0]!=='guardian'||expectedFormation[1]==='guardian')throw Error('guardian escort encounter');Math.random=()=>.999;encounter(s.boss);s.enemy.units.forEach(e=>e.row=e.id==='guardian'?0:1);s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[1,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
 `);drain();run(`attack()`);drain();run(`if(s.enemy){s.attackRows=[1,1,1];attack()}`);drain();run(`
-if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
+if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=[0,0,0];s.commands=['fight','fight','fight'];attack();`);drain();run(`if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
 s.cells[2].open=true;s.cells[3].flag='power';rememberFloor();var oldFloor2=JSON.stringify(s.cells);travelFloor(1);if(s.cells[s.boss].type!=='down')throw Error('cleared floor retained');s.pos=s.boss;travelFloor(2);if(JSON.stringify(s.cells)!==oldFloor2)throw Error('dungeon roundtrip');
 var inventoryBefore=JSON.stringify(s.inventory),goldBefore=s.gold,xpBefore=s.members.map(m=>m.xp).join();enterTown();if(s.area!=='town'||s.floor!==1||Object.keys(s.floors).length||s.cells.some(c=>c.open||c.flag||c.spent||c.disarmed)||s.cells[s.boss].type!=='boss')throw Error('town reset all floors');if(JSON.stringify(s.inventory)!==inventoryBefore||s.gold!==goldBefore||s.members.map(m=>m.xp).join()!==xpBefore)throw Error('town reset profile');enterDungeon();if(s.cells.filter(c=>c.open).length!==1||!s.cells[s.start].open)throw Error('new expedition');
 `);drain();run(`

exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 1 --n 100 --boss && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 2 --n 100 --boss && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 100 --boss && node scripts/sim/selftest.cjs' in /workspace/dungeonsweeper
 succeeded in 28977ms:
PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log
PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration
PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling
PASS direct chest, once-only rewards, poison, paralysis, town cure
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
{"winRate":0.95,"wipeRate":0.05,"deathsPerBattle":0.38,"hpLossRate":0.24639053254437868,"averageRounds":9.66}
{"winRate":0.77,"wipeRate":0.23,"deathsPerBattle":1.69,"hpLossRate":0.4910059171597634,"averageRounds":6.78}
{"winRate":0.44,"wipeRate":0.56,"deathsPerBattle":3.63,"hpLossRate":0.7450887573964498,"averageRounds":6.95}
PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout

codex
回帰テスト一式とコンパイル整合性は通過しました。シミュレータのLv1・6人（戦士2/僧侶/盗賊/魔法使い/僧侶）、各階100戦では勝率が1F 95%、2F 77%、3F 44%でした。最後に差分を確認し、報告用のファイルをまとめます。
exec
/bin/bash -lc 'git status --short && git diff --stat && git diff -- dist/monsters.js BALANCE.md tests/game.cjs' in /workspace/dungeonsweeper
 succeeded in 0ms:
 M BALANCE.md
 M dist/monsters.js
 M tests/game.cjs
 BALANCE.md       | 2 +-
 dist/monsters.js | 2 +-
 tests/game.cjs   | 6 +++---
 3 files changed, 5 insertions(+), 5 deletions(-)
diff --git a/BALANCE.md b/BALANCE.md
index 677ba13..e7d98f3 100644
--- a/BALANCE.md
+++ b/BALANCE.md
@@ -28,7 +28,7 @@
 |guardian|迷宮の守護者|4d8+14|2d6+2|3|6|75|4d10+20|
 
 HPは出現時に決定、戦闘中の残りHPは非表示。撃破ごとにその時点の生存者全員へ表の経験値を付与（分配なし）。金貨は撃破時に決定。金貨は表のダイス結果÷3を切り捨て。各撃破に5%で武器ドロップ。
-通常編成は `FORMATIONS` の10パターンから等確率で選択。最大3列で、各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。守護者には衛兵2〜3体が随伴。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
+通常編成は同階の非守護者から1〜3列をランダムに選ぶ。守護者戦は守護者を1列目に置き、同階の非守護者から1列を随伴させる。さらに50%で別の随伴列を追加し、最大3列となる。各列は同名の敵の群れ。体数は敵データの `groupSize` で抽選し、スライム2〜4体、衛兵・灰狼・ゴブリン2〜3体、守護者1体。同じ敵種でも別列なら別の群れとして扱う。通常攻撃の対象列はメンバーごとに指定。通常攻撃は指定列の生存している先頭の敵を攻撃。行動前にその列が全滅すると空振り（FC/NES版方式）。列対象の呪文は指定した列だけに作用する。
 
 ## セーブ互換・表示
 
diff --git a/dist/monsters.js b/dist/monsters.js
index 7dd31d1..f897659 100644
--- a/dist/monsters.js
+++ b/dist/monsters.js
@@ -1,4 +1,4 @@
-function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss)return [ENEMIES.find(d=>d.floor===floor&&d.boss).id];return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
+function monsterFormation(boss){let floor=Math.min(3,s.floor||1),pool=ENEMIES.filter(d=>d.floor===floor&&!d.boss);if(boss){let guardian=ENEMIES.find(d=>d.floor===floor&&d.boss);return [guardian.id,pool[Math.random()*pool.length|0].id,...(Math.random()<.5?[pool[Math.random()*pool.length|0].id]:[]) ]}return Array.from({length:1+(Math.random()*3|0)},()=>pool[Math.random()*pool.length|0].id)}
 function monsterHurt(i,n,cmds,name){n=flagDamage(cmds[i]==='guard'?Math.ceil(n/2):n,true);s.hp[i]=Math.max(0,s.hp[i]-n);log(`${name}は${NAMES[i]}に${n}ダメージ。`)}
 function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){log(`${name}はハリトを唱えた。`);monsterHurt(alive[Math.random()*alive.length|0],dice(1,8).value,cmds,name)}return true}return false}
 function monsterOnHit(e,i){let d=enemyDefinition(e.id);for(const a of d.statuses)if(Math.random()<a.chance)afflict(i,a.type);if(Math.random()<d.death){s.hp[i]=0;log(`${NAMES[i]}は急所を突かれた。`);return}if(Math.random()<d.drain&&s.members[i].level>1){let m=s.members[i];m.level--;m.xp=requiredXP(m.level,i);m.maxHP=Math.max(1,m.maxHP-Math.round(memberClass(i).hpGrowth[0]*(memberClass(i).hpGrowth[1]+1)/2+memberClass(i).hpGrowth[2]));m.maxMP=Math.max(0,m.maxMP-Math.round(memberClass(i).mpGrowth[0]*(memberClass(i).mpGrowth[1]+1)/2));m.str=m.baseStr==null?strengthFor(jobOf(i),m.level):Math.min(18,m.baseStr+Math.floor((m.level-1)/5));s.hp[i]=Math.min(s.hp[i],m.maxHP);s.mp[i]=Math.min(s.mp[i],m.maxMP);log(`${NAMES[i]}は1レベルを吸収された。`)}if(Math.random()<d.steal){let slots=s.inventory[i].map((_,n)=>n).filter(n=>!isEquipped(i,n));if(slots.length){let slot=slots[Math.random()*slots.length|0],item=weapon(s.inventory[i][slot]);removeInventorySlot(i,slot);s.itemPlans[i]=null;log(`${NAMES[i]}は${item.name}を奪われた。`)}}}
diff --git a/tests/game.cjs b/tests/game.cjs
index 0d966b0..d3383f7 100644
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -35,7 +35,7 @@ var thresholds=s.members.map(m=>JSON.stringify(m.xpTargets));Math.random=()=>{th
 var previousMembers=s.members;s.members=CLASSES.map(c=>({level:1,xp:0}));Math.random=()=>.5;ensureProgression();if(requiredXP(2,0)!==92||requiredXP(2,2)!==115||requiredXP(2,1)!==138)throw Error('class thresholds');for(let i=0;i<3;i++)for(let lv=2;lv<=30;lv++)if(requiredXP(lv,i)<=requiredXP(lv-1,i))throw Error('nonmonotonic');
 s.members=[{level:8,xp:2900},{level:8,xp:2900},{level:8,xp:2900}];ensureProgression();if(s.members.some(m=>m.level!==8||m.xp!==2900||m.xpTargets[8]!==2800))throw Error('legacy migration');s.members=previousMembers;
 for(let r of [0,.999]){Math.random=()=>r;s.cells[s.pos].type='';encounter(s.pos);if(new Set(s.enemy.units.map(e=>e.uid)).size!==s.enemy.units.length)throw Error('uids');for(let g of enemyGroups()){let range=enemyDefinition(g.id).groupSize;if(g.units.length!==range[r===0?0:1])throw Error('group bound');}if(!drawEnemies().includes('<rect'))throw Error('group drawing');}
-s.cells[s.pos].type='boss';encounter(s.pos);if(s.enemy.units.length!==1||s.enemy.units[0].id!=='guardian')throw Error('floor guardian');
+s.cells[s.pos].type='boss';var formationRolls=[0,.99,0];Math.random=()=>formationRolls.shift()??.99;encounter(s.pos);if(s.enemy.units.length!==3||s.enemy.units[0].id!=='guardian'||s.enemy.units[1].id==='guardian'||s.enemy.units[2].id==='guardian')throw Error('guardian escort formation');
 s.enemy=null;s.cells[s.pos].type='';s.members.forEach((m,i)=>{m.level=1;m.xp=m.xpTargets[2]});var beforeGrowth=s.members.map(m=>m.maxMP);levelUp();if(s.members.some((m,i)=>m.maxMP-beforeGrowth[i]!== (i===0?0:2)))throw Error('MP growth');
 `);drain();console.log('PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth');
 drain();run(`
@@ -76,9 +76,9 @@ drain();run(`
 s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;s.done=false;delete s.cells[s.pos].chest;fresh(1);s.pos=s.boss;
 var lockedFloor=s.floor;if(travelFloor(2)!==false||s.floor!==lockedFloor||s.cells[s.boss].type!=='boss')throw Error('guardian bypass');
 `);drain();run(`
-s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss;encounter(s.boss);s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[0,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
+s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.boss;var guardianTile=s.boss,expectedFormation=monsterFormation(true);if(expectedFormation.length!==2||expectedFormation[0]!=='guardian'||expectedFormation[1]==='guardian')throw Error('guardian escort encounter');Math.random=()=>.999;encounter(s.boss);s.enemy.units.forEach(e=>e.row=e.id==='guardian'?0:1);s.enemy.units.forEach(e=>e.hp=1);s.members[0].attack=999;s.members[1].attack=999;s.members[2].attack=999;s.attackRows=[1,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;
 `);drain();run(`attack()`);drain();run(`if(s.enemy){s.attackRows=[1,1,1];attack()}`);drain();run(`
-if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
+if(!s.enemy||!s.enemy.units.some(e=>e.id==='guardian'&&e.hp>0)||s.relic||s.cells[guardianTile].type!=='boss')throw Error('escort clear must continue guardian battle');s.attackRows=[0,0,0];s.commands=['fight','fight','fight'];attack();`);drain();run(`if(s.enemy||!s.relic||s.cells[guardianTile].type!=='down'||s.boss!==guardianTile||s.pendingStairs!=='down')throw Error('guardian stairs same tile');answerStairs(true);if(s.floor!==2||s.cells[s.boss].type!=='boss'||s.relic)throw Error('next floor guardian');
 s.cells[2].open=true;s.cells[3].flag='power';rememberFloor();var oldFloor2=JSON.stringify(s.cells);travelFloor(1);if(s.cells[s.boss].type!=='down')throw Error('cleared floor retained');s.pos=s.boss;travelFloor(2);if(JSON.stringify(s.cells)!==oldFloor2)throw Error('dungeon roundtrip');
 var inventoryBefore=JSON.stringify(s.inventory),goldBefore=s.gold,xpBefore=s.members.map(m=>m.xp).join();enterTown();if(s.area!=='town'||s.floor!==1||Object.keys(s.floors).length||s.cells.some(c=>c.open||c.flag||c.spent||c.disarmed)||s.cells[s.boss].type!=='boss')throw Error('town reset all floors');if(JSON.stringify(s.inventory)!==inventoryBefore||s.gold!==goldBefore||s.members.map(m=>m.xp).join()!==xpBefore)throw Error('town reset profile');enterDungeon();if(s.cells.filter(c=>c.open).length!==1||!s.cells[s.start].open)throw Error('new expedition');
 `);drain();run(`

codex
差分確認で、既存の階段テストが「最初に倒した対象列」の乱数・隊列に依存しうると分かりました。列IDを明示して随伴だけの撃破を確実に再現できるよう、戦闘状態をテスト内で設定し直します。
exec
/bin/bash -lc "python3 - <<'PY'
p='tests/game.cjs'
s=open(p).read()
s=s.replace(\"s.enemy.units.forEach(e=>e.row=e.id==='guardian'?0:1);s.enemy.units.forEach(e=>e.hp=1);\", \"s.enemy.units.forEach(e=>e.row=e.id==='guardian'?0:1);s.enemy.boss=true;s.enemy.units.forEach(e=>e.hp=1);\")
s=s.replace(\"s.attackRows=[1,1,1];s.commands=['fight','fight','fight'];Math.random=()=>.999;\", \"s.attackRows=s.members.map(()=>1);s.commands=s.members.map(()=> 'fight');Math.random=()=>.999;\")
s=s.replace(\"s.attackRows=[0,0,0];s.commands=['fight','fight','fight'];attack();\", \"s.attackRows=s.members.map(()=>0);s.commands=s.members.map(()=> 'fight');attack();\")
open(p,'w').write(s)
PY
node tests/game.cjs" in /workspace/dungeonsweeper
 succeeded in 213ms:
PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log
PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration
PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling
PASS direct chest, once-only rewards, poison, paralysis, town cure
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

codex
階段経路を含むゲーム回帰テストも通りました。最終確認として共通テスト・シミュレーションを再実行し、キュー運用どおり013をdoneへ移して報告を作成します。
exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 1 --n 100 --boss && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 2 --n 100 --boss && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 100 --boss && node scripts/sim/selftest.cjs' in /workspace/dungeonsweeper
 succeeded in 28165ms:
PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log
PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration
PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling
PASS direct chest, once-only rewards, poison, paralysis, town cure
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
{"winRate":0.95,"wipeRate":0.05,"deathsPerBattle":0.38,"hpLossRate":0.24639053254437868,"averageRounds":9.66}
{"winRate":0.77,"wipeRate":0.23,"deathsPerBattle":1.69,"hpLossRate":0.4910059171597634,"averageRounds":6.78}
{"winRate":0.44,"wipeRate":0.56,"deathsPerBattle":3.63,"hpLossRate":0.7450887573964498,"averageRounds":6.95}
PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout

codex
**013-light-guardian-escort の実装は完了**しました。

- 守護者を先頭に置き、同階の非守護者を1列、50%の確率でさらに1列追加します（計2〜3列）。
- 随伴だけ倒しても戦闘が続き、守護者撃破後に階段化することを回帰テストで確認しました。
- [dist/monsters.js](/workspace/dungeonsweeper/dist/monsters.js)、[tests/game.cjs](/workspace/dungeonsweeper/tests/game.cjs)、[BALANCE.md](/workspace/dungeonsweeper/BALANCE.md)を変更しました。

共通テスト、敵データ整合性チェック、シミュレータ自己テストはすべてPASS。Lv1・6人編成を各階100戦した勝率は、1F 95%、2F 77%、3F 44%でした。ブラウザでの手動確認は未実施です。

キューの `todo` から `done` への移動と報告ファイル作成は、`/workspace/dsw-queue` が読み取り専用のため完了できませんでした。
tokens used
63,458
**013-light-guardian-escort の実装は完了**しました。

- 守護者を先頭に置き、同階の非守護者を1列、50%の確率でさらに1列追加します（計2〜3列）。
- 随伴だけ倒しても戦闘が続き、守護者撃破後に階段化することを回帰テストで確認しました。
- [dist/monsters.js](/workspace/dungeonsweeper/dist/monsters.js)、[tests/game.cjs](/workspace/dungeonsweeper/tests/game.cjs)、[BALANCE.md](/workspace/dungeonsweeper/BALANCE.md)を変更しました。

共通テスト、敵データ整合性チェック、シミュレータ自己テストはすべてPASS。Lv1・6人編成を各階100戦した勝率は、1F 95%、2F 77%、3F 44%でした。ブラウザでの手動確認は未実施です。

キューの `todo` から `done` への移動と報告ファイル作成は、`/workspace/dsw-queue` が読み取り専用のため完了できませんでした。
