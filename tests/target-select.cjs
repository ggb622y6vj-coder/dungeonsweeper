const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');

function fixture(battle = false) {
  const g = game(null, () => .5);
  g.run(`
    [0,2,0,0,0,0].forEach((job,i)=>{const r=generateRecruit('冒険者'+(i+1),job);registerRecruit(r);changeRecruitParty(r.members.id,true)});
    enterDungeon();
  `);
  g.drain();
  g.run(`
    s.hp[2]=1;s.inventory[1]=['healingPotion','antidote'];s.equipped[1]=null;
    s.members[0].status='dead';s.hp[0]=0;
    s.members[3].status='ash';s.hp[3]=0;
    s.members[4].status='lost';s.hp[4]=0;
    s.hp[5]=0;s.members[5].status='dead';
    s.cells.forEach(c=>c.flag=false);resetPartyCommands();
    ${battle ? "s.enemy={units:[{id:'slime',uid:0,row:0,hp:999}],initiative:'party'};" : ''}
    render();
    // Minimal DOM wiring for the existing VM harness; actual DOM, focus and
    // keyboard propagation are covered by target-select-browser.py.
    for(const selector of ['#magicpick','#medicinepick','#commandentry [data-command-choice="spell"]','#commandentry [data-command-choice="item"]'])$(selector).focus=()=>{};
    function cardEvent(i,key){return {type:key?'keydown':'click',key,preventDefault(){},target:{closest:()=>({dataset:{allyTarget:String(i)}})}}}
    function commandEvent(selector,dataset={}){return {target:{closest:q=>q===selector?{dataset}:null}}}
    function startSpell(){openMagic(1);spellSelected='dios';renderMagic();s.enemy?chooseBattleSpell(1,magic('dios')):pickFieldSpell()}
    function startMedicine(){openMedicine(1);$('#medicineitem').value='0';pickMedicineTarget()}
  `);
  return g;
}
function state(g) {
  return g.run('JSON.stringify([s.hp,s.mp,s.inventory,s.commands,s.magicPlans,s.itemPlans,commandIndex,commandConfirmed])');
}

{
  const g = fixture();
  // Positive HP must not make a dead/ash/lost member eligible. A normal
  // member at HP 0 is also invalid; poison/paralysis do not prevent healing.
  g.run("s.hp[0]=s.hp[3]=s.hp[4]=10;s.members[5].status='ok';s.ailments[2]={poison:true,paralysis:4}");
  assert.equal(g.run('JSON.stringify(allyTargetCandidates())'), '[1,2]');
  assert.equal(g.run("JSON.stringify(spellTargets(magic('dios')).map(([i])=>i))"), '[1,2]');
  for (const target of [0, 3, 4, 5, -1, 6, 100, 1.5, '2', null, undefined, NaN]) {
    const literal = target === undefined ? 'undefined' : Number.isNaN(target) ? 'NaN' : JSON.stringify(target);
    assert.equal(g.run(`validMagicTarget(magic('dios'),${literal})`), false);
    const before = state(g);
    assert.equal(g.run(`useMedicine(1,0,${literal})`), false);
    assert.equal(g.run(`castMagic(1,'dios',${literal})`), false);
    assert.equal(state(g), before, 'invalid targets consume neither medicine nor MP');
    g.drain();
  }
}
console.log('PASS ally candidates: shared magic/medicine eligibility, dead/ash/lost and HP0 exclusion, invalid indices, poison/paralysis allowed');

