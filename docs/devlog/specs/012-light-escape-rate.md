# 012-light-escape-rate
ティア：LIGHT　依存：011

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
逃走率が最低75%で簡単すぎるため、レベル差で決まる式にする。

## 変更内容
- dist/game.js `escapeChance()`：ボス・誤旗は従来通り0。それ以外 `50 + 5×(生存かつ毒/麻痺でない味方の平均Lv − 生存かつ非睡眠の敵の平均Lv) + 人数補正（その味方人数 1人15/2人10/3人5/他0）` を 10〜95 に clamp。対象味方0人なら10。
- docs/SPECIFICATION.md の逃走率記述を更新（本作の暫定式と明記）。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：Lv1×6人 vs Lv2 → 45、Lv10×6人 vs Lv2 → 90、生存1人Lv1 vs Lv2 → 60。
- 手動：不要。
