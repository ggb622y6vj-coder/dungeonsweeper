# 031-heavy-corpse-rescue レポート
- コミット: 62b44e3（main に push 済み）
- モデル: gpt-6-astra / reasoning high（初回成功、約2.6分）
- 変更: dist/game.js（placeCorpses: fresh() 後にその階の遺体マスを罠なし・type''に、開始/守護者と重なれば最寄り通常マスへ移動、除いた罠は安全経路外の空きマスへ再配置。recoverCorpses: cell() で遭遇判定前に回収→records を reserve へ（dead のまま）、gold 加算、corpse 削除、ログ「遺体を回収した。」。描画で遺体マスに 🦴 常時表示＋aria-label「遺体」）、tests/training.cjs（+99行の回帰テスト、削除行なし）、MANIFEST.sha256 再生成
- テスト: tests/*.cjs 全PASS、compile-monsters --check PASS、sim selftest PASS
- sim: 戦闘数値の変更なしのため未実施
- ブラウザ未確認（Codex環境ではサーバー起動不可）→ 試遊に実機確認を依頼
- Codex自身の報告は 031-heavy-corpse-rescue-codex-report.md に移動
