# 🚀 プロジェクト名

[![CI](https://github.com/IamSBStakumi/SelfMaintenance/actions/workflows/ci.yml/badge.svg)](https://github.com/IamSBStakumi/SelfMaintenance/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

> **一言で説明**: このプロジェクトが何をするものか、1〜2文で。

![デモのスクリーンショットやGIF](docs/images/demo.gif)

## 📖 概要

### なぜ作ったのか（モチベーション）

## ✨ 主な機能

- **機能A**: 説明
- **機能B**: 説明
- **機能C**: 説明

## 🛠 技術スタック

| カテゴリ          | 技術                                |
| ----------------- | ----------------------------------- |
| フレームワーク    | Next.js 16 (App Router)             |
| UI ライブラリ     | React 19                            |
| スタイリング      | Tailwind CSS v4                     |
| 言語              | TypeScript 5.x                      |
| バックエンド / DB | Supabase (PostgreSQL 17)            |
| 認証              | Supabase Auth                       |
| テスト            | Vitest 4.x · @testing-library/react |
| リンター          | ESLint 9 (eslint-config-next)       |
| フォーマッター    | Prettier                            |
| Git フック        | Husky + lint-staged                 |
| CI/CD             | GitHub Actions (Node 22, yarn)      |
| デプロイ          | Vercel                              |
| パッケージ管理    | yarn                                |

## 🏗 アーキテクチャ

詳細は [docs/architecture.md](docs/architecture.md) を参照してください。

## 🚀 はじめ方

### 前提条件

- Node.js >= 24.13.x
- Docker + docker-compose
- yarn >= 1.22.x

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/IamSBStakumi/SelfMaintenance.git
cd SelfMaintenance

# 環境変数を設定
cp .env.example .env
# .env を編集して必要な値を設定

# 依存関係をインストール
yarn install

# データベースを起動
docker compose up -d

# マイグレーションを実行
yarn db:migrate

# 開発サーバーを起動
yarn dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

### テストの実行

```bash
# ユニットテスト
yarn test

# E2Eテスト
yarn test:e2e

# カバレッジレポート
yarn test:coverage
```

## 📝 デモ

🔗 **ライブデモ**: [https://project.vercel.app](https://project.vercel.app)

| 機能           | スクリーンショット                      |
| :------------- | :-------------------------------------- |
| ダッシュボード | ![dashboard](docs/images/dashboard.png) |
| 検索機能       | ![search](docs/images/search.png)       |

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。
