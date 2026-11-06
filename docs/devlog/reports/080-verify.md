# 080 ライブ検証記録

- 統合: hold/080 を main へ fast-forward 統合（main 2d4e567）。075-shots の再生成差分はブランチ時点で除外済みで、main との差分はなかった。
- GitHub Actions: push 直後の実行（42312720601）が正常に完了（success）。CI の検証ステップも合格。
- ライブ検証（2026-11-07 08:3x JST）: 公開サイト https://ggb622y6vj-coder.github.io/dungeonsweeper/ の game.js／spells.js／monsters.js／monster-data.js／weapons.js／library.js／index.html を取得し、統合済み dist と sha256 が全7ファイル一致することを確認した。
- ライブ画面のスクリーンショットは、検証環境の Chromium が外部サイトへ接続できないため未取得（従来どおり）。図書館の各タブの画面確認は統合前のローカル検証で実施済み（080.md に記録）。
