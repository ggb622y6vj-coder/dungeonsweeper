# 023f report — pushed (13300fe)
- Model: gpt-6-luna low, 1 try. Log: codex023f.log
- Change: templeRaise success sets HP=maxHP and MP=maxMP (party and reserve); failure (dead→ash, ash→lost) unchanged. Notice text: 「HP・MPが全快した。」 BALANCE/SPEC updated.
- Tests: the HP1 assertions in temple.cjs/training.cjs replaced with maxHP plus new maxMP checks (stricter). Nothing weakened.
- tests/*.cjs PASS, compile --check PASS, sim selftest PASS, training-browser.py (/tmp/pyv, google-chrome path via temp copy) 1280/390 PASS.
- MANIFEST regenerated. Todo moved to done/. Live check of the temple flow itself not done.
