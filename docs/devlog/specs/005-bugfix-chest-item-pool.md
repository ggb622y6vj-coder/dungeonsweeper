# 005-bugfix-chest-item-pool
ティア：LIGHT　依存：なし

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
宝箱から店専用品（例：板金鎧300G）が1Fでも出るのを、階層の価格上限で制限する。

## 変更内容
- dist/game.js `rewardChest(c)`：抽選候補を「w.drop===true の武器 ＋ w.part を持つ防具」のうち `w.price <= s.floor * 150` のものに限定する関数 `chestItemPool(floor)` を追加して使う。候補が空なら最安品1つ。
- dropWeapon() は変更しない。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：s.floor=1 で chestItemPool を1万回抽選して plate が出ない。s.floor=2 で plate が出うる（候補に含まれる）。
- 手動：不要。
