# 指示書137: 呪文DBの更新反映（MP調整・新規呪文3種）

日付: 2026-11-25
ブランチ: hold/137

## 1. 概要

オーナーが Notion の呪文DBを更新した（2026-11-24 22:11〜22:15 JST）。内容は、既存呪文14件のMP引き下げと、新規呪文3件（いずれも僧侶）の追加である。本指示書はその内容をゲームへ反映する。調査は Muse が実施し、ライブDB（45行）とスナップショット `data/notion-spells.json`（42行）の全行差分で変更点を確定した。MP以外の項目（名前・説明・効果など）に既存呪文の変更はない。

## 2. MP引き下げ（14件）

`dist/spells.js` の MAGIC 行の MP（第5要素）と、`data/notion-spells.json` の該当行の MP を、次表のとおり変更する。スナップショットの MP は既存形式（文字列）に合わせる。

| ID | 名前 | MP |
|---|---|---|
| sweep | 一掃 | 10 → 5 |
| calfo | 仕掛解除 | 3 → 2 |
| dalto | 吹雪 | 7 → 6 |
| flagkill2 | 壊滅の旗 | 4 → 3 |
| madalto | 大吹雪 | 9 → 7 |
| dial | 大回復 | 4 → 3 |
| mamorlis | 超減退 | 6 → 4 |
| mahalito | 大火炎 | 4 → 3 |
| lomilwa | 大透視 | 5 → 4 |
| matu | 大防御 | 4 → 3 |
| dialko | 強壮 | 4 → 3 |
| dialma | 超回復 | 6 → 5 |
| morlis | 大減退 | 4 → 3 |
| mamahalito | 超火炎 | 6 → 5 |

変更は上記の14件のみとし、それ以外の呪文の MP は変更しない。全 ID: sweep, calfo, dalto, flagkill2, madalto, dial, mamorlis, mahalito, lomilwa, matu, dialko, dialma, morlis, mamahalito。

## 3. 新規呪文（3件、いずれも僧侶・確定習得=false＝判定（知力/信仰÷30））

MAGIC の行形式は既存行に倣う: `[id, 名前, 系統(僧侶=2), 習得Lv, MP, guaranteed, where, target, effect, value, 説明]`。

### 3.1 治癒の旗（flaghp）

- 習得Lv 2、MP 1、where 'both'、target 'ally'、effect 'heal'、value [2,8]
- 説明（Notion の文面どおり）: 「周囲8マスに旗が立ててある罠がある場合、そのうち1つの旗とその下にある罠を解除し、探索済みにする。生存する味方1人のHPを2d8回復。」

### 3.2 大治癒の旗（flaghp2）

- 習得Lv 10、MP 4、where 'both'、target 'ally'、effect 'heal'、value [8,3]
- 説明: 「周囲8マスに旗が立ててある罠がある場合、そのうち1つの旗とその下にある罠を解除し、探索済みにする。生存する味方1人のHPを8d3回復。」
- 注意: 壊滅の旗（flagkill2）は旗付き罠を「全て」解除するが、大治癒の旗は説明どおり「1つ」だけである。

### 3.3 旗の解除の発動（flaghp / flaghp2 共通）

- `castMagic` の旗呪文の仕組み（`flagSpell` 判定、`flags` の収集＝現在位置の周囲8マスの flag&&trap、`disarmSpellFlags`）へ両呪文を加える。両呪文とも解除対象は1つ（flagkill / flagdebuff と同じく `flags.splice(1)` の側）。
- 回復そのものは旗付き罠の有無にかかわらず常に行う。旗付き罠がある場合のみ、回復とあわせて1つを解除する（解除のログ・探索済み化は既存の `disarmSpellFlags` の挙動に従う）。
- 探索・戦闘のどちらでも同じ扱いとする（現行の旗解除は敵対象ブランチ内でのみ発動するが、本2呪文は heal ブランチ側で発動させること）。
- 敵の呪文候補（ENEMY_SPELL_IDS）へは追加しない。

### 3.4 示現（jigen）

- 習得Lv 13、MP 10、where 'field'、target 'party'、effect 'survey'、value null
- 説明: 「次の階層へ進む階段の位置を象限で示す。」
- 効果: 詠唱すると、その階の下り階段の位置を象限でログに示す。下り階段のセルは `s.boss`（守護者撃破前は type 'boss'、撃破後は 'down'、セル位置は同一）とする。
- 象限の定義: 盤面を中心線で4分割した絶対位置で判定する。盤面サイズは偶数（8/10/12）なので中心線上にセルは存在しない。北 = 行 < size/2、南 = 行 >= size/2、東 = 列 >= size/2、西 = 列 < size/2。
- ログ文面: 「階段はこの階の北東にある。」のように、北東・北西・南東・南西を入れる。
- 10F（MAX_FLOOR、下り階段が存在しない）では「この階に下り階段はない。」旨のログを出し、MPは通常どおり消費する（詠唱自体は成功扱い）。
- 実装上の注意: effect 'survey' は既存の判別（dumapic）のブランチと共用しないこと。`castMagic` 内で id 'jigen' を個別に処理する（sweep / tempt と同様の扱い）。`baseSpellCost` の特殊扱い（dumapic / floodfill の倍増）には含めない。dumapicUses も増やさない。
- 敵の呪文候補へは追加しない。

## 4. スナップショットと同期

- `data/notion-spells.json` へ新規3行を追加し、§2 の MP 変更を反映する（全45行になる）。行の項目・形式は既存行に倣う（MP は文字列、使用場面は JSON 文字列形式など、既存行と同形式）。
- `node tests/notion-sync.cjs` が呪文45件で差分0になること。
- 図書館の呪文タブの件数表示は MAGIC の件数から導出されるため 42 → 45 に自動で変わる想定。件数を固定値で持つテストがあれば追従させる。

## 5. テスト

- 新規の node テスト（tests/game.cjs の require リストへ登録）を追加する:
  - flaghp / flaghp2: 旗付き罠がある状態で詠唱すると、対象が回復し、旗付き罠がちょうど1つだけ解除・探索済みになること。旗付き罠がない状態でも回復だけは行われること。探索・戦闘の両文脈で確認する（戦闘文脈は既存テストの戦闘セットアップ方法に倣う）。
  - jigen: 階段セルの象限が正しくログに出ること（少なくとも2象限）。10F では下り階段なしのログになること。
  - MP変更: §2 の各呪文の MP が MAGIC 上で新しい値になっていること（代表として sweep=5 と madalto=7 を含める）。
- 既存テストで MP や呪文件数を前提にしているものは、新仕様への追従として期待値を更新してよい（検証の強さは落とさない）。

## 6. 対象外

- 敵の呪文使用（ENEMY_SPELL_IDS、敵の所持呪文Lv）への新規呪文の追加。
- 既存呪文の効果・説明文の変更（Notion 側にも変更なし）。
- セーブ形式の変更（行わない。既存セーブの known は ID 参照のため自動で整合する）。

## 7. 検証手順（標準）

- `node tests/game.cjs`（全PASS）
- `python3 scripts/compile-monsters.py --check`
- `node tests/notion-sync.cjs` / `node tests/notion-items.cjs`（差分0）
- ブラウザテスト全件（Muse が実施）
- MANIFEST.sha256 を再生成し、不一致0を確認
- docs/devlog/reports/137.md と TIMELINE.md の137行を作成
