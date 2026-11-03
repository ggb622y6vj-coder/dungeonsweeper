"""040: all town interactions use page.keyboard, at 1280 and 390px.

Only disposable saved-state fixtures/RNG are installed before startup (as in 039).
All evaluate calls are read-only assertions; no click/fill/select_option/focus,
DOM event dispatch, or direct game-function calls perform any interaction.
"""
import json
import os
import subprocess
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
CHROME = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'
) if Path(p).exists()), None)


def fixture():
    # Real save serialization, including independent PARTY_FIELDS for A and B.
    script = """
    const {game}=require('./scripts/sim/harness.cjs');const g=game(null,()=>.25);
    g.run(`for(const [name,job] of [['A',0],['B',2],['死亡者',1],['灰の者',0],['石化者',2]]){
      const r=generateRecruit(name,job);registerRecruit(r);changeRecruitParty(r.members.id,true);
    }
    s.members[2].status='dead';s.hp[2]=0;
    s.members[3].status='ash';s.hp[3]=0;
    s.members[4].status='stone';s.hp[4]=7;
    s.gold=10000;
    s.library.monsters=Object.fromEntries(ENEMIES.map(d=>[d.id,{count:1,firstFloor:d.floor}]));
    s.library.items=Object.fromEntries([...WEAPONS,...MEDICINES].map(w=>[w.id,true]));save()`);
    process.stdout.write(g.run("localStorage.getItem('ash-v1')"));
    """
    return json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT, text=True))


def focused(page, selector):
    return page.locator(selector).evaluate('(e)=>document.activeElement===e')


def tab_to(page, selector):
    for _ in range(180):
        if focused(page, selector):
            return
        page.keyboard.press('Tab')
    raise AssertionError(f'Cannot reach {selector} with keyboard: '+page.evaluate('document.activeElement.outerHTML'))


def choose(page, selector, key='Space'):
    tab_to(page, selector)
    page.keyboard.press(key)


def ring(page, selector):
    assert page.locator(selector).evaluate('(e)=>e.classList.contains("kfocus")'), selector
    assert page.locator('.kfocus').count() == 1


def escape(page, closed, parent=None):
    page.keyboard.press('Escape')
    assert not page.locator(closed).is_visible(), closed
    if parent:
        assert page.locator(parent).is_visible(), parent


def layout(page):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert page.locator('dialog[open]').evaluate_all('els=>els.every(e=>e.scrollWidth<=e.clientWidth)')


