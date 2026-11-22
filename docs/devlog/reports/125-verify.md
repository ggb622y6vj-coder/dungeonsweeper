# 指示書125 ライブ検証記録

日付 2026-11-22

- 統合：hold/125 を main へ fast-forward（main 3041de3）。
- 統合後検証：`node tests/game.cjs` 233 PASS、ブラウザテスト全55件 PASS、compile・sim・Notion 同期合格、MANIFEST 不一致0。
- Pages：統合コミットの Deploy ワークフロー成功（run 44964814931）。
- ライブ検証：公開サイトの dist 全17ファイルが統合ツリーと SHA-256 一致（17/17）。配信中の index.html に新しい階タブ規則（`#library-monster-tabs` の flex・overflow-x:auto と、ボタンの min-width:44px／min-height:36px）があることを確認。
