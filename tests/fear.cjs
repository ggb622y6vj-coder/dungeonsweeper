// 037: exercise the real runtime, including on-hit rates and replay snapshots.
const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty, seededRandom } = require('../scripts/sim/combat.cjs');
const json = (g, code) => JSON.parse(g.run(`JSON.stringify(${code})`));
function party(jobs = [2,0,1,0,2,3]) {
  const g = game(null, seededRandom(37));
  createParty(g, jobs);
  g.run(`s.area='dungeon';s.pendingStairs=false;s.pendingBoss=null;
    s.cells.forEach(c=>{c.flag=false;delete c.chest});
    s.members.forEach((m,i)=>{m.level=12;m.maxHP=10000;m.maxMP=1000;m.known=MAGIC.filter(x=>x.job===jobOf(i)).map(x=>x.id)});
    s.hp=s.members.map(m=>m.maxHP);s.mp=s.members.map(m=>m.maxMP);
    s.enemy={dataVersion:1,units:[{...makeEnemy('slime',91),row:17,hp:99999,identified:true}],initiative:'normal',flagEffect:{}};
    s.commands=s.members.map(()=>'guard');s.attackRows=s.members.map(()=>17);`);
  return g;
}

for (const [id,floor,chance] of [['wraith',6,.15],['hellhound',7,.15],['fiendhound',9,.15],['reaper',10,.20]]) {
  const g=party([0]);
  assert.equal(g.run(`enemyDefinition('${id}').floor`),floor);
  assert.deepEqual(json(g,`enemyDefinition('${id}').statuses`),[{type:'fear',chance}]);
  assert.equal(g.run(`libraryMonsterDetails(enemyDefinition('${id}'),{count:1,firstFloor:${floor}}).find(([k])=>k==='特殊能力')[1].children.some((e,i,a)=>e.textContent==='恐怖'&&e.className.includes('ailment-fear')&&a[i+1]?.textContent===\`${chance*100}%\`)`),true);
  // Keep the real death/drain probabilities: restore the target before each hit.
  g.run(`var hits=0;log=()=>{};
    for(let n=0;n<10000;n++){
      s.members[0].status='ok';s.members[0].level=12;s.hp[0]=10000;s.ailments[0]=freshAilments();
      monsterOnHit({id:'${id}'},0);if(s.ailments[0].fear===3)hits++;
    }`);
  const rate=g.run('hits/10000');
  assert(Math.abs(rate-chance)<=.015,`${id}: ${rate}`);
  console.log(`PASS ${id} 10000 hits: ${(rate*100).toFixed(2)}% (${chance*100}% ±1.5%)`);
}
{
  const g=party();
  assert.equal(g.run("ENEMIES.filter(d=>d.statuses.some(a=>a.type==='fear')).length"),4);
  assert.equal(g.run("MAGIC.some(x=>x.effect==='fear')"),false);
  for (const id of ['morlis','mamorlis']) {
    assert.match(g.run(`magic('${id}').description`),/敵を怯えさせ守りを崩す/);
    assert.equal(g.run(`magic('${id}').effect`),'debuff');
  }
  g.run("afflict(0,'fear');afflict(1,'fear')");
  assert.equal(g.run('s.ailments[0].fear'),3);
  assert.equal(g.run('logQueue[0].ailments[1].fear'),0,'later affliction cannot leak into first snapshot');
  assert.equal(g.run('ailmentTags(0)'),'', 'pending fear stays hidden until its log');
  g.drain();assert.match(g.run('ailmentTags(0)'),/ailment-fear[^>]*>恐怖/);
  const ids=g.run('s.members.map(m=>m.id).join()');
  g.run("autoReorderParty('fear')");
  assert.equal(g.run('s.members.map(m=>m.id).join()'),ids);
  assert.equal(g.run('partyIncapacitated(0)'),false);
  assert.equal(g.run('commandMembers().includes(0)'),true);
  assert.equal(g.run('canWeaponAttack(0)'),false);
  g.run('resetCommandEntry();renderCommandEntry()');
  const html=g.run("$('#commandentry').innerHTML");
  assert.match(html,/data-command-choice="fight" disabled title="恐怖で攻撃できない"/);
  for (const command of ['guard','spell','item']) {
    if(command==='item') {g.run("s.inventory[0].push('paralysisCure');renderCommandEntry()");}
    assert.match(g.run("$('#commandentry').innerHTML"),new RegExp(`data-command-choice="${command}"\\s*>`));
  }
  // Reject both a direct fight click and a stale enemy-row selection.
  for(const selector of ['[data-command-choice]','[data-row-choice]']) {
    g.run(`$('#commandentry').onclick({target:{closest:key=>key==='${selector}'?{dataset:{commandChoice:'fight',rowChoice:'17'},disabled:false}:null}})`);
    assert.equal(g.run('s.commands[0]'),'guard');
    assert.equal(g.run('commandIndex'),0);
  }
  g.run("s.commands[0]='fight';Math.random=()=>.999;partyAction(0)");
  assert.equal(g.run('s.enemy.units[0].hp'),99999,'reserved attacks cannot bypass fear');
  assert.equal(g.run('logQueue.at(-1).text'),'sim0は恐怖で攻撃できない。');
  // Fear does not disable defence or its actual half-damage effect.
  g.run("s.commands[0]='guard';partyAction(0);monsterHurt(0,9,s.commands,'敵')");
  assert.equal(g.run('s.hp[0]'),9995);
  g.drain();
  assert.equal(g.run("spellReason(0,magic('dios'))"),'');
  assert.equal(g.run('canChooseMedicine(0)'),true);
  g.run("s.commands[0]='spell';s.magicPlans[0]={id:'dios',target:0};partyAction(0)");
  assert.equal(g.run('s.hp[0]'),10000,'fear allows actual spell execution');
  g.drain();
  g.run('tickAilments(false)');assert.equal(g.run('s.ailments[0].fear'),3);
  for(const remaining of [2,1,0]) {
    g.run("s.commands=s.members.map(()=>'guard');s.enemy.initiative='party';attack()");
    assert.equal(g.run('s.ailments[0].fear'),remaining);g.drain();
  }
  assert(g.run("s.logs.includes('sim0は落ち着きを取り戻した。')"));
  assert.equal(g.run('canWeaponAttack(0)'),true);
  g.run("afflict(0,'fear');tickBattleFear();afflict(0,'fear')");
  assert.equal(g.run('s.ailments[0].fear'),3,'reapplication resets duration');
  g.drain();g.run('save()');
  const loaded=game(g.run("localStorage.getItem('ash-v1')"));
  assert.equal(loaded.run('s.ailments[0].fear'),3,'battle reload preserves fear');
  g.run('s.enemy=null;tickBattleFear();tickAilments(false)');
  assert.equal(g.run('s.ailments[0].fear'),3,'field ticks do not advance combat duration');
}

