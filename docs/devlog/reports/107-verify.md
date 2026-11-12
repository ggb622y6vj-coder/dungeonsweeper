# 指示書107 ライブ検証記録

- 日時：2026-11-12（統合承認後）
- main：bb70545（hold/107 を fast-forward 統合、Amendment 1 を含む）
- デプロイ：GitHub Actions "Deploy GitHub Pages" run 43141428063、成功

## 検証

- 公開URL https://ggb622y6vj-coder.github.io/dungeonsweeper/ の dist 16ファイル全件を main のファイルと SHA-256 で照合：16/16 一致
- 配信中の items.js にスタック計算（stackMaxOf）が含まれていることを確認
