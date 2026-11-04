# 010-light-sim-tool 1回目 — 失敗（未push）
- モデル: gpt-6-luna low
- テスト（game/training/compile-monsters/新規sim）は全PASS、100試行 約5秒
- しかし Lv1/3F 勝率100%・全滅0%（参考 57%/7%）。毎試行で乱数シードを同じ値に戻しており、同じ戦闘をN回繰り返していた
- リバートし、todo/010-light-sim-tool-retry.md（失敗メモ付き）に改名。次回は gpt-6.1-sol medium。差分は report/010-attempt1.diff
