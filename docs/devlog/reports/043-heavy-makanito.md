# 043 マカニト — 保留（HELD）

- 状態: **push していない**。ローカルブランチ `hold/043`（ec05f80 = Codex c1034bb + MANIFEST 再生成）。main は origin/main 223d427 のまま。
- モデル: gpt-6-astra high（1回目で完了）。レビューで修正は不要だった。
- 保留理由: シム基準「1〜4F は死亡・全滅とも基準以下」を 4F が n=400 で満たさない（全滅 0→0.25%、死亡 0→0.005/戦）。

## 変更内容（Codex）
- dist/spells.js: 27個目の呪文 `makanito`（魔術師Lv9・MP12・敵全体・threshold-death・value 7、確定習得）。
  `thresholdDeathApplies(e,value)`（非守護者・非不死・非構造体・monsterLevel≤value）と `killByMagic(e)`（hp=0、「息絶えた」、killReward）。ラカニトも killByMagic を使用（確率・対象は不変）。
- 旧セーブ: ensureMagic でパーティと控えの Lv9 以上の魔術師の known に makanito を補完（その後 recordLibrarySpells で図鑑にも記録）。
- シム planTurn: 魔術師が MP12 以上・使用可能で、対象になる生存敵が3体以上ならマカニト。恐怖時の代替呪文選択からは除外。
- テスト: tests/makanito.cjs 新規（game.cjs から require）、tests/makanito-browser.py 新規、game.cjs の呪文数 26→27・魔術師習得数 12→13、town-keys-browser.py の図鑑呪文数 26→27。docs/SPELLS.md・HANDOFF・SPECIFICATION・docs/043-MAKANITO.md。

## テスト（worktree ec05f80 相当 = c1034bb のコード）
- tests/*.cjs 全17本 PASS、compile-monsters --check PASS、sim selftest PASS（clean worktree）。
- ブラウザ全15本 PASS（各テストが 1280/390 両方を実行）。makanito-browser.py 10/10 PASS。T キー割り当てなし。

## シム（--jobs 0,0,2,3,1,2 --n 400、before=worktree 223d427、after=worktree c1034bb）
| 階 | Lv | 全滅 before→after | 死亡/戦 before→after |
|---|---|---|---|
| 1F | 3 | 0→0 | 0.010→0.010 |
| 2F | 5 | 0→0 | 0→0 |
| 3F | 7 | 0→0 | 0.015→0.015 |
| 4F | 9 | **0→0.0025** | **0→0.005** |
| 5F | 11 | 0.0025→0.0025 | 0.200→0.200 |
| 6F | 12 | 0.0125→0.0125 | 0.1825→0.1825 |
| 7F | 14 | 0.0025→0.0025 | 0.1125→0.1125 |
| 8F | 15 | 0→0 | 0.0375→0.0375 |
| 9F | 17 | 0→0 | 0.0325→0.0325 |
| 10F | 19 | 0→0 | 0.0275→0.0275 |
- 1〜3F は表の Lv が 9 未満なのでマカニト未使用 → 完全一致。5〜10F は対象敵なし → 完全一致（基準内）。
- 4F 追加検証 n=4000: before 全滅 0 / 死亡 0.00425 / HP損失 0.0685 / 平均 2.85R、after 全滅 0.00025（1回）/ 死亡 0.00425 / HP損失 0.0543 / 平均 2.49R。
  → 死亡率は同じ、HP損失・ターン数は下がる。n=400 の悪化は乱数列のずれによるノイズと見られる（before の 0 自体が運で、真の死亡率は約0.004）。
- Codex の追跡: 4F 105戦目、闇の司祭2・ガーゴイル3・ハーピー3 → 初手マカニトでハーピー3体、その後ガーゴイルの石化で全滅。

## 判断が必要な点（試遊へ）
- 4F の基準は before が 0 なので、n=400 の「基準以下」はノイズでも外れる。n=4000 では同等以上。基準を「n=4000 で死亡が before 以下」などにするか、このまま push してよいか判断してほしい。
- 生ログ: report/sim043/
