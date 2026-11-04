# 006-bugfix-summon-cap
ティア：LIGHT　依存：なし

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
仲間呼び（例：大鼠40%）で敵が増え続け、XPを無限に稼げる問題を直す。

## 変更内容
- dist/monsters.js `monsterAction()` の summon 分岐：`s.enemy.summoned`（未定義は0）を数え、1戦闘あたり4体まで。超過時は既存の「仲間を呼んだが、現れなかった。」を出す。成功時に summoned++。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：乱数を固定して同じ敵に10回 summon させても追加は4体まで。
- 手動：不要。
