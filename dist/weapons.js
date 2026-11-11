// 武器の定義。dice=[個数,面数,固定加算]。classes=0:戦士、1:魔法使い、2:僧侶、3:盗賊、4:侍、5:君主、6:忍者、7:司教。range=melee:近距離、ranged:遠距離。
// 価格・売却額・ドロップ対象もここだけで管理します。
// minFloor：宝箱・ドロップに出る最も浅い階（省略時1）。shop:false は鍛冶屋に並ばない迷宮産の品（売却は可）。
const WEAPONS = [
 // 102: 宝箱専用の特殊装備。
 {"id":"poisonsw","name":"塗毒の小刀","range":"melee","dice":[2,4,0],"classes":[0,3,6],"price":400,"sell":200,"drop":true,"chestOnly":true,"minFloor":2,"shop":false,"desc":"攻撃時10%で対象を毒状態にする","effect":{"kind":"poison","chance":0.1}},
 {"id":"poisonsw2","name":"塗毒の隠し刀","range":"melee","dice":[2,6,0],"classes":[0,3,6],"price":800,"sell":400,"drop":true,"chestOnly":true,"minFloor":5,"shop":false,"desc":"攻撃時15%で対象を毒状態にする","effect":{"kind":"poison","chance":0.15}},
 {"id":"poisonsw3","name":"猛毒の隠し刀","range":"melee","dice":[2,7,0],"classes":[0,6,3],"price":1400,"sell":700,"drop":true,"chestOnly":true,"minFloor":8,"shop":false,"desc":"攻撃時20%で対象を毒状態にする","effect":{"kind":"poison","chance":0.2}},
 {"id":"atkstaff","name":"吸魂の杖","range":"melee","dice":[1,6,0],"classes":[1,7],"price":2000,"sell":1000,"drop":true,"chestOnly":true,"minFloor":4,"shop":false,"desc":"通常攻撃で敵に与えた分だけMPを回復する","effect":{"kind":"drainMP"}},
 {"id":"atkmace","name":"吸魂のメイス","range":"melee","dice":[1,6,0],"classes":[2,5],"price":2000,"sell":1000,"drop":true,"chestOnly":true,"minFloor":4,"shop":false,"desc":"通常攻撃で敵に与えた分だけMPを回復する","effect":{"kind":"drainMP"}},
 {"id":"bloodsac","name":"血の代償","range":"melee","dice":[1,6,0],"classes":[1,7],"price":2000,"sell":1000,"drop":true,"chestOnly":true,"minFloor":4,"shop":false,"desc":"装備するとMPの消費が半分になり、HPも同値消費する。","effect":{"kind":"bloodCost"}},
 {id:'shortbow',name:'短弓',range:'ranged',dice:[1,6,0],classes:[0,3,4,6],price:45,sell:22,drop:true},
 {id:'longbow',name:'長弓',range:'ranged',dice:[1,8,1],classes:[0,3,6],price:95,sell:47,drop:true},
 {id:'compositebow',name:'合成弓',range:'ranged',dice:[2,4,1],classes:[0,3,4,6],price:160,sell:80,drop:true,minFloor:2},
 {id:'dagger',name:'短剣',dice:[1,4,1],classes:[3,6],price:15,sell:7,drop:true},
 {id:'thiefblade',name:'盗賊の小剣',dice:[1,6,2],classes:[3,6],price:60,sell:30,drop:true},
 {id:'sword',name:'剣',dice:[1,6,2],classes:[0,4],price:20,sell:10,drop:true},
 {id:'staff',name:'杖',dice:[1,3,0],classes:[1,7],price:12,sell:6,drop:true},
 {id:'mace',name:'メイス',dice:[1,6,0],classes:[2,5],price:18,sell:9,drop:true},
 {id:'longsword',name:'長剣',dice:[1,8,3],classes:[0,4],price:60,sell:30,drop:true},
 {id:'battleaxe',name:'戦斧',dice:[2,6,1],classes:[0,4],price:110,sell:55,drop:true,minFloor:2},
 {id:'greatsword',name:'大剣',dice:[2,8,2],classes:[0,4,5],price:190,sell:95,drop:true,minFloor:2},
 {id:'oakstaff',name:'樫の杖',dice:[1,6,1],classes:[1,4,7],price:45,sell:22,drop:true},
 {id:'runestaff',name:'ルーンの杖',dice:[2,4,2],classes:[1,7],price:100,sell:50,drop:true,minFloor:2},
 {id:'starstaff',name:'星鉄の杖',dice:[2,6,2],classes:[1,7],price:180,sell:90,drop:true,minFloor:2},
 {id:'ironmace',name:'鉄のメイス',dice:[1,8,1],classes:[2,5],price:50,sell:25,drop:true},
 {id:'warhammer',name:'戦槌',dice:[2,5,2],classes:[2,5],price:105,sell:52,drop:true,minFloor:2},
 {id:'sacredmace',name:'聖銀のメイス',dice:[2,6,3],classes:[2,5,7],price:185,sell:92,drop:true,minFloor:2},
 // 4F〜：鍛冶屋の上位品（迷宮でも出る）
 {id:'knightsword',name:'騎士の剣',dice:[2,8,4],classes:[0,4,5],price:450,sell:225,drop:true,minFloor:4,hitBonus:1},
 {id:'heavybow',name:'強弓',range:'ranged',dice:[2,6,2],classes:[0,3,6],price:380,sell:190,drop:true,minFloor:4},
 {id:'keenblade',name:'鋭い小剣',dice:[2,4,3],classes:[3,6],price:320,sell:160,drop:true,minFloor:4,hitBonus:1},
 {id:'blessedhammer',name:'祝福の槌',dice:[2,8,3],classes:[2,5],price:420,sell:210,drop:true,minFloor:4},
 {id:'magestaff',name:'魔樫の杖',dice:[2,6,3],classes:[1,7],price:400,sell:200,drop:true,minFloor:4},
 // 5F〜：迷宮産（鍛冶屋に並ばない）
 {id:'flamesword',name:'炎の剣',dice:[3,6,4],classes:[0,4],price:1500,sell:750,drop:true,minFloor:5,shop:false,hitBonus:2},
 {id:'magicbow',name:'魔弓',range:'ranged',dice:[2,8,3],classes:[0,3,4,6,5],price:1700,sell:850,drop:true,minFloor:5,shop:false,hitBonus:2},
 {id:'powerstaff',name:'魔力の杖',dice:[2,6,4],classes:[1,7,4],price:1400,sell:700,drop:true,minFloor:5,shop:false,hitBonus:1},
 {id:'holyhammer',name:'聖なる戦槌',dice:[3,6,4],classes:[2,5],price:1600,sell:800,drop:true,minFloor:5,shop:false,hitBonus:2},
 {id:'assassinknife',name:'暗殺の短刀',dice:[2,6,4],classes:[3,6],price:1800,sell:900,drop:true,minFloor:6,shop:false,hitBonus:3},
 // 7F〜：深層の秘宝
 {id:'ogreslayer',name:'鬼斬りの大剣',dice:[3,8,4],classes:[0,4,5],price:2600,sell:1300,drop:true,minFloor:7,shop:false,hitBonus:2},
 {id:'sagestaff',name:'賢者の杖',dice:[3,6,4],classes:[1,7],price:3000,sell:1500,drop:true,minFloor:7,shop:false,hitBonus:2},
 {id:'judgehammer',name:'天罰の槌',dice:[3,8,5],classes:[2,5],price:3200,sell:1600,drop:true,minFloor:8,shop:false,hitBonus:2},
 {id:'ninjato',name:'忍びの刀',dice:[3,6,5],classes:[3,6],price:3500,sell:1750,drop:true,minFloor:8,shop:false,hitBonus:3},
 {id:'dragonbow',name:'竜骨の弓',range:'ranged',dice:[3,6,5],classes:[0,3,4,6],price:3400,sell:1700,drop:true,minFloor:8,shop:false,hitBonus:3},
 {id:'holysword',name:'聖剣',dice:[4,8,5],classes:[0,4,5],price:6000,sell:3000,drop:true,minFloor:9,shop:false,hitBonus:3,minAttacks:2},
 // 079: Notion同期。特殊効果は戦闘開始時の状態に基づいて発動。
 {"id":"mitibikinoono","name":"導きの斧","range":"melee","dice":[2,6,3],"classes":[0,4,5],"price":1900,"sell":950,"drop":true,"minFloor":6,"shop":false,"desc":"戦闘開始時、周囲8マスの正しい旗1本につき相手に与えるダメージ+1。","effect":{"kind":"flagDamage"}},
 {"id":"flagaxe","name":"旗印の斧","range":"melee","dice":[2,5,0],"classes":[0,4,5],"price":440,"sell":220,"drop":true,"minFloor":2,"shop":false,"desc":"戦闘開始時、周囲8マスの正しい旗1本につき相手に与えるダメージ+1。","effect":{"kind":"flagDamage"}},
 {"id":"mumeinoken","name":"無名の剣","range":"melee","dice":[2,3,0],"classes":[0,4,5],"price":280,"sell":140,"drop":true,"minFloor":2,"shop":false,"desc":"戦闘開始時、現在地の数字が0なら、この戦闘の通常攻撃回数+1（同種効果は重複しない）。","effect":{"kind":"zeroSwings"}},
 {"id":"zerosword","name":"零式の剣","range":"melee","dice":[2,6,2],"classes":[0,4,5],"price":480,"sell":240,"drop":true,"minFloor":4,"shop":false,"desc":"戦闘開始時、現在地の数字が0なら、この戦闘の通常攻撃回数+1（同種効果は重複しない）。","effect":{"kind":"zeroSwings"}},
 {"id":"reversalblade","name":"精算の刃","range":"melee","dice":[2,6,3],"classes":[3,6],"price":2800,"sell":1400,"drop":true,"minFloor":7,"shop":false,"desc":"攻撃時、周囲8マスに旗があり、現在地の数字と周囲8マスの旗数が合うなら、敵のACを−1した状態で攻撃。","effect":{"kind":"flagMatchAC"}},
 {"id":"flagsword","name":"旗印の刃","range":"melee","dice":[2,4,0],"classes":[0,4,5],"price":1000,"sell":500,"drop":true,"minFloor":2,"shop":false,"desc":"攻撃時、周囲8マスに旗があり、現在地の数字と周囲8マスの旗数が合うなら、敵のACを−1した状態で攻撃。","effect":{"kind":"flagMatchAC"}},
 {"id":"hatajirusinosentui","name":"旗印の戦鎚","range":"melee","dice":[2,6,0],"classes":[2,5],"price":1000,"sell":500,"drop":true,"minFloor":2,"shop":false,"desc":"戦闘勝利時、10％の確率で現在地の周囲8マスにある正しく旗を立てた罠を全て解除する。","effect":{"kind":"victoryDisarm","chance":0.1}},
 {"id":"sealinghammer","name":"封印の戦槌","range":"melee","dice":[2,8,3],"classes":[2,5],"price":3360,"sell":1680,"drop":true,"minFloor":8,"shop":false,"desc":"戦闘勝利時、10％の確率で現在地の周囲8マスにある正しく旗を立てた罠を全て解除する。","effect":{"kind":"victoryDisarm","chance":0.1}},
 {"id":"surveyorstaff","name":"測量師の杖","range":"melee","dice":[2,6,1],"classes":[1,7,4],"price":1900,"sell":950,"drop":true,"minFloor":6,"shop":false,"desc":"現在地の数字が偶数なら呪文のダメージ+10%。奇数なら10%の確率で消費MP半減。０は効果なし。","effect":{"kind":"surveyor"}},
 {"id":"hatajirusinotanken","name":"旗印の短剣","range":"melee","dice":[2,3,0],"classes":[3,0,4,6],"price":1000,"sell":500,"drop":true,"minFloor":2,"shop":false,"desc":"戦闘勝利時、20%の確率で隣接する未探索の安全マスを1つ自動で開く。","effect":{"kind":"victoryOpen","chance":0.2}},
 {"id":"scoutingdagger","name":"探査の短剣","range":"melee","dice":[2,6,4],"classes":[3,0,4,6],"price":3600,"sell":1800,"drop":true,"minFloor":8,"shop":false,"desc":"戦闘勝利時、隣接する未探索の安全マスを1つ自動で開く。","effect":{"kind":"victoryOpen","chance":1}},
 {"id":"eighteyespear","name":"八目の槍","range":"melee","dice":[2,6,2],"classes":[0,4,6],"price":1520,"sell":760,"drop":true,"minFloor":5,"shop":false,"desc":"戦闘開始時、現在地に表示された数字1につき相手に与えるダメージ+1。","effect":{"kind":"numberDamage"}},
 {"id":"hatajirusinoyumi","name":"旗印の弓","range":"ranged","dice":[2,3,0],"classes":[3,6,0],"price":1000,"sell":500,"drop":true,"minFloor":2,"shop":false,"desc":"攻撃時、周囲8マスに旗があり、現在地の数字と周囲8マスの旗数が合うなら、この戦闘で最初に命中した通常攻撃のダメージ+10%。","effect":{"kind":"flagMatchFirstHit","pct":10}},
 {"id":"deductiondagger","name":"不意打ちの弓","range":"ranged","dice":[2,4,0],"classes":[3,6,0],"price":1400,"sell":700,"drop":true,"minFloor":5,"shop":false,"desc":"攻撃時、周囲8マスに旗があり、現在地の数字と周囲8マスの旗数が合うなら、この戦闘で最初に命中した通常攻撃のダメージ+15%。","effect":{"kind":"flagMatchFirstHit","pct":15}},
 {"id":"makyuu","name":"魔弓","range":"ranged","dice":[2,4,3],"classes":[3,6,0],"price":4000,"sell":2000,"drop":true,"minFloor":8,"shop":false,"desc":"周囲8マスに未探索のマスがあるなら、戦闘で最初に命中した通常攻撃のダメージ+25%。","effect":{"kind":"firstHitUnexplored","pct":25}}
] .map(w=>({range:'melee',hitBonus:0,minAttacks:1,minFloor:1,...w}));

