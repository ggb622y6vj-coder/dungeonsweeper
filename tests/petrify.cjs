// 033: petrification uses member.status and preserves identity, HP and ash-v1 data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { game } = require('../scripts/sim/harness.cjs');
function party() {
 const g=game(null,()=>.5);
 g.run(`[0,1,2,0,2,3].forEach((job,i)=>{const r=generateRecruit('ABCDEF'[i],job);registerRecruit(r);changeRecruitParty(r.members.id,true)});enterDungeon()`);
 g.drain();
 g.run(`var index=name=>s.members.findIndex(m=>m.name===name);var order=()=>s.members.map(m=>m.name).join('');s.logs=[];`);
 return g;
}
function json(g,expression){return JSON.parse(g.run(`JSON.stringify(${expression})`))}
function battle(g) {
 // Use the data's actual ID, not a fallback definition.
 g.run(`var foe=ENEMIES.find(d=>d.name==='邪眼');s.enemy={dataVersion:1,units:[{id:foe.id,uid:91,row:17,hp:999,identified:true}],initiative:'normal'};s.commands=s.members.map(()=> 'guard');s.attackRows=s.members.map(()=>17)`);
}
function step(g){g.run('clearTimeout(logTimer);logTimer=null;pumpLog()')}
function stone(g,name='B'){g.run(`afflict(index('${name}'),'stone');autoReorderParty('test')`);g.drain()}

// All four CSV-generated definitions; retain the evil eye's existing paralysis.
{
 const g=party();
 for(const [name,chance] of [['ガーゴイル',.05],['石巨人',.08],['邪眼',.1],['地震雲',.05],['サッキュバス',.05]]){
  const d=json(g,`ENEMIES.find(d=>d.name==='${name}')`);
  assert.equal(d.statuses.find(a=>a.type==='stone')?.chance,chance,name);
  assert.equal(g.run(`libraryMonsterDetails(enemyDefinition('${d.id}'),{count:1,firstFloor:${d.floor}}).find(r=>r[0]==='特殊能力')[1].children.some(e=>e.textContent.includes('石化'))`),true);
 }
 assert.equal(g.run("ENEMIES.find(d=>d.name==='邪眼').statuses.find(a=>a.type==='paralysis').chance"),.3);
 assert.equal(g.run("ENEMIES.filter(d=>d.statuses.some(a=>a.type==='stone')).length"),5);
 assert.equal(g.run("enemyDefinition('succubus').summonCap"),3);
 assert.equal(g.run("enemyDefinition('succubus').summon"),.1);
}

// Actual evil-eye physical hit: avoid its spell, hit B, avoid paralysis, apply stone.
{
 const g=party();battle(g);
 g.run(`s.ailments[1]={poison:true,paralysis:0,sleep:2};
  s.magicPlans[4]={id:'madi',target:1};var hpBefore=s.hp[1];
  var rolls=[.9,.2,.999,0,.9,0];Math.random=()=>rolls.shift()??.99;
  enemyTurn(s.commands);`);
 assert.equal(g.run('order()'),'ACDBEF');
 assert.equal(g.run("s.members[index('B')].status"),'stone');
 assert.equal(g.run("s.hp[index('B')]"),g.run('hpBefore-1'));
 assert.deepEqual(json(g,"s.ailments[index('B')]"),{poison:false,paralysis:0,sleep:0,silence:0,fear:0});
 assert.equal(g.run("s.members[s.magicPlans[index('E')].target].name"),'B');
 const logs=json(g,'logQueue.map(e=>e.text)');
 assert.deepEqual(logs.slice(-2),['Bは石になった。','Bが後列に下がった。']);
 assert.equal(g.run("displayVitals.members[1].status"),'ok','future petrification cannot leak into old snapshot');
 step(g);assert.equal(g.run('ailmentLabel(1)'),'毒・睡眠');
 step(g);assert.equal(g.run('ailmentLabel(1)'),'石化');assert.equal(g.run('displayVitals.members[1].name'),'B');
 step(g);assert.equal(g.run('ailmentLabel(3)'),'石化');assert.match(g.run('ailmentTags(3)'),/ailment-stone/);
 g.drain();
 assert.equal(g.run("commandMembers().includes(index('B'))"),false);
 assert.equal(g.run("canChooseMedicine(index('B'))"),false);
 assert.equal(g.run("spellReason(index('B'),magic('halito'))"),'石化');
 const hp=g.run("s.hp[index('B')]");
 g.run("tickAilments();tickAilments(false);afflict(index('B'),'poison');afflict(index('B'),'paralysis')");g.drain();
 assert.equal(g.run("s.hp[index('B')]"),hp);
 assert.deepEqual(json(g,"s.ailments[index('B')]"),{poison:false,paralysis:0,sleep:0,silence:0,fear:0});
 const loaded=game(g.run("save();localStorage.getItem('ash-v1')"));
 assert.equal(loaded.run("s.members.find(m=>m.name==='B').status"),'stone');
 assert.equal(loaded.run("s.hp[s.members.findIndex(m=>m.name==='B')]"),hp);
}
console.log('PASS petrify: actual evil-eye hit, exact logs/retreat, HP and ailments, snapshot order, commands/casters and ash-v1 persistence');

