# 指示書114 統合・ライブ検証記録

- 日付：2026-11-17
- 統合：ユーザーの承認を受け、hold/114（f8c1d38）を main へ fast-forward 統合し push した。
- 統合後検証（main のツリーで再実施）：node tests/game.cjs 215 PASS、tests/*-browser.py 47/47 PASS、compile-monsters --check PASS、MANIFEST.sha256 不一致0。
- デプロイ：GitHub Pages run 44063900593（対象 f8c1d38）が success。
- ライブ検証：配信17ファイルすべての SHA-256 が統合後ツリーと一致。配信 index.html に `--teal-10:#111e20` の定義と `.mpbar{background:var(--teal-10)` の適用があることを確認した。
- ChatGPT レビューは統合可・必須修正なし（詳細は reports/114.md）。任意提案（HP・MP バーの地色が異なることの回帰テスト追加）は将来候補。
