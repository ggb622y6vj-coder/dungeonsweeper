# 007-bugfix-combat-hide-numbers 検証結果 — 判定: OK
- 対象: 19eb1eb（dist/game.js の scene()）。テスト3つすべて成功
- 本番（game.js がリポジトリと一致）headless Chrome（/workspace/pp/v007.cjs）、デスクトップ 1280x800 とモバイル 390x844:
  - 探索中: #scene の SVG に数字 ['0','0']（前方または左右と現在地）が出る
  - 戦闘中（encounter() で戦闘を開始）: SVG の数字は 0個。デスクトップのマップには数字0が表示されたまま（変更なし）
  - 戦闘後（finishMonsterBattle()）: ['0','0'] に戻る
  - pageerror は両方の幅で 0
- スクリーンショット: /workspace/sim/v007-{desktop,mobile}-{explore,combat,after}.png
- 備考: 戦闘はスタート地点で強制的に開始したので、「町に移動しますか？」の はい/いいえ が戦闘中にも表示されている（テスト手順による状態で、修正とは無関係）。モバイルのマップは「地図」ボタンの中にあるため、画面には写っていない
