# 029a: tavern must not let dead/ash/lost members join; ok members can still be reordered/removed/added.
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
MSG='死亡したメンバーは加入できません。'
def no_overflow(page):
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'horizontal scroll'
def ids(page):return page.evaluate('s.members.map(m=>m.id)')
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
  for i,job in enumerate([0,0,2,1,3,0,1]):
   page.locator('#recruitname').fill('酒場客'+str(i));page.locator('#recruitjob').select_option(str(job))
   page.locator('#rollrecruit').click();page.locator('#registerrecruit').click()
  page.locator('#trainingclose').click()
  page.locator('#tavernopen').click()
  for i in range(6):page.locator('#tavernslots select').nth(i).select_option(str(i))
  page.locator('#tavernsave').click()
  assert page.evaluate('s.members.length===6')
  # Kill/ash/lose three members in the dungeon; return carries them to reserve.
  page.locator('#entrance').click();page.wait_for_function('!logBusy()')
  bad=page.evaluate("s.members[1].status='dead';s.hp[1]=0;s.members[3].status='ash';s.hp[3]=0;s.members[5].status='lost';s.hp[5]=0;render();[s.members[1].name,s.members[3].name,s.members[5].name]")
  page.wait_for_function('!logBusy()');page.evaluate('s.pos=s.start;s.pendingStairs=true;render()');page.locator('#bossyes').click()
  page.locator('#templecarryok').click()
  if page.locator('#leveldialog').is_visible():page.locator('#levelclose').click()
  assert page.evaluate("s.area==='town'&&s.members.length===3&&s.members.every(m=>m.status==='ok')")
  okreserve=page.evaluate("s.reserve.find(r=>r.members.status==='ok').members.name")
  # Open tavern: impaired options disabled and labelled.
  page.locator('#tavernopen').click()
  assert page.locator('#taverndialog').is_visible()
  assert page.locator('#tavernnotice').inner_text()==''
  sel=page.locator('#tavernslots select').nth(3)
  for name,label in zip(bad,('（死亡）','（灰）','（ロスト）')):
   opt=sel.locator('option').filter(has_text=name+label)
   assert opt.count()==1,(name,label)
   assert opt.evaluate('e=>e.disabled'),name
  okopt=sel.locator('option').filter(has_text=okreserve)
  assert not okopt.evaluate('e=>e.disabled')
  no_overflow(page)
  assert page.locator('#taverndialog').evaluate('(e)=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}')
  # Normal UI select cannot pick a disabled option.
  before=ids(page)
  try:
   sel.select_option(label=bad[0]+'（死亡）'+page.evaluate(f"' · Lv.'+s.reserve.find(r=>r.members.name==={bad[0]!r}).members.level"),timeout=1500)
  except Exception:pass
  # DOM tampering: enable the dead option, select it, dispatch change, save.
  for k in range(3):
   page.evaluate("([slot,name])=>{const sel=document.querySelectorAll('#tavernslots select')[slot];const o=[...sel.options].find(o=>o.textContent.startsWith(name));o.disabled=false;sel.value=o.value;sel.dispatchEvent(new Event('change',{bubbles:true}))}",[3,bad[k]])
   page.locator('#tavernsave').click()
   assert ids(page)==before,('tampered save changed party',bad[k])
   assert page.evaluate('s.members.every(m=>m.status==="ok")')
   assert page.locator('#taverndialog').is_visible()
   assert page.locator('#tavernnotice').inner_text()==MSG
   assert page.locator('#tavernnotice').is_visible()
   assert page.locator('#townnotice').inner_text()==MSG
   # reset slot 3 to empty
   page.locator('#tavernslots select').nth(3).select_option('-1')
  page.screenshot(path=f'/workspace/sim/v029a-tavern-{width}.png')
  # Valid: reorder (swap slot0/slot2), remove slot1, add ok reserve into slot3.
  names=page.evaluate('s.members.map(m=>m.name)')
  page.locator('#tavernslots select').nth(0).select_option(label=page.locator('#tavernslots select').nth(0).locator('option').filter(has_text=names[2]).inner_text())
  page.locator('#tavernslots select').nth(1).select_option('-1')
  page.locator('#tavernslots select').nth(3).select_option(label=okopt.inner_text())
  page.locator('#tavernsave').click()
  assert not page.locator('#taverndialog').is_visible()
  assert page.locator('#townnotice').inner_text()=='','stale rejection notice cleared after valid save'
  got=page.evaluate('s.members.map(m=>m.name)')
  assert got==[names[2],names[0],okreserve],got
  assert page.evaluate("s.reserve.some(r=>r.members.name===%r)"%names[1])
  assert page.evaluate('s.members.every(m=>m.status==="ok")')
  # Reload keeps it, entering dungeon works.
  page.reload()
  assert page.evaluate('s.members.map(m=>m.name)')==got
  page.locator('#tavernopen').click();assert page.locator('#tavernnotice').inner_text()=='';page.locator('#tavernclose').click()
  page.locator('#entrance').click();page.wait_for_function('!logBusy()')
  assert page.evaluate("s.area==='dungeon'")
  no_overflow(page)
  assert not errors,errors
  print(f'PASS Chromium {width}px: tavern disables （死亡）/（灰）/（ロスト）; DOM-tampered saves rejected with notice in dialog and town; ok reorder/remove/join from reserve works; reload keeps party; no JS errors or overflow')
  ctx.close()
 browser.close()
