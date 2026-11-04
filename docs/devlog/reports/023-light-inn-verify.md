# 023-light-inn 検証 (8227c95) — 機能OK／軽微バグ1／序盤バランス要調整
## テスト
- tests/*.cjs 全PASS、compile-monsters.py --check・selftest PASS（クリーン /tmp/c23）
## 仕様照合（node, /tmp/v23.cjs）
- enterTown：HP/MP・Lv据え置き、毒/麻痺解除、迷宮リセット OK、レベル報告なし
- innCost = Σ(okメンバーの Lv×10)。Lv1〜4のok4人+死亡+灰 → 100G（=(1+2+3+4)×10）。023仕様「status ok の人数×各Lv×10Gの合計」＝各Lv×10の合計と一致（Codexの文言は誤解を招く。UI文言「人数 × 各Lv × 10 G」も同様→023aで修正）
- 馬小屋：無料、okのMP全快、HP不変、levelUp＋報告。部屋：費用減算、ok HP/MP全快、levelUp＋報告。金不足で部屋false/disabled、迷宮内は不可
- 死亡/灰：HP0のまま・課金なし OK。**ただしレベルアップはする**（Lv5→30を確認。levelUpが全員対象、旧enterTownと同じ挙動の持ち越し）→ 023a
- 費用は宿泊前のLvで計算（Lv1×6=60G払ってLv7に上がる）。仕様上問題なし
## テスト差分（変更アサーション一覧）
tests/game.cjs
1. 帰還: `s.hp[0]!==32` → `s.hp[0]!==hpBeforeTown`（仕様変更どおり。帰還前後HP一致に）
2. 帰還レベルアップ: 旧「全員Lvが xp650相当 かつ AC==CLASSES既定」＋「okのHP/MP全快・死者HP0」→ 新「全員Lv1・HP/MP不変」＋馬小屋「メンバー0のみLv/MP検証」＋部屋「メンバー0のみHP/MP・金額検証」＋金不足disabled
   - **弱化**: レベル検証が全員→メンバー0のみ、ACチェック消失、部屋の死者対象外/費用式(複数Lv)未検証。仕様が要求する以上の弱化（軽微）
3. レベル報告: `enterTown()`後のpopup期待 → `enterTown()`でpopupなし＋`stayAtInn('stable')`でpopup（妥当、むしろ強化）
4. popup重複なし検証の `enterTown()` → `stayAtInn('stable')`（妥当）
tests/death-status.cjs
5. `s.mp[1]===maxMP` → `===帰還前MP`（妥当）
6. `hp: 死者0・他maxHP` → `全員 帰還前HPと一致`（妥当。死者0は帰還前値に含意）
## 実機（Pages=8227c95一致、PC+390x844）
- 帰還後 HP3/MP0・Lv1のまま・popupなし → 宿屋「普通の部屋：60 G」、所持金1Gで部屋disabled・馬小屋有効 → 部屋泊 1000→940G、HP全快、Lv7/7/6/6/5/6 とレベル報告表示。pageerror 0
- SS: /workspace/sim/v023-{desktop,mobile}-{inn,levelup}.png
## 自動プレイ（/workspace/sim/bot2.cjs + run2.cjs、DIST=/tmp/c23/dist）
- 改修: 帰還後 townCare()＝寺院で払える限り蘇生→ロスト抹消→職業ごとに最良のokメンバーで再編成、不足は新規作成→負傷かつ払えれば部屋、不可なら馬小屋。入場拒否は 'blocked'
- 3×20遠征: 最高到達 2/2/2F、全滅 4/7/2、最終Lv 2/1/1（全期間でLv1〜2）、新規作成 48/56/47人、部屋 3/5/6回(200/300/380G)、馬小屋 17/15/14回、寺院 3/6/5回(300/600/500G)、所持金は常に0〜24G
- 判定: 2F/3Fの懸念は**深刻**。無料全快がなくなり、1〜2F収入（≈4〜6G/戦、1遠征20〜40G）では部屋60G・蘇生100Gが払えず、HP不足で再出撃→死亡→新規作成ループ。宿代・蘇生は「払えない」水準（序盤のみ）。注: botは弱めの自動操作なので人間はもう少し進めるはず、だが傾向は明確
- 提案 todo/023b（馬小屋でHP25%回復）。代案: 1〜3Fの金貨増、Lv≤3は部屋割引
## todo
- 023a-bugfix-inn-dead-levelup（死亡/灰がレベルアップ・文言）
- 023b-light-early-inn-economy（序盤バランス、数値は要承認）
