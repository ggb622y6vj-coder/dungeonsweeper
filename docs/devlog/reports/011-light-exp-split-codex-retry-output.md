OpenAI Codex v0.166.0
--------
workdir: /workspace/dungeonsweeper
model: gpt-6.1-sol
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: medium
reasoning summaries: none
session id: 01a19818-6c84-7103-9e39-085beb0c82bf
--------
user
# Codex引き継ぎ指示書（迷宮スイーパー）キュー版

根拠資料：`/workspace/dungeonsweeper-review.md`。旧版：`/workspace/codex-tasks-v1.md`、`/workspace/codex-handoff/`、分割前のキューは `/workspace/dsw-queue-old/`。
対象：1〜3Fのみ実装済み。4F以降は保留。

## 運用
- `todo/` をファイル名順に1回1ファイル処理（1ファイル＝1機能/1修正）。完了したら `done/` へ移動、報告は `report/`。
- bugfix（001〜009）を先に、その後に機能・バランス（010〜）。番号は依存順。
- 失敗時は同じファイルを最初からやり直さず、エラーを添えて続きから修正させる。
- ファイル名の light / heavy：LIGHT＝軽量・安価なモデル、HEAVY＝最上位モデル（設計は決定済み）。

## 実行順
| ファイル | ティア | 依存 | 内容 |
|---|---|---|---|
| 001-bugfix-name-regex | LIGHT | なし | キャラクター名に ( や [ を含むとログ描画で例外が出てゲームが止まるバグを直す（最優先）。 |
| 002-bugfix-poison-death-log | LIGHT | なし | 探索中（移動時）に毒でHPが0になってもログに何も出ないバグを直す。 |
| 003-bugfix-attack-dead-branch | LIGHT | なし | attack() 内の到達不能な分岐を削除する（挙動不変の整理）。 |
| 004-bugfix-magicplans-length | LIGHT | なし | 呪文・アイテム予約配列が旧3人前提の長さで初期化されるのを、パーティ人数に合わせる。 |
| 005-bugfix-chest-item-pool | LIGHT | なし | 宝箱から店専用品（例：板金鎧300G）が1Fでも出るのを、階層の価格上限で制限する。 |
| 006-bugfix-summon-cap | LIGHT | なし | 仲間呼び（例：大鼠40%）で敵が増え続け、XPを無限に稼げる問題を直す。 |
| 007-bugfix-combat-hide-numbers | LIGHT | なし | 戦闘中、一人称視界に迷宮の数字が敵シルエットの背後に重なって見えるのを直す。 |
| 010-light-sim-tool | LIGHT | なし（ゲーム本体は変えない） | 数値調整の前後比較用の戦闘シミュレータを追加する。 |
| 011-light-exp-split | LIGHT | 010推奨 | 成長が速すぎる（探索約20回でLv30）ため、撃破XPを生存者数で分配する。 |
| 012-light-escape-rate | LIGHT | 011 | 逃走率が最低75%で簡単すぎるため、レベル差で決まる式にする。 |
| 013-light-guardian-escort | LIGHT | 012 | 守護者が単独で通常戦より弱い（Lv1でも勝率99%）ため、随伴の敵を付ける。 |
| 014-light-trap-count | LIGHT | 013 | 罠が全階10個固定で深い階ほど密度が下がるため、階層ごとに増やす（1〜3F）。 |
| 015-light-flag-tuning | LIGHT | なし | 旗の発動率を1本4%・上限40%の線形に。 |
| 016-light-floor-config-10f | LIGHT | 014 | MAX_FLOOR=10、罠ダメージの階層倍率。 |
| 017-light-monsters-4-10f | LIGHT | 013,016 | 88種のモンスターCSVと全体呪文（assets/）。 |
| 018-light-items-4-10f | LIGHT | 017 | 武器・防具・薬の追加、迷宮限定品（shop:false）、hitBonus。 |
| 019-light-chest-loot-table | LIGHT | 005,018 | 階層別の宝箱・ドロップ抽選表。 |
| 01A-heavy-10f-final-boss | HEAVY | 016,017 | 10Fの迷宮の主を倒すとクリア。 |
| 020-heavy-death-status | HEAVY | 011（XP分配後） | 【死亡・灰・ロスト 手順1/3】死亡状態を導入し、帰還で死者が無料復活しないようにする（寺院は次の021）。 |
| 021-heavy-temple | HEAVY | 020 | 【死亡・灰・ロスト 手順2/3】町に寺院を作り、死亡/灰を蘇生できるようにする。 |
| 022-light-lost-roster | LIGHT | 021 | 【死亡・灰・ロスト 手順3/3】ロストしたキャラクターを訓練所で表示し、加入不可・抹消のみ可能にする。 |
| 023-light-inn | LIGHT | 022 | 帰還時の無料全快をやめ、宿屋で回復とレベルアップを行うようにする。 |
| 030-heavy-corpse-on-wipe | HEAVY | 023 | 【遺体と救出 手順1/2】全滅時に即町へ戻して全快するのをやめ、遺体を迷宮に残す。 |
| 031-heavy-corpse-rescue | HEAVY | 030 | 【遺体と救出 手順2/2】別パーティが遺体マスへ到達すると回収できるようにする（マインスイーパー統合：救出隊は新しく生成された罠を推論して進む）。 |

## 保留（todoに入れない）
- 物理命中の列補正：ユーザー確認済み（バグ）→ todo/001b-bugfix-row-hit-modifier.md へ移動
- 4F以降の敵スケーリング・階層テーブル・最終目標。
- 宝箱罠の拡充と盗賊「調べる→解除」、未鑑定・呪い装備、VIT/AGI/LUC・種族・属性・転職、呪文追加。

## 共通ルール（各ファイルにも記載）
## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

共通テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check`

---
# 011-light-exp-split
ティア：LIGHT　依存：010推奨

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
成長が速すぎる（探索約20回でLv30）ため、撃破XPを生存者数で分配する。

## 変更内容
- dist/game.js `awardVictory(combat)`：各生存者に `Math.max(1, Math.floor(xp / 生存者数))`。ログ「生存者は経験値◯◯を獲得。」の◯◯は1人あたりの値。
- docs/SPECIFICATION.md 5章「逃走・報酬」の記述を更新。既存テストでXP前提の箇所は意図を保って修正。

## OKの判定方法
1. テスト：`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` が全PASS。
- 回帰テスト：生存3人・合計100→各33、生存1人→100、死者は加算なし。
- sim（010があれば）：Lv1/1F の結果を報告。
- 手動：戦闘勝利ログの経験値が1人分の値になっていること。

## 1回目の失敗メモ（2026-11-02 02:00 JST, gpt-6-luna low）
- awardVictory の分配・SPECIFICATION 更新・回帰テスト追加までは実装したが、`node tests/game.cjs` が既存の「flee rewards」ケース（chestBattle で逃走時に報酬なし、`s.members[0].xp!==xp` 等で失敗）で落ちた。追加したテストが後続テストの状態（Math.random の上書き、パーティ・敵の状態など）を汚している可能性が高い。
- 差分は /workspace/dsw-queue/report/011-attempt1.diff（作業ツリーは元に戻し済み）。この差分を参考に続きから修正し、共通テスト全PASSまで確認すること。追加テストは状態を元に戻すか独立させる。
- 次回は gpt-6.1-sol medium で実行。

前回差分（参考）:
diff --git a/dist/game.js b/dist/game.js
index d2b5de0..b99492f 100644
--- a/dist/game.js
+++ b/dist/game.js
@@ -25,7 +25,7 @@ function hits(hit,ac){let roll=dice(1,20).value;return roll===20||(roll!==1&&rol
 function reachableEnemyGroups(i,combat=s.enemy){let groups=enemyGroups(combat).filter(g=>g.units.some(e=>e.hp>0));return equippedWeapon(i)?.range==='ranged'?groups:groups.slice(0,2)}
 function selectedEnemy(i){let key=s.attackRows?.[i];if(key==null){let legacy=s.enemy.units.find(e=>e.uid===s.enemy.target);key=legacy?rowKey(legacy):rowKey(s.enemy.units[0])}if(!reachableEnemyGroups(i).some(g=>String(g.key)===String(key)))return undefined;return s.enemy.units.find(e=>String(rowKey(e))===String(key)&&e.hp>0)}
 function killReward(e){if(e.rewarded)return;e.rewarded=true;let d=enemyDefinition(e.id);s.enemy.pendingXP=(s.enemy.pendingXP||0)+d.xp;s.enemy.pendingGold=(s.enemy.pendingGold||0)+Math.floor(dice(...d.gold).value/3);s.enemy.pendingDrops=(s.enemy.pendingDrops||0)+1;log('敵を倒した。')}
-function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=xp;if(xp)log(`生存者は経験値${xp}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}
+function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0,survivors=s.hp.filter(hp=>hp>0).length,share=Math.max(1,Math.floor(xp/Math.max(1,survivors)));for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=share;if(xp&&survivors)log(`生存者は経験値${share}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}
 
 function attack(){if(logBusy()||!s.enemy||s.done)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}identifyEnemies();let cmds=s.commands.slice();log('── ターン開始 ──');for(let i=0;i<s.members.length;i++)if(s.hp[i]>0&&cmds[i]==='guard')log(`${NAMES[i]}は身を守る。`);for(let i=0;i<s.members.length;i++){if(s.hp[i]<=0)continue;if(s.ailments[i].paralysis>0){log(`${NAMES[i]}は麻痺して動けない。`);continue}if(cmds[i]==='guard')continue;if(cmds[i]==='dispel'){dispelUndead(i);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(cmds[i]==='item'){let plan=s.itemPlans[i];if(plan)useMedicine(i,plan.slot,plan.target,true,plan.id);continue}if(cmds[i]==='spell'){let plan=s.magicPlans[i];if(plan){let x=magic(plan.id),t=plan.target;if(x&&(x.target==='enemy'||x.target==='group')&&!validMagicTarget(x,t)){let original=s.enemy.units.find(e=>e.uid===t);t=s.enemy.units.find(e=>e.hp>0&&original&&rowKey(e)===rowKey(original))?.uid??s.enemy.units.find(e=>e.hp>0)?.uid}castMagic(i,plan.id,t)}else log(`${NAMES[i]}の呪文が選ばれていない。`);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(!canWeaponAttack(i)){log(`${NAMES[i]}の近接攻撃は後衛から届かない。`);continue}let e=selectedEnemy(i);if(!e){log(`${NAMES[i]}の攻撃対象の列は全滅している。`);continue;}let d=enemyDefinition(e.id);let result=physicalAttack(i,e);if(!result.hitsCount){log(`${NAMES[i]}の攻撃は${enemyDisplay(e)}にかわされた。`);continue}let damage=flagDamage(result.damage);e.hp=Math.max(0,e.hp-damage);log(`${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。`);if(e.hp===0)killReward(e);if(!s.enemy.units.some(e=>e.hp>0))break}if(!s.enemy.units.some(e=>e.hp>0)){finishMonsterBattle()}else if(s.enemy.initiative==='party'){s.enemy.initiative='normal'}else{enemyTurn(cmds)}resetCommandEntry();resetPartyCommands();if(s.enemy){let next=s.enemy.units.find(e=>e.hp>0);s.attackRows=s.attackRows.map(key=>s.enemy.units.some(e=>String(rowKey(e))===String(key)&&e.hp>0)?key:rowKey(next))}render()}
 function ensureStats(){if(!s.members){s.members=CLASSES.slice(0,3).map(c=>({level:1,xp:0,maxHP:c.hp,maxMP:c.mp,attack:c.attack,ac:c.ac}));s.mp=CLASSES.slice(0,3).map((c,i)=>i===1?Math.min(c.mp,(s.spell===undefined?c.mp:s.spell*SPELLS.blast.cost)):i===2?Math.min(c.mp,(s.heal===undefined?c.mp:s.heal*SPELLS.heal.cost)):0);if(s.area==='town')s.mp=s.members.map(m=>m.maxMP);delete s.spell;delete s.heal}s.mp??=s.members.map(m=>m.maxMP);if(s.enemy&&!s.enemy.units){let old=s.enemy,id=old.boss?'guardian':'skeleton';s.enemy={boss:old.boss,target:0,units:[{id,uid:0,hp:old.hp,rewarded:false}]}}}
diff --git a/docs/SPECIFICATION.md b/docs/SPECIFICATION.md
index 2fbf6c7..f69a0ce 100644
--- a/docs/SPECIFICATION.md
+++ b/docs/SPECIFICATION.md
@@ -58,7 +58,7 @@ STR補正はSTR≤5ならSTR−6、STR≥16ならSTR−15、他0。STR18は+3。
 ### 逃走・報酬
 
 ボス・誤旗デバフ時は逃走不可。逃走率は75%＋少人数補正（1人15、2人10、3人5）＋有効味方Lv合計≥有効敵Lv合計なら20、上限100%。味方は生存・非毒・非麻痺、敵は生存・非睡眠が集計対象。失敗は敵ターン（味方先制権があればそれを消費）。
-撃破時は経験値・金貨・ドロップ回数を戦闘内へ蓄積し、敵が全員いなくなった後に配分。生存者各人に合計XPを付与（人数で分割しない）。逃げた敵・解呪で消えた敵は報酬なし。
+撃破時は経験値・金貨・ドロップ回数を戦闘内へ蓄積し、敵が全員いなくなった後に配分。合計XPを勝利確定時の生存者数で割り、各生存者に `max(1, floor(合計XP / 生存者数))` を付与する。戦闘不能者は受け取らない。逃げた敵・解呪で消えた敵は報酬なし。
 敵識別は各列について、生存メンバー最大IQ×3%（最大100%）を開始時・毎ターンに抽選。成功後は戦闘中保持。確定名を知らせる専用ログは削除済み。敵一覧・対象選択・攻撃ログは識別状態に従う。
 
 ### 呪いを解く（暫定）
diff --git a/tests/game.cjs b/tests/game.cjs
index c89e981..0da6836 100644
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -121,8 +121,8 @@ s.area='dungeon';s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.cell
 `);drain();run(`s.cells[s.pos].chest={gold:10,trap:'needle',opened:false};var goldBefore=s.gold,hpBefore=s.hp.reduce((a,b)=>a+b);Math.random=()=>.99;thiefOpenChest();if(currentChest()||s.cells[s.pos].chest||s.gold!==goldBefore||s.hp.reduce((a,b)=>a+b)>=hpBefore)throw Error('thief failure trap and destroy');`);drain();run(`
 s.hp=s.members.map(m=>m.maxHP);s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['guard','guard','guard','fight','fight','fight'];var rear=s.hp.slice(3).join(),enemyBefore=s.enemy.units[0].hp;Math.random=()=>.99;attack();if(s.enemy.units[0].hp!==enemyBefore||s.hp.slice(3).join()!==rear||s.commands.length!==6)throw Error('front rear reach');
 `);drain();run(`
-s.hp=s.members.map(m=>m.maxHP);var xpBefore=s.members.map(m=>m.xp);killReward({id:'slime',hp:0,rewarded:false});if(s.members.some((m,i)=>m.xp!==xpBefore[i]))throw Error('premature xp');let earned=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members.some((m,i)=>m.xp!==xpBefore[i]+earned))throw Error('all six xp');
-`);drain();run(`s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};resetCommandEntry();for(let i=0;i<6;i++){s.commands[i]='guard';confirmCommand(i)}if(commandIndex!==6||$('#attack').hidden)throw Error('six sequential');for(let [name,kind] of Object.entries({怪力:'power',堅牢:'guard',呪禁:'magic'}))if(!coloredLog(name+'の旗がはためいた！').includes('log-flag-'+kind))throw Error('flag log color');`);
+{let combat=s.enemy,savedHP=s.hp.slice(),savedUnits=combat.units;s.hp=s.members.map(m=>m.maxHP);var xpBefore=s.members.map(m=>m.xp);killReward({id:'slime',hp:0,rewarded:false});if(s.members.some((m,i)=>m.xp!==xpBefore[i]))throw Error('premature xp');combat.pendingXP=100;let earned=combat.pendingXP;s.hp[3]=s.hp[4]=s.hp[5]=0;awardVictory(combat);if(s.members.some((m,i)=>m.xp!==xpBefore[i]+(i<3?33:0)))throw Error('three survivor XP split');if(!logQueue.some(x=>x.text==='生存者は経験値33を獲得。'))throw Error('per survivor XP log');combat.pendingXP=100;combat.units=[{id:'slime',uid:0,row:0,hp:1,rewarded:false}];s.hp=s.members.map((_,i)=>i===0?20:0);xpBefore=s.members.map(m=>m.xp);awardVictory(combat);if(s.members.some((m,i)=>m.xp!==xpBefore[i]+(i===0?100:0)))throw Error('single survivor XP');combat.pendingXP=100;s.hp=s.members.map(()=>0);xpBefore=s.members.map(m=>m.xp);awardVictory(combat);if(s.members.some((m,i)=>m.xp!==xpBefore[i]))throw Error('dead members XP');s.enemy=null;s.hp=savedHP;combat.units=savedUnits;}
+`);drain();run(`s.enemy=null;`);drain();run(`s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};resetCommandEntry();for(let i=0;i<6;i++){s.commands[i]='guard';confirmCommand(i)}if(commandIndex!==6||$('#attack').hidden)throw Error('six sequential');for(let [name,kind] of Object.entries({怪力:'power',堅牢:'guard',呪禁:'magic'}))if(!coloredLog(name+'の旗がはためいた！').includes('log-flag-'+kind))throw Error('flag log color');`);
 console.log('PASS six-person defaults/migration, reordered jobs and gear, bench/restore/save, doubled survey/accuracy/reset, thief success/failure, front/rear combat and six XP/commands');
 drain();run(`s=structuredClone(sixInitial);s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.enemy=null;s.done=false;delete s.cells[s.pos].chest;ensureProfile();s.inventory[0]=['healingPotion','sword','helm'];s.equipped[0]=1;s.armor[0]={head:2};var beforeTotal=s.inventory.reduce((n,a)=>n+a.length,0);if(!transferItem(0,0,4)||s.inventory[4].at(-1)!=='healingPotion'||s.equipped[0]!==0||s.armor[0].head!==1||equippedWeapon(0).id!=='sword')throw Error('transfer / shifted gear');if(s.inventory.reduce((n,a)=>n+a.length,0)!==beforeTotal||transferItem(0,0,4)||transferItem(0,1,4)||transferItem(0,0,0))throw Error('equipped / self transfer');s.inventory[0].push('antidote');s.inventory[1]=Array(10).fill('sword');if(transferItem(0,2,1))throw Error('full recipient');s.enemy={units:[]};if(transferItem(0,2,4)||applyPartyOrder([5,1,2,3,4,0]))throw Error('combat lock');s.enemy=null;var identity=s.members[0].id;var gear=s.inventory[0].join();if(!applyPartyOrder([5,1,2,3,4,0])||s.members[5].id!==identity||s.inventory[5].join()!==gear||equippedWeapon(5).id!=='sword'||s.armor[5].head!==1)throw Error('field reorder identity');if(applyPartyOrder([0,0,2,3,4,5]))throw Error('duplicate formation');if($('#party').onclick!==$('#statsopen').onclick)throw Error('party entry');renderStats();if($('#statsbody').innerHTML.includes('習得状況')||!$('#statsbody').innerHTML.includes('>アイテム</button>'))throw Error('labels');`);console.log('PASS item transfer/capacity/equipped guard, slot remapping, field reorder identity, combat locks and party entry');
 drain();run(`s=structuredClone(sixInitial);ensureProfile();s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.done=false;s.enemy=null;s.watchful=false;s.cells.forEach(c=>{c.trap=false;c.flag=false;c.type='';delete c.chest});s.pos=27;s.dir=0;var eps=(a,b)=>Math.abs(a-b)<1e-9;for(let n=0;n<=8;n++){around(27).forEach((j,k)=>s.cells[j].trap=k<n);if(!eps(encounterRate(27,true),.10+n*.005)||!eps(encounterRate(27,false),.16)||!eps(encounterRate(27,true,'strafeLeft'),.11+n*.005)||!eps(encounterRate(27,false,'strafeRight'),.17))throw Error('encounter rates');}Math.random=()=>.099;if(rollInitiative()!=='enemy')throw Error('enemy initiative');Math.random=()=>.1;if(rollInitiative()!=='party')throw Error('party initiative');Math.random=()=>.2;if(rollInitiative()!=='normal')throw Error('normal initiative');Math.random=()=>.11;if(rollInitiative('back')!=='enemy'||rollInitiative('forward')!=='party')throw Error('back modifier');s.watchful=true;if(rollInitiative('back')!=='normal')throw Error('watchful blocks');Math.random=()=>.15;if(rollInitiative()!=='party'||rollInitiative('forward',true)!=='normal')throw Error('watchful preserves party / boss');s.watchful=false;s.cells.forEach(c=>c.trap=false);var priest=s.members.findIndex((m,i)=>jobOf(i)===2);s.members[priest].level=3;ensureMagic();s.mp[priest]=10;if(!s.members[priest].known.includes('watchful')||!castMagic(priest,'watchful',null)||!s.watchful||s.mp[priest]!==6)throw Error('watchful spell');`);drain();run(`s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(!s.watchful)throw Error('ward floor persistence');`);drain();run(`enterTown();if(s.watchful)throw Error('ward town reset');s.area='dungeon';s.pos=27;s.cells[27].type='';s.hp=s.members.map(m=>m.maxHP);var realInitiative=rollInitiative;rollInitiative=()=>{Math.random=()=>.999;return 'enemy'};Math.random=()=>.5;var hpBefore=s.hp.slice();encounter(27,false,'back');if(!s.hp.some((h,i)=>h<hpBefore[i])||s.enemy.initiative!=='normal'||logQueue[0].text!=='敵の奇襲！'||logQueue[0].hp.join()!==hpBefore.join()||!logQueue[0].encounter)throw Error('enemy opening / snapshot');`);timers.shift()();run(`if(encounterNotice!=='敵の奇襲！'||!$('#scene').innerHTML.includes('encounter-notice'))throw Error('encounter overlay');`);drain();run(`if(encounterNotice)throw Error('notice cleanup');s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.cells[27].type='';rollInitiative=()=>'party';Math.random=()=>.5;encounter(27);if(logQueue[0].text!=='敵はまだ気づいていない！')throw Error('party banner');`);drain();run(`s.commands=s.members.map(()=>'guard');var beforeHP=s.hp.join();attack();if(s.hp.join()!==beforeHP||s.enemy.initiative!=='normal')throw Error('party free turn');`);drain();run(`Math.random=()=>.999;s.commands=s.members.map(()=>'guard');attack();if(s.hp.join()===beforeHP)throw Error('enemy turn resumes');rollInitiative=realInitiative;for(let kind of FLAG_KINDS){if(flagChance({counts:{[kind]:0}},kind)!==0||flagChance({counts:{[kind]:1}},kind)!==.005||flagChance({counts:{[kind]:5}},kind)!==.125||flagChance({counts:{[kind]:10}},kind)!==.5||flagChance({counts:{[kind]:100}},kind)!==.5)throw Error('flag curve');}`);drain();console.log('PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, 0.5-50% curve');
@@ -161,7 +161,7 @@ try {
 } finally {s=savedState;Math.random=savedRandom;}
 }`);console.log('PASS physical row hit thresholds 10/13/16 (50%/35%/20%) and collapse with stable row IDs');
 drain();run(`{let savedNamesState=structuredClone(s);s.area='town';s.enemy=null;s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.cells[s.pos].chest=null;s.members=[];s.reserve=[];for(let name of ['(','[x','a.b','a*']){let recruit=generateRecruit(name,0);if(!recruit||!registerRecruit(recruit))throw Error('special name register');let roster=trainingRoster(),index=roster.findIndex(r=>r.members.id===recruit.members.id);if(!setPartyFromRoster(roster,[index]))throw Error('special name join');refreshNames();if(coloredLog('テスト').includes('log-ally'))throw Error('unrelated name color');if(coloredLog('aXbの攻撃').includes('log-ally'))throw Error('regex metacharacter interpreted');s.members=[];s.reserve=[];refreshNames();}s=savedNamesState;refreshNames();}`);console.log('PASS special character names do not break log coloring or match as regex');
