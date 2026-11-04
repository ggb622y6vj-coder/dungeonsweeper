# 002-bugfix-poison-death-log 検証結果 — 判定: OK
- 対象: c59a7dc（検証クローン /workspace/verify-clone、HEAD=0d94aaa）
- テスト: tests/game.cjs・tests/training.cjs・compile-monsters.py --check すべて成功
- node（/workspace/sim/harness.cjs、tickAilmentsを直接実行）:
  - 探索中に毒で死亡（logPoison=false）: ["Aは毒で倒れた。"] 1回だけ
  - 探索中に毒でHPが残る: ログなし（ダメージログは抑制されたまま）
  - 戦闘中に毒で死亡: ["Aは毒で2ダメージ。","Aは毒で倒れた。"] — 死亡ログの重複なし（dist内で「倒れ」系の死亡メッセージはこの1箇所のみ）
  - すでにHP0: ログなし
- 本番: Pagesの game.js がリポジトリの dist/game.js と完全一致。headless Chrome（/workspace/pp/v002.cjs）で探索と戦闘119ラウンド、pageerror 0（404 は favicon 等のリソース1件のみ）
