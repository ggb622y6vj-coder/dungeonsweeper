# 027b 保留報告（未push）
- モデル: gpt-6-luna low（1回目で完了報告。ただしCodexはブラウザ未検証）
- 状態: ローカルブランチ hold/027b（b58e873）。main は a774946 のまま。タスクは held/ へ移動。

## 保留理由（OK判定の矛盾）
「バーは #party の下〜#battle の上（下側のずれは許容）」と「戦闘モード中の #allytargetcancel がモード前の『戻る』と同じ x/y（±2px）」が両立しない。
バーが #battle の上に入るので、#commandentry ごとバーの高さ分下がる。
- 呪文: 戻る y=684 → キャンセル y=630（1280px）。コマンド欄が呪文対象ボタン列に変わり、高さが234→132pxになるため
- 薬:   戻る y=684 → キャンセル y=842（1280px）。バー高さ158px分下がるため
390px も同じ傾向（666→620 / 666→824）。x・幅・高さは一致。

## そのほかは全PASS（hold ブランチ）
node tests/*.cjs 全8本、compile-monsters --check、sim selftest、training-browser / town-layout-browser 1280・390。
target-select-browser は y 判定だけで落ちる（y を除いた一時コピーでは 1280・390 とも PASS）。

## Codex出力への修正（hold ブランチに含む）
- 戦闘中に id="allytargetcancel" が重複していた → バー側ボタンに .fieldcancel を付け、戦闘のモード中は id を外す
- コマンド欄のキャンセルを押しても何も起きなかった（box.onclick 未対応）→ cancelAllyTargetPick を呼ぶ処理を追加
- tests/target-select.cjs で Codex が追加した assert のセレクタを '#allytargetbar .fieldcancel' に変更
- 注意: .commandback クラスの影響で、通常時の「戻る」の高さが 48→44px に変わっている

## 判断してほしいこと（試遊へ）
次のどれにするか:
(a) 戦闘中はバーを #battle の下に置く／オーバーレイにする
(b) 判定を「#commandentry の最後の要素で、x・幅・高さが同じ」に緩める
(c) モード中のコマンド欄の高さをそろえる

スクリーンショット: /workspace/sim/ts-{390,1280}-below-{spell,medicine}.png（探索）、ts-{390,1280}-below-battle-{spell,medicine}.png（戦闘）
