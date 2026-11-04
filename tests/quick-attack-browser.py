"""070: 戻る stays at one y for every member / row choice / review; クイック攻撃 and 逃げる only on the first
actionable member; quick attack starts the turn with no review; distinct styling; keyboard reachable; no overflow.
Run: python3 tests/quick-attack-browser.py [http://localhost:8000/]
"""
import json, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in ('/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/opt/google/chrome/chrome') if Path(p).exists()), None)
out = Path(os.environ.get('QUICK_ATTACK_SCREENSHOT_DIR', '/tmp/quick-attack-browser')); out.mkdir(parents=True, exist_ok=True)
JOBS = (0, 1, 2, 0, 2, 3)  # warrior, mage, priest, warrior, priest(rear melee), thief(rear)

def fixture(boss=False):
    records = []
    for i, job in enumerate(JOBS):
        m = dict(id=f'qa-{i}', name=f'冒険者{i+1}', job=job, status='ok', level=12, xp=300, maxHP=200, maxMP=100,
                 str=18, baseStr=18, intelligence=18, piety=18, known=[],
                 xpTargets=[0, 0]+[100*n*(n-1) for n in range(2, 31)], xpCurveVersion=2)
        records.append(dict(members=m, hp=200, mp=100, inventory=[['sword', 'staff', 'mace', 'dagger'][job]], equipped=0, armor={},
                            ailments=dict(poison=False, paralysis=0, sleep=0, silence=0, fear=0)))
    u = lambda uid, row: dict(id='slime', uid=uid, row=row, hp=9999, rewarded=False)
    save = dict(rosterVersion=1, roster=records, partyIds=[r['members']['id'] for r in records], partyVersion=1,
                dungeonCycleVersion=1, immediateChestVersion=1, area='dungeon', floor=1, size=8, start=26, pos=27, dir=1, boss=28,
                gold=0, relic=False, done=False, logs=[], pendingStairs=False, pendingBoss=None,
                enemy=dict(dataVersion=1, boss=boss, initiative='party', target=0, units=[u(1, 7), u(2, 23)]),
                cells=[dict(open=True, trap=False, flag=False, type='') for _ in range(64)])
    save['cells'][28]['type'] = 'boss'
    return save

