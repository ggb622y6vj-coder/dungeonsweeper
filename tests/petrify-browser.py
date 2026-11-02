"""033: real stone hit → auto-retreat → return → temple cure, plus Madi UI.
Run: python3 tests/petrify-browser.py [http://127.0.0.1:8000/]
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
output = Path(os.environ.get('PETRIFY_SCREENSHOT_DIR', '/tmp/petrify-browser'))
output.mkdir(parents=True, exist_ok=True)


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
    assert page.evaluate('''[...document.querySelectorAll('dialog[open]')].every(e=>{
      const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&e.scrollWidth<=e.clientWidth;
    })'''), 'dialog overflow'


def seed(page):
    page.evaluate("localStorage.removeItem('ash-v1')")
    page.reload()
    page.evaluate('''[0,1,2,0,2,3].forEach((job,i)=>{
      const r=generateRecruit('ABCDEF'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true);
    });s.gold=1000;render();''')
    page.locator('#entrance').click()
    page.wait_for_function('!logBusy()')


def petrify_hit(page):
    page.evaluate('''window.framesSeen=[];
      const originalPump=pumpLog;
      pumpLog=function(){originalPump();if(displayVitals)framesSeen.push({
        text:s.logs[0],expected:displayVitals.members.map(m=>m.name).join(''),
        cards:[...document.querySelectorAll('#party .card > b')].map(e=>e.firstChild.textContent.trim()).join(''),
        tags:[...document.querySelectorAll('#party .card')].map(e=>e.querySelector('.ailment-stone')?.textContent||''),
        expectedTags:displayVitals.members.map(m=>m.status==='stone'?'石化':''),
        hp:[...document.querySelectorAll('#party .hpbar')].map(e=>+e.getAttribute('aria-valuenow')),
        expectedHP:displayVitals.hp.slice()
      })};
      const foe=ENEMIES.find(d=>d.name==='邪眼');
      s.enemy={dataVersion:1,units:[{id:foe.id,uid:91,row:17,hp:999,identified:true}],initiative:'normal'};
      s.commands=s.members.map(()=> 'guard');s.attackRows=s.members.map(()=>17);
      const originalRandom=Math.random,rolls=[.9,.2,.999,0,.9,0];
      Math.random=()=>rolls.shift()??.99;enemyTurn(s.commands);Math.random=originalRandom;render();''')
    page.wait_for_function('!logBusy()')
    frames = page.evaluate('framesSeen')
    assert frames
    for frame in frames:
        assert frame['cards'] == frame['expected'], frame
        assert frame['tags'] == frame['expectedTags'], frame
        assert frame['hp'] == frame['expectedHP'], frame
    assert next(f for f in frames if 'ダメージ' in f['text'])['tags'] == [''] * 6
    petrified = next(f for f in frames if f['text'] == 'Bは石になった。')
    retreated = next(f for f in frames if f['text'] == 'Bが後列に下がった。')
    assert petrified['cards'] == 'ABCDEF' and petrified['tags'][1] == '石化'
    assert retreated['cards'] == 'ACDBEF' and retreated['tags'][3] == '石化'
    assert frames.index(retreated) == frames.index(petrified) + 1
    assert page.evaluate("!commandMembers().some(i=>s.members[i].name==='B')")
    assert page.locator('#party .card').nth(3).locator('.ailment-stone').inner_text() == '石化'
    no_overflow(page)


def target_b(page):
    index = page.evaluate("s.members.findIndex(m=>m.name==='B')")
    card = page.locator(f'#party [data-ally-target="{index}"]')
    assert 'targetable' in card.get_attribute('class')
    return card


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
        seed(page)
        petrify_hit(page)
        page.screenshot(path=str(output / f'stone-retreat-{width}.png'))
        page.reload()
        assert page.evaluate("s.members.map(m=>m.name).join('')==='ACDBEF'&&s.members[3].status==='stone'")
        assert page.locator('#party .card').nth(3).locator('.ailment-stone').is_visible()

        # End the fixture encounter; actual stair UI performs town return.
        page.evaluate("s.enemy=null;s.hp[3]=3;s.mp[3]=2;s.members[3].xp=650;s.pos=s.start;s.pendingStairs=true;render()")
        page.locator('#bossyes').click()
        assert page.locator('#templecarrydialog').is_visible()
        assert 'B（石化）' in page.locator('#templecarrylist').inner_text()
        assert page.evaluate("s.members.map(m=>m.name).join('')==='ACDEF'&&s.reserve[0].hp===3&&s.reserve[0].mp===2&&s.reserve[0].members.level===1&&s.reserve[0].members.xp===650")
        no_overflow(page)
        page.screenshot(path=str(output / f'stone-carry-{width}.png'))
        page.reload()
        assert page.locator('#templecarrydialog').is_visible()
        page.locator('#templecarryok').click()
        page.wait_for_function('!s.templeReport.length')

        page.locator('#tavernopen').click()
        choices = page.locator('#tavernslots option').filter(has_text='B（石化）')
        assert choices.count() == 6
        assert all(option.evaluate('e=>e.disabled') for option in choices.all()), [o.evaluate('e=>[e.disabled,e.outerHTML]') for o in choices.all()]
        no_overflow(page)
        page.locator('#tavernclose').click()
        page.locator('#trainingopen').click()
        recruit = page.locator('#recruitlist section').filter(has_text='B（石化）')
        assert recruit.get_by_role('button', name='加入', exact=True).is_disabled()
        no_overflow(page)
        page.locator('#trainingclose').click()

        page.locator('#templeopen').click()
        row = page.locator('#templemembers .shopitem')
        assert row.count() == 1
        assert '石化' in row.inner_text() and '100%' in row.inner_text() and '40 G' in row.inner_text()
        assert '控え' in row.inner_text()
        no_overflow(page)
        page.screenshot(path=str(output / f'stone-temple-{width}.png'))
        row.get_by_role('button', name='石化解除', exact=True).click()
        assert 'Bの石化が解けた。' in page.locator('#templenotice').inner_text()
        assert page.evaluate("s.gold===960&&s.reserve[0].members.status==='ok'&&s.reserve[0].hp===s.reserve[0].members.maxHP&&s.reserve[0].mp===s.reserve[0].members.maxMP&&s.reserve[0].members.xp===650")
        page.locator('#templeclose').click()
        page.locator('#trainingopen').click()
        page.locator('#recruitlist section').filter(has=page.locator('h4', has_text='B ·')).get_by_role('button', name='加入', exact=True).click()
        page.locator('#trainingclose').click()
        page.reload()
        assert page.evaluate("s.members.length===6&&s.members.find(m=>m.name==='B').status==='ok'&&s.mp[s.members.findIndex(m=>m.name==='B')]===s.members.find(m=>m.name==='B').maxMP")
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        no_overflow(page)

        # A fresh field fixture tests real card selection for ineffective Dialko,
        # then Madi. Stone is a selectable living target, never a caster.
        seed(page)
        petrify_hit(page)
        page.evaluate("s.enemy=null;const i=s.members.findIndex(m=>m.name==='E');s.members[i].known.push('madi','dialko');s.mp[i]=100;render()")
        for spell in ('dialko', 'madi'):
            page.locator('#party').click()
            page.locator('#statsbody .statcard').filter(has=page.locator('h3', has_text='E ')).locator('[data-stat-cast]').click()
            page.locator(f'[data-spell="{spell}"]').click()
            card = target_b(page)
            no_overflow(page)
            card.click()
            page.wait_for_function('!logBusy()')
            if spell == 'dialko':
                assert 'ディアルコではBの石化を治せない。' in page.locator('#log').inner_text()
                assert page.evaluate("s.members[3].status==='stone'&&s.mp[4]===100")
            else:
                assert 'Bの石化が解けた。' in page.locator('#log').inner_text()
                assert page.evaluate("s.members[3].status==='ok'&&s.hp[3]===s.members[3].maxHP&&s.mp[4]===85")
                assert page.locator('#party .ailment-stone').count() == 0
        no_overflow(page)
        assert not errors, errors
        print(f'PASS petrify Chromium {width}px: evil-eye hit, snapshot order, auto-retreat, reload, carry, blocked joining, temple cure/rejoin, Dialko/Madi cards; no JS errors or horizontal scroll')
        context.close()
    browser.close()
