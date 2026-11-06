"""074: 図書館の呪文を魔法使い／僧侶の下位タブで分ける。
Run: python3 tests/library-spell-tabs-browser.py [http://localhost:8000/]
Screenshots: LIBRARY_SPELL_TABS_SCREENSHOT_DIR (default /tmp/library-spell-tabs-browser)
"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
out = Path(os.environ.get('LIBRARY_SPELL_TABS_SCREENSHOT_DIR', '/tmp/library-spell-tabs-browser'))
out.mkdir(parents=True, exist_ok=True)
chrome = os.environ.get('CHROME_PATH') or next((x for x in (
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/chromium',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser') if Path(x).exists()), None)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=chrome, args=['--no-sandbox'])
    for width in (1280, 390):
        ctx = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
        page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.evaluate("""()=>{
          const mage=generateRecruit('魔術師',1), priest=generateRecruit('僧侶',2);
          registerRecruit(mage); registerRecruit(priest);
          s.library.spells[MAGIC.find(x=>x.job===1).id]=true;
          s.library.spells[MAGIC.find(x=>x.job===2).id]=true;
          save();
        }""")
        page.locator('#libraryopen').click(); page.locator('#librarytab-spells').click()
        sub = page.locator('#library-spell-tabs')
        assert sub.is_visible()
        assert page.locator('#libraryspelltab-1').get_attribute('aria-selected') == 'true'
        assert page.locator('#libraryspelltab-2').get_attribute('aria-selected') == 'false'
        assert page.locator('#librarybody .library-entry').count() == page.evaluate('MAGIC.filter(x=>x.job===1).length')
        assert page.locator('#librarybody .library-entry').evaluate_all("""els=>els.every((e,i)=>e.dataset.libraryEntry==='spell-'+MAGIC.filter(x=>x.job===1).sort((a,b)=>a.level-b.level)[i].id)""")
        assert page.locator('#librarybody h3').all_text_contents() == page.evaluate("[...new Set(MAGIC.filter(x=>x.job===1).sort((a,b)=>a.level-b.level).map(x=>'Lv.'+x.level))]")
        assert '習得レベル' not in page.locator('#librarybody dt').all_text_contents()
        mage_known = page.locator('#librarybody .library-entry:has(dl)').first
        assert mage_known.locator('h4').inner_text() != '？？？'
        before = mage_known.inner_text()
        mage_known.click()
        assert page.locator('#librarydetaildialog').count() == 0
        assert mage_known.inner_text() == before
        assert mage_known.get_attribute('role') is None

        page.locator('#librarybody').evaluate('(e)=>e.scrollTop=e.scrollHeight')
        page.locator('#libraryspelltab-2').click()
        assert page.locator('#librarybody').evaluate('(e)=>e.scrollTop') == 0
        assert page.locator('#libraryspelltab-1').get_attribute('aria-selected') == 'false'
        assert page.locator('#libraryspelltab-2').get_attribute('aria-selected') == 'true'
        assert page.locator('#librarybody .library-entry').count() == page.evaluate('MAGIC.filter(x=>x.job===2).length')
        assert page.locator('#librarybody .library-entry').evaluate_all("""els=>els.every((e,i)=>e.dataset.libraryEntry==='spell-'+MAGIC.filter(x=>x.job===2).sort((a,b)=>a.level-b.level)[i].id)""")

        page.locator('#libraryspelltab-1').focus(); page.keyboard.press('Enter')
        assert page.locator('#libraryspelltab-1').get_attribute('aria-selected') == 'true'
        page.locator('#libraryspelltab-2').focus(); page.keyboard.press('Space')
        assert page.locator('#libraryspelltab-2').get_attribute('aria-selected') == 'true'
        priest_known = page.locator('#librarybody .library-entry:has(dl)').first
        priest_known.click()
        assert page.locator('#librarydetaildialog').count() == 0
        assert priest_known.locator('dl').count() == 1

        page.evaluate("s.library.items=Object.fromEntries([...WEAPONS,...MEDICINES].map(w=>[w.id,true]))")
        page.locator('#librarytab-items').click()
        assert not sub.is_visible()
        assert page.locator('#library-item-tabs').is_visible()
        for kind in ('weapon', 'head', 'body', 'feet', 'medicine'):
            page.locator('#librarybody').evaluate('(e)=>e.scrollTop=e.scrollHeight')
            page.locator('#libraryitemtab-'+kind).click()
            assert page.locator('#librarybody').evaluate('(e)=>e.scrollTop') == 0
            assert page.locator('#libraryitemtab-'+kind).get_attribute('aria-selected') == 'true'
            assert page.locator('#libraryitemtab-'+kind).evaluate('(e)=>e.tabIndex') == 0
            assert page.locator('#librarybody .library-entry').evaluate_all("""(els,kind)=>{
              const items=[...WEAPONS,...MEDICINES].filter(w=>(w.kind==='medicine'?'medicine':w.part||'weapon')===kind);
              return els.length===items.length&&els.every((e,i)=>e.dataset.libraryEntry==='item-'+items[i].id);
            }""", kind)
            assert '種類' not in page.locator('#librarybody dt').all_text_contents()
            assert '職業' in page.locator('#librarybody dt').all_text_contents()
            assert '基準価格' not in page.locator('#librarybody').inner_text()
            if kind == 'weapon':
                assert page.locator('#librarybody .library-entry').evaluate_all("""els=>els.every(e=>{
                  const w=weapon(e.dataset.libraryEntry.slice(5));
                  return e.querySelector('h4 .ailment-tag').textContent===(w.range==='ranged'?'遠距離':'近距離')&&
                    !/近距離|遠距離/.test(e.querySelector('dl').textContent);
                })""")
            else:
                assert page.locator('#librarybody h4 .ailment-tag').count() == 0
            assert page.locator('#librarydialog').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
        page.locator('#libraryitemtab-weapon').focus(); page.keyboard.press('ArrowRight')
        assert page.locator('#libraryitemtab-head').get_attribute('aria-selected') == 'true'
        page.locator('#libraryitemtab-body').focus(); page.keyboard.press('Enter')
        assert page.locator('#libraryitemtab-body').get_attribute('aria-selected') == 'true'
        page.locator('#libraryitemtab-feet').focus(); page.keyboard.press('Space')
        assert page.locator('#libraryitemtab-feet').get_attribute('aria-selected') == 'true'

        assert page.locator('#librarydialog').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors, errors
        page.locator('#librarydialog').screenshot(path=str(out / f'library-spell-tabs-{width}.png'))
        print(f'PASS library spell tabs Chromium {width}px: job filters, discovery/details, click/Enter/Space, aria, scroll reset, no errors/overflow')
        ctx.close()
    browser.close()
