// 099 report: exact discrete distributions, including the old-HP + 1 floor.
// Run: node scripts/sim/hp-growth.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const ctx=vm.createContext({Math:Object.create(Math)});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../../dist/balance.js'),'utf8'),ctx);
const classes=vm.runInContext('CLASSES',ctx),cap=vm.runInContext('LEVEL_CAP',ctx);
const sides={fighter:10,mage:4,priest:8,thief:6,samurai:8,lord:10,ninja:6,bishop:6};
const width=(cap+1)*13+1;
const empty=()=>new Float64Array(width);
const states=()=>Array.from({length:19},empty);
function convolve(p,faces){
 const next=empty();
 for(let h=0;h<width;h++)if(p[h])for(const face of faces)next[h+face]+=p[h]/faces.length;
 return next;
}
function candidates(c){
 const byVit=[];
 for(let vit=3;vit<=18;vit++){
  const bonus=vm.runInContext(`vitBonus(${vit})`,ctx);
  const faces=Array.from({length:sides[c.id]},(_,i)=>Math.max(1,i+1+bonus));
  // Check the analytical die against the actual runtime helper, face by face.
  faces.forEach((face,i)=>{
   ctx.Math.random=()=>(i+.5)/sides[c.id];
   assert.equal(vm.runInContext(`hpCandidate('${c.id}',1,${vit})`,ctx),face*(c.id==='samurai'?2:1));
  });
  let p=empty();p[0]=1;
  if(c.id==='samurai')p=convolve(p,faces);
  const levels=[];
  for(let level=1;level<=cap;level++){
   p=convolve(p,faces);
   let sum=0;levels[level]=Float64Array.from(p,value=>(sum+=value));
  }
  byVit[vit]=levels;
 }
 return byVit;
}
function expectation(c,initialVit,evolving,cdf){
 let p=states();
 // Base classes really use this seven-point initial-HP distribution.
 // Elite classes are hypothetical same-class Lv1 baselines, not recruit paths.
 for(let h=c.hp-3;h<=c.hp+3;h++)p[initialVit][h]=1/7;
 for(let level=2;level<=cap;level++){
  const grown=states(),next=states();
  for(let vit=3;vit<=18;vit++){
   const transitions=evolving?[[Math.min(18,vit+1),.3],[Math.max(3,vit-1),.1],[vit,.6]]:[[vit,1]];
   for(const [to,chance] of transitions)for(let h=0;h<width;h++)grown[to][h]+=p[vit][h]*chance;
  }
  for(let vit=3;vit<=18;vit++){
   let oldCdf=0,previous=0;
   for(let h=0;h<width;h++){
    if(h>0)oldCdf+=grown[vit][h-1];
    // P(max(H_old+1,C)<=h, V=vit) = P(H_old<=h-1,V=vit)*P(C<=h|V=vit).
    const current=oldCdf*cdf[vit][level][h];
    next[vit][h]=current-previous;previous=current;
   }
  }
  p=next;
 }
 let mass=0,mean=0;
 for(const row of p)for(let h=0;h<width;h++){mass+=row[h];mean+=h*row[h]}
 assert(Math.abs(mass-1)<1e-10,'probability mass must remain one');
 return mean;
}
const rows=classes.map(c=>{
 const cdf=candidates(c),[n,d,add]=c.hpGrowth;
 return {job:c.name,initialHP:c.hp,old:c.hp+(cap-1)*(n*(d+1)/2+add),
  fixed:[10,13,16,18].map(v=>expectation(c,v,false,cdf)),
  evolving:[10,13,16,18].map(v=>expectation(c,v,true,cdf))};
});
console.log(JSON.stringify({level:cap,vit:[10,13,16,18],method:'exact discrete DP',rows},null,2));
