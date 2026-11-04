# 001b-bugfix-row-hit-modifier
ティア：LIGHT　依存：なし


## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
物理攻撃の命中に掛かる敵の列補正が逆向きになっているバグを直す（ユーザー確認済み：バグ）。現状は physicalAttack() の閾値に −3×(列index+1) が入っており、1列目でも+15%、後列ほど当たりやすい（Lv1戦士→AC9の敵で 65%/80%/95%）。前列が全滅して列が詰まると同じ敵が当たりにくくなる副作用もある。

## 変更内容
- dist/game.js `physicalAttack()`：列補正を「+3×列index」に変更（1列目は補正0、2列目は命中−15%、3列目は−30%（基準値から）。後列ほど当たりにくい）。他の命中計算は変えない。
- 列indexは「その時点で敵が残っている列の並び」での位置を使う（前列全滅で詰まったら前列扱い）。現行の列の扱いをそのまま使い、新たな列管理は作らない。
- docs/SPECIFICATION.md（または命中式が書かれている箇所）があれば式を更新。docs/HANDOFF.md の「要確認」記載は「修正済み」に。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS（既存のAC方向テストが列補正前提なら更新）。
- 回帰テスト：同じ攻撃者・同じAC・乱数を固定したとき、命中閾値が 1列目 > 2列目 > 3列目 の順になり、1列目の列補正が0であること。Lv1戦士→AC9の敵で 1列目50%・2列目35%・3列目20% 相当になること。
- 手動：不要（数値の確認のみ）。

## 前回の失敗（1回目・gpt-6-luna low, 2026-11-01 22:40 JST）
- 前回の差分は /workspace/dsw-queue/report/001b-attempt1.diff（作業ツリーは元に戻した）。
- 誤り1：physicalAttack() の閾値が `... - 3*Math.max(0,rowIndex)` のまま（マイナス）。閾値が下がる＝後列ほど当たりやすいままで、バグが直っていない。正しくは `+ 3*rowIndex`（閾値を上げる）。docs/SPECIFICATION.md には「＋3×列index」と書かれており、コードと食い違っていた。
- 誤り2：回帰テストが Math.random=()=>.99 で常に命中するため、列ごとの差を検出できない。閾値（または命中率）を直接比べ、Lv1戦士・STR補正0・AC9の敵で 1列目=閾値10(50%)、2列目=閾値13(35%)、3列目=閾値16(20%) になることを確認するテストにする。前列全滅で詰めた後、旧2列目が閾値10になることも確認する。
- docs の HANDOFF.md / SPECIFICATION.md の更新内容は前回の差分を流用してよい。
