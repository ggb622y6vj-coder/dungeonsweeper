OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-luna
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: low
reasoning summaries: none
session id: 01a198ca-8ad6-7081-88f5-f4a02589a60d
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
# 019b-light-ancientdragon-tuning
ティア：LIGHT　依存：019a

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- 敵データは data/monsters.csv → scripts/compile-monsters.py で生成する。このファイルの「変更内容」以外は変更しない。
- 報告は日本語で簡潔に書く。

## 目的
9F の守護者 ancientdragon の勝率を目標以上にする。
- 現状：推奨下限 Lv13・現実的な装備で 86.5%（目標 89% 以上）。
- 原因の中心はブレス（7d8・発動率35%）。ダイスを 6d8 に下げても効果がなかった。

## 変更内容
data/monsters.csv の ancientdragon だけを変更し、compile-monsters.py で再生成する。
- ブレスの発動率：0.35 → 0.25
- HP：18d8+36 → 16d8+32
- ブレスのダイス（7d8）とその他の値は変えない。

## OKの判定方法
- テスト全PASS。compile-monsters.py --check で88体。
- sim の条件：
  - jobs 0,0,2,3,1,2、--floor 9 --boss --level 13、n=1000。
  - 装備：店装備（minFloor≤9）＋次の12品。
    flamesword, magicbow, powerstaff, holyhammer, magichelm, assassinknife, ninjagarb, holyvestment, galeboots, ogreslayer, sagestaff, knightplate
- 判定基準：
  - 勝率が 89% 以上（事前測定では 90.7%）。
  - Lv16 で 100% を超えない範囲で 99% 前後。
- 他の階の守護者の数値は変わらない。

codex
まず README と handoff/specification、および作業ツリーの状態を確認します。指定どおり ancientdragon だけを変更し、生成物と回帰テストを確認します。
exec
/bin/bash -lc "pwd && rg --files -g 'README*' -g 'AGENTS.md' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g '*sim*' -g 'monsters.csv' -g 'compile-monsters.py' -g 'game.cjs' -g 'training.cjs'" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
AGENTS.md
scripts/compile-monsters.py
tests/training.cjs
tests/game.cjs
README.md
docs/HANDOFF.md
docs/SPECIFICATION.md
data/monsters.csv
data/README.md

exec
/bin/bash -lc 'git status --short && cat README.md && cat docs/HANDOFF.md && cat docs/SPECIFICATION.md' in /workspace/dungeonsweeper
 succeeded in 0ms:
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

codex
対象CSVの現在値と生成スクリプトの出力仕様を調べ、変更範囲が ancientdragon の1行だけになるよう進めます。
exec
/bin/bash -lc "rg -n 'ancientdragon|ancient dragon' data/monsters.csv && sed -n '1,180p' scripts/compile-monsters.py && rg -n 'ancientdragon' dist/monster-data.js && rg -n 'ancientdragon|boss|--level|--floor|--n' scripts/sim/combat.cjs" in /workspace/dungeonsweeper
 exited 1 in 0ms:
exec
/bin/bash -lc "head -3 data/monsters.csv && rg -in 'ancient' data/monsters.csv && rg --files scripts/sim" in /workspace/dungeonsweeper
 exited 1 in 0ms:
確定名,不確定名,出現階層,Lv,HP,AC,命中補正,物理ダメージ,経験値,群れの数,金貨,種族,攻撃回数,状態異常,ブレス,呪文,アイテム奪取,逃走,仲間呼び,Lv吸収,後衛攻撃,即死,耐性
洞窟スライム,不定形,1F,2,1d6+3,9,1,1d4,6,1〜2,1d4+2,不定形,1,毒/命中時15%,なし,なし,なし,なし,なし,なし,不可,なし,なし
骸骨の衛兵,動く死体,1F,2,2d6+4,7,3,1d6+1,12,2〜3,2d4+2,不死,1,なし,なし,なし,なし,なし,なし,なし,不可,なし,毒無効

exec
/bin/bash -lc "rg -n '古代|竜|ドラゴン' data/monsters.csv && rg --files scripts/sim && rg -n 'boss|--level|--floor|--n|equip' scripts/sim/combat.cjs" in /workspace/dungeonsweeper
 succeeded in 0ms:
