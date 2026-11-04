# 029a verify (0dddaa2, origin/main HEAD)
判定: OK（旧セーブ向けに軽微な 029b を起票）
- Pages 反映後 live = dist 一致。全 tests/*.cjs、compile-monsters --check、selftest PASS。
- live browser 1280/390: training / target-select / town-layout / auto-temple / tavern-browser(新規) すべて PASS。
  tavern-browser: （死亡）/（灰）/（ロスト）表示＋disabled、DOM改ざん保存は拒否＋酒場/町に通知、ok の並べ替え・外す・控え加入は可、リロード保持、JSエラー無し。
- 独自 /tmp/v029a.py (1280/390) 旧セーブ再現（町でパーティ内に dead/ash が残ったまま save→reload）:
  - 帰還ではないので 029 の搬送は走らず、パーティに残る。
  - 酒場: 該当者は「冒険者2（死亡）」選択・disabled。ok 同士の入れ替えだけでも保存は拒否され「死亡したメンバーは加入できません。」(既に在籍している者には不正確な文言)。
  - 該当枠を「空き」にすれば保存でき 5人 ok になる → 完全なスタックではない。
  - 迷宮入口は「死亡したメンバーを外してください。」で拒否。JSエラー無し。
- 結論: 詰みではないが、案内が分かりにくい。ロード時に町で自動搬送する 029b を起票 (todo/029b-light-load-carry-nonok.md)。
