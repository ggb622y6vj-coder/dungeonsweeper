# 104 amendment: an unconfirmed tavern formation survives opening and closing training.
# Dialog 'close' is asynchronous, so wait until the roster object is replaced.
from playwright.sync_api import sync_playwright
import os, sys
from pathlib import Path

chrome_path = os.environ.get('CHROME_PATH')
if not chrome_path:
    for candidate in ('/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser'):
        if Path(candidate).exists():
            chrome_path = candidate
            break
url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'

def formation(page):
    return page.evaluate('tavernOrder.map(i => i < 0 || !tavernRoster[i] ? null : tavernRoster[i].members.id)')

def option_text(page):
    return page.evaluate('[...document.querySelectorAll("#tavernslots select")[0].options].map(o => o.textContent)')

def close_training(page):
    page.evaluate('window.__tavernRosterBefore = tavernRoster')
    page.locator('#trainingclose').click()
    page.wait_for_function('tavernRoster !== window.__tavernRosterBefore && !document.querySelector("#training").open && document.querySelector("#taverndialog").open')

def recruit(page, name, job):
    page.locator('#recruitname').fill(name)
    page.locator('#recruitjob').select_option(str(job))
    page.locator('#rollrecruit').click()
    page.locator('#registerrecruit').click()

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
        page.goto(url)
        page.locator('#trainingopen').click()
        for name, job in (('編成甲', 0), ('編成乙', 1), ('編成丙', 2), ('編成丁', 3)):
            recruit(page, name, job)
        page.locator('#trainingclose').click()
        page.wait_for_function('!document.querySelector("#training").open')
        page.locator('#tavernopen').click()
        for i in range(3):
            page.locator('#tavernslots select').nth(i).select_option(str(i))
        page.locator('#tavernsave').click()
        assert page.evaluate('s.members.length===3 && s.reserve.length===1')
        ids = page.evaluate('Object.fromEntries([...s.members, ...s.reserve.map(r => r.members)].map(m => [m.name, m.id]))')
        page.locator('#tavernopen').click()
        # [甲,乙,丙] -> swap slot 0 with 丙, then add 丁. Do not save.
        page.locator('#tavernslots select').nth(0).select_option('2')
        page.locator('#tavernslots select').nth(3).select_option('3')
        draft = [ids['編成丙'], ids['編成乙'], ids['編成甲'], ids['編成丁'], None, None]
        assert formation(page) == draft
        saved = page.evaluate('s.members.map(m => m.id)')
        page.locator('#tavernmanage').click()
        assert page.locator('#training').is_visible() and page.locator('#taverndialog').is_visible()
        close_training(page)
        assert formation(page) == draft, formation(page)
        assert page.evaluate('s.members.map(m => m.id)') == saved
        labels = page.locator('#tavernslots select').evaluate_all('els => els.map(e => e.selectedOptions[0].textContent)')
        assert [label.split(' · ')[0] for label in labels] == ['編成丙', '編成乙', '編成甲', '編成丁', '空き', '空き'], labels

        page.locator('#tavernmanage').click()
        page.locator('#trainingtab-edit').click()
        page.locator('#recruitlist section', has_text='編成甲').get_by_role('button', name='名前の変更', exact=True).click()
        page.locator('#renamename').fill('甲改名')
        page.locator('#renameconfirm').click()
        page.locator('#renamedialog').wait_for(state='hidden')
        page.locator('#trainingtab-create').click()
        recruit(page, '編成戊', 0)
        ids['編成戊'] = page.evaluate('trainingRoster().find(r => r.members.name === "編成戊").members.id')
        page.locator('#trainingtab-edit').click()
        page.locator('#recruitlist section', has_text='編成丙').get_by_role('button', name='登録抹消', exact=True).click()
        page.locator('#recruitdeleteconfirm').click()
        page.locator('#recruitdeletedialog').wait_for(state='hidden')
        close_training(page)
        opts = '\n'.join(option_text(page))
        assert '甲改名' in opts and '編成戊' in opts and '編成丙' not in opts, opts
        deleted = [None, ids['編成乙'], ids['編成甲'], ids['編成丁'], None, None]
        assert formation(page) == deleted, formation(page)
        assert ids['編成戊'] not in formation(page)
        page.locator('#tavernsave').click()
        assert not page.locator('#taverndialog').is_visible()
        assert page.evaluate('s.members.map(m => m.id)') == [ids['編成乙'], ids['編成甲'], ids['編成丁']]
        assert page.evaluate('s.members.map(m => m.name)') == ['編成乙', '甲改名', '編成丁']
        assert page.evaluate('trainingRoster().every(r => r.members.name !== "編成丙")')
        assert page.evaluate('s.reserve.some(r => r.members.name === "編成戊")')

        # Party of zero: an unconfirmed return placement is kept across training.
        page.locator('#tavernopen').click()
        for i in range(6):
            page.locator('#tavernslots select').nth(i).select_option('-1')
        page.locator('#tavernsave').click()
        assert page.evaluate('s.members.length===0')
        page.locator('#tavernopen').click()
        back = page.evaluate('tavernRoster.findIndex(r => r.members.name === "編成乙")')
        page.locator('#tavernslots select').nth(1).select_option(str(back))
        page.locator('#tavernmanage').click()
        close_training(page)
        assert formation(page) == [None, ids['編成乙'], None, None, None, None], formation(page)
        page.locator('#tavernsave').click()
        assert page.evaluate('s.members.map(m => m.name)') == ['編成乙']

        # A revived reserve member can still be added from the tavern.
        raised = page.evaluate('''(() => {
          const r = s.reserve.find(r => r.members.name === "編成丁");
          r.members.status = "dead"; r.hp = 0; s.gold = 100000;
          const prev = Math.random; Math.random = () => 0;
          const result = templeRaise(r.members.id);
          Math.random = prev;
          return result && result.success && result.status === "ok";
        })()''')
        assert raised
        page.locator('#tavernopen').click()
        join = page.evaluate('tavernRoster.findIndex(r => r.members.name === "編成丁")')
        opt = page.locator('#tavernslots select').nth(1).locator('option').nth(join + 1)
        assert opt.inner_text().startswith('編成丁')
        assert not opt.evaluate('e => e.disabled')
        page.locator('#tavernslots select').nth(1).select_option(str(join))
        page.locator('#tavernsave').click()
        assert page.evaluate('s.members.map(m => m.name)') == ['編成乙', '編成丁']
        assert page.evaluate("s.members.every(m => m.status === 'ok')")
        assert not errors, errors
        print(f'PASS Chromium {width}px: unconfirmed tavern order survives training close; rename, register, delete, empty party, revived join')
        ctx.close()
    browser.close()
