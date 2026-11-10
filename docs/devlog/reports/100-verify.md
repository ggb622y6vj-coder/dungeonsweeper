# 100 ライブ検証記録

- 日時：2026-11-11（JST）
- 対象：main `9cc284f`（`hold/100` を fast-forward 統合）
- GitHub Actions：`Deploy GitHub Pages` run 42919315732 が **success**（headSha `9cc284f`、push 契機で自動実行）。
- ライブ照合：公開サイト https://ggb622y6vj-coder.github.io/dungeonsweeper/ の dist 16 ファイルすべてを SHA-256 でローカルの main と照合し、**16/16 一致**。
- 配信中の `dist/game.js` に VIT 依存の成功率計算（`m.vit ?? 10`）が含まれていることも確認した。
