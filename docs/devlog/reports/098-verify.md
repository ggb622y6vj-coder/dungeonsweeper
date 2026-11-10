# 098 ライブ検証記録

- 日時：2026-11-10（JST）
- 対象：main `a1a94ea`（`hold/098-grok` を fast-forward 統合。採用は Grok Build 版、経緯は [098.md](098.md)）
- GitHub Actions：push 契機の実行が現れなかったため、`Deploy GitHub Pages` を手動で起動。run 42796393117 が **success**（headSha `a1a94ea`）。
- ライブ照合：公開サイト https://ggb622y6vj-coder.github.io/dungeonsweeper/ の dist 16 ファイルすべてを SHA-256 でローカルの main と照合し、**16/16 一致**。
- 配信中の `dist/spells.js` は統合された Grok Build 版と同一ハッシュであり、真回復の restore 処理から status 操作が除かれていること（＝石化を治せないこと）が配信コードでも保証される。
