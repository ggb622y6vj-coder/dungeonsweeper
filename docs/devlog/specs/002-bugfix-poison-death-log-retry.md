# 002-bugfix-poison-death-log
ティア：LIGHT　依存：なし

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
探索中（移動時）に毒でHPが0になってもログに何も出ないバグを直す。

## 変更内容
- dist/game.js `tickAilments(logPoison)`：毒ダメージでHPが0になった場合だけ、logPoison に関係なく「${NAMES[i]}は毒で倒れた。」を log する。毒ダメージ自体のログ抑制（探索中）は従来通り。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：HP2・毒のメンバーがいる状態で隣接マスへ cell() → HP0 になりログに「毒で倒れた」が1回だけ出る。HP10なら毒関連ログなし。
- 手動：不要（ログ文言のみ）。

## 前回の失敗（1回目：gpt-6-luna low、2026-11-01 23:10 JST）
- Codex は tickAilments 修正と回帰テストを追加したが、tests/game.cjs の新テストが `Error: poison death HP` で失敗（cell(next) 後に s.hp[0] が 0 にならない）。テストの前提状態（移動が成立するか、毒ダメージが移動時に入るか、Math.random=.99 の影響など）か実装のどちらかが誤り。Codex 自身も「未完了」と報告。
- 差分は /workspace/dsw-queue/report/002-attempt1.diff（作業ツリーは元に戻した）。
- 次回：実際に移動時に tickAilments が呼ばれる経路を確認してからテストを書くこと。
