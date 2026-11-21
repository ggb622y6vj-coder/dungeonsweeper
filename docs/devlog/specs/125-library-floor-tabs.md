# 指示書125：図書館モンスター階タブの1行化（横スクロール）と高さ縮小

- 日付：2026-11-22
- 起点：ユーザーの依頼（2026-11-22）「図書館のモンスターの階層のボタンが大きすぎて表示領域を潰している。階層のボタンを1列にし、スマホなどの狭い画面だと横方向にスワイプして選択できるようにする。少しだけ階層のボタンの高さを縮める」
- 解釈（ユーザーが承認済み、担当は Codex）：
  - 対象はモンスタータブの階ボタン（`#library-monster-tabs`、1〜10）のみ。アイテム種別タブ（`#library-item-tabs`）・呪文タブ（`#library-spell-tabs`）と、共有クラス `.library-spell-tabs` の基本規則は変更しない。
  - 狭い画面（max-width:700px）で現在の5列×2段グリッドをやめ、1行に並べて横スクロール（スワイプ）で選択できるようにする。
  - ボタンの高さを少しだけ縮める：狭い画面の min-height 40px → 36px。
  - 広い画面（701px以上）は現行のまま（1行・等分・min-height 36px）。
  - 変更は CSS のみ（dist/index.html）。JS・データ・セーブの変更なし。

## 現行実装

dist/index.html の `@media (max-width:700px)` 内に次の2規則がある：

- `#library-monster-tabs{display:grid;grid-template-columns:repeat(5,1fr)}`
- `#library-monster-tabs button{min-height:40px}`

基本規則（全幅）：

- `.library-spell-tabs{display:flex;gap:6px;margin:0 0 10px;padding:4px;border:1px solid var(--line);border-radius:7px;background:var(--gray-24)}`
- `.library-spell-tabs button{flex:1;min-width:0;min-height:36px;padding:5px;font-size:13px}`
- 選択中は `.library-spell-tabs [aria-selected="true"]{...}` で表示される。

## 変更内容

`@media (max-width:700px)` 内の上記2規則を、次の趣旨に置き換える。CSS 運用（1行1規則、不透明色は `:root` パレット経由、新しい色は使わない）を守ること。

1. `#library-monster-tabs`：display を flex にし、折り返しなし（`flex-wrap:nowrap`）、横方向のオーバーフローをスクロール可能（`overflow-x:auto`）にする。gap・padding・margin・枠・背景は基本規則のまま（この規則で再宣言しない）。
2. `#library-monster-tabs button`：`flex:0 0 auto`（等分しない）、min-width は「10」が潰れず読める値（44px を目安。padding 込みで2桁が収まること）、`min-height:36px`。

- スクロールバーの表示は OS／ブラウザの既定どおりとし、隠す指定は入れない。
- 選択中タブの見た目（`[aria-selected="true"]`）は基本規則のまま。

## 対象外

- アイテム種別タブ・呪文タブのレイアウト変更
- 広い画面（701px以上）のレイアウト変更
- dist/library.js の変更、タブのキーボード操作・フォーカス挙動の変更
- 選択中タブへの自動スクロール（scrollIntoView 等）は入れない

## テスト

- tests/120-library-display-browser.py に、390px での階タブの確認を追加する：全ボタンが1行に並ぶ（offsetTop が同一）、コンテナが横スクロール可能（scrollWidth > clientWidth）、ボタンの高さが36px、末尾（10F）のボタンまでスクロールしてクリックでき、その階の一覧が表示されること。1280px の既存確認は維持する。
- tests/css-structure.cjs が引き続き合格すること。規則数の下限などテスト側の期待値と食い違う場合は、期待値を緩めるのではなく理由を報告に明記すること（正当な規則増減なら追従可）。
- `node tests/game.cjs` 全体が合格すること。

## 記録

- docs/devlog/reports/125.md を作成し、docs/devlog/TIMELINE.md に125の行を追加する。日付は 2026-11-22 とする。
- 報告は日本語で簡潔に。実装と検証を区別して書くこと。
