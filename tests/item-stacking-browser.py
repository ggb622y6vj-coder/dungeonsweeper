"""107: Chunk labels and single-item actions, at desktop and mobile widths.

Run: python3 tests/item-stacking-browser.py [URL serving dist/]
Requires Playwright/Chromium in the test environment only.
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
OUT = Path(os.environ.get('ITEM_STACKING_SCREENSHOT_DIR', '/tmp/item-stacking-browser'))
CHROME = os.environ.get('CHROME_PATH') or next((p for p in (
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'
) if Path(p).exists()), None)


def layout(page, selector):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    dialog = page.locator(selector)
    assert dialog.evaluate('e=>e.scrollWidth<=e.clientWidth')
    bounds = dialog.bounding_box()
    assert bounds['x'] >= 0 and bounds['y'] >= 0, bounds
    assert bounds['x'] + bounds['width'] <= page.viewport_size['width'] + 1, bounds
    assert bounds['y'] + bounds['height'] <= page.viewport_size['height'] + 1, bounds


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
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav')
        page.evaluate("""() => {
          for(const [name,job] of [['運搬A',0],['運搬B',1]]){
            const r=generateRecruit(name,job);registerRecruit(r);changeRecruitParty(r.members.id,true);
          }
          s.inventory[0]=['sword','healingPotion','helm','healingPotion','healingPotion','antidote'];
          s.equipped[0]=0;s.armor[0]={head:2};
          s.itemBox=['healingPotion','antidote','healingPotion'];render();
        }""")
        page.locator('#statsopen').click()
        page.locator('[data-stat-inventory="0"]').click()
        expect(page.locator('#inventorytitle')).to_have_text('運搬Aのアイテム 4/10')
        expect(page.locator('#inventoryslots .slot')).to_have_count(10)
        expect(page.locator('#inventoryslots .slot b')).to_have_text(['剣', '傷薬 ×3', '鉄兜', '解毒剤'])
        expect(page.locator('#transferitem option')).to_have_text(['2. 傷薬 ×3', '4. 解毒剤'])
        layout(page, '#inventorydialog')

        # Town keeps the medicine dialog open, so both pointer and keyboard labels can be inspected.
        page.locator('[data-use-medicine="1"]').click()
        expect(page.locator('#medicineitem option')).to_have_text(['傷薬 ×3', '解毒剤'])
        expect(page.locator('#medicinelist [data-medicine-choice]')).to_have_text(['傷薬 ×3', '解毒剤'])
        assert '枠' not in page.locator('#medicineitem').inner_text()
        layout(page, '#medicinedialog')
        page.locator('#medicineclose').click()
        page.locator('#itemboxopen').click()
        page.locator('#itemboxtab-medicine').click()
        box_names = page.locator('[data-itembox-group="box"] .itembox-row span')
        inv_names = page.locator('[data-itembox-group="inventory"] .itembox-row span')
        expect(box_names).to_have_text(['傷薬 ×2', '解毒剤'])
        expect(inv_names).to_have_text(['傷薬 ×3', '解毒剤'])
        expect(page.locator('#itemboxcapacity')).to_have_text('ボックス 2/100 · 運搬Aの所持 4/10')

        # Depositing one representative retains stack capacities and shifts the equipped helm.
        page.locator('[data-itembox-deposit="1"]').click()
        expect(box_names).to_have_text(['傷薬 ×3', '解毒剤'])
        expect(inv_names).to_have_text(['傷薬 ×2', '解毒剤'])
        expect(page.locator('#itemboxnotice')).to_have_text('預けました。')
        expect(page.locator('#itemboxcapacity')).to_have_text('ボックス 2/100 · 運搬Aの所持 4/10')
        assert page.evaluate('s.armor[0].head') == 1
        page.locator('[data-itembox-withdraw="0"]').click()
        expect(box_names).to_have_text(['解毒剤', '傷薬 ×2'])
        expect(inv_names).to_have_text(['傷薬 ×3', '解毒剤'])
        expect(page.locator('#itemboxnotice')).to_have_text('取り出しました。')
        assert page.evaluate('s.inventory[0][s.armor[0].head]') == 'helm'
        layout(page, '#itemboxdialog')
        page.locator('#itemboxclose').click()

        # A changed source item changes recipient eligibility even at the same 10/10 count.
        page.evaluate("""() => {
          s.inventory[1]=[...Array(9).fill('staff'),...Array(9).fill('healingPotion')];
          renderInventory();
        }""")
        if not page.evaluate("document.querySelector('#transfersection').open"):
            page.locator('#transfersection summary').click()
        page.locator('#transferitem').select_option('2')  # first healing potion after helm compaction
        expect(page.locator('#transfermember option')).to_have_text(['運搬B (10/10)'])
        assert not page.locator('#transfermember option').evaluate('e=>e.disabled')
        expect(page.locator('#transfergive')).to_be_enabled()
        page.locator('#transferitem').select_option('4')  # antidote cannot start another stack
        assert page.locator('#transfermember option').evaluate('e=>e.disabled')
        expect(page.locator('#transfergive')).to_be_disabled()
        page.locator('#transferitem').select_option('2')
        page.locator('#transfergive').click()
        assert page.evaluate("s.inventory[1].filter(id=>id==='healingPotion').length") == 10
        expect(page.locator('#transfergive')).to_be_disabled()
        expect(page.locator('#inventoryslots .slot b')).to_have_text(['剣', '鉄兜', '傷薬 ×2', '解毒剤'])

        # Each chunk retains its own representative, including indices above the old ten-entry limit.
        page.evaluate("""() => {
          s.inventory[0]=['sword',...Array(11).fill('healingPotion')];s.equipped[0]=0;s.armor[0]={};
          s.itemBox=[...Array(12).fill('healingPotion')];renderInventory();
        }""")
        expect(page.locator('#inventoryslots .slot b')).to_have_text(['剣', '傷薬 ×10', '傷薬'])
        expect(page.locator('#inventoryslots .slot')).to_have_count(10)
        expect(page.locator('#inventorytitle')).to_have_text('運搬Aのアイテム 3/10')
        page.locator('#inventorydialog').screenshot(path=str(OUT / f'inventory-{width}.png'))
        page.locator('#itemboxopen').click()
        page.locator('#itemboxtab-medicine').click()
        expect(box_names).to_have_text(['傷薬 ×10', '傷薬 ×2'])
        expect(inv_names).to_have_text(['傷薬 ×10', '傷薬'])
        page.locator('[data-itembox-deposit="11"]').click()
        expect(inv_names).to_have_text(['傷薬 ×10'])
        expect(box_names).to_have_text(['傷薬 ×10', '傷薬 ×3'])
        expect(page.locator('#itemboxcapacity')).to_have_text('ボックス 2/100 · 運搬Aの所持 2/10')
        page.locator('[data-itembox-withdraw="10"]').click()
        expect(inv_names).to_have_text(['傷薬 ×10', '傷薬'])
        expect(box_names).to_have_text(['傷薬 ×10', '傷薬 ×2'])
        expect(page.locator('#itemboxcapacity')).to_have_text('ボックス 2/100 · 運搬Aの所持 3/10')
        layout(page, '#itemboxdialog')
        page.locator('#itemboxdialog').screenshot(path=str(OUT / f'box-{width}.png'))
        expected = page.evaluate('({inventory:s.inventory,box:s.itemBox,equipped:s.equipped,armor:s.armor})')
        page.reload()
        page.wait_for_function('!!globalThis.KeyNav')
        assert page.evaluate('({inventory:s.inventory,box:s.itemBox,equipped:s.equipped,armor:s.armor})') == expected
        assert not errors, errors
        print(f'PASS item stacking Chromium {width}px: chunk labels, medicine dialog, transfer, deposit/withdraw, reload, layout, no JS errors')
        context.close()
    browser.close()
