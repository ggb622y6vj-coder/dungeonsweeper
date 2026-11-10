# 099 ライブ検証記録

- 日時：2026-11-11（JST）
- 対象：main `fcead4d`（`hold/099` を fast-forward 統合）
- GitHub Actions：`Deploy GitHub Pages` run 42877287291 が **success**（headSha `fcead4d`、push 契機で自動実行）。
- ライブ照合：公開サイト https://ggb622y6vj-coder.github.io/dungeonsweeper/ の dist 16 ファイルすべてを SHA-256 でローカルの main と照合し、**16/16 一致**。
- 配信中の `dist/balance.js` に新方式の `hpCandidate` が含まれていることも確認した。
