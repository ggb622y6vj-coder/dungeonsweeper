"""062: 魔物いきれ / 火車髑髏 in the library at 1280 and 390 px.
Run: /tmp/pyv/bin/python tests/new-monsters-browser.py [http://127.0.0.1:8000/]
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome_path = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome',
) if Path(p).exists()), None)

with sync_playwright() as p:
    options = {'headless': True, 'args': ['--no-sandbox']}
    if chrome_path:
        options['executable_path'] = chrome_path
    browser = p.chromium.launch(**options)
    for width in (1280, 390):
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(url)
        page.evaluate("localStorage.removeItem('ash-v1')")
        page.reload()
        page.evaluate('''s.library.monsters={gas:{count:1,seen:true,identified:true},kashadokuro:{count:0,seen:true,identified:true}};
          s.library.monsterIdentifyVersion=1;save();''')
        page.reload()
        page.locator('#libraryopen').click()
        assert page.locator('#libraryprogress').inner_text().startswith('モンスター 2/96'), page.locator('#libraryprogress').inner_text()
        heads = page.evaluate('''(()=>{let h='',o={};for(const e of document.querySelector('#librarybody').children){
          if(e.tagName==='H3')h=e.textContent;const k=e.dataset&&e.dataset.libraryEntry;if(k)o[k]=h;}return o})()''')
        assert heads['monster-gas'] == '2F' and heads['monster-kashadokuro'] == '9F', heads
        for key, name, floor in (('gas', '魔物いきれ', '2F・3F'), ('kashadokuro', '火車髑髏', '9F・10F')):
            e = page.locator(f'[data-library-entry="monster-{key}"]')
            e.scroll_into_view_if_needed()
            assert e.locator('h4').inner_text().startswith(name)
            assert floor in e.locator('dd').all_inner_texts(), e.locator('dd').all_inner_texts()
            box = e.bounding_box()
            assert box and box['x'] >= 0 and box['x'] + box['width'] <= width + 1, (width, box)
        assert '炎半減' in page.locator('[data-library-entry="monster-kashadokuro"]').inner_text()
        assert page.evaluate('document.documentElement.scrollWidth') <= width
        assert not errors, errors
        context.close()
    browser.close()
print('PASS new-monsters Chromium 1280/390px: 魔物いきれ 2F・3F, 火車髑髏 9F・10F, 2/96, no overflow, no JS errors')
