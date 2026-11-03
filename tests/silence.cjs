// 036: real runtime spells/actions through the simulator harness.
const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty, seededRandom } = require('../scripts/sim/combat.cjs');
function party(jobs = [2,0,2,1,0,3]) {
  const g = game(null, seededRandom(36));
  createParty(g, jobs);
  g.run(`s.area='dungeon';s.pendingStairs=false;s.pendingBoss=null;
    s.cells.forEach(c=>{c.flag=false;delete c.chest});
    s.members.forEach((m,i)=>{m.level=8;m.maxHP=10000;m.maxMP=1000;m.known=MAGIC.filter(x=>x.job===jobOf(i)).map(x=>x.id)});
    s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);
    s.enemy={dataVersion:1,units:[{...makeEnemy('darkpriest',91),row:17,hp:99999,identified:true}],initiative:'normal',flagEffect:{}};
    s.commands=s.members.map(()=>'guard');s.attackRows=s.members.map(()=>17);`);
  return g;
}
const json = (g, code) => JSON.parse(g.run(`JSON.stringify(${code})`));

{
 const g=party();
 assert.deepEqual(json(g,"[magic('montino').job,magic('montino').level,magic('montino').mp,magic('montino').where,magic('montino').target]"),[2,3,4,'battle','group']);
 for(const [id,chance] of [['darkpriest',.3],['witch',.25]]) {
  assert.equal(g.run(`enemyDefinition('${id}').spell`),chance);
  assert.deepEqual(json(g,`enemyDefinition('${id}').spellInfo`),{id:'montino',name:'モンティノ',target:'all',dice:null,effect:'silence'});
 }
 assert.equal(g.run("ENEMIES.every(d=>!d.spellInfo||['damage','silence'].includes(d.spellInfo.effect))"),true);
 assert.equal(g.run("ENEMIES.filter(d=>d.spellInfo?.effect==='silence').length"),2);
 assert.equal(g.run("libraryMonsterDetails(enemyDefinition('darkpriest'),{count:1,firstFloor:4}).find(([k])=>k==='使用呪文')[1]"),'モンティノ（沈黙・全体 30%）');
 g.run("afflict(0,'silence')");
 assert.equal(g.run('s.ailments[0].silence'),3);
 assert.equal(g.run("spellReason(0,magic('dios'))"),'沈黙している');
 const mp=g.run('s.mp[0]');
 assert.equal(g.run("castMagic(0,'dialko',0)"),false);
 assert.equal(g.run("castMagic(0,'madi',0)"),false);
 assert.equal(g.run('s.mp[0]'),mp);
 assert.equal(g.run('partyIncapacitated(0)'),false);
 assert.equal(g.run('commandMembers().includes(0)'),true);
 const ids=g.run('s.members.map(m=>m.id).join()');
 g.run("autoReorderParty('silence')");
 assert.equal(g.run('s.members.map(m=>m.id).join()'),ids);
 g.run("s.commands[0]='fight';Math.random=()=>.999;partyAction(0)");
 assert(g.run('s.enemy.units[0].hp')<99999,'silenced member attacks');
 g.drain();g.run('resetCommandEntry();renderCommandEntry()');
 assert.match(g.run("$('#commandentry').innerHTML"),/data-command-choice="spell" disabled title="沈黙している"/);
 assert.equal(g.run('canChooseMedicine(0)'),true);
 // Start-of-turn/field poison ticks must never reduce silence.
 g.run('tickAilments(false)');assert.equal(g.run('s.ailments[0].silence'),3);
 for(const remaining of [2,1,0]) {
  g.run("s.commands=s.members.map(()=>'guard');s.enemy.initiative='party';attack()");
  assert.equal(g.run('s.ailments[0].silence'),remaining);g.drain();
 }
 assert(g.run("s.logs.includes('sim0の沈黙が解けた。')"));
 g.run("afflict(0,'silence');tickBattleSilence();afflict(0,'silence')");
 assert.equal(g.run('s.ailments[0].silence'),3,'reapplication resets to three');
 g.drain();g.run('save()');
 const loaded=game(g.run("localStorage.getItem('ash-v1')"));
 assert.equal(loaded.run('s.ailments[0].silence'),3,'battle reload preserves remaining duration');
}

