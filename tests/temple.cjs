const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { game } = require('../scripts/sim/harness.cjs');

function fixture(status = 'dead', reserve = false, level = 5) {
  const g = game(null, () => .5);
  g.run(`var recruit=generateRecruit('蘇生([対象',2);registerRecruit(recruit);
    ${reserve ? '' : 'changeRecruitParty(recruit.members.id,true);'}
    var id=recruit.members.id,r=trainingRoster()[0];
    r.members.status='${status}';r.members.level=${level};
    if(s.members.length){s.hp[0]=0;s.mp[0]=2}else{r.hp=0;r.mp=2}
    s.gold=10000;render();`);
  return g;
}
function reload(g) { return game(g.run("localStorage.getItem('ash-v1')")); }

for (const reserve of [false, true]) {
  for (const [status, roll, expected, cost] of [
    ['dead', 0, 'ok', 500], ['dead', .999, 'ash', 500],
    ['ash', 0, 'ok', 1250], ['ash', .999, 'lost', 1250],
  ]) {
    const g = fixture(status, reserve);
    const before = JSON.parse(g.run('JSON.stringify(trainingRoster()[0])'));
    g.run(`Math.random=()=>${roll};var result=templeRaise(id)`);
    assert.equal(g.run('result.status'), expected);
    assert.equal(g.run('result.success'), expected === 'ok');
    assert.equal(g.run('result.cost'), cost);
    assert.equal(g.run('result.id===id'), true);
    assert.equal(g.run('s.gold'), 10000 - cost);
    const after = JSON.parse(g.run('JSON.stringify(trainingRoster()[0])'));
    before.members.status = expected; before.hp = expected === 'ok' ? before.members.maxHP : 0;
    if (expected === 'ok') before.mp = before.members.maxMP;
    assert.deepEqual(after, before, 'only status and HP/MP on success change; XP, equipment and identity stay intact');
    const restored = reload(g);
    assert.equal(restored.run('s.gold'), 10000 - cost);
    // A failed in-party raise leaves an impaired member in the town party; reload carries it to the reserve (029b).
    assert.equal(restored.run('s.members.length'), reserve || expected !== 'ok' ? 0 : 1);
    assert.equal(!!restored.run("$('#templecarrydialog').open"), !reserve && expected !== 'ok');
    assert.deepEqual(JSON.parse(restored.run('JSON.stringify(trainingRoster()[0])')), after);
    assert.match(g.run("$('#templenotice').textContent"), expected === 'ok' ? /蘇生した/ : expected === 'ash' ? /灰になった/ : /ロストした/);
    if (expected === 'ok') {
      if (reserve) restored.run('changeRecruitParty(s.reserve[0].members.id,true)');
      restored.run('enterDungeon()'); restored.drain();
      assert.equal(restored.run('s.area'), 'dungeon');
      assert.equal(restored.run('s.hp[0]'), restored.run('s.members[0].maxHP'));
      assert.equal(restored.run('s.mp[0]'), restored.run('s.members[0].maxMP'));
    }
  }
}
console.log('PASS temple: all four outcomes for party/reserve, fees, full HP/MP, XP preservation, save/reload and dungeon reentry');

for (const [status, level, cost] of [
  ['dead', 1, 25], ['dead', 2, 100], ['dead', 3, 225],
  ['dead', 4, 400], ['dead', 5, 500], ['dead', 15, 1500], ['dead', 30, 3000],
  ['ash', 1, 60], ['ash', 2, 240], ['ash', 3, 540], ['ash', 4, 960],
  ['ash', 5, 1250], ['ash', 17, 4250], ['ash', 30, 7500],
]) {
  const g = fixture(status, false, level);
  assert.equal(g.run('templeCost(s.members[0])'), cost);
}
for (const [vit, deadChance, ashChance] of [
  [0, 50, 40], [3, 59, 49], [10, 80, 70], [13, 89, 79],
  [15, 95, 85], [16, 95, 88], [17, 95, 90], [18, 95, 90],
]) {
  for (const [status, chance] of [['dead', deadChance], ['ash', ashChance]]) {
    const g = fixture(status);
    g.run(`s.members[0].vit=${vit};var cost=templeCost(s.members[0])`);
    assert.equal(g.run('templeChance(s.members[0])'), chance);
    for (const level of [1, 5, 30]) {
      assert.equal(g.run(`templeChance({status:'${status}',vit:${vit},level:${level}})`), chance, 'level does not affect chance');
    }
    g.run(`s.gold=cost;Math.random=()=>${chance}/100;var result=templeRaise(id)`);
    assert.equal(g.run('result.success'), false, 'at threshold fails');
    assert.equal(g.run('s.gold'), 0, 'exact balance is sufficient even on failure');
    g.run(`s.members[0].status='${status}';s.gold=cost;Math.random=()=>(${chance}-.001)/100`);
    assert.equal(g.run('templeRaise(id).success'), true, 'below threshold succeeds');
  }
}
for (const status of ['dead', 'ash']) {
  const g = fixture(status);
  assert.equal(g.run(`templeChance({status:'${status}',level:5})`), status === 'dead' ? 80 : 70, 'missing VIT defaults to 10');
  assert.equal(g.run(`templeChance({status:'${status}',level:5,vit:null})`), status === 'dead' ? 80 : 70, 'null VIT defaults to 10');
  g.run('s.gold=templeCost(s.members[0])-1;Math.random=()=>{throw Error("must not roll")};save()');
  const before = g.run('JSON.stringify(s)');
  assert.equal(g.run('templeRaise(id)'), false);
  assert.equal(g.run('JSON.stringify(s)'), before);
}
console.log('PASS temple formulas, caps, probability boundaries, exact gold and insufficient-gold rejection');

