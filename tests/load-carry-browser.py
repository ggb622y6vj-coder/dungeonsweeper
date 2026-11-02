# 029b: loading an old town save with dead/ash/lost members in the party carries them to the reserve with the temple dialog only.
from playwright.sync_api import sync_playwright
import os,sys
from pathlib import Path

chrome_path=os.environ.get('CHROME_PATH')
if not chrome_path:
 for candidate in ('/usr/bin/chromium','/usr/bin/google-chrome','/usr/bin/chromium-browser'):
  if Path(candidate).exists():
   chrome_path=candidate
   break
url=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8000/'
def no_overflow(page):
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'horizontal scroll'
with sync_playwright() as p:
 launch_options={'headless':True,'args':['--no-sandbox']}
 if chrome_path:
  launch_options['executable_path']=chrome_path
 browser=p.chromium.launch(**launch_options)
 for width in (1280,390):
  ctx=browser.new_context(viewport={'width':width,'height':900},has_touch=width<700)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url)
  page.locator('#trainingopen').click()
  for i,job in enumerate([0,0,0,2,1,3]):
   page.locator('#recruitname').fill('旧冒険者'+str(i));page.locator('#recruitjob').select_option(str(job))
   page.locator('#rollrecruit').click();page.locator('#registerrecruit').click()
   page.locator('#recruitlist section').last.get_by_role('button',name='加入',exact=True).click()
  page.locator('#trainingclose').click()
  dialog=page.locator('#templecarrydialog')
  # Healthy town reload: no dialog.
  page.reload()
  assert page.evaluate("s.area==='town'&&s.members.length===6")
  assert not dialog.is_visible()
  # Dungeon reload with a dead member: unchanged, no dialog.
  page.locator('#entrance').click();page.wait_for_function('!logBusy()')
  page.evaluate("s.members[2].status='dead';s.hp[2]=0;render();save()")
  page.reload()
  assert page.evaluate("s.area==='dungeon'&&s.members.length===6&&s.members[2].status==='dead'")
  assert not dialog.is_visible()
  # Build a pre-029 style town save: impaired members still in the party, with a stale level report.
  names=page.evaluate("s.area='town';s.enemy=null;s.members[1].status='dead';s.hp[1]=0;s.members[2].status='ash';s.hp[2]=0;s.members[4].status='lost';s.hp[4]=0;s.templeReport=[];s.levelReport=['古いレベル報告'];save();[1,2,4].map(i=>s.members[i].name)")
  page.reload()
  assert dialog.is_visible(),'carry dialog on legacy town load'
  assert not page.locator('#leveldialog').is_visible()
  text=page.locator('#templecarrylist').inner_text()
  assert f'{names[0]}（死亡）' in text and f'{names[1]}（灰）' in text and f'{names[2]}（ロスト）' in text,text
  assert dialog.evaluate('(e)=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&e.scrollWidth<=e.clientWidth}')
  no_overflow(page)
  page.screenshot(path=f'/workspace/sim/v029b-load-carry-{width}.png')
  assert page.evaluate("PARTY_FIELDS.every(k=>s[k].length===3)&&[s.commands,s.magicPlans,s.itemPlans,s.attackRows].every(a=>a.length===3)&&s.members.every(m=>m.status==='ok')")
  assert page.evaluate("s.reserve.map(r=>r.members.status).sort().join()")=='ash,dead,lost'
  assert page.evaluate("JSON.parse(localStorage.getItem('ash-v1')).partyIds.length")==3,'carry saved immediately'
  page.locator('#templecarryok').click()
  page.wait_for_function("!document.querySelector('#templecarrydialog').open")
  page.wait_for_timeout(300)
  assert not page.locator('#leveldialog').is_visible(),'no level report after load carry'
  page.reload()
  assert not dialog.is_visible() and page.evaluate("s.members.length===3&&s.reserve.length===3")
  # Temple lists dead/ash as 控え (lost cannot be raised, so it is not listed).
  page.locator('#templeopen').click()
  rows=page.locator('#templemembers .shopitem').all_inner_texts()
  assert len(rows)==2 and all('控え' in r for r in rows),rows
  assert any(names[0] in r and '死亡' in r for r in rows) and any(names[1] in r and '灰' in r for r in rows) and not any(names[2] in r for r in rows),rows
  page.locator('#templeclose').click()
  # Tavern reorder saves without a rejection.
  page.locator('#tavernopen').click()
  page.locator('[data-tavern-slot="0"]').select_option(page.locator('[data-tavern-slot="1"]').input_value())
  page.locator('#tavernsave').click()
  assert not page.locator('#taverndialog').is_visible(),page.locator('#tavernnotice').inner_text()
  assert page.locator('#townnotice').inner_text()==''
  assert page.evaluate("s.members.length===3")
  # Dungeon entry passes.
  page.locator('#entrance').click();page.wait_for_function('!logBusy()')
  assert page.evaluate("s.area==='dungeon'")
  no_overflow(page)
  assert not errors,errors
  print(f'PASS Chromium {width}px: healthy town load and dungeon load show no dialog; legacy town save with dead/ash/lost → carry dialog only (no level report), arrays aligned, saved; temple lists 控え; tavern save and dungeon entry pass; no JS errors')
 browser.close()