for(const cure of ['dialko','madi','paralysisCure']) {
  const g=party();
  g.run("s.ailments[0]={poison:true,paralysis:0,sleep:0,silence:0,fear:3};s.hp[0]=10;s.mp[0]=100");
  if(cure==='paralysisCure') {
    g.run("s.inventory[0].push('paralysisCure');s.commands[0]='item';s.itemPlans[0]={id:'paralysisCure',slot:1,target:0};partyAction(0)");
    assert.equal(g.run('s.inventory[0].length'),1);
    assert.equal(g.run('s.mp[0]'),100);
  }else {
    assert.equal(g.run(`castMagic(0,'${cure}',0)`),true,'fear allows self-cure');
    assert.equal(g.run('s.mp[0]'),100-g.run(`magic('${cure}').mp`));
  }
  assert.equal(g.run('s.ailments[0].fear'),0,cure);
  assert.equal(g.run('s.hp[0]'),cure==='madi'?10000:10);
  assert.equal(g.run('s.ailments[0].poison'),cure!=='madi');
}
for(const end of ['win','enemy-flee','escape','defeat','town']) {
  const g=party();g.run('s.ailments.forEach(a=>{a.fear=3;a.silence=3})');
  if(end==='win'||end==='enemy-flee')g.run(`s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true;e.escaped=${end==='enemy-flee'}});finishMonsterBattle()`);
  if(end==='escape')g.run('Math.random=()=>0;flee()');
  if(end==='defeat')g.run('defeat()');
  if(end==='town')g.run('s.enemy=null;enterTown()');
  assert.equal(g.run('s.ailments.every(a=>a.fear===0&&a.silence===0)'),true,end);
  if(end==='defeat')assert.equal(g.run('s.corpses.at(-1).records.every(r=>r.ailments.fear===0)'),true);
  if(end==='town')assert.equal(g.run('s.templeReport.length'),0,'fear never sends members to temple');
}
{
  const g=party();g.run("afflict(0,'fear')");g.drain();
  for(const initiative of ['party','normal']) {
    g.run(`Math.random=()=>.999;s.enemy.initiative='${initiative}';flee()`);
    assert.equal(g.run('s.ailments[0].fear'),initiative==='party'?2:1,'failed escape counts exactly once');g.drain();
  }
  // An enemy action in an opening ambush is not a completed player turn.
  g.run('enemyTurn(s.commands)');assert.equal(g.run('s.ailments[0].fear'),1);
}
{
  const g=party();
  g.run("s.members[1].status='stone';s.members[2].status='dead';s.hp[2]=0;afflict(1,'fear');afflict(2,'fear')");
  assert.equal(g.run('s.ailments[1].fear+s.ailments[2].fear'),0);
  g.run("s.inventory[3].push('shortbow');s.equipped[3]=1");
  assert.equal(g.run('canWeaponAttack(3)'),true,'rear archer can attack before fear');
  g.run("afflict(3,'fear')");
  assert.equal(g.run('canWeaponAttack(3)'),false,'ranged attacks are blocked too');
  g.run("s.ailments[0].fear=3;s.ailments[0].silence=3");
  assert.equal(g.run("castMagic(0,'dialko',0)"),false,'silence still blocks self-cure');
  g.run("s.inventory[0].push('paralysisCure')");
  assert.equal(g.run("useMedicine(0,1,0,true,'paralysisCure')"),true);
  assert.equal(g.run('s.ailments[0].fear+s.ailments[0].silence'),0);
}
console.log('PASS fear duration, cures, battle exits, commands, snapshots, no auto-retreat, save/reload and simultaneous silence');
