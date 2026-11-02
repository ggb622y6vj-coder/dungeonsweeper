"""036: Montino library/spell entries, silence snapshots and command availability.
Run: python3 tests/silence-browser.py [http://127.0.0.1:8000/]
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
output = Path(os.environ.get('SILENCE_SCREENSHOT_DIR', '/tmp/silence-browser'))
output.mkdir(parents=True, exist_ok=True)


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
    assert page.evaluate('''[...document.querySelectorAll('dialog[open]')].every(e=>{
      const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&e.scrollWidth<=e.clientWidth;
    })'''), 'dialog overflow'


def seed(page):
    page.evaluate("localStorage.removeItem('ash-v1')")
    page.reload()
    page.evaluate('''[2,0,1,0,2,3].forEach((job,i)=>{
      const r=generateRecruit('ABCDEF'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true);
    });
    s.members.forEach((m,i)=>{m.level=8;m.known=MAGIC.filter(x=>x.job===jobOf(i)&&x.level<=8).map(x=>x.id)});
    s.inventory[0].push('paralysisCure');
    s.library.monsters.darkpriest={count:1,firstFloor:4};
    s.library.monsters.witch={count:1,firstFloor:8};render();''')


def silence_cast(page):
    # Exercise the real enemy action with one spell roll and six independent saves.
    # Observe each replayed frame, including the cast before any afflictions appear.
    page.evaluate('''window.framesSeen=[];
      const originalPump=pumpLog;
      pumpLog=function(){originalPump();if(displayVitals)framesSeen.push({
        text:s.logs[0],
        names:[...document.querySelectorAll('#party .card > b')].map(e=>e.firstChild.textContent.trim()).join(''),
        tags:[...document.querySelectorAll('#party .card')].map(e=>!!e.querySelector('.ailment-silence')),
        expected:displayVitals.ailments.map(a=>a.silence>0)
      })};
      const originalRandom=Math.random,rolls=[.25,0,.99,0,.99,0,.99];
      try {Math.random=()=>rolls.shift()??.99;enemyTurn(s.commands);}
      finally {Math.random=originalRandom;}
      render();''')
    page.wait_for_function('!logBusy()')
    frames = page.evaluate('framesSeen')
    assert len(frames) == 7, frames
    for frame in frames:
        assert frame['names'] == 'ABCDEF', frame
        assert frame['tags'] == frame['expected'], frame
    assert frames[0]['text'] == '闇の司祭はモンティノを唱えた。'
    assert frames[0]['tags'] == [False] * 6
    assert frames[1]['text'] == 'Aは沈黙した。'
    assert frames[1]['tags'] == [True, False, False, False, False, False]
    assert frames[2]['text'] == 'Bには効かなかった。'
    assert page.evaluate('s.ailments.map(a=>a.silence)') == [3, 0, 3, 0, 3, 0]


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

        page.locator('#libraryopen').click()
        for name, chance in (('闇の司祭', 30), ('魔女', 25)):
            entry = page.locator('#librarybody .library-entry').filter(
                has=page.get_by_role('heading', name=name, exact=True))
            entry.scroll_into_view_if_needed()
            assert entry.is_visible()
            assert f'モンティノ（沈黙・全体 {chance}%）' in entry.inner_text()
            no_overflow(page)
            page.screenshot(path=str(output / f'montino-library-{chance}-{width}.png'))
        page.locator('#libraryclose').click()

        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        page.evaluate('''s.pendingStairs=false;s.pendingBoss=null;
          s.cells.forEach(c=>{c.flag=false;delete c.chest});
          s.enemy={dataVersion:1,units:[{...makeEnemy('darkpriest',91),row:17,hp:999,identified:true}],
            initiative:'normal',flagEffect:{}};
          s.commands=s.members.map(()=>'guard');s.attackRows=s.members.map(()=>17);
          resetCommandEntry();render();''')

        page.locator('[data-command-choice="spell"]').click()
        montino = page.locator('[data-spell="montino"]')
        assert montino.is_visible() and montino.is_enabled()
        assert 'モンティノ' in montino.inner_text() and 'MP 4' in montino.inner_text()
        assert 'Lv.3' in montino.inner_text() and '選択した列の敵に沈黙判定' in montino.inner_text()
        assert '麻痺・睡眠・沈黙を治す' in page.locator('[data-spell="dialko"]').inner_text()
        no_overflow(page)
        page.screenshot(path=str(output / f'montino-spell-{width}.png'))
        page.locator('#magicclose').click()

        silence_cast(page)
        for i in (0, 2, 4):
            tag = page.locator('#party .card').nth(i).locator('.ailment-silence')
            assert tag.is_visible() and tag.inner_text() == '沈黙'
            assert tag.evaluate('e=>getComputedStyle(e).backgroundColor') == 'rgb(56, 45, 67)'
        spell = page.locator('[data-command-choice="spell"]')
        assert spell.is_disabled() and spell.get_attribute('title') == '沈黙している'
        assert float(spell.evaluate('e=>getComputedStyle(e).opacity')) < 1
        for command in ('fight', 'guard', 'item'):
            assert page.locator(f'[data-command-choice="{command}"]').is_enabled()
        assert page.evaluate("spellReason(0,magic('dialko'))") == '沈黙している'
        no_overflow(page)
        page.screenshot(path=str(output / f'silence-command-{width}.png'))

        # Inspect the same spell dialog directly: each spell is blocked as well.
        page.evaluate('openMagic(0)')
        for spell_id in ('montino', 'dialko', 'madi'):
            assert page.locator(f'[data-spell="{spell_id}"]').is_disabled()
        assert '沈黙している' in page.locator('[data-spell="dialko"]').inner_text()
        no_overflow(page)
        page.locator('#magicclose').click()

        # The enabled physical command must actually accept a reservation.
        page.locator('[data-command-choice="fight"]').click()
        assert page.evaluate("s.commands[0]==='fight'&&commandConfirmed[0]&&commandIndex===1")
        page.locator('[data-command-back]').click()
        assert page.locator('[data-command-choice="spell"]').is_disabled()

        # Skip enemy actions via party initiative to isolate three real end-turn ticks.
        for remaining in (2, 1, 0):
            page.evaluate("s.commands=s.members.map(()=>'guard');s.enemy.initiative='party';attack()")
            page.wait_for_function('!logBusy()')
            assert page.evaluate('s.ailments[0].silence') == remaining
        assert 'Aの沈黙が解けた。' in page.locator('#log').inner_text()
        assert page.locator('#party .ailment-silence').count() == 0
        assert page.locator('[data-command-choice="spell"]').is_enabled()
        page.locator('[data-command-choice="spell"]').click()
        page.locator('[data-spell="montino"]').click()
        assert page.evaluate("s.commands[0]==='spell'&&s.magicPlans[0].id==='montino'&&s.magicPlans[0].target===91")
        no_overflow(page)
        assert not errors, errors
        print(f'PASS silence Chromium {width}px: library, Montino selection, snapshot tags, disabled spells, physical command, three-turn recovery; no JS errors or horizontal scroll')
        context.close()
    browser.close()
