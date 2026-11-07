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
  # Empty library opens without any registered adventurers; both tabs scroll.
  page.locator('#libraryopen').click()
  assert page.locator('#libraryprogress').inner_text()=='モンスター 0/100 · アイテム 0/67'
  monster_total=page.evaluate('ENEMIES.filter(d=>d.floors[0]===1).length')
  assert page.locator('#librarybody .library-entry').count()==monster_total
  assert page.locator('#librarybody h4').all_text_contents()==['？？？']*monster_total
  assert page.locator('#librarybody dl').count()==0
  for tab,total in [('items',48),('monsters',monster_total)]:
   page.locator('#librarytab-'+tab).click()
   assert page.locator('#librarytab-'+tab).get_attribute('aria-selected')=='true'
   assert page.locator('#librarybody h4').all_text_contents()==['？？？']*total
   page.locator('#librarybody .library-entry').last.scroll_into_view_if_needed()
   assert page.locator('#librarybody').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
   assert page.locator('#libraryclose').evaluate('(e)=>{const r=e.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight}')
  page.locator('#libraryclose').click();assert not page.locator('#librarydialog').is_visible()
  page.locator('#libraryopen').click();page.keyboard.press('Escape');assert not page.locator('#librarydialog').is_visible()
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
  # Purchase via the shop and win a deterministic 1F combat via the real turn path.
  page.evaluate('s.gold=1000;render()')
  page.locator('#blacksmith').click();page.locator('#shoptab-head').click();page.locator('[data-buy="helm"]').click();page.locator('#shoppurchasedialog').wait_for(state='hidden');page.locator('#shopclose').click()
  page.locator('#entrance').click();page.wait_for_function('!logBusy()')
  page.evaluate("s.enemy={units:[{id:'slime',uid:0,row:0,hp:1,rewarded:false}],initiative:'party',chestBattle:true};s.attackRows=s.members.map(()=>0);resetPartyCommands();Math.random=()=>.999;attack()")
  page.wait_for_function('!logBusy()')
  page.evaluate("s.cells[s.pos].chest.trap='none';weightedLoot=()=>weapon('plate');Math.random=()=>0")
  page.locator('#chestopen').click();page.wait_for_function('!logBusy()')
  page.evaluate('enterTown()');page.reload()
  page.locator('#libraryopen').click()
  # Counter counts spell-identified species, not kills.
  assert page.locator('#libraryprogress').inner_text()=='モンスター 0/100 · アイテム 2/67'
  # 059: a kill without the 識別 spell shows only the unknown name and kill count.
  assert page.locator('#librarybody h4').first.inner_text()=='不定形'
  assert '1d6+3' not in page.locator('#librarybody .library-entry').first.inner_text()
  assert '1体' in page.locator('#librarybody .library-entry').first.inner_text()
  page.evaluate("s.library.monsters.slime.identified=true;renderLibrary()")
  assert page.locator('#libraryprogress').inner_text()=='モンスター 1/100 · アイテム 2/67'
  assert page.locator('#librarybody h4').first.inner_text()=='スライム'
  assert '1d6+3' in page.locator('#librarybody .library-entry').first.inner_text()
  assert '初撃破階' not in page.locator('#librarybody .library-entry').first.inner_text()
  assert page.locator('#librarybody dl').count()==1
  page.screenshot(path=f'/tmp/library-monsters-{width}.png')
  page.locator('#librarytab-items').click()
  for kind, name in [('head','鉄兜'),('body','板金鎧'),('medicine','傷薬')]:
    page.locator('#libraryitemtab-'+kind).click()
    assert name in page.locator('#librarybody h4').all_text_contents()
    assert page.locator('#librarybody dl').count()==1
  page.screenshot(path=f'/tmp/library-items-{width}.png')
  assert page.locator('#librarydialog').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.locator('#librarytab-items').focus();page.keyboard.press('ArrowLeft')
  assert page.locator('#librarytab-monsters').get_attribute('aria-selected')=='true'
  page.locator('#libraryclose').click()
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
  # Town return levels eligible members and heals them in the same transition.
  page.evaluate("s.enemy=null;s.members.forEach(m=>{m.status='ok';m.xp=650});s.hp=s.members.map(()=>1);s.mp=s.members.map(()=>0);monsterHurt(0,999,s.commands,'敵');render()")
  page.wait_for_function('!logBusy()')
  dead_id=page.evaluate('s.members[0].id')
  page.evaluate('s.pos=s.start;s.pendingStairs=true;render()')
  page.locator('#bossyes').click()
  # 029: the dead member is carried to the reserve (temple) on return, keeping level/XP/HP0/MP.
  dead_ok="id=>{const r=s.reserve.find(r=>r.members.id===id);return !!r&&r.members.level===1&&r.hp===0&&r.mp===0&&r.members.status==='dead'&&r.members.xp===650&&!s.members.some(m=>m.id===id)}"
  assert page.evaluate("s.area==='town'&&s.members.length===5")
  assert page.evaluate(dead_ok,dead_id)
  assert page.evaluate('s.members.every((m,i)=>m.level===m.xpTargets.filter((v,j)=>j>=1&&v<=650).length&&s.hp[i]===m.maxHP&&s.mp[i]===m.maxMP)')
  assert page.locator('#templecarrydialog').is_visible() and not page.locator('#leveldialog').is_visible()
  page.locator('#templecarryok').click()
  page.locator('#leveldialog').wait_for(state='visible',timeout=3000)
  assert page.evaluate("s.members.every(m=>$('#levelreport').textContent.includes(m.name+' Lv.1 → '+m.level))")
  assert page.locator('#innopen,#inndialog,#stable').count()==0
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.locator('#levelclose').click()
  page.reload()
  assert page.evaluate("s.area==='town'&&s.members.length===5&&s.members.every(m=>m.level>1)")
  assert page.evaluate(dead_ok,dead_id)
  assert not page.locator('#templecarrydialog').is_visible()
  page.locator('#trainingopen').click()
  while page.locator('#recruitlist section').count():
   page.locator('#recruitlist section').first.get_by_role('button',name='登録抹消',exact=True).click();page.locator('#recruitdeleteconfirm').click()
  page.locator('#trainingclose').click();assert page.locator('#entrance').is_disabled()
  page.reload();assert page.evaluate('trainingRoster().length')==0
  assert page.evaluate('s.library.monsters.slime.count===1 && s.library.items.helm && s.library.items.plate && s.library.items.healingPotion')
  assert not errors,errors
  print(f'PASS Chromium {width}px: create/reroll/confirm, seven recruits, cap, reorder/bench/join, delete cancel/confirm, reload, combat, town return levels/heals ok members, carries dead to reserve with XP, carry dialog before level report, no inn, empty party; library empty/populated tabs, purchase/chest/victory records, reload/deletion retention, keyboard, scroll/open/close; no JS errors or overflow')
  ctx.close()
 browser.close()
