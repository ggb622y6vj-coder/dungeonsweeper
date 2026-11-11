"""106: Shared item box from status/blacksmith, transfers, tabs and mobile layout.

Run against dist served at URL. Fixture setup uses production roster functions;
all box operations use the UI. Codex creates this test; Muse runs it.
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
OUT = Path(os.environ.get('ITEM_BOX_SCREENSHOT_DIR', '/tmp/item-box-browser'))
CHROME = os.environ.get('CHROME_PATH') or next((p for p in (
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'
) if Path(p).exists()), None)


def layout(page):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert page.locator('#itemboxdialog').evaluate('e=>e.scrollWidth<=e.clientWidth')
    bounds = page.locator('#itemboxdialog').bounding_box()
    assert bounds['x'] >= 0 and bounds['y'] >= 0, bounds
    assert bounds['x'] + bounds['width'] <= page.viewport_size['width'] + 1, bounds
    assert bounds['y'] + bounds['height'] <= page.viewport_size['height'] + 1, bounds


def snapshot(page):
    return page.evaluate('({box:s.itemBox,inventory:s.inventory,equipped:s.equipped,armor:s.armor,gold:s.gold})')


with sync_playwright() as p:
    options = dict(headless=True, args=['--no-sandbox'])
    if CHROME:
        options['executable_path'] = CHROME
    browser = p.chromium.launch(**options)
    OUT.mkdir(parents=True, exist_ok=True)
    for width in (1280, 390):
        context = browser.new_context(viewport=dict(width=width, height=900), has_touch=width == 390)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav')
        page.evaluate("""() => {
          for(const [name,job] of [['収納A',0],['収納B',1]]){
            const r=generateRecruit(name,job);registerRecruit(r);changeRecruitParty(r.members.id,true);
          }
          s.inventory[0]=['sword','helm','leather','boots','dagger','healingPotion'];
          s.equipped[0]=0;s.armor[0]={head:1,body:2,feet:3};
          s.itemBox=['dagger','helm','leather','boots','antidote'];render();
        }""")
        original = snapshot(page)
        page.locator('#statsopen').click()
        page.locator('[data-stat-inventory="0"]').click()
        expect(page.locator('#itemboxopen')).to_be_visible()
        page.locator('#itemboxopen').click()
        box = page.locator('#itemboxdialog')
        expect(box).to_be_visible()
        assert box.evaluate("e=>e.matches(':modal')")
        assert page.evaluate("$('#inventorydialog').open && $('#statsdialog').open && inventoryMember===0")
        expect(page.locator('#itemboxtitle')).to_have_text('アイテムボックス')
        expect(page.locator('#itemboxcapacity')).to_have_text('ボックス 5/100 · 収納Aの所持 6/10')
        expect(box.locator('[role="tab"]')).to_have_text(['武器', '頭', '胴体', '足', 'アイテム'])

        # Check each actual rendered group, including disabled equipped entries.
        for tab, box_names, inventory_names, disabled in (
            ('weapon', ['短剣'], ['剣（装備中）', '短剣'], [True, False]),
            ('head', ['鉄兜'], ['鉄兜（装備中）'], [True]),
            ('body', ['革鎧'], ['革鎧（装備中）'], [True]),
            ('feet', ['革靴'], ['革靴（装備中）'], [True]),
            ('medicine', ['解毒剤'], ['傷薬'], [False]),
        ):
            page.locator('#itemboxtab-' + tab).click()
            expect(page.locator('#itemboxtab-' + tab)).to_have_attribute('aria-selected', 'true')
            expect(page.locator('#itemboxbody')).to_have_attribute('aria-labelledby', 'itemboxtab-' + tab)
            expect(box.locator('[data-itembox-group="box"] .itembox-row span')).to_have_text(box_names)
            expect(box.locator('[data-itembox-group="inventory"] .itembox-row span')).to_have_text(inventory_names)
            assert box.locator('[data-itembox-deposit]').evaluate_all('els=>els.map(e=>e.disabled)') == disabled
            layout(page)

        # Deposit/withdraw one medicine, preserving equipment, gold and order.
        page.locator('[data-itembox-deposit="5"]').click()
        expect(page.locator('#itemboxnotice')).to_have_text('預けました。')
        expect(page.locator('#itemboxcapacity')).to_have_text('ボックス 6/100 · 収納Aの所持 5/10')
        expect(page.locator('#inventorytitle')).to_have_text('収納Aのアイテム 5/10')
        assert page.evaluate("JSON.parse(localStorage.getItem('ash-v1')).itemBox.at(-1)") == 'healingPotion'
        page.locator('[data-itembox-withdraw="5"]').click()
        expect(page.locator('#itemboxnotice')).to_have_text('取り出しました。')
        expect(page.locator('#inventorytitle')).to_have_text('収納Aのアイテム 6/10')
        assert snapshot(page) == original
        # Leave the item in the shared box, then access it as a different member.
        page.locator('[data-itembox-deposit="5"]').click()
        stored = page.evaluate('s.itemBox')
        page.locator('#itemboxtab-weapon').focus()
        page.keyboard.press('ArrowRight')
        expect(page.locator('#itemboxtab-head')).to_have_attribute('aria-selected', 'true')
        page.keyboard.press('End')
        expect(page.locator('#itemboxtab-medicine')).to_have_attribute('aria-selected', 'true')
        page.keyboard.press('Escape')
        expect(box).not_to_be_visible()
        expect(page.locator('#inventorydialog')).to_be_visible()
        expect(page.locator('#itemboxopen')).to_be_focused()
        page.locator('#inventoryclose').click()
        page.locator('#statsclose').click()

        page.locator('#blacksmith').click()
        page.locator('#shopmember').select_option('1')
        page.locator('#shopinventory').click()
        page.locator('#itemboxopen').click()
        assert page.evaluate('inventoryMember') == 1
        assert page.evaluate('s.itemBox') == stored
        expect(page.locator('#itemboxcapacity')).to_have_text('ボックス 6/100 · 収納Bの所持 1/10')
        page.locator('#itemboxtab-medicine').click()
        expect(box.locator('[data-itembox-group="box"] .itembox-row span')).to_have_text(['解毒剤', '傷薬'])
        expect(box.locator('[data-itembox-group="inventory"] h3')).to_have_text('収納Bの所持品')
        page.locator('[data-itembox-withdraw="5"]').click()
        assert page.evaluate('s.inventory[1]') == ['staff', 'healingPotion']
        expect(page.locator('#inventorytitle')).to_have_text('収納Bのアイテム 2/10')
        layout(page)
        box.screenshot(path=str(OUT / f'item-box-{width}.png'))
        page.locator('#itemboxclose').click()
        expect(page.locator('#inventorydialog')).to_be_visible()
        page.locator('#inventoryclose').click()
        expect(page.locator('#shopdialog')).to_be_visible()
        page.locator('#shopclose').click()

        # Reload exercises the real ash-v1 startup path after UI transfers.
        expected = snapshot(page)
        page.reload()
        page.wait_for_function('!!globalThis.KeyNav')
        assert snapshot(page) == expected
        page.locator('#entrance').click()
        page.wait_for_function("s.area==='dungeon' && idle()")
        page.keyboard.press('c')
        page.locator('[data-stat-inventory="1"]').click()
        expect(page.locator('#itemboxopen')).not_to_be_visible()
        assert page.locator('#inventorydialog').get_by_role('button', name='アイテムボックス', exact=True).count() == 0
        assert page.evaluate('s.itemBox') == expected['box']
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors, errors
        print(f'PASS item box Chromium {width}px: both entrances, shared members, five tabs, round trip, save/reload, dungeon hidden, keyboard, layout, no JS errors')
        context.close()
    browser.close()
