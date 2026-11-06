"""080 change 4: primary-floor tabs and responsive monster cards, 1280/390px."""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    options = {'headless': True, 'args': ['--no-sandbox']}
    chrome = os.environ.get('CHROME_PATH') or next((x for x in ('/usr/bin/chromium', '/usr/bin/google-chrome') if Path(x).exists()), None)
    if chrome:
        options['executable_path'] = chrome
    browser = p.chromium.launch(**options)
    for width in (1280, 390):
        context = browser.new_context(viewport={'width': width, 'height': 900})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8000/')
        page.locator('#libraryopen').click()
        tabs = page.locator('#library-monster-tabs button')
        assert tabs.all_text_contents() == [str(f) for f in range(1,11)]
        before = page.evaluate('JSON.stringify(s.library)')
        all_ids = []
        for floor in range(1,11):
            page.locator(f'#librarymonstertab-{floor}').click()
            assert tabs.evaluate_all('(es)=>es.every(e=>e.tabIndex===(e.getAttribute("aria-selected")==="true"?0:-1))')
            assert page.locator(f'#librarymonstertab-{floor}').get_attribute('aria-selected') == 'true'
            assert page.locator('#librarybody').evaluate('e=>e.scrollTop') == 0
            ids = page.locator('#librarybody .library-entry').evaluate_all('(es)=>es.map(e=>e.dataset.libraryEntry)')
            assert ids == page.evaluate('(f)=>ENEMIES.filter(d=>d.floors[0]===f).map(d=>"monster-"+d.id)', floor)
            all_ids += ids
            assert page.locator('#librarybody h3').count() == 0
            assert page.locator('#librarybody h4').all_text_contents() == ['？？？']*len(ids)
            assert page.locator('#librarybody dl').count() == 0
        assert len(all_ids) == len(set(all_ids)) == page.evaluate('ENEMIES.length')
        assert before == page.evaluate('JSON.stringify(s.library)')
        page.locator('#librarymonstertab-1').click()
        cards = page.locator('#librarybody .library-entry')
        a, b = cards.nth(0).bounding_box(), cards.nth(1).bounding_box()
        if width > 700:
            assert abs(a['y']-b['y'])<1 and b['x']>a['x']+a['width']
        else:
            assert abs(a['x']-b['x'])<1 and b['y']>=a['y']+a['height']
        page.locator('#librarymonstertab-1').focus()
        page.keyboard.press('ArrowRight')
        assert page.locator('#librarymonstertab-2').get_attribute('aria-selected') == 'true'
        for key, floor in [('End',10),('Home',1),('Space',1),('Enter',1)]:
            page.keyboard.press(key)
            assert page.locator(f'#librarymonstertab-{floor}').get_attribute('aria-selected') == 'true'
        for tab in ('items','spells'):
            page.locator('#librarytab-'+tab).click()
            assert not page.locator('#library-monster-tabs').is_visible()
            assert page.locator('#librarybody').evaluate('e=>getComputedStyle(e).display') != 'grid'
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors, errors
        context.close()
        print(f'PASS monster tabs {width}px: floors, concealment, ARIA, keyboard, layout, unchanged records')
    browser.close()
