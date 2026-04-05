# 🚀 プロジェクト名

[![CI](https://github.com/IamSBStakumi/SelfMaintenance/actions/workflows/ci.yml/badge.svg)](https://github.com/IamSBStakumi/SelfMaintenance/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

セルフメンテナンスをサポートするアプリ\
個人のコンディションを最適に保ち、日々の気持ちを向上させる。

具体的には以下の周期的なタスクを管理する

- コンタクトレンズの交換
- 処方箋受け取りのための通院
- 定期健診
- 歯のクリーニング
- シーツや枕カバーの洗濯
- 部屋の掃除
- 歯ブラシの交換

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

<http://localhost:3000> でアプリケーションにアクセスできます。

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
