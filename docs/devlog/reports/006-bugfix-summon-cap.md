# 006-bugfix-summon-cap 報告
- 結果: 完了（1回目で成功）、commit 7300388 を main に push
- モデル: gpt-6-luna（reasoning low）
- 変更: dist/monsters.js monsterAction() の summon 分岐で s.enemy.summoned（未定義は0）を数え、1戦闘あたり4体まで。超過時は「仲間を呼んだが、現れなかった。」。成功時に summoned++。
- テスト: tests/game.cjs に回帰テスト（同じ敵に10回 summon → 追加4体、上限後は失敗ログ、uid一意）。game.cjs / training.cjs / compile-monsters.py --check すべて PASS。MANIFEST.sha256 再生成。
- ブラウザ未確認。
