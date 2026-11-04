# 019b-light-ancientdragon-tuning
ティア：LIGHT　依存：019a

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- 敵データは data/monsters.csv → scripts/compile-monsters.py で生成する。このファイルの「変更内容」以外は変更しない。
- 報告は日本語で簡潔に書く。

## 目的
9F の守護者 ancientdragon の勝率を目標以上にする。
- 現状：推奨下限 Lv13・現実的な装備で 86.5%（目標 89% 以上）。
- 原因の中心はブレス（7d8・発動率35%）。ダイスを 6d8 に下げても効果がなかった。

## 変更内容
data/monsters.csv の ancientdragon だけを変更し、compile-monsters.py で再生成する。
- ブレスの発動率：0.35 → 0.25
- HP：18d8+36 → 16d8+32
- ブレスのダイス（7d8）とその他の値は変えない。

## OKの判定方法
- テスト全PASS。compile-monsters.py --check で88体。
- sim の条件：
  - jobs 0,0,2,3,1,2、--floor 9 --boss --level 13、n=1000。
  - 装備：店装備（minFloor≤9）＋次の12品。
    flamesword, magicbow, powerstaff, holyhammer, magichelm, assassinknife, ninjagarb, holyvestment, galeboots, ogreslayer, sagestaff, knightplate
- 判定基準：
  - 勝率が 89% 以上（事前測定では 90.7%）。
  - Lv16 で 100% を超えない範囲で 99% 前後。
- 他の階の守護者の数値は変わらない。
