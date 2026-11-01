// 武器の定義。dice=[個数,面数,固定加算]。classes=0:戦士、1:魔法使い、2:僧侶、3:盗賊。range=melee:近距離、ranged:遠距離。
// 価格・売却額・ドロップ対象もここだけで管理します。
const WEAPONS = [
 {id:'shortbow',name:'短弓',range:'ranged',dice:[1,6,0],classes:[0,3],price:45,sell:22,drop:true},
 {id:'longbow',name:'長弓',range:'ranged',dice:[1,8,1],classes:[0,3],price:95,sell:47,drop:true},
 {id:'compositebow',name:'合成弓',range:'ranged',dice:[2,4,1],classes:[0,3],price:160,sell:80,drop:true},
 {id:'dagger',name:'短剣',dice:[1,4,1],classes:[3],price:15,sell:7,drop:true},
 {id:'thiefblade',name:'盗賊の小剣',dice:[1,6,2],classes:[3],price:60,sell:30,drop:true},
 {id:'sword',name:'剣',dice:[1,6,2],classes:[0],price:20,sell:10,drop:true},
 {id:'staff',name:'杖',dice:[1,3,0],classes:[1],price:12,sell:6,drop:true},
 {id:'mace',name:'メイス',dice:[1,6,0],classes:[2],price:18,sell:9,drop:true},
 {id:'longsword',name:'長剣',dice:[1,8,3],classes:[0],price:60,sell:30,drop:true},
 {id:'battleaxe',name:'戦斧',dice:[2,6,1],classes:[0],price:110,sell:55,drop:true},
 {id:'greatsword',name:'大剣',dice:[2,8,2],classes:[0],price:190,sell:95,drop:true},
 {id:'oakstaff',name:'樫の杖',dice:[1,6,1],classes:[1],price:45,sell:22,drop:true},
 {id:'runestaff',name:'ルーンの杖',dice:[2,4,2],classes:[1],price:100,sell:50,drop:true},
 {id:'starstaff',name:'星鉄の杖',dice:[2,6,2],classes:[1],price:180,sell:90,drop:true},
 {id:'ironmace',name:'鉄のメイス',dice:[1,8,1],classes:[2],price:50,sell:25,drop:true},
 {id:'warhammer',name:'戦槌',dice:[2,5,2],classes:[2],price:105,sell:52,drop:true},
 {id:'sacredmace',name:'聖銀のメイス',dice:[2,6,3],classes:[2],price:185,sell:92,drop:true}
] .map(w=>({range:'melee',hitBonus:0,minAttacks:1,...w}));

const ARMOR=[
{id:'cap',name:'革帽子',part:'head',ac:1,classes:[0,1,2,3],price:30,sell:15},
{id:'helm',name:'鉄兜',part:'head',ac:2,classes:[0,2],price:90,sell:45},
{id:'robe',name:'ローブ',part:'body',ac:1,classes:[0,1,2,3],price:25,sell:12},
{id:'leather',name:'革鎧',part:'body',ac:2,classes:[0,2,3],price:65,sell:32},
{id:'chain',name:'鎖帷子',part:'body',ac:3,classes:[0,2],price:130,sell:65},
{id:'plate',name:'板金鎧',part:'body',ac:5,classes:[0],price:300,sell:150},
{id:'boots',name:'革靴',part:'feet',ac:1,classes:[0,1,2,3],price:30,sell:15},
{id:'greaves',name:'鉄の脛当て',part:'feet',ac:2,classes:[0,2],price:100,sell:50},
{id:'wardrobe',name:'守りの法衣',part:'body',ac:3,classes:[1,2],price:180,sell:90}
];
WEAPONS.push(...ARMOR);
