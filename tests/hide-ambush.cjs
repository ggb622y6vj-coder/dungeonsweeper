// 124: exercise command entry, the mixed turn order, log snapshots and reload.
const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty } = require('../scripts/sim/combat.cjs');

function battle(jobs = [3], rows = [71]) {
  const g = game(null, () => .5);
  createParty(g, jobs.map(job => job > 3 ? 3 : job));
  g.drain();
  g.run(`s.area='dungeon';
    s.members.forEach((m,i)=>{
      m.job=${JSON.stringify(jobs)}[i];m.id='p'+i;m.maxHP=100;s.hp[i]=100;m.str=12;
    });
    s.enemy={initiative:'normal',units:${JSON.stringify(rows)}.map((row,uid)=>
      ({id:'slime',uid,row,hp:1000,identified:true}))};
    resetPartyCommands();render();`);
  return g;
}
const read = (g, expression) => JSON.parse(g.run(`JSON.stringify(${expression})`));
const logs = g => read(g, 'logQueue.map(entry=>entry.text)');
const choice = (g, command) => click(g, 'command-choice', { commandChoice: command });
function click(g, attribute, dataset = {}) {
  g.run(`$('#commandentry').onclick({target:{closest:q=>q==='[data-${attribute}]'?{dataset:${JSON.stringify(dataset)}}:null}})`);
}
const button = (g, command) => g.run(`!$('#commandentry').hidden&&$('#commandentry').innerHTML.includes('data-command-choice="${command}"')`);

// (a) Check every current job in both ranks, including transferred characters.
for (const index of [0, 3]) {
  const g = battle([0, 0, 0, 0]);
  for (let job = 0; job < 8; job++) {
    g.run(`s.members[${index}].job=${job};commandIndex=${index};render()`);
    assert.equal(button(g, 'hide'), [3, 6].includes(job));
    assert.equal(button(g, 'ambush'), false);
  }
  for (const status of ['fear', 'sleep', 'paralysis', 'stone', 'dead']) {
    g.run(`s.members[${index}].job=3`);
    if (['stone', 'dead'].includes(status)) g.run(`s.members[${index}].status='${status}'`);
    else g.run(`s.ailments[${index}].${status}=2`);
    assert.equal(g.run(`canUseStealth(${index})`), false);
    g.run(`s.members[${index}].status='ok';s.ailments[${index}]=freshAilments()`);
  }
  g.run('s.enemy=null;render()');
  assert.equal(button(g, 'hide'), false);
}
console.log('PASS 124a hide eligibility by current job, rank, incapacitation and combat');

for (const roll of [.899999, .9]) {
  const g = battle([6]);
  g.run("s.floor=4;s.pos=27;s.ailments[0].silence=3;s.enemy.initiative='party';render()");
  assert.equal(g.run('isAntimagicZone()'), true);
  choice(g, 'hide');
  assert(!g.run('isHidden(0)'));
  assert(!g.run("$('#party').innerHTML.includes('潜伏')"));
  g.run(`var rolls=[.5,.5,${roll}];Math.random=()=>{assertRoll();return rolls.shift()};
    function assertRoll(){if(!rolls.length)throw Error('extra roll')};attack()`);
  assert.equal(g.run('rolls.length'), 0);
  assert.equal(g.run('s.enemy.units[0].hp'), 1000);
  assert.equal(g.run('s.hp[0]'), 100);
  const success = roll < .9;
  assert.deepEqual(logs(g), ['── ターン開始 ──', success ? 'sim0は身を隠した。' : 'sim0は身を隠せなかった。']);
  assert.deepEqual(read(g,'[displayVitals.hiddenIds,logQueue[0].hiddenIds,logQueue[1].hiddenIds]'),
    [[], [], success ? ['p0'] : []]);
  g.drain();
  assert.equal(button(g, 'ambush'), success);
  assert.equal(button(g, 'hide'), !success);
  if (success) {
    choice(g, 'ambush');
    assert.equal(g.run('commandIndex'), 1, 'one reachable row auto-confirms');
    g.run('Math.random=()=>.99;attack()');
    assert(g.run('s.enemy.units[0].hp<1000'), 'ambush works while silenced in antimagic');
  }
}
{
  const g = battle([3, 0], [71, 23]);
  // Two enemy turns bracket the thief. Choose the first eligible target both times.
  g.run(`s.commands=['hide','guard'];s.members[0].agi=10;
    var rolls=[.4,.9,0,.8];Math.random=()=>rolls.length?rolls.shift():0;attack()`);
  assert.deepEqual(logs(g).filter(t => t.includes('かわした') || t.includes('隠した')), [
    'sim0はスライムの攻撃をかわした。','sim0は身を隠した。','sim1はスライムの攻撃をかわした。',
  ]);
  const opening = battle([3]);
  opening.run("s.commands=['hide'];s.cells[s.pos].type='';Math.random=()=>0;encounter(s.pos)");
  assert(logs(opening).includes('敵の奇襲！'));
  assert(!logs(opening).some(t => /身を隠|の奇襲。/.test(t)));
  assert(!opening.run('isHidden(0)'));
}
console.log('PASS 124b 90% boundary, one action, surprise, AGI targeting before/after hide, log snapshots and silence/antimagic');

