# 004-bugfix-magicplans-length 実装報告
- 日時: 2026-11-02 00:0x JST（夜間ループ）
- モデル: gpt-6-luna (reasoning low)、1回目で成功
- コミット: 02431e3（main へ push 済み）
- 変更: dist/spells.js ensureMagic() で magicPlans を s.members.length まで null で補う（既存値は保持）。itemPlans は ensureProfile() で既に人数に合わせて再構成されるため変更なし。tests/game.cjs に回帰テスト（6人で length===6、旧3人セーブで例外なし）追加。MANIFEST.sha256 更新。
- テスト: game.cjs / training.cjs / compile-monsters --check すべて PASS
- ブラウザ未確認（5・6人目の呪文選択の手動確認は試遊に依頼）
