"""101: JSON download/import, validation, cancellation and keyboard safety."""
import copy
import json
import os
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
CHROME = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'
) if Path(p).exists()), None)


def snapshot(page):
    return page.evaluate('({state:JSON.stringify(s),storage:JSON.stringify({...localStorage})})')


def choose_file(page, payload):
    with page.expect_file_chooser() as chooser:
        page.locator('#saveimport').click()
    chooser.value.set_files(dict(name='save.json', mimeType='application/json', buffer=payload))


def layout(page):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert page.locator('dialog[open]').evaluate_all('els=>els.every(e=>e.scrollWidth<=e.clientWidth)')


with sync_playwright() as p:
    options = dict(headless=True, args=['--no-sandbox'])
    if CHROME:
        options['executable_path'] = CHROME
    browser = p.chromium.launch(**options)
    for width in (1280, 390):
        context = browser.new_context(viewport=dict(width=width, height=900), has_touch=width == 390,
                                      timezone_id='Asia/Tokyo', accept_downloads=True)
        page = context.new_page()
        errors, loads = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('load', lambda: loads.append(True))
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav')
        # Build a real roster through the production functions, then keep a reserve.
        page.evaluate("""() => {
          for(const [name,job] of [['往復A',0],['往復B',1],['控え',2]]){
            const r=generateRecruit(name,job);registerRecruit(r);
            if(job!==2)changeRecruitParty(r.members.id,true);
          }reorderParty([1,0]);s.gold=1234;save();render();
          localStorage.setItem('ash-keyhint','off');
        }""")
        page.locator('#keysettingsopen').click()
        assert page.locator('#saveexport').inner_text() == 'セーブデータを書き出す'
        assert page.locator('#saveimport').inner_text() == 'セーブデータを読み込む'
        before = snapshot(page)
        with page.expect_download() as download_info:
            page.locator('#saveexport').click()
        download = download_info.value
        assert re.fullmatch(r'ds_\d{8}_\d{6}\.json', download.suggested_filename)
        envelope = json.loads(Path(download.path()).read_text())
        assert envelope['format'] == 'dungeonsweeper-save'
        assert envelope['formatVersion'] == 1
        assert envelope['data']['rosterVersion'] == 1
        expected_name = page.evaluate("""iso=>{const d=new Date(iso),p=n=>String(n).padStart(2,'0');
          return `ds_${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.json`;}""", envelope['exportedAt'])
        assert download.suggested_filename == expected_name
        assert page.locator('#savenotice').inner_text() == 'セーブデータを書き出しました。'
        assert snapshot(page) == before
        assert 'ash-keyhint' not in envelope['data']
        layout(page)

        valid = copy.deepcopy(envelope)
        valid['data'] = page.evaluate('rosterSaveState()')
        valid['data']['gold'] = 987654
        payload = json.dumps(valid, ensure_ascii=False).encode()
        load_count = len(loads)
        choose_file(page, payload)
        page.locator('#importdialog').wait_for(state='visible')
        assert snapshot(page) == before
        summary = page.locator('#importsummary').inner_text()
        assert '登録冒険者数：3人' in summary and 'パーティ人数：2人' in summary and '地下1階' in summary
        page.wait_for_function('document.activeElement.id==="importcancel"')
        layout(page)
        # Default Space must cancel, never overwrite. Esc follows the same back action.
        page.keyboard.press('Space')
        page.locator('#importdialog').wait_for(state='hidden')
        assert snapshot(page) == before and len(loads) == load_count
        assert page.locator('#savefileinput').input_value() == ''
        choose_file(page, payload)
        page.locator('#importdialog').wait_for(state='visible')
        page.keyboard.press('Escape')
        page.locator('#importdialog').wait_for(state='hidden')
        assert snapshot(page) == before and len(loads) == load_count
        assert page.locator('#keysettingsdialog').is_visible()

        bad_version = copy.deepcopy(valid)
        bad_version['formatVersion'] = 2
        bad_data = copy.deepcopy(valid)
        bad_data['data']['gold'] = -1
        for bad_payload, notice in [
            (b'not JSON', 'JSON'),
            (b'[]', '形式'),
            (json.dumps(bad_version).encode(), '未対応'),
            (json.dumps(bad_data).encode(), '内容'),
            (b' ' * (5 * 1024 * 1024 + 1), '5MiB'),
        ]:
            choose_file(page, bad_payload)
            page.wait_for_function('(text)=>document.querySelector("#savenotice").textContent.includes(text)', arg=notice)
            assert not page.locator('#importdialog').is_visible()
            assert snapshot(page) == before and len(loads) == load_count
            assert page.locator('#savefileinput').input_value() == ''

        undated = copy.deepcopy(valid)
        del undated['exportedAt']
        choose_file(page, json.dumps(undated).encode())
        page.locator('#importdialog').wait_for(state='visible')
        assert '日時不明' in page.locator('#importsummary').inner_text()
        page.locator('#importcancel').click()
        page.locator('#importdialog').wait_for(state='hidden')
        assert snapshot(page) == before

        raw_before = page.evaluate('localStorage.getItem("ash-v1")')
        choose_file(page, payload)
        page.locator('#importdialog').wait_for(state='visible')
        with page.expect_navigation(wait_until='load'):
            page.locator('#importconfirm').click()
        page.wait_for_function('s.gold===987654&&!!globalThis.KeyNav')
        assert len(loads) == load_count + 1
        assert page.evaluate('rosterSaveState().roster') == valid['data']['roster']
        assert page.evaluate('rosterSaveState().partyIds') == valid['data']['partyIds']
        assert page.evaluate('localStorage.getItem("ash-v1-backup")') == raw_before
        assert page.evaluate('localStorage.getItem("ash-keyhint")') == 'off'
        assert not errors, errors
        context.close()
        print(f'PASS save transfer {width}px: download, local filename, roster round trip, rejection, cancel/Space/Esc, backup, settings, layout')
    browser.close()
