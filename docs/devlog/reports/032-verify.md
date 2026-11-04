# 032 verify (d562680, origin/main HEAD)
判定: OK
- 解釈（了承済み）: 行動可能な先頭3人を前衛へ。残りは元の順。B死亡→ACDBEF、A麻痺→CDEABF。後衛に行動可能者がいなければ並べ替えない。迷宮内ロードでは並べ替えない（町ロードは 029b 搬送の後に実行）。
- Pages 反映後 live = dist 一致。node 10本（auto-reorder.cjs 新規を含む）、compile-monsters --check、selftest PASS。
- live browser 7本 × 1280/390 全 PASS（auto-reorder-browser 新規: 戦闘の死亡/麻痺、予約、スナップショットの名前/HP/AC、陣形ラベル、治っても後列のまま、床罠、リロード、寺院搬送）。
- 既存テストの改変: death-status.cjs / game.cjs は index 固定の参照を member id 参照に置換し、後退の assert を追加しただけ。弱体化なし。
- 独自確認
  - /tmp/v032.cjs（node）: 例どおり ACDBEF → CDEABF。ラウンドの途中で D が死亡し並べ替えが起きても、6人の partyAction はそれぞれちょうど1回（スキップ・二重実行なし）。
    - 理由: 実装が味方の行動を開始時の member id 列で回しているため。敵の行動も commandsById で守る/逃げるを人物に紐付けている。
  - セーブ→リロードで順序を保持。
  - /tmp/v032b.py（live, 1280/390）: B死亡→ACDBEF、ログ「Bが後列に下がった。」。並べ替え後にパーティ欄からディオスの対象を選ぶと、Bは選択不可で、選んだAに正しく回復が入る。リロード後も ACDBEF、前衛/後衛ラベル正常、JSエラー無し。
