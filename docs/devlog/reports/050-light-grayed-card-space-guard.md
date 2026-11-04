# 050 report — hold/050 @ fed7246 (local only, not pushed; base origin/main b2526e1)

Models: Codex gpt-6-luna (low), 1 try. Partially wrong; finished by hand (no sol retry).

## Changes
- dist/combatui.js: allyTargetSelectable(t) (canWork AND rendered .targetable — canWork alone returns true for dead members during field spells, so Codex's guard missed dead cards). Capture mousedown on a grayed card preventDefault → focus/cursor not moved. Following Space/Enter is swallowed (allyTargetVoidPress flag, cleared by any other key or press). Click guard on grayed card is a no-op.
- dist/keynav.js: decide on a non-selectable ally card does nothing (safeguard).
- tests/target-select.cjs: grayed-card click keeps pick/resources (field/battle × spell/medicine).
- tests/target-select-browser.py: focus stays on card 1 after grayed clicks; click/tap grayed card + Space + Enter → no change, still picking, cursor on 1, arrow movement continues from 1 (Right/Left); battle variant uses touchscreen tap at 390.
- MANIFEST.sha256 regenerated; sha256sum -c OK.

## Tests
All node tests/*.cjs pass; compile-monsters --check OK; sim selftest OK; all 15 *-browser.py pass at 1280+390 (server: python -m http.server 8000 in dist/). target-select-browser 10/10 consecutive.

## Decision for user
Spec tension: cursor stays on previous valid card, yet Space right after clicking a grayed card must do nothing. Implemented: the first Space/Enter right after a grayed click is swallowed; after any other key (e.g. arrow) Space works on the cursor card normally.