for (const i of [0, 3]) for (const ranged of [false, true]) {
  const rows = [71, 23, 9, 4], g = battle([3, 0, 0, 3], rows);
  if (ranged) g.run(`s.inventory[${i}]=['shortbow']`);
  g.run(`s.enemy.hiddenIds=['p${i}'];commandIndex=${i};render()`);
  assert.equal(button(g, 'fight'), i === 0 || ranged);
  assert.deepEqual(read(g,`reachableEnemyGroups(${i}).map(g=>g.key)`), ranged ? rows : rows.slice(0,i===0?2:0));
  choice(g, 'ambush');
  const expected = ranged ? rows : rows.slice(0, i === 0 ? 3 : 2);
  assert.deepEqual(read(g,`rowChoiceGroups(${i}).map(g=>g.key)`), expected);
  for (const key of expected) {
    g.run(`s.enemy.hiddenIds=['p${i}'];s.commands[${i}]='ambush';s.attackRows[${i}]=${key};
      Math.random=()=>.99;partyAction(${i})`);
    assert(g.run(`s.enemy.units.find(e=>e.row===${key}).hp<1000`));
    assert(!g.run(`isHidden(${i})`));
  }
}
console.log('PASS 124c front/rear melee and bow reach in selection and execution, stable enemy row keys');

function strike(weapon, ambush, rolls, maxMP = 50) {
  const g = battle([6]);
  g.run(`s.members[0].level=8;s.members[0].maxMP=${maxMP};s.mp[0]=0;
    s.inventory[0]=[${JSON.stringify(weapon)}];s.enemy.hiddenIds=['p0'];
    s.enemy.flagEffect={counts:{power:10},curses:[],bad:false};
    s.commands[0]='${ambush?'ambush':'fight'}';
    var rolls=${JSON.stringify(rolls)};
    Math.random=()=>{if(!rolls.length)throw Error('extra attack/effect roll');return rolls.shift()};
    partyAction(0)`);
  assert.equal(g.run('rolls.length'), 0);
  assert(!g.run('isHidden(0)'));
  return g;
}
for (const ambush of [false, true]) {
  // Two 2d4 hits at 2 each, one power flag proc and one poison check.
  const g = strike('unid:poisonsw', ambush, [.99,0,0, .99,0,0, 0,0]);
  const damage = ambush ? 12 : 6;
  assert.equal(g.run('s.enemy.units[0].hp'), 1000-damage);
  assert(g.run('s.enemy.units[0].poison'));
  assert.deepEqual(logs(g), ['怪力の旗がはためいた！',`sim0の${ambush?'奇襲':'攻撃'}。スライムに${damage}ダメージ。`,'スライムは毒に侵された。']);
}
for (const cap of [3, 50]) {
  const g = strike('atkstaff', true, [.99,0, .99,0, 0], cap);
  assert.equal(g.run('s.mp[0]'), Math.min(6,cap));
}
{
  const miss = strike('unid-bound:cursedDagger', true, [0,0]);
  assert.deepEqual(logs(miss), ['sim0の奇襲はスライムにかわされた。']);
  assert.equal(miss.run('s.enemy.units[0].hp'), 1000);
  const hit = strike('unid-bound:cursedDagger', true, [.99,.99, .99,.99, .99]);
  assert.deepEqual(logs(hit), ['sim0の奇襲。スライムに16ダメージ。']);
  assert.equal(hit.run('s.inventory[0][0]'), 'unid-bound:cursedDagger');
}
console.log('PASS 124d confirmed damage doubled once, unchanged swings/hits/flag/poison, MP drain cap and unidentified bound weapon');