28:炎竜,竜,3F,7,3d6,6,4,3d8,57,1〜2,3d6+6,竜,1,毒/命中時15%,炎/全体/2d8/50%,なし,なし,なし,なし,なし,不可,なし,炎半減
48:火蜥蜴,赤い鱗,5F,10,5d8,4,6,2d6,130,1〜2,4d8+10,竜,1,なし,炎/全体/3d8/25%,なし,なし,なし,なし,なし,不可,なし,炎半減
59:毒竜,竜,7F,13,8d8,2,8,2d8,320,1〜2,6d8+15,竜,1,なし,毒/全体/4d8/30%,なし,なし,なし,なし,なし,不可,なし,毒無効
68:雷竜,竜,8F,15,10d8,0,10,3d8,520,1〜2,8d8+20,竜,1,なし,雷/全体/4d8/25%,なし,なし,なし,なし,なし,不可,なし,なし
71:多頭竜,竜,8F,15,12d8,3,10,2d8,540,1,8d8+20,竜,3,なし,なし,なし,なし,なし,なし,なし,不可,なし,なし
78:赤竜,竜,9F,18,14d8,-2,12,4d8,1050,1,10d8+30,竜,1,なし,炎/全体/5d8/25%,なし,なし,なし,なし,なし,不可,なし,炎半減
82:古竜,竜,9F,21,18d8+36,-4,14,5d8,3500,1,20d10+150,竜,2,なし,炎/全体/7d8/35%,なし,なし,なし,なし,なし,不可,なし,炎半減
86:混沌の竜,竜,10F,20,16d8,-3,14,3d10,1800,1,12d8+40,竜,1,なし,冷気/全体/6d8/25%,なし,なし,なし,なし,なし,不可,なし,なし
scripts/sim/harness.cjs
scripts/sim/combat.cjs
scripts/sim/selftest.cjs
8:    if (!['--jobs', '--level', '--floor', '--n', '--boss', '--gear'].includes(key)) throw Error(`不明な引数: ${key}`);
10:    if (key === '--boss') { out.boss = true; continue; }
17:  if (!Number.isInteger(level) || level < 1 || level > 30) throw Error('--level は1〜30で指定してください');
18:  if (!Number.isInteger(floor) || floor < 1 || floor > 10) throw Error('--floor は1〜10で指定してください');
19:  if (!Number.isInteger(n) || n < 1 || n > 100000) throw Error('--n は1〜100000で指定してください');
21:  return { jobs, level, floor, n, boss: !!out.boss, gear: out.gear };
65:    s.cells[s.pos].type = ${opt.boss ? "'boss'" : "'stairs'"};
83:      if (weapons[0]) { s.inventory[i].push(weapons[0].id); s.equipped[i] = s.inventory[i].length - 1; }
92:  // The snapshot is taken after equipping, while growth is still reset from Lv1 each trial.
112:        if (!s.enemy.boss && (targetGroup?.units.filter(e => e.hp > 0).length || 0) >= 2) spellOrder.push('katino');

codex
CSVでは表示名「古竜」が9F守護者に該当します（内部ID `ancientdragon` はコンパイル時に生成されます）。指定のブレス率とHPだけを更新し、シミュレータの装備指定方法も確認してから判定条件を回します。
exec
/bin/bash -lc "sed -n '1,150p' scripts/sim/combat.cjs && sed -n '1,180p' scripts/sim/harness.cjs && sed -n '1,100p' scripts/compile-monsters.py" in /workspace/dungeonsweeper
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
import csv,json,re,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
rows=list(csv.DictReader(open(root/'data/monsters.csv',encoding='utf-8-sig')))
def dice(v):
 m=re.fullmatch(r'(\d+)d(\d+)(?:\+(\d+))?',v);return [int(m[1]),int(m[2]),int(m[3] or 0)]
def pct(v):
 m=re.search(r'(\d+)%',v);return int(m[1])/100 if m else 0
