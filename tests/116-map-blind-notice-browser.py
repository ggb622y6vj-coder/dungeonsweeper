#!/usr/bin/env python3
"""116: 地図ダイアログの通知と3Fの透視枠を検証する。
Serve: python3 -m http.server 8000 --directory dist
Run: python3 tests/116-map-blind-notice-browser.py [http://127.0.0.1:8000/]
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

# 3Fのゾーンは、上から4・6・6・6・6・4マスの行で構成される。
zone = {(x, y) for y, columns in enumerate(
    (range(4, 8), range(3, 9), range(3, 9), range(3, 9), range(3, 9), range(4, 8)), 3)
    for x in columns}
directions = {'top': (0, -1), 'right': (1, 0), 'bottom': (0, 1), 'left': (-1, 0)}
expected_edges = {}
for x, y in sorted(zone):
    edges = [side for side, (dx, dy) in directions.items() if (x + dx, y + dy) not in zone]
    if edges:
        expected_edges[str(y * 12 + x)] = edges
assert len(expected_edges) == 16


def assert_frame(board):
    cells = board.locator('.cell')
    assert board.locator('.cell.zoneframe').count() == 16
    assert cells.evaluate_all('''cells => Object.fromEntries(cells.flatMap(cell => {
        const style = getComputedStyle(cell);
        const edges = ['top', 'right', 'bottom', 'left'].filter(side =>
            style.getPropertyValue('border-' + side + '-color') === 'rgb(192, 161, 237)' &&
            style.getPropertyValue('border-' + side + '-style') === 'solid' &&
            style.getPropertyValue('border-' + side + '-width') === '2px');
        return edges.length ? [[cell.dataset.i, edges]] : [];
    }))''') == expected_edges
    assert set(board.locator('.zoneframe').evaluate_all(
        'cells => cells.map(c => c.dataset.i)')) == set(expected_edges)


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
            s.pos = 51; // (3, 4), ゾーン内
            s.milwaSteps = 0;
            s.light = false;
            render();
        }''')

        dialog = page.locator('#mapdialog')
        notice = dialog.locator('#mapblindnotice')
        message = notice.get_by_text('地図が反応しない！', exact=True)
        board = dialog.locator('#board')
        assert notice.get_attribute('hidden') is not None
        assert page.locator('#mapdock #mapblindnotice').count() == 0

        def open_map():
            if mobile:
                page.locator('#maptoggle').tap()
            else:
                page.keyboard.press('m')
            dialog.wait_for(state='visible')

        open_map()
        assert message.is_visible()
        board_box = board.bounding_box()
        message_box = message.bounding_box()
        for axis, dimension in (('x', 'width'), ('y', 'height')):
            assert abs((board_box[axis] + board_box[dimension] / 2) -
                       (message_box[axis] + message_box[dimension] / 2)) <= 1
        assert board.locator('.zoneframe').count() == 0

        page.locator('#mapclose').click()
        page.wait_for_selector('#mapdock #board', state='attached')
        assert not message.is_visible()
        assert notice.get_attribute('hidden') is not None

        page.evaluate('''() => {
            s.pos = 39; // (3, 3), ゾーン外
            s.cells[39].open = true;
            render();
        }''')
        open_map()
        assert not message.is_visible()
        assert board.locator('.cell.here .cell-number').count() == 1
        assert board.locator('.zoneframe').count() == 0
        page.evaluate('() => { s.milwaSteps = 2; render(); }')
        assert_frame(board)
        assert board.locator('.cell.here .cell-number').count() == 1
        assert not message.is_visible()

        page.evaluate('() => { s.pos = 51; s.milwaSteps = 0; s.light = true; render(); }')
        assert message.is_visible()
        assert_frame(board)
        blind_cells = board.locator('button.cell.blind')
        assert board.locator('button.cell').count() == blind_cells.count() == 144
        assert blind_cells.evaluate_all('''cells => cells.every(c =>
            c.innerHTML === '' && c.getAttribute('aria-label') === '地図のマス')''')
        page.evaluate('() => { s.light = false; render(); }')
        assert board.locator('.zoneframe').count() == 0
        assert message.is_visible()
        page.evaluate('() => { s.pos = 39; render(); }')
        assert not message.is_visible()

        page.evaluate('() => { s.pos = 51; render(); }')
        assert message.is_visible()
        page.keyboard.press('Escape')
        page.wait_for_selector('#mapdock #board', state='attached')
        assert not message.is_visible()
        assert notice.get_attribute('hidden') is not None

        page.evaluate('''() => {
            fresh(2);
            s.pos = 44;
            s.milwaSteps = 2;
            s.light = true;
            render();
        }''')
        open_map()
        assert not message.is_visible()
        assert board.locator('.cell').count() == 100
        assert board.locator('.zoneframe').count() == 0
        assert not errors, errors
        print(f'PASS 116 map blind notice and clairvoyance frame {width}px')
        context.close()
    browser.close()
