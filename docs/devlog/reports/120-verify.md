# 指示書120 統合・ライブ検証記録

- 日付：2026-11-21
- 統合：ユーザーの承認を受け、hold/120（59565ba）を main へ fast-forward 統合し push。Pages ワークフロー run 44816030135 が success。
- 統合後ツリーでの再検証：node tests/game.cjs 215 PASS、tests/*-browser.py 53/53 PASS（分割実行で全件確認）、compile-monsters --check・sim selftest・Notion 同期テスト PASS、MANIFEST 不一致0。
- ライブ検証：公開サイトの dist 17ファイルすべてが統合ツリーと SHA-256 一致（17/17）。配信中の library.js に libraryGroupDice、index.html にモンスター詳細の2列グリッド規則が含まれることを確認。
- レビューは本指示書から Claude Code が担当（ブラウザ経由の ChatGPT レビューは OpenAI 利用規約のため停止）。
