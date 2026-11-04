# 038 keyboard focus core: DONE (previously HELD)
Commit b4fb683 (pushed together with 039 3f94b4c). Model: codex gpt-6-astra high; review fixes by the executor.
- Flaky keynav-browser root cause: the #training dialog 'close' event is dispatched asynchronously. A fast Esc -> Space reopen + roll was then wiped by the stale close event (resetRecruitDraft). Fixed in training.js: ignore the close event while the dialog is open again. The test now passes 10/10 (both widths each run).
- Dungeon movement is kept working with KeyNav: arrows and A/D in the explore layer with no prompt are passed to the game. The keynav-browser expectation changed from "ArrowRight does not move" to "turns" (owner decision).
- All tests pass: node tests, compile --check, clean-worktree selftest, all browser tests.
