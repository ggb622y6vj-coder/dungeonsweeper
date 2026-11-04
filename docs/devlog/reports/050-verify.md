# 050 verify — fed7246 (live site, 1280 mouse / 390 tap) — OK

Deploy: dist/*.js + index.html match live. Script: /tmp/v050/b.py. JS errors: none.

## Checklist
1–2. For exploration and battle × dios and medicine × stone card (3) and dead card (4): click or tap the gray card, then press Space and Enter. Nothing changes (MP, HP, items, logs, plans and commands stay the same), and the game is still waiting for a target. OK
3. After clicking a gray card, focus stays on the previous cursor (card 1). ArrowLeft moves to card 0 and Space applies to target 0, never to a gray card. OK
   - Exploration: 「冒1のHPが0回復した。」 / 「冒1のHPは満タンだ。」 (this is the intended target 0)
   - Battle: plan target 0
4. Clicking a normal card applies to that card (冒3 HP recovered). Pressing Space on the normal cursor in battle gives dios target 1. OK
5. Works the same at 1280 and 390. OK
6. Full suite: 35/35 PASS (19 cjs, monsters 88, selftest, 15 browser). Log: /tmp/v050-suite.log. OK

## Note (not NG)
- After a gray-card click, the swallow flag is only cleared by a key other than Space/Enter. So repeated Space/Enter all do nothing: gray card → Space → Space keeps the plan null. This differs from the stated behaviour ("only the very next one is ignored"). It still meets the spec and is the safer behaviour. Pressing any other key or moving the cursor restores normal behaviour.
