# 039 exploration keys + F flag: DONE
Commit 3f94b4c. Models: codex gpt-6-luna low (incomplete: weak test, M didn't close map), retried with gpt-6.1-sol medium (finished).
- W/S/arrows move, A/D turn, Q/E strafe, F/G/M/C. No R or T. A single handling path in keynav.js; the legacy game.js keydown handler was removed.
- New tests/explore-keys-browser.py (keyboard only, 1280/390) passes 10/10. All tests pass.
