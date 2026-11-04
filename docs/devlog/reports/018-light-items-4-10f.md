# 018-light-items-4-10f 報告
- モデル: gpt-6-luna (low)、1回目で成功
- コミット: 052b5c6（main に push 済み）
- 変更: dist/weapons.js・dist/items.js を assets 版に置換（52品、shop:false 18品※タスク記載は17品）、店の表示と buy で shop:false を除外、dropWeapon/chestItemPool に minFloor 制限、dropMedicine を現在階の minFloor 以下に制限、気付け薬(dialko)・上傷薬(dial)・霊薬(dialma)の使用効果を useMedicine に追加、命中計算の hitBonus は physicalAttack で適用、BALANCE.md（docs/ ではなくリポジトリ直下の既存ファイル）に装備・薬の表を追加、tests/game.cjs に回帰テスト追加（既存の plate 宝箱テストは plate の minFloor に合わせ 2F→3F に変更）、MANIFEST.sha256 再生成
- テスト: node tests/game.cjs、node tests/training.cjs、compile-monsters.py --check（88体）、scripts/sim/selftest.cjs すべて PASS
- sim（--jobs 0,0,2,3,1,2 --n 1000）: 変更前後で同一。Lv1/1F 98%、Lv1/3F 47%、Lv3/3F 61.2%、Lv1/3F守護者 34.5%（sim は初期装備・ドロップなしのため）。018-sim-before.txt / 018-sim-after.txt
- 未確認: ブラウザでの店の表示
