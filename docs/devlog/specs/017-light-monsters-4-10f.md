# 017-light-monsters-4-10f
ティア：LIGHT　依存：013（守護者の取り巻き）、016

## 共通ルールの補足
敵データは data/monsters.csv → scripts/compile-monsters.py。今回はこの2ファイルを用意済みのものに置き換える。

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
4F〜10Fの敵がいないため、10階ぶんの敵（88種・各階に守護者1体）を入れ、敵の全体呪文を使えるようにする。

## 変更内容
- 用意済みファイルをコピーする（中身の調整は不要。数値を変える場合は報告に書く）。
  - /workspace/dsw-queue/assets/monsters.csv → data/monsters.csv
  - /workspace/dsw-queue/assets/compile-monsters.py → scripts/compile-monsters.py
  - その後 `python3 scripts/compile-monsters.py` で dist/monster-data.js を再生成する。
- 新しい compile-monsters.py の主な変更：
  - 「10F」も読めるように階層を正規表現で読む。
  - 守護者の一覧を10体に増やし、各階に守護者がちょうど1体あることを検査する。
  - 敵呪文 ハリト(単体1d8)、マハリト(全体4d6)、ダルト(全体5d6)、マダルト(全体6d8)、ティルトウェイト(全体8d8) に対応し、spellInfo を出力する。
- dist/monsters.js：
  1. monsterFormation の `Math.min(3,s.floor||1)` を `Math.min(Math.max(...ENEMIES.map(d=>d.floor)),s.floor||1)` にする。
  2. 敵の呪文処理（ハリト固定）を spellInfo を使う形にする。target==='all' なら生存者全員に dice のダメージ、spellInfo が無ければ従来のハリト。
  - 参考パッチ：/workspace/dsw-queue/assets/proto/apply_017.py（013適用後のコードにもそのまま当たる想定）
- tests/game.cjs を更新する（参考：assets/proto/tests-game-diff-015-017.txt）。
  - 'CSV count' を 88 にする。
  - 'floor pool' / 'guardian floor' のループを1〜11Fにし、期待値を `Math.min(10,f)` と、守護者ID ['guardian','general','watcher','minogate','necromancer','vampire','ettin','demongeneral','ancientdragon','labyrinthlord'] にする。
  - 追加：マハリトを使う敵の呪文で生存者全員のHPが減ること。
- docs/BALANCE.md に階ごとの敵一覧（名前・Lv・特徴）を追加する。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS（88 monster definitions validated）。
- 回帰テスト：上記。
- シミュレーション（010の sim ツールがあれば）：推奨Lvの1戦勝率が全階 95%以上。
- 手動：4Fに降りて新しい敵が出ること。
