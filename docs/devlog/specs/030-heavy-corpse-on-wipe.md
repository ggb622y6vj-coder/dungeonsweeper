# 030-heavy-corpse-on-wipe
ティア：HEAVY　依存：023

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【遺体と救出 手順1/2】全滅時に即町へ戻して全快するのをやめ、遺体を迷宮に残す。

## 変更内容
- データ：`s.corpses = [{id(UUID), floor, cell, records:[訓練所recordの完全コピー], gold}]`。dist/recruits.js `rosterSaveState()/restoreRoster()` で保存・復元（旧セーブは[]）。
- dist/game.js `defeat()`：全員 status 'dead'。s.corpses に {floor:s.floor, cell:s.pos, records:パーティ全員のrecord, gold:s.gold} を追加、s.gold=0。パーティを空にし（控えにも入れない）、町へ（s.done解除、resetDungeon）。
- dist/training.js：訓練所に「迷宮に残された遺体：地下◯階（名前…）」を表示。
- 触らない：救出処理（次の031）、寺院、戦闘。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：全滅→パーティ0人・金貨0・corpses 1件・セーブ/リロードで保持・旧セーブで例外なし。
- 手動：全滅後に町で遺体表示が出ること。
