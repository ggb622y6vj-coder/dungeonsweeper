# 026-light-temple-cost-scaling 報告
コミット: e54494b（origin/main へ push 済み、2026-11-02 JST）
Codex: gpt-6-luna / reasoning low、1回目で完了（約1.5分）。ログ: report/codex026.log

## 変更
- dist/game.js: templeCost を dead=min(100×Lv,25×Lv²)、ash=min(250×Lv,60×Lv²) に変更。寺院画面の価格表示・ボタン無効判定・templeRaise はすべて同じ templeCost を使用（変更不要）。成功率・全快などは不変。
- tests/temple.cjs: 費用表を dead Lv1-5/15/30、ash Lv1-5/17/30 に拡張（Lv1 の旧期待値 100/250 は新仕様の 25/60 に置換、その他の既存行と成功率は維持）。
- tests/training.cjs（Bot 修正）: Codex が実行しておらず、遺体回収→寺院蘇生テストの `s.gold===221`（旧 Lv1 100G 前提）が失敗。蘇生前に templeCost を取得し「25×min(4,Lv)×Lv と一致」「金貨 = 321 − 費用」を検証する形に変更（検証は弱めていない）。
- docs/SPECIFICATION.md（Bot 修正）: 寺院費用の記述を新式と各Lvの値に更新。
- MANIFEST.sha256 再生成。
- 補足: /workspace/sim/harness.cjs が 025 で追加された library.js を読み込まず bot6 が ensureLibrary 未定義で落ちたため、library.js があれば読み込むよう修正（バックアップ harness.cjs.bak025、リポジトリ外）。

## テスト
- node tests/*.cjs（death-status, final-boss, game, library, temple, training）: 全 PASS
- python3 scripts/compile-monsters.py --check: 88 種 OK
- node scripts/sim/selftest.cjs: PASS
- tests/training-browser.py: Chromium 1280px / 390px とも PASS

## autoplay（/workspace/sim/run_bot6.cjs, RUNS=3 EXP=20、クリーン worktree の dist）
| | 新人補充 | 蘇生 | 全滅 | ロスト | ボス撃破 | 最大階 |
|---|---|---|---|---|---|---|
| 変更前 b9cb093 | 28/19/27（平均24.7） | 8/6/5（平均6.3） | 0 | 0 | 3/0/2 | 2/1/2 |
| 変更後 e54494b | 14/24/13（平均17.0） | 24/14/16（平均18.0） | 0 | 2/4/2 | 3/5/8 | 2/2/2 |
判定: 新人平均 ≤25 ✔、蘇生 ≥ 変更前 ✔、全滅0 ✔。
注: 024（帰還時自動レベルアップ）以降、変更前でもすでに平均24.7人で、026 起票時の 39-47 人より少ない。
