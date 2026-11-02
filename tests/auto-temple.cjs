// 029: on town return, dead/ash/lost members are carried out of the party to the reserve (temple).
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
// Minimal DOM whose dialogs fire 'close' events, so the carry → level-report ordering can be checked.
function boot(saved=null){
 let timers=[],els={};
 const el=()=>({style:{},dataset:{},children:[],classList:{toggle(){}},addEventListener(t,f){(this.events??={})[t]=f},append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x},setAttribute(){},showModal(){this.open=true;this.shown=(this.shown||0)+1},close(){if(!this.open)return;this.open=false;this.events?.close?.()},textContent:'',innerHTML:'',value:'0'});
 const ctx={crypto:require('node:crypto').webcrypto,structuredClone,document:{querySelector:q=>els[q]??=el(),querySelectorAll:()=>[],createElement:el,addEventListener(){},style:{}},localStorage:{data:saved,getItem(){return this.data},setItem(k,v){this.data=v}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);
 for(const f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','library.js','game.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',f),'utf8'),ctx);
 const run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(++n>10000)throw Error('timer loop')}};
 return {run,drain,saved:()=>run("save();localStorage.getItem('ash-v1')")};
}
function sixParty(){
 const g=boot();
 g.run(`s.area='town';for(let i=0;i<6;i++){let r=generateRecruit('冒険者'+i,i%4);registerRecruit(r);changeRecruitParty(r.members.id,true)}s.area='dungeon';logTimer=null;logQueue=[];`);
 return g;
}

// 6 members, #1 dead and #4 ash.
let g=sixParty();
g.run(`s.members[1].status='dead';s.hp[1]=0;s.members[4].status='ash';s.hp[4]=0;
 s.members[1].xp=777;s.members[4].xp=888;s.inventory[1].push('potion');
 s.members[0].xp=requiredXP(s.members[0].level+1,0);s.members[2].xp=requiredXP(s.members[2].level+1,2);
 s.hp[0]=1;s.mp[3]=0;s.ailments[0]={poison:true,paralysis:2};
 var ids=[s.members[1].id,s.members[4].id],names=[s.members[1].name,s.members[4].name],
  before=ids.map(id=>structuredClone(partyRecords().find(x=>x.members.id===id))),
  okIds=s.members.filter(m=>m.status==='ok').map(m=>m.id),lv0=s.members[0].level,lv2=s.members[2].level;
 enterTown();`);
