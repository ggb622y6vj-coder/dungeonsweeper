"""指示書124。後衛盗賊の潜伏・対象列選択・奇襲をPCとスマートフォン幅で確認する。"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
CHROME = os.environ.get('CHROME_PATH') or next((path for path in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome') if Path(path).exists()), None)


def check(browser, width):
    touch = width == 390
    context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=touch)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.goto(URL)
    page.evaluate("""() => {
        Math.random=()=>.5;
        for(const [i,job] of [0,0,0,3].entries()){
            const recruit=generateRecruit('冒険者'+(i+1),job);
            registerRecruit(recruit);
            changeRecruitParty(recruit.members.id,true);
        }
        s.area='dungeon';
        s.members[3].str=12;
        s.enemy={initiative:'party',units:[71,23,9].map((row,uid)=>
            ({id:'slime',row,uid,hp:100,identified:true}))};
        resetPartyCommands();
        render();
        window.playback=[];
        new MutationObserver(()=>{
            const log=document.querySelector('#log > :first-child')?.textContent;
            const hidden=document.querySelectorAll('#party .card')[3].textContent.includes('潜伏');
            window.playback.push([log,hidden]);
        }).observe(document.querySelector('#party'),{childList:true});
    }""")

    def press(selector):
        button = page.locator(selector)
        if touch:
            button.tap()
        else:
            button.click()

    def guards():
        for _ in range(3):
            press('[data-command-choice="guard"]')

    card = page.locator('#party .card').nth(3)
    tag = card.get_by_text('潜伏', exact=True)
    guards()
    assert page.locator('[data-command-choice="fight"]').count() == 0
    assert page.locator('[data-command-choice="ambush"]').count() == 0
    press('[data-command-choice="hide"]')
    assert '隠れる' in page.locator('#commandreviewpopup').inner_text()
    assert tag.count() == 0
    press('#attack')
    page.wait_for_function('!logBusy()')
    assert tag.is_visible()
    frames = page.evaluate('window.playback')
    assert ['── ターン開始 ──', False] in frames
    assert ['冒険者4は身を隠した。', True] in frames

    guards()
    assert page.locator('[data-command-choice="hide"]').count() == 0
    assert page.locator('[data-command-choice="fight"]').count() == 0
    press('[data-command-choice="ambush"]')
    assert page.locator('[data-row-choice]').evaluate_all(
        '(buttons)=>buttons.map(b=>b.dataset.rowChoice)') == ['71', '23']
    press('[data-command-back]')
    assert tag.is_visible()
    press('[data-command-choice="ambush"]')
    press('[data-row-choice="23"]')
    assert '奇襲 → 2列' in page.locator('#commandreviewpopup').inner_text()
    assert tag.is_visible()
    page.evaluate('Math.random=()=>.99')
    press('#attack')
    page.wait_for_function('!logBusy()')
    assert tag.count() == 0
    assert page.evaluate('s.enemy.units.map(e=>e.hp)') == [100, 90, 100]
    frames = page.evaluate('window.playback')
    assert ['── ターン開始 ──', True] in frames
    assert ['冒険者4の奇襲。スライムに10ダメージ。', False] in frames
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert not errors, errors
    context.close()
    print(f'PASS 124 hide/ambush Chromium {width}px')


with sync_playwright() as playwright:
    options = {'headless': True, 'args': ['--no-sandbox']}
    if CHROME:
        options['executable_path'] = CHROME
    browser = playwright.chromium.launch(**options)
    for width in (1280, 390):
        check(browser, width)
    browser.close()
