# 002-bugfix-poison-death-log 報告
- 結果：成功（2回目）。コミット c59a7dc（main に push 済み）、2026-11-01 23:3x JST
- モデル：gpt-6.1-sol（reasoning medium）。1回目 gpt-6-luna low は回帰テスト失敗で差し戻し（002-attempt1.diff）。
- 変更：dist/game.js tickAilments で毒ダメージで HP が 0 になったとき、logPoison に関係なく「${NAMES[i]}は毒で倒れた。」をログ。tests/game.cjs に回帰テスト（移動時の死亡ログ1回・HPスナップショット・HP10時の毒ログなし・戦闘時ログ）。MANIFEST.sha256 更新。
- テスト：game.cjs / training.cjs / compile-monsters --check すべて PASS。ブラウザ未確認。
- 注意：戦闘中の毒死でも「毒で倒れた。」が追加で出るようになった（仕様どおり）。
