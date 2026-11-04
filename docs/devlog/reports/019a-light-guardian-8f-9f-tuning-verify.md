# 019a-light-guardian-8f-9f-tuning 検証（f8fca08）
判定：**8F OK / 9F 未達 → todo/019b-light-ancientdragon-tuning.md**

## テスト・データ
- テストはすべてPASSした（game / training / compile-monsters 88体 / sim selftest）。
- HP の変更を確認した。
  - demongeneral：14d8+35
  - ancientdragon：18d8+36

## 現実的な装備での sim（019検証と同じハーネス。店装備＋累積入手率50%以上の迷宮産装備）
| 階/Lv | 守護者(n=1000) | 019時 | 通常(n=300) |
|---|---|---|---|
| 7F/11 | 93.8 | 94 | 97.3 |
| 8F/12 | **89.5** | 86 | 95.7 |
| 9F/13 | **86.5** | 82 | 96 |
| 10F/15 | 96.0 | 97.3 | 99.7 |

## 9F の追加調整候補（ローカルで ENEMIES を書き換えて測定。Lv13、n=1000）
| 候補 | 勝率 |
|---|---|
| ブレス 7d8→6d8 | 85.9（効果なし） |
| ブレス率 .35→.25 | 89.0 |
| ブレス率 .35→.20 | 89.5 |
| ブレス率 .25 ＋ HP 16d8+32 | **90.7**（Lv16 では 99.7） |

## ライブ
- monsters.js と monster-data.js がリポジトリと一致した。
- 8F の守護者戦（魔将軍＋取り巻き）が進行し、ダルトのログも出た。pageerror は0件。
- スクリーンショット：/workspace/sim/v019a-8F*.png
