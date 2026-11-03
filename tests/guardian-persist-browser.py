"""056: a defeated guardian stays gone after town / regeneration / reload (1280px, 390px).
Disposable saves are installed before startup; evaluate is read-only.
Run: python3 tests/guardian-persist-browser.py [http://127.0.0.1:8000/]
"""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
bk = {}
exec(Path(__file__).with_name('battle-keys-browser.py').read_text().split('\nwith sync_playwright()')[0], bk)
fixture, chrome = bk['fixture'], bk['chrome']

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    for width in (1280, 390):
        errors = []
        def load(save):
            context = browser.new_context(viewport=dict(width=width, height=900), has_touch=width == 390)
            context.add_init_script('if(!sessionStorage.getItem("seeded")){localStorage.setItem("ash-v1", '+json.dumps(json.dumps(save))+');sessionStorage.setItem("seeded","1")} Math.random=()=>.99;')
            page = context.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(URL)
            page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
            return context, page
        # Save with 1F already defeated: entering builds a fresh 1F whose guardian room is ⇩.
        context, page = load(fixture(area='town', guardiansDefeated=[1]))
        page.locator('#entrance').click(); page.wait_for_function("s.area==='dungeon' && !logBusy()")
        info = lambda: page.evaluate("({f:s.floor,boss:s.cells[s.boss].type,count:s.cells.filter(c=>c.type==='boss').length,def:s.guardiansDefeated,status:$('#status').textContent})")
        v = info(); assert v['f'] == 1 and v['boss'] == 'down' and v['count'] == 0 and v['def'] == [1] and '秘宝' not in v['status'], v
        page.reload(); page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
        v = info(); assert v['boss'] == 'down' and v['count'] == 0 and v['def'] == [1], v
        context.close()
        # Old save without the field: guardian alive, field defaults to [].
        context, page = load(fixture(area='town'))
        page.locator('#entrance').click(); page.wait_for_function("s.area==='dungeon' && !logBusy()")
        v = info(); assert v['boss'] == 'boss' and v['count'] == 1 and v['def'] == [], v
        context.close()
        assert not errors, errors
        print(f'PASS guardian persist {width}px: defeated 1F guardian room is ⇩ after entry and reload, no relic mark, legacy save keeps guardian, no JS errors')
    browser.close()
