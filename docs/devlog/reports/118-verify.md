# 指示書118 統合・ライブ検証記録

- 日付：2026-11-19
- 統合：ユーザーの承認を受け、hold/118（1baa88f）を main へ fast-forward 統合し push。Pages ワークフロー run 44425232518 が success。
- 統合後ツリーでの再検証：node tests/game.cjs 215 PASS、tests/*-browser.py 51/51 PASS（分割実行で全件確認）、compile-monsters --check・sim selftest・Notion 同期テスト PASS、MANIFEST 不一致0。
- ライブ検証：公開サイトの dist 17ファイルすべてが統合ツリーと SHA-256 一致（17/17）。配信中の index.html に「仕掛解除」があり「カルフォ」の表記がないこと、game.js に歩数の無条件引き継ぎ、spells.js にレベル昇順ソートが含まれることを確認。
