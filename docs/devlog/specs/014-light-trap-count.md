# 014-light-trap-count
ティア：LIGHT　依存：013

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
罠が全階10個固定で深い階ほど密度が下がるため、階層ごとに増やす（1〜3F）。

## 変更内容
- dist/balance.js に `function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22), Math.round(size*size*(0.14+0.01*(floor-1))))}` を追加。
- dist/game.js `fresh()`：罠10個固定を `trapCount(floor, size())` に（安全マス不足なら配置可能数まで）。開始周囲・守護者への安全経路は従来通り。docs更新。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：1F=9、2F=15、3F=23。1000回生成で開始周囲・安全経路に罠なし。
- 手動：2F・3Fで数字が以前より大きめに出ること。
