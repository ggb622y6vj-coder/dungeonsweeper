"""108: unexplored-cell combat -> generated chest -> reload -> UI opening (0..3 items).
Run: python3 tests/chest-loot-browser.py [http://127.0.0.1:8000/]
Uses isolated contexts at PC/mobile widths. Requires Playwright Python and Chromium.
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome',
) if Path(p).exists()), None)
out = Path(os.environ.get('CHEST_LOOT_SCREENSHOT_DIR', '/tmp/chest-loot-browser'))
out.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    options = {'headless': True, 'args': ['--no-sandbox']}
    if chrome:
        options['executable_path'] = chrome
    browser = p.chromium.launch(**options)
    for width in (1280, 390):
        for count in range(4):
            context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(URL)
            # Fixture only: a durable party, an unexplored normal tile ahead, and
            # one known formation. Movement, encounter, combat and rewards use real handlers.
            page.evaluate('''() => {
              for(const [i,job] of [0,3].entries()){
                const r=generateRecruit('冒険者'+(i+1),job);registerRecruit(r);changeRecruitParty(r.members.id,true);
              }
              s.members.forEach((m,i)=>{m.level=30;m.maxHP=2000;m.str=18;s.hp[i]=2000});
              s.inventory[0]=['holysword'];s.inventory[1]=['dagger'];s.equipped=[0,0];
              enterDungeon();
            }''')
            page.wait_for_function('!logBusy()')
            page.evaluate('''count => {
              fresh(10);s.area='dungeon';s.pos=27;s.dir=1;s.gold=0;
              s.cells.forEach(c=>{c.type='';c.trap=false;c.flag=false;delete c.chest});
              s.cells[s.pos].open=true;s.cells[target()].open=false;
              monsterFormation=()=>['sorcerer'];rollInitiative=()=> 'party';
              // Inject only the roller's RNG, so the actual A/B/C implementation
              // creates the selected number of items at victory time.
              const actualRoll=rollChestItems;
              window.lootCalls=0;
              rollChestItems=(id,floor)=>{
                window.lootCalls++;
                const slots=LOOT_TABLES.groups[LOOT_TABLES.monsterGroups[id]].slots;
                const values=slots.flatMap((slot,i)=>i<count?[0,0]:[slot.chance]);
                const items=actualRoll(id,floor,()=>{
                  if(!values.length)throw Error('extra loot roll');return values.shift();
                });
                if(values.length)throw Error('unused loot rolls');return items;
              };
              Math.random=()=>0;render();
            }''', count)
            page.wait_for_function('!logBusy()')
            assert page.evaluate('!s.cells[target()].open')
            def press(selector):
                locator = page.locator(selector)
                locator.tap() if width < 700 else locator.click()
            press('[data-action="forward"]')
            page.wait_for_function('s.enemy && !logBusy()')
            assert page.evaluate('s.enemy.chestBattle && s.enemy.lootMonsterId === "sorcerer"')
            assert page.evaluate('window.lootCalls') == 0
            page.evaluate('Math.random=()=>.99')  # combat hit rolls and a trap-free chest
            for _ in range(20):
                press('#quickattack')
                page.wait_for_function('!logBusy()', timeout=60000)
                if page.evaluate('s.enemy === null'):
                    break
            else:
                raise AssertionError('battle did not finish')
            assert page.evaluate('window.lootCalls') == 1
            chest = page.evaluate('structuredClone(currentChest())')
            assert chest['rewardVersion'] == 1 and chest['lootGroup'] == 5
            assert len(chest['items']) == count and chest['trap'] == 'none'
            assert page.locator('#chestactions').is_visible()
            assert '宝箱が現れた。' in page.locator('#log').inner_text()
            page.reload()
            page.wait_for_function('!logBusy() && !!currentChest()')
            assert page.evaluate('structuredClone(currentChest())') == chest
            before = page.evaluate('({gold:s.gold,items:s.inventory.flat()})')
            names = page.evaluate('currentChest().items.map(id=>weapon(id).name)')
            # Direct opening consumes no RNG. Thief/ninja opening uses exactly one success roll.
            selector = '#chestopen' if count % 2 == 0 else '#chestthief'
            page.evaluate('''thief => {
              let calls=0;
              Math.random=()=>{if(thief && calls++===0)return 0;throw Error('contents rerolled on opening')};
            }''', count % 2 == 1)
            press(selector)
            page.wait_for_function('!logBusy()')
            assert page.evaluate('currentChest() === null')
            assert page.evaluate('s.gold') == before['gold'] + chest['gold'] * 3
            after = page.evaluate('s.inventory.flat()')
            assert len(after) == len(before['items']) + count
            for item in set(chest['items']):
                assert after.count(item) - before['items'].count(item) == chest['items'].count(item)
            log = page.locator('#log').inner_text()
            assert f"宝箱を開けた。金貨{chest['gold']*3}枚を獲得。" in log, log
            assert log.count('を入手。') == count, log
            for name in names:
                assert f'{name}を入手。' in log, log
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.screenshot(path=str(out / f'{width}-{count}-items.png'))
            page.reload()
            page.wait_for_function('!logBusy()')
            assert page.evaluate('currentChest() === null')
            assert page.evaluate('s.inventory.flat()') == after
            assert page.evaluate('s.gold') == before['gold'] + chest['gold'] * 3
            assert not errors, errors
            print(f'PASS chest loot Chromium {width}px: unexplored combat, {count} fixed items, reload, opening and gold/item logs')
            context.close()
    browser.close()
