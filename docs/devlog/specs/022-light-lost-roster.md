# 022-light-lost-roster
ティア：LIGHT　依存：021

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【死亡・灰・ロスト 手順3/3】ロストしたキャラクターを訓練所で表示し、加入不可・抹消のみ可能にする。

## 変更内容
- dist/training.js：一覧で status 'lost' に「ロスト」表示、加入ボタンをdisabled。'dead'/'ash' は「死亡」「灰」表示（加入は可、入場は020で不可）。
- dist/recruits.js `changeRecruitParty(id, true)`：status==='lost' なら false を返す。抹消（deleteRecruit）は従来通り可能。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：lost は加入不可・抹消可。dead は加入可。
- 手動：訓練所で表示を確認（PC・スマホ幅）。
