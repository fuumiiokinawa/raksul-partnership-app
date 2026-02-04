# 提携商材 効果測定アプリ - セットアップ手順

## 概要
チームでURLを共有して、訪問記録を入力・閲覧できるWebアプリです。

---

## 1. Supabase（データベース）のセットアップ

### 1-1. アカウント作成
1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインアップ（推奨）

### 1-2. プロジェクト作成
1. 「New project」をクリック
2. 以下を入力：
   - **Name**: `partnership-tracker`（任意）
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
3. 「Create new project」をクリック
4. 2分ほど待つ

### 1-3. テーブル作成
1. 左メニューの「SQL Editor」をクリック
2. 「New query」をクリック
3. `supabase-setup.sql`の内容を貼り付け
4. 「Run」をクリック
5. 「Success」と表示されればOK

### 1-4. API情報を取得
1. 左メニューの「Settings」→「API」
2. 以下をメモ：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` で始まる長い文字列

---

## 2. Vercel（ホスティング）のセットアップ

### 2-1. GitHubにコードをアップロード
1. GitHubでリポジトリを作成（例: `partnership-tracker`）
2. このフォルダの内容をpush

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/partnership-tracker.git
git push -u origin main
```

### 2-2. Vercelにデプロイ
1. https://vercel.com にアクセス
2. GitHubアカウントでサインアップ
3. 「Add New」→「Project」
4. GitHubリポジトリを選択（`partnership-tracker`）
5. **Environment Variables** に以下を追加：
   - `VITE_SUPABASE_URL` → SupabaseのProject URL
   - `VITE_SUPABASE_ANON_KEY` → Supabaseのanon public key
6. 「Deploy」をクリック
7. 完了後、発行されたURL（例: `https://partnership-tracker.vercel.app`）をチームに共有

---

## 3. 使い方

### チームメンバーへの共有
- Vercelで発行されたURLを共有するだけ
- ログイン不要で誰でもアクセス可能
- PCでもスマホでも使える

### 機能
- **📊 集計タブ**: 商材別・担当者別・事務所別の集計を表示
- **📋 記録タブ**: 訪問記録の一覧表示、新規登録、編集、削除

---

## トラブルシューティング

### 「設定が必要です」と表示される
→ Vercelの環境変数が正しく設定されているか確認

### データが保存されない
→ Supabaseダッシュボードで「Table Editor」→「visits」テーブルが存在するか確認

### 質問・サポート
→ 開発担当者に連絡

---

## ファイル構成

```
partnership-app/
├── index.html          # HTMLエントリーポイント
├── package.json        # 依存関係
├── vite.config.js      # Vite設定
├── .env.example        # 環境変数テンプレート
├── supabase-setup.sql  # データベース作成SQL
├── README.md           # この手順書
└── src/
    ├── main.jsx        # Reactエントリーポイント
    └── App.jsx         # メインアプリケーション
```
