// 104: training tabs, rename validation, no reorder UI, no 前職 line, job-name class buttons.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {game}=require('../scripts/sim/harness.cjs');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const trainingSrc=fs.readFileSync(path.join(root,'dist/training.js'),'utf8');
const gameSrc=fs.readFileSync(path.join(root,'dist/game.js'),'utf8');
for(const id of ['trainingtab-create','trainingtab-edit','trainingpanel-create','trainingpanel-edit','renamedialog','renamename','renameconfirm','renamecancel'])
 assert(html.includes(`id="${id}"`),id);
assert(html.includes('role="tablist"')&&html.includes('aria-controls="trainingpanel-edit"'));
assert(html.includes('#classchangejobs button.job-ready'));
for(const gone of ['id="trainingreorder"','id="trainingorderdialog"','id="trainingorderlist"','id="trainingordercancel"','登録・加入・外す・抹消'])
 assert(!html.includes(gone),gone);
assert(html.includes('id="partyreorder"'));
assert(html.includes('>登録・転職・編集</button>'));
assert(html.includes('訓練所で冒険者を作成し、酒場でパーティに加えてください。'));
assert(!trainingSrc.includes('CLASS_FEATURES')&&!trainingSrc.includes('trainingreorder')&&!trainingSrc.includes('trainingOrder'));
assert(!gameSrc.includes('前職：'));
function setup(saved=null){
 const g=game(saved,()=>.5);
 g.run(`const originalCreate=document.createElement;document.createElement=(tag)=>Object.assign(originalCreate(tag),{dataset:{}});`);
 g.run(trainingSrc);
 return g;
}
const read=(g,code)=>JSON.parse(g.run(`JSON.stringify(${code})`));
let g=setup();
g.run(`$('#trainingopen').onclick()`);
assert.equal(g.run(`$('#trainingtab-create').attributes['aria-selected']`),'true');
assert.equal(g.run(`$('#trainingtab-edit').attributes['aria-selected']`),'false');
assert.equal(g.run(`$('#trainingpanel-create').hidden`),false);
assert.equal(g.run(`$('#trainingpanel-edit').hidden`),true);
assert.equal(g.run(`$('#trainingtab-create').tabIndex`),0);
assert.equal(g.run(`$('#trainingtab-edit').tabIndex`),-1);
g.run(`showTrainingTab('edit')`);
assert.equal(g.run(`$('#trainingtab-edit').attributes['aria-selected']`),'true');
assert.equal(g.run(`$('#trainingpanel-create').hidden`),true);
assert.equal(g.run(`$('#trainingpanel-edit').hidden`),false);
g.run(`renderTraining()`);
assert.equal(g.run(`$('#trainingtab-edit').attributes['aria-selected']`),'true');
g.run(`$('#training').close();$('#trainingopen').onclick()`);
assert.equal(g.run(`$('#trainingtab-create').attributes['aria-selected']`),'true');
assert.equal(g.run(`$('#trainingpanel-edit').hidden`),true);
g.run(`var rec=generateRecruit('元の名前',0);registerRecruit(rec);var id=rec.members.id;showTrainingTab('edit');renderTraining()`);
assert.deepEqual(read(g,`$('#recruitlist').children.find(el=>el.dataset&&el.dataset.recruitId===id).children[3].children.map(b=>b.textContent)`),['転職','名前の変更','登録抹消']);
const stored=()=>g.run('trainingRoster().find(r=>r.members.id===id).members.name');
assert.equal(stored(),'元の名前');
for(const bad of ['', '   ', 'あ'.repeat(21), '<tag>', 'a&b', 'a"b', "a'b", 'a>b', 'a\nb', 'a\u0000b', 12]){
 const result=read(g,`renameRecruit(id,${JSON.stringify(bad)})`);
 assert.equal(result.ok,false,JSON.stringify(bad));
 assert.equal(stored(),'元の名前');
}
assert.equal(g.run(`renameRecruit('missing','名前').reason`),'冒険者が見つかりません。');
assert.equal(g.run(`renameRecruit(id,'  新しい名前  ').ok`),true);
assert.equal(stored(),'新しい名前');
assert.equal(g.run('s.reserve[0].members.name'),'新しい名前');
assert.equal(g.run(`renameRecruit(id,'あ').ok`),true);
assert.equal(stored(),'あ');
assert.equal(g.run(`renameRecruit(id,${JSON.stringify('あ'.repeat(20))}).ok`),true);
assert.equal(g.run('trainingRoster().find(r=>r.members.id===id).members.name.length'),20);
assert.equal(g.run(`renameRecruit(id,'名\u007f前').ok`),true);
assert.equal(stored(),'名\u007f前');
g.run(`changeRecruitParty(id,true);renameRecruit(id,'パーティ名')`);
assert.equal(g.run('s.members[0].name'),'パーティ名');
assert.equal(g.run('NAMES[0]'),'パーティ名');
g.run(`s.members[0].careerHistory=[{from:1,fromLevel:10,to:0}];renderStats()`);
assert.doesNotMatch(g.run(`$('#statsbody').innerHTML`),/前職/);
assert.equal(g.run('s.members[0].careerHistory.length'),1);
const id=g.run('id');
const reloaded=setup(g.run(`localStorage.getItem('ash-v1')`));
assert.equal(reloaded.run(`trainingRoster().find(r=>r.members.id===${JSON.stringify(id)}).members.name`),'パーティ名');
g.run(`showTrainingTab('edit');renderTraining();$('#recruitlist').children.find(el=>el.dataset.recruitId===id).children[3].children[1].onclick()`);
assert.equal(g.run(`$('#renamedialog').open`),true);
assert.equal(g.run(`$('#renametarget').textContent.includes('パーティ名')`),true);
assert.equal(g.run(`$('#renametarget').innerHTML`),undefined);
g.run(`$('#renamename').value='<bad>';$('#renameconfirm').onclick()`);
assert.match(g.run(`$('#renamenotice').textContent`),/使えない文字/);
assert.equal(g.run(`$('#renamedialog').open`),true);
assert.equal(g.run('s.members[0].name'),'パーティ名');
g.run(`$('#renamename').value='  画面から  ';$('#renameconfirm').onclick()`);
assert.equal(g.run('s.members[0].name'),'画面から');
assert.equal(g.run(`$('#trainingnotice').textContent`),'名前を変更しました。');
const row=read(g,`$('#recruitlist').children.find(el=>el.dataset.recruitId===id).children[0].textContent`);
assert.match(row,/画面から/);
assert.equal(g.run(`$('#recruitlist').children.find(el=>el.dataset.recruitId===id).children[0].innerHTML`),undefined);
g.run(`s.area='dungeon'`);
assert.equal(g.run(`renameRecruit(id,'別名').ok`),false);
assert.equal(g.run('s.members[0].name'),'画面から');
g.run(`s.area='town'`);
g=setup();
g.run(`var rec=generateRecruit('転職者',1);registerRecruit(rec);changeRecruitParty(rec.members.id,true);var id=rec.members.id;var r=trainingRoster()[0];r.members.level=10;r.inventory.push('sword','staff','mace','dagger');$('#trainingopen').onclick();openClassChange(id)`);
const buttons=read(g,`$('#classchangejobs').children.map(b=>({text:b.textContent,disabled:!!b.disabled,title:b.title||'',className:b.className||'',job:+b.attributes['data-class-job'],pressed:b.attributes['aria-pressed']}))`);
assert.equal(buttons.length,8);
for(const b of buttons){
 assert.equal(b.text,g.run(`CLASSES[${b.job}].name`));
 assert.equal(b.pressed,'false');
 const ok=g.run(`canChangeClass(trainingRoster()[0],${b.job}).ok`);
 assert.equal(b.disabled,!ok);
 assert.equal(b.className.includes('job-ready'),ok);
 if(!ok)assert.equal(b.title,g.run(`canChangeClass(trainingRoster()[0],${b.job}).reason`));
 else assert.equal(b.title,'');
}
console.log('PASS training menu: tabs, rename rejection/save, no reorder UI, no 前職 line, job-name buttons');

