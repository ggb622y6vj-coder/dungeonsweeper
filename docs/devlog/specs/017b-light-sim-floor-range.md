# 017b-light-sim-floor-range
ティア：LIGHT　依存：017

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- このファイルの「変更内容」以外は変更しない。変更した挙動には回帰テストを追加する。npm依存を追加しない。
- 報告は日本語で簡潔に書く。

## 目的
10階化に合わせて、戦闘sim（scripts/sim/combat.cjs）で4F〜10Fを測れるようにする。

## 変更内容
- `--floor` の上限を 3 から 10 にする（エラー文も「1〜10」に直す）。
- 任意の `--gear shop|drop` を追加する。
  - shop：その階の minFloor 以下で、shop!==false の品から職業ごとに最良の武器・防具を装備する。
  - drop：shop:false の品も含めて同じように選ぶ。
  - 後衛は遠距離武器を優先する。
  - 指定しない場合は今までどおり初期装備。
- selftest に、floor 10 と --gear が通るケースを追加する。

## OKの判定方法
- `node scripts/sim/selftest.cjs` がPASSする。
- `--level 15 --floor 10 --boss --gear drop` が動く。
- 指定なしのときの結果が変更前と同一になる（固定seed）。
