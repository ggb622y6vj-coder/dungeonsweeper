# 021-heavy-temple 検証 (5dff5db) — OK
- テスト: tests/*.cjs(temple.cjs含む)・compile-monsters --check・selftest 全PASS（クリーン /tmp/c21）
- node 20000回試行: 成功率 dead Lv1/5/20=52.4/65.3/95.0%（期待53/65/95）、ash Lv1/10/20=42.4/69.4/90.2%（期待43/70/90）。金額は正確に減算、失敗遷移 dead→ash→lost、lost不可、金不足false・金不変、迷宮内false、成功HP1
- 実機(Pages=5dff5db一致, PC+390x844): 毒で2名死亡→帰還→寺院に パーティ/控え 両方表示(53%/100G)、所持金50Gでボタンdisabled、成功「P1は蘇生した。HPが1になった。」、強制失敗で 灰(43%/250G)→ロスト（一覧から消える）、迷宮入場可、リロード後も lost 保存。pageerror 0。SS: /workspace/sim/v021-{desktop,mobile}-{list,success,lost}.png
- 経済(クリーンdistのモンスターデータから算出、戦闘金貨=Σfloor(gold dice/3)×群れ平均): 1戦あたり 1F≈4G / 3F≈11 / 5F≈19 / 7F≈27 / 8F≈32 / 9F≈42 / 10F≈58G。1遠征10戦換算 5F≈190G, 8F≈320G, 10F≈580G（＋宝箱・売却品）
  - 例: Lv10死亡1000G≈5F遠征5回、Lv18灰4500G≈9F遠征10回、Lv20灰5000G≈10F遠征9回
  - 判定: 死亡蘇生は数遠征で払える「痛いが可能」、灰は大損失＝Wizardry的に妥当。要調整なし（売却収入が大きい場合のみ再確認推奨）
- 補足: autoplay(run.cjs)はLv1で2Fまでしか進まず経済測定には使えず、静的算出に切替
