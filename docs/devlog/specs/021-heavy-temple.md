# 021-heavy-temple
ティア：HEAVY　依存：020

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【死亡・灰・ロスト 手順2/3】町に寺院を作り、死亡/灰を蘇生できるようにする。

## 変更内容
- dist/index.html：町に「寺院」ボタンと `<dialog id="templedialog">`（鍛冶屋dialogの構造を踏襲）。
- dist/game.js に新規：`templeCost(m)`（dead: 100×Lv、ash: 250×Lv）、`templeChance(m)`（dead: clamp(50+3×Lv,50,95)%、ash: clamp(40+3×Lv,40,90)%）、`templeRaise(id)`（金貨を引き、成功→'ok'・HP1、失敗→deadは'ash'、ashは'lost'。結果を返す）、`renderTemple()`（パーティ＋控えの dead/ash を一覧、費用・ボタン、金貨不足はdisabled、結果を通知欄に表示）。
- 町でのみ実行可（s.area==='town' && idle()）。docsに式を「本作の暫定式」として記載。
- 触らない：020の判定ロジック、戦闘、XP。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト（Math.random 固定）：dead成功→ok/HP1、dead失敗→ash、ash成功→ok、ash失敗→lost。費用が正しく引かれ、不足時は不可。控えのメンバーも対象。
- 手動：死亡者を作り帰還→寺院で蘇生→迷宮に入れること。
