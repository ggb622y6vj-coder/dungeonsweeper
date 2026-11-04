# 026a-light-2f3f-monster-dice：2F/3F 通常敵の物理ダイス平準化
ティア: light / 依存: 026 の後（独立して入れてもよい）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。
## 目的
1F 敵は 1d4〜1d8、2F は一律 2d6、3F は 3d6/3d9 で、4F の 1d8+2 より 2F/3F の方が痛い逆転がある。装備なしでの 1F→2F の崖（通常戦 98%→75-84%）を緩める。ガーディアン（深層の魔将・奈落の監視者）とブレスは変えない＝ボスの硬さは維持。
## 変更内容（data/monsters.csv → scripts/compile-monsters.py）
- 2F: 2d6 → 1d8+1（毒スライム, 亡霊騎士, オーク戦士, 大蜘蛛, 洞窟の魔術師, 山賊の頭目, 腐肉食い, 石の番人）、火蜻蛉 2d5 → 1d8
- 3F: 3d6 → 2d6+1（酸性スライム, 骸骨の射手, オーク呪術師, 影の盗人）、黒牙狼 3d9 → 2d8+1
## OKの判定方法（scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --n 150）
- 装備なし 2F Lv2 通常戦 勝率 ≥84%、3F Lv3 通常戦 ≥66%（現行以上）。
- --gear shop で 2F Lv2/Lv3・3F Lv3/Lv4 ガーディアン勝率 89-100%（試算 92.7/98.7/92.7/97.3%）。
- --gear shop で 2F Lv2 通常戦の死者/戦 ≤ 3F Lv3 の値以下（2F が 3F より難しくない）。
- compile-monsters.py --check が通る。
