// 099: deterministic growth, migration, career and presentation regressions.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {game}=require('../scripts/sim/harness.cjs');
const keys=['str','agi','intelligence','piety','vit'];
const read=(g,code)=>JSON.parse(g.run(`JSON.stringify(${code})`));
function setup(saved=null){
 const g=game(saved,()=>.5);
 g.run(`const create=document.createElement;document.createElement=tag=>Object.assign(create(tag),{dataset:{}})`);
 g.run(fs.readFileSync(path.join(__dirname,'../dist/training.js'),'utf8'));
 g.run(`function recruit(job=0,join=true){const r=generateRecruit('冒険者'+trainingRoster().length,job);registerRecruit(r);if(join)changeRecruitParty(r.members.id,true);return r.members.id}`);
 return g;
}
// Exhaustion is an error: these cases also fix the number/order of random draws.
function rolls(g,values,code){
 g.run(`var rolls=${JSON.stringify(values)};Math.random=()=>{if(!rolls.length)throw Error('unexpected random draw');return rolls.shift()};${code}`);
 assert.equal(g.run('rolls.length'),0,'all prescribed draws consumed');
}
let g=setup();
// Golden outputs captured from pre-099 generateRecruit: STR/AGI/IQ/PIE,
// bonus, HP, MP for fixed rolls 0/.5/.999999 (including saturation at 18).
const legacyGolden=[
 [[15,10,8,8,3,29,0],[12,10,14,8,6,32,0],[12,18,8,9,9,35,0]],
 [[11,9,12,8,3,21,18],[8,9,18,8,6,24,20],[8,18,12,8,9,27,22]],
 [[13,9,8,12,3,23,13],[10,9,8,18,6,26,15],[10,18,8,12,9,29,17]],
 [[13,14,10,8,3,22,0],[10,14,16,8,6,25,0],[10,18,10,13,9,28,0]]
];
for(let job=0;job<4;job++)for(const [index,roll] of [0,.5,.999999].entries()){
 const bonus=legacyGolden[job][index][4];
 for(const vitRoll of [0,.249999,.25,.499999,.5,.749999,.75,.999999]){
  const oldDraws=1+bonus+1+([1,2].includes(job)?1:0)+29;
  rolls(g,[...Array(oldDraws).fill(roll),vitRoll],`var generated=generateRecruit('生成',${job})`);
  const r=read(g,'generated'),m=r.members;
  assert.equal(m.vit,10+Math.floor(vitRoll*4));assert(Number.isInteger(m.vit));
  assert.deepEqual([m.str,m.agi,m.intelligence,m.piety,m.creationBonus,m.maxHP,m.maxMP],legacyGolden[job][index]);
  assert.equal(m.baseStr,m.str);assert.equal(m.baseAgi,m.agi);
  assert.equal(r.hp,m.maxHP);assert.equal(r.mp,m.maxMP);
  const expectedXP=[0,0];
  for(let level=2;level<=30;level++)expectedXP[level]=expectedXP[level-1]+Math.round(115*(level-1)*[.8,1.2,1,.85][job]*(.9+roll*.2)*(level<=8?1:Math.min(6,Math.pow(1.2,level-8))));
  assert.deepEqual(m.xpTargets,expectedXP);
  assert.deepEqual(m.known,[[],['dumapic','identifyfoe','halito','katino'],['dios','kalki'],[]][job]);
 }
}
console.log('PASS 099 recruit: VIT 10–13 boundaries; existing stats, bonus, HP/MP and spells unchanged; XP follows curve v3');

// Missing and already-set VIT in every record location, both save formats.
g=setup();g.run(`recruit(1);recruit(2,false);recruit(0,false);
 s.corpses=[{id:'corpse',floor:1,cell:2,gold:7,records:[s.reserve.pop()]}];
 for(const r of [...trainingRoster(),...s.corpses[0].records]){
  r.members.classChanged=true;r.members.careerHistory=[{from:3,to:r.members.job,fromLevel:12}];
  r.members.known=['halito'];r.members.xp=123;r.members.maxHP=87;r.hp=42;r.members.vit=17;
 }`);
for(const format of ['rosterSaveState()','s'])for(const missing of [true,false,null]){
 const state=read(g,format),records=state.roster||[...state.members.map(m=>({members:m})),...state.reserve];
 const members=[...records,...state.corpses[0].records].map(r=>r.members);
 if(missing)members.forEach(m=>delete m.vit);
 if(missing===null)members.forEach(m=>m.vit=null);
 let restored=setup(JSON.stringify(state));
 const expected=read(g,'[...trainingRoster(),...s.corpses[0].records]');
 if(missing!==false)expected.forEach(r=>r.members.vit=10);
 for(let n=0;n<3;n++){
  assert.deepEqual(read(restored,'[...trainingRoster(),...s.corpses[0].records]'),expected);
  restored.run('Math.random=()=>{throw Error("migration rerolled")};ensureProfile();save()');
  const save=read(restored,'JSON.parse(localStorage.getItem("ash-v1"))');
  assert.equal(save.rosterVersion,1);assert(!('growthVersion' in save));
  restored=setup(JSON.stringify(save));
 }
}
console.log('PASS 099 migration: party/reserve/corpses, both formats, repeated save/load preserve complete records');

