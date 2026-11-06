#!/usr/bin/env python3
"""078: 地図の数字の中心を390pxのダイアログとPCのドックで検証する。
Serve: python3 -m http.server 8000 --directory dist
Run: python3 tests/map-cell-alignment-browser.py [http://127.0.0.1:8000/]
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

with sync_playwright() as p:
    opts = {'headless': True, 'args': ['--no-sandbox']}
    if chrome:
        opts['executable_path'] = chrome
    browser = p.chromium.launch(**opts)
    for width in (390, 1280):
        context = browser.new_context(viewport={'width': width, 'height': 900},
                                      has_touch=width == 390)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
        for floor, n in ((3, 12), (1, 8)):
            # Use the actual floor sizing/rendering, with deterministic visible numbers.
            # No movement or encounters are needed for this layout regression.
            page.evaluate('''floor => {
                fresh(floor);
                s.corpses = [];
                s.cells.forEach((c, i) => {
                    c.open = true;
                    c.type = '';
                    c.flag = false;
                    c.trap = i % 5 === 0;
                    delete c.chest;
                });
                render();
            }''', floor)
            assert page.evaluate('s.size') == n
            root = '#mapdialog' if width == 390 else '#mapdock'
            if width == 390:
                page.locator('#maptoggle').tap()
            assert page.locator(root).is_visible()
            assert page.locator(f'{root} .cell').count() == n * n
            page.evaluate('document.fonts.ready')
            offsets = page.locator(f'{root} .cell-number').evaluate_all('''spans =>
                spans.filter(el => /^\\d+$/.test(el.textContent.trim())).map(el => {
                    const a = el.getBoundingClientRect();
                    const b = el.closest('.cell').getBoundingClientRect();
                    return {text: el.textContent, cell: el.closest('.cell').dataset.i,
                        width: a.width, height: a.height,
                        dx: a.x + a.width / 2 - b.x - b.width / 2,
                        dy: a.y + a.height / 2 - b.y - b.height / 2};
                })''')
            assert len(offsets) == n * n, 'Every fixture cell must display a number'
            assert any(int(o['text']) > 0 for o in offsets), 'Include nonzero numbers'
            bad = [o for o in offsets if o['width'] <= 0 or o['height'] <= 0
                   or abs(o['dx']) > 2 or abs(o['dy']) > 2]
            assert not bad, f'{width}px {n}x{n}: number center outside ±2px: {bad}'
            if width == 390:
                page.locator('#mapclose').click()
                page.wait_for_function("!document.querySelector('#mapdialog').open")
            print(f'PASS map-cell-alignment {width}px {n}x{n}: '
                  f'{len(offsets)} numbers centered within ±2px on both axes')
        assert not errors, errors
        context.close()
    browser.close()
