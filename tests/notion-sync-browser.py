"""072: Notion-synced names in the real UI at 1280 and 390 px: battle spell menu (name+description from
data/notion-spells.json), monster library (96 names from data/notion-monsters.json incl. 3 new) and enemy spell log.
Run: /tmp/pyv/bin/python tests/notion-sync-browser.py [http://127.0.0.1:8000/]
"""
import json, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
spells = json.loads((root / 'data/notion-spells.json').read_text())
monsters = json.loads((root / 'data/notion-monsters.json').read_text())
url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome_path = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome',
) if Path(p).exists()), None)
output = Path(os.environ.get('NOTION_SYNC_SCREENSHOT_DIR', '/tmp/notion-sync-browser'))
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
        page.evaluate('''[1,2,0,0,0,0].forEach((job,i)=>{
          const r=generateRecruit('ABCDEF'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true);});render();''')
        # Library: all 96 identified; names equal the Notion rows (incl. the 3 additions).
        page.evaluate('''s.library.monsters=Object.fromEntries(ENEMIES.map(e=>[e.id,{count:1,firstFloor:e.floor,identified:true}]));
          delete s.library.monsterIdentifyVersion;save();render();''')
        page.locator('#libraryopen').click()
        assert page.locator('#libraryprogress').inner_text().startswith('モンスター 96/96'), page.locator('#libraryprogress').inner_text()
        for r in monsters:
            floor = page.evaluate('(id)=>enemyDefinition(id).floors[0]', r['userDefined:ID'])
            page.locator(f'#librarymonstertab-{floor}').click()
            h4 = page.locator(f'[data-library-entry="monster-{r["userDefined:ID"]}"] h4').inner_text()
            assert h4.startswith(r['名前']), (r['userDefined:ID'], h4, r['名前'])
        page.locator('#librarymonstertab-'+str(page.evaluate("enemyDefinition('takenoko').floors[0]"))).click()
        page.locator('[data-library-entry="monster-takenoko"]').scroll_into_view_if_needed()
        page.screenshot(path=str(output / f'library-{width}.png'))
        page.reload()
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        # Battle spell menu for a mage and a priest knowing every battle spell of their school.
        page.evaluate('''s.pendingStairs=false;s.pendingBoss=null;s.cells.forEach(c=>{c.flag=false;delete c.chest});
          s.members[0].known=MAGIC.filter(m=>m.job===1).map(m=>m.id);s.members[1].known=MAGIC.filter(m=>m.job===2).map(m=>m.id);
          s.mp=s.mp.map(()=>999);
          s.enemy={dataVersion:1,units:[{...makeEnemy('mage',91),row:17,hp:999}],initiative:'normal',flagEffect:{}};
          s.commands=s.members.map(()=>'guard');s.attackRows=s.members.map(()=>17);resetCommandEntry();render();''')
        page.locator('[data-command-choice="spell"]').click()
        shown = {}
        for el in page.locator('[data-spell]').all():
            shown[el.get_attribute('data-spell')] = el.inner_text()
        battle_mage = [r for r in spells if r['系統'] == '魔法使い' and '戦闘' in r['使用場面']]
        assert {r['userDefined:ID'] for r in battle_mage} <= set(shown), (sorted(shown), width)
        by_id = {r['userDefined:ID']: r for r in spells}
        for r in (by_id[k] for k in shown):
            assert r['名前'] in shown[r['userDefined:ID']], (r['userDefined:ID'], shown[r['userDefined:ID']])
        for old in ('ハリト', 'マハリト', 'ダルト', 'ティルトウェイト', 'カティノ', 'モーリス'):
            assert old not in ''.join(shown.values()), old
        assert '敵全列の正体を確率で見破る' in shown['identifyfoe']
        assert '火炎' in shown['halito']
        page.screenshot(path=str(output / f'spells-{width}.png'))
        # Enemy spell log uses the Notion name 火炎 (old CSV name ハリト never shown).
        page.evaluate('''s.logs=[];const d=enemyDefinition('mage'),o=d.spell;d.spell=1;const r=Math.random;
          try{Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands)}finally{Math.random=r;d.spell=o}''')
        page.wait_for_function('!logBusy()')
        log = page.locator('#log').inner_text()
        assert '火炎' in log and 'ハリト' not in log, log
        page.screenshot(path=str(output / f'enemy-spell-log-{width}.png'))
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        assert not errors, errors
        print(f'PASS notion-sync Chromium {width}px: {len(battle_mage)} battle spells, enemy log 火炎, 96 library names; no JS errors')
        context.close()
    browser.close()