assert.equal(g.run('s.area'),'town');
assert.equal(g.run('s.members.length'),4);
assert.equal(g.run('s.reserve.length'),2);
assert.equal(g.run('JSON.stringify(s.members.map(m=>m.id))'),g.run('JSON.stringify(okIds)'),'survivors keep their order');
assert.equal(g.run('PARTY_FIELDS.every(k=>s[k].length===4)'),true);
assert.equal(g.run('[s.commands,s.magicPlans,s.itemPlans,s.attackRows].every(a=>a.length===4)'),true);
assert.equal(g.run("JSON.stringify(s.reserve.map(r=>r.members.status))"),'["dead","ash"]');
assert.equal(g.run('s.reserve.every(r=>r.hp===0)'),true);
for(const k of [0,1]){
 assert.equal(g.run(`s.reserve[${k}].members.id===ids[${k}]`),true);
 for(const f of ['level','xp','maxHP','maxMP','job','name'])assert.equal(g.run(`s.reserve[${k}].members.${f}===before[${k}].members.${f}`),true,`carried ${f} unchanged`);
 for(const f of ['inventory','equipped','armor'])assert.equal(g.run(`JSON.stringify(s.reserve[${k}].${f})===JSON.stringify(before[${k}].${f})`),true,`carried ${f} unchanged`);
}
assert.equal(g.run("s.reserve[0].inventory.includes('potion')"),true);
assert.equal(g.run("JSON.stringify(s.templeReport)"),g.run("JSON.stringify([{name:names[0],status:'dead'},{name:names[1],status:'ash'}])"));
assert.equal(g.run('s.members[0].level'),g.run('lv0')+1,'survivor levels up on return');
assert.equal(g.run('s.members[1].level'),g.run('lv2')+1,'survivor levels up on return');
assert.equal(g.run('s.hp.every((h,i)=>h===s.members[i].maxHP)&&s.mp.every((m,i)=>m===s.members[i].maxMP)'),true,'survivors fully healed');
assert.equal(g.run('s.ailments.every(a=>!a.poison&&!a.paralysis)'),true);
// Dialog first, level report after.
assert.equal(g.run("$('#templecarrydialog').open"),true);
assert.equal(g.run("!!$('#leveldialog').open"),false,'level report waits for the carry dialog');
assert.equal(g.run('s.levelReport.length>0'),true);
const list=g.run("$('#templecarrylist').textContent");
assert.equal(list,g.run("`${names[0]}（死亡）、${names[1]}（灰）を寺院に運んだ。寺院で蘇生できます。`"));
// Save/reload keeps the 4-member party, reserve and the pending report, and re-shows the dialog.
let saved=g.saved();
let z=JSON.parse(saved);assert.equal(z.partyIds.length,4);assert.equal(z.roster.filter(r=>r.members.status!=='ok').length,2);assert.equal(z.templeReport.length,2);
let r1=boot(saved);
assert.equal(r1.run('s.members.length'),4);assert.equal(r1.run('s.reserve.length'),2);assert.equal(r1.run('s.templeReport.length'),2);
assert.equal(r1.run("$('#templecarrydialog').open"),true,'unseen report is re-shown after reload');
assert.equal(r1.run("$('#templecarrylist').textContent"),list);
// OK closes it, clears the saved report, then opens the level report.
g.run(`$('#templecarryok').onclick()`);
assert.equal(g.run("$('#templecarrydialog').open"),false);
assert.equal(g.run("$('#leveldialog').open"),true);
assert.equal(g.run('s.templeReport.length'),0);
assert.equal(JSON.parse(g.run("localStorage.getItem('ash-v1')")).templeReport.length,0);
assert.equal(boot(g.saved()).run("!!$('#templecarrydialog').open"),false,'seen report is not re-shown');
// Esc (dialog closed without OK) also continues to the level report.
r1.run(`$('#templecarrydialog').close()`);
assert.equal(r1.run("$('#leveldialog').open"),true);assert.equal(r1.run('s.templeReport.length'),0);
// Temple lists both as 控え; dead/ash cannot join; revival keeps them in reserve.
g.run(`$('#leveldialog').close();renderTemple()`);
const rows=g.run("var flat=e=>[e.textContent,...e.children.map(flat)].join('|');JSON.stringify($('#templemembers').children.map(flat))");
assert.equal(JSON.parse(rows).length,2);
assert.match(rows,/控え · Lv\.\d+ · 死亡/);assert.match(rows,/控え · Lv\.\d+ · 灰/);
assert.equal(g.run('changeRecruitParty(ids[0],true)'),false,'dead cannot join');
assert.equal(g.run('changeRecruitParty(ids[1],true)'),false,'ash cannot join');
assert.equal(g.run('s.members.length'),4);
g.run(`s.gold=100000;Math.random=()=>0;templeRaise(ids[0]);templeRaise(ids[1])`);
assert.equal(g.run("s.reserve.every(r=>r.members.status==='ok'&&r.hp===r.members.maxHP)"),true);
assert.equal(g.run('s.members.length'),4,'revived members stay in reserve');
assert.equal(g.run('PARTY_FIELDS.every(k=>s[k].length===4)'),true);
assert.equal(g.run('changeRecruitParty(ids[0],true)'),true,'revived member can join manually');
// Party is enterable after carrying (020 guard not hit).
g.run('enterDungeon()');assert.equal(g.run('s.area'),'dungeon');assert.equal(g.run("$('#townnotice').textContent"),'');
console.log('PASS auto temple carry: party arrays/plans aligned, carried records unchanged, survivors level/heal, report save/reload/re-show, dialog→level order (OK and Esc), temple 控え list, dead/ash join blocked, revival stays reserve, dungeon entry');

