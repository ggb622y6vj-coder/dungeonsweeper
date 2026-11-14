const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const read=(g,code)=>JSON.parse(g.run(`JSON.stringify(${code})`));
// Independent oracle: do not reuse the production multiplier in expectations.
const scale=level=>level<=8?1:Math.min(6,Math.pow(1.2,level-8));
const allMembers='[...s.members,...s.reserve.map(r=>r.members),...s.corpses.flatMap(c=>c.records.map(r=>r.members))]';
let g=game(null,()=>.5);
assert.equal(g.run('LEVEL_CAP'),30);
let previous=1;
for(let level=2;level<=30;level++){
 const actual=g.run(`xpCurveScale(${level})`);
 assert.equal(actual,scale(level));
 assert(actual>=previous,'multiplier must be nondecreasing');previous=actual;
 if(level<=8)assert.equal(actual,1);
 if(level>=18)assert.equal(actual,6);
}
assert.equal(g.run('xpCurveScale(9)'),1.2);
assert(Math.abs(g.run('xpCurveScale(13)')-2.48832)<1e-12);
assert(Math.abs(g.run('xpCurveScale(17)')-5.159780352)<1e-12);

const factors=[.8,1.2,1,.85,1.4,1.5,1.45,1.6];
assert.deepEqual(read(g,'CLASSES.map(c=>c.xpFactor)'),factors);
for(let job=0;job<factors.length;job++){
 // Cover both ends, the midpoint, and values where rounding order matters.
 for(const roll of [0,.123456,.5,.876543,1-Number.EPSILON]){
  g.run(`Math.random=()=>${roll}`);
  const targets=read(g,`generateClassXP(${job})`);
  assert.equal(targets.length,31);assert.deepEqual(targets.slice(0,2),[0,0]);
  for(let level=2;level<=30;level++){
   const base=115*(level-1)*factors[job],delta=targets[level]-targets[level-1];
   assert(delta>=Math.round(base*.9*scale(level))&&delta<=Math.round(base*1.1*scale(level)),`job ${job}, level ${level}: theoretical bounds`);
   assert.equal(delta,Math.round(base*(.9+roll*.2)*scale(level)),`job ${job}, level ${level}: scale before rounding`);
  }
  if(job<4){
   const member=read(g,`generateRecruit('生成',${job}).members`);
   assert.equal(member.xpCurveVersion,3);assert.deepEqual(member.xpTargets,targets);
  }
 }
}
console.log('PASS 112 XP multiplier: Lv8/9/13/17/18 boundaries, cap, monotonicity, all 8 classes and new recruits');

// Differing old increments catch accidental use of already-migrated targets.
const oldTargets=[0,0];
for(let level=2;level<=30;level++)oldTargets[level]=oldTargets[level-1]+Math.round((83+17*level)*1.15);
function migrated(member){
 const expected=structuredClone(member),old=member.xpTargets;
 for(let level=member.level+1;level<=30;level++)expected.xpTargets[level]=expected.xpTargets[level-1]+Math.round((old[level]-old[level-1])*scale(level));
 expected.xpCurveVersion=3;return expected;
}
for(const version of [undefined,1,2]){
 const members=[1,8,12,17,18,30].map((level,job)=>({job,level,xp:oldTargets[level]+37,xpTargets:oldTargets.slice(),...(version===undefined?{}:{xpCurveVersion:version})}));
 g=game(null,()=>.5);
 g.run(`s.members=${JSON.stringify(members)};Math.random=()=>{throw Error('migration must not reroll')};ensureProgression()`);
 const actual=read(g,'s.members');
 assert.deepEqual(actual,members.map(migrated));
 for(let i=0;i<members.length;i++){
  assert.deepEqual(actual[i].xpTargets.slice(0,members[i].level+1),members[i].xpTargets.slice(0,members[i].level+1));
  assert.equal(actual[i].xp,members[i].xp);assert.equal(actual[i].level,members[i].level);
 }
 assert.equal(actual[2].xpTargets[13]-actual[2].xpTargets[12],Math.round((oldTargets[13]-oldTargets[12])*Math.pow(1.2,5)));
 for(let level=18;level<=30;level++)assert.equal(actual[2].xpTargets[level]-actual[2].xpTargets[level-1],(oldTargets[level]-oldTargets[level-1])*6);
 g.run('ensureProgression()');assert.deepEqual(read(g,'s.members'),actual);
}
console.log('PASS 112 migration: missing/v1/v2 versions, saved v2 increments, reached targets/XP/level preserved, Lv13 and Lv18 cap, idempotence');

