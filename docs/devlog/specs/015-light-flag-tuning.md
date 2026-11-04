# 015-light-flag-tuning
ティア：LIGHT　依存：なし（014の後に実行）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
旗の効果がほぼ攻略に影響していない（実測：正しい旗が平均3〜4本＝発動率約5%、戦闘勝率差 +0.3〜0.7pt＝誤差）。
発動率を「二乗式」から「1本あたり4%・上限40%」の線形式に変え、旗を立てる価値を体感できる強さにする。
誤った旗の呪い（威力×0.65／被ダメ×1.5／MP×1.5・逃走不可）はそのまま残し、リスクとリターンを両立させる。

## 変更内容
- dist/flags.js `flagChance(f,kind)`：
  - 現在：`Math.min(.50,.005*n**2)`
  - 変更後：`const FLAG_CHANCE_PER=.04,FLAG_CHANCE_CAP=.40;` を追加し、`Math.min(FLAG_CHANCE_CAP,FLAG_CHANCE_PER*n)` にする（n＝その種類の正しい旗の数）。
  - 参考パッチ：/workspace/dsw-queue/assets/proto/apply_015.py
- 発動時の効果（怪力×1.5／堅牢×0.5／呪禁MP半減）と呪いの効果は変更しない。
- tests/game.cjs の旗の確率テスト2か所（'0.5-50 percent' と 'flag curve'）を新しい式の値に更新する。
  - 期待値：0本→0、1本→.04、5本→.2、10本→.4、100本→.4
  - 参考：/workspace/dsw-queue/assets/proto/tests-game-diff-015-017.txt
- docs/SPECIFICATION.md と BALANCE.md の旗の確率の記述を更新する。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：上の期待値。誤った旗があると bad=true（逃走不可）であることも維持されている。
- 手動：1Fで正しい怪力旗を3本立てて戦闘し、何度か「怪力」の発動ログが出ること（12%）。
