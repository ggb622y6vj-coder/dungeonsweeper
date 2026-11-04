# 023b-light-early-inn-economy
ティア：LIGHT　依存：023a　（数値は提案。採用前に要確認）


## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
帰還全快の廃止後、1〜2Fの序盤パーティが普通の部屋（Lv1×6人=60G）をほぼ払えず、HP不足のまま再出撃→全滅→新規作成のループになる（自動プレイ3×20遠征：最高2F、Lv1〜2止まり、全滅2〜7回/20、新規作成47〜56人/20遠征、部屋利用3〜6/20回）。序盤だけ回復手段を足す。

## 変更内容
- dist/game.js `stayAtInn('stable')`：馬小屋でも status ok のHPを最大HPの25%（切り上げ）回復する（MP全快は従来通り）。
- 部屋代 innCost() はそのまま。docs/SPECIFICATION.md 更新。触らない：寺院、戦闘、XP、敵の金貨。

## OKの判定方法
1. tests 全PASS（tests/game.cjs の馬小屋テストを「HP+25%、上限maxHP」に修正し、他の検証は弱めない）。
2. クリーンチェックアウトで /workspace/sim/run2.cjs（DIST=クリーンdist, RUNS=3 EXP=20）：3Fに到達する試行が出て、全滅が023比で減ること。

## 追記（試遊より・023a検証後）
ついでに tests/game.cjs に、stayAtInn 経由で以下を検証するテストを追加すること:
- 宿泊で正常な全員がレベルアップすること（全員のLv確認）
- レベルアップ後のAC反映
- 複数レベルのメンバーがいる場合の部屋代（正常メンバーの Lv×10G の合計）
既存の検証は弱めないこと。
