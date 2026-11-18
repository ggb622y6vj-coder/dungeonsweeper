#!/usr/bin/env python3
"""115: 3Fの暗闇ゾーンをPCの盤面とスマホの地図ダイアログで検証する。
Serve: python3 -m http.server 8000 --directory dist
Run: python3 tests/115-dark-zone-browser.py [http://127.0.0.1:8000/]
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

def normalize_board_html(html):
    return re.sub(r'(?<=\s)class="([^"]*)"',
                  lambda match: 'class="' + ' '.join(match[1].split()) + '"',
                  html.replace(' kfocus', ''))


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
            const recruit = generateRecruit('試験', 0);
            registerRecruit(recruit);
            changeRecruitParty(recruit.members.id, true);
            render();
        }''')
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        page.evaluate('''() => {
            fresh(3);
            s.cells = s.cells.map(() => ({open: false, trap: false, flag: false, type: ''}));
            for (const [i, type] of ['stairs', 'down', 'elevator', 'boss', '', ''].entries()) {
                Object.assign(s.cells[i], {open: true, type});
            }
            s.cells[4].chest = {opened: false};
            s.cells[7].safe = true;
            s.cells[26].flag = 'power';
            s.cells[40].trap = true;
            s.cells[39].open = s.cells[51].open = true;
            Object.assign(s.cells[52], {open: true, type: 'elevator'});
            s.corpses = [{floor: 3, cell: 5, records: []}];
            s.flagSight = true;
            s.dir = 1;
            s.pos = 39; // (3, 3)
            render();
        }''')
        root = '#mapdialog' if mobile else '#mapdock'
        if mobile:
            page.locator('#maptoggle').tap()
        board = page.locator(f'{root} #board')
        assert board.is_visible()
        assert board.locator('.here .cell-number').inner_text() == '1'
        assert board.locator('.here .direction-marker').count() == 1
        assert board.locator('.flag-sight-count').inner_text() == '1'
        assert board.locator('.in-view').count() > 0
        assert {'⇧', '⇩', 'E', '☠', '▣', '🦴', '⚑', '✓'} <= set(
            board.locator('.cell-number').all_text_contents())
        normal = normalize_board_html(board.inner_html())
        logs = page.evaluate('s.logs')

        page.evaluate('() => { s.pos = 51; render(); }')  # (3, 4), inside the radius
        cells = board.locator('button')
        assert cells.count() == 144
        assert cells.evaluate_all('cells => cells.map(c => Number(c.dataset.i))') == list(range(144))
        assert cells.evaluate_all('''cells => cells.every(c =>
            c.className === 'cell blind' && c.innerHTML === '' &&
            c.getAttribute('aria-label') === '地図のマス')''')
        assert '正面：探索済み E' in page.locator('#scene svg').get_attribute('aria-label')

        cell = board.locator('button[data-i="6"]')
        cell.click()
        assert page.evaluate('!!s.cells[6].flag')
        assert cell.inner_html() == ''
        cell.click()
        assert not page.evaluate('!!s.cells[6].flag')
        if mobile:
            page.locator('#mapclose').click()
            page.wait_for_selector('#mapdock #board', state='attached')
        page.keyboard.press('d')
        assert page.evaluate('s.dir') == 2
        assert page.locator('#board .cell.blind').count() == 144
        page.keyboard.press('a')
        assert page.evaluate('s.dir') == 1

        page.evaluate('() => { s.pos = 39; render(); }')
        if mobile:
            page.locator('#maptoggle').tap()
        assert normalize_board_html(board.inner_html()) == normal
        assert page.evaluate('s.logs') == logs

        for floor, size, center in ((2, 10, 44), (4, 12, 65)):
            page.evaluate('''([floor, center]) => {
                fresh(floor);
                s.pos = center;
                s.cells[center].open = true;
                render();
            }''', [floor, center])
            assert board.locator('button').count() == size * size
            assert board.locator('.cell.blind').count() == 0
            assert board.locator(f'.cell.here[data-i="{center}"] .cell-number').count() == 1
        assert not errors, errors
        print(f'PASS 115 dark zone {width}px: 3F masking and restoration, input, 2F/4F normal')
        context.close()
    browser.close()
