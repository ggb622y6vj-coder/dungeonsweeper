# 027c 完了報告：対象選択バーをパーティー欄の下へ／キャンセルを「戻る」の位置に（v2）
- コミット: baec29f（main に push 済み。a774946 の次）
- モデル: gpt-6-luna low（1回目で実装。Codex のサンドボックスでは Chromium が起動できず、ブラウザ検証は executor が実施）
- 日時: 2026-11-02 15:30 JST

## 変更ファイル
- dist/index.html：#allytargetbar を #party の後ろへ移動（探索用。中身は案内文→従来select/発動→全幅キャンセル #allytargetfieldcancel）。戦闘用バー #allytargetbattlebar（案内文＋従来select/ボタン）を #battle の後ろに新設。.commandback（min-height 48px）を追加
- dist/combatui.js：モード中の renderCommandEntry は「戻る」の代わりに #commandentry 末尾へ `<button id="allytargetcancel" class="commandback">キャンセル</button>` を描画（id 重複なし）。クリック→cancelAllyTargetPick。戦闘の呪文用に従来プルダウン（#allytargetspellselect/#allytargetspelluse）をバーへ表示。Tab 順：候補カード→バー→キャンセル
- docs/SPECIFICATION.md：対象選択の節を更新
- tests/target-select-browser.py：位置の判定を追加（下記）
- tests/target-select.cjs：キャンセルのセレクタ変更のみ
- MANIFEST.sha256：再生成（クリーンな worktree で sha256sum -c OK）

## Codex の出力に executor が加えた修正
1. 行動確認画面の「戻る」にも .commandback が付いて、「この行動で戦う」と「戻る」が 44px（390px では 40px）から 48px に変わっていた → 行動確認画面の「戻る」からクラスを外して元に戻した
2. .commandback の margin-top:10px で、通常の「戻る」とコマンド欄が 4px 下がっていた（y 683→687）→ #commandentry 内では margin-top:0 にして、a774946 と完全に同じ位置に戻した
3. Codex が追加したテストのうち、「行動確認画面の戻る」と「メンバー画面の戻る」の位置を比べる判定が、別の画面どうしを比べていて必ず失敗していた → 削除し、「通常の戻るは高さ 48px」の判定に置き換えた
4. テストを強めた：モード前の「戻る」は高さ ≥48 から =48（±0.5）に。戦闘のキャンセル/Esc の各ケースで、キャンセルが #commandentry の最後の要素であること、「戻る」が 0 個であること、キャンセル後に「戻る」が x/y/幅/高さ ±2px で元の位置に戻ることを追加。戦闘の呪文で従来の [data-spell-target] ボタンをクリックするケースを残した（Codex は新しいプルダウンに置き換えていたので、両方を判定する）
- 戦闘中の「戻る」を押してキャンセルする旧ケースは、モード中は「戻る」がなくなる仕様なので削除した（キャンセルボタンと Esc のケースで代わりに判定）

## テスト結果（すべて PASS）
- node tests/*.cjs：death-status, final-boss, game, library, monster-dice, target-select, temple, training の8本
- python3 scripts/compile-monsters.py --check：88 monster definitions validated
- sim selftest（node scripts/sim/selftest.cjs、baec29f のクリーンな worktree で実行）：PASS
- training-browser / town-layout-browser / target-select-browser：1280・390 とも PASS（JS エラーなし、横スクロールなし）

## 実測（Chromium）
| | 1280px | 390px |
|---|---|---|
| 探索：#party の y（前/モード中/Esc後） | 274/274/274 | 290/290/290 |
| 探索：#party の下端 → バーの上端 | 489 → 489 | 483 → 483 |
| 探索：キャンセル（#allytargetbar 内） | x119 y581 幅630 高さ48 | x29 y575 幅332 高さ48 |
| 戦闘：#party の y（前/呪文/薬/キャンセル後） | 274 変わらず | 290 変わらず |
| 戦闘：#commandentry の y | 497 変わらず | 491 変わらず |
| 戦闘：モード前の「戻る」 | x113 y683 幅641.8 高さ48 | x23 y665 幅344 高さ48 |
| 戦闘：キャンセル（呪文・薬とも） | x113 y683 幅641.8 高さ48 | x23 y665 幅344 高さ48 |
| 行動確認画面の戻る/この行動で戦う | 44px（a774946 と同じ） | 40px（a774946 と同じ） |
- a774946 ではモード中に #party が 92px（呪文）／210px（薬）下がっていたが、0px になった
- モード中は「戻る」が 0 個。キャンセル/Esc の後は「戻る」が同じ位置に戻る。探索で Esc を押すと、元の呪文ダイアログに戻り、選択も残る

スクリーンショット: /workspace/sim/ts-{1280,390}-below-field-{spell,medicine}.png、ts-{1280,390}-below-battle-{spell,medicine}.png
