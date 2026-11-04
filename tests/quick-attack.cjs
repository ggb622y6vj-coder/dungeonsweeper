// 070: クイック攻撃 / 逃げる only on the first actionable member's action screen.
const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const {createParty}=require('../scripts/sim/combat.cjs');
const g=game(null,()=>.99);createParty(g,[0,1,2,3,0,2]);g.drain();
const J=x=>JSON.parse(g.run(`JSON.stringify(${x})`));
const html=()=>g.run("$('#commandentry').innerHTML");
const hasQuick=()=>html().includes('id="quickattack"'),hasFlee=()=>html().includes('id="flee"');
function setup(extra=''){g.drain();g.run(`s.area='dungeon';s.done=false;s.logs=[];logQueue=[];s.members.forEach(m=>m.status='ok');s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>freshAilments());s.enemy={initiative:'party',boss:false,units:[{id:'slime',uid:1,row:7,hp:9999,rewarded:false},{id:'slime',uid:2,row:23,hp:9999,rewarded:false}]};s.commands=s.members.map(()=>'spell');s.attackRows=s.members.map(()=>null);${extra};resetCommandEntry();render()`)}
const logs=()=>J('s.logs.concat(logQueue.map(x=>x.text))');

// Targeting: front melee + rear ranged fight row 1; rear melee, fear → guard; dead/paralysed untouched.
setup(`s.members[4].job=3;s.inventory[4]=['shortbow'];s.equipped[4]=0;s.ailments[2].fear=2`);
assert.equal(g.run('canWeaponAttack(4)'),true,'rear ranged can attack');assert.equal(g.run('canWeaponAttack(5)'),false,'rear melee cannot');
assert.ok(hasQuick()&&hasFlee(),'first member sees quick attack and flee');
assert.match(html(),/<div class="commandheading">[\s\S]*id="quickattack"[\s\S]*<\/div>/,'quick attack is in the heading row');
assert.ok(!html().includes('全員1列目へ攻撃'),'no quick-attack subtext');
assert.ok(!/id="quickattack"[^>]*data-key-default/.test(html()),'quick attack is not the key default');
g.run(`var realAttack=attack,seen=null;attack=()=>{seen={c:s.commands.slice(),r:s.attackRows.slice(),review:commandIndex};realAttack()};s.hp[1]=0;s.members[1].status='dead';s.ailments[3].paralysis=3;resetCommandEntry();render();quickAttack()`);
assert.equal(J('seen.review'),0,'no review screen before the turn');
assert.deepEqual(J('seen.c.slice(0,6)'),['fight','spell','guard','spell','fight','guard'],'fight/guard by ability; incapacitated untouched');
assert.equal(J('seen.r[0]'),7);assert.equal(J('seen.r[4]'),7);
assert.ok(logs().some(t=>t.includes('ターン開始')),'turn started without review');
assert.ok(g.run('s.enemy.units[0].hp<9999'),'row 1 took damage');assert.equal(g.run('s.enemy.units[1].hp'),9999,'row 2 untouched');

// Original row 1 wiped → next living row is the target.
setup(`s.enemy.units[0].hp=0;s.enemy.units[0].rewarded=true`);g.run('quickAttack()');
assert.deepEqual(J('seen.r.slice(0,3)'),[23,23,23]);assert.ok(g.run('s.enemy.units[1].hp<9999'));

// Only on the first actionable member; member 1 incapacitated → member 2's screen.
setup(`s.ailments[0].paralysis=3`);assert.equal(g.run('commandMembers()[commandIndex]'),1);assert.ok(hasQuick()&&hasFlee());
g.run('confirmCommand(1)');assert.equal(g.run('commandIndex'),1);assert.ok(!hasQuick()&&!hasFlee(),'not on later members');
g.run('for(const i of commandMembers().slice(1))confirmCommand(i)');assert.ok(!hasQuick()&&!hasFlee(),'not on review');
setup();g.run("$('#commandentry').onclick({target:{closest:q=>q==='[data-command-choice]'?{dataset:{commandChoice:'fight'}}:null}})");
assert.equal(g.run('choosingRow'),true);assert.ok(!hasQuick()&&!hasFlee(),'not during row choice');

// Nobody can attack physically → disabled; quickAttack() is a no-op.
setup(`s.ailments.forEach(a=>a.fear=2)`);assert.ok(hasQuick());assert.equal(g.run("$('#quickattack').disabled"),true);assert.equal(g.run("$('#quickattack').title"),'物理攻撃できるメンバーがいない');
g.run('quickAttack()');assert.ok(!logs().some(t=>t.includes('ターン開始')),'disabled quick attack does nothing');
// Boss: quick attack usable, flee disabled.
setup(`s.enemy.boss=true`);assert.equal(g.run("$('#quickattack').disabled"),false);assert.equal(g.run("$('#flee').disabled"),true);assert.equal(g.run("$('#flee').title"),'守護者からは逃げられない');
g.drain();console.log('PASS quick attack: fight/guard split, fear/incapacitated, wiped row 1, first actionable member only, disabled, boss');
