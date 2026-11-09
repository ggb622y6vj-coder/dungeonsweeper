"""094: 転職確認・キャンセル・保存互換・継承呪文の実操作（1280/390px）。
Run: python3 tests/class-change-browser.py [http://localhost:8000/]
Requires an existing local HTTP server, Playwright Python and Chromium.
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
chrome = os.environ.get('CHROME_PATH') or next((x for x in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome') if Path(x).exists()), None)
out = Path(os.environ.get('CLASS_CHANGE_SCREENSHOT_DIR', '/tmp/class-change-browser'))
out.mkdir(parents=True, exist_ok=True)


def settled(page):
    page.wait_for_function('!logBusy()')


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert page.locator('dialog[open]').evaluate_all(
        'els=>els.every(e=>e.scrollWidth<=e.clientWidth+1)')


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=chrome, args=['--no-sandbox'])
    for width in (1280, 390):
        ctx = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        # Fixture only: registration is existing tested behavior; all conversions
        # and spell choices below go through actual buttons/keyboard handlers.
        page.evaluate("""()=>{
          const mage=generateRecruit('転職候補',1);registerRecruit(mage);changeRecruitParty(mage.members.id,true);
          const m=s.members[0];m.level=10;m.maxMP=100;m.known=['halito','dumapic','dios','calfo','malor','watchful'];
          s.mp[0]=40;s.hp[0]=3;s.inventory[0].push('sword');s.gold=789;
          const junior=generateRecruit('見習い',3);registerRecruit(junior);
          const stone=generateRecruit('石化候補',0);stone.members.status='stone';stone.members.level=10;registerRecruit(stone);
          const noWeapon=generateRecruit('武器不足',2);noWeapon.members.level=10;registerRecruit(noWeapon);
          render();window.candidateId=m.id;window.juniorId=junior.members.id;
        }""")
        candidate = page.evaluate('candidateId')
        page.locator('#trainingopen').click()
        change_button = page.locator(f'[data-class-change="{candidate}"]')
        assert change_button.is_enabled()
        for name, reason in [('見習い', 'Lv.10'), ('石化候補', '正常'), ('武器不足', '武器')]:
            row = page.locator('#recruitlist section').filter(has=page.locator('h4', has_text=name))
            assert row.get_by_role('button', name='転職', exact=True).is_disabled()
            assert reason in row.inner_text()
        before = page.evaluate('JSON.stringify(rosterSaveState())')
        change_button.focus()
        page.keyboard.press('Enter')
        page.wait_for_function("document.activeElement.id==='classchangecancel'")
        assert page.locator('#classchangeconfirm').is_disabled()
        assert page.locator('[data-class-job="1"]').is_disabled()
        assert page.locator('[data-class-job="2"]').is_disabled()  # no mace
        page.locator('[data-class-job="0"]').focus()
        page.keyboard.press('Space')
        assert page.locator('[data-class-job="0"]').get_attribute('aria-pressed') == 'true'
        assert 'Lv と XP がリセット' in page.locator('#classchangepreview').inner_text()
        assert '呪文はすべて引き継ぎ' in page.locator('#classchangepreview').inner_text()
        assert '杖' in page.locator('#classchangepreview').inner_text()
        assert page.locator('#classchangepreview tr').count() == 6
        no_overflow(page)
        page.keyboard.press('Escape')
        page.wait_for_function("!document.querySelector('#classchangedialog').open")
        assert page.evaluate('JSON.stringify(rosterSaveState())') == before
        page.wait_for_function('(id)=>document.activeElement.dataset.classChange===id', arg=candidate)
        # Reopening clears the target; cancel has its own explicit button.
        page.keyboard.press('Space')
        assert page.locator('#classchangeconfirm').is_disabled()
        page.locator('#classchangecancel').click()
        assert page.evaluate('JSON.stringify(rosterSaveState())') == before
        # Condition changed while comparison is open: confirmation must recheck.
        change_button.click()
        page.locator('[data-class-job="0"]').click()
        page.evaluate('s.members[0].level=9')
        stale = page.evaluate('JSON.stringify(rosterSaveState())')
        page.locator('#classchangeconfirm').click()
        assert page.evaluate('JSON.stringify(rosterSaveState())') == stale
        assert 'Lv.10' in page.locator('#classchangenotice').inner_text()
        assert page.locator('#classchangeconfirm').is_disabled()
        page.locator('#classchangecancel').click()
        page.evaluate('s.members[0].level=10')
        change_button.click()
        page.locator('[data-class-job="0"]').click()
        page.locator('#classchangeconfirm').focus()
        page.keyboard.press('Enter')
        page.wait_for_function("!document.querySelector('#classchangedialog').open")
        assert page.evaluate('s.members[0].job===0&&s.members[0].level===1&&s.members[0].xp===0')
        assert page.evaluate('s.hp[0]===s.members[0].maxHP&&s.mp[0]===100&&s.gold===789')
        assert page.evaluate("equippedWeapon(0).id==='sword'&&s.members[0].careerHistory.length===1")
        converted = page.evaluate('JSON.stringify(partyRecords()[0])')
        page.reload()
        assert page.evaluate('JSON.stringify(partyRecords()[0])') == converted
        page.locator('#statsopen').click()
        assert '前職：魔法使い Lv.10' in page.locator('#statsbody').inner_text()
        assert page.locator('[data-stat-cast="0"]').is_visible()
        page.locator('#statsclose').click()
        page.locator('#entrance').click()
        settled(page)
        page.locator('#party').click()
        page.locator('[data-stat-cast="0"]').click()
        assert page.locator('#magictabs').is_visible()
        assert page.locator('#magictab-1').get_attribute('aria-selected') == 'true'
        # Floor selector must be discarded on switching schools.
        page.locator('[data-spell="malor"]').click()
        assert page.locator('#magictarget').is_visible()
        page.keyboard.press('e')
        assert page.locator('#magictab-2').get_attribute('aria-selected') == 'true'
        assert page.evaluate('spellSelected===null')
        assert page.locator('#magictargets').inner_text() == ''
        assert page.locator('#magiccast').is_hidden()
        assert page.locator('[data-spell="halito"]').count() == 0
        # Both native selection keys and the shared tab direction convention.
        page.keyboard.press('ArrowLeft')
        assert page.locator('#magictab-1').get_attribute('aria-selected') == 'true'
        page.keyboard.press('ArrowRight')
        page.keyboard.press('Enter')
        page.keyboard.press('Space')
        assert page.locator('#magictab-2').get_attribute('aria-selected') == 'true'
        page.locator('#magicclose').click()
        page.locator('#party').click()
        page.locator('[data-stat-cast="0"]').click()
        assert page.locator('#magictab-1').get_attribute('aria-selected') == 'true'
        no_overflow(page)
        mp = page.evaluate('s.mp[0]')
        page.locator('[data-spell="dumapic"]').click()
        page.locator('#magiccast').click()
        settled(page)
        assert page.evaluate('s.dumapicUses') == 1
        assert page.evaluate('s.mp[0]') == mp - 2
        # Healing uses the ordinary party-card target flow after selecting priest tab.
        page.evaluate('s.hp[0]=1;render()')
        page.locator('#party').click()
        page.locator('[data-stat-cast="0"]').click()
        page.locator('#magictab-2').click()
        page.locator('[data-spell="dios"]').click()
        page.locator('[data-ally-target="0"]').click()
        settled(page)
        assert page.evaluate('s.hp[0]') > 1
        # Battle fixture: actual spell reservation and attack-button execution.
        page.evaluate("""()=>{
          // Spell inheritance/tabs need a persistent opponent, without fleeing or summoning.
          const goblin=enemyDefinition('goblin');goblin.flee=0;goblin.summon=0;
          // Survive both rounds regardless of recruit HP rolls and enemy attack rolls.
          s.members[0].maxHP=100;
          s.hp[0]=s.members[0].maxHP;s.pendingStairs=false;s.pendingBoss=null;
          s.enemy={units:[{...makeEnemy('goblin',901),row:73,hp:999}],initiative:'party'};
          displayCombat=undefined;resetCommandEntry();render();
        }""")
        page.locator('[data-command-choice="spell"]').click()
        assert page.locator('#magictabs').is_visible()
        page.locator('#magictab-2').click()
        page.locator('[data-spell="dios"]').click()
        page.locator('[data-ally-target="0"]').click()
        assert page.evaluate("s.magicPlans[0].id==='dios'")
        page.locator('#attack').click()
        settled(page)
        mp = page.evaluate('s.mp[0]')
        page.locator('[data-command-choice="spell"]').click()
        assert page.locator('#magictab-1').get_attribute('aria-selected') == 'true'
        page.locator('[data-spell="halito"]').click()
        assert page.evaluate("s.magicPlans[0].id==='halito'")
        page.locator('#attack').click()
        settled(page)
        assert page.evaluate('s.enemy.units[0].hp') < 999
        assert page.evaluate('s.mp[0]') == mp - page.evaluate("magic('halito').mp")
        # One-school characters retain the old list without tabs.
        page.evaluate("s.members[0].known=['halito'];render()")
        page.locator('[data-command-choice="spell"]').click()
        assert page.locator('#magictabs').is_hidden()
        assert page.locator('#magiclist [data-spell]').count() == 1
        no_overflow(page)
        page.screenshot(path=str(out / f'class-change-{width}.png'), full_page=True)
        assert errors == [], errors
        ctx.close()
        print(f'PASS class change browser {width}px: keyboard/cancel/stale confirmation/reload/tabs/real casts')
    browser.close()
