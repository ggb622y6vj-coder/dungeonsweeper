# 指示書121 統合・ライブ検証記録

- 日付：2026-11-21
- 統合：ユーザーの承認を受け、hold/121（01c3b5e）を main へ fast-forward 統合し push。
- Pages：マージコミットの初回 run（44828526019）は Deploy 工程で GitHub 側のアーティファクト取得に失敗したが、検証工程は合格しており、再実行で success になった（内容側の問題ではない）。
- 統合後ツリーでの再検証：node tests/game.cjs 220 PASS、tests/*-browser.py 54/54 PASS（分割実行で全件確認。途中1回、ローカルサーバーの停止による全件ナビゲーション失敗があったが、再起動後に再実行して全件合格）、compile-monsters --check・sim selftest・Notion 同期テスト2件 PASS、MANIFEST 不一致0。
- ライブ検証：公開サイトの dist 17ファイルすべてが統合ツリーと SHA-256 一致（17/17）。配信中の weapons.js に呪い付き装備、items.js に未鑑定トークン処理、index.html に鍛冶屋の鑑定ボタンが含まれることを確認。
- レビューは Claude Code が担当し、条件（図書館の登録範囲）は Amendment 2 で解消済み。
