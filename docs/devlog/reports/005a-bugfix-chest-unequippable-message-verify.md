# 005a-bugfix-chest-unequippable-message 検証結果 — 判定: OK
- 対象: 2f1d1c7（/workspace/verify-clone）。テスト3つすべて成功
- node（Math.random=0.1 に固定し、1Fで短剣を引く。/tmp/v5a.cjs）:
  - 全員戦士: 「短剣を見つけたが、誰も扱えないので置いていった。」が1回、所持品は変化なし
  - 盗賊はいるが全員の所持品が10個: 「アイテムがいっぱいで装備品を持ち帰れなかった。」、所持品は変化なし
  - 通常（盗賊に空きあり）: 「短剣を入手。P2が受け取った。」
- 本番（game.js がリポジトリと一致）headless Chrome（/workspace/pp/v005a.cjs）: 全員戦士の6人パーティで宝箱を注入して開封。「短剣を見つけたが、誰も扱えないので置いていった。」が開封ごとに1回出て、pageerror 0（404 はリソース1件のみ）
