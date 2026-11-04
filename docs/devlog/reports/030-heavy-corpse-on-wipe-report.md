# 030-heavy-corpse-on-wipe 実装報告
- コミット: 62fac1d（main へpush済み）
- モデル: gpt-6-astra / reasoning high（初回成功、約2.5分）
- 変更: dist/game.js（defeat→全員dead・s.corpses追加・金貨0、ログ再生後 finishDefeat でパーティ空＋resetDungeon、リロード時も defeatPending を処理）、dist/recruits.js（corpses の保存/復元、旧セーブは[]、全滅保留中はパーティ記録を roster に入れない）、dist/training.js（訓練所に「迷宮に残された遺体：地下◯階（名前…）」）、tests/training.cjs（遺体回帰テスト追加、テストハーネスに training.js 読み込みと children 記録を追加。既存アサーションは削除なし）
- テスト: tests/*.cjs 全PASS、compile-monsters.py --check PASS、MANIFEST再生成
- 数値変更なしのため sim なし。ブラウザ未確認。
- 備考: 023b（序盤宿の経済）は「数値は提案・採用前に要確認」とあるため、ユーザー確認待ちで todo に保留。
