# 029-light-auto-temple-on-return：帰還時に死者を自動で寺院へ
ティア: light / 依存: 027b の後（020-024・021 寺院・026 の仕様が前提）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
本人の要望です。死者が出た状態で町に帰ると、現在は死者がパーティーに残り、enterDungeon で「死亡したメンバーを外してください。」と止められ、訓練所で手動で外す必要がある。帰還時に死亡・灰（・ロスト）のメンバーを自動でパーティーから外して寺院に運び、メッセージウィンドウで知らせる。

## 現状（afd33ae）
- dist/game.js enterTown()：status==='ok' のみ levelUp と HP/MP 全回復 → resetDungeon() → render() → showLevelReport()（s.levelReport があれば #leveldialog を showModal）。
- enterDungeon()：`s.members.some(m=>m.status!=='ok')` なら #townnotice に「死亡したメンバーを外してください。」で中止（020）。
- 寺院 renderTemple / templeRaise は trainingRoster()（パーティー＋s.reserve）から dead/ash を列挙するので、控え（reserve）にいても表示・蘇生できる（表示は「控え」）。
- lost：寺院で灰の蘇生失敗時に発生し恒久。changeRecruitParty は lost の加入を拒否。訓練所では抹消のみ可（022）。
- 全滅（defeat → finishDefeat）は遺体を迷宮に残す（030/031）。enterTown を経由しない。

## 変更内容
1. dist/game.js enterTown()：levelUp/回復の後、resetDungeon() の前に「搬送」処理を追加。
   - 対象：s.members のうち status が dead / ash / lost のメンバー。
   - 外し方：changeRecruitParty(id,false) と同じ並べ替え処理（PARTY_FIELDS 全配列・s.commands・magicPlans・itemPlans・attackRows を整合）で s.reserve に移す。enterTown 中は idle() 等のガードで changeRecruitParty が拒否する可能性があるので、内部の並べ替えを関数化（例 removeFromParty(ids)）して両方から使う。status・HP0・XP・レベル・装備・所持品はそのまま。
   - 記録：s.templeReport=[{name,status}]（ash-v1 に保存し、表示後に消す。リロードで未表示なら再表示）。
2. メッセージウィンドウ：dist/index.html に #templecarrydialog（modal、見出し「寺院への搬送」、本文 #templecarrylist、OK ボタン #templecarryok）。名前は textContent。
   - 本文例：「冒険者1（死亡）、冒険者4（灰）を寺院に運んだ。寺院で蘇生できます。」lost は「冒険者5（ロスト）はパーティーから外れた。ロストは蘇生できません。」と別行。
   - 誰も外れなければ表示しない。
3. 表示順（決定）：**搬送ダイアログ → OK → レベルアップ報告（#leveldialog）** の順に順番に表示する（結合しない）。
   - 理由：(a) 024 の #leveldialog と既存テストをそのまま使える、(b) 2つの modal の同時 showModal を避けられる、(c) 死亡は行動が必要な知らせ（寺院へ行く）なので先に、成長報告は後に。
   - 実装：enterTown 末尾で templeReport があれば搬送ダイアログを開き、OK（Esc で閉じた場合も close イベントで）時に showLevelReport()。無ければ従来どおり showLevelReport()。
4. enterDungeon の死者拒否（020）はガードとして残す（自動搬送で通常は発生しない）。
5. 寺院：外れたメンバーが「控え · Lv.N · 死亡/灰」で一覧に出て蘇生できること（既存の仕組みで出るはず。出なければ修正）。蘇生成功後は控えのままで、加入は訓練所で手動（自動復帰しない）。
6. 訓練所：外れたメンバーは名簿に死亡/灰/ロスト表示で残る。加入ボタンは dead/ash も無効にする（現在 lost のみ拒否。死者を再加入しても enterDungeon で止まるだけなので、changeRecruitParty の join を status==='ok' のみに制限）。
7. 全滅時の遺体フロー（030/031）は変えない（enterTown を通らないので搬送対象外）。遺体回収で reserve に戻った死者は従来どおり。
8. docs/SPECIFICATION.md・docs/HANDOFF.md に追記。

## OKの判定方法
- 既存テスト一式 PASS（024 のレベル報告テスト含む）。既存 assert を弱めない。
- tests/ に node テスト（例 tests/auto-temple.cjs）：6人パーティーで 1人 dead・1人 ash にして enterTown →
  - s.members が 4人、reserve に2人（status dead/ash、HP0、XP/レベル/所持品不変）、PARTY_FIELDS の配列長が全て4、commands/plans も4。
  - s.templeReport が2件、生存4人はレベルアップ・全回復。
  - save→再読込（ash-v1）で 4人パーティー・reserve 2人が保持、templeReport も保持。
  - 寺院一覧（trainingRoster の dead/ash）に2人、templeRaise で控えのまま ok になる。
  - 死者なしの帰還では templeReport 空、ダイアログを開かない。lost を含むと外れてメッセージに「ロスト」。
  - 全滅（defeat）では搬送せず遺体が残る（既存挙動不変）。
  - dead/ash の加入が拒否される。
- ブラウザテスト（tests/auto-temple-browser.py、1280 と 390）：死者を作って階段で帰還 → #templecarrydialog に名前と「死亡」「灰」、寺院への案内 → OK → #leveldialog が表示 → 閉じる → 寺院を開くと2人が「控え」で表示、訓練所で死亡表示・加入不可、#entrance で迷宮に入れる（拒否されない）。リロード後も 4人。死者なし帰還ではダイアログが出ない。JS エラーなし・横スクロールなし。
