# 016-light-floor-config-10f
ティア：LIGHT　依存：014

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
全10階の階層設定を1か所（表）にまとめ、深い階ほど罠が痛くなるようにする。
罠の数は014の trapCount をそのまま使う（変更しない）。

## 変更内容
- dist/balance.js に以下を追加する。
  - `const MAX_FLOOR=10;`
  - `function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}`（1F=1.0倍 … 10F=3.25倍）
- dist/traps.js `triggerFloorTrap`：針(3d6+4)と爆発(2d6+3)のダメージに `trapPower(s.floor)` を掛けて切り捨てる（最低1）。毒霧・麻痺・転移は変えない。
- dist/game.js `triggerChestTrap`：宝箱の針・爆発も同様に `trapPower(s.floor)` 倍にする。
- 盤面サイズ `min(12,6+2F)` と罠数 `trapCount` は変更しない（4F以降は12×12。罠数は 24,26,27,29,30,31,31）。
- docs/BALANCE.md に階層表（階・盤面・罠数・罠倍率）を追加する。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：trapPower(1)=1、trapPower(5)=2、trapPower(10)=3.25、trapPower(11)=3.25。Math.random固定で10Fの針ダメージが1Fの3.25倍（切り捨て）。
- 手動：不要。
