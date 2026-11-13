# 111 ライブ検証記録

- 対象：main（529f844、hold/111 を fast-forward 統合）／ 公開URL https://ggb622y6vj-coder.github.io/dungeonsweeper/
- 日時：2026-11-14（JST）
- Pages デプロイ：run 43511828557、completed / success。
- 検証：dist の全17ファイルについて、ローカル（main 529f844）と配信中ファイルの SHA-256 を照合し、17/17 一致。
- 配信中の痕跡確認：game.js に `inventoryactiondialog`（個数ダイアログ）3件、spells.js に「確定習得」の文字列なし（行表記からの除去を確認）。