{
  const g = battle([3,6,3,0]);
  g.run(`s.enemy.hiddenIds=['p0','p1','p2'];Math.random=()=>0;
    enemyAction(s.enemy.units[0],new Map())`);
  assert.deepEqual(logs(g), ['スライムにsim0の潜伏が見破られた。','sim0はスライムの攻撃をかわした。']);
  assert.deepEqual(read(g,'s.enemy.hiddenIds'), ['p1','p2']);
  // A rear-capable enemy can already reach sim3, so it need not discover anyone.
  g.run(`enemyDefinition('slime').rear=true;s.enemy.hiddenIds.push('p0');enemyAction(s.enemy.units[0],new Map())`);
  assert.equal(logs(g).at(-1), 'sim3はスライムの攻撃をかわした。');
}
{
  const g = battle([3,0]);
  g.run(`s.enemy.hiddenIds=['p0'];Math.random=()=>0;var cmds=['fight','fight'];
    monsterAction({id:'firefly'},cmds);
    enemyDefinition('slime').spell=1;enemyDefinition('slime').mageSpellLevel=1;monsterAction(s.enemy.units[0],cmds);
    afflict(0,'poison');afflict(0,'silence');tickAilments()`);
  assert.deepEqual(read(g,'s.hp'), [95,98]); // breath 2 each, single spell 1, poison 2
  assert(g.run('isHidden(0)'));
  for (const status of ['paralysis','fear','stone']) {
    g.run(`s.enemy.hiddenIds=['p0'];afflict(0,'${status}')`);
    assert(!g.run('isHidden(0)'), status);
    g.run("s.members[0].status='ok';s.ailments[0]=freshAilments()");
  }
  g.run(`s.enemy.hiddenIds=['p0'];groupSpellLevels(s.enemy.units[0]).mage=1;Math.random=()=>.75;
    monsterAction(s.enemy.units[0],cmds)`);
  assert(g.run('!isHidden(0)&&s.ailments[0].sleep>0'));
  g.run("s.enemy.hiddenIds=['p0'];monsterHurt(0,100,cmds,'敵')");
  assert(g.run("!isHidden(0)&&s.members[0].status==='dead'"));
}
console.log('PASS 124e discovery in the original physical pool, rear reach, spells, breath, poison and incapacitation');

