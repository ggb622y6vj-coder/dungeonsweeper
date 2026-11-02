"""Run with Playwright Python against dist served on localhost:8000.

Example: CHROME_PATH=/opt/google/chrome/chrome /tmp/pyv/bin/python tests/target-select-browser.py
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


def layout(page):
    return page.evaluate("""()=>({party:document.querySelector('#party').getBoundingClientRect().y,partyBottom:document.querySelector('#party').getBoundingClientRect().bottom,command:document.querySelector('#commandentry')?.getBoundingClientRect().y})""")

def assert_layout(before, after, battle=False):
    assert abs(before['party']-after['party']) <= 1, (before, after)
    if battle:
        assert abs(before['command']-after['command']) <= 1, (before, after)

def snapshot(page):
    return page.evaluate("JSON.stringify([s.hp,s.mp,s.inventory,s.commands,s.magicPlans,s.itemPlans,commandIndex,commandConfirmed])")


def reset(page, battle=False):
    page.wait_for_function('!logBusy()')
    page.evaluate("""battle=>{
      endAllyTargetPick();
      document.querySelectorAll('dialog[open]').forEach(d=>d.close());
      s=structuredClone(window.targetSelectFixture);resetCommandEntry();
      if(battle)s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}],initiative:'party'};
      render();
    }""", battle)


def spell(page, battle=False):
    if battle:
        page.locator('[data-command-choice="spell"]').click()
    else:
        page.locator('#party .card').nth(1).click()
        page.locator('[data-stat-cast="1"]').click()
    page.locator('[data-spell="dios"]').click()
    assert not page.locator('#magicdialog').is_visible()
    assert page.locator('#allytargetprompt').inner_text() == '対象を選んでください：ディオス'


def medicine(page, battle=False):
    if battle:
        page.locator('[data-command-choice="item"]').click()
        page.locator('#medicinepick').click()
    else:
        page.locator('#party .card').nth(1).click()
        page.locator('[data-stat-inventory="1"]').click()
        page.locator('[data-use-medicine="0"]').click()
    assert not page.locator('#medicinedialog').is_visible()
    assert not page.locator('#inventorydialog').is_visible()
    assert not page.locator('#statsdialog').is_visible()
    assert page.locator('#allytargetprompt').inner_text() == '対象を選んでください：傷薬'


def finished(page):
    assert page.evaluate('allyTargetPick===null && pendingSpell===null')
    assert page.locator('#party [data-ally-target]').count() == 0
    assert page.locator('#party .targetable,#party .untargetable').count() == 0
    assert page.locator('#allytargetbar').is_hidden()
    assert page.locator('#allytargetbattlebar').is_hidden()
    assert not page.locator('#statsdialog').is_visible()
    assert page.locator('#party').get_attribute('role') == 'button'


screenshot_dir = Path(os.environ.get('TARGET_SELECT_SCREENSHOT_DIR', '/workspace/sim'))
screenshot_dir.mkdir(parents=True, exist_ok=True)

chrome_path = os.environ.get('CHROME_PATH')
if not chrome_path:
    chrome_path = next((p for p in (
        '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
        '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome',
    ) if Path(p).exists()), None)

with sync_playwright() as p:
    launch_options = {'headless': True, 'args': ['--no-sandbox']}
    if chrome_path:
        launch_options['executable_path'] = chrome_path
    browser = p.chromium.launch(**launch_options)
    for width in (1280, 390):
        ctx = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/')
        page.evaluate("""()=>{
          [0,2,0,0,0,0].forEach((job,i)=>{const r=generateRecruit('冒険者'+(i+1),job);registerRecruit(r);changeRecruitParty(r.members.id,true)});
          enterDungeon();
        }""")
        page.wait_for_function('!logBusy()')
        page.evaluate("""()=>{
          s.hp[2]=1;s.inventory[1]=['healingPotion','antidote'];s.equipped[1]=null;
          s.members[0].status='dead';s.hp[0]=0;
          s.members[3].status='ash';s.hp[3]=0;
          s.members[4].status='lost';s.hp[4]=0;
          s.members[5].status='ok';s.hp[5]=0;
          s.cells.forEach(c=>c.flag=false);Math.random=()=>.5;
          render();window.targetSelectFixture=structuredClone(s);
        }""")

        def tap_target():
            target = page.locator('[data-ally-target="2"]')
            target.tap() if width < 700 else target.click()

        # Real entry points, disabled members, focus, rerender and snapshot healing.
        for begin in (spell, medicine):
            reset(page)
            before_mp = page.evaluate('s.mp[1]')
            before_layout = layout(page)
            before_boxes = page.locator('#party .card').evaluate_all('(els)=>els.map(e=>({w:e.offsetWidth,h:e.offsetHeight}))')
            begin(page)
            assert_layout(before_layout, layout(page))
            assert page.locator('#allytargetbar').bounding_box()['y'] >= page.locator('#party').bounding_box()['y'] + page.locator('#party').bounding_box()['height']
            assert page.locator('#party .targetable').count() == 2
            assert page.locator('#party .untargetable').count() == 4
            assert page.evaluate('document.activeElement.dataset.allyTarget') == '1'
            assert page.locator('#party').get_attribute('role') == 'group'
            label = page.locator('[data-ally-target="2"]').get_attribute('aria-label')
            assert label == f"冒険者3を対象に選ぶ HP 1/{page.evaluate('maxHP(2)')}"
            assert page.locator('#party .card').evaluate_all('(els)=>els.map(e=>({w:e.offsetWidth,h:e.offsetHeight}))') == before_boxes
            for i in (0, 3, 4, 5):
                dead = page.locator(f'[data-ally-target="{i}"]')
                assert dead.get_attribute('aria-disabled') == 'true'
                assert dead.get_attribute('tabindex') == '-1'
                # Playwright click intentionally waits for aria-disabled=false;
                # raw mouse input verifies that an actual click is ignored.
                box = dead.bounding_box()
                before = snapshot(page)
                page.mouse.click(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
                assert snapshot(page) == before
                assert not page.locator('#statsdialog').is_visible()
            page.evaluate('render()')
            assert page.locator('#party .targetable').count() == 2
            assert page.evaluate('document.activeElement.dataset.allyTarget') == '1'
            for box in page.locator('#party .targetable').all():
                bounds = box.bounding_box()
                assert bounds['width'] >= 44 and bounds['height'] >= 44
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            page.screenshot(path=str(screenshot_dir / f'ts-{width}-below-field-{begin.__name__}.png'))
            tap_target()
            assert_layout(before_layout, layout(page))
            finished(page)
            page.wait_for_function('!logBusy()')
            assert page.evaluate('s.hp[2]') == 6
            assert page.evaluate('s.mp[1]') == before_mp - (2 if begin == spell else 0)
            assert page.evaluate('s.inventory[1].length') == (1 if begin == medicine else 2)

        # Existing select controls are reachable outside the closed modal.
        for begin, select, button in ((spell, 'magictarget', 'magiccast'), (medicine, 'medicinetarget', 'medicineuse')):
            reset(page)
            begin(page)
            assert page.locator(f'{"#allytargetbattlefallback" if page.locator("#battle").is_visible() else "#allytargetfallback"} #{select}').is_visible()
            assert page.locator(f'#{select} option').evaluate_all('(els)=>els.map(e=>e.value)') == ['1', '2']
            page.locator(f'#{select}').select_option('2')
            page.locator(f'#{button}').click()
            finished(page)
            page.wait_for_function('!logBusy()')
            assert page.evaluate('s.hp[2]') == 6

        # Battle picks reserve actions, leave resources intact, and advance once.
        for begin, plan in ((spell, 'magicPlans'), (medicine, 'itemPlans')):
            for fallback in (False, True, 'buttons') if begin == spell else (False, True):
                reset(page, True)
                resources = page.evaluate('JSON.stringify([s.hp,s.mp,s.inventory])')
                before_layout = layout(page)
                before_back = page.locator('[data-command-back]').bounding_box()
                assert abs(before_back['height']-48) <= 0.5, before_back
                begin(page, True)
                assert_layout(before_layout, layout(page), battle=True)
                cancel_button = page.locator('#commandentry #allytargetcancel')
                assert cancel_button.count() == 1
                cancel_box = cancel_button.bounding_box()
                assert abs(before_back['x']-cancel_box['x']) <= 2
                assert abs(before_back['width']-cancel_box['width']) <= 2
                assert abs(before_back['height']-cancel_box['height']) <= 2
                assert cancel_box['height'] >= 44
                assert page.locator('#commandentry [data-command-back]').count() == 0
                assert page.locator('[id=allytargetcancel]').count() == 1
                assert page.locator('#allytargetbattlebar').is_visible()
                assert page.locator('#allytargetbattlebar').bounding_box()['y'] >= page.locator('#battle').bounding_box()['y'] + page.locator('#battle').bounding_box()['height']
                assert page.locator('#allytargetbar').is_hidden()
                page.screenshot(path=str(screenshot_dir / f'ts-{width}-below-battle-{begin.__name__}.png'))
                if fallback == 'buttons':
                    page.locator('[data-spell-target="2"]').click()
                elif fallback and begin == spell:
                    page.locator('#allytargetspellselect').select_option('2')
                    page.locator('#allytargetspelluse').click()
                elif fallback:
                    page.locator('#medicinetarget').select_option('2')
                    page.locator('#medicineuse').click()
                else:
                    tap_target()
                assert_layout(before_layout, layout(page), battle=True)
                finished(page)
                assert page.evaluate(f's.{plan}[1].target') == 2
                assert page.evaluate('commandIndex') == 1
                assert page.evaluate('JSON.stringify([s.hp,s.mp,s.inventory])') == resources
                assert '冒険者3' in page.locator('.commandheading').inner_text()
                page.locator('[data-command-choice="guard"]').click()
                assert page.locator('#commandreviewpopup').is_visible()
                page.locator('[data-command-back]').click()
                assert page.evaluate('commandIndex') == 1
                back_after = page.locator('#commandentry > [data-command-back]').bounding_box()
                assert abs(back_after['height']-48) <= 0.5, back_after

        # Cancel button/Escape/back do not reserve or spend; field choices survive.
        for battle in (False, True):
            for begin, dialog in ((spell, 'magicdialog'), (medicine, 'medicinedialog')):
                for cancel in ('button', 'escape'):
                    reset(page, battle)
                    before = snapshot(page)
                    before_layout = layout(page)
                    back_before = page.locator('#commandentry > [data-command-back]').bounding_box() if battle else None
                    begin(page, battle)
                    assert_layout(before_layout, layout(page), battle=battle)
                    if battle:
                        assert page.evaluate("document.querySelector('#commandentry').lastElementChild.id") == 'allytargetcancel'
                        assert page.locator('[data-command-back]').count() == 0
                    if cancel == 'escape':
                        page.keyboard.press('Escape')
                    else:
                        page.locator('#commandentry #allytargetcancel' if battle else '#allytargetfieldcancel').click()
                    assert_layout(before_layout, layout(page), battle=battle)
                    finished(page)
                    assert snapshot(page) == before
                    if battle:
                        back_again = page.locator('#commandentry > [data-command-back]').bounding_box()
                        for k in ('x', 'y', 'width', 'height'):
                            assert abs(back_before[k]-back_again[k]) <= 2, (back_before, back_again)
                        assert abs(back_again['height']-48) <= 0.5, back_again
                    assert page.locator(f'#{dialog}').is_visible() == (not battle)
                    if not battle:
                        if begin == spell:
                            assert page.locator('[data-spell="dios"]').get_attribute('aria-pressed') == 'true'
                            page.locator('#magicpick').click()
                        else:
                            assert page.locator('#medicineitem').input_value() == '0'
                            page.locator('#medicinepick').click()
                        assert page.locator('#party .targetable').count() == 2
                        page.locator('#allytargetfieldcancel').click()

        # Medicine changes preserve the selected slot when cancelled.
        reset(page, True)
        page.locator('[data-command-choice="item"]').click()
        page.locator('#medicineitem').select_option('1')
        assert '解毒剤' in page.locator('#allytargetprompt').inner_text()
        page.locator('#commandentry #allytargetcancel').click()
        finished(page)

        # Tab proceeds through eligible cards, the bar controls, then cancel.
        for battle in (False, True):
            reset(page, battle)
            spell(page, battle)
            page.keyboard.press('Tab')
            assert page.evaluate('document.activeElement.dataset.allyTarget') == '2'
            page.keyboard.press('Tab')
            expected_select = '#allytargetbattlefallback select' if battle else '#allytargetfallback select'
            assert page.locator(expected_select).evaluate('(el)=>document.activeElement===el')
            page.keyboard.press('Tab')
            page.keyboard.press('Tab')
            cancel_selector = '#commandentry #allytargetcancel' if battle else '#allytargetfieldcancel'
            assert page.locator(cancel_selector).evaluate('(el)=>document.activeElement===el')
            page.locator(cancel_selector).click()
            finished(page)

        # Keyboard Tab skips dead members; Enter and Space both commit.
        for key in ('Enter', 'Space'):
            reset(page)
            spell(page)
            page.keyboard.press('Tab')
            assert page.evaluate('document.activeElement.dataset.allyTarget') == '2'
            page.keyboard.press(key)
            finished(page)
            page.wait_for_function('!logBusy()')
            assert page.evaluate('s.hp[2]') == 6

        # Playback rejects stale clicks and fallback attempts, then re-enables.
        reset(page, True)
        spell(page, True)
        before = snapshot(page)
        page.evaluate("log('再生中');render();pickAllyTarget(2)")
        assert snapshot(page) == before
        assert page.locator('#party .targetable').count() == 0
        page.wait_for_function('!logBusy()')
        tap_target()
        finished(page)
        assert page.evaluate('s.magicPlans[1].target') == 2

        # Outside the mode, both click and Enter still open party details.
        reset(page)
        page.locator('#party .card').nth(2).click()
        assert page.locator('#statsdialog').is_visible()
        page.locator('#statsclose').click()
        page.locator('#party').focus()
        page.keyboard.press('Enter')
        assert page.locator('#statsdialog').is_visible()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors, errors
        print(f'PASS target selection Chromium {width}px: field/battle spell/medicine, fallback parity, disabled targets, cancel/Escape/back, Tab/Enter/Space, snapshots, rerender/focus, 44px taps, no overflow or JS errors')
        ctx.close()
    browser.close()
