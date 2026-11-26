#!/usr/bin/env python3
"""仕様148の5F地図・透視枠・命の泉をPCとスマートフォンで確認する。
python3 -m http.server 8000 --directory dist
python3 tests/floor5-browser.py [http://127.0.0.1:8000/]
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome') if Path(p).exists()), None)

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
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav')
        page.evaluate('''() => {
            for (const [name,job] of [['戦士',0], ['僧侶',2]]) {
                const recruit = generateRecruit(name,job);
                if (!registerRecruit(recruit) || !changeRecruitParty(recruit.members.id,true))
                    throw new Error('パーティーを編成できなかった');
            }
            fresh(5);
            s.floorZones = ['blind','anti',null,null];
            s.cells = s.cells.map(() => ({open:false,trap:false,type:'',flag:false}));
            s.cells[65].open = true;
            s.cells[77].fountain = true;
            s.dir = 2;
            setPlayerPosition(65);
            s.hp = [1,2];
            render();
        }''')
        board = page.locator('#board')
        assert board.locator('.cell.blind').count() == 144
        assert board.locator('.cell-number, .direction-marker, .zoneframe, .antiframe').count() == 0
        if mobile:
            page.locator('#maptoggle').tap()
        else:
            page.keyboard.press('m')
        dialog = page.locator('#mapdialog')
        dialog.wait_for(state='visible')
        notice = dialog.locator('#mapblindnotice')
        assert notice.is_visible() and notice.inner_text() == '地図が反応しない！'
        page.evaluate('() => { s.milwaSteps = 8; render(); }')
        for i, frame, vertical in [(65,'zoneframe','right'), (66,'antiframe','left')]:
            assert dialog.locator(f'.cell.blind.{frame}-{vertical}.{frame}-bottom[data-i="{i}"]').is_visible()
        assert dialog.locator('.zoneframe-top, .antiframe-top').count() == 0
        page.locator('#mapclose').click()
        page.wait_for_selector('#mapdock #board', state='attached')
        if not mobile:
            assert board.locator('.cell.blind.zoneframe-bottom[data-i="65"]').is_visible()

        page.locator('[data-action="forward"]').click()
        fountain = page.get_by_role('dialog', name='命の泉')
        fountain.wait_for(state='visible')
        assert fountain.get_by_text('澄んだ水が満ちている。パーティー全員のHPかMPを全回復できる。').is_visible()
        assert fountain.get_by_role('button').all_text_contents() == ['HPを全回復', 'MPを全回復', '使わない']
        assert page.evaluate('s.pos === 77 && s.pendingFountain && !s.enemy')
        assert page.locator('[data-action="forward"]').is_disabled()
        assert board.locator('.cell.blind').count() == 0
        assert board.locator('.cell.here .cell-number').text_content() == '0'
        fountain.get_by_role('button', name='HPを全回復').click()
        fountain.wait_for(state='hidden')
        page.wait_for_function('!logBusy()')
        assert page.evaluate('!s.pendingFountain && s.cells[77].fountain === false && idle()')
        assert page.evaluate('s.hp') == page.evaluate('s.members.map(m => m.maxHP)')
        assert page.evaluate('s.logs[0]') == '命の泉の力で、全員のHPが全回復した！'
        assert not errors, errors
        print(f'PASS 148 5F {width}px: blind map, quadrant frames, fountain HP recovery')
        context.close()
    browser.close()
