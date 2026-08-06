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

lp.html 内の画像パスは**相対パス**（`assets/lp/...`）で書く。`/web/assets/...` と絶対で書くと
本番（`/web/lp.html` 配信）では通るがローカルプレビューで 404 になる。

---

## LP のスクショを撮り直す手順

アプリ UI を変えたら LP のスクショも古くなる。**運動数・フィルタ・パラメータが写り込む**ので、
これらを変更したら必ず撮り直す（2026-08-06 に「22 件」表示のまま 3 ヶ月放置していた前例あり）。

対象は 3 枚。すべて Web 版から撮る（iOS 実機・シミュレータは不要）。

| ファイル | 画面 | サイズ |
|---|---|---|
| `app-pc.png` | 運動ライブラリ（4 種選択） | 1470×798 @2x |
| `app-library.webp` | 運動ライブラリ（1 種選択） | 390×844 @3x |
| `app-preview.webp` | 内容を調整（3 種目） | 390×844 @3x |

```bash
npx expo start --web --port 8081        # 別ターミナルで起動しておく
node scripts/shoot-lp-screenshots.cjs   # scripts/.lp-shots-out/ に PNG が出る
```

撮る画面・選択する運動・遷移先は `scripts/lp-shots.json` で定義する。
ショットごとに localStorage をクリアするので、前のショットの選択状態は持ち越さない。

撮影後の加工:

1. **スマホ 2 枚は上端に白帯 168px を足す**。lp.html のスマホ枠は CSS でノッチ（`.mockup-phone-island`）を
   描いており、Web 版のスクショには iOS ステータスバーが無いため、足さないとノッチが画面上端の見出しに被る
   ```bash
   python3 -c "
   from PIL import Image
   for n in ['app-library','app-preview']:
       im=Image.open(f'scripts/.lp-shots-out/{n}.png').convert('RGB')
       out=Image.new('RGB',(im.width,im.height+168),(255,255,255)); out.paste(im,(0,168))
       out.save(f'scripts/.lp-shots-out/{n}-band.png')"
   ```
2. WebP 化して両ディレクトリへ配置（`app-pc.png` は PNG のまま `public/` のみ）
   ```bash
   cwebp -q 82 scripts/.lp-shots-out/app-library-band.png -o public/assets/lp/app-library.webp
   cwebp -q 82 scripts/.lp-shots-out/app-preview-band.png -o public/assets/lp/app-preview.webp
   cp public/assets/lp/app-{library,preview}.webp assets/lp/
   cp scripts/.lp-shots-out/app-pc.png public/assets/lp/app-pc.png
   ```

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

## Web版（スマホ）でハマったこと

実機（iPhone Safari）で確認しないと出ない問題が集中している。UI変更後は実機で一度見る。

### 入力欄をタップすると画面が拡大する

iOS Safari は **font-size 16px 未満の入力欄**にフォーカスすると自動でズームする。
`user-scalable=no` は iOS 10 以降無視されるので、**入力欄は必ず16px以上**にする。
（対象: 検索、指導書の目的、運動の目的、頻度カスタム、注意メモ）

### `/print` 画面の文字が極端に小さい

この画面は A4 幅（縦794px / 横1123px）の viewport で描画され、端末幅に合わせて縮小表示される。
そのため素の16pxは実質8px程度になる。ツールバーは **縮小率の逆数で拡大**して打ち消している
（`print.tsx` の `k = pageWidth / screen.width`）。ツールバーに要素を足すときも同じ係数を通すこと。

### 共有メニューの入口はOSで違う

- iOS Safari: `⋯ → 共有 → プリント`
- Android Chrome: `⋮ → 共有 → 印刷`

`print.tsx` で UA 判定して出し分けている。

### テーブルの行の高さは `td { height }` では決まらない

セルの中身（運動名 + 処方の文字サイズと行数）が高さを決める。
`height` は下限にしかならないので、**行を詰めたいときは中身の font-size / line-height / 行数を削る**。
チェック表は2行→1行に統合して 31px → 21px にした。

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
