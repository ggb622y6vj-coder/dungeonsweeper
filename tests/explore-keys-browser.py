"""039: keyboard-only controls at desktop/touch widths.

Each scenario loads a disposable save before application startup. The fixed RNG
is setup only: .99 exceeds every encounter threshold on the trap-free test map.
No game functions, DOM events or state writes are used to perform interactions.
"""
import json
import os
import sys
from pathlib import Path
from collections import deque
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'
) if Path(p).exists()), None)


def fixture(**changes):
    member = dict(id='keys-fixture', name='冒険者', job=0, status='ok', level=1,
                  xp=0, maxHP=32, maxMP=0, str=12, baseStr=12, intelligence=8,
                  piety=8, known=[], xpTargets=[0, 0, 100], xpCurveVersion=2)
    record = dict(members=member, hp=32, mp=0, inventory=['sword'], equipped=0,
                  armor={}, ailments=dict(poison=False, paralysis=0, sleep=0,
                                          silence=0, fear=0))
    save = dict(rosterVersion=1, roster=[record], partyIds=[member['id']],
                partyVersion=1, dungeonCycleVersion=1, immediateChestVersion=1,
                area='town', floor=1, size=8, start=26, pos=26, dir=1, boss=63,
                gold=0, relic=False, done=False, logs=[], enemy=None,
                pendingStairs=False, pendingBoss=None, flagKind='power',
                cells=[dict(open=False, trap=False, flag=False, type='') for _ in range(64)])
    save.update(changes)
    return save


def snapshot(page):
    return page.evaluate('({pos:s.pos,dir:s.dir,flags:s.cells.map(c=>c.flag),kind:s.flagKind,area:s.area,done:s.done,dialogs:[...document.querySelectorAll("dialog[open]")].map(d=>d.id)})')


def pose(page, pos, direction):
    value = page.evaluate('({pos:s.pos,dir:s.dir,enemy:!!s.enemy,prompt:!!s.pendingStairs})')
    assert value == dict(pos=pos, dir=direction, enemy=False, prompt=False), value


def press(page, key):
    page.keyboard.press(key)
    page.wait_for_function('!logBusy()')


def inert(page, keys):
    before = snapshot(page)
    for key in keys:
        press(page, key)
        assert snapshot(page) == before, (key, before, snapshot(page))


def focus_return(page, selector):
    # Read the actual geometry and find a WASD-only route, including on 390px.
    # This uses the same public spatial-navigation contract as the 038 suite.
    page.keyboard.press('s')
    for _ in range(40):
        items = page.locator('button, [role="button"]').evaluate_all('''els=>els
          .filter(e=>e.getClientRects().length&&!e.closest('[hidden],dialog:not([open])'))
          .map(e=>{const r=e.getBoundingClientRect();return {id:e.id,x:r.x+r.width/2,
            y:r.y+r.height/2,selected:e.classList.contains('kfocus')}})''')
        current = next(i for i, item in enumerate(items) if item['selected'])
        goal = next(i for i, item in enumerate(items) if item['id'] == selector[1:])
        if current == goal:
            assert page.locator(selector).evaluate('(e)=>e.classList.contains("kfocus")')
            page.keyboard.press('Space')
            page.wait_for_function("s.area==='town'")
            return
        queue = deque([(current, [])]); seen = {current}
        while queue:
            index, path = queue.popleft()
            if index == goal:
                page.keyboard.press(path[0])
                break
            a = items[index]
            for key, dx, dy in [('w', 0, -1), ('s', 0, 1), ('a', -1, 0), ('d', 1, 0)]:
                candidates = [( (b['x']-a['x'])**2+(b['y']-a['y'])**2, j)
                              for j, b in enumerate(items)
                              if (b['x']-a['x'])*dx+(b['y']-a['y'])*dy > 0]
                if candidates:
                    target = min(candidates)[1]
                    if target not in seen:
                        seen.add(target); queue.append((target, path+[key]))
        else:
            raise AssertionError(f'No WASD route to {selector}: {items}')
    raise AssertionError(f'Cannot focus {selector}')


