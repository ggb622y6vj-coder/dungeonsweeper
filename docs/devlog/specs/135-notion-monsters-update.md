# 指示書135: Notion更新の反映（新規モンスター3種・随伴追加・改名・抵抗調整）

日付: 2026-11-24
担当: Codex（gpt-6.2-astra・high）
ブランチ: hold/135

## 1. 概要

ユーザーが Notion モンスターDB を更新した（2026-11-24 21:49〜22:09 JST）。内容は
(1) 新規モンスター3種の追加、(2) 随伴設定の追加14件と新規種への2件、(3) 随伴の解除1件、
(4) 改名1件、(5) 呪文抵抗の調整1件、(6) 群れの変更1件。
モンスター総数は 108種 → 111種 になる。

データの流れは従来どおり: data/monsters.csv が正本で、scripts/compile-monsters.py が
dist/monster-data.js を生成する。生成物だけを直接編集しないこと。
スナップショット data/notion-monsters.json も同じ内容に更新し、tests/notion-sync.cjs で
差分0を確認すること（既存行は従来の表記・形式を保ち、変更点だけを反映する）。

## 2. 新規モンスター3種

CSV へ行を追加し、compile-monsters.py の ID 対応表へも追加すること。
群れは CSV の範囲表記（最小〜最大）で記す。

### 2.1 ganyu（巌熊）
- 不確定名: 山のような羆
- 出現階: 9F, 10F / Lv 16 / HP 10d8+50 / AC 1 / 命中補正 9
- 物理ダメージ: 8d5+10 / 攻撃回数 2 / 経験値 5000 / 金貨 100d2
- 群れ: 1 / 種族: 獣 / 特殊: 麻痺/命中時20%
- 魔法使い呪文抵抗 20 / 僧侶呪文抵抗 20 / 魔法使い呪文Lv 0 / 僧侶呪文Lv 0 / 呪文使用率 0
- 宝物グループ: G6
- 随伴: ganyu（同種）50%

### 2.2 namakubi2（遊女の流し目）
- 不確定名: 女の生首
- 出現階: 6F, 7F / Lv 7 / HP 5d8 / AC 3 / 命中補正 9
- 物理ダメージ: 5d3 / 攻撃回数 1 / 経験値 230 / 金貨 4d6
- 群れ: 3〜5（Notion 表記 1d3+2） / 種族: 不死 / 特殊: なし
- 魔法使い呪文抵抗 20 / 僧侶呪文抵抗 60 / 魔法使い呪文Lv 0 / 僧侶呪文Lv 0 / 呪文使用率 0
- 宝物グループ: G4
- 随伴: darkelf 100%

### 2.3 warbear（戦闘グマ）
- 不確定名: 大熊
- 出現階: 5F, 6F / Lv 6 / HP 10d5 / AC 5 / 命中補正 5
- 物理ダメージ: 3d7 / 攻撃回数 1 / 経験値 110 / 金貨 4d4
- 群れ: 3〜7（Notion 表記 2d3+1） / 種族: 獣 / 特殊: 麻痺/命中時15%
- 魔法使い呪文抵抗 0 / 僧侶呪文抵抗 0 / 魔法使い呪文Lv 0 / 僧侶呪文Lv 0 / 呪文使用率 0
- 宝物グループ: G4
- 随伴: なし

## 3. 随伴設定の追加（既存種14件）

| 随伴元 | 随伴先 | 率 |
|---|---|---|
| thief（影の盗人） | iron | 60 |
| rabbit（赤兎） | thief | 50 |
| iron（鉄の番人） | shaman | 70 |
| acidslime（硫化スライム） | iron | 40 |
| venomspider（髑髏武者グモ） | dynamotuboro | 30 |
| akumaikire（悪魔いきれ） | archer | 60 |
| ogre（オーガ） | harpy | 60 |
| scorpion（大蠍） | troll | 60 |
| fungus（猛毒タケ、第5節で改名） | rafflesia | 50 |
| stonegiant（岩石の巨人） | stonegiant | 40 |
| fallenangel（堕天使） | succubus | 60 |
| succubus（サッキュバス） | lich | 50 |
| ameba（アメーバ） | slime | 50 |
| virusbat（ウイルス蝙蝠） | armorant | 60 |

注記:
- rabbit の随伴先は Notion では「theif」と誤記されているが、オーナー決定により
  thief として実装する（Notion 側のセル修正は統合後に Muse が行う）。
- 一部の組は出現階が部分的にしか重ならない（venomspider→dynamotuboro は 3F のみ、
  succubus→lich は 9F のみ、ameba→slime は 1F のみ、virusbat→armorant は 4F のみ、
  namakubi2→darkelf は 6F のみ）。これは 133 のオーナー決定どおり仕様であり、
  重なる階でのみ随伴する。コンパイラの検証（随伴先と出現階が全く重ならない設定は
  エラー）は変更しない。

## 4. 随伴の解除（1件）

- kashadokuro（火車髑髏）: 随伴モンスターID を空にし、随伴率を 0 にする
  （従来は venomspider 60）。あわせて群れを 1〜2 → 1 に変更する。
  venomspider 自身の出現階（3F, 9F, 10F）は変更しない。

## 5. 改名と能力調整

- fungus: 確定名「毒茸の群れ」→「猛毒タケ」（ID は fungus のまま）。
  不確定名「動く茸」→「爛れた苗床」。命中補正 5 → 4。
- cathuman（チシャ猫）: 魔法使い呪文抵抗 100 → 50、僧侶呪文抵抗 100 → 50。

## 6. 出現階の追従（1件）

- rafflesia（ラフレシア）: 出現階に 6F を追加する（4F, 5F → 4F, 5F, 6F）。
  理由: fungus（6Fのみ出現）の随伴先が rafflesia であり、出現階が全く重ならない
  設定はコンパイルエラーになるため。133 でオーナーが決めた方針
  「随伴先を優先させ、出現階はそれに追従させる」に従う。
  rafflesia は 6F の通常エンカウントにも出現するようになる（方針どおり）。

## 7. 期待される集計

- モンスター総数: 111種
- 随伴設定あり: 64種（従来48種 − 解除1件 + 追加14件 + 新規種2件 + ganyu を含む。
  内訳は実装後に実データで数えて報告すること）
- 宝物グループ: G4 は 15 → 17、G6 は 14 → 15、他は不変

## 8. テストと記録

- モンスター総数 108 を前提にしているテスト・検証は 111 へ追従させる
  （compile-monsters.py --check の件数、notion-sync、図書館の表示件数を固定している
  テスト等）。検証の強さを落とさないこと。
- partner-formation 等の随伴設定数を固定しているテストは新しい集計へ追従させる。
- 検証: node tests/game.cjs 全PASS、python3 scripts/compile-monsters.py --check、
  node tests/notion-sync.cjs 差分0、node tests/notion-items.cjs 差分0、
  sim selftest。ブラウザテスト一式は Muse が実施する。
- docs/devlog/reports/135.md と TIMELINE.md の135行を作成し、MANIFEST.sha256 を
  再生成すること。日付は 2026-11-24 とする。
- SPECIFICATION.md にモンスター総数の記載があれば 111種 へ追従させる。

## 9. 対象外

- ゲームの挙動・ロジックの変更（データ変更のみ）。
- Notion 側の修正（rabbit の随伴セル、rafflesia の出現階、宝箱抽選テーブルDB の
  グループ件数）は統合後に Muse が行う。実装側では触らない。
