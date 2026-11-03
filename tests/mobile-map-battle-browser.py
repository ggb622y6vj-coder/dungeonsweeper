#!/usr/bin/env python3
"""065: スマホ(390・タッチ)では戦闘中に地図ボタンを隠す。PC(1280)の右側の地図は維持。
Run: /tmp/pyv/bin/python tests/mobile-map-battle-browser.py [http://127.0.0.1:8000/]
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome') if Path(p).exists()), None)
out = Path(os.environ.get('MOBILE_MAP_SCREENSHOT_DIR', '/tmp/mobile-map-battle-browser'))
out.mkdir(parents=True, exist_ok=True)

START = '''s.pendingStairs=false;s.pendingBoss=null;s.cells.forEach(c=>{c.flag=false;delete c.chest});
  const i=s.cells.findIndex((c,k)=>c.type!=='boss'&&k!==s.pos);s.cells[i].type='monster';encounter(i);render()'''

with sync_playwright() as p:
    opts = {'headless': True, 'args': ['--no-sandbox']}
    if chrome:
        opts['executable_path'] = chrome
    browser = p.chromium.launch(**opts)
    for width in (390, 1280):
        mobile = width == 390
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=mobile)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.evaluate("localStorage.removeItem('ash-v1')")
        page.reload()
        page.evaluate('''[0,0,2,1,3,1].forEach((job,i)=>{const r=generateRecruit('ABCDEF'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true)});
          s.members.forEach(m=>m.level=20);render()''')
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        toggle, dock = page.locator('#maptoggle'), page.locator('#mapdock')
        assert toggle.is_visible() == mobile
        assert dock.is_visible() == (not mobile)
        for end in ('win', 'flee'):
            page.evaluate(START)
            page.wait_for_function('!!s.enemy')
            assert not toggle.is_visible(), f'{width} {end}: hidden at encounter'
            assert dock.is_visible() == (not mobile)
            page.wait_for_function('!logBusy()')
            assert not toggle.is_visible()
            page.locator('body').click(position={'x': 5, 'y': 5})
            page.keyboard.press('m')
            assert not page.locator('#mapdialog').is_visible(), 'M key must not open the map in battle'
            page.evaluate("$('#maptoggle').onclick()")
            assert not page.locator('#mapdialog').is_visible(), 'hidden button click is guarded'
            if mobile and end == 'win':
                page.screenshot(path=str(out / f'battle-{width}.png'))
            if end == 'win':
                # Retry the killing turn if a fixed-roll turn still leaves the foe (e.g. ambush order); max 5 turns.
                for _ in range(5):
                    page.wait_for_function('!logBusy()')
                    if not page.evaluate('!!s.enemy'):
                        break
                    page.evaluate('''s.enemy.units=s.enemy.units.filter(e=>e.hp>0).slice(0,1);s.enemy.units.forEach(e=>{e.hp=1;e.ac=99;e.row=17});s.attackRows=s.members.map(()=>17);s.enemy.initiative='party';
                      s.commands=s.members.map(()=>'fight');resetCommandEntry();const r=Math.random;Math.random=()=>.99;try{attack()}finally{Math.random=r}''')
                    if page.evaluate('logBusy() && !!visibleCombat()'):
                        assert not toggle.is_visible(), 'hidden during turn/victory playback'
            else:
                page.evaluate("const r=Math.random;Math.random=()=>0;try{flee()}finally{Math.random=r}")
            # While the enemy display remains (victory playback), the button stays hidden.
            if page.evaluate('logBusy() && !!visibleCombat()'):
                assert not toggle.is_visible(), 'hidden during victory playback'
            page.wait_for_function('!logBusy() && !visibleCombat()', timeout=30000)
            assert not page.evaluate('!!s.enemy'), f'{end}: battle ended'
            assert toggle.is_visible() == mobile, f'{width} {end}: button back after playback'
            assert dock.is_visible() == (not mobile)
            if mobile:
                toggle.tap()
                assert page.locator('#mapdialog').is_visible()
                page.locator('#mapclose').click()
                assert not page.locator('#mapdialog').is_visible()
        page.screenshot(path=str(out / f'after-{width}.png'))
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors, errors
        print(f'PASS mobile-map-battle {width}px: button hidden from encounter to end (win/flee), M key blocked, back after playback; PC dock unchanged; no JS errors')
        context.close()
    browser.close()
