# 031-heavy-corpse-rescue
ティア：HEAVY　依存：030

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
【遺体と救出 手順2/2】別パーティが遺体マスへ到達すると回収できるようにする（マインスイーパー統合：救出隊は新しく生成された罠を推論して進む）。

## 変更内容
- dist/game.js `fresh(floor)` の後処理：その階の corpses の cell を罠なし・type '' にする。開始位置・守護者位置と重なる場合は最寄りの通常マスへ cell を移して保存。罠数は維持（他の空きマスへ再配置）。
- 地図描画：corpse の cell に骨アイコン（常時表示）。
- `cell()`：遭遇判定の前に、遺体マスなら「遺体を回収した。」→ records を s.reserve に戻す（status dead のまま）、gold を s.gold に加算、corpse を削除。
- 触らない：寺院、戦闘、030のデータ形式。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：遺体マスが開始・守護者と重ならない（1000回生成）、罠なし。到達で回収→控えに dead で戻り金貨復帰→寺院で蘇生可能。
- 手動：全滅→控えで新パーティ→該当階で骨アイコンへ到達→回収。
