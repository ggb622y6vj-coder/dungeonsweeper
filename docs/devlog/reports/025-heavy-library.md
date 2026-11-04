# 025 町に図書館（モンスター図鑑・アイテム図鑑） 報告

- コミット: b9cb093（main に push 済み）
- モデル: gpt-6-astra（reasoning high）、1回目で成功、リトライなし、所要 約6分（12:46〜12:53 JST）
- Codexログ: report/codex025.log

## 変更ファイル
- 新規: dist/library.js（記録・UI）、tests/library.cjs
- 変更: dist/game.js（ensureLibrary、購入・宝箱・ドロップで recordLibraryItem、セーブに library）、dist/monsters.js（勝利時 recordLibraryVictory）、dist/items.js、dist/index.html（町メニュー「図書館」、#librarydialog・2タブ、リセット文言に「図鑑」）、scripts/sim/harness.cjs・tests/training.cjs・tests/game.cjs（library.js の読み込み追加のみ）、tests/training-browser.py（図書館の開閉・両タブ・記録チェックを追加）、README.md、docs/HANDOFF.md、docs/SPECIFICATION.md、MANIFEST.sha256
- 補足: 装備52品を収集率の対象にし、薬5品はアイテムタブに別枠で表示（タブ内は57件）。「冒険データをリセット」では図鑑も消える（全滅・キャラ抹消では消えない）。

## テスト
- tests/*.cjs 全 PASS（library.cjs 6ブロック含む）
- compile-monsters.py --check: 88 monster definitions validated
- sim selftest PASS
- training-browser.py: Chromium 1280px / 390px とも PASS（図書館 空/記録あり・開閉・両タブ・Esc・リロード保持）
- 既存の assert の変更・削除なし（tests の差分は追加と読み込みファイル追加のみ）。復元作業なし。
