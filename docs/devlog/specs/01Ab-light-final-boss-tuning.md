# 01Ab-light-final-boss-tuning
ティア：LIGHT　依存：01A

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- 敵データは data/monsters.csv → scripts/compile-monsters.py で生成する。このファイルの「変更内容」以外は変更しない。
- 報告は日本語で簡潔に書く。

## 目的
最終ボス labyrinthlord が推奨Lv18・現実的な装備で勝率99.8%になっており、目標の65〜90%を大きく上回る。

## 変更内容
data/monsters.csv の labyrinthlord だけを次のように変え、再生成する。
- HP：26d8+60 → 44d8+110
- swings（攻撃回数）：3 → 4
- 呪文の使用率：0.15 → 0.35（ティルトウェイト 8d8 全体はそのまま）
- 他の値と、護衛の編成は変えない。

## OKの判定方法
- テスト全PASS（tests/final-boss.cjs を含む）。compile-monsters.py --check で88体。
- sim の条件：
  - jobs 0,0,2,3,1,2、--floor 10 --boss、n=1000。
  - 装備：店装備（minFloor≤10）＋次の15品。
    flamesword, magicbow, powerstaff, holyhammer, magichelm, assassinknife, ninjagarb, holyvestment, galeboots, ogreslayer, sagestaff, knightplate, judgehammer, ninjato, dragonbow
- 判定基準（事前測定値）：
  - Lv18 で 65〜90%（81.7%）。
  - Lv20 で 90% 以上（94.6%）。
  - Lv16 で 50% 以上（56.3%）。
- 迷宮産装備をすべて持った場合（--gear drop）、Lv18 で 95% 以上（97.6%）。
