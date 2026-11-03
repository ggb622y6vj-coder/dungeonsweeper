"""037: fear command restrictions, cures, snapshot tags and monster library.
Run: python3 tests/fear-browser.py [http://127.0.0.1:8000/]
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
output = Path(os.environ.get('FEAR_SCREENSHOT_DIR', '/tmp/fear-browser'))
output.mkdir(parents=True, exist_ok=True)


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
    assert page.evaluate('''[...document.querySelectorAll('dialog[open]')].every(e=>{
      const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&e.scrollWidth<=e.clientWidth;
    })'''), 'dialog overflow'


def afflict(page):
    page.evaluate("afflict(0,'fear');render()")
    page.wait_for_function('!logBusy()')
    assert page.locator('#party .card').nth(0).locator('.ailment-fear').inner_text() == '恐怖'


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
        page.evaluate('''[2,0,1,0,2,3].forEach((job,i)=>{
          const r=generateRecruit('ABCDEF'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true);
        });
        s.members.forEach((m,i)=>{m.level=12;m.maxHP=1000;m.maxMP=1000;
          m.known=MAGIC.filter(x=>x.job===jobOf(i)).map(x=>x.id)});
        s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);
        s.inventory[0].push('paralysisCure');
        for(const [id,floor] of [['wraith',6],['hellhound',7],['fiendhound',9],['reaper',10]])
          s.library.monsters[id]={count:1,firstFloor:floor};
        render();''')
        page.locator('#libraryopen').click()
        for name, chance in (('亡霊', 15), ('地獄の犬', 15), ('魔界の猟犬', 15), ('死神', 20)):
            entry = page.locator('#librarybody .library-entry').filter(
                has=page.get_by_role('heading', name=name, exact=True))
            entry.scroll_into_view_if_needed()
            assert entry.is_visible() and f'恐怖 {chance}%' in entry.inner_text()
            no_overflow(page)
        page.screenshot(path=str(output / f'fear-library-{width}.png'))
        page.locator('#libraryclose').click()
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        page.evaluate('''s.pendingStairs=false;s.pendingBoss=null;
          s.cells.forEach(c=>{c.flag=false;delete c.chest});
          s.enemy={dataVersion:1,units:[{...makeEnemy('hellhound',91),row:17,hp:99999,identified:true}],
            initiative:'normal',flagEffect:{}};
          s.commands=s.members.map(()=>'guard');s.attackRows=s.members.map(()=>17);
          resetCommandEntry();render();
          window.framesSeen=[];
          const originalPump=pumpLog;
          pumpLog=function(){originalPump();if(displayVitals)framesSeen.push({
            text:s.logs[0],
            names:[...document.querySelectorAll('#party .card > b')].map(e=>e.firstChild.textContent.trim()).join(''),
            tags:[...document.querySelectorAll('#party .card')].map(e=>!!e.querySelector('.ailment-fear')),
            expected:displayVitals.ailments.map(a=>a.fear>0)
          })};
          const originalRandom=Math.random;
          try {Math.random=()=>0;monsterHurt(0,4,s.commands,'地獄の犬');monsterOnHit(s.enemy.units[0],0);}
          finally {Math.random=originalRandom;}
          autoReorderParty('enemy-action');render();''')
        page.wait_for_function('!logBusy()')
        frames = page.evaluate('framesSeen')
        assert len(frames) == 2, frames
        for frame in frames:
            assert frame['names'] == 'ABCDEF', frame
            assert frame['tags'] == frame['expected'], frame
        assert frames[0]['tags'] == [False] * 6
        assert frames[1]['text'] == 'Aは恐怖に怯えた。'
        assert frames[1]['tags'] == [True, False, False, False, False, False]
        tag = page.locator('#party .card').nth(0).locator('.ailment-fear')
        assert tag.is_visible() and tag.inner_text() == '恐怖'
        assert tag.evaluate('e=>getComputedStyle(e).backgroundColor') == 'rgb(67, 46, 44)'
        fight = page.locator('[data-command-choice="fight"]')
        assert fight.is_disabled() and fight.get_attribute('title') == '恐怖で攻撃できない'
        assert '恐怖で攻撃できない' in fight.inner_text()
        assert float(fight.evaluate('e=>getComputedStyle(e).opacity')) < 1
        for command in ('guard', 'spell', 'item'):
            assert page.locator(f'[data-command-choice="{command}"]').is_enabled()
        no_overflow(page)
        page.screenshot(path=str(output / f'fear-command-{width}.png'))

        # Guard is accepted while afraid; the back button restores the same actor.
        page.locator('[data-command-choice="guard"]').click()
        assert page.evaluate("s.commands[0]==='guard'&&commandConfirmed[0]&&commandIndex===1")
        page.locator('[data-command-back]').click()
        # Save/reload must retain duration and the disabled command.
        page.evaluate('save()')
        page.reload()
        assert page.evaluate('s.ailments[0].fear') == 3
        assert page.locator('[data-command-choice="fight"]').is_disabled()
        for remaining in (2, 1, 0):
            page.evaluate("s.commands=s.members.map(()=>'guard');s.enemy.initiative='party';attack()")
            page.wait_for_function('!logBusy()')
            assert page.evaluate('s.ailments[0].fear') == remaining
        assert 'Aは落ち着きを取り戻した。' in page.locator('#log').inner_text()
        assert page.locator('#party .ailment-fear').count() == 0
        assert page.locator('[data-command-choice="fight"]').is_enabled()

        # Self-cure via the normal spell UI and party-card targeting.
        for spell_id in ('dialko', 'madi'):
            afflict(page)
            page.locator('[data-command-choice="spell"]').click()
            assert page.locator(f'[data-spell="{spell_id}"]').is_enabled()
            assert '麻痺・睡眠・沈黙・恐怖を治す' in page.locator('[data-spell="dialko"]').inner_text()
            no_overflow(page)
            page.locator(f'[data-spell="{spell_id}"]').click()
            page.locator('#party .card').nth(0).click()
            assert page.evaluate(f"s.commands[0]==='spell'&&s.magicPlans[0].id==='{spell_id}'&&s.magicPlans[0].target===0")
            page.evaluate("s.enemy.initiative='party';attack()")
            page.wait_for_function('!logBusy()')
            assert page.evaluate('s.ailments[0].fear') == 0
        afflict(page)
        page.locator('[data-command-choice="item"]').click()
        assert '麻痺・睡眠・沈黙・恐怖を治す' in page.locator('#medicinedescription').inner_text()
        page.locator('#medicinepick').click()
        page.locator('#party .card').nth(0).click()
        assert page.evaluate("s.commands[0]==='item'&&s.itemPlans[0].id==='paralysisCure'")
        page.evaluate("s.enemy.initiative='party';attack()")
        page.wait_for_function('!logBusy()')
        assert page.evaluate('s.ailments[0].fear') == 0
        assert page.evaluate("!s.inventory[0].includes('paralysisCure')")
        assert page.evaluate("s.members.map(m=>m.name).join('')") == 'ABCDEF'
        no_overflow(page)
        assert not errors, errors
        print(f'PASS fear Chromium {width}px: library, snapshot tags, commands, save/reload, duration, cures; no JS errors or horizontal scroll')
        context.close()
    browser.close()
