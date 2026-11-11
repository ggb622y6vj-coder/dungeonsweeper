"""072: 識別 targets all rows without a row picker and rolls for every enemy.
Run: /tmp/pyv/bin/python tests/identifyfoe-browser.py [http://127.0.0.1:8000/]
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
output = Path(os.environ.get('IDENTIFYFOE_SCREENSHOT_DIR', '/tmp/identifyfoe-browser'))
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
        assert page.evaluate('jobOf(0)') == 1
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        page.evaluate('''s.pendingStairs=false;s.pendingBoss=null;s.cells.forEach(c=>{c.flag=false;delete c.chest});
          s.members.forEach(m=>{m.intelligence=0;m.level=1});s.mp[0]=20;
          s.enemy={dataVersion:1,units:[{...makeEnemy('slime',91),row:17,hp:999},{...makeEnemy('slime',92),row:17,hp:999},
            {...makeEnemy('wolf',93),row:28,hp:999}],initiative:'normal',flagEffect:{}};
          s.enemy.units.forEach(e=>e.identified=false);
          s.commands=s.members.map(()=>'guard');s.attackRows=s.members.map(()=>17);resetCommandEntry();render();''')
        page.locator('[data-command-choice="spell"]').click()
        spell = page.locator('[data-spell="identifyfoe"]')
        assert '敵全列の正体を確率で見破る' in spell.inner_text()
        spell.click()
        targets = page.locator('[data-spell-target]')
        assert targets.count() == 0, targets.count()
        assert page.evaluate("s.commands[0]==='spell'&&s.magicPlans[0].id==='identifyfoe'&&s.magicPlans[0].target===null")
        page.screenshot(path=str(output / f'pick-{width}.png'))
        page.evaluate('''s.commands=s.commands.map((c,i)=>i?'guard':c);s.enemy.initiative='party';
          const r=Math.random;try{Math.random=()=>0;attack()}finally{Math.random=r}''')
        page.wait_for_function('!logBusy()')
        assert page.evaluate('JSON.stringify(s.enemy.units.map(e=>[!!e.identified,!!e.identifiedBySpell]))') == \
            '[[true,true],[true,true],[true,true]]'
        assert page.evaluate('s.mp[0]') == 18
        log = page.locator('#log').inner_text()
        assert '素早い牙の正体を見破った。（→' in log, log
        listing = page.locator('.scene-enemies').inner_text()
        assert 'スライム' in listing and 'ハイウルフ' in listing and '不定形' not in listing, listing
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        page.screenshot(path=str(output / f'after-{width}.png'))
        assert not errors, errors
        print(f'PASS identifyfoe Chromium {width}px: no row picker, all rows identified, MP spent; no JS errors')
        context.close()
    browser.close()
