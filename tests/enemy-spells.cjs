// 127: use the same encounter, enemy action, save and boot paths as the game.
const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty, seededRandom } = require('../scripts/sim/combat.cjs');

function battle(id = 'mage', count = 1) {
  const g = game(null, seededRandom(127));
  createParty(g, Array(count).fill(0));
  g.run(`s.area='dungeon'; s.hp.fill(1000); s.members.forEach(m=>m.maxHP=1000);
    s.enemy={dataVersion:1, units:[], initiative:'normal', flagEffect:{}};
    function add(id,row,fields={}) {
      const unit=Object.assign(makeEnemy(id,s.enemy.units.length),{row},fields);
      s.enemy.units.push(unit); return unit;
    }
    const caster=add(${JSON.stringify(id)},17);
    initEnemySpellState();
    const levels=groupSpellLevels(caster), cmds=s.members.map(()=>'fight');
    const ids=()=>enemySpellCandidates(caster).map(x=>x.id).sort();
    const cast=()=>monsterAction(caster,cmds);
    const apply=id=>{
      const x=magic(id);
      applyEnemySpell(caster,x,enemySpellTargets(x),cmds,enemyDisplay(caster));
    };
    // Fail on extra draws as well as missing ones.
    function rolls(...values) {
      Math.random=()=>{
        if (!values.length) throw Error('unexpected random draw');
        return values.shift();
      };
      return values;
    }`);
  return g;
}
const read = (g, expression) => JSON.parse(g.run(`JSON.stringify(${expression})`));
const spells = (g, expression) => assert.deepEqual(read(g, 'ids()'), expression.split(' ').filter(Boolean).sort());

{
  const g = battle();
  const assigned = {
    mage:[1,0,50], stone:[1,0,50], shaman:[1,0,50], iron:[1,0,60], watcher:[2,0,30], evileye:[1,0,40],
    sorcerer:[3,0,50], highmage:[5,0,90], necromancer:[5,0,35], darkelf:[5,0,25], vampire:[5,0,20], lesserdemon:[5,0,20],
    deathmage:[7,0,50], demongeneral:[7,0,30], vampirelord:[7,0,15],
    greaterdemon:[8,0,10], lich:[8,0,50], fallenangel:[8,0,15], archmage:[13,0,50], labyrinthlord:[13,0,35],
    darkpriest:[2,2,50], witch:[0,3,50], wraith:[4,0,50],
    stonegiant:[0,4,50], troll:[0,2,40], poltergeist:[0,1,50],
    kitousha:[0,1,70], kitousha2:[0,2,70], kitousha3:[0,3,70]
  };
  const masters = read(g, 'ENEMIES');
  assert.equal(masters.length,114);
  assert.equal(masters.filter(d=>Object.hasOwn(assigned,d.id)).length,29);
  for (const d of masters) {
    const [mage,priest,percent] = assigned[d.id] || [0,0,0];
    assert.deepEqual([d.mageSpellLevel,d.priestSpellLevel,d.spell],[mage,priest,percent/100],d.id);
    assert(!Object.hasOwn(d,'spellInfo'));
  }

  g.run('caster.hp--; caster.poison=true; caster.sleep=1; levels.mage=13');
  spells(g,'halito katino dilto mahalito morlis dalto mamahalito madalto mamorlis tiltowait');
  g.run('levels.mage=0; levels.priest=13');
  spells(g,'dios kalki montino matu dialko dial latumofis dialma lorto madi malikto');
  g.run('levels.mage=3; levels.priest=0');
  spells(g,'halito katino dilto');
  g.run('levels.mage=0; levels.priest=0');
  spells(g,'');
  // Both schools have one high band and a nonempty lower band. Test the
  // exact boundaries and both ends of each within-band uniform choice.
  g.run('levels.mage=7; levels.priest=3; caster.hp=caster.maxHP; delete caster.sleep');
  for (const [draws,id] of [
    [[.499999,.599999,.499999],'morlis'], [[.499999,.599999,.5],'dalto'],
    [[0,.6,0],'halito'], [[0,.6,.25],'katino'], [[0,.6,.5],'dilto'], [[0,.6,.75],'mahalito'],
    [[.5,0,0],'montino'], [[.5,0,.5],'matu'], [[.999999,.6],'kalki']
  ]) {
    assert.deepEqual(read(g,`(()=>{const rest=rolls(${draws});return [chooseEnemySpell(caster).id,rest.length]})()`),[id,0]);
  }
  g.run('levels.priest=0; levels.mage=1');
  assert.equal(g.run('rolls(.5); chooseEnemySpell(caster).id'),'katino');
}
console.log('PASS 127 assignments, allowlist, zero levels, school/band weights and uniform choices');

