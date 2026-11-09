"""095: actual elite conversion, inherited/new spells, combat and ninja traps (1280/390px).
Run: python3 tests/elite-jobs-browser.py [http://localhost:8000/]
Requires an existing server, Playwright Python and Chromium. Fixtures set up
recruits/XP/opponents; conversions and actions use the ordinary UI handlers.
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
chrome = os.environ.get('CHROME_PATH') or next((x for x in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome') if Path(x).exists()), None)
out = Path(os.environ.get('ELITE_JOBS_SCREENSHOT_DIR', '/tmp/elite-jobs-browser'))
out.mkdir(parents=True, exist_ok=True)
FEATURES = [
    '武器による前衛戦闘が得意で、Lv4から魔法使い系の呪文を遅れて習得する。',
    '武器による前衛戦闘が得意で、Lv4から僧侶系の呪文を遅れて習得し、呪いを解く。',
    '床罠・宝箱の罠解除が得意。',
    '魔法使い系と僧侶系の両方の呪文を習得する。習得は遅い。',
]


def settled(page):
    page.wait_for_function('!logBusy()')


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert page.locator('dialog[open]').evaluate_all(
        'els=>els.every(e=>e.scrollWidth<=e.clientWidth+1)')


def open_field_magic(page):
    page.locator('#party').click()
    page.locator('[data-stat-cast="0"]').click()


def battle(page, undead=False):
    page.evaluate("""undead=>{
      s.area='dungeon';s.pendingStairs=false;s.pendingBoss=null;
      s.hp[0]=s.members[0].maxHP;s.mp[0]=s.members[0].maxMP;
      enemyDefinition('goblin').flee=0;enemyDefinition('goblin').summon=0;
      s.enemy={units:[{...makeEnemy('goblin',901),row:73,hp:999}],initiative:'party'};
      if(undead)s.enemy.units.push({...makeEnemy('skeleton',902),row:98});
      displayCombat=undefined;resetCommandEntry();render();
    }""", undead)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=chrome, args=['--no-sandbox'])
    for width in (1280, 390):
        for job in (7, 4, 5, 6):
            ctx = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(URL)
            candidate = page.evaluate("""job=>{
              const r=generateRecruit('転職候補',job===7?1:0);
              registerRecruit(r);changeRecruitParty(r.members.id,true);
              const m=s.members[0];m.level=10;m.maxHP=5000;s.hp[0]=5000;
              m.maxMP=100;s.mp[0]=100;m.known=job===7?['halito','dumapic']:[];
              s.inventory[0]=['sword','staff','mace','dagger'];s.equipped[0]=m.job;
              render();return m.id;
            }""", job)
            page.locator('#trainingopen').click()
            assert page.locator('#recruitjob option').count() == 4
            page.locator(f'[data-class-change="{candidate}"]').click()
            assert page.locator('[data-class-job]').count() == 8
            for target, feature in enumerate(FEATURES, 4):
                assert feature in page.locator(f'[data-class-job="{target}"]').inner_text()
            # All weapons are present, so rejection here proves the prior-job guard.
            denied = (5, 6) if job == 7 else (7,)
            for target in denied:
                button = page.locator(f'[data-class-job="{target}"]')
                assert button.is_disabled()
                assert '前職が' in button.inner_text()
            before = page.evaluate('JSON.stringify(rosterSaveState())')
            page.locator(f'[data-class-job="{job}"]').click()
            no_overflow(page)
            page.locator('#classchangecancel').click()
            assert page.evaluate('JSON.stringify(rosterSaveState())') == before
            page.locator(f'[data-class-change="{candidate}"]').click()
            page.locator(f'[data-class-job="{job}"]').click()
            page.locator('#classchangeconfirm').focus()
            page.keyboard.press('Enter')
            page.wait_for_function("!document.querySelector('#classchangedialog').open")
            assert page.evaluate('(job)=>s.members[0].job===job&&s.members[0].level===1&&s.members[0].classChanged', job)
            assert page.evaluate('s.members[0].careerHistory.length') == 1
            converted = page.evaluate('JSON.stringify(partyRecords()[0])')
            page.reload()
            assert page.evaluate('JSON.stringify(partyRecords()[0])') == converted
            page.locator('#entrance').click()
            settled(page)
            page.evaluate("""()=>{
              s.pos=27;s.dir=1;s.cells[28]={trap:false,open:false,flag:false,type:''};
              s.pendingStairs=false;s.pendingBoss=null;render();
            }""")

            if job == 7:
                # Old mage spell is immediately usable after conversion and reload.
                assert page.evaluate('s.members[0].known') == ['halito', 'dumapic']
                open_field_magic(page)
                page.locator('[data-spell="dumapic"]').click()
                page.locator('#magiccast').click()
                settled(page)
                assert page.evaluate('s.dumapicUses') == 1
                # Gain XP, then run the real level-up routine to learn priest spells.
                page.evaluate('s.members[0].xp=s.members[0].xpTargets[2];Math.random=()=>0;levelUp();s.hp[0]=1;render()')
                assert page.evaluate("s.members[0].known.includes('dios')")
                open_field_magic(page)
                assert page.locator('#magictab-1').get_attribute('aria-selected') == 'true'
                page.locator('#magictab-2').click()
                page.locator('[data-spell="dios"]').click()
                page.locator('[data-ally-target="0"]').click()
                settled(page)
                assert page.evaluate('s.hp[0]') > 1
                battle(page)
                assert page.locator('[data-command-choice="dispel"]').count() == 0
                page.evaluate('Math.random=()=>.99')
                for school, spell in ((1, 'halito'), (2, 'dios')):
                    if spell == 'dios':
                        page.evaluate("s.hp[0]=1;s.enemy.initiative='party';render()")
                    page.locator('[data-command-choice="spell"]').click()
                    assert page.locator('#magictab-1').get_attribute('aria-selected') == 'true'
                    page.locator(f'#magictab-{school}').click()
                    page.locator(f'[data-spell="{spell}"]').click()
                    if spell == 'dios':
                        page.locator('[data-ally-target="0"]').click()
                    assert page.evaluate('s.magicPlans[0].id') == spell
                    mp = page.evaluate('s.mp[0]')
                    page.locator('#attack').click()
                    settled(page)
                    assert page.evaluate('s.mp[0]') == mp - page.evaluate(f"magic('{spell}').mp")
                assert page.evaluate('s.enemy.units[0].hp') < 999
                assert page.evaluate('s.hp[0]') > 1
            else:
                # Counts are observed from the real attack implementation; the wrapper
                # records results only and leaves damage/log/snapshot processing intact.
                page.evaluate("""()=>{
                  window.attackResults=[];const attackImpl=physicalAttack;
                  physicalAttack=function(...args){const result=attackImpl(...args);attackResults.push(result);return result};
                  Math.random=()=>.99;
                }""")
                for level, count in ([(6, 2), (12, 3)] if job in (4, 5) else [(8, 2)]):
                    page.evaluate('(level)=>{s.members[0].xp=s.members[0].xpTargets[level];levelUp()}', level)
                    battle(page)
                    page.locator('[data-command-choice="fight"]').click()
                    page.locator('#attack').click()
                    settled(page)
                    assert page.evaluate('attackResults.at(-1).count') == count
                    assert page.evaluate('attackResults.at(-1).hitsCount') == count
                if job in (4, 5):
                    # Ensure both systems exist to test the class-specific initial tab.
                    page.evaluate("s.members[0].known.push('halito','dios');render()")
                    page.locator('[data-command-choice="spell"]').click()
                    preferred = 1 if job == 4 else 2
                    assert page.locator(f'#magictab-{preferred}').get_attribute('aria-selected') == 'true'
                    page.locator('#magicclose').click()
                if job == 5:
                    battle(page, undead=True)
                    page.evaluate('Math.random=()=>0')
                    mp = page.evaluate('s.mp[0]')
                    page.locator('[data-command-choice="dispel"]').click()
                    assert page.locator('[data-row-choice]').count() == 1
                    page.locator('[data-row-choice="98"]').click()
                    page.locator('#attack').click()
                    settled(page)
                    assert page.evaluate('s.enemy.units.find(e=>e.uid===902).escaped')
                    assert page.evaluate('s.mp[0]') == mp
                elif job == 6:
                    page.evaluate("""()=>{
                      s.enemy=null;displayCombat=undefined;s.cells[28]={trap:true,open:false,flag:'power',type:''};
                      s.pos=27;s.dir=1;render();
                    }""")
                    page.locator('#party').click()
                    assert page.locator('[data-stat-disarm="0"]').is_enabled()
                    page.locator('[data-stat-disarm="0"]').click()
                    settled(page)
                    assert page.evaluate('s.cells[28].open&&s.cells[28].disarmed&&!s.cells[28].trap&&!s.cells[28].flag')
                    assert page.evaluate('s.members[0].disarmUsed')
                    page.locator('#party').click()
                    assert page.locator('[data-stat-disarm="0"]').is_disabled()
                    page.locator('#statsclose').click()
                    for roll, success in ((.749, True), (.75, False)):
                        page.evaluate("""roll=>{
                          s.cells[s.pos].chest={opened:false,trap:'needle',gold:10};
                          s.gold=0;Math.random=()=>roll;render();
                        }""", roll)
                        assert page.locator('#chestthief').inner_text() == '忍者が調べて開ける'
                        page.locator('#chestthief').click()
                        settled(page)
                        assert page.evaluate('s.gold') == (30 if success else 0)
            no_overflow(page)
            page.screenshot(path=str(out / f'elite-{job}-{width}.png'), full_page=True)
            assert errors == [], errors
            ctx.close()
            print(f'PASS elite jobs browser {width}px job={job}: conversion/reload/real actions')
    browser.close()
