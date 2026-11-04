# 023g 検証 (7b91da1) — OK
- verify-clone で git fetch → origin/main を checkout、HEAD=7b91da1、作業ツリーはクリーン
- 差分: tests/training-browser.py と MANIFEST.sha256 のみ。ゲームコード(dist/)の変更なし。docsの変更もなし
- Chromeを探す順: CHROME_PATH → /usr/bin/chromium → /usr/bin/google-chrome → /usr/bin/chromium-browser → どれもなければ executable_path を指定せず Playwright 同梱のブラウザ。指示どおり
- 無改変で実行（/tmp/pyv、CHROME_PATH 未設定、クリーンな dist をローカルで配信）: google-chrome を自動選択、1280px・390px とも PASS（幅2つはスクリプト内のループ）
- CHROME_PATH=/nonexistent/chrome: 「Failed to launch chromium because executable doesn't exist at /nonexistent/chrome」で rc=1。はっきり失敗する（フォールバックはしないが、指定した値を優先する挙動として妥当）
- node tests/*.cjs 全PASS、compile-monsters.py --check PASS、selftest PASS
- 補足: 同梱ブラウザへのフォールバックは未検証（この環境には /usr/bin/google-chrome があり、/tmp/pyv で playwright install もしていないため）
- todo/023g は確認時点ですでに done/ に移動済み
