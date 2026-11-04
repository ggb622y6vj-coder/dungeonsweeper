# 017c-bugfix-sim-gear-ignored
ティア：LIGHT　依存：017b（eee76ad）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- このファイルの「変更内容」以外は変更しない。変更した挙動には回帰テストを追加する。npm依存を追加しない。
- 報告は日本語で簡潔に書く。

## バグ
017b で追加した `--gear shop|drop` が結果に効いていない。固定seedで `--gear` なし／shop／drop の結果が完全一致する。
- 例：`--jobs 0,0,2,3,1,2 --level 9 --floor 4 --n 30` と、同じ条件に `--gear drop` を付けたもので、averageRounds まで同じ値になる。
- 原因：scripts/sim/combat.cjs の `createParty` が、装備前に `simBase = structuredClone(partyRecords())` を保存している。`prepareTrial` は毎試行、この simBase から PARTY_FIELDS（inventory/equipped/armor を含む）を復元する。そのため、`gearParty` で付けた装備が毎回消える。

## 変更内容
- 装備が試行ごとの復元に含まれるようにする。たとえば `gearParty` の最後で simBase を取り直す。
- 試行ごとの成長リセット（Lv1基準への復元）は今までどおりに保つ。
- selftest に回帰テストを追加する。内容：`--gear drop` を付けると、少なくとも1つの条件で、`--gear` なしと結果（または装備後の攻撃力・AC）が異なる。また、prepareTrial 後も装備が残っている。

## OKの判定方法
- `node scripts/sim/selftest.cjs`、tests/game.cjs、tests/training.cjs がPASSする。
- `--level 9 --floor 4 --n 30` で、`--gear drop` の結果が `--gear` なしと異なる。
- `--gear` 指定なしの結果が変更前と同一になる（固定seed）。


## 追加OK条件（試遊より）
- 固定seedで --gear なし / shop / drop の結果がそれぞれ異なること
- Lv15・10F守護者で --gear drop の勝率が装備なしより大幅に上がること（数値を報告に記載）
