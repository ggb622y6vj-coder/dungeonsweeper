# 050 [light] Clicking a grayed-out card and then pressing Space must not use anything

## Background (found while verifying 049)
- While choosing an ally target, clicking a grayed-out card (a petrified or dead member) with the mouse does nothing by itself, but focus moves to that card.
- If you then press Space, the spell or medicine is used on the first candidate (冒1). Reproduced with ディオス, which used up 2 MP.
- Cause: keynav.js detect() only puts keyboard-selectable cards in the navigation targets, so when focus is somewhere else, Space runs the default first candidate.

## Spec
- Clicking or tapping a grayed-out card does not move focus or the selection cursor to it. The cursor stays where it was.
- As a safeguard, if Space or Enter is pressed while focus or the selection is on a card that cannot be used, nothing happens (no message, no MP or item used).
- This applies both in battle and while exploring, for every ally target (spells and items).
- Keyboard movement keeps working as before (it skips grayed-out cards).

## How to check it's OK
1. Choose ディオス → click a petrified card → press Space: nothing happens (MP, HP, items and the log are unchanged, and you are still choosing a target).
2. Do the same with a dead member's card and with medicine; the result is the same as 1.
3. After clicking a grayed-out card, keyboard movement continues from the previous cursor position.
4. Clicking a normal card and pressing Space works as before.
5. The same holds at 1280 and at 390 (taps), in battle and while exploring.
6. The full test suite passes.
