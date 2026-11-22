# 指示書129：床罠「浮上穴」（落とし穴の逆）の追加

- 日付：2026-11-23
- 起点：main d48ab9b（指示書128 統合・履歴書き換え後）
- ユーザー要望：床罠の一つとして、強制的に1つ上の階のイベントのないランダムなマスに転移させる、落とし穴の逆バージョンを実装してほしい。ログは「一行の身体は浮き上がり上層へ転移した！」のような文面。
- 承認済みの解釈（2026-11-23、ユーザーが選択肢で承認）：
  - 落とし穴の完全な逆として実装する（到着先の条件・到着時の処理は落とし穴と揃える）。
  - 罠の名前は「浮上穴」。
  - 重みは5。抽選の合計100を維持するため、同じ移動系の「転移」を10→5に下げる。ダメージ・状態異常系の確率は変えない。
  - 宝箱の罠には追加しない（床罠のみ）。

## 1. 対象と現行仕様

対象は `dist/traps.js` の床罠（`FLOOR_TRAPS` と `triggerFloorTrap`）。

現行：
- `FLOOR_TRAPS` は needle 25 / blast 25 / poison 20 / paralysis 15 / pitfall 5 / teleport 10（合計100）。踏んだ罠は発動時に重み抽選で種類が決まり、発動したマスは消費される（`c.trap=false`、`c.spent=true`、`c.trapKind` に種類を記録）。
- 落とし穴（pitfall）：最下層では「落とし穴の罠は不発に終わった。」、それ以外では「落とし穴の罠！ 一行は下の階へ落ちた。」を表示し `descendPitfall()` で1つ下の階へ移動する。
- `descendPitfall()`：`enterFloor(next, {keepLog:true})` で移動先の階を復元または生成し、到着先は `!c.type && !c.trap && !c.flag && !c.chest` のマスからランダム（候補がなければ `s.start`）。`s.previousPos` の設定、到着マスを開く、生成された階で到着先が開始マスでなければ開始マスを閉じる、復元された階では「地下○階に到着した。」を出す、`pendingStairs`/`pendingElevator`/`clearNotice` の解除、`revealHeadlight()`、到着先周囲の罠の警告ログまでを行う。
- `triggerFloorTrap` は teleport と pitfall のとき `true` を返す（呼び出し側の後続処理との契約）。

## 2. 変更内容

### 2.1 FLOOR_TRAPS

- teleport の weight を 10 → 5 に変更する。
- 末尾に `{id:'rise', name:'浮上穴', weight:5}` を追加する。合計は100のまま。
- 既存の種類の順序と、pitfall 以下の重みは変えない（既存テストの抽選帯が変わらないこと）。

### 2.2 発動処理（triggerFloorTrap）

pitfall の分岐の直後に、裏返しの分岐を追加する：

- `s.floor <= 1` のとき：ログ「浮上穴の罠は不発に終わった。」のみ。移動しない。
- それ以外：ログ「浮上穴の罠！ 一行の身体は浮き上がり上層へ転移した！」を表示し、新関数で1つ上の階へ移動する。
- 戻り値：rise のときも `true` を返す（teleport・pitfall と同じ契約）。

### 2.3 上昇関数

`descendPitfall()` の裏返しの新関数（名前は例：`ascendRise()`）を追加する。処理は `descendPitfall()` と到着先の階が `s.floor - 1` である点だけが違い、他はすべて同一とする：

- `s.floor <= 1` なら `false` を返して何もしない。
- `enterFloor(next, {keepLog:true})` で上の階を復元または生成する。
- 到着先は `!c.type && !c.trap && !c.flag && !c.chest` のマスからランダム（候補がなければ `s.start`）。
- `s.previousPos`、到着マスの open、生成時の開始マスの扱い、復元時の到着ログ「地下○階に到着した。」、`pendingStairs`/`pendingElevator`/`clearNotice` の解除、`revealHeadlight()`、周囲の罠の警告ログは `descendPitfall()` と同じにする。
- `descendPitfall()` 自体には手を入れない（共通化のリファクタもしない）。

## 3. 影響範囲と不変条件

- セーブ形式（ash-v1）・セル構造は変更しない（`trapKind` に新しい id が入りうるだけ）。
- 宝箱の罠（game.js の triggerChestTrap）は変更しない。
- 階層移動の既存経路（travelFloor／travelElevator／descendPitfall）と rememberFloor は変更しない。`tests/travel-characterization.cjs` が現行どおり通ること。
- 到着時の持続魔法の扱いは `setPlayerPosition` 経由で落とし穴と同じになる（4F反呪文ゾーンへの到着時の解除などは既存の仕組みに乗る）。回転床は歩行での進入でのみ発動する現行仕様のまま（転移到着では発動しない）で、落とし穴と揃う。
- 敵のHP・能力値をプレイ画面に出さない、ダイスの内部計算をログに出さない（従来どおり）。

## 4. ドキュメント

- `docs/SPECIFICATION.md` の床罠の列挙（22行目付近）は現行コードとずれている（転移15%とされ、落とし穴が抜けている。コードが正本で、現行は転移10%・落とし穴5%）。この列挙を新しい実態に書き直す：針25%・爆発25%・毒霧20%・麻痺の針15%・落とし穴5%・転移5%・浮上穴5%。浮上穴の説明は「1つ上の階の安全な通常マスへ転移。1Fでは不発」の趣旨を落とし穴の書き方に揃えて短く添える。
- `docs/devlog/reports/129.md` の作成と `docs/devlog/TIMELINE.md` への129行の追加（コミットID欄は統合時に記入する旨を空欄またはプレースホルダで残す従来形式に合わせる）。

## 5. テスト

`tests/pitfall.cjs` を見本に、新規テストファイル（例：`tests/rise-trap.cjs`）を追加し、`tests/game.cjs` の require リストに登録する。最低限次を固定する：

1. `FLOOR_TRAPS` の重み合計が100、rise の weight が5、teleport の weight が5。
2. 抽選の固定（例：`Math.random=()=>.97`）で rise が選ばれ、3Fで発動すると2Fへ移動する。発動マスは消費され `trapKind==='rise'` になる。
3. 到着先が `!type && !trap && !flag && !chest` の開かれたマスで、`s.previousPos===s.pos`、落とし穴のテストが固定している到着時の状態（scan・milwaSteps の保持、pending 系の解除）が同じになる。
4. 発動ログ「浮上穴の罠！ 一行の身体は浮き上がり上層へ転移した！」が出る。
5. 1Fでは不発（階が変わらず「不発」のログ、上昇関数が `false`）。
6. 復元ケース：一度訪れた上の階へ戻ると、その階の状態（開けたマス等）が復元され、到着ログ「地下○階に到着した。」が1回だけ出る。
7. 既存の `tests/pitfall.cjs` を含む全テストが従来どおり通る（特に抽選帯：`Math.random=()=>.87` で pitfall が選ばれることが変わらない）。

## 6. 検証

- `node tests/game.cjs` 全PASS
- `python3 scripts/compile-monsters.py --check`（無変更でも実行）
- sim selftest、`node tests/notion-sync.cjs`、`node tests/notion-items.cjs`（無変更でも実行）
- MANIFEST.sha256 の再生成と不一致0の確認

## 7. 範囲外

- 宝箱の罠への追加、他の床罠の重み変更（転移の下げ幅以外）。
- Notion 側の記録更新（床罠ページ・ログ文章DBへの2行追加）は統合後に Muse が行う。