// 104 amendment: closing training must keep an unconfirmed tavern formation.
// Dialog 'close' is queued, matching the browser, so assertions wait for drain().
function setupTrainingEvents(){
 const g=game(null,()=>.5);
 g.run(`const originalCreate=document.createElement;document.createElement=(tag)=>Object.assign(originalCreate(tag),{dataset:{}});
  const wire=el=>{
   if(el._wired)return el;el._wired=true;el._on={};
   el.addEventListener=(type,fn)=>{(el._on[type]??=[]).push(fn)};
   const origClose=el.close;
   el.close=function(){origClose.call(el);setTimeout(()=>{if(!el.open)for(const fn of el._on.close||[])fn()})};
   return el;
  };
  const origQS=document.querySelector;document.querySelector=key=>wire(origQS(key));`);
 g.run(trainingSrc);
 return g;
}
function slotIds(g){return JSON.parse(g.run(`JSON.stringify(Array.from({length:6},(_,slot)=>{const i=tavernOrder[slot];return Number.isInteger(i)&&i>=0&&tavernRoster[i]?tavernRoster[i].members.id:null}))`))}
function closeTraining(g){g.run(`$('#training').close()`);g.drain()}
g=setupTrainingEvents();
g.run(`s.area='town';s.enemy=null;s.done=false;s.pendingStairs=false;s.pendingBoss=null;
 for(const [name,job] of [['甲',0],['乙',1],['丙',2],['丁',3]]){const rec=generateRecruit(name,job);if(!registerRecruit(rec))throw Error('register '+name)}
 var id=Object.fromEntries(trainingRoster().map(r=>[r.members.name,r.members.id]));
 partyUI();$('#tavernopen').onclick();
 if(!setTownPartyFromRoster(tavernRoster,[0,1,2,-1,-1,-1]))throw Error('initial save');
 $('#tavernopen').onclick();
 tavernOrder=[2,1,0,3,-1,-1];renderTavern();`);