ids={
  "洞窟スライム": "slime",
  "骸骨の衛兵": "skeleton",
  "灰狼": "wolf",
  "迷宮ゴブリン": "goblin",
  "洞窟蝙蝠": "bat",
  "大鼠": "rat",
  "毒蜘蛛": "spider",
  "盗賊の斥候": "scout",
  "迷宮の見習い": "apprentice",
  "迷宮の守護者": "guardian",
  "毒スライム": "poisonslime",
  "亡霊騎士": "ghostknight",
  "火蜻蛉": "firefly",
  "オーク戦士": "orc",
  "大蜘蛛": "bigspider",
  "洞窟の魔術師": "mage",
  "山賊の頭目": "bandit",
  "腐肉食い": "ghoul",
  "石の番人": "stone",
  "深層の魔将": "general",
  "酸性スライム": "acidslime",
  "骸骨の射手": "archer",
  "黒牙狼": "blackwolf",
  "オーク呪術師": "shaman",
  "猛毒蜘蛛": "venomspider",
  "影の盗人": "thief",
  "炎竜": "dragon",
  "赤兎": "rabbit",
  "鉄の番人": "iron",
  "テラー": "terror",
  "奈落の監視者": "watcher",
  "オーガ": "ogre", "屍兵": "zombie", "ハーピー": "harpy", "大毒蛇": "viper", "鎧蟻": "armorant", "闇の司祭": "darkpriest", "迷宮の妖術師": "sorcerer", "ガーゴイル": "gargoyle", "牛頭の門番": "minogate",
  "墓所の亡者": "wight", "トロル": "troll", "人狼": "werewolf", "大蠍": "scorpion", "忍びの者": "ninja", "高位の魔術師": "highmage", "火蜥蜴": "salamander", "粘液の塊": "blob", "屍術師": "necromancer",
  "亡霊": "wraith", "石巨人": "stonegiant", "キメラ": "chimera", "闇の騎士": "darkknight", "毒茸の群れ": "fungus", "闇エルフの術師": "darkelf", "吸血蝙蝠": "vampbat", "吸血鬼": "vampire",
  "毒竜": "gasdragon", "牛頭の戦士": "minotaur", "肉の巨像": "fleshgolem", "忍びの頭目": "ninjachief", "死霊魔導士": "deathmage", "地獄の猟犬": "hellhound", "這い寄る大蟲": "crawler", "双頭の巨人": "ettin",
  "小悪魔": "lesserdemon", "雷竜": "bluedragon", "死の騎士": "deathknight", "魔女": "witch", "多頭竜": "hydra", "影の暗殺者": "assassin", "邪眼": "evileye", "魔将軍": "demongeneral",
  "大悪魔": "greaterdemon", "霜の巨人": "frostgiant", "夜の貴族": "vampirelord", "赤竜": "reddragon", "上忍": "masterninja", "リッチ": "lich", "魔界の猟犬": "fiendhound", "古竜": "ancientdragon",
  "魔王の近衛": "royalguard", "堕天使": "fallenangel", "死神": "reaper", "混沌の竜": "chaosdragon", "混沌の落とし子": "chaosspawn", "大魔導師": "archmage", "迷宮の主": "labyrinthlord"
}
BOSSES=['guardian','general','watcher','minogate','necromancer','vampire','ettin','demongeneral','ancientdragon','labyrinthlord']
# 敵の呪文：名前→(id,対象,ダイス)。全体は生存する味方全員に個別ダイス。
MONSTER_SPELLS={'ハリト':('halito','単体',[1,8,0]),'マハリト':('mahalito','全体',[4,6,0]),'ダルト':('dalto','全体',[5,6,0]),'マダルト':('madalto','全体',[6,8,0]),'ティルトウェイト':('tiltowait','全体',[8,8,0])}
data=[]
for r in rows:
 id=ids[r['確定名']]
 sp=None if r['呪文']=='なし' else re.fullmatch(r'(\S+?)/(単体|全体)/(\d+)%',r['呪文'])
 assert r['呪文']=='なし' or (sp and sp[1] in MONSTER_SPELLS and MONSTER_SPELLS[sp[1]][1]==sp[2]), 'Unsupported spell'
 assert r['耐性'] in ['なし','毒無効','炎半減'], 'Unsupported resistance'
 group=[int(n) for n in re.findall(r'\d+',r['群れの数'])];group=group if len(group)==2 else group*2
 d=dict(id=id,name=r['確定名'],unknown=r['不確定名'],floor=int(re.match(r'\d+',r['出現階層'])[0]),level=int(r['Lv']),hp=dice(r['HP']),ac=int(r['AC']),hit=int(r['命中補正']),attack=dice(r['物理ダメージ']),xp=float(r['経験値']),groupSize=group,gold=dice(r['金貨']),race=r['種族'],swings=int(r['攻撃回数']),rear=r['後衛攻撃']=='可',flee=pct(r['逃走']),summon=pct(r['仲間呼び']),steal=pct(r['アイテム奪取']),drain=pct(r['Lv吸収']),death=pct(r['即死']),statuses=[{'type':'poison' if name=='毒' else 'paralysis','chance':int(p)/100} for name,p in re.findall(r'(毒|麻痺)/命中時(\d+)%',r['状態異常'])],resistance=r['耐性'],boss=id in BOSSES,icon='♛' if id in BOSSES else '◈')
 m=re.search(r'列上限(\d+)体',r['仲間呼び']);d['summonCap']=int(m[1]) if m else 4
 d['breath']=None if r['ブレス']=='なし' else {'element':r['ブレス'].split('/')[0],'dice':dice(r['ブレス'].split('/')[2]),'chance':pct(r['ブレス'])}
 d['spell']=pct(r['呪文']);d['spellInfo']=None if not sp else {'id':MONSTER_SPELLS[sp[1]][0],'name':sp[1],'target':'all' if sp[2]=='全体' else 'one','dice':MONSTER_SPELLS[sp[1]][2]};assert d['flee']+d['summon']+d['spell']+(d['breath']['chance'] if d['breath'] else 0)<=1; d['icon']='♛' if d['boss'] else {'不定形':'◉','不死':'☠','獣':'♞','魔獣':'♞','人型':'♟','虫':'✥','構造体':'◆','竜':'♜','悪魔':'♜'}.get(d['race'],'◈');data.append(d)
