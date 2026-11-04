# 006-bugfix-summon-cap 検証結果 — 判定: OK
- 対象: 7300388（dist/monsters.js）。テスト3つすべて成功
- node（/tmp/v6.cjs。Math.random を固定し、rat が毎回「仲間を呼ぶ」を選ぶようにした。毎ターン、呼ばれた仲間を倒して group 上限(summonCap=6)に当たらないようにした）:
  - 1戦闘で10回呼ぶ → 追加は4体（summoned=4）。5回目からの6回は「仲間を呼んだが、現れなかった。」
  - 新しい s.enemy での2戦闘目も同じく4体＋失敗6回（カウンタは戦闘ごとにリセット）。encounter() で作った新しい敵の summoned は undefined
  - 倒さずに呼ばせた場合も最大で1+4=5体。1戦闘で得る経験値は最大5体分に収まる
- 本番（monsters.js がリポジトリと一致）headless Chrome（/workspace/pp/v006.cjs）: 6人で探索と戦闘125ラウンド、pageerror 0（404 はリソース1件のみ）。今回の実行では本番で敵が仲間を呼ぶ場面は出なかった
