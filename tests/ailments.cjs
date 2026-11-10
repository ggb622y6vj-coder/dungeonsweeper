const assert = require('node:assert/strict');
const { game } = require('../scripts/sim/harness.cjs');
const expected = { poison: false, paralysis: 0, sleep: 0, silence: 0, fear: 0 };
const g = game(null, () => .5);
const json = expression => JSON.parse(g.run(`JSON.stringify(${expression})`));
const ailments = () => json('s.ailments');

assert.deepEqual(ailments(), []);
g.run("var r=generateRecruit('A',0);registerRecruit(r);changeRecruitParty(r.members.id,true)");
assert.deepEqual(ailments()[0], expected, 'new recruit has the complete shape');
g.run("s.reserve=[structuredClone(trainingRoster()[0])];s.reserve[0].ailments={poison:true,paralysis:2};ensureProfile()");
assert.deepEqual(json('s.reserve[0].ailments'), { ...expected, poison: true, paralysis: 2 }, 'reserve records are normalized');
g.run("s.ailments[0]={poison:true,paralysis:2};afflict(0,'xxx')");
assert.deepEqual(ailments()[0], { poison: true, paralysis: 2 }, 'unknown type leaves ailments unchanged');
assert.equal(g.run("consoleWarnings=0;console.warn=()=>consoleWarnings++;afflict(0,'xxx');consoleWarnings"), 1);
g.run("afflict(0,'stone')");
assert.deepEqual(ailments()[0], expected, 'stone clears existing ailments and uses the complete shape');

const legacy = JSON.parse(g.run('localStorage.getItem(\'ash-v1\')'));
legacy.area = 'town';
legacy.roster[0].ailments = { poison: true, paralysis: 1 };
const loaded = game(JSON.stringify(legacy));
assert.deepEqual(jsonLoaded(loaded, 's.ailments[0]'), { ...expected, poison: true, paralysis: 1 }, 'legacy party ailments are completed during load');
assert.equal(jsonLoaded(loaded, 's.reserve.length'), 0, 'single member is restored to party');
assert.equal(loaded.run("JSON.parse(localStorage.getItem('ash-v1')).roster.every(r=>Object.keys(r.ailments).sort().join(',')==='fear,paralysis,poison,silence,sleep')"), true);
console.log('PASS fresh ailments, legacy load completion, reserve migration, unknown affliction no-op and warning');
function jsonLoaded(target, expression) { return JSON.parse(target.run(`JSON.stringify(${expression})`)); }


// 097: elapsed ticks and real movement never cure paralysis; existing cures remain.
{
 const g=game(null,()=>.99);
 g.run(`
  [0,2].forEach((job,i)=>{const r=generateRecruit(['Target','Healer'][i],job);registerRecruit(r);changeRecruitParty(r.members.id,true)});
  enterDungeon();
 `);
 g.drain();
 g.run("afflict(0,'paralysis')");
 assert.equal(g.run('s.ailments[0].paralysis'),4,'affliction retains its saved numeric value');
 g.drain();
 for(let n=0;n<8;n++) {
  g.run('tickAilments()');
  assert.equal(g.run('s.ailments[0].paralysis'),4,'repeated ticks leave paralysis unchanged');
 }
 g.run("s.cells.forEach(c=>{c.type='';c.trap=false;c.flag=false;c.open=true;delete c.chest});s.pos=0;s.logs=[]");
 for(let n=0;n<8;n++) {
  const destination=n%2===0?1:0;
  g.run(`cell(${destination})`);
  assert.equal(g.run('s.pos'),destination,'movement really occurs');
  assert.equal(g.run('s.ailments[0].paralysis'),4,'movement ticks leave paralysis unchanged');
  g.drain();
 }
 assert.equal(g.run("s.logs.some(text=>text.includes('麻痺が解けた'))"),false,'no natural recovery log');
 g.run("s.members[1].known.push('dialko')");
 assert.equal(g.run("castMagic(1,'dialko',0)"),true,'field Dialko succeeds');
 assert.equal(g.run('s.ailments[0].paralysis'),0,'Dialko cures persistent paralysis');
 g.drain();
 g.run("afflict(0,'paralysis')");
 assert.equal(g.run('s.ailments[0].paralysis'),4);
 g.drain();
 g.run('enterTown()');
 assert.equal(g.run('s.area'),'town','return really occurs');
 assert.deepEqual(jsonLoaded(g,'s.ailments[0]'),expected,'town return clears paralysis');
}
loaded.run('tickAilments(false)');
assert.equal(loaded.run('s.ailments[0].paralysis'),1,'loaded legacy paralysis does not expire');
console.log('PASS persistent paralysis across repeated ticks, movement and legacy load; Dialko and town return cure it');
