# 005-bugfix-chest-item-pool 検証結果 — 判定: OK
- 対象: 82a7f8f（/workspace/verify-clone）
- テスト: game.cjs・training.cjs・compile-monsters --check すべて成功
- node（chestItemPool(floor) から各階5000回抽選）:
  - 1F: 最高価格 130G（chain）、20種類。板金鎧(plate 300G)は出ず、150G超も0件
  - 2F: 最高 300G（plate・greatsword 190・sacredmace 185・starstaff 180・wardrobe 180・compositebow 160 が追加）、26種類
  - 3F・5F: 2F と同じ26種類（全候補が300G以下のため）
  - floor=0（候補なし）: 最安の staff 12G だけを返すフォールバックが働く
- 本番（game.js がリポジトリと一致）headless Chrome（/workspace/pp/v005.cjs）: 6人で探索と戦闘を約130ラウンド。宝箱を現在のマスに注入し、openChest() で開封（Math.random を固定）。「宝箱を開けた。金貨15枚を獲得。」と出て装備品の抽選まで動作し、pageerror 0（404 はリソース1件のみ）
- 備考: 検証用パーティが全員戦士だったため、抽選された dagger（盗賊専用）は「アイテムがいっぱいで装備品を持ち帰れなかった。」になった。誰も装備できない時もこの文言が出るのは既存の仕様（005 の範囲外）。文言が誤解を招くので、必要なら別タスクで改善を。階層別ドロップ表への置き換えは 019 で予定どおり
