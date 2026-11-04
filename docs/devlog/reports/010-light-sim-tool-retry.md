# 010-light-sim-tool（再実行）結果
- モデル：gpt-6.1-sol / reasoning medium（2回目、1回目 gpt-6-luna low は失敗）
- コミット：945e527（main へ push 済み、2026-11-02 JST）
- 変更：scripts/sim/harness.cjs, combat.cjs, selftest.cjs 新規、README.md に使い方追記、MANIFEST.sha256 再生成（sim 3ファイル追加）。dist/tests/data 未変更。
- テスト：game.cjs / training.cjs / compile-monsters --check / scripts/sim/selftest.cjs 全PASS。
- 結果：Lv1/3F 勝率46%・全滅7%（9秒）、Lv6/3F 100%、守護者 Lv1/1F 99%・3F 65%。
- 参考値（57%）との差は指定AIと元Bot（/workspace/sim/bot.cjs）の違い。元Bot AIに一時差替えると55%/9%・守護者97%に戻ることを Codex が確認済み。詳細は report/010-light-sim-tool-codex-retry.md。