// Both statuses proc on the same hit: stone clears paralysis before the action boundary.
{
 const g=party();battle(g);
 g.run(`var rolls=[.9,.2,.999,0,0,0];Math.random=()=>rolls.shift()??.99;enemyTurn(s.commands)`);
 assert.deepEqual(json(g,'logQueue.map(e=>e.text).slice(-3)'),['Bは麻痺に侵された。','Bは石になった。','Bが後列に下がった。']);
 assert.equal(g.run("s.ailments[index('B')].paralysis"),0);
}

// Hit targeting is recomputed between swings but formation moves only after the monster acts.
{
 const g=party();battle(g);
 g.run(`foe.swings=2;var rolls=[.9,.2,.999,0,.9,0,.2,.999,0,.9,.9,.9,.9,.9];Math.random=()=>rolls.shift()??.99;enemyTurn(s.commands)`);
 const damage=json(g,"logQueue.filter(e=>e.text.includes('ダメージ')).map(e=>e.text)");
 assert.equal(damage.length,2);assert.match(damage[0],/Bに/);assert.match(damage[1],/Cに/);
 assert.equal(g.run("logQueue.filter(e=>e.text==='Bが後列に下がった。').length"),1);
}

// 500 normal and 500 rear attacks, plus one/all spells and breath: no stone target.
for(const rear of [false,true]){
 const g=party();stone(g);battle(g);
 g.run(`Object.assign(foe,{rear:${rear},swings:1,hit:99,attack:[1,1,0],spell:0,statuses:[],death:0,drain:0,steal:0});
  var targets=[],originalHurt=monsterHurt;monsterHurt=(i,...args)=>{targets.push(s.members[i].name);originalHurt(i,...args)};
  var seed=17;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  for(let k=0;k<500;k++){activeMembers().forEach(i=>s.hp[i]=s.members[i].maxHP);enemyTurn(s.commands)};`);
 assert.equal(g.run("targets.includes('B')"),false);
 assert.equal(g.run('targets.length>400'),true);
 if(!rear)assert.equal(g.run("targets.every(n=>'ACD'.includes(n))"),true);
 else assert.equal(g.run("targets.includes('F')"),true);
}
for(const kind of ['one','all','breath']){
 const g=party();stone(g);battle(g);
 g.run(`foe.spell=${kind==='breath'?0:1};foe.spellInfo={name:'検証呪文',target:'${kind}',dice:[1,1,0]};
  foe.breath=${kind==='breath'?"{chance:1,element:'炎',dice:[1,1,0]}":'null'};
  var targets=[],originalHurt=monsterHurt;monsterHurt=(i,...args)=>{targets.push(s.members[i].name);originalHurt(i,...args)};
  Math.random=()=>.5;enemyTurn(s.commands)`);
 assert.equal(g.run("targets.includes('B')"),false);
 assert.equal(g.run('targets.length'),kind==='one'?1:5);
}
// This is target exclusion, not generic immunity in the damage function.
{
 const g=party();stone(g);g.run("var before=s.hp[index('B')];monsterHurt(index('B'),1,s.commands,'検証')");
 assert.equal(g.run("s.hp[index('B')]"),g.run('before-1'));
}
console.log('PASS petrify: multi-swing/normal/rear targeting (1000 attacks), single/all spells and breath exclude stone; damage function stays ordinary');

