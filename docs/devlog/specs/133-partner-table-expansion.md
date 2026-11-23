# 指示書133：随伴表の拡張（Notion入力の反映）と関連データ変更

- 日付：2026-11-23
- 基準 main：806babb（指示書132 統合・ライブ検証記録まで完了）
- ブランチ：hold/133
- 発端：ユーザーが Notion モンスターDB に随伴設定を途中まで入力し「実装してください」と依頼。読み取りの結果、随伴以外に群れ・出現階・呪文抵抗・名前の変更も含まれていたため、本指示書にまとめて反映する。未入力の種は未設定のまま（今回は部分反映）。

## 1. 随伴設定の追加（36件）

data/monsters.csv の随伴モンスターID・随伴率に次を設定する（既存12件は変更しない。合計48種に設定、60種は未設定のまま）。

| ID | 随伴先ID | 率 |
| --- | --- | ---: |
| slime | ameba | 40 |
| rat | wolf | 40 |
| wolf | spider | 50 |
| apprentice | skeleton | 40 |
| bat | skeleton | 40 |
| skeleton | goblin | 50 |
| scout | apprentice | 60 |
| takenoko | takenoko | 40 |
| kinoko | takenoko | 60 |
| poisonslime | ameba | 60 |
| bandit | bandit | 50 |
| stone | stone | 80 |
| ghoul | ghoul | 80 |
| ghostknight | ghoul | 100 |
| bigspider | spider | 80 |
| dendenko | dendenko | 70 |
| sirakaba | poisonslime | 80 |
| blackwolf | rabbit | 80 |
| terror | terror | 70 |
| dragon | archer | 70 |
| archer | archer | 50 |
| insectivore | venomspider | 60 |
| dynamotuboro | dendenko | 100 |
| harpy | virusbat | 70 |
| gargoyle | zombie | 60 |
| zombie | archer | 60 |
| sorcerer | poltergeist | 50 |
| viper | armorant | 100 |
| armorant | dynamotuboro | 30 |
| salamander | werewolf | 70 |
| werewolf | namakubi | 60 |
| darkelf | zombie | 80 |
| rafflesia | dynamotuboro | 30 |
| poltergeist | poltergeist | 60 |
| namakubi | namakubi | 70 |
| kashadokuro | venomspider | 60 |

## 2. 出現階の変更

随伴先を優先し、出現階は随伴関係に追従させる（ユーザーの決定）。ただし追従の範囲は「随伴先が随伴元と少なくとも1つの階を共有し、設定が死なないこと」までとし、随伴元の全出現階をカバーすることまでは求めない（ユーザーの決定、2026-11-23）。随伴先がその階の出現候補にいない階では、従来どおり（131の規則）ランダム抽選で連鎖が続く。部分的にしか重ならない組み合わせ（sirakaba→poisonslime の3F、insectivore→venomspider の4F、zombie→archer の5F・6F、rafflesia→dynamotuboro の5F）は、この決定により仕様どおりの挙動とする。広げた階では通常遭遇の候補にもなる。

- dendenko：2F・3F → 2F・3F・4F（ユーザーの直接入力）
- zombie：4F → 4F・5F・6F（5F はユーザーの直接入力、6F は darkelf の随伴先として追従）
- spider：1F → 1F・2F（bigspider の随伴先として追従）
- venomspider：3F → 3F・9F・10F（kashadokuro の随伴先として追従）

## 3. 群れの変更（15件）

data/monsters.csv の群れの数は範囲表記で保持する。Notion のダイス表記から変換した新しい範囲は次のとおり。