with sync_playwright() as p:
    options = dict(headless=True, args=['--no-sandbox'])
    if chrome:
        options['executable_path'] = chrome
    browser = p.chromium.launch(**options)
    for width in (1280, 390):
        errors = []

        def load(save):
            context = browser.new_context(viewport=dict(width=width, height=900), has_touch=width == 390)
            context.add_init_script('localStorage.setItem("ash-v1", '+json.dumps(json.dumps(save))+'); Math.random=()=>.99;')
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(URL)
            page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
            return context, page

        context, page = load(fixture())
        # 038 town focus navigation, with an actual registered party in the save.
        page.keyboard.press('w')
        assert page.locator('#entrance').evaluate('(e)=>e.classList.contains("kfocus")&&!e.disabled')
        press(page, 'Space')
        assert page.evaluate("s.area==='dungeon'")
        pose(page, 26, 1)
        press(page, 'w'); pose(page, 27, 1)
        for key, pos, direction in [('w', 28, 1), ('s', 27, 1), ('a', 27, 0),
                                   ('d', 27, 1), ('q', 19, 1), ('e', 27, 1),
                                   ('ArrowUp', 28, 1), ('ArrowDown', 27, 1),
                                   ('ArrowLeft', 27, 0), ('ArrowRight', 27, 1),
                                   ('W', 28, 1), ('S', 27, 1), ('A', 27, 0),
                                   ('D', 27, 1), ('Q', 19, 1), ('E', 27, 1)]:
            press(page, key); pose(page, pos, direction)
        inert(page, ['r', 'R', 't', 'T'])
        for modifier in ('Control', 'Alt', 'Meta'):
            inert(page, [modifier+'+'+key for key in ('w', 's', 'a', 'd', 'q', 'e', 'f', 'g', 'm', 'c')])
        # Repeated keydowns must never move/turn/toggle twice.
        for key, pos, direction in [('d', 27, 2), ('w', 35, 2)]:
            page.keyboard.down(key); page.wait_for_function('!logBusy()')
            pose(page, pos, direction)
            page.keyboard.down(key); pose(page, pos, direction)
            page.keyboard.up(key)
        press(page, 's'); press(page, 'a'); pose(page, 27, 1)
        # Move off the tested cross to flag an unopened front cell.
        press(page, 'e'); pose(page, 35, 1)
        assert page.evaluate('!s.cells[36].open')
        page.keyboard.down('f'); page.keyboard.down('f'); page.keyboard.up('f')
        assert snapshot(page)['flags'][36] == 'power'
        press(page, 'F'); assert snapshot(page)['flags'][36] is False
        page.keyboard.down('g'); page.keyboard.down('g'); page.keyboard.up('g')
        assert snapshot(page)['kind'] == 'guard'
        press(page, 'f'); assert snapshot(page)['flags'][36] == 'guard'
        press(page, 'f'); assert snapshot(page)['flags'][36] is False
        page.keyboard.down('M'); page.keyboard.down('M'); page.keyboard.up('M')
        assert page.locator('#mapdialog').is_visible()
        inert(page, ['w', 'f', 'F', 'g', 'G', 'r', 't'])
        press(page, 'm'); assert not page.locator('#mapdialog').is_visible()
        press(page, 'm'); press(page, 'Escape')
        assert not page.locator('#mapdialog').is_visible()
        press(page, 'c'); assert page.locator('#statsdialog').is_visible()
        inert(page, ['w', 'f', 'g', 't'])
        press(page, 'Escape'); assert not page.locator('#statsdialog').is_visible()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        context.close()

        # Exterior wall / row boundary: F must not wrap to a different row.
        context, page = load(fixture(area='dungeon', pos=0, start=0, dir=0))
        assert page.evaluate('target()') == -1
        inert(page, ['f', 'F'])
        press(page, 'a'); pose(page, 0, 3)
        assert page.evaluate('target()') == -1
        inert(page, ['f'])
        context.close()

        # Saved combat, chest and confirmation states exercise real UI layers.
        combat = dict(dataVersion=1, boss=False, units=[dict(id='slime', uid=0, row=0,
                      hp=20, rewarded=False)], target=0, initiative='normal')
        for name, save, visible in [
            ('combat', fixture(area='dungeon', pos=27, enemy=combat), '#battle'),
            ('chest', fixture(area='dungeon', pos=27), '#chestactions'),
            ('stairs', fixture(area='dungeon', pendingStairs=True), '#bosschoice'),
            ('boss', fixture(area='dungeon', pendingBoss=dict(previous=26)), '#bosschoice')]:
            if name == 'chest':
                save['cells'][27]['chest'] = dict(opened=False, trap='none', gold=3)
            context, page = load(save)
            assert page.locator(visible).is_visible(), name
            inert(page, ['w', 'f', 's', 'a', 'd', 'q', 'e', 't'])
            context.close()

        # Both return buttons have no T shortcut; WASD focus + Space returns.
        for changes, selector in [(dict(done=True), '#backtown'),
                                  (dict(clearNotice=True, cleared=True), '#cleartown')]:
            context, page = load(fixture(area='dungeon', **changes))
            assert page.locator(selector).is_visible()
            inert(page, ['t', 'T'])
            focus_return(page, selector)
            assert page.locator('#town').is_visible()
            context.close()
        assert not errors, errors
        print(f'PASS explore keys {width}px: exact movement, flags, dialogs, guards, WASD return, no JS errors')
    browser.close()