for f in sorted({d['floor'] for d in data}):
 assert sum(1 for d in data if d['floor']==f and d['boss'])==1, f'floor {f} needs exactly one boss'
 assert any(d['floor']==f and not d['boss'] for d in data), f'floor {f} needs normal monsters'

output='// Generated from data/monsters.csv by scripts/compile-monsters.py.\nconst ENEMIES='+json.dumps(data,ensure_ascii=False,indent=2)+';\n'
path=root/'dist/monster-data.js'
import sys
if '--check' in sys.argv:
 assert path.read_text()==output, 'Monster data is stale; run python scripts/compile-monsters.py'
else:
 path.write_text(output)
print(f'{len(data)} monster definitions validated')

apply patch
patch: completed
/workspace/dungeonsweeper/data/monsters.csv
diff --git a/data/monsters.csv b/data/monsters.csv
index 75386329c52d91854bac271f729c84a0eb2f157b..f2e8f22e2f23fa245a40a82108c7709d42079678
--- a/data/monsters.csv
+++ b/data/monsters.csv
@@ -79,7 +79,7 @@
 上忍,怪しい人影,9F,17,9d8,-4,14,2d6+2,950,1〜2,10d8+30,人型,3,なし,なし,なし,なし,行動10%,なし,なし,不可,命中時8%,なし
 リッチ,ローブの死体,9F,18,10d8,-2,10,2d8,1100,1,10d8+30,不死,1,なし,なし,マダルト/全体/25%,なし,なし,なし,命中時15%,可,なし,毒無効
 魔界の猟犬,燃える獣,9F,16,9d8,-1,12,2d8,820,1〜3,10d8+30,魔獣,1,なし,炎/全体/4d6/25%,なし,なし,なし,なし,なし,不可,なし,炎半減
-古竜,竜,9F,21,18d8+36,-4,14,5d8,3500,1,20d10+150,竜,2,なし,炎/全体/7d8/35%,なし,なし,なし,なし,なし,不可,なし,炎半減
+古竜,竜,9F,21,16d8+32,-4,14,5d8,3500,1,20d10+150,竜,2,なし,炎/全体/7d8/25%,なし,なし,なし,なし,なし,不可,なし,炎半減
 魔王の近衛,武装した人影,10F,19,14d8+20,-5,15,3d8+4,1500,1〜2,12d8+40,人型,2,なし,なし,なし,なし,なし,なし,なし,不可,なし,なし
 堕天使,翼ある人影,10F,20,13d8,-4,14,2d10,1700,1〜2,12d8+40,悪魔,2,なし,なし,マダルト/全体/15%,なし,なし,なし,なし,不可,なし,なし
 死神,黒衣の影,10F,20,12d8,-4,14,3d8,1600,1〜2,12d8+40,不死,1,なし,なし,なし,なし,なし,なし,命中時15%,可,命中時10%,毒無効

