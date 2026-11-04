# 019a-light-guardian-8f-9f-tuning
ティア：LIGHT　依存：019

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- 敵データは data/monsters.csv → scripts/compile-monsters.py で生成する。このファイルの「変更内容」以外は変更しない。
- 報告は日本語で簡潔に書く。

## 目的
8F・9F の守護者は、推奨下限Lvで現実的な装備（店装備＋その階までの迷宮産装備）の場合、勝率が目標89〜100%を下回る。
- 8F demongeneral（Lv12）：86%
- 9F ancientdragon（Lv13）：82%
- 参考：7F は 94%、10F は 97.3%。推奨Lvを1上げると 8F 93.7%、9F 94%。

## 変更内容（どちらか一つ）
- A（推奨）：data/monsters.csv で次のどちらかを行う。
  - demongeneral と ancientdragon の HP を約10%下げる。
  - またはダメージダイスを1段下げる（ダルトの使用率 0.3→0.2 など）。
  - その後、compile-monsters.py で再生成する。
- B：design-10f.md / BALANCE.md の推奨Lvを変更する（8F 13〜14、9F 14〜16）。

## OKの判定方法
- テスト全PASS。
- 判定に使う sim の条件：
  - パーティ：jobs 0,0,2,3,1,2、n=300。
  - 装備：店装備＋迷宮産装備（8F は 5〜6F 産の9品、9F は＋7F 産の3品）。
- 判定基準：
  - 8F Lv12 と 9F Lv13 の守護者勝率が 89〜100%（Bの場合は新しい推奨下限Lvで判定）。
  - 7F と 10F の守護者勝率が ±3pt 以内で変わらない。
  - 通常戦の勝率は 90% 以上を維持する。
