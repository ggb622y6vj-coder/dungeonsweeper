# 指示書126 ライブ検証記録

日付 2026-11-22

- 統合：hold/126 を main へ fast-forward（main ccaac45）。
- 統合後検証：`node tests/game.cjs` 235 PASS、ブラウザテスト全55件 PASS、`python3 scripts/compile-monsters.py --check` 108件合格、Notion 同期差分0、MANIFEST 不一致0。
- Pages：統合コミットの Deploy ワークフロー成功（run 44972849326）。
- ライブ検証：公開サイトの dist 全17ファイルが統合ツリーと SHA-256 一致（17/17）。配信中の monster-data.js に新規モンスター（rafflesia・cathuman 系ほか）、weapons.js に「伐採の鎌」があることを確認。
- Notion 記録の追従：宝箱抽選テーブルDBのグループ件数を G1=10・G2=16・G3=13・G4=15 へ更新、システムDB「図書館」の詳細をモンスター108種・アイテム81種へ更新。
