# 045 ディスペルの敵Lv係数を Wizardry 式に — push 済み

- コミット: d254fe4（origin/main、0e9e33f の上）
- モデル: gpt-6-luna low（1回目）。Codex はブラウザテストをソケット制限で実行できず → executor が実行。
- executor の修正: tests/game.cjs で Lv12 を `s.members[2]` 固定に設定していたのを、見つけた僧侶 `s.members[priest]` に設定するよう修正。docs/HANDOFF.md に 045 節を追加。

## 変更内容
- dist/monsters.js: `DISPEL_LEVEL_OFFSET=12`、`dispelChance(casterLv,enemyLv)=clamp(0.05,0.95,0.5+0.05×術者Lv−0.10×敵Lv+0.05×K)` を追加し `dispelUndead` で使用。経験値なし（rewarded/escaped）の仕様は不変。
- docs/SPECIFICATION.md「呪いを解く」を新式に更新。MANIFEST.sha256 再生成。
- keynav.js・キー割り当て・フォーカス未変更。T キーなし。セーブ形式変更なし（ash-v1 互換）。

## K の決め方
- 新式−旧式 = 0.05×(K − 敵Lv) なので、敵Lv = K のとき旧式と一致（術者Lvに依存しない）。
- data/monsters.csv の不死14種のLv: 2,4,5,6,7,8,9,11,13,15,15,18,18,20 → 中央値 (11+13)/2 = **12**。
- 6F 亡霊（Lv11）に僧侶Lv12: 旧 55% → 新 60%（+5pt、±5pt 以内）。
- 参考: 6F 吸血鬼（Lv15）Lv12で 35%→20%、9F リッチ（Lv18）Lv17で 45%→15%、2F 亡霊騎士（Lv4）Lv5で 55%→95%。低Lv不死には効きやすく、高Lv不死には効きにくい。

## テスト（clean worktree d254fe4）
- tests/game.cjs: Lv12 対 Lv10/11/12 = 70/60/50%（敵Lv+1 で −10pt）、6F 亡霊の ±5pt 確認、上限95%・下限5%、成功/失敗・不死のみ・MP/XP なし。
- tests/*.cjs 全 PASS、compile-monsters --check PASS（88体）、sim selftest PASS、MANIFEST 検証 OK。
- ブラウザ全15本 PASS（各 1280/390）。新規ブラウザテストなし。

## シム（--jobs 0,0,2,3,1,2 --n 400、before=worktree 0e9e33f、after=worktree d254fe4）
- 1F〜10F（Lv 3,5,7,9,11,12,14,15,17,19）と 5F/6F/7F ボス戦（--boss）: **全て before と完全一致**。
  - 5F: 全滅 0.0025 / 死亡 0.200、6F: 0.0025 / 0.1575、5Fボス: 0.1325 / 1.0025、6Fボス: 0.3575 / 2.3625。
- 理由: シムAI（scripts/sim/combat.cjs）は「呪いを解く」を使わないため。基準（全滅 +1.0pt、死亡 +0.03）は満たすが、ディスペルの実効果はシムに反映されない点に注意。
- 生ログ: report/sim045/、Codex ログ: report/codex045.log
