# 077 検証記録（2026-11-06 JST）

対象：`main` 0c45df0（b7401e0 から fast-forward 統合。077 の変更1〜4とレビュー対応記録を含む）

## 統合と CI
- `hold/077` を push 後、main へ fast-forward 統合して push した（マージコミットなし）。
- 統合前に、テスト実行で再生成されていた075の検証用スクリーンショット4枚（077とは無関係な差分）をブランチ上で main の状態へ戻した。ChatGPT レビューの推奨（優先度「低」）に沿ったもので、統合差分に 075-shots の変更は含まれていない。
- GitHub Actions「Deploy GitHub Pages」run 42220449466 が success。テスト実行と公開デプロイの第三者証跡とする。

## ローカル検証（統合対象コードで実施）
- `tests/*.cjs` 全33本：PASS（到着ログ・テーマ帯の回帰は tests/elevator.cjs、鍛冶屋タブは新規 tests/shop-tabs.cjs、図書館は tests/library.cjs／library-identify.cjs）。
- ブラウザテスト全34本：Chromium 1280px／390px とも PASS（新規 tests/shop-tabs-browser.py を含む）。
- `python3 scripts/compile-monsters.py --check`：PASS（95種）。シミュレーション自己テスト：PASS。
- 画面確認（docs/devlog/reports/077-shots/）：全テーマ帯（町・1F・2F・4F・6F・8F・10F＋赤帯の低HP状態・390px）、鍛冶屋タブ、購入ポップアップ、図書館一覧を実ブラウザで確認した。
- ChatGPT レビューの追加確認（ポップアップ表示中のキー入力遮断、閉じた後のフォーカス継続）も実ブラウザで確認し、問題なかった（詳細は 077.md）。
- `MANIFEST.sha256`：統合時点で照合 OK。

## レビュー
- 統合前に ChatGPT のレビューを受け、判定は「条件付きで統合可能」、必須修正はなし。条件とされた追加確認は上記のとおり実施済み。変更1（再訪限定）・変更2（一人称ビュー対象外）の判断はいずれも妥当と評価された。

## ライブ検証（公開サイト）
- 公開サイト https://ggb622y6vj-coder.github.io/dungeonsweeper/ から取得した game.js／library.js／index.html が、統合した dist の各ファイルと sha256 で完全一致した。
- ライブのコードに077の要素が含まれることを確認した：到着ログ「地下N階に到着した。」（階段・昇降機の2経路）、テーマ切替（data-floor-theme）、鍛冶屋の購入ポップアップ（shoppurchasedialog）。図書館の詳細ダイアログ（librarydetaildialog）はライブの index.html に存在しないことも確認した。
- ライブ画面のスクリーンショットは、検証環境の Chromium が外部サイトへ接続できないため未取得（073〜076と同様）。配信コードが検証済みコードと同一バイト列であることと、上記の含有確認をもってライブ検証とする。

## 非変更範囲
セーブキー `ash-v1`、モンスター・呪文・アイテムのデータ、ゲームバランスは変更していない。
