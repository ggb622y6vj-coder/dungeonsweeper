#!/usr/bin/env python3
"""117: 4Fの反呪文の結界をPCとスマホで検証する。
Serve: python3 -m http.server 8000 --directory dist
Run: python3 tests/117-antimagic-zone-browser.py [http://127.0.0.1:8000/]
Requires Playwright Python and Chromium (or CHROME_PATH).
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome') if Path(p).exists()), None)

NEGATED = '反呪文の結界に打ち消された！'
EFFECT = {
    'name': '反呪文の結界',
    'description': '全ての呪文が打ち消された！',
    'remaining': '',
}
EFFECT_FIELDS = '[s.milwaSteps, s.light, s.watchful, s.flagSight, s.teppeki]'
SET_EFFECTS = 'Object.assign(s, {milwaSteps: 10, light: true, watchful: true, flagSight: true, teppeki: true})'
ACTIVE = [10, True, True, True, True]
CLEARED = [0, False, False, False, False]

# 上から4・6・6・6・6・4マス。外周の各マスで外向きの辺だけを調べる。
zone = {(x, y) for y, columns in enumerate(
    (range(4, 8), range(3, 9), range(3, 9), range(3, 9), range(3, 9), range(4, 8)), 3)
    for x in columns}
directions = {'top': (0, -1), 'right': (1, 0), 'bottom': (0, 1), 'left': (-1, 0)}
expected_edges = {}
for x, y in sorted(zone):
    edges = [side for side, (dx, dy) in directions.items() if (x + dx, y + dy) not in zone]
    if edges:
        expected_edges[str(y * 12 + x)] = edges
assert len(zone) == 32 and len(expected_edges) == 16


def assert_frame(board, frame, color, line):
    framed = board.locator(f'.cell.{frame}')
    assert framed.count() == 16
    assert set(framed.evaluate_all('cells => cells.map(cell => cell.dataset.i)')) == set(expected_edges)
    assert board.locator('.cell').evaluate_all('''(cells, frame) =>
        Object.fromEntries(cells.flatMap(cell => {
            const edges = ['top', 'right', 'bottom', 'left'].filter(side =>
                cell.classList.contains(frame + '-' + side));
            return edges.length ? [[cell.dataset.i, edges]] : [];
        }))''', frame) == expected_edges
    assert board.locator('.cell').evaluate_all('''(cells, [color, line]) =>
        Object.fromEntries(cells.flatMap(cell => {
            const style = getComputedStyle(cell);
            const edges = ['top', 'right', 'bottom', 'left'].filter(side =>
                style.getPropertyValue('border-' + side + '-color') === color &&
                style.getPropertyValue('border-' + side + '-style') === line &&
                style.getPropertyValue('border-' + side + '-width') === '2px');
            return edges.length ? [[cell.dataset.i, edges]] : [];
        }))''', [color, line]) == expected_edges


def move_quietly(page, action):
    page.evaluate('''action => {
        const random = Math.random;
        try { Math.random = () => .99; move(action); }
        finally { Math.random = random; }
    }''', action)
    page.wait_for_function('!logBusy()')


def cast_flag_sight(page):
    page.evaluate('openMagic(0)')
    page.locator('#magicdialog [data-spell="flagview"]').click()
    cast = page.locator('#magiccast')
    assert cast.is_enabled()
    cast.click()
    assert not page.locator('#magicdialog').is_visible()
    page.wait_for_function('!logBusy()')


def monster_action(page, rolls):
    return page.evaluate('''rolls => {
        const random = Math.random;
        try {
            Math.random = () => rolls.shift() ?? .99;
            return monsterAction(s.enemy.units[0], s.commands);
        } finally { Math.random = random; }
    }''', rolls)


with sync_playwright() as p:
    opts = {'headless': True, 'args': ['--no-sandbox']}
    if chrome:
        opts['executable_path'] = chrome
    browser = p.chromium.launch(**opts)
    for width in (1280, 390):
        mobile = width == 390
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=mobile)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav')
        page.evaluate('''() => {
            for (const [name, job] of [['魔術師', 1], ['僧侶', 2]]) {
                const recruit = generateRecruit(name, job);
                registerRecruit(recruit);
                changeRecruitParty(recruit.members.id, true);
            }
            fresh(4);
            s.members.forEach(m => Object.assign(m, {level: 5, maxMP: 40}));
            s.members[0].known = ['halito', 'flagview', 'dumapic'];
            s.members[1].known = ['floodfill', 'calfo'];
            s.mp = [40, 40];
            s.cells = s.cells.map(() => ({open: false, trap: false, flag: false, type: ''}));
            s.pos = 39; // (3, 3), ゾーンの外
            s.dir = 2;
            s.cells[39].open = s.cells[51].open = true;
            s.ailments[1].silence = 2;
            s.dumapicUses = s.floodUses = 1;
            render();
        }''')
        board = page.locator('#board')
        dialog = page.locator('#mapdialog')

        def open_map():
            if mobile:
                page.locator('#maptoggle').tap()
            else:
                page.keyboard.press('m')
            dialog.wait_for(state='visible')
            assert dialog.locator('#board').is_visible()

        def close_map():
            page.locator('#mapclose').click()
            page.wait_for_selector('#mapdock #board', state='attached')

        open_map()
        assert board.locator('.antiframe').count() == 0
        for light in ('s.milwaSteps = 10', 's.milwaSteps = 0; s.light = true'):
            page.evaluate(f'() => {{ {light}; render(); }}')
            assert_frame(board, 'antiframe', 'rgb(255, 134, 134)', 'dashed')
            assert board.locator('.zoneframe, .blind').count() == 0
        close_map()

        page.evaluate(f'() => {{ {SET_EFFECTS}; render(); }}')
        assert page.evaluate(EFFECT_FIELDS) == ACTIVE
        logs = page.evaluate('s.logs')
        move_quietly(page, 'forward')  # (3, 4), ゾーン内の縁
        assert page.evaluate('s.pos') == 51
        assert page.evaluate(EFFECT_FIELDS) == CLEARED
        assert page.evaluate('[s.ailments[1].silence, s.dumapicUses, s.floodUses]') == [2, 1, 1]
        assert page.evaluate('s.logs') == logs
        assert page.evaluate('activeSpellEffects()') == [EFFECT]
        assert board.locator('.antiframe, .zoneframe, .blind').count() == 0
        assert board.locator('.cell.here .cell-number').count() == 1
        page.locator('#party').click()
        page.locator('#activespells').click()
        effect_card = page.locator('#activespellbody .statcard')
        assert effect_card.count() == 1
        assert effect_card.get_by_text(EFFECT['name'], exact=True).is_visible()
        assert effect_card.get_by_text(EFFECT['description'], exact=True).is_visible()
        assert effect_card.locator('p').all_text_contents() == [EFFECT['description'], EFFECT['remaining']]
        page.locator('#activespellclose').click()
        page.locator('#statsclose').click()

        move_quietly(page, 'back')
        assert page.evaluate('s.pos') == 39
        assert page.evaluate(EFFECT_FIELDS) == CLEARED
        assert page.evaluate('activeSpellEffects()') == []
        assert page.evaluate('s.logs') == logs
        move_quietly(page, 'forward')
        assert page.evaluate('s.pos') == 51

        mp = page.evaluate('s.mp[0]')
        cast_flag_sight(page)
        assert page.evaluate('s.logs') == [NEGATED, *logs]
        assert page.evaluate('s.mp[0]') == mp
        assert not page.evaluate('s.flagSight')
        move_quietly(page, 'back')
        cast_flag_sight(page)
        assert page.evaluate('s.logs[0]') == '周囲の旗が見えるようになった。'
        assert page.evaluate('s.mp[0]') == mp - 2
        assert page.evaluate('s.flagSight')
        move_quietly(page, 'forward')
        assert not page.evaluate('s.flagSight')

        # 判別・開放の使用回数と、血の代償によるHP消費を確認する。
        page.evaluate('''() => {
            s.inventory[0].push('bloodsac');
            s.equipped[0] = s.inventory[0].length - 1;
            s.ailments[1].silence = 0;
        }''')
        counters_and_vitals = '({hp: s.hp, mp: s.mp, survey: s.dumapicUses, flood: s.floodUses})'
        before = page.evaluate(counters_and_vitals)
        logs = page.evaluate('s.logs')
        for member, spell in ((0, 'dumapic'), (1, 'floodfill')):
            assert page.evaluate('([i, id]) => spellReason(i, magic(id))', [member, spell]) == ''
            assert not page.evaluate('([i, id]) => castMagic(i, id, null)', [member, spell])
            page.wait_for_function('!logBusy()')
        assert page.evaluate(counters_and_vitals) == before
        assert page.evaluate('s.logs') == [NEGATED, NEGATED, *logs]

        # 宝箱と薬は、それぞれ通常のボタンと使用経路を通す。
        page.evaluate("() => { s.cells[s.pos].chest = {opened: false, trap: 'poison'}; render(); }")
        logs = page.evaluate('s.logs')
        page.locator('#chestcalfo').click()
        page.wait_for_function('!logBusy()')
        assert page.evaluate('s.logs') == [NEGATED, *logs]
        assert not page.evaluate('currentChest().reading')
        assert page.evaluate('s.mp') == before['mp']
        assert page.evaluate('''() => {
            delete s.cells[s.pos].chest;
            s.hp[1] = 1;
            const slot = s.inventory[0].push('healingPotion') - 1;
            return useMedicine(0, slot, 1);
        }''')
        page.wait_for_function('!logBusy()')
        assert page.evaluate("s.hp[1] > 1 && !s.inventory[0].includes('healingPotion')")

        page.evaluate('''() => {
            s.enemy = {dataVersion: 1, units: [{...makeEnemy('darkpriest', 91),
                row: 17, hp: 99, identified: true}], initiative: 'party', flagEffect: {}};
            resetPartyCommands();
            render();
        }''')
        page.locator('[data-command-choice="spell"]').click()
        halito = page.locator('#magicdialog [data-spell="halito"]')
        assert halito.is_enabled()
        halito.click()
        assert page.evaluate("s.commands[0] === 'spell' && s.magicPlans[0].target === 91")
        page.locator('[data-command-choice="guard"]').click()
        before = page.evaluate(counters_and_vitals)
        logs = page.evaluate('s.logs')
        page.locator('#attack').click()
        page.wait_for_function('!logBusy()')
        assert page.evaluate('s.logs[0]') == NEGATED
        assert page.evaluate('s.logs.slice(3)') == logs  # 開始、守る、打ち消し
        assert page.evaluate(counters_and_vitals) == before
        assert page.evaluate("s.enemy.units[0].hp === 99 && s.enemy.initiative === 'normal' && !s.magicPlans[0]")

        logs = page.evaluate('s.logs')
        # 闇の司祭は仲間呼び10%の次に詠唱50%。魔法使い系の誘睡を選ぶ。
        assert monster_action(page, [.25, 0, .99, .99])
        page.wait_for_function('!logBusy()')
        assert page.evaluate('s.logs') == [NEGATED, *logs]
        assert page.evaluate('s.hp') == before['hp']
        assert page.evaluate('s.ailments.map(a => a.sleep)') == [0, 0]
        page.evaluate('s.enemy.units[0].silence = true')
        assert not monster_action(page, [.25])
        assert page.evaluate('!logBusy()')
        assert monster_action(page, [.05])  # 仲間呼びは打ち消されない
        page.wait_for_function('!logBusy()')
        assert page.evaluate('s.logs[0]') == '闇の司祭は仲間を呼んだ。'
        assert page.evaluate('s.enemy.units.length') == 2
        page.evaluate('() => { s.pos = 39; s.enemy.units[0].silence = false; render(); }')
        logs = page.evaluate('s.logs')
        assert monster_action(page, [.25, 0, .99, .99])
        page.wait_for_function('!logBusy()')
        assert page.evaluate('s.logs[2]') == '闇の司祭は誘睡を唱えた。'
        assert page.evaluate('s.logs.slice(3)') == logs
        assert page.evaluate('s.ailments.map(a => a.sleep)') == [2, 2]

        page.evaluate('() => { fresh(3); s.pos = 51; s.light = true; render(); }')
        open_map()
        assert_frame(board, 'zoneframe', 'rgb(192, 161, 237)', 'solid')
        assert board.locator('.antiframe').count() == 0
        assert board.locator('.cell.blind').count() == 144
        close_map()

        page.evaluate(f'''() => {{
            fresh(5);
            s.floorZones = [null, null, null, null];
            s.pos = 65;
            s.cells[s.pos].open = true;
            s.ailments = s.members.map(() => freshAilments());
            {SET_EFFECTS};
            render();
        }}''')
        assert page.evaluate(EFFECT_FIELDS) == ACTIVE
        assert EFFECT not in page.evaluate('activeSpellEffects()')
        open_map()
        assert board.locator('.antiframe, .zoneframe, .blind').count() == 0
        close_map()
        mp = page.evaluate('s.mp[0]')
        cost = page.evaluate("spellCost(magic('dumapic'), 0)")
        assert page.evaluate("castMagic(0, 'dumapic', null)")
        page.wait_for_function('!logBusy()')
        assert page.evaluate('s.mp[0]') == mp - cost
        assert page.evaluate('s.dumapicUses') == 2
        assert NEGATED not in page.evaluate('s.logs')

        # 新規4Fの上り階段を結界内に固定する。昇降機・落とし穴の着地点は結界外。
        for route in ('stairs', 'elevator', 'pitfall'):
            page.evaluate(f'''route => {{
                fresh(3);
                {SET_EFFECTS};
                s.elevatorFloors = [4];
                s.pos = s.boss;
                s.cells[s.boss].type = 'down';
                s.relic = true;
                const random = Math.random, rolls = [65.5 / 144];
                try {{
                    Math.random = () => rolls.shift() ?? .99;
                    if (route === 'stairs') travelFloor(4);
                    else if (route === 'elevator') travelElevator(4);
                    else descendPitfall();
                }} finally {{ Math.random = random; }}
                render();
            }}''', route)
            page.wait_for_function('!logBusy()')
            assert page.evaluate('s.floor === 4 && s.start === 65')
            assert page.evaluate('isAntimagicZone()') == (route == 'stairs')
            assert page.evaluate(EFFECT_FIELDS) == (CLEARED if route == 'stairs' else ACTIVE)
            assert all(EFFECT['name'] not in line for line in page.evaluate('s.logs'))

        assert not errors, errors
        print(f'PASS 117 anti-magic zone {width}px: dispel, field/chest/battle spells, enemy spells, frames')
        context.close()
    browser.close()