-drain();run(`s.area='dungeon';s.done=false;s.hp=s.members.map(()=>20);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.ailments[0].poison=true;var poisonBefore34=s.hp[0],count34=logQueue.length;tickAilments(false);if(s.hp[0]!==poisonBefore34-2||logQueue.length!==count34)throw Error('silent exploration poison');s.ailments[0].poison=false;s.enemy={chestBattle:false,units:[{id:'slime',uid:1,row:0,hp:0,rewarded:false},{id:'wolf',uid:2,row:1,hp:5,rewarded:false}]};var xp34=s.members[0].xp,gold34=s.gold;Math.random=()=>.99;killReward(s.enemy.units[0]);if(s.members[0].xp!==xp34||s.gold!==gold34)throw Error('premature rewards');killReward(s.enemy.units[0]);if(s.enemy.pendingXP!==enemyDefinition('slime').xp)throw Error('duplicate rewards');var reward34=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members[0].xp!==xp34+reward34||s.gold<=gold34)throw Error('victory rewards');var paid34=s.gold;awardVictory(s.enemy);if(s.gold!==paid34)throw Error('duplicate victory');`);console.log('PASS silent exploration poison and deferred victory rewards');
+drain();run(`s.area='dungeon';s.done=false;s.hp=s.members.map(()=>20);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.ailments[0].poison=true;var poisonBefore34=s.hp[0],count34=logQueue.length;tickAilments(false);if(s.hp[0]!==poisonBefore34-2||logQueue.length!==count34)throw Error('silent exploration poison');s.ailments[0].poison=false;s.enemy={chestBattle:false,units:[{id:'slime',uid:1,row:0,hp:0,rewarded:false},{id:'wolf',uid:2,row:1,hp:5,rewarded:false}]};var xp34=s.members[0].xp,gold34=s.gold;Math.random=()=>.99;killReward(s.enemy.units[0]);if(s.members[0].xp!==xp34||s.gold!==gold34)throw Error('premature rewards');killReward(s.enemy.units[0]);if(s.enemy.pendingXP!==enemyDefinition('slime').xp)throw Error('duplicate rewards');var reward34=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members[0].xp!==xp34+Math.max(1,Math.floor(reward34/s.hp.filter(h=>h>0).length))||s.gold<=gold34)throw Error('victory rewards');var paid34=s.gold;awardVictory(s.enemy);if(s.gold!==paid34)throw Error('duplicate victory');`);console.log('PASS silent exploration poison and deferred victory rewards');
 drain();run(`s.done=false;s.area='dungeon';s.hp=s.members.map(()=>20);s.enemy={units:[{id:'wolf',uid:0,row:0,hp:10},{id:'slime',uid:1,row:1,hp:10}]};s.members.forEach(m=>m.intelligence=10);Math.random=()=>.99;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!=='素早い牙')throw Error('unknown');Math.random=()=>0;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!==enemyDefinition('wolf').name||!s.enemy.units[1].identified)throw Error('identify');Math.random=()=>.99;identifyEnemies();if(!s.enemy.units[0].identified)throw Error('identification persistence');s.enemy.units.forEach(e=>e.identified=false);identifyEnemies(true);if(!s.enemy.units.every(e=>e.identified))throw Error('identify spell effect');`);console.log('PASS identification failure, success, persistence and spell effect');
 // CSV monster implementation: deterministic branch and integration checks.
 drain();run(`

注意: /workspace/dsw-queue には書き込めない。報告はstdoutに出すこと。リポジトリ内に report/ フォルダを作らないこと。

codex
011の経験値分配に絞り、現行コードと前回の失敗箇所を確認して修正します。共通テストと、010のシミュレータがあればLv1・1Fの検証まで行い、結果はここに報告します。

exec
/bin/bash -lc "pwd && rg --files -g 'AGENTS.md' -g 'README*' -g '*sim*' -g 'HANDOFF.md' -g 'SPECIFICATION.md'" in /workspace/dungeonsweeper
 succeeded in 0ms:
/workspace/dungeonsweeper
AGENTS.md
docs/HANDOFF.md
docs/SPECIFICATION.md
README.md
data/README.md

exec
/bin/bash -lc 'cat /home/box/.codex/plugins/cache/openai-curated-remote/cloud-environment/0.1.2/skills/runtime/SKILL.md' in /workspace/dungeonsweeper
 succeeded in 0ms:
---
name: cloud-environment-runtime
description: Read at the start of work in a managed cloud environment. Inspect network policy and configured credentials; build and run Docker containers with the session proxy and CA trust; use Tailscale VPN access, configure TCP forwarding, and diagnose access failures.
---

Read this skill at the start of work in a managed cloud environment, including
resumed work. Before building or running Docker containers, read
[Docker in Docker](references/docker.md) and follow its proxy and CA guidance.

Use `cloud_environment.environment_status` at the start of work in a managed cloud
environment and when diagnosing network or authentication failures. It takes no
arguments. The runtime selects the instance and checks access as the task's actor.
The result describes the thread's managed instance; it does not describe extra
attached environments or the latest editable configuration draft.

Before network work, read [Cloud environment networking](references/networking.md)
and inspect the selected executor's `/etc/codex/network-policy.json`. If the
supported policy snapshot reports `vpn_configured: true`, also read
[Tailscale VPN access](references/vpn.md). The flag indicates configuration,
not VPN health. Also read the VPN reference when explicitly diagnosing VPN access,
even if the flag is missing or false. `environment_status` reports HTTP policy
and credential readiness, not TCP grants or VPN health.

Use the returned network policy, secret bindings, runtime variable names, and
outbound identity aliases to plan commands. Do not print credential values, dump
the process environment, or inspect secret files to discover their contents.
A configured variable may hold a proxy placeholder; that alone does not mean its
credential is missing. Use the configured SDK or CLI normally.

Treat desired configuration and observed readiness separately. Require
`observations_current: true` and the individual state `ready` before treating a
secret, runtime variable, or outbound identity as ready. Network policy is applied
only when its current state is `enforced`. Missing or any other states, including
`skipped` and `unsupported`, do not establish readiness. Recheck after setup
completes. Ready observations describe setup, not guaranteed authorization for
every remote API call. Diagnose the actual command's error too.

For CLI or SDK profile selection, read the worker's non-secret JSON manifest at
`OIC_MANIFEST_PATH`, if present. Version 1 contains a `connections` list. Select
the entry whose `alias` matches the identity needed for the task; `is_default`
identifies the provider's default, not necessarily the intended identity. Use the
selected entry's fields to set these environment variables for that command only:

| `provider_kind` | Environment variable ← manifest field |
| --- | --- |
| `azure` | `IDENTITY_ENDPOINT` ← `identity_endpoint`; `AZURE_CONFIG_DIR` ← `config_dir` |
| `aws` | `AWS_PROFILE` ← `alias`; `AWS_CONFIG_FILE` ← `config_file` |
| `gcp` | `CLOUDSDK_CONFIG` ← `config_dir`; `CLOUDSDK_ACTIVE_CONFIG_NAME` ← `configuration_name`; `GOOGLE_APPLICATION_CREDENTIALS` ← `credentials_file` |

Preserve the inherited runtime authentication headers and guard variables. Use
credential file paths as selectors without reading or printing their contents.
Do not invent aliases, replace injected credentials, or start interactive login
merely because a token is not visible. Inspect the entry's `setup` outcome when
diagnosing CLI failures; a warning does not establish successful CLI setup. If
the manifest version, required entry, or selector fields are unavailable or
unsupported, report the missing setup instead of silently using another identity.

This plugin reads runtime context. Configuration changes require the environment
configuration workflow and its user review. If the tool reports no attached
managed environment, do not reuse an instance ID or readiness result from a prior
turn.

exec
/bin/bash -lc 'cat AGENTS.md README.md docs/HANDOFF.md docs/SPECIFICATION.md' in /workspace/dungeonsweeper
 succeeded in 0ms:
# Codex開発ルール

- README、docs/HANDOFF.md、docs/SPECIFICATION.mdを先に読む。実行コードが現行挙動の正本。古いBALANCE.md等の説明より現コードと新docsを優先。
- ユーザーには日本語で簡潔に報告。作業は実装→検証まで完了し、完了／未完了を区別する。
- 既存のUI・バランスを依頼なしに全面変更しない。個人名・個人情報を画面、URL、公開資料へ追加しない。
- 敵のHP・能力値をプレイ画面に出さない。ダイスの内部計算をログに出さない。
- 戦闘は実データを先に計算し、ログのスナップショットを順に表示する。描画でs.enemyやs.hpだけを参照すると先の結果が漏れる。visibleCombat、displayVitalsを尊重する。
- 敵グループのrow/keyは安定ID。表示上のindexとは別。前列消滅後も予約済み攻撃の対象IDを他の列へ誤転送しない。
- パーティーの職業はjobOf(i)。添字0/1/2で職業を決めない。並び替えはPARTY_FIELDS全体を一緒に動かす。
- セーブキーash-v1と既存移行処理を維持。破壊的なデータ初期化を勝手に行わない。
- 敵の編集はdata/monsters.csv→scripts/compile-monsters.py→dist/monster-data.js。生成JSだけ直さない。
- node tests/game.cjs と python3 scripts/compile-monsters.py --check を実行。変更箇所に応じて意味のある回帰テストを追加。ブラウザ未検証ならその旨を明記。
- package依存なし。不要なフレームワーク・サーバー・データベースを導入しない。
- 原作準拠と主張する計算式には根拠が必要。暫定仕様を原作そのものと説明しない。
- 公開は別工程。既存Sitesの認証・権限を確認する。GitHub push=本番反映と誤報しない。
# 迷宮スイーパー — Codex引き継ぎ版

Wizardry風の一人称迷宮探索とマインスイーパーを組み合わせた日本語ブラウザゲーム。PC・スマートフォン対応。外部ライブラリ・ビルド不要のHTML/CSS/JavaScriptです。

## 最初に読むもの

1. `AGENTS.md` — Codexの作業ルール
2. `docs/HANDOFF.md` — 現在地、注意点、未検証事項
3. `docs/SPECIFICATION.md` — 現行仕様
4. `docs/DATA_CATALOG.md` — 現コードから抽出した全データ
5. `docs/ARCHITECTURE.md` — ファイル構成、セーブ、ログ同期

## 起動・テスト

必要環境：Node.js 22以上、Python 3。npmパッケージのインストールは不要。

```sh
python3 -m http.server 8000 --directory dist
# ブラウザで http://localhost:8000 を開く
```

クラウド環境のプレビューURLは、その環境が案内するものを使用してください。

```sh
node tests/game.cjs
python3 scripts/compile-monsters.py --check
node tests/training.cjs
```

戦闘バランスを比較するには `node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 100` を実行します（職業IDは戦士0・魔法使い1・僧侶2・盗賊3、指定順に最大6人、Lv1〜30・1〜3F、`--boss` で守護者戦）。魔法使いAIは守護者戦と生存敵が1体以下の列ではカティノを使いません。初期装備の同じパーティーを各戦全快・指定レベルに戻し、試行間で継続する固定シードの乱数列で比較します。出力は勝率 `winRate`・全滅率 `wipeRate`・1戦あたり死者数 `deathsPerBattle`・HP損耗率 `hpLossRate`（奇襲前の総HPに対する終了時の純減割合）・平均ラウンド `averageRounds` のJSON 1行です。率は0〜1、勝率と全滅率の残りが逃走率です。敵の退散は戦闘終了として勝利に含め、味方の逃走は区別します。逃走失敗も1ラウンドで、敵の初手奇襲はラウンド数に含めません。200ラウンドで未決着ならエラー終了します。シミュレータの回帰検証は `node scripts/sim/selftest.cjs` です。

敵CSVを編集した場合：

```sh
python3 scripts/compile-monsters.py
node tests/game.cjs
```

## 訓練所

新規ゲームは冒険者0人で開始します。町の「訓練所」で名前・職業を選び、生成された能力値を確認して登録してください。登録直後は控えです。「加入」で最大6人をパーティに加えます。先頭3人が前衛です。
再生成時には前回との差を表示します。登録メンバーは離脱しても能力・経験値・装備・所持品を保持します。抹消は確認画面で確定します。

ブラウザ検証（Playwright PythonとChromiumがある環境で、上記HTTPサーバー起動後）：

```sh
python3 tests/training-browser.py
```

これは独立したブラウザコンテキストでPC・スマートフォン幅を検証します。アプリ自体に追加依存はありません。

## GitHubへ渡す

ZIPを展開し、このREADMEとdist・data・tests・docs・scriptsをリポジトリ直下に配置します。ZIPそのものだけを置いても開発用のファイル配置になりません。`.github`を含めると自動テストが使えます。個人名を避けたい場合、リポジトリ名や公開方法も別途設定してください。

Codex Cloudでそのリポジトリを選び、最初に `docs/CODEX_PROMPT.md` の文を渡してください。GitHubへのアップロードとCodex Cloud環境作成は、この配布物の作成とは別で、まだ実行していません。

## 現在の公開サイト

https://labyrinth-signs.amusedgnome1024.chatgpt.site

GitHubへのpushだけでこのSitesのURLが更新される仕組みは設定していません。`.openai/hosting.json` は既存サイトを識別するメタデータで、認証情報ではありません。公開の接続方法は `docs/HANDOFF.md` を参照してください。

コードの基準コミット：42aa8ff6ca866cda67d014df9a6ced7fe49122ff（2026-11-01）。ゲーム本体はそのまま収録し、この配布版では説明書とCIのみ追加しています。

GitHub Pages用の `.github/workflows/pages.yml` は `main` 更新時に回帰テスト・敵CSV検証・訓練所テストを実行し、成功した場合に `dist/` を配信します。既存Sitesの公開とは別です。
# 引き継ぎ事項

## 基準

2026-11-01時点の公開済みソース42aa8ff6ca866cda67d014df9a6ced7fe49122ffをそのまま収録。最終変更は「近接武器は敵前方2列のみ」「前列消滅時に後続列が詰まる」。直前に僧侶の呪いを解く、PIE表記、未装備−表記、識別成功専用ログ削除を実装。

現行ソースはGitHubのユーザーリポジトリにまだアップロードしていない。このパッケージにGit認証情報、Sites認証情報、ブラウザCookie、個人のゲームセーブはない。過去のGitオブジェクト履歴は含めず、現行全ファイルと直近コミット要約を含む。

## 新環境でまずすること

1. READMEとAGENTSを読む。
2. Node 22以上・Python 3を用意。依存ライブラリ追加不要。
3. node tests/game.cjs／python3 scripts/compile-monsters.py --check。
4. distを配信し、町→迷宮→戦闘→宝箱→階段とスマホ画面を確認。
5. docs/DATA_CATALOG.mdとdata/monsters.csvを使い変更箇所を特定。

## 暫定仕様・確認が必要な点

- 解呪の成功率は独自の暫定式。原作完全準拠ではない。全不死個体が対象でMP不要、経験値・金貨なし。内部ではescaped=trueを流用するため、逃走と解呪の区別を別フィールドに分離する余地がある。
- 4F以降の敵は3Fを再利用。階層別の床罠数・宝箱・出現ウェイトの独立設定テーブルは未実装。
- 物理命中式の敵列補正はユーザー確認済みのバグとして修正済み。閾値に＋3×現在の列index（0始まり）を加え、後列ほど命中しにくくする。前列消滅時は既存の列一覧に従って詰める。原作への一致は未保証。
- 列内の攻撃対象は先頭生存個体固定。過去の原作同様という要望に対する厳密検証は未実施。
- 近接範囲はUIとselectedEnemyで制限される。低レベルphysicalAttack単体は範囲を検査しない。追加攻撃経路を作る際は必ず範囲ガードを通す。
- 旧attackRowUI関数は新コマンド画面とは別に残っている。再利用時は射程制限を合わせること。
- 原作にないMP・旗・マインスイーパー・迷宮再生成を持つ。原作の全面移植ではない。
- 毒無効は敵用関数に実装済みだが、味方から毒を与える攻撃がなく通常のプレイでは使用されない。
- IQ/PIE成長なし。Lv吸収で最大HP/MPは平均値を減らす方式。元の成長履歴の厳密な巻戻しではない。
- テストには旧3人時代のfixture・説明文が残る。通過しても新機能の全経路を検証したことにはならない。
- docs以外のBALANCE.md、SPELLS.md、ITEMS.mdには過去の説明が残りうる。参照資料として保持し、正本はコードと本docs。
- 実行コードの多くは長い1行で構成。大規模整理をするなら動作テストを先に拡充し、機能変更とは分ける。

## 公開・運用

現在URL：https://labyrinth-signs.amusedgnome1024.chatgpt.site
Sites project_id：appgprj_6ae2ad2e8d1881918d4dc813e0e1df34
既存公開版：appgprj_6ae2ad2e8d1881918d4dc813e0e1df34~appgver_8ae5b5974854819189643264976e7cb6
現時点で確認済みの公開範囲は所有者のみ。リンクがあっても第三者に一般公開されているわけではない。

既存Sitesを更新するには、その環境でSitesツール／認証が使用できることと既存プロジェクトへの書込み権限が必要。GitHubとの自動連携は設定されていない。`.openai/hosting.json`だけでは公開できない。新しいSiteを勝手に作らず、既存IDを使う。
別ホストへ公開する場合の配信ルートはdist。URLが変わるとブラウザの既存セーブは自動では移らない。GitHub Pagesの設定はこのパッケージでは行っていない。

## 引き継ぎ範囲

含む：全ゲームソース、インラインCSS/SVG、編集用CSV、全ゲームデータ抽出表、テスト、生成スクリプト、公開識別メタデータ、仕様・設計・既知の制限、GitHub CI。
含まない：利用者ブラウザ内の進行データ、認証情報、過去の全会話・画像、全Git履歴、公開サービス自体の管理データ。会話の古い要求をそのまま再実装せず、現行仕様から開始する。
# 現行仕様書

作成日：2026-11-01（日本時間）。**この資料は実装の記録であり、初代Wizardryの完全再現を保証する資料ではありません。** 数値の正本はコードとDATA_CATALOG.mdを参照。

## 1. ゲームループ・階層

町（酒場・鍛冶屋・迷宮入口）→探索→遭遇／宝箱／守護者→階段で上下移動→町。
1Fは8×8、2Fは10×10、3F以降12×12。上下左右の隣接移動、左右旋回、後退、左右横移動。盤面クリックは旗の操作で、任意マスへ移動する操作ではない。
開始位置と守護者位置は乱数。チェビシェフ距離2以内（縦横の最大差が2以下）には守護者を置かない。開始位置の周囲と、守護者までの生成経路は安全。罠は各階10個。
守護者マスへ入ると確認。いいえで直前マスへ戻る。撃破後その場所が下り階段になる。各階に固有守護者、4F以降は3F設定を使用。
上り階段は一つ前の階へ。1Fからのみ町へ。階段で「いいえ」はその場に留まり、同じマスに居続けても再発火しない。
同じ探索中は各階の探索状況を維持。町へ帰ると全階の記録を破棄し、新しいランダム迷宮にする。スコアとスコア履歴は廃止済み。

## 2. 探索・罠・遭遇

数字は周囲8マスの残っている罠数。作動した罠は消費され、周囲の数字も減る。
未探索へ移動時の遭遇率16%。探索済みは10%＋周囲罠数×0.5ポイント。左右横移動はさらに1ポイント加算。通常マスのみで遭遇判定。
通常は敵奇襲10%、味方先制10%。後退時は敵奇襲12%、味方先制10%。守護者戦は通常開始。警戒結界は敵奇襲を通常開始へ置換。
遭遇バナーは0.5秒。「敵が現れた！」「敵の奇襲！」「敵はまだ気づいていない！」をログにも出す。
床罠は針25%（1人3d6+4）、爆発25%（生存者全員に同一の2d6+3）、毒霧20%（全員毒）、麻痺の針15%（1人麻痺）、転移15%（同じ階の安全な通常マス）。「！」を0.5秒表示し「罠だ！」→罠名と結果の順で表示。
毒は移動・戦闘ターン開始時にHP−2。探索中の毒ダメージログは出さない。麻痺はカウンタ4から同じタイミングで減少し、解除時はログ。HP0は死亡・行動不能。

## 3. パーティー・成長

新規ゲームは0人。訓練所で作成・登録した冒険者から0〜6人を編成。先頭3人が前衛、残りが後衛。0人では迷宮入場不可。酒場での編成とパーティー画面での順番変更も利用可能。
表示能力：Lv、HP、MP、STR、AC、IQ、PIE、経験値、NEXT。正常時の状態表示はなし。異常時のみ色付きタグ。
町帰還時に経験値が足りていれば複数回レベルアップ。Lv上限30。HP/MP成長は職業別ダイス、ACはレベルアップで変化しない。帰還でHP/MPと状態を回復し、レベルアップ結果はポップアップ。
必要経験値は個体ごとに抽選・保存。次Lvの増分＝round(115×(次Lv−1)×職業係数×[0.9,1.1))。係数：戦士0.8、魔法使い1.2、僧侶1、盗賊0.85。旧セーブには専用移行処理あり。
新規生成キャラクターのSTR＝min(18, 生成時STR＋floor((Lv−1)/5))。レベル吸収時も生成時STRを基準とする。
IQ/PIEは生成時の配分値を保持。既存キャラクターの未設定値のみ従来値で補完。現在のレベルアップではIQ/PIEは増減しない。

## 4. 装備・アイテム

各メンバー10枠。武器・防具・薬は同じ枠を消費。装備は武器1、頭1、胴体1、足1。装備一覧の空欄は「−」。職業制限あり。
鍛冶屋で購入・売却。装備中の品は売却・譲渡不可。探索中のアイテム譲渡と順番変更が可能だが、戦闘・ログ再生・確認中などでは不可。
遠距離武器（短弓・長弓・合成弓）は戦士・盗賊用で後衛からも攻撃可。近接武器は味方前衛のみ、敵前方2列まで。遠距離は敵全列。
薬：傷薬＝ディオス相当1d8回復、解毒剤＝毒解除。MP・習得不要、使用すると1個消費。装備品の各数値はDATA_CATALOG参照。

## 5. 戦闘と列

通常遭遇は同階の非守護者から1〜3列を抽選。同じ敵が複数列になることもある。1列は同種で、頭数はその敵の群れ範囲。敵のHPは非表示。
行動可能なメンバー順にコマンドを決める。戦う・守る・呪文・アイテム、僧侶には呪いを解く。後衛の近接装備では戦うを出さない。呪文選択ウィンドウでは呪文のみを決定し、対象は元の画面で選ぶ。対象候補が1列なら選択画面を省略。
全員決定後は行動確認表をパーティー表示上へ出す。「この行動で戦う」「戻る」。処理後は前衛が戦う、後衛が守るへリセット（過去の「全員攻撃へ戻す」要望とは差がある）。
味方全員→敵全員の順で処理。速度による交互行動は未実装。味方先制では最初の敵ターンを省略。敵奇襲では入力前に敵が行動。
敵列の内部row/keyは変えず、全員rewardedとなった列を列一覧から除外し、表示indexを詰める。撃破ログ前はスナップショットにより元の位置に残る。
選択した列の敵が全滅した場合は自動で他列を殴らない。現状、列内では最初の生存個体を選ぶ（ランダム選択ではない）。

### 味方物理攻撃の現在の式

攻撃回数＝min(10,max(武器最低回数,戦士なら1+floor(Lv/5)、他は1))。
STR補正はSTR≤5ならSTR−6、STR≥16ならSTR−15、他0。STR18は+3。
職業命中補正＝戦士・僧侶なら2+floor(Lv/3)、他はfloor(Lv/5)。
現在のコードの閾値＝clamp(21−敵有効AC−職業命中補正−武器命中補正−STR補正＋3×現在の列index,1,19)。0〜19の乱数が閾値以上なら命中。
1命中ダメージ＝max(1,武器ダイス＋STR補正)。合計後に旗効果。列indexは残っている列の並びで0から数え、前列消滅時は詰める。1列目の補正は0、2列目は命中率−15ポイント、3列目は−30ポイント（閾値の上限・下限に達しない場合）。原作への一致は未保証。
敵物理攻撃は別式：1d20で20は命中、1は失敗、他は出目＋敵hit＋味方AC≥20で命中。ACはダメージ減算に使わない。
守るは被ダメージを半分（切上げ）。味方AC＝職業基本AC−装備AC合計−戦闘補助呪文。補助呪文の重ね掛けは最大効果を使用。

### 逃走・報酬

ボス・誤旗デバフ時は逃走不可。逃走率は75%＋少人数補正（1人15、2人10、3人5）＋有効味方Lv合計≥有効敵Lv合計なら20、上限100%。味方は生存・非毒・非麻痺、敵は生存・非睡眠が集計対象。失敗は敵ターン（味方先制権があればそれを消費）。
撃破時は経験値・金貨・ドロップ回数を戦闘内へ蓄積し、敵が全員いなくなった後に配分。生存者各人に合計XPを付与（人数で分割しない）。逃げた敵・解呪で消えた敵は報酬なし。
敵識別は各列について、生存メンバー最大IQ×3%（最大100%）を開始時・毎ターンに抽選。成功後は戦闘中保持。確定名を知らせる専用ログは削除済み。敵一覧・対象選択・攻撃ログは識別状態に従う。

### 呪いを解く（暫定）

僧侶の特殊行動。MP不要、敵全列の生存する不死それぞれに判定。成功率clamp(50%＋(僧侶Lv−敵Lv)×5ポイント,5%,95%)。成功すると消滅、XP・金貨・ドロップなし。全員解呪のみなら宝箱なし。原作の正確な計算式を確認できず暫定導入したもの。

## 6. 魔法

MP1本制。本作独自の消費MP。全25呪文のレベル・MP・対象・効果はDATA_CATALOGを参照。
指定レベル到達時、確定習得の呪文は必ず習得。それ以外は魔法使いIQ/30、僧侶PIE/30で抽選し、後のレベルアップでも未習得分を再抽選。
デュマピック：探索専用、前方未探索のみ調査。85%正しい判定・15%逆転。「前方は罠の可能性あり」「前方にはなにもない」。マスを開けず解除もしない。初回2MP、以降4,8,16…（指数上限あり）。帰還で回数リセット。
ロミルワ：左右斜め前の状態を正面方形内に薄い実線で透かす。未探索の数字は明かさない。帰還まで持続。
識別：敵全列を識別。警戒結界：帰還まで敵奇襲防止。マロール：訪問済み階の上り階段へ移動。
蘇生呪文はなし。町帰還ではHP0のメンバーも回復する。

## 7. 宝箱

未探索マスの遭遇戦で報酬対象の敵を倒すと出現。敵撃破とログ再生が終わるまで操作ボタンを出さない。即開ける・放棄・使える場合カルフォ・盗賊の開封。後回しにはできない。
罠はfixChestTrapが一度設定。カルフォは95%で正しく判別し解除はしない。通常開封は罠を作動させ、生存していれば報酬。盗賊の開封成功率85%、失敗15%では罠作動・箱消滅。
金貨は敵ダイス÷3切捨てを蓄積し、宝箱開封時に3倍。装備品は25%で全WEAPONS（防具含む）から1個。薬は別に30%で1個（傷薬70：解毒剤30）。職業に合う枠のあるメンバーへ自動配布。
通常戦闘の直接装備ドロップは倒した敵ごとに5%でdrop:trueの武器から。階層ごとの宝箱テーブルはまだない。

## 8. 旗

怪力・堅牢・呪禁をループ切替し、設置時の種類をマスに保存。切替しても既設旗は変わらない。地図と視界で色を反映。
正しい旗n本の種類別発動率＝min(50%,0.5%×n²)。1本0.5%、10本50%。戦闘開始時に旗配置のスナップショットを取る。
怪力：合計物理ダメージ×1.5、堅牢：被ダメージ×0.5、呪禁：MP消費半減（切上げ）。呪禁は探索時にも現在配置で抽選。
誤旗が一つでもあれば全種類の正旗抽選を停止、逃走不可。誤旗の種類に応じ、怪力は攻撃×0.65切捨て、堅牢は被害×1.5四捨五入、呪禁は戦闘MP×1.5切上げ。
正旗は発動時だけ「○○の旗がはためいた！」。誤旗のみ戦闘開始時「誤った旗がパーティーを惑わせた！」。ログ色：怪力橙・堅牢緑・呪禁紫。

## 9. UI・ログ

日本語。町のみゲーム題名を表示。探索中ヘッダーを圧縮、パーティー表示を操作ボタンより上へ。パーティー表示のクリックで詳細。スマホ地図は右下のフローティングボタン。
パーティー詳細は2列、アイテム／呪文の短いボタン、金貨右に順番変更。装備詳細は武器・頭・胴体・足の一覧を上部へ。
地図は正方形、現在地は向きを示す三角形、視界対応のマスは控えめな枠。数字は中央。探索者視界は一人称SVG。
ログは0.3秒刻み、遭遇・罠警告は0.5秒。色は味方青／敵赤／ダメージ句橙／回復句緑／呪文紫。ダイスを出さない。

## 10. 訓練所の生成・登録

名前は1〜20文字（前後空白・HTMLに使う記号・制御文字を除く）。職業は戦士・僧侶・魔法使い・盗賊。登録確定前の再生成はセーブ対象外。登録時にUUIDを持つ独立したキャラクターとして控えに保存し、二重登録を防止。

基本STR/IQ/PIEは戦士12/8/8、魔法使い8/12/8、僧侶10/8/12、盗賊10/10/8。この値を下回らず上限18。3〜9点を乱数で自動配分し、戦士はSTR、魔法使いはIQ、僧侶はPIEの選択重みを3、他を1とする。盗賊はSTR/IQ/PIEの重み2/2/1。上限に達した能力は抽選候補から外す。原作の完全再現ではなく、本作向けの生成式。

HPは従来の職業初期値±3、MPは魔法使い20±2・僧侶15±2・戦士と盗賊0。ACは既存バランス維持のため職業別基礎ACを固定し、装備のAC補正を減算する。ACの直接乱数化はしない。Lv.1・XP0で、必要経験値は従来の職業係数と乱数幅で一度生成して保存。初期習得呪文も従来の職業ルールを使用。

訓練所で全登録者の職業・Lv・能力値・参加状態を表示。加入・離脱・前後の並べ替えを行える。満員時は加入不可。登録抹消は別の確認画面で確定し、キャンセル時は変更しない。最後の1人も抹消可能。町の迷宮再生成処理は従来通り。

exec
/bin/bash -lc "git status --short && rg -n 'awardVictory|flee rewards|xpBefore|reward34|simulat|シミュ' tests scripts docs README.md dist/game.js" in /workspace/dungeonsweeper
 succeeded in 0ms:
dist/game.js:28:function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=xp;if(xp)log(`生存者は経験値${xp}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}
README.md:30:戦闘バランスを比較するには `node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 3 --n 100` を実行します（職業IDは戦士0・魔法使い1・僧侶2・盗賊3、指定順に最大6人、Lv1〜30・1〜3F、`--boss` で守護者戦）。魔法使いAIは守護者戦と生存敵が1体以下の列ではカティノを使いません。初期装備の同じパーティーを各戦全快・指定レベルに戻し、試行間で継続する固定シードの乱数列で比較します。出力は勝率 `winRate`・全滅率 `wipeRate`・1戦あたり死者数 `deathsPerBattle`・HP損耗率 `hpLossRate`（奇襲前の総HPに対する終了時の純減割合）・平均ラウンド `averageRounds` のJSON 1行です。率は0〜1、勝率と全滅率の残りが逃走率です。敵の退散は戦闘終了として勝利に含め、味方の逃走は区別します。逃走失敗も1ラウンドで、敵の初手奇襲はラウンド数に含めません。200ラウンドで未決着ならエラー終了します。シミュレータの回帰検証は `node scripts/sim/selftest.cjs` です。
docs/TEST_RESULTS.txt:29:PASS monster floor pools, guardians, flee rewards, mixed victory, summon cap/timing, multi-hit/rear, spell/breath, statuses, instant death, drain, theft, resistances and save migration
scripts/sim/combat.cjs:124:function simulate(opt) {
scripts/sim/combat.cjs:143:  try { process.stdout.write(JSON.stringify(simulate(args(process.argv.slice(2)))) + '\n'); }
scripts/sim/combat.cjs:146:module.exports = { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle };
tests/game.cjs:83:var inventoryBefore=JSON.stringify(s.inventory),goldBefore=s.gold,xpBefore=s.members.map(m=>m.xp).join();enterTown();if(s.area!=='town'||s.floor!==1||Object.keys(s.floors).length||s.cells.some(c=>c.open||c.flag||c.spent||c.disarmed)||s.cells[s.boss].type!=='boss')throw Error('town reset all floors');if(JSON.stringify(s.inventory)!==inventoryBefore||s.gold!==goldBefore||s.members.map(m=>m.xp).join()!==xpBefore)throw Error('town reset profile');enterDungeon();if(s.cells.filter(c=>c.open).length!==1||!s.cells[s.start].open)throw Error('new expedition');
tests/game.cjs:124:s.hp=s.members.map(m=>m.maxHP);var xpBefore=s.members.map(m=>m.xp);killReward({id:'slime',hp:0,rewarded:false});if(s.members.some((m,i)=>m.xp!==xpBefore[i]))throw Error('premature xp');let earned=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members.some((m,i)=>m.xp!==xpBefore[i]+earned))throw Error('all six xp');
tests/game.cjs:164:drain();run(`s.area='dungeon';s.done=false;s.hp=s.members.map(()=>20);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.ailments[0].poison=true;var poisonBefore34=s.hp[0],count34=logQueue.length;tickAilments(false);if(s.hp[0]!==poisonBefore34-2||logQueue.length!==count34)throw Error('silent exploration poison');s.ailments[0].poison=false;s.enemy={chestBattle:false,units:[{id:'slime',uid:1,row:0,hp:0,rewarded:false},{id:'wolf',uid:2,row:1,hp:5,rewarded:false}]};var xp34=s.members[0].xp,gold34=s.gold;Math.random=()=>.99;killReward(s.enemy.units[0]);if(s.members[0].xp!==xp34||s.gold!==gold34)throw Error('premature rewards');killReward(s.enemy.units[0]);if(s.enemy.pendingXP!==enemyDefinition('slime').xp)throw Error('duplicate rewards');var reward34=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members[0].xp!==xp34+reward34||s.gold<=gold34)throw Error('victory rewards');var paid34=s.gold;awardVictory(s.enemy);if(s.gold!==paid34)throw Error('duplicate victory');`);console.log('PASS silent exploration poison and deferred victory rewards');
tests/game.cjs:171:resetMonstersTest('goblin');Math.random=()=>.01;let xp=s.members[0].xp,gold=s.gold;s.enemy.chestBattle=true;enemyTurn(s.commands);if(s.enemy||s.gold!==gold||s.members[0].xp!==xp||s.cells[s.pos].chest)throw Error('flee rewards');
tests/game.cjs:186:}`);console.log('PASS monster floor pools, guardians, flee rewards, mixed victory, summon cap/timing, multi-hit/rear, spell/breath, statuses, instant death, drain, theft, resistances and save migration');
scripts/sim/selftest.cjs:1:// Kept beside the simulator because task 010 explicitly excludes tests/ edits.
scripts/sim/selftest.cjs:4:const { args, simulate, seededRandom, createParty, prepareTrial, planTurn, resolveBattle } = require('./combat.cjs');
scripts/sim/selftest.cjs:93:const report = simulate(opt);
scripts/sim/selftest.cjs:94:assert.deepEqual(simulate(opt), report, 'same invocation must be reproducible');
scripts/sim/selftest.cjs:98:console.log('PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout');

codex
前回失敗の原因として、報酬XPが0でも最低1XPを付与してしまう点が見つかりました。敵の逃走・解呪や報酬の二重処理ではXPを増やさず、正の撃破XPがある場合に生存者へ分配する形で修正します。環境確認にはcloud-environment-runtimeスキルを使用していますが、このセッションに環境状態確認ツールはありません。

exec
/bin/bash -lc "sed -n '1,42p' tests/game.cjs && sed -n '155,180p' tests/game.cjs && sed -n '1,65p' scripts/sim/combat.cjs && sed -n '1,85p' scripts/sim/runtime.cjs" in /workspace/dungeonsweeper
 exited 2 in 0ms:
const vm=require('vm'),fs=require('fs');let timers=[],els={};const el=()=>({style:{},setAttribute(){},addEventListener(){},append(){},replaceChildren(){},classList:{toggle(){}},value:'0',showModal(){this.open=true},close(){this.open=false}});let ctx={crypto:require("node:crypto").webcrypto,structuredClone,document:{querySelector:k=>els[k]??=el(),querySelectorAll:()=>[],createElement:el,style:{},setAttribute(){},addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){timers=[]},Math:Object.create(Math),confirm:()=>true};vm.createContext(ctx);for(let f of ['weapons.js','monster-data.js','balance.js','spells.js','items.js','flags.js','traps.js','combatui.js','party.js','monsters.js','recruits.js','game.js'])vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist',f),'utf8'),ctx);let run=s=>vm.runInContext(s,ctx),drain=()=>{let n=0;while(timers.length){timers.shift()();if(n++>100)throw Error('timer loop')}};run(`/* Explicit legacy fixture for the existing combat regression suite. New games start empty. */ delete s.members;delete s.partyVersion;delete s.inventory;delete s.equipped;delete s.armor;delete s.ailments;s.hp=[32,24,26];delete s.mp;ensureProfile();var sixInitial=structuredClone(s);for(let key of PARTY_FIELDS)s[key]=[0,4,3].map(i=>s[key][i]);s.members.forEach((m,i)=>{m.name=CLASSES[i].name;m.job=i});refreshNames();resetPartyCommands();`);run(`if(s.area!=='town'||s.inventory.some(a=>a.length!==1))throw Error('initial');s.gold=500;buy('longsword',0);if(s.gold!==440||s.inventory[0].length!==2)throw Error('buy');equip(0,1);if(equippedWeapon(0).id!=='longsword')throw Error('equip');sell(0,1);if(s.gold!==440)throw Error('sell equipped');sell(0,0);if(s.gold!==450||s.equipped[0]!==0)throw Error('sell');s.inventory[0]=Array(10).fill('longsword');buy('sword',0);if(s.gold!==450||s.inventory[0].length!==10)throw Error('capacity');enterDungeon();`);drain();run(`Math.random=()=>.4;var near=s.start%8<7?s.start+1:s.start-1;s.cells[near].type='';s.cells[near].trap=true;let old=num(s.start);cell(near);if(!s.cells[near].spent||s.cells[near].trap||num(s.start)!==old-1)throw Error('spent trap');`);drain();run(`cell(s.start);if(!s.pendingStairs)throw Error('stairs');`);drain();run(`answerStairs(false);if(s.pos!==s.start||s.pendingStairs)throw Error('stay');`);drain();run(`var near=s.start%8<7?s.start+1:s.start-1;cell(near);`);drain();run(`cell(s.start)`);drain();run(`answerStairs(true);if(s.area!=='town'||s.hp[0]!==32||s.scan!==5)throw Error('town');let map=s.cells;enterDungeon();if(s.cells!==map)throw Error('map lost')`);drain();run(`s.hp=[10,10,10];castMagic(2,'dios',0);if(s.hp[0]<=10||s.hp[1]!==10||s.mp[2]!==13)throw Error('heal')`);drain();run(`Math.random=()=>.01;var near=s.start%8<7?s.start+1:s.start-1;cell(near);if(!s.enemy)throw Error('random encounter')`);drain();run(`s.enemy.units[0].hp=1;Math.random=()=>.99;s.inventory[0]=['sword'];s.equipped[0]=0;attack();`);drain();run(`if(!s.logs.some(t=>/^敵を倒した。(?:金貨[0-9]+枚を獲得。)?$/.test(t)))throw Error('victory log')`);console.log('PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log');
drain();run(`
s.enemy=null;delete s.cells[s.pos].chest;s.members.forEach(m=>m.xp=650);if(s.members[0].level!==1)throw Error('premature level');enterTown();if(s.members.some(m=>m.level!==m.xpTargets.filter((v,j)=>j>=1&&v<=650).length||m.ac!==CLASSES[s.members.indexOf(m)].ac))throw Error('levelup');if(s.hp.some((h,i)=>h!==maxHP(i))||s.mp.some((h,i)=>h!==s.members[i].maxMP))throw Error('refill');let xp=s.members[0].xp,hp=s.members[0].maxHP;s.done=true;enterDungeon();if(s.members[0].xp!==xp||s.members[0].maxHP!==hp)throw Error('new map stats');`);drain();run(`
Math.random=()=>.5;if(hits(3,3)||!hits(3,9))throw Error('AC direction');Math.random=()=>0;if(hits(100,9))throw Error('natural1');Math.random=()=>.999;if(!hits(-100,-10))throw Error('natural20');
s.enemy={boss:false,target:1,units:[{id:'slime',uid:0,hp:1000,rewarded:false},{id:'wolf',uid:1,hp:1,rewarded:false}]};s.commands=['fight','guard','guard'];var oldxp=s.members[0].xp;attack();if(!s.enemy||s.enemy.units[0].hp!==1000||s.enemy.units[1].hp!==0||s.members[0].xp!==oldxp||s.enemy.pendingXP!==14)throw Error('target or reward');`);drain();run(`var ex=s.members[0].xp;killReward(s.enemy.units[1]);if(s.members[0].xp!==ex)throw Error('double reward');s.enemy.units[0].hp=1000;s.mp[1]=2;s.magicPlans[1]={id:'halito',target:0};s.commands=['guard','spell','guard'];attack();if(s.mp[1]!==0||s.enemy.units[0].hp!==992)throw Error('spell MP damage');`);drain();run(`s.enemy=null;s.mp[2]=1;var before=s.hp.join();castMagic(2,'dios',0);if(s.hp.join()!==before||s.mp[2]!==1)throw Error('insufficient MP');s.area='dungeon';delete s.members;delete s.mp;s.spell=2;s.heal=1;s.enemy={boss:false,hp:11};ensureProfile();if(s.mp[1]!==8||s.mp[2]!==3||s.enemy.units[0].hp!==11)throw Error('migration');`);
console.log('PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration');
drain();run(`s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.gold=1000;enterTown();buy('helm',0);var k=s.inventory[0].length-1;equip(0,k);if(effectiveAC(0)!==4)throw Error('armor');sell(0,k);if(s.inventory[0][k]!=='helm')throw Error('equipped sale');equip(0,k);if(effectiveAC(0)!==6)throw Error('remove');fresh(2);if(s.cells.length!==100||size()!==10||s.floor!==2)throw Error('floor');if(enemyDefinition('poisonslime').name!=='毒スライム')throw Error('enemy floor');fresh(3);if(s.cells.length!==144)throw Error('floor3');`);console.log('PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling');
drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.cells[s.pos].chest={gold:7,opened:false,trap:'none'};s.scan=2;var oldgold=s.gold;Math.random=()=>.99;openChest(true);if(s.gold!==oldgold+21||currentChest())throw Error('safe chest');`);drain();run(`openChest(false);if(s.gold!==oldgold+21)throw Error('double chest');s.cells[s.pos].chest={gold:9,opened:false};s.scan=0;if(!currentChest())throw Error('new chest');s.hp=[32,24,26];afflict(0,'poison');tickAilments();if(s.hp[0]!==30)throw Error('poison');afflict(1,'paralysis');tickAilments();if(s.ailments[1].paralysis!==3)throw Error('paralysis');`);drain();run(`abandonChest()`);drain();run(`enterTown();if(s.ailments.some(a=>a.poison||a.paralysis))throw Error('town cure');`);console.log('PASS direct chest, once-only rewards, poison, paralysis, town cure');

