# 032 heavy: 行動不能メンバーの自動後退 — 完了

- コミット: d562680（main に push 済み、2026-11-02 18:11 JST）
- モデル: gpt-6-astra / reasoning high、1回目で成功（約11分）。Codex はブラウザ未実行（Playwright なし）のため push せず終了 → executor が検証・修正して push。
- Codex ログ: report/codex032.log

## 変更（Codex）
- dist/party.js: `partyIncapacitated(i)`（dead/ash/lost/stone、HP≤0、paralysis>0）と `autoReorderParty(reason)`。前衛の行動不能者がいて、かつ後衛に行動可能者がいる時だけ、先頭から行動可能者3人を前衛に詰め、残りは元の相対順（OK例どおり ABCDEF→B死亡→ACDBEF→A麻痺→CDEABF）。PARTY_FIELDS・commands・magicPlans・itemPlans・attackRows・commandConfirmed を同じ順に移動、味方対象の target はメンバー ID で付け替え（敵 uid/列 key は不変）。前衛→後衛に移った人だけ「{名前}が後列に下がった。」。全滅中（defeatPending/done/全員HP0）は何もしない。
- dist/game.js: attack() を partyAction(i) に分割し、ラウンドの行動者を ID で固定（並べ替えで飛ばし・二重行動なし）、各味方行動後に呼ぶ。enemyTurn は敵1体ごとに呼び、防御コマンドを ID で追跡。tickAilments 後、enterTown 後、町ロード（搬送後）、逃走成功時。snapshotVitals() に AC を追加、party パネル/ステータスはスナップショットの順・名前で描画。
- dist/monsters.js（戦闘終了時）、dist/traps.js（床罠）、宝箱罠、dist/spells.js（探索中の呪文）、dist/items.js（探索中の薬）から呼ぶ。dist/combatui.js commandMembers は partyIncapacitated を使用。stone の状態ラベル「石化」を表示に追加（付与機能は無し、033 の範囲）。
- tests/auto-reorder.cjs, tests/auto-reorder-browser.py 新規。tests/death-status.cjs と tests/game.cjs は固定添字参照をメンバー ID 追跡に変更（assert は維持＋「死亡者が index3 に下がる」を追加）。docs 更新。

## Executor による修正
1. ロード時の並べ替えを町のみに限定（タスク記載は「町: …ロード時」）。Codex は迷宮ロードでも並べ替えており、既存 tests/load-carry-browser.py（迷宮ロードで並びが変わらない前提）が失敗していた。auto-reorder.cjs の迷宮ロード期待値を「並びは変わらない」に、legacy ID テストは明示的に autoReorderParty を呼ぶ形に変更。
2. auto-reorder-browser.py の競合修正: 搬送ダイアログ OK 直後にリロードしており、close ハンドラ（templeReport クリア＋保存）より先に再読込してダイアログが再表示 → 閉じるのを待ち、保存を確認してからリロード。
3. 敵の攻撃が新前衛 C,D,E にだけ向かうことを固定シード乱数で60ターン検証する assert を auto-reorder.cjs に追加（Codex 版は E 1回のみ）。
4. autoReorderParty で displayVitals を固定するのは後退ログを出す時だけに（ログが無いと表示スナップショットが解放されないため。現仕様では常にログが出るので挙動差は無い保険）。
5. HANDOFF の「ブラウザ未検証・push未実施」記述と TEST_RESULTS のブラウザ失敗記録を実結果に差し替え。MANIFEST 再生成。

## 仕様上の判断（試遊への確認事項）
- 変更内容の「安定ソート（行動可能→行動不能）」と OK 例（ACDBEF / CDEABF）は一致しない（安定ソートなら ACDEFB / CDEFAB）。OK 例を正として「前衛3枠の繰り上げ」方式を採用。
- 後衛に行動可能者がいない時（3人以下のパーティー、後衛全滅など）は並べ替えない（例: A死亡,B,C の3人 → ABC のまま）。安定ソートなら BCA になるが、前衛であることは変わらず敵の狙いにも影響しない。また既存 target-select-browser.py がこの状況で添字を前提にしており、変えると既存テストを書き換える必要があった。BCA にしたい場合は別タスクで。
- 迷宮内ロードでは並べ替えない（通常は保存前に並べ替え済み）。
