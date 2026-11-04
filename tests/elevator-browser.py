"""068: elevator unlock dialog, hidden E on map/3D, riding by keyboard and by mouse/tap.
Run: python3 tests/elevator-browser.py [http://localhost:8000/]  (server serving dist/)
"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
chrome = os.environ.get('CHROME_PATH') or next((x for x in ('/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/opt/google/chrome/chrome') if Path(x).exists()), None)
out = Path(os.environ.get('ELEVATOR_SCREENSHOT_DIR', '/tmp/elevator-browser')); out.mkdir(parents=True, exist_ok=True)
FACE = "i=>{const dx=i%s.size-s.pos%s.size,dy=(i/s.size|0)-(s.pos/s.size|0);s.dir=dx===1?1:dx===-1?3:dy===-1?0:2;render()}"

with sync_playwright() as p:
    opts = {'headless': True, 'args': ['--no-sandbox']}
    if chrome: opts['executable_path'] = chrome
    browser = p.chromium.launch(**opts)
    for width in (1280, 390):
        touch = width < 700
        ctx = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=touch)
        page = ctx.new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(url); page.evaluate("localStorage.removeItem('ash-v1')"); page.reload()
        page.evaluate("""[1,0,2].forEach((job,i)=>{const r=generateRecruit('ABC'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true)});render()""")
        page.locator('#entrance').click(); page.wait_for_function('!logBusy()')
        def step(action='forward'):
            if touch: page.locator(f'[data-action="{action}"]').tap()
            else: page.keyboard.press({'forward': 'w', 'back': 's'}[action])
            page.wait_for_function('!logBusy()')
        # Setup: no random encounters; every non-trap cell explored except one next to the party.
        page.evaluate("""encounterRate=()=>0;window.last=[s.pos-s.size,s.pos+s.size,s.pos-1,s.pos+1].find(i=>s.cells[i]&&adjacent(s.pos,i)&&!s.cells[i].trap&&s.cells[i].type==='');
          s.cells.forEach((c,i)=>{if(!c.trap&&i!==last)c.open=true});s.cells[last].open=false;(%s)(last)""" % FACE)
        step()
        page.wait_for_selector('#elevatordialog[open]')
        assert page.locator('#elevatormessage').inner_text() == '昇降機が使えるようになった！ 昇降機（E）から解放した階へ移動できます。'
        assert '昇降機が使えるようになった' in page.locator('#log').inner_text()
        box = page.locator('#elevatordialog').bounding_box(); assert box['x'] >= 0 and box['x'] + box['width'] <= width, box
        page.screenshot(path=str(out / f'unlock-{width}.png'))
        page.locator('#elevatorok').click(); page.wait_for_selector('#elevatordialog', state='hidden')
        e = page.evaluate("s.cells.findIndex(c=>c.type==='elevator')")
        assert e >= 0 and page.locator(f'#board [data-i="{e}"]').inner_text().strip() != 'E', 'E stays hidden until opened'
        # Walk next to the hidden E and onto it (opens it and the destination picker).
        page.evaluate("""s.elevatorFloors=[1,3];const e=%d;window.from=[e-s.size,e+s.size,e-1,e+1].find(i=>s.cells[i]&&adjacent(e,i)&&!s.cells[i].trap&&!s.cells[i].type);s.pos=from;s.cells[from].open=true;(%s)(e)""" % (e, FACE))
        step()
        page.wait_for_selector('#elevatorpick[open]')
        assert page.locator('#elevatorpick [data-elevator-floor]').all_inner_texts() == ['地下3階']
        pb = page.locator('#elevatorpick').bounding_box(); assert pb['x'] >= 0 and pb['x'] + pb['width'] <= width, pb
        page.screenshot(path=str(out / f'pick-{width}.png'))
        # Cancel (Escape key / tap ×), step back off; E now visible on the map and in 3D.
        if touch: page.locator('#elevatorcancel').tap()
        else: page.keyboard.press('Escape')
        page.wait_for_selector('#elevatorpick', state='hidden'); page.wait_for_function('s.pendingElevator===false', timeout=3000)
        step('back')
        assert page.evaluate('s.pos') == page.evaluate('from')
        assert page.locator(f'#board [data-i="{e}"]').inner_text().strip() == 'E'
        assert 'E' in page.locator('#scene').inner_text(), page.locator('#scene').inner_text()
        page.screenshot(path=str(out / f'visible-{width}.png'))
        step()
        page.wait_for_selector('#elevatorpick[open]')
        if touch: page.locator('[data-elevator-floor="3"]').tap()
        else: page.keyboard.press('Enter')
        page.wait_for_function('s.floor===3')
        assert page.evaluate("s.cells[s.pos].type==='elevator'&&s.cells[s.pos].open&&!s.pendingElevator&&!s.enemy")
        assert '昇降機' in page.locator(f'#board [data-i="{page.evaluate("s.pos")}"]').get_attribute('aria-label')
        assert page.evaluate("!(s.guardiansDefeated||[]).includes(3)")
        page.screenshot(path=str(out / f'arrived-{width}.png'))
        # Ride back with the other input method (mouse click at 1280, keyboard at 390).
        page.evaluate("""const e=s.pos,n=[e-s.size,e+s.size,e-1,e+1].filter(i=>s.cells[i]&&adjacent(e,i)&&!s.cells[i].type&&!s.cells[i].chest);window.from=n.find(i=>!s.cells[i].trap)??n[0];s.cells[from].trap=false;s.pos=from;s.cells[from].open=true;(%s)(e)""" % FACE)
        step()
        page.wait_for_selector('#elevatorpick[open]')
        assert page.locator('#elevatorpick [data-elevator-floor]').all_inner_texts() == ['地下1階']
        if touch: page.keyboard.press('Enter')
        else: page.locator('[data-elevator-floor="1"]').click()
        page.wait_for_function('s.floor===1')
        assert page.evaluate(f"s.pos==={e}&&!s.pendingElevator")
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        assert not errors, errors
        print(f'PASS elevator Chromium {width}px: unlock dialog, hidden E, map/3D E, {"tap/keyboard" if touch else "keyboard/mouse"} rides 1F→3F→1F; no JS errors')
        ctx.close()
    browser.close()
