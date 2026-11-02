# 029: town return carries dead/ash members to the temple (reserve) with a dialog before the level report.
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
def stairs_home(page):
 page.wait_for_function('!logBusy()')
 page.evaluate('s.pos=s.start;s.pendingStairs=true;render()')
 page.locator('#bossyes').click()
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
   page.locator('#recruitname').fill('冒険者'+str(i));page.locator('#recruitjob').select_option(str(job))
   page.locator('#rollrecruit').click();page.locator('#registerrecruit').click()
   page.locator('#recruitlist section').last.get_by_role('button',name='加入',exact=True).click()
  page.locator('#trainingclose').click()
  # Death-free return: no carry dialog.
  page.locator('#entrance').click()
  stairs_home(page)
  assert page.evaluate("s.area==='town'&&s.members.length===6")
  assert not page.locator('#templecarrydialog').is_visible()
  if page.locator('#leveldialog').is_visible():page.locator('#levelclose').click()
  # Dead + ash return.
  page.locator('#entrance').click();page.wait_for_function('!logBusy()')
  assert page.evaluate("s.area==='dungeon'")
  names=page.evaluate("s.members[1].status='dead';s.hp[1]=0;s.members[4].status='ash';s.hp[4]=0;s.members.forEach(m=>{if(m.status==='ok')m.xp=650});render();[s.members[1].name,s.members[4].name]")
  stairs_home(page)
  dialog=page.locator('#templecarrydialog')
  assert dialog.is_visible() and not page.locator('#leveldialog').is_visible()
  text=page.locator('#templecarrylist').inner_text()
  assert f'{names[0]}（死亡）' in text and f'{names[1]}（灰）' in text and '寺院で蘇生できます' in text,text
  assert page.locator('#templecarrytitle').inner_text()=='寺院への搬送'
  assert dialog.evaluate('(e)=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&e.scrollWidth<=e.clientWidth}')
  no_overflow(page)
  page.screenshot(path=f'/workspace/sim/v029-carry-{width}.png')
  page.locator('#templecarryok').click()
  page.locator('#leveldialog').wait_for(state='visible',timeout=3000)
  assert not dialog.is_visible()
  page.locator('#levelclose').click();assert not page.locator('#leveldialog').is_visible()
  assert page.evaluate("s.members.length===4&&s.reserve.length===2&&s.templeReport.length===0")
  # Temple lists both as 控え.
  page.locator('#templeopen').click()
  rows=page.locator('#templemembers .shopitem').all_inner_texts()
  assert len(rows)==2,rows
  assert any(names[0] in r and '控え · Lv.' in r and '死亡' in r for r in rows),rows
  assert any(names[1] in r and '控え · Lv.' in r and '灰' in r for r in rows),rows
  no_overflow(page)
  page.screenshot(path=f'/workspace/sim/v029-temple-{width}.png')
  page.locator('#templeclose').click()
  # Training: dead/ash shown with status, join disabled.
  page.locator('#trainingopen').click()
  for name,label in ((names[0],'死亡'),(names[1],'灰')):
   sec=page.locator('#recruitlist section').filter(has_text=name)
   assert '控え・'+label in sec.inner_text(),sec.inner_text()
   assert sec.get_by_role('button',name='加入',exact=True).is_disabled()
  no_overflow(page)
  page.locator('#trainingclose').click()
  # Reload keeps the 4-member party; dungeon entry is not refused.
  page.reload()
  assert page.evaluate("s.area==='town'&&s.members.length===4&&s.reserve.length===2&&s.members.every(m=>m.status==='ok')")
  assert not page.locator('#templecarrydialog').is_visible()
  page.locator('#entrance').click();page.wait_for_function('!logBusy()')
  assert page.evaluate("s.area==='dungeon'")
  assert page.locator('#townnotice').inner_text()==''
  # An unseen report is shown again after reload.
  third=page.evaluate("s.members[0].status='dead';s.hp[0]=0;render();s.members[0].name")
  stairs_home(page)
  assert dialog.is_visible()
  page.reload()
  assert dialog.is_visible() and page.locator('#templecarrylist').inner_text()==f'{third}（死亡）を寺院に運んだ。寺院で蘇生できます。'
  page.keyboard.press('Escape')
  page.wait_for_function("!document.querySelector('#templecarrydialog').open")
  assert page.evaluate('s.templeReport.length===0&&s.members.length===3')
  page.reload();assert not dialog.is_visible()
  no_overflow(page)
  assert not errors,errors
  print(f'PASS Chromium {width}px: no dialog on death-free return; dead/ash carry dialog (names, 死亡/灰, temple hint) → OK → level report; temple lists 控え; training shows status and disables join; reload keeps 4; dungeon entry allowed; unseen report re-shown after reload, Esc clears; no JS errors or overflow')
 browser.close()