// Exploration: stone thief cannot open chests, traps exclude stone, ticks can wipe the rest.
{
 const g=party();stone(g,'F');assert.equal(g.run('thiefMember()'),-1);
 stone(g,'C');g.run("s.members[index('C')].known.push('calfo');s.cells[s.pos].chest={opened:false};s.members[index('E')].known=[]");
 assert.equal(g.run('calfoCaster()'),-1);
}
for(const trap of ['needle','blast','poison','paralysis']){
 const g=party();stone(g);const hp=g.run("s.hp[index('B')]");
 const roll={needle:0,blast:.3,poison:.6,paralysis:.8}[trap];
 g.run(`var rolls=[${roll},.6];Math.random=()=>rolls.shift()??0;triggerFloorTrap(s.cells[s.pos]);`);g.drain();
 assert.equal(g.run("s.hp[index('B')]"),hp);
 assert.equal(g.run("s.members[index('B')].status"),'stone');
 assert.equal(g.run("!!s.ailments[index('B')].poison||s.ailments[index('B')].paralysis>0"),false);
}
for(const cause of ['enemy','poison','floor','chest','lastStone']){
 const g=party();stone(g);const hp=g.run("s.hp[index('B')]");
 g.run(`s.members.forEach((m,i)=>{if(!['A','B'].includes(m.name)){m.status='dead';s.hp[i]=0}});s.gold=123;s.hp[index('A')]=1;`);
 if(cause==='enemy'||cause==='lastStone'){
  battle(g);
  if(cause==='lastStone')g.run("s.hp[index('A')]=10;foe.statuses=[{type:'stone',chance:1}]");
  else g.run('foe.statuses=[]');
  g.run("Object.assign(foe,{spell:0,hit:99,attack:[1,1,0]});var rolls=[.9,0,.999,0,0];Math.random=()=>rolls.shift()??.99;enemyTurn(s.commands)");
 }else if(cause==='poison')g.run("s.ailments[index('A')].poison=true;tickAilments(false)");
 else if(cause==='floor')g.run('Math.random=()=>0;triggerFloorTrap(s.cells[s.pos])');
 else g.run("Math.random=()=>0;triggerChestTrap({trap:'needle'})");
 assert.equal(g.run('s.defeatPending'),true,cause);
 assert.equal(g.run('s.corpses.length'),1,cause);
 assert.equal(g.run("s.corpses[0].records.find(r=>r.members.name==='B').members.status"),'stone');
 assert.equal(g.run("s.corpses[0].records.find(r=>r.members.name==='B').hp"),hp);
 assert.equal(g.run('s.corpses[0].gold'),123);
 const loaded=game(g.run("localStorage.getItem('ash-v1')"));
 assert.equal(loaded.run('s.members.length'),0,'reload during defeat retains corpse records');
 assert.equal(loaded.run("s.corpses[0].records.find(r=>r.members.name==='B').members.status"),'stone');
 g.drain();assert.equal(g.run('s.area'),'town');assert.equal(g.run('s.members.length'),0);
 g.run('s.floor=s.corpses[0].floor;recoverCorpses(s.corpses[0].cell)');g.drain();
 assert.equal(g.run('s.corpses.length'),0);
 assert.equal(g.run("s.reserve.find(r=>r.members.name==='B').members.status"),'stone');
 assert.equal(g.run('s.gold'),123);
}
console.log('PASS petrify: exploration/traps, thief/calfo exclusion, five wipe paths, corpse HP/state, pending-defeat reload and recovery');

