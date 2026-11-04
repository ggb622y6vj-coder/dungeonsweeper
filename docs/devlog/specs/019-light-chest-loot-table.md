# 019-light-chest-loot-table
ティア：LIGHT　依存：005、018

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
宝箱と敵ドロップの中身を階ごとの抽選表で決め、深い階ほど良い物が出るようにする。005の chestItemPool（価格≤階×150）を置き換えて拡張する。

## 変更内容
- dist/balance.js に `CHEST_LOOT` を追加する（添字＝階−1）。
  - itemChance：[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45]
  - priceCap：[150,200,350,500,1800,2200,3000,3600,6000,6000]
- `chestItemPool(floor)` を次の重み付き抽選にする。
  - 候補：武器（drop:true）と防具（part あり）のうち、price≤priceCap かつ (minFloor??1)≤floor のもの。
  - 重み：
    - shop:false の品は、minFloor の階では 0.5、それより深い階では 1。
    - minFloor が floor−3 以下の古い品は 0.3。
    - それ以外は 1。
  - 候補が空なら最安品1つ（005と同じ）。
- rewardChest：品が出る確率を .25 から `CHEST_LOOT.itemChance[floor-1]` に変える。
- dropWeapon：抽選を `chestItemPool(s.floor)` からにする（ドロップ率5%はそのまま）。
- 呪い・未鑑定のアイテムは現仕様に無いので扱わない（将来課題として BALANCE.md に記載）。
- 005のテスト「2Fで plate が出うる」は、plate が minFloor:3 になったので「3Fで出うる・2Fでは出ない」に更新する。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト（1万回抽選）：
  - 1Fで price>150 や minFloor>1 の品が出ない。
  - 5Fで炎の剣（shop:false・minFloor5）が出うる。
  - 10Fで聖剣が出うる。
  - 宝箱から品が出る率が itemChance ±2pt。
- 手動：不要。
