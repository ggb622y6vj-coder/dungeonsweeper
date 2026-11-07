import csv,json,re,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
rows=list(csv.DictReader(open(root/'data/monsters.csv',encoding='utf-8-sig')))
def dice(v):
 m=re.fullmatch(r'(\d+)d(\d+)(?:\+(\d+))?',v);return [int(m[1]),int(m[2]),int(m[3] or 0)]
def pct(v):
 m=re.search(r'(\d+)%',v);return int(m[1])/100 if m else 0
ids={
  "デンデンツボロ": "dendenko", "ダイナモツボロ": "dynamotuboro", "悪魔いきれ": "akumaikire", "毒の巨人": "poisongiant",
  "キューズドバンブー": "takenoko",
  "テングダケ": "kinoko",
  "武者のくくり樹": "sirakaba",
  "髑髏カヅラ": "insectivore",
  "スライム": "slime",
  "魔物いきれ": "gas",
  "火車髑髏": "kashadokuro",
  "骸骨の衛兵": "skeleton",
  "ハイウルフ": "wolf",
  "ゴブリン": "goblin",
  "吸血コウモリ": "bat",
  "ミソカネズミ": "rat",
  "髑髏グモ": "spider",
  "盗賊の斥候": "scout",
  "迷宮の詐欺師": "apprentice",
  "テアシナガ": "guardian",
  "有毒スライム": "poisonslime",
  "ゴーストナイト": "ghostknight",
  "火トンボ": "firefly",
  "オーク戦士": "orc",
  "武者グモ": "bigspider",
  "洞窟の魔術師": "mage",
  "バンディット": "bandit",
  "コープスイーター": "ghoul",
  "ストーンゴーレム": "stone",
  "ゴヅメヅ": "general",
  "硫化スライム": "acidslime",
  "骸骨の射手": "archer",
  "フェンリル狼": "blackwolf",
  "オーク呪術師": "shaman",
  "髑髏武者グモ": "venomspider",
  "影の盗人": "thief",
  "炎竜": "dragon",
  "赤兎": "rabbit",
  "鉄の番人": "iron",
  "テラー": "terror",
  "地獄の獄卒": "watcher",
  "オーガ": "ogre", "ゾンビ": "zombie", "ハーピー": "harpy", "大毒蛇": "viper", "鎧蟻": "armorant", "闇の司祭": "darkpriest", "迷宮の妖術師": "sorcerer", "ガーゴイル": "gargoyle", "牛頭の門番": "minogate",
  "墓所の亡者": "wight", "トロル": "troll", "人狼": "werewolf", "大蠍": "scorpion", "忍びの者": "ninja", "高位の魔術師": "highmage", "火蜥蜴": "salamander", "ブロブ": "blob", "屍術師": "necromancer",
  "亡霊": "wraith", "石巨人": "stonegiant", "キメラ": "chimera", "闇の騎士": "darkknight", "毒茸の群れ": "fungus", "ダークエルフ": "darkelf", "吸血蝙蝠": "vampbat", "吸血鬼": "vampire",
  "毒竜": "gasdragon", "牛頭の戦士": "minotaur", "肉の巨像": "fleshgolem", "忍びの頭目": "ninjachief", "死霊魔導士": "deathmage", "地獄の犬": "hellhound", "這い寄る大蟲": "crawler", "双頭の巨人": "ettin",
  "レッサーデーモン": "lesserdemon", "雷竜": "bluedragon", "死の騎士": "deathknight", "魔女": "witch", "多頭竜": "hydra", "影の暗殺者": "assassin", "邪眼": "evileye", "魔将軍": "demongeneral",
  "グレーターデーモン": "greaterdemon", "霜の巨人": "frostgiant", "夜の貴族": "vampirelord", "赤竜": "reddragon", "上忍": "masterninja", "リッチ": "lich", "魔界の猟犬": "fiendhound", "古竜": "ancientdragon",
  "魔王の近衛": "royalguard", "堕天使": "fallenangel", "死神": "reaper", "混沌の竜": "chaosdragon", "地震雲": "chaosspawn", "大魔導師": "archmage", "サッキュバス": "succubus", "ダイダラボチ": "daidaraboti", "迷宮の主": "labyrinthlord"
}
BOSSES=['guardian','general','watcher','minogate','necromancer','vampire','ettin','demongeneral','ancientdragon','labyrinthlord']
# 敵の呪文：名前→(id,対象,ダイス,効果)。全体は生存する味方全員に個別ダイス。
MONSTER_SPELLS={'沈黙':('montino','全体',None,'silence'),'ハリト':('halito','単体',[1,8,0],'damage'),'マハリト':('mahalito','全体',[4,6,0],'damage'),'ダルト':('dalto','全体',[5,6,0],'damage'),'マダルト':('madalto','全体',[6,8,0],'damage'),'ティルトウェイト':('tiltowait','全体',[8,8,0],'damage')}
data=[]
for r in rows:
 id=ids[r['確定名']]
 sp=None if r['呪文']=='なし' else re.fullmatch(r'(\S+?)/(単体|全体)/(\d+)%',r['呪文'])
 assert r['呪文']=='なし' or (sp and sp[1] in MONSTER_SPELLS and MONSTER_SPELLS[sp[1]][1]==sp[2]), 'Unsupported spell'
 resistances=r['耐性'].split('・')
 assert (resistances==['なし'] or all(value in {'毒無効','炎半減','氷半減'} for value in resistances)), 'Unsupported resistance'
 group=[int(n) for n in re.findall(r'\d+',r['群れの数'])];group=group if len(group)==2 else group*2
 floor_values=re.findall(r'(\d+)F?',r['出現階層'])
 assert floor_values and '・'.join(f'{n}F' for n in floor_values)==r['出現階層'], f"Invalid floor list: {r['出現階層']}"
 floors=sorted({int(n) for n in floor_values})
 resist_values=[]
 for col in ('魔法使い呪文抵抗','僧侶呪文抵抗'):
  value=r[col]
  assert re.fullmatch(r'\d+',value or '') and 0<=int(value)<=95, f"Invalid {col} for {id}: {value!r}"
  resist_values.append(int(value)/100)
 d=dict(id=id,name=r['確定名'],unknown=r['不確定名'],floor=floors[0],floors=floors,level=int(r['Lv']),hp=dice(r['HP']),ac=int(r['AC']),hit=int(r['命中補正']),attack=dice(r['物理ダメージ']),xp=float(r['経験値']),groupSize=group,gold=dice(r['金貨']),race=r['種族'],mageResist=resist_values[0],priestResist=resist_values[1],swings=int(r['攻撃回数']),rear=r['後衛攻撃']=='可',flee=pct(r['逃走']),summon=pct(r['仲間呼び']),steal=pct(r['アイテム奪取']),drain=pct(r['Lv吸収']),death=pct(r['即死']),statuses=[{'type':{'毒':'poison','麻痺':'paralysis','石化':'stone','恐怖':'fear'}[name],'chance':int(p)/100} for name,p in re.findall(r'(毒|麻痺|石化|恐怖)/命中時(\d+)%',r['状態異常'])],resistance=r['耐性'],boss=id in BOSSES,icon='♛' if id in BOSSES else '◈')
 assert not d['boss'] or len(floors)==1, f"Guardian must have exactly one floor: {id}"
 m=re.search(r'列上限(\d+)体',r['仲間呼び']);d['summonCap']=int(m[1]) if m else 4
 d['breath']=None if r['ブレス']=='なし' else {'element':r['ブレス'].split('/')[0],'dice':dice(r['ブレス'].split('/')[2]),'chance':pct(r['ブレス'].split('/')[-1])}
 if d['breath']:
  effect=re.fullmatch(r'(.+)\(命中時(\d+)%で(毒|麻痺)状態にする\)',d['breath']['element'])
  if effect:
   assert 0<=int(effect[2])<=100, 'Invalid breath status chance'
   d['breath']['element']=effect[1]
   d['breath']['statuses']=[{'type':{'毒':'poison','麻痺':'paralysis'}[effect[3]],'chance':int(effect[2])/100}]
 d['spell']=pct(r['呪文']);d['spellInfo']=None if not sp else {'id':MONSTER_SPELLS[sp[1]][0],'name':sp[1],'target':'all' if sp[2]=='全体' else 'one','dice':MONSTER_SPELLS[sp[1]][2],'effect':MONSTER_SPELLS[sp[1]][3]};assert d['flee']+d['summon']+d['spell']+(d['breath']['chance'] if d['breath'] else 0)<=1; d['icon']='♛' if d['boss'] else {'植物':'♣','不定形':'◉','不死':'☠','獣':'♞','魔獣':'♞','人型':'♟','虫':'✥','構造体':'◆','竜':'♜','悪魔':'♜'}.get(d['race'],'◈');data.append(d)
for f in sorted({floor for d in data for floor in d['floors']}):
 assert sum(1 for d in data if f in d['floors'] and d['boss'])==1, f'floor {f} needs exactly one boss'
 assert any(f in d['floors'] and not d['boss'] for d in data), f'floor {f} needs normal monsters'

output='// Generated from data/monsters.csv by scripts/compile-monsters.py.\nconst ENEMIES='+json.dumps(data,ensure_ascii=False,indent=2)+';\n'
path=root/'dist/monster-data.js'
import sys
if '--check' in sys.argv:
 assert path.read_text()==output, 'Monster data is stale; run python scripts/compile-monsters.py'
else:
 path.write_text(output)
print(f'{len(data)} monster definitions validated')
