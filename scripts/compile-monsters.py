import csv,json,re,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
rows=list(csv.DictReader(open(root/'data/monsters.csv',encoding='utf-8-sig')))
def dice(v):
 m=re.fullmatch(r'(\d+)d(\d+)(?:\+(\d+))?',v);return [int(m[1]),int(m[2]),int(m[3] or 0)]
def pct(v):
 m=re.search(r'(\d+)%',v);return int(m[1])/100 if m else 0
ids={
  "洞窟スライム": "slime",
  "骸骨の衛兵": "skeleton",
  "灰狼": "wolf",
  "迷宮ゴブリン": "goblin",
  "洞窟蝙蝠": "bat",
  "大鼠": "rat",
  "毒蜘蛛": "spider",
  "盗賊の斥候": "scout",
  "迷宮の見習い": "apprentice",
  "迷宮の守護者": "guardian",
  "毒スライム": "poisonslime",
  "亡霊騎士": "ghostknight",
  "火蜻蛉": "firefly",
  "オーク戦士": "orc",
  "大蜘蛛": "bigspider",
  "洞窟の魔術師": "mage",
  "山賊の頭目": "bandit",
  "腐肉食い": "ghoul",
  "石の番人": "stone",
  "深層の魔将": "general",
  "酸性スライム": "acidslime",
  "骸骨の射手": "archer",
  "黒牙狼": "blackwolf",
  "オーク呪術師": "shaman",
  "猛毒蜘蛛": "venomspider",
  "影の盗人": "thief",
  "炎竜": "dragon",
  "赤兎": "rabbit",
  "鉄の番人": "iron",
  "テラー": "terror",
  "奈落の監視者": "watcher"
}
data=[]
for r in rows:
 id=ids[r['確定名']]
 assert r['呪文']=='なし' or re.fullmatch(r'ハリト/単体/\d+%',r['呪文']), 'Unsupported spell'
 assert r['耐性'] in ['なし','毒無効','炎半減'], 'Unsupported resistance'
 group=[int(n) for n in re.findall(r'\d+',r['群れの数'])];group=group if len(group)==2 else group*2
 d=dict(id=id,name=r['確定名'],unknown=r['不確定名'],floor=int(r['出現階層'][0]),level=int(r['Lv']),hp=dice(r['HP']),ac=int(r['AC']),hit=int(r['命中補正']),attack=dice(r['物理ダメージ']),xp=float(r['経験値']),groupSize=group,gold=dice(r['金貨']),race=r['種族'],swings=int(r['攻撃回数']),rear=r['後衛攻撃']=='可',flee=pct(r['逃走']),summon=pct(r['仲間呼び']),steal=pct(r['アイテム奪取']),drain=pct(r['Lv吸収']),death=pct(r['即死']),statuses=[{'type':'poison' if name=='毒' else 'paralysis','chance':int(p)/100} for name,p in re.findall(r'(毒|麻痺)/命中時(\d+)%',r['状態異常'])],resistance=r['耐性'],boss=id in ['guardian','general','watcher'],icon='♛' if id in ['guardian','general','watcher'] else '◈')
 m=re.search(r'列上限(\d+)体',r['仲間呼び']);d['summonCap']=int(m[1]) if m else 4
 d['breath']=None if r['ブレス']=='なし' else {'element':r['ブレス'].split('/')[0],'dice':dice(r['ブレス'].split('/')[2]),'chance':pct(r['ブレス'])}
 d['spell']=pct(r['呪文']);assert d['flee']+d['summon']+d['spell']+(d['breath']['chance'] if d['breath'] else 0)<=1; d['icon']='♛' if d['boss'] else {'不定形':'◉','不死':'☠','獣':'♞','魔獣':'♞','人型':'♟','虫':'✥','構造体':'◆','竜':'♜','悪魔':'♜'}.get(d['race'],'◈');data.append(d)

output='// Generated from data/monsters.csv by scripts/compile-monsters.py.\nconst ENEMIES='+json.dumps(data,ensure_ascii=False,indent=2)+';\n'
path=root/'dist/monster-data.js'
import sys
if '--check' in sys.argv:
 assert path.read_text()==output, 'Monster data is stale; run python scripts/compile-monsters.py'
else:
 path.write_text(output)
print(f'{len(data)} monster definitions validated')
