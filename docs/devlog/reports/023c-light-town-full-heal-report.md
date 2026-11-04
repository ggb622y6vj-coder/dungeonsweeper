# 023c report — NOT COMPLETED, not committed, not pushed
- Try 1 (initial run interrupted at ~25s, partial edits discarded, rerun): gpt-6-luna low. Codex self-reported incomplete. tests/game.cjs FAIL, tests/death-status.cjs FAIL; final-boss/temple/training PASS; compile-monsters --check PASS. Diff: 023c-try1.diff
- Try 2: gpt-6.1-sol medium. Aborted after ~12s: Codex usage limit ("try again at 8:14 AM"). Diff: 023c-try2.diff
- Repo reset to clean main at 62b44e3. Todo left in todo/.

## Update 08:19 JST — COMPLETED
- Try 3: gpt-6.1-sol medium from clean main 62b44e3 (after the limit reset; no reset credit used). Success. Log: codex023c-3.log
- Tests: tests/*.cjs (death-status, final-boss, game, temple, training) PASS; compile-monsters --check PASS; scripts/sim/selftest PASS.
- Diff: game.js enterTown fully restores HP/MP for ok members (dead/ash/lost unchanged); inn is stable-only (free; levels up all ok members, refills MP, no HP heal); paid room removed from game.js and index.html; BALANCE/SPEC/HANDOFF updated. Tests updated: the old "return preserves HP/MP" and room checks were replaced with full-heal, all-member level-up, and no-room checks. No unrelated checks were weakened. training-browser.py extended, but not run (no Playwright on the box).
- MANIFEST.sha256 regenerated. Commit d8e022d pushed to origin/main. Todo moved to done/.
