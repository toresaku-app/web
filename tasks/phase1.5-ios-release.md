# Phase 1.5: iOSリリース準備

## 1. MVP残タスク（リリース前に必須）
- [ ] アプリアイコン作成（1024x1024px）
- [ ] スプラッシュスクリーン画像作成
- [x] PDF出力時のローディング表示（モーダル + ActivityIndicator）
- [x] エラーハンドリング強化（リトライボタン付きアラート）

## 2. アプリ名・ブランディング
- [x] 正式アプリ名を決定 → 「トレさく」
- [x] app.json の name / slug を更新
- [ ] App Store用のサブタイトル（30文字以内）
- [ ] App Store用のキーワード

## 3. EAS Build セットアップ
- [ ] `eas-cli` インストール（`npm install -g eas-cli`）
- [ ] `eas login` でExpoアカウントにログイン
- [ ] `eas build:configure` で eas.json 生成
- [ ] app.json に `ios.bundleIdentifier` を設定（例: `com.yourname.rehabhep`）
- [ ] `eas build --platform ios --profile preview` でテストビルド確認

## 4. Apple Developer 準備
- [ ] Apple Developer Program に登録済みか確認（年額 $99）
- [ ] App Store Connect でアプリを作成
- [ ] Bundle ID を登録（Certificates, Identifiers & Profiles）

## 5. プライバシー・法的対応
- [ ] プライバシーポリシー作成（ローカルオンリーなので簡潔でOK）
  - 個人情報を収集しない旨
  - データはデバイス内にのみ保存される旨
  - 外部サーバーへの送信なしの旨
- [ ] プライバシーポリシーをホスティング（GitHub Pages等）
- [ ] 利用規約の作成（任意だが推奨）
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
