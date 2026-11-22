# 指示書127 ライブ検証記録

日付 2026-11-22

- 統合：hold/127 を main へ fast-forward（main e528b82）。
- 統合後検証：`node tests/game.cjs` 240 PASS、ブラウザテスト全55件 PASS、`python3 scripts/compile-monsters.py --check` 108件合格、Notion 同期差分0、MANIFEST 不一致0。
- Pages：統合コミットの Deploy ワークフロー成功（run 44988980005）。
- ライブ検証：公開サイトの dist 全17ファイルが統合ツリーと SHA-256 一致（17/17）。配信中の monster-data.js に mageSpellLevel（新方式の生成データ）があることを確認。
- Notion 記録の追従：モンスターDBに「魔法使い呪文Lv」「僧侶呪文Lv」「呪文使用率」の3列を追加し、全108体へ値を入力。試案ページの状態を「実装済み（指示書127・2026-11-22）」へ更新。