function rosterFixture(){
 const h=game(null,()=>.5);
 h.run(`for(const job of [3,1,2,0,1,2]){
  const record=generateRecruit('記録'+trainingRoster().length,job);registerRecruit(record);
  if(s.members.length<2)changeRecruitParty(record.members.id,true);
 }
 s.corpses=[{id:'corpse-a',floor:1,cell:2,gold:7,records:[s.reserve.pop()]},{id:'corpse-b',floor:2,cell:3,gold:9,records:[s.reserve.pop()]}];
 for(const m of ${allMembers}){m.level=12;m.xp=9876;m.xpTargets=${JSON.stringify(oldTargets)};m.xpCurveVersion=2;}
 // Supply learned spells so unrelated legacy spell grants do not alter this fixture.
 for(const m of ${allMembers})m.known=MAGIC.filter(x=>x.job===m.job&&x.level<=m.level&&x.guaranteed).map(x=>x.id);
 for(const c of s.corpses)for(const r of c.records){r.members.status='dead';r.hp=0;}
 ensureMagic();`);
 return h;
}
// Both legacy parallel arrays and current roster saves use the real load path.
for(const format of ['s','rosterSaveState()']){
 g=rosterFixture();
 const expected=read(g,allMembers).map(migrated),saved=g.run(`JSON.stringify(${format})`);
 g=game(saved,()=>.5);
 assert.deepEqual(read(g,allMembers),expected);
 const records=read(g,'[...partyRecords(),...s.reserve,...s.corpses.flatMap(c=>c.records)]');
 for(let n=0;n<2;n++){
  g.run('ensureProgression();save()');
  const snapshot=g.run("localStorage.getItem('ash-v1')");
  assert.equal(JSON.parse(snapshot).rosterVersion,1);
  g=game(snapshot,()=>.5);
  assert.deepEqual(read(g,'[...partyRecords(),...s.reserve,...s.corpses.flatMap(c=>c.records)]'),records);
 }
 // Already-migrated reserves/corpses must remain unchanged on later joining.
 g.run(`const id=s.reserve[0].members.id;changeRecruitParty(id,true);ensureProgression()`);
 assert.deepEqual(read(g,'s.members[2]'),expected[2]);
}
console.log('PASS 112 stored records: party, reserves, multiple corpse groups, both save formats, repeated reload and later joining');

// Missing targets: reached placeholders remain old values, only future gains scale.
for(const level of [1,8,12,30]){
 g=rosterFixture();
 g.run(`for(const m of ${allMembers}){delete m.xpTargets;m.level=${level};m.xpCurveVersion=3;}
 Math.random=()=>.123456;`);
 const before=read(g,allMembers);
 g.run('ensureProgression()');
 const expected=before.map(member=>{
  const targets=[0,0];
  for(let lv=2;lv<=30;lv++)targets[lv]=lv<=level?50*lv*(lv-1):targets[lv-1]+Math.round(115*(lv-1)*factors[member.job]*(.9+.123456*.2)*scale(lv));
  return {...member,xpTargets:targets,xpCurveVersion:3};
 });
 assert.deepEqual(read(g,allMembers),expected);
 g.run("Math.random=()=>{throw Error('fallback must not reroll')};ensureProgression()");
 assert.deepEqual(read(g,allMembers),expected);
}
console.log('PASS 112 fallback: reached placeholders, future scaling by recorded job, all storage locations, cap and idempotence');
