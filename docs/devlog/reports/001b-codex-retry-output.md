# 001b 物理命中の列補正 修正報告

実装・検証：完了。

変更ファイル：
- dist/game.js：physicalAttack() の閾値を「＋3×現在の列index（0始まり）」へ変更。他の命中計算は維持。
- tests/game.cjs：Lv1戦士・STR補正0・武器命中補正0・AC9で20通りの出目を全列検証。閾値10/13/16、命中率50%/35%/20%。前列消滅後は旧2列目が閾値10、旧3列目が13。安定row IDも保持。
- docs/SPECIFICATION.md：命中式と列を詰める扱いを更新。
- docs/HANDOFF.md：列補正バグを修正済みと記載。

検証結果：すべてPASS。
- node tests/game.cjs
- node tests/training.cjs
- python3 scripts/compile-monsters.py --check（31定義）

ブラウザ未検証（本タスクの手動確認は不要）。

キュー操作：未完了。/workspace/dsw-queue は環境の書き込み許可範囲（/workspace/dungeonsweeper、/tmp）外のため、todo/001b-bugfix-row-hit-modifier-retry.md の done/ への移動、および同キュー report/ への書き込みは未実施。本報告書をリポジトリ内の report/ に保存。
