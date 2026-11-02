"""038 keyboard-only regression. Run with dist served at the optional URL.

Game interactions use page.keyboard only. evaluate/locators only inspect state;
there are no fixtures that write globals, storage, DOM, or dispatch events.
Pointer ring removal is unit-tested in keynav.cjs; existing browser suites retain
real mouse/touch interaction coverage.
"""
from pathlib import Path
import os
import sys

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome_path = os.environ.get('CHROME_PATH')
if not chrome_path:
    for candidate in ('/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'):
        if Path(candidate).exists():
            chrome_path = candidate
            break


def focused(page, selector):
    return page.locator(selector).evaluate('(el)=>document.activeElement===el')


def tab_to(page, selector):
    for _ in range(100):
        if focused(page, selector):
            return
        page.keyboard.press('Tab')
    raise AssertionError(f'Cannot reach {selector} using Tab')


def ring(page, selector):
    assert page.locator(selector).evaluate('(el)=>el.classList.contains("kfocus")'), selector
    assert page.locator('.kfocus').count() == 1
    assert page.locator(selector).evaluate('(el)=>parseFloat(getComputedStyle(el).outlineWidth)>=3')


def move_in_town(page, key, direction):
    # Independent distance calculation using only rendered button geometry.
    positions = page.locator('#town button, #statsopen').evaluate_all('''els=>els
      .filter(el=>el.getClientRects().length && getComputedStyle(el).visibility==='visible')
      .map(el=>{const r=el.getBoundingClientRect();return {id:el.id,
        x:r.left+r.width/2,y:r.top+r.height/2,selected:el.classList.contains('kfocus')}})''')
    current = next(x for x in positions if x['selected'])
    candidates = []
    for item in positions:
        dx, dy = item['x'] - current['x'], item['y'] - current['y']
        forward = {'up': -dy, 'down': dy, 'left': -dx, 'right': dx}[direction]
        if forward > 0:
            candidates.append((dx * dx + dy * dy, item))
    expected = min(candidates, key=lambda pair: pair[0])[1] if candidates else current
    page.keyboard.press(key)
    ring(page, '#' + expected['id'])


