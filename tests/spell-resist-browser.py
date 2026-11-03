"""063: 10F demons resist ティルトウェイト per individual.
Run: /tmp/pyv/bin/python tests/spell-resist-browser.py [http://127.0.0.1:8000/]
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome_path = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome',
) if Path(p).exists()), None)
output = Path(os.environ.get('SPELL_RESIST_SCREENSHOT_DIR', '/tmp/spell-resist-browser'))
output.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    options = {'headless': True, 'args': ['--no-sandbox']}
    if chrome_path:
        options['executable_path'] = chrome_path
    browser = p.chromium.launch(**options)
    for width in (1280, 390):
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(url)
        page.evaluate("localStorage.removeItem('ash-v1')")
        page.reload()
        page.evaluate('''[1,0,2,0,2,3].forEach((job,i)=>{
          const r=generateRecruit('ABCDEF'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true);
        });render();''')
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        page.evaluate('''s.floor=10;s.pendingStairs=false;s.pendingBoss=null;s.cells.forEach(c=>{c.flag=false;delete c.chest});
          s.members[0].level=30;if(!s.members[0].known.includes('tiltowait'))s.members[0].known.push('tiltowait');s.mp[0]=200;
          s.enemy={dataVersion:1,units:[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>({...makeEnemy('fallenangel',91+i),row:17,hp:9999,identified:true})),initiative:'normal',flagEffect:{}};
          s.commands=s.members.map(()=>'guard');s.attackRows=s.members.map(()=>17);resetCommandEntry();render();''')
        assert page.evaluate("enemyDefinition('fallenangel').mageResist") == 0.5
        page.locator('[data-command-choice="spell"]').click()
        page.locator('[data-spell="tiltowait"]').click()
        targets = page.locator('[data-spell-target]')
        if targets.count():
            targets.first.tap() if width < 700 else targets.first.click()
        assert page.evaluate("s.commands[0]==='spell'&&s.magicPlans[0].id==='tiltowait'")
        # Real 50% resist and real randomness over 12 demons (all-or-none chance 2/4096).
        page.evaluate('''s.commands=s.commands.map((c,i)=>i?'guard':c);s.enemy.initiative='party';attack()''')
        page.wait_for_function('!logBusy()')
        hp = page.evaluate('JSON.stringify(s.enemy.units.map(e=>e.hp))')
        hps = eval(hp)
        resisted = hps.count(9999)
        assert 0 < resisted < 12, hp
        log = page.locator('#log').inner_text()
        assert log.count('は呪文をはね返した！') == resisted, log
        lines = [l for l in log.split('\n') if 'はね返した' in l]
        assert all(l.strip().endswith('は呪文をはね返した！') for l in lines), lines
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        page.screenshot(path=str(output / f'after-{width}.png'))
        assert not errors, errors
        print(f'PASS spell-resist Chromium {width}px: ティルトウェイト vs 12 堕天使 (10F, 50%), some resisted / others damaged, readable log; no JS errors')
        context.close()
    browser.close()
