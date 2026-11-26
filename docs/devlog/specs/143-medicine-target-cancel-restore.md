# 指示書143: 薬の対象選択キャンセル時にパーティー欄とアイテム画面を復帰させる

日付: 2026-11-26
ブランチ: hold/143

## 1. 問題

指示書138で、呪文の対象選択（pickFieldSpell）をキャンセルした場合はパーティー欄（#statsdialog）と呪文ダイアログの両方が復帰するようになった。一方、薬の対象選択（pickMedicineTarget、dist/items.js）をキャンセルした場合は薬ダイアログ（#medicinedialog）だけが再表示され、その下にあったアイテム画面（#inventorydialog）とパーティー欄は復帰しない（138のレビュー確認事項で、従来どおりとして対象外にした件）。

仕組み: 対象選択の開始（beginAllyTargetPick、dist/combatui.js）は magicdialog・medicinedialog・inventorydialog・statsdialog のすべてを閉じる。呪文側は開始前にパーティー欄が開いていたかを記録し（restoreStats）、キャンセル時に renderStats() で再表示してから呪文ダイアログを重ねる。薬側の onCancel は薬ダイアログの再表示しかしていない。

## 2. 修正内容

薬側も呪文側と同じ形に揃える。

1. pickMedicineTarget の対象選択開始前に、その時点で #statsdialog と #inventorydialog が開いているかを記録する。
2. 探索中（戦闘でない）のキャンセル時は、記録に応じて下から順に復帰させる:
   - パーティー欄が開いていた場合: renderStats() で表示を最新化してから #statsdialog を showModal() する（138の呪文側と同じ）。
   - アイテム画面が開いていた場合: #inventorydialog を showModal() して復帰させる（ダイアログのDOM内容は保持されているので、開いていたメンバーの表示のまま戻ること）。
   - 最後に薬ダイアログを再表示し、#medicinepick にフォーカスする（現行どおり）。
3. 対象を選んで使用が完了した場合は現行どおり全ダイアログを閉じる（commitMedicineChoice の処理は変更しない）。
4. 戦闘中の対象選択（battle の場合）のキャンセルは現行どおり、コマンド入力へフォーカスを戻すだけとし、変更しない。
5. 薬ダイアログを×で閉じる通常の遷移（対象選択を経由しない場合）は変更しない。アイテム画面・パーティー欄はその場合もともと開いたままである。

## 3. テスト

- tests/target-select-browser.py の薬側の期待値を新仕様へ追従させる（現在は薬側だけ stats_restored=False を期待している箇所がある。使用完了時の全閉じの期待は維持し、キャンセル時の復帰の期待を呪文側と揃える。検証の強さは落とさない）。
- 次のケースをブラウザテストで確認できるようにする（target-select-browser.py への追加でも、新規テストでもよい）:
  - パーティー欄 → アイテム画面 → 薬 → 対象選択 → キャンセル → パーティー欄・アイテム画面・薬ダイアログの3つが復帰していること。
  - アイテム画面（パーティー欄を経由しない）→ 薬 → 対象選択 → キャンセル → アイテム画面と薬ダイアログが復帰し、パーティー欄は開いていないこと。
  - 薬 → 対象選択 → 対象を選んで使用 → 全ダイアログが閉じること（現行どおり）。

## 4. 対象外

- 戦闘中の薬の対象選択の挙動。
- 呪文側（138で対応済み）の挙動。
- セーブ形式の変更はない。

## 5. 記録

- docs/devlog/reports/143.md を作成し、docs/devlog/TIMELINE.md に143の行を追加する。
- MANIFEST.sha256 を再生成する。

## 6. 検証手順（標準）

- `node tests/game.cjs`（全PASS）
- `python3 scripts/compile-monsters.py --check`
- `node tests/notion-sync.cjs`、`node tests/notion-items.cjs`（差分0）
- MANIFEST.sha256 を再生成し、不一致0を確認
- ブラウザテスト全件は Muse が実施する
