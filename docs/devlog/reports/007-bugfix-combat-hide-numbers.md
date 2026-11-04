# 007-bugfix-combat-hide-numbers — 完了
- モデル: gpt-6-luna (low)、1回目で成功
- コミット: 19eb1eb（main へ push 済み）
- 変更: dist/game.js scene() — visibleCombat() 中は一人称視界の左・正面・右パネルの罠数字と、足元の現在地数字を描画しない。地図側は変更なし。
- テスト: tests/game.cjs に戦闘中非表示・戦闘後再表示の回帰テスト追加。game.cjs / training.cjs / compile-monsters --check 全PASS。MANIFEST.sha256 再生成。
- ブラウザ（PC/スマホ幅）は未確認。
