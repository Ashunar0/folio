# Folio

> 小規模組織のための軽量会計 SaaS

<p align="center">
  <img src="public/icon.svg" alt="Folio Logo" width="120" />
</p>

## 📋 概要

**Folio** は、大学サークルや学生団体などの小規模組織向けに設計された会計管理アプリケーションです。

従来の LINE・Google フォーム・スプレッドシートなどを組み合わせた煩雑な運用から脱却し、**経費申請〜承認〜台帳管理までの全プロセスを統合**した、誰でも簡単に使える軽量な会計システムを提供します。

### 🎯 こんな課題を解決

- 経費申請の管理が属人化して引き継ぎが困難
- 承認フローが曖昧でトラブルが発生
- スプレッドシートでの二重管理が面倒
- イベント単位での収支把握ができない

---

## ✨ 主な機能

| 機能 | 説明 |
|:-----|:-----|
| **経費申請** | 日付・金額・カテゴリ・イベント・メモ・レシートを簡単に登録 |
| **承認ワークフロー** | Manager/Admin による申請の承認・差戻し |
| **取引台帳** | 承認済みの支出を一覧で管理 |
| **チーム管理** | 権限設定、招待リンク発行、カテゴリ・イベント管理 |
| **マルチチーム対応** | 複数チームへの所属・切り替えが可能 |
| **ダッシュボード** | 月次推移・カテゴリ別内訳などの視覚化 |

---

## 🔐 権限管理（RBAC）

| ロール | 説明 |
|:-------|:-----|
| **Admin** | 全権限。チーム設定・招待・削除が可能 |
| **Manager** | 承認・差戻しが可能。チーム設定の一部を編集可能 |
| **Member** | 経費申請の作成・編集が可能 |
| **Viewer** | 閲覧のみ |

---

## 🛠 技術スタック

| 区分 | 技術 |
|:-----|:-----|
| **フロントエンド** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), TypeScript |
| **UI** | [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS 4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/) |
| **状態管理** | [TanStack Query](https://tanstack.com/query) (React Query) |
| **バックエンド** | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage + RLS) |
| **ホスティング** | [Vercel](https://vercel.com/) |

---

## 📦 セットアップ

### 前提条件

- Node.js 20+
- npm または pnpm
- [Supabase](https://supabase.com/) アカウント

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd folio1

# 依存関係のインストール
npm install
```

### 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### データベースのセットアップ

```bash
# Supabase マイグレーションの適用
npx supabase db push

# 開発用シードデータの投入（オプション）
npm run seed
```

### 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてください。

---

## 📁 プロジェクト構造

```
folio1/
├── app/                    # Next.js App Router
│   ├── (app)/             # 認証後のダッシュボード
│   ├── (auth)/            # ログイン・登録
│   └── (website)/         # ランディングページ
├── components/            # UIコンポーネント
│   ├── ui/               # shadcn/ui 基本コンポーネント
│   ├── sidebar/          # サイドバー関連
│   └── ...               # 機能別コンポーネント
├── hooks/                 # カスタムフック
├── lib/                   # ユーティリティ・API
│   ├── supabase/         # Supabase クライアント
│   ├── api/              # API 呼び出し
│   └── schemas.ts        # Zod スキーマ
├── providers/             # React Context プロバイダー
├── supabase/             # Supabase 設定
│   └── migrations/       # DBマイグレーション
└── .docs/                # 内部ドキュメント
```

---

## 🗄 データベース構成

主要なテーブル:

| テーブル | 説明 |
|:---------|:-----|
| `profiles` | ユーザープロフィール |
| `teams` | チーム情報 |
| `team_users` | チーム所属・ロール管理 |
| `categories` | 支出カテゴリ |
| `events` | イベント |
| `expenses` | 経費申請 |
| `transactions` | 承認済み取引 |
| `invites` | 招待トークン |

すべてのデータは **Row Level Security (RLS)** で保護されています。

---

## 📝 利用可能なスクリプト

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLint 実行
npm run seed     # 開発用データ投入
```

---

## 📚 ドキュメント

詳細なドキュメントは `.docs/` ディレクトリを参照:

- [requirements.md](.docs/requirements.md) - 要件定義
- [architecture.md](.docs/architecture.md) - アーキテクチャ設計
- [database.md](.docs/database.md) - データベース設計
- [sitemap.md](.docs/sitemap.md) - サイトマップ
- [outline.md](.docs/outline.md) - 実装アウトライン

---

## 🚀 デプロイ

### Vercel へのデプロイ

1. [Vercel](https://vercel.com/) にリポジトリを接続
2. 環境変数を設定
3. デプロイを実行

GitHub との連携により、`main` ブランチへのプッシュで自動デプロイされます。

---

## 📄 ライセンス

Private

---

## 👤 作者

個人開発プロジェクト
