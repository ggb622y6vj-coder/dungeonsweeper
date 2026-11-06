"""059: library monster tab shows confirmed names only for spell-identified monsters.
Run: /tmp/pyv/bin/python tests/library-identify-browser.py [http://127.0.0.1:8000/]
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
output = Path(os.environ.get('LIBRARY_IDENTIFY_SCREENSHOT_DIR', '/tmp/library-identify-browser'))
output.mkdir(parents=True, exist_ok=True)


def entry(page, key):
    return page.locator(f'#librarybody [data-library-entry="monster-{key}"]')


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
        page.evaluate('''[1,0,2].forEach((job,i)=>{
          const r=generateRecruit('ABC'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true);
        });render();''')
        # Real flow: encounter, cast 識別 on all rows with mixed fixed rolls, then flee (no kill).
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        page.evaluate('''s.pendingStairs=false;s.pendingBoss=null;s.members.forEach(m=>m.intelligence=0);s.mp[0]=20;
          s.enemy={dataVersion:1,units:[{...makeEnemy('slime',91),row:17,hp:999},{...makeEnemy('wolf',92),row:28,hp:999}],
            initiative:'normal',flagEffect:{}};s.enemy.units.forEach(e=>e.identified=false);recordLibraryEncounter(s.enemy);
          const r=Math.random;try{const rolls=[0,.99];Math.random=()=>rolls.shift();castMagic(0,'identifyfoe',null)}finally{Math.random=r}
          s.library.monsters.rat={count:3,firstFloor:1,seen:true};s.enemy=null;''')
        page.wait_for_function('!logBusy()')
        page.evaluate('enterTown();save()')
        page.wait_for_function('!logBusy()')
        assert page.evaluate("s.area") == 'town'
        page.reload()
        assert page.evaluate('s.library.monsters.slime.identified===true&&!s.library.monsters.slime.count')
        assert page.evaluate('!s.library.monsters.wolf.identified&&s.library.monsters.wolf.seen')
        page.locator('#libraryopen').click()
        # identified slime (0 kills) counts; seen wolf and killed-but-unidentified rat do not.
        assert page.locator('#libraryprogress').inner_text().startswith('モンスター 1/96 ')
        slime = entry(page, 'slime')
        slime.scroll_into_view_if_needed()
        assert slime.locator('h4').inner_text() == 'スライム'
        sub = slime.locator('.library-subtext')
        assert sub.inner_text() == page.evaluate("enemyDefinition('slime').unknown")
        assert '不確定名' not in slime.inner_text() and '確定名' not in slime.inner_text()
        assert sub.bounding_box()['y'] >= slime.locator('h4').bounding_box()['y'] + slime.locator('h4').bounding_box()['height'] - 1
        assert float(sub.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')) < float(slime.locator('h4').evaluate('e=>parseFloat(getComputedStyle(e).fontSize)'))
        assert '撃破数' in slime.inner_text() and '0体' in slime.inner_text()
        page.screenshot(path=str(output / f'identified-{width}.png'))
        for key, kills in (('wolf', '0体'), ('rat', '3体')):
            e = entry(page, key)
            assert e.locator('h4').inner_text() == page.evaluate(f"enemyDefinition('{key}').unknown")
            assert e.locator('.library-subtext').count() == 0
            assert e.locator('dt').all_inner_texts() == ['撃破数'] and e.locator('dd').inner_text() == kills
        assert entry(page, 'goblin').locator('h4').inner_text() == '？？？'
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        slime.click()
        assert page.locator('#librarydetaildialog').count() == 0
        detail = slime
        assert detail.locator('.library-subtext').inner_text() == sub.inner_text()
        assert detail.locator('dt').count() > 1
        page.screenshot(path=str(output / f'detail-{width}.png'))
        assert not errors, errors
        print(f'PASS library-identify Chromium {width}px: spell reveal after flee, unknown-only entries, subtext, reload; no JS errors')
        context.close()
    browser.close()
