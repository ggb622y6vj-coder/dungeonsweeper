# 011-light-exp-split 1回目：失敗（未push）
- モデル：gpt-6-luna low（2026-11-02 02:00 JST）
- 結果：node tests/game.cjs が既存の flee rewards ケースで失敗。作業ツリーを戻し、差分は report/011-attempt1.diff。todo/011-light-exp-split-retry.md に改名、次回 gpt-6.1-sol medium。
- sim 変更前（jobs 0,0,2,3,1,2 Lv1 n=300）：1F 勝率99%・全滅0%・死者0.04/戦・HP損耗8.9%／3F 勝率51%・全滅7.3%・死者1.99/戦・HP損耗51.2%。sim は毎戦レベルを固定して戻すため、XP分配の影響は勝率に出ない見込み。

# 011-light-exp-split 2回目：成功（push済み）
- モデル：gpt-6.1-sol medium（2026-11-02 02:13 JST）
- コミット：e5de383（main へ push）
- 変更：dist/game.js awardVictory を生存者数で分配（Math.max(1, floor(xp/生存者数))、ログは1人分）、docs/SPECIFICATION.md 5章更新、tests/game.cjs に回帰テスト（状態を退避・復元して独立化）。MANIFEST.sha256 再生成。
- テスト：node tests/game.cjs / tests/training.cjs / compile-monsters.py --check 全PASS（flee rewards も PASS）。
- sim（jobs 0,0,2,3,1,2 Lv1 n=300）変更前→後：1F 勝率99%→99%、全滅0%→0%、死者0.04→0.04/戦、HP損耗8.9%→8.9%／3F 勝率51%→51%、全滅7.3%→7.3%、死者1.99→1.99/戦、HP損耗51.2%→51.2%。sim は毎戦レベルを戻すため勝率は不変（想定通り）。
- ブラウザ未確認。
