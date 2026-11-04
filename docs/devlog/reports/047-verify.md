# 047 味方対象プルダウン削除 検証 — OK
対象: 255e617（origin/main、/workspace/verify-clone2、push なし）

## 結果
- デプロイ: dist/*.js と index.html がライブと一致
- テスト: Node 19件・compile --check（88体）・selftest・ブラウザ15件（ライブURL）すべてPASS
- 削除されたDOM（index.html の id 比較）: #allytargetfallback, #allytargetbattlefallback, #medicinechoice, #medicinetarget, #medicineuse
  - JS側で削除: 戦闘中の #allytargetspellselect/#allytargetspelluse、味方対象の #magictarget、戦闘コマンド欄の味方名ボタン（ally の data-spell-target）
  - 上記以外に消えたものはない
- 残っている select: shopmember, transferitem, transfermember, medicineitem（薬の種類選択）, recruitjob。JS側の select（attack-row, party-position, tavern-slot, magictarget＝敵列・階）も残っている
- ライブ 1280（クリック）/390（タップ）、/tmp/v047/b.py:
  - 探索ディオス: 表示中の select は0。カードにフォーカスして Space → 回復し、選択モードが終わる
  - 探索マディ: 石化メンバーを選べて、石化が解ける
  - 探索の薬: select 0。カードのタップ／クリックで使用でき、1個減る
  - 戦闘ディオス: コマンド欄の名前ボタンと select が0。Space で magicPlans={dios,target:2}
  - 戦闘の薬: select 0。カードで itemPlans が予約される
  - 戦闘ハリト: 敵列ボタン「1列/2列」は残っている
  - マロール: #magictarget（階の選択）は残っている
  - 死亡メンバーは選べない。キーボードでは石化メンバーも飛ばされる
  - JSエラーなし、横スクロールなし

## 備考（047 で入った問題ではない）
- ディオス・薬で、石化メンバーのカードがマウス／タップでは選択可能として表示される（validAllyTarget が 'stone' を含むため。047 より前から同じ）。
- 選ぶと「ディオスでは〇〇の石化を治せない。」と表示されて終わる。MP は減らない。
- キーボード操作では除外されている。見た目と操作を揃えたい場合は別タスクで。
