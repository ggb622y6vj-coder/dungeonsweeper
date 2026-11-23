# 指示書134：対象選択の表記統一と文書の旧名置換

- 日付：2026-11-24
- 基準 main：d60d1a9（指示書133 統合・ライブ検証記録まで完了）
- ブランチ：hold/134
- 性質：表記と文書だけの変更。挙動・データ・セーブは一切変えない。

## 1. 対象選択の「N列：」を「N：」に統一する

132 で左上の一覧の列表示を「1列：」から「1：」へ短縮した際、対象選択側の表記は対象外として残っていた。左上の一覧と同じ表記に揃える。

変更箇所（「${g.index+1}列：」→「${g.index+1}：」の文字列置換のみ）：

- dist/combatui.js:100（renderCommandEntry の列選択ボタン）
- dist/combatui.js:123（spellTargets の敵・グループ対象ラベル）
- dist/spells.js:118（spellTargetLabel）
- dist/spells.js:136（renderMagicChoice の対象セレクト）

対象外：dist/combatui.js:99 の commandSummary にある「N列」（コロンなしの表示）は変更しない。

## 2. 文書内の旧名「火蜥蜴」を「サラマンダー」に置換する

133 でゲーム側の確定名を変更済み。旧資料に残る旧名を置き換える（文字列置換のみ、他の内容は変更しない）。

- BALANCE.md:119
- docs/DATA_CATALOG.md:155

## 3. テストと記録

- 上記の表記を固定している既存テストがあれば新しい表記に追従する（検証の強さは落とさない）。
- docs/devlog/reports/134.md を作成し、docs/devlog/TIMELINE.md に134の行を追加する。MANIFEST.sha256 を再生成する。
- 検証：node tests/game.cjs、python3 scripts/compile-monsters.py --check、notion-sync／notion-items、ブラウザテスト全件。

## 4. 対象外

- コンパイラへの「群れ最小数と列上限」の警告追加（133レビューの任意提案。設計判断が要るため将来候補のまま）。
- 随伴の残り60種の設定（ユーザーが Notion へ入力中。別指示書で扱う）。
