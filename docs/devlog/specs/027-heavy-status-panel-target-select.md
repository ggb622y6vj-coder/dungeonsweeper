# 027-heavy-status-panel-target-select：味方対象をパーティー欄のタップで選ぶ
ティア: heavy / 依存: なし

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
味方を対象にする薬・呪文の対象選択は現在バラバラで、ログ下のパーティー欄（#party）と別の場所で行う。
- 探索中の薬：dist/items.js openMedicine → #medicinedialog 内の `<select id="medicinetarget">`（HP>0 の味方のみ）→「使う」。
- 探索中の呪文：dist/spells.js openMagic → #magicdialog で呪文選択 → `<select id="magictarget">`（renderMagic、ally は s.hp>0 のみ）→「発動する」。モーダルがパーティー欄を覆う。
- 戦闘中の呪文：dist/combatui.js chooseBattleSpell → #commandentry に `data-spell-target` ボタン列（spellTargets）。
- 戦闘中の薬：コマンド「薬」→ openMedicine（探索と同じダイアログ/select）、s.itemPlans[i] に保存。
- 現在 #party のクリック/Enter は能力値ダイアログ（#statsdialog）を開く。
- アイテム譲渡（party.js #transfermember select）・装備は対象選択が別系統で、本タスクの対象外。
- 蘇生アイテムは存在しない（死者・灰・ロストは寺院のみ）。対象は常に「HP>0 かつ status==='ok'」の味方。
パーティー欄のメンバーを直接タップして対象を決められるようにし、UI を素直にする。

## 変更内容
1. 共通の「対象選択モード」を追加（例 dist/combatui.js か新規関数 beginAllyTargetPick({candidates, onPick, onCancel, prompt})）。
   - モード中は #party の各 .card に `data-ally-target="i"` を付与。候補は既存の判定（validMagicTarget / useMedicine と同じ s.hp[t]>0）から作り、判定ロジックを複製しない。
   - 候補行：`.targetable` で枠線ハイライト＋軽いパルス。非候補（死亡・灰・ロスト・HP0）：`.untargetable` で減光、`aria-disabled="true"`、クリックしても何もしない。
   - 候補カードは role="button" tabindex="0"、aria-label「冒険者3を対象に選ぶ HP 23/23」。Enter/Space で決定、Esc でキャンセル。最初の候補にフォーカス。
   - パーティー欄の上（または #commandentry）に案内バー「対象を選んでください：ディオス」と「キャンセル」ボタンを表示。
   - モード中は #party の通常クリック（能力値ダイアログを開く）を抑止。モード終了で元に戻す。render() で再描画されてもモード状態（モジュール変数）から属性を再付与する。
2. 探索中の呪文・薬：呪文/薬を選んで ally 対象なら、ダイアログを閉じて対象選択モードへ。決定で従来どおり castMagic / useMedicine を実行。キャンセルで元のダイアログに戻す（選択中の呪文/薬は保持）。
3. 戦闘中：chooseBattleSpell の ally 呪文と、コマンド「薬」の対象決定を同モードで行う。決定で s.magicPlans[i]/s.itemPlans[i] を設定して confirmCommand(i)。キャンセル・「戻る」(data-command-back) で pendingSpell を解除してコマンド入力に戻る。commandIndex の進行・コマンド確認ポップアップの流れは変えない。logBusy() 中は無効。
4. フォールバック：既存の `data-spell-target` ボタン列と #medicinetarget/#magictarget の select は残す（パーティー欄が画面外のとき/支援技術用）。どちらで選んでも同じ結果。片方で決定したら両方とも終了。
5. モバイル：390px で .card のタップ領域は最低 44×44px、ハイライト時にレイアウトが動かない（outline/box-shadow を使い幅を変えない）。必要なら選択モード開始時に #party を scrollIntoView({block:'nearest'})。
6. docs/SPECIFICATION.md に対象選択の挙動を追記。

## OKの判定方法
- 既存テスト（node tests/*.cjs、compile-monsters.py --check、sim selftest、training-browser.py 1280/390）が全て PASS。既存 assert を弱めない。
- tests/ にブラウザテスト（例 tests/target-select-browser.py、/tmp/pyv/bin/python、1280 と 390）を追加し、以下を検証：
  - 探索中ディオス：呪文選択後に #party の生存メンバーが .targetable、死者は .untargetable/aria-disabled。死者カードのクリックで何も起きない（MP 不変）。候補カードのタップで対象の HP が回復し MP が減る。
  - 探索中の薬：同様に、カードタップで対象回復・薬が消費される。
  - 戦闘中ディオス：コマンド入力中にカードタップで s.magicPlans[i].target が設定され次のメンバーへ進む。旧 `data-spell-target` ボタンでも同じ結果。
  - 戦闘中の薬：カードタップで s.itemPlans[i].target が設定される。
  - キャンセルボタンと Esc：モード終了、ハイライト除去、MP/薬/コマンド不変、#statsdialog が開かない。
  - キーボード：Tab で候補カードへ移動し Enter で決定できる。
  - モード外の #party クリックは従来どおり #statsdialog を開く。
  - 390px で候補カードの boundingBox が 44×44px 以上、横スクロールなし、JS エラーなし。
- tests/*.cjs に対象候補の算出（死者・灰・ロスト除外）の単体テストを追加。


> 【承認済み 2026-11-02 12:50 本人】026・026a の後に実装し、テスト一式PASSで main に push してよい。
