OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-astra
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: high
reasoning summaries: none
session id: 01a19901-9bcf-78b3-b668-7b87f52afb21
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
# 021-heavy-temple
ティア：HEAVY　依存：020

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【死亡・灰・ロスト 手順2/3】町に寺院を作り、死亡/灰を蘇生できるようにする。

## 変更内容
- dist/index.html：町に「寺院」ボタンと `<dialog id="templedialog">`（鍛冶屋dialogの構造を踏襲）。
- dist/game.js に新規：`templeCost(m)`（dead: 100×Lv、ash: 250×Lv）、`templeChance(m)`（dead: clamp(50+3×Lv,50,95)%、ash: clamp(40+3×Lv,40,90)%）、`templeRaise(id)`（金貨を引き、成功→'ok'・HP1、失敗→deadは'ash'、ashは'lost'。結果を返す）、`renderTemple()`（パーティ＋控えの dead/ash を一覧、費用・ボタン、金貨不足はdisabled、結果を通知欄に表示）。
- 町でのみ実行可（s.area==='town' && idle()）。docsに式を「本作の暫定式」として記載。
- 触らない：020の判定ロジック、戦闘、XP。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト（Math.random 固定）：dead成功→ok/HP1、dead失敗→ash、ash成功→ok、ash失敗→lost。費用が正しく引かれ、不足時は不可。控えのメンバーも対象。
- 手動：死亡者を作り帰還→寺院で蘇生→迷宮に入れること。

codex
021の寺院追加を進めます。既存の死亡状態・町の画面構成・セーブ処理を確認し、実装と回帰テストまで行います。環境確認には cloud-environment-runtime スキルを使います。

exec
/bin/bash -lc "pwd && rg --files -g 'AGENTS.md' -g 'README*' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g '*021*' -g '*temple*' /workspace/dungeonsweeper /workspace/dsw-queue 2>/dev/null" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
/workspace/dsw-queue/README-handoff.md
/workspace/dsw-queue/report/021-heavy-temple-codex-output.md
/workspace/dsw-queue/todo/021-heavy-temple.md
/workspace/dungeonsweeper/README.md
/workspace/dungeonsweeper/docs/HANDOFF.md
/workspace/dungeonsweeper/docs/SPECIFICATION.md
/workspace/dungeonsweeper/AGENTS.md
/workspace/dungeonsweeper/data/README.md

exec
/bin/bash -lc 'cat /home/box/.codex/plugins/cache/openai-curated-remote/cloud-environment/0.1.2/skills/runtime/SKILL.md' in /workspace/dungeonsweeper
 succeeded in 0ms:
---
name: cloud-environment-runtime
description: Read at the start of work in a managed cloud environment. Inspect network policy and configured credentials; build and run Docker containers with the session proxy and CA trust; use Tailscale VPN access, configure TCP forwarding, and diagnose access failures.
---

Read this skill at the start of work in a managed cloud environment, including
resumed work. Before building or running Docker containers, read
[Docker in Docker](references/docker.md) and follow its proxy and CA guidance.

Use `cloud_environment.environment_status` at the start of work in a managed cloud
environment and when diagnosing network or authentication failures. It takes no
arguments. The runtime selects the instance and checks access as the task's actor.
The result describes the thread's managed instance; it does not describe extra
attached environments or the latest editable configuration draft.

Before network work, read [Cloud environment networking](references/networking.md)
and inspect the selected executor's `/etc/codex/network-policy.json`. If the
supported policy snapshot reports `vpn_configured: true`, also read
[Tailscale VPN access](references/vpn.md). The flag indicates configuration,
not VPN health. Also read the VPN reference when explicitly diagnosing VPN access,
even if the flag is missing or false. `environment_status` reports HTTP policy
and credential readiness, not TCP grants or VPN health.

Use the returned network policy, secret bindings, runtime variable names, and
outbound identity aliases to plan commands. Do not print credential values, dump
the process environment, or inspect secret files to discover their contents.
A configured variable may hold a proxy placeholder; that alone does not mean its
credential is missing. Use the configured SDK or CLI normally.

Treat desired configuration and observed readiness separately. Require
`observations_current: true` and the individual state `ready` before treating a
secret, runtime variable, or outbound identity as ready. Network policy is applied
only when its current state is `enforced`. Missing or any other states, including
`skipped` and `unsupported`, do not establish readiness. Recheck after setup
completes. Ready observations describe setup, not guaranteed authorization for
every remote API call. Diagnose the actual command's error too.

For CLI or SDK profile selection, read the worker's non-secret JSON manifest at
`OIC_MANIFEST_PATH`, if present. Version 1 contains a `connections` list. Select
the entry whose `alias` matches the identity needed for the task; `is_default`
identifies the provider's default, not necessarily the intended identity. Use the
selected entry's fields to set these environment variables for that command only:

| `provider_kind` | Environment variable ← manifest field |
| --- | --- |
| `azure` | `IDENTITY_ENDPOINT` ← `identity_endpoint`; `AZURE_CONFIG_DIR` ← `config_dir` |
| `aws` | `AWS_PROFILE` ← `alias`; `AWS_CONFIG_FILE` ← `config_file` |
| `gcp` | `CLOUDSDK_CONFIG` ← `config_dir`; `CLOUDSDK_ACTIVE_CONFIG_NAME` ← `configuration_name`; `GOOGLE_APPLICATION_CREDENTIALS` ← `credentials_file` |

Preserve the inherited runtime authentication headers and guard variables. Use
credential file paths as selectors without reading or printing their contents.
Do not invent aliases, replace injected credentials, or start interactive login
merely because a token is not visible. Inspect the entry's `setup` outcome when
diagnosing CLI failures; a warning does not establish successful CLI setup. If
the manifest version, required entry, or selector fields are unavailable or
unsupported, report the missing setup instead of silently using another identity.

This plugin reads runtime context. Configuration changes require the environment
configuration workflow and its user review. If the tool reports no attached
managed environment, do not reuse an instance ID or readiness result from a prior
turn.

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
町帰還時に経験値が足りていれば複数回レベルアップ。Lv上限30。HP/MP成長は職業別ダイス、ACはレベルアップで変化しない。帰還で正常なメンバーのみHP/MPを全快し、レベルアップ結果はポップアップ。
死亡状態は本作の暫定仕様。メンバーの `status` は `ok`（正常）・`dead`（死亡）・`ash`（灰）・`lost`（ロスト）。HPが0になると正常から死亡へ移行し、死亡・灰・ロストは帰還後もHP0のまま、MPも回復しない。帰還時の毒・麻痺解除は全員が対象。状態タグはログのスナップショットに同期して「死亡」「灰」「ロスト」を表示する。正常以外のメンバーがいるパーティーは迷宮に入れず、酒場で外す必要がある。寺院と灰・ロストへの移行はまだ未実装。
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
/bin/bash -lc 'git status --short && cat /workspace/dsw-queue/README-handoff.md /workspace/dsw-queue/todo/021-heavy-temple.md /workspace/dsw-queue/report/021-heavy-temple-codex-output.md' in /workspace/dungeonsweeper
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
# 021-heavy-temple
ティア：HEAVY　依存：020

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【死亡・灰・ロスト 手順2/3】町に寺院を作り、死亡/灰を蘇生できるようにする。

## 変更内容
- dist/index.html：町に「寺院」ボタンと `<dialog id="templedialog">`（鍛冶屋dialogの構造を踏襲）。
- dist/game.js に新規：`templeCost(m)`（dead: 100×Lv、ash: 250×Lv）、`templeChance(m)`（dead: clamp(50+3×Lv,50,95)%、ash: clamp(40+3×Lv,40,90)%）、`templeRaise(id)`（金貨を引き、成功→'ok'・HP1、失敗→deadは'ash'、ashは'lost'。結果を返す）、`renderTemple()`（パーティ＋控えの dead/ash を一覧、費用・ボタン、金貨不足はdisabled、結果を通知欄に表示）。
- 町でのみ実行可（s.area==='town' && idle()）。docsに式を「本作の暫定式」として記載。
- 触らない：020の判定ロジック、戦闘、XP。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト（Math.random 固定）：dead成功→ok/HP1、dead失敗→ash、ash成功→ok、ash失敗→lost。費用が正しく引かれ、不足時は不可。控えのメンバーも対象。
- 手動：死亡者を作り帰還→寺院で蘇生→迷宮に入れること。
OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6-astra
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: high
reasoning summaries: none
session id: 01a19901-9bcf-78b3-b668-7b87f52afb21
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
# 021-heavy-temple
ティア：HEAVY　依存：020

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【死亡・灰・ロスト 手順2/3】町に寺院を作り、死亡/灰を蘇生できるようにする。

## 変更内容
- dist/index.html：町に「寺院」ボタンと `<dialog id="templedialog">`（鍛冶屋dialogの構造を踏襲）。
- dist/game.js に新規：`templeCost(m)`（dead: 100×Lv、ash: 250×Lv）、`templeChance(m)`（dead: clamp(50+3×Lv,50,95)%、ash: clamp(40+3×Lv,40,90)%）、`templeRaise(id)`（金貨を引き、成功→'ok'・HP1、失敗→deadは'ash'、ashは'lost'。結果を返す）、`renderTemple()`（パーティ＋控えの dead/ash を一覧、費用・ボタン、金貨不足はdisabled、結果を通知欄に表示）。
- 町でのみ実行可（s.area==='town' && idle()）。docsに式を「本作の暫定式」として記載。
- 触らない：020の判定ロジック、戦闘、XP。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト（Math.random 固定）：dead成功→ok/HP1、dead失敗→ash、ash成功→ok、ash失敗→lost。費用が正しく引かれ、不足時は不可。控えのメンバーも対象。
- 手動：死亡者を作り帰還→寺院で蘇生→迷宮に入れること。

codex
021の寺院追加を進めます。既存の死亡状態・町の画面構成・セーブ処理を確認し、実装と回帰テストまで行います。環境確認には cloud-environment-runtime スキルを使います。

exec
/bin/bash -lc "pwd && rg --files -g 'AGENTS.md' -g 'README*' -g 'HANDOFF.md' -g 'SPECIFICATION.md' -g '*021*' -g '*temple*' /workspace/dungeonsweeper /workspace/dsw-queue 2>/dev/null" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
/workspace/dsw-queue/README-handoff.md
/workspace/dsw-queue/report/021-heavy-temple-codex-output.md
/workspace/dsw-queue/todo/021-heavy-temple.md
/workspace/dungeonsweeper/README.md
/workspace/dungeonsweeper/docs/HANDOFF.md
/workspace/dungeonsweeper/docs/SPECIFICATION.md
/workspace/dungeonsweeper/AGENTS.md
/workspace/dungeonsweeper/data/README.md

exec
/bin/bash -lc 'cat /home/box/.codex/plugins/cache/openai-curated-remote/cloud-environment/0.1.2/skills/runtime/SKILL.md' in /workspace/dungeonsweeper
 succeeded in 0ms:
---
name: cloud-environment-runtime
description: Read at the start of work in a managed cloud environment. Inspect network policy and configured credentials; build and run Docker containers with the session proxy and CA trust; use Tailscale VPN access, configure TCP forwarding, and diagnose access failures.
---

Read this skill at the start of work in a managed cloud environment, including
resumed work. Before building or running Docker containers, read
[Docker in Docker](references/docker.md) and follow its proxy and CA guidance.

Use `cloud_environment.environment_status` at the start of work in a managed cloud
environment and when diagnosing network or authentication failures. It takes no
arguments. The runtime selects the instance and checks access as the task's actor.
The result describes the thread's managed instance; it does not describe extra
attached environments or the latest editable configuration draft.

Before network work, read [Cloud environment networking](references/networking.md)
and inspect the selected executor's `/etc/codex/network-policy.json`. If the
supported policy snapshot reports `vpn_configured: true`, also read
[Tailscale VPN access](references/vpn.md). The flag indicates configuration,
not VPN health. Also read the VPN reference when explicitly diagnosing VPN access,
even if the flag is missing or false. `environment_status` reports HTTP policy
and credential readiness, not TCP grants or VPN health.

Use the returned network policy, secret bindings, runtime variable names, and
outbound identity aliases to plan commands. Do not print credential values, dump
the process environment, or inspect secret files to discover their contents.
A configured variable may hold a proxy placeholder; that alone does not mean its
credential is missing. Use the configured SDK or CLI normally.

Treat desired configuration and observed readiness separately. Require
`observations_current: true` and the individual state `ready` before treating a
secret, runtime variable, or outbound identity as ready. Network policy is applied
only when its current state is `enforced`. Missing or any other states, including
`skipped` and `unsupported`, do not establish readiness. Recheck after setup
completes. Ready observations describe setup, not guaranteed authorization for
every remote API call. Diagnose the actual command's error too.

For CLI or SDK profile selection, read the worker's non-secret JSON manifest at
`OIC_MANIFEST_PATH`, if present. Version 1 contains a `connections` list. Select
the entry whose `alias` matches the identity needed for the task; `is_default`
identifies the provider's default, not necessarily the intended identity. Use the
selected entry's fields to set these environment variables for that command only:

| `provider_kind` | Environment variable ← manifest field |
| --- | --- |
| `azure` | `IDENTITY_ENDPOINT` ← `identity_endpoint`; `AZURE_CONFIG_DIR` ← `config_dir` |
| `aws` | `AWS_PROFILE` ← `alias`; `AWS_CONFIG_FILE` ← `config_file` |
| `gcp` | `CLOUDSDK_CONFIG` ← `config_dir`; `CLOUDSDK_ACTIVE_CONFIG_NAME` ← `configuration_name`; `GOOGLE_APPLICATION_CREDENTIALS` ← `credentials_file` |

Preserve the inherited runtime authentication headers and guard variables. Use
credential file paths as selectors without reading or printing their contents.
Do not invent aliases, replace injected credentials, or start interactive login
merely because a token is not visible. Inspect the entry's `setup` outcome when
diagnosing CLI failures; a warning does not establish successful CLI setup. If
the manifest version, required entry, or selector fields are unavailable or
unsupported, report the missing setup instead of silently using another identity.

This plugin reads runtime context. Configuration changes require the environment
configuration workflow and its user review. If the tool reports no attached
managed environment, do not reuse an instance ID or readiness result from a prior
turn.


