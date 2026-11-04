# 026b 検証（a774946, /workspace/verify-clone origin/main）
判定: **OK**
## ダイス差分（e54494b..a774946, data/monsters.csv）
- 変更は物理ダメージ列の 14 行のみで、026b 仕様と完全一致。
  - 2F の 8 体：2d6→1d8+1
  - 火蜻蛉：2d5→1d8
  - 3F の 4 体：3d6→2d6+2
  - 黒牙狼：3d9→2d8+2
- ガーディアン（深層の魔将・奈落の監視者）とブレス列（火蜻蛉 炎/全体/2d6/60% 等）は変更なし。
- monsters.csv と dist/monster-data.js はスクラッチ版 /tmp/c26B とバイト一致。
- compile-monsters.py --check: 88 definitions validated。
## テスト
- tests/*.cjs 8本 全PASS（monster-dice.cjs: 14 regular / guardians and breath unchanged）。
- tests/*.py 3本（target-select / town-layout / training browser）全PASS。dist を :8000 で配信して実行。
## sim（n=600, --jobs 0,0,2,3,1,2）
スクラッチの数値と全条件で完全一致。
| 条件 | 目標 | 結果 |
|---|---|---|
| shop 2F Lv2 通常 死者/戦 ≤ 3F Lv3 | ≤ | 0.213 ≤ 0.227 ✔ |
| 装備なし 2F Lv2 通常 勝率 | ≥84% | 86.5% ✔ |
| 装備なし 3F Lv3 通常 勝率 | ≥66% | 66.0% ✔（境界） |
| shop ガーディアン 2F Lv2/2F Lv3/3F Lv3/3F Lv4 | 89-100% | 94.3/97.8/96.2/96.0% ✔ |
## autoplay bot6 3×20遠征（参考・判定基準外）
| | 026のみ (e54494b) | 026b (a774946) |
|---|---|---|
| 全滅 | 0/0/0 | 0/0/0 |
| 最大階 | 2/2/2 | 2/1/2 |
| ボス撃破 | 4/8/7 | 4/0/2 |
| 新人補充 | 10/16/15 | 17/23/19 |
| 蘇生 | 16/14/19 | 18/17/30 |
- 026b のほうがやや悪い。ただし run2 は 1F から出ておらず、1F は 026b で変わっていない。a774946 には 027/028（UI）も入っていて乱数経路が違うため、3ラン程度ならばらつきの範囲と判断。
- どちらも 3F には未到達（026-analysis の XP カーブ律速のまま）。
## ライブ
https://ggb622y6vj-coder.github.io/dungeonsweeper/monster-data.js は dist/monster-data.js とバイト一致。
- held/026a と todo/026b は検証前に既に done/ へ移動済み（移動元に無し）。done/ にあることを確認。
