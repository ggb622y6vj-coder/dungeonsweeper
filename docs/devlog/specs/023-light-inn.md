# 023-light-inn
ティア：LIGHT　依存：022

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
帰還時の無料全快をやめ、宿屋で回復とレベルアップを行うようにする。

## 変更内容
- dist/game.js `enterTown()`：HP/MP回復と levelUp()/showLevelReport() をやめる（毒・麻痺解除、迷宮リセットは従来通り）。
- dist/index.html：町に「宿屋」ボタンとdialog。馬小屋（無料：status ok の全員MP全快）、普通の部屋（status ok の人数×各Lv×10Gの合計：HP/MP全快）。どちらも宿泊時に levelUp()→showLevelReport()。金貨不足で普通の部屋は不可。
- docs更新。触らない：寺院、戦闘、XP。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：帰還直後はHP減ったまま・Lv据え置き。馬小屋でMPのみ全快＋レベルアップ。普通の部屋で費用が引かれHP全快。既存テストを新仕様に修正。
- 手動：帰還→宿屋→レベルアップ報告が出ること。
