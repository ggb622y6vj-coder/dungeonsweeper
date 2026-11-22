# 指示書123 統合・ライブ検証記録

- 日付：2026-11-21
- 統合：ユーザーの承認を受け、hold/123（0a0d64b）を main へ fast-forward 統合し push。
- Pages：マージコミットの run（44902767348）が success。
- 統合後ツリーでの再検証：node tests/game.cjs 226 PASS、tests/*-browser.py 54/54 PASS（分割実行で全件確認）、compile-monsters --check・sim selftest・Notion 同期テスト2件 PASS、MANIFEST 不一致0。
- ライブ検証：公開サイトの dist 17ファイルすべてが統合ツリーと SHA-256 一致（17/17）。配信中の spells.js に「全ての呪文が打ち消された！」、game.js に探索済み基礎率 .095、monsters.js に撃破記録による守護者の出現判定があることを確認。
- レビューは Claude Code が担当し、統合可・必須修正なし。
