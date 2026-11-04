# 023g-light-browser-test-chrome-path
ティア：LIGHT　依存：023d


## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
tests/training-browser.py の Chromium のパスが /usr/bin/chromium に固定されていて、その場所にない環境（検証環境は /usr/bin/google-chrome）ではそのまま動かない。

## 変更内容
- tests/training-browser.py 4行目：`executable_path` を環境変数 `CHROME_PATH` から読む。未設定なら /usr/bin/chromium → /usr/bin/google-chrome → /usr/bin/chromium-browser の順に存在するものを使い、どれもなければ executable_path を指定せず Playwright 同梱のブラウザを使う。
- それ以外のテスト内容は変更しない。

## OKの判定方法
1. `CHROME_PATH=/usr/bin/google-chrome python3 tests/training-browser.py <URL>` と、環境変数なしの実行の両方で 1280/390 とも PASS。
2. アサーションは変更しない。
