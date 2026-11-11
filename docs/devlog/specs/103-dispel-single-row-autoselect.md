# 指示書103: 「呪いを解く」の対象列が1つのとき自動選択する

## ユーザーの依頼（原文）

「僧侶の「呪いを解く」が、対象となる敵の列が1つしかない場合、選択肢を出さずに自動的にその列を選択するようにしてください。Codexは使えないのでGrok Buildを使ってください」

（Codex は ChatGPT の5時間枠が枯渇しているため、本指示書の実装は Grok Build で行う。）

## 現行挙動（確認済み）

- 「呪いを解く」は僧侶・君主のコマンド（dist/combatui.js のコマンド入力、実行は dist/monsters.js の dispelUndead）。
- コマンド確定処理（combatui.js の box.onclick）では、「戦う」は対象列が1つだけなら自動でその列を選んで confirmCommand する。一方「呪いを解く」は、対象列（生存する不死のいる列、livingUndeadGroups()）が1つでも常に対象列の選択画面（choosingRow='dispel'）を出す。
- 実行側の dispelUndead は s.dispelRows[i] のキーで列を引くため、自動選択でキーを設定すれば追加の変更なしに成立する。

## 実装内容

- 「呪いを解く」を選んだとき、対象列がちょうど1つなら、列選択を出さず、その列を自動選択して confirmCommand(i) する。「戦う」の単一列の処理と同じ形に揃えること。
- 対象列が2つ以上の場合は従来どおり列選択を出す。対象列が0の場合はボタンが無効のまま（変更なし）。
- docs/SPECIFICATION.md の「呪いを解く」節に、対象候補が1列なら選択画面を省略して自動選択する仕様を追記する。

## テスト

- tests/dispel-row.cjs / tests/dispel-row-browser.py に次の確認を追加する：対象列が1つのとき「呪いを解く」を選ぶと列選択が出ずにその列で確定すること、対象列が2つ以上のときは従来どおり列選択が出ること。

## 制約

- dist のファイル数は増やさない。セーブ形式には触らない。
- 「戦う」「呪文」「アイテム」など他のコマンドの挙動は変えない。
- 検証：node tests/game.cjs 全件、関係するブラウザテスト、python3 scripts/compile-monsters.py --check、sim selftest、MANIFEST 一致。
