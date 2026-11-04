# 01A-heavy-10f-final-boss
ティア：HEAVY　依存：016、017

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
10Fの守護者「迷宮の主」を倒すとゲームクリアになり、11Fへは進めないようにする。

## 変更内容
- 10Fで迷宮の主（labyrinthlord）を倒した時：
  - 下り階段を作らない。
  - `s.cleared=true` を保存する（ash-v1。旧セーブでは undefined を false として扱う）。
  - クリアのログ「迷宮の主は倒れた。迷宮に静寂が戻った……」と、クリア表示（町に戻るボタン付き）を出す。
- travelFloor：MAX_FLOOR(10) より深い階には行けないようにする。
- クリア後もパーティーは町に戻れ、続けて探索もできる（10Fで再び守護者に会っても階段は出ない）。
- 町の画面のどこかに「迷宮踏破済み」の印を出す（小さく、UIの大きな変更はしない）。
- docs/SPECIFICATION.md に終わりの条件を書く。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：
  - 10Fで boss を倒すと cleared=true で、s.cells[s.boss].type が 'down' にならない。
  - travelFloor(11) が false になる。
  - 9Fの守護者を倒すと従来どおり下り階段になる。
  - cleared が保存・復元される。
- シミュレーション：推奨Lv18の6人パーティーで迷宮の主（取り巻き込み）の勝率 65〜90%（当方シム：約78%）。
- 手動：ブラウザで10Fクリア表示が出ること（できなければ未確認と報告）。


## 追加要件（試遊 016検証より）
現状11F以降にも降りられる。ラスボス実装時に必ず10Fで階段を止め、11Fへ降りられないようにし、回帰テストで確認すること。