// Every stat independently exercises exact probability boundaries and caps.
for(const initial of [3,10,18])for(const [roll,delta] of [[0,1],[.299999,1],[.30,-1],[.399999,-1],[.40,0],[.999999,0]]){
 g=setup();g.run(`recruit();Object.assign(s.members[0],${JSON.stringify(Object.fromEntries(keys.map(k=>[k,initial])))});
 s.members[0].baseStr=4;s.members[0].baseAgi=5;s.members[0].maxHP=200;s.members[0].xp=s.members[0].xpTargets[2]`);
 rolls(g,[...Array(5).fill(roll),.5,.5],'levelUp()');
 assert.deepEqual(read(g,`s.members.map(m=>${JSON.stringify(keys)}.map(k=>m[k]))`),[Array(5).fill(Math.max(3,Math.min(18,initial+delta)))]);
 assert.equal(g.run('s.members[0].maxHP'),201);assert.equal(g.run('s.members[0].baseStr'),4);assert.equal(g.run('s.members[0].baseAgi'),5);
}
g=setup();g.run(`recruit();Object.assign(s.members[0],{str:10,agi:10,intelligence:10,piety:10,vit:10,maxHP:200});s.members[0].xp=s.members[0].xpTargets[2]`);
rolls(g,[.299,.30,.40,.399,.2,.5,.5],'levelUp()');
assert.deepEqual(read(g,`s.members.map(m=>${JSON.stringify(keys)}.map(k=>m[k]))`),[[11,9,10,9,11]]);
assert.deepEqual(read(g,'s.levelReport'),['冒険者0 Lv.1 → 2　HP +1 / MP ±0 / STR +1 / AGI -1 / IQ ±0 / PIE -1 / VIT +1']);
console.log('PASS 099 stats: independent +30%/-10%/60%, exact cutoffs, all five caps, signed report and base compatibility');

const jobs=[['fighter',10],['mage',4],['priest',8],['thief',6],['samurai',8],['lord',10],['ninja',6],['bishop',6]];
const bonuses=[-2,-1,-1,0,0,0,0,0,0,0,0,0,0,1,2,3];
g=setup();
for(let vit=3;vit<=18;vit++){
 const bonus=bonuses[vit-3];assert.equal(g.run(`vitBonus(${vit})`),bonus);
 for(const [job,sides] of jobs)for(const level of [1,2,30]){
  const count=level+(job==='samurai'?1:0);
  // All face values, not only min/max: applies the floor to each term.
  for(let face=1;face<=sides;face++){
   rolls(g,Array(count).fill((face-.5)/sides),`var candidate=hpCandidate('${job}',${level},${vit})`);
   assert.equal(g.run('candidate'),count*Math.max(1,face+bonus));
  }
 }
}
// VIT 15 -> 16 -> 17 produces HP 4 then 9 with minimum dice; stale VIT or
// performing all stat growth first would give a different result.
g=setup();g.run(`recruit();Object.assign(s.members[0],{vit:15,maxHP:1});s.members[0].xp=s.members[0].xpTargets[3]`);
rolls(g,[.5,.5,.5,.5,0,0,0, .5,.5,.5,.5,0,0,0,0],'levelUp()');
assert.equal(g.run('s.members[0].vit'),17);assert.equal(g.run('s.members[0].maxHP'),9);
assert.equal(g.run('s.levelReport.length'),1);assert.match(g.run('s.levelReport[0]'),/Lv\.1 → 3.*HP \+8.*VIT \+2/);
const capped=read(g,'s.members[0]');g.run('s.members[0].level=30;s.members[0].xp=999999;Math.random=()=>{throw Error("cap rerolled")};levelUp()');
assert.equal(g.run('s.members[0].maxHP'),capped.maxHP);assert.equal(g.run('s.levelReport.length'),0);
console.log('PASS 099 HP: eight dice/counts, every VIT threshold/face, per-term minimum, post-growth VIT, per-level ordering and Lv30 cap');

