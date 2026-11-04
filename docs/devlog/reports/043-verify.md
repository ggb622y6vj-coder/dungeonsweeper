# 043 マカニト 検証 — OK
対象: c1034bb + ec05f80（origin/main、/workspace/verify-clone2、push なし）

## 結果
- デプロイ: dist/*.js と index.html がライブと一致
- Node: tests/*.cjs 17件 PASS（makanito.cjs 追加）、compile-monsters --check OK（88体）、sim selftest PASS
- ブラウザ（ライブURL）: 15件 PASS（makanito-browser.py 含む、1280/390）
- 仕様: 魔術師Lv9・MP12・敵全体・value=7・確定（抵抗判定なし）
  - Lv7以下は「息絶えた」で死亡、Lv8以上・不死・構造体・守護者は「には効かなかった」（makanito.cjs で確認）
  - 経験値は killReward で1回だけ加算（rewarded ガード、二重加算なしのテストあり）
- ラカニト: 223d427 と比べ 200 シードで hp・XP・gold・MP・ログが完全一致（/tmp/v043/lak.cjs）
- 旧セーブ: Lv9以上の魔術師（パーティ・控え）に付与され、Lv8以下には付与されない。図書館の s.library.spells.makanito=true（1280/390、/tmp/v043/mk.py）
- Tキー: 戦闘中も呪文メニューでも t/T/Shift+T で状態は変わらない（キー割り当てもなし）
- JSエラー: 1280/390 ともなし

## シム（n=400、jobs 0,0,2,3,1,2）基準 68b57d8 → 現在
| 階 | 戦闘あたり死亡（全滅率） |
|---|---|
| 1F | .010 → .010 |
| 2F | 0 → 0 |
| 3F | .015 → .015 |
| 4F | 0 → .005（全滅 .25%）※ユーザー承認済みのノイズ |
| 5〜10F | 基準と一致（.200/.1825/.1125/.0375/.0325/.0275） |
