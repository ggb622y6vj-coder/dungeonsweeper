const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { game } = require('../scripts/sim/harness.cjs');
const { createParty, seededRandom } = require('../scripts/sim/combat.cjs');
const json=(g,code)=>JSON.parse(g.run(`JSON.stringify(${code})`));
function battle(ids=['goblin']){
 const g=game(null,seededRandom(623));createParty(g,[0,1,2]);
 g.run(`s.area='dungeon';s.enemy={dataVersion:1,units:${JSON.stringify(ids)}.map((id,i)=>({...makeEnemy(id,800+i),row:44,hp:999,identified:true})),initiative:'party',flagEffect:{}};
 s.members[1].level=20;s.members[2].level=20;for(const id of ['katino','dilto','mahalito','morlis','dalto','mamorlis','makanito','lakanito','tiltowait'])if(!s.members[1].known.includes(id))s.members[1].known.push(id);
 for(const id of ['montino','lorto','malikto'])if(!s.members[2].known.includes(id))s.members[2].known.push(id);s.mp=s.mp.map(()=>99);resetPartyCommands();`);g.drain();return g;
}
for(const [id,effect,job,target] of [['halito','damage',1,800],['katino','sleep',1,800],['montino','silence',2,800],['makanito','threshold-death',1,null],['lakanito','death',1,800],['dilto','debuff',1,800],['mamorlis','debuff',1,null]]){
 const g=battle();g.run(`ENEMIES.find(d=>d.id==='goblin').mageResist=1;ENEMIES.find(d=>d.id==='goblin').priestResist=1;Math.random=()=>0;`);
 assert.equal(g.run(`magic('${id}').effect`),effect);assert.equal(g.run(`castMagic(${job},'${id}',${target})`),true);
 assert.equal(g.run('s.enemy.units[0].hp'),999,id);assert.equal(g.run('s.enemy.units[0].sleep||0'),0,id);assert.equal(g.run('s.enemy.units[0].silence||false'),false,id);assert.equal(g.run('s.enemy.units[0].acPenalty||0'),0,id);
 assert(json(g,'logQueue.map(e=>e.text)').includes('ゴブリンは呪文をはね返した！'),id);
}
{
 const g=battle();g.run("ENEMIES.find(d=>d.id==='goblin').mageResist=0;ENEMIES.find(d=>d.id==='goblin').priestResist=1;Math.random=()=>.5");
 g.run("castMagic(1,'halito',800)");assert.equal(g.run('s.enemy.units[0].hp'),994,'mage spell uses mage resist');
 g.run('s.enemy.units[0].hp=999');g.run("castMagic(2,'lorto',800)");assert.equal(g.run('s.enemy.units[0].hp'),999,'priest spell uses priest resist');
}
{
 const g=battle(['goblin','goblin']);g.run("s.enemy.units[1].uid=801;s.enemy.units[1].row=44;ENEMIES.find(d=>d.id==='goblin').mageResist=.5;var rolls=[.2,.8];Math.random=()=>rolls.length?rolls.shift():.5");
 g.run("castMagic(1,'mahalito',800)");const hp=json(g,'s.enemy.units.map(e=>e.hp)');
 assert.equal(hp[0],999,'first goblin resists (.2<.5)');assert(hp[1]<999,'second goblin is damaged (.8>=.5)');
 assert.equal(json(g,'logQueue.map(e=>e.text)').filter(x=>x.endsWith('は呪文をはね返した！')).length,1,'per-individual roll');
}
{
 const g=battle(['frostgiant']);g.run("ENEMIES.find(d=>d.id==='frostgiant').mageResist=0;Math.random=()=>.999;castMagic(1,'halito',800)");
 assert.equal(g.run('s.enemy.units[0].hp'),991,'resistance roll precedes damage dice; fire damage is halved');
}
{
 const source=fs.readFileSync(path.join(__dirname,'../data/monsters.csv'),'utf8');
 for(const bad of ['96','-1','']){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'spell-resist-'));fs.mkdirSync(path.join(dir,'data'));fs.mkdirSync(path.join(dir,'dist'));fs.mkdirSync(path.join(dir,'scripts'));
  fs.copyFileSync(path.join(__dirname,'../scripts/compile-monsters.py'),path.join(dir,'scripts/compile-monsters.py'));
  const lines=source.trimEnd().split('\n');const cols=lines[1].split(',');cols[23]=bad;lines[1]=cols.join(',');fs.writeFileSync(path.join(dir,'data/monsters.csv'),lines.join('\n')+'\n');
  const result=spawnSync('python3',['scripts/compile-monsters.py'],{cwd:dir,encoding:'utf8'});assert.notEqual(result.status,0,`compiler should reject ${bad}`);fs.rmSync(dir,{recursive:true,force:true});
 }
}
console.log('spell resistance PASS');
