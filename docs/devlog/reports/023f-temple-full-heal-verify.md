# 023f 検証 (13300fe) — OK
- テスト全PASS（tests/*.cjs, compile-monsters --check, selftest, training-browser.py）
- 差分: 期待値を HP1 → maxHP、MP不変 → maxMP に変更しただけ。temple.cjs の deepEqual（XP・装備・IDを含む全体比較）はそのまま維持、MPのアサーションは追加。弱化なし
- コード: 成功時 hp=maxHP、MP はパーティなら s.mp[i]、控えなら r.mp を maxMP に。失敗（死亡→灰→ロスト）は変更なし
- node: 控え(dead)の蘇生 → HP 24/24・MP 17/17
- 実機（Pages=13300fe一致、PC+390x844）: 毒で3人死亡→帰還→1人を控えへ→寺院でパーティの2人が「…は蘇生した。HP・MPが全快した。」→ HP・MP満タン（例 P1 24/24・MP 19/19）。強制失敗で控えのP4「蘇生に失敗した。灰になった。」。pageerror 0
- SS: /workspace/sim/v023f-{desktop,mobile}-{list,success}.png
