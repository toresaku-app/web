# Phase 1.5: iOSリリース準備

## 1. MVP残タスク（リリース前に必須）
- [x] アプリアイコン作成（1024x1024px）
- [x] スプラッシュスクリーン画像作成（アイコン流用）
- [x] PDF出力時のローディング表示（モーダル + ActivityIndicator）
- [x] エラーハンドリング強化（リトライボタン付きアラート）

## 2. アプリ名・ブランディング
- [x] 正式アプリ名を決定 → 「トレさく」
- [x] app.json の name / slug を更新
- [ ] App Store用のサブタイトル（30文字以内）
- [ ] App Store用のキーワード

## 3. EAS Build セットアップ
- [x] eas-cli インストール済み（v18.3.0）
- [x] Expoアカウントログイン済み（ryuseisato）
- [x] app.json に `ios.bundleIdentifier` 設定（com.ryuseisato.toresaku）
- [x] `npx expo prebuild --platform ios` でネイティブプロジェクト生成
- [x] Xcodeで実機ビルド確認

## 4. Apple Developer 準備
- [ ] Apple Developer Program に登録済みか確認（年額 $99）
- [ ] App Store Connect でアプリを作成
- [ ] Bundle ID を登録（Certificates, Identifiers & Profiles）

## 5. プライバシー・法的対応
- [x] プライバシーポリシー作成
- [x] プライバシーポリシーをホスティング → https://toresaku-app.github.io/privacy-policy/
- [x] 利用規約の作成 → https://toresaku-app.github.io/privacy-policy/terms.html
- [ ] App Store の「App Privacy」セクション入力（Data Not Collected）

## 6. App Store 素材準備
- [ ] スクリーンショット作成（6.7インチ: 1290×2796px）
  - 運動ライブラリ画面
  - プレビュー・編集画面
  - PDF出力画面
  - PDF完成例
- [ ] スクリーンショット作成（6.1インチ: 1179×2556px）※任意
- [ ] iPad スクリーンショット（12.9インチ: 2048×2732px）※supportsTablet:trueの場合
- [ ] App Store 説明文（日本語）
- [ ] プロモーションテキスト（170文字以内）
- [ ] カテゴリ選択（Medical / Health & Fitness）
- [ ] 年齢レーティング設定
- [ ] サポートURL

## 7. 本番ビルド・提出
- [ ] `eas build --platform ios --profile production` で本番ビルド
- [ ] `eas submit --platform ios` でApp Store Connectに提出
- [ ] App Store Connect でメタデータ入力
- [ ] 審査提出

## 8. 審査対策
- [ ] SaMD非該当であることの説明文を準備（審査メモに記載）
  - 「本アプリは運動指導書の作成・PDF出力ツールであり、診断・治療を目的としません」
- [ ] デモ用の操作手順を準備（審査員向け）
- [ ] 医療系アプリの審査ガイドライン確認（Apple Guideline 27.x）

## 注意事項
- 「効能表現」は絶対に含めない（App Store説明文・アプリ内共に）
- プライバシーポリシーURLはApp Store提出時に必須
- iPadサポートがオンの場合、iPadスクリーンショットも必要
