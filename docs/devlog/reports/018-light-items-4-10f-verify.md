# 018-light-items-4-10f 検証（052b5c6）
判定：**OK（入手経路の不足は既存の019で解消予定）**

## 品数
- dist の weapons.js / items.js は assets と同一。52品。
- shop:false は **17品（タスク記載が正しい）**。grep で数えると18になるのは、3行目のコメント「shop:false は鍛冶屋に…」を数えているため。

## テスト
- game/training/compile-monsters/sim selftest すべてPASS。
- hitBonus の回帰テストあり。physicalAttack の閾値に `-(w.hitBonus||0)` が入っていることを確認した。

## node挙動
- buy：flamesword（shop:false）は買えない。longsword は買える。
- 宝箱/ドロップ：1〜10Fで minFloor 違反は0件（3000回×各階）。
- dropMedicine：上傷薬は4F〜、霊薬は7F〜。1〜2Fには出ない。
- 薬：
  - 気付け薬で麻痺3→0。
  - 上傷薬は+9（4d4）。
  - 霊薬は+17（8d3）。
- **バグ**：
  - chestItemPool の価格上限（floor*150）で、shop:false のうち宝箱に出るのは flamesword と powerstaff の2品だけ。
  - shop:false 防具6品は drop フラグも無いので、入手不可。
  - todo/019-light-chest-loot-table で解消予定。019の priceCap 表と dropWeapon→chestItemPool で、17品すべてが minFloor の階から入手可能になることを確認済み。そのため 018a は作らない。019 の検証時に、全17品が入手できることを確認する。

## ライブ
- weapons/items/game.js が一致した。
- 鍛冶屋（戦士）の表示は20品で期待値と一致した。shop:false 品の表示は0件、はみ出しは0件。
- pageerror は0件。/workspace/sim/v018-shop.png, v018-shop-mobile.png
- 軽微：店の説明に hitBonus が表示されない（任意）。

## 4F〜10F sim（装備は各階の minFloor 以下から最良。n=300、守護者勝率%）
| 階 | Lv | 017時(全装備) | 店装備 | 迷宮産込み |
|---|---|---|---|---|
|7F|11/13|69.7/92.3|86/98|97/100|
|8F|12/14|35.3/90|65/96.3|91/98|
|9F|13/16|53.7/98|71.3/98.7|95/100|
|10F|15/18|31/78.3|79.3/95.3|99/100|
- 4〜6Fは店装備で守護者99.7〜100%。通常戦は全階で90%以上（8F Lv12 だけ 90.7%）。
- 迷宮産装備があれば推奨レベル帯で目標どおりになる。店装備だけだと、8〜10Fの推奨下限レベルでは厳しい。
- したがって 019 で入手経路が直ることが前提になる。019 の後に再測定する。