// Death-free return: no report, no dialog, level report directly.
g=sixParty();
g.run(`s.members[0].xp=requiredXP(s.members[0].level+1,0);enterTown()`);
assert.equal(g.run('s.templeReport.length'),0);
assert.equal(g.run("!!$('#templecarrydialog').open"),false);
assert.equal(g.run("$('#leveldialog').open"),true);
assert.equal(g.run('s.members.length'),6);
console.log('PASS death-free return: no carry, no dialog, level report shown');

// Lost is removed with its own line; dead + lost mixed.
g=sixParty();
g.run(`s.members[2].status='lost';s.hp[2]=0;s.members[3].status='dead';s.hp[3]=0;var lostName=s.members[2].name,deadName=s.members[3].name;enterTown()`);
assert.equal(g.run('s.members.length'),4);
assert.equal(g.run("s.reserve.map(r=>r.members.status).sort().join()"),'dead,lost');
assert.equal(g.run("$('#templecarrylist').textContent"),g.run("`${deadName}（死亡）を寺院に運んだ。寺院で蘇生できます。\n${lostName}（ロスト）はパーティーから外れた。ロストは蘇生できません。`"));
assert.equal(g.run("changeRecruitParty(s.reserve.find(r=>r.members.status==='lost').members.id,true)"),false);
console.log('PASS lost members carried with separate message and cannot join');

// Tavern blocks impaired members in the UI and validates again when saving.
g=boot();
g.run(`s.area='town';for(let i=0;i<3;i++){let r=generateRecruit('酒場'+i,i%4);registerRecruit(r);changeRecruitParty(r.members.id,true)}let dead=generateRecruit('死亡者',0);registerRecruit(dead);let ash=generateRecruit('灰の者',1);registerRecruit(ash);let roster=trainingRoster();roster.find(r=>r.members.name==='死亡者').members.status='dead';roster.find(r=>r.members.name==='死亡者').hp=0;roster.find(r=>r.members.name==='灰の者').members.status='ash';roster.find(r=>r.members.name==='灰の者').hp=0;s.reserve=roster.filter(r=>!s.members.some(m=>m.id===r.members.id));let before=JSON.stringify(s.members.map(m=>m.id));partyUI();$('#tavernopen').onclick()`);
assert.equal(g.run("$('#taverndialog').open"),true);
assert.equal(g.run("$('#tavernslots').innerHTML.includes('死亡者（死亡）')"),true);
assert.equal(g.run("$('#tavernslots').innerHTML.includes('灰の者（灰）')"),true);
assert.equal(g.run("$('#tavernslots').innerHTML.includes('value=\"3\"')&&$('#tavernslots').innerHTML.includes('disabled>死亡者')"),true);
assert.equal(g.run("$('#tavernslots').innerHTML.includes('disabled>灰の者')"),true);
g.run(`tavernOrder[3]=3;setTownPartyFromRoster(tavernRoster,tavernOrder)`);
assert.equal(g.run("JSON.stringify(s.members.map(m=>m.id))"),g.run('before'),'tampered save cannot add dead member');
assert.equal(g.run("$('#taverndialog').open"),true,'rejected save leaves tavern open');
assert.equal(g.run("$('#townnotice').textContent"),'死亡したメンバーは加入できません。');
assert.equal(g.run("$('#tavernnotice').textContent"),'死亡したメンバーは加入できません。','new impaired member is rejected in the tavern');
g.run(`s.members[0].status='dead';setTownPartyFromRoster(tavernRoster,[0,1,2,-1,-1,-1])`);
assert.equal(g.run("$('#tavernnotice').textContent"),'死亡したメンバーを外してください。','already-enrolled impaired member gets a separate message');
assert.equal(g.run("JSON.stringify(s.members.map(m=>m.id))"),g.run('before'),'kept enrolled impaired member blocks the save');
assert.equal(g.run("setTownPartyFromRoster(tavernRoster,[-1,1,2,-1,-1,-1])"),true,'removing the enrolled impaired member lets the save pass');
assert.equal(g.run("s.members.length"),2);assert.equal(g.run("$('#tavernnotice').textContent"),'');assert.equal(g.run("$('#townnotice').textContent"),'');
g.run(`s.reserve.find(r=>r.members.status==='dead'&&r.members.id===JSON.parse(before)[0]).members.status='ok';tavernRoster=[...partyRecords(),...s.reserve];var back=tavernRoster.findIndex(r=>r.members.id===JSON.parse(before)[0]);if(!setTownPartyFromRoster(tavernRoster,[back,0,1,-1,-1,-1]))throw Error('restore failed');tavernRoster=[...partyRecords(),...s.reserve]`);
assert.equal(g.run('setTownPartyFromRoster(tavernRoster,[0,1,2,4])'),false,'ash member also rejected by tavern roster setter');
assert.equal(g.run("JSON.stringify(s.members.map(m=>m.id))"),g.run('before'));
g.run('tavernOrder=[2,1,0,-1,-1,-1];if(!setTownPartyFromRoster(tavernRoster,tavernOrder))throw Error(\'valid reshuffle failed\')');
assert.equal(g.run("s.members.map(m=>m.name).join(',')"),'酒場2,酒場1,酒場0','valid party reorder still works');
console.log('PASS tavern: dead/ash options disabled, tampered save rejected, valid party reorder retained');