- slime：1〜2 → 2〜3（Notion の「1d2;1」はユーザーの指示で 1d2+1 の意図として扱う）
- goblin：2〜3 → 3〜4
- spider：1〜2 → 2〜3
- bat：1〜2 → 2〜3
- skeleton：2〜3 → 1〜5
- kinoko：1〜2 → 1〜3
- ogre：1〜2 → 1〜4
- acidslime：1〜2 → 1〜4
- dendenko：1〜2 → 1〜3
- sirakaba：1〜1 → 1〜2
- blackwolf：2〜4 → 1〜5
- insectivore：1〜1 → 1〜2
- kashadokuro：1〜1 → 1〜2
- blob：1〜2 → 3〜5
- poltergeist：1〜2 → 1〜5

## 4. その他のデータ変更

- dendenko の僧侶呪文抵抗：10 → 50。
- salamander の改名：確定名「火蜥蜴」→「サラマンダー」（ID は不変。不確定名は変更しない）。

## 5. コンパイラ検証の追加（130レビューの任意提案）

scripts/compile-monsters.py に検証を追加する：守護者（boss）の随伴率が 0 でない場合は 100 のみを許可し、それ以外はコンパイルエラーにする（ボス戦の随伴は率を無視して確定するため、100 未満の設定は見かけと挙動が食い違う）。現在のデータは全て 100 のため、既存データでエラーにならないこと。

## 6. テストの追従

- tests/partner-formation.cjs：設定済み種の期待を新しい48種の内容へ更新する（設定値の照合、未設定種の数）。
- tests/encounter-adjustments.cjs：123 の連続抽選の再現区間で随伴率を 0 にする対象を、その階の全種へ広げる（130レビューの任意提案）。あわせて「プールの末尾の種は随伴未設定」という前提に依存している箇所があれば、その前提なしで検証できる形に直す（131レビューの任意提案）。元の期待値と乱数消費の前提は変えない。
- tests/formation-chain.cjs：随伴設定を書き換える箇所の復元を、固定値ではなく保存した元の値へ戻す形に直す（131レビューの任意提案）。
- 出現階・群れ・改名の変更で前提が変わる既存テストがあれば、新しいデータに合わせて追従する（検証の強さは落とさない）。

## 7. スナップショットと Notion の整合

- data/notion-monsters.json を再生成する際は、既存行のオブジェクトと表記（群れは範囲表記のまま等）を維持し、本指示書の変更フィールドだけを差し替える。tests/notion-sync.cjs が差分0で通ること。
- 統合後の記録作業（Muse 側）：Notion のスライムの群れセルを「1d2+1」に修正し、spider・zombie・venomspider の出現階セルへ追従分（2F、6F、9F・10F）を追加する。

## 8. 対象外

- 未入力の60種への随伴設定（後続の入力を待つ）。
- 編成規則そのもの（131 の連鎖規則は変更しない）。
- SPECIFICATION.md の命中補正表への4列目（−45）の追記（131レビューの任意提案。今回は対象外）。

## 9. 記録と検証（標準）

- docs/devlog/reports/133.md を作成し、docs/devlog/TIMELINE.md に133の行を追加する。
- node tests/game.cjs、compile-monsters --check、sim selftest、notion-sync／notion-items、ブラウザテスト全件、MANIFEST 再生成と照合。
- 統合承認後：main へ統合し、ライブ検証（17ファイルの SHA-256 一致と配信コードの確認）を行う。

## Amendment 1（2026-11-23、レビュー確認事項へのユーザーの決定）

ブロブの仲間呼びの列上限を 3体 → 6体 に変更する。理由：群れが 3〜5 になったため、上限3では生存3体以上の間は仲間呼びが常に不発になる。他の仲間呼び持ちの上限は群れの最大数か最大数+1 が通例で、最大数+1 の 6 に合わせる。変更箇所は data/monsters.csv のブロブの仲間呼び（列上限6体）、再コンパイルした dist/monster-data.js、data/notion-monsters.json のブロブの特殊（仲間呼び15%(上限6)）。戦闘全体の召喚上限（4体）や他の種は変更しない。Notion 実データのブロブの特殊セルも統合後の記録作業で合わせる。
