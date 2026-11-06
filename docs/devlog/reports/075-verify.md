# 075 検証記録（2026-11-06 JST）

対象：`main` b595961（1c06532 から fast-forward 統合。075 本体＋Amendment 1・Amendment 2 を含む）

## 統合と CI
- `hold/075` を push 後、main へ fast-forward 統合して push した（マージコミットなし）。
- GitHub Actions「Deploy GitHub Pages」run 42191708439 が success。テスト実行と公開デプロイの第三者証跡とする。

## ローカル検証（統合対象コードで実施）
- `tests/*.cjs` 全32本：PASS（tests/elevator.cjs、tests/thief-disarm.cjs の Amendment 1・2 回帰テストを含む）。
- Amendment 2 の再現テストは、修正前のコードでは失敗し（罠解除で開けたマスが昇降機に選ばれ open=false に戻る）、修正後に PASS することを確認した。
- `python3 scripts/compile-monsters.py --check`：PASS（95種）。
- シミュレーション自己テスト：PASS。
- ブラウザテスト全33本：Chromium 1280px／390px とも PASS（図書館の呪文詳細に「職業」欄がないこと、盗賊だけに罠解除ボタンが出ることを含む）。
- `MANIFEST.sha256`：統合時点で照合 OK。

## ライブ検証（公開サイト）
- 公開サイト https://ggb622y6vj-coder.github.io/dungeonsweeper/ から取得した game.js と library.js が、統合した dist の同一ファイルと sha256 で完全一致した。
- ライブの game.js に罠解除（data-stat-disarm）と Amendment 2 の除外処理（placeElevator(exclude...)、checkElevatorUnlock(t)）が含まれること、ライブの library.js から呪文詳細の「職業」欄のコードが消えていることを確認した。
- ライブ画面のスクリーンショットは、検証環境の Chromium が外部サイトへ接続できないため未取得（073 と同様）。配信コードが検証済みコードと同一バイト列であることと、上記の含有確認をもってライブ検証とする。

## 非変更範囲
セーブキー `ash-v1`、モンスター・呪文・アイテムのデータ、ゲームバランスは変更していない。
