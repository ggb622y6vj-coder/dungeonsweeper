# 078 検証記録（2026-11-06 JST）

対象：`main` 8c89299（0a92c29 から fast-forward 統合）

## 統合と CI
- `hold/078` を push 後、main へ fast-forward 統合して push した（マージコミットなし）。
- 統合前に、テスト実行で再生成されていた075の検証用スクリーンショット4枚（078とは無関係な差分）をブランチ上で main の状態へ戻し、統合差分から除外した。
- GitHub Actions「Deploy GitHub Pages」run 42223491421 が success。テスト実行と公開デプロイの第三者証跡とする。

## ローカル検証（統合対象コードで実施）
- 修正前後の実測（390px幅・Chromium、地図ダイアログ）：`.cell-number` の中心とマス中心の縦ずれは、1F で平均 +2.6px → 0.00px、3F で平均 +6.2px（最大 +10.2px）→ 平均 −0.01px になった。
- `tests/*.cjs` 全33本：PASS。ブラウザテスト全35本（新規 tests/map-cell-alignment-browser.py を含む）：PASS（1280px／390px、12×12 と 8×8 の両方で中心ずれ ±2px 以内を確認）。
- `python3 scripts/compile-monsters.py --check`：PASS（95種）。シミュレーション自己テスト：PASS。
- 画面確認（docs/devlog/reports/078-shots/）：3F・390px幅の地図ダイアログで数字・旗・現在地マスが中央に表示されることを確認した。
- `MANIFEST.sha256`：統合時点で照合 OK。

## ライブ検証（公開サイト）
- 公開サイト https://ggb622y6vj-coder.github.io/dungeonsweeper/ から取得した index.html が、統合した dist/index.html と sha256 で完全一致した。修正の CSS（`.cell` のフレックス中央配置）がライブ側に含まれることも確認した。078 のコード変更は index.html のみのため、検証対象はこのファイルで足りる。
- ライブ画面のスクリーンショットは、検証環境の Chromium が外部サイトへ接続できないため未取得（073〜077と同様）。配信コードが検証済みコードと同一バイト列であることをもってライブ検証とする。
- 実機（iPhone Safari）での表示は、ユーザーの実機確認待ちである。配置を CSS の明示的な中央揃えに変えたため、ブラウザ間の差は出にくい。

## 非変更範囲
セーブキー `ash-v1`、モンスター・呪文・アイテムのデータ、ゲームバランスは変更していない。