// Stone remains a living ally target; no spell, including Madi, cures it. Failed cures spend nothing.
for(const combat of [false,true]){
 const g=party();stone(g);if(combat)battle(g);
 g.run(`var caster=index('E'),t=index('B');s.members[caster].known.push('madi','dialko','latumofis');s.mp[caster]=100;
  s.inventory[caster].push('paralysisCure','antidote','healingPotion');`);
 const hp=g.run('s.hp[t]'),ailments=json(g,'s.ailments[t]');
 assert.equal(g.run('validAllyTarget(t)&&allyTargetCandidates().includes(t)&&validMagicTarget(magic("madi"),t)'),true);
 for(const id of ['dialko','latumofis','dios','madi']){
  assert.equal(g.run(`castMagic(caster,'${id}',t)`),false);
  assert.match(g.run('logQueue.at(-1).text'),/ではBの石化を治せない。/);
  assert.equal(g.run("logQueue.some(e=>e.text.includes('石化が解けた'))"),false);
  assert.equal(g.run('displayVitals.members[t].status'),'stone','rejection does not present a cure');
  g.drain();
 }
 for(const id of ['paralysisCure','antidote','healingPotion']){
  assert.equal(g.run(`useMedicine(caster,s.inventory[caster].indexOf('${id}'),t,${combat})`),false);
  assert.match(g.run('logQueue.at(-1).text'),/ではBの石化を治せない。/);g.drain();
  assert.equal(g.run(`s.inventory[caster].includes('${id}')`),true);
 }
 assert.equal(g.run('s.mp[caster]'),100);
 assert.equal(g.run('s.members[t].status'),'stone');
 assert.equal(g.run('s.hp[t]'),hp);
 assert.deepEqual(json(g,'s.ailments[t]'),ailments);
 assert.equal(g.run('order()'),'ACDBEF','rejection does not restore the old formation');
 assert.equal(g.run('commandMembers().includes(t)'),false);
}
// Madi still fully heals a living, non-stone ally and clears ailments without touching MP.
{
 const g=party();
 g.run(`var caster=index('E'),t=index('A');s.members[caster].known.push('madi');s.mp[caster]=100;
  s.hp[t]=3;s.ailments[t]={poison:true,paralysis:4,sleep:2,silence:3,fear:3};`);
 assert.equal(g.run('castMagic(caster,"madi",t)'),true);
 assert.equal(g.run('s.members[t].status'),'ok');
 assert.equal(g.run('s.hp[t]===s.members[t].maxHP'),true);
 assert.equal(g.run('s.mp[caster]'),90);
 assert.deepEqual(json(g,'s.ailments[t]'),{poison:false,paralysis:0,sleep:0,silence:0,fear:0});
 assert.equal(g.run("logQueue.some(e=>e.text.includes('石化が解けた'))"),false);
}
// The active target picker dims and rejects stone for every ally spell, including Madi.
for(const id of ['dios','dialko','madi']){
 const g=party();stone(g);g.run(`s.members[index('E')].known.push('${id}');s.mp[index('E')]=100;s.enemy=null;spellMember=index('E');spellBrowse=false;spellSelected='${id}';pickFieldSpell()`);
 assert.equal(g.run("allyTargetPick.candidates().includes(index('B'))"),true);
 assert.equal(g.run("allyTargetPick.canWork(index('B'))"),false);
 assert.equal(g.run("allyTargetPick.keyboardCandidates().includes(index('B'))"),false);
 assert.equal(g.run("allyTargetPick.canWork(index('A'))"),true);
 assert.equal(g.run("allyTargetPick.keyboardCandidates().includes(index('A'))"),true);
}
for(const id of ['healingPotion','antidote','paralysisCure']){
 const g=party();stone(g);g.run(`s.inventory[index('E')].push('${id}');beginAllyTargetPick({candidates:allyTargetCandidates,keyboardCandidates:()=>allyTargetCandidates().filter(t=>s.members[t].status!=='stone'),canWork:t=>s.members[t].status!=='stone',prompt:'test',onPick:()=>{},onCancel:()=>{}})`);
 assert.equal(g.run("allyTargetPick.canWork(index('B'))"),false);
 assert.equal(g.run("allyTargetPick.keyboardCandidates().includes(index('B'))"),false);
 assert.equal(g.run("allyTargetPick.canWork(index('A'))"),true);
}
// Simultaneously reserved Madi follows the member through auto-retreat, then is refused once they are stone.
{
 const g=party();battle(g);g.run(`s.members[4].known.push('madi');s.mp[4]=100;s.commands[4]='spell';s.magicPlans[4]={id:'madi',target:1};
  var rolls=[.9,.2,.999,0,.9,0];Math.random=()=>rolls.shift()??.99;enemyTurn(s.commands)`);g.drain();
 assert.equal(g.run("s.members[s.magicPlans[index('E')].target].name"),'B','reserved Madi follows B through retreat');
 const hp=g.run("s.hp[index('B')]"),mp=g.run("s.mp[index('E')]");
 g.run('s.enemy.initiative="party";attack()');g.drain();
 assert.equal(g.run("s.members[index('B')].status"),'stone');
 assert.equal(g.run("s.hp[index('B')]"),hp);
 assert.equal(g.run("s.mp[index('E')]"),mp);
 assert.equal(g.run("s.logs.some(t=>t==='真回復ではBの石化を治せない。')"),true);
 assert.equal(g.run("s.logs.some(t=>t.includes('真回復を唱えた')||t.includes('石化が解けた'))"),false);
}
console.log('PASS petrify: field/battle Madi rejects stone, stable reservation after retreat, ineffective spells/medicines with logs and no consumption');