// Use real learning and a roll between old/new IQ or PIE divided by 30.
for(const [job,key,spell,level] of [[1,'intelligence','reload',4],[2,'piety','matu',3]]){
 g=setup();g.run(`recruit(${job});s.members[0].known=MAGIC.filter(x=>x.job===${job}&&x.id!=='${spell}').map(x=>x.id);
 s.members[0].${key}=8;s.members[0].vit=15;s.members[0].maxHP=1;s.members[0].level=${level-1};s.members[0].xp=s.members[0].xpTargets[${level}]`);
 assert.equal(g.run(`magic('${spell}').guaranteed===true`),false);
 const statRolls=keys.map(k=>k===key||k==='vit'?0:.5);
 rolls(g,[...statRolls,...Array(level).fill(0),.999,.29],'levelUp()');
 assert.equal(g.run(`s.members[0].known.includes('${spell}')`),true);
 assert.equal(g.run('s.members[0].maxHP'),level*2);
 assert.equal(g.run('s.members[0].maxMP'),job===1?22:17);
 assert.match(g.run('s.levelReport[0]'),/を習得した。$/);
 assert.match(g.run('s.levelReport[1]'),/MP \+2/);
 g.run(`s.members[0].xp=s.members[0].xpTargets[${level+1}]`);
 rolls(g,[...Array(5).fill(.3),...Array(level+1).fill(0),0],'levelUp()');
 assert.equal(g.run(`s.members[0].known.includes('${spell}')`),true,'decrease cannot remove spells');
}
for(let job=0;job<8;job++){
 g=setup();g.run(`recruit();Object.assign(s.members[0],{job:${job},maxMP:50,known:MAGIC.map(x=>x.id)});Math.random=()=>.999`);
 for(let level=2;level<=4;level++){
  g.run(`s.members[0].xp=s.members[0].xpTargets[${level}];levelUp()`);
  const delta=[0,2,2,0,2,2,0,3][job],steps=job===4||job===5?Math.max(0,level-3):level-1;
  assert.equal(g.run('s.members[0].maxMP'),50+steps*delta);
 }
}
console.log('PASS 099 ordering: real learning uses grown IQ/PIE, learned spells survive decreases; HP then MP then learning, all MP dice/gates unchanged');

for(const reserve of [false,true]){
 g=setup();g.run(`var id=recruit(0,${!reserve});var r=trainingRoster().find(r=>r.members.id===id);
 Object.assign(r.members,{level:10,maxHP:200,vit:16,str:17,agi:15});r.inventory.push('staff');
 var before=JSON.stringify(r);Math.random=()=>{throw Error('preview rerolled')};var preview=classChangePreview(r,1)`);
 assert.equal(g.run('JSON.stringify(r)'),g.run('before'));
 assert.equal(g.run('preview.members.vit'),16);assert.equal(g.run('preview.members.maxHP'),200);assert.equal(g.run('preview.hp'),200);
 g.run(`Math.random=()=>.5;$('#training').showModal();var result=changeClass(id,1)`);assert.equal(g.run('result.ok'),true);
 if(reserve)g.run('changeRecruitParty(id,true)');
 assert.equal(g.run('s.members[0].vit'),16);assert.equal(g.run('s.members[0].maxHP'),200);assert.equal(g.run('s.hp[0]'),200);
 assert.equal(g.run('s.members[0].baseStr'),17);assert.equal(g.run('s.members[0].baseAgi'),15);
 g.run('s.members[0].xp=s.members[0].xpTargets[2];levelUp()');assert.equal(g.run('s.members[0].maxHP'),201);
}
// All classes retain randomly-grown stats while using the old HP/MP drain.
for(let job=0;job<8;job++){
 g=setup();g.run(`recruit();Object.assign(s.members[0],{job:${job},level:5,maxHP:200,maxMP:50,known:MAGIC.map(x=>x.id)});
 s.members[0].xp=s.members[0].xpTargets[6];Math.random=()=>0;levelUp();s.hp[0]=s.members[0].maxHP;s.mp[0]=s.members[0].maxMP`);
 const before=read(g,'s.members[0]'),c=read(g,`CLASSES[${job}]`);
 assert.equal(g.run('lowerMemberLevel(0)'),true);
 const after=read(g,'s.members[0]');
 assert.equal(after.level,5);assert.equal(after.xp,before.xpTargets[5]);
 assert.equal(after.maxHP,before.maxHP-Math.round(c.hpGrowth[0]*(c.hpGrowth[1]+1)/2+c.hpGrowth[2]));
 assert.equal(after.maxMP,before.maxMP-Math.round(c.mpGrowth[0]*(c.mpGrowth[1]+1)/2));
 for(const key of [...keys,'baseStr','baseAgi','known'])assert.deepEqual(after[key],before[key]);
 assert.equal(g.run('s.hp[0]'),after.maxHP);assert.equal(g.run('s.mp[0]'),after.maxMP);
}
console.log('PASS 099 careers/drain: party and reserve preview/commit keep VIT/HP200; +1 guarantee; eight-class drain retains grown stats and legacy HP/MP/XP clamps');

g=setup();g.run(`recruit();s.members[0].vit=13;renderStats();renderTraining();
 recruitDraft=generateRecruit('候補',0);recruitDraft.members.vit=13;
 previousRecruit=structuredClone(recruitDraft);previousRecruit.members.vit=10;showRecruitPreview()`);
assert.match(g.run("$('#statsbody').innerHTML"),/<dt>VIT<\/dt><dd>13<\/dd>/);
assert.match(g.run("$('#recruitlist').children[0].children[2].textContent"),/VIT 13/);
assert.equal(g.run("$('#recruitpreview').children[1].children.find(d=>d.children[0].textContent==='VIT').children[1].textContent"),'13 (+3)');
g.run('displayVitals={members:structuredClone(s.members),hp:[7],mp:[0],ac:[6]};s.members[0].vit=18;renderStats()');
assert.match(g.run("$('#statsbody').innerHTML"),/<dt>VIT<\/dt><dd>13<\/dd>/,'use the visible snapshot');
console.log('PASS 099 UI: VIT in stats/roster/preview with reroll delta; stats respect visible snapshot');
