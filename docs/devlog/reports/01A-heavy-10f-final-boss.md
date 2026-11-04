# 01A-heavy-10f-final-boss 報告
- コミット: be3906c（main へ push 済み）
- モデル: gpt-6-astra / reasoning high（1回目）
- 変更: 10Fで迷宮の主（取り巻き込み）撃破で cleared=true、下り階段なし、クリアログとクリア表示（町に戻るボタン）。travelFloor は1〜10以外を拒否、旧セーブの10F以降の下り階段も無効化。町に「迷宮踏破済み」表示。SPECIFICATION に終了条件。tests/final-boss.cjs 追加（game.cjs から実行）。
- テスト: game.cjs / training.cjs / compile-monsters --check / sim selftest すべてPASS。MANIFEST 更新。
- ブラウザ: Codex 環境で Chrome 起動不可のため未確認。
- sim（L18, --jobs 0,0,2,3,1,2, 10F --boss, n=300、敵・戦闘数値は未変更なので前後同一）: 装備なし 15.7% / shop 95.3% / drop 100%。指定の65〜90%（試遊シム約78%）から外れる。バランス調整はこのタスク範囲外のため未実施。試遊の装備条件での確認と、必要なら別タスク化を依頼。
