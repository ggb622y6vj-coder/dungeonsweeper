# 実装構成と保存

## ファイル

| パス | 役割 |
|---|---|
| dist/index.html | HTML全画面・CSS・dialog・script読込順 |
| dist/game.js | 中央状態s、迷宮生成、移動、戦闘、描画、保存、ログ、商店・宝箱 |
| dist/combatui.js | 順番コマンド、対象選択、行動確認 |
| dist/party.js | 職業識別、6人移行、酒場、並べ替え、譲渡、装備概要、盗賊開封 |
| dist/balance.js | 職業、経験値曲線と移行 |
| dist/weapons.js | 武器17・防具9。防具もWEAPONS配列に追加 |
| dist/items.js | 薬2・消費・対象選択・スロット削除 |
| dist/spells.js | 呪文25・習得・MP・効果・選択UI |
| dist/flags.js | 旗種・発動・デバフ・ボタン |
| dist/traps.js | 床罠5種類 |
| data/monsters.csv | 敵31種類の編集正本 |
| scripts/compile-monsters.py | CSV検証・JS生成。固定IDは確定名に紐付く |
| dist/monster-data.js | 生成されたENEMIES。直接編集しない |
| dist/monsters.js | 敵特殊行動、戦闘終了、旧敵移行、解呪 |
| tests/game.cjs | Node vm＋簡易DOM＋タイマーによる回帰テスト |

ビルド不要、classic scriptのグローバル共有。index.htmlのscript順を維持。外部画像・フォント・CDN依存・バックエンドAPIなし。図形はSVGと文字。単独でdistフォルダを配信すれば動作する。

## 状態と保存

sが状態本体。localStorageのキー`ash-v1`にJSON保存。別端末・別ブラウザ・別ドメインとは共有しない。サーバーDB、アカウント別セーブ、クラウド同期はない。

- members：id,job,name,level,xp,maxHP,maxMP,str,ac,intelligence,piety,known,xpTargets等。
- hp,mp,inventory,equipped,armor,ailments：membersと同順の並行配列。装備はアイテムIDではなくinventory内の添字。
- reserve：控えのレコード。PARTY_FIELDSごとに1名分の状態を保持。
- floor,size,start,boss,pos,dir,cells：現在階。cellsはtrap,open,flag,type,spent,trapKind,chest等。
- floors：訪問階のマップ保存。帰還時破棄。
- enemy：units（id,uid,row,hp,rewarded,identified,sleep等）、boss,chestBattle,lootGold,pendingXP,pendingGold,pendingDrops,initiative,flagEffect等。
- commands,attackRows,magicPlans,itemPlans：選択した行動。UI側にcommandIndex等の一時変数もある。
- light,watchful,dumapicUses：帰還までの魔法状態。
- pendingBoss,pendingStairs,done,area：画面・イベント遷移のガード。

ensureProfile→ensureStats/ensureSixParty/ensureMagic/ensureProgression等が旧セーブを補完。migrateMonsterBattleは読込時の旧敵IDを移行する。初期状態生成と移行は同じではない。

## ログ同期

計算は同期で完了するが、log()でenemy・hp・mp・ailments・membersをstructuredCloneしキューへ格納。pumpLogが順番にdisplayCombat/displayVitalsへ適用。visibleCombat()はスナップショット優先。logBusy中は操作を抑止。ログ再生末尾で実状態へ復帰。

敵のhp=0とrewarded=trueは別の瞬間。ダメージログではまだ姿を残し、撃破ログで消す。enemyGroupsはrewardedのない列を表示順に詰める。rowは内部ID、indexが現在の表示位置。保存するのは実状態sで、ログ再生途中のキューは永続化しない。そのため途中リロード時は計算済みの結果で再開する。

## セーブを移す場合

このZIPに利用者のブラウザのlocalStorageは含まれない。開発用の空セーブから動く。元サイトの進行を移す必要がある場合は、別途セーブのエクスポート／インポート機能を追加すること。現時点で既存の機能と説明してはいけない。

## テストの限界

tests/game.cjsはブラウザではない。DOMの見た目、タッチ操作、dialogのフォーカス、スクロール、モバイルサイズは実ブラウザで確認が必要。テストのPASSは原作仕様の正しさや全ての境界条件を証明しない。
