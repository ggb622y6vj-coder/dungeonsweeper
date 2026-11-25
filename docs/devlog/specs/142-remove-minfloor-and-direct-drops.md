# 指示書142: minFloor の削除と敵からの直接ドロップの削除

日付: 2026-11-26
ブランチ: hold/142

## 1. 概要

ユーザーの指示により、アイテムデータの `minFloor`（入手できる最浅階）を廃止し、あわせて敵からの直接ドロップ（戦闘勝利時の装備ドロップ）を削除する。

背景: 現在の宝箱抽選（110のランク方式）は minFloor を使っておらず、図書館の「地下N階〜」表記が実態と乖離していた。minFloor が効いていたのは直接ドロップと旧形式の宝箱だけで、その直接ドロップも今回削除するため、minFloor は役割を終える。

セーブ形式に変更はない（セーブはアイテムIDしか持たず、minFloor はデータ定義側の値）。

## 2. 直接ドロップの削除

- `dropWeapon()`（dist/game.js）を削除する。
- `awardVictory()` の直接ドロップの抽選ループ（pendingDrops の回数だけ dropWeapon を呼ぶ部分）を削除する。
- `killReward()` の `pendingDrops` 加算を削除する。`awardVictory()` 末尾の pendingDrops リセットも削除する。戦闘中セーブに pendingDrops が残っていても、読み込んだ後に参照されなければ無害（削除してよい）。
- 経験値・金貨の付与、宝箱戦の扱いは変更しない。

## 3. minFloor の削除

### 3.1 データ定義

- dist/weapons.js の全装備から `minFloor` プロパティを削除する。冒頭コメントの minFloor への言及も削除する（lootRank の説明は残す）。
- dist/items.js の薬5種から `minFloor` を削除する。

### 3.2 旧形式の宝箱の抽選プール（chestItemPool）

直接ドロップが無くなるため、`chestItemPool(floor)` の利用者は旧形式の宝箱（rewardVersion のない宝箱）の開封処理だけになる。プールの条件を次のとおり変更する。

- 条件は「`drop===true` または防具（part）で、価格がその階の価格上限（priceCap）以下」だけにする。minFloor の条件は削除する。
- 重みは全て1にする（minFloor に基づく 0.5／0.3 の重み付けは削除する）。
- プールが空の場合のフォールバック（最も安い装備1品）は現行どおり残す。
- priceCap 自体は変更しない。

### 3.3 旧形式の宝箱の薬抽選（dropMedicine）

- minFloor の絞り込みを削除し、薬5種すべてを weight による重み付き抽選の候補にする。30%の確率と receiveLoot の流れは変更しない。

### 3.4 図書館の表記

- dist/library.js のアイテム詳細「入手先」から「（地下N階〜）」を削除し、「店売り・迷宮」または「迷宮限定」だけにする。

### 3.5 Notion 同期

- tests/notion-items.cjs と tests/notion-equipment-effects.cjs の minFloor の照合（スナップショットの備考から読み取ってゲーム側と比較する部分）を削除する。他の項目の照合はすべて維持する。
- Notion のアイテムDB自体は変更しない（備考の minFloor 表記は Notion 側のメモとして残る。ゲーム側はもう参照しない）。

### 3.6 sim

- scripts/sim/combat.cjs の 'drop' 装備プールから minFloor の条件を外す（対象は drop 装備すべてになる）。
- scripts/sim/selftest.cjs の該当アサーション（minFloor 9 の装備が drop 装備に含まれること）は、新仕様（階層条件なしで含まれる）に合わせて文言と意図を更新する。

### 3.7 文書

- docs/SPECIFICATION.md の該当箇所を更新する（334行付近の「`minFloor` は他の仕組みで使うアイテムデータとして残す」という記述の削除、直接ドロップと旧宝箱プールに関する記述の追従）。

## 4. テストの追従

- 直接ドロップを前提にしたテストは、新仕様への追従として更新する（検証の強さは落とさない）。
  - tests/game.cjs の chestItemPool 検証: 価格上限の検証は残し、minFloor の検証（plate の階層、knightsword の階層、薬の minFloor）は削除または価格条件の検証へ置き換える。
  - tests/makanito.cjs・tests/notion-equipment-effects.cjs の pendingDrops のアサーションは削除する（撃破・報酬そのものの検証は残す）。
  - tests/item-identification.cjs・tests/library.cjs・tests/loot-recipient.cjs の dropWeapon 呼び出しは、入手経路の検証意図を保ったまま、宝箱などの残る経路へ置き換えるか、該当ケースを削除する。
  - tests/chest-loot.cjs の「lootRank 5 かつ minFloor > 1 の装備が1Fの walk に含まれる」というアサーションは、minFloor を外して「lootRank 5 の装備が含まれる」形に直す。
- 直接ドロップが存在しないことを固定するテスト（例: 勝利しても装備が増えない）を追加できる場合は追加する。

## 5. 記録

- docs/devlog/reports/142.md を作成し、docs/devlog/TIMELINE.md に142の行を追加する。
- MANIFEST.sha256 を再生成する。

## 6. 検証手順（標準）

- `node tests/game.cjs`（全PASS）
- `python3 scripts/compile-monsters.py --check`
- `node tests/notion-sync.cjs`、`node tests/notion-items.cjs`（差分0）
- sim selftest: `node -e "process.argv=['node','sim','selftest'];require('./scripts/sim/selftest.cjs')"`
- MANIFEST.sha256 を再生成し、不一致0を確認
- ブラウザテスト全件は Muse が実施する
