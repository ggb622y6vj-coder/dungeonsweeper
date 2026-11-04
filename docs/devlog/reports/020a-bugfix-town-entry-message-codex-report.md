# 020a-bugfix-town-entry-message 実装報告
- コミット: 8405059（main に push 済み）
- モデル: gpt-6-luna（reasoning low）、1回目で成功
- 変更: dist/index.html の町に <p id="townnotice" role="status"> を追加。enterDungeon の拒否時に log の代わりに #townnotice へ「死亡したメンバーを外してください。」を表示、入場成功時に空にする。拒否判定は不変。
- テスト: tests/death-status.cjs に通知文言と入場時の消去を追加。tests/*.cjs 全PASS、compile-monsters --check PASS、MANIFEST 再生成。
- 注意: 通知が消えるのは次に入場ボタンを押して入場できた時点。酒場で死者を外しただけでは消えない（入場前は残る）。
- sim: 数値変更なしのため未実施。ブラウザ未確認。
