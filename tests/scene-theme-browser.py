"""079: scene palettes and party buttons at desktop/mobile widths.
Run with dist served at http://localhost:8000/ (optional URL argument).
"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
out = Path(os.environ.get('SCENE_THEME_SCREENSHOT_DIR', '/tmp/scene-theme-browser'))
out.mkdir(parents=True, exist_ok=True)
chrome = os.environ.get('CHROME_PATH') or next((str(x) for x in map(Path, (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser')) if x.exists()), None)
# ceiling, back, current, numbered, door, guardian, guardian border, button, deep
bands = [
    (1, 'green', '#121914 #2d382d #3b493c #34413a #151f1b #231b18 #b58663', None, None),
    (2, 'blue', '#101623 #232c42 #2e3c5c #2a3852 #141b29 #1d1a24 #7d86b5', '#293b51', '#101722'),
    (4, 'yellow', '#171408 #38331e #4a422a #443d27 #1d1a10 #241d12 #b59a5e', '#40452b', '#17190f'),
    (6, 'orange', '#1a120b #3a2c1e #54402a #4d3b27 #201810 #26180f #c08d54', '#4d3829', '#1c140f'),
    (8, 'red', '#1a0f10 #3a2326 #542e33 #4d2a2f #201214 #261214 #bd7268', '#492c33', '#1b1014'),
    (10, 'purple', '#140f1d #2c2340 #41335c #3b2f52 #191325 #201226 #9a7fc0', '#41304c', '#17111d'),
]
def rgb(color):
    return 'rgb(%d, %d, %d)' % tuple(int(color[i:i+2], 16) for i in (1, 3, 5))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=chrome, args=['--no-sandbox'])
    for width in (1280, 390):
        ctx = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
        page = ctx.new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.evaluate("""()=>{
          const r=generateRecruit('冒険者',0);registerRecruit(r);changeRecruitParty(r.members.id,true);
          s.area='dungeon';s.pos=size()*3+3;s.dir=0;
          for(const i of [target(),target(-1),target(1)])Object.assign(s.cells[i],{open:false,safe:false,flag:false,type:'',chest:null});
          s.cells[target()].open=true;s.cells[target(-1)].safe=true;s.pendingBoss=true;render();
        }""")
        for floor, band, colors, button, deep in bands:
            page.evaluate('(floor)=>{s.floor=floor;render()}', floor)
            assert page.locator('body').get_attribute('data-floor-theme') == band
            svg = page.locator('#scene svg').evaluate('(e)=>e.outerHTML')
            assert all(c in svg for c in colors.split()), (band, svg)
            if band != 'green':
                assert all(c not in svg for c in bands[0][2].split()), (band, svg)
                # Include all three overlay classes without triggering combat or timing.
                for cls in ('farview', 'scene-enemies', 'encounter-notice'):
                    assert page.evaluate("""cls=>{const e=document.createElement('div');e.className=cls;
                      $('#scene').append(e);const c=getComputedStyle(e).backgroundColor;e.remove();return c}""", cls) == rgb(deep)
            assert '#ffdf9e' in svg
            page.locator('#scene').screenshot(path=str(out / f'scene-{band}-{width}.png'))
            page.evaluate("renderStats();$('#statsdialog').showModal()")
            if button:
                actual = page.locator('#statsbody .statcard button').evaluate_all('(els)=>els.map(e=>getComputedStyle(e).backgroundColor)')
                assert actual and all(c == rgb(button) for c in actual), (band, actual)
            page.locator('#statsclose').click()
        page.evaluate("s.area='town';render()")
        assert page.locator('body').get_attribute('data-floor-theme') == 'green'
        assert '#121914' in page.locator('#scene').inner_html()
        assert not errors, errors
        print(f'PASS scene theme and party buttons {width}px')
        ctx.close()
    browser.close()
