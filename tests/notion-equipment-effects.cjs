// 102: deterministic regression tests of the six equipment mechanics.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {game}=require('../scripts/sim/harness.cjs');
const {seededRandom}=require('../scripts/sim/combat.cjs');
let cases=0;
function test(name,fn){fn();cases++;console.log('PASS 102 '+name)}
const read=(g,expr)=>JSON.parse(g.run(`JSON.stringify(${expr})`));
function setup(weapon='sword',armor=null){
 const g=game(null,seededRandom(102));
 g.run(`for(const job of [0,1,2]){const r=generateRecruit('冒険者'+job,job);registerRecruit(r);changeRecruitParty(r.members.id,true)}enterDungeon()`);g.drain();
 g.run(`s.size=8;s.pos=27;s.start=0;s.boss=63;s.cells=Array.from({length:64},()=>({trap:false,flag:false,open:true,type:''}));
 s.members.forEach((m,i)=>{m.maxHP=31;m.maxMP=100;m.level=1;m.str=10;m.known=MAGIC.map(x=>x.id);s.hp[i]=31;s.mp[i]=0});
 s.inventory[0]=[${JSON.stringify(weapon)}${armor?','+JSON.stringify(armor):''}];s.equipped[0]=0;s.armor[0]=${armor?`{${armor==='chestsac'?'body':'head'}:1}`:'{}'};
 s.enemy={dataVersion:1,units:[{...makeEnemy('goblin',10),row:71,hp:100}],flagEffect:{counts:{},curses:[],bad:false}};
 s.commands=['fight','guard','guard'];s.attackRows=[71,71,71];Math.random=()=>.99`);
 return g;
}
function attack(g,rolls){if(rolls)g.run(`var rolls=${JSON.stringify(rolls)};Math.random=()=>rolls.shift()??.99`);g.run('partyAction(0)')}
const ids=['poisonsw','poisonsw2','poisonsw3','atkstaff','atkmace','bloodsac','chestsac','helmetsac','headlight'];
test('81 canonical item classes; nine definitions and descriptions in library/inventory',()=>{
 const g=setup();const rows=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../data/notion-items.json')));
 const jobs={'戦士':0,'魔法使い':1,'僧侶':2,'盗賊':3,'侍':4,'君主':5,'忍者':6,'司教':7};
 assert.equal(g.run('WEAPONS.length+MEDICINES.length'),81);
 for(const r of rows){const id=r['userDefined:ID'],w=read(g,`weapon('${id}')`),classes=JSON.parse(r['装備職']).map(j=>jobs[j]);
  assert.deepEqual([...w.classes].sort(),classes.sort(),id);
  for(let job=0;job<8;job++)assert.equal(g.run(`canEquipJob(weapon('${id}'),${job})`),classes.includes(job),id+' job '+job);
  if(!ids.includes(id))continue;
  assert.equal(w.name,r['名前']);assert.equal(w.sell,r['売却額']);assert.equal(w.price,w.sell*2);assert.equal(w.shop,false);assert.equal(w.drop,true);assert.equal(w.chestOnly,true);
  assert.equal(w.minFloor,+/minFloor (\d+)/.exec(r['備考'])[1]);
  assert.equal(w.desc,r['効果'].split('特殊効果:')[1].replace(/<[^>]*>/g,''));
  assert.ok(read(g,`libraryItemDetails(weapon('${id}'))`).some(([k,v])=>k==='追加効果'&&v===w.desc));
  g.run(`s.inventory[0]=['${id}'];renderInventory()`);assert.ok(g.run("$('#inventoryslots').innerHTML").includes(w.desc));
  g.run(`s.floor=10`);assert.ok(g.run(`chestItemPool(10).some(x=>x.item.id==='${id}')`));
 }
});
for(const [id,chance] of [['poisonsw',.10],['poisonsw2',.15],['poisonsw3',.20]])test(id+' hit/proc boundary, miss, immunity, no stacking',()=>{
 for(const [roll,expected] of [[chance-.001,true],[chance,false]]){const g=setup(id);attack(g,[.99,.5,.5,roll]);assert.equal(!!g.run('s.enemy.units[0].poison'),expected)}
 const miss=setup(id);attack(miss,[0]);assert.equal(!!miss.run('s.enemy.units[0].poison'),false);
 const immune=setup(id);immune.run("s.enemy.units[0].id=ENEMIES.find(d=>d.resistance.includes('毒無効')).id");attack(immune,[.99,.5,.5,0]);assert.equal(!!immune.run('s.enemy.units[0].poison'),false);
 const same=setup(id);same.run('s.enemy.units[0].poison=true');attack(same,[.99,.5,.5,0]);assert.equal(same.run('s.enemy.units[0].poison'),true);assert.equal(same.run("logQueue.filter(x=>x.text.includes('毒に侵された')).length"),0);
});
test('enemy poison before sleep, lethal reward once and stable row targets',()=>{
 const g=setup();g.run("s.enemy.units[0].poison=true;s.enemy.units[0].sleep=2;enemyAction(s.enemy.units[0],new Map())");
 assert.equal(g.run('s.enemy.units[0].hp'),98);assert.equal(g.run('s.enemy.units[0].sleep'),1);
 assert.match(g.run('logQueue[0].text'),/は毒で2ダメージ。$/);assert.match(g.run('logQueue[1].text'),/は眠っている。$/);
 g.run("s.enemy.units[0].hp=2;s.enemy.units.push({...makeEnemy('goblin',11),row:99,hp:100,sleep:2});var xp=s.members[0].xp;enemyTurn(['guard','guard','guard'])");
 assert.equal(g.run('s.enemy.units[0].hp'),0);assert.equal(g.run('s.enemy.units[0].rewarded'),true);assert.equal(g.run('s.enemy.pendingDrops'),1);
 assert.equal(g.run('s.enemy.pendingXP'),g.run("enemyDefinition('goblin').xp"));assert.deepEqual(read(g,'s.attackRows'),[71,71,71]);
 g.run('killReward(s.enemy.units[0])');assert.equal(g.run('s.enemy.pendingDrops'),1);
 g.run('s.enemy.units[1].poison=true;s.enemy.units[1].hp=1;s.enemy.chestBattle=true;enemyTurn(s.commands)');
 assert.equal(g.run('s.enemy'),null);assert.ok(g.run('s.members[0].xp>xp'));assert.ok(g.run('!!currentChest()'));
});
for(const id of ['atkstaff','atkmace'])test(id+' logged damage MP drain including overkill, capped, misses and zero excluded',()=>{
 const g=setup(id);g.run('s.enemy.units[0].hp=1');attack(g,[.99,.5]);assert.equal(g.run('s.mp[0]'),4);assert.ok(g.run("logQueue.some(x=>x.text.includes('に4ダメージ。'))"));
 const cap=setup(id);cap.run('s.mp[0]=99');attack(cap,[.99,.5]);assert.equal(cap.run('s.mp[0]'),100);
 const miss=setup(id);attack(miss,[0]);assert.equal(miss.run('s.mp[0]'),0);
 const zero=setup(id);zero.run('flagDamage=()=>0');attack(zero,[.99,.5]);assert.equal(zero.run('s.mp[0]'),0);
 const spell=setup(id);spell.run("s.mp[0]=100;castMagic(0,'halito',10)");assert.equal(spell.run('s.mp[0]'),98);
});
test('blood cost uses final flagged cost, rounds up, MP eligibility and both UI costs',()=>{
 const g=setup('bloodsac');g.run("s.enemy.flagEffect={counts:{},curses:['magic'],bad:true};s.mp[0]=4;s.magicPlans[0]={id:'nofice',target:10};s.commands[0]='spell'");
 // nofice 5 -> cursed 8 -> blood 4, not ceil(ceil(5/2)*1.5).
 assert.equal(g.run("spellCost(magic('nofice'))"),8);assert.equal(g.run("spellCost(magic('nofice'),0)"),4);assert.equal(g.run("spellReason(0,magic('nofice'))"),'');
 assert.ok(g.run("magicActions(0)").includes('MP 4 / HP 4'));
 g.run("spellMember=0;spellSchool=1;spellBrowse=false;renderMagic()");assert.ok(g.run("$('#magiclist').innerHTML").includes('MP 4 / HP 4'));
 assert.equal(g.run("castMagic(0,'nofice',10)"),true);assert.equal(g.run('s.mp[0]'),0);assert.equal(g.run('s.hp[0]'),27);
});
test('blood HP insufficiency, no suicide or payment on rejected target',()=>{
 for(const hp of [1,3]){const g=setup('bloodsac');g.run(`s.hp[0]=${hp};s.mp[0]=100`);assert.equal(g.run("spellReason(0,magic('nofice'))"),'HP不足');assert.equal(g.run("castMagic(0,'nofice',10)"),false);assert.equal(g.run('s.hp[0]'),hp);assert.equal(g.run('s.mp[0]'),100)}
 const g=setup('bloodsac');g.run('s.hp[0]=4;s.mp[0]=3');assert.equal(g.run("castMagic(0,'nofice',10)"),true);assert.equal(g.run('s.hp[0]'),1);assert.equal(g.run("s.members[0].status"),'ok');
 const invalid=setup('bloodsac');invalid.run('s.mp[0]=100');assert.equal(invalid.run("castMagic(0,'nofice',999)"),false);assert.equal(invalid.run('s.hp[0]'),31);assert.equal(invalid.run('s.mp[0]'),100);
});
test('blood variable exploration costs, no chest sacrifice on HP payment, medicines excluded',()=>{
 const g=setup('bloodsac','chestsac');g.run('s.enemy=null;s.mp[0]=100;s.hp[0]=11;s.dumapicUses=2');
 assert.equal(g.run("spellCost(magic('dumapic'),0)"),4);g.run("castMagic(0,'dumapic',null)");assert.equal(g.run('s.mp[0]'),96);assert.equal(g.run('s.hp[0]'),7);assert.ok(g.run("s.inventory[0].includes('chestsac')"));
 assert.equal(g.run("spellCost(magic('dumapic'),0)"),8);
 g.run("s.floodUses=1");assert.equal(g.run("spellCost(magic('floodfill'),0)"),4);
 g.drain();g.run("s.inventory[0].push('healingPotion');Math.random=()=>0;useMedicine(0,2,0)");assert.equal(g.run('s.mp[0]'),96);assert.equal(g.run('s.hp[0]'),8);
});
test('chest threshold, ceil recovery, unequip/removal and shifted slots/plans',()=>{
 const g=setup('sword','chestsac');g.run("s.inventory[0]=['chestsac','sword','helm','healingPotion'];s.equipped[0]=1;s.armor[0]={body:0,head:2};s.itemPlans[0]={slot:3,id:'healingPotion',target:0};monsterHurt(0,20,s.commands,'敵')");
 assert.equal(g.run('s.hp[0]'),11);assert.ok(g.run("s.inventory[0].includes('chestsac')"));g.run("monsterHurt(0,1,s.commands,'敵')");
 assert.equal(g.run('s.hp[0]'),16);assert.deepEqual(read(g,'s.inventory[0]'),['sword','helm','healingPotion']);assert.deepEqual(read(g,'s.armor[0]'),{head:1});assert.equal(g.run('s.equipped[0]'),0);assert.equal(g.run('s.itemPlans[0].slot'),2);
 const logs=read(g,'logQueue');assert.equal(logs.at(-2).hp[0],10);assert.equal(logs.at(-1).hp[0],16);
 g.run("monsterHurt(0,7,s.commands,'敵')");assert.equal(g.run('s.hp[0]'),9);
 g.drain();g.run('save()');const loaded=game(g.run("localStorage.getItem('ash-v1')"));assert.deepEqual(read(loaded,'s.inventory[0]'),['sword','helm','healingPotion']);assert.deepEqual(read(loaded,'s.armor[0]'),{head:1});
});
test('chest does not prevent death, unequipped armor has no effect',()=>{
 const dead=setup('sword','chestsac');dead.run("monsterHurt(0,31,s.commands,'敵')");assert.equal(dead.run('s.hp[0]'),0);assert.ok(dead.run("s.inventory[0].includes('chestsac')"));assert.equal(dead.run('s.members[0].status'),'dead');
 const bag=setup('sword','chestsac');bag.run("s.armor[0]={};monsterHurt(0,22,s.commands,'敵')");assert.equal(bag.run('s.hp[0]'),9);assert.ok(bag.run("s.inventory[0].includes('chestsac')"));
});
for(const route of ['physical','breath','spell','needle','blast','chestTrap','poison'])test('chest reacts through '+route,()=>{
 const g=setup('sword','chestsac');g.run("s.hp[0]=11;enemyDefinition('goblin').flee=0;enemyDefinition('goblin').summon=0");
 const calls={physical:"enemyDefinition('goblin').attack=[1,1,0];enemyDefinition('goblin').swings=1;hits=()=>true;Math.random=()=>0;enemyAction(s.enemy.units[0],new Map())",breath:"enemyDefinition('goblin').breath={chance:1,element:'炎',dice:[1,1,0]};Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands)",spell:"enemyDefinition('goblin').spell=1;enemyDefinition('goblin').spellInfo={id:'halito',target:'all',dice:[1,1,0]};Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands)",needle:"s.enemy=null;Math.random=()=>0;triggerFloorTrap(s.cells[s.pos])",blast:"s.enemy=null;var rolls=[.3,0,0,0];Math.random=()=>rolls.shift()??0;triggerFloorTrap(s.cells[s.pos])",chestTrap:"s.enemy=null;Math.random=()=>0;triggerChestTrap({trap:'needle'})",poison:"s.ailments[0].poison=true;tickAilments()"};
 g.run(calls[route]);assert.equal(g.run('s.hp[0]'),16,route);assert.ok(!g.run("s.inventory[0].includes('chestsac')"));
});
for(const ailment of ['poison','paralysis','stone','silence','fear'])test('helmet intercepts '+ailment+'; repeat status preserves armor',()=>{
 const g=setup('sword','helmetsac');g.run(`afflict(0,'${ailment}')`);assert.equal(g.run('s.members[0].status'),'ok');assert.ok(!g.run(`s.ailments[0]['${ailment}']`));assert.deepEqual(read(g,'s.inventory[0]'),['sword']);assert.deepEqual(read(g,'s.armor[0]'),{});
 const repeat=setup('sword','helmetsac');repeat.run(ailment==='stone'?"s.members[0].status='stone'":`s.ailments[0]['${ailment}']=${ailment==='poison'?'true':'1'}`);repeat.run(`afflict(0,'${ailment}')`);assert.ok(repeat.run("s.inventory[0].includes('helmetsac')"));
 if(['silence','fear'].includes(ailment))assert.equal(repeat.run(`s.ailments[0]['${ailment}']`),3);
});
test('helmet enemy sleep spell path and already-asleep refresh',()=>{
 const g=setup('sword','helmetsac');g.run("enemyDefinition('goblin').flee=0;enemyDefinition('goblin').summon=0;enemyDefinition('goblin').spell=1;enemyDefinition('goblin').spellInfo={id:'katino',effect:'sleep',target:'all',dice:null};Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands)");
 assert.equal(g.run('s.ailments[0].sleep'),0);assert.equal(g.run('s.ailments[1].sleep'),2);assert.ok(!g.run("s.inventory[0].includes('helmetsac')"));
 g.run("s.inventory[0].push('helmetsac');s.armor[0].head=1;s.ailments[0].sleep=1;monsterAction(s.enemy.units[0],s.commands)");assert.equal(g.run('s.ailments[0].sleep'),2);assert.ok(g.run("s.inventory[0].includes('helmetsac')"));
});
test('headlight reveals only adjacent safe cells, preserves chest/flags; no events, no duplicate effects',()=>{
 const g=setup('sword','headlight');g.run("s.enemy=null;s.cells.forEach(c=>c.open=false);var near=around(s.pos);s.cells[near[0]].trap=true;s.cells[near[1]].chest={gold:10,opened:false};s.cells[near[2]].type='boss';s.cells[near[3]].flag='power';s.inventory[1].push('headlight');s.armor[1].head=s.inventory[1].length-1;var before=JSON.stringify(s);revealHeadlight()");
 assert.equal(g.run('around(s.pos).filter(j=>s.cells[j].open).length'),7);assert.equal(g.run('s.cells[0].open'),false);assert.equal(g.run('s.cells[near[0]].open'),false);assert.equal(g.run('s.cells[near[1]].chest.opened'),false);assert.equal(g.run('s.cells[near[3]].flag'),'power');assert.equal(g.run('s.pendingBoss'),null);assert.equal(g.run('s.enemy'),null);
 const before=JSON.parse(g.run('before')),after=read(g,'s');after.cells=before.cells;assert.deepEqual(after,before,'cell state only');const board=read(g,'s.cells');g.run('revealHeadlight()');assert.deepEqual(read(g,'s.cells'),board);
});
for(const disabled of ['unequipped','dead','stone'])test('headlight disabled when '+disabled,()=>{
 const g=setup('sword','headlight');g.run("s.cells.forEach(c=>c.open=false)");g.run(disabled==='unequipped'?'s.armor[0]={}':disabled==='dead'?"s.hp[0]=0;s.members[0].status='dead'":"s.members[0].status='stone'");g.run('revealHeadlight()');assert.equal(g.run('s.cells.some(c=>c.open)'),false);
});
for(const route of ['entry','stairs','elevator','pitfall'])test('headlight at final '+route+' arrival, persisted by rememberFloor',()=>{
 const g=setup('sword','headlight');g.run('s.enemy=null');
 if(route==='entry')g.run("s.area='town';s.start=27;s.cells.forEach(c=>c.open=false);enterDungeon()");
 if(route==='stairs')g.run("s.guardiansDefeated=[1];s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2)");
 if(route==='elevator')g.run('s.elevatorFloors=[1,2];travelElevator(2)');
 if(route==='pitfall')g.run('descendPitfall()');
 assert.equal(g.run('around(s.pos).every(j=>s.cells[j].trap||s.cells[j].open)'),true);
 assert.equal(g.run('s.enemy'),null);assert.equal(g.run('s.pendingBoss'),null);assert.equal(g.run('s.pendingStairs'),false);
 if(route==='stairs'||route==='entry')assert.equal(g.run('s.pos===s.start'),true);
 if(route==='elevator')assert.equal(g.run('s.cells[s.pos].type'),'elevator');
 if(route==='pitfall')assert.equal(g.run('s.pos===s.previousPos'),true);
 g.run('rememberFloor()');assert.deepEqual(read(g,'s.floors[s.floor].cells'),read(g,'s.cells'));
});
test('chest ignores zero damage and triggers immediately between repeated hits',()=>{
 const g=setup('sword','chestsac');g.run("s.hp[0]=10;monsterHurt(0,0,s.commands,'敵')");assert.equal(g.run('s.hp[0]'),10);assert.ok(g.run("s.inventory[0].includes('chestsac')"));
 g.run("monsterHurt(0,1,s.commands,'敵');monsterHurt(0,12,s.commands,'敵')");assert.equal(g.run('s.hp[0]'),4);assert.ok(!g.run("s.inventory[0].includes('chestsac')"));
});
test('new equipment appears in chests but never in shop or direct enemy drops',()=>{
 const g=setup();g.run("s.area='town';s.gold=9999;s.inventory[0]=['sword'];renderShop()");
 for(const id of ids){assert.ok(!g.run("$('#shopitems').innerHTML").includes('data-buy="'+id+'"'));g.run(`buy('${id}',0)`)}
 assert.deepEqual(read(g,'s.inventory[0]'),['sword']);assert.equal(g.run('s.gold'),9999);
 g.run("s.area='dungeon';s.floor=10;Math.random=()=>0;var directPool;weightedLoot=pool=>{directPool=pool.map(x=>x.item.id);return pool[0].item};dropWeapon()");
 for(const id of ids)assert.ok(!read(g,'directPool').includes(id));
});
for(const route of ['stairs','elevator','pitfall'])test('headlight on saved '+route+' arrival, no premature opening around start',()=>{
 const g=setup('sword','headlight');
 g.run("s.enemy=null;s.elevatorFloors=[1,2];fresh(2);s.cells.forEach(c=>c.open=false);rememberFloor();var savedFloors=s.floors;fresh(1);s.floors=savedFloors;s.relic=true;s.guardiansDefeated=[1];s.cells[s.boss].type='down';s.pos=s.boss");g.drain();
 if(route==='stairs')g.run('travelFloor(2)');
 if(route==='elevator')g.run('travelElevator(2)');
 if(route==='pitfall')g.run('descendPitfall()');
 const vicinity=read(g,'around(s.pos)');
 assert.equal(g.run('s.floor'),2);assert.ok(g.run('around(s.pos).every(j=>s.cells[j].trap||s.cells[j].open)'));
 const opened=read(g,'s.cells.flatMap((c,j)=>c.open?[j]:[])');assert.ok(opened.every(j=>j===g.run('s.pos')||vicinity.includes(j)));
 assert.equal(g.run('s.pendingBoss'),null);assert.equal(g.run('s.enemy'),null);
});
console.log(`PASS 102 equipment: ${cases} cases`);
