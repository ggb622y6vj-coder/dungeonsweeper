"""032: formation, labels and log snapshots at desktop/mobile widths.
Run against dist: python3 tests/auto-reorder-browser.py [http://127.0.0.1:8000/]
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome_path = os.environ.get('CHROME_PATH')
if not chrome_path:
    chrome_path = next((p for p in ('/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser') if Path(p).exists()), None)
output = Path(os.environ.get('AUTO_REORDER_SCREENSHOT_DIR', '/tmp/auto-reorder-browser'))
output.mkdir(parents=True, exist_ok=True)


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
    assert page.evaluate('''[...document.querySelectorAll('dialog[open]')].every(e=>{
      const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&e.scrollWidth<=e.clientWidth;
    })'''), 'dialog overflow'


def formation(page, expected):
    assert page.evaluate("s.members.map(m=>m.name).join('')") == expected
    assert page.locator('#party .card > b').evaluate_all("es=>es.map(e=>e.firstChild.textContent.trim()).join('')") == expected
    assert page.locator('#party .party-rank').all_text_contents() == ['前衛', '後衛']
    page.locator('#party').click()
    headings = page.locator('#statsbody .statcard h3').all_text_contents()
    assert len(headings) == len(expected), headings
    for i, (name, heading) in enumerate(zip(expected, headings)):
        assert heading.startswith(name + ' '), headings
        assert ('前衛' if i < 3 else '後衛') in heading, headings
    no_overflow(page)
    page.locator('#statsclose').click()


def seed(page):
    page.evaluate("localStorage.removeItem('ash-v1')")
    page.reload()
    page.evaluate('''[0,1,2,1,2,3].forEach((job,i)=>{
      const r=generateRecruit('ABCDEF'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true);
    })''')
    page.locator('#entrance').click()
    page.wait_for_function('!logBusy()')
    # Record actual DOM immediately after every log frame is rendered. This
    # catches early name/order leaks while HP/status still show an older frame.
    page.evaluate('''window.framesSeen=[];
      const originalPump=pumpLog;
      pumpLog=function(){originalPump();if(displayVitals)framesSeen.push({
        text:s.logs[0],expected:displayVitals.members.map(m=>m.name).join(''),
        cards:[...document.querySelectorAll('#party .card > b')].map(e=>e.firstChild.textContent.trim()).join(''),
        hp:[...document.querySelectorAll('#party .hpbar')].map(e=>+e.getAttribute('aria-valuenow')),
        expectedHP:displayVitals.hp.slice(),
        stats:[...document.querySelectorAll('#statsbody .statcard h3')].map(e=>e.textContent),
        ac:[...document.querySelectorAll('#statsbody .statcard')].map(e=>[...e.querySelectorAll('dt')].find(d=>d.textContent==='AC')?.nextElementSibling.textContent),
        expectedAC:displayVitals.ac.slice()
      })};''')


def verify_frames(page):
    frames = page.evaluate('framesSeen')
    assert frames
    for f in frames:
        assert f['cards'] == f['expected'], f
        assert f['hp'] == f['expectedHP'], f
        for i, heading in enumerate(f['stats']):
            assert heading.startswith(f['expected'][i] + ' '), f
            assert ('前衛' if i < 3 else '後衛') in heading, f
        if f['stats']:
            assert [int(v) for v in f['ac']] == f['expectedAC'], f
    return frames


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
        page.locator('#party').click()
        page.evaluate('''s.logs=[];s.hp[1]=1;
          Object.assign(enemyDefinition('slime'),{swings:1,hit:99,attack:[1,1,3],flee:0,summon:0,breath:null,spell:0,statuses:[],death:0,drain:0,steal:0,rear:false});
          s.enemy={dataVersion:1,units:[{id:'slime',uid:91,row:17,hp:999,identified:true}],initiative:'party'};
          s.commands=s.members.map(()=> 'guard');s.commands[3]='spell';s.magicPlans[3]={id:'halito',target:91};
          s.commands[4]='spell';s.magicPlans[4]={id:'dios',target:1};
          s.attackRows=s.members.map(()=>17);
          var rolls=[.5,.4,.999,0];Math.random=()=>rolls.shift()??.99;enemyTurn(s.commands);render();''')
        # Actual state already moved, but the immediately visible cards still
        # show the order preceding the queued damage/retreat.
        assert page.evaluate("s.members.map(m=>m.name).join('')") == 'ACDBEF'
        page.wait_for_function('!logBusy()')
        frames = verify_frames(page)
        assert next(f for f in frames if 'ダメージ' in f['text'])['cards'] == 'ABCDEF'
        assert next(f for f in frames if f['text'] == 'Bが後列に下がった。')['cards'] == 'ACDBEF'
        assert page.evaluate("s.logs.filter(t=>t==='Bが後列に下がった。').length") == 1
        assert page.evaluate("s.magicPlans[2].id==='halito'&&s.magicPlans[2].target===91&&s.members[s.magicPlans[4].target].name==='B'")
        page.locator('#statsclose').click()
        formation(page, 'ACDBEF')
        page.screenshot(path=str(output / f'b-dead-{width}.png'))

        # Next enemy paralyses A; C,D,E must become the front in both views.
        page.locator('#party').click()
        page.evaluate('''framesSeen=[];enemyDefinition('slime').statuses=[{type:'paralysis',chance:1}];
          rolls=[.5,0,.999,0,0];enemyTurn(s.commands);render();''')
        page.wait_for_function('!logBusy()')
        frames = verify_frames(page)
        assert next(f for f in frames if f['text'] == 'Aが後列に下がった。')['cards'] == 'CDEABF'
        page.locator('#statsclose').click()
        formation(page, 'CDEABF')
        assert page.evaluate("s.logs.filter(t=>t==='Aが後列に下がった。').length") == 1
        page.screenshot(path=str(output / f'a-paralysed-{width}.png'))
        page.reload()
        page.wait_for_function('!logBusy()')
        formation(page, 'CDEABF')
        # Curing paralysis never restores an old position.
        page.evaluate("s.enemy=null;s.inventory[0].push('paralysisCure');useMedicine(0,s.inventory[0].length-1,3);render()")
        page.wait_for_function('!logBusy()')
        formation(page, 'CDEABF')

        # Exploration trap and reload preserve the rearranged party; the town
        # carry step subsequently removes precisely the dead member.
        seed(page)
        page.locator('#party').click()
        page.evaluate('''s.hp[1]=1;var rolls=[0,.2];Math.random=()=>rolls.shift()??0;
          triggerFloorTrap(s.cells[s.pos]);render();''')
        page.wait_for_function('!logBusy()')
        verify_frames(page)
        page.locator('#statsclose').click()
        formation(page, 'ACDBEF')
        page.reload()
        page.wait_for_function('!logBusy()')
        formation(page, 'ACDBEF')
        page.evaluate('s.pos=s.start;s.pendingStairs=true;render()')
        page.locator('#bossyes').click()
        assert page.locator('#templecarrydialog').is_visible()
        assert 'B（死亡）' in page.locator('#templecarrylist').inner_text()
        assert page.evaluate("s.members.map(m=>m.name).join('')") == 'ACDEF'
        no_overflow(page)
        page.locator('#templecarryok').click()
        # The dialog's close handler (clears templeReport and saves) runs asynchronously.
        page.wait_for_function("!document.querySelector('#templecarrydialog').open")
        page.wait_for_function("!JSON.parse(localStorage.getItem('ash-v1')).templeReport?.length")
        page.reload()
        assert not page.locator('#templecarrydialog').is_visible()
        if page.locator('#leveldialog').is_visible():
            page.keyboard.press('Escape')
            page.wait_for_function("!document.querySelector('#leveldialog').open")
        assert page.evaluate("s.members.map(m=>m.name).join('')") == 'ACDEF'
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        formation(page, 'ACDEF')
        no_overflow(page)
        assert not errors, errors
        print(f'PASS auto reorder Chromium {width}px: combat death/paralysis, plans, snapshot names/HP/AC, formation and labels, cure stays rear, floor trap, reload, temple carry; no JS errors or overflow')
        context.close()
    browser.close()
