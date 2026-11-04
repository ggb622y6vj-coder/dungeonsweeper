# 030a-bugfix-sim-wipe-deaths 報告
- モデル: gpt-6-luna (low)、1回目で完了
- コミット: 9b17e17（main へ push 済み）
- 変更: scripts/sim/combat.cjs（resolveBattle で s.defeatPending を検知したら finishDefeat 前に alive/deaths(s.corpses末尾のrecords数)/HP合計を記録して wipe として返す。prepareTrial で s.corpses=[]）、scripts/sim/selftest.cjs（wipe.alive/total とパーティ空の確認を追加、既存アサーションはそのまま）、MANIFEST.sha256 再生成
- テスト: selftest PASS、tests/*.cjs 全PASS（death-status, final-boss, game, temple, training）、compile-monsters --check OK
- sim（--jobs 0,0,2,3,1,2 --level 1 --n 300 --floor 3）: 修正前 deathsPerBattle 1.06（winRate .503, wipeRate .253） → 修正後 2.58（Codex実行、030前の≈2.7と同程度）
- ゲーム本体（dist/）は変更なし
