# 022-light-lost-roster 検証 (338c9b6) — OK
- テスト全PASS。tests/training.cjs の既存「six-member cap」テスト残存＋新テスト PASS
- 実機(Pages一致, PC+390x844): 訓練所表示「控え・ロスト」「控え・死亡」「控え・灰」、ロストの加入ボタンdisabled、死亡/灰は有効。changeRecruitParty: lost=false, dead=true；lost抹消=true（名簿から消える）；6人時の加入=false（上限維持）。pageerror 0。SS: /workspace/sim/v022-{desktop,mobile}.png
