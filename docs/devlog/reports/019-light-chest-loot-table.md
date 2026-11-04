# 019-light-chest-loot-table 報告
- モデル: gpt-6-luna (low)、1回目で成功
- コミット: 82674aa（main に push 済み）
- 変更: dist/balance.js に CHEST_LOOT（itemChance・priceCap）追加、dist/game.js の chestItemPool を重み付き抽選（shop:false は minFloor 階で0.5、minFloor≤階−3 の古い品は0.3）に、rewardChest の品出現率を itemChance[floor-1] に、dropWeapon を chestItemPool から抽選に。BALANCE.md に表と将来課題（呪い・未鑑定）を追記。tests/game.cjs に1万回抽選の回帰テスト追加、plate テストを「3Fで出る・2Fで出ない」に更新。MANIFEST.sha256 再生成
- テスト: node tests/game.cjs、node tests/training.cjs、compile-monsters.py --check（88体）、scripts/sim/selftest.cjs すべて PASS
- sim（--jobs 0,0,2,3,1,2 --n 1000）: 変更前後で同一。Lv1/1F 98%、Lv1/3F 47%、Lv3/3F 61.2%、Lv1/3F守護者 34.5%（sim は初期装備・ドロップなしのため変化なし）。019-sim-before.txt / 019-sim-after.txt
- 未確認: ブラウザ
