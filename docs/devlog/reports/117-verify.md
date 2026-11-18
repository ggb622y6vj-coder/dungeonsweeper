# 指示書117 統合・ライブ検証記録

- 日付：2026-11-18
- 統合：ユーザーの承認を受け、hold/117（d01a1e1）を main へ fast-forward 統合し push。Pages ワークフロー run 44300507424 が success。
- 統合後ツリーでの再検証：node tests/game.cjs 215 PASS、tests/*-browser.py 50/50 PASS、compile-monsters --check・sim selftest・Notion 同期テスト PASS。
- ライブ検証：公開サイトの dist 17ファイルすべてが統合ツリーと SHA-256 一致（17/17）。配信中の game.js に isAntimagicZone と「反呪文の結界」、index.html に antiframe の規則が含まれることを確認。
- 備考：レビュー記録コミット（d01a1e1）で reports/117.md を更新した際、MANIFEST.sha256 の再生成が漏れており、統合後検証で同ファイル1件の不一致を検出した。本記録コミットで MANIFEST を再生成し解消する（ゲームコードへの影響なし）。
