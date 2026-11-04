# 019-light-chest-loot-table 検証（82674aa）
判定：**OK（入手性は解消）。8F/9F の守護者が推奨下限Lvで目標をやや下回るため、調整todo 019a を作成**

## テスト
- game、training、compile-monsters（88体）、sim selftest：すべてPASS。
- CHEST_LOOT は仕様どおり。
  - itemChance：.20〜.45
  - priceCap：150〜6000
- chestItemPool の重みを確認した。
  - shop:false の品：minFloor と同じ階では 0.5。
  - minFloor≤floor−3 の品：0.3。
  - minFloor 未設定の品は0件なので、`minFloor!==undefined` 条件による差は出ない。
- rewardChest は itemChance[floor-1] を使っている。
- dropWeapon は chestItemPool の中の drop 品から抽選している。

## shop:false 17品の入手性（各階10万回抽選。宝箱1個あたりの入手率%）
| 品 | 初出階 | 初出階での率 | 最大の率 |
|---|---|---|---|
| flamesword/magicbow/powerstaff/holyhammer | 5F | 約0.75 | 7F 1.67 |
| magichelm（防具） | 5F | 0.76 | 7F 1.62 |
| assassinknife | 6F | 0.68 | 8F 1.86 |
| ninjagarb/holyvestment/galeboots（防具） | 6F | 約0.68 | 8F 約1.87 |
| ogreslayer/sagestaff | 7F | 約0.83 | 9F 約2.0 |
| knightplate（防具） | 7F | 0.82 | 9F 1.92 |
| judgehammer/ninjato/dragonbow | 8F | 約0.92 | 10F 約2.33 |
| holysword | 9F | 0.99 | 10F 2.40 |
| dragonmail（防具） | 9F | 1.02 | 10F 2.36 |
- 全17品が初出階＝minFloor で入手できる。
- 防具6品も宝箱から出る。敵のドロップは drop 品（武器）のみ（仕様どおり）。

## 現実的な装備での sim（勝率%、n=300）
前提：
- 宝箱は1階あたり約30個開ける（約10個×3回）。
- その階に着くまでの累積入手確率が50%以上の迷宮産品を装備する。それ以外は店の装備。
  - 7F：5F産の5品（約59%）
  - 8F：＋6F産の4品（約63%）
  - 9F：＋7F産の3品（約67%）
  - 10F：＋8F産の3品（約71%）。holysword/dragonmail は48%なので含めない。

| 階/Lv | 通常 | 守護者 |
|---|---|---|
| 4F/7 | 100 | 100 |
| 5F/8 | 100 | 100 |
| 6F/10 | 100 | 99.7 |
| 7F/11 | 97.3 | 94 |
| 8F/12 | 95.7 | **86** |
| 9F/13 | 96 | **82** |
| 10F/15 | 99.7 | 97.3 |

- 推奨Lvを1上げた場合：8F/Lv13 は 93.7、9F/Lv14 は 94。
- 8F（demongeneral）と9F（ancientdragon）だけ、推奨下限Lvでは目標89%を下回る。

## ライブ
- balance.js と game.js がリポジトリと一致した。
- 1F・5F・9F で rewardChest を各40回実行した。
  - 1F：浅い階の品のみ。
  - 9F：炎の剣、魔弓などが出た。
- pageerror は0件。/workspace/sim/v019.png
