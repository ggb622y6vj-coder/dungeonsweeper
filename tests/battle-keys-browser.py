"""041: combat, confirmations, reports and equipment, using page.keyboard only.

Disposable saves and a fixed RNG are installed before app startup, as in 039.
All evaluate calls are read-only assertions/observations. No synthetic clicks,
game calls, clock manipulation or runtime state writes perform interactions.
Run: python3 tests/battle-keys-browser.py [http://127.0.0.1:8000/]
"""
import json
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'
) if Path(p).exists()), None)


def fixture(**changes):
    records = []
    for i, job in enumerate((0, 2, 2, 0, 2, 3)):
        member = dict(id=f'battle-keys-{i}', name=f'冒険者{i+1}', job=job,
                      status='ok', level=3, xp=300, maxHP=100, maxMP=100,
                      str=18, baseStr=18, intelligence=18, piety=18,
                      known=['dios', 'montino', 'madi', 'calfo'] if job == 2 else [],
                      xpTargets=[0, 0]+[100*n*(n-1) for n in range(2, 31)],
                      xpCurveVersion=2)
        records.append(dict(members=member, hp=30, mp=100,
                            inventory=[['sword', 'staff', 'mace', 'dagger'][job],
                                       'healingPotion', 'antidote', 'longsword'],
                            equipped=0, armor={}, ailments=dict(poison=False,
                            paralysis=0, sleep=0, silence=0, fear=0)))
    save = dict(rosterVersion=1, roster=records,
                partyIds=[r['members']['id'] for r in records], partyVersion=1,
                dungeonCycleVersion=1, immediateChestVersion=1, area='dungeon',
                floor=1, size=8, start=26, pos=27, dir=1, boss=28, gold=0,
                relic=False, done=False, logs=[], enemy=None, pendingStairs=False,
                pendingBoss=None, cells=[dict(open=True, trap=False, flag=False,
                type='') for _ in range(64)])
    save['cells'][28]['type'] = 'boss'
    save.update(changes)
    return save


def combat(hp=999, rows=True):
    return dict(dataVersion=1, boss=False, initiative='party', target=0,
                units=[dict(id='slime', uid=11, row=7, hp=hp, rewarded=False)] +
                ([dict(id='slime', uid=42, row=23, hp=hp, rewarded=False)] if rows else []))


def selected(page, selector):
    return page.evaluate('(selector)=>!!KeyNav.current()?.matches(selector)', selector)


def ring(page, selector):
    assert selected(page, selector), (selector, page.evaluate('KeyNav.current()?.outerHTML'))
    assert page.locator(selector).evaluate('(e)=>e.classList.contains("kfocus")')


def tab_to(page, selector):
    # Tab is used only to reach auxiliary UI controls; tested command/target
    # transitions below explicitly use W/A/S/D and Space.
    for _ in range(100):
        if selected(page, selector):
            return
        page.keyboard.press('Tab')
    raise AssertionError(f'Cannot reach {selector}')


def press(page, key, settle=True):
    page.keyboard.press(key)
    if settle:
        page.wait_for_function('!logBusy()')


def spell(page, name):
    assert page.locator('#magicdialog').is_visible()
    if not selected(page, '#magiclist button'):
        tab_to(page, '#magiclist button:first-child')
    for _ in range(30):
        if selected(page, f'[data-spell="{name}"]'):
            press(page, 'Space')
            return
        page.keyboard.press('s')
    raise AssertionError(f'Cannot select spell {name} with S')


def state(page):
    return page.evaluate('JSON.stringify([s.pos,s.area,s.enemy,s.hp,s.mp,s.inventory,s.commands,s.magicPlans,s.itemPlans,commandIndex,commandConfirmed,s.pendingBoss,s.pendingStairs,s.cells])')


