# 030a-bugfix-sim-wipe-deaths
ティア：LIGHT　依存：030


## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
030で全滅時にパーティが空になる（finishDefeat）ため、戦闘シミュレータが全滅の死者を0人と数え、scripts/sim/selftest.cjs が失敗する（113行 wipe.deaths 0 !== 6）。1F Lv1 300戦で deathsPerBattle が 2.73→1.06 に過小評価。

## 変更内容
- scripts/sim/combat.cjs `resolveBattle()`：戦闘ループ中に s.defeatPending が立ったら、その時点（finishDefeat前）で人数・死者数・HP合計を記録して全滅として返す（例：drain前に判定、または defeat 後の s.corpses 末尾の records 人数を死者数に使う）。
- `prepareTrial()`：試行ごとに s.corpses を空にし、パーティを確実に復元する。
- ゲーム本体（dist/）は変更しない。

## OKの判定方法
1. `node scripts/sim/selftest.cjs` PASS（既存アサーションを弱めない）、tests/*.cjs 全PASS。
2. `node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --n 300 --floor 3` の deathsPerBattle が030前（≈2.7）と同程度。
