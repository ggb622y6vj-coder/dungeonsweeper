# 015-light-flag-tuning 実装報告
- コミット: 88292fe（main へ push 済み）
- モデル: gpt-6-luna（reasoning low）、1回目で成功
- 変更: dist/flags.js flagChance() を二乗式 min(.50,.005n²) → 線形 min(.40,.04n)（FLAG_CHANCE_PER/FLAG_CHANCE_CAP 定数追加）。tests/game.cjs の旗確率テスト2か所を 0→0/1→.04/5→.2/10→.4/100→.4 に更新。docs/SPECIFICATION.md・BALANCE.md 更新。MANIFEST.sha256 再生成。発動効果・誤旗の呪いは変更なし。
- テスト: tests/game.cjs、tests/training.cjs、compile-monsters --check、scripts/sim/selftest.cjs すべて PASS
- sim（--jobs 0,0,2,3,1,2 --n 1000）変更前・変更後とも同一（sim は旗を立てないため影響なし）: report/015-sim-before.txt / 015-sim-after.txt
  - Lv1/1F 勝率98.0% 全滅0.1%、Lv1/3F 47.0%/27.9%、Lv3/3F 61.2%/12.9%、Lv1/3F守護者 34.5%/65.5%
- ブラウザ手動確認は未実施（試遊に依頼）