with sync_playwright() as p:
    options = dict(headless=True, args=['--no-sandbox'])
    if chrome:
        options['executable_path'] = chrome
    browser = p.chromium.launch(**options)
    for width in (1280, 390):
        errors = []

        def load(save):
            context = browser.new_context(viewport=dict(width=width, height=900), has_touch=width == 390)
            context.add_init_script('localStorage.setItem("ash-v1", '+json.dumps(json.dumps(save))+'); Math.random=()=>.99;')
            page = context.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(URL)
            page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
            return context, page

        # 046: two fighters reserve the same front row. The second attack
        # silently moves to the next living row, through real command entry.
        save = fixture(enemy=combat())
        save['enemy']['units'][0]['hp'] = 1
        context, page = load(save)
        for i in (0, 1):
            tab_to(page, '[data-command-choice="fight"]'); press(page, 'Space')
            tab_to(page, '[data-row-choice="7"]'); press(page, 'Space')
        for i in range(2, 6):
            tab_to(page, '[data-command-choice="guard"]'); press(page, 'Space')
        assert page.evaluate('s.attackRows.slice(0,2).every(k=>String(k)==="7")')
        tab_to(page, '#attack'); press(page, 'Space')
        assert page.evaluate('s.enemy.units[0].hp===0 && s.enemy.units[1].hp<999')
        assert page.evaluate('s.logs.filter(t=>t.includes("の攻撃。")).length===2')
        assert page.evaluate('!s.logs.some(t=>t.includes("全滅している"))')
        # Exact log count excludes any additional target-switch announcement.
        assert page.evaluate('s.logs.length===8')  # turn + four guards + two attacks + kill
        assert '全滅している' not in page.locator('#log').inner_text()
        context.close()

        # Six members: fight, group spell, ally spell, guard, medicine, guard.
        context, page = load(fixture(enemy=combat()))
        press(page, 'Space')
        ring(page, '[data-row-choice="7"]')
        press(page, 's'); ring(page, '[data-row-choice="23"]')
        press(page, 'w'); ring(page, '[data-row-choice="7"]')
        press(page, 'd'); ring(page, '[data-row-choice="23"]')
        press(page, 'Escape')
        assert page.evaluate('!choosingRow && commandIndex===0')
        press(page, 'Space'); press(page, 'Space')
        assert page.evaluate('commandIndex===1 && String(s.attackRows[0])==="7"')
        press(page, 'd'); ring(page, '[data-command-choice="guard"]')
        press(page, 's'); ring(page, '[data-command-choice="spell"]')
        press(page, 'Space')
        press(page, 'Escape'); ring(page, '[data-command-choice="spell"]')
        press(page, 'Space'); spell(page, 'montino')
        ring(page, '[data-spell-target="11"]')
        press(page, 's'); ring(page, '[data-spell-target="42"]')
        press(page, 'Space')
        assert page.evaluate('commandIndex===2 && s.magicPlans[1].id==="montino" && s.magicPlans[1].target===42')
        press(page, 'd'); press(page, 's'); press(page, 'Space'); spell(page, 'dios')
        ring(page, '[data-ally-target="0"]')
        before = state(page)
        press(page, 'Escape')
        assert not page.evaluate('!!allyTargetPick')
        assert state(page) == before
        ring(page, '[data-command-choice="spell"]')
        press(page, 'Space'); spell(page, 'dios')
        press(page, 'd'); ring(page, '[data-ally-target="1"]')
        press(page, 's'); ring(page, '[data-ally-target="4"]')
        press(page, 'a'); ring(page, '[data-ally-target="3"]')
        press(page, 'w'); ring(page, '[data-ally-target="0"]')
        press(page, 'd'); ring(page, '[data-ally-target="1"]')
        press(page, 'Space')
        assert page.evaluate('commandIndex===3 && s.magicPlans[2].target===1')
        press(page, 'Space')  # rear warrior: guard
        assert page.evaluate('commandIndex===4 && s.commands[3]==="guard"')
        press(page, 's'); ring(page, '[data-command-choice="spell"]')
        press(page, 'd'); ring(page, '[data-command-choice="item"]')
        press(page, 'Space'); ring(page, '[data-medicine-choice="1"]')
        press(page, 's'); ring(page, '[data-medicine-choice="2"]')
        press(page, 'w'); ring(page, '[data-medicine-choice="1"]')
        press(page, 'Space')
        press(page, 'd'); ring(page, '[data-ally-target="1"]')
        press(page, 'Space')
        assert page.evaluate('commandIndex===5 && s.itemPlans[4].id==="healingPotion" && s.itemPlans[4].target===1')
        press(page, 'd'); ring(page, '[data-command-choice="item"]')
        press(page, 'Space'); press(page, 'Space'); press(page, 'Space')
        ring(page, '#attack')
        press(page, 'Escape')
        assert page.evaluate('commandIndex===5')
        press(page, 'Space')  # replace the last member's medicine with guard
        ring(page, '#attack')
        assert page.evaluate('s.commands') == ['fight', 'spell', 'spell', 'guard', 'item', 'guard']
        assert page.evaluate('s.hp[1]') == 30
        press(page, 'Space', settle=False)
        page.wait_for_function('logBusy()')
        computed = state(page)
        for key in ('Space', 'Enter', 'Escape', 'd', 'Space'):
            page.keyboard.press(key)
            assert state(page) == computed, key
        page.wait_for_function('!logBusy()')
        assert page.evaluate('commandIndex===0 && s.hp[1]>30 && s.inventory[4].length===3 && s.inventory[5].length===4')
        assert page.evaluate('s.logs.filter(t=>t.includes("ターン開始")).length') == 1
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        context.close()

        # The remaining command types are reachable without leaving WASD.
        save = fixture(enemy=combat())
        save['enemy']['units'][0]['id'] = 'skeleton'  # 069: dispel needs a living undead row
        save['roster'][0]['members']['job'] = 2
        context, page = load(save)
        press(page, 's'); ring(page, '[data-command-choice="dispel"]')
        press(page, 'Space')
        # 069: dispel now asks for an undead row first; Space confirms the default row.
        assert page.evaluate('choosingRow==="dispel" && commandIndex===0')
        ring(page, '[data-row-choice]')
        press(page, 'Space')
        assert page.evaluate('commandIndex===1 && s.commands[0]==="dispel"')
        context.close()
        context, page = load(fixture(enemy=combat()))
        press(page, 's'); ring(page, '[data-command-choice="item"]')
        # 070: the disabled 戻る is skipped at every width: アイテム -S-> クイック攻撃 -D-> 逃げる -W-> アイテム.
        press(page, 's'); ring(page, '#quickattack')
        press(page, 'w'); ring(page, '[data-command-choice="item"]')
        press(page, 's'); ring(page, '#quickattack')
        press(page, 'd'); ring(page, '#flee')
        press(page, 'Space')
        assert page.evaluate('s.logs.some(t=>t.includes("逃走に失敗"))')
        context.close()

        # Fear/silence allow logical focus and explain why Space does nothing.
        save = fixture(enemy=combat())
        save['roster'][0]['members']['job'] = 2
        save['roster'][0]['members']['known'] = ['dios']
        save['roster'][0]['ailments'].update(fear=3, silence=3)
        context, page = load(save)
        before = state(page)
        press(page, 'Space'); ring(page, '[data-command-choice="fight"]')
        assert state(page) == before
        assert '恐怖で攻撃できない' in page.locator('#keyhint').text_content()
        press(page, 'd'); press(page, 's'); ring(page, '[data-command-choice="spell"]')
        press(page, 'Space')
        assert state(page) == before
        assert '沈黙している' in page.locator('#keyhint').text_content()
        assert not page.locator('#magicdialog').is_visible()
        for modifier in ('Control', 'Alt', 'Meta'):
            press(page, modifier+'+d')
            ring(page, '[data-command-choice="spell"]')
        context.close()

        # Confirmation defaults, cycling both axes, and chest Escape safety.
        for answer in ('Space', 'Escape', 'yes'):
            context, page = load(fixture(pos=28, pendingBoss=dict(previous=27)))
            if answer == 'yes':
                press(page, 'd'); ring(page, '#bossyes'); press(page, 'Space')
                assert page.evaluate('!!s.enemy && s.enemy.boss')
            else:
                press(page, answer)
                assert page.evaluate('!s.enemy && !s.pendingBoss && s.pos===27')
            context.close()
        context, page = load(fixture(pos=26, pendingStairs=True))
        press(page, 's'); ring(page, '#bossno')
        press(page, 'w'); ring(page, '#bossyes')
        press(page, 'Space'); assert page.evaluate('s.area==="town"')
        context.close()
        context, page = load(fixture(pos=26, pendingStairs=True))
        press(page, 'Escape'); assert page.evaluate('!s.pendingStairs && s.area==="dungeon"')
        context.close()
        for thief in (True, False):
            save = fixture()
            if not thief:
                save['roster'][5]['members']['job'] = 0
            save['cells'][27]['chest'] = dict(opened=False, trap='none', gold=3)
            context, page = load(save)
            before = state(page)
            press(page, 'Escape')
            ring(page, '#chestthief' if thief else '#chestopen')
            assert state(page) == before
            press(page, 'd'); press(page, 'a')
            ring(page, '#chestthief' if thief else '#chestopen')
            press(page, 'Space'); assert page.evaluate('!currentChest()')
            context.close()

        # Win a real turn, return via stairs, and close the actual level report.
        save = fixture(enemy=combat(hp=1, rows=False))
        save['roster'][0]['members'].update(level=1, xp=199)
        context, page = load(save)
        for i in range(6):
            if i:
                tab_to(page, '[data-command-choice="guard"]')
            press(page, 'Space')
        ring(page, '#attack'); press(page, 'Space')
        assert page.evaluate('!s.enemy && s.members[0].xp>=200')
        press(page, 's')  # west onto the up stairs
        assert page.evaluate('!!s.pendingStairs')
        press(page, 'Space')
        assert page.locator('#leveldialog').is_visible()
        press(page, 'Space'); assert not page.locator('#leveldialog').is_visible()
        context.close()

        # Near-wipe return: five incapacitated members, report chain and Esc.
        save = fixture(pos=26, pendingStairs=True)
        for r in save['roster'][1:]:
            r['members']['status'] = 'dead'; r['hp'] = 0
        save['roster'][0]['members'].update(level=1, xp=200)
        context, page = load(save)
        press(page, 'Space')
        assert page.locator('#templecarrydialog').is_visible()
        assert page.evaluate('s.members.length===1 && s.reserve.length===5')
        press(page, 'Escape')
        page.wait_for_function('document.querySelector("#leveldialog").open')
        assert not page.locator('#templecarrydialog').is_visible()
        assert page.evaluate('s.templeReport.length') == 0
        press(page, 'Enter'); assert not page.locator('#leveldialog').is_visible()
        context.close()
        for key in ('Space', 'Enter', 'Escape'):
            context, page = load(fixture(clearNotice=True, cleared=True))
            press(page, key)
            assert page.evaluate('s.area==="town"')
            context.close()

        # Status cards follow the two-column layout; Space opens inventory and
        # equips a different slot. Field spells use the same target navigation.
        context, page = load(fixture())
        press(page, 'c'); ring(page, '[data-stat-member="0"]')
        press(page, 'd'); ring(page, '[data-stat-member="1"]')
        press(page, 's'); ring(page, '[data-stat-member="3"]')
        press(page, 'a'); ring(page, '[data-stat-member="2"]')
        press(page, 'w'); ring(page, '[data-stat-member="0"]')
        press(page, 'Space')
        tab_to(page, '[data-equip="3"]'); press(page, 'Space')
        assert page.evaluate('s.equipped[0]') == 3
        press(page, 'Escape'); assert page.locator('#statsdialog').is_visible()
        press(page, 'Escape'); assert not page.locator('#statsdialog').is_visible()
        context.close()

        context, page = load(fixture())
        press(page, 'c'); press(page, 'Space')
        tab_to(page, '[data-use-medicine="1"]'); press(page, 'Space')
        ring(page, '[data-ally-target="0"]')
        before = state(page)
        press(page, 'Escape')
        assert state(page) == before
        assert page.locator('#medicinedialog').is_visible()
        tab_to(page, '[data-medicine-choice="1"]'); press(page, 'Space')
        press(page, 's'); ring(page, '[data-ally-target="3"]')
        press(page, 'Space')
        assert page.evaluate('s.hp[3]>30 && s.inventory[0].length===3 && !allyTargetPick')
        context.close()

        # Dead and petrified cards are skipped by keyboard, while Madi can still
        # select stone. Run in both field and battle without changing live state.
        for battle in (False, True):
            save = fixture(enemy=combat() if battle else None)
            save['roster'][0]['members']['job'] = 2
            save['roster'][0]['members']['known'] = ['dios', 'madi']
            save['roster'][1]['members']['status'] = 'dead'; save['roster'][1]['hp'] = 0
            save['roster'][4]['members']['status'] = 'stone'
            context, page = load(save)
            if battle:
                tab_to(page, '[data-command-choice="spell"]'); press(page, 'Space')
            else:
                press(page, 'c'); tab_to(page, '[data-stat-cast="0"]'); press(page, 'Space')
            spell(page, 'dios')
            before = state(page)
            press(page, 'd'); ring(page, '[data-ally-target="2"]')
            press(page, 's'); ring(page, '[data-ally-target="5"]')
            press(page, 'a'); ring(page, '[data-ally-target="3"]')
            for key in ('d', 's', 's', 'd', 'w', 'a', 'w'):
                press(page, key)
                assert page.evaluate('![1,4].includes(+(KeyNav.current()?.dataset.allyTarget ?? -1))')
                assert selected(page, '[data-ally-target]')
            press(page, 'Escape')
            assert state(page) == before
            assert not page.evaluate('!!allyTargetPick')
            if battle:
                tab_to(page, '[data-command-choice="spell"]'); press(page, 'Space')
            spell(page, 'madi')
            # Use Tab to inspect the full candidate set too; no dead card stops.
            tab_to(page, '[data-ally-target="4"]')
            press(page, 'Space')
            assert page.evaluate('s.magicPlans[0]?.target===4' if battle else 's.members.find(m=>m.id==="battle-keys-4").status==="ok"')
            context.close()

        assert not errors, errors
        print(f'PASS battle keys {width}px: six commands, row IDs, ally targets, Esc/re-entry, fear/silence, '
              'busy decisions, boss/stairs/chest defaults, report chain, equipment, no JS errors')
    browser.close()
