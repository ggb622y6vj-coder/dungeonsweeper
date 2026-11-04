# 010-light-sim-tool
ティア：LIGHT　依存：なし（ゲーム本体は変えない）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
数値調整の前後比較用の戦闘シミュレータを追加する。

## 変更内容
- 新規 scripts/sim/harness.cjs：tests/training.cjs の game() と同じvm方式で dist の12ファイル（weapons, monster-data, balance, spells, items, flags, traps, combatui, party, monsters, recruits, game）を読み込み {run, drain} を返す。
- 新規 scripts/sim/combat.cjs：引数 `--jobs 0,0,2,3,1,2 --level L --floor F(1〜3) --n N [--boss]`。毎試行：パーティ作成（初回のみ）→各member.xp=xpTargets[L]→levelUp()→HP/MP全快・状態解除→F>1なら fresh(F) し s.area='dungeon'→boss時は s.cells[s.pos].type='boss' にして encounter(s.pos,false)→決着まで attack()/drain()。
- 戦闘AI：僧侶はHP45%未満の味方がいれば dialma/dial/dios、魔法使いはMP6以上なら最強の習得済み攻撃呪文（tiltowait,lakanito,dalto,mahalito,katino,halito）を先頭列へ、canWeaponAttack(i) なら reachableEnemyGroups(i)[0] を戦う、他は守る。総HP25%未満で逃走可能なら flee()。
- 出力：勝率・全滅率・1戦あたり死者数・HP損耗率・平均ラウンドのJSON1行。README.md に使い方を1段落。dist/ tests/ data/ は変更しない。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- `node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 100` が60秒以内に終わる。
- 参考値（現行コード）：Lv1/3F 勝率約57%・全滅約7%、Lv6以上は全階99%以上、守護者戦はLv1でも約99%。大きく外れたら原因を報告。

## 前回の失敗（1回目：gpt-6-luna low、2026-11-02 01:30 JST）
- 差分は /workspace/dsw-queue/report/010-attempt1.diff（未push・リバート済み）。これを土台に続きから直すこと。
- テストはPASSし速度もOKだったが、結果が参考値から大きく外れた：Lv1/3F 勝率100%・全滅0%・1戦あたり死者2.97（参考：勝率約57%・全滅約7%）。守護者戦も100%。原因の報告もなかった。
- 確認できた原因候補：combat.cjs が毎試行 `seed` を同じ値で再設定しているため、全試行が同一の乱数列＝同じ1戦をN回繰り返している。試行ごとに乱数を進める（再設定しない／試行番号でシードを変える）こと。
- 「勝利」かつ死者約3人という数字も不自然なので、パーティ構成（fresh(1) の既定メンバーと recruit の重複・人数）、levelUp() の適用、勝敗判定（s.enemy が消えた理由が勝利か逃走か）も確認すること。
- 修正後に参考値と比較し、なお大きく外れる場合は原因を報告すること。
