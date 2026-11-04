# 021-heavy-temple 作業報告

実装・自動検証：完了。ブラウザ確認・外部キュー移動：未完了。

## 変更ファイル

- `dist/index.html`：町の寺院ボタン、鍛冶屋に合わせたdialog、金貨・結果通知・対象一覧。
- `dist/game.js`：`templeCost`、`templeChance`、`templeRaise`、`renderTemple`。町かつidle時のみ実行し、パーティーと控えを安定IDで参照。死亡は100×Lv G、灰は250×Lv Gを消費。指定の成功率で判定し、成功は正常・HP1、失敗は死亡→灰／灰→ロスト。金貨不足・対象外は実行不可。結果を返し、既存セーブ処理で保存。
- `docs/SPECIFICATION.md`：寺院の費用・成功率を「本作の暫定式」として記載。
- `tests/temple.cjs`：成功・失敗の4結果をパーティー／控えの両方で検証。費用、確率境界、金貨不足、実行制限、連続操作、保存・再読込、蘇生後の迷宮入場、UIハンドラーを検証。
- `tests/game.cjs`：共通検証から寺院の回帰テストを実行。
- `report/021-heavy-temple.md`：本報告。

## 検証結果

- `node tests/game.cjs`：PASS（寺院・死亡状態・旧セーブ移行の回帰を含む）。
- `node tests/training.cjs`：PASS。
- `python3 scripts/compile-monsters.py --check`：PASS（88件）。
- `git diff --check`：PASS。

セーブキー `ash-v1`、020の判定、戦闘、XPの処理は変更していない。022以降のタスクは未着手。公開は実施していない。

## 未完了

- ブラウザ実機確認：ChromiumとPython Playwrightが見つからず未実施。画面の表示崩れと「死亡→帰還→寺院→再入場」の手動操作は未確認。Node上では寺院のUIハンドラーと蘇生後の入場を検証済み。
- `/workspace/dsw-queue/todo/021-heavy-temple.md` の `done/` 移動と同キューの `report/` への書込み：環境の書込み許可範囲が `/workspace/dungeonsweeper` と `/tmp` のため未実施。代わりにリポジトリ内の `report/` に本報告を保存した。
