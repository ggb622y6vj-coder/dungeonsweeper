# 005a-bugfix-chest-unequippable-message — 完了
- コミット: 2f1d1c7（main に push 済み）
- モデル: gpt-6-luna（reasoning low）、1回目で成功
- 変更: dist/game.js rewardChest() — 装備できる職業が誰もいない場合「${w.name}を見つけたが、誰も扱えないので置いていった。」、装備可能者が全員満杯なら従来の「アイテムがいっぱいで装備品を持ち帰れなかった。」。抽選・受け取り手選択は変更なし。
- テスト追加: tests/game.cjs（誰も扱えない／満杯／通常受け取り）
- テスト: game.cjs・training.cjs・compile-monsters --check すべて PASS。MANIFEST.sha256 更新済み。
- ブラウザ未確認