with sync_playwright() as p:
    options = {'headless': True, 'args': ['--no-sandbox']}
    if chrome_path:
        options['executable_path'] = chrome_path
    browser = p.chromium.launch(**options)
    for width in (1280, 390):
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width == 390)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav')
        assert focused(page, '#trainingopen')
        assert page.locator('#keyhint').is_visible() == (width == 1280)
        assert '町メニュー' in page.locator('#keyhint').text_content()

        # All four WASD directions and arrows, using actual geometry at each width.
        page.keyboard.press('w')
        ring(page, '#entrance')
        assert page.locator('#entrance').is_disabled()
        for confirm in ('Space', 'Enter'):
            page.keyboard.press(confirm)
            assert page.locator('#town').is_visible()
            assert page.locator('dialog[open]').count() == 0
        for key, way in [('s', 'down'), ('d', 'right'), ('a', 'left'), ('w', 'up'),
                         ('ArrowDown', 'down'), ('ArrowRight', 'right'),
                         ('ArrowLeft', 'left'), ('ArrowUp', 'up')]:
            move_in_town(page, key, way)
        before = page.locator('.kfocus').get_attribute('id')
        for modifier in ('Control', 'Alt', 'Meta'):
            page.keyboard.press(modifier + '+ArrowDown')
            assert page.locator('.kfocus').get_attribute('id') == before

        # Tabs preserve their previous automatic horizontal activation behavior.
        tab_to(page, '#libraryopen')
        page.keyboard.press('Space')
        assert page.locator('#librarydialog').is_visible()
        ring(page, '#librarytab-monsters')
        for key, expected in [('d', 'items'), ('a', 'monsters'),
                              ('ArrowRight', 'items'), ('ArrowLeft', 'monsters')]:
            page.keyboard.press(key)
            ring(page, '#librarytab-' + expected)
            assert page.locator('#librarytab-' + expected).get_attribute('aria-selected') == 'true'
        page.keyboard.press('Enter')
        page.keyboard.press('Escape')
        assert not page.locator('#librarydialog').is_visible()
        assert focused(page, '#libraryopen')
        ring(page, '#libraryopen')

        # Text/space and shortcut letters must reach the native input unchanged.
        tab_to(page, '#trainingopen')
        page.keyboard.press('Enter')
        tab_to(page, '#recruitname')
        for key in ('w', 'a', 's', 'd', 'Space', 'e', 'f'):
            page.keyboard.press(key)
            assert focused(page, '#recruitname')
        assert page.locator('#recruitname').input_value() == 'wasd ef'
        page.keyboard.press('Escape')
        assert not focused(page, '#recruitname')
        assert page.locator('#training').is_visible()
        page.keyboard.press('Escape')
        assert not page.locator('#training').is_visible()
        assert focused(page, '#trainingopen')

        # Create one adventurer through the real UI; nested dialog restores its
        # opener, and then the parent restores the town button.
        page.keyboard.press('Space')
        tab_to(page, '#rollrecruit')
        page.keyboard.press('Space')
        tab_to(page, '#registerrecruit')
        page.keyboard.press('Enter')
        delete_button = '#recruitlist .recruit-actions button:last-child'
        tab_to(page, delete_button)
        page.keyboard.press('Space')
        assert page.locator('#recruitdeletedialog').is_visible()
        assert focused(page, '#recruitdeletecancel')
        page.keyboard.press('Escape')
        assert not page.locator('#recruitdeletedialog').is_visible()
        assert page.locator('#training').is_visible()
        assert focused(page, delete_button)
        tab_to(page, '#recruitlist .recruit-actions button:first-child')
        page.keyboard.press('Enter')
        assert page.evaluate('s.members.length') == 1
        page.keyboard.press('Escape')
        assert focused(page, '#trainingopen')

        # The preference has a separate storage key and survives reload.
        tab_to(page, '#keysettingsopen')
        page.keyboard.press('Space')
        assert focused(page, '#keyhinttoggle')
        save_before = page.evaluate('localStorage.getItem("ash-v1")')
        page.keyboard.press('Enter')
        assert page.locator('#keyhinttoggle').get_attribute('aria-pressed') == 'false'
        assert not page.locator('#keyhint').is_visible()
        assert page.evaluate('localStorage.getItem("ash-keyhint")') == 'off'
        assert page.evaluate('localStorage.getItem("ash-v1")') == save_before
        page.keyboard.press('Escape')
        assert focused(page, '#keysettingsopen')
        page.reload()
        page.wait_for_function('!!globalThis.KeyNav')
        assert not page.locator('#keyhint').is_visible()
        tab_to(page, '#keysettingsopen')
        page.keyboard.press('Space')
        page.keyboard.press('Space')
        assert page.locator('#keyhinttoggle').get_attribute('aria-pressed') == 'true'
        page.keyboard.press('Escape')
        assert page.locator('#keyhint').is_visible() == (width == 1280)

        # Exploration keys navigate controls once; decisions use the old click
        # route once. Turning is deterministic and cannot trigger an encounter.
        tab_to(page, '#entrance')
        page.keyboard.press('Enter')
        page.wait_for_function('!logBusy()')
        assert page.evaluate('KeyNav.layer()') == 'explore'
        tab_to(page, '[data-action="left"]')
        before = page.evaluate('({pos:s.pos,dir:s.dir})')
        page.keyboard.press('Enter')
        assert page.evaluate('s.dir') == (before['dir'] + 3) % 4
        assert page.evaluate('s.pos') == before['pos']
        before = page.evaluate('({pos:s.pos,dir:s.dir})')
        # Live dungeon movement keeps working with KeyNav loaded: ArrowRight
        # turns the party (turning cannot trigger an encounter).
        page.keyboard.press('ArrowRight')
        assert page.evaluate('s.dir') == (before['dir'] + 1) % 4
        assert page.evaluate('s.pos') == before['pos']
        page.keyboard.press('ArrowLeft')
        assert page.evaluate('({pos:s.pos,dir:s.dir})') == before

        # Inventory precedes stats in DOM order, but is the topmost modal here.
        tab_to(page, '#party')
        page.keyboard.press('Space')
        tab_to(page, '[data-stat-inventory="0"]')
        page.keyboard.press('Enter')
        assert page.locator('#inventorydialog').is_visible()
        assert page.locator('#statsdialog').is_visible()
        page.keyboard.press('Escape')
        assert not page.locator('#inventorydialog').is_visible()
        assert page.locator('#statsdialog').is_visible()
        assert focused(page, '[data-stat-inventory="0"]')
        page.keyboard.press('Escape')
        assert focused(page, '#party')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors, errors
        print(f'PASS keynav {width}px: keyboard-only navigation, disabled decisions, dialogs/restore, '
              '3px ring, input/shortcuts, settings persistence, touch hint policy, no double movement or JS errors')
        context.close()
    browser.close()
