# 001-bugfix-name-regex 報告
- 日時: 2026-11-01 (JST)
- モデル: gpt-6-luna (reasoning effort low), codex exec -s workspace-write
- 変更: dist/game.js coloredLog() で名前を正規表現エスケープし空文字を除外。tests/game.cjs に回帰テスト追加。MANIFEST.sha256 再生成。
- テスト: node tests/game.cjs / node tests/training.cjs / compile-monsters.py --check 全PASS。ブラウザ手動確認は未実施。
- コミット: fd6b926 (main へ push 済み)。GitHub Pages反映は別途確認。
- Codex使用量: 65,875 tokens。残り枠の確認コマンドはCLIに無し。
