"""057: 開放 live cast at 1280px / 390px.
Old-save Lv5+ priest learns it on load; real dialog clicks cast it; region/boundary opens, no battle;
numbered cell opens nothing; cost 4→8→16 and reload keeps state; battle shows 探索専用; town resets to 4.
Run: python3 tests/floodfill-browser.py [http://127.0.0.1:8000/]
"""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
bk = {}
exec(Path(__file__).with_name('battle-keys-browser.py').read_text().split('\nwith sync_playwright()')[0], bk)
fixture, chrome, combat = bk['fixture'], bk['chrome'], bk['combat']
N = 8
TRAPS = {5, 6, 13, 14, 48, 56}
POS = 27

def nb(i):
    r, c = divmod(i, N)
    return [rr*N+cc for rr in range(r-1, r+2) for cc in range(c-1, c+2) if (rr, cc) != (r, c) and 0 <= rr < N and 0 <= cc < N]

def num(i):
    return sum(j in TRAPS for j in nb(i))

def expected(start):
    seen, q, out = {start}, [start], {start}
    while q:
        p = q.pop(0)
        if num(p):
            continue
        for j in nb(p):
            if j in seen or j in TRAPS:
                continue
            seen.add(j); out.add(j)
            if num(j) == 0:
                q.append(j)
    return out

def save():
    s = fixture()
    for i, c in enumerate(s['cells']):
        c.update(open=(i == POS), trap=(i in TRAPS))
    s['pos'] = POS
    for r in s['roster']:
        m = r['members']
        if m['job'] == 2:
            m.update(level=6, known=['dios', 'montino'])  # pre-057 save
    return s

def cast(page):
    page.evaluate('openMagic(1)')
    row = page.locator('[data-spell="floodfill"]')
    text = row.inner_text()
    row.click()
    page.locator('#magiccast').click()
    page.wait_for_function('!logBusy()')
    if page.locator('#magicdialog').evaluate('d=>d.open'):
        page.evaluate("$('#magicdialog').close()")
    return text

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
    want = sorted(expected(POS))
    assert 1 < len(want) < N*N - len(TRAPS)
    for width in (1280, 390):
        errors = []
        context = browser.new_context(viewport=dict(width=width, height=900), has_touch=width == 390)
        context.add_init_script('if(!sessionStorage.getItem("seeded")){localStorage.setItem("ash-v1", '+json.dumps(json.dumps(save()))+');sessionStorage.setItem("seeded","1")} Math.random=()=>0;')
        page = context.new_page()
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)
        page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
        assert page.evaluate("s.members[1].known.includes('floodfill') && s.floodUses===undefined||s.floodUses===0")
        mp0 = page.evaluate('s.mp[1]')
        t = cast(page)
        assert 'MP 4' in t, t
        opened = page.evaluate('s.cells.map((c,i)=>c.open?i:-1).filter(i=>i>=0)')
        assert opened == want, (opened, want)
        v = page.evaluate("({enemy:s.enemy,boss:s.pendingBoss,stairs:s.pendingStairs,pos:s.pos,mp:s.mp[1],log:s.logs[0]})")
        assert v['enemy'] is None and not v['boss'] and not v['stairs'] and v['pos'] == POS and v['mp'] == mp0 - 4, v
        assert v['log'] == f'{len(want)-1}マスを探索済みにした。', v
        assert page.locator('#log').inner_text().count('開放を唱えた。') == 1
        # 2nd cast (nothing new) costs 8, then reload: next cost is 16 and cells stay explored.
        assert 'MP 8' in cast(page)
        assert page.evaluate('s.logs[0]') == '新たに探索できるマスはなかった。'
        page.reload(); page.wait_for_function('!!globalThis.KeyNav && !logBusy()')
        assert page.evaluate('s.cells.map((c,i)=>c.open?i:-1).filter(i=>i>=0)') == want
        assert page.evaluate("s.floodUses===2 && spellCost(magic('floodfill'))===16 && spellCost(magic('dumapic'))===2")
        # Numbered cell: nothing opens, MP is spent.
        page.evaluate(f"s.pos={[i for i in want if num(i)][0]};render()")
        before, mp = page.evaluate('s.cells.filter(c=>c.open).length'), page.evaluate('s.mp[1]')
        assert 'MP 16' in cast(page)
        assert page.evaluate('s.logs[0]') == '周囲に罠の気配がある。展開できなかった。'
        assert page.evaluate('s.cells.filter(c=>c.open).length') == before and page.evaluate('s.mp[1]') == mp - 16
        # Battle: 探索専用, disabled.
        page.evaluate(f"s.enemy={json.dumps(combat())};resetPartyCommands();resetCommandEntry();render();openMagic(1)")
        row = page.locator('[data-spell="floodfill"]')
        assert row.is_disabled() and '探索専用' in row.inner_text()
        page.evaluate("$('#magicdialog').close();s.enemy=null;render();enterTown()")
        page.wait_for_function("s.area==='town' && !logBusy()")
        assert page.evaluate("s.floodUses===0 && spellCost(magic('floodfill'))===4")
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert not errors, errors
        print(f'PASS floodfill {width}px: legacy learn, {len(want)} cells revealed w/o battle, numbered cell blocked, 4→8→16 across reload, 探索専用 in battle, town reset')
        context.close()
    browser.close()
