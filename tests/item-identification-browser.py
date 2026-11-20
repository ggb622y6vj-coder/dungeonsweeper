"""121: chest, bishop, equipment, smith and library at desktop and phone widths."""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome',
) if Path(p).exists()), None)


def concealed(locator, forbidden):
    markup = locator.evaluate('el => el.outerHTML')
    for value in forbidden:
        assert value not in markup, (value, markup)


def exercise(browser, width):
    context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=width < 700)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL)
    page.evaluate("""() => {
        for (const [name, job] of [['司教役',1],['戦士役',0]]) {
            const r=generateRecruit(name,job);registerRecruit(r);changeRecruitParty(r.members.id,true);
        }
        s.members[0].job=7;s.mp[0]=0;s.gold=128;enterDungeon();
    }""")
    page.wait_for_function('!logBusy()')
    page.evaluate("""() => {
        s.cells[s.pos].chest={opened:false,trap:'none',gold:0,rewardVersion:1,
            items:['cursedStaff','cursedHelm','runestaff','cursedArmor']};
        render();
    }""")
    click = lambda selector: page.locator(selector).click()
    rows = page.locator('#itemservicelist button')
    hidden = ['cursedStaff', 'cursedHelm', 'cursedArmor', 'runestaff',
              '呪われた杖', '呪われた兜', '呪われた胴鎧', 'ルーンの杖', '1d2', '2d4']
    click('#chestopen')
    page.wait_for_function('!logBusy()')
    assert '正体不明の兜を入手。司教役が受け取った。' in page.locator('#log').inner_text()
    concealed(page.locator('#log'), hidden)
    click('#statsopen' if page.locator('#statsopen').is_visible() else '#party')
    click('[data-stat-inventory="0"]')
    concealed(page.locator('#inventorydialog'), hidden)
    # Even the incompatible helmet has an equip action. Cancellation keeps the token.
    click('[data-equip="2"]')
    assert '外せなくなります' in page.locator('#itemchoiceprompt').inner_text()
    concealed(page.locator('#itemchoicedialog'), hidden)
    click('#itemchoicecancel')
    click('[data-equip="2"]')
    click('#itemchoiceconfirm')
    assert '装備できません' in page.locator('#inventorynotice').inner_text()
    click('[data-discard="1"]')
    assert '正体不明の武器' in page.locator('#inventoryactionname').inner_text()
    concealed(page.locator('#inventoryactiondialog'), hidden)
    click('#inventoryactioncancel')
    click('#inventoryclose')
    click('[data-stat-identify="0"]')
    assert rows.count() == 4
    concealed(page.locator('#itemservicedialog'), hidden + ['%', ' G'])

    def identify(index, draws):
        rows.nth(index).click()
        page.evaluate("""values => {Math.random=()=>{
            if(!values.length)throw Error('余分な乱数');return values.shift()
        }}""", draws)
        click('#itemchoiceconfirm')
        page.evaluate('Math.random=window.originalRandom')

    page.evaluate('window.originalRandom=Math.random')
    identify(0, [.99, .99])  # failure, no contact
    assert '正体が分からなかった' in page.locator('#itemservicenotice').inner_text()
    identify(0, [.99, 0])  # failure with forced equip
    assert '拘束' in page.locator('#itemservicenotice').inner_text()
    assert page.evaluate("s.inventory[0][s.equipped[0]]") == 'unid-bound:cursedStaff'
    identify(1, [.99, 0])  # incompatible helmet remains unequipped
    assert page.evaluate("s.inventory[0][2]") == 'unid-bound:cursedHelm'
    identify(2, [0])  # normal success
    assert '正体不明の武器はルーンの杖だった！' in page.locator('#itemservicenotice').inner_text()
    assert page.evaluate("s.mp[0]===0 && s.gold===128 && Object.keys(s.library.items).join()==='runestaff'")
    click('#itemserviceclose')
    click('#statsclose')
    page.reload()
    assert page.evaluate("s.inventory[0][s.equipped[0]]") == 'unid-bound:cursedStaff'
    page.evaluate('enterTown()')
    click('#blacksmith')
    click('#shopinventory')
    assert page.locator('[data-sell="2"]').is_disabled()
    assert page.locator('[data-sell="4"]').inner_text() == '売却 1 G'
    click('#itemboxopen')
    click('#itemboxtab-head')
    assert page.locator('[data-itembox-deposit="2"]').is_disabled()
    click('#itemboxtab-body')
    click('[data-itembox-deposit="4"]')
    concealed(page.locator('#itemboxdialog'), ['cursedArmor', '呪われた胴鎧', 'AC −0'])
    click('[data-itembox-withdraw="0"]')
    click('#itemboxclose')
    click('#inventoryclose')
    click('#shopidentify')
    assert rows.count() == 3
    assert rows.nth(0).inner_text() == '司教役 · 正体不明の武器 · 8 G'
    assert rows.nth(1).inner_text() == '司教役 · 正体不明の兜 · 120 G'
    rows.nth(0).click()
    page.keyboard.press('Escape')
    page.locator('#itemchoicedialog').wait_for(state='hidden')
    assert page.evaluate('s.gold') == 128
    rows.nth(0).click()
    click('#itemchoiceconfirm')
    assert page.evaluate("s.inventory[0][1]==='bound:cursedStaff' && s.library.items.cursedStaff && s.gold===120")
    click('#itemserviceclose')
    click('#shopuncurse')
    assert rows.count() == 2 and '呪い' in rows.nth(1).inner_text()
    concealed(page.locator('#itemservicedialog'), ['cursedHelm', '呪われた兜'])
    rows.nth(1).click()
    assert '消滅' in page.locator('#itemchoiceprompt').inner_text()
    click('#itemchoiceconfirm')
    assert rows.count() == 1 and rows.first.is_disabled()
    assert page.evaluate("s.gold===0 && !s.library.items.cursedHelm && !s.inventory.flat().includes('unid-bound:cursedHelm')")
    assert page.locator('#itemservicedialog').evaluate('e=>e.scrollWidth<=e.clientWidth')
    click('#itemserviceclose')
    click('#shopclose')
    click('#libraryopen')
    click('#librarytab-items')
    assert page.locator('[data-library-entry="item-cursedStaff"] h4').inner_text().startswith('呪われた杖')
    click('#libraryitemtab-head')
    concealed(page.locator('#librarybody'), ['cursedHelm', '呪われた兜'])
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.reload()
    assert page.evaluate("s.gold===0 && s.library.items.cursedStaff && !s.library.items.cursedHelm")
    assert not errors, errors
    context.close()
    print(f'PASS 121 Chromium {width}px: receipts, concealment, equip warning, bishop, blacksmith, box, library and reload')


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=chrome, args=['--no-sandbox'])
    for width in (1280, 390):
        exercise(browser, width)
    browser.close()
