# SelfMaintenance

[![CI](https://github.com/IamSBStakumi/SelfMaintenance/actions/workflows/ci.yml/badge.svg)](https://github.com/IamSBStakumi/SelfMaintenance/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

セルフメンテナンスをサポートするアプリ\
個人のコンディションを最適に保ち、日々の気持ちを向上させる。

具体的には以下の周期的なタスクを管理する

- コンタクトレンズの交換
- 美容室の予約
- 処方箋受け取りのための通院
- 定期健診
- 歯のクリーニング
- シーツや枕カバーの洗濯
- 部屋の掃除
- 歯ブラシの交換

![デモのスクリーンショットやGIF](docs/images/demo.gif)

## 📖 概要

### なぜ作ったのか（モチベーション）

個人的に

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
| CI/CD             | GitHub Actions (Node 24.15.0, yarn) |
| デプロイ          | Vercel                              |
| パッケージ管理    | yarn                                |

## 🏗 アーキテクチャ

詳細は [docs/architecture.md](docs/architecture.md) を参照してください。

## 🚀 はじめ方

### 前提条件

- Docker / Docker Compose
- Node.js >= 24.13.x (ローカル環境で直接起動する場合)
- yarn >= 1.22.x

#### 1. プロジェクトの準備

```bash
# リポジトリをクローン
git clone https://github.com/IamSBStakumi/SelfMaintenance.git
cd SelfMaintenance

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集して必要な値を設定（SupabaseのURLなど）
```

#### 2. Supabase の起動

アプリケーションを起動する前に、バックエンドの環境を立ち上げます。

```bash
# Supabase ローカル開発環境の起動
yarn supabase start
```

#### 3. アプリケーションの起動

##### A. Docker を使用する場合（推奨）

Linux環境の開発に最適化された手順です。ビルドから依存関係の解決、サーバー起動までコンテナ内で行われます。

```bash
# コンテナの起動
docker compose up -d --build
```

- アプリケーション: [http://localhost:3000](http://localhost:3000)
- **注意**: ホスト側で Supabase が起動している必要があります (`yarn supabase start`)。
- `network_mode: host` を使用しているため、設定情報の変更なしでローカルの Supabase と連携可能です。

##### B. ローカル環境で直接起動する場合

```bash
# 依存関係をインストール
yarn install

# 開発サーバーを起動
yarn dev
```

- アプリケーション: [http://localhost:3000](http://localhost:3000)

### テストの実行

```bash
# ユニットテスト
yarn test

# E2Eテスト(実装予定)
未実装(package.jsonに実行コマンドを記載する予定)

# カバレッジレポート
yarn test:coverage
```

## 📝 デモ

未実装
