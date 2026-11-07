# 085 ライブ検証

- 日時: 2026-11-07
- 対象: main ffd5141（hold/085 を fast-forward 統合）
- GitHub Actions「Deploy GitHub Pages」: run 42377336198、completed / success
- 配信ファイル照合: dist の7ファイル（game.js / spells.js / monsters.js / monster-data.js / weapons.js / library.js / index.html）を取得し、main の検証済みコードと sha256 が全て一致（7 match / 0 diff）。
- ライブ画面のスクリーンショットは検証環境から外部サイトへ接続できないため未取得。
