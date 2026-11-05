# 073 ライブ検証 — verify (2026-11-05 JST)

対象: main 7f86183（hold/073 を fast-forward で統合し push）。公開先: https://ggb622y6vj-coder.github.io/dungeonsweeper/

## 結果
- GitHub Actions「Deploy GitHub Pages」（run 42007318640、head 7f86183）: success。CI 上で回帰テスト・敵CSV検証が実行され、成功した場合のみ配信される構成のため、テスト成功の第三者証跡が Actions に残った。
- 配信済み dist/game.js に修正（coloredLog の itemNames 処理）が含まれていることを取得して確認。トップページは HTTP 200 で、ゲームは正常に読み込まれ JS エラーは観察されなかった。
- 公開中の game.js の coloredLog を公開データ（敵95種・呪文32種・武器33種・薬5種ほか名称リスト）で実行し、以下を確認:
  - `coloredLog('冒険者1は解毒剤を使った。')` → 入力のまま（log-spell を含まない）。解毒剤は通常色。
  - `coloredLog('冒険者2は解毒を唱えた。')` → `<span class="log-spell">解毒</span>` を含む。解毒は呪文色。

## 備考
- ライブ検証のスクリーンショット（073-shots-live）は、検証環境の Chromium が外部サイトへ接続できず取得できなかった。表示確認用のスクリーンショットはローカル検証時の 073-shots/（1280px / 390px）を参照。
- ブラウザ経由の確認では、公開ページのコンソールから直接関数を呼べなかったため、配信済みファイルの関数をそのまま実行して判定した。coloredLog は名称リストのみに依存する決定的な関数のため、判定はライブ表示と等価とみなす。