for (const [i,row,canReach] of [[0,23,true],[0,9,false],[3,71,false]]) {
  const g = battle([3,6,3,3],[71,23,9]);
  // Only the reserved actor is eligible for this swing; allow a rear strike in the rear case.
  g.run(`s.enemy.hiddenIds=['p0','p1','p2','p3'];s.commands[${i}]='ambush';s.attackRows[${i}]=${row};
    enemyDefinition('slime').rear=${i===3};Math.random=()=>${i===3?.99:0};
    enemyAction(s.enemy.units[0],new Map());Math.random=()=>.99;partyAction(${i})`);
  const lines = logs(g);
  assert(lines[0].includes(`sim${i}の潜伏が見破られた`));
  assert.equal(lines.at(-2), `sim${i}の奇襲に失敗した。`);
  if (canReach) {
    assert.equal(lines.at(-1), 'sim0の攻撃。スライムに5ダメージ。');
    assert.equal(g.run('s.enemy.units[1].hp'), 995);
  } else {
    assert.equal(lines.at(-1), `sim${i}の奇襲は届かなかった。`);
    assert(g.run('s.enemy.units.every(e=>e.hp===1000)'));
  }
}
{
  const g = battle([0,0,0,3], [71,23,9,4]);
  g.run(`s.enemy.hiddenIds=['p3'];s.inventory[3]=['shortbow'];s.commands[3]='ambush';s.attackRows[3]=9;
    s.hp[0]=0;markDeaths();autoReorderParty('test');s.inventory[2]=['dagger'];Math.random=()=>.99;partyAction(2)`);
  assert(g.run("s.members[2].id==='p3'&&s.enemy.units[2].hp<1000"));
  g.run(`s.enemy.hiddenIds=['p3'];s.enemy.units[2].hp=0;s.enemy.units[2].rewarded=true;partyAction(2)`);
  assert(g.run('s.enemy.units[0].hp<1000&&s.enemy.units[1].hp===1000'));
  g.run(`s.enemy.hiddenIds=['p3'];s.enemy.units.forEach(e=>{e.hp=0;e.rewarded=true});partyAction(2)`);
  assert.equal(logs(g).at(-1), 'sim3の奇襲は届かなかった。');
}
{
  const g = battle([0,0,0,6], [71,23,9]);
  g.run("s.enemy.hiddenIds=['p3'];s.inventory[3]=['shortbow'];commandIndex=3;render()");
  choice(g,'ambush');click(g,'row-choice',{rowChoice:'9'});
  g.run("s.inventory[3]=['dagger'];partyAction(3)");
  assert.equal(logs(g).at(-1),'sim3の奇襲は届かなかった。');
  assert(g.run('!isHidden(3)&&s.enemy.units.every(e=>e.hp===1000)'));
}
{
  const g = battle([6]);
  g.run("s.enemy.hiddenIds=['p0'];render()");
  choice(g,'ambush');
  g.run("s.members[0].job=0;Math.random=()=>.99;partyAction(0)");
  assert.deepEqual(logs(g), ['sim0の奇襲に失敗した。','sim0の攻撃。スライムに5ダメージ。']);
}
for (const command of ['hide','ambush']) {
  const g=battle([3]);
  g.run(`s.commands[0]='${command}';if(s.commands[0]==='ambush')s.enemy.hiddenIds=['p0'];
    afflict(0,'paralysis');Math.random=()=>{throw Error('incapacitated actor rolled')};partyAction(0)`);
  assert(g.run('!isHidden(0)&&s.enemy.units[0].hp===1000'));
}
{
  const g=battle([3,0]);
  g.run(`s.enemy.hiddenIds=['p0'];s.members[0].agi=3;render()`);
  choice(g,'guard');
  assert(g.run('isHidden(0)'));
  click(g,'command-back');
  assert(g.run('isHidden(0)'));
  choice(g,'guard');choice(g,'guard');
  g.run('Math.random=()=>0;attack()');
  assert.deepEqual(read(g,'logQueue[0].hiddenIds'), []);
  assert(logs(g).includes('sim0はスライムの攻撃をかわした。'));
  assert(!logs(g).some(t=>t.includes('見破られた')));
}
for(const command of ['fight','spell','item','dispel']){
  const g=battle([3,0]);
  g.run(`s.enemy.hiddenIds=['p0'];s.commands[0]='${command}';
    s.members[0].known=['halito'];s.mp[0]=10;s.magicPlans[0]={id:'halito',target:0};
    s.inventory[0].push('healingPotion');s.hp[0]=30;s.itemPlans[0]={id:'healingPotion',slot:1,target:0};
    Math.random=()=>.99;partyAction(0)`);
  assert(!g.run('isHidden(0)'), command);
}
console.log('PASS 124f discovery fallback, out-of-range misses, reordered party, vanished row, incapacitation, other actions and turn-start guard');

