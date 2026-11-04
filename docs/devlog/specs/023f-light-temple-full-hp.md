# 023f-light-temple-full-hp（023e は取り下げ・ユーザー決定）

## 目的
ユーザー決定：寺院で蘇生成功したメンバーは HP 全快（現在は HP1）。

## 変更
1. templeRaise 成功時：status='ok'、HP=最大HP（MPも最大に）。失敗時の挙動（dead→ash、ash→lost）は変えない。
2. 023e（馬小屋でHP全快）は実装しない。
3. tests/temple.cjs の成功時 HP1 アサーションを HP=maxHP・MP=maxMP に更新（他のアサーションは弱めない）。
4. SPECIFICATION.md / BALANCE.md の寺院の記述を更新。

## OKの判定方法
- tests/*.cjs, compile-monsters --check, sim selftest 全PASS。
- ライブ：死亡者を寺院で蘇生→成功時にHP/MPが最大値で表示、そのまま迷宮に入れる。PC/モバイルでエラー0。
