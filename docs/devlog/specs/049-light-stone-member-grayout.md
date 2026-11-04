# 049 [light] Gray out petrified members and make them unselectable when targeting allies

## Background
When targeting allies with ディオス (curing spells) or medicine items, petrified members are skipped when choosing with the keyboard. With the mouse or touch, though, they look selectable, and picking one shows 「石化を治せない」 (MP is not used).

## Spec
- When choosing an ally target in the party cards, gray out any member the action cannot work on (petrified members, as with ディオス or medicine) and make them unselectable.
  - Grayed out: lower opacity (around 0.4), cursor: not-allowed, no hover highlight.
  - Mouse clicks and taps do nothing (no message and no MP used).
  - Keyboard selection keeps skipping them, as it does now.
- Apply this both in battle and while exploring.
- Do not gray out members for targets that can work on a petrified member (マディ, the temple, items that cure petrification, and so on).
- When targeting ends, go back to the normal display.

## How to judge OK
1. When choosing a target for ディオス with a petrified member in the party, that member's card is grayed out (both at 1280 and 390 width).
2. Clicking or tapping the grayed-out card does nothing; there is no message and MP does not go down.
3. Choosing a target for マディ does not gray out the petrified member, and it can be selected.
4. Medicine items behave the same as 1 and 2.
5. Keyboard selection skips petrified members, as it does now.
6. The full test suite passes.
