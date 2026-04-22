# Phase 7: SEO対策（徹底版）

## 7-1. メタタグ・OGP最適化（✅ 基本実装済み → 改善）

### HTMLメタタグ
- [x] description メタタグ
- [x] keywords メタタグ（拡充済み）
- [x] OGPタグ（og:title, og:description, og:type, og:url, og:locale, og:site_name）
- [x] `<html lang="ja">` の設定（+html.tsx）
- [x] og:image 用画像作成（1200×630px）→ SNSシェア時の見栄え
- [x] twitter:image 用画像作成（1200×600px）
- [x] twitter:card を `summary_large_image` に変更
- [x] canonical URL の設定

### Expo Router Head コンポーネント活用
- [x] `app/+html.tsx` 作成 — グローバルな `<html lang="ja">` + canonical URL
- [ ] 各ルートに `<Head>` コンポーネントでページ別メタタグ設定（任意）

## 7-2. 構造化データ（JSON-LD）

- [x] SoftwareApplication スキーマ追加（アプリ情報、無料、カテゴリ）
- [x] Organization スキーマ追加（開発者情報）
- [x] FAQPage スキーマ追加（4つのQ&A）
- [x] BreadcrumbList スキーマ追加

## 7-3. robots.txt / sitemap.xml / llms.txt

- [x] robots.txt 作成
- [x] sitemap.xml 作成（lastmod追加）
- [x] llms.txt 作成（AI クローラー向け）
- [x] robots.txt に AI クローラー設定追加（GPTBot, ClaudeBot, PerplexityBot）
- [x] Google Search Console 登録
- [ ] Search Console でサイトマップ送信

## 7-4. ランディングページ作成

- [x] LP用のHTML作成（lp.html — アプリの説明、特徴、使い方、FAQ）
- [x] ターゲットキーワード配置（自主トレ指導書, 理学療法, リハビリ, PDF, 膝OA, 脳卒中等）
- [x] 特徴セクション（無料・アカウント不要・オフライン対応・22種の運動・プライバシー・イラスト）
- [x] 使い方の手順（3ステップ）
- [x] 利用シーン（整形外科、脳卒中、訪問リハ、介護予防）
- [x] FAQ セクション（6つのQ&A + FAQPage スキーマ連動）
- [x] Web版 / プライバシーポリシー / 利用規約へのリンク
- [x] 医療情報の免責事項表記

## 7-5. PWA対応

- [x] manifest.json 作成（name, short_name, icons, start_url, display, theme_color, lang）
- [x] アイコン画像作成（192×192, 512×512）
- [x] `<link rel="manifest">` + `<meta name="theme-color">` 追加

## 7-6. パフォーマンス最適化

- [x] イラスト画像をWebPに変換（5.4MB→644KB、88%削減）
- [ ] LCP画像のpreload設定
- [ ] 非LCP画像のlazy loading
- [x] Lighthouse スコア確認（目標: Performance 90+）

## 7-7. 日本語SEO・E-E-A-T

- [x] 著者情報（「現役理学療法士が監修」）をLPに追加
- [x] プライバシーポリシー・利用規約へのリンク（LP内に設置済み）
- [x] 医療情報の免責事項表記（LP内に設置済み）

## 7-8. 外部施策（コード外）

- [ ] Google Search Console でインデックス登録リクエスト
- [ ] Search Console でサイトマップ送信
- [ ] PT関連サイト・SNSでの紹介（バックリンク獲得）
  - PT-OT-ST.NET
  - 日本理学療法士協会
  - リハデミー
- [ ] SNSアカウント作成（任意 — OGPのtwitter:site用）