{
  // Only Montino remains. One resisted cast = one decline roll, independent
  // of its targets. Sleeping/silenced group members count, other rows do not.
  for (let size=1; size<=5; size++) {
    const g=battle('kitousha3',3);
    g.run(`s.enemy.monsterAC=2;
      for (let i=1;i<${size};i++) add('kitousha3',17,{sleep:2,silence:true});
      add('kitousha3',17,{hp:0}); add('kitousha3',17,{escaped:true,rewarded:true});
      add('kitousha3',29);`);
    const name=g.run('enemyDisplay(caster)');
    for (const [draw,decline] of [[1/(size+2),false],[1/(size+2)-1e-10,true]]) {
      g.run(`levels.priest=3; logQueue=[]; var rest=rolls(.25,.99,.99,.99,${draw});`);
      assert.equal(g.run('cast()'),true);
      assert.equal(g.run('rest.length'),0);
      assert.equal(g.run('levels.priest'),decline?1:3);
      const logs=read(g,'logQueue.map(e=>e.text)');
      assert.deepEqual(logs,[name+'は沈黙を唱えた。',...['sim0','sim1','sim2'].map(n=>n+'には効かなかった。'),...(decline?[name+'の魔力が衰えた。']:[])]);
    }
  }
  const ward=battle('kitousha3');
  ward.run(`s.enemy.monsterAC=2; isAntimagicZone=()=>true;
    var rest=rolls(.25,1/3); cast()`);
  assert.deepEqual(read(ward,'[rest.length,levels.priest,logQueue.map(x=>x.text)]'),
    [0,3,['反呪文の結界に打ち消された！']]);
  const g=battle('labyrinthlord');
  g.run(`const original=JSON.stringify(enemyDefinition(caster.id));
    const neighbor=add(caster.id,17), other=add(caster.id,81);
    levels.priest=13; isAntimagicZone=()=>true; Math.random=()=>0;`);
  for (const expected of [9,8,7,5,3,1,0]) {
    // Select the mage school and force decline even if the highest spell would be resisted.
    g.run('logQueue=[]; castEnemySpell(caster,cmds,enemyDisplay(caster))');
    assert.deepEqual(read(g,'[groupSpellLevels(neighbor).mage,levels.priest,groupSpellLevels(other).mage]'),[expected,13,13]);
    assert.deepEqual(read(g,'logQueue.map(x=>x.text)'),['反呪文の結界に打ち消された！',g.run('enemyDisplay(caster)')+'の魔力が衰えた。']);
  }
  for (const expected of [11,9,7,5,3,1,0]) {
    g.run('castEnemySpell(caster,cmds,enemyDisplay(caster))');
    assert.deepEqual(read(g,'[levels.mage,groupSpellLevels(neighbor).priest]'),[0,expected]);
  }
  assert(g.run('JSON.stringify(enemyDefinition(caster.id))===original'));
}
console.log('PASS 127 decline boundaries for 1–5 living units, independent bands/rows, saves against silence and antimagic');

