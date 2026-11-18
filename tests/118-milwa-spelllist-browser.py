#!/usr/bin/env python3
"""118: 階移動後の透視、宝箱の仕掛解除、呪文一覧の順序をPCとスマホで検証する。
Serve: python3 -m http.server 8000 --directory dist
Run: python3 tests/118-milwa-spelllist-browser.py [http://127.0.0.1:8000/]
Requires Playwright Python and Chromium (or CHROME_PATH).
"""
import os
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome') if Path(p).exists()), None)


def assert_milwa(page, steps):
    page.wait_for_function('!logBusy()')
    assert page.evaluate('s.milwaSteps') == steps
    page.locator('#party').click()
    active_spells = page.locator('#activespells')
    body = page.locator('#activespellbody')
    effect = body.locator('.statcard').filter(has=page.get_by_text('透視', exact=True))
    if steps:
        active_spells.click()
        assert effect.count() == 1
        assert effect.get_by_text(f'あと{steps}歩', exact=True).is_visible()
        page.locator('#activespellclose').click()
    else:
        assert not active_spells.is_visible()
        assert effect.count() == 0
    page.locator('#statsclose').click()


def assert_spell_order(page, expected_ids, expected_levels):
    rows = page.locator('#magiclist .spellrow')
    levels = [int(re.match(r'Lv\.(\d+)\b', label)[1])
              for label in rows.locator('small').all_text_contents()]
    assert levels == expected_levels
    assert rows.evaluate_all('rows => rows.map(row => row.dataset.spell)') == expected_ids
    default = page.locator('#magiclist .spellrow[data-key-default]')
    assert default.count() == 1
    assert default.get_attribute('data-spell') == expected_ids[0]


with sync_playwright() as p:
    opts = {'headless': True, 'args': ['--no-sandbox']}
    if chrome:
        opts['executable_path'] = chrome
    browser = p.chromium.launch(**opts)
    for width in (1280, 390):
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width == 390)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav')
        page.evaluate('''() => {
            const recruit = generateRecruit('僧侶', 2);
            registerRecruit(recruit);
            changeRecruitParty(recruit.members.id, true);
            fresh(1);
            s.milwaSteps = 2;
            s.relic = true;
            s.pos = s.boss;
            s.cells[s.boss].type = 'down';
            travelFloor(2);
        }''')
        assert page.evaluate('s.floor') == 2
        assert_milwa(page, 2)

        assert page.evaluate('() => { s.elevatorFloors = [1, 2]; return travelElevator(1); }')
        assert page.evaluate('s.floor') == 1
        assert_milwa(page, 2)

        assert page.evaluate('''() => {
            const random = Math.random;
            try { Math.random = () => .5; return descendPitfall(); }
            finally { Math.random = random; }
        }''')
        assert page.evaluate('s.floor') == 2
        assert_milwa(page, 2)

        # 安全な探索済みの2マスを往復し、歩数だけを消費する。
        origin = page.evaluate('''() => {
            s.pos = 3 * size() + 3;
            s.dir = 1;
            for (const i of [s.pos, target()]) {
                s.cells[i] = {open: true, trap: false, flag: false, type: ''};
            }
            render();
            return s.pos;
        }''')
        for action, pos, steps in (('forward', origin + 1, 1), ('back', origin, 0)):
            page.evaluate('''action => {
                const random = Math.random;
                try { Math.random = () => .99; move(action); }
                finally { Math.random = random; }
            }''', action)
            assert page.evaluate('s.pos') == pos
            assert_milwa(page, steps)

        page.evaluate('''() => {
            Object.assign(s.members[0], {level: 7, maxMP: 40, known: [
                'halito', 'reload', 'flagdebuff', 'dumapic',
                'lomilwa', 'calfo', 'milwa', 'dios', 'sweep', 'watchful', 'floodfill',
            ]});
            s.mp[0] = 40;
            s.cells[s.pos].chest = {opened: false, trap: 'poison'};
            render();
        }''')
        calfo = page.locator('#chestcalfo')
        assert calfo.is_visible()
        assert calfo.inner_text() == '仕掛解除'
        assert 'カルフォ' not in page.locator('body').inner_text()
        random = page.evaluate_handle('() => Math.random')
        try:
            page.evaluate('() => { Math.random = () => .5; }')
            calfo.click()
        finally:
            page.evaluate('random => { Math.random = random; }', random)
            random.dispose()
        page.wait_for_function('!logBusy()')
        assert '仕掛解除を唱えた。' in page.locator('#log').inner_text()
        assert '宝箱の鑑定結果：毒。' in page.locator('#log').inner_text()
        assert page.evaluate('s.mp[0]') == 37
        assert page.evaluate("currentChest().trap === 'poison' && currentChest().reading === '毒'")
        page.evaluate('() => { delete s.cells[s.pos].chest; render(); }')

        # 習得順と定義順が異なる同レベル呪文を両系統に含める。
        for browse in (False, True):
            page.evaluate('browse => openMagic(0, browse)', browse)
            assert page.locator('#magicdialog').is_visible()
            assert page.locator('#magictab-2').get_attribute('aria-selected') == 'true'
            assert_spell_order(
                page, ['dios', 'watchful', 'milwa', 'calfo', 'sweep', 'floodfill', 'lomilwa'],
                [1, 3, 3, 3, 4, 5, 7],
            )
            page.locator('#magictab-1').click()
            assert page.locator('#magictab-1').get_attribute('aria-selected') == 'true'
            assert_spell_order(page, ['dumapic', 'halito', 'flagdebuff', 'reload'], [1, 1, 2, 4])
            page.locator('#magicclose').click()

        assert not errors, errors
        print(f'PASS 118 {width}px: milwa travel/expiry, chest Calfo, stable spell order in both modes')
        context.close()
    browser.close()
