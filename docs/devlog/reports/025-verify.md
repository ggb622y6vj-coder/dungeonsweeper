# 025 verify — OK

- Clone /workspace/verify-clone2 @ origin/main = b9cb093 (includes b9cb093). Live game.js / library.js byte-identical to dist.
- Tests: node tests/*.cjs (death-status, final-boss, game, library, temple, training) PASS; compile-monsters --check 88 OK; sim selftest PASS; training-browser.py (live) 1280/390 PASS.
- Test diff vs 141d142: only additions + library.js added to load lists; no asserts removed/weakened.
- Independent playwright (/tmp/lib.py, live, 1280 & 390):
  - New game: モンスター 0/88 · アイテム 0/52, all ？？？ in both tabs.
  - DOM leak: undiscovered entries are bare `<h4>？？？</h4>` with no dl/data-attrs; dialog HTML contains no names/stats of undiscovered entries. (Floor group headers 地下N階 reveal per-floor entry counts only — acceptable.)
  - Shop buy (鉄兜), 1F win (洞窟スライム count 1, firstFloor 1), chest (板金鎧) → 1/88, 2/52 (+傷薬 listed separately, not counted — accepted deviation).
  - Persists after reload, after party wipe + reload, after deleting a character via 登録抹消→確認 (7→6 roster).
  - Reset: #resetdialog confirm prompt shown (text mentions 図鑑); cancel keeps library; confirm clears to 0/0 (accepted deviation).
  - Open/close (× and Esc) and both tabs work; no JS errors.
- Screenshots: /workspace/sim/lib-1280.png, lib-390.png (+ lib-*-items.png).
- 025 todo already in done/.
