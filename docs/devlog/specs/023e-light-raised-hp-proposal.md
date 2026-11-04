# 023e-light-raised-hp-proposal
ティア：LIGHT　依存：023c　（提案。採用前に要確認）


## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
023cで有料の部屋が消えたため、寺院で蘇生した冒険者（HP1）を町で回復する手段がない（帰還でしか全快しない）。HP1のまま迷宮へ入るしかなく、自動プレイでは蘇生直後の再死亡が頻発。

## 変更内容
- dist/game.js `stayAtInn('stable')`：status ok のメンバーのHPも全快する（帰還時全快と同じ扱いなので新たな稼ぎにはならない）。UI文言を「HP・MPが全快し、レベルアップします」に。
- tests を新仕様に更新（馬小屋HP不変のアサーションのみ置換、他は弱めない）。触らない：寺院、帰還処理。

## OKの判定方法
1. tests/*.cjs、selftest、training-browser.py PASS。
2. 寺院で蘇生（HP1）→馬小屋→HP満タン。
