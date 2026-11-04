# 018-light-items-4-10f
ティア：LIGHT　依存：017

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
4F以降に対応する武器・防具・薬を追加する。強い装備（shop:false）は店で買えず、宝箱と敵のドロップでだけ手に入るようにする。

## 変更内容
- 用意済みファイルで置き換える。
  - /workspace/dsw-queue/assets/weapons.js → dist/weapons.js
    - 52品。うち17品が shop:false。新しい項目 minFloor（宝箱に出始める階）と hitBonus（命中補正）がある。
  - /workspace/dsw-queue/assets/items.js → dist/items.js
    - 薬に minFloor を追加：上傷薬(4F)、気付け薬(3F・麻痺回復)、霊薬(7F)。
    - dropMedicine は今いる階の minFloor 以下の薬だけを落とす。
- 店（renderShop と購入処理）：`w.shop===false` の品は表示せず、購入もできないようにする。
- 命中計算：装備中の武器の hitBonus（無ければ0）を命中値に足す。
- 既存の id はすべて残っている（旧セーブも読める）。
- docs/BALANCE.md に装備表を追加する。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：
  - 店の一覧に shop:false の品が出ず、buy で買えない。
  - 1Fの dropMedicine で上傷薬・霊薬が出ない。
  - hitBonus:2 の武器で命中値が2上がる。
  - 旧セーブ（既存の装備id）が読める。
- 手動：店の一覧が崩れていないこと。