async function persistence() {
  const g = battle([3,6,0], [71,23]);
  choice(g,'hide');choice(g,'hide');choice(g,'guard');
  g.run("s.enemy.initiative='party';Math.random=()=>.5;attack()");
  // The saved result is authoritative even during playback, before either tag is visible.
  const load = data => game(JSON.stringify(data), () => { throw Error('reload must not reroll hiding'); });
  const afterTurn = JSON.parse(g.run("localStorage.getItem('ash-v1')"));
  assert.deepEqual(read(load(afterTurn),'s.enemy.hiddenIds.slice().sort()'), ['p0','p1']);
  g.drain();
  choice(g,'ambush');click(g,'row-choice',{rowChoice:'23'});
  const partial = JSON.parse(g.run("localStorage.getItem('ash-v1')"));
  assert.equal(load(partial).run('commandIndex'), 1);
  choice(g,'guard');choice(g,'guard');
  const envelope = read(g,'saveExportEnvelope()');
  assert.deepEqual(envelope.data,JSON.parse(g.run("localStorage.getItem('ash-v1')")));

  const town = game(null,()=>.5);
  await town.run(`importSaveFile({size:10000,text:async()=>${JSON.stringify(JSON.stringify(envelope))}})`);
  assert(town.run("$('#importdialog').open"));
  town.run('var reloaded=false,location={reload(){reloaded=true}};confirmSaveImport()');
  assert(town.run('reloaded'));
  const loaded=load(JSON.parse(town.run("localStorage.getItem('ash-v1')")));
  assert.deepEqual(read(loaded,'[commandIndex,commandConfirmed,s.commands,s.attackRows[0]]'),
    [3,[true,true,true],['ambush','guard','guard'],'23']);
  assert.deepEqual(read(loaded,'s.enemy.hiddenIds.slice().sort()'), ['p0','p1']);
  assert(loaded.run("$('#commandreviewpopup').innerHTML.includes('奇襲 → 2列')"));
  loaded.run('Math.random=()=>.99;attack()');
  assert(loaded.run('s.enemy.units[1].hp===990&&s.enemy.units[0].hp===1000'));
  assert.deepEqual(read(loaded,'s.enemy.hiddenIds'), []);

  for (const bad of [undefined,{},'p0',['missing','p2'],['p1','p1','missing']]) {
    const old = structuredClone(envelope.data);
    old.enemy.hiddenIds=bad;
    assert.deepEqual(read(load(old),'s.enemy.hiddenIds'), Array.isArray(bad)&&bad.includes('p1')?['p1']:[]);
  }
  for (const change of [{area:'town'}, {enemy:null}]) {
    const outside = load({...envelope.data,...change});
    assert(!outside.run('isHidden(0)||isHidden(1)'));
  }

  for (const outcome of ['victory','retreat','escape','failed escape','defeat','new encounter']) {
    const b = battle([3,6]);
    b.run("s.enemy.hiddenIds=['p0','p1'];Math.random=()=>.99");
    if (outcome==='defeat') {
      b.run('s.hp.fill(0);defeat()');
      assert(!b.run("JSON.stringify(s.corpses).includes('hiddenIds')"));
      b.drain();
      assert.equal(b.run('s.area'), 'town');
    } else if (outcome==='failed escape') {
      b.run('flee()');
      assert(b.run('s.enemy&&logQueue.some(e=>e.text==="逃走に失敗！")'));
      assert(!logs(b).some(t=>t.includes('見破られた')));
    } else if (outcome==='escape') {
      b.run('Math.random=()=>0;flee()');
      assert.equal(b.run('s.enemy'),null);
      b.drain();b.run('enterTown()');
      assert.equal(b.run('s.area'), 'town');
    } else if (outcome==='new encounter') {
      b.run("s.cells[s.pos].type='';encounter(s.pos)");
      assert(b.run('s.enemy.units.length>0'));
    } else {
      b.run(`var unit=s.enemy.units[0];unit.hp=0;unit.rewarded=true;unit.escaped=${outcome==='retreat'};finishMonsterBattle()`);
      assert.equal(b.run('s.enemy'),null);
    }
    assert(!b.run('isHidden(0)||isHidden(1)'),outcome);
  }
  console.log('PASS 124g independent hidden members, ash-v1 and JSON round trips, command review, old/invalid saves and battle exits');
}
persistence().catch(error=>{console.error(error);process.exitCode=1});
