# 開発ログ / Development log

このフォルダは「迷宮スイープ」の開発記録です。仕様書（001〜072）、実装・検証レポート、スクリーンショットをまとめています。
This folder holds the development record of the game: specs 001–072, implementation and verification reports, and screenshots.

## 構成 / Layout

| パス | 内容 |
|---|---|
| `TIMELINE.md` | 仕様番号ごとの一覧：日付、概要、main のコミット、仕様とレポートへのリンク |
| `specs/` | 仕様書。末尾の **Amendment** はユーザーの回答を反映した最終版で、本文より優先されます |
| `reports/NNN*.md` | 実装レポート（変更点、テスト結果、疑問点） |
| `reports/NNN*-verify.md` | push 後のライブ検証レポート |
| `reports/NNN-shots/` | hold ブランチでのブラウザテストのスクリーンショット（1280px / 390px） |
| `reports/NNN-shots-live/` | 公開サイト（GitHub Pages）でのライブ検証のスクリーンショット |

## ワークフロー / Workflow

1. **試遊（プレイテスト担当）** が遊んで気づいた点を仕様書 `NNN-*.md` にまとめます。ユーザーに確認した内容は **Amendment** として追記します。
   The playtest agent writes the spec and appends Amendments with the user's answers.
2. **Codex指示（実装担当）** が作業中の印として `HOLD` を置き、`origin/main` から `hold/NNN` ブランチを切って実装します（必要に応じて Codex を使います）。
   - Codex の誤りや見せかけのテストは直すか書き直し、テストは弱めません。
   - ブラウザテストは 1280px と 390px の両方で 10/10 合格し、古いビルドでは失敗すること。
   - `MANIFEST.sha256` を再生成し、`dsw-verify` が `OVERALL fail=0` になること。
   - レポートとスクリーンショットを書いて、仕様を `done/` に移し、`HOLD` を外します。**この段階では push しません。**
   The implementer works on a `hold/NNN` branch, writes the report, and does not push.
3. **push**：ユーザー本人の承認（本人の言葉を記録で確認）を得てから、fast-forward のみで `main` に push します。force push はしません。
   Push only after the user's own approval, fast-forward only.
4. **ライブ検証**：GitHub Pages への反映後、公開サイトで確認し、`*-verify.md` と `*-shots-live/` に記録します。
   After deploy, check the live site and record the result.

## 注記 / Notes

- このフォルダは GitHub Pages に公開されません。Pages のワークフロー（`.github/workflows/pages.yml`）がアップロードするのは `dist/` だけです。
- 作業キューから持ってきていないもの：`HOLD`、Codex の実行ログ（`codex*.log`）、失敗した試行の diff、シミュレーターの出力（`sim*` と `*-sim-*.txt`）。
