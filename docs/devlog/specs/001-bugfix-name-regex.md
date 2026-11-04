# 001-bugfix-name-regex
ティア：LIGHT　依存：なし

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
キャラクター名に ( や [ を含むとログ描画で例外が出てゲームが止まるバグを直す（最優先）。

## 変更内容
- dist/game.js `coloredLog()`：`new RegExp(names.join("|") + ...)` の連結前に各語を `w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")` でエスケープし、空文字を除外する。
- dist/recruits.js の名前サニタイズは変更しない。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：名前 "(" / "[x" / "a.b" / "a*" のメンバーを generateRecruit→registerRecruit→changeRecruitParty→refreshNames で加入させ、`coloredLog('テスト')` が例外を出さないこと、`coloredLog('aXbの攻撃')` に味方色 span が付かないことを確認。
- 手動：訓練所で名前「(テスト」を登録→加入→迷宮に入り、ログが表示され操作できること。
