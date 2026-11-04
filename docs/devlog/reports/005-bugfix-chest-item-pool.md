# 005-bugfix-chest-item-pool 実装報告
- コミット: 82a7f8f（main に push 済み）
- モデル: gpt-6-luna / reasoning low（1回目で成功）
- 変更: dist/game.js に chestItemPool(floor) を追加（drop:true の武器＋part を持つ防具のうち price <= floor*150。空なら最安品1つ）。rewardChest がこれを使う。dropWeapon は未変更。
- テスト: tests/game.cjs に回帰テスト追加（1Fで1万回抽選して plate が出ない、2Fで plate が候補に入る）。game.cjs / training.cjs / compile-monsters --check 全PASS。MANIFEST.sha256 更新。
- ブラウザ未確認。
