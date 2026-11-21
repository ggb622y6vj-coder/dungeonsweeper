# 指示書124 ライブ検証記録（2026-11-21）

- 統合：hold/124 を main へ fast-forward（1b8ebe3）。Pages デプロイ run 44908955059 は success。
- 統合後検証：node tests/game.cjs 233 PASS、全ブラウザテスト 55/55 PASS、compile-monsters --check・sim selftest・Notion 同期テスト2件 PASS、MANIFEST 不一致0。
- ライブ検証：公開サイトの dist 全17ファイルが統合ツリーと SHA-256 一致（17/17）。配信された game.js に hiddenIds と「身を隠した」、combatui.js に「奇襲」が含まれることを確認。