exec
/bin/bash -lc 'cat docs/SPECIFICATION.md' in /workspace/dungeonsweeper
 succeeded in 0ms:
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
町帰還時に経験値が足りていれば複数回レベルアップ。Lv上限30。HP/MP成長は職業別ダイス、ACはレベルアップで変化しない。帰還で正常なメンバーのみHP/MPを全快し、レベルアップ結果はポップアップ。
死亡状態は本作の暫定仕様。メンバーの `status` は `ok`（正常）・`dead`（死亡）・`ash`（灰）・`lost`（ロスト）。HPが0になると正常から死亡へ移行し、死亡・灰・ロストは帰還後もHP0のまま、MPも回復しない。帰還時の毒・麻痺解除は全員が対象。状態タグはログのスナップショットに同期して「死亡」「灰」「ロスト」を表示する。正常以外のメンバーがいるパーティーは迷宮に入れず、酒場で外す必要がある。寺院と灰・ロストへの移行はまだ未実装。
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
/bin/bash -lc "rg -n 'smith|shop|tavern|training|Roster|roster|memberIds|PARTY_FIELDS|function idle|function save|function render\\(|status|dialog' dist/game.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
16:function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function markDeaths(){s.members.forEach((m,i)=>{if(s.hp[i]<=0&&m.status==='ok')m.status='dead'})}
37:function showLevelReport(){if(!s.levelReport?.length)return;$('#levelreport').textContent=s.levelReport.join('\n');if(!$('#leveldialog').open)$('#leveldialog').showModal()}
42:function ensureProfile(){s.cleared??=false;s.clearNotice??=false;ensureStats();ensureSixParty();for(let floor of [s,...Object.values(s.floors||{})])for(let c of floor.cells||[])if(c.flag===true)c.flag=s.flagKind||'power';if(!s.immediateChestVersion){delete s.score;delete s.history;for(const f of Object.values(s.floors||{})){delete f.score;for(const c of f.cells||[])delete c.chest}for(let i=0;i<s.cells.length;i++)if(i!==s.pos||s.area==='town')delete s.cells[i].chest;s.logs=(s.logs||[]).filter(t=>!t.includes('スコア'));s.immediateChestVersion=1;}s.floor??=1;s.size??=8;s.floors??={};for(const f of [s,...Object.values(s.floors)])if(f.floor>=MAX_FLOOR)for(const c of f.cells||[])if(c.type==='down')c.type='';if(s.floor>=MAX_FLOOR&&s.pendingStairs==='down')s.pendingStairs=false;s.ailments??=[{poison:false,paralysis:0},{poison:false,paralysis:0},{poison:false,paralysis:0}];s.armor??=[{},{},{}];s.members.forEach((m,i)=>{m.status??=s.area!=='town'&&s.hp[i]<=0?'dead':'ok';m.ac=memberClass(i).ac;migrateStrength(m,jobOf(i))});for(const r of s.reserve||[])if(r.members){r.members.status??='ok';migrateStrength(r.members,r.members.job??0)}ensureMagic();ensureProgression();s.attackRows??=[null,null,null];s.itemPlans??=[null,null,null];s.inventory??=[['sword'],['staff'],['mace']];s.equipped??=[0,0,0];s.area??='dungeon';s.pendingStairs??=false;for(let key of ['commands','magicPlans','itemPlans','attackRows'])s[key]=s.members.map((m,i)=>s[key]?.[i]??(key==='commands'?(i<3?'fight':'guard'):null));for(let i=0;i<s.members.length;i++){s.inventory[i]=s.inventory[i].filter(id=>!!weapon(id)).slice(0,10);if(!s.inventory[i].length)s.inventory[i]=[starterWeapon(i)];if(!s.inventory[i][s.equipped[i]])s.equipped[i]=0}}
46:function idle(){return !currentChest()&&!logBusy()&&!s.enemy&&!s.pendingBoss&&!s.pendingStairs}
47:function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));levelUp();s.hp=s.members.map(m=>m.status==='ok'?m.maxHP:0);s.mp=s.members.map((m,i)=>m.status==='ok'?m.maxMP:s.mp[i]);s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render();showLevelReport()}
49:function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.members.some(m=>m.status!=='ok')){$('#townnotice').textContent='死亡したメンバーを外してください。';render();return;}$('#townnotice').textContent='';if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
54:function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
57:function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
59:function openInventory(i){if(!idle())return;inventoryMember=i;renderInventory();$('#inventorydialog').showModal()}
64:function scene(){let combat=!!visibleCombat(),f=face(target()),l=face(target(-1)),r=face(target(1));if(combat){for(const v of [f,l,r])if(/^\d+$/.test(v.symbol))v.symbol='';}let txt=(x,y,t,size=17,color='#d6d9c9')=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="700">${t}</text>`;let panel=(v,x,y)=>txt(x,y+24,v.symbol,x===320&&s.light&&diagonalSight().some(i=>i>=0)?38:58,v.color);let battle=visibleCombat()?drawEnemies():s.pendingBoss?`<rect x="200" y="90" width="240" height="170" rx="8" fill="#231b18" stroke="#b58663"/>${txt(320,196,'☠',55)}`:'';$('#scene').innerHTML=`<svg viewBox="0 0 640 400" preserveAspectRatio="none" role="img" aria-label="正面：${f.label} ${f.symbol}、左：${l.label} ${l.symbol}、右：${r.label} ${r.symbol}"><path d="M0 0H640L440 100H200Z" fill="#121914"/><path d="M0 400H640L440 300H200Z" fill="#2d382d"/><path d="M0 0L200 100V300L0 400Z" fill="${l.fill}"/><path d="M640 0L440 100V300L640 400Z" fill="${r.fill}"/><path d="M200 100H440V300H200Z" fill="${f.fill}"/><g fill="none" stroke="#829079" stroke-width="1.5"><path d="M0 0L200 100H440L640 0M0 400L200 300H440L640 400M200 100V300M440 100V300"/></g>${panel(l,96,185,'左のマス')}${panel(f,320,185,'正面のマス')}${panel(r,544,185,'右のマス')}${combat?'':txt(320,378,String(num(s.pos)),36,'#ffdf9e')}${distantSight()}${battle}</svg>${visibleCombat()?`<div class="scene-enemies" aria-label="敵の列">${enemyGroups(visibleCombat()).filter(g=>g.units.some(e=>!e.rewarded)).map(g=>`<div>${g.index+1}列：${enemyDisplay(g.units[0])} ×${g.units.filter(e=>!e.rewarded).length}</div>`).join('')}</div>`:''}${encounterNotice?`<div class="encounter-notice" role="status">${encounterNotice}</div>`:''}`}
65:function render(){ensureProfile();$('#clearresult').hidden=s.area!=='dungeon'||!s.clearNotice||s.done||logBusy()||!!visibleCombat();$('#cleartown').disabled=!idle();$('#clearchestnotice').hidden=!currentChest();$('#clearedmark').hidden=!s.cleared;$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();$('#maptoggle').hidden=s.area!=='dungeon';if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic?' / 秘宝 ✦':''}`;$('#party').innerHTML=NAMES.map((n,i)=>`${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`).join('');$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${s.pos===i?num(i):c.open?(c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div><button id="flee">逃げる</button>`;$('#flee').onclick=flee;$('#flee').disabled=logBusy()||combat.boss||combat.flagEffect?.bad;renderCommandEntry()}$('#frontflag').disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();scene()}
66:$('#statsopen').onclick=()=>{renderStats();$('#statsdialog').showModal()};$('#party').onclick=$('#statsopen').onclick;$('#party').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#statsopen').onclick()}};$('#statsclose').onclick=()=>$('#statsdialog').close();$('#statsbody').onclick=e=>{let b=e.target.closest('[data-stat-inventory]');if(b)openInventory(+b.dataset.statInventory);let cast=e.target.closest('[data-stat-cast]');if(cast){$('#statsdialog').close();openMagic(+cast.dataset.statCast)}};$('#catalogclose').onclick=()=>$('#catalogdialog').close();$('#maptoggle').onclick=()=>{$('#mapdialogbody').append($('#mappanel'));$('#mapdialog').showModal()};$('#mapclose').onclick=()=>$('#mapdialog').close();$('#mapdialog').addEventListener('close',()=>$('#mapdock').append($('#mappanel')));
67:$('#bossyes').onclick=()=>s.pendingStairs?answerStairs(true):answerBoss(true);$('#bossno').onclick=()=>s.pendingStairs?answerStairs(false):answerBoss(false);$('#board').onclick=e=>{let b=e.target.closest('[data-i]');if(b)flag(+b.dataset.i)};document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>move(b.dataset.action));$('#frontflag').onclick=()=>flag(target());document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;let action={ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right',a:'strafeLeft',A:'strafeLeft',d:'strafeRight',D:'strafeRight'}[e.key];if(action){e.preventDefault();if(!e.repeat)move(action)}});
70:$('#cleartown').onclick=enterTown;$('#backtown').onclick=enterTown;$('#entrance').onclick=enterDungeon;$('#blacksmith').onclick=()=>{if(!s.members.length)return;renderShop();$('#shopdialog').showModal()};$('#shopclose').onclick=()=>$('#shopdialog').close();$('#inventoryclose').onclick=()=>$('#inventorydialog').close();$('#shopmember').onchange=()=>{renderShop();$('#shopnotice').textContent=''};$('#shopitems').onclick=e=>{let b=e.target.closest('[data-buy]');if(b)buy(b.dataset.buy,+$('#shopmember').value)};$('#shopinventory').onclick=()=>openInventory(+$('#shopmember').value);$('#inventoryslots').onclick=e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.useMedicine!==undefined)openMedicine(inventoryMember,+b.dataset.useMedicine);if(b.dataset.equip!==undefined)equip(inventoryMember,+b.dataset.equip);if(b.dataset.sell!==undefined)sell(inventoryMember,+b.dataset.sell)};
71:try{s=restoreRoster(JSON.parse(localStorage.getItem('ash-v1')))}catch{}if(!s||!s.cells||![64,100,144].includes(s.cells.length)){fresh();s.area='town';s.logs=[];render()}else{ensureProfile();migrateMonsterBattle();s.start??=0;if(s.relic&&s.done){s.done=false;s.cells[s.boss].type=s.floor<MAX_FLOOR?'down':''}if(s.cells[s.start].type!=='boss')s.cells[s.start].type='stairs';for(let c of s.cells){if(c.open&&c.trap){c.trap=false;c.spent=true}if(c.type==='enemy')c.type=''}render()}
73:for(const id of ['mapdialog','statsdialog','leveldialog']){const d=$('#'+id);d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()})}
77:$('#resetopen').onclick=()=>$('#resetdialog').showModal();$('#resetcancel').onclick=()=>$('#resetdialog').close();$('#resetconfirm').onclick=()=>{s=null;fresh();s.area='town';s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);$('#resetdialog').close();render()};
79:function visibleAilments(i){let a=(displayVitals?.ailments||s.ailments)[i]||{},hp=(displayVitals?.hp||s.hp)[i],status=shownMember(i).status,label={dead:'死亡',ash:'灰',lost:'ロスト'}[status];return label?[[status,label]]:hp<=0?[['dead','死亡']]:[[a.poison,'poison','毒'],[a.paralysis>0,'paralysis','麻痺'],[a.sleep>0,'sleep','睡眠']].filter(([active])=>active).map(([,kind,label])=>[kind,label])}
86:function chestItemPool(floor){let loot=CHEST_LOOT,cap=loot.priceCap[floor-1]??loot.priceCap.at(-1),pool=WEAPONS.filter(w=>(w.drop===true||w.part)&&w.price<=cap&&(w.minFloor??1)<=floor).map(w=>({item:w,weight:w.shop===false&&w.minFloor===floor?.5:w.minFloor!==undefined&&w.minFloor<=floor-3?.3:1}));if(!pool.length){let item=WEAPONS.filter(w=>w.drop===true||w.part).reduce((a,b)=>a.price<=b.price?a:b);return [{item,weight:1}]}return pool}
122:$('#levelclose').onclick=()=>$('#leveldialog').close();

exec
/bin/bash -lc "rg -n 'dialog|鍛冶屋|town' dist/index.html && head -100 tests/training.cjs && head -60 tests/game.cjs" in /workspace/dungeonsweeper
 succeeded in 0ms:
10:header{gap:12px;flex-wrap:wrap}.headeractions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.headeractions button{font-size:12px;padding:9px}.controls{grid-template-columns:auto minmax(120px,1fr);justify-content:center;gap:18px}.movement{justify-content:center}.maplocation{padding:16px;color:var(--gold);font-size:13px}.cell.in-view{background:#364238;border-color:#819079;box-shadow:inset 0 0 0 1px #74856d55}.cell.here{border-color:var(--gold)}.hpbar{position:relative;height:24px;border:1px solid #60705a;background:#141c16;border-radius:3px;overflow:hidden;margin:8px 0}.hpfill{height:100%;background:#758a60;transition:width .2s}.hpvalue{position:absolute;right:6px;top:0;line-height:22px;font-size:13px;font-weight:800;color:#fff6df;text-shadow:0 1px 2px #000}.hpbar.low{border-color:#b95353}.hpbar.low .hpfill{background:#8f3030}.hpbar.low .hpvalue{color:#ff8d8d}dialog{background:#19211c;color:#d9dfd1;border:1px solid #8c805f;border-radius:9px;width:min(620px,94vw);max-height:85vh;padding:22px;line-height:1.8;font-size:13px}dialog::backdrop{background:#000b}.dialoghead{display:flex;align-items:center;justify-content:space-between;gap:12px}.dialoghead h2{font-size:18px;margin:0}.dialoghead button{font-size:23px;padding:0 12px}.cell.boss-cell .cell-number{color:#dc9e7d}#log div:first-child{color:#ead8b7}@media(max-width:700px){.controls{grid-template-columns:auto minmax(100px,1fr);gap:12px}.headeractions{gap:6px}.headeractions button{font-size:11px}.hpvalue{font-size:12px}.maplocation{padding:12px}}
12:[hidden]{display:none!important}.cell.in-view{background:#2b352d;border-color:#69735e;box-shadow:0 0 4px #c8bd7a22}.cell.open.in-view{background:#18201a}.equipment{width:100%;font-size:11px;padding:6px 3px;color:#d7b881;margin:0 0 5px}#town{margin-top:24px;text-align:center;padding:36px 20px;background:radial-gradient(ellipse at top,#364333,#131a16)}.townart{font-size:80px;color:#d7b881;text-shadow:0 0 45px #bcb16644}#town h2{font-family:serif;letter-spacing:7px;font-weight:400}.townmenu{display:flex;justify-content:center;gap:16px;padding:20px}.townmenu button{min-width:180px;padding:22px}.shoptoolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:16px;flex-wrap:wrap}select{padding:10px;background:#222d24;color:#e0d8bb;border:1px solid #66715a;border-radius:4px}.shopitem{display:flex;gap:16px;align-items:center;border-top:1px solid #3c483b;padding:13px 0}.shopitem>div{flex:1}.shopitem small{display:block;letter-spacing:0}.slot{display:flex;align-items:center;gap:10px;min-height:55px;border-bottom:1px solid #354333;padding:8px 0}.slot>b{flex:1}.slot>small{width:18px;letter-spacing:0}.slot>button{font-size:11px;padding:7px}.slot>span{font-size:12px;color:#a5b198}#backtown{margin-top:15px}.shopitem button{font-size:12px}@media(max-width:700px){.townmenu{flex-direction:column}.slot{gap:6px}.slot>b{font-size:12px}.slot>span{font-size:10px}.equipment{font-size:10px}}
14:.mpbar{height:19px;background:#111e20;border:1px solid #405c62;position:relative;border-radius:3px;overflow:hidden;margin:-3px 0 9px}.mpbar>div{height:100%;background:#466c79}.mpbar>span{position:absolute;inset:0 5px 0 0;text-align:right;font-size:11px;font-weight:700;line-height:17px;color:#d3edf2}.card b small{font-size:10px;letter-spacing:0;color:#acb29a}.enemytargets{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px}.enemytargets label{font-size:12px;background:#222a21;padding:7px;border:1px solid #525d46;border-radius:4px;display:flex;align-items:center;gap:5px}.statcard{border-top:1px solid #475140;padding:12px 0}.statcard h3{margin:4px 0 10px;color:var(--gold)}.statcard dl{display:grid;grid-template-columns:120px 1fr;gap:6px;margin:0 0 12px}.statcard dd{margin:0;text-align:right}.statcard dt{color:#aeb79f}#levelreport{white-space:pre-line;color:#d5c28c;font-size:13px}#catalogbody{overflow:auto}#catalogbody table{width:100%;border-collapse:collapse;white-space:nowrap}#catalogbody th,#catalogbody td{border-bottom:1px solid #40513d;padding:8px;font-size:12px;text-align:left}#maptoggle{display:none}#mapdialog{width:min(410px,95vw);padding:12px}#mapdialog #mappanel{border:0}#mapdialog .maplocation{display:none}#mapdialog .board{padding:12px 0 0}#mapdock{min-width:0}@media(max-width:700px){#mapdock{display:none}#maptoggle{display:block;position:fixed;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:50;border-color:#d2b67f;box-shadow:0 4px 20px #0008;background:#2c382b;padding:14px 19px;border-radius:30px}main{padding-bottom:85px}#mapdialog{margin:auto auto 80px auto;max-height:80vh}#statsdialog{padding:15px}.statcard dl{grid-template-columns:85px 1fr}.enemytargets label{font-size:11px}}
16:header{border-bottom:0}.viewlog{display:grid;grid-template-columns:1fr 1fr;min-width:0}#scene{height:225px}#log{height:225px;border-top:0;border-left:1px solid #46513f}dialog{max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;padding:12px;line-height:1.4}.dialoghead{position:sticky;top:-12px;background:#19211c;z-index:5;padding:8px 0;margin-bottom:8px}.dialoghead button{min-width:44px;min-height:44px;flex-shrink:0}.dialoghead h2{font-size:16px}.statcard{padding:7px 0}.statcard h3{margin:0 0 5px}.statcard dl{gap:2px;margin-bottom:5px;font-size:12px;line-height:1.3}.statcard button{padding:6px 10px}.statcard dd{overflow-wrap:anywhere}#mapdialog{margin:auto;max-height:calc(100dvh - 32px)}@media(max-width:700px){.viewlog{grid-template-columns:1fr}#scene{height:170px}#log{height:120px;border-left:0;border-top:1px solid #46513f}#statsdialog{padding:10px}.dialoghead{top:-10px}.statcard dl{grid-template-columns:90px 1fr}}
18:.board{width:100%;aspect-ratio:1;grid-auto-rows:minmax(0,1fr);padding:12px;gap:4px;align-items:stretch;justify-items:stretch}.board .cell{width:100%;height:100%;min-height:0;min-width:0;aspect-ratio:auto;overflow:hidden}#mapdialog .board{padding:8px;aspect-ratio:1}.board .cell-number{font-size:clamp(12px,2vw,20px)}
20:#magicdialog{width:min(560px,94vw);padding:0;overflow:hidden}#magicdialog[open]{display:flex;flex-direction:column;max-height:calc(100dvh - 32px)}#magicdialog .dialoghead{position:static;flex-shrink:0;padding:10px 14px;margin:0}#magiclist{overflow-y:auto;min-height:0;padding:0 12px;overscroll-behavior:contain}.spellrow{display:block;width:100%;text-align:left;padding:9px 10px;margin:5px 0;line-height:1.4}.spellrow b{display:flex;justify-content:space-between;gap:10px}.spellrow p{font-size:12px;margin:4px 0 0}.spellrow small{font-size:11px;letter-spacing:0}.spellrow[aria-pressed=true]{border-color:#dfbd7d;background:#39432f}.spellrow:not(.learned){opacity:.6}.magicfooter{flex-shrink:0;background:#19211c;padding:10px 14px;border-top:1px solid #46513f}.magicfooter p{margin:5px 0;font-size:12px}.magicfooter select{max-width:100%;padding:8px;background:#273328;color:#eee}.magicfooter button{width:100%}.card [data-magic]{width:100%;font-size:12px;margin-top:7px;padding:10px 4px}.spellplan{display:block;letter-spacing:0;line-height:1.4;margin-top:4px}.farview{position:absolute;top:5px;left:5px;display:flex;gap:8px;background:#152019dd;font-size:11px;padding:4px;color:#ead8b7}.statcard>button{margin:3px}
21:.enemytargets{display:grid;gap:8px}.enemygroup>b{font-size:12px;color:var(--gold)}.enemygroup>div{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px}.enemygroup label{min-width:50px;justify-content:center}.log-ally{color:#78b7ff}.log-enemy{color:#ff8686}.log-heal{color:#85d99b}.log-damage{color:#ffb05f}.log-spell{color:#d2a0ff}.headeractions .iconbutton{width:44px;height:44px;padding:9px;display:grid;place-items:center;font-size:24px;font-weight:700}.iconbutton svg{width:24px;height:24px;fill:currentColor}header.in-dungeon{justify-content:flex-end;padding-bottom:0}.movement button{width:44px;min-width:44px;height:44px;padding:5px;font-size:24px}header.in-dungeon+.panel[hidden]{display:none}.controls[hidden]{display:none}.attackrow{display:block;margin:7px 0}.attackrow select{width:100%;min-width:0;font-size:11px;background:#1c271f;color:#e7e3d8;border:1px solid #52634e;border-radius:4px;padding:8px 3px}.card [data-medicine]{width:100%;margin-top:7px;font-size:12px;padding:9px 4px}#medicinedialog select{max-width:100%;padding:10px;background:#273328;color:#eee}#medicinedialog>label{display:block;margin:10px 0}#medicineuse{display:block;width:100%;margin-top:14px}.flag-power{color:#ffaaaa;border-color:#a85050;background:#3a2424}.flag-guard{color:#acd2ff;border-color:#527caa;background:#202f40}.flag-magic{color:#d9b7ff;border-color:#8861ad;background:#31243f}.flag-button:disabled{opacity:.85}.party{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.card{min-width:0;padding:9px}.card b{margin-bottom:5px}.commandchoices,.commandreview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:10px 0}#commandentry{padding:10px 0}#commandentry b small{color:#aab4a1;font-weight:400}.commandchoices button,.commandreview button{min-height:44px;padding:9px;font-size:13px}@media(max-width:700px){.party{grid-template-columns:repeat(2,minmax(0,1fr))}.card{font-size:12px}.statcard dl{line-height:1.3}}header.in-dungeon{display:none}#statsopen{position:fixed;left:16px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:20;width:48px;height:48px;border-radius:50%;box-shadow:0 3px 14px #0008}#maptoggle{bottom:calc(14px + env(safe-area-inset-bottom));z-index:20}main{padding-bottom:80px}.flagactions{display:flex;gap:6px}.flagactions #flagopen{flex:0 0 44px;padding:8px}.flagactions #frontflag{flex:1}.mapheading{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px}.mapheading .maplocation{padding:0}#mapflagopen{padding:8px;font-size:12px}.party{grid-template-columns:repeat(3,minmax(0,1fr));padding:7px;gap:5px}.card{padding:6px;font-size:11px}.card b{margin:0 0 3px}.card b small{font-size:9px}.hpbar{height:18px}.hpvalue{line-height:18px;font-size:11px}.mpbar{height:13px;font-size:10px}.mpbar span{line-height:13px}#status{font-size:12px;white-space:nowrap}.dialoghead{gap:8px}#battle{padding:8px}.enemytargets{margin-bottom:4px;font-size:11px}#commandentry{padding:4px 0}.commandchoices,.commandreview{margin:6px 0}.controls{padding:7px}@media(max-width:700px){main{padding-top:8px}.party{grid-template-columns:repeat(3,minmax(0,1fr))}#scene{height:clamp(110px,22svh,165px)}#log{height:clamp(65px,12svh,100px)}.viewlog{gap:0}.movement button{min-height:38px;padding:5px}.frontactions button{font-size:11px}.controls{grid-template-columns:auto minmax(0,1fr)}.card b small{display:block}.commandchoices button,.commandreview button{min-height:40px;padding:7px}#battle>button{padding:9px}}
23:.party-rank{grid-column:1/-1;font-size:10px;color:#b9c3b1;line-height:12px}.log-flag-power{color:#ffb05f}.log-flag-guard{color:#85d99b}.log-flag-magic{color:#d2a0ff}#tavernslots{display:grid;gap:8px;margin:12px 0}#tavernslots label{display:flex;align-items:center;gap:12px}#tavernslots select{flex:1;min-width:0;padding:10px;background:#263128;color:#eee;border:1px solid #53634e}#tavernsave{width:100%}@media(max-width:700px){.card{padding:4px}.party{gap:3px}.party-rank{line-height:10px}.hpbar{height:16px}.hpvalue{line-height:16px}} #statsbody{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px}#statsdialog{width:min(720px,96vw)}.statcard{min-width:0}.statcard h3{font-size:14px}.statcard h3 small{font-size:10px;white-space:nowrap}.statcard dl{grid-template-columns:auto minmax(0,1fr);font-size:11px;gap:1px 5px}.statcard button{margin:2px 0;padding:7px;font-size:11px;min-height:32px}.statcard>button{width:100%}#party{cursor:pointer}#party:focus-visible{outline:2px solid var(--gold)}header.in-dungeon+#statsopen{display:none}#equipmentsummary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:10px 0}#equipmentsummary>div{padding:8px 4px;border:1px solid #46513f;text-align:center;font-size:12px}#equipmentsummary small{display:block;color:#b6bfa9;font-size:10px}#equipmentsummary b{display:block;margin-top:4px}#transfersection{border-block:1px solid #46513f;padding:10px 0}#transfersection summary{cursor:pointer;color:var(--gold)}#transfersection label{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:12px}#transfersection select{flex:1;min-width:0}#transfernotice{font-size:12px;margin:6px 0}#partyorder{margin:8px 0}#partyorder label{display:flex;gap:8px;align-items:center;margin:5px 0;font-size:12px}#partyorder select{flex:1;min-width:0;padding:7px}#partyreorder{font-size:12px;padding:7px 10px}@media(max-width:420px){#statsbody{gap:5px 9px}.statcard h3{font-size:12px}.statcard h3 small{display:block}.statcard dl{font-size:10px}.statcard button{padding:5px}.statcard{padding:5px 0}#equipmentsummary{gap:3px}#equipmentsummary>div{font-size:11px}} @media(max-width:700px){#statsdialog .statcard dl{line-height:1.15;margin-bottom:4px}#statsdialog .statcard h3{line-height:1.2;margin-bottom:4px}#statsdialog .statcard h3 small{display:inline;font-size:9px}#statsdialog .statcard>button{min-height:28px;padding:4px;font-size:10px}#statsdialog .statcard{padding:4px 0}#statsdialog .dialoghead{padding:3px 0}} #scene{position:relative}.encounter-notice{position:absolute;inset:0;display:grid;place-items:center;background:#0b120bd9;color:#f1d7a5;font-size:clamp(17px,2.5vw,24px);font-weight:700;letter-spacing:1px;text-align:center;padding:10px;pointer-events:none} .stat-actions{display:flex;gap:5px;align-items:center}.stat-actions button{flex:1;min-width:0;white-space:nowrap;margin:2px 0;padding:7px 3px;letter-spacing:0}.ailment-tag{display:inline-block;vertical-align:middle;border:1px solid;border-radius:4px;padding:1px 4px;margin-left:4px;font-size:10px;line-height:1.25;letter-spacing:0;font-weight:600;white-space:nowrap}.ailment-poison{color:#c0a1ed;background:#352743;border-color:#73578d}.ailment-paralysis{color:#f3d18c;background:#40371e;border-color:#8d7946}.ailment-dead{color:#ffaaa5;background:#452728;border-color:#925251}.ailment-sleep{color:#a9c8ef;background:#243344;border-color:#536f93}#party .card b small{display:inline;margin-left:3px}#party .ailment-tag{font-size:9px;padding:0 3px;margin-left:3px}@media(max-width:700px){#statsdialog .stat-actions button{font-size:11px;min-height:32px;padding:5px 2px}.statcard h3 .ailment-tag{font-size:9px;margin-left:3px;padding:0 3px}} #statsdialog .stat-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 9px}.stat-metrics>div{display:grid;grid-template-columns:auto minmax(0,1fr);gap:3px;align-items:baseline;min-width:0}.stat-metrics dt,.stat-metrics dd{font-size:10px;letter-spacing:0}.stat-metrics dd{font-variant-numeric:tabular-nums}#statsdialog .dialoghead{gap:7px}#statsdialog .dialoghead h2{margin-right:auto;white-space:nowrap}#statsdialog #partyreorder{min-width:0;min-height:34px;padding:6px;font-size:11px;white-space:nowrap}#statsdialog #status{font-size:11px}#leveldialog{width:min(560px,94vw)}#levelreport{font-size:13px;line-height:1.8;white-space:pre-line}.spellrow:disabled{opacity:.4;cursor:not-allowed}@media(max-width:420px){#statsdialog .dialoghead h2{font-size:13px}#statsdialog .dialoghead{gap:4px}#statsdialog .stat-metrics{gap:4px 6px}.stat-metrics dt,.stat-metrics dd{font-size:10px}} .party-wrap{position:relative}.party-wrap #commandreviewpopup{position:absolute;inset:0;z-index:3;background:#172018f2;border:1px solid #8c9879;border-radius:5px;padding:5px 9px;overflow:auto;box-shadow:0 5px 18px #000a}.party-wrap #commandreviewpopup[hidden]{display:none}.party-wrap #commandreviewpopup>b{color:var(--gold);font-size:12px}.party-wrap .commandreview{font-size:11px}.party-wrap .commandreview th,.party-wrap .commandreview td{padding:2px 5px}.scene-enemies{position:absolute;left:6px;top:6px;z-index:1;background:#172018e8;border:1px solid #69745f;border-radius:4px;color:#e1cca2;padding:4px 6px;font-size:clamp(9px,1.4vw,11px);line-height:1.35;pointer-events:none}
24:.townmenu{flex-wrap:wrap}#training{width:min(720px,94vw)}.recruit-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.recruit-fields label{display:grid;gap:5px}.recruit-fields input,.recruit-fields select{width:100%;min-width:0;font:inherit;padding:10px;background:#222d24;color:#e0d8bb;border:1px solid #66715a;border-radius:4px}#training button{min-height:44px}.recruit-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.recruit-metrics div{background:#222b24;padding:8px}.recruit-metrics dd{margin:0;color:var(--gold)}#recruitlist section{border-top:1px solid var(--line);padding:12px 0;overflow-wrap:anywhere}#recruitlist h4{margin:0;color:var(--gold)}.recruit-actions{display:flex;flex-wrap:wrap;gap:8px}#emptyparty{text-align:center}@media(max-width:420px){#training{padding:14px}.recruit-fields{grid-template-columns:1fr}.recruit-actions button{flex:1;white-space:nowrap}}
25:</style><main><header><div id="gametitle"><h1>迷宮スイーパー</h1></div></header><button id="statsopen" class="iconbutton" aria-label="ステータス" title="ステータス"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3Z"/></svg></button><section id="town" class="panel" hidden><div class="townart" aria-hidden="true">♜</div><h2>灯の町</h2><p id="townnotice" role="status"></p><small id="clearedmark" hidden>迷宮踏破済み</small><button id="resetopen">冒険データをリセット</button><div class="townmenu"><button id="trainingopen">訓練所</button><button id="tavernopen">酒場</button><button id="blacksmith">鍛冶屋</button><button id="entrance">迷宮への入り口</button></div></section><p id="emptyparty" role="status">訓練所で冒険者を作成し、パーティに加入させてください。</p><section id="clearresult" class="panel" aria-labelledby="cleartitle" hidden><h2 id="cleartitle">迷宮踏破</h2><p>迷宮の主は倒れた。迷宮に静寂が戻った……</p><p id="clearchestnotice" hidden>宝箱を開けるか、放棄すると町へ戻れます。</p><button id="cleartown">町へ戻る</button></section><button id="backtown" hidden>町へ戻る</button><div class="layout" id="dungeon"><section><div class="panel"><div class="viewlog"><div id="scene" aria-label="現在地からの視界"></div><div id="log" aria-live="polite" role="log"></div></div><div class="party-wrap"><div id="commandreviewpopup" hidden></div><div class="party" id="party" role="button" tabindex="0" aria-label="パーティーを開く" aria-haspopup="dialog"></div></div><div id="bosschoice" hidden><button id="bossyes">はい</button><button id="bossno">いいえ</button></div><div class="controls"><div class="movement"><div><button data-action="left" aria-label="左旋回" title="左旋回"><span aria-hidden="true">↶</span></button><button data-action="strafeLeft" aria-label="左へ横移動" title="左へ横移動"><span aria-hidden="true">←</span></button></div><div><button data-action="forward" aria-label="前進" title="前進"><span aria-hidden="true">↑</span></button><button data-action="back" aria-label="後退" title="後退"><span aria-hidden="true">↓</span></button></div><div><button data-action="right" aria-label="右旋回" title="右旋回"><span aria-hidden="true">↷</span></button><button data-action="strafeRight" aria-label="右へ横移動" title="右へ横移動"><span aria-hidden="true">→</span></button></div></div><div class="frontactions"><div class="flagactions"><button id="flagopen" aria-label="旗の種類を切り替え">⚑</button><button id="frontflag">正面に旗</button></div></div></div><div id="chestactions" hidden><button id="chestthief" hidden>盗賊が調べて開ける</button><button id="chestcalfo" hidden>カルフォ</button><button id="chestopen">宝箱を直接開ける</button><button id="chestabandon">放棄する</button></div><div id="battle" hidden></div></div></section><section id="mapdock"><div class="panel" id="mappanel"><div class="mapheading"><div class="maplocation">地下1階</div><button id="mapflagopen">⚑ 怪力の旗</button></div><div class="board" id="board"></div></div></section></div>
26:<dialog id="shopdialog" aria-labelledby="shoptitle"><div class="dialoghead"><h2 id="shoptitle">鍛冶屋</h2><button id="shopclose" aria-label="閉じる">×</button></div><div class="shoptoolbar"><select id="shopmember" aria-label="購入するメンバー"><option value="0">戦士</option><option value="1">魔法使い</option><option value="2">僧侶</option></select><span id="shopgold"></span><button id="shopinventory">アイテム・売却</button></div><p id="shopnotice" role="status"></p><div id="shopitems"></div></dialog>
27:<dialog id="inventorydialog" aria-labelledby="inventorytitle"><div class="dialoghead"><h2 id="inventorytitle"></h2><button id="inventoryclose" aria-label="閉じる">×</button></div><div id="equipmentsummary"></div><details id="transfersection"><summary>アイテムを渡す</summary><label>アイテム<select id="transferitem"></select></label><label>渡す相手<select id="transfermember"></select></label><button id="transfergive">渡す</button><p id="transfernotice" role="status"></p></details><div id="inventoryslots"></div></dialog><button id="maptoggle" aria-haspopup="dialog" aria-label="迷宮の地図を開く">▦ 地図</button><dialog id="mapdialog" aria-label="迷宮の地図"><div class="dialoghead"><span>地図</span><button id="mapclose" aria-label="地図を閉じる">×</button></div><div id="mapdialogbody"></div></dialog><dialog id="statsdialog" aria-labelledby="statstitle"><div class="dialoghead"><h2 id="statstitle">パーティー</h2><span id="status"></span><button id="partyreorder">順番変更</button><button id="statsclose" aria-label="閉じる">×</button></div><div id="partyorder" hidden></div><div id="statsbody"></div></dialog><dialog id="catalogdialog" aria-labelledby="catalogtitle"><div class="dialoghead"><h2 id="catalogtitle">敵データ一覧</h2><button id="catalogclose" aria-label="閉じる">×</button></div><div id="catalogbody"></div></dialog><dialog id="resetdialog"><h2>冒険データをリセットしますか？</h2><p>レベル・経験値・アイテム・装備・金貨・迷宮の進行を初期化します。元に戻せません。</p><button id="resetcancel">キャンセル</button><button id="resetconfirm">リセットを実行</button></dialog><dialog id="magicdialog" aria-labelledby="magictitle"><div class="dialoghead"><h2 id="magictitle"></h2><button id="magicclose" aria-label="閉じる">×</button></div><div id="magiclist"></div><div class="magicfooter"><div id="magictargets"></div><p id="magicnotice" role="status"></p><button id="magiccast" hidden>発動する</button></div></dialog><dialog id="medicinedialog" aria-labelledby="medicinetitle"><div class="dialoghead"><h2 id="medicinetitle">薬</h2><button id="medicineclose" aria-label="閉じる">×</button></div><label>薬 <select id="medicineitem"></select></label><p id="medicinedescription"></p><label>対象 <select id="medicinetarget"></select></label><button id="medicineuse">使う</button></dialog><dialog id="taverndialog" aria-labelledby="taverntitle"><div class="dialoghead"><h2 id="taverntitle">酒場</h2><button id="tavernclose" aria-label="閉じる">×</button></div><div id="tavernslots"></div><p class="tavernhint">空きを除いた先頭3人が前衛、続く3人が後衛になります。</p><button id="tavernsave">この編成にする</button></dialog><dialog id="leveldialog" aria-labelledby="leveltitle"><div class="dialoghead"><h2 id="leveltitle">レベルアップ</h2><button id="levelclose" aria-label="閉じる">×</button></div><div id="levelreport"></div></dialog><dialog id="training" aria-labelledby="trainingtitle"><div class="dialoghead"><h2 id="trainingtitle">訓練所</h2><button id="trainingclose" aria-label="訓練所を閉じる">×</button></div><h3>新規作成</h3><div class="recruit-fields"><label>名前<input id="recruitname" maxlength="20" autocomplete="off"></label><label>職業<select id="recruitjob"><option value="0">戦士</option><option value="2">僧侶</option><option value="1">魔法使い</option><option value="3">盗賊</option></select></label></div><p>職業に適した基本能力に3〜9点を自動配分します。能力値の上限は18です。</p><button id="rollrecruit">生成・再生成</button><div id="recruitpreview" aria-live="polite"></div><button id="registerrecruit" disabled>この能力で登録</button><p id="trainingnotice" role="status"></p><h3>登録メンバー・パーティ編成</h3><p id="trainingcount"></p><div id="recruitlist"></div></dialog><dialog id="recruitdeletedialog" aria-labelledby="recruitdeletetitle"><h2 id="recruitdeletetitle">登録抹消の確認</h2><p id="recruitdeletename"></p><button id="recruitdeletecancel" autofocus>キャンセル</button><button id="recruitdeleteconfirm">登録を抹消する</button></dialog></main><script src="weapons.js"></script><script src="monster-data.js"></script><script src="balance.js"></script><script src="spells.js"></script><script src="items.js"></script><script src="flags.js"></script><script src="traps.js"></script><script src="combatui.js"></script><script src="party.js"></script><script src="monsters.js"></script><script src="recruits.js"></script><script src="game.js"></script><script src="training.js"></script></html>
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
const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
drain();run(`
s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');/* 020: 帰還の全快対象は正常なメンバーのみ。死者は新しい死亡回帰テストで検証する。 */ if(s.hp.some((h,i)=>h!==(s.members[i].status==='ok'?maxHP(i):0))||s.mp.some((h,i)=>s.members[i].status==='ok'&&h!==s.members[i].maxMP))throw Error('living refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
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

exec
/bin/bash -lc "rg -n 'function (idle|renderShop|enterTown|enterDungeon|render|partyRecord|roster|allRecords)|shopopen|shopclose|PARTY_FIELDS|roster' dist/game.js dist/training.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
dist/training.js:1:// UI uses textContent for player names and stable IDs for roster actions.
dist/training.js:16:function renderTraining(){
dist/training.js:17: const list=$('#recruitlist');list.replaceChildren();const roster=trainingRoster();
dist/training.js:18: $('#trainingcount').textContent=`登録 ${roster.length}人 / パーティ ${s.members.length}/6人。先頭3人が前衛です。`;
dist/training.js:19: if(!roster.length){const p=document.createElement('p');p.textContent='名前と職業を選んで、最初の冒険者を作成してください。';list.append(p)}
dist/training.js:20: for(const r of roster){
dist/game.js:1:const $=s=>document.querySelector(s);let s,mode='move',logQueue=[],logTimer=null;let inventoryMember=0,displayVitals=null,displayCombat=undefined,encounterNotice='';const logBusy=()=>logTimer!==null||logQueue.length>0;const size=()=>s?.size||8;const around=i=>Array.from({length:size()*size()},(_,j)=>j).filter(j=>j!==i&&Math.abs(j%size()-i%size())<=1&&Math.abs((j/size()|0)-(i/size()|0))<=1);const adjacent=(a,b)=>Math.abs(a%size()-b%size())+Math.abs((a/size()|0)-(b/size()|0))===1;function fresh(floor=1){let profile=s?{gold:s.gold,cleared:!!s.cleared,flagKind:s.flagKind,inventory:s.inventory,equipped:s.equipped,members:s.members,mp:s.mp,hp:s.hp,armor:s.armor,ailments:s.ailments,light:s.light,partyVersion:s.partyVersion,reserve:s.reserve,dumapicUses:s.dumapicUses,watchful:s.watchful}:null;clearTimeout(logTimer);logTimer=null;logQueue=[];displayVitals=null;displayCombat=undefined;encounterNotice='';if(s){s.floor=floor;s.size=Math.min(12,6+floor*2)}else s={floor,size:8};let start=Math.random()*(size()*size())|0;let candidates=Array.from({length:size()*size()},(_,i)=>i).filter(i=>Math.max(Math.abs(i%size()-start%size()),Math.abs((i/size()|0)-(start/size()|0)))>2);let boss=candidates[Math.random()*candidates.length|0];s={floor,size:Math.min(12,6+floor*2),area:'dungeon',cleared:false,clearNotice:false,pendingStairs:false,dir:1,start,boss,pos:start,pendingBoss:null,hp:[32,24,26],scan:5,commands:['fight','fight','fight'],gold:0,relic:false,enemy:null,done:false,logs:['迷宮に到着。守護者のいる部屋を探そう。'],cells:Array.from({length:size()*size()},()=>({trap:false,open:false,flag:false,type:''}))};let safe=new Set([start,...around(start)]),p=start;while(p!==boss){let choices=[];if(p%size()!==boss%size())choices.push(p+(p%size()<boss%size()?1:-1));if((p/size()|0)!==(boss/size()|0))choices.push(p+(p<boss?size():-size()));p=choices[Math.random()*choices.length|0];safe.add(p)}let pool=s.cells.map((_,i)=>i).filter(i=>!safe.has(i)),count=Math.min(trapCount(floor,size()),pool.length);for(let n=0;n<count;n++){let k=Math.random()*pool.length|0;s.cells[pool.splice(k,1)[0]].trap=true}for(let i=0;i<size()*size();i++)if(i!==start&&i!==boss&&!s.cells[i].trap)s.cells[i].type='';s.cells[boss].type='boss';s.cells[start].type='stairs';s.cells[start].open=true;if(profile)Object.assign(s,profile);else{for(const key of PARTY_FIELDS)s[key]=[];s.reserve=[];s.partyVersion=1;}ensureProfile();render()}
dist/game.js:16:function num(i){return around(i).filter(j=>s.cells[j].trap).length}function save(){try{localStorage.setItem('ash-v1',JSON.stringify(rosterSaveState()))}catch{}}function markDeaths(){s.members.forEach((m,i)=>{if(s.hp[i]<=0&&m.status==='ok')m.status='dead'})}
dist/game.js:36:function renderStats(){ $('#partyreorder').disabled=!idle()||s.done; $('#statsbody').innerHTML=s.members.map((_,i)=>{let m=shownMember(i);let values=[['HP',`${(displayVitals?.hp||s.hp)[i]}/${m.maxHP}`],['MP',`${(displayVitals?.mp||s.mp)[i]}/${m.maxMP}`],['STR',m.str],['AC',effectiveAC(i)],['IQ',m.intelligence],['PIE',m.piety],['経験値',m.xp],['NEXT',m.level>=LEVEL_CAP?'上限':Math.max(0,requiredXP(m.level+1,i)-m.xp)]];return `<article class="statcard"><h3>${NAMES[i]} <small>Lv.${m.level} · ${i<3?'前衛':'後衛'}</small>${ailmentTags(i)}</h3><dl class="stat-metrics">${values.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div class="stat-actions"><button data-stat-inventory="${i}" ${!idle()?'disabled':''}>アイテム</button>${hasSpells(i)?`<button data-stat-cast="${i}" ${s.enemy||logBusy()?'disabled':''}>呪文</button>`:''}</div></article>`}).join('')}
dist/game.js:40:function renderCatalog(){ $('#catalogbody').innerHTML=`<table><thead><tr><th>敵</th><th>HP</th><th>攻撃</th><th>AC</th><th>経験値</th><th>群れ</th><th>金貨</th></tr></thead><tbody>${ENEMIES.map(e=>`<tr><td>${e.name}</td><td>${diceLabel({dice:e.hp})}</td><td>${diceLabel({dice:e.attack})}</td><td>${e.ac}</td><td>${e.xp}</td><td>${e.groupSize.join("〜")}体</td><td>${diceLabel({dice:e.gold})} ÷3（切捨）</td></tr>`).join('')}</tbody></table>`}
dist/game.js:46:function idle(){return !currentChest()&&!logBusy()&&!s.enemy&&!s.pendingBoss&&!s.pendingStairs}
dist/game.js:47:function enterTown(){if(!idle())return;s.area='town';s.light=false;s.watchful=false;s.dumapicUses=0;s.ailments=s.ailments.map(()=>({poison:false,paralysis:0}));levelUp();s.hp=s.members.map(m=>m.status==='ok'?m.maxHP:0);s.mp=s.members.map((m,i)=>m.status==='ok'?m.maxMP:s.mp[i]);s.scan=5;s.commands=s.members.map((m,i)=>i<3?'fight':'guard');s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;resetDungeon();render();showLevelReport()}
dist/game.js:49:function enterDungeon(){if(!s.members.length||s.area!=='town'||!idle())return;if(s.members.some(m=>m.status!=='ok')){$('#townnotice').textContent='死亡したメンバーを外してください。';render();return;}$('#townnotice').textContent='';if(s.done||s.floor!==1||!s.dungeonCycleVersion)resetDungeon();s.area='dungeon';s.pos=s.start;s.cells[s.start].open=true;log('迷宮へ入った。');render()}
dist/game.js:57:function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
dist/game.js:58:function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
dist/game.js:65:function render(){ensureProfile();$('#clearresult').hidden=s.area!=='dungeon'||!s.clearNotice||s.done||logBusy()||!!visibleCombat();$('#cleartown').disabled=!idle();$('#clearchestnotice').hidden=!currentChest();$('#clearedmark').hidden=!s.cleared;$('#entrance').disabled=!s.members.length;$('#blacksmith').disabled=!s.members.length;$('#emptyparty').hidden=!!s.members.length;renderFlags();$('#board').style.gridTemplateColumns=`repeat(${size()},1fr)`;$('.maplocation').textContent=`地下${s.floor}階`;let shownHP=displayVitals?.hp||s.hp,shownMP=displayVitals?.mp||s.mp;s.dir??=1;s.commands??=['fight','fight','fight'];save();$('#gametitle').hidden=s.area!=='town';$('header').classList.toggle('in-dungeon',s.area!=='town');$('#town').hidden=s.area!=='town';$('#dungeon').hidden=s.area==='town';$('#backtown').hidden=s.area==='town'||!s.done;$('#backtown').disabled=logBusy();$('#maptoggle').hidden=s.area!=='dungeon';if($('#statsdialog').open)renderStats();$('#status').textContent=`金貨 ${s.gold} G${s.relic?' / 秘宝 ✦':''}`;$('#party').innerHTML=NAMES.map((n,i)=>`${i%3===0?`<div class="party-rank">${i===0?'前衛':'後衛'}</div>`:''}<div class="card"><b>${n} <small>Lv.${shownMember(i).level}</small>${ailmentTags(i)}</b><div class="hpbar ${shownHP[i]<=shownMember(i).maxHP/6?'low':''}" role="progressbar" aria-label="${n}のHP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxHP}" aria-valuenow="${shownHP[i]}"><div class="hpfill" style="width:${shownHP[i]/shownMember(i).maxHP*100}%"></div><span class="hpvalue">${shownHP[i]}/${shownMember(i).maxHP}</span></div><div class="mpbar" role="progressbar" aria-label="${n}のMP" aria-valuemin="0" aria-valuemax="${shownMember(i).maxMP||1}" aria-valuenow="${shownMP[i]}"><div style="width:${shownMember(i).maxMP?shownMP[i]/shownMember(i).maxMP*100:0}%"></div><span>${shownMP[i]}/${shownMember(i).maxMP}</span></div></div>`).join('');$('#board').innerHTML=s.cells.map((c,i)=>`<button class="cell ${c.open?'open':''} ${s.pos===i?'here':''} ${[target(),target(-1),target(1),...diagonalSight()].includes(i)?'in-view':''} ${c.open&&c.type==='boss'?'boss-cell':''}" data-i="${i}"  aria-label="${(i/size()|0)+1}行${i%size()+1}列 ${s.pos===i?'現在地 ':''}${c.open?'周囲の罠'+num(i):c.flag?FLAG_NAMES[placedFlag(c)]:'未探索'}">${s.pos===i?`<svg class="direction-marker" viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,3 34,35 6,35" transform="rotate(${s.dir*90} 20 20)" fill="#d7b881" fill-opacity=".12" stroke="#d7b881" stroke-width="1.5" stroke-linejoin="round"/></svg>`:''}<span class="cell-number" style="${c.flag?'color:'+FLAG_COLORS[placedFlag(c)]:''}">${s.pos===i?num(i):c.open?(c.type==='boss'?'☠':c.chest&&!c.chest.opened?'▣':c.type==='down'?'⇩':c.type==='stairs'?'⇧':c.spent?'×':num(i)):c.flag?'⚑':c.safe?'✓':''}</span></button>`).join('');$('#log').replaceChildren(...s.logs.map(t=>{let d=document.createElement('div');d.innerHTML=coloredLog(t);return d}));$('#bosschoice').hidden=!s.pendingBoss&&!s.pendingStairs;$('#bossyes').disabled=logBusy();$('#bossno').disabled=logBusy();let combat=visibleCombat();$('.controls').hidden=!!combat||!!s.enemy;$('#battle').hidden=!combat;$('#commandreviewpopup').hidden=true;if(combat){$('#battle').innerHTML=`<div id="commandentry"></div><button id="flee">逃げる</button>`;$('#flee').onclick=flee;$('#flee').disabled=logBusy()||combat.boss||combat.flagEffect?.bad;renderCommandEntry()}$('#frontflag').disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss||target()<0;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!currentChest()||s.area!=='dungeon'||!!s.pendingStairs||logBusy()||s.done||!!s.enemy||!!s.pendingBoss);$('#chestactions').hidden=!currentChest()||!!s.enemy||!!visibleCombat()||logBusy()||s.done;$('#chestthief').hidden=thiefMember()<0;$('#chestthief').disabled=logBusy();$('#chestcalfo').hidden=calfoCaster()<0;$('#chestcalfo').disabled=logBusy();$('#chestopen').disabled=logBusy();$('#chestabandon').disabled=logBusy();scene()}
dist/game.js:70:$('#cleartown').onclick=enterTown;$('#backtown').onclick=enterTown;$('#entrance').onclick=enterDungeon;$('#blacksmith').onclick=()=>{if(!s.members.length)return;renderShop();$('#shopdialog').showModal()};$('#shopclose').onclick=()=>$('#shopdialog').close();$('#inventoryclose').onclick=()=>$('#inventorydialog').close();$('#shopmember').onchange=()=>{renderShop();$('#shopnotice').textContent=''};$('#shopitems').onclick=e=>{let b=e.target.closest('[data-buy]');if(b)buy(b.dataset.buy,+$('#shopmember').value)};$('#shopinventory').onclick=()=>openInventory(+$('#shopmember').value);$('#inventoryslots').onclick=e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.useMedicine!==undefined)openMedicine(inventoryMember,+b.dataset.useMedicine);if(b.dataset.equip!==undefined)equip(inventoryMember,+b.dataset.equip);if(b.dataset.sell!==undefined)sell(inventoryMember,+b.dataset.sell)};

exec
/bin/bash -lc "sed -n '1,65p' tests/training.cjs && tail -100 tests/training.cjs" in /workspace/dungeonsweeper
 succeeded in 0ms:
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
/bin/bash -lc "sed -n '30,100p' dist/index.html && cat tests/training-browser.py" in /workspace/dungeonsweeper
 succeeded in 0ms:
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

codex
020の死亡状態と、パーティー・控えを一意のIDで管理する仕組みを確認しました。寺院では両方を対象にし、蘇生結果と金貨を既存のセーブ形式で保存します。成功時はHP1となり、MPはそのままにします。

exec
/bin/bash -lc "cat dist/recruits.js && head -30 dist/party.js && sed -n '50,58p' dist/game.js" in /workspace/dungeonsweeper
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
function answerStairs(yes){if(logBusy()||!s.pendingStairs)return;let down=s.pendingStairs==='down';s.pendingStairs=false;if(yes){if(down)travelFloor(s.floor+1);else if(s.floor>1)travelFloor(s.floor-1);else enterTown();}else{log('階段の前にとどまった。');render()}}
function defeat(){s.done=true;s.enemy=null;s.pendingBoss=null;s.pendingStairs=false;log('一行は全滅した。町で態勢を立て直そう。')}
function weightedLoot(pool){let total=pool.reduce((n,x)=>n+x.weight,0),roll=Math.random()*total;for(let entry of pool){roll-=entry.weight;if(roll<0)return entry.item}return pool.at(-1).item}
function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floor).filter(x=>x.item.drop);if(!pool.length)return;let w=weightedLoot(pool),i=s.members.map((m,i)=>i).find(i=>w.classes.includes(jobOf(i))&&s.inventory[i].length<10);if(i===undefined){log(`${w.name}を見つけたが、アイテムがいっぱいだ。`);return}s.inventory[i].push(w.id);log(`${w.name}を入手。${NAMES[i]}が受け取った。`)}
function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
s=Path('dist/index.html').read_text()
for start,end in [('<section id=\"town\"','<section id=\"dungeon\"'),('<dialog id=\"shopdialog\"','</dialog>')]:
 p=s.find(start); q=s.find(end,p+len(start));print(s[p:q+len(end)])
PY
command -v chromium
python3 -c 'import playwright.sync_api'" in /workspace/dungeonsweeper
 exited 1 in 0ms:

<dialog id="shopdialog" aria-labelledby="shoptitle"><div class="dialoghead"><h2 id="shoptitle">鍛冶屋</h2><button id="shopclose" aria-label="閉じる">×</button></div><div class="shoptoolbar"><select id="shopmember" aria-label="購入するメンバー"><option value="0">戦士</option><option value="1">魔法使い</option><option value="2">僧侶</option></select><span id="shopgold"></span><button id="shopinventory">アイテム・売却</button></div><p id="shopnotice" role="status"></p><div id="shopitems"></div></dialog>
Traceback (most recent call last):
  File "<string>", line 1, in <module>
    import playwright.sync_api
ModuleNotFoundError: No module named 'playwright'

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
s=Path('dist/index.html').read_text();p=s.index('id=\"blacksmith\"'); print(s[p-500:p+300])
PY
rg -n 'death|dead|ash|lost' tests/game.cjs | tail -16
rg --files report tests .agents .codex 2>/dev/null" in /workspace/dungeonsweeper
 exited 2 in 0ms:
="iconbutton" aria-label="ステータス" title="ステータス"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3Z"/></svg></button><section id="town" class="panel" hidden><div class="townart" aria-hidden="true">♜</div><h2>灯の町</h2><p id="townnotice" role="status"></p><small id="clearedmark" hidden>迷宮踏破済み</small><button id="resetopen">冒険データをリセット</button><div class="townmenu"><button id="trainingopen">訓練所</button><button id="tavernopen">酒場</button><button id="blacksmith">鍛冶屋</button><button id="entrance">迷宮への入り口</button></div></section><p id="emptyparty" role="status">訓練所で冒険者を作成し、パーティに加入させてください。</p><section id="clearresult" class="panel" aria-labelledby="cleartitle" hidden><h2 id="cleartitle">迷宮踏破</h2><p>迷宮の主は倒れた。迷宮に静寂が戻った……</p><p id="clearchestnotic
1:const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
181:resetMonstersTest('rabbit');Math.random=()=>0;monsterOnHit(s.enemy.units[0],0);if(s.hp[0]!==0)throw Error('instant death');
188:}`);console.log('PASS monster floor pools, guardians, flee rewards, mixed victory, summon cap/timing, multi-hit/rear, spell/breath, statuses, instant death, drain, theft, resistances and save migration');
189:drain();run(`{s.done=false;s.hp=s.members.map(()=>20);s.enemy={units:[{id:'skeleton',uid:0,row:0,hp:10},{id:'wolf',uid:1,row:1,hp:10}]};let priest=s.members.findIndex((m,i)=>jobOf(i)===2),mp=s.mp[priest];Math.random=()=>0;dispelUndead(priest);if(s.enemy.units[0].hp!==0||s.enemy.units[1].hp!==10||s.enemy.pendingXP||s.mp[priest]!==mp)throw Error('dispel effect');s.enemy.units[0].hp=10;s.enemy.units[0].rewarded=false;s.enemy.units[0].escaped=false;Math.random=()=>.999;dispelUndead(priest);if(s.enemy.units[0].hp!==10)throw Error('dispel failure');}`);console.log('PASS dispel success/failure, undead only, no MP or XP');
201:if(s.pos!==1||s.hp[0]!==0)throw Error('poison death on movement');
204:if(poisonDeathEntries.length!==1||poisonDeathEntries[0].hp[0]!==0)throw Error('poison death log / snapshot');
208:if(s.pos!==0||s.hp[0]!==0||logQueue.some(e=>e.text===poisonDeathText))throw Error('duplicate poison death');
209:if(s.logs.filter(t=>t===poisonDeathText).length!==1)throw Error('rendered poison death count');
216:if(s.hp[0]!==0||logQueue.filter(e=>e.text===poisonDeathText).length!==1||!logQueue.some(e=>e.text===NAMES[0]+'は毒で2ダメージ。'))throw Error('combat poison death and damage logs');`);
222:console.log('PASS exploration poison death once with HP snapshot, silent nonfatal movement and combat poison logs');
242:  if(legacyIds.some(id=>!weapon(id)))throw Error('legacy equipment ids lost');
270:    if(s.members.some((m,i)=>m.xp!==before[i]+(alive.includes(i)?expected:0)))throw Error('survivor XP split / dead exclusion');
277:console.log('PASS XP split 100/3=33, 100/1=100, dead exclusion, minimum 1, zero reward, no survivors, per-person log and duplicate guard');
284:require('./death-status.cjs');
tests/death-status.cjs
tests/final-boss.cjs
tests/training.cjs
tests/game.cjs
tests/training-browser.py

exec
/bin/bash -lc 'cat tests/death-status.cjs' in /workspace/dungeonsweeper
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
combat.run(`s.ailments=s.members.map(()=>({poison:true,paralysis:4}));enterTown();`);
assert.equal(combat.run('s.area'), 'town');
assert.equal(combat.run('s.hp[2]'), 0);
assert.equal(combat.run('s.mp[2]'), 1, 'dead members do not refill MP');
assert.equal(combat.run('s.mp[1]===s.members[1].maxMP'), true);
assert.equal(combat.run("s.hp.every((h,i)=>i===2?h===0:h===s.members[i].maxHP)"), true);
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

exec
/bin/bash -lc 'cat scripts/sim/harness.cjs' in /workspace/dungeonsweeper
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

exec
/bin/bash -lc "rg -n 'function .*scape|escapeHTML|escapeHtml' dist/game.js dist/*.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
dist/game.js:13:function encounter(i,unexplored=false,action='forward'){let boss=s.cells[i].type==='boss',formation=monsterFormation(boss),units=[];for(let [row,id] of formation.slice(0,3).entries()){let [min,max]=enemyDefinition(id).groupSize,n=min+(Math.random()*(max-min+1)|0);for(let j=0;j<n;j++)units.push({...makeEnemy(id,units.length),row})}resetCommandEntry();s.attackRows=s.members.map(()=>0);s.enemy={dataVersion:1,flagEffect:flagEffect(),boss,chestBattle:unexplored,lootGold:0,units,target:0,escapeTo:s.previousPos??s.start,initiative:rollInitiative(action,boss)};identifyEnemies();let message={normal:'敵が現れた！',enemy:'敵の奇襲！',party:'敵はまだ気づいていない！'}[s.enemy.initiative];log(message,{encounter:true});if(s.enemy.flagEffect.bad)log('誤った旗がパーティーを惑わせた！');if(s.enemy.initiative==='enemy'){s.enemy.initiative='normal';enemyTurn(s.members.map(()=>'fight'))}}
dist/game.js:101:function escapeChance(){if(!s.enemy||s.enemy.boss||s.enemy.flagEffect?.bad)return 0;let party=s.members.reduce((a,m,i)=>{if(s.hp[i]>0&&!s.ailments[i].poison&&!s.ailments[i].paralysis){a.total+=m.level;a.count++}return a},{total:0,count:0}),enemies=s.enemy.units.reduce((a,e)=>{if(e.hp>0&&!e.sleep){a.total+=monsterLevel(e);a.count++}return a},{total:0,count:0});if(!party.count)return 10;let bonus=party.count===1?15:party.count===2?10:party.count===3?5:0,partyAverage=party.total/party.count,enemyAverage=enemies.count?enemies.total/enemies.count:0;return Math.max(10,Math.min(95,50+5*(partyAverage-enemyAverage)+bonus))}
dist/game.js:102:function flee(){if(logBusy()||!s.enemy||s.done||s.enemy.boss||s.enemy.flagEffect?.bad)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}if(Math.random()*100<escapeChance()){let from=s.pos,to=s.enemy.escapeTo??s.previousPos??s.start;if(!adjacent(from,to)){to=around(from).find(i=>adjacent(from,i)&&s.cells[i].open&&!s.cells[i].trap)??from}s.enemy=null;s.pos=to;s.previousPos=from;log('逃走に成功。一歩前のマスへ戻った。')}else{log('逃走に失敗！');if(s.enemy.initiative==='party')s.enemy.initiative='normal';else enemyTurn(s.members.map(()=>'flee'))}render()}
dist/monsters.js:3:function monsterAction(e,cmds){let d=enemyDefinition(e.id),r=Math.random(),name=enemyDisplay(e);if((r-=d.flee)<0&&!d.boss){e.hp=0;e.rewarded=true;e.escaped=true;log(`${name}は逃げ出した。`);return true}if((r-=d.summon)<0){let group=s.enemy.units.filter(x=>rowKey(x)===rowKey(e)&&x.hp>0),summoned=s.enemy.summoned||0;if(summoned<4&&group.length<d.summonCap){let uid=Math.max(...s.enemy.units.map(x=>x.uid))+1;s.enemy.units.push({...makeEnemy(e.id,uid),row:e.row,identified:e.identified});s.enemy.summoned=summoned+1;log(`${name}は仲間を呼んだ。`)}else log(`${name}は仲間を呼んだが、現れなかった。`);return true}if(d.breath&&(r-=d.breath.chance)<0){log(`${name}は${d.breath.element}のブレスを吐いた。`);for(let i=0;i<s.hp.length;i++)if(s.hp[i]>0)monsterHurt(i,dice(...d.breath.dice).value,cmds,name);return true}if((r-=d.spell)<0){let alive=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(alive.length){let sp=d.spellInfo||{name:'ハリト',target:'one',dice:[1,8,0]};log(`${name}は${sp.name}を唱えた。`);for(let i of sp.target==='all'?alive:[alive[Math.random()*alive.length|0]])monsterHurt(i,dice(...sp.dice).value,cmds,name)}return true}return false}
dist/game.js:13:function encounter(i,unexplored=false,action='forward'){let boss=s.cells[i].type==='boss',formation=monsterFormation(boss),units=[];for(let [row,id] of formation.slice(0,3).entries()){let [min,max]=enemyDefinition(id).groupSize,n=min+(Math.random()*(max-min+1)|0);for(let j=0;j<n;j++)units.push({...makeEnemy(id,units.length),row})}resetCommandEntry();s.attackRows=s.members.map(()=>0);s.enemy={dataVersion:1,flagEffect:flagEffect(),boss,chestBattle:unexplored,lootGold:0,units,target:0,escapeTo:s.previousPos??s.start,initiative:rollInitiative(action,boss)};identifyEnemies();let message={normal:'敵が現れた！',enemy:'敵の奇襲！',party:'敵はまだ気づいていない！'}[s.enemy.initiative];log(message,{encounter:true});if(s.enemy.flagEffect.bad)log('誤った旗がパーティーを惑わせた！');if(s.enemy.initiative==='enemy'){s.enemy.initiative='normal';enemyTurn(s.members.map(()=>'fight'))}}
dist/game.js:101:function escapeChance(){if(!s.enemy||s.enemy.boss||s.enemy.flagEffect?.bad)return 0;let party=s.members.reduce((a,m,i)=>{if(s.hp[i]>0&&!s.ailments[i].poison&&!s.ailments[i].paralysis){a.total+=m.level;a.count++}return a},{total:0,count:0}),enemies=s.enemy.units.reduce((a,e)=>{if(e.hp>0&&!e.sleep){a.total+=monsterLevel(e);a.count++}return a},{total:0,count:0});if(!party.count)return 10;let bonus=party.count===1?15:party.count===2?10:party.count===3?5:0,partyAverage=party.total/party.count,enemyAverage=enemies.count?enemies.total/enemies.count:0;return Math.max(10,Math.min(95,50+5*(partyAverage-enemyAverage)+bonus))}
dist/game.js:102:function flee(){if(logBusy()||!s.enemy||s.done||s.enemy.boss||s.enemy.flagEffect?.bad)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}if(Math.random()*100<escapeChance()){let from=s.pos,to=s.enemy.escapeTo??s.previousPos??s.start;if(!adjacent(from,to)){to=around(from).find(i=>adjacent(from,i)&&s.cells[i].open&&!s.cells[i].trap)??from}s.enemy=null;s.pos=to;s.previousPos=from;log('逃走に成功。一歩前のマスへ戻った。')}else{log('逃走に失敗！');if(s.enemy.initiative==='party')s.enemy.initiative='normal';else enemyTurn(s.members.map(()=>'flee'))}render()}

