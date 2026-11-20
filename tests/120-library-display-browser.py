"""120: library monster fields, grid layout and header progress at desktop and mobile widths.
Run: python3 tests/120-library-display-browser.py [http://127.0.0.1:8000/]
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome_path = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome',
) if Path(p).exists()), None)
output = Path(os.environ.get('LIBRARY_DISPLAY_SCREENSHOT_DIR', '/tmp/120-library-display-browser'))
output.mkdir(parents=True, exist_ok=True)

MONSTER_DETAILS = '''lists => lists.map(list => {
    const cells = [...list.children];
    const fields = Object.fromEntries(cells.filter(cell => cell.tagName === 'DT')
        .map(label => [label.textContent, label.nextElementSibling.textContent]));
    const boxes = cells.map(cell => cell.getBoundingClientRect());
    const overlap = boxes.some((a, i) => boxes.slice(i + 1).some(b =>
        a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom));
    return {
        id: list.parentElement.dataset.libraryEntry.slice('monster-'.length),
        group: fields['集団数'], resist: fields['呪文抵抗（魔／僧）'],
        tracks: getComputedStyle(list).gridTemplateColumns.split(' ').length,
        overlap,
        overflow: cells.some(cell => cell.scrollWidth > cell.clientWidth + 1),
    };
})'''

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
        expected = page.evaluate('''() => {
            for (const {id} of ENEMIES) s.library.monsters[id] = {count: 1, identified: true};
            s.library.items.sword = true;
            return ENEMIES.map(d => {
                const [min, max] = d.groupSize;
                const group = min === max ? String(min) : `1d${max - min + 1}${min >= 2 ? `+${min - 1}` : ''}`;
                const resist = `${Math.round(d.mageResist * 100)}/${Math.round(d.priestResist * 100)}`;
                return {id: d.id, floor: d.floors[0], group, resist};
            });
        }''')
        page.locator('#libraryopen').click()
        progress = page.locator('#librarydialog .dialoghead > #libraryprogress[role="status"]')
        close = page.locator('#librarydialog .dialoghead > #libraryprogress + #libraryclose')
        assert progress.inner_text() == f'モンスター {len(expected)}/{len(expected)} · アイテム 1/{page.evaluate("WEAPONS.length")}'
        progress_box, close_box = progress.bounding_box(), close.bounding_box()
        assert progress_box and close_box
        assert progress_box['x'] + progress_box['width'] <= close_box['x']
        assert progress_box['y'] < close_box['y'] + close_box['height']
        assert close_box['y'] < progress_box['y'] + progress_box['height']

        for floor in sorted({d['floor'] for d in expected}):
            page.locator(f'#librarymonstertab-{floor}').click()
            details = page.locator('#librarybody .library-entry dl').evaluate_all(MONSTER_DETAILS)
            monsters = [d for d in expected if d['floor'] == floor]
            assert [entry['id'] for entry in details] == [d['id'] for d in monsters]
            for entry, monster in zip(details, monsters):
                assert (entry['group'], entry['resist']) == (monster['group'], monster['resist']), entry
                assert entry['tracks'] == 4 and not entry['overlap'] and not entry['overflow'], (width, entry)
                if entry['id'] == 'slime':
                    assert (entry['group'], entry['resist']) == ('1d2', '0/0')
            if floor == 1:
                page.locator('#librarydialog').screenshot(path=str(output / f'library-{width}.png'))

        page.locator('#librarytab-items').click()
        item_details = page.locator('#librarybody [data-library-entry="item-sword"] dl')
        assert item_details.evaluate("e => getComputedStyle(e).gridTemplateColumns.split(' ').length") == 2
        assert not errors, errors
        print(f'PASS library display Chromium {width}px: monster fields, grid tracks, header and no cell overlap')
        context.close()
    browser.close()