{
  const g=battle('darkpriest');
  g.run(`levels.mage=0; levels.priest=1; s.enemy.monsterAC=2;
    // Its only remaining spell would heal. At full HP the slot becomes one normal attack.
    const turn=()=>enemyAction(caster,new Map(s.members.map((m,i)=>[m.id,cmds[i]])));
    var swings=0; hits=()=>{swings++;return false}; Math.random=()=>.25;`);
  assert.equal(g.run('enemySpellCandidates(caster).length'),0);
  for (const setup of ['','levels.priest=3; caster.silence=true','delete caster.silence; Math.random=()=>.99']) {
    g.run(setup);
    const before=g.run('levels.priest');
    g.run('swings=0; logQueue=[]; turn()');
    assert.equal(g.run('swings'),g.run('enemyDefinition(caster.id).swings'));
    assert.equal(g.run('levels.priest'),before);
    assert(!g.run("logQueue.some(x=>/唱えた|魔力/.test(x.text))"));
  }
  g.run('caster.sleep=2; swings=0; logQueue=[]; Math.random=()=>.5; turn()');
  assert.deepEqual(read(g,'[caster.sleep,swings,levels.priest,logQueue.length]'),[2,0,3,1]);
  g.run('delete caster.sleep; levels.priest=1; Math.random=()=>.05; cast()');
  assert.deepEqual(read(g,'[s.enemy.units.length,s.enemy.units[1].row,groupSpellLevels(s.enemy.units[1]).priest]'),[2,17,1]);
  // Summoned caster uses the depleted school. With two living units, exactly .25 does not deplete it again.
  g.run('s.enemy.monsterAC=0; var rest=rolls(.25,.25); monsterAction(s.enemy.units[1],cmds)');
  assert.deepEqual(read(g,'[rest.length,levels.priest,s.enemy.monsterAC]'),[0,1,1]);
  // A target healed between selection and execution: rebuild, cast once if a buff is available.
  g.run(`const realTargets=enemySpellTargets;
    enemySpellTargets=x=>{if(x.effect==='heal')caster.hp=caster.maxHP;return realTargets(x)};
    s.enemy.monsterAC=0; caster.hp--; logQueue=[]; rest=rolls(.25,0,.99); turn()`);
  assert.deepEqual(read(g,'[rest.length,s.enemy.monsterAC,logQueue.length,swings,caster.hp===caster.maxHP]'),[0,1,2,0,true]);
  g.run('caster.hp--; logQueue=[]; swings=0; Math.random=()=>.25; turn()');
  assert.equal(g.run('swings'),g.run('enemyDefinition(caster.id).swings'));
  assert(!g.run("logQueue.some(x=>/唱えた|魔力/.test(x.text))"));
}
// Breath and flight have priority over the spell slot and leave magic intact.
for (const [id,roll,match] of [['watcher',.1,'ブレス'],['sorcerer',.01,'逃げ出した']]) {
  const g=battle(id);
  g.run(`Math.random=()=>${roll}; var before=JSON.stringify(levels); cast()`);
  assert(g.run('JSON.stringify(levels)===before'));
  assert(g.run(`logQueue[0].text.includes('${match}')`));
}
console.log('PASS 127 empty candidates and stale targets, normal/silent/sleeping actions, summon inherits its row');

{
  const g=battle('lich',6);
  g.run(`s.hp[1]=0; s.members[1].status='dead'; s.members[4].status='stone';
    var target=id=>enemySpellTargets(magic(id));`);
  for (const [roll,index] of [[0,0],[.25,2],[.5,3],[.75,5]]) {
    assert.deepEqual(read(g,`(rolls(${roll}),target('halito'))`),[index]);
  }
  for (const [roll,row] of [[.499999,[0,2]],[.5,[3,5]]]) {
    assert.deepEqual(read(g,`(rolls(${roll}),target('dalto'))`),row);
  }
  for(const id of ['tiltowait','malikto','dilto','morlis','mamorlis']) {
    assert.deepEqual(read(g,`target('${id}')`),[0,2,3,5]);
  }
  g.run('s.hp[0]=s.hp[2]=0; rolls()');
  assert.deepEqual(read(g,"target('katino')"),[3,5]);
  g.run(`levels.priest=3; s.ailments[3].sleep=s.ailments[5].sleep=1;
    s.ailments[3].silence=s.ailments[5].silence=1`);
  assert(!g.run("ids().some(id=>['katino','montino'].includes(id))"));
  g.run('s.ailments[5].sleep=s.ailments[5].silence=0');
  assert(g.run("ids().includes('katino')&&ids().includes('montino')"));
  // Observe dice at the damage entry point for both overrides and unmodified MAGIC spells.
  g.run('var calls=[]; dice=(...args)=>{calls.push(args);return {value:5}}');
  for(const [id,expected] of [['dalto',[5,6,0]],['madalto',[6,8,0]],['tiltowait',[8,8,0]],['mahalito',[4,6]],['lorto',[6,6]]]) {
    g.run(`calls=[]; s.hp[3]=s.hp[5]=1000; apply('${id}')`);
    assert.deepEqual(read(g,'calls'),[expected,expected]);
    assert.deepEqual(read(g,'[s.hp[3],s.hp[5]]'),[995,995]);
  }
}

