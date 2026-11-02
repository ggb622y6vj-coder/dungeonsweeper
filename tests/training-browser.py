from playwright.sync_api import sync_playwright
import os,sys
from pathlib import Path

chrome_path=os.environ.get('CHROME_PATH')
if not chrome_path:
 for candidate in ('/usr/bin/chromium','/usr/bin/google-chrome','/usr/bin/chromium-browser'):
  if Path(candidate).exists():
   chrome_path=candidate
   break
with sync_playwright() as p:
 launch_options={'headless':True,'args':['--no-sandbox']}
 if chrome_path:
  launch_options['executable_path']=chrome_path
 browser=p.chromium.launch(**launch_options)
 for width in (1280,390):
  ctx=browser.new_context(viewport={'width':width,'height':900},has_touch=width<700)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8000/')
  assert page.locator('#entrance').is_disabled()
  page.locator('#trainingopen').click()
  page.locator('#rollrecruit').click();assert page.locator('#registerrecruit').is_disabled()
  for i,job in enumerate([0,0,0,2,1,3,1]):
   page.locator('#recruitname').fill('冒険者'+str(i));page.locator('#recruitjob').select_option(str(job))
   page.locator('#rollrecruit').click()
   if i==0:
    page.locator('#rollrecruit').click();assert '(' in page.locator('#recruitpreview').inner_text()
   page.locator('#registerrecruit').click();assert page.locator('#registerrecruit').is_disabled()
   if i<6:page.locator('#recruitlist section').last.get_by_role('button',name='加入',exact=True).click()
  assert page.locator('#recruitlist section').last.get_by_role('button',name='加入',exact=True).is_disabled()
  page.locator('#recruitlist section').first.get_by_role('button',name='後ろへ',exact=True).click()
  page.locator('#recruitlist section').first.get_by_role('button',name='離脱',exact=True).click()
  page.locator('#recruitlist section').last.get_by_role('button',name='加入',exact=True).click()
  page.locator('#recruitlist section').first.get_by_role('button',name='登録抹消',exact=True).click()
  page.locator('#recruitdeletecancel').click();assert page.locator('#recruitlist section').count()==7
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert page.locator('#training').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
  page.screenshot(path=f'/tmp/training-{width}.png')
  before=page.evaluate('JSON.stringify(trainingRoster())');order=page.evaluate('s.members.map(m=>m.id)')
  page.reload();assert page.evaluate('JSON.stringify(trainingRoster())')==before;assert page.evaluate('s.members.map(m=>m.id)')==order
  page.locator('#entrance').click();page.wait_for_function('!logBusy()')
  assert page.locator('#party .card').count()==6
  page.locator('#party').click();page.locator('#statsclose').click()
  page.evaluate("s.enemy={units:[{id:'slime',uid:0,row:0,hp:999,rewarded:false}],initiative:'party'};resetPartyCommands();render()")
  assert page.locator('#battle').is_visible()
  page.evaluate('Math.random=()=>.999')
  page.locator('[data-command-choice="fight"]').click()
  for _ in range(5):page.locator('[data-command-choice="guard"]').click()
  page.locator('#attack').click()
  page.wait_for_function('!logBusy()');assert page.evaluate('s.enemy.units[0].hp<999')
  # Town healing and stable-only inn: exercise the real return/stay handlers.
  page.evaluate("s.enemy=null;s.members.forEach(m=>{m.status='ok';m.xp=650});s.hp=s.members.map(()=>1);s.mp=s.members.map(()=>0);monsterHurt(0,999,s.commands,'敵');render()")
  page.wait_for_function('!logBusy()')
  page.evaluate('s.pos=s.start;s.pendingStairs=true;render()')
  page.locator('#bossyes').click()
  assert page.evaluate("s.area==='town'&&s.members.every(m=>m.level===1)")
  assert page.evaluate("s.hp[0]===0&&s.mp[0]===0&&s.members[0].status==='dead'")
  assert page.evaluate('s.members.every((m,i)=>i===0||(s.hp[i]===m.maxHP&&s.mp[i]===m.maxMP))')
  assert page.locator('#room').count()==0
  assert page.locator('#inncost').count()==0
  page.locator('#innopen').click()
  assert page.locator('#inndialog').is_visible()
  assert page.locator('#inndialog button').count()==2  # Close and stable only.
  page.evaluate('s.gold=0;window.beforeStableHP=s.hp.slice()')
  page.locator('#stable').click()
  assert page.evaluate('s.gold===0&&s.hp.every((h,i)=>h===window.beforeStableHP[i])')
  assert page.evaluate("s.members[0].level===1&&s.hp[0]===0&&s.mp[0]===0&&s.members[0].status==='dead'")
  assert page.evaluate('s.members.every((m,i)=>i===0||(m.level===m.xpTargets.filter((v,j)=>j>=1&&v<=650).length&&s.mp[i]===m.maxMP))')
  assert page.locator('#leveldialog').is_visible()
  assert page.evaluate("s.members.slice(1).every(m=>$('#levelreport').textContent.includes(m.name+' Lv.1 → '+m.level))")
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.locator('#levelclose').click()
  page.reload()
  assert page.evaluate("s.area==='town'&&s.hp[0]===0&&s.members[0].status==='dead'&&s.members.slice(1).every(m=>m.level>1)")
  page.locator('#trainingopen').click()
  while page.locator('#recruitlist section').count():
   page.locator('#recruitlist section').first.get_by_role('button',name='登録抹消',exact=True).click();page.locator('#recruitdeleteconfirm').click()
  page.locator('#trainingclose').click();assert page.locator('#entrance').is_disabled()
  page.reload();assert page.evaluate('trainingRoster().length')==0
  assert not errors,errors
  print(f'PASS Chromium {width}px: create/reroll/confirm, seven recruits, cap, reorder/bench/join, delete cancel/confirm, reload, combat, town full heal/death, stable all-ok levels/report, no paid room, empty party; no JS errors or overflow')
  ctx.close()
 browser.close()
