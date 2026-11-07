const assert=require('node:assert/strict');
const {game}=require('../scripts/sim/harness.cjs');
const {createParty}=require('../scripts/sim/combat.cjs');
for(const [id,type,chance] of [['dynamotuboro','paralysis',.1],['bluedragon','paralysis',.1],['poisongiant','poison',.3]]){
 const g=game(null,()=>.5);
 createParty(g,[0,2,1,0,2,1]);
 const data=JSON.parse(g.run(`JSON.stringify(enemyDefinition('${id}').breath)`));
 assert.deepEqual(data.statuses,[{type,chance}]);
 assert.ok(['雷','毒'].includes(data.element));
 g.run(`s.area='dungeon';var foe=makeEnemy('${id}',1);s.enemy={units:[foe],flagEffect:{}};
 s.members.forEach(m=>m.status='ok');s.hp=[100,1,100,100,100,100];
 s.members[5].status='stone';s.ailments=s.members.map(()=>freshAilments());
 dice=()=>({value:2});var rolls=[0,${chance-.001},${chance},0,.99];Math.random=()=>{if(!rolls.length)throw Error('unexpected roll');return rolls.shift()};
 monsterAction(foe,[]);`);
 assert.equal(g.run('rolls.length'),0,'one separate roll per surviving victim; dead/stone skipped');
 assert.equal(g.run('s.hp.join()'),'98,0,98,98,98,100');
 assert.deepEqual(JSON.parse(g.run(`JSON.stringify(s.ailments.map(a=>!!a.${type}))`)),[true,false,false,true,false,false]);
 const logs=g.run('JSON.stringify(logQueue.map(x=>x.text))');
 assert.ok(logs.includes(type==='poison'?'毒に侵された':'麻痺に侵された'));
 assert.ok(!logs.includes('命中時'),'internal probability text stays out of combat logs');
 g.run(`var details=libraryMonsterDetails(enemyDefinition('${id}'),{count:0});`);
 assert.ok(g.run("details.find(x=>x[0]==='特殊能力')[1].children.map(x=>x.textContent).join(' ')").includes(type==='poison'?'毒':'麻痺'));
}
console.log('PASS breath statuses: individual probability boundaries, death/stone exclusion, normal logs and library display');