// 037 adds fear to the cure contract; preserve the existing poison, HP and MP checks.
for(const spell of ['dialko','madi','paralysisCure']) {
 const g=party();
 g.run("s.ailments[1]={poison:true,paralysis:2,sleep:2,silence:3,fear:2};s.hp[1]=10;s.mp[1]=7");
 if(spell==='paralysisCure') {
  g.run("s.inventory[0].push('paralysisCure');s.ailments[0].silence=3");
  assert.equal(g.run("useMedicine(0,1,1,true,'paralysisCure')"),true);
  assert.equal(g.run('s.inventory[0].length'),1);
 }else assert.equal(g.run(`castMagic(0,'${spell}',1)`),true);
 assert.deepEqual(json(g,'[s.ailments[1].paralysis,s.ailments[1].sleep,s.ailments[1].silence]'),[0,0,0]);
 assert.equal(g.run('s.mp[1]'),7);
 assert.equal(g.run('s.hp[1]'),spell==='madi'?10000:10);
 assert.equal(g.run('s.ailments[1].poison'),spell!=='madi');
 assert.equal(g.run('s.ailments[1].fear'),0,'037: Dialko and smelling salts now cure fear too');
}
for(const key of ['silence','sleep']) {
 const g=party();g.run(`s.inventory[0].push('paralysisCure');s.ailments[0].${key}=3`);
 assert.equal(g.run("useMedicine(0,1,0,true,'paralysisCure')"),true,`${key}-only target can use medicine`);
 assert.equal(g.run(`s.ailments[0].${key}`),0);
}

for(const end of ['win','enemy-flee','escape','defeat','town']) {
 const g=party();g.run('s.ailments.forEach(a=>a.silence=3)');
 if(end==='win'||end==='enemy-flee')g.run(`s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=${end==='enemy-flee'}});finishMonsterBattle()`);
 if(end==='escape')g.run('Math.random=()=>0;flee()');
 if(end==='defeat')g.run('defeat()');
 if(end==='town')g.run('s.enemy=null;enterTown()');
 assert.equal(g.run('s.ailments.every(a=>a.silence===0)'),true,end);
 if(end==='defeat')assert.equal(g.run('s.corpses.at(-1).records.every(r=>r.ailments.silence===0)'),true);
 if(end==='town')assert.equal(g.run('s.templeReport.length'),0,'silence never goes to temple');
}
{
 const g=party();g.run("afflict(0,'silence')");g.drain();
 g.run("Math.random=()=>.999;s.enemy.initiative='party';flee()");
 assert.equal(g.run('s.ailments[0].silence'),2,'failed flee consumes one combat turn');
 g.drain();
 g.run("s.enemy.initiative='normal';flee()");
 assert.equal(g.run('s.ailments[0].silence'),1,'normal enemy turn must not double tick');
}

// Independently target each living member; never damage or target stone/dead.
{
 const g=party();
 g.run(`s.members[1].status='stone';s.hp[2]=0;s.members[2].status='dead';
  var rolls=[.25,0,.99,0,.99];Math.random=()=>rolls.shift()??.99;
  monsterAction(s.enemy.units[0],s.commands);`);
 assert.deepEqual(json(g,'s.ailments.map(a=>a.silence)'),[3,0,0,0,3,0]);
 assert.deepEqual(json(g,'s.hp'),[10000,10000,0,10000,10000,10000]);
 assert.equal(g.run("logQueue[0].text"),'闇の司祭はモンティノを唱えた。');
 assert.equal(g.run("logQueue.some(e=>e.text==='sim3には効かなかった。')"),true);
 assert.equal(g.run("logQueue.find(e=>e.text==='sim0は沈黙した。').ailments[4].silence"),0,'later outcomes must not leak');
 assert.equal(g.run("logQueue[0].ailments[0].silence"),0,'cast snapshot precedes affliction');
 assert.equal(g.run("ailmentTags(0)"),'','pending silence not shown early');
 g.drain();assert.match(g.run('ailmentTags(0)'),/ailment-silence/);
}

