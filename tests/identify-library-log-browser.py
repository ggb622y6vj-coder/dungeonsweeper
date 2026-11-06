"""066: identify spells report first time library registration in battle and library.
Run: python3 tests/identify-library-log-browser.py [http://localhost:8000/]
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
chrome_path = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome',
) if Path(p).exists()), None)
output = Path(os.environ.get('IDENTIFY_LIBRARY_LOG_SCREENSHOT_DIR', '/tmp/identify-library-log-browser'))
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
        page.evaluate('''[1,0,2].forEach((job,i)=>{
          const r=generateRecruit('ABC'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true);
        });render();''')
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        page.evaluate('''s.pendingStairs=false;s.pendingBoss=null;s.members.forEach(m=>{m.intelligence=0;m.level=1});
          s.mp[0]=20;s.enemy={dataVersion:1,units:[
            {...makeEnemy('slime',91),row:17,hp:999},
            {...makeEnemy('wolf',92),row:28,hp:999,identified:true}],initiative:'normal',flagEffect:{}};
          recordLibraryEncounter(s.enemy);s.commands=s.members.map(()=>'guard');
          const r=Math.random;try{Math.random=()=>0;castMagic(0,'identifyfoe',null)}finally{Math.random=r}
          render();''')
        page.wait_for_function('!logBusy()')
        combat_log = page.locator('#log').inner_text()
        assert '不定形の正体を見破った。（→スライム）' in combat_log, combat_log
        assert 'スライムの情報を図書館に記録した。' in combat_log, combat_log
        wolf_name = page.evaluate("enemyDefinition('wolf').name")
        assert f'{wolf_name}の情報を図書館に記録した。' in combat_log, combat_log
        assert 'すでに正体は判明している。' not in combat_log, combat_log
        page.screenshot(path=str(output / f'combat-{width}.png'))
        page.evaluate('s.enemy=null;enterTown();save()')
        page.wait_for_function('!logBusy()')
        page.locator('#libraryopen').click()
        for key in ('slime', 'wolf'):
            entry = page.locator(f'#librarybody [data-library-entry="monster-{key}"]')
            assert entry.locator('h4').inner_text() == page.evaluate(f"enemyDefinition('{key}').name")
        assert page.locator('#libraryprogress').inner_text().startswith('モンスター 2/96 ')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        page.screenshot(path=str(output / f'library-{width}.png'))
        assert not errors, errors
        print(f'PASS identify library log Chromium {width}px: first reveal and known-name registration shown; library entries confirmed')
        context.close()
    browser.close()
