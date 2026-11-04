# 042 敵の命中にモンスターLvを反映 — 報告

- 結果: push済み `ad6d6a0`（main、親 a19f5ae）。040は含まない。
- 実装: Codex gpt-6-astra (reasoning high) 1回目で完了。Codex は自分専用の /tmp コピーで作業してコミットしたので、レビュー側で patch を専用 worktree (/tmp/wt-042) に適用した。
- 変更: dist/game.js の敵打撃を `hits(d.hit+levelHitBonus(e,i),effectiveAC(i))` に変更。`levelHitBonus = clamp(-3,3,trunc((monsterLevel(e)-s.members[i].level)/3))||0`。テスト tests/monster-level-hit.cjs を追加（game.cjs からも実行）。SPECIFICATION/HANDOFF/docs/042-MONSTER-LEVEL-HIT.md を更新。MANIFEST を再生成。
- レビューで直した点: コードの不具合はなし。Codex の sandbox ではブラウザテストを起動できなかったため、レビュー側で実行して docs の「未完了」記述を結果に差し替えた。守護者シムの参考値を追記した。
- テスト: tests/*.cjs 全16本 PASS、compile-monsters --check PASS、sim selftest PASS（clean worktree）、ブラウザ全13本 1280/390 PASS。新しいブラウザテストはなし。T キーの割り当てはなし。
- 6Fの命中率（Lv5 と Lv12 の差）: 亡霊/石巨人/キメラ/闇の騎士/闇エルフ +10pt、毒茸/吸血蝙蝠 +5pt（基準 5〜15pt を満たす）。

## シム（--jobs 0,0,2,3,1,2 --n 400、before=worktree a19f5ae、after=worktree ad6d6a0候補）
全10階で全滅率・戦闘あたり死亡が before と完全に同じ（before の値は基準表と一致）。
1F 0/0.010, 2F 0/0, 3F 0/0.015, 4F 0/0, 5F 0.0025/0.200, 6F 0.0125/0.1825, 7F 0.0025/0.1125, 8F 0/0.0375, 9F 0/0.0325, 10F 0/0.0275。
理由: 表のLvでは通常敵とのLv差がすべて -2〜+2 なので補正は0になる。除数は3のまま。
コードは実際に効いている（6F Lv5: 全滅率 0.19→0.175、死亡/戦 1.7225→1.71。乱数の並びが変わるので誤差の範囲）。

## 参考（基準の対象外）: 守護者戦（--boss）
守護者は 6F〜9F が +1、10F が +2。
6F: 全滅率 28.25%→35.75%、死亡/戦 1.908→2.363（悪化）。7F〜10F は同じ値。
未解決の質問: 6F守護者戦が難しくなったのは許容範囲か。
生データ: report/sim042/
