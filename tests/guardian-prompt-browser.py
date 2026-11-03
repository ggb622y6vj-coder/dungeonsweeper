"""055: guardian scene text and 戦う/戻る labels at 1280px and 390px.

A disposable save is installed before startup (battle-keys fixture). Moves and
answers use page.keyboard / real clicks only; evaluate is read-only.
Run: python3 tests/guardian-prompt-browser.py [http://127.0.0.1:8000/]
"""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
src = Path(__file__).with_name('battle-keys-browser.py').read_text()
bk = {}
exec(src.split('\nwith sync_playwright()')[0], bk)  # reuse fixture/selected/ring without running that suite
fixture, ring, chrome = bk['fixture'], bk['ring'], bk['chrome']
TEXT = '階段の上に長い手足の男が覆いかぶさっている。'

def labels(page):
    return page.evaluate('[$("#bossyes").textContent,$("#bossno").textContent]')

def single_line(page):
    return page.evaluate('''["#bossyes","#bossno"].every(id=>{const e=document.querySelector(id),
      cs=getComputedStyle(e),lh=parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.5;
      const r=document.createRange();r.selectNodeContents(e);
      return r.getClientRects().length===1&&e.scrollWidth<=e.clientWidth+1})
      && document.documentElement.scrollWidth<=innerWidth''')

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    for width in (1280, 390):
        errors = []
        def load(save, context=None):
            context = browser.new_context(viewport=dict(width=width, height=900), has_touch=width == 390)
            context.add_init_script('if(!sessionStorage.getItem("seeded")){localStorage.setItem("ash-v1", '+json.dumps(json.dumps(save))+');sessionStorage.setItem("seeded","1")} Math.random=()=>.99;')
            page = context.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(URL)
            page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
            return context, page
        def step_in(page):
            assert page.evaluate('s.pos===27 && s.dir===1')
            page.keyboard.press('w')
            page.wait_for_function('!logBusy()')
            assert page.evaluate('!!s.pendingBoss && s.pos===28 && !s.enemy')
            assert page.evaluate('s.logs[0]') == TEXT, page.evaluate('s.logs.slice(-3)')
            assert labels(page) == ['戦う', '戻る'], labels(page)
            assert page.locator('#bosschoice').is_visible() and single_line(page)
            ring(page, '#bossno')
        context, page = load(fixture())
        step_in(page)
        # Reload while the prompt is open: the prompt and labels come back.
        page.reload(); page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
        assert page.evaluate('!!s.pendingBoss') and labels(page) == ['戦う', '戻る']
        # Escape = 戻る: back one cell, existing log, no battle; re-entry prompts again.
        page.keyboard.press('Escape'); page.wait_for_function('!logBusy()')
        assert page.evaluate('s.pos===27 && !s.pendingBoss && !s.enemy && s.cells[28].open')
        assert page.evaluate('s.logs[0]') == '戦闘を避け、一歩前のマスへ戻った。'
        step_in(page)
        page.locator('#bossno').click(); page.wait_for_function('!logBusy()')
        assert page.evaluate('s.pos===27 && !s.enemy')
        step_in(page)
        page.locator('#bossyes').click()
        page.wait_for_function('!!s.enemy && s.enemy.boss')
        context.close()
        # Stairs prompts keep はい/いいえ.
        context, page = load(fixture(pos=26, pendingStairs=True))
        assert labels(page) == ['はい', 'いいえ']
        context.close()
        context, page = load(fixture(pos=28, relic=True, pendingStairs='down'))
        assert labels(page) == ['はい', 'いいえ']
        context.close()
        assert not errors, errors
        print(f'PASS guardian prompt {width}px: scene text, 戦う/戻る single-line, reload keeps prompt, Esc/戻る return, re-entry, 戦う battle, stairs はい/いいえ, no JS errors')
    browser.close()
