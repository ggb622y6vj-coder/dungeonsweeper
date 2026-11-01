// 調整用データ。ダイスは [個数, 面数, 固定加算]。
const CLASSES = [
 {id:'fighter',name:'戦士',hp:32,mp:0,attack:3,ac:6,hit:4,hpGrowth:[1,6,3],xpFactor:.8,mpGrowth:[0,1,0],attackEvery:1},
 {id:'mage',name:'魔法使い',hp:24,mp:20,attack:0,ac:9,hit:1,hpGrowth:[1,4,2],xpFactor:1.2,mpGrowth:[1,2,0],attackEvery:2},
 {id:'priest',name:'僧侶',hp:26,mp:15,attack:1,ac:7,hit:2,hpGrowth:[1,5,2],xpFactor:1,mpGrowth:[1,2,0],attackEvery:2},
 {id:'thief',name:'盗賊',hp:25,mp:0,attack:1,ac:8,hit:3,hpGrowth:[1,5,2],xpFactor:.85,mpGrowth:[0,1,0],attackEvery:2}
];
const SPELLS={blast:{name:'呪文',cost:4,dice:[3,6,0]},heal:{name:'回復',cost:3,dice:[2,6,4]}};
const LEVEL_CAP=30;
const MAX_FLOOR=10;
function trapPower(floor){return 1+0.25*(Math.min(floor,MAX_FLOOR)-1)}
function trapCount(floor,size){return Math.min(Math.floor(size*size*0.22),Math.round(size*size*(0.14+0.01*(floor-1))))}
// 各レベルの増分を個別に抽選し保存。描画や再読み込みで再抽選しない。
function ensureProgression(){
 s.members.forEach((m,i)=>{
  if(m.xpTargets){
   if(m.xpCurveVersion!==2){
    let old=m.xpTargets.slice();
    for(let level=m.level+1;level<=LEVEL_CAP;level++)m.xpTargets[level]=m.xpTargets[level-1]+Math.round((old[level]-old[level-1])*1.15);
    m.xpCurveVersion=2;
   }
   return;
  }
  m.xpTargets=[0,0];
  for(let level=2;level<=LEVEL_CAP;level++){
   m.xpTargets[level]=level<=m.level?50*level*(level-1):
    m.xpTargets[level-1]+Math.round(115*(level-1)*memberClass(i).xpFactor*(.9+Math.random()*.2));
  }
  m.xpCurveVersion=2;
 });
}
const requiredXP=(level,i)=>s.members[i].xpTargets[level];

// 逃走判定用の敵レベル。本作の敵用の設定値。深層では階ごとに+2。