with sync_playwright() as p:
    opts = {'headless': True, 'args': ['--no-sandbox']}
    if chrome: opts['executable_path'] = chrome
    browser = p.chromium.launch(**opts)
    for width in (1280, 390):
        touch = width < 700
        ctx = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=touch)
        ctx.add_init_script('localStorage.setItem("ash-v1", '+json.dumps(json.dumps(fixture(), ensure_ascii=False))+'); Math.random=()=>.5;')
        page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL); page.wait_for_function('s&&s.enemy&&!logBusy()')
        def press(sel):
            loc = page.locator(sel).first
            loc.tap() if touch else loc.click()
        def back_y(): return round(page.locator('#commandentry [data-command-back]').bounding_box()['y'], 1)
        def counts(): return page.locator('#commandentry .commandchoices button').count()
        def inside():
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal overflow'
            for b in page.locator('#commandentry button:visible').all():
                bb = b.bounding_box(); assert bb['x'] >= 0 and bb['x']+bb['width'] <= width+0.5, ('offscreen', bb)
        def extras(visible):
            for sel in ('#quickattack', '#flee'):
                assert page.locator(sel).count() <= 1, 'duplicate '+sel
                assert (page.locator(sel).count() == 1 and page.locator(sel).is_visible()) == visible, (sel, visible)

        # Member 1: quick attack sits in the one-line heading; flee is the only extra below 戻る.
        y = back_y(); extras(True); inside()
        qa, fl, bk = (page.locator(s).bounding_box() for s in ('#quickattack', '#flee', '#commandentry [data-command-back]'))
        # 070 measured #commandentry at 310px (1280) / 298px (390) for this fixture; 071 must be shorter.
        box_h = page.evaluate('document.querySelector("#commandentry").getBoundingClientRect().height')
        assert box_h <= {1280: 310, 390: 298}[width] - 10, ('command area not shorter than 070', box_h)
        heading = page.locator('.commandheading')
        hb = heading.bounding_box()
        assert page.locator('#quickattack').evaluate('(e)=>e.parentElement===document.querySelector(".commandheading")'), 'quick attack is in heading'
        assert abs(qa['y']-hb['y']) < 1 and qa['x'] > hb['x'], 'quick attack at heading right'
        assert fl['y'] > bk['y'] and page.locator('.battleextras button').count() == 1, 'only flee below back'
        assert heading.evaluate('(e)=>e.getBoundingClientRect().height===24'), 'heading remains one line'
        assert qa['height'] < 32 and qa['width'] < width*.55, 'quick attack remains small'
        st = lambda sel, prop: page.locator(sel).evaluate(f'(e)=>getComputedStyle(e).{prop}')
        assert st('#quickattack', 'borderTopColor') != st('[data-command-choice="guard"]', 'borderTopColor') or \
               st('#quickattack', 'backgroundColor') != st('[data-command-choice="guard"]', 'backgroundColor'), 'quick attack looks like others'
        assert 'クイック攻撃' in page.locator('#quickattack').inner_text() and '全員1列目へ攻撃' not in page.locator('#quickattack').inner_text()
        assert page.evaluate('!!KeyNav.current()?.matches(\'[data-command-choice="fight"]\')'), 'default stays on 戦う'
        page.screenshot(path=str(out/f'{width}-member1.png'))
        cur = lambda q: page.evaluate('(q)=>!!KeyNav.current()?.matches(q)', q)
        # W from the top row reaches the heading button; S returns to the grid.
        page.keyboard.press('w'); assert cur('#quickattack'), ('W reaches quick attack', width, page.evaluate('KeyNav.current()?.outerHTML'))
        page.keyboard.press('s'); assert cur('.commandchoices button'), ('S returns to command grid', width, page.evaluate('KeyNav.current()?.outerHTML'))
        page.keyboard.press('s'); assert cur('#flee'), ('S skips disabled 戻る', width, page.evaluate('KeyNav.current()?.outerHTML'))
        page.keyboard.press('w'); assert cur('.commandchoices button'), ('W returns from flee to the grid', page.evaluate('KeyNav.current()?.outerHTML'))
        seen = {counts()}
        # Row choice keeps 戻る in place, no extras.
        press('[data-command-choice="fight"]'); assert page.evaluate('choosingRow===true'); assert back_y() == y; extras(False)
        page.screenshot(path=str(out/f'{width}-rowchoice.png'))
        press('#commandentry [data-command-back]'); assert back_y() == y; extras(True)
        press('[data-command-choice="guard"]')
        for n in range(1, 6):
            assert page.evaluate('commandIndex') == n
            if n == 1:  # an enabled 戻る (member 2+) is still a normal S stop
                for _ in range(4): page.keyboard.press('s')
                assert cur('#commandentry [data-command-back]'), page.evaluate('KeyNav.current()?.outerHTML')
            assert back_y() == y, (n, back_y(), y); extras(False); inside(); seen.add(counts())
            page.screenshot(path=str(out/f'{width}-member{n+1}.png'))
            press('[data-command-choice="guard"]')
        assert len(seen) >= 3, ('jobs should give different button counts', seen)
        assert page.locator('#commandreviewpopup').is_visible() and back_y() == y; extras(False)
        page.screenshot(path=str(out/f'{width}-review.png'))

        # Keyboard: quick attack is reachable by Tab and starts the turn with no review.
        page.reload(); page.wait_for_function('s&&s.enemy&&!logBusy()')
        for _ in range(40):
            if page.evaluate('!!KeyNav.current()?.matches("#quickattack")'): break
            page.keyboard.press('Tab')
        else: raise AssertionError('quick attack not reachable by keyboard')
        page.evaluate('window.__review=0;new MutationObserver(()=>{if(!document.querySelector("#commandreviewpopup").hidden)window.__review++}).observe(document.body,{subtree:true,attributes:true,childList:true})')
        before = page.evaluate('s.enemy.units.map(e=>e.hp)')
        if touch: press('#quickattack')
        else: page.keyboard.press('Space')
        page.wait_for_function('!logBusy()', timeout=20000)
        assert page.evaluate('window.__review') == 0, 'review popup appeared'
        assert page.evaluate('s.logs.some(t=>t.includes("ターン開始"))'), 'turn did not start'
        after = page.evaluate('s.enemy?s.enemy.units.map(e=>e.hp):null')
        assert after and after[0] < before[0] and after[1] == before[1], (before, after)
        assert page.evaluate('commandIndex') == 0; extras(True)
        page.screenshot(path=str(out/f'{width}-after-quick.png'))

        # Everyone afraid → quick attack greyed; boss → quick usable, flee disabled.
        page.evaluate('s.ailments.forEach(a=>a.fear=3);render()')
        assert page.locator('#quickattack').is_disabled() and page.locator('#quickattack').get_attribute('title') == '物理攻撃できるメンバーがいない'
        page.screenshot(path=str(out/f'{width}-disabled.png'))
        page.evaluate('s.ailments.forEach(a=>a.fear=0);s.enemy.boss=true;render()')
        assert page.locator('#quickattack').is_enabled() and page.locator('#flee').is_disabled()
        assert not errors, errors
        print(f'PASS quick-attack Chromium {width}px: one-line heading button, shorter extras, fixed 戻る y across {sorted(seen)} buttons/row choice/review, first-member-only extras, keyboard, no review, disabled/boss, no overflow')
        ctx.close()
    browser.close()