// Town: preserve HP/MP/XP/level, carry to reserve, retain across both load paths.
{
 const g=party();stone(g);g.run("s.hp[index('B')]=3;s.mp[index('B')]=2;s.members[index('B')].xp=650;var before=structuredClone(partyRecords().find(r=>r.members.name==='B'));enterTown()");
 assert.equal(g.run('order()'),'ACDEF');
 assert.deepEqual(json(g,"s.reserve.find(r=>r.members.name==='B').members"),json(g,'before.members'));
 assert.equal(g.run('s.reserve[0].hp'),3);assert.equal(g.run('s.reserve[0].mp'),2);
 assert.match(g.run("$('#templecarrylist').textContent"),/B（石化）.*石化を解除できます/);
 assert.equal(g.run('changeRecruitParty(s.reserve[0].members.id,true)'),false);
 assert.equal(g.run('setTownPartyFromRoster(trainingRoster(),[5])'),false);
 assert.equal(g.run('tavernStatusName(s.reserve[0].members)'),'（石化）');
 g.run(`var createElement=document.createElement;document.createElement=(...args)=>Object.assign(createElement(...args),{dataset:{}})`);
 g.run(fs.readFileSync(path.join(__dirname,'../dist/training.js'),'utf8'));
 g.run('renderTraining()');
 assert.match(g.run("$('#recruitlist').children.at(-1).children[0].textContent"),/B（石化）/);
 assert.deepEqual(JSON.parse(g.run("JSON.stringify($('#recruitlist').children.at(-1).children[3].children.map(b=>b.textContent))")),['転職','名前の変更','登録抹消']);
 assert.equal(g.run("$('#recruitlist').children.at(-1).children[3].children[0].disabled"),true);
 assert.equal(g.run("$('#recruitlist').children.at(-1).children[3].children[1].disabled"),false);
 const loaded=game(g.run("save();localStorage.getItem('ash-v1')"));
 assert.equal(loaded.run("$('#templecarrydialog').open"),true);
 assert.equal(loaded.run('s.reserve[0].members.xp'),650);assert.equal(loaded.run('s.reserve[0].members.status'),'stone');
 const legacy=party();stone(legacy);legacy.run("s.area='town';s.members[index('B')].xp=650;save()");
 const carried=game(legacy.run("localStorage.getItem('ash-v1')"));
 assert.equal(carried.run('s.members.length'),5);assert.equal(carried.run('s.reserve[0].members.status'),'stone');
 assert.equal(carried.run('s.reserve[0].members.xp'),650);assert.equal(carried.run('s.templeReportFromLoad'),true);
 assert.match(carried.run("$('#templecarrylist').textContent"),/B（石化）/);
}

