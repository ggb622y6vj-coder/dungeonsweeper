"""060: identified library monster fields, order, nF floors, ailment/other tags and CSV values.
Run: /tmp/pyv/bin/python tests/library-fields-browser.py [http://127.0.0.1:8000/]
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
output = Path(os.environ.get('LIBRARY_FIELDS_SCREENSHOT_DIR', '/tmp/library-fields-browser'))
output.mkdir(parents=True, exist_ok=True)
ORDER = ['種族', '出現階', 'HP', '物理ダメージ', '攻撃回数', '特殊能力', '使用呪文', '経験値', '撃破数']
# Spot checks straight from data/monsters.csv (HP, 物理ダメージ, 経験値, 出現階, 種族).
CSV = {'rat': ('獣', '1F', '1d6+2', '1d5', '15'), 'evileye': ('魔獣', '8F', '6d8', '1d10', '3000'),
       'daidaraboti': ('人型', '9F・10F', '15d10', '5d9', '4500')}
STYLE = 'e=>{const c=getComputedStyle(e);return [c.color,c.backgroundColor,c.borderTopColor].join()}'

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
        # Legacy-shaped records (count + firstFloor, no version) migrate to identified and render without errors.
        page.evaluate('''const r=generateRecruit('A',0);registerRecruit(r);changeRecruitParty(r.members.id,true);
          s.library.monsters={rat:{count:3,firstFloor:1},evileye:{count:1,firstFloor:8},daidaraboti:{count:2,firstFloor:10},
            slime:{count:1,firstFloor:1}};delete s.library.monsterIdentifyVersion;save();''')
        page.reload()
        page.locator('#libraryopen').click()
        assert page.locator('#librarybody h3').first.inner_text() == '1F'
        assert page.locator('#librarybody h3').all_inner_texts()[-1] == '10F'
        assert '地下' not in page.locator('#librarybody').inner_text()
        assert '初撃破階' not in page.locator('#librarybody').inner_text()
        for key, (race, floor, hp, dmg, xp) in CSV.items():
            e = page.locator(f'[data-library-entry="monster-{key}"]')
            e.scroll_into_view_if_needed()
            assert e.locator('h4').inner_text().startswith(page.evaluate(f"enemyDefinition('{key}').name"))
            assert e.locator('.library-subtext').inner_text() == page.evaluate(f"enemyDefinition('{key}').unknown")
            assert e.locator('dt').all_inner_texts() == ORDER, e.locator('dt').all_inner_texts()
            dd = e.locator('dd').all_inner_texts()
            assert dd[0] == race and dd[1] == floor and dd[2] == hp and dd[3] == dmg and dd[7] == xp, dd
            assert dd[8] == {'rat': '3体', 'evileye': '1体', 'daidaraboti': '2体'}[key]
            box = e.bounding_box()
            assert box['x'] >= 0 and box['x'] + box['width'] <= width
            page.screenshot(path=str(output / f'{key}-{width}.png'))
        tags = lambda key: page.locator(f'[data-library-entry="monster-{key}"] dd .ailment-tag')
        assert [t.inner_text() for t in tags('evileye').all()] == ['麻痺', '石化', '後衛攻撃']
        assert '30%' in page.locator('[data-library-entry="monster-evileye"]').inner_text()
        assert [t.inner_text() for t in tags('daidaraboti').all()] == ['麻痺', '後衛攻撃', '炎半減', '氷半減']
        assert tags('daidaraboti').nth(2).get_attribute('class') == 'ailment-tag ailment-other'
        assert tags('rat').first.inner_text() == '仲間呼び' and 'ailment-other' in tags('rat').first.get_attribute('class')
        # Same colours as the party-screen tags (same shared CSS classes).
        for key, kind in (('slime', 'poison'), ('evileye', 'paralysis'), ('evileye', 'stone')):
            lib = page.locator(f'[data-library-entry="monster-{key}"] dd .ailment-{kind}')
            ref = page.evaluate(f'''(()=>{{const e=document.createElement('span');e.className='ailment-tag ailment-{kind}';
              document.body.append(e);const c=getComputedStyle(e),v=[c.color,c.backgroundColor,c.borderTopColor].join();e.remove();return v}})()''')
            assert lib.evaluate(STYLE) == ref, (kind, lib.evaluate(STYLE), ref)
        other = tags('rat').first.evaluate(STYLE)
        assert other != tags('slime').first.evaluate(STYLE)
        # Tags wrap inside the entry without horizontal overflow.
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        assert page.evaluate("[...document.querySelectorAll('#librarybody dd')].every(e=>e.scrollWidth<=e.clientWidth+1)")
        page.locator('[data-library-entry="monster-daidaraboti"]').click()
        assert page.locator('#librarydetailbody dt').all_inner_texts() == ORDER
        assert page.locator('#librarydetailbody .ailment-tag').count() == 4
        page.screenshot(path=str(output / f'detail-{width}.png'))
        assert not errors, errors
        print(f'PASS library-fields Chromium {width}px: order, nF, CSV values, tags/colours, wrap, legacy firstFloor; no JS errors')
        context.close()
    browser.close()
