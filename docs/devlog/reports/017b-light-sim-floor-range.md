# 017b-light-sim-floor-range 報告
- コミット: eee76ad（main へ push 済み）
- モデル: gpt-6-luna（effort low）、1回目で成功
- 変更: scripts/sim/combat.cjs で --floor を1〜10に拡張、--gear shop|drop を追加（省略時は初期装備のまま）。selftest に floor10 と --gear のケースを追加。MANIFEST.sha256 を再生成。
- テスト: sim selftest、tests/game.cjs、tests/training.cjs、compile-monsters --check（88体）すべてPASS。
- sim（jobs 0,0,2,3,1,2、Lv3、n=200、--gear なし）: 変更前後で完全一致（017b-sim-before.txt / 017b-sim-after.txt）。
- 参考: --level 15 --floor 10 --boss --gear drop --n 50 は 勝率2%・全滅98%。試遊のローカル改造版（10F 97.3%）と大きく違うので、装備選択ロジックの確認が必要かもしれない。
