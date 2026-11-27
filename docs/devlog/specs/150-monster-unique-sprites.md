# 指示書150: モンスターの固有ドット絵（確定後は固有画像）

日付: 2026-11-28
ブランチ: monster-sprites-v3
根拠: [指示書144](144-monster-race-sprites.md)の後続。144で用意した固有画像の仕組み（MONSTER_SPRITES、初期状態は空）に、114体分の固有画像を登録する。

## 1. 目的

戦闘画面で、確定（identified）した敵を種族画像ではなくモンスターごとの固有ドット絵で表示する。未確定の間は従来どおり種族画像を使う。

## 2. 画風・アセット

- 114体、各1枚。原画は art-src/monster-sprites-v3/<モンスターID>.png（manifest.json に Notion 由来のメタデータ）。
- 形式は144の種族画像と同じ: 48×48、グレー4値（0／85／170／255）のみ、背景透明。色付けは144の階層テーマ用フィルターをそのまま使う。
- ファイル名（ID）は data/notion-monsters.json の userDefined:ID、dist/monster-data.js の ENEMIES[].id と114件すべて一致している（照合済み）。

## 3. 配置

- 原画114枚を dist/assets/monsters/<ID>.png へそのままコピーする（拡大原画・シート類は含めない）。
- 種族画像10枚（dist/assets/monsters/unknown/）は残し、上書きしない。
- dist/game.js の MONSTER_SPRITES に ENEMIES の全114 ID を登録する。

## 4. 表示の優先順（144のまま）

1. identified かつ MONSTER_SPRITES に ID がある → assets/monsters/<ID>.png
2. それ以外 → 種族画像 assets/monsters/unknown/<種族ファイル>
3. 読み込み失敗 → その列は従来の枠＋icon文字

未確定の間は、固有画像があっても種族画像を使い、ID・確定名を src・alt・title 等に出さない。

## 5. テスト

- tests/monster-sprites.cjs: 全114 ID が MONSTER_SPRITES に登録され、ENEMIES と過不足なく一致すること。各 PNG が存在し、原画とバイト一致し、48×48・グレー4値・透明背景であること。未確定は種族画像、確定は固有画像になること。固有画像の読み込み失敗と未知の race のフォールバックを引き続き検証する。
- tests/enemy-display-browser.py: 確定済みの列は固有画像、未確定の列は種族画像のパスであることを確認する。未確定の列の HTML にIDが出ないこと、固有画像の読み込み失敗時に枠＋icon文字へフォールバックすることを確認する。検証の強さは落とさない。

## 6. 文書・MANIFEST

- data/README.md の種類数（108→114）、SPECIFICATION・ARCHITECTURE の画像の記述を現状に合わせる。
- MANIFEST.sha256 を、MANIFEST 自身を除く全追跡ファイル（26e551e で追加した art-src/monster-sprites-v3/ を含む）で再生成する。
- docs/devlog/reports/150.md を作成し、docs/devlog/TIMELINE.md に150の行を追加する。

## 7. 対象外

- 図書館での画像表示。
- 守護者の待機表示（pendingBoss の☠の枠）。
- 画像の再生成・描き直し、表示位置・大きさ・色付けの変更。
- セーブ形式の変更はない。
