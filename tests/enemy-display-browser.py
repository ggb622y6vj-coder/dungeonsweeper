"""Combat sprites, snapshot order, wall symbols and image failure at both viewport sizes."""
import math
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome',
) if Path(p).exists()), None)

def check_sprites(page, uids, centers, files):
    page.wait_for_function("""count=>{
      const imgs=[...document.querySelectorAll('#scene img.enemy-sprite')];
      return imgs.length===count && imgs.every(i=>i.complete && i.naturalWidth===48 && i.clientWidth>0);
    }""", arg=len(uids))
    scene = page.locator('#scene')
    rect = scene.bounding_box()
    enemy_list = scene.locator('.scene-enemies')
    rows = enemy_list.bounding_box()
    assert rows['width'] > 0 and rows['height'] > 0
    assert abs(rows['x'] - rect['x'] - 6) < .1 and abs(rows['y'] - rect['y'] - 6) < .1
    assert rows['x'] + rows['width'] <= rect['x'] + rect['width'] + .1
    assert rows['y'] + rows['height'] <= rect['y'] + rect['height'] + .1
    line_boxes = enemy_list.locator(':scope > div').evaluate_all("""rows=>rows.map(row=>{
      const text=document.createRange();
      text.selectNodeContents(row);
      return Array.from(text.getClientRects(), box=>({left:box.left, right:box.right}));
    })""")
    assert line_boxes
    for line in line_boxes:
        assert len(line) == 1, line
        assert rows['x'] <= line[0]['left'] < line[0]['right'] <= rows['x'] + rows['width'] + .1, line
    dpr = page.evaluate('devicePixelRatio')
    target = min(rect['height'] * .475, rect['width'] * 150 / 640)
    rounded = math.floor(target * dpr / 48 + .5) * 48 / dpr
    size = rounded if abs(rounded - target) <= target * .15 else target
    imgs = scene.locator('img.enemy-sprite')
    assert scene.locator('svg [data-enemy-uid], svg rect').count() == 0
    assert 'Zzz' not in scene.inner_text()
    for i, (uid, x, filename) in enumerate(zip(uids, centers, files)):
        img = imgs.nth(i)
        assert img.is_visible() and img.get_attribute('data-enemy-uid') == str(uid)
        assert img.get_attribute('src') == 'assets/monsters/unknown/' + filename
        assert img.get_attribute('alt') == '' and img.get_attribute('title') is None
        assert img.evaluate("e=>getComputedStyle(e).imageRendering==='pixelated' && getComputedStyle(e).pointerEvents==='none'")
        box = img.bounding_box()
        assert abs(box['width'] - size) < .1 and abs(box['height'] - size) < .1, (box, size)
        assert abs(box['x'] + size/2 - (rect['x'] + rect['width']*x/640)) < .1
        assert abs(box['y'] + size - (rect['y'] + rect['height']*.75)) < .1


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=chrome, args=['--no-sandbox'])
    for width in (1280, 390):
        dpr = 2 if width == 390 else 1
        page = browser.new_page(viewport={'width': width, 'height': 900}, device_scale_factor=dpr)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(url)
        first = page.evaluate("""()=>{
          const recruit=generateRecruit('冒険者',0);
          registerRecruit(recruit);changeRecruitParty(recruit.members.id,true);
          s.area='dungeon';
          const unit=(id,row,uid,state={})=>({id,row,uid,hp:5,identified:true,...state});
          s.enemy={dataVersion:1,initiative:'normal',flagEffect:{},units:[
            unit('goblin',17,10,{rewarded:true,hp:0}),unit('goblin',17,11,{sleep:2}),
            unit('goblin',17,12,{silence:true}),unit('goblin',17,13,{poison:true}),unit('goblin',17,14,{hp:0}),
            unit('slime',28,20),unit('slime',28,21),
            unit('wolf',39,30,{paralysis:1}),unit('wolf',39,31,{stone:true}),unit('wolf',39,32,{fear:2})
          ]};
          log('敵の一団が現れた。');
          for(const e of s.enemy.units.filter(e=>e.row===17)){e.hp=0;e.rewarded=true}
          s.enemy.units.find(e=>e.uid===21).sleep=2;
          log('先頭の列が消えた。');
          // Both frames are queued and the live state already contains the later result.
          render();
          window.readEnemyScene=()=>{
            const icons=[...document.querySelectorAll('#scene [data-enemy-uid]')];
            return {
              ids:icons.map(e=>e.dataset.enemyUid),
              zzzIds:icons.filter(e=>e.textContent.includes('Zzz')).map(e=>e.dataset.enemyUid),
              paths:icons.map(e=>e.getAttribute('src')),
              rows:[...document.querySelectorAll('.scene-enemies > div')].map(e=>e.textContent)
            };
          };
          return readEnemyScene();
        }""")
        assert first['ids'] == ['11', '20'], first
        assert first['zzzIds'] == [], first
        assert first['paths'] == ['assets/monsters/unknown/hitogata.png', 'assets/monsters/unknown/futeikei.png'], first
        assert first['rows'] == ['1：ゴブリン ×4(2)', '2：スライム ×2(2)', '3：ハイウルフ ×3(0)'], first
        page.wait_for_function('!logBusy()')
        last = page.evaluate('readEnemyScene()')
        assert last['ids'] == ['20', '30'] and last['zzzIds'] == [], last
        assert last['rows'] == ['1：スライム ×2(1)', '2：ハイウルフ ×3(0)'], last
        check_sprites(page, [20, 30], [240, 400], ['futeikei.png', 'kemono.png'])
        page.evaluate("""()=>{
          for(const e of s.enemy.units.filter(e=>e.row===28)){e.hp=0;e.rewarded=true}
          render();
        }""")
        check_sprites(page, [30], [320], ['kemono.png'])

        page.evaluate("""()=>{
          s.floor=3;
          s.enemy={dataVersion:1,initiative:'normal',flagEffect:{},units:
            ['firefly','dragon','rabbit','thief'].map((id,row)=>({
              id,row,uid:row+40,hp:5,identified:row!==1,sleep:row<2?2:0
            }))};
          render();
        }""")
        assert page.locator('.scene-enemies > div').count() == 4
        check_sprites(page, [40, 41], [240, 400], ['mushi.png', 'ryuu.png'])
        assert '炎竜' not in page.locator('#scene').inner_html()
        # Resize just the scene, with no render call or viewport resize event.
        page.locator('#scene').evaluate("e=>{e.style.width='280px';e.style.height='200px'}")
        page.wait_for_function("w=>Math.abs(document.querySelector('.enemy-sprite').getBoundingClientRect().width-w)<.1",
                               arg=72 if dpr == 2 else 65.625)
        check_sprites(page, [40, 41], [240, 400], ['mushi.png', 'ryuu.png'])
        page.locator('#scene').evaluate("e=>{e.style.width='';e.style.height=''}")

        page.evaluate("encounterNotice='敵の奇襲！';scene()")
        assert page.evaluate("""()=>{
          const img=document.querySelector('.enemy-sprite'), notice=document.querySelector('.encounter-notice');
          img.style.pointerEvents=notice.style.pointerEvents='auto';
          const b=img.getBoundingClientRect();
          return document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)===notice;
        }""")
        page.evaluate("encounterNotice='';scene()")

        page.evaluate("""()=>{
          s.light=true;s.dir=0;s.pos=size()*3+3;
          const reset={open:false,flag:false,disarmed:false,safe:false,spent:false,chest:null,type:''};
          for(const i of [target(),target(-1),target(1),...diagonalSight()])Object.assign(s.cells[i],reset);
          s.cells[target(-1)].flag='power';s.cells[target(1)].open=true;
          window.fixtureBattle=s.enemy;
        }""")
        front = page.locator('#scene svg > text[x="320"][y="209"]')
        diagonal = page.locator('#scene .透視 text')
        left = page.locator('#scene svg > text[x="96"]')
        right = page.locator('#scene svg > text[x="544"]')
        for props, symbol in [({}, '？'), ({'safe': True}, '✓'), ({'flag': 'power'}, '⚑'),
                              ({'open': True, 'chest': {'opened': False}}, '▣'),
                              ({'open': True, 'type': 'down'}, '⇩')]:
            page.evaluate("""props=>{
              Object.assign(s.cells[target()],{safe:false,flag:false,open:false,chest:null,type:''},props);
              s.enemy=fixtureBattle;scene();
            }""", props)
            assert front.count() == diagonal.count() == right.count() == 0
            assert left.text_content() == '⚑'
            page.evaluate("s.enemy=null;scene()")
            assert front.text_content() == symbol and diagonal.all_text_contents() == ['？', '？']
            assert right.text_content().isdigit() and left.text_content() == '⚑'

        # This race has not been requested in this context. Only its group falls back.
        page.route('**/unknown/akuma.png', lambda route: route.abort())
        page.evaluate("""()=>{
          s.enemy=fixtureBattle;
          s.enemy.units[0].id='succubus';s.enemy.units[0].identified=false;
          scene();
        }""")
        fallback = page.locator('#scene svg g[data-enemy-uid="40"]')
        fallback.wait_for(state='visible')
        assert [fallback.locator('rect').get_attribute(a) for a in ('x','y','width','height')] == ['186','140','108','121']
        assert fallback.locator('text').text_content() == page.evaluate("enemyDefinition('succubus').icon")
        assert page.locator('#scene img').count() == 1
        assert page.locator('#scene img').get_attribute('data-enemy-uid') == '41'
        page.wait_for_function("document.querySelector('#scene img')?.naturalWidth===48")
        assert 'サッキュバス' not in page.locator('#scene').inner_html()
        assert not errors, errors
        print(f'PASS enemy sprites {width}px: snapshots, placement, single-line rows, resize, overlays, symbols and fallback')
        page.close()
    browser.close()
