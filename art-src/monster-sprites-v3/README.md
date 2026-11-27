# モンスター固有画像（v3）

Codex CLI の imagegen で生成し、指示書144と同じ形式へ変換した固有モンスター画像です。戦闘中の実行時アセットではなく、実装用のソース置き場です。

## 形式

- 114体、各1枚。ファイル名はモンスターID（`userDefined:ID`）と一致し、`<id>.png` です。
- 48×48、グレー4値（0 / 85 / 170 / 255）のみ、背景は透明です。指示書144の種族画像と同じ制約です。
- `_x12` や `_hires` などの拡大原画は含めていません。

## 実行時の配置（まだこのブランチでは行っていません）

現行の読み込みは `dist/game.js` の `enemySpritePath` です。

1. 個体が identified で、かつ ID が `MONSTER_SPRITES` にあるとき → `dist/assets/monsters/<id>.png`
2. それ以外 → 種族画像 `dist/assets/monsters/unknown/<種族ファイル>`

`MONSTER_SPRITES` は現状空の `Set` です。固有画像を有効にするには、このフォルダの PNG を `dist/assets/monsters/` へコピーし、全114の ID を `MONSTER_SPRITES` に登録する必要があります。種族画像10枚（`dist/assets/monsters/unknown/`）はそのまま残します。`dist/` はビルド出力ではなく、リポジトリにコミットされているゲーム本体です。

## メタデータ

`manifest.json` は Notion のモンスター画像プロンプトDBから、各ファイルについて次の項目を載せています。

- `id`（userDefined:ID）
- `名前`
- `種族`
- `出現階`
- `守護者`（`__YES__` / `__NO__`）
- `ファイル名`

114件の ID・名前・種族は、`data/notion-monsters.json` および `dist/monster-data.js` の `ENEMIES[].id` と一致しています。
