# app-developer 引き継ぎノート

**最終更新**: 2026-04-24

このファイルは**流動的な情報**を扱う。作業区切りごとに更新すること。

---

## 現在の状態

### ブランチ
- 作業ブランチ: `develop`
- `develop` は `origin/develop` より 1 commit 先行（未 push）
- main と同期済み

### 未コミット変更
- `scripts/~$batch7-prompts.xlsx` が削除済み（Excel の一時ファイル、無視して OK）
- 未追跡: `claude/`、`handover-drafts/`（引き継ぎドキュメント群。移行完了後に取り扱い判断）

### デプロイ状態
- iOS アプリ: App Store 公開済み
- Web 版: GitHub Pages にデプロイ済み（LP リデザイン済み、App Store 公式バッジ導入済み）
- **100種反映版の Web デプロイ・iOS 審査提出は未実施**

---

## 直近で完了した作業

- 運動メニュー 100 種到達（Batch 1〜7 完了）
- LP 全面リデザイン（画像付き、レスポンシブ対応）
- App Store 公式バッジ導入
- フィードバック機能（Google Forms）導入
- アクセシビリティ改善（accessibilityLabel 追加）
- 環境分離（Vercel ステージング + main ブランチ保護）
- 100 種表記への更新

---

## 未完の TODO

### 優先度 高
- [ ] `app/index.tsx` の `CATEGORY_FILTERS` に「ADL」「呼吸」を追加（型には存在するが UI フィルタボタンが未対応）
- [ ] 100 種対応版の Web デプロイ
- [ ] 100 種対応版の iOS 審査提出
- [ ] 運動イラスト 2 枚化（開始姿勢→動作中、矢印付き）— `illustration2` を optional で Exercise 型に追加、段階的に対応
- [ ] バイリンガル PDF（日/英/両言語切替）
- [ ] 運動カードの詳細展開（選択前に説明・ポイント確認）
- [ ] Google Search Console でサイトマップ反映確認（放置中、1 週間以上変わらなければ再調査）
- [ ] Google Search Console でインデックス登録リクエスト

### 優先度 中
- [ ] テンプレート保存・呼び出し機能（expo-sqlite、大規模）
  - テーブル設計（templates, template_exercises）
  - マイグレーション実装
  - CRUD 関数作成
  - プレビュー画面に「テンプレートとして保存」ボタン
  - テンプレート一覧画面
  - 上書き保存・複製・ピン留め
- [ ] 運動の段階設定（プログレッション: 簡単→標準→難しい）
- [ ] ダークモード対応
- [ ] タッチターゲットサイズ拡大（44×44px 以上）
- [ ] カラーコントラスト改善（WCAG AA 基準）
- [ ] LCP 画像の preload 設定
- [ ] 非 LCP 画像の lazy loading

### 優先度 低
- [ ] LINE 直接共有の最適化
- [ ] 1 ページ 2 種目レイアウト（コンパクト版）
- [ ] 画像（PNG）出力 + カメラロール保存
- [ ] PT 関連サイト・SNS でのバックリンク獲得

### 将来
- [ ] カスタムドメイン取得（例: toresaku.app）
- [ ] ホスティング移行 + リポジトリ private 化
- [ ] 臨床使用データの蓄積 → 学会演題提出

---

## 詰まっているところ・懸念

### Google Search Console サイトマップ
- `sitemap.xml` はブラウザから正常にアクセス可能（2 ページ登録）
- Search Console では「取得できませんでした」のまま
- URL 指定方法、Content-Type、Google 側既知バグの可能性を調査済み
- 現状は放置して反映待ち。1 週間以上変わらなければ再調査

### Vercel + baseUrl の複雑さ
- Expo の `baseUrl: "/web"` が GitHub Pages 用設定
- Vercel では `/web/` パスで動かすためにリライトが複雑
- 新ルート追加時（例: `/web/settings`）はリライト追加が必要
- カスタムドメイン移行時に `baseUrl` を `/` に変更すれば解消

### 注意事項・禁忌システム（Phase 6 TODO）
- 「疾患選択で警告表示」の TODO があるが SaMD リスクとの境界が曖昧
- 「この疾患にはこの運動をしないでください」は SaMD に近い判断
- 実装する場合は慎重に検討が必要、ユーザーと再度議論

### イラスト 2 枚化の実装方針
- `illustration2?: string` を Exercise 型に追加する方針は合意済み（型追加は app-developer 側で実施）
- 100 種すべてに 2 枚目を作るのは curator 側の大作業
- UI の表示ロジック（1 枚のみ / 2 枚あり）の分岐が必要
- PDF 生成側（`generateHtml.ts`）でも 2 枚横並び + 矢印のレイアウトが必要

---

## 次の一手（候補）

ユーザーから指示がなければこの順を推奨：
1. `CATEGORY_FILTERS` に ADL・呼吸を追加（小さい・高優先度）
2. 100 種での実機テスト
3. Web 版・iOS 版の 100 種デプロイ
