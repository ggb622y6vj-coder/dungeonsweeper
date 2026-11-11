const assert = require('node:assert/strict');
const {game} = require('../scripts/sim/harness.cjs');
const g = game();
g.run(`for(const [name,job] of [['試験A',0],['試験B',1],['控え',2]]){
 const r=generateRecruit(name,job);registerRecruit(r);
 if(job!==2)changeRecruitParty(r.members.id,true);
}reorderParty([1,0]);
var originalState=JSON.stringify(s),originalSave=localStorage.getItem('ash-v1');
var envelope=saveExportEnvelope(),data=JSON.parse(JSON.stringify(envelope.data));`);
assert.equal(g.run('envelope.format'), 'dungeonsweeper-save');
assert.equal(g.run('envelope.formatVersion'), 1);
assert.equal(g.run('new Date(envelope.exportedAt).toISOString()'), g.run('envelope.exportedAt'));
assert.equal(g.run('envelope.data.rosterVersion'), 1);
assert.equal(g.run('validateSaveData(rosterSaveState())'), true);
assert.equal(g.run('JSON.stringify(s)===originalState&&localStorage.getItem("ash-v1")===originalSave'), true);
const rejected = [
 'd=null', 'd=[]', 'd=new Date()', 'd.rosterVersion=2', 'delete d.roster', 'd.roster={}',
 'd.roster[1].members.id=d.roster[0].members.id', 'd.partyIds=["missing"]',
 'd.partyIds=[d.partyIds[0],d.partyIds[0]]',
 `d.roster=Array.from({length:7},(_,i)=>({...d.roster[0],members:{...d.roster[0].members,id:'id'+i}}));d.partyIds=d.roster.map(r=>r.members.id)`,
 'd.partyIds=null', 'd.partyIds=[1]', 'd.cells.pop()', 'd.size=7', 'd.cells=Array(81).fill({});d.size=9',
 'd.cells={length:64}', 'd.cells[0]=null', 'd.cells[0]=[]', 'd.floor=0', 'd.floor=11', 'd.floor=1.5',
 'd.gold=-1', 'd.gold=NaN', 'd.gold=Infinity', 'd.gold="1"', 'd.size=8.1',
 'd.roster[0]=null', 'd.roster[0].members=[]', 'd.roster[0].members.id=""',
 'd.roster[0].members.id=1', 'd.roster[0].members.name=null',
 'd.roster[0].members.job=-1', 'd.roster[0].members.job=8', 'd.roster[0].members.job=1.5',
 'd.roster[0].members.level=0', 'd.roster[0].members.level=31', 'd.roster[0].members.level=1.5',
 'd.roster[0].hp="1"', 'd.roster[0].hp=Infinity', 'd.roster[0].mp=NaN',
 'd.roster[0].inventory={}', 'd.roster[0].equipped=-1', 'd.roster[0].equipped=0.5',
 'd.roster[0].armor=[]', 'd.roster[0].ailments=null', 'd.corpses={}', 'd.corpses=[null]',
 'd.guardiansDefeated={}', 'd.elevatorFloors=null', 'd.logs="log"', 'd.floors=[]',
 'd.floors={1:null}', 'd.floors={1:{cells:[]}}', 'd.floors={1:{cells:{length:64}}}'
];
for(const change of rejected){
 assert.equal(g.run(`{let d=JSON.parse(JSON.stringify(data));${change};validateSaveData(d)}`),false,change);
}
for(const change of [
 'd.roster=[];d.partyIds=[]', 'd.roster[0].members.job=7;d.roster[0].members.level=30',
 'd.floor=10;d.size=12;d.cells=Array.from({length:144},()=>({}))',
 'd.floor=2;d.size=10;d.cells=Array.from({length:100},()=>({}))',
 'd.floors={1:{cells:Array.from({length:64},()=>({}))},2:{}}',
 'd.futureField={version:2};d.roster[0].members.futureField=true',
 'd.corpses=[{}];delete d.guardiansDefeated;delete d.elevatorFloors;delete d.logs;delete d.floors'
])assert.equal(g.run(`{let d=JSON.parse(JSON.stringify(data));${change};validateSaveData(d)}`),true,change);
g.run(`var beforeData=JSON.stringify(data);Math.random=()=>{throw Error('unexpected reroll')};
 if(!validateSaveData(data))throw Error('valid save rejected');
 var restored=restoreRoster(structuredClone(data));`);
assert.equal(g.run('JSON.stringify(data)'),g.run('beforeData'));
assert.deepEqual(Array.from(g.run('restored.members.map(m=>m.id)')),Array.from(g.run('data.partyIds')));
assert.equal(g.run(`JSON.stringify([...restored.members,...restored.reserve.map(r=>r.members)].map(m=>[m.id,m.vit,m.xpTargets]))`),
 g.run('JSON.stringify(data.roster.map(r=>[r.members.id,r.members.vit,r.members.xpTargets]))'));
console.log(`PASS save transfer envelope, pure validation (${rejected.length} rejections), roster/order/VIT/XP round trip`);