// 10,000 actual enemy casts at equal levels, with a fixed independent RNG stream.
{
 const g=party([2]);
 g.run(`enemyDefinition('darkpriest').spell=1;enemyDefinition('darkpriest').summon=0;
   var hits=0;log=()=>{};
   for(let n=0;n<10000;n++){s.ailments[0].silence=0;monsterAction(s.enemy.units[0],s.commands);if(s.ailments[0].silence===3)hits++}`);
 const rate=g.run('hits/10000');assert(Math.abs(rate-.5)<=.02,`enemy rate ${rate}`);
 console.log(`PASS enemy Montino 10000 casts: ${(rate*100).toFixed(2)}% (50% ±2%)`);
 for(const [level,roll,expected] of [[30,.049,3],[30,.05,0],[1,.939,3],[1,.94,0]]) {
  g.run(`enemyDefinition('darkpriest').level=${level===1?30:8};s.members[0].level=${level};s.ailments[0].silence=0;Math.random=()=>${roll};monsterAction(s.enemy.units[0],s.commands)`);
  assert.equal(g.run('s.ailments[0].silence'),expected,'enemy chance clamp');
 }
}

// The player's spell rolls per individual, uses stable row keys, and excludes bosses.
{
 const g=party([2]);
 g.run(`var hits=0;log=()=>{};ENEMIES.forEach(d=>{d.priestResist=0});
   for(let n=0;n<10000;n++){s.mp[0]=1000;s.enemy.units[0].silence=false;castMagic(0,'montino',91);if(s.enemy.units[0].silence)hits++}`);
 const rate=g.run('hits/10000');assert(Math.abs(rate-.49)<=.02,`player rate ${rate}`);
 console.log(`PASS player Montino 10000 casts: ${(rate*100).toFixed(2)}% (49% ±2%)`);
 for(const [level,roll,expected] of [[1,0,true],[1,.14,false],[30,.939,true],[30,.94,false]]) {
  g.run(`s.members[0].level=${level};s.mp[0]=1000;s.enemy.units[0].silence=false;Math.random=()=>${roll};castMagic(0,'montino',91)`);
  assert.equal(g.run('s.enemy.units[0].silence'),expected,'player level chance/clamp');
 }
 g.run("s.members[0].level=1;s.enemy.units[0].id='witch';s.enemy.units[0].silence=false;Math.random=()=>0;castMagic(0,'montino',91)");
 assert.equal(g.run('s.enemy.units[0].silence'),false,'player lower clamp is zero');
 g.run(`s.members[0].level=30;
   for(const d of ENEMIES.filter(d=>d.boss))for(let n=0;n<1000;n++){
    s.enemy.units[0].id=d.id;s.enemy.units[0].silence=false;s.mp[0]=1000;
    castMagic(0,'montino',91);if(s.enemy.units[0].silence)throw Error('boss silenced');
   }`);
 g.run(`s.enemy.units=[{id:'slime',uid:1,row:4,hp:0,rewarded:true},{id:'darkpriest',uid:91,row:17,hp:99},
   {id:'darkpriest',uid:92,row:17,hp:99},{id:'witch',uid:93,row:81,hp:99}];
   s.mp[0]=1000;Math.random=()=>0;castMagic(0,'montino',92);`);
 assert.deepEqual(json(g,'s.enemy.units.map(e=>!!e.silence)'),[false,true,true,false]);
}

// Silence only converts the selected spell slot to a physical attack.
{
 const g=party([2]);
 g.run(`s.enemy.units[0].silence=true;var casts=0,physical=0;
   log=t=>{if(t.includes('唱えた'))casts++;};
   for(let n=0;n<10000;n++)if(!monsterAction(s.enemy.units[0],s.commands))physical++;`);
 assert.equal(g.run('casts'),0);assert(g.run('physical')>0);
 g.run("s.enemy.units=s.enemy.units.slice(0,1);Math.random=()=>.25;var lines=[];log=t=>lines.push(t);enemyTurn(s.commands)");
 assert(g.run("lines.some(t=>t.includes('攻撃')||t.includes('ダメージ'))"),'spell slot executes physical action');
 for(const [id,roll,word] of [['darkpriest',0,'仲間を呼んだ'],['dragon',.1,'ブレス'],['scout',0,'逃げ出した']]) {
  g.run(`s.enemy={units:[{...makeEnemy('${id}',91),row:17,silence:true}],flagEffect:{}};Math.random=()=>${roll};lines=[];monsterAction(s.enemy.units[0],s.commands)`);
  assert(g.run(`lines.some(t=>t.includes('${word}'))`),`${id}: silence must preserve ${word}`);
 }
}
console.log('PASS silence duration, turn boundaries, cures, battle exits, save, command/attack/medicine, snapshots, no auto-retreat, probabilities, boss immunity, stable rows and 10000 silenced enemy actions');
