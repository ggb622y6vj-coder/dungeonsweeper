# 045 light: ディスペル（消え去った）の敵Lv係数を Wizardry 式に

## 共通ルール
- 作業ツリーは各自のもの。/workspace/dungeonsweeper（別ワーカー）は触らない。push は指示があるまでしない。
- 038〜041（キーボード操作）が並行実装中。keynav.js・キー割り当て・フォーカス関連のコードには触れない。競合したら 038〜041 側を優先。
- ゲームコードは dist/*.js。セーブキー ash-v1 の互換を壊さない（新フィールドは欠損時デフォルトで補う）。
- 完了時は全テスト（tests/*.cjs、python3 scripts/compile-monsters.py --check、node scripts/sim/selftest.cjs、tests/*-browser.py）を通す。
- シム基準値（68b57d8、--jobs 0,0,2,3,1,2 --n 400、ログは自分専用ファイル名で）:
  | 階 | Lv | 全滅率 | 戦闘あたり死亡 |
  |---|---|---|---|
  | 1F | 3 | 0 | 0.010 |
  | 2F | 5 | 0 | 0 |
  | 3F | 7 | 0 | 0.015 |
  | 4F | 9 | 0 | 0 |
  | 5F | 11 | 0.0025 | 0.200 |
  | 6F | 12 | 0.0125 | 0.183 |
  | 7F | 14 | 0.0025 | 0.113 |
  | 8F | 15 | 0 | 0.038 |
  | 9F | 17 | 0 | 0.033 |
  | 10F | 19 | 0 | 0.028 |
- 参考（Wizardry #1 の数式）: https://wizardryarchives.com/downloads/gamecodes.pdf ／ https://www.zimlab.com/wizardry/walk/wizardry-123-game-calculations.htm ／ https://datadrivengamer.blogspot.com/2019/08/the-not-so-basic-mechanics-of-wizardry.html ／ https://wiliki.zukeran.org/old/1441581341.html

## 目的
Wizardry #1 の僧侶のディスペル成功率は 50 + 5×術者Lv − 10×敵Lv（%）で、敵Lvの重みが術者Lvの2倍ある。今のこのゲームは 0.5 + 0.05×(術者Lv−敵Lv)（5〜95%）で、敵Lvの重みが Wizardry の半分。高Lvの不死にはディスペルが効きにくい、という手応えを出す。

## 変更内容
- 成功率を `clamp(0.05, 0.95, 0.5 + 0.05×術者Lv − 0.10×敵Lv + 0.05×K)` に変える。
  - K は、適正Lvでの成功率を今と同じにするための補正。K = 各不死の「出現階の適正Lv」で今の式と差が出ないよう、敵Lvの中央値を使う。
  - 目安は 6F の亡霊。適正Lv12 のパーティで、今の値から ±5 ポイント以内に収める。
  - 決めた K の値と計算過程を報告に書く。
- ディスペルした敵から経験値が出ない仕様は変えない（Wizardry と同じ）。

## OKの判定方法
1. node テスト。
   - 術者Lv12 対 敵Lv10 の成功率が仕様どおり。
   - 敵Lvが1上がると成功率が10ポイント下がる。
   - 上限95%・下限5%が効く。
2. 5F 屍術師戦・6F 吸血鬼戦の周辺（不死が多い階）でシムを回す。全滅率 +1.0 ポイント以内、戦闘あたり死亡 +0.03 以内。
3. 全テストが通る。
