# 指示書105 ライブ検証記録

- 日時：2026-11-11（統合承認後）
- main：af6ca7e（hold/105 を fast-forward 統合）
- デプロイ：GitHub Actions "Deploy GitHub Pages" run 43017624624、成功

## 検証

- 公開URL https://ggb622y6vj-coder.github.io/dungeonsweeper/ の dist 16ファイル全件を main のファイルと SHA-256 で照合：16/16 一致
- 配信中の recruits.js に転職時のMP減少計算（Math.floor(m.maxMP/10)）が含まれていることを確認
