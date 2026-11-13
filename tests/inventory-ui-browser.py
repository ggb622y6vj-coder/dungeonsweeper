#!/usr/bin/env python3
"""111: inventory layout, discard confirmation and multi-sell, at 1280/390px.

Run externally: python3 tests/inventory-ui-browser.py [URL serving dist/]
Requires Playwright and Chromium in the test environment only.
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
CHROME = os.environ.get('CHROME_PATH') or next((p for p in (
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'
) if Path(p).exists()), None)


def state(page):
    return page.evaluate('({inventory:s.inventory,box:s.itemBox,gold:s.gold,equipped:s.equipped,armor:s.armor})')


def layout(page, selector):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    dialog = page.locator(selector)
    assert dialog.evaluate('e=>e.scrollWidth<=e.clientWidth')
    bounds = dialog.bounding_box()
    assert bounds['x'] >= 0 and bounds['y'] >= 0, bounds
    assert bounds['x'] + bounds['width'] <= page.viewport_size['width'] + 1, bounds
    assert bounds['y'] + bounds['height'] <= page.viewport_size['height'] + 1, bounds


def confirmed(page):
    # SELECT keeps native quantity navigation. Esc exits the field to Cancel;
    # D then Enter uses the existing keynav confirm convention.
    page.keyboard.press('Escape')
    expect(page.locator('#inventoryactioncancel')).to_be_focused()
    page.keyboard.press('d')
    expect(page.locator('#inventoryactionconfirm')).to_be_focused()
    page.keyboard.press('Enter')
    expect(page.locator('#inventoryactiondialog')).not_to_be_visible()
    expect(page.locator('#inventorydialog')).to_be_visible()
    page.wait_for_function("document.activeElement.closest('dialog')?.id==='inventorydialog'")


with sync_playwright() as p:
    options = dict(headless=True, args=['--no-sandbox'])
    if CHROME:
        options['executable_path'] = CHROME
    browser = p.chromium.launch(**options)
    for width in (1280, 390):
        context = browser.new_context(viewport=dict(width=width, height=900), has_touch=width == 390)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav')
        page.evaluate("""() => {
          const r=generateRecruit('探索者',0);registerRecruit(r);changeRecruitParty(r.members.id,true);
          s.inventory[0]=['healingPotion','sword','healingPotion','helm','healingPotion','antidote'];
          s.equipped[0]=1;s.armor[0]={head:3};s.gold=100;render();
        }""")
        page.locator('#blacksmith').click()
        page.locator('#shopinventory').click()
        expect(page.locator('#inventoryslots .slot')).to_have_count(10)
        expect(page.locator('#inventoryslots .slotmain > b')).to_have_text(['傷薬 ×3', '剣', '鉄兜', '解毒剤'])
        expect(page.locator('[data-discard]')).to_have_count(0)
        expect(page.locator('[data-sell="1"]')).to_be_disabled()
        expect(page.locator('[data-sell="3"]')).to_be_disabled()
        layout(page, '#inventorydialog')
        assert page.locator('#inventoryslots .slotmain').evaluate_all("""blocks => blocks.every(block => {
          const name=block.querySelector('b'),description=block.querySelector('p');
          const n=name.getBoundingClientRect(),d=description.getBoundingClientRect();
          const row=block.parentElement.getBoundingClientRect(),buttons=block.parentElement.querySelectorAll('button');
          const last=buttons[buttons.length-1].getBoundingClientRect();
          return n.width>80 && d.top>=n.bottom-1 && Math.abs(n.left-d.left)<1 &&
            getComputedStyle(description).textAlign==='left' && Math.abs(last.right-row.right)<1 && d.right<=buttons[0].getBoundingClientRect().left;
        })""")

        # Multi-sell cancellation and focus return leave inventory and gold untouched.
        before = state(page)
        page.locator('[data-sell="0"]').click()
        expect(page.locator('#inventoryactiondialog')).to_be_visible()
        expect(page.locator('#inventoryactioncancel')).to_be_focused()
        expect(page.locator('#inventoryquantity option')).to_have_text(['1', '2', '3'])
        expect(page.locator('#inventoryactiontotal')).to_have_text('合計 8 G（単価 8 G × 1）')
        page.keyboard.press('Escape')
        expect(page.locator('#inventoryactiondialog')).not_to_be_visible()
        expect(page.locator('[data-sell="0"]')).to_be_focused()
        assert state(page) == before

        # Reopen with keyboard, change quantity natively, and confirm via keynav.
        page.keyboard.press('Enter')
        page.locator('#inventoryquantity').focus()
        page.keyboard.press('Home')
        page.keyboard.press('ArrowDown')
        expect(page.locator('#inventoryquantity')).to_have_value('2')
        expect(page.locator('#inventoryactiontotal')).to_have_text('合計 16 G（単価 8 G × 2）')
        layout(page, '#inventoryactiondialog')
        confirmed(page)
        assert page.evaluate('s.inventory[0]') == ['sword', 'helm', 'healingPotion', 'antidote']
        assert page.evaluate('s.gold') == 116
        assert page.evaluate('s.equipped[0]===0 && s.armor[0].head===1')
        expect(page.locator('#shopgold')).to_have_text('金貨 116 G')
        page.locator('[data-sell="2"]').click()
        expect(page.locator('#inventoryactiondialog')).not_to_be_visible()
        assert page.evaluate('s.gold') == 124
        assert page.evaluate('s.inventory[0]') == ['sword', 'helm', 'antidote']
        page.locator('#inventoryclose').click()
        page.locator('#shopclose').click()

        # Enter the dungeon with a fresh stack to exercise both single and multi discard.
        page.evaluate("""() => {
          s.inventory[0]=['healingPotion','sword','healingPotion','helm','healingPotion','antidote'];
          s.equipped[0]=1;s.armor[0]={head:3};render();
        }""")
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy() && idle()')
        # In the dungeon at >=701px #statsopen is display:none by design;
        # the party panel opens the same stats dialog at every width.
        page.locator('#party').click()
        page.locator('[data-stat-inventory="0"]').click()
        expect(page.locator('[data-sell]')).to_have_count(0)
        expect(page.locator('[data-discard="1"]')).to_be_disabled()
        expect(page.locator('[data-discard="3"]')).to_be_disabled()
        before = state(page)
        page.locator('[data-discard="5"]').click()
        expect(page.locator('#inventoryactionname')).to_have_text('解毒剤を捨てますか？')
        expect(page.locator('#inventoryquantitylabel')).not_to_be_visible()
        expect(page.locator('#inventoryactiontotal')).not_to_be_visible()
        assert state(page) == before
        page.locator('#inventoryactioncancel').click()
        expect(page.locator('[data-discard="5"]')).to_be_focused()
        assert state(page) == before
        page.keyboard.press('Enter')
        page.keyboard.press('d')
        page.keyboard.press('Space')
        expect(page.locator('#inventoryactiondialog')).not_to_be_visible()
        expect(page.locator('#inventorydialog')).to_be_visible()
        assert page.evaluate("s.inventory[0].includes('antidote')") is False

        page.locator('[data-discard="0"]').click()
        page.locator('#inventoryquantity').focus()
        page.keyboard.press('Home')
        page.keyboard.press('ArrowDown')
        confirmed(page)
        expect(page.locator('#inventoryslots .slotmain > b')).to_have_text(['剣', '鉄兜', '傷薬'])
        assert page.evaluate('s.equipped[0]===0 && s.armor[0].head===1')
        page.locator('[data-discard="2"]').click()
        expect(page.locator('#inventoryquantitylabel')).not_to_be_visible()
        page.locator('#inventoryactionconfirm').click()
        expect(page.locator('#inventoryactiondialog')).not_to_be_visible()
        expect(page.locator('#inventoryslots .slotmain > b')).to_have_text(['剣', '鉄兜'])
        expect(page.locator('#inventoryslots .slot')).to_have_count(10)
        assert page.evaluate('s.gold') == before['gold']
        assert page.evaluate('s.itemBox') == before['box']
        layout(page, '#inventorydialog')
        expected = state(page)
        page.reload()
        page.wait_for_function('!!globalThis.KeyNav')
        assert state(page) == expected
        assert not errors, errors
        print(f'PASS inventory UI Chromium {width}px: layout, multi-sell, discard, cancel, keyboard/focus, persistence, no JS errors')
        context.close()
    browser.close()
