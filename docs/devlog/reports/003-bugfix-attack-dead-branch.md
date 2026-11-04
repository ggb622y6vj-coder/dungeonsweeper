# 003-bugfix-attack-dead-branch 報告
- モデル：gpt-6-luna（low）
- コミット：0d94aaa（main へ push 済み）
- 変更：dist/game.js attack() の物理攻撃ログ `cmds[i]==='spell'?'呪文':'攻撃'` を "攻撃" 固定に（挙動不変）。MANIFEST.sha256 更新。
- テスト：node tests/game.cjs / node tests/training.cjs / compile-monsters.py --check すべてPASS。ブラウザ未確認。
