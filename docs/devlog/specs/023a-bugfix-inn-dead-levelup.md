# 023a-bugfix-inn-dead-levelup
ティア：LIGHT　依存：023


## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
宿屋で死亡・灰のメンバーまでレベルアップしてしまう（levelUp()が全員対象）のを直す。費用表示の文言も実際の式に合わせる。

## 変更内容
- dist/game.js `stayAtInn()`：レベルアップ対象を status ok のメンバーに限定する（死亡/灰はXPを保持したまま据え置き、蘇生後の宿泊で上がる）。
- dist/game.js `#innopen` の表示文言「正常な冒険者の人数 × 各Lv × 10 G」→「正常な冒険者の Lv × 10 G の合計」。式（innCost）は変えない。
- tests/game.cjs に回帰テスト追加。触らない：寺院、戦闘、XP、innCost。

## OKの判定方法
1. `node tests/game.cjs && node tests/death-status.cjs && node tests/temple.cjs` 全PASS。
2. 回帰テスト：dead/ash メンバーにXP大量付与→馬小屋/部屋→そのメンバーのLv・maxHP不変、okメンバーは上昇。蘇生後に馬小屋→上昇。
3. 表示文言が「Lv × 10 G の合計」。
