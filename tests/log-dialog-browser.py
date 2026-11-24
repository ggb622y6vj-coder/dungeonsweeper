"""136: dungeon log dialog and party cards at desktop and mobile widths.
Run against dist: python3 tests/log-dialog-browser.py [http://127.0.0.1:8000/]
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome_path = os.environ.get('CHROME_PATH')
if not chrome_path:
    chrome_path = next((path for path in (
        '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    ) if Path(path).exists()), None)


def assert_latest_visible(body):
    assert body.evaluate(
        'e => e.scrollHeight > e.clientHeight && '
        'Math.abs(e.scrollHeight - e.clientHeight - e.scrollTop) <= 1'
    ), 'dialog log should be scrollable and at its latest row'


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=chrome_path, args=['--no-sandbox'])
    for width in (1280, 390):
        touch = width == 390
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=touch)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url)
        page.evaluate("""() => {
          [0,1,2,3,0,2].forEach((job,i) => {
            const recruit=generateRecruit('冒険者'+(i+1),job);
            registerRecruit(recruit);
            changeRecruitParty(recruit.members.id,true);
          });
        }""")
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        page.evaluate("""() => {
          s.logs=Array.from({length:30}, (_,i) => `探索ログ ${30-i}`);
          s.logs[0]='冒険者2は解毒を唱えた。';
          render();
        }""")

        party = page.locator('#party')
        expect(party.locator('.card')).to_have_count(6)
        assert 'party-rank' not in party.inner_html()
        expect(page.locator('.controls')).to_have_css('margin-top', '8px')

        log = page.locator('#log')
        log_rows = log.locator(':scope > div')
        dialog = page.get_by_role('dialog', name='ログ')
        body = page.locator('#logdialogbody')
        dialog_rows = body.locator(':scope > div')
        expect(dialog).to_be_hidden()

        def open_log():
            if touch:
                log.tap()
            else:
                log.click()
            expect(dialog).to_be_visible()

        open_log()
        assert body.bounding_box()['height'] > log.bounding_box()['height']
        expect(dialog_rows.last.locator('.log-spell')).to_have_text('解毒')
        assert dialog_rows.all_text_contents() == log_rows.all_text_contents()[::-1]
        assert_latest_visible(body)

        dialog_rows.last.click()
        expect(dialog).to_be_visible()
        page.evaluate("""() => {
          log('同期テスト 1');
          log('同期テスト 2');
        }""")
        expect(dialog_rows.last).to_have_text('同期テスト 2')
        assert dialog_rows.all_text_contents() == log_rows.all_text_contents()[::-1]
        assert dialog_rows.all_text_contents()[-2:] == ['同期テスト 1', '同期テスト 2']
        expect(dialog_rows).to_have_count(30)
        assert_latest_visible(body)
        page.wait_for_function('!logBusy()')

        if touch:
            page.touchscreen.tap(3, 3)
        else:
            page.mouse.click(3, 3)
        expect(dialog).to_be_hidden()
        open_log()
        page.keyboard.press('Escape')
        expect(dialog).to_be_hidden()
        open_log()
        dialog.get_by_role('button', name='ログを閉じる').click()
        expect(dialog).to_be_hidden()
        assert not errors, errors
        print(f'PASS log dialog Chromium {width}px: open, live log, scroll, three close paths and party cards')
        context.close()
    browser.close()
