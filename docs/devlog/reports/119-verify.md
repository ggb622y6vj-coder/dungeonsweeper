# 指示書119 統合・ライブ検証記録

- 日付：2026-11-19
- 統合：ユーザーの承認を受け、hold/119（0ed19cd）を main へ fast-forward 統合し push。Pages ワークフロー run 44430435669 が success。
- 統合後ツリーでの再検証：node tests/game.cjs 215 PASS、tests/*-browser.py 52/52 PASS（分割実行で全件確認）、compile-monsters --check・sim selftest・Notion 同期テスト PASS、MANIFEST 不一致0。
- ライブ検証：公開サイトの dist 17ファイルすべてが統合ツリーと SHA-256 一致（17/17）。balance.js は素の URL で CDN の旧キャッシュが返ったため、キャッシュ回避クエリで再取得して一致を確認（119 では未変更のファイル）。配信中の game.js に回転床の発動処理（c.spin===true）が含まれることを確認。
