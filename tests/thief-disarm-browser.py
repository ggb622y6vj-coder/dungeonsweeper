"""075: stats disarm and library spell rows, 1280/390px."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('docs/devlog/reports/075-shots')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
    for width in (1280,390):
        page=browser.new_page(viewport={'width':width,'height':900})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8000/')
        page.evaluate("""()=>{for(const job of [0,3,3]){const r=generateRecruit('探索者'+job,job);registerRecruit(r);changeRecruitParty(r.members.id,true)}enterDungeon()}""")
        page.wait_for_function('idle()')
        page.evaluate("""()=>{s.pos=12;s.dir=1;s.cells[13].open=false;s.cells[13].trap=true;s.cells[13].flag='power';render()}""")
        page.locator('#party').click()
        assert page.locator('[data-stat-disarm]').count()==2
        button=page.locator('[data-stat-disarm="1"]')
        assert button.is_enabled()
        assert button.evaluate("e=>e.previousElementSibling.textContent")=='アイテム'
        out.mkdir(parents=True,exist_ok=True)
        page.locator('#statsdialog').screenshot(path=str(out/f'disarm-{width}.png'))
        button.click()
        assert not page.locator('#statsdialog').is_visible()
        page.wait_for_function('idle()')
        assert page.evaluate('s.cells[13].open&&s.cells[13].disarmed&&!s.cells[13].trap&&!s.cells[13].flag&&s.members[1].disarmUsed')
        page.locator('#party').click()
        assert page.locator('[data-stat-disarm="1"]').is_disabled()
        page.locator('#statsclose').click()
        page.evaluate("""()=>{enterTown();s.library.spells=Object.fromEntries(MAGIC.map(x=>[x.id,true]));render()}""")
        page.locator('#libraryopen').click()
        page.locator('#librarytab-spells').click()
        page.locator('#librarybody .library-entry').first.click()
        assert page.locator('#librarydetaildialog').count() == 0
        assert page.locator('#librarybody .library-entry').first.locator('dt').all_text_contents()==['消費MP','使用場所','効果']
        page.locator('#librarydialog').screenshot(path=str(out/f'spell-{width}.png'))
        assert not errors,errors
        print(f'PASS 075 Chromium {width}px')
        page.close()
    browser.close()