// Fault injection uses independent storage keys; the shared simulator's simple
// single-slot storage stub intentionally remains unchanged.
for(const faultMode of ['success','backup','write','readback','parse','readthrow','null','rollback']){
 const h=game();
 h.run(`var initial=JSON.stringify(rosterSaveState()),store=new Map([['ash-keyhint','off']]);
 var faultMode=${JSON.stringify(faultMode)},writes=[],reads=0,reloads=0;
 if(faultMode!=='null')store.set('ash-v1',initial);
 pendingSaveImport=JSON.parse(initial);pendingSaveImport.gold=987654;
 var stateBefore=JSON.stringify(s);
 localStorage={getItem(key){
   if(key==='ash-v1'&&++reads===2){
    if(faultMode==='readthrow')throw Error('read');
    if(faultMode==='parse')return '{';
    if(['readback','null','rollback'].includes(faultMode))return '{}';
   }return store.get(key)??null;
 },setItem(key,value){
   writes.push(key);
   if(faultMode==='backup'&&key==='ash-v1-backup'||faultMode==='write'&&key==='ash-v1'||faultMode==='rollback'&&key==='ash-v1'&&reads===2)throw Error('storage');
   store.set(key,value);
 },removeItem(key){store.delete(key)}};
 var location={reload(){reloads++}};confirmSaveImport();`);
 assert.equal(h.run('JSON.stringify(s)===stateBefore'),true,faultMode);
 assert.equal(h.run('store.get("ash-keyhint")'),'off',faultMode);
 assert.equal(h.run('reloads'),faultMode==='success'?1:0,faultMode);
 assert.equal(h.run('writes.every(k=>["ash-v1","ash-v1-backup"].includes(k))'),true);
 if(faultMode==='success'){
  assert.equal(h.run('JSON.parse(store.get("ash-v1")).gold'),987654);
  assert.equal(h.run('store.get("ash-v1-backup")===initial'),true);
 }else{
  assert.ok(h.run('$("#importnotice").textContent.length>0'),faultMode);
  if(faultMode==='null')assert.equal(h.run('store.has("ash-v1")'),false);
  else if(faultMode!=='rollback')assert.equal(h.run('store.get("ash-v1")===initial'),true,faultMode);
 }
 if(faultMode==='backup')assert.equal(h.run('writes.join()'),'ash-v1-backup');
}
console.log('PASS save transfer backup/write/readback/rollback failures, null original and unchanged live state/settings');

(async()=>{
 const h=game();
 h.run(`var importEnvelope=saveExportEnvelope(),importText=JSON.stringify(importEnvelope);
 var stateBefore=JSON.stringify(s),storageBefore=localStorage.getItem('ash-v1');
 var storageAccesses=0;
 localStorage={getItem(){storageAccesses++;throw Error('premature storage read')},setItem(){storageAccesses++;throw Error('premature storage write')}};`);
 for(const [expression,notice] of [
  [`({size:5*1024*1024+1,text(){throw Error('oversize must not be read')}})`,'5MiB'],
  [`({size:1,text:async()=>'{'} )`,'JSON'],
  [`({size:1,text:async()=>{throw Error('read failed')}})`,'JSON'],
  [`({size:1,text:async()=>'null'})`,'形式'],
  [`({size:1,text:async()=>JSON.stringify({...importEnvelope,format:'wrong'})})`,'形式'],
  [`({size:1,text:async()=>JSON.stringify({...importEnvelope,formatVersion:2})})`,'未対応'],
  [`({size:1,text:async()=>JSON.stringify({...importEnvelope,data:[]})})`,'内容'],
 ]){
  await h.run(`importSaveFile(${expression})`);
  assert.ok(h.run(`$('#savenotice').textContent.includes(${JSON.stringify(notice)})`));
  assert.equal(h.run('pendingSaveImport'),null);
 }
 await h.run(`importSaveFile({size:importText.length,text:async()=>importText})`);
 assert.equal(h.run('JSON.stringify(pendingSaveImport)'),h.run('JSON.stringify(importEnvelope.data)'));
 assert.equal(h.run('JSON.stringify(s)===stateBefore&&storageAccesses===0'),true);
 h.run(`$('#importcancel').onclick()`);
 assert.equal(h.run('pendingSaveImport===null&&!$("#importdialog").open&&$("#savefileinput").value===""'),true);
 // A file still being read must not reopen a cancelled/closed flow.
 const reading=h.run(`var finishRead;importSaveFile({size:1,text:()=>new Promise(resolve=>finishRead=resolve)})`);
 h.run('clearSaveImport();finishRead(importText)');
 await reading;
 assert.equal(h.run('pendingSaveImport===null&&!$("#importdialog").open'),true);
 for(const replacement of [`()=>{throw Error('restore')}`, '()=>null', '()=>({cells:[],members:[]})', '()=>({cells:Array(64),members:null})']){
  h.run(`restoreRoster=${replacement}`);
  await h.run(`importSaveFile({size:1,text:async()=>importText})`);
  assert.equal(h.run('pendingSaveImport'),null);
  assert.equal(h.run('$("#savenotice").textContent'),'セーブデータを復元できませんでした。');
 }
 assert.equal(h.run('JSON.stringify(s)===stateBefore&&storageAccesses===0'),true);
 h.run(`s.pendingStairs=true;var opened=0;$('#savefileinput').click=()=>opened++;$('#saveimport').onclick();exportSaveData()`);
 assert.equal(h.run('opened'),0);
 assert.ok(h.run('$("#savenotice").textContent.includes("操作が終わって")'));
 console.log('PASS save transfer file/envelope rejection, clone failure, cancellation/read race, idle guards and no pre-confirm state/storage changes');
})().catch(error=>{console.error(error);process.exitCode=1});
