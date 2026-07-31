# 開発・運用ノート

作業時にハマりやすい箇所と、手順が決まっている作業の記録。
アーキテクチャ方針とコーディング規約は [CLAUDE.md](../CLAUDE.md)、決定の経緯は [decisions.md](decisions.md) を参照。

> 2026-07-31: マルチエージェント体制の解体にあたり、`.claude/agent-memory/` に分散していた
> 実務ノウハウをこのファイルに集約した。

---

## 変更時に一緒に見るファイル

### 運動数の表記を変えたとき

`grep -rn "100種" . --exclude-dir=node_modules` で拾えるが、特に忘れやすいのは以下：

- `.github/workflows/deploy-web.yml` — SEO メタタグ、構造化データ、llms.txt
- `public/lp.html` — FAQ 構造化データ、本文テキスト、特徴セクション
- `plan.md` の運動メニュー表

### SEO 情報を変えたとき

`deploy-web.yml` と `public/lp.html` は構造化データなど**同じ情報を二重に持っている**。
片方だけ直して片方を忘れるミスが起きやすいので、必ず両方を確認する。

### LP 画像を追加したとき

- `assets/lp/` — GitHub Actions のデプロイステップでコピーされる
- `public/assets/lp/` — Expo ビルドで自動コピーされ、Vercel プレビューに出る

**新しい画像は両方に置く**。片方だけだとどちらかの環境で表示されない。

---

## 運動データの追加手順

### `exercises.ts` の書き方（既存データの慣習）

| フィールド | 慣習 |
|-----------|------|
| `defaultReps` | ストレッチ系 3、筋トレ系 10〜15、呼吸系 5〜10 |
| `defaultSets` | ほぼすべて 2（骨盤底筋運動のみ 3） |
| `defaultHoldSeconds` | ストレッチ 20 秒、筋トレ 3〜5 秒、バランス 10〜15 秒。動的運動ではフィールド自体を省略 |
| `keyPoints` | 必ず 3 つ、臨床的に重要な順 |
| `description` | 1 文完結、「〜します」で終わる |

- `category` と `bodyPart` を混同しない（「体幹」は `bodyPart`）
- 型を増やしたら `app/index.tsx` の `CATEGORY_FILTERS` など UI 側の反映を忘れない
  （過去に型だけ追加して UI が追従していない期間があった）

### イラストの生成 → 登録

現在は OpenAI API のクレジットが切れているため、ChatGPT での手動生成フローで運用している。

1. Excel（`scripts/batch*-prompts.xlsx`）にフルプロンプト（共通スタイル + 個別）を入れる
2. ChatGPT にコピペして 1 枚ずつ生成
3. 生成画像を `assets/illustrations/originals/` に入れる
   （ChatGPT の保存名は `ChatGPT Image 2026年4月XX日 HH_MM_SS.png` 形式。**時系列順**に Excel の運動リストと対応する）
4. 画像を 1 枚ずつ目視で確認して運動を特定し、対応表を作って確認を取る
5. `mv` でリネーム → `cwebp -q 80` で WebP 変換 → `illustrations.ts` に登録
6. `npx tsc --noEmit` で型チェック

API 経由で生成する場合は `scripts/generate-illustrations.py`（デフォルト `gpt-image-1.5` / `high`）。
`--skip-existing` で途中から再開できる。`--model` でモデル変更可。

### ファイル配置

- アプリが参照するのは `assets/illustrations/*.webp` のみ
- PNG 原本は `assets/illustrations/originals/`（`.gitignore` 済み）
- スクリプト類は `scripts/` に集約（`generate-illustrations.py` / `prompts.csv` / `batch*-prompts.xlsx` / `README.md`）

---

## 環境固有の注意

- **macOS の pip**: `pip` は使えない。`pip3 install --break-system-packages` が必要
- **openpyxl で作った Excel**: Numbers で開く。Excel で開くとエンコーディングの問題が出る
- **手動生成画像のサイズ**: ChatGPT 生成は正方形/4:3/16:9 が混在。API 生成は 1536x1024 で統一されている
- **`.env`**: `OPENAI_API_KEY` を置いている。`.gitignore` 済み。**中身をチャットに出力しない**

---

## デプロイまわり

### Vercel + baseUrl の複雑さ

- Expo の `baseUrl: "/web"` は GitHub Pages 用の設定
- Vercel で `/web/` パスを動かすためにリライトが必要で、**新しいルートを追加したらリライトも追加**する
- カスタムドメインに移行して `baseUrl` を `/` にすれば解消する

### Google Search Console

- `sitemap.xml` はブラウザから正常にアクセスできるが、Search Console 側は「取得できませんでした」のまま
- Google 側の反映待ちの既知問題とみて放置中。1 週間以上変わらなければ再調査

---

## 未検証・懸念として残っているもの

- **PDF の大量選択時のパフォーマンス**: 100 種すべてを含む指導書は未検証（実運用は 10 種程度なので問題ない想定）
- **Metro bundler の画像ロード**: 100 枚の WebP を `require()` した場合のビルド時間・アプリサイズへの影響は未計測
- **WebP の iOS 実機表示**: 以前のバージョンで表示に懸念があった。100 枚での実機確認は未実施
- **イラストの医学的正確性**: 生成イラストの関節角度・体位の検証は未実施
- **Batch 7 の運動選定**: 臨床使用頻度とカバレッジのギャップから選定したが、医学的レビューは未実施

---

## イラスト 2 枚化を実装する場合（Phase 6 の残タスク）

方針は合意済みだが未着手。実装時に必要な作業：

- `Exercise` 型に `illustration2?: string` を optional で追加
- UI の表示ロジックに「1 枚のみ / 2 枚あり」の分岐を入れる
- `generateHtml.ts` に 2 枚横並び + 矢印のレイアウトを追加
- 100 種すべてに 2 枚目を作るのは大作業なので、段階的に対応する
