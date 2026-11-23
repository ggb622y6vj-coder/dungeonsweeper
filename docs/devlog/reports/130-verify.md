# 130 ライブ検証

実施日 2026-11-23

- 統合：hold/130 を main へ fast-forward（d4a77c6）。Pages デプロイ成功（run 45095995349）。
- 統合後検証：node tests/game.cjs 246 PASS、ブラウザテスト 55/55 PASS、compile-monsters 108件、MANIFEST 不一致0。
- ライブ検証：公開サイトの dist 全17ファイルが統合ツリーと SHA-256 一致。配信中の monster-data.js に partnerId（108件分）が含まれることを確認。
- Notion 記録：モンスターDBへ「随伴モンスターID」「随伴率」プロパティを追加し、全108行へ値を入力（設定12種のみ値あり）。実装予定DBの試案ページを「実装済み（指示書130・2026-11-23）」へ更新。