apply patch
patch: completed
/workspace/dungeonsweeper/dist/game.js
diff --git a/dist/game.js b/dist/game.js
index 3094c60bf59a7cacfc365a3d85834b01849a83e6..be2188e0604c70d8649bdf402045aee825d2e1f5
--- a/dist/game.js
+++ b/dist/game.js
@@ -54,6 +54,43 @@
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
+// 寺院の費用・成功率は本作の暫定式。成功率は百分率で返す。
+function templeCost(m){return m.status==='dead'?100*m.level:m.status==='ash'?250*m.level:0}
+function templeChance(m){return m.status==='dead'?Math.max(50,Math.min(95,50+3*m.level)):m.status==='ash'?Math.max(40,Math.min(90,40+3*m.level)):0}
+function templeRaise(id){
+ if(s.area!=='town'||!idle())return false;
+ const r=trainingRoster().find(r=>r.members.id===id);
+ if(!r||!['dead','ash'].includes(r.members.status))return false;
+ const m=r.members,cost=templeCost(m);
+ if(s.gold<cost)return false;
+ s.gold-=cost;
+ const success=Math.random()*100<templeChance(m);
+ m.status=success?'ok':m.status==='dead'?'ash':'lost';
+ const i=s.members.findIndex(m=>m.id===id),hp=success?1:0;
+ if(i>=0)s.hp[i]=hp;else r.hp=hp;
+ const result={id,name:m.name||CLASSES[m.job??0].name,success,status:m.status,cost};
+ render();renderTemple(result);
+ return result;
+}
+function renderTemple(result=null){
+ $('#templegold').textContent=`金貨 ${s.gold} G`;
+ if(result)$('#templ enotice'.replace(' ','')).textContent=result.success?`${result.name}は蘇生した。HPが1になった。`:`${result.name}の蘇生に失敗した。${result.status==='ash'?'灰になった。':'ロストした。'}`;
+ const list=$('#templemembers');list.replaceChildren();
+ const records=trainingRoster().filter(r=>['dead','ash'].includes(r.members.status));
+ if(!records.length){const p=document.createElement('p');p.textContent='蘇生が必要な冒険者はいません。';list.append(p)}
+ for(const r of records){
+  const m=r.members,row=document.createElement('div'),info=document.createElement('div'),name=document.createElement('b'),detail=document.createElement('small'),price=document.createElement('span'),button=document.createElement('button');
+  row.className='shopitem';
+  name.textContent=m.name||CLASSES[m.job??0].name;
+  detail.textContent=`${s.members.some(p=>p.id===m.id)?'パーティ':'控え'} · Lv.${m.level} · ${m.status==='dead'?'死亡':'灰'} · 成功率 ${templeChance(m)}%`;
+  price.textContent=`${templeCost(m)} G`;button.textContent='蘇生';
+  button.disabled=s.area!=='town'||!idle()||s.gold<templeCost(m);
+  button.onclick=()=>templeRaise(m.id);
+  info.append(name,detail);row.append(info,price,button);list.append(row);
+ }
+}
+$('#templeopen').onclick=()=>{if(s.area!=='town'||!idle())return;$('#templ enotice'.replace(' ','')).textContent='';renderTemple();$('#templedialog').showModal()};
+$('#templeclose').onclick=()=>$('#templedialog').close();
 function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
 function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
 function openInventory(i){if(!idle())return;inventoryMember=i;renderInventory();$('#inventorydialog').showModal()}

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('dist/game.js');s=p.read_text().replace(\"'#templ enotice'.replace(' ','')\", \"'#templenotice'\");p.write_text(s)
p=Path('dist/index.html');s=p.read_text().replace('<button id=\"blacksmith\">鍛冶屋</button>','<button id=\"blacksmith\">鍛冶屋</button><button id=\"templeopen\">寺院</button>');s=s.replace('<dialog id=\"shopdialog\"','<dialog id=\"templedialog\" aria-labelledby=\"templetitle\"><div class=\"dialoghead\"><h2 id=\"templetitle\">寺院</h2><button id=\"templeclose\" aria-label=\"閉じる\">×</button></div><div class=\"shoptoolbar\"><span id=\"templegold\"></span></div><p>死亡・灰の冒険者を蘇生します。失敗すると死亡は灰に、灰はロストになります。費用は成否にかかわらず消費します。</p><p id=\"templenotice\" role=\"status\"></p><div id=\"templemembers\"></div></dialog><dialog id=\"shopdialog\"');p.write_text(s)
p=Path('docs/SPECIFICATION.md');s=p.read_text().replace('町（酒場・鍛冶屋・迷宮入口）','町（酒場・鍛冶屋・寺院・迷宮入口）').replace('酒場で外す必要がある。寺院と灰・ロストへの移行はまだ未実装。','寺院で蘇生するか、酒場で外す必要がある。');needle='旧セーブの状態未設定メンバーは';pos=s.index(needle);s=s[:pos]+'寺院では町で操作待ちのときのみ、パーティーと控えの死亡・灰のメンバーを蘇生できる。費用と成功率は**本作の暫定式**。死亡の費用は100×Lv G、成功率はclamp(50＋3×Lv,50,95)%、灰の費用は250×Lv G、成功率はclamp(40＋3×Lv,40,90)%（clampは下限・上限で制限）。成功時は正常・HP1に戻り、MPは変化しない。失敗時は死亡→灰、灰→ロストとなり、HP0を維持する。費用は成否にかかわらず消費し、金貨不足時は実行できない。正常・ロストは蘇生対象外。結果の状態・HP・金貨は既存の "'`ash-v1` に保存する。'"\\n'+s[pos:];p.write_text(s)
PY" in /workspace/dungeonsweeper
 succeeded in 0ms:
codex
寺院の画面と蘇生処理を追加しました。これから成功・失敗の4パターン、金貨不足、控え、保存・再読込、町以外での実行拒否を検証します。ブラウザ検証用のChromiumとPlaywrightは、この環境には見つかりませんでした。

apply patch
patch: completed
/workspace/dungeonsweeper/tests/game.cjs
/workspace/dungeonsweeper/tests/temple.cjs
diff --git a/dist/game.js b/dist/game.js
index 3094c60bf59a7cacfc365a3d85834b01849a83e6..be2188e0604c70d8649bdf402045aee825d2e1f5
--- a/dist/game.js
+++ b/dist/game.js
@@ -54,6 +54,43 @@
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
+// 寺院の費用・成功率は本作の暫定式。成功率は百分率で返す。
+function templeCost(m){return m.status==='dead'?100*m.level:m.status==='ash'?250*m.level:0}
+function templeChance(m){return m.status==='dead'?Math.max(50,Math.min(95,50+3*m.level)):m.status==='ash'?Math.max(40,Math.min(90,40+3*m.level)):0}
+function templeRaise(id){
+ if(s.area!=='town'||!idle())return false;
+ const r=trainingRoster().find(r=>r.members.id===id);
+ if(!r||!['dead','ash'].includes(r.members.status))return false;
+ const m=r.members,cost=templeCost(m);
+ if(s.gold<cost)return false;
+ s.gold-=cost;
+ const success=Math.random()*100<templeChance(m);
+ m.status=success?'ok':m.status==='dead'?'ash':'lost';
+ const i=s.members.findIndex(m=>m.id===id),hp=success?1:0;
+ if(i>=0)s.hp[i]=hp;else r.hp=hp;
+ const result={id,name:m.name||CLASSES[m.job??0].name,success,status:m.status,cost};
+ render();renderTemple(result);
+ return result;
+}
+function renderTemple(result=null){
+ $('#templegold').textContent=`金貨 ${s.gold} G`;
+ if(result)$('#templ enotice'.replace(' ','')).textContent=result.success?`${result.name}は蘇生した。HPが1になった。`:`${result.name}の蘇生に失敗した。${result.status==='ash'?'灰になった。':'ロストした。'}`;
+ const list=$('#templemembers');list.replaceChildren();
+ const records=trainingRoster().filter(r=>['dead','ash'].includes(r.members.status));
+ if(!records.length){const p=document.createElement('p');p.textContent='蘇生が必要な冒険者はいません。';list.append(p)}
+ for(const r of records){
+  const m=r.members,row=document.createElement('div'),info=document.createElement('div'),name=document.createElement('b'),detail=document.createElement('small'),price=document.createElement('span'),button=document.createElement('button');
+  row.className='shopitem';
+  name.textContent=m.name||CLASSES[m.job??0].name;
+  detail.textContent=`${s.members.some(p=>p.id===m.id)?'パーティ':'控え'} · Lv.${m.level} · ${m.status==='dead'?'死亡':'灰'} · 成功率 ${templeChance(m)}%`;
+  price.textContent=`${templeCost(m)} G`;button.textContent='蘇生';
+  button.disabled=s.area!=='town'||!idle()||s.gold<templeCost(m);
+  button.onclick=()=>templeRaise(m.id);
+  info.append(name,detail);row.append(info,price,button);list.append(row);
+ }
+}
+$('#templeopen').onclick=()=>{if(s.area!=='town'||!idle())return;$('#templ enotice'.replace(' ','')).textContent='';renderTemple();$('#templedialog').showModal()};
+$('#templeclose').onclick=()=>$('#templedialog').close();
 function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
 function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
 function openInventory(i){if(!idle())return;inventoryMember=i;renderInventory();$('#inventorydialog').showModal()}
diff --git a/tests/game.cjs b/tests/game.cjs
index a7f1d3dbe1396796d8dee028d3c652e4a23078a5..67370fcd38245647328c6a57d20f41d497f819b1
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -282,3 +282,4 @@
 require('./final-boss.cjs');
 
 require('./death-status.cjs');
+require('./temple.cjs');
diff --git a/tests/temple.cjs b/tests/temple.cjs
new file mode 100644
index 0000000000000000000000000000000000000000..0448135ab72b703adb47bc70388bf1139016f5ce
--- /dev/null
+++ b/tests/temple.cjs
@@ -0,0 +1,126 @@
+const assert = require('node:assert/strict');
+const fs = require('node:fs');
+const path = require('node:path');
+const { game } = require('../scripts/sim/harness.cjs');
+
+function fixture(status = 'dead', reserve = false, level = 5) {
+  const g = game(null, () => .5);
+  g.run(`var recruit=generateRecruit('蘇生([対象',2);registerRecruit(recruit);
+    ${reserve ? '' : 'changeRecruitParty(recruit.members.id,true);'}
+    var id=recruit.members.id,r=trainingRoster()[0];
+    r.members.status='${status}';r.members.level=${level};
+    if(s.members.length){s.hp[0]=0;s.mp[0]=2}else{r.hp=0;r.mp=2}
+    s.gold=10000;save();`);
+  return g;
+}
+function reload(g) { return game(g.run("localStorage.getItem('ash-v1')")); }
+
+for (const reserve of [false, true]) {
+  for (const [status, roll, expected, cost] of [
+    ['dead', 0, 'ok', 500], ['dead', .999, 'ash', 500],
+    ['ash', 0, 'ok', 1250], ['ash', .999, 'lost', 1250],
+  ]) {
+    const g = fixture(status, reserve);
+    const before = JSON.parse(g.run('JSON.stringify(trainingRoster()[0])'));
+    g.run(`Math.random=()=>${roll};var result=templeRaise(id)`);
+    assert.equal(g.run('result.status'), expected);
+    assert.equal(g.run('result.success'), expected === 'ok');
+    assert.equal(g.run('result.cost'), cost);
+    assert.equal(g.run('result.id===id'), true);
+    assert.equal(g.run('s.gold'), 10000 - cost);
+    const after = JSON.parse(g.run('JSON.stringify(trainingRoster()[0])'));
+    before.members.status = expected; before.hp = expected === 'ok' ? 1 : 0;
+    assert.deepEqual(after, before, 'only status and HP change; MP, XP, equipment and identity stay intact');
+    const restored = reload(g);
+    assert.equal(restored.run('s.gold'), 10000 - cost);
+    assert.equal(restored.run('s.members.length'), reserve ? 0 : 1);
+    assert.deepEqual(JSON.parse(restored.run('JSON.stringify(trainingRoster()[0])')), after);
+    assert.match(g.run("$('#templenotice').textContent"), expected === 'ok' ? /蘇生した/ : expected === 'ash' ? /灰になった/ : /ロストした/);
+    if (expected === 'ok') {
+      if (reserve) restored.run('changeRecruitParty(s.reserve[0].members.id,true)');
+      restored.run('enterDungeon()'); restored.drain();
+      assert.equal(restored.run('s.area'), 'dungeon');
+      assert.equal(restored.run('s.hp[0]'), 1);
+    }
+  }
+}
+console.log('PASS temple: all four outcomes for party/reserve, fees, HP1, MP/XP preservation, save/reload and dungeon reentry');
+
+for (const [status, level, cost, chance] of [
+  ['dead', 1, 100, 53], ['dead', 5, 500, 65], ['dead', 15, 1500, 95], ['dead', 30, 3000, 95],
+  ['ash', 1, 250, 43], ['ash', 5, 1250, 55], ['ash', 17, 4250, 90], ['ash', 30, 7500, 90],
+]) {
+  const g = fixture(status, false, level);
+  assert.equal(g.run('templeCost(s.members[0])'), cost);
+  assert.equal(g.run('templeChance(s.members[0])'), chance);
+  g.run(`s.gold=${cost};Math.random=()=>${chance}/100;var result=templeRaise(id)`);
+  assert.equal(g.run('result.success'), false, 'at threshold fails');
+  assert.equal(g.run('s.gold'), 0, 'exact balance is sufficient even on failure');
+  g.run(`s.members[0].status='${status}';s.gold=${cost};Math.random=()=>(${chance}-.001)/100`);
+  assert.equal(g.run('templeRaise(id).success'), true, 'below threshold succeeds');
+}
+for (const status of ['dead', 'ash']) {
+  const g = fixture(status);
+  assert.equal(g.run(`templeChance({status:'${status}',level:0})`), status === 'dead' ? 50 : 40);
+  g.run('s.gold=templeCost(s.members[0])-1;Math.random=()=>{throw Error("must not roll")};save()');
+  const before = g.run('JSON.stringify(s)');
+  assert.equal(g.run('templeRaise(id)'), false);
+  assert.equal(g.run('JSON.stringify(s)'), before);
+}
+console.log('PASS temple formulas, caps, probability boundaries, exact gold and insufficient-gold rejection');
+
+for (const setup of [
+  "s.area='dungeon'", "s.enemy={units:[]}", 's.pendingBoss=1', "s.pendingStairs='up'",
+  "s.cells[s.pos].chest={opened:false}", "log('表示待ち')",
+  "s.members[0].status='ok'", "s.members[0].status='lost'", "id='missing'",
+]) {
+  const g = fixture();
+  g.run(setup);
+  g.run('Math.random=()=>{throw Error("must not roll")};save()');
+  const before = g.run('JSON.stringify(s)');
+  assert.equal(g.run('templeRaise(id)'), false, setup);
+  assert.equal(g.run('JSON.stringify(s)'), before, setup);
+  if (g.run("s.area!=='town'||!idle()")) {
+    g.run("$('#templeopen').onclick()");
+    assert.equal(g.run("!!$('#templedialog').open"), false, setup);
+  }
+}
+const retry = fixture();
+retry.run('Math.random=()=>.999;templeRaise(id);templeRaise(id)');
+assert.equal(retry.run('s.members[0].status'), 'lost');
+assert.equal(retry.run('s.gold'), 8250, 'dead fee then ash fee');
+assert.equal(retry.run('templeRaise(id)'), false, 'lost cannot be raised again');
+const success = fixture();
+success.run('Math.random=()=>0;templeRaise(id)');
+assert.equal(success.run('templeRaise(id)'), false, 'successful raise cannot be charged twice');
+console.log('PASS temple town/idle guards, invalid targets and repeated attempts');
+
+// Capture the temple DOM only, keeping the shared game harness unchanged.
+const ui = fixture();
+ui.run(`document.createElement=()=>({children:[],append(...nodes){this.children.push(...nodes)}});
+  Object.assign($('#templemembers'),{children:[],append(...nodes){this.children.push(...nodes)},replaceChildren(...nodes){this.children=nodes}});
+  registerRecruit(generateRecruit('控え',0));s.reserve[0].members.status='ash';s.reserve[0].hp=0;
+  registerRecruit(generateRecruit('正常',0));registerRecruit(generateRecruit('ロスト',0));s.reserve[2].members.status='lost';
+  s.gold=499;$('#templeopen').onclick();`);
+assert.equal(ui.run("$('#templedialog').open"), true);
+assert.equal(ui.run("$('#templemembers').children.length"), 2, 'only dead/ash are listed');
+assert.equal(ui.run("$('#templemembers').children[0].children[2].disabled"), true);
+assert.equal(ui.run("$('#templemembers').children[1].children[2].disabled"), false);
+assert.match(ui.run("$('#templemembers').children[0].children[0].children[1].textContent"), /パーティ.*死亡.*65%/);
+assert.match(ui.run("$('#templemembers').children[1].children[0].children[1].textContent"), /控え.*灰.*43%/);
+assert.equal(ui.run("$('#templemembers').children[0].children[0].children[0].textContent"), '蘇生([対象');
+ui.run(`s.gold=1000;renderTemple();var raiseButton=$('#templemembers').children[0].children[2];
+  changeRecruitParty(id,false);Math.random=()=>0;raiseButton.onclick();`);
+assert.equal(ui.run("s.reserve.find(r=>r.members.id===id).hp"), 1, 'button resolves stable ID after benching');
+assert.equal(ui.run("$('#templemembers').children.length"), 1);
+assert.equal(ui.run("$('#templegold').textContent"), '金貨 500 G');
+assert.match(ui.run("$('#templenotice').textContent"), /蘇生した/);
+ui.run("$('#templemembers').children[0].children[2].onclick()");
+assert.equal(ui.run("$('#templemembers').children[0].textContent"), '蘇生が必要な冒険者はいません。');
+ui.run("$('#templeclose').onclick();$('#templeopen').onclick()");
+assert.equal(ui.run("$('#templenotice').textContent"), '');
+const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
+assert.match(html, /<button id="templeopen">寺院<\/button>/);
+assert.match(html, /<dialog id="templedialog" aria-labelledby="templetitle">/);
+assert.match(html, /id="templenotice" role="status"/);
+console.log('PASS temple UI handlers: active/reserve list, fees/chances, disabled state, stable IDs, notices and empty state');

exec
/bin/bash -lc 'node tests/temple.cjs' in /workspace/dungeonsweeper
 exited 1 in 0ms:
node:assert:152
  throw new AssertionError(obj);
  ^

AssertionError [ERR_ASSERTION]: only status and HP change; MP, XP, equipment and identity stay intact
+ actual - expected
... Skipped lines

  {
    ailments: {
      paralysis: 0,
      poison: false
    },
...
        'kalki',
+       'watchful'
      ],
      level: 5,
      maxHP: 26,
      maxMP: 15,
      name: '蘇生([対象',

    at Object.<anonymous> (/workspace/dungeonsweeper/tests/temple.cjs:33:12)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: {
    members: {
      id: 'cda19f61-1ea3-476e-9a9b-da4b5424fdde',
      name: '蘇生([対象',
      job: 2,
      level: 5,
      xp: 0,
      maxHP: 26,
      maxMP: 15,
      attack: 1,
      ac: 7,
      str: 10,
      baseStr: 10,
      intelligence: 8,
      piety: 18,
      creationBonus: 6,
      xpTargets: [
            0,     0,   115,   345,   690,
         1150,  1725,  2415,  3220,  4140,
         5175,  6325,  7590,  8970, 10465,
        12075, 13800, 15640, 17595, 19665,
        21850, 24150, 26565, 29095, 31740,
        34500, 37375, 40365, 43470, 46690,
        50025
      ],
      xpCurveVersion: 2,
      known: [ 'dios', 'kalki', 'watchful' ],
      status: 'ok'
    },
    hp: 1,
    mp: 2,
    inventory: [ 'mace' ],
    equipped: 0,
    armor: {},
    ailments: { poison: false, paralysis: 0 }
  },
  expected: {
    members: {
      id: 'cda19f61-1ea3-476e-9a9b-da4b5424fdde',
      name: '蘇生([対象',
      job: 2,
      level: 5,
      xp: 0,
      maxHP: 26,
      maxMP: 15,
      attack: 1,
      ac: 7,
      str: 10,
      baseStr: 10,
      intelligence: 8,
      piety: 18,
      creationBonus: 6,
      xpTargets: [
            0,     0,   115,   345,   690,
         1150,  1725,  2415,  3220,  4140,
         5175,  6325,  7590,  8970, 10465,
        12075, 13800, 15640, 17595, 19665,
        21850, 24150, 26565, 29095, 31740,
        34500, 37375, 40365, 43470, 46690,
        50025
      ],
      xpCurveVersion: 2,
      known: [ 'dios', 'kalki' ],
      status: 'ok'
    },
    hp: 1,
    mp: 2,
    inventory: [ 'mace' ],
    equipped: 0,
    armor: {},
    ailments: { poison: false, paralysis: 0 }
  },
  operator: 'deepStrictEqual',
  diff: 'simple'
}

