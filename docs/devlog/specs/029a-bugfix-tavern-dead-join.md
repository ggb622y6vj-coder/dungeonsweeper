# 029a bugfix: 酒場のパーティ編成で死亡/灰/ロストを加入できない様にする

## 共通ルール
- 既存テストを弱めない。dist と MANIFEST を更新し、全テストを通してから push。

## 目的
029 で帰還時に死亡/灰/ロストは控えへ運ばれるが、酒場 (#tavernopen → #tavernslots → #tavernsave) から再びパーティに入れられる。訓練場 (changeRecruitParty) と同じく status==='ok' のみ加入可能にする。

## 変更内容
- 酒場の選択肢: status が ok 以外のメンバーは選択不可 (disabled) にし、名前に（死亡）/（灰）/（ロスト）を付ける。
- setPartyFromRoster 側でも、active に status!=='ok' が含まれる場合は false を返す（迷宮内処理など内部用途で必要なら、町での編成用ラッパーで判定）。拒否時は #townnotice 等で「死亡したメンバーは加入できません。」を表示。
- 現在パーティにいる ok メンバーの並び替え・外す操作は従来通り。

## OKの判定方法
- 死亡/灰を控えに持つ状態で酒場を開くと、その選択肢が disabled。DOM を書き換えて保存しても s.members に status!=='ok' が入らない (1280/390)。
- ok メンバーの並び替え・外す・控えからの加入は従来通り可能。
- tests に酒場の死亡加入拒否ケースを追加し、全 tests/*.cjs と browser テスト PASS、JSエラー無し。
