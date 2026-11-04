# 007-bugfix-combat-hide-numbers
ティア：LIGHT　依存：なし

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
戦闘中、一人称視界に迷宮の数字が敵シルエットの背後に重なって見えるのを直す。

## 変更内容
- dist/game.js `scene()`（または数字を描く face()/視界描画箇所）：`visibleCombat()` が真の間は視界内の罠数字テキストを描画しない。地図側の数字は変更しない。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 既存テスト全PASS。
- 手動：PC幅とスマホ幅で戦闘に入り、視界に数字が出ず、戦闘終了後は元通り表示されること（スクリーンショット確認できなければ未確認と報告）。
