# 指示書113: 開く導線のない敵データ一覧ダイアログと残存ハンドラの整理

> 2026-11-16 にユーザーが承認し、実装担当に Codex を指定した。

## 背景と決定
- Fable 整理ブランチ（main 0aba3c5 へ統合済み）で `renderCatalog` 等の4関数が削除されたが、呼び出し元のないダイアログ要素とハンドラが残っている。ChatGPT レビューでも任意指摘として整理が挙がった（統合を止めるものではない）。
- 本指示書は Fable の削除と同じ系統の純粋なデッドコード整理で、挙動変更はない見込み。カタログ機能の復活はしない。
- 事前確認済み（2026-11-16、main 0aba3c5 時点）:
  - `#catalogdialog` は dist/index.html 内にダイアログ要素としての出現が1件のみ。`showModal` による呼び出しや `catalogopen` 等の開く導線は存在しない。JS 側の参照は `dist/game.js:547` の `#catalogclose` ハンドラのみ。
  - `#catalogbody` 系の CSS は3規則のみで、他のダイアログと共有されていない（`.dialoghead` は共有クラスのため残す）。
  - `[data-attack-row]` は dist 全体で `dist/game.js:549` のセレクタ1件のみ。属性を出す要素は存在しない。

## 仕様
### 削除するもの
1. `dist/index.html` の `<dialog id="catalogdialog">...</dialog>` 一式（`catalogtitle` / `catalogclose` / `catalogbody` を含む）。
2. `dist/game.js:547` の `$('#catalogclose').onclick=()=>$('#catalogdialog').close();` のみ。同行の他のハンドラ（`#statsopen` / `#statsclose` / `#statsbody` / `#maptoggle` 等）は残す。
3. `dist/index.html` の `<style>` 内の `#catalogbody` 系3規則（`overflow:auto` / `table` / `th,td`）。`.dialoghead` 等の共有規則は残す。
4. `dist/game.js:549` の `$('#party').onchange` 内の `[data-attack-row]` 分岐のみ。`input[data-person]` 分岐は残す。

### PASS 名の言い換え
- `tests/game.cjs:7` と `:216` の PASS 名に残る「save migration」は、削除済みの公開前移行を指す文言として言い換える（`tests/legacy-save.cjs` の PASS 名は既に「pre-publication saves fail safe; roster and parallel saves load unchanged」へ更新済み）。
- 112（XPカーブ v3）・099 等の現行移行を指す PASS 名（例：`tests/xp-curve.cjs:64`）は変更しない。実装時に各文言の指す対象を確認すること。

### 変更しないもの
- カタログ機能の復活、他のダイアログ・戦闘 UI には触れない。
- `s.attackRows`（戦闘の行選択の状態）・`selectedEnemy`・行選択の挙動は現行機能のため残す。削除するのは `onchange` 内の未使用分岐のみ。
- セーブキー ash-v1、rosterVersion: 1、公開後に追加した既存の移行処理に触れない。
- `tests/legacy-save.cjs` のテストは残す（first-public-save.json の回帰テストを含む）。

## テスト
- 標準検証: node tests/game.cjs / 全 tests/*-browser.py（47件）/ scripts/compile-monsters.py --check / sim selftest / MANIFEST。
- 削除後の確認: dist 全体で `catalogdialog` / `catalogbody` / `catalogclose` / `data-attack-row` の出現が0件であること。ただし `dist/spells.js:80` のコメント中の英単語「monster catalogue」は別物のため対象外。
- ブラウザでゲームが起動し、パーティー欄・戦闘の行選択・他のダイアログが従来どおり動くこと。

## 仕様書
- 削除のみのため docs/SPECIFICATION.md の変更は不要の見込み。docs/HANDOFF.md の Fable 整理の記述（死にコード削除の段落）に、113の削除内容を1〜2行で追記する。
