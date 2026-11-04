# 017-light-monsters-4-10f 実装報告
- コミット: ae5dab2（main に push 済み）
- モデル: gpt-6-luna / reasoning low（1回目で成功）
- 変更: data/monsters.csv と scripts/compile-monsters.py を assets の用意済みファイルに置換（内容一致を確認、数値変更なし）、dist/monster-data.js 再生成、dist/monsters.js（monsterFormation の階上限を ENEMIES の最大階に／敵呪文を spellInfo 対応、target=all は生存者全員）、tests/game.cjs（CSV 88体、1〜11F の出現表と守護者10体、マハリトの全体呪文テスト追加）、BALANCE.md に階ごとの敵一覧、MANIFEST.sha256 再生成
- テスト: node tests/game.cjs、node tests/training.cjs、compile-monsters.py --check（88 monster definitions validated）、scripts/sim/selftest.cjs すべて PASS
- sim（--jobs 0,0,2,3,1,2 --n 1000）: 変更前後で同一（1〜3F のデータは変更なし）。Lv1/1F 勝率98%、Lv1/3F 47%、Lv3/3F 61.2%、Lv1/3F守護者 34.5%。詳細は 017-sim-before.txt / 017-sim-after.txt
- 未確認: sim は --floor 1〜3 しか受け付けないため、OK条件「推奨Lvの1戦勝率が全階95%以上」の4F〜10F分は sim で測れていない。ブラウザ未確認。