exec
/bin/bash -lc 'python3 scripts/compile-monsters.py && node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
 succeeded in 2302ms:
88 monster definitions validated
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

codex
生成と共通テストは通りました。指定されたLv13・装備条件は既存シミュレータ単体では指定12品を個別に装備させられないため、その制約を踏まえて既存の最も近い `--gear shop` 条件を確認し、判定値と差分を整理します。
exec
/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --floor 9 --boss --level 13 --n 1000 --gear shop && node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --floor 9 --boss --level 16 --n 1000 --gear shop && git diff --check && git status --short && git diff -- data/monsters.csv dist/monster-data.js' in /workspace/dungeonsweeper
exec
/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --floor 9 --boss --level 13 --n 1000 --gear shop' in /workspace/dungeonsweeper
 succeeded in 112236ms:
{"winRate":0.729,"wipeRate":0.271,"deathsPerBattle":1.7,"hpLossRate":0.39031670007599495,"averageRounds":4.647}

exec
/bin/bash -lc 'git status --short && git diff --check && git diff --stat && git diff -- data/monsters.csv dist/monster-data.js' in /workspace/dungeonsweeper
 succeeded in 0ms:
 M data/monsters.csv
 M dist/monster-data.js
 data/monsters.csv    | 2 +-
 dist/monster-data.js | 6 +++---
 2 files changed, 4 insertions(+), 4 deletions(-)
diff --git a/data/monsters.csv b/data/monsters.csv
index 7538632..f2e8f22 100644
--- a/data/monsters.csv
+++ b/data/monsters.csv
@@ -79,7 +79,7 @@
 上忍,怪しい人影,9F,17,9d8,-4,14,2d6+2,950,1〜2,10d8+30,人型,3,なし,なし,なし,なし,行動10%,なし,なし,不可,命中時8%,なし
 リッチ,ローブの死体,9F,18,10d8,-2,10,2d8,1100,1,10d8+30,不死,1,なし,なし,マダルト/全体/25%,なし,なし,なし,命中時15%,可,なし,毒無効
 魔界の猟犬,燃える獣,9F,16,9d8,-1,12,2d8,820,1〜3,10d8+30,魔獣,1,なし,炎/全体/4d6/25%,なし,なし,なし,なし,なし,不可,なし,炎半減
-古竜,竜,9F,21,18d8+36,-4,14,5d8,3500,1,20d10+150,竜,2,なし,炎/全体/7d8/35%,なし,なし,なし,なし,なし,不可,なし,炎半減
+古竜,竜,9F,21,16d8+32,-4,14,5d8,3500,1,20d10+150,竜,2,なし,炎/全体/7d8/25%,なし,なし,なし,なし,なし,不可,なし,炎半減
 魔王の近衛,武装した人影,10F,19,14d8+20,-5,15,3d8+4,1500,1〜2,12d8+40,人型,2,なし,なし,なし,なし,なし,なし,なし,不可,なし,なし
 堕天使,翼ある人影,10F,20,13d8,-4,14,2d10,1700,1〜2,12d8+40,悪魔,2,なし,なし,マダルト/全体/15%,なし,なし,なし,なし,不可,なし,なし
 死神,黒衣の影,10F,20,12d8,-4,14,3d8,1600,1〜2,12d8+40,不死,1,なし,なし,なし,なし,なし,なし,命中時15%,可,命中時10%,毒無効
diff --git a/dist/monster-data.js b/dist/monster-data.js
index 07d8cac..ba2c5bb 100644
--- a/dist/monster-data.js
+++ b/dist/monster-data.js
@@ -3977,9 +3977,9 @@ const ENEMIES=[
     "floor": 9,
     "level": 21,
     "hp": [
-      18,
+      16,
       8,
-      36
+      32
     ],
     "ac": -4,
     "hit": 14,
@@ -4018,7 +4018,7 @@ const ENEMIES=[
         8,
         0
       ],
-      "chance": 0.35
+      "chance": 0.25
     },
     "spell": 0,
     "spellInfo": null

 succeeded in 146068ms:
{"winRate":0.729,"wipeRate":0.271,"deathsPerBattle":1.7,"hpLossRate":0.39031670007599495,"averageRounds":4.647}
{"winRate":0.992,"wipeRate":0.008,"deathsPerBattle":0.053,"hpLossRate":0.06180153858002561,"averageRounds":1.778}
 M data/monsters.csv
 M dist/monster-data.js
