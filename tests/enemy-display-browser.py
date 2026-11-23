"""132: enemy icons, per-row counts during log playback, and overlay clearance."""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/'
chrome = os.environ.get('CHROME_PATH') or next((p for p in (
    '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser',
    '/opt/google/chrome/chrome', '/opt/ungoogled-chromium/chrome',
) if Path(p).exists()), None)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=chrome, args=['--no-sandbox'])
    for width in (1280, 390):
        page = browser.new_page(viewport={'width': width, 'height': 900})
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
              boxes:icons.map(e=>['x','y','width','height'].map(a=>Number(e.querySelector('rect').getAttribute(a)))),
              rows:[...document.querySelectorAll('.scene-enemies > div')].map(e=>e.textContent)
            };
          };
          return readEnemyScene();
        }""")
        assert first['ids'] == ['11', '20'], first
        assert first['zzzIds'] == [], first
        assert first['boxes'] == [[186, 140, 108, 121], [346, 140, 108, 121]], first
        assert first['rows'] == ['1：ゴブリン ×4(2)', '2：スライム ×2(2)', '3：ハイウルフ ×3(0)'], first
        page.wait_for_function('!logBusy()')
        last = page.evaluate('readEnemyScene()')
        assert last['ids'] == ['20', '30'] and last['zzzIds'] == [], last
        assert last['rows'] == ['1：スライム ×2(1)', '2：ハイウルフ ×3(0)'], last
        single = page.evaluate("""()=>{
          for(const e of s.enemy.units.filter(e=>e.row===28)){e.hp=0;e.rewarded=true}
          render();
          return readEnemyScene();
        }""")
        assert single['boxes'] == [[266, 140, 108, 121]], single
        print(f'PASS enemy display {width}px: first two icons, no Zzz, full row counts and snapshot order')

        layout = page.evaluate("""()=>{
          s.floor = 3;
          s.enemy = {dataVersion: 1, initiative: 'normal', flagEffect: {}, units:
            ['firefly', 'dragon', 'rabbit', 'thief'].map((id, row) => ({
              id, row, uid: row + 40, hp: 5, identified: true, sleep: row < 2 ? 2 : 0
            }))
          };
          render();
          const list = document.querySelector('#scene .scene-enemies');
          const icons = [...document.querySelectorAll('#scene [data-enemy-uid]')];
          return {
            rowCount: list.children.length,
            list: list.getBoundingClientRect().toJSON(),
            icons: icons.map(icon => ({
              uid: icon.dataset.enemyUid,
              texts: [...icon.querySelectorAll('text')].map(text => ({
                label: text.textContent,
                box: text.getBoundingClientRect().toJSON()
              }))
            }))
          };
        }""")
        assert layout['rowCount'] == 4, layout
        assert [icon['uid'] for icon in layout['icons']] == ['40', '41'], layout
        enemy_list = layout['list']
        assert enemy_list['width'] > 0 and enemy_list['height'] > 0, layout
        for icon in layout['icons']:
            assert len(icon['texts']) == 1, icon
            emoji = icon['texts'][0]
            assert emoji['label'] and emoji['label'] != 'Zzz', icon
            box = emoji['box']
            assert box['width'] > 0 and box['height'] > 0, emoji
            assert (
                box['right'] <= enemy_list['left'] or box['left'] >= enemy_list['right']
                or box['bottom'] <= enemy_list['top'] or box['top'] >= enemy_list['bottom']
            ), (width, icon['uid'], emoji, enemy_list)
        print(f'PASS enemy display {width}px: four-row list clears both emoji')
        page.close()
    browser.close()
