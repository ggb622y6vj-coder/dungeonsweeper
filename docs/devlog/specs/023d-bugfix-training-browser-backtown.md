# 023d-bugfix-training-browser-backtown
ティア：LIGHT　依存：023c


## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
023cで追加した tests/training-browser.py の町帰還ブロックが必ず失敗する（43行 `#backtown` click がタイムアウト）。#backtown は s.done 時のみ表示されるが、テストは1人を倒しただけで迷宮内のまま。直前コミット版のテストは本番で PASS。

## 変更内容
- tests/training-browser.py 41〜43行：`#backtown` クリックの代わりに、開始マスで `s.pos=s.start;s.pendingStairs=true;render()` の後に実際の「はい」ボタン（answerStairs(true) を呼ぶUI）をクリックして帰還する。以降のアサーション（44〜60行）は変えない。
- ゲーム本体（dist/）は変更しない。

## OKの判定方法
1. `python3 tests/training-browser.py http://127.0.0.1:8000/`（Chromeの実行パスは環境に合わせる）が 1280/390 とも最後まで PASS。
2. 既存アサーションを削除・弱化しない。
