# 023a-bugfix-inn-dead-levelup 検証 (08c7b6e) — OK
- テスト全PASS（tests/*.cjs, compile-monsters.py --check, selftest、クリーン /tmp/c23a）
- node(/tmp/v23a.cjs, stayAtInn経由): xp5000で馬小屋→ok Lv10/10/9/10、死亡/灰はLv1・XP5000保持・maxHP不変。部屋 390G=(10+10+9+10)×10（複数Lvの合計式OK）、死亡/灰HP0のまま。蘇生後の馬小屋で Lv1→9
- 実機(Pages=08c7b6e一致, PC): 文言「普通の部屋：50 G（正常な冒険者の Lv × 10 G の合計）」、馬小屋で ok5人Lv7〜8、死亡者Lv1・報告に出ない。pageerror 0。SS /workspace/sim/v023a.png
- 023で指摘した tests/game.cjs の弱化（全員レベル検証・ACチェック・複数Lvの部屋代）は**未復元**。新テストも stayAtInn ではなく levelUp([i]) を直接呼んでいる。ただし023a todoには復元を書いていなかった（こちらの記載漏れ）ので、023aの不備ではない。上記はnodeで確認済みで実害なし。必要なら別途テスト強化todo
