# 047 [light] 味方対象のプルダウン選択を廃止し、パーティー枠選択に統一

## 背景
アイテム（薬）・味方対象呪文で、「パーティー欄で対象を選ぶ」と旧来のプルダウン（select）の2方式が併存して紛らわしい。ユーザー指示により旧方式を削除し、パーティー枠選択に一本化する。

## 対象箇所（dist/ 基準）
1. index.html 薬ダイアログ: `#medicinechoice`（`#medicinetarget` select と `#medicineuse` ボタン）を削除。`#medicinepick` のみ残す。
2. spells.js renderMagicChoice: target==='ally' の場合の `#magictarget` select 生成をやめる（探索中も戦闘中も `#magicpick` → パーティー枠で選択）。`#magiccast` は ally 呪文では非表示。
3. combatui.js:60 戦闘中のフォールバック `#allytargetspellselect` / `#allytargetspelluse` を削除。
4. 上記を参照する JS（medicineuse/medicinetarget のハンドラ、keynav.js の対象リスト等）も整理し、デッドコード・存在しない要素参照を残さない。

## 変更しないもの
- 敵グループ対象の select（attackRowUI、呪文の group/enemy 対象）、階層選択（floor 対象呪文）、酒場・順番変更・鍛冶屋のメンバー選択、アイテム「渡す」の相手選択は今回対象外（味方を「使用対象」として選ぶ処理ではないため）。

## OKの判定方法
- 探索中・戦闘中ともに、薬と味方対象呪文（ディオス等）の画面に対象プルダウンが一切出ない。「パーティー欄で対象を選ぶ」→ パーティー枠タップ（およびキーボード Space）で使用・発動できる。
- 戦闘中の味方対象呪文でもフォールバック select が出ない。
- 石化・死亡など対象外メンバーは従来どおり選べない。
- 1280・390 両幅で確認。既存テスト全通過（select 前提のテストはパーティー枠方式に書き換え）。