for(const reserve of [false,true])for(const level of [1,2,3,4,5,10,30]){
 const g=party();stone(g);g.run(`s.enemy=null;s.area='town';var id=s.members[index('B')].id;${reserve?'changeRecruitParty(id,false);':''}
  var r=trainingRoster().find(r=>r.members.id===id);r.members.level=${level};r.members.xp=650;
  if(${reserve}){r.hp=3;r.mp=2}else{s.hp[index('B')]=3;s.mp[index('B')]=2}
  var cost=templeCost(r.members);s.gold=cost-1;renderTemple();`);
 const cost=Math.min(150*level,40*level*level);
 assert.equal(g.run('cost'),cost);assert.equal(g.run('templeChance(r.members)'),100);
 assert.equal(g.run("$('#templemembers').children[0].children[2].textContent"),'石化解除');
 assert.equal(g.run("$('#templemembers').children[0].children[2].disabled"),true);
 assert.match(g.run("$('#templemembers').children[0].children[0].children[1].textContent"),/石化.*100%/);
 assert.equal(g.run('templeRaise(id)'),false);
 assert.equal(g.run('r.members.status'),'stone');
 g.run("s.gold=cost;Math.random=()=>{throw Error('stone cure must not roll')};var result=templeRaise(id)");
 assert.equal(g.run('result.success'),true);assert.equal(g.run('s.gold'),0);
 assert.equal(g.run('r.members.status'),'ok');assert.equal(g.run('r.members.level'),level);assert.equal(g.run('r.members.xp'),650);
 assert.equal(g.run(`(${reserve} ? r.hp : s.hp[index('B')])===r.members.maxHP`),true);
 assert.equal(g.run(`(${reserve} ? r.mp : s.mp[index('B')])`),g.run('r.members.maxMP'),'temple stone treatment restores all spell-level MP');
 assert.match(g.run("$('#templenotice').textContent"),/石化が解けた/);
 assert.equal(g.run('templeRaise(id)'),false,'no duplicate charge');
 if(reserve)assert.equal(g.run('changeRecruitParty(id,true)'),true);
 const loaded=game(g.run("save();localStorage.getItem('ash-v1')"));
 assert.equal(loaded.run("s.members.find(m=>m.name==='B').status"),'ok');
 assert.equal(loaded.run("s.mp[ s.members.findIndex(m=>m.name==='B') ]"),loaded.run("s.members.find(m=>m.name==='B').maxMP"),'temple stone treatment MP persists after reload');
}
// XP reward excludes stone without treating paralysis as death.
{
 const g=party();stone(g);g.run("s.ailments[index('C')].paralysis=4;awardVictory({pendingXP:100})");
 assert.equal(g.run("s.members[index('B')].xp"),0);assert.equal(g.run("s.members[index('C')].xp"),20);
}
assert.match(fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8'),/\.ailment-stone\{/);
console.log('PASS petrify: town/load carry, XP/HP/MP preservation, blocked joining, temple fees 1–30, guaranteed cure, rejoining and persistence');
// 049: the real battle Dios path keeps the stone member listed but rejects picking it.
{
 const g=party();battle(g);stone(g);
 const e=g.run("index('E')");g.run(`s.members[${e}].known.push('dios','madi');s.mp[${e}]=100;chooseBattleSpell(${e},magic('dios'))`);
 const b=g.run("index('B')"),before=g.run('JSON.stringify([s.logs.length,s.mp,s.commands])');
 assert.equal(g.run(`allyTargetPick.candidates().includes(${b})`),true);
 assert.equal(g.run(`allyTargetPick.canWork(${b})`),false);
 g.run(`pickAllyTarget(${b})`);
 assert.equal(g.run('JSON.stringify([s.logs.length,s.mp,s.commands])'),before,'stone pick: no message, no MP, no command');
 assert.equal(g.run('!!allyTargetPick'),true,'picker stays open');
 g.run('endAllyTargetPick();pendingSpell=null');
 g.run(`chooseBattleSpell(${e},magic('madi'))`);
 assert.equal(g.run(`allyTargetPick.candidates().includes(${b})`),true);
 assert.equal(g.run(`allyTargetPick.canWork(${b})`),false);
 assert.equal(g.run(`allyTargetPick.keyboardCandidates().includes(${b})`),false);
 const beforeMadi=g.run('JSON.stringify([s.logs.length,s.mp,s.commands,s.magicPlans])');
 g.run(`pickAllyTarget(${b})`);
 assert.equal(g.run('JSON.stringify([s.logs.length,s.mp,s.commands,s.magicPlans])'),beforeMadi,'Madi stone pick: no message, no MP, no plan');
 assert.equal(g.run('!!allyTargetPick'),true,'picker stays open');
 const a=g.run("index('A')");
 assert.equal(g.run(`allyTargetPick.canWork(${a})`),true);
 g.run(`pickAllyTarget(${a})`);
 assert.equal(g.run(`s.magicPlans[${e}]?.id`),'madi');
 assert.equal(g.run(`s.magicPlans[${e}]?.target`),a,'Madi can target a living ally');
}
