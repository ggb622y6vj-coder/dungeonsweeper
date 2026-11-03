"""064: Notion sync — テアシナガ guardian scene, 火トンボ 3F only, 骸骨の射手 3F・4F.
Run: /tmp/pyv/bin/python tests/notion-sync3-browser.py [http://127.0.0.1:8000/]
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
output = Path(os.environ.get('NOTION_SYNC3_SCREENSHOT_DIR', '/tmp/notion-sync3-browser'))
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
        # 1F guardian scene
        page.evaluate('''s.pendingStairs=false;s.pendingBoss=null;
          const i=s.cells.findIndex(c=>c.type==='boss');s.cells[i].type='boss';encounter(i);render()''')
        page.wait_for_function('!!s.enemy && !logBusy()')
        assert page.evaluate("s.enemy.units.some(e=>e.id==='guardian')")
        page.evaluate("s.enemy.units.forEach(e=>e.identified=true);render()")
        scene = page.locator('.scene-enemies').inner_text()
        assert 'テアシナガ' in scene, scene
        assert '迷宮の守護者' not in page.locator('body').inner_text()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        page.screenshot(path=str(output / f'guardian-{width}.png'))
        # Encounter pools on 2F/3F/4F (normal cells, 400 draws each)
        seen = page.evaluate('''(()=>{const out={};const i=s.cells.findIndex(c=>c.type!=='boss');
          for(const f of [2,3,4]){s.floor=f;const ids=new Set();for(let n=0;n<400;n++){s.enemy=null;s.cells[i].type='monster';
            monsterFormation(false).forEach(id=>ids.add(id))}out[f]=[...ids]}return out})()''')
        assert 'firefly' not in seen['2'] and 'firefly' in seen['3'] and 'firefly' not in seen['4'], seen
        assert 'archer' in seen['3'] and 'archer' in seen['4'] and 'archer' not in seen['2'], seen
        # 3F live encounter shows 火トンボ in the scene once identified
        page.evaluate('''s.floor=3;s.enemy=null;let r=Math.random;
          s.enemy={dataVersion:1,units:[{...makeEnemy('firefly',91),row:17,identified:true}],initiative:'normal',flagEffect:{}};
          s.commands=s.members.map(()=>'guard');s.attackRows=s.members.map(()=>17);resetCommandEntry();render()''')
        assert '火トンボ' in page.locator('.scene-enemies').inner_text()
        assert not errors, errors
        print(f'PASS notion-sync3 Chromium {width}px: テアシナガ guardian scene, 火トンボ 3F only, 骸骨の射手 3F・4F; no JS errors')
        context.close()
    browser.close()
