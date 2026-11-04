# 004-bugfix-magicplans-length
ティア：LIGHT　依存：なし

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
呪文・アイテム予約配列が旧3人前提の長さで初期化されるのを、パーティ人数に合わせる。

## 変更内容
- dist/spells.js `ensureMagic()`：`s.magicPlans ??= [null,null,null]` を、s.members.length に満たない分を null で補う処理に変更（既存の値は保持）。
- dist/items.js の itemPlans 初期化も同様に（該当箇所があれば）。
- 並べ替え（PARTY_FIELDS）には手を入れない。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：6人パーティで ensureMagic() 後に s.magicPlans.length === 6。旧3人セーブfixtureでも例外なし。
- 手動：6人で戦闘に入り、5・6人目の呪文選択ができること。