const draft=[g.run(`id.丙`),g.run(`id.乙`),g.run(`id.甲`),g.run(`id.丁`),null,null];
assert.deepEqual(slotIds(g),draft);
const savedBefore=g.run(`JSON.stringify(s.members.map(m=>m.id))`);
g.run(`$('#tavernmanage').onclick()`);
assert.equal(g.run(`$('#training').open&&$('#taverndialog').open`),true);
closeTraining(g);
assert.equal(g.run(`$('#training').open`),false);
assert.equal(g.run(`$('#taverndialog').open`),true);
assert.deepEqual(slotIds(g),draft,'unconfirmed order survives training close');
assert.equal(g.run(`JSON.stringify(s.members.map(m=>m.id))`),savedBefore,'close does not save the draft');
g.run(`$('#tavernmanage').onclick();showTrainingTab('edit');
 if(!renameRecruit(id.甲,'甲改').ok)throw Error('rename');
 const extra=generateRecruit('戊',0);if(!registerRecruit(extra))throw Error('extra');id.戊=extra.members.id;
 if(!deleteRecruit(id.丙))throw Error('delete');`);
closeTraining(g);
assert.deepEqual(slotIds(g),[null,g.run(`id.乙`),g.run(`id.甲`),g.run(`id.丁`),null,null],'deleted slot is empty; the rest stay');
assert.equal(g.run(`tavernRoster.some(r=>r.members.id===id.丙)`),false);
assert.equal(g.run(`tavernRoster.some(r=>r.members.name==='甲改'&&r.members.id===id.甲)`),true);
assert.equal(g.run(`tavernRoster.some(r=>r.members.id===id.戊)`),true);
assert.equal(g.run(`tavernOrder.includes(tavernRoster.findIndex(r=>r.members.id===id.戊))`),false,'a new recruit is not inserted into the formation');
assert.equal(g.run(`$('#tavernslots').innerHTML.includes('甲改')&&$('#tavernslots').innerHTML.includes('戊')&&!$('#tavernslots').innerHTML.includes('丙')`),true);
assert.equal(g.run(`setTownPartyFromRoster(tavernRoster,tavernOrder)`),true);
assert.deepEqual(JSON.parse(g.run(`JSON.stringify(s.members.map(m=>m.id))`)),[g.run(`id.乙`),g.run(`id.甲`),g.run(`id.丁`)]);
assert.equal(g.run(`s.members.map(m=>m.name).join(',')`),'乙,甲改,丁');
assert.equal(g.run(`trainingRoster().some(r=>r.members.id===id.丙)`),false,'saving does not resurrect the deleted member');
assert.equal(g.run(`s.reserve.some(r=>r.members.id===id.戊)`),true);
// Empty party: an unconfirmed placement survives, then a revived reserve member can join.
g.run(`$('#tavernopen').onclick();tavernOrder=[-1,-1,-1,-1,-1,-1];if(!setTownPartyFromRoster(tavernRoster,tavernOrder))throw Error('clear');
 $('#tavernopen').onclick();const back=tavernRoster.findIndex(r=>r.members.id===id.乙);tavernOrder[1]=back;renderTavern();
 $('#tavernmanage').onclick();`);