for (const setup of [
  "s.area='dungeon'", "s.enemy={units:[]}", 's.pendingBoss=1', "s.pendingStairs='up'",
  "s.cells[s.pos].chest={opened:false}", "log('表示待ち')",
  "s.members[0].status='ok'", "s.members[0].status='lost'", "id='missing'",
]) {
  const g = fixture();
  g.run(setup);
  g.run('Math.random=()=>{throw Error("must not roll")};save()');
  const before = g.run('JSON.stringify(s)');
  assert.equal(g.run('templeRaise(id)'), false, setup);
  assert.equal(g.run('JSON.stringify(s)'), before, setup);
  if (g.run("s.area!=='town'||!idle()")) {
    g.run("$('#templeopen').onclick()");
    assert.equal(g.run("!!$('#templedialog').open"), false, setup);
  }
}
const retry = fixture();
retry.run('Math.random=()=>.999;templeRaise(id);templeRaise(id)');
assert.equal(retry.run('s.members[0].status'), 'lost');
assert.equal(retry.run('s.gold'), 8250, 'dead fee then ash fee');
assert.equal(retry.run('templeRaise(id)'), false, 'lost cannot be raised again');
const success = fixture();
success.run('Math.random=()=>0;templeRaise(id)');
assert.equal(success.run('templeRaise(id)'), false, 'successful raise cannot be charged twice');
console.log('PASS temple town/idle guards, invalid targets and repeated attempts');

// Capture the temple DOM only, keeping the shared game harness unchanged.
const ui = fixture();
ui.run(`document.createElement=()=>({children:[],attributes:{},setAttribute(k,v){this.attributes[k]=v},append(...nodes){this.children.push(...nodes)}});
  Object.assign($('#templemembers'),{children:[],append(...nodes){this.children.push(...nodes)},replaceChildren(...nodes){this.children=nodes}});
  registerRecruit(generateRecruit('控え',0));s.reserve[0].members.status='ash';s.reserve[0].hp=0;
  registerRecruit(generateRecruit('正常',0));registerRecruit(generateRecruit('ロスト',0));s.reserve[2].members.status='lost';
  s.gold=499;$('#templeopen').onclick();`);
assert.equal(ui.run("$('#templedialog').open"), true);
assert.equal(ui.run("$('#templemembers').children.length"), 2, 'only dead/ash are listed');
assert.equal(ui.run("$('#templemembers').children[0].children[2].disabled"), true);
assert.equal(ui.run("$('#templemembers').children[1].children[2].disabled"), false);
assert.match(ui.run("$('#templemembers').children[0].children[0].children[1].textContent"), /パーティ.*死亡.*86%/);
assert.match(ui.run("$('#templemembers').children[1].children[0].children[1].textContent"), /控え.*灰.*76%/);
assert.equal(ui.run("$('#templemembers').children[0].children[0].children[0].textContent"), '蘇生([対象');
ui.run(`s.gold=1000;renderTemple();var raiseButton=$('#templemembers').children[0].children[2];
  changeRecruitParty(id,false);Math.random=()=>0;raiseButton.onclick();`);
assert.equal(ui.run("s.reserve.find(r=>r.members.id===id).hp"), ui.run("s.reserve.find(r=>r.members.id===id).members.maxHP"), 'button resolves stable ID after benching and restores full HP');
assert.equal(ui.run("s.reserve.find(r=>r.members.id===id).mp"), ui.run("s.reserve.find(r=>r.members.id===id).members.maxMP"), 'reserve MP is restored to maximum');
assert.equal(ui.run("$('#templemembers').children.length"), 1);
assert.equal(ui.run("$('#templegold').textContent"), '金貨 500 G');
assert.match(ui.run("$('#templenotice').textContent"), /蘇生した/);
ui.run("$('#templemembers').children[0].children[2].onclick()");
assert.equal(ui.run("$('#templemembers').children[0].textContent"), '蘇生が必要な冒険者はいません。');
ui.run("$('#templeclose').onclick();$('#templeopen').onclick()");
assert.equal(ui.run("$('#templenotice').textContent"), '');
const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
assert.match(html, /<button id="templeopen">寺院<\/button>/);
assert.match(html, /<dialog id="templedialog" aria-labelledby="templetitle">/);
assert.match(html, /id="templenotice" role="status"/);
console.log('PASS temple UI handlers: active/reserve list, fees/chances, disabled state, stable IDs, notices and empty state');
