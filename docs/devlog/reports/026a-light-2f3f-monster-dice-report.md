# 026a-light-2f3f-monster-dice 報告（未 push・OK判定不合格）
Codex: gpt-6-luna / low、1回目で実装完了（約1.6分）。ログ: report/codex026a.log
コミット 2cbf455 はローカルブランチ hold/026a-dice に保存。main は origin/main (e54494b) のまま。task は todo/ に残置。

## 変更（2cbf455）
- data/monsters.csv / dist/monster-data.js: 2F 9種 → 1d8+1（火蜻蛉 1d8）、3F 4種 → 2d6+1、黒牙狼 → 2d8+1。指定どおり。ガーディアン（深層の魔将・奈落の監視者）とブレスは不変。
- tests/monster-dice.cjs（新規）＋ tests/game.cjs に require 1行。既存 assert の弱体化なし。

## テスト: 全 PASS
tests/*.cjs 全7本、compile-monsters.py --check（88種）、sim selftest、training-browser.py 1280/390px。

## sim（クリーン worktree, --jobs 0,0,2,3,1,2 --n 150, 勝率/死者毎戦）
| 構成 | 前 e54494b | 後 2cbf455 |
|---|---|---|
| 装備なし 2F Lv2 通常 | 84.0% / 0.70 | 84.0% / 0.67 ✔(≥84) |
| 装備なし 3F Lv3 通常 | 66.0% / 1.56 | 68.0% / 1.33 ✔(≥66) |
| shop 2F Lv2 ガーディアン | 94.0% | 92.7% ✔ |
| shop 2F Lv3 ガーディアン | 96.0% | 98.7% ✔ |
| shop 3F Lv3 ガーディアン | 96.0% | 92.7% ✔ |
| shop 3F Lv4 ガーディアン | 95.3% | 97.3% ✔ |
| shop 2F Lv2 通常 死者/戦 | 0.253 | 0.193 |
| shop 3F Lv3 通常 死者/戦 | 0.267 | 0.153 |
判定「shop 2F Lv2 死者 ≤ 3F Lv3」: 0.193 > 0.153 → ✘（変更前は 0.253 ≤ 0.267 で満たしていた）。
Codex は「全基準満たす」と報告したが、同じ数値でこの項目は不合格（026-analysis の試算 0.19/0.15 の時点で既に不合格）。
3F の通常戦が軽くなりすぎ（2d6+1 平均8 が 2F 1d8+1 平均5.5 との差は縮むが、3F shop 通常勝率 94.7→98.0%）。
## 次案（要 試遊/ユーザー判断）
- 3F を 2d6+2 や 2d7+1 にして 3F 死者を戻す、または基準を n を増やして再評価（n=150 の誤差は ±0.08 程度）。
全数値: report/026a-sim-before.txt / 026a-sim-after.txt