Node.js v24.22.1

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('tests/temple.cjs');s=p.read_text().replace('s.gold=10000;save();','s.gold=10000;render();');p.write_text(s)
PY
node tests/temple.cjs" in /workspace/dungeonsweeper
 succeeded in 82ms:
PASS temple: all four outcomes for party/reserve, fees, HP1, MP/XP preservation, save/reload and dungeon reentry
PASS temple formulas, caps, probability boundaries, exact gold and insufficient-gold rejection
PASS temple town/idle guards, invalid targets and repeated attempts
PASS temple UI handlers: active/reserve list, fees/chances, disabled state, stable IDs, notices and empty state

exec
/bin/bash -lc 'git diff --stat && git diff -- dist/game.js docs/SPECIFICATION.md tests/game.cjs && git diff --check' in /workspace/dungeonsweeper
 succeeded in 0ms:
 dist/game.js          | 37 +++++++++++++++++++++++++++++++++++++
 dist/index.html       |  4 ++--
 docs/SPECIFICATION.md |  5 +++--
 tests/game.cjs        |  1 +
 4 files changed, 43 insertions(+), 4 deletions(-)
diff --git a/dist/game.js b/dist/game.js
index 3094c60..2b19d89 100644
--- a/dist/game.js
+++ b/dist/game.js
@@ -54,6 +54,43 @@ function dropWeapon(){if(Math.random()>=.05)return;let pool=chestItemPool(s.floo
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
+// 寺院の費用・成功率は本作の暫定式。成功率は百分率で返す。
+function templeCost(m){return m.status==='dead'?100*m.level:m.status==='ash'?250*m.level:0}
+function templeChance(m){return m.status==='dead'?Math.max(50,Math.min(95,50+3*m.level)):m.status==='ash'?Math.max(40,Math.min(90,40+3*m.level)):0}
+function templeRaise(id){
+ if(s.area!=='town'||!idle())return false;
+ const r=trainingRoster().find(r=>r.members.id===id);
+ if(!r||!['dead','ash'].includes(r.members.status))return false;
+ const m=r.members,cost=templeCost(m);
+ if(s.gold<cost)return false;
+ s.gold-=cost;
+ const success=Math.random()*100<templeChance(m);
+ m.status=success?'ok':m.status==='dead'?'ash':'lost';
+ const i=s.members.findIndex(m=>m.id===id),hp=success?1:0;
+ if(i>=0)s.hp[i]=hp;else r.hp=hp;
+ const result={id,name:m.name||CLASSES[m.job??0].name,success,status:m.status,cost};
+ render();renderTemple(result);
+ return result;
+}
+function renderTemple(result=null){
+ $('#templegold').textContent=`金貨 ${s.gold} G`;
+ if(result)$('#templenotice').textContent=result.success?`${result.name}は蘇生した。HPが1になった。`:`${result.name}の蘇生に失敗した。${result.status==='ash'?'灰になった。':'ロストした。'}`;
+ const list=$('#templemembers');list.replaceChildren();
+ const records=trainingRoster().filter(r=>['dead','ash'].includes(r.members.status));
+ if(!records.length){const p=document.createElement('p');p.textContent='蘇生が必要な冒険者はいません。';list.append(p)}
+ for(const r of records){
+  const m=r.members,row=document.createElement('div'),info=document.createElement('div'),name=document.createElement('b'),detail=document.createElement('small'),price=document.createElement('span'),button=document.createElement('button');
+  row.className='shopitem';
+  name.textContent=m.name||CLASSES[m.job??0].name;
+  detail.textContent=`${s.members.some(p=>p.id===m.id)?'パーティ':'控え'} · Lv.${m.level} · ${m.status==='dead'?'死亡':'灰'} · 成功率 ${templeChance(m)}%`;
+  price.textContent=`${templeCost(m)} G`;button.textContent='蘇生';
+  button.disabled=s.area!=='town'||!idle()||s.gold<templeCost(m);
+  button.onclick=()=>templeRaise(m.id);
+  info.append(name,detail);row.append(info,price,button);list.append(row);
+ }
+}
+$('#templeopen').onclick=()=>{if(s.area!=='town'||!idle())return;$('#templenotice').textContent='';renderTemple();$('#templedialog').showModal()};
+$('#templeclose').onclick=()=>$('#templedialog').close();
 function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
 function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
 function openInventory(i){if(!idle())return;inventoryMember=i;renderInventory();$('#inventorydialog').showModal()}
diff --git a/docs/SPECIFICATION.md b/docs/SPECIFICATION.md
index 43c11fb..20c5cc8 100644
--- a/docs/SPECIFICATION.md
+++ b/docs/SPECIFICATION.md
@@ -4,7 +4,7 @@
 
 ## 1. ゲームループ・階層
 
-町（酒場・鍛冶屋・迷宮入口）→探索→遭遇／宝箱／守護者→階段で上下移動→町。
+町（酒場・鍛冶屋・寺院・迷宮入口）→探索→遭遇／宝箱／守護者→階段で上下移動→町。
 1Fは8×8、2Fは10×10、3F以降12×12。上下左右の隣接移動、左右旋回、後退、左右横移動。盤面クリックは旗の操作で、任意マスへ移動する操作ではない。
 開始位置と守護者位置は乱数。チェビシェフ距離2以内（縦横の最大差が2以下）には守護者を置かない。開始位置の周囲と、守護者までの生成経路は安全。罠数は1F=9、2F=15、3F=23。階層・盤面サイズに応じて増え、盤面の22%を上限とする。
 守護者マスへ入ると確認。いいえで直前マスへ戻る。1〜9Fでは撃破後その場所が下り階段になる。各階に固有守護者がおり、最深部は10F（MAX_FLOOR=10）。階段・転移とも11F以降へは移動できない。
@@ -27,7 +27,8 @@
 新規ゲームは0人。訓練所で作成・登録した冒険者から0〜6人を編成。先頭3人が前衛、残りが後衛。0人では迷宮入場不可。酒場での編成とパーティー画面での順番変更も利用可能。
 表示能力：Lv、HP、MP、STR、AC、IQ、PIE、経験値、NEXT。正常時の状態表示はなし。異常時のみ色付きタグ。
 町帰還時に経験値が足りていれば複数回レベルアップ。Lv上限30。HP/MP成長は職業別ダイス、ACはレベルアップで変化しない。帰還で正常なメンバーのみHP/MPを全快し、レベルアップ結果はポップアップ。
-死亡状態は本作の暫定仕様。メンバーの `status` は `ok`（正常）・`dead`（死亡）・`ash`（灰）・`lost`（ロスト）。HPが0になると正常から死亡へ移行し、死亡・灰・ロストは帰還後もHP0のまま、MPも回復しない。帰還時の毒・麻痺解除は全員が対象。状態タグはログのスナップショットに同期して「死亡」「灰」「ロスト」を表示する。正常以外のメンバーがいるパーティーは迷宮に入れず、酒場で外す必要がある。寺院と灰・ロストへの移行はまだ未実装。
+死亡状態は本作の暫定仕様。メンバーの `status` は `ok`（正常）・`dead`（死亡）・`ash`（灰）・`lost`（ロスト）。HPが0になると正常から死亡へ移行し、死亡・灰・ロストは帰還後もHP0のまま、MPも回復しない。帰還時の毒・麻痺解除は全員が対象。状態タグはログのスナップショットに同期して「死亡」「灰」「ロスト」を表示する。正常以外のメンバーがいるパーティーは迷宮に入れず、寺院で蘇生するか、酒場で外す必要がある。
+寺院では町で操作待ちのときのみ、パーティーと控えの死亡・灰のメンバーを蘇生できる。費用と成功率は**本作の暫定式**。死亡の費用は100×Lv G、成功率はclamp(50＋3×Lv,50,95)%、灰の費用は250×Lv G、成功率はclamp(40＋3×Lv,40,90)%（clampは下限・上限で制限）。成功時は正常・HP1に戻り、MPは変化しない。失敗時は死亡→灰、灰→ロストとなり、HP0を維持する。費用は成否にかかわらず消費し、金貨不足時は実行できない。正常・ロストは蘇生対象外。結果の状態・HP・金貨は既存の `ash-v1` に保存する。
 旧セーブの状態未設定メンバーは、町なら正常、迷宮内でHP0以下なら死亡、その他は正常とする。状態未設定の控えは正常とし、設定済みの状態は保存・再読込・編成変更で保持する。
 必要経験値は個体ごとに抽選・保存。次Lvの増分＝round(115×(次Lv−1)×職業係数×[0.9,1.1))。係数：戦士0.8、魔法使い1.2、僧侶1、盗賊0.85。旧セーブには専用移行処理あり。
 新規生成キャラクターのSTR＝min(18, 生成時STR＋floor((Lv−1)/5))。レベル吸収時も生成時STRを基準とする。
diff --git a/tests/game.cjs b/tests/game.cjs
index a7f1d3d..67370fc 100644
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -282,3 +282,4 @@ drain();run(`if(trapPower(1)!==1||trapPower(5)!==2||trapPower(10)!==3.25||trapPo
 require('./final-boss.cjs');
 
 require('./death-status.cjs');
+require('./temple.cjs');

exec
/bin/bash -lc 'node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check' in /workspace/dungeonsweeper
 succeeded in 2526ms:
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
PASS temple: all four outcomes for party/reserve, fees, HP1, MP/XP preservation, save/reload and dungeon reentry
PASS temple formulas, caps, probability boundaries, exact gold and insufficient-gold rejection
PASS temple town/idle guards, invalid targets and repeated attempts
PASS temple UI handlers: active/reserve list, fees/chances, disabled state, stable IDs, notices and empty state
PASS new game starts empty; dungeon blocked
PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation
PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload
PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration
PASS deletion including last active member and empty save reload
88 monster definitions validated

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
import re
s=Path('dist/index.html').read_text()
for match in re.finditer(r'["'^{}]*shopitem[''^{}]*'"\\{["'^}]*'"\\}',s): print(match.group(0))
PY
git status --short" in /workspace/dungeonsweeper
 succeeded in 228ms:
.shopitem{display:flex;gap:16px;align-items:center;border-top:1px solid #3c483b;padding:13px 0}
.shopitem>div{flex:1}
.shopitem small{display:block;letter-spacing:0}
.shopitem button{font-size:12px}
 M dist/game.js
 M dist/index.html
 M docs/SPECIFICATION.md
 M tests/game.cjs
?? tests/temple.cjs

codex
指定の3検証はすべてPASSしました。寺院の4結果、費用、控え、保存・再読込、蘇生後の迷宮入場も回帰テストで確認済みです。

`/workspace/dsw-queue` は今回の書込み許可範囲外のため、`done/` への移動は未実施です。報告書はリポジトリ内の `report/` に保存します。

apply patch
patch: completed
/workspace/dungeonsweeper/report/021-heavy-temple.md
diff --git a/dist/game.js b/dist/game.js
index 3094c60bf59a7cacfc365a3d85834b01849a83e6..be2188e0604c70d8649bdf402045aee825d2e1f5
--- a/dist/game.js
+++ b/dist/game.js
@@ -54,6 +54,43 @@
 function buy(id,i){if(!s.members[i])return;let w=weapon(id);if(s.area!=='town'||!idle()||!w||w.shop===false||!Number.isFinite(w.price)||!w.classes.includes(jobOf(i))||s.gold<w.price||s.inventory[i].length>=10)return;s.gold-=w.price;s.inventory[i].push(id);$('#shopnotice').textContent=`${NAMES[i]}が${w.name}を購入した。`;render();renderShop()}
 function equip(i,slot){if(!idle()||!s.inventory[i][slot]||!weapon(s.inventory[i][slot]).classes.includes(jobOf(i)))return;let w=weapon(s.inventory[i][slot]);if(w.kind==='medicine')return;if(w.part){if(s.armor[i][w.part]===slot)delete s.armor[i][w.part];else s.armor[i][w.part]=slot}else s.equipped[i]=slot;render();renderInventory()}
 function sell(i,slot){if(s.area!=='town'||!idle()||isEquipped(i,slot)||!s.inventory[i][slot])return;let w=weapon(s.inventory[i][slot]);s.gold+=w.sell;s.inventory[i].splice(slot,1);if(s.equipped[i]>slot)s.equipped[i]--;for(let p in s.armor[i])if(s.armor[i][p]>slot)s.armor[i][p]--;render();renderInventory();renderShop()}
+// 寺院の費用・成功率は本作の暫定式。成功率は百分率で返す。
+function templeCost(m){return m.status==='dead'?100*m.level:m.status==='ash'?250*m.level:0}
+function templeChance(m){return m.status==='dead'?Math.max(50,Math.min(95,50+3*m.level)):m.status==='ash'?Math.max(40,Math.min(90,40+3*m.level)):0}
+function templeRaise(id){
+ if(s.area!=='town'||!idle())return false;
+ const r=trainingRoster().find(r=>r.members.id===id);
+ if(!r||!['dead','ash'].includes(r.members.status))return false;
+ const m=r.members,cost=templeCost(m);
+ if(s.gold<cost)return false;
+ s.gold-=cost;
+ const success=Math.random()*100<templeChance(m);
+ m.status=success?'ok':m.status==='dead'?'ash':'lost';
+ const i=s.members.findIndex(m=>m.id===id),hp=success?1:0;
+ if(i>=0)s.hp[i]=hp;else r.hp=hp;
+ const result={id,name:m.name||CLASSES[m.job??0].name,success,status:m.status,cost};
+ render();renderTemple(result);
+ return result;
+}
+function renderTemple(result=null){
+ $('#templegold').textContent=`金貨 ${s.gold} G`;
+ if(result)$('#templ enotice'.replace(' ','')).textContent=result.success?`${result.name}は蘇生した。HPが1になった。`:`${result.name}の蘇生に失敗した。${result.status==='ash'?'灰になった。':'ロストした。'}`;
+ const list=$('#templemembers');list.replaceChildren();
+ const records=trainingRoster().filter(r=>['dead','ash'].includes(r.members.status));
+ if(!records.length){const p=document.createElement('p');p.textContent='蘇生が必要な冒険者はいません。';list.append(p)}
+ for(const r of records){
+  const m=r.members,row=document.createElement('div'),info=document.createElement('div'),name=document.createElement('b'),detail=document.createElement('small'),price=document.createElement('span'),button=document.createElement('button');
+  row.className='shopitem';
+  name.textContent=m.name||CLASSES[m.job??0].name;
+  detail.textContent=`${s.members.some(p=>p.id===m.id)?'パーティ':'控え'} · Lv.${m.level} · ${m.status==='dead'?'死亡':'灰'} · 成功率 ${templeChance(m)}%`;
+  price.textContent=`${templeCost(m)} G`;button.textContent='蘇生';
+  button.disabled=s.area!=='town'||!idle()||s.gold<templeCost(m);
+  button.onclick=()=>templeRaise(m.id);
+  info.append(name,detail);row.append(info,price,button);list.append(row);
+ }
+}
+$('#templeopen').onclick=()=>{if(s.area!=='town'||!idle())return;$('#templ enotice'.replace(' ','')).textContent='';renderTemple();$('#templedialog').showModal()};
+$('#templeclose').onclick=()=>$('#templedialog').close();
 function renderShop(){if(!s.members.length)return;let selected=+$('#shopmember').value||0;$('#shopmember').innerHTML=NAMES.map((name,i)=>`<option value="${i}">${name}</option>`).join('');$('#shopmember').value=String(selected);let i=+$('#shopmember').value||0;$('#shopgold').textContent=`金貨 ${s.gold} G`;$('#shopitems').innerHTML=WEAPONS.filter(w=>w.shop!==false&&w.classes.includes(jobOf(i))).map(w=>`<div class="shopitem"><div><b>${w.name}</b><small>${itemDescription(w)}</small></div><span>${w.price} G</span><button data-buy="${w.id}" ${s.gold<w.price||s.inventory[i].length>=10?'disabled':''}>購入</button></div>`).join('')}
 function renderInventory(){let i=inventoryMember;$('#inventorytitle').textContent=`${NAMES[i]}のアイテム ${s.inventory[i].length}/10`;renderEquipmentSummary(i);renderTransfer(i);$('#inventoryslots').innerHTML=Array.from({length:10},(_,slot)=>{let id=s.inventory[i][slot],w=weapon(id);return `<div class="slot"><small>${slot+1}</small>${w?`<b>${w.name}</b><span>${itemDescription(w)}</span>${w.kind==='medicine'?`<button data-use-medicine="${slot}" ${!canChooseMedicine(i)?'disabled':''}>使う</button>`:`<button data-equip="${slot}" ${isEquipped(i,slot)&&!w.part?'disabled':''}>${isEquipped(i,slot)?w.part?'外す':'装備中':'装備'}</button>`}${s.area==='town'?`<button data-sell="${slot}" ${isEquipped(i,slot)?'disabled':''}>売却 ${w.sell} G</button>`:''}`:'<span>—</span>'}</div>`}).join('')}
 function openInventory(i){if(!idle())return;inventoryMember=i;renderInventory();$('#inventorydialog').showModal()}
diff --git a/report/021-heavy-temple.md b/report/021-heavy-temple.md
new file mode 100644
index 0000000000000000000000000000000000000000..ea51a995c9832de14aac16021211f7c56ef1d8b4
--- /dev/null
+++ b/report/021-heavy-temple.md
@@ -0,0 +1,26 @@
+# 021-heavy-temple 作業報告
+
+実装・自動検証：完了。ブラウザ確認・外部キュー移動：未完了。
+
+## 変更ファイル
+
+- `dist/index.html`：町の寺院ボタン、鍛冶屋に合わせたdialog、金貨・結果通知・対象一覧。
+- `dist/game.js`：`templeCost`、`templeChance`、`templeRaise`、`renderTemple`。町かつidle時のみ実行し、パーティーと控えを安定IDで参照。死亡は100×Lv G、灰は250×Lv Gを消費。指定の成功率で判定し、成功は正常・HP1、失敗は死亡→灰／灰→ロスト。金貨不足・対象外は実行不可。結果を返し、既存セーブ処理で保存。
+- `docs/SPECIFICATION.md`：寺院の費用・成功率を「本作の暫定式」として記載。
+- `tests/temple.cjs`：成功・失敗の4結果をパーティー／控えの両方で検証。費用、確率境界、金貨不足、実行制限、連続操作、保存・再読込、蘇生後の迷宮入場、UIハンドラーを検証。
+- `tests/game.cjs`：共通検証から寺院の回帰テストを実行。
+- `report/021-heavy-temple.md`：本報告。
+
+## 検証結果
+
+- `node tests/game.cjs`：PASS（寺院・死亡状態・旧セーブ移行の回帰を含む）。
+- `node tests/training.cjs`：PASS。
+- `python3 scripts/compile-monsters.py --check`：PASS（88件）。
+- `git diff --check`：PASS。
+
+セーブキー `ash-v1`、020の判定、戦闘、XPの処理は変更していない。022以降のタスクは未着手。公開は実施していない。
+
+## 未完了
+
+- ブラウザ実機確認：ChromiumとPython Playwrightが見つからず未実施。画面の表示崩れと「死亡→帰還→寺院→再入場」の手動操作は未確認。Node上では寺院のUIハンドラーと蘇生後の入場を検証済み。
+- `/workspace/dsw-queue/todo/021-heavy-temple.md` の `done/` 移動と同キューの `report/` への書込み：環境の書込み許可範囲が `/workspace/dungeonsweeper` と `/tmp` のため未実施。代わりにリポジトリ内の `report/` に本報告を保存した。
diff --git a/tests/game.cjs b/tests/game.cjs
index a7f1d3dbe1396796d8dee028d3c652e4a23078a5..67370fcd38245647328c6a57d20f41d497f819b1
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -282,3 +282,4 @@
 require('./final-boss.cjs');
 
 require('./death-status.cjs');
+require('./temple.cjs');
diff --git a/tests/temple.cjs b/tests/temple.cjs
new file mode 100644
index 0000000000000000000000000000000000000000..0448135ab72b703adb47bc70388bf1139016f5ce
--- /dev/null
+++ b/tests/temple.cjs
@@ -0,0 +1,126 @@
+const assert = require('node:assert/strict');
+const fs = require('node:fs');
+const path = require('node:path');
+const { game } = require('../scripts/sim/harness.cjs');
+
+function fixture(status = 'dead', reserve = false, level = 5) {
+  const g = game(null, () => .5);
+  g.run(`var recruit=generateRecruit('蘇生([対象',2);registerRecruit(recruit);
+    ${reserve ? '' : 'changeRecruitParty(recruit.members.id,true);'}
+    var id=recruit.members.id,r=trainingRoster()[0];
+    r.members.status='${status}';r.members.level=${level};
+    if(s.members.length){s.hp[0]=0;s.mp[0]=2}else{r.hp=0;r.mp=2}
+    s.gold=10000;save();`);
+  return g;
+}
+function reload(g) { return game(g.run("localStorage.getItem('ash-v1')")); }
+
+for (const reserve of [false, true]) {
+  for (const [status, roll, expected, cost] of [
+    ['dead', 0, 'ok', 500], ['dead', .999, 'ash', 500],
+    ['ash', 0, 'ok', 1250], ['ash', .999, 'lost', 1250],
+  ]) {
+    const g = fixture(status, reserve);
+    const before = JSON.parse(g.run('JSON.stringify(trainingRoster()[0])'));
+    g.run(`Math.random=()=>${roll};var result=templeRaise(id)`);
+    assert.equal(g.run('result.status'), expected);
+    assert.equal(g.run('result.success'), expected === 'ok');
+    assert.equal(g.run('result.cost'), cost);
+    assert.equal(g.run('result.id===id'), true);
+    assert.equal(g.run('s.gold'), 10000 - cost);
+    const after = JSON.parse(g.run('JSON.stringify(trainingRoster()[0])'));
+    before.members.status = expected; before.hp = expected === 'ok' ? 1 : 0;
+    assert.deepEqual(after, before, 'only status and HP change; MP, XP, equipment and identity stay intact');
+    const restored = reload(g);
+    assert.equal(restored.run('s.gold'), 10000 - cost);
+    assert.equal(restored.run('s.members.length'), reserve ? 0 : 1);
+    assert.deepEqual(JSON.parse(restored.run('JSON.stringify(trainingRoster()[0])')), after);
+    assert.match(g.run("$('#templenotice').textContent"), expected === 'ok' ? /蘇生した/ : expected === 'ash' ? /灰になった/ : /ロストした/);
+    if (expected === 'ok') {
+      if (reserve) restored.run('changeRecruitParty(s.reserve[0].members.id,true)');
+      restored.run('enterDungeon()'); restored.drain();
+      assert.equal(restored.run('s.area'), 'dungeon');
+      assert.equal(restored.run('s.hp[0]'), 1);
+    }
+  }
+}
+console.log('PASS temple: all four outcomes for party/reserve, fees, HP1, MP/XP preservation, save/reload and dungeon reentry');
+
+for (const [status, level, cost, chance] of [
+  ['dead', 1, 100, 53], ['dead', 5, 500, 65], ['dead', 15, 1500, 95], ['dead', 30, 3000, 95],
+  ['ash', 1, 250, 43], ['ash', 5, 1250, 55], ['ash', 17, 4250, 90], ['ash', 30, 7500, 90],
+]) {
+  const g = fixture(status, false, level);
+  assert.equal(g.run('templeCost(s.members[0])'), cost);
+  assert.equal(g.run('templeChance(s.members[0])'), chance);
+  g.run(`s.gold=${cost};Math.random=()=>${chance}/100;var result=templeRaise(id)`);
+  assert.equal(g.run('result.success'), false, 'at threshold fails');
+  assert.equal(g.run('s.gold'), 0, 'exact balance is sufficient even on failure');
+  g.run(`s.members[0].status='${status}';s.gold=${cost};Math.random=()=>(${chance}-.001)/100`);
+  assert.equal(g.run('templeRaise(id).success'), true, 'below threshold succeeds');
+}
+for (const status of ['dead', 'ash']) {
+  const g = fixture(status);
+  assert.equal(g.run(`templeChance({status:'${status}',level:0})`), status === 'dead' ? 50 : 40);
+  g.run('s.gold=templeCost(s.members[0])-1;Math.random=()=>{throw Error("must not roll")};save()');
+  const before = g.run('JSON.stringify(s)');
+  assert.equal(g.run('templeRaise(id)'), false);
+  assert.equal(g.run('JSON.stringify(s)'), before);
+}
+console.log('PASS temple formulas, caps, probability boundaries, exact gold and insufficient-gold rejection');
+
+for (const setup of [
+  "s.area='dungeon'", "s.enemy={units:[]}", 's.pendingBoss=1', "s.pendingStairs='up'",
+  "s.cells[s.pos].chest={opened:false}", "log('表示待ち')",
+  "s.members[0].status='ok'", "s.members[0].status='lost'", "id='missing'",
+]) {
+  const g = fixture();
+  g.run(setup);
+  g.run('Math.random=()=>{throw Error("must not roll")};save()');
+  const before = g.run('JSON.stringify(s)');
+  assert.equal(g.run('templeRaise(id)'), false, setup);
+  assert.equal(g.run('JSON.stringify(s)'), before, setup);
+  if (g.run("s.area!=='town'||!idle()")) {
+    g.run("$('#templeopen').onclick()");
+    assert.equal(g.run("!!$('#templedialog').open"), false, setup);
+  }
+}
+const retry = fixture();
+retry.run('Math.random=()=>.999;templeRaise(id);templeRaise(id)');
+assert.equal(retry.run('s.members[0].status'), 'lost');
+assert.equal(retry.run('s.gold'), 8250, 'dead fee then ash fee');
+assert.equal(retry.run('templeRaise(id)'), false, 'lost cannot be raised again');
+const success = fixture();
+success.run('Math.random=()=>0;templeRaise(id)');
+assert.equal(success.run('templeRaise(id)'), false, 'successful raise cannot be charged twice');
+console.log('PASS temple town/idle guards, invalid targets and repeated attempts');
+
+// Capture the temple DOM only, keeping the shared game harness unchanged.
+const ui = fixture();
+ui.run(`document.createElement=()=>({children:[],append(...nodes){this.children.push(...nodes)}});
+  Object.assign($('#templemembers'),{children:[],append(...nodes){this.children.push(...nodes)},replaceChildren(...nodes){this.children=nodes}});
+  registerRecruit(generateRecruit('控え',0));s.reserve[0].members.status='ash';s.reserve[0].hp=0;
+  registerRecruit(generateRecruit('正常',0));registerRecruit(generateRecruit('ロスト',0));s.reserve[2].members.status='lost';
+  s.gold=499;$('#templeopen').onclick();`);
+assert.equal(ui.run("$('#templedialog').open"), true);
+assert.equal(ui.run("$('#templemembers').children.length"), 2, 'only dead/ash are listed');
+assert.equal(ui.run("$('#templemembers').children[0].children[2].disabled"), true);
+assert.equal(ui.run("$('#templemembers').children[1].children[2].disabled"), false);
+assert.match(ui.run("$('#templemembers').children[0].children[0].children[1].textContent"), /パーティ.*死亡.*65%/);
+assert.match(ui.run("$('#templemembers').children[1].children[0].children[1].textContent"), /控え.*灰.*43%/);
+assert.equal(ui.run("$('#templemembers').children[0].children[0].children[0].textContent"), '蘇生([対象');
+ui.run(`s.gold=1000;renderTemple();var raiseButton=$('#templemembers').children[0].children[2];
+  changeRecruitParty(id,false);Math.random=()=>0;raiseButton.onclick();`);
+assert.equal(ui.run("s.reserve.find(r=>r.members.id===id).hp"), 1, 'button resolves stable ID after benching');
+assert.equal(ui.run("$('#templemembers').children.length"), 1);
+assert.equal(ui.run("$('#templegold').textContent"), '金貨 500 G');
+assert.match(ui.run("$('#templenotice').textContent"), /蘇生した/);
+ui.run("$('#templemembers').children[0].children[2].onclick()");
+assert.equal(ui.run("$('#templemembers').children[0].textContent"), '蘇生が必要な冒険者はいません。');
+ui.run("$('#templeclose').onclick();$('#templeopen').onclick()");
+assert.equal(ui.run("$('#templenotice').textContent"), '');
+const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
+assert.match(html, /<button id="templeopen">寺院<\/button>/);
+assert.match(html, /<dialog id="templedialog" aria-labelledby="templetitle">/);
+assert.match(html, /id="templenotice" role="status"/);
+console.log('PASS temple UI handlers: active/reserve list, fees/chances, disabled state, stable IDs, notices and empty state');

exec
/bin/bash -lc 'git diff --check && git status --short' in /workspace/dungeonsweeper
 succeeded in 0ms:
 M dist/game.js
 M dist/index.html
 M docs/SPECIFICATION.md
 M tests/game.cjs
?? report/
?? tests/temple.cjs

codex
021の寺院実装・自動検証は完了しました。

- パーティー／控えの蘇生、費用、失敗時の灰・ロスト、結果通知を実装。
- 変更：`dist/game.js`、`dist/index.html`、仕様書、回帰テスト。
- 指定の3検証はすべてPASS。

未完了：ブラウザ確認、書込み範囲外のキューの `done/` 移動。

詳細：[作業報告](/workspace/dungeonsweeper/report/021-heavy-temple.md)
tokens used
70,614
021の寺院実装・自動検証は完了しました。

- パーティー／控えの蘇生、費用、失敗時の灰・ロスト、結果通知を実装。
- 変更：`dist/game.js`、`dist/index.html`、仕様書、回帰テスト。
- 指定の3検証はすべてPASS。

未完了：ブラウザ確認、書込み範囲外のキューの `done/` 移動。

詳細：[作業報告](/workspace/dungeonsweeper/report/021-heavy-temple.md)
EXIT 0
