# 020-heavy-death-status
ティア：HEAVY　依存：011（XP分配後）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【死亡・灰・ロスト 手順1/3】死亡状態を導入し、帰還で死者が無料復活しないようにする（寺院は次の021）。

## 変更内容
- データ：`s.members[i].status`：'ok'|'dead'|'ash'|'lost'。移行（ensureProfile 内）：未設定なら、町にいれば 'ok'、迷宮内で s.hp[i]<=0 なら 'dead'、他 'ok'。控え（s.reserve の record.members）も未設定は 'ok'。
- 新規 `markDeaths()`（dist/game.js）：s.hp[i]<=0 かつ status==='ok' なら 'dead'。HP0化の全経路の末尾で呼ぶ：monsterHurt・monsterOnHit（dist/monsters.js）、床罠（dist/traps.js triggerFloorTrap）、triggerChestTrap・tickAilments・hurt（dist/game.js）。
- `enterTown()`：HP/MP全快は status==='ok' のみ。dead/ash/lost は HP0 のまま。毒・麻痺解除は全員。
- `enterDungeon()`：パーティに status!=='ok' がいれば入場せず「死亡したメンバーを外してください。」をlog。
- `visibleAilments(i)`：status が dead/ash/lost なら 死亡/灰/ロスト を表示。
- 「帰還で全員回復」前提の既存テストは新仕様に合わせて修正し理由をコメント。docs/SPECIFICATION.md 3章を更新（本作の暫定仕様と明記）。
- 触らない：戦闘式、XP、寺院（まだ作らない）、セーブキー名。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：戦闘でHP0→status 'dead'→帰還後もHP0。deadを含むパーティは入場不可、酒場で外せば入場可。旧セーブ（statusなし）で例外なし、町では全員ok。セーブ→リロードで保持。
- 手動：迷宮で1人死亡→帰還→その人がHP0「死亡」表示のまま。
