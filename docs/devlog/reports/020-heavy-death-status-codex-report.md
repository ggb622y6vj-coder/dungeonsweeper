# 020-heavy-death-status 作業報告

実装・自動検証は完了。実ブラウザ確認と外部キューのdone移動は未完了。

## 変更ファイル

- `dist/game.js`：状態 `ok/dead/ash/lost` の旧セーブ移行、`markDeaths()`、毒・宝箱罠・共通ダメージでの死亡確定を追加。帰還時は正常者だけHP/MP全快、死亡・灰・ロストはHP0と残MPを維持。毒・麻痺は全員解除。正常以外を含むパーティーの入場を指定ログで拒否。状態表示は `shownMember()` を通じてログのスナップショットを参照。
- `dist/monsters.js`：敵のダメージ・即死で、結果のログを記録する前に死亡状態を確定。
- `dist/traps.js`：針・爆発による死亡状態を結果ログの記録前に確定。
- `tests/death-status.cjs`：戦闘から帰還・酒場での離脱・再入場までの回帰テスト、各HP0経路、全滅帰還、死亡・灰・ロストの表示・保持・入場拒否、並べ替え、旧セーブ移行とash-v1再読込を追加。
- `tests/game.cjs`：帰還時全快の検証を正常者対象に修正し、理由をコメント。死亡回帰テストを共通実行に組み込み。
- `docs/SPECIFICATION.md`：3章に本作の暫定仕様として死亡状態・帰還・入場制限・旧セーブ移行を記載。6章の旧帰還仕様も整合。

セーブキー `ash-v1`、既存のロスターと旧3人編成の移行を維持。戦闘式・XP・寺院は変更していない。

## 検証結果

- `node tests/game.cjs`：PASS（追加の死亡回帰テストを含む）。
- `node tests/training.cjs`：PASS。
- `python3 scripts/compile-monsters.py --check`：PASS（88種）。
- `node scripts/sim/selftest.cjs`：PASS。
- `git diff --check`：PASS。

回帰テストでは、物理攻撃・即死・敵ブレス・敵呪文・床の針/爆発・宝箱の針・探索/戦闘中の毒・hurtでHP0から死亡になることを検証。結果ログにも死亡状態が保存され、それ以前のログ再生中は死亡表示が先に出ないことを確認した。帰還後のHP0とMP据え置き、正常者の全快、全員の毒・麻痺解除、酒場から死亡者を外した後の入場を確認した。

状態未設定の旧セーブは、町・迷宮・控えそれぞれの移行を検証。ロスター形式・並列配列形式・旧3人形式で起動し、移行の再実行と保存・再読込でも状態が保持されることを確認した。

## 未完了

- 実ブラウザの手動確認：Python Playwrightは未導入。既存Chromeをheadlessで起動したが、`crashpad ... setsockopt: Operation not permitted (1)`（終了コード133）で失敗。DOMスタブによる表示・操作検証は実ブラウザ確認の代用とはしていない。
- キュー管理：`/workspace/dsw-queue` は実行環境の書込み許可範囲外（許可範囲は `/workspace/dungeonsweeper` と `/tmp`）。`todo/020-heavy-death-status.md` のdone移動および外部reportへの書込みは未実施。本報告をリポジトリ内の `report/` に保存した。
