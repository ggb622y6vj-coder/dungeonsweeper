# ゲームデータ一覧（現コードから抽出）

2026-11-01のコードと一致する参照用スナップショット。編集正本は各dist/*.js、敵のみdata/monsters.csv。snapshot.jsonと本表を編集してもゲームには反映されません。

## classes（4件）

|id|name|hp|mp|attack|ac|hit|hpGrowth|xpFactor|mpGrowth|attackEvery|
|---|---|---|---|---|---|---|---|---|---|---|
|fighter|戦士|32|0|3|6|4|[1,6,3]|0.8|[0,1,0]|1|
|mage|魔法使い|24|20|0|9|1|[1,4,2]|1.2|[1,2,0]|2|
|priest|僧侶|26|15|1|7|2|[1,5,2]|1|[1,2,0]|2|
|thief|盗賊|25|0|1|8|3|[1,5,2]|0.85|[0,1,0]|2|

## weapons（17件）

|range|hitBonus|minAttacks|id|name|dice|classes|price|sell|drop|
|---|---|---|---|---|---|---|---|---|---|
|ranged|0|1|shortbow|短弓|[1,6,0]|[0,3]|45|22|true|
|ranged|0|1|longbow|長弓|[1,8,1]|[0,3]|95|47|true|
|ranged|0|1|compositebow|合成弓|[2,4,1]|[0,3]|160|80|true|
|melee|0|1|dagger|短剣|[1,4,1]|[3]|15|7|true|
|melee|0|1|thiefblade|盗賊の小剣|[1,6,2]|[3]|60|30|true|
|melee|0|1|sword|剣|[1,6,2]|[0]|20|10|true|
|melee|0|1|staff|杖|[1,3,0]|[1]|12|6|true|
|melee|0|1|mace|メイス|[1,6,0]|[2]|18|9|true|
|melee|0|1|longsword|長剣|[1,8,3]|[0]|60|30|true|
|melee|0|1|battleaxe|戦斧|[2,6,1]|[0]|110|55|true|
|melee|0|1|greatsword|大剣|[2,8,2]|[0]|190|95|true|
|melee|0|1|oakstaff|樫の杖|[1,6,1]|[1]|45|22|true|
|melee|0|1|runestaff|ルーンの杖|[2,4,2]|[1]|100|50|true|
|melee|0|1|starstaff|星鉄の杖|[2,6,2]|[1]|180|90|true|
|melee|0|1|ironmace|鉄のメイス|[1,8,1]|[2]|50|25|true|
|melee|0|1|warhammer|戦槌|[2,5,2]|[2]|105|52|true|
|melee|0|1|sacredmace|聖銀のメイス|[2,6,3]|[2]|185|92|true|

## armor（9件）

|id|name|part|ac|classes|price|sell|
|---|---|---|---|---|---|---|
|cap|革帽子|head|1|[0,1,2,3]|30|15|
|helm|鉄兜|head|2|[0,2]|90|45|
|robe|ローブ|body|1|[0,1,2,3]|25|12|
|leather|革鎧|body|2|[0,2,3]|65|32|
|chain|鎖帷子|body|3|[0,2]|130|65|
|plate|板金鎧|body|5|[0]|300|150|
|boots|革靴|feet|1|[0,1,2,3]|30|15|
|greaves|鉄の脛当て|feet|2|[0,2]|100|50|
|wardrobe|守りの法衣|body|3|[1,2]|180|90|

## medicines（2件）

|id|name|kind|spell|description|classes|sell|weight|
|---|---|---|---|---|---|---|---|
|healingPotion|傷薬|medicine|dios|ディオス相当：味方1人のHPを1d8回復|[0,1,2,3]|8|70|
|antidote|解毒剤|medicine|latumofis|ラツモフィス相当：味方1人の毒を解除|[0,1,2,3]|6|30|

## spells（25件）

|id|name|job|level|mp|guaranteed|where|target|effect|value|description|
|---|---|---|---|---|---|---|---|---|---|---|
|dumapic|デュマピック|1|1|2|true|field|front|survey|null|前方の未探索マスを85%の精度で調査。解除・探索はしない。使用ごとにMP倍増、帰還でリセット|
|identifyfoe|識別|1|1|3|true|battle|all|identifyfoe|null|敵全列の正体を見破る|
|halito|ハリト|1|1|2|true|battle|enemy|damage|[1,8]|敵1体に火炎1d8|
|katino|カティノ|1|1|3|true|battle|group|sleep|null|選択した列の敵に睡眠判定。成功率は術者と敵のレベル差で変動、2回の敵行動を停止|
|dilto|ディルト|1|3|3|true|battle|group|debuff|2|選択した列の敵のAC＋2。戦闘終了まで|
|mahalito|マハリト|1|5|7|true|battle|group|damage|[4,6]|選択した列の敵に火炎4d6|
|morlis|モーリス|1|7|5|true|battle|group|debuff|3|選択した列の敵のAC＋3。戦闘終了まで|
|dalto|ダルト|1|7|10|false|battle|group|damage|[6,6]|選択した列の敵に冷気6d6|
|mamorlis|マモーリス|1|9|8|true|battle|all|debuff|3|敵全体のAC＋3。戦闘終了まで|
|lakanito|ラカニト|1|11|16|true|battle|group|death|null|選択した列の敵に即死判定（100−敵Lv×6 %、Lv17以上は無効）。不死・構造体・守護者には無効|
|malor|マロール|1|13|20|true|field|floor|warp|null|訪問済み階の上り階段へ転移。未訪問階は選択不可|
|tiltowait|ティルトウェイト|1|13|30|false|battle|all|damage|[10,15]|敵全体に10d15|
|dios|ディオス|2|1|2|true|both|ally|heal|[1,8]|生存する味方1人のHPを1d8回復|
|kalki|カルキ|2|1|3|true|battle|party|buff|1|味方全員のAC−1。戦闘終了まで|
|matu|マツ|2|3|5|true|battle|party|buff|2|味方全員のAC−2。戦闘終了まで|
|watchful|警戒結界|2|3|4|true|field|party|watchful|null|町へ戻るまで敵の奇襲を防ぐ。味方の先制率は変わらない|
|calfo|カルフォ|2|3|3|false|chest|chest|identify|null|宝箱の罠を95%の精度で識別。解除はしない|
|lomilwa|ロミルワ|2|5|5|true|field|party|light|null|町へ戻るまで左右斜め前のマスを壁越しに表示。未探索の数字は隠したまま|
|dialko|ディアルコ|2|5|4|false|both|ally|cure|null|生存する味方1人の麻痺・睡眠を治す|
|dial|ディアル|2|7|5|true|both|ally|heal|[4,4]|生存する味方1人のHPを4d4回復|
|latumofis|ラツモフィス|2|7|4|false|both|ally|antidote|null|生存する味方1人の毒を治す|
|dialma|ディアルマ|2|9|8|true|both|ally|heal|[8,3]|生存する味方1人のHPを8d3回復|
|lorto|ロルト|2|11|12|true|battle|group|damage|[6,6]|選択した列の敵に6d6|
|madi|マディ|2|11|15|false|both|ally|restore|null|生存する味方1人のHP・状態異常を全回復。蘇生不可|
|malikto|マリクト|2|13|24|true|battle|all|damage|[12,6]|敵全体に12d6|

## monsters（31件）

|id|name|unknown|floor|level|hp|ac|hit|attack|xp|groupSize|gold|race|swings|rear|flee|summon|steal|drain|death|statuses|resistance|boss|icon|summonCap|breath|spell|
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|slime|洞窟スライム|不定形|1|2|[1,6,3]|9|1|[1,4,0]|6|[1,2]|[1,4,2]|不定形|1|false|0|0|0|0|0|[{"type":"poison","chance":0.15}]|なし|false|◉|4|null|0|
|skeleton|骸骨の衛兵|動く死体|1|2|[2,6,4]|7|3|[1,6,1]|12|[2,3]|[2,4,2]|不死|1|false|0|0|0|0|0|[]|毒無効|false|☠|4|null|0|
|wolf|灰狼|素早い牙|1|2|[2,5,3]|6|4|[1,6,2]|14|[2,3]|[2,5,2]|獣|1|false|0|0|0|0|0|[]|なし|false|♞|4|null|0|
|goblin|迷宮ゴブリン|小鬼|1|2|[2,6,5]|5|4|[1,8,0]|17|[2,3]|[2,6,2]|人型|1|false|0.4|0.1|0|0|0|[]|なし|false|♟|4|null|0|
|bat|洞窟蝙蝠|羽ばたく影|1|3|[1,6,2]|8|2|[1,4,0]|13|[1,2]|[1,6,2]|獣|1|false|0|0|0|0|0|[]|なし|false|♞|4|null|0|
|rat|大鼠|小さな獣|1|3|[1,6,2]|8|2|[1,5,0]|15|[2,4]|[1,6,2]|獣|1|false|0|0.4|0|0|0|[]|なし|false|♞|6|null|0|
|spider|髑髏蜘蛛|うごめく虫|1|3|[1,6,2]|8|2|[1,6,0]|17|[1,2]|[1,6,2]|虫|1|false|0|0|0|0|0|[{"type":"poison","chance":0.15}]|なし|false|✥|4|null|0|
|scout|盗賊の斥候|怪しい人影|1|3|[1,6,2]|8|2|[1,6,0]|19|[2,4]|[1,6,2]|人型|1|false|0.4|0|0.1|0|0|[]|なし|false|♟|4|null|0|
|apprentice|迷宮の詐欺師|杖を持つ人影|1|4|[1,6,2]|7|3|[1,6,0]|21|[1,2]|[1,6,2]|人型|1|true|0|0|0|0|0|[]|なし|false|♟|4|null|0.5|
|guardian|迷宮の守護者|武装した人影|1|4|[4,8,14]|3|6|[2,6,2]|75|[1,1]|[4,10,20]|人型|1|false|0|0|0|0|0|[]|なし|true|♛|4|null|0|
|poisonslime|毒スライム|不定形|2|4|[2,6,4]|9|2|[2,6,0]|15|[1,2]|[2,6,4]|不定形|1|false|0|0|0|0|0|[{"type":"poison","chance":0.15}]|なし|false|◉|4|null|0|
|ghostknight|亡霊騎士|動く死体|2|4|[2,6,4]|8|2|[2,6,0]|22|[3,4]|[2,6,4]|不死|1|false|0|0|0|0|0|[]|毒無効|false|☠|4|null|0|
|firefly|火蜻蛉|巨大な虫|2|4|[2,6,0]|8|2|[2,5,0]|24|[1,3]|[2,6,4]|虫|1|false|0|0|0|0|0|[]|炎半減|false|✥|4|{"element":"炎","dice":[2,6,0],"chance":0.6}|0|
|orc|オーク戦士|鬼|2|4|[2,6,4]|8|2|[2,6,0]|26|[1,2]|[2,6,4]|人型|1|false|0.2|0.1|0|0|0|[]|なし|false|♟|4|null|0|
|bigspider|武者蜘蛛|巨大な虫|2|5|[2,10,0]|7|3|[2,6,0]|28|[1,2]|[2,6,4]|虫|1|false|0|0|0|0|0|[]|なし|false|✥|4|null|0|
|mage|洞窟の魔術師|杖を持つ人影|2|5|[2,6,4]|7|3|[2,6,0]|30|[2,4]|[2,6,4]|人型|1|false|0|0|0|0|0|[]|なし|false|♟|4|null|0.5|
|bandit|山賊の頭目|怪しい人影|2|5|[2,6,4]|7|3|[2,6,0]|32|[1,2]|[2,6,4]|人型|1|false|0|0|0.1|0|0|[{"type":"poison","chance":0.15}]|なし|false|♟|4|null|0|
|ghoul|腐肉食い|動く死体|2|5|[2,6,4]|7|3|[2,6,0]|34|[2,4]|[2,6,4]|不死|1|false|0.1|0|0|0|0|[{"type":"paralysis","chance":0.1}]|毒無効|false|☠|4|null|0|
|stone|石の番人|震える石像|2|6|[2,6,4]|6|4|[2,6,0]|36|[1,2]|[2,6,4]|構造体|1|true|0|0|0|0|0|[]|毒無効|false|◆|4|null|0.5|
|general|深層の魔将|武装した人影|2|6|[3,8,5]|6|4|[3,7,0]|75|[1,1]|[2,15,0]|悪魔|2|false|0|0|0|0|0|[{"type":"paralysis","chance":0.1}]|なし|true|♛|4|{"element":"炎","dice":[2,8,0],"chance":0.6}|0|
|acidslime|硫化スライム|不定形|3|6|[3,6,6]|8|3|[3,6,0]|30|[1,2]|[3,6,6]|不定形|1|false|0|0|0|0|0|[{"type":"poison","chance":0.15},{"type":"paralysis","chance":0.1}]|なし|false|◉|4|null|0|
|archer|骸骨の射手|動く死体|3|6|[3,6,6]|7|3|[3,6,0]|47|[2,3]|[3,6,6]|不死|1|true|0|0|0|0|0|[]|毒無効|false|☠|4|null|0|
|blackwolf|黒牙狼|素早い牙|3|6|[3,6,6]|7|3|[3,9,0]|49|[2,4]|[3,6,6]|魔獣|1|false|0|0|0|0|0|[]|なし|false|♞|4|null|0|
|shaman|オーク呪術師|鬼|3|6|[3,6,0]|7|3|[3,6,0]|51|[1,4]|[3,6,6]|人型|1|false|0.1|0.1|0|0|0|[]|なし|false|♟|4|null|0.5|
|venomspider|猛髑髏蜘蛛|おぞましい虫|3|7|[3,8,0]|6|4|[3,7,0]|53|[2,4]|[3,6,6]|虫|1|false|0|0|0|0|0|[]|なし|false|✥|4|null|0|
|thief|影の盗人|怪しい人影|3|7|[3,5,0]|6|4|[3,6,0]|55|[2,4]|[3,6,6]|人型|1|false|0|0|0.1|0|0|[]|なし|false|♟|4|null|0|
|dragon|炎竜|竜|3|7|[3,6,0]|6|4|[3,8,0]|57|[1,2]|[3,6,6]|竜|1|false|0|0|0|0|0|[{"type":"poison","chance":0.15}]|炎半減|false|♜|4|{"element":"炎","dice":[2,8,0],"chance":0.5}|0|
|rabbit|赤兎|獣|3|7|[3,4,0]|6|4|[3,5,0]|59|[2,4]|[3,6,6]|獣|1|false|0|0|0|0|0.03|[]|なし|false|♞|4|null|0|
|iron|鉄の番人|不気味な立像|3|8|[3,10,0]|6|5|[3,7,0]|61|[1,2]|[3,6,6]|構造体|1|true|0|0|0|0|0|[{"type":"paralysis","chance":0.1}]|毒無効|false|◆|4|null|0.6|
|terror|テラー|幽霊|3|8|[3,10,0]|6|4|[3,6,0]|50|[1,1]|[3,10,0]|不死|1|true|0|0|0|0.1|0|[]|なし|false|☠|4|null|0|
|watcher|奈落の監視者|武装した人影|3|8|[4,6,9]|5|5|[3,6,2]|83|[1,1]|[3,10,0]|悪魔|2|false|0|0|0|0|0|[{"type":"poison","chance":0.15}]|なし|true|♛|4|{"element":"氷","dice":[2,8,0],"chance":0.6}|0.1|

## traps（5件）

|id|name|weight|
|---|---|---|
|needle|針|25|
|blast|爆発|25|
|poison|毒霧|20|
|paralysis|麻痺の針|15|
|teleport|転移|15|
