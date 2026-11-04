# 020-heavy-death-status 検証（16e4efa）
判定：**OK（UX上の不具合1件 → todo/020a-bugfix-town-entry-message.md）**

## テスト
tests/*.cjs すべて、compile-monsters、sim selftest：PASS（death-status.cjs を含む）。

## node
- 毒で HP0 → dead になった。床の罠で HP0 → dead になった。
- markDeaths は game、monsters、traps の各所で呼ばれている。戦闘、罠、毒、宝箱の罠が対象。
- 帰還（enterTown）すると ok のメンバーは全回復し、dead は HP0 のまま。
- 死者入りのパーティで enterDungeon すると入場できず、ログに「死亡したメンバーを外してください。」が出る。
- 死者を外す（setPartyFromRoster）と入場できた。死者は控えに dead のまま残る。
- status の無い旧データは ensureProfile で ok に移行した。
- ソフトロックの確認：
  - 6人全員を dead にしても、registerRecruit で新しいキャラを作り、そのキャラだけでパーティを組んで入場できた。詰まない。
  - ただし 021（寺院）までは死者を復活させる手段が無い。

## ライブ（game.js・party.js・monsters.js が一致）
- status を取り除いた旧セーブを入れて再読込した → 全員 ok。
- 迷宮で毒により1人 dead → 帰還しても HP0・dead のまま → 再読込しても保持された。
- 死者を外して入場できた。pageerror は0件。
- スクリーンショット：/workspace/sim/v020-dead-dungeon.png, v020-blocked.png, v020-entered.png

## 不具合
- 町で「迷宮への入り口」を押しても、拒否メッセージが画面に出ない。町にはログ欄が無いため、無反応に見える（v020-blocked.png）。

## 備考
- 旧セーブで迷宮内にいて既に HP0 のメンバーは ok に移行され、帰還すると回復する。寛容な扱いで、許容範囲。
