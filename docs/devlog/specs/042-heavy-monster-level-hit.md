# 042 heavy: 敵の命中にモンスターLvを反映

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
Wizardry #1 では敵の打撃の命中率が (敵Lv + 被弾者AC)×5%（5〜95%）で決まり、高Lvの敵ほど当てやすい。今のこのゲームは CSV の命中補正 d.hit だけで判定していて、敵Lvが関係しない。Lvを持ち込みつつ、適正Lvで戦うときの難しさは変えないようにする。

## 変更内容
- dist/game.js:276 の `hits(d.hit, effectiveAC(i))` を `hits(d.hit + levelHitBonus(e, i), effectiveAC(i))` にする。
- `levelHitBonus(e,i) = clamp(-3, +3, trunc((monsterLevel(e) - members[i].level) / 3))`
  - 敵と被弾者のLv差3ごとに d20 に ±1（命中率で ±5%）。
  - 出目20は必ず命中、1は必ず外れ（命中率5〜95%）はこれまでどおり。
  - 差に応じた補正にする理由：d.hit がすでに階層ごとに調整済みなので、Wizardry のように Lv をそのまま足すと深い階層の敵が強くなりすぎる。差分にすれば、適正Lvでは補正がほぼ0、Lv不足で潜ったときだけ痛くなる（Wizardry で格上の敵がよく当たるのと同じ感覚）。
- 味方の命中は変えない。今の式 21−AC−classHit(戦士/僧侶 2+L/3、他 L/5)−武器−力+3×列 が、すでに Wizardry の HitCalcMod と同じ形になっている。Wizardry でも、味方の命中にモンスターLvは使われない。
- 図鑑（library.js）の表示は変えない。

## OKの判定方法
1. node テストを追加（tests/monster-level-hit.cjs）。
   - Lv差 0 / +3 / +9 / -9 で補正が 0 / +1 / +3 / -3 になる。
   - 出目20は必ず命中、出目1は必ず外れる。
2. 固定シードで、Lv5パーティが 6F の敵（Lv10〜12）から受ける命中率が、Lv12パーティより 5〜15 ポイント高い。
3. シムで基準表の全階を再計測（n=400）。
   - 全滅率の増加はどの階も +1.0 ポイント以内。
   - 戦闘あたり死亡の増加は +0.03 以内、または基準の1.2倍以内（大きい方を許容）。
   - 超えたら式を変えず、除数を3→4にして再計測し、結果を報告に書く。
4. 全テストが通る。
