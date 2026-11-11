"""069: 呪いを解く row selection (undead rows only) by mouse/tap and keyboard; only the chosen row is dispelled.
Run: python3 tests/dispel-row-browser.py [http://localhost:8000/]
"""
import json, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in ('/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/opt/google/chrome/chrome') if Path(p).exists()), None)
out = Path(os.environ.get('DISPEL_ROW_SCREENSHOT_DIR', '/tmp/dispel-row-browser')); out.mkdir(parents=True, exist_ok=True)

def fixture():
    records = []
    for i, job in enumerate((0, 2, 2, 0, 2, 3)):
        m = dict(id=f'dispel-{i}', name=f'冒険者{i+1}', job=job, status='ok', level=12, xp=300, maxHP=200, maxMP=100,
                 str=18, baseStr=18, intelligence=18, piety=18, known=[],
                 xpTargets=[0, 0]+[100*n*(n-1) for n in range(2, 31)], xpCurveVersion=2)
        records.append(dict(members=m, hp=200, mp=100, inventory=[['sword', 'staff', 'mace', 'dagger'][job]], equipped=0, armor={},
                            ailments=dict(poison=False, paralysis=0, sleep=0, silence=0, fear=0)))
    u = lambda uid, id, row: dict(id=id, uid=uid, row=row, hp=999 if id == 'wolf' else 20, rewarded=False)
    save = dict(rosterVersion=1, roster=records, partyIds=[r['members']['id'] for r in records], partyVersion=1,
                dungeonCycleVersion=1, immediateChestVersion=1, area='dungeon', floor=1, size=8, start=26, pos=27, dir=1, boss=28,
                gold=0, relic=False, done=False, logs=[], pendingStairs=False, pendingBoss=None,
                enemy=dict(dataVersion=1, boss=False, initiative='party', target=0,
                           units=[u(1, 'skeleton', 7), u(2, 'skeleton', 7), u(3, 'wolf', 23), u(4, 'skeleton', 39)]),
                cells=[dict(open=True, trap=False, flag=False, type='') for _ in range(64)])
    save['cells'][28]['type'] = 'boss'
    return save

def hp(page): return page.evaluate('s.enemy?s.enemy.units.map(e=>e.hp):null')

with sync_playwright() as p:
    opts = {'headless': True, 'args': ['--no-sandbox']}
    if chrome: opts['executable_path'] = chrome
    browser = p.chromium.launch(**opts)
    for width in (1280, 390):
        touch = width < 700
        ctx = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=touch)
        ctx.add_init_script('localStorage.setItem("ash-v1", '+json.dumps(json.dumps(fixture(), ensure_ascii=False))+'); Math.random=()=>0;')
        page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL); page.wait_for_function('s&&s.enemy&&!logBusy()')
        def press(sel):
            loc = page.locator(sel).first
            loc.tap() if touch else loc.click()
        def key_to(sel):
            for _ in range(60):
                if page.evaluate('(q)=>!!KeyNav.current()?.matches(q)', sel): break
                page.keyboard.press('Tab')
            else: raise AssertionError('cannot reach '+sel)
            page.keyboard.press('Space')
        # Turn 1, pointer: priest (member 2) picks the rear undead row.
        press('[data-command-choice="guard"]')
        assert not page.locator('[data-command-choice="dispel"]').is_disabled()
        press('[data-command-choice="dispel"]')
        assert '呪いを解く' in page.locator('.commandheading').inner_text()
        choices = page.locator('[data-row-choice]').all_inner_texts()
        assert [c.split('：')[0] for c in choices] == ['1列', '3列'] and choices[0].endswith('×2') and choices[1].endswith('×1'), choices
        box = page.locator('#commandentry').bounding_box(); assert box['x'] >= 0 and box['x'] + box['width'] <= width
        page.screenshot(path=str(out / f'rows-{width}.png'))
        press('[data-row-choice="39"]')
        for _ in range(4): press('[data-command-choice="guard"]')
        review = page.locator('#commandreviewpopup').inner_text()
        assert '呪いを解く → 3列' in review, review
        page.screenshot(path=str(out / f'review-{width}.png'))
        press('#attack'); page.wait_for_function('!logBusy()')
        h = hp(page); assert h[0] == 20 and h[1] == 20 and h[2] > 0 and h[3] == 0, h
        # Turn 2, keyboard: one undead row left, so 呪いを解く confirms it without a row prompt.
        page.wait_for_selector('[data-command-choice="guard"]')
        key_to('[data-command-choice="guard"]')
        key_to('[data-command-choice="dispel"]')
        assert page.locator('[data-row-choice]').count() == 0, page.locator('#commandentry').inner_html()
        assert page.evaluate('choosingRow===false && s.commands[1]==="dispel" && String(s.dispelRows[1])==="7"')
        for _ in range(4): key_to('[data-command-choice="guard"]')
        assert '呪いを解く → 1列' in page.locator('#commandreviewpopup').inner_text()
        key_to('#attack'); page.wait_for_function('!logBusy()')
        h = hp(page); assert h[0] == 0 and h[1] == 0 and h[2] > 0 and h[3] == 0, h
        # Turn 3: no undead left, so 呪いを解く cannot be chosen.
        press('[data-command-choice="guard"]')
        assert page.locator('[data-command-choice="dispel"]').is_disabled()
        page.locator('[data-command-choice="dispel"]').dispatch_event('click')
        assert page.locator('[data-row-choice]').count() == 0 and page.evaluate("s.commands[1]") != 'dispel'
        page.screenshot(path=str(out / f'disabled-{width}.png'))
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        assert not errors, errors
        print(f'PASS dispel-row Chromium {width}px: multi-row choice, single-row auto, {"tap" if touch else "mouse"} + keyboard, review n列, chosen row only, disabled without undead')
        ctx.close()
    browser.close()
