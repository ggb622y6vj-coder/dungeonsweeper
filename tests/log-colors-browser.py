"""073: ログの色付けでアイテム名「解毒剤」の一部が呪文色にならないこと。
独立した呪文名「解毒」は従来どおり log-spell 色になること。
Run: python3 tests/log-colors-browser.py [http://localhost:8000/]
Screenshots: LOG_COLOR_SCREENSHOT_DIR (default /tmp/log-colors-browser)
"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
out = Path(os.environ.get('LOG_COLOR_SCREENSHOT_DIR', '/tmp/log-colors-browser')); out.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
    for width in (1280, 390):
        ctx = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
        page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.evaluate("""()=>{
          [0,2,0].forEach((job,i)=>{const r=generateRecruit('冒険者'+(i+1),job);registerRecruit(r);changeRecruitParty(r.members.id,true)});
          enterDungeon();
        }""")
        page.wait_for_function('!logBusy()')
        page.evaluate("""()=>{
          s.logs=['冒険者1は解毒剤を使った。','冒険者2は解毒を唱えた。','冒険者3は傷薬を使った。'];
          render();
        }""")
        lines = page.locator('#log > div')
        assert lines.count() == 3, lines.count()
        item_html = lines.nth(0).inner_html()
        spell_html = lines.nth(1).inner_html()
        assert '解毒剤' in item_html and 'log-spell' not in item_html, item_html
        assert 'class="log-spell">解毒</span>' in spell_html, spell_html
        assert '傷薬' in lines.nth(2).inner_html() and 'log-spell' not in lines.nth(2).inner_html(), lines.nth(2).inner_html()
        color = lines.nth(1).locator('.log-spell').evaluate('(e)=>getComputedStyle(e).color')
        assert color == 'rgb(210, 160, 255)', color
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal overflow'
        assert not errors, errors
        page.locator('#log').screenshot(path=str(out / f'log-colors-{width}.png'))
        print(f'PASS log-colors Chromium {width}px: 解毒剤 plain, 解毒 spell-colored, no errors, no overflow')
        ctx.close()
    browser.close()