const ARMOR=[
 {"id":"chestsac","name":"代わり身の胸当て","part":"body","ac":4,"classes":[0,4,5],"price":800,"sell":400,"drop":true,"chestOnly":true,"minFloor":3,"shop":false,"desc":"装備するとHPが1/3以下になった時にHPを1/2回復し、このアイテムは消滅する。","effect":{"kind":"sacrificeHP"}},
 {"id":"helmetsac","name":"代わり身の兜","part":"head","ac":2,"classes":[0,4,5],"price":800,"sell":400,"drop":true,"chestOnly":true,"minFloor":3,"shop":false,"desc":"装備すると状態異常になった時に状態異常を回復し、このアイテムは消滅する。","effect":{"kind":"sacrificeStatus"}},
 {"id":"headlight","name":"ヘッドライト","part":"head","ac":1,"classes":[0,2,3,1,4,6,5,7],"price":1000,"sell":500,"drop":true,"chestOnly":true,"minFloor":2,"shop":false,"desc":"階を移動した時、移動先のマスの周囲8マスのうち未探索で罠のないマスを全て解放済みにする。この効果は重複しない。","effect":{"kind":"headlight"}},
{id:'cap',name:'革帽子',part:'head',ac:1,classes:[0,2,1,3,4,6,5,7],price:30,sell:15},
{id:'helm',name:'鉄兜',part:'head',ac:2,classes:[0,2,4,5],price:90,sell:45},
{id:'robe',name:'ローブ',part:'body',ac:1,classes:[0,2,1,3],price:25,sell:12},
{id:'leather',name:'革鎧',part:'body',ac:2,classes:[0,2,1,3,4,6,5,7],price:65,sell:32},
{id:'chain',name:'鎖帷子',part:'body',ac:3,classes:[0,2,4,5],price:130,sell:65},
{id:'plate',name:'板金鎧',part:'body',ac:5,classes:[0,4],price:300,sell:150,minFloor:3},
{id:'boots',name:'革靴',part:'feet',ac:1,classes:[0,2,1,3,4,6,5,7],price:30,sell:15},
{id:'greaves',name:'鉄の脛当て',part:'feet',ac:2,classes:[0,2,4,5],price:100,sell:50},
{id:'wardrobe',name:'守りの法衣',part:'body',ac:3,classes:[1,2,7,5],price:180,sell:90,minFloor:2},
// 4F〜：鍛冶屋の上位品
{id:'steelhelm',name:'鋼の兜',part:'head',ac:3,classes:[0,2,5],price:380,sell:190,minFloor:4},
{id:'hardleather',name:'硬革鎧',part:'body',ac:3,classes:[0,2,3,4,6,5],price:260,sell:130,minFloor:4},
{id:'magecloak',name:'魔術師の外套',part:'body',ac:4,classes:[1,2,7,5],price:520,sell:260,minFloor:4},
{id:'steelgreaves',name:'鋼の脛当て',part:'feet',ac:3,classes:[0,2,4,5],price:420,sell:210,minFloor:4},
// 5F〜：迷宮産
{id:'magichelm',name:'魔法の兜',part:'head',ac:4,classes:[0,2,1,3,4,6,5,7],price:1800,sell:900,minFloor:5,shop:false},
{id:'ninjagarb',name:'忍び装束',part:'body',ac:5,classes:[3,6],price:2000,sell:1000,minFloor:6,shop:false},
{id:'holyvestment',name:'聖衣',part:'body',ac:6,classes:[1,2,5,7],price:2200,sell:1100,minFloor:6,shop:false},
{id:'galeboots',name:'疾風の靴',part:'feet',ac:4,classes:[0,1,2,3,4,6,5,7],price:2200,sell:1100,minFloor:6,shop:false},
{id:'knightplate',name:'騎士の板金鎧',part:'body',ac:7,classes:[0,4,5],price:2400,sell:1200,minFloor:7,shop:false},
{id:'dragonmail',name:'竜鱗の鎧',part:'body',ac:9,classes:[0,4],price:6000,sell:3000,minFloor:9,shop:false}
].map(a=>({minFloor:1,...a}));
WEAPONS.push(...ARMOR);

// 102: 装備可否は正本の明示的な8職リストを使う。
function canEquipJob(item,job){return !!item?.classes.includes(job)}
