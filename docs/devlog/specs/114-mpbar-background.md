# 指示書114: MPバーの背景に青系トークンを戻す（C-02）

> 2026-11-17 にユーザーが承認し、実装担当に Codex を指定した。Muse の解釈提示をユーザーが承認済み。

## 背景と決定
- Fable の CSS 整理（6e4d763、main へ統合済み）で、`.mpbar` の背景が整理前の `#111e20`（青みのある暗色）から `--gray-24`（#19211c）へ寄せられ、`.hpbar` の背景と同色になった。
- ChatGPT レビューの任意改善 C-02（中優先度）：MP が 0 に近いとき充填が見えず、HP バーとの区別が弱まる。枠（--teal-45）・文字・充填の青は残っているため識別自体は失われていない。不具合修正ではなく見やすさの改善。
- ユーザーが 2026-11-17 に本件を指示書114とすることを決定。

## 解釈（承認済み）
- 整理前の値 `#111e20` をそのまま新しいパレットトークンとして :root に追加し、`.mpbar` の background だけを差し替える。色味の新規調整はしない。
- トークン名は既存の「系統＋明度」命名に従う。#111e20 は色相180°の青緑系で明度約10のため `--teal-10` とする（既存 teal は --teal-45:#405c62、--teal-93:#d3edf2）。

## 仕様
### 変更するもの（dist/index.html のみ）
1. 11行目の teal 系トークン列の先頭に `--teal-10:#111e20;` を追加する（系統のまとまりと明度の昇順を維持）。
2. 107行目の `.mpbar` 規則で `background:var(--gray-24)` を `background:var(--teal-10)` に変更する。その規則の他の宣言は変更しない。

### 変更しないもの
- `.hpbar` を含む他のすべての規則、:root の既存トークン。
- JS・データ・セーブ形式。tests/css-structure.cjs の通過を維持する（新トークンは .mpbar で使用されるため未使用トークン検査にも触れない）。

## 検証
- `node tests/game.cjs`：全 PASS（css-structure.cjs を含む）。
- `tests/*-browser.py`：47/47 PASS。
- 実画面の computed style：`.mpbar` の background-color が rgb(17, 30, 32) に戻り、`.hpbar` の background-color は rgb(25, 33, 28) のまま不変であること。
- compile-monsters --check、sim selftest、Notion 同期テスト：PASS。MANIFEST.sha256 は Muse がコミット時に再生成する。
