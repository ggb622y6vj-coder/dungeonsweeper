# 001-bugfix-name-regex 検証レポート

判定: **OK**（追加の修正タスク 001a は不要）

対象コミット: fd6b926

## 確認した内容
1. `git pull` で fd6b926 まで進めた後、`node tests/game.cjs && node tests/training.cjs && python3 scripts/compile-monsters.py --check` を実行し、すべて PASS（モンスター定義 31 件の検証も OK）。
2. node での再現スクリプト（/workspace/sim/bugs2.cjs）で、`(テスト` `[a` `a.*+?^$` `\` `a.b` `a|b` `)` `{1}` の各名前を試した。
   - どの名前でも例外は発生しない。
   - 「名前の攻撃。」の部分は log-ally として色付けされる。
   - `a.b` の名前で `aXb` が誤って色付けされることはない。
   - 敵名とダメージ／回復の色付けも従来どおり。
3. Pages（https://ggb622y6vj-coder.github.io/dungeonsweeper/）の game.js は repo の dist/game.js とバイト単位で一致しており、デプロイ済み。
4. Pages 上でヘッドレス Chrome により UI 操作で確認した。
   - 手順: 訓練所で `(テスト` `[a` `a.*+?^$` `\` `a|b` `)` を登録 → 既存メンバーを離脱させ、6 名を加入 → 迷宮へ入る → 探索と戦闘を約 40 手実行。
   - 結果: pageerror は 0 件。ログ中の log-ally span は 20 件。
   - スクリーンショット: /workspace/sim/v001.png

## OK の判定方法との照合
- 特殊文字を含む名前でもクラッシュしない: OK
- 名前が正しく色付けされ、正規表現として解釈されない: OK
- 回帰テストが追加され、テストがすべて通る: OK
- ブラウザでの手動確認: 上記の Chrome テストで代替し、OK
