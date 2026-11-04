# 035 verify — 状態異常の形統一・afflict 種類判定（6aa4723）

結論: **OK**

## 差分（b7e6069..6aa4723）
- game.js に `freshAilments()`（poison/paralysis/sleep/silence/fear）と `normalizeAilments()` を追加。enterTown・templeRaise・afflict(stone)・ensureProfile、party.js（ensureSixParty 2か所）、recruits.js、spells.js（マディ）を置換。
- ensureProfile で s.ailments と s.reserve[].ailments を補完。
- afflict: 5種を明示、未知は console.warn して何もしない。silence/fear は分岐のみ（効果・ログなし、036/037で実装）。
- tests: ailments.cjs 新規（game.cjs から require）。petrify.cjs の期待形を5キーに更新（緩和ではない）。

## 確認
1. 手書き初期化の残り: `rg "paralysis:[0-9]" dist` は freshAilments 定義の1か所だけ。`poison:false` も同じ定義だけ。
2. 旧セーブ（ash-v1、ailments は {poison,paralysis} だけ）: 6人パーティ＋控え2人（v035l.cjs）。
   - パーティ・控えの全員が5キーに補完される。B の poison:true・paralysis:3 は保持。
   - 再保存後の roster も全員5キー。
   - ライブ 1280/390 で同じセーブを読み込み（v035b.py）: 全員5キー、値を保持、pageerror 0。
   - 補足: ailments キー自体が無い控えは null のまま（`if(r.ailments)`。旧版も同じで、旧版では加入時に undefined だった）。加入時は normalize されて5キーになる。実害なし。
3. 未知の種類: afflict(0,'xxx') で ailments は不変、console.warn が1回（ailments.cjs で確認）。
4. 毒・麻痺・石化の挙動: b7e6069 と 6aa4723 で同じ mulberry32 シードの差分スクリプト（v035.cjs）を実行。付与、tick 5回（毒ダメージ・麻痺カウント・自動並び替え）、石化、石化中の毒・麻痺無効、ラツモフィス・ディアルコ・マディ治療まで、ログ・HP・状態・隊列が完全一致。差は sleep/silence/fear キーの有無だけ。
5. フルスイート: node tests 12件・compile-monsters --check・selftest・ブラウザテスト8件（ライブ、Pages デプロイ済みを cmp で確認）すべて PASS。