drain();run(`s.enemy=null;s.pendingStairs=false;s.done=false;s.area='dungeon';fresh(1);s.scan=2;var firstStart=s.start;s.cells[5].flag=true;s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);var secondStart=s.start;s.cells[7].safe=true;if(s.cells.length!==100||s.scan!==2)throw Error('descend');travelFloor(1);if(s.start!==firstStart||!s.cells[5].flag||s.pos!==s.boss)throw Error('ascend persistence');s.relic=true;s.cells[s.boss].type='down';s.pos=s.boss;travelFloor(2);if(s.start!==secondStart||!s.cells[7].safe||s.pos!==s.start)throw Error('revisit');travelFloor(1);enterTown();enterDungeon();if(s.floor!==1||s.pos!==s.start)throw Error('town entrance');`);console.log('PASS floor round trips, exploration persistence, charge persistence and town entrance');

drain();run(`s.area='dungeon';s.cells[s.pos].chest={gold:100,opened:false};var chestPos=s.pos,chestGold=s.gold;move('forward');if(s.pos!==chestPos)throw Error('chest movement');abandonChest();if(currentChest()||s.gold!==chestGold)throw Error('abandon');`);drain();run(`if(s.cells[chestPos].chest)throw Error('chest remains');s.score={total:100};s.history=[{}];s.immediateChestVersion=0;ensureProfile();if('score' in s||'history' in s)throw Error('legacy cleanup');`);console.log('PASS mandatory chest decision, abandonment without reward, legacy score cleanup');
drain();run(`fresh(1);s.members.forEach(m=>m.level=1);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.pos=s.start%size()<size()-1?s.start+1:s.start-1;s.cells[s.pos].open=true;s.enemy={boss:false,escapeTo:s.start,units:[{id:'goblin',uid:0,hp:20},{id:'wolf',uid:1,hp:20}]};if(escapeChance()!==80)throw Error('escape 80');Math.random=()=>.99;var enemyHP=s.enemy.units[0].hp;flee();if(!s.enemy||s.enemy.units[0].hp!==enemyHP)throw Error('failed escape attacks');`);drain();run(`s.members.forEach(m=>m.level=20);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.hp=[32,24,26];if(escapeChance()!==100)throw Error('escape 100');var oldGold=s.gold;flee();if(s.enemy||s.pos!==s.start||s.gold!==oldGold||currentChest())throw Error('escape success');`);drain();run(`s.enemy={boss:true,units:[{id:'guardian',uid:0,hp:30}]};if(escapeChance()!==0)throw Error('boss chance');flee();if(!s.enemy)throw Error('boss escape')`);console.log('PASS escape success, failure, level formula, no reward, boss restriction');
drain();run(`
s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.done=false;s.area='dungeon';s.hp=[32,24,26];s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.members[1].level=13;s.members[2].level=13;delete s.members[1].known;delete s.members[2].known;Math.random=()=>0;ensureMagic();
if(MAGIC.length!==25||s.members[1].known.length!==12||s.members[2].known.length!==13)throw Error('learning migration');
var known=JSON.stringify(s.members.map(m=>m.known));Math.random=()=>.99;ensureMagic();if(JSON.stringify(s.members.map(m=>m.known))!==known)throw Error('reroll');
s.mp=[0,200,200];s.enemy={boss:false,units:[{id:'goblin',uid:0,hp:500},{id:'goblin',uid:1,hp:500},{id:'wolf',uid:2,hp:500}]};
castMagic(1,'mahalito',0);if(s.enemy.units[0].hp!==476||s.enemy.units[1].hp!==476||s.enemy.units[2].hp!==500)throw Error('group');
castMagic(1,'mamorlis',null);if(s.enemy.units.some(e=>e.acPenalty!==3))throw Error('debuff');
var base=effectiveAC(0);castMagic(2,'matu',null);castMagic(2,'kalki',null);if(effectiveAC(0)!==base-2)throw Error('strongest buff');
Math.random=()=>0;castMagic(1,'katino',0);if(s.enemy.units[0].sleep!==2||s.enemy.units[1].sleep!==2||s.enemy.units[2].sleep)throw Error('sleep group');
var beforeSleepHP=s.hp.join();enemyTurn(['fight','fight','fight']);if(s.hp.join()!==beforeSleepHP||s.enemy.units[0].sleep!==1)throw Error('sleep turn');
s.enemy=null;if(effectiveAC(0)!==base)throw Error('buff expires');
s.hp[0]=1;s.ailments[0]={poison:true,paralysis:3};castMagic(2,'madi',0);if(s.hp[0]!==maxHP(0)||s.ailments[0].poison||s.ailments[0].paralysis)throw Error('restore');
s.hp[0]=0;var mp=s.mp[2];castMagic(2,'dios',0);if(s.hp[0]||s.mp[2]!==mp)throw Error('no revive');
s.hp[0]=10;s.cells[s.pos].chest={gold:3,opened:false,trap:'poison'};castMagic(2,'calfo',null);if(currentChest().reading!=='毒'||currentChest().trap!=='poison'||currentChest().opened)throw Error('identify');delete s.cells[s.pos].chest;
castMagic(2,'lomilwa',null);if(!s.light)throw Error('light');
if(validMagicTarget(magic('malor'),999))throw Error('unvisited warp');castMagic(1,'malor',s.floor);if(s.pos!==s.start||s.pendingStairs)throw Error('warp');
`);drain();run(`enterTown();if(s.light)throw Error('town light');`);console.log('PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp');
drain();run(`
s.enemy=null;s.pendingStairs=false;s.pendingBoss=null;s.done=false;s.area='dungeon';s.floor=1;s.hp=s.members.map(m=>m.maxHP);
if(ENEMIES.length!==31)throw Error('CSV count');for(let f=1;f<=3;f++){s.floor=f;ENEMIES.forEach(e=>{if(enemyDefinition(e.id).xp!==e.xp)throw Error('fixed CSV XP')})}s.floor=1;
var thresholds=s.members.map(m=>JSON.stringify(m.xpTargets));Math.random=()=>{throw Error('unexpected reroll')};ensureProgression();if(s.members.some((m,i)=>JSON.stringify(m.xpTargets)!==thresholds[i]))throw Error('persistent thresholds');
var previousMembers=s.members;s.members=CLASSES.map(c=>({level:1,xp:0}));Math.random=()=>.5;ensureProgression();if(requiredXP(2,0)!==92||requiredXP(2,2)!==115||requiredXP(2,1)!==138)throw Error('class thresholds');for(let i=0;i<3;i++)for(let lv=2;lv<=30;lv++)if(requiredXP(lv,i)<=requiredXP(lv-1,i))throw Error('nonmonotonic');
s.members=[{level:8,xp:2900},{level:8,xp:2900},{level:8,xp:2900}];ensureProgression();if(s.members.some(m=>m.level!==8||m.xp!==2900||m.xpTargets[8]!==2800))throw Error('legacy migration');s.members=previousMembers;
for(let r of [0,.999]){Math.random=()=>r;s.cells[s.pos].type='';encounter(s.pos);if(new Set(s.enemy.units.map(e=>e.uid)).size!==s.enemy.units.length)throw Error('uids');for(let g of enemyGroups()){let range=enemyDefinition(g.id).groupSize;if(g.units.length!==range[r===0?0:1])throw Error('group bound');}if(!drawEnemies().includes('<rect'))throw Error('group drawing');}
s.cells[s.pos].type='boss';encounter(s.pos);if(s.enemy.units.length!==1||s.enemy.units[0].id!=='guardian')throw Error('floor guardian');
s.enemy=null;s.cells[s.pos].type='';s.members.forEach((m,i)=>{m.level=1;m.xp=m.xpTargets[2]});var beforeGrowth=s.members.map(m=>m.maxMP);levelUp();if(s.members.some((m,i)=>m.maxMP-beforeGrowth[i]!== (i===0?0:2)))throw Error('MP growth');
`);drain();console.log('PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth');
drain();run(`
s.floor=1;s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.hp=s.members.map(m=>m.maxHP);s.ailments.forEach(a=>{a.poison=false;a.paralysis=0});s.enemy={boss:false,units:[{id:'slime',uid:0,hp:1,rewarded:false},{id:'slime',uid:1,hp:999,rewarded:false}],target:0};s.commands=['fight','guard','guard'];Math.random=()=>.99;attack();
  checkRowHits(s.enemy.units[1],13,7);
  checkRowHits(s.enemy.units[2],16,4);
  s.enemy.units[0].hp=0;s.enemy.units[0].rewarded=true;
  if(enemyGroups()[0].key!==20||s.enemy.units[1].row!==20)throw Error('stable row ID after collapse');
  checkRowHits(s.enemy.units[1],10,10);
  checkRowHits(s.enemy.units[2],13,7);
} finally {s=savedState;Math.random=savedRandom;}
}`);console.log('PASS physical row hit thresholds 10/13/16 (50%/35%/20%) and collapse with stable row IDs');
drain();run(`{let savedNamesState=structuredClone(s);s.area='town';s.enemy=null;s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.cells[s.pos].chest=null;s.members=[];s.reserve=[];for(let name of ['(','[x','a.b','a*']){let recruit=generateRecruit(name,0);if(!recruit||!registerRecruit(recruit))throw Error('special name register');let roster=trainingRoster(),index=roster.findIndex(r=>r.members.id===recruit.members.id);if(!setPartyFromRoster(roster,[index]))throw Error('special name join');refreshNames();if(coloredLog('テスト').includes('log-ally'))throw Error('unrelated name color');if(coloredLog('aXbの攻撃').includes('log-ally'))throw Error('regex metacharacter interpreted');s.members=[];s.reserve=[];refreshNames();}s=savedNamesState;refreshNames();}`);console.log('PASS special character names do not break log coloring or match as regex');
drain();run(`s.area='dungeon';s.done=false;s.hp=s.members.map(()=>20);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.ailments[0].poison=true;var poisonBefore34=s.hp[0],count34=logQueue.length;tickAilments(false);if(s.hp[0]!==poisonBefore34-2||logQueue.length!==count34)throw Error('silent exploration poison');s.ailments[0].poison=false;s.enemy={chestBattle:false,units:[{id:'slime',uid:1,row:0,hp:0,rewarded:false},{id:'wolf',uid:2,row:1,hp:5,rewarded:false}]};var xp34=s.members[0].xp,gold34=s.gold;Math.random=()=>.99;killReward(s.enemy.units[0]);if(s.members[0].xp!==xp34||s.gold!==gold34)throw Error('premature rewards');killReward(s.enemy.units[0]);if(s.enemy.pendingXP!==enemyDefinition('slime').xp)throw Error('duplicate rewards');var reward34=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members[0].xp!==xp34+reward34||s.gold<=gold34)throw Error('victory rewards');var paid34=s.gold;awardVictory(s.enemy);if(s.gold!==paid34)throw Error('duplicate victory');`);console.log('PASS silent exploration poison and deferred victory rewards');
drain();run(`s.done=false;s.area='dungeon';s.hp=s.members.map(()=>20);s.enemy={units:[{id:'wolf',uid:0,row:0,hp:10},{id:'slime',uid:1,row:1,hp:10}]};s.members.forEach(m=>m.intelligence=10);Math.random=()=>.99;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!=='素早い牙')throw Error('unknown');Math.random=()=>0;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!==enemyDefinition('wolf').name||!s.enemy.units[1].identified)throw Error('identify');Math.random=()=>.99;identifyEnemies();if(!s.enemy.units[0].identified)throw Error('identification persistence');s.enemy.units.forEach(e=>e.identified=false);identifyEnemies(true);if(!s.enemy.units.every(e=>e.identified))throw Error('identify spell effect');`);console.log('PASS identification failure, success, persistence and spell effect');
// CSV monster implementation: deterministic branch and integration checks.
drain();run(`
{let savedMonstersState=structuredClone(s);
function resetMonstersTest(id){s=structuredClone(savedMonstersState);s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;delete s.cells[s.pos].chest;s.hp=s.members.map(()=>1000);s.mp=s.members.map(()=>100);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.enemy={dataVersion:1,units:[{id,uid:0,row:0,hp:999,identified:true,rewarded:false}],chestBattle:false};displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;resetPartyCommands();s.commands=s.members.map(()=>'fight');}
for(let f=1;f<=4;f++){s.floor=f;for(let r of [0,.2,.5,.999]){Math.random=()=>r;let formation=monsterFormation(false);if(formation.length<1||formation.length>3||formation.some(id=>enemyDefinition(id).floor!==Math.min(3,f)||enemyDefinition(id).boss))throw Error('floor pool');if(monsterFormation(true)[0]!==['guardian','general','watcher'][Math.min(3,f)-1])throw Error('guardian floor')}}
resetMonstersTest('goblin');Math.random=()=>.01;let xp=s.members[0].xp,gold=s.gold;s.enemy.chestBattle=true;enemyTurn(s.commands);if(s.enemy||s.gold!==gold||s.members[0].xp!==xp||s.cells[s.pos].chest)throw Error('flee rewards');
resetMonstersTest('goblin');s.enemy.chestBattle=true;s.enemy.units.push({id:'slime',uid:1,row:1,hp:0,rewarded:false});Math.random=()=>.01;killReward(s.enemy.units[1]);enemyTurn(s.commands);if(s.enemy||!s.cells[s.pos].chest||s.members[0].xp!==xp+6)throw Error('mixed escape victory');
resetMonstersTest('rat');Math.random=()=>.01;enemyTurn(s.commands);if(s.enemy.units.length!==2||s.hp.some(h=>h!==1000))throw Error('summon acts same turn');for(let n=0;n<10;n++)monsterAction(s.enemy.units[0],s.commands);if(s.enemy.units.length!==5||s.enemy.summoned!==4||new Set(s.enemy.units.map(e=>e.uid)).size!==5||!logQueue.some(x=>x.text.includes('仲間を呼んだが、現れなかった。')))throw Error('battle summon cap');displayCombat=undefined;let svg=drawEnemies();if((svg.match(/data-enemy-uid/g)||[]).length!==5)throw Error('five icons');
resetMonstersTest('firefly');Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands);if(s.hp.some(h=>h!==998))throw Error('breath all targets');
resetMonstersTest('apprentice');Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands);if(s.hp[0]!==999||s.hp.slice(1).some(h=>h!==1000))throw Error('single spell');
resetMonstersTest('general');Math.random=()=>.99;enemyTurn(s.commands);if(logQueue.filter(x=>x.text.includes('ダメージ')).length!==2||s.hp.slice(3).some(h=>h!==1000))throw Error('multi attacks/front target');
resetMonstersTest('archer');Math.random=()=>.99;enemyTurn(s.commands);if(s.hp[5]===1000||s.hp.slice(0,5).some(h=>h!==1000))throw Error('rear target');
resetMonstersTest('acidslime');Math.random=()=>0;monsterOnHit(s.enemy.units[0],0);if(!s.ailments[0].poison||!s.ailments[0].paralysis)throw Error('multiple afflictions');
resetMonstersTest('rabbit');Math.random=()=>0;monsterOnHit(s.enemy.units[0],0);if(s.hp[0]!==0)throw Error('instant death');
resetMonstersTest('terror');s.members[0].level=5;s.members[0].maxHP=100;s.members[0].maxMP=0;s.members[0].xp=10000;Math.random=()=>0;monsterOnHit(s.enemy.units[0],0);if(s.members[0].level!==4||s.members[0].xp!==requiredXP(4,0)||s.hp[0]>s.members[0].maxHP||s.members[0].maxMP<0)throw Error('level drain');s.members[0].level=1;monsterOnHit(s.enemy.units[0],0);if(s.members[0].level!==1)throw Error('drain floor');
#!/usr/bin/env node
const { game } = require('./harness.cjs');

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!['--jobs', '--level', '--floor', '--n', '--boss'].includes(key)) throw Error(`不明な引数: ${key}`);
    if (Object.hasOwn(out, key.slice(2))) throw Error(`重複した引数: ${key}`);
    if (key === '--boss') { out.boss = true; continue; }
    if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`値が必要です: ${key}`);
    out[key.slice(2)] = argv[++i];
  }
  if (!/^[0-3](,[0-3]){0,5}$/.test(out.jobs || '')) throw Error('--jobs は0〜3の職業IDを1〜6個指定してください');
  const jobs = out.jobs.split(',').map(Number);
  const level = Number(out.level), floor = Number(out.floor), n = Number(out.n);
  if (!Number.isInteger(level) || level < 1 || level > 30) throw Error('--level は1〜30で指定してください');
  if (!Number.isInteger(floor) || floor < 1 || floor > 3) throw Error('--floor は1〜3で指定してください');
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw Error('--n は1〜100000で指定してください');
  return { jobs, level, floor, n, boss: !!out.boss };
}

// One reproducible stream per invocation; never rewind it between trials.
function seededRandom(seed = 0x6d2b79f5) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function createParty(g, jobs) {
  // The harness starts with the current game's empty town roster.
  for (let i = 0; i < jobs.length; i++) {
    const ok = g.run(`(() => {
      const recruit = generateRecruit('sim${i}', ${jobs[i]});
      return registerRecruit(recruit) && changeRecruitParty(recruit.members.id, true);
    })()`);
    if (!ok) throw Error('パーティ作成に失敗しました');
  }
  if (g.run('s.members.length') !== jobs.length) throw Error('パーティ人数が一致しません');
  // Observe the real completion path, even if enemies all flee during an ambush.
  g.run(`var simBase = structuredClone(partyRecords());
    var simBattleFinished = false, simFinishMonsterBattle = finishMonsterBattle;
    finishMonsterBattle = function() { simBattleFinished = true; return simFinishMonsterBattle(); };`);
}

function prepareTrial(g, opt) {
  g.run(`
    // Restore every parallel party field, including Lv1 growth and spells.
    for (const key of PARTY_FIELDS) s[key] = structuredClone(simBase.map(r => r[key]));
    fresh(1);
    s.members.forEach(m => { m.xp = m.xpTargets[${opt.level}]; });
    levelUp();
    s.hp = s.members.map(m => m.maxHP);
    s.mp = s.members.map(m => m.maxMP);
    s.ailments = s.members.map(() => ({poison:false, paralysis:0}));
    if (${opt.floor} > 1) fresh(${opt.floor});
    s.area = 'dungeon';
    resetPartyCommands();
    simBattleFinished = false;
    s.cells[s.pos].type = ${opt.boss ? "'boss'" : "'stairs'"};
  `);
sed: can't read scripts/sim/runtime.cjs: No such file or directory

exec
/bin/bash -lc 'cat scripts/sim/harness.cjs && tail -6 tests/game.cjs' in /workspace/dungeonsweeper
 succeeded in 0ms:
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function game(saved = null, random = Math.random) {
  const timers = new Map();
  let nextTimer = 0;
  let storage = saved;
  const elements = new Map();
  const element = () => ({ style: {}, value: '0', classList: { toggle() {} }, setAttribute() {}, addEventListener() {}, append() {}, replaceChildren() {}, showModal() { this.open = true; }, close() { this.open = false; } });
  const ctx = {
    crypto: require('node:crypto').webcrypto,
    structuredClone,
    document: { addEventListener() {}, querySelector: key => { if (!elements.has(key)) elements.set(key, element()); return elements.get(key); }, querySelectorAll: () => [], createElement: element },
    localStorage: { getItem: () => storage, setItem: (key, value) => { storage = value; } },
    setTimeout: fn => { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearTimeout: id => timers.delete(id),
    Math: Object.assign(Object.create(Math), { random }),
  };
  vm.createContext(ctx);
  for (const file of ['weapons', 'monster-data', 'balance', 'spells', 'items', 'flags', 'traps', 'combatui', 'party', 'monsters', 'recruits', 'game']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../../dist', `${file}.js`), 'utf8'), ctx);
  }
  return {
    run: code => vm.runInContext(code, ctx),
    drain() {
      for (let n = 0; timers.size; n++) {
        if (n >= 10000) throw Error('timer loop');
        const [id, fn] = timers.entries().next().value;
        timers.delete(id);
        fn();
      }
    },
  };
}

module.exports = { game };

run(`var plate=WEAPONS.find(w=>w.id==='plate');if(!plate||chestItemPool(1).includes(plate)||!chestItemPool(2).includes(plate))throw Error('floor chest price cap');var oldRandom=Math.random;var foundPlate=false;Math.random=()=>.999;for(let i=0;i<10000;i++){let pool=chestItemPool(1);if(pool[Math.random()*pool.length|0].id==='plate')foundPlate=true}Math.random=oldRandom;if(foundPlate)throw Error('plate dropped on floor 1');`);
console.log('PASS chest item pool price cap and 10,000 floor 1 draws');

run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[dagger];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
console.log('PASS chest item unusable, full inventory and normal receipt logs');

exec
/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 1 --n 100' in /workspace/dungeonsweeper
 succeeded in 6948ms:
{"winRate":0.99,"wipeRate":0,"deathsPerBattle":0.04,"hpLossRate":0.08887573964497042,"averageRounds":5.51}

exec
/bin/bash -lc "python3 - <<'PY'
from pathlib import Path
p=Path('dist/game.js')
s=p.read_text()
a='let xp=combat.pendingXP||0,gold=combat.pendingGold||0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=xp;if(xp)log("'`生存者は経験値${xp}を獲得。`);'"'
b='let xp=combat.pendingXP||0,gold=combat.pendingGold||0,survivors=s.members.filter((_,i)=>s.hp[i]>0).length,share=xp>0&&survivors>0?Math.max(1,Math.floor(xp/survivors)):0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=share;if(share)log("'`生存者は経験値${share}を獲得。`);'"'
assert a in s
p.write_text(s.replace(a,b))
p=Path('docs/SPECIFICATION.md');s=p.read_text();a='生存者各人に合計XPを付与（人数で分割しない）。';b='合計XPが正の場合、勝利確定時の生存者数で分割し、各生存者に "'`Math.max(1, Math.floor(合計XP / 生存者数))` を付与。戦闘不能者には付与せず、報酬ログは1人あたりのXPを表示。合計XPが0なら付与しない。'"';assert a in s;p.write_text(s.replace(a,b))
p=Path('tests/game.cjs');s=p.read_text();s=s.replace('xpBefore[i]+earned','xpBefore[i]+Math.max(1,Math.floor(earned/s.members.length))').replace(\"throw Error('all six xp')\",\"throw Error('all six split xp')\");s=s.replace('xp34+reward34','xp34+Math.max(1,Math.floor(reward34/s.members.length))');s=s.replace(\"s.members[0].xp"'!==xp+6)throw Error('"'mixed escape victory')\",\"s.members[0].xp"'!==xp+Math.max(1,Math.floor(6/s.members.length)))throw Error('"'mixed escape victory')\")
s+='''
// Isolate reward cases from the shared combat fixtures and their random overrides.
drain();run("'`{let savedXPState=structuredClone(s);try{
  s=structuredClone(sixInitial);s.area='"'dungeon';s.done=false;
  s.enemy={units:[],chestBattle:true};
  for(let [total,alive,expected] of [[100,[0,2,5],33],[100,[4],100],[2,[0,2,5],1],[0,[0,2,5],0],[100,[],0]]){
    s.hp=s.members.map((_,i)=>alive.includes(i)?20:0);
    let before=s.members.map(m=>m.xp),logCount=logQueue.length;
    s.enemy.pendingXP=total;awardVictory(s.enemy);
    if(s.members.some((m,i)=>m.xp"'!==before[i]+(alive.includes(i)?expected:0)))throw Error('"'survivor XP split / dead exclusion');
    let rewardLogs=logQueue.slice(logCount).filter(x=>x.text.startsWith('生存者は経験値'));
    if(expected?rewardLogs.length"'!==1||rewardLogs[0].text!=='"'生存者は経験値'+expected+'を獲得。':rewardLogs.length"'!==0)throw Error('"'per survivor XP log');
    let paid=s.members.map(m=>m.xp).join();awardVictory(s.enemy);
    if(s.members.map(m=>m.xp).join()"'!==paid||s.enemy.pendingXP!==0)throw Error('"'duplicate XP award');
  }
}finally{s=savedXPState;}}"'`);drain();
console.log('"'PASS XP split 100/3=33, 100/1=100, dead exclusion, minimum 1, zero reward, no survivors, per-person log and duplicate guard');
'''
p.write_text(s)
PY
node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check" in /workspace/dungeonsweeper
 succeeded in 373ms:
PASS town loop, stairs yes/no, map persistence, buy/equip/sell/capacity, trap consumption, heal, random encounters, drops, combined log
PASS XP deferred to town, multi-level growth, full refill, persistence, AC, target selection, multiple enemies, reward once, MP spending and save migration
PASS armor equip/remove/sale guard, 10x10 and 12x12 floors and enemy scaling
PASS direct chest, once-only rewards, poison, paralysis, town cure
PASS floor round trips, exploration persistence, charge persistence and town entrance
PASS mandatory chest decision, abandonment without reward, legacy score cleanup
PASS escape success, failure, level formula, no reward, boss restriction
PASS 24 spells, one-time migration, group targeting, debuff, nonstacking AC, sleep turns, restore, no revive, fixed chest identification, light and visited warp
PASS fixed CSV XP on all floors, persistent random thresholds, class order, migration, group bounds and unique IDs, floor guardian, slow MP growth
PASS single/group/last kill log synchronization, guard and spell reset, log colors and escaping
PASS strafe all directions, orientation, walls, battle/stairs locks, spell color, compact party and title visibility
PASS three rows, independent member targeting, group spell isolation, hidden exploration controls, medicine effects, slot shifts, battle action/reset, drops and save compatibility
PASS guardian gates / same-tile stairs, floor round trips and town reset, profile retention, XP +15% migration once, first living target and empty-row action
PASS typed flags, independent procs, no recoloring, half MP in combat and field, exclusive curses
PASS 0.5-50% flags, five floor traps, safe teleport and sequential command entry/review
PASS automatic single-row targets, battle spell modal closure and main-screen targets, field spell placement, linked flag labels
PASS review table, back to final member, hidden flee in review, aligned target grid
PASS chest Calfo availability, all-facing diagonal sight and wall boundaries
PASS six-person defaults/migration, reordered jobs and gear, bench/restore/save, doubled survey/accuracy/reset, thief success/failure, front/rear combat and six XP/commands
PASS item transfer/capacity/equipped guard, slot remapping, field reorder identity, combat locks and party entry
PASS numbered/revisited/strafe rates, initiative bounds/back/ward, ward MP/migration/floor/town, enemy opening and snapshots, banner cleanup, party free turn once, 0.5-50% curve
PASS failed escape consumes party surprise without enemy retaliation
PASS status tags follow displayed HP/ailments through damage and recovery
PASS ranged shop/class/rear damage/UI, melee rear restriction, battle survey disabled/no spend and once-per-return level popup
PASS trap warning before damage and chest reveal after log playback
PASS STR migration and per-swing attack count
PASS physical row hit thresholds 10/13/16 (50%/35%/20%) and collapse with stable row IDs
PASS special character names do not break log coloring or match as regex
PASS silent exploration poison and deferred victory rewards
PASS identification failure, success, persistence and spell effect
PASS monster floor pools, guardians, flee rewards, mixed victory, summon cap/timing, multi-hit/rear, spell/breath, statuses, instant death, drain, theft, resistances and save migration
PASS dispel success/failure, undead only, no MP or XP
PASS exploration poison death once with HP snapshot, silent nonfatal movement and combat poison logs
PASS magic plans pad to party length and preserve legacy three-member saves
PASS chest item pool price cap and 10,000 floor 1 draws
PASS chest item unusable, full inventory and normal receipt logs
PASS XP split 100/3=33, 100/1=100, dead exclusion, minimum 1, zero reward, no survivors, per-person log and duplicate guard
PASS new game starts empty; dungeon blocked
PASS 400 recruits: bounds, class aptitude, bonus totals, HP/MP variance, IDs, XP and preview isolation
PASS registration, six-member cap, duplicate rejection, equipment/XP retained across bench/reorder/reload
PASS generated members: growth/drain preserve STR, combat, mage/priest spells and town dungeon regeneration
PASS deletion including last active member and empty save reload
31 monster definitions validated

codex
修正後、共通テストはすべてPASSしました。生存3人に各33XP、生存1人に100XP、戦闘不能者への加算なし、報酬0・二重処理での加算なしを確認できています。最後にLv1・1Fのシミュレータ結果を変更前と比較します。

exec
/bin/bash -lc 'git diff --check && git diff --stat && git diff -- dist/game.js docs/SPECIFICATION.md tests/game.cjs' in /workspace/dungeonsweeper
 succeeded in 0ms:
 dist/game.js          |  2 +-
 docs/SPECIFICATION.md |  2 +-
 tests/game.cjs        | 23 ++++++++++++++++++++---
 3 files changed, 22 insertions(+), 5 deletions(-)
diff --git a/dist/game.js b/dist/game.js
index d2b5de0..2bb445d 100644
--- a/dist/game.js
+++ b/dist/game.js
@@ -25,7 +25,7 @@ function hits(hit,ac){let roll=dice(1,20).value;return roll===20||(roll!==1&&rol
 function reachableEnemyGroups(i,combat=s.enemy){let groups=enemyGroups(combat).filter(g=>g.units.some(e=>e.hp>0));return equippedWeapon(i)?.range==='ranged'?groups:groups.slice(0,2)}
 function selectedEnemy(i){let key=s.attackRows?.[i];if(key==null){let legacy=s.enemy.units.find(e=>e.uid===s.enemy.target);key=legacy?rowKey(legacy):rowKey(s.enemy.units[0])}if(!reachableEnemyGroups(i).some(g=>String(g.key)===String(key)))return undefined;return s.enemy.units.find(e=>String(rowKey(e))===String(key)&&e.hp>0)}
 function killReward(e){if(e.rewarded)return;e.rewarded=true;let d=enemyDefinition(e.id);s.enemy.pendingXP=(s.enemy.pendingXP||0)+d.xp;s.enemy.pendingGold=(s.enemy.pendingGold||0)+Math.floor(dice(...d.gold).value/3);s.enemy.pendingDrops=(s.enemy.pendingDrops||0)+1;log('敵を倒した。')}
-function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=xp;if(xp)log(`生存者は経験値${xp}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}
+function awardVictory(combat){let xp=combat.pendingXP||0,gold=combat.pendingGold||0,survivors=s.members.filter((_,i)=>s.hp[i]>0).length,share=xp>0&&survivors>0?Math.max(1,Math.floor(xp/survivors)):0;for(let i=0;i<s.members.length;i++)if(s.hp[i]>0)s.members[i].xp+=share;if(share)log(`生存者は経験値${share}を獲得。`);if(combat.chestBattle)combat.lootGold=(combat.lootGold||0)+gold;else{if(gold){s.gold+=gold;log(`金貨${gold}枚を獲得。`)}for(let n=0;n<(combat.pendingDrops||0);n++)dropWeapon()}combat.pendingXP=0;combat.pendingGold=0;combat.pendingDrops=0}
 
 function attack(){if(logBusy()||!s.enemy||s.done)return;displayVitals={hp:s.hp.slice(),mp:s.mp.slice(),ailments:structuredClone(s.ailments),members:structuredClone(s.members)};tickAilments();if(s.done){render();return}identifyEnemies();let cmds=s.commands.slice();log('── ターン開始 ──');for(let i=0;i<s.members.length;i++)if(s.hp[i]>0&&cmds[i]==='guard')log(`${NAMES[i]}は身を守る。`);for(let i=0;i<s.members.length;i++){if(s.hp[i]<=0)continue;if(s.ailments[i].paralysis>0){log(`${NAMES[i]}は麻痺して動けない。`);continue}if(cmds[i]==='guard')continue;if(cmds[i]==='dispel'){dispelUndead(i);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(cmds[i]==='item'){let plan=s.itemPlans[i];if(plan)useMedicine(i,plan.slot,plan.target,true,plan.id);continue}if(cmds[i]==='spell'){let plan=s.magicPlans[i];if(plan){let x=magic(plan.id),t=plan.target;if(x&&(x.target==='enemy'||x.target==='group')&&!validMagicTarget(x,t)){let original=s.enemy.units.find(e=>e.uid===t);t=s.enemy.units.find(e=>e.hp>0&&original&&rowKey(e)===rowKey(original))?.uid??s.enemy.units.find(e=>e.hp>0)?.uid}castMagic(i,plan.id,t)}else log(`${NAMES[i]}の呪文が選ばれていない。`);if(!s.enemy.units.some(e=>e.hp>0))break;continue}if(!canWeaponAttack(i)){log(`${NAMES[i]}の近接攻撃は後衛から届かない。`);continue}let e=selectedEnemy(i);if(!e){log(`${NAMES[i]}の攻撃対象の列は全滅している。`);continue;}let d=enemyDefinition(e.id);let result=physicalAttack(i,e);if(!result.hitsCount){log(`${NAMES[i]}の攻撃は${enemyDisplay(e)}にかわされた。`);continue}let damage=flagDamage(result.damage);e.hp=Math.max(0,e.hp-damage);log(`${NAMES[i]}の攻撃。${enemyDisplay(e)}に${damage}ダメージ。`);if(e.hp===0)killReward(e);if(!s.enemy.units.some(e=>e.hp>0))break}if(!s.enemy.units.some(e=>e.hp>0)){finishMonsterBattle()}else if(s.enemy.initiative==='party'){s.enemy.initiative='normal'}else{enemyTurn(cmds)}resetCommandEntry();resetPartyCommands();if(s.enemy){let next=s.enemy.units.find(e=>e.hp>0);s.attackRows=s.attackRows.map(key=>s.enemy.units.some(e=>String(rowKey(e))===String(key)&&e.hp>0)?key:rowKey(next))}render()}
 function ensureStats(){if(!s.members){s.members=CLASSES.slice(0,3).map(c=>({level:1,xp:0,maxHP:c.hp,maxMP:c.mp,attack:c.attack,ac:c.ac}));s.mp=CLASSES.slice(0,3).map((c,i)=>i===1?Math.min(c.mp,(s.spell===undefined?c.mp:s.spell*SPELLS.blast.cost)):i===2?Math.min(c.mp,(s.heal===undefined?c.mp:s.heal*SPELLS.heal.cost)):0);if(s.area==='town')s.mp=s.members.map(m=>m.maxMP);delete s.spell;delete s.heal}s.mp??=s.members.map(m=>m.maxMP);if(s.enemy&&!s.enemy.units){let old=s.enemy,id=old.boss?'guardian':'skeleton';s.enemy={boss:old.boss,target:0,units:[{id,uid:0,hp:old.hp,rewarded:false}]}}}
diff --git a/docs/SPECIFICATION.md b/docs/SPECIFICATION.md
index 2fbf6c7..e819846 100644
--- a/docs/SPECIFICATION.md
+++ b/docs/SPECIFICATION.md
@@ -58,7 +58,7 @@ STR補正はSTR≤5ならSTR−6、STR≥16ならSTR−15、他0。STR18は+3。
 ### 逃走・報酬
 
 ボス・誤旗デバフ時は逃走不可。逃走率は75%＋少人数補正（1人15、2人10、3人5）＋有効味方Lv合計≥有効敵Lv合計なら20、上限100%。味方は生存・非毒・非麻痺、敵は生存・非睡眠が集計対象。失敗は敵ターン（味方先制権があればそれを消費）。
-撃破時は経験値・金貨・ドロップ回数を戦闘内へ蓄積し、敵が全員いなくなった後に配分。生存者各人に合計XPを付与（人数で分割しない）。逃げた敵・解呪で消えた敵は報酬なし。
+撃破時は経験値・金貨・ドロップ回数を戦闘内へ蓄積し、敵が全員いなくなった後に配分。合計XPが正の場合、勝利確定時の生存者数で分割し、各生存者に `Math.max(1, Math.floor(合計XP / 生存者数))` を付与。戦闘不能者には付与せず、報酬ログは1人あたりのXPを表示。合計XPが0なら付与しない。逃げた敵・解呪で消えた敵は報酬なし。
 敵識別は各列について、生存メンバー最大IQ×3%（最大100%）を開始時・毎ターンに抽選。成功後は戦闘中保持。確定名を知らせる専用ログは削除済み。敵一覧・対象選択・攻撃ログは識別状態に従う。
 
 ### 呪いを解く（暫定）
diff --git a/tests/game.cjs b/tests/game.cjs
index c89e981..3ad5b67 100644
--- a/tests/game.cjs
+++ b/tests/game.cjs
@@ -121,7 +121,7 @@ s.area='dungeon';s.enemy=null;s.done=false;s.hp=s.members.map(m=>m.maxHP);s.cell
 `);drain();run(`s.cells[s.pos].chest={gold:10,trap:'needle',opened:false};var goldBefore=s.gold,hpBefore=s.hp.reduce((a,b)=>a+b);Math.random=()=>.99;thiefOpenChest();if(currentChest()||s.cells[s.pos].chest||s.gold!==goldBefore||s.hp.reduce((a,b)=>a+b)>=hpBefore)throw Error('thief failure trap and destroy');`);drain();run(`
 s.hp=s.members.map(m=>m.maxHP);s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};s.commands=['guard','guard','guard','fight','fight','fight'];var rear=s.hp.slice(3).join(),enemyBefore=s.enemy.units[0].hp;Math.random=()=>.99;attack();if(s.enemy.units[0].hp!==enemyBefore||s.hp.slice(3).join()!==rear||s.commands.length!==6)throw Error('front rear reach');
 `);drain();run(`
-s.hp=s.members.map(m=>m.maxHP);var xpBefore=s.members.map(m=>m.xp);killReward({id:'slime',hp:0,rewarded:false});if(s.members.some((m,i)=>m.xp!==xpBefore[i]))throw Error('premature xp');let earned=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members.some((m,i)=>m.xp!==xpBefore[i]+earned))throw Error('all six xp');
+s.hp=s.members.map(m=>m.maxHP);var xpBefore=s.members.map(m=>m.xp);killReward({id:'slime',hp:0,rewarded:false});if(s.members.some((m,i)=>m.xp!==xpBefore[i]))throw Error('premature xp');let earned=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members.some((m,i)=>m.xp!==xpBefore[i]+Math.max(1,Math.floor(earned/s.members.length))))throw Error('all six split xp');
 `);drain();run(`s.enemy={units:[{id:'slime',uid:0,row:0,hp:9999}]};resetCommandEntry();for(let i=0;i<6;i++){s.commands[i]='guard';confirmCommand(i)}if(commandIndex!==6||$('#attack').hidden)throw Error('six sequential');for(let [name,kind] of Object.entries({怪力:'power',堅牢:'guard',呪禁:'magic'}))if(!coloredLog(name+'の旗がはためいた！').includes('log-flag-'+kind))throw Error('flag log color');`);
 console.log('PASS six-person defaults/migration, reordered jobs and gear, bench/restore/save, doubled survey/accuracy/reset, thief success/failure, front/rear combat and six XP/commands');
 drain();run(`s=structuredClone(sixInitial);s.area='dungeon';s.pendingBoss=null;s.pendingStairs=false;s.enemy=null;s.done=false;delete s.cells[s.pos].chest;ensureProfile();s.inventory[0]=['healingPotion','sword','helm'];s.equipped[0]=1;s.armor[0]={head:2};var beforeTotal=s.inventory.reduce((n,a)=>n+a.length,0);if(!transferItem(0,0,4)||s.inventory[4].at(-1)!=='healingPotion'||s.equipped[0]!==0||s.armor[0].head!==1||equippedWeapon(0).id!=='sword')throw Error('transfer / shifted gear');if(s.inventory.reduce((n,a)=>n+a.length,0)!==beforeTotal||transferItem(0,0,4)||transferItem(0,1,4)||transferItem(0,0,0))throw Error('equipped / self transfer');s.inventory[0].push('antidote');s.inventory[1]=Array(10).fill('sword');if(transferItem(0,2,1))throw Error('full recipient');s.enemy={units:[]};if(transferItem(0,2,4)||applyPartyOrder([5,1,2,3,4,0]))throw Error('combat lock');s.enemy=null;var identity=s.members[0].id;var gear=s.inventory[0].join();if(!applyPartyOrder([5,1,2,3,4,0])||s.members[5].id!==identity||s.inventory[5].join()!==gear||equippedWeapon(5).id!=='sword'||s.armor[5].head!==1)throw Error('field reorder identity');if(applyPartyOrder([0,0,2,3,4,5]))throw Error('duplicate formation');if($('#party').onclick!==$('#statsopen').onclick)throw Error('party entry');renderStats();if($('#statsbody').innerHTML.includes('習得状況')||!$('#statsbody').innerHTML.includes('>アイテム</button>'))throw Error('labels');`);console.log('PASS item transfer/capacity/equipped guard, slot remapping, field reorder identity, combat locks and party entry');
@@ -161,7 +161,7 @@ try {
 } finally {s=savedState;Math.random=savedRandom;}
 }`);console.log('PASS physical row hit thresholds 10/13/16 (50%/35%/20%) and collapse with stable row IDs');
 drain();run(`{let savedNamesState=structuredClone(s);s.area='town';s.enemy=null;s.done=false;s.pendingStairs=false;s.pendingBoss=null;s.cells[s.pos].chest=null;s.members=[];s.reserve=[];for(let name of ['(','[x','a.b','a*']){let recruit=generateRecruit(name,0);if(!recruit||!registerRecruit(recruit))throw Error('special name register');let roster=trainingRoster(),index=roster.findIndex(r=>r.members.id===recruit.members.id);if(!setPartyFromRoster(roster,[index]))throw Error('special name join');refreshNames();if(coloredLog('テスト').includes('log-ally'))throw Error('unrelated name color');if(coloredLog('aXbの攻撃').includes('log-ally'))throw Error('regex metacharacter interpreted');s.members=[];s.reserve=[];refreshNames();}s=savedNamesState;refreshNames();}`);console.log('PASS special character names do not break log coloring or match as regex');
-drain();run(`s.area='dungeon';s.done=false;s.hp=s.members.map(()=>20);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.ailments[0].poison=true;var poisonBefore34=s.hp[0],count34=logQueue.length;tickAilments(false);if(s.hp[0]!==poisonBefore34-2||logQueue.length!==count34)throw Error('silent exploration poison');s.ailments[0].poison=false;s.enemy={chestBattle:false,units:[{id:'slime',uid:1,row:0,hp:0,rewarded:false},{id:'wolf',uid:2,row:1,hp:5,rewarded:false}]};var xp34=s.members[0].xp,gold34=s.gold;Math.random=()=>.99;killReward(s.enemy.units[0]);if(s.members[0].xp!==xp34||s.gold!==gold34)throw Error('premature rewards');killReward(s.enemy.units[0]);if(s.enemy.pendingXP!==enemyDefinition('slime').xp)throw Error('duplicate rewards');var reward34=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members[0].xp!==xp34+reward34||s.gold<=gold34)throw Error('victory rewards');var paid34=s.gold;awardVictory(s.enemy);if(s.gold!==paid34)throw Error('duplicate victory');`);console.log('PASS silent exploration poison and deferred victory rewards');
+drain();run(`s.area='dungeon';s.done=false;s.hp=s.members.map(()=>20);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.ailments[0].poison=true;var poisonBefore34=s.hp[0],count34=logQueue.length;tickAilments(false);if(s.hp[0]!==poisonBefore34-2||logQueue.length!==count34)throw Error('silent exploration poison');s.ailments[0].poison=false;s.enemy={chestBattle:false,units:[{id:'slime',uid:1,row:0,hp:0,rewarded:false},{id:'wolf',uid:2,row:1,hp:5,rewarded:false}]};var xp34=s.members[0].xp,gold34=s.gold;Math.random=()=>.99;killReward(s.enemy.units[0]);if(s.members[0].xp!==xp34||s.gold!==gold34)throw Error('premature rewards');killReward(s.enemy.units[0]);if(s.enemy.pendingXP!==enemyDefinition('slime').xp)throw Error('duplicate rewards');var reward34=s.enemy.pendingXP;awardVictory(s.enemy);if(s.members[0].xp!==xp34+Math.max(1,Math.floor(reward34/s.members.length))||s.gold<=gold34)throw Error('victory rewards');var paid34=s.gold;awardVictory(s.enemy);if(s.gold!==paid34)throw Error('duplicate victory');`);console.log('PASS silent exploration poison and deferred victory rewards');
 drain();run(`s.done=false;s.area='dungeon';s.hp=s.members.map(()=>20);s.enemy={units:[{id:'wolf',uid:0,row:0,hp:10},{id:'slime',uid:1,row:1,hp:10}]};s.members.forEach(m=>m.intelligence=10);Math.random=()=>.99;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!=='素早い牙')throw Error('unknown');Math.random=()=>0;identifyEnemies();if(enemyDisplay(s.enemy.units[0])!==enemyDefinition('wolf').name||!s.enemy.units[1].identified)throw Error('identify');Math.random=()=>.99;identifyEnemies();if(!s.enemy.units[0].identified)throw Error('identification persistence');s.enemy.units.forEach(e=>e.identified=false);identifyEnemies(true);if(!s.enemy.units.every(e=>e.identified))throw Error('identify spell effect');`);console.log('PASS identification failure, success, persistence and spell effect');
 // CSV monster implementation: deterministic branch and integration checks.
 drain();run(`
@@ -169,7 +169,7 @@ drain();run(`
 function resetMonstersTest(id){s=structuredClone(savedMonstersState);s.area='dungeon';s.done=false;s.pendingStairs=false;s.pendingBoss=null;delete s.cells[s.pos].chest;s.hp=s.members.map(()=>1000);s.mp=s.members.map(()=>100);s.ailments=s.members.map(()=>({poison:false,paralysis:0}));s.enemy={dataVersion:1,units:[{id,uid:0,row:0,hp:999,identified:true,rewarded:false}],chestBattle:false};displayCombat=undefined;displayVitals=null;logQueue=[];clearTimeout(logTimer);logTimer=null;resetPartyCommands();s.commands=s.members.map(()=>'fight');}
 for(let f=1;f<=4;f++){s.floor=f;for(let r of [0,.2,.5,.999]){Math.random=()=>r;let formation=monsterFormation(false);if(formation.length<1||formation.length>3||formation.some(id=>enemyDefinition(id).floor!==Math.min(3,f)||enemyDefinition(id).boss))throw Error('floor pool');if(monsterFormation(true)[0]!==['guardian','general','watcher'][Math.min(3,f)-1])throw Error('guardian floor')}}
 resetMonstersTest('goblin');Math.random=()=>.01;let xp=s.members[0].xp,gold=s.gold;s.enemy.chestBattle=true;enemyTurn(s.commands);if(s.enemy||s.gold!==gold||s.members[0].xp!==xp||s.cells[s.pos].chest)throw Error('flee rewards');
-resetMonstersTest('goblin');s.enemy.chestBattle=true;s.enemy.units.push({id:'slime',uid:1,row:1,hp:0,rewarded:false});Math.random=()=>.01;killReward(s.enemy.units[1]);enemyTurn(s.commands);if(s.enemy||!s.cells[s.pos].chest||s.members[0].xp!==xp+6)throw Error('mixed escape victory');
+resetMonstersTest('goblin');s.enemy.chestBattle=true;s.enemy.units.push({id:'slime',uid:1,row:1,hp:0,rewarded:false});Math.random=()=>.01;killReward(s.enemy.units[1]);enemyTurn(s.commands);if(s.enemy||!s.cells[s.pos].chest||s.members[0].xp!==xp+Math.max(1,Math.floor(6/s.members.length)))throw Error('mixed escape victory');
 resetMonstersTest('rat');Math.random=()=>.01;enemyTurn(s.commands);if(s.enemy.units.length!==2||s.hp.some(h=>h!==1000))throw Error('summon acts same turn');for(let n=0;n<10;n++)monsterAction(s.enemy.units[0],s.commands);if(s.enemy.units.length!==5||s.enemy.summoned!==4||new Set(s.enemy.units.map(e=>e.uid)).size!==5||!logQueue.some(x=>x.text.includes('仲間を呼んだが、現れなかった。')))throw Error('battle summon cap');displayCombat=undefined;let svg=drawEnemies();if((svg.match(/data-enemy-uid/g)||[]).length!==5)throw Error('five icons');
 resetMonstersTest('firefly');Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands);if(s.hp.some(h=>h!==998))throw Error('breath all targets');
 resetMonstersTest('apprentice');Math.random=()=>0;monsterAction(s.enemy.units[0],s.commands);if(s.hp[0]!==999||s.hp.slice(1).some(h=>h!==1000))throw Error('single spell');
@@ -227,3 +227,20 @@ console.log('PASS chest item pool price cap and 10,000 floor 1 draws');
 
 run(`{let savedChestState=structuredClone(s),savedChestRandom=Math.random;try{s=structuredClone(sixInitial);ensureProfile();s.members=s.members.slice(0,3);for(const key of PARTY_FIELDS)s[key]=s[key].slice(0,3);s.members.forEach(m=>m.job=0);s.inventory=s.members.map(()=>['sword']);s.equipped=[0,0,0];s.armor=s.members.map(()=>({}));s.floor=1;s.gold=0;let dagger=WEAPONS.find(w=>w.id==='dagger');chestItemPool=()=>[dagger];let rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.some(a=>a.length!==1)||logQueue.filter(x=>x.text==='短剣を見つけたが、誰も扱えないので置いていった。').length!==1)throw Error('unusable chest item');s.inventory[0]=Array(10).fill('sword');s.members[0].job=3;let beforeFull=s.inventory.map(a=>a.length),beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory.map(a=>a.length).join()!==beforeFull.join()||logQueue.slice(beforeLog).filter(x=>x.text==='アイテムがいっぱいで装備品を持ち帰れなかった。').length!==1)throw Error('full chest inventory');s.inventory[0]=['sword'];beforeLog=logQueue.length;rolls=[0,.5,.99];Math.random=()=>rolls.shift()??.99;rewardChest({gold:0});if(s.inventory[0].at(-1)!=='dagger'||logQueue.slice(beforeLog).filter(x=>x.text==='短剣を入手。戦士Ⅰが受け取った。').length!==1)throw Error('normal chest item');}finally{s=savedChestState;Math.random=savedChestRandom;}}`);
 console.log('PASS chest item unusable, full inventory and normal receipt logs');
+
+// Isolate reward cases from the shared combat fixtures and their random overrides.
+drain();run(`{let savedXPState=structuredClone(s);try{
+  s=structuredClone(sixInitial);s.area='dungeon';s.done=false;
+  s.enemy={units:[],chestBattle:true};
+  for(let [total,alive,expected] of [[100,[0,2,5],33],[100,[4],100],[2,[0,2,5],1],[0,[0,2,5],0],[100,[],0]]){
+    s.hp=s.members.map((_,i)=>alive.includes(i)?20:0);
+    let before=s.members.map(m=>m.xp),logCount=logQueue.length;
+    s.enemy.pendingXP=total;awardVictory(s.enemy);
+    if(s.members.some((m,i)=>m.xp!==before[i]+(alive.includes(i)?expected:0)))throw Error('survivor XP split / dead exclusion');
+    let rewardLogs=logQueue.slice(logCount).filter(x=>x.text.startsWith('生存者は経験値'));
+    if(expected?rewardLogs.length!==1||rewardLogs[0].text!=='生存者は経験値'+expected+'を獲得。':rewardLogs.length!==0)throw Error('per survivor XP log');
+    let paid=s.members.map(m=>m.xp).join();awardVictory(s.enemy);
+    if(s.members.map(m=>m.xp).join()!==paid||s.enemy.pendingXP!==0)throw Error('duplicate XP award');
+  }
+}finally{s=savedXPState;}}`);drain();
+console.log('PASS XP split 100/3=33, 100/1=100, dead exclusion, minimum 1, zero reward, no survivors, per-person log and duplicate guard');

exec
/bin/bash -lc 'node scripts/sim/combat.cjs --jobs 0,0,2,3,1,2 --level 1 --floor 1 --n 100 && node scripts/sim/selftest.cjs' in /workspace/dungeonsweeper
 succeeded in 7550ms:
{"winRate":0.99,"wipeRate":0,"deathsPerBattle":0.04,"hpLossRate":0.08887573964497042,"averageRounds":5.51}
PASS simulator arguments, party identity, RNG diversity/reproducibility, growth reset, AI, escape/wipe/victory and timeout

codex
011の実装・自動検証は完了しました。

- 変更：`dist/game.js`、`docs/SPECIFICATION.md`、`tests/game.cjs`
- 撃破XPを生存者数で分配し、ログも1人分を表示。報酬0の場合は加算しません。
- 回帰テスト：100÷3→各33、1人生存→100、戦闘不能者への加算なし等を確認。
- 共通テスト3件、シミュレータ自己テスト、差分チェックは全PASS。
- Lv1・1F・6人・100戦：変更前後とも勝率99%、全滅率0%、平均5.51ラウンド。各戦でレベルを戻すため結果は同じです。

未完了：ブラウザでの手動確認。キューの移動・報告ファイル作成は行っていません。
tokens used
42,167
011の実装・自動検証は完了しました。

- 変更：`dist/game.js`、`docs/SPECIFICATION.md`、`tests/game.cjs`
- 撃破XPを生存者数で分配し、ログも1人分を表示。報酬0の場合は加算しません。
- 回帰テスト：100÷3→各33、1人生存→100、戦闘不能者への加算なし等を確認。
- 共通テスト3件、シミュレータ自己テスト、差分チェックは全PASS。
- Lv1・1F・6人・100戦：変更前後とも勝率99%、全滅率0%、平均5.51ラウンド。各戦でレベルを戻すため結果は同じです。

未完了：ブラウザでの手動確認。キューの移動・報告ファイル作成は行っていません。
