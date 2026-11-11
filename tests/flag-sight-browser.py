"""096: 旗視 shows surrounding flag count at the explorer cell's bottom-left.
Run: /tmp/pyv/bin/python tests/flag-sight-browser.py [http://127.0.0.1:8000/]
"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome_path = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome',
) if Path(p).exists()), None)
output = Path(os.environ.get('FLAG_SIGHT_SCREENSHOT_DIR', '/tmp/flag-sight-browser'))
output.mkdir(parents=True, exist_ok=True)

def overlaps(a, b):
    return not (a['x']+a['width'] <= b['x'] or b['x']+b['width'] <= a['x']
                or a['y']+a['height'] <= b['y'] or b['y']+b['height'] <= a['y'])

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
        page.evaluate("localStorage.removeItem('ash-v1')")
        page.reload()
        page.evaluate('''[0,1,2].forEach((job,i)=>{
          const r=generateRecruit('ABC'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true);
        });render();''')
        assert page.evaluate('jobOf(1)') == 1
        page.locator('#entrance').click()
        page.wait_for_function('!logBusy()')
        page.evaluate('''s.pendingStairs=false;s.pendingBoss=null;s.done=false;
          s.cells.forEach(c=>{c.flag=false;c.trap=false;c.type='';c.open=false;delete c.chest});
          s.pos=27;s.dir=1;s.cells[s.pos].open=true;
          s.members[1].known=MAGIC.filter(m=>m.job===1).map(m=>m.id);s.mp[1]=2;render();''')
        # Inactive: no count element.
        assert page.locator('.flag-sight-count').count() == 0
        inactive_label = page.locator('#board .cell.here').get_attribute('aria-label')
        assert '周囲の旗' not in inactive_label
        page.locator('#party').click()
        assert page.locator('#statsdialog').is_visible()
        assert page.locator('#activespells').is_hidden()
        page.locator('#statsclose').click()
        # Cast 旗視 via magic dialog.
        page.evaluate('openMagic(1)')
        ids = page.locator('#magiclist [data-spell]').evaluate_all('(rows)=>rows.map(row=>row.dataset.spell)')
        for spell_id in ('dumapic', 'identifyfoe', 'halito', 'katino'):
            assert ids.index(spell_id) < ids.index('flagview'), ids
        assert ids[ids.index('flagview') + 1] == 'mahalito', ids
        spell = page.locator('[data-spell="flagview"]')
        assert '旗視' in spell.inner_text()
        assert '町へ戻るまで、探索者の境界左下に周囲8マスの旗の数を表示する。' in spell.inner_text()
        spell.click()
        page.locator('#magiccast').click()
        page.wait_for_function('!logBusy()')
        assert page.evaluate('s.flagSight') is True
        assert page.evaluate('s.mp[1]') == 0
        assert page.evaluate("spellReason(1,magic('flagview'))") == '発動中'
        assert page.locator('.flag-sight-count').inner_text() == '0'
        assert page.locator('#board .cell.here').get_attribute('aria-label') == inactive_label + '、周囲の旗0本'
        # Place 3 flags around current cell (and one far away that must not count).
        page.evaluate('''const near=around(s.pos).slice(0,3);
          near.forEach((j,k)=>s.cells[j].flag=['power','guard','magic'][k]);
          s.cells[0].flag='power';render();''')
        assert page.locator('.flag-sight-count').first.inner_text() == '3'
        assert page.locator('#board .cell.here').get_attribute('aria-label') == inactive_label + '、周囲の旗3本'
        assert page.locator('#board [aria-label*="周囲の旗"]').count() == 1
        # On mobile the board only has size inside the map dialog; open it first.
        if width < 700:
            page.locator('#maptoggle').tap()
            page.wait_for_function("document.querySelector('#mapdialog').open")
            root = '#mapdialog'
        else:
            root = '#mapdock'
        geom = page.evaluate('''(root=>{
          const cell=document.querySelector(root+' .cell.here');
          const count=cell.querySelector('.flag-sight-count');
          const num=cell.querySelector('.cell-number');
          const cr=cell.getBoundingClientRect(), a=count.getBoundingClientRect(), b=num.getBoundingClientRect();
          return {cell:{x:cr.x,y:cr.y,w:cr.width,h:cr.height},
            count:{x:a.x,y:a.y,width:a.width,height:a.height},
            number:{x:b.x,y:b.y,width:b.width,height:b.height},
            leftish:a.x < cr.x+cr.width/2, bottomish:a.y > cr.y+cr.height/2};
        })'''+f'({root!r})')
        assert geom['cell']['w'] > 0 and geom['leftish'] and geom['bottomish'], geom
        assert not overlaps(geom['count'], geom['number']), geom
        page.screenshot(path=str(output / f'board-{width}.png'))
        if width < 700:
            page.locator('#mapclose').click()
            page.wait_for_function("!document.querySelector('#mapdialog').open")
        # Active spells UI.
        page.locator('#party').click()
        assert page.locator('#activespells').is_visible()
        page.locator('#activespells').click()
        body = page.locator('#activespellbody').inner_text()
        assert '旗視' in body and '町へ戻るまで' in body
        page.screenshot(path=str(output / f'active-{width}.png'))
        page.locator('#activespellclose').click()
        page.locator('#statsclose').click()
        page.wait_for_function("!$('#statsdialog').open && !$('#activespelldialog').open")
        # Re-open / re-check the visible map board after the active-spells UI.
        if width < 700:
            page.locator('#maptoggle').tap()
            assert page.locator('#mapdialog .flag-sight-count').inner_text() == '3'
            page.screenshot(path=str(output / f'map-{width}.png'))
            page.locator('#mapclose').click()
            page.wait_for_function("!$('#mapdialog').open")
        else:
            assert page.locator('#mapdock .flag-sight-count').inner_text() == '3'
            page.screenshot(path=str(output / f'map-{width}.png'))
        # Removing a flag updates the count immediately.
        page.evaluate('s.cells[around(s.pos)[0]].flag=false;render()')
        assert page.locator('.flag-sight-count').inner_text() == '2'
        assert page.locator('#board .cell.here').get_attribute('aria-label') == inactive_label + '、周囲の旗2本'
        page.evaluate('s.flagSight=false;render()')
        assert page.locator('.flag-sight-count').count() == 0
        assert page.locator('#board .cell.here').get_attribute('aria-label') == inactive_label
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal scroll'
        assert not errors, errors
        print(f'PASS flag-sight Chromium {width}px: spell order, 0 MP recast, count 0→3→2, aria labels, active UI, map dialog, no overlap; no JS errors')
        context.close()
    browser.close()
