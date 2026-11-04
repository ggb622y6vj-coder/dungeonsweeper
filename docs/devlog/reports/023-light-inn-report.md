# 023-light-inn 実装報告
- commit: 8227c95（main へ push 済み）
- model: gpt-6-luna / reasoning low（1回目で成功）
- 変更: dist/game.js（enterTown から回復とレベルアップを削除、innCost()/stayAtInn('stable'|'room') 追加）、dist/index.html（宿屋ボタン・#inndialog）、docs/SPECIFICATION.md、docs/HANDOFF.md、tests/game.cjs と tests/death-status.cjs を新仕様に修正（帰還でHP/MP据え置き、馬小屋MP全快＋Lvアップ、部屋は費用減算＋HP/MP全快、金不足で部屋ボタン disabled、レベル報告は宿泊時のみ）
- テスト: tests/*.cjs 全PASS、compile-monsters --check PASS、MANIFEST 再生成
- sim: 数値変更なしのため未実施
- ブラウザ未確認