with sync_playwright() as p:
    options = dict(headless=True, args=['--no-sandbox'])
    if CHROME:
        options['executable_path'] = CHROME
    browser = p.chromium.launch(**options)
    save = fixture()
    for width in (1280, 390):
        errors = []
        context = browser.new_context(viewport=dict(width=width, height=900), has_touch=width == 390)
        page = context.new_page()
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav')
        assert page.evaluate("KeyNav.current().id==='entrance'")
        assert page.locator('#entrance').is_disabled()
        # Both columns, all four spatial directions, starting on the entrance.
        for key, target in [('s', 'trainingopen'), ('d', 'tavernopen'),
                            ('s', 'templeopen'), ('a', 'blacksmith'),
                            ('w', 'trainingopen')]:
            page.keyboard.press(key)
            ring(page, '#'+target)

        # Tavern -> shared registration, with a nested return to the tavern.
        choose(page, '#tavernopen')
        assert focused(page, '#tavernsave')
        choose(page, '#tavernmanage')
        assert focused(page, '#rollrecruit')
        tab_to(page, '#recruitname')
        for key in ('w', 'a', 's', 'd', 'Space', 'q', 'e'):
            page.keyboard.press(key)
            assert focused(page, '#recruitname')
        assert page.locator('#recruitname').input_value() == 'wasd qe'
        for modifier in ('Control', 'Alt', 'Meta'):
            page.keyboard.press(modifier+'+Enter')
            assert page.evaluate('trainingRoster().length') == 0
        page.keyboard.press('Enter')
        assert page.evaluate('trainingRoster().map(r=>r.members.name)') == ['wasd qe']
        assert focused(page, '#recruitname')
        page.keyboard.down('Escape'); page.keyboard.down('Escape'); page.keyboard.up('Escape')
        assert focused(page, '#rollrecruit')
        assert page.locator('#training').is_visible()
        join = '#recruitlist section:first-child .recruit-actions button:first-child'
        delete = '#recruitlist section:first-child .recruit-actions button:last-child'
        choose(page, join)
        assert page.evaluate('s.members.length') == 1
        choose(page, join)
        assert page.evaluate('s.members.length===0&&s.reserve.length===1')
        choose(page, delete)
        assert focused(page, '#recruitdeletecancel')
        assert page.locator('#recruitdeletecancel').inner_text() == 'キャンセル'
        for _ in range(6):
            page.keyboard.press('Space')
            assert page.evaluate('trainingRoster().length') == 1
        if not page.locator('#recruitdeletedialog').is_visible():
            choose(page, delete)
        page.keyboard.press('d'); ring(page, '#recruitdeleteconfirm')
        page.keyboard.press('Space')
        assert page.evaluate('trainingRoster().length') == 0
        assert not page.locator('#recruitdeletedialog').is_visible()
        escape(page, '#training', '#taverndialog')
        assert focused(page, '#tavernmanage')
        assert page.locator('#tavernslots option').count() == 6
        escape(page, '#taverndialog', '#town')

        # Name-field Esc is a separate step; a second Esc closes the dialog.
        choose(page, '#trainingopen')
        tab_to(page, '#recruitname')
        page.keyboard.press('Escape'); assert focused(page, '#rollrecruit')
        escape(page, '#training', '#town')
        choose(page, '#resetopen')
        assert focused(page, '#resetcancel')
        before = page.evaluate('localStorage.getItem("ash-v1")')
        for _ in range(6):
            page.keyboard.press('Space')
            assert page.evaluate('localStorage.getItem("ash-v1")') == before
        if page.locator('#resetdialog').is_visible():
            escape(page, '#resetdialog', '#town')
        layout(page)
        context.close()

        # Startup fixture reuses 032/033 statuses. Town load creates the carry
        # report through the production migration; .0 makes revival succeed.
        context = browser.new_context(viewport=dict(width=width, height=900), has_touch=width == 390)
        context.add_init_script('localStorage.setItem("ash-v1", '+json.dumps(json.dumps(save))+'); Math.random=()=>0;')
        page = context.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL); page.wait_for_function('!!globalThis.KeyNav')
        assert page.locator('#templecarrydialog').is_visible()
        assert focused(page, '#templecarryok')
        assert '石化者（石化）' in page.locator('#templecarrylist').inner_text()
        escape(page, '#templecarrydialog', '#town')
        # The dialog 'close' event (which clears the report) is dispatched asynchronously.
        page.wait_for_function('s.templeReport.length===0', timeout=5000)
        choose(page, '#templeopen')
        gold = page.evaluate('s.gold')
        for name, cost in [('死亡者', 25), ('灰の者', 60), ('石化者', 40)]:
            ring(page, '#templemembers .shopitem:first-child button')
            page.keyboard.press('Space')
            gold -= cost
            assert page.evaluate('s.gold') == gold
            record = page.evaluate('(name)=>s.reserve.find(r=>r.members.name===name)', name)
            assert record['members']['status'] == 'ok'
            assert record['hp'] == record['members']['maxHP']
            assert record['mp'] == record['members']['maxMP']
        assert page.locator('#templemembers button').count() == 0
        escape(page, '#templedialog', '#town')

        # Two selections swap full records; focus follows the stable member ID.
        choose(page, '#trainingopen'); choose(page, '#trainingreorder')
        before = page.evaluate('partyRecords()')
        assert [r['members']['name'] for r in before] == ['A', 'B']
        first = '#trainingorderlist button:first-child'
        page.keyboard.press('Space'); ring(page, first)
        assert page.locator(first).get_attribute('aria-pressed') == 'true'
        assert '選択中' in page.locator(first).inner_text()
        page.keyboard.press('d'); ring(page, '#trainingorderlist button:last-child')
        assert page.locator(first).get_attribute('class') == 'order-picked'
        page.keyboard.press('Space')
        assert page.evaluate('partyRecords()') == list(reversed(before))
        assert page.locator('#trainingorderlist .order-picked').count() == 0
        page.keyboard.press('Space')
        page.keyboard.press('Escape')
        assert page.locator('#trainingorderdialog').is_visible()
        assert page.locator('#trainingorderlist .order-picked').count() == 0
        assert page.evaluate('partyRecords()') == list(reversed(before))
        escape(page, '#trainingorderdialog', '#training')
        escape(page, '#training', '#town')

        # Shop stock, buying twice, selling once, then transferring to A.
        choose(page, '#blacksmith')
        before = page.evaluate('({gold:s.gold,inventory:structuredClone(s.inventory)})')
        price = page.evaluate("weapon('helm').price")
        sell_price = page.evaluate("weapon('helm').sell")
        choose(page, '[data-buy="helm"]'); page.keyboard.press('Space')
        assert page.evaluate('s.gold') == before['gold']-price*2
        assert page.evaluate('s.inventory[0].slice(-2)') == ['helm', 'helm']
        choose(page, '#shopinventory')
        choose(page, '[data-sell="1"]')
        assert page.evaluate('s.gold') == before['gold']-price*2+sell_price
        assert page.evaluate('s.inventory[0].length') == len(before['inventory'][0])+1
        choose(page, '#transfersection summary')
        assert page.locator('#transfersection').get_attribute('open') is not None
        tab_to(page, '#transferitem'); page.keyboard.press('Home')
        # SELECT owns WASD/QE/Space; game state and active layer are unchanged.
        item_before = page.evaluate('JSON.stringify(s.inventory)')
        for key in ('w', 'a', 's', 'd', 'q', 'e'):
            page.keyboard.press(key); assert focused(page, '#transferitem')
            assert page.evaluate('JSON.stringify(s.inventory)') == item_before
        tab_to(page, '#transfermember'); page.keyboard.press('Home')
        choose(page, '#transfergive')
        assert page.evaluate('s.inventory[0]') == before['inventory'][0]
        assert page.evaluate('s.inventory[1]') == before['inventory'][1]+['helm']
        escape(page, '#inventorydialog', '#shopdialog')
        assert focused(page, '#shopinventory')
        # Reach the last stock entry using downward movement and auto-scroll.
        tab_to(page, '#shopitems .shopitem:first-child button')
        for _ in range(page.locator('#shopitems button').count()-1):
            page.keyboard.press('s')
        ring(page, '#shopitems .shopitem:last-child button')
        assert page.locator('#shopdialog').evaluate('(e)=>e.scrollTop>0')
        escape(page, '#shopdialog', '#town')

        # All three tabs, wrap-around, shortcut from list/close button, stable
        # first/last list navigation and nested detail return for every catalog.
        choose(page, '#libraryopen')
        tabs = ['monsters', 'items', 'spells']
        for key, expected in [('d','items'),('d','spells'),('d','monsters'),
                              ('a','spells'),('a','items'),('a','monsters'),
                              ('e','items'),('e','spells'),('e','monsters'),
                              ('q','spells'),('q','items'),('q','monsters')]:
            page.keyboard.press(key); ring(page, '#librarytab-'+expected)
            assert page.locator('#librarytab-'+expected).get_attribute('aria-selected') == 'true'
        for index, (tab, total) in enumerate(zip(tabs, (92,57,28))):
            assert page.locator('#librarytab-'+tab).get_attribute('aria-selected') == 'true'
            page.keyboard.press('s'); ring(page, '#librarybody .library-entry:first-of-type')
            page.keyboard.press('w'); ring(page, '#librarytab-'+tab)
            page.keyboard.press('s')
            assert page.locator('#librarybody .library-entry').count() == total
            for _ in range(total-1):
                page.keyboard.press('s')
            last = '#librarybody .library-entry:last-child'
            ring(page, last)
            assert page.locator('#librarybody').evaluate('(e)=>e.scrollTop>0')
            page.keyboard.press('s'); ring(page, last)
            title = page.locator(last+' h4').inner_text()
            page.keyboard.press('Space')
            assert page.locator('#librarydetaildialog').is_visible()
            assert page.locator('#librarydetailbody h4').inner_text() == title
            # Undiscovered entries (any tab) hide name and details.
            assert page.locator('#librarydetailbody dl').count() == (0 if title == '？？？' else 1)
            if tab == 'spells':
                names = page.locator('#librarybody .library-entry h4').all_inner_texts()
                hidden = [n for n in names if n == '？？？']
                assert 0 < len(hidden) < total, names
                assert page.locator('#librarybody .library-entry:has(dl)').count() == total-len(hidden)
            layout(page)
            escape(page, '#librarydetaildialog', '#librarydialog'); ring(page, last)
            if index < 2:
                page.keyboard.press('e')
                ring(page, '#librarytab-'+tabs[index+1])
        tab_to(page, '#libraryclose'); page.keyboard.press('e'); ring(page, '#librarytab-monsters')
        for modifier in ('Control', 'Alt', 'Meta'):
            page.keyboard.press(modifier+'+e')
            assert page.locator('#librarytab-monsters').get_attribute('aria-selected') == 'true'
        escape(page, '#librarydialog', '#town')
        layout(page)
        assert not errors, errors
        context.close()
        print(f'PASS town keys {width}px: tavern/registration, safe confirmations, temple/carry, '
              'swap/cancel, shop/sell/transfer/stock, all catalogs/details/scroll, Esc layers, no JS errors')
    browser.close()
