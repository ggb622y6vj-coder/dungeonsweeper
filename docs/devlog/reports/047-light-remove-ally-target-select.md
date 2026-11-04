# 047 味方対象プルダウン廃止 — 完了（255e617、main へ push）
- Codex: gpt-6-luna low（1回目で採用、ログ report/codex047.log）
- 変更: index.html から #medicinechoice（#medicinetarget/#medicineuse）と案内バーのフォールバック枠を削除。spells.js は ally 呪文で #magictarget を作らず #magiccast 非表示。combatui.js の #allytargetspellselect/#allytargetspelluse とフォールバック処理を削除。items.js の medicineuse ハンドラ削除。SPECIFICATION.md 更新。
- レビューで追加修正: 戦闘中の ally 呪文でコマンド欄に味方名ボタン（data-spell-target）が残っていた旧方式も削除（spellTargetButtons が ally で空、commandentry の ally 分岐削除）。敵/グループ/階層対象は不変。
- テスト: target-select.cjs のフォールバック操作をパーティー枠 Space に置換。target-select-browser.py は select 前提部分をパーティー枠方式へ書換え、「select/data-spell-target が出ない」アサートを追加。Codex版の「キャンセル2連続」誤り（2回目のボタンが存在せずタイムアウト）を「キャンセル→薬ダイアログ復帰→パーティー欄で選ぶ→タップで使用」に修正。戦闘のガード/確認/戻る検証は維持。
- 結果: node tests/*.cjs 全PASS、compile --check PASS（88体）、selftest PASS（clean worktree）、ブラウザ15本 PASS（1280/390）、target-select-browser 10/10、MANIFEST OK。
- シム（--jobs 0,0,2,3,1,2 --n 400、1〜10F・5/6/7Fボス）: main と完全一致（UIのみの変更）。