closeTraining(g);
assert.deepEqual(slotIds(g),[null,g.run(`id.乙`),null,null,null,null]);
assert.equal(g.run(`setTownPartyFromRoster(tavernRoster,tavernOrder)`),true);
assert.deepEqual(JSON.parse(g.run(`JSON.stringify(s.members.map(m=>m.id))`)),[g.run(`id.乙`)]);
g.run(`const dead=s.reserve.find(r=>r.members.id===id.丁);dead.members.status='dead';dead.hp=0;s.gold=100000;Math.random=()=>0;
 const raised=templeRaise(id.丁);if(!raised||!raised.success||raised.status!=='ok')throw Error('raise');
 $('#tavernopen').onclick();const join=tavernRoster.findIndex(r=>r.members.id===id.丁);
 if(tavernRoster[join].members.status!=='ok')throw Error('revived option');
 tavernOrder[3]=join;if(!setTownPartyFromRoster(tavernRoster,tavernOrder))throw Error('join revived');`);
assert.deepEqual(JSON.parse(g.run(`JSON.stringify(s.members.map(m=>m.id))`)),[g.run(`id.乙`),g.run(`id.丁`)]);
assert.equal(g.run(`s.members.every(m=>m.status==='ok')`),true);
// A class change replaces the roster objects. Saving the kept formation must keep the new job.
g.run(`$('#tavernopen').onclick();tavernOrder=[1,0,-1,-1,-1,-1];renderTavern();$('#tavernmanage').onclick();
 s.members.find(m=>m.id===id.乙).level=10;s.inventory[s.members.findIndex(m=>m.id===id.乙)].push('sword','staff','mace','dagger');
 const changed=changeClass(id.乙,0);if(!changed.ok)throw Error(changed.reason);`);
closeTraining(g);
assert.deepEqual(slotIds(g),[g.run(`id.丁`),g.run(`id.乙`),null,null,null,null]);
assert.equal(g.run(`setTownPartyFromRoster(tavernRoster,tavernOrder)`),true);
assert.equal(g.run(`s.members.find(m=>m.id===id.乙).job`),0,'formation save keeps the class change');
assert.equal(g.run(`s.members.map(m=>m.id).join()`),g.run(`[id.丁,id.乙].join()`));
console.log('PASS tavern formation kept across training close; rename, register, delete, empty party, revived join');
