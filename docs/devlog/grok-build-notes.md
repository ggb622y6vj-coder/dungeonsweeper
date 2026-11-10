# Grok Build（grok CLI）運用メモ

他の AI が迷宮スイーパーの実装を Grok Build（`~/.grok/bin/grok`）へ渡すときの参考資料です。本文は 2026-11-10 の仕様 096（旗視）で起きた中断を、セッションログと作業ツリーの状態から事実だけ拾ってまとめたものです。推測で断定しない箇所は、その旨を書いてあります。

## 096 で何が起きたか

Grok Build は flagview（旗視）の実装を途中まで進めたが、完了・コミット・`hold/096` への push には至らなかった。ユーザーの停止指示（「遅すぎるので停止してください」）を受けてセッションを終了し、実装は Codex がやり直して main へ入った。

### 環境（セッション記録）

| 項目 | 値 |
|---|---|
| CLI | `~/.grok/bin/grok`（当時のバージョン 1.0.76） |
| 起動形態 | headless |
| セッション記録のモデル ID | `grok-4.7`（エージェント名 `grok-build-plan`） |
| reasoning effort | `high` |
| CLI の cwd | `/workspace/gb096` |
| 作業ツリー | `/tmp/dsw-096`（`origin/main` の `d24d574` から切った `hold/096`） |
| 起動時刻 | 2026-11-10 07:12:54 JST（最初のツール実行は 07:13:00 JST） |

カタログ上のモデル ID（当時の `models_cache`）は `grok-4.7` と `grok-4.7-build-fast` などだった。セッションに残った ID は `grok-4.7` である。指示文で `grok-4.7-build` と書くことがあるが、ログ上の ID と別名で呼ぶなら、起動後にセッションの `current_model_id` を確認すること。

`/workspace/dsw-queue/report/096-grokbuild.log` は実行ログではない。08:08 JST 時点の短い作業方針メモ（590バイト）だけが残っている。

### 時系列（すべて JST、2026-11-10）

- **07:12:54** headless セッション開始。モデルは `grok-4.7`、effort `high`。
- **07:13:00–07:13:08** リポジトリを確認し、`git worktree add /tmp/dsw-096 origin/main` のあと `hold/096` を作成。先頭は `d24d574`（095 のライブ検証記録）。`/workspace/dungeonsweeper` には触っていない。
- **07:13–07:55** 仕様どおり呪文定義・詠唱判定・盤面 HTML・町帰還などの既存パターンを調査。effort `high` のため、ツールとツールのあいだに長い推論間隔がある（例: 07:20–07:41、07:42–07:46 の推論は約 267 秒）。
- **07:58:36** 実装の書き込み（`search_replace`）を開始。
- **08:08:17–08:08:18** 追記と構文確認。この時点で `dist/game.js` / `dist/spells.js` に `flagSight` / `flagview` が入っている。
- **08:09:30** `tests/flag-sight.cjs` を作成。
- **08:09:53–08:09:54** `node tests/flag-sight.cjs` を cwd（`/workspace/gb096`）のまま実行し、`MODULE_NOT_FOUND`。作業ツリーへ `cd` していなかった。
- **08:09:57** `cd /tmp/dsw-096 && node tests/flag-sight.cjs && node tests/notion-sync.cjs` は成功（約 252ms）。
- **08:09:57–08:15:40** 次の推論に約 343 秒。
- **08:15:40** 次の2コマンドを同時に起動した。
  1. Playwright / Chrome の有無確認（117ms で完了。Playwright は未導入、Chrome は存在）。
  2. フルスイート（バックグラウンド扱い）:

     ```bash
     cd /tmp/dsw-096 && node tests/game.cjs && python3 scripts/compile-monsters.py --check && node scripts/sim/selftest.cjs && echo ALL_OK
     ```

     `timeout` は付いていない。このあとエージェントのツール実行は途絶える。
- **08:15:40–10:01:24** フルスイート待ち。セッションはバックグラウンドタスク「Run full node tests, monster check, sim selftest」を残したまま停止しなかった。ツール完了時の `elapsed_ms` は 15988（約16秒）と記録されており、壁時計の待ち時間（約1時間46分）とは一致しない。16秒でバックグラウンド化したあとも、完了を待ち続けたと見るのがログと整合する。
- 終了時に残ったテスト出力は `PASS` 94行。最後は 6F の命中率確認（fungus まで）だった。`FAIL` や `ALL_OK` は出ていない。`node tests/game.cjs` は途中まで進んでいた。ここから先がデッドロックだったのか、後続の重いテスト（大量ヒット試行など）がまだ走っていたのかは、行ごとの時刻が無いのでログからは判定できない。
- **10:01:22–10:01:24** セッション終了。当該コマンドは `outcome: error`。終了処理の直後に次の推論ループが始まっているが、セッション自体が閉じられている。コミットも `hold/096` への push も無い。

