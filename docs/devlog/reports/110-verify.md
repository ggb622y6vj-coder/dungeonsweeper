# 110 ライブ検証記録

- 対象：main（2792c60、hold/110 を fast-forward 統合）／ 公開URL https://ggb622y6vj-coder.github.io/dungeonsweeper/
- 日時：2026-11-13（JST）
- Pages デプロイ：run 43372797881、completed / success。
- 検証：dist の全17ファイルについて、ローカル（main 2792c60）と配信中ファイルの SHA-256 を照合し、17/17 一致。
- 配信中の loot.js に新方式の痕跡を確認：`medicineShare` の出現10回、`Empty equipment pool`（Amendment 1 の検証）1回。