{
  const g=battle('darkpriest',6);
  g.run(`levels.priest=13; levels.mage=9;
    const a=add('mage',29,{hp:6,maxHP:12}), b=add('mage',29,{hp:12,maxHP:24});
    const c=add('mage',29,{hp:55,maxHP:100});
    const dead=add('mage',99,{hp:0,poison:true,sleep:2}), gone=add('mage',99,{escaped:true,rewarded:true,poison:true});
    const targets=id=>enemySpellTargets(magic(id)).map(u=>u.uid);
    Math.random=()=>.9999;`);
  assert.deepEqual(read(g,"targets('kalki')"),[0,1,2,3]);
  assert.deepEqual(read(g,"targets('dialma')"),[2]);
  g.run("apply('dialma')");
  assert.deepEqual(read(g,'[a.hp,b.hp,c.hp,dead.hp]'),[6,24,55,0]);
  assert(!g.run("ids().includes('dialko')||ids().includes('latumofis')"));
  g.run('a.hp=a.maxHP; c.hp=c.maxHP; a.poison=true; b.fear=b.paralysis=b.sleep=b.silence=1');
  assert.deepEqual(read(g,"targets('dialko')"),[2]);
  assert.deepEqual(read(g,"targets('latumofis')"),[1]);
  assert(!g.run("ids().includes('dios')"));
  assert(g.run("ids().includes('madi')"));
  g.run("b.poison=true; apply('dialko'); apply('latumofis')");
  assert.deepEqual(read(g,"[!!b.fear,!!b.paralysis,!!b.sleep,!!b.silence,!!a.poison,b.poison,dead.poison]"),[false,false,false,false,false,true,true]);
  g.run("b.hp--; b.sleep=b.silence=b.paralysis=b.fear=1; apply('madi')");
  assert.deepEqual(read(g,'[b.hp,!!b.poison,!!b.sleep,!!b.silence,!!b.paralysis,!!b.fear]'),[24,false,false,false,false,false]);
  assert(!g.run("ids().some(id=>['madi','dial','dialko','latumofis'].includes(id))"));
  g.run(`const baseAC=s.members.map((_,i)=>effectiveAC(i)); s.enemy.partyAC=1; s.teppeki=true;
    apply('kalki'); apply('matu'); apply('kalki');
    apply('dilto'); apply('morlis'); apply('dilto');`);
  assert.deepEqual(read(g,'[s.enemy.monsterAC,s.enemy.partyAC,s.enemy.partyACPenalty]'),[2,1,3]);
  assert(!g.run("ids().some(id=>['kalki','matu','dilto','morlis','mamorlis'].includes(id))"));
  assert.deepEqual(read(g,'snapshotVitals().ac'),read(g,'baseAC.map(n=>n+1)'));
  // At a fixed attack roll the same monster changes from hit to miss.
  g.run(`s.members[0].str=10; s.members[0].level=1; caster.acPenalty=0;
    const weaponBonus=equippedWeapon(0).hitBonus||0;
    const threshold=21-enemyDefinition(caster.id).ac-2-weaponBonus;
    Math.random=()=>threshold/20; s.enemy.monsterAC=0;`);
  assert(g.run('physicalAttack(0,caster).hitsCount>0'));
  g.run("apply('matu')");
  assert.equal(g.run('physicalAttack(0,caster).hitsCount'),0);
  // Snapshot of the first party-wide penalty must retain the earlier AC after the next debuff.
  assert.deepEqual(read(g,"logQueue.find(e=>e.text==='パーティーの守りが弱まった。').ac"),read(g,'baseAC'));
}
console.log('PASS 127 target conversion, enemy dice, status filters, healing priority/cap, separate AC strengths and snapshots');

{
  const g=battle('lich');
  g.run(`const second=add('lich',80); groupSpellLevels(second).mage=5;
    levels.mage=0; s.enemy.partyAC=2; caster.hp=4; caster.maxHP=12; save()`);
  const saved=g.run("localStorage.getItem('ash-v1')");
  const loaded=game(saved,seededRandom(127));
  assert.deepEqual(read(loaded,'s.enemy.units.map(e=>groupSpellLevels(e).mage)'),[0,5]);
  assert.deepEqual(read(loaded,'[s.enemy.units[0].hp,s.enemy.units[0].maxHP]'),[4,12]);
  assert.equal(loaded.run("enemySpellCandidates(s.enemy.units[0]).length"),0);
  const legacy=JSON.parse(saved);
  delete legacy.enemy.spellLevels;
  for(const e of legacy.enemy.units)delete e.maxHP;
  const old=game(JSON.stringify(legacy),seededRandom(127));
  assert.deepEqual(read(old,'s.enemy.units.map(e=>groupSpellLevels(e).mage)'),[8,8]);
  assert(old.run('s.enemy.units.every(e=>e.maxHP===e.hp)'));
  assert.equal(old.run("enemySpellTargets(magic('dios')).length"),0);
  assert.equal(old.run('effectiveAC(0)'),old.run('memberClass(0).ac-2'));
  old.run(`groupSpellLevels(s.enemy.units[0]).mage=0; monsterFormation=()=>['lich','lich'];
    rollInitiative=()=>'normal'; encounter(s.pos)`);
  assert.deepEqual(read(old,'enemyGroups().map(row=>groupSpellLevels(row.units[0]).mage)'),[8,8]);
  assert(old.run('s.enemy.units.every(e=>e.maxHP===e.hp && e.hp>0)'));
}
console.log('PASS 127 ash-v1 boot: depleted zero, partial depletion, legacy HP cap, new encounters reset');