// Legacy save loaded in town: carry impaired members, align all parallel arrays, save, and show only temple report.
{
 let base=sixParty();base.run(`s.area='town';s.members[1].status='dead';s.members[1].legacyMark=0;s.hp[1]=0;s.members[4].status='lost';s.hp[4]=0;s.templeReport=[];save()`);
 let loaded=boot(base.saved());
 assert.equal(loaded.run('s.members.length'),4);assert.equal(loaded.run('s.reserve.length'),2);
 assert.equal(loaded.run('PARTY_FIELDS.every(k=>s[k].length===4)'),true);
 assert.equal(loaded.run('[s.commands,s.magicPlans,s.itemPlans,s.attackRows].every(a=>a.length===4)'),true);
 assert.equal(loaded.run("s.reserve.map(r=>r.members.status).join()"),'dead,lost');
 assert.equal(loaded.run("$('#templecarrydialog').open"),true);assert.equal(!!loaded.run("$('#leveldialog').open"),false);
 assert.equal(JSON.parse(loaded.run("localStorage.getItem('ash-v1')")).partyIds.length,4);
 loaded.run("$('#templecarrydialog').close()");assert.equal(!!loaded.run("$('#leveldialog').open"),false,'load carry does not show level report');
 loaded.run("$('#entrance').onclick()");assert.equal(loaded.run("s.area==='dungeon'"),true,'dungeon entry remains available');
 let clean=boot(base.run(`s.members[1].status='ok';s.hp[1]=s.members[1].maxHP;s.members[4].status='ok';s.hp[4]=s.members[4].maxHP;s.templeReport=[];s.area='town';save();localStorage.getItem('ash-v1')`));
 assert.equal(!!clean.run("$('#templecarrydialog').open"),false,'healthy town load has no dialog');
 let dungeon=boot(base.run(`s.area='dungeon';s.templeReport=[];save();localStorage.getItem('ash-v1')`));
 assert.equal(!!dungeon.run("$('#templecarrydialog').open"),false,'dungeon load is unchanged');assert.equal(dungeon.run('s.members.length'),6);
}
console.log('PASS legacy town load carries impaired members, saves aligned party, suppresses level report; healthy and dungeon loads do not carry');

// Wipe (defeat) keeps the corpse flow: nothing is carried to the reserve.
g=sixParty();
g.run(`s.enemy=null;defeat();var corpses=s.corpses.length;`);
g.drain();
assert.equal(g.run('corpses'),1);
assert.equal(g.run('s.corpses.length'),1,'corpse stays in the dungeon');
assert.equal(g.run('s.reserve.length'),0,'wiped members are not carried to the temple');
assert.equal(g.run('(s.templeReport||[]).length'),0);
assert.equal(g.run("!!$('#templecarrydialog').open"),false);
console.log('PASS wipe keeps corpse flow without temple carry');
