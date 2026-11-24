"""Run with Playwright Python against dist served at the supplied URL."""

import os
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((path for path in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome') if Path(path).exists()), None)


def check_return(page, tap):
    stats = page.locator('#statsdialog')
    magic = page.locator('#magicdialog')
    inventory = page.locator('#inventorydialog')
    cast_button = stats.locator('[data-stat-cast="0"]')
    mp_value = stats.locator('[data-stat-member="0"] dt:text-is("MP") + dd')
    target_bar = page.locator('#allytargetbar')
    dios = magic.locator('[data-spell="dios"]')
    pick = magic.locator('#magicpick')

    def open_magic():
        tap(cast_button)
        expect(stats).to_be_visible()
        expect(magic).to_be_visible()

    def assert_target_mode():
        expect(target_bar).to_be_visible()
        expect(stats).to_be_hidden()
        expect(magic).to_be_hidden()

    def assert_cancelled():
        expect(target_bar).to_be_hidden()
        expect(stats).to_be_visible()
        expect(magic).to_be_visible()
        expect(dios).to_have_attribute('aria-pressed', 'true')
        expect(pick).to_be_enabled()
        expect(mp_value).to_have_text('9/10')
        assert page.evaluate('[s.mp[0], s.hp[1]]') == [9, 1]

    tap(page.locator('#party .card').first)
    expect(mp_value).to_have_text('10/10')
    for close in ('button', 'escape', 'backdrop'):
        open_magic()
        if close == 'button':
            tap(magic.locator('#magicclose'))
        elif close == 'escape':
            page.keyboard.press('Escape')
        else:
            bounds = magic.bounding_box()
            assert bounds['x'] > 1
            pointer = page.touchscreen.tap if page.viewport_size['width'] < 700 else page.mouse.click
            pointer(1, bounds['y'] + bounds['height'] / 2)
        expect(magic).to_be_hidden()
        expect(stats).to_be_visible()

    open_magic()
    tap(magic.locator('[data-spell="milwa"]'))
    tap(magic.locator('#magiccast'))
    expect(magic).to_be_hidden()
    expect(stats).to_be_visible()
    page.wait_for_function('!logBusy()')
    expect(mp_value).to_have_text('9/10')
    assert page.evaluate('s.milwaSteps') == 30

    open_magic()
    # A spell row starts targeting directly. The restored dialog also offers
    # the explicit button for retrying with the selected spell.
    tap(dios)
    assert_target_mode()
    tap(target_bar.locator('#allytargetfieldcancel'))
    assert_cancelled()
    tap(pick)
    assert_target_mode()
    page.keyboard.press('Escape')
    assert_cancelled()

    tap(pick)
    assert_target_mode()
    tap(page.locator('#party [data-ally-target="1"]'))
    expect(target_bar).to_be_hidden()
    expect(page.locator('dialog[open]')).to_have_count(0)
    page.wait_for_function('!logBusy()')
    assert page.evaluate('s.mp[0] === 7 && s.hp[1] > 1')

    tap(page.locator('#party .card').first)
    expect(mp_value).to_have_text('7/10')
    tap(stats.locator('[data-stat-inventory="0"]'))
    expect(stats).to_be_visible()
    expect(inventory).to_be_visible()
    tap(inventory.locator('#inventoryclose'))
    expect(inventory).to_be_hidden()
    expect(stats).to_be_visible()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=chrome, args=['--no-sandbox'])
    for width in (1280, 390):
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(URL)
        page.evaluate("""() => {
            for (const [name, job] of [['冒険者1', 2], ['冒険者2', 0]]) {
                const recruit = generateRecruit(name, job);
                registerRecruit(recruit);
                changeRecruitParty(recruit.members.id, true);
            }
            render();
        }""")
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        page.evaluate("""() => {
            s.members[0].known = ['dios', 'milwa'];
            s.members[0].maxMP = s.mp[0] = 10;
            s.hp[1] = 1;
            s.cells.forEach(cell => { cell.flag = false; });
            render();
        }""")
        check_return(page, lambda element: element.tap() if width < 700 else element.click())
        assert not errors, errors
        print(f'PASS stats magic return Chromium {width}px')
        context.close()
    browser.close()
