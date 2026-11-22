# 指示書116 ライブ検証記録

- 日付：2026-11-18
- 統合：ユーザーの承認を受け、hold/116 を main へ fast-forward 統合（main f7bc425）。
- 統合後の検証：node tests/game.cjs 215 PASS、compile-monsters --check、sim selftest、Notion 同期テスト、MANIFEST いずれも PASS（ブラウザ 49/49 は統合前の同一ツリーで実施済み）。
- Pages：Deploy GitHub Pages run 44231422787（対象 f7bc425）が success。
- ライブ検証：配信中の dist 17ファイルすべてが統合ツリーと SHA-256 一致（17/17）。配信 index.html に「地図が反応しない！」の通知要素と zoneframe の CSS、配信 game.js に mapZoneFrame を含むことを確認。