### 原因

直接の失敗は「実装不能」ではなく、**長いテストを制限時間なしで流し、その完了を待ち続け、待っているあいだに成果をリモートへ残さなかった**ことである。

1. `node tests/game.cjs` を含むフルスイートを `timeout` なしで起動し、バックグラウンド化しても待ちを打ち切らなかった。監督側も途中経過を定期的に確認せず、ユーザーが停止を指示するまで約1時間46分置いた。
2. フルスイートの前にコミットも `git push -u origin hold/096` もしていない。中断した時点で、リモートにもローカルの git 履歴にも実装が残らなかった。
3. 標準の headless 出力では、長時間コマンドの途中経過が見えにくい。`--output-format streaming-json` を使っていれば、停止判断や「進んでいる／止まっている」の切り分けがしやすかった。
4. effort `high` は実装品質の助けになる一方、テスト前の推論だけでも数分かかる。096 ではテスト起動前に約6分の推論があった。時間を切りたいときに、より速いモデルや低い effort を選ぶ判断がなかった。

### 失われたもの

`/tmp/dsw-096` に未コミットの変更が残った（この文書の作成時も、作業ツリーは触らず残してある）。

- 変更: `SPELLS.md`、`data/notion-spells.json`、`dist/game.js`、`dist/index.html`、`dist/spells.js`、`docs/DATA_CATALOG.md`、`docs/SPECIFICATION.md`、`tests/game.cjs`、`tests/notion-sync.cjs`
- 未追跡: `tests/flag-sight.cjs`

中断時点では `hold/096` はリモートに無かった。096 の実装は Codex が同じ仕様でやり直し、レビュー修正（096b）を経て main に入った。Grok Build 側の途中成果は採用していない。

## 次に Grok Build へ指示するとき

指示文と監督の両方で、次を守る。

1. **長いコマンドは `timeout` で囲む。** 例: `timeout 10m node tests/game.cjs`。切れても途中ログが残る。制限時間はスイートの通常所要に合わせて明示する。
2. **フルスイートの前に、実装と新規テストをコミットして `hold/NNN` へ普通に push する。** force push はしない。`main` へは出さない。テストで落ちても、中断してもリモートに途中成果が残る。
3. **起動は `--output-format streaming-json` にする。** 進捗が見えないと、監督も「遅いだけ」と「停止」の区別ができない。
4. **バックグラウンド待ちに上限を設ける。** 16秒でバックグラウンド化したあとに無期限で待たない。止まっているプロセスを待ち続けない。必要ならログを見て、切るか継続するかを決める。
5. **時間を優先するなら `-m grok-4.7-build-fast` や `--effort medium` を検討する。** 使う ID は起動時のカタログと、起動後セッションに記録された `current_model_id` で確認する。
6. **監督は定期的に進捗を見る。** 目安は 10–15 分ごと。見るものは、最新のツール、テスト出力の最終行、git の dirty / 未 push、プロセスが生きているか。長時間無出力なら、ユーザーの停止指示を待たずに打ち切るか状況を報告する。
7. **テストは作業ツリーで実行する。** 096 では cwd のままだと `tests/flag-sight.cjs` が見つからなかった。`cd` してから走らせ、短いテスト（新規・関連）を先に通してからフルスイートへ進む。
8. **プロンプトには「先にコミットして pushし、長いコマンドは timeout 付き。完了を無期限に待たない」と明記する。** この文書へのリンクを添えてよい。

## 出典

- Grok CLI セッション（`~/.grok/sessions/` および `~/.grok/logs/unified.jsonl`）。時刻はログの UTC を JST に変換した。
- 作業ツリー `/tmp/dsw-096` の `git status`（読み取りのみ。中身は変更していない）。
- 指示プロンプト `/workspace/dsw-queue/done/096-grokbuild-prompt.md`。

生のセッションログと認証関連ファイルはリポジトリに入れない。トークンや認証情報を含むためである。`096-grokbuild.log` も実行ログではないので、ここには置いていない。
