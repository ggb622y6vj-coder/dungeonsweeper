# 020-heavy-death-status 報告
- コミット: 16e4efa（main へ push 済み）
- モデル: gpt-6-astra / reasoning high（初回成功）
- 変更: dist/game.js（status移行・markDeaths・enterTown/enterDungeon・visibleAilments）, dist/monsters.js, dist/traps.js, docs/SPECIFICATION.md, tests/game.cjs, 新規 tests/death-status.cjs, MANIFEST.sha256 再生成
- テスト: death-status / game / training / final-boss / compile-monsters --check すべて PASS
- 戦闘式・XP・ドロップ数値の変更なしのため sim 未実行
- ブラウザ未確認（試遊に依頼）