for (const battle of [false, true]) {
  for (const action of ['Spell', 'Medicine']) {
    for (const fallback of [false, true]) {
      const g = fixture(battle);
      const mp = g.run('s.mp[1]');
      g.run(`start${action}()`);
      assert.equal(g.run('!!allyTargetPick'), true);
      const before = state(g);
      g.run("$('#party').onclick(cardEvent(0));render()");
      assert.equal(state(g), before);
      assert.equal(g.run("!!$('#statsdialog').open"), false);
      assert.equal(g.run('!!allyTargetPick'), true, 'rerender retains selection');
      if (!fallback) g.run("$('#party').onkeydown(cardEvent(2,'Enter'))");
      else g.run("$('#party').onkeydown(cardEvent(2,' '))");
      assert.equal(g.run('allyTargetPick'), null);
      assert.equal(g.run("$('#allytargetbar').hidden"), true);
      assert.equal(g.run('pendingSpell'), null);
      if (battle) {
        assert.equal(g.run(`s.${action === 'Spell' ? 'magicPlans' : 'itemPlans'}[1].target`), 2);
        assert.equal(g.run('commandIndex'), 1);
        assert.equal(g.run('commandConfirmed[1]'), true);
        assert.equal(g.run('s.mp[1]'), mp);
        assert.equal(g.run('s.inventory[1].length'), 2);
        assert.equal(g.run('s.hp[2]'), 1);
        g.run("s.commands[2]='guard';confirmCommand(2)");
        assert.equal(g.run("$('#commandreviewpopup').hidden"), false);
      } else {
        assert.equal(g.run('s.hp[2]'), 6);
        assert.equal(g.run('displayVitals.hp[2]'), 1, 'healing remains hidden until its log snapshot');
        assert.equal(g.run('s.mp[1]'), mp - (action === 'Spell' ? 2 : 0));
        assert.equal(g.run('s.inventory[1].length'), action === 'Medicine' ? 1 : 2);
      }
      const after = state(g);
      g.run('pickAllyTarget(2)');
      assert.equal(state(g), after, 'finished picker cannot commit twice');
    }
  }
}
console.log('PASS field/battle magic and medicine: card click/keyboard selection, no dead selection, one commit, log snapshots, command progression/review');

// Invalid cards must not become the logical or DOM cursor; the key handler is
// also guarded in case focus is moved there by the browser before the click.
for (const battle of [false, true]) {
  for (const action of ['Spell', 'Medicine']) {
    const g = fixture(battle);
    g.run(`start${action}()`);
    const before = state(g);
    g.run("$('#party').onclick(cardEvent(0)); partyTargetEvent(cardEvent(0))");
    assert.equal(state(g), before);
    assert.equal(g.run('!!allyTargetPick'), true);
    g.run('cancelAllyTargetPick()');
    assert.equal(state(g), before);
  }
}
console.log('PASS grayed-out card clicks preserve target pick and resources in field/battle spell/medicine');

for (const battle of [false, true]) {
  for (const action of ['Spell', 'Medicine']) {
    const g = fixture(battle), before = state(g);
    g.run(`start${action}();cancelAllyTargetPick()`);
    assert.equal(state(g), before);
    assert.equal(g.run('allyTargetPick'), null);
    assert.equal(g.run('pendingSpell'), null);
    assert.equal(g.run("!!$('#statsdialog').open"), false);
    assert.equal(g.run(`!!$('#${action === 'Spell' ? 'magic' : 'medicine'}dialog').open`), !battle);
    if (action === 'Spell' && !battle) assert.equal(g.run('spellSelected'), 'dios');
    if (action === 'Medicine') assert.equal(g.run("$('#medicineitem').value"), '0');
    if (battle) {
      g.run(`start${action}();$('#commandentry').onclick(commandEvent('#allytargetcancel'))`);
      assert.equal(state(g), before);
      assert.equal(g.run('allyTargetPick'), null);
      assert.equal(g.run('pendingSpell'), null);
    }
  }
}
console.log('PASS cancel/back: no MP, inventory, plans or command changes; dialog choices preserved and stats stay closed');

{
  const g = fixture(true);
  g.run('startSpell();log("再生中");render()');
  const before = state(g);
  g.run("$('#party').onclick(cardEvent(2));$('#commandentry').onclick(commandEvent('[data-spell-target]',{spellTarget:'2'}));cancelAllyTargetPick()");
  assert.equal(state(g), before, 'log playback prevents all selection paths');
  assert.equal(g.run('!!allyTargetPick'), true);
  g.drain();
  g.run("$('#party').onkeydown(cardEvent(2,' '))");
  assert.equal(g.run('s.magicPlans[1].target'), 2);
  g.run("$('#party').onclick()");
  assert.equal(g.run("$('#statsdialog').open"), true);
}
{
  const g = fixture();
  g.run('startSpell()');
  const pos = g.run('s.pos'), dir = g.run('s.dir');
  g.run("move('left');move('forward')");
  assert.equal(g.run('s.pos'), pos);
  assert.equal(g.run('s.dir'), dir);
  assert.equal(g.run('idle()'), false);
  g.run('s.hp[2]=0;pickAllyTarget(2)');
  assert.equal(g.run('!!allyTargetPick'), true, 'eligibility is checked again on commit');
  g.run('cancelAllyTargetPick();log("再生中");pickFieldSpell()');
  assert.equal(g.run('allyTargetPick'), null, 'cannot begin during playback');
}
console.log('PASS logBusy guard, Space selection, ordinary party details restored, movement lock and target revalidation');
