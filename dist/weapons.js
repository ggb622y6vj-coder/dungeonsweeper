// 武器の定義。dice=[個数,面数,固定加算]。classes=0:戦士、1:魔法使い、2:僧侶、3:盗賊。range=melee:近距離、ranged:遠距離。
// 価格・売却額・ドロップ対象もここだけで管理します。
// minFloor：宝箱・ドロップに出る最も浅い階（省略時1）。shop:false は鍛冶屋に並ばない迷宮産の品（売却は可）。
const WEAPONS = [
 {id:'shortbow',name:'短弓',range:'ranged',dice:[1,6,0],classes:[0,3],price:45,sell:22,drop:true},
 {id:'longbow',name:'長弓',range:'ranged',dice:[1,8,1],classes:[0,3],price:95,sell:47,drop:true},
 {id:'compositebow',name:'合成弓',range:'ranged',dice:[2,4,1],classes:[0,3],price:160,sell:80,drop:true,minFloor:2},
 {id:'dagger',name:'短剣',dice:[1,4,1],classes:[3],price:15,sell:7,drop:true},
 {id:'thiefblade',name:'盗賊の小剣',dice:[1,6,2],classes:[3],price:60,sell:30,drop:true},
 {id:'sword',name:'剣',dice:[1,6,2],classes:[0],price:20,sell:10,drop:true},
 {id:'staff',name:'杖',dice:[1,3,0],classes:[1],price:12,sell:6,drop:true},
 {id:'mace',name:'メイス',dice:[1,6,0],classes:[2],price:18,sell:9,drop:true},
 {id:'longsword',name:'長剣',dice:[1,8,3],classes:[0],price:60,sell:30,drop:true},
 {id:'battleaxe',name:'戦斧',dice:[2,6,1],classes:[0],price:110,sell:55,drop:true,minFloor:2},
 {id:'greatsword',name:'大剣',dice:[2,8,2],classes:[0],price:190,sell:95,drop:true,minFloor:2},
 {id:'oakstaff',name:'樫の杖',dice:[1,6,1],classes:[1],price:45,sell:22,drop:true},
 {id:'runestaff',name:'ルーンの杖',dice:[2,4,2],classes:[1],price:100,sell:50,drop:true,minFloor:2},
 {id:'starstaff',name:'星鉄の杖',dice:[2,6,2],classes:[1],price:180,sell:90,drop:true,minFloor:2},
 {id:'ironmace',name:'鉄のメイス',dice:[1,8,1],classes:[2],price:50,sell:25,drop:true},
 {id:'warhammer',name:'戦槌',dice:[2,5,2],classes:[2],price:105,sell:52,drop:true,minFloor:2},
 {id:'sacredmace',name:'聖銀のメイス',dice:[2,6,3],classes:[2],price:185,sell:92,drop:true,minFloor:2},
 // 4F〜：鍛冶屋の上位品（迷宮でも出る）
 {id:'knightsword',name:'騎士の剣',dice:[2,8,4],classes:[0],price:450,sell:225,drop:true,minFloor:4,hitBonus:1},
 {id:'heavybow',name:'強弓',range:'ranged',dice:[2,6,2],classes:[0,3],price:380,sell:190,drop:true,minFloor:4},
 {id:'keenblade',name:'鋭い小剣',dice:[2,4,3],classes:[3],price:320,sell:160,drop:true,minFloor:4,hitBonus:1},
 {id:'blessedhammer',name:'祝福の槌',dice:[2,8,3],classes:[2],price:420,sell:210,drop:true,minFloor:4},
 {id:'magestaff',name:'魔樫の杖',dice:[2,6,3],classes:[1],price:400,sell:200,drop:true,minFloor:4},
 // 5F〜：迷宮産（鍛冶屋に並ばない）
 {id:'flamesword',name:'炎の剣',dice:[3,6,4],classes:[0],price:1500,sell:750,drop:true,minFloor:5,shop:false,hitBonus:2},
 {id:'magicbow',name:'魔弓',range:'ranged',dice:[2,8,3],classes:[0,3],price:1700,sell:850,drop:true,minFloor:5,shop:false,hitBonus:2},
 {id:'powerstaff',name:'魔力の杖',dice:[2,6,4],classes:[1],price:1400,sell:700,drop:true,minFloor:5,shop:false,hitBonus:1},
 {id:'holyhammer',name:'聖なる戦槌',dice:[3,6,4],classes:[2],price:1600,sell:800,drop:true,minFloor:5,shop:false,hitBonus:2},
 {id:'assassinknife',name:'暗殺の短刀',dice:[2,6,4],classes:[3],price:1800,sell:900,drop:true,minFloor:6,shop:false,hitBonus:3},
 // 7F〜：深層の秘宝
 {id:'ogreslayer',name:'鬼斬りの大剣',dice:[3,8,4],classes:[0],price:2600,sell:1300,drop:true,minFloor:7,shop:false,hitBonus:2},
 {id:'sagestaff',name:'賢者の杖',dice:[3,6,4],classes:[1],price:3000,sell:1500,drop:true,minFloor:7,shop:false,hitBonus:2},
 {id:'judgehammer',name:'天罰の槌',dice:[3,8,5],classes:[2],price:3200,sell:1600,drop:true,minFloor:8,shop:false,hitBonus:2},
 {id:'ninjato',name:'忍びの刀',dice:[3,6,5],classes:[3],price:3500,sell:1750,drop:true,minFloor:8,shop:false,hitBonus:3},
 {id:'dragonbow',name:'竜骨の弓',range:'ranged',dice:[3,6,5],classes:[0,3],price:3400,sell:1700,drop:true,minFloor:8,shop:false,hitBonus:3},
 {id:'holysword',name:'聖剣',dice:[4,8,5],classes:[0],price:6000,sell:3000,drop:true,minFloor:9,shop:false,hitBonus:3,minAttacks:2}
] .map(w=>({range:'melee',hitBonus:0,minAttacks:1,minFloor:1,...w}));