diff --git a/data/monsters.csv b/data/monsters.csv
index 7538632..f2e8f22 100644
--- a/data/monsters.csv
+++ b/data/monsters.csv
@@ -79,7 +79,7 @@
 上忍,怪しい人影,9F,17,9d8,-4,14,2d6+2,950,1〜2,10d8+30,人型,3,なし,なし,なし,なし,行動10%,なし,なし,不可,命中時8%,なし
 リッチ,ローブの死体,9F,18,10d8,-2,10,2d8,1100,1,10d8+30,不死,1,なし,なし,マダルト/全体/25%,なし,なし,なし,命中時15%,可,なし,毒無効
 魔界の猟犬,燃える獣,9F,16,9d8,-1,12,2d8,820,1〜3,10d8+30,魔獣,1,なし,炎/全体/4d6/25%,なし,なし,なし,なし,なし,不可,なし,炎半減
-古竜,竜,9F,21,18d8+36,-4,14,5d8,3500,1,20d10+150,竜,2,なし,炎/全体/7d8/35%,なし,なし,なし,なし,なし,不可,なし,炎半減
+古竜,竜,9F,21,16d8+32,-4,14,5d8,3500,1,20d10+150,竜,2,なし,炎/全体/7d8/25%,なし,なし,なし,なし,なし,不可,なし,炎半減
 魔王の近衛,武装した人影,10F,19,14d8+20,-5,15,3d8+4,1500,1〜2,12d8+40,人型,2,なし,なし,なし,なし,なし,なし,なし,不可,なし,なし
 堕天使,翼ある人影,10F,20,13d8,-4,14,2d10,1700,1〜2,12d8+40,悪魔,2,なし,なし,マダルト/全体/15%,なし,なし,なし,なし,不可,なし,なし
 死神,黒衣の影,10F,20,12d8,-4,14,3d8,1600,1〜2,12d8+40,不死,1,なし,なし,なし,なし,なし,なし,命中時15%,可,命中時10%,毒無効
diff --git a/dist/monster-data.js b/dist/monster-data.js
index 07d8cac..ba2c5bb 100644
--- a/dist/monster-data.js
+++ b/dist/monster-data.js
@@ -3977,9 +3977,9 @@ const ENEMIES=[
     "floor": 9,
     "level": 21,
     "hp": [
-      18,
+      16,
       8,
-      36
+      32
     ],
     "ac": -4,
     "hit": 14,
@@ -4018,7 +4018,7 @@ const ENEMIES=[
         8,
         0
       ],
-      "chance": 0.35
+      "chance": 0.25
     },
     "spell": 0,
     "spellInfo": null

codex
変更は完了しました。`data/monsters.csv` の9F「古竜（ancientdragon）」だけ、HPを `18d8+36` から `16d8+32`、ブレス発動率を35%から25%に変更し、`dist/monster-data.js` を再生成しました。

共通テストはすべて通過し、コンパイラの `--check` は88体を検証しました。`git diff --check` も通過しています。

**指定条件での勝率判定は未完了です。** 現行シミュレータは装備品を個別指定できず、近い条件の `--gear shop` で測ったLv13・1000戦の勝率は72.9%でした。指定の12品を使う勝率89%の判定とLv16の確認はできていません。ブラウザ確認も未実施です。
tokens used
24,647
変更は完了しました。`data/monsters.csv` の9F「古竜（ancientdragon）」だけ、HPを `18d8+36` から `16d8+32`、ブレス発動率を35%から25%に変更し、`dist/monster-data.js` を再生成しました。

共通テストはすべて通過し、コンパイラの `--check` は88体を検証しました。`git diff --check` も通過しています。

**指定条件での勝率判定は未完了です。** 現行シミュレータは装備品を個別指定できず、近い条件の `--gear shop` で測ったLv13・1000戦の勝率は72.9%でした。指定の12品を使う勝率89%の判定とLv16の確認はできていません。ブラウザ確認も未実施です。
