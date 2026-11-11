"""043: old-save learning and a real UI cast in a 1F battle, at PC/mobile widths.
Run: python3 tests/makanito-browser.py [http://127.0.0.1:8000/]
Requires Playwright Python and Chromium; no application dependencies are added.
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
output = Path(os.environ.get('MAKANITO_SCREENSHOT_DIR', '/tmp/043-makanito-browser'))
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
        # An isolated context has no user's save. Simulate an existing level-9
        # mage with a persisted pre-Makanito spell list, then exercise real load.
        page.evaluate('''const r=generateRecruit('術者',1);
          registerRecruit(r);changeRecruitParty(r.members.id,true);
          Object.assign(s.members[0],{level:9,maxHP:100,maxMP:40,known:['halito']});
          s.hp[0]=100;s.mp[0]=40;save();''')
        page.reload()
        assert page.evaluate("s.members[0].known.includes('makanito')")
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        # Eligible 1F enemies in separate stable rows; undead are deliberately
        # absent because the spell is required to spare them even on 1F.
        page.evaluate('''s.pendingStairs=false;s.pendingBoss=null;
          s.cells.forEach(c=>{c.flag=false;delete c.chest});
          // Since 092 the action order is interleaved, so a goblin can act
          // before the cast: fleeing pays no XP and summoning adds a fourth
          // unit, and both break this test's fixed-trio premise. Neither is
          // what this test exercises: pin both off for the trio.
          ['slime','goblin','wolf'].forEach(id=>{const d=enemyDefinition(id);d.flee=0;d.summon=0});
          s.enemy={dataVersion:1,boss:false,chestBattle:true,
            units:['slime','goblin','wolf'].map((id,i)=>({
              ...makeEnemy(id,100+i),row:17+i*11,identified:true})),
            initiative:'normal',flagEffect:{}};
          window.expectedXP=s.enemy.units.reduce((n,e)=>n+enemyDefinition(e.id).xp,0);
          window.xpBefore=s.members[0].xp;
          resetPartyCommands();resetCommandEntry();render();
          window.framesSeen=[];
          const originalPump=pumpLog;
          pumpLog=function(){originalPump();if(displayVitals)framesSeen.push({
            text:s.logs[0],
            shown:[...document.querySelectorAll('#scene [data-enemy-uid]')].map(e=>Number(e.dataset.enemyUid)),
            expected:(visibleCombat()?.units||[]).filter(e=>!e.rewarded).map(e=>e.uid)
          })};''')
        assert page.evaluate('s.floor') == 1
        page.locator('[data-command-choice="spell"]').click()
        spell = page.locator('[data-spell="makanito"]')
        assert spell.is_enabled()
        assert '習得済み' in spell.inner_text()
        assert 'MP 5' in spell.inner_text()
        spell.click()
        assert page.evaluate("s.magicPlans[0].id==='makanito' && s.magicPlans[0].target===null")
        assert page.evaluate('s.mp[0]') == 40, 'planning spends no MP'
        page.locator('#attack').click()
        page.wait_for_function('!logBusy()')
        assert page.evaluate('s.enemy===null')
        assert page.evaluate('s.mp[0]') == 35
        assert page.evaluate('s.members[0].xp-xpBefore===expectedXP')
        assert page.locator('#scene [data-enemy-uid]').count() == 0
        log = page.locator('#log').inner_text()
        assert '窒息を唱えた。' in log and log.count('息絶えた。') == 3, log
        frames = page.evaluate('framesSeen')
        cast = next(f for f in frames if '窒息を唱えた。' in f['text'])
        assert sorted(cast['shown']) == [100, 101, 102], cast
        for frame in frames:
            assert sorted(frame['shown']) == sorted(frame['expected']), frame
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        assert not errors, errors
        page.screenshot(path=str(output / f'makanito-{width}.png'))
        print(f'PASS Makanito Chromium {width}px: old save, 1F all-target cast, MP/XP, death logs and snapshots')
        context.close()
    browser.close()
