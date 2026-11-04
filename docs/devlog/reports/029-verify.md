# 029 verify (e67bd3f, origin/main HEAD)
判定: 029本体 OK / 酒場パーティ編成に既存の穴あり → 029a 起票
- live 配信 = dist 一致。全 tests/*.cjs PASS、compile-monsters --check、selftest PASS。
- live browser (1280/390): training / target-select / town-layout / auto-temple-browser すべて PASS。
- 独自確認 /tmp/v029.py (1280/390): 6人中 死亡+灰 帰還→4人・配列整合、搬送ダイアログ→(OK/Esc)→レベル報告、未確認ならリロードで再表示し確認後は出ない、帰還後に迷宮へ入れる、全滅フローで搬送ダイアログ無し、JSエラー無し。
- 寺院一覧/蘇生、訓練場の死亡表示・加入不可、ロスト処理は auto-temple.cjs / auto-temple-browser.py / death-status.cjs で確認 (PASS)。
- テスト改変: death-status.cjs / training-browser.py は「パーティに残る」前提を「控えへ搬送」前提に置換。XP保持・HP0/MP保持・状態異常解除・levelup・enterDungeon ガード等の検証は維持/追加されており弱体化なし。
- NG(既存): 酒場 (#tavernopen) は tavernRoster に控えの死亡/灰を含み setPartyFromRoster が status を見ないため、死亡者を再加入できる (両幅で再現)。→ todo/029a-bugfix-tavern-dead-join.md
