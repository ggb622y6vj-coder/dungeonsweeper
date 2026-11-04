# 013-light-guardian-escort
ティア：LIGHT　依存：012

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
守護者が単独で通常戦より弱い（Lv1でも勝率99%）ため、随伴の敵を付ける。

## 変更内容
- dist/monsters.js `monsterFormation(boss)`：boss時は [守護者ID, 同階の非守護者からランダム1種] に、50%でさらに1種追加（最大3列、守護者は1列目）。
- 下り階段化の条件（finishMonsterBattle の defeated.some(boss)）と逃走不可は従来通り。BALANCE.md の守護者記述を現仕様に合わせる。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：守護者戦が2〜3列で1列目が守護者。随伴だけ倒しても戦闘継続。全滅で下り階段化。
- sim：`--boss` で Lv1/1F〜3F の勝率を報告。
- 手動：守護者戦で複数列表示されること。
