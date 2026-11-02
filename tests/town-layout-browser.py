from pathlib import Path
import os
import sys

from playwright.sync_api import sync_playwright


chrome_path = os.environ.get('CHROME_PATH')
if not chrome_path:
    for candidate in ('/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'):
        if Path(candidate).exists():
            chrome_path = candidate
            break

output_dir = Path('/workspace/sim')
output_dir.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    options = {'headless': True, 'args': ['--no-sandbox']}
    if chrome_path:
        options['executable_path'] = chrome_path
    browser = p.chromium.launch(**options)
    for width in (1280, 390):
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/')

        assert page.locator('#town').is_visible()
        head = page.locator('.townhead').bounding_box()
        icon = page.locator('.townart').bounding_box()
        town = page.locator('#town').bounding_box()
        assert head['height'] <= 40, head
        assert icon['width'] <= 28 and icon['height'] <= 28, icon
        assert head['x'] <= town['x'] + 24, (head, town)

        menu = page.locator('.townmenu')
        entrance = page.locator('#entrance')
        assert entrance.evaluate('(e)=>e.parentElement.firstElementChild===e')
        assert entrance.is_disabled()
        entrance_box = entrance.bounding_box()
        menu_box = menu.bounding_box()
        menu_pad_top = menu.evaluate('(e)=>parseFloat(getComputedStyle(e).paddingTop)')
        assert abs(entrance_box['y'] - (menu_box['y'] + menu_pad_top)) <= 2, (entrance_box, menu_box, menu_pad_top)
        for i in range(menu.locator('button:not(#entrance)').count()):
            other = menu.locator('button:not(#entrance)').nth(i).bounding_box()
            assert entrance_box['y'] + entrance_box['height'] <= other['y'] + 1, (entrance_box, other)
        assert abs(entrance_box['width'] - menu_box['width']) <= 2, (entrance_box, menu_box)
        assert entrance_box['height'] >= (56 if width == 390 else 64), entrance_box
        other_buttons = menu.locator('button:not(#entrance)')
        first_row = [other_buttons.nth(0).bounding_box(), other_buttons.nth(1).bounding_box()]
        assert abs(first_row[0]['y'] - first_row[1]['y']) <= 2, first_row
        assert first_row[0]['x'] != first_row[1]['x'], first_row

        # Add one button to make the non-entrance count even: the final pair shares a row.
        page.evaluate("""() => {
          const b=document.createElement('button'); b.id='temporary-library-one'; b.textContent='図書館候補';
          document.querySelector('.townmenu').append(b);
        }""")
        pair = [page.locator('#libraryopen').bounding_box(), page.locator('#temporary-library-one').bounding_box()]
        assert abs(pair[0]['y'] - pair[1]['y']) <= 2 and pair[0]['x'] != pair[1]['x'], pair
        page.locator('#temporary-library-one').evaluate('(e)=>e.remove()')

        # Add two buttons: the odd final item spans both columns.
        page.evaluate("""() => {
          for (const id of ['temporary-library-two-a','temporary-library-two-b']) {
            const b=document.createElement('button'); b.id=id; b.textContent=id; document.querySelector('.townmenu').append(b);
          }
        }""")
        last_box = page.locator('#temporary-library-two-b').bounding_box()
        assert abs(last_box['width'] - menu.bounding_box()['width']) <= 2, last_box
        page.locator('#temporary-library-two-a').evaluate('(e)=>e.remove()')
        page.locator('#temporary-library-two-b').evaluate('(e)=>e.remove()')

        reset = page.locator('#resetopen').bounding_box()
        assert reset['height'] >= 44 and reset['y'] > menu.bounding_box()['y'], (reset, menu.bounding_box())
        for i in range(menu.locator('button').count()):
            box = menu.locator('button').nth(i).bounding_box()
            assert box['width'] >= 44 and box['height'] >= 44, box
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')

        page.locator('#townnotice').evaluate("e=>e.textContent='死亡したメンバーを外してください。'")
        notice = page.locator('#townnotice').bounding_box()
        assert notice['height'] > 0 and notice['y'] >= 0 and notice['y'] + notice['height'] <= 900, notice
        page.evaluate('s.cleared=true;render()')
        assert page.locator('#clearedmark').is_visible()
        page.evaluate('s.cleared=false;render()')

        if width == 390:
            assert entrance_box['y'] >= 0 and entrance_box['y'] + entrance_box['height'] <= 900, entrance_box
        page.screenshot(path=str(output_dir / f'town-{width}-after.png'))
        assert not errors, errors
        print(f'PASS Chromium {width}px: compact town header, entrance priority, two-column responsive grid, odd/even count, reset target size, notice/badge, no overflow or JS errors')
        context.close()
    browser.close()
