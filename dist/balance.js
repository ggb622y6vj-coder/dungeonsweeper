// 調整用データ。ダイスは [個数, 面数, 固定加算]。
const CLASSES = [
 {id:'fighter',name:'戦士',hp:32,mp:0,attack:3,ac:6,hit:4,hpGrowth:[1,6,3],xpFactor:.8,mpGrowth:[0,1,0],attackEvery:1},
 {id:'mage',name:'魔法使い',hp:24,mp:20,attack:0,ac:9,hit:1,hpGrowth:[1,4,2],xpFactor:1.2,mpGrowth:[1,2,0],attackEvery:2},
 {id:'priest',name:'僧侶',hp:26,mp:15,attack:1,ac:7,hit:2,hpGrowth:[1,5,2],xpFactor:1,mpGrowth:[1,2,0],attackEvery:2},
 {id:'thief',name:'盗賊',hp:25,mp:0,attack:1,ac:8,hit:3,hpGrowth:[1,5,2],xpFactor:.85,mpGrowth:[0,1,0],attackEvery:2},
 {id:'samurai',name:'侍',hp:30,mp:0,attack:3,ac:6,hit:4,hpGrowth:[1,6,2],xpFactor:1.40,mpGrowth:[1,2,0],mpFromLevel:4,attackEvery:1},
 {id:'lord',name:'君主',hp:32,mp:0,attack:3,ac:5,hit:4,hpGrowth:[1,6,2],xpFactor:1.50,mpGrowth:[1,2,0],mpFromLevel:4,attackEvery:1},
 {id:'ninja',name:'忍者',hp:27,mp:0,attack:1,ac:7,hit:3,hpGrowth:[1,5,2],xpFactor:1.45,mpGrowth:[0,1,0],attackEvery:2},
 {id:'bishop',name:'司教',hp:24,mp:18,attack:0,ac:8,hit:1,hpGrowth:[1,4,2],xpFactor:1.60,mpGrowth:[1,3,0],attackEvery:2}
];
const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
const LEVEL_CAP=30;
// 112: L は増分で到達するレベル（2..30）。生成・転職・旧セーブ移行で共用。
function xpCurveScale(L){return L<=8?1:Math.min(6,Math.pow(1.2,L-8))}
// 099: maximum-HP candidate; hpGrowth remains the level-drain approximation.
function vitBonus(vit){return vit===3?-2:vit<=5?-1:vit<=15?0:vit-15}
function hpCandidate(job,level,vit){
 const sides={fighter:10,lord:10,priest:8,samurai:8,thief:6,bishop:6,ninja:6,mage:4}[job];
 const rolls=level+(job==='samurai'?1:0),bonus=vitBonus(vit);
 let hp=0;
 for(let n=0;n<rolls;n++)hp+=Math.max(1,1+Math.floor(Math.random()*sides)+bonus);
 return hp;
}
const MAX_FLOOR=10;
const CHEST_LOOT={itemChance:[.20,.22,.25,.28,.30,.32,.35,.38,.40,.45],priceCap:[150,200,350,500,1800,2200,3000,3600,6000,6000]};
function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
// 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
function ensureProgression(){
 function ensureMember(m,job){
  if(m.xpTargets){
   if(m.xpCurveVersion!==3){
    let old=m.xpTargets.slice();
    for(let level=m.level+1;level<=LEVEL_CAP;level++)m.xpTargets[level]=m.xpTargets[level-1]+Math.round((old[level]-old[level-1])*xpCurveScale(level));
    m.xpCurveVersion=3;
   }
   return;
  }
  m.xpTargets=[0,0];
  for(let level=2;level<=LEVEL_CAP;level++){
   m.xpTargets[level]=level<=m.level?50*level*(level-1):
    m.xpTargets[level-1]+Math.round(115*(level-1)*CLASSES[job].xpFactor*(.9+Math.random()*.2)*xpCurveScale(level));
  }
  m.xpCurveVersion=3;
 }
 s.members.forEach((m,i)=>ensureMember(m,jobOf(i)));
 for(const r of [...(s.reserve||[]),...(s.corpses||[]).flatMap(c=>c.records||[])]){
  if(r.members)ensureMember(r.members,r.members.job??0);
 }
}
const requiredXP=(level,i)=>s.members[i].xpTargets[level];

// 逃走判定用の敵レベル。本作の敵用の設定値。深層では階ごとに+2。
