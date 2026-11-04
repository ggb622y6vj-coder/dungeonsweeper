# 011-light-exp-split
ティア：LIGHT　依存：010推奨

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
成長が速すぎる（探索約20回でLv30）ため、撃破XPを生存者数で分配する。

## 変更内容
- dist/game.js `awardVictory(combat)`：各生存者に `Math.max(1, Math.floor(xp / 生存者数))`。ログ「生存者は経験値◯◯を獲得。」の◯◯は1人あたりの値。
- docs/SPECIFICATION.md 5章「逃走・報酬」の記述を更新。既存テストでXP前提の箇所は意図を保って修正。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：生存3人・合計100→各33、生存1人→100、死者は加算なし。
- sim（010があれば）：Lv1/1F の結果を報告。
- 手動：戦闘勝利ログの経験値が1人分の値になっていること。

## 1回目の失敗メモ（2026-11-02 02:00 JST, gpt-6-luna low）
- awardVictory の分配・SPECIFICATION 更新・回帰テスト追加までは実装したが、`node tests/game.cjs` が既存の「flee rewards」ケース（chestBattle で逃走時に報酬なし、`s.members[0].xp!==xp` 等で失敗）で落ちた。追加したテストが後続テストの状態（Math.random の上書き、パーティ・敵の状態など）を汚している可能性が高い。
- 差分は /workspace/dsw-queue/report/011-attempt1.diff（作業ツリーは元に戻し済み）。この差分を参考に続きから修正し、共通テスト全PASSまで確認すること。追加テストは状態を元に戻すか独立させる。
- 次回は gpt-6.1-sol medium で実行。