const ARMOR=[
{id:'cap',name:'革帽子',part:'head',ac:1,classes:[0,1,2,3],price:30,sell:15},
{id:'helm',name:'鉄兜',part:'head',ac:2,classes:[0,2],price:90,sell:45},
{id:'robe',name:'ローブ',part:'body',ac:1,classes:[0,1,2,3],price:25,sell:12},
{id:'leather',name:'革鎧',part:'body',ac:2,classes:[0,2,3],price:65,sell:32},
{id:'chain',name:'鎖帷子',part:'body',ac:3,classes:[0,2],price:130,sell:65},
{id:'plate',name:'板金鎧',part:'body',ac:5,classes:[0],price:300,sell:150,minFloor:3},
{id:'boots',name:'革靴',part:'feet',ac:1,classes:[0,1,2,3],price:30,sell:15},
{id:'greaves',name:'鉄の脛当て',part:'feet',ac:2,classes:[0,2],price:100,sell:50},
{id:'wardrobe',name:'守りの法衣',part:'body',ac:3,classes:[1,2],price:180,sell:90,minFloor:2},
// 4F〜：鍛冶屋の上位品
{id:'steelhelm',name:'鋼の兜',part:'head',ac:3,classes:[0,2],price:380,sell:190,minFloor:4},
{id:'hardleather',name:'硬革鎧',part:'body',ac:3,classes:[0,2,3],price:260,sell:130,minFloor:4},
{id:'magecloak',name:'魔術師の外套',part:'body',ac:4,classes:[1,2],price:520,sell:260,minFloor:4},
{id:'steelgreaves',name:'鋼の脛当て',part:'feet',ac:3,classes:[0,2],price:420,sell:210,minFloor:4},
// 5F〜：迷宮産
{id:'magichelm',name:'魔法の兜',part:'head',ac:4,classes:[0,1,2,3],price:1800,sell:900,minFloor:5,shop:false},
{id:'ninjagarb',name:'忍び装束',part:'body',ac:5,classes:[3],price:2000,sell:1000,minFloor:6,shop:false},
{id:'holyvestment',name:'聖衣',part:'body',ac:6,classes:[1,2],price:2200,sell:1100,minFloor:6,shop:false},
{id:'galeboots',name:'疾風の靴',part:'feet',ac:4,classes:[0,1,2,3],price:2200,sell:1100,minFloor:6,shop:false},
{id:'knightplate',name:'騎士の板金鎧',part:'body',ac:7,classes:[0],price:2400,sell:1200,minFloor:7,shop:false},
{id:'dragonmail',name:'竜鱗の鎧',part:'body',ac:9,classes:[0],price:6000,sell:3000,minFloor:9,shop:false}
].map(a=>({minFloor:1,...a}));
WEAPONS.push(...ARMOR);
