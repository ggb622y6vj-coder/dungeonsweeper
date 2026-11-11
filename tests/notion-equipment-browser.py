"""102: 新規9装備を図鑑の武器・頭・胴タブで確認する。
Run: python3 tests/notion-equipment-browser.py [http://localhost:8000/]
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
ITEMS = {
    'weapon': {'poisonsw': '塗毒の小刀', 'poisonsw2': '塗毒の隠し刀',
               'poisonsw3': '猛毒の隠し刀', 'atkstaff': '吸魂の杖',
               'atkmace': '吸魂のメイス', 'bloodsac': '血の代償'},
    'head': {'helmetsac': '代わり身の兜', 'headlight': 'ヘッドライト'},
    'body': {'chestsac': '代わり身の胸当て'},
}
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome',
) if Path(p).exists()), None)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=chrome, args=['--no-sandbox'])
    for width in (1280, 390):
        context = browser.new_context(viewport={'width': width, 'height': 900})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.evaluate("ids=>{for(const id of ids)recordLibraryItem(id);save()}",
                      [item for group in ITEMS.values() for item in group])
        page.reload()
        page.locator('#libraryopen').click()
        page.locator('#librarytab-items').click()
        seen = set()
        for kind, items in ITEMS.items():
            page.locator('#libraryitemtab-' + kind).click()
            for item, name in items.items():
                entry = page.locator('[data-library-entry="item-' + item + '"]')
                assert entry.count() == 1, item
                entry.scroll_into_view_if_needed()
                assert entry.is_visible(), item
                assert name in entry.locator('h4').inner_text()
                description = page.evaluate('id=>weapon(id).desc', item)
                assert description in entry.inner_text(), item
                assert '追加効果' in entry.inner_text(), item
                assert '迷宮限定' in entry.inner_text(), item
                seen.add(item)
        assert len(seen) == 9
        assert not errors, errors
        print(f'PASS 102 Chromium {width}px: all 9 new items and descriptions, persisted discovery')
        context.close()
    browser.close()
