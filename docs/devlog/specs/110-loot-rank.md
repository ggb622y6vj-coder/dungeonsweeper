# 指示書110：宝箱抽選を装備ランク方式へ移行する

## 経緯（ユーザーの言葉）

- 2026-11-13 13:33 ユーザー「NotionにChatGPTがまとめたアイテムへのランク付けとそれに基づいた抽選方式の試案があります。これらをもとに新しいアイテムのランクを元にした抽選方式を導入して下さい」
- 試案：Notion ページ「装備ランクR1〜R5を使った宝箱抽選への変更（実装計画・未実装）」（417058da-5cf8-815b-96b6-f926b3e64fd8）。装備76品のランクは Notion アイテムDBの「ランク」欄に入力済み（R1:24、R2:19、R3:20、R4:11、R5:2、薬5種は対象外）。
- 2026-11-13 13:38 ユーザーの決定：①配分は現行構成に一致させる、②T1 に R3 は含めない、③実装は Codex。

## 方式

- 先頭敵 → 宝物グループ G1〜G10 → A/B/C 独立抽選（現行維持、当選率も不変）。
- 枠が当選したら、その枠の T について次の順で1品を決める：
  1. 確率 `medicineShare` で薬：`medicineIds` から等確率で1品。
  2. 残りで装備：`rankWeights` で R1〜R5 を重み付き抽選し、そのランクの**全装備**（`lootRank` が一致する WEAPONS 全件）から等確率で1品。
- プールの ID 列挙は廃止する。新規装備はランクを付けるだけで候補になる。
- minFloor フィルタは重ねない（109 の決定を維持）。セーブ形式・中身の確定タイミング（宝箱生成時）・旧形式の宝箱は現行どおり。

## 配分（現行構成に一致、ユーザーの決定①）

各 T の medicineShare は現行プールの薬比率、rankWeights は現行プールのランク構成数：

| T | medicineShare | rankWeights | medicineIds |
|---|---|---|---|
| T1 | 2/35 | R1:24, R2:8（**R3 は含めない**＝決定②） | 傷薬・解毒剤 |
| T2 | 4/32 | R1:4, R2:18, R3:6 | 傷薬・解毒剤・気付け薬・上傷薬 |
| T3 | 4/43 | R1:8, R2:12, R3:19 | 同上 |
| T4 | 5/25 | R1:8, R2:1, R4:11 | 上記4種＋霊薬 |
| T5 | 4/26 | R1:8, R2:1, R4:11, R5:2 | 解毒剤・気付け薬・上傷薬・霊薬 |

試算（当選した枠あたり）：聖剣・竜鱗の鎧（T5）3.85% で不変、鬼斬りの大剣も不変、ヘッドライトは T1 で 0%（決定②）、T2 で 0.94%、T3 で 2.21%（新規に出現）。ランク単位の出現率は現行を再現し、ランク内の品ごとの率は均等化される。

## データと同期

- Notion アイテムDBの「ランク」が編集元。`data/notion-items.json` に「ランク」を転記（本指示書と同時に Muse が試案の登録値から反映。Notion 本体との照合は同期テストで担保し、Muse が取得上限の回復後に実データでも照合する）。
- `dist/weapons.js` の全装備76件に `lootRank`（1〜5）を追加する。値はスナップショットの「ランク」と一致させる。薬には付けない。
- `data/loot-tables.json` の `pools` を {medicineShare, rankWeights, medicineIds} 形式へ移行（本指示書と同時に Muse が用意）。groups・monsterGroups は不変。`dist/loot.js` の LOOT_TABLES はこれと一致させる。
- 同期テスト（tests/notion-items.cjs）に、装備は lootRank == スナップショットの「ランク」、薬はランクなし、の照合を追加する。

## 実装（Codex）

- `dist/loot.js`：LOOT_TABLES を新形式にし、`rollChestItems` の T→アイテム部分を上記の方式に差し替える。シグネチャ（monsterId, floor, rng）は維持し floor は使わない。データ検証：重みは0以上、medicineShare は [0,1)、medicineIds は実在する薬のみ、rankWeights で重み>0 のランクには装備が1件以上あること。不正データでは例外。
- `dist/weapons.js`：全装備に lootRank を追加（値の正はスナップショット）。
- `tests/chest-loot.cjs`：新方式に合わせて組み替える。観点：データ整合（loot.js と JSON の一致、全装備の lootRank が 1〜5、薬にランクなし）、枠ごとの薬／装備の分岐、ランク重み抽選の網羅（固定乱数で各ランク・各品に到達できること）、確率近似（medicineShare とランク比率）、T1 で R3 が絶対に出ないこと、A/B/C 8パターン、空・不正データの検出、宝箱の確定・再読込・旧形式の互換は現行の検証を維持。
- `docs/SPECIFICATION.md`：宝箱の説明をランク方式に更新。
- 変えないもの：groups・monsterGroups・当選率、宝箱の発生条件・金貨、旧形式の開封方式、直接ドロップ（chestItemPool/dropWeapon）、dropMedicine、図鑑、セーブ形式、アイテムの能力値・装備職などの属性。

## 検証

- `node tests/game.cjs` 全件（chest-loot、notion-items を含む）
- ブラウザテスト全件
- `python3 scripts/compile-monsters.py --check`、`scripts/sim/selftest.cjs`
- dist/loot.js と data/loot-tables.json の一致

## 範囲外

- Notion「宝箱抽選テーブル」DB の新形式への反映は、試案の取り決めどおり別途承認後（統合後の反映工程で扱う）。
