# 指示書128 ライブ検証記録

日付 2026-11-22

- 統合：hold/128 を main へ fast-forward（main 6f95cb2）。
- 統合後検証：`node tests/game.cjs` 241 PASS、ブラウザテスト全55件 PASS、`python3 scripts/compile-monsters.py --check` 108件合格、Notion 同期差分0（アイテム92件）、MANIFEST 不一致0。
- Pages：統合コミットの Deploy ワークフロー成功（run 44994524309）。
- ライブ検証：公開サイトの dist 全17ファイルが統合ツリーと SHA-256 一致（17/17）。配信中の weapons.js に dragonslayerspear（新規武器）、game.js に訂正後の守護者イベント文「階段の上に誰かが覆いかぶさっている。」があることを確認。
