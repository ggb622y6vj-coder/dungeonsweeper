# 026-light-temple-cost-scaling：寺院費用を低レベルで安く
ティア: light / 依存: なし（024 帰還時自動レベルアップと独立）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。
## 目的
序盤（Lv1-3）は 1戦≈5-8G、遠征あたり 0-20G しか入らず、蘇生 100G が払えない。結果として死者を削除→Lv1 新人で補充し続け、レベルが上がらない（bot 20遠征で新人 39-47人）。
## 変更内容
- dist/game.js（およびソース）templeCost：
  - dead: `min(100×Lv, 25×Lv²)` → Lv1 25 / Lv2 100 / Lv3 225 / Lv4+ 100×Lv（現行と同じ）
  - ash: `min(250×Lv, 60×Lv²)` → Lv1 60 / Lv2 240 / Lv3 540 / Lv4 960 / Lv5+ 250×Lv（現行と同じ）
- 寺院画面の表示価格も同じ関数を使う。蘇生成功時の全快など他の仕様は変えない。
## OKの判定方法
- tests/ に templeCost の表（上記各Lvの値）を検証する回帰テスト。Lv4 以上(dead)/Lv5 以上(ash)は現行値と一致。
- autoplay（/workspace/sim/run_bot6.cjs, RUNS=3 EXP=20）で新人補充が 1ラン平均 ≤25人（現行 39-47）、蘇生回数が現行以上。全滅 0 を維持。
