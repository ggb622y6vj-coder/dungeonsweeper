# 010a-bugfix-sim-katino-policy — 完了
- コミット: 8a5c91d（main へ push 済み）
- モデル: gpt-6-luna / low（1回目で成功）
- 変更: scripts/sim/combat.cjs の魔法使いAIで、守護者戦または対象列の生存敵が2体未満のときは katino を候補から除外。selftest.cjs に回帰テスト追加、README に AI 方針を1行追加、MANIFEST.sha256 再生成。dist/・tests/・data/ は変更なし。
- テスト: game / training / compile-monsters --check / sim selftest すべて PASS
- 守護者戦 Lv1/3F n=300 (--jobs 0,0,2,3,1,2 --boss): 勝率 98.3%（全滅 1.7%）
- 通常戦 Lv1/3F n=1000: 勝率 52.4%（全滅 6.5%、死者 1.93/戦）
