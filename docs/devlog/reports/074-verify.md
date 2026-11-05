# 074 検証記録 (2026-11-05 JST)

対象: `hold/074`（origin/main 78d47d6 基点）

## 結果
- `tests/*.cjs` 全31本: PASS。
- `python3 scripts/compile-monsters.py --check`: PASS（95種）。
- `node scripts/sim/selftest.cjs`: PASS。
- `tests/library-spell-tabs-browser.py`: Chromium 1280px／390pxともPASS。職業フィルタ、既定魔法使い、クリック／Enter／Space、`aria-selected`、発見済み／未発見、詳細、スクロール先頭復帰、JSエラーなし、横はみ出しなしを確認。
- 関連既存 `tests/town-keys-browser.py`: Chromium 1280px／390pxともPASS。上位タブQ/E・方向キー、一覧、詳細、Escを確認。
- 関連既存 `tests/training-browser.py`: Chromium 1280px／390pxともPASS。図書館の開閉・切替・一覧・スクロール・横はみ出し・JSエラーなしを確認。
- 新ブラウザテストを旧ビルド origin/main 78d47d6 に対して実行し、下位タブ不在で期待どおりFAIL。新ビルドのみPASSを確認。
- `MANIFEST.sha256`: 再生成後に `shasum -a 256 -c` で全件OK。

## 目視確認
- `074-shots/library-spell-tabs-1280.png`
- `074-shots/library-spell-tabs-390.png`

両幅で上位タブと下位タブが区別でき、職業別一覧と詳細が収まり、横方向の崩れがないことを確認した。

## 非変更範囲
呪文・モンスター・アイテムのデータ、ゲームバランス、Notion同期データ、セーブ形式は変更していない。push・main統合・公開は未実施。
