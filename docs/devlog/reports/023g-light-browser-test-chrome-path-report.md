# 023g report — pushed (7b91da1)
- Model: gpt-6-luna low, 1 try. Log: codex023g.log
- Change: tests/training-browser.py only. It uses CHROME_PATH if set, otherwise the first existing path among /usr/bin/chromium, /usr/bin/google-chrome and /usr/bin/chromium-browser, and falls back to Playwright's bundled browser if none exists. Assertions unchanged.
- training-browser.py (unmodified, /tmp/pyv/bin/python): with no env var and with CHROME_PATH=/usr/bin/google-chrome, 1280/390 both PASS.
- tests/*.cjs PASS, compile --check PASS, sim selftest PASS. MANIFEST regenerated. Stray tests/__pycache__ removed, not committed.
