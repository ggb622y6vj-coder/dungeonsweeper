# 指示書092：AGI（俊敏性）の導入と、俊敏性を用いた戦闘の行動順

## ユーザーの要望（原文）

> AGI(俊敏性)を導入し、原作と同様の俊敏性を用いた戦闘時の行動順を導入してください。行動順を処理する共通処理を設計し回帰テストを行って確かめてください。これまでと同様にトークン節約のため、適切なモデル選択と指示をお願いします。また、chatgtpのレビューを受け取るように。

## 現行の戦闘（実施者の調査）

- ターン処理は dist/game.js の attack()。全員のコマンド確定後、味方全員が編成順に行動し（partyAction）、敵が残れば enemyTurn() で敵全員がユニット順に行動する。混ざることはない。
- 奇襲・先制は遭遇時の rollInitiative()（'enemy' は遭遇直後に敵だけが行動、'party' は最初の attack() で敵が行動しない）で処理されている。
- 味方の能力値は STR（baseStr あり）・IQ・PIE の3つ。新規作成は dist/recruits.js の generateRecruit() が RECRUIT_BASES／RECRUIT_WEIGHTS で配分する。STR はレベルアップで baseStr＋⌊(Lv-1)/5⌋（上限18）に成長し、旧セーブ向けに strengthFor() と migrateStrength()（ensureProfile 内で本隊・控え両方に適用）がある。レベルダウン（lowerMemberLevel）でも同じ式で再計算する。
- 敵には俊敏性に相当するデータがない（レベルは1〜25）。CSV・Notion へ列は追加せず、レベルから導出する。

## 変更1：AGI の導入

### 味方

- メンバーに agi と baseAgi を追加する。STR と同じ作りにそろえる。
- 新規作成（dist/recruits.js）：能力値を4つに拡張する。AGI の基礎値は職業順（戦士・魔法使い・僧侶・盗賊）に [10, 9, 9, 14]（盗賊が最も俊敏）。ボーナス配分の重み RECRUIT_WEIGHTS にも AGI（index 3）を加える：戦士 [0,0,0,1,2,3]、魔法使い [0,1,1,1,2,3]、僧侶 [0,1,2,2,2,3]、盗賊 [0,0,1,1,2,3,3]。生成されるメンバーは agi と baseAgi を持つ。
- 成長：agilityFor(job, level) = min(18, [10,9,9,14][job] + ⌊(level-1)/5⌋)。levelUp() と lowerMemberLevel() で、STR と同じ形（baseAgi が無ければ agilityFor、あれば min(18, baseAgi + ⌊(Lv-1)/5⌋)）で再計算する。レベルアップ報告の行にも STR と並べて「AGI +N」を出す。
- 旧セーブ移行：migrateStrength() の隣に migrateAgility(m, job) を置き、agi が無いメンバーへ agilityFor(job, level) を入れる。ensureProfile() で本隊・控えの両方に適用する（STR と同じ場所）。セーブキー ash-v1 は維持。
- 取得は memberAgility(i) に集約し、agi が無い場合も agilityFor(jobOf(i), level) で代替できるようにする（テストや sim が手で組んだメンバーでも動く）。
- 表示：ステータス画面（renderStats）の能力値に AGI を STR の次へ追加。訓練所の能力表示（dist/training.js のラベル一覧と募集プレビューの行）にも AGI を追加する。

### 敵

- enemyAgility(e) = min(18, 6 + ⌊(monsterLevel(e) - 1) / 2⌋)（Lv1→6、Lv10→10、Lv25→18）。データ追加はしない。敵の能力値は従来どおり画面・ログに出さない。

## 変更2：行動順の共通処理

### 順序の決定（原作の方式に倣う）

- 各戦闘員は 1〜10 の出目から俊敏修正を引いた値を順序キーとし、小さい順に行動する。俊敏修正 agilityInitiativeBonus(agi) は、AGI 3以下：-2、4〜5：-1、6〜8：0、9〜12：+1、13〜15：+2、16以上：+3。
- 同点の場合は、AGI の高い方を先にし、それも同じなら味方を敵より先にし、最後は元の並び順（安定ソート）。
- 順序キーや出目はログに出さない（ダイス内部計算を出さないルール）。

### 共通処理の形

- combatActionOrder()：生存している味方全員（メンバー id で参照）と敵全ユニット（uid で参照）について順序キーを計算し、上記規則で並べた行動リストを返す純粋な共通処理とする。attack() はこれを使う。
- enemyAction(e, commandsById)：enemyTurn() の1体分の処理（睡眠の経過とログ、monsterAction か通常攻撃、autoReorderParty('enemy-action')）を切り出した共通処理。enemyTurn(cmds) は従来どおり「敵全員が順に行動する」入口として残し、内部で enemyAction を使う（遭遇時の奇襲と逃走失敗時が従来どおり動くため）。
- attack() の書き換え：前処理（displayVitals、tickAilments、ターン開始ログ、身を守るのログ、identifyEnemies）は従来どおり。その後は combatActionOrder() の順に処理する。
  - 味方の番：id から現在の index を引き直して partyAction(i) を呼び、autoReorderParty('ally-action')。敵が全滅したら打ち切る。
  - 敵の番：initiative が 'party' のターンでは敵の番を飛ばす（先制の利点は従来どおり最初の1ターン敵が動かないこと）。uid からユニットを引き直し、死んでいたら飛ばす。enemyAction を実行し、味方が全滅したら defeat() して打ち切る。
  - 終端処理は従来どおり：敵全滅なら finishMonsterBattle()、initiative 'party' は 'normal' へ、tickBattleSilence／tickBattleFear、コマンド初期化、attackRows の直し、render()。
- 変えないもの：rollInitiative() の確率と意味、逃走、敵 AI の行動選択、ダメージ計算、quickAttack()（attack() を使うので自動で追随する）。

## 変更3：回帰テスト（tests/action-order.cjs を新設し、tests/game.cjs に登録）

scripts/sim/harness.cjs と seededRandom の既存パターンで、次を固定する。

- agilityInitiativeBonus の境界値（3/4、5/6、8/9、12/13、15/16）。
- enemyAgility の代表値（Lv1→6、Lv10→10、Lv25→18）。
- combatActionOrder が、出目を固定したときに期待どおりの順序（同点時のタイブレーク込み）を返す。
- attack() の実経路で混ざり合うこと：俊敏な敵が遅い味方より先に攻撃する（ログ順で確認）、俊敏な味方が敵を倒すとその敵は行動しない。
- 先制（initiative 'party'）の最初の attack() では敵が行動せず、次の attack() では行動する。
- 移行：agi の無いメンバー記録でも ensureProfile 後に memberAgility が agilityFor の値を返す。
- 生成：generateRecruit の作るメンバーが agi／baseAgi を持ち、値が 3〜18 に収まる。

既存テストが落ちた場合は、実装不良か、旧来の「味方→敵」の順序を前提にしたテストかを切り分けて報告すること。既存テストの変更は実施者の判断を仰ぐため、勝手に直さない。

## 進め方

- ブランチ hold/092 で実装と検証まで行い報告する。push と ChatGPT レビューは本指示に含まれ、検証完了後に行う。main 統合はユーザーの指示を待つ。
