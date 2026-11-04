# 010a-bugfix-sim-katino-policy
ティア：LIGHT　依存：010（011より前に実施）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。dist/・tests/・data/ は変更しない。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了。

## 目的
scripts/sim/combat.cjs の魔法使いAIは、Lv1 で常にカティノ（halito より優先）を選ぶ。守護者戦でも生存1体の列にも唱えて MP を無駄にするため、守護者3Fの勝率が 65〜69% まで落ちている（カティノを使わせなければ 98%）。このままでは 011 以降の前後比較、特に守護者・XP・逃走関連の比較が AI の癖でゆがむ。

## 変更内容
- scripts/sim/combat.cjs planTurn() の魔法使い分岐：守護者戦（s.enemy.boss）の時と、対象列の生存敵が2体未満の時は katino を候補から外す（/workspace/sim/bot.cjs と同じ方針）。それ以外は現状どおり。
- selftest.cjs にこの方針の回帰を追加：boss または単体列では katino を選ばず、2体以上の列では選ぶ。
- README のシミュレーター説明に AI 方針の1行を追加。

## OKの判定方法
1. `node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check && node scripts/sim/selftest.cjs` が全PASS。`git diff` で dist/・tests/・data/ に変更がない。
2. `--jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 300 --boss` の勝率が 90% 以上（検証時に katino を除外した値は 98%）。
3. 通常戦 Lv1/3F n=1000 の結果を報告する（目安 50〜58%）。
