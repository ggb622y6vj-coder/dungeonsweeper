"""077: 鍛冶屋タブと購入モーダルの回帰検証。"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
out = Path(os.environ.get('SHOP_TABS_SCREENSHOT_DIR', '/tmp/shop-tabs-browser'))
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
          for(const job of [0,1]){const r=generateRecruit('冒険者',job);registerRecruit(r);changeRecruitParty(r.members.id,true)}
          s.gold=10000;render();
        }""")
        page.locator('#blacksmith').click()
        for tab in ('weapon','head','body','feet'):
            page.locator('#shoptab-'+tab).click()
            actual = page.locator('#shopitems [data-buy]').evaluate_all('(els)=>els.map(e=>e.dataset.buy)')
            expected = page.evaluate("WEAPONS.filter(w=>w.shop!==false&&(w.part||'weapon')===shopTab&&w.classes.includes(jobOf(+$('#shopmember').value))).map(w=>w.id)")
            assert actual == expected
            assert page.locator('#shoptab-'+tab).get_attribute('aria-selected') == 'true'
        page.locator('#shopmember').select_option('1')
        assert page.evaluate('shopTab') == 'feet'
        page.locator('#shopclose').click(); page.locator('#blacksmith').click()
        assert page.evaluate('shopTab') == 'weapon'
        page.locator('#shoptab-weapon').focus(); page.keyboard.press('e')
        assert page.evaluate('shopTab') == 'head'
        page.locator('#shopmember').select_option('0')
        page.clock.install()
        page.clock.pause_at(page.evaluate('Date.now()'))
        before = page.evaluate('({gold:s.gold,count:s.inventory[0].length})')
        page.locator('[data-buy="helm"]').click()
        popup = page.locator('#shoppurchasedialog')
        assert popup.is_visible() and popup.evaluate("e=>e.matches(':modal')")
        assert page.locator('#shoppurchasemessage').inner_text() == page.evaluate("`${NAMES[0]}が${weapon('helm').name}を購入した。`")
        assert page.evaluate('s.gold') == before['gold']-page.evaluate("weapon('helm').price")
        assert page.evaluate('s.inventory[0].length') == before['count']+1
        page.keyboard.press('Escape'); page.keyboard.press('e'); page.keyboard.press('Enter')
        assert popup.is_visible() and page.evaluate('shopTab') == 'head'
        # A real pointer event on the background is intercepted by the modal backdrop.
        box = page.locator('#shopclose').bounding_box()
        page.mouse.click(box['x']+box['width']/2,box['y']+box['height']/2)
        assert popup.is_visible() and page.locator('#shopdialog').is_visible()
        page.clock.run_for(499); assert popup.is_visible()
        page.clock.run_for(1); assert not popup.is_visible()
        page.locator('#shoptab-body').click()
        assert page.evaluate('shopTab') == 'body'
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors, errors
        page.locator('#shopdialog').screenshot(path=str(out / f'shop-tabs-{width}.png'))
        print(f'PASS shop tabs Chromium {width}px: classification, keyboard, modal blocking, 500ms, resume')
        ctx.close()
    browser.close()
