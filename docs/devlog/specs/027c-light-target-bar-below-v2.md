# 027b-light-target-bar-below：対象選択バーをパーティー欄の下へ、「キャンセル」を「戻る」の位置に
ティア: light / 依存: 027・028 の後（main afd33ae 時点のコードが前提）

## 共通ルール（必読・/workspace/dsw-queue/README-handoff.md と同じ）
- 先に AGENTS.md、docs/HANDOFF.md、docs/SPECIFICATION.md を読む。実行コードが正本。
- セーブキー ash-v1 と旧セーブ移行を壊さない。職業は jobOf(i)。戦闘ログはスナップショット方式（log()）を維持。敵データは data/monsters.csv→scripts/compile-monsters.py。npm依存を追加しない。
- このファイルの「変更内容」以外のファイル・UI・バランスは変更しない。1ファイル＝1機能/1修正。
- 変更した挙動には回帰テストを tests/ に追加する。
- 報告は日本語で簡潔に：変更ファイル、テスト結果、完了/未完了、ブラウザ未確認ならその旨。

## 目的
本人のフィードバックです。027 の対象選択モードでは、案内バー #allytargetbar（案内文 #allytargetprompt・#allytargetcancel・従来の select/ボタン #allytargetfallback）が .party-wrap 内で #party の**上**に挿入されるため、モードに入るとパーティー欄全体が約144px下にずれる（027-verify で計測）。枠がずれるのは嫌なので、バーをパーティー欄の**下**に置く。また「キャンセル」は普段「戻る」がある位置に置き、モード中は「戻る」を表示しない。

## 現状（afd33ae）
- dist/index.html：`.party-wrap` = `#allytargetbar`（hidden）→ `#commandreviewpopup` → `#party`。その下が #bosschoice、.controls（探索時の移動）、#battle（戦闘時：#commandentry ＋ #flee）。
- 戦闘中の「戻る」：dist/combatui.js renderCommandEntry が #commandentry の末尾（.commandchoices の下）に `<button data-command-back>` を描画。コマンド入力中は「前のメンバーへ戻る」（先頭メンバーでは disabled）、行選択中は行選択解除、呪文対象選択中は pendingSpell 解除、行動確認画面では最後のメンバーへ戻る。027 では対象選択モード中も「戻る」が表示され、押すと cancelAllyTargetPick()。#flee はモード中 hidden。
- 探索中は「戻る」ボタンは存在しない（呪文・薬は #magicdialog/#medicinedialog/#inventorydialog から入り、キャンセルでそのダイアログに戻る）。

## 変更内容
1. dist/index.html：#allytargetbar を .party-wrap 内の **#party の後ろ**へ移動（#party → #allytargetbar の順）。#commandreviewpopup の位置は変えない。バーの表示・非表示で #party の上端 y が変わらないこと。バーは #party の下〜#battle/.controls の上に出る（下側のコンテンツが下にずれるのは許容）。
2. 戦闘中：
   - 対象選択モード中は #commandentry の `[data-command-back]` を描画しない（hidden ではなく出さない、または hidden 属性）。
   - その位置（#commandentry 末尾の「戻る」と同じ要素位置・同じ幅/高さ/クラス）に「キャンセル」を出す。実装は、モード中の renderCommandEntry が `<button id="allytargetcancel" class="（戻ると同じクラス）">キャンセル</button>` を「戻る」の場所に描画し、#allytargetbar 側のキャンセルは hidden にする（id 重複不可。同じ onclick=cancelAllyTargetPick）。
   - キャンセル後：モード終了、「戻る」が元の位置に再表示され、pendingSpell・コマンド入力は 027 と同じ状態（呪文/薬の選択前）に戻る。
   - 戦闘中のバー（#allytargetbar）は案内文と従来ボタン/select のみ表示。
3. 探索中：「戻る」は存在しないので、「キャンセル」は #allytargetbar 内（パーティー欄の下）に表示。バー内のレイアウトは「案内文 → 従来 select/発動 → キャンセル（全幅、戦闘の『戻る』と同じクラス・高さ）」の順で、戦闘中と同じ見た目の位置関係にする。キャンセルで元のダイアログに戻る（027 と同じ、選択保持）。
4. Esc は従来どおり両モードでキャンセル。キーボードのフォーカス順：候補カード → バー → キャンセル。
5. 390px でキャンセルは高さ 44px 以上。横スクロールなし。
6. docs/SPECIFICATION.md の対象選択の節を更新。

## OKの判定方法
- 既存テスト一式（node tests/*.cjs、compile-monsters --check、sim selftest、training-browser / town-layout-browser）PASS。
- tests/target-select-browser.py を更新（既存 assert は弱めない。キャンセル位置の変更に伴うセレクタ変更のみ可）し、1280 と 390 で：
  - 探索の呪文・薬、戦闘の呪文・薬それぞれで、モード開始前・モード中・キャンセル後・決定後の #party の boundingBox.y が完全一致（±0.5px）。
  - #allytargetbar の top ≥ #party の bottom（バーがパーティー欄の下）。
  - 戦闘モード中：`[data-command-back]` が表示されていない（count 0 または not visible）、#allytargetcancel が #commandentry 内で、モード前の「戻る」と同じ x/y/幅（±2px）。キャンセル後「戻る」が同じ位置に再表示。
  - 探索モード中：#allytargetcancel が #allytargetbar 内に見える。キャンセルで元ダイアログに戻り選択保持。
  - Esc で両モードともキャンセルできる。キャンセルボタンは 390px で 44px 以上。JS エラーなし・横スクロールなし。
- スクリーンショット /workspace/sim/ts-390-below-*.png を保存。

---
## 改訂（027c、027b を置き換え）— 試遊

027b は、OK判定どうしが矛盾していたので保留にしました（report/027b-light-target-bar-below-HOLD.md）。以下の内容を、上の該当箇所より優先します。

- 戦闘中は、案内バー（案内文と従来のプルダウン）を #battle の下に置きます（案 a）。こうすると #party も #commandentry も、バーのせいで下がりません。探索中は 027b のとおり、パーティー欄の下に置きます。
- 戦闘中の「キャンセル」は、「戻る」とまったく同じ場所に置きます。つまり #commandentry の末尾の要素で、「戻る」と同じ x・幅・高さにします。y はそろえなくてかまいません（案 b）。呪文対象のボタンに切り替わるとコマンド欄の中身が変わるので、y が動くのは「戻る」でも同じことだからです。
- 通常の「戻る」は高さ 48px に戻します。.commandback で 44px に縮んだ副作用を元に戻します。
- hold/027b（b58e873）で直したところは引き継ぎます。allytargetcancel の重複の解消、cancelAllyTargetPick の接続、セレクタの変更です。

### OKの判定方法（改訂）
- 1280px と 390px で、探索中と戦闘中のそれぞれについて、呪文と薬の両方を確認します。モードに入る前・モード中・キャンセル後・決定後のどの時点でも、#party の上端の y が ±1px 以内で動かないこと。
- 戦闘中は、案内バーが入っても #commandentry の上端の y が ±1px 以内で動かないこと。
- 戦闘中のキャンセルが #commandentry の末尾の要素で、モード前の「戻る」と x・幅・高さが ±2px 以内で同じであること。モード中は「戻る」が表示されず、キャンセルすると「戻る」が元に戻ること。
- 通常の「戻る」の高さが 48px であること。
- Esc でキャンセルできること。既存のテストはどれも弱めないこと。テスト一式がすべて PASS すること。
