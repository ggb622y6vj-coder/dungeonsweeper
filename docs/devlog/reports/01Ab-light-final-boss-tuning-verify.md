# 01Ab-light-final-boss-tuning 検証（03133bc）
判定：**OK**

## テスト・ライブ
- tests/*.cjs、compile-monsters（88体）、sim selftest がすべてPASSした。
- ライブの monster-data.js、monsters.js、game.js は 03133bc と一致した。
- ボス戦は 01A の検証と同じ手順で、pageerror 0件。

## 最終ボス（現実的な装備ハーネス、n=1000）
装備は店装備＋15品。
| Lv | 勝率 |
|---|---|
| 16 | 56.3 |
| 18 | **81.7**（目標65〜90） |
| 20 | 94.6 |
- --gear drop（迷宮産装備をすべて持った場合）、Lv18：97.6%

## Codex の sim01Ab.cjs が 0% になった件
| 実行 | Lv18 |
|---|---|
| sim01Ab.cjs の harness をクリーンコピー（/tmp/cAb = 03133bc）に差し替え | **81.7%**（私の値と完全に一致） |
| sim01Ab.cjs を元のまま（/workspace/dungeonsweeper を参照、現在は 03133bc でクリーン） | 84.0%（n=300） |
- 装備の割り当ては sim019b.cjs と同じロジックで、迷宮産のリストが15品に増えただけ。私のハーネスと結果が一致しているので、割り当ては正しい。
- 0%（毎回6人全滅）と変更前の 6〜31% は再現しない。測定した時点の /workspace/dungeonsweeper 作業ツリー（020/020a 作業中の未コミット dist）を読んだのが原因。
  - 毎回全滅していることから、死亡状態がトライアル間に持ち越されていた可能性が高い。
  - 変更前の値（実際は99.8%）も同じ理由で狂っていた。
- 正しい値は私の値（クリーンコピーでの値）。
- 補足：sim01Ab.cjs の --gear drop は shop と同じ装備になる（リストを常に含めているため）。Codex 報告の「drop 97.6%」は、リポジトリの scripts/sim/combat.cjs --gear drop の値で、私の値と一致している。
