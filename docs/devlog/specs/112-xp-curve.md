# 指示書112: 必要経験値カーブの引き上げ（レベルアップを重くする）

## 背景と決定
- Notion システムDB「経験値」ページの原作比較調査（2026-11-14）に基づく。現行は深層ほど1戦で次Lvに必要な増分に対する獲得XPが大きく、Lv15→16で約3.2戦、Lv19→20で約2.2戦と終盤のレベルアップが速すぎる。
- ユーザー決定（2026-11-14）: ペースは「C（強め）」。Lv8までは現行どおり、以降は到達Lvごとに倍率が1.2倍ずつ増え、最大6倍で頭打ち。実装は Codex。
- 原作の必要XP値そのものは移植しない（敵XPの構成が異なるため）。

## 仕様
### 倍率関数
- 到達レベル L（その増分で到達するレベル、2..30）に対する倍率:
  `xpCurveScale(L) = L<=8 ? 1 : Math.min(6, Math.pow(1.2, L-8))`
  - L9=1.2、L13≒2.488、L17≒5.160、L18以上=6（頭打ち）。
- 共有の定義を1か所に置き、生成・再生成・移行の全てがそれを使うこと。

### 生成（新規作成・転職）
- `generateClassXP(job)`（dist/recruits.js）の増分を次式に変更:
  `Math.round(115*(l-1)*CLASSES[job].xpFactor*(0.9+Math.random()*0.2)*xpCurveScale(l))`
- 新規作成（recruits.js）と転職時再生成（recruits.js の classChange 系）の `xpCurveVersion` は 3 にする。

### 既存セーブの移行（xpCurveVersion 3）
- `ensureProgression()`（dist/balance.js）の移行条件を `xpCurveVersion!==3` に更新し、未到達レベルの増分に倍率を掛ける:
  `targets[level] = targets[level-1] + Math.round((old[level]-old[level-1]) * xpCurveScale(level))`（level は現在Lv+1..30）
  - 到達済みレベルの累計・現在のXP・現在Lvは変更しない。
  - 移行は現在の保存値に対して行う（過去の v2 移行で ×1.15 が入ったセーブも、その現行値を基準に倍率を掛ける。切り戻しはしない）。
  - 冪等であること（2回目の読み込みで再適用しない）。
- xpTargets を持たない旧データ向けのフォールバック生成も、未来レベルの増分に倍率を適用し、到達済みレベルのプレースホルダ `50*level*(level-1)` は現行どおり維持する。
- 移行の対象はパーティメンバーだけでなく、控え（reserve の各 record.members）と遺体（corpses の各 record.members）など、後からパーティへ入る保存済みキャラクター記録すべてに効くこと。

### 変更しないもの
- 敵のXP、勝利時XPの分配、職業係数（xpFactor）、LEVEL_CAP=30、レベルアップ判定のタイミング（町帰還時）。
- セーブキー ash-v1、rosterVersion: 1。

## テスト
- 新規 tests/xp-curve.cjs を tests/game.cjs に登録:
  - xpCurveScale の値（L<=8で1、L9=1.2、L17≒5.16、L18以上=6、単調非減少）。
  - generateClassXP の各増分が、乱数 0.9〜1.1 の理論範囲 × 倍率 の範囲内に収まること（全職業）。
  - 移行: 既知の増分を持つ v2 の Lv12 メンバーで、到達済み累計が不変、増分13 = round(増分×1.2^5)、増分18以上は ×6（頭打ち）、xpCurveVersion=3、再実行で不変（冪等）。控え/遺体の記録にも移行が効くこと。
- 既存テストの追随: tests/class-change.cjs の xpCurveVersion=2 期待値など、旧カーブ前提のテストは新仕様に合わせて更新する（期待値を緩めて通すのではなく、新式で再計算する）。
- 標準検証: node tests/game.cjs / 全 tests/*-browser.py / compile-monsters --check / sim selftest / MANIFEST。

## 仕様書
- docs/SPECIFICATION.md の経験値・レベルアップの記述を新カーブに更新する。

## 参考（戦士・期待値）
| 到達Lv | 変更前 累計 | 変更後 累計 |
|---|---|---|
| 10 | 4,140 | 4,652 |
| 15 | 9,660 | 19,273 |
| 20 | 17,480 | 62,610 |
| 30 | 40,020 | 197,850 |
- 想定戦闘数（6人・戦士）: Lv15→16 は8Fで約13.7戦、Lv19→20 は10Fで約13.3戦、Lv29→30 は約20.3戦。
