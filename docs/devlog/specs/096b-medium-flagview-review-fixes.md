# 096b 旗視（flagview）レビュー指摘の修正

- 優先度: medium
- 対象ブランチ: **hold/096**（現在の先頭 451c966 の上に追加コミット。新ブランチは切らない）
- 元仕様: docs/devlog/specs/096-medium-mage-flag-count-spell.md
- 根拠: ChatGPT（GPT-6 Thinking high）によるhold/096レビュー、結論「修正後に可」
  https://chatgpt.com/c/6af2742e-bea8-83ee-bd91-a42fbc07657d
- ユーザー指示（2026-11-10）: 「指摘を踏まえた仕様書を書き、Codex実装に渡して、完了したら再度ChatGPTにレビューしてもらってください」

## 必須修正

### 1. 無関係な075スクショの差分を元に戻す
hold/096 で以下4枚が変更されている（試遊が `git diff --stat d24d574..451c966` で確認済み）。096とは無関係なので **main d24d574 の内容に戻す**。
- docs/devlog/reports/075-shots/disarm-1280.png
- docs/devlog/reports/075-shots/disarm-390.png
- docs/devlog/reports/075-shots/spell-1280.png
- docs/devlog/reports/075-shots/spell-390.png

あわせて、なぜ変わったか（テストやスクショ生成スクリプトが075の出力先に書いたのか等）を調べ、再発しないようにする。原因はレポートに書く。
完了条件: `git diff --stat d24d574..HEAD` に 096 と関係しない既存ファイルの変更が含まれないこと（096で意図した変更のみ）。

### 2. 発動中の再詠唱理由を「発動中」を優先にする
現状 `spellReason()` で MP不足判定が「発動中」判定より先にあるため、MP5で旗視を唱えてMP0になると再選択時に「MP不足」と出る。
- 旗視が発動中なら、MP残量に関わらず理由は **「発動中」**。
- 091 で入れた透視・警戒結界・鉄壁の「発動中」も同じ順序問題があるなら、同じ扱い（発動中をMP不足より優先）に揃える。挙動変更になる既存テストがあれば更新し、レポートに明記。
- テスト追加: MPちょうど5で旗視を唱え MP0 → 再選択理由が「発動中」。

## 推奨修正（今回やる）

### 3. 呪文一覧での表示順
flagview を MAGIC 配列の先頭から外し、**習得レベル順として自然な位置**（既存のLv5魔法使い呪文の並びの中、またはLv4呪文の後・Lv6呪文の前）に移す。配列全体の並べ替えはしない（既存データ順の変更を最小に）。
- テスト: 呪文一覧（renderMagic の順）で旗視がLv1呪文より上に出ないこと。

### 4. アクセシビリティ
旗視の発動中、現在地セルのボタンの aria-label に旗数を追加する（例: 既存ラベルの後ろに「、周囲の旗3本」）。非発動時は変更なし。
- テスト: 発動中の現在地セル aria-label に旗数が含まれる／非発動時は含まれない。

## 変更しないこと（方針確定）
- 既存セーブで既にLv5以上の魔法使いへの旗視の遡及抽選は**行わない**（既存の呪文追加と同じ方針。次回レベルアップ時に抽選）。ただし現状の挙動を固定するテストを1つ追加し、仕様書/レポートにこの方針を明記する。
- 発動ログ「周囲の旗が見えるようになった。」と、finishDefeat での解除は現状維持（レビューで賛成）。

## 共通ルール
- hold/096 に追加コミットし `git push origin hold/096`（通常push）。**force push・main への push/merge は禁止**。
- /workspace/dungeonsweeper と /tmp/dsw-096 には触らない。
- この仕様書を docs/devlog/specs/096b-medium-flagview-review-fixes.md としてコミットし、TIMELINE に 096b の行を追加、docs/devlog/reports/096b.md を作成、MANIFEST.sha256 を再生成。
- 検証: dsw-verify OVERALL fail=0、tests/flag-sight.cjs、ブラウザテスト（1280/390）。
- 完了報告は試遊へ（ユーザーには直接連絡しない）。コミットハッシュ・push有無・テスト結果・075画像の原因を含める。
