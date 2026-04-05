# SelfMaintenance - アプリケーション仕様書

## 1. アプリケーション概要

「SelfMaintenance」は、コンタクトレンズの交換、通院の記録、日々の生活に関わる定期的なタスクなどを一元管理し、ユーザー自身の日常的なメンテナンスをサポートするためのWebアプリケーションです。

## 2. 画面遷移と機能構成

アプリケーション内の主要な画面および遷移の流れは以下の通りです。

```mermaid
graph TD
    A[スプラッシュ画面] --> B{ログイン/新規登録}
    B --> C[ホーム画面]

    %% ホームからの遷移
    C --> D[タスク追加]
    C --> E[カレンダー/通院ログ]
    C --> F[マイページ/設定]

    %% 各詳細
    D --> D1[タスク詳細]
    E --> E1[通院・処方箋メモ入力]
    F --> F1[レンズの種類・度数保存]
    F --> F2[通知スケジュール設定]

    %% 戻る動線
    D1 -.-> C
    E1 -.-> E
    F1 -.-> F
```

- **ホーム画面**: アプリのメインダッシュボード。ここからそれぞれの機能へアクセスします。
- **タスク機能**: 定期的なメンテナンスタスクを追加・詳細管理します。
- **通院ログ・カレンダー**: 通院の記録や処方箋のメモなどを管理する機能。
- **マイページ・設定**: コンタクトレンズ等の特定の設定情報や、通知スケジュールの管理などを行います。

## 3. システムアーキテクチャ

システム全体はバックエンド（BaaS）としてSupabaseを利用し、フロントエンドにNext.jsを採用した構成となっています。

```mermaid
graph TD
    Browser["ブラウザ / クライアント\nNext.js App Router · React 19 · Tailwind CSS v4"]

    subgraph Frontend["フロントエンド層"]
        NextApp["Next.js 16 (App Router)\nPage / Layout / API Routes"]
        SupabaseSDK["Supabase Client SDK\n@supabase/supabase-js\nauth-helpers-nextjs · Realtime · Storage"]
    end

    subgraph SupabaseBackend["Supabase Backend (hosted)"]
        Auth["Auth"]
        DB["PostgreSQL 17"]
        Realtime["Realtime"]
        Storage["Storage"]
    end

    subgraph DBSchema["DB スキーマ (public)"]
        Table["maintenance_items\nid · user_id · name · icon\ninterval_days · last_completed_at · memo"]
        RLS["RLS ポリシー\nauth.uid() = user_id"]
    end

    Browser --> NextApp
    Browser --> SupabaseSDK
    NextApp <--> SupabaseSDK
    NextApp --> Auth
    SupabaseSDK --> Auth
    SupabaseSDK --> DB
    SupabaseSDK --> Realtime
    SupabaseSDK --> Storage
    DB --> Table
    Table --> RLS
```

### 技術スタック

| カテゴリ          | 技術                     |
| ----------------- | ------------------------ |
| フレームワーク    | Next.js 16 (App Router)  |
| UI ライブラリ     | React 19                 |
| スタイリング      | Tailwind CSS v4          |
| 言語              | TypeScript 5.x           |
| バックエンド / DB | Supabase (PostgreSQL 17) |
| 認証              | Supabase Auth            |
| パッケージ管理    | yarn                     |
| プラットフォーム  | Vercel                   |

## 4. データモデル (Supabase)

### テーブル: `public.maintenance_items`

定期的なメンテナンスタスクを保存する主要テーブルです。

| カラム名            | 型            | 制約                                              | 説明                           |
| ------------------- | ------------- | ------------------------------------------------- | ------------------------------ |
| `id`                | `uuid`        | PK, `gen_random_uuid()`                           | レコード識別子                 |
| `user_id`           | `uuid`        | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | オーナーユーザー               |
| `name`              | `text`        | NOT NULL                                          | メンテナンス項目名             |
| `icon`              | `text`        | nullable                                          | 絵文字アイコン                 |
| `interval_days`     | `integer`     | NOT NULL                                          | 繰り返し間隔（日数）           |
| `last_completed_at` | `timestamptz` | NOT NULL, default `now()`                         | 最終完了日時                   |
| `memo`              | `text`        | nullable                                          | メモ                           |
| `created_at`        | `timestamptz` | NOT NULL, default `now()`                         | 作成日時                       |
| `updated_at`        | `timestamptz` | NOT NULL, default `now()`                         | 更新日時（trigger で自動更新） |

#### Row Level Security (RLS)

ユーザーは「自分自身のデータ」にのみアクセスできるようRLSで保護されています。各テーブル操作での保護条件は以下の通りです。

- クエリ・操作の条件: `auth.uid() = user_id` （SELECT、INSERT、UPDATE、DELETE すべて共通）

## 5. 開発およびCI/CD環境

以下のようなツールチェーンを用いてコード品質向上と自動化が導入されています。

- **テスト**: Vitest 4.x, `@testing-library/react`
- **リンター / フォーマッター**: ESLint 9 (eslint-config-next), Prettier
- **Git フック**: Husky + lint-staged を用いて、コミット時にリント、フォーマット修正、および関連テストを自動実行。
- **CI/CD環境 (GitHub Actions)**: `yarn`でのジョブ実行として、lint チェックおよび vitest のカバレッジを含めたテストが pull_request や push のタイミングで走ります。

```mermaid
flowchart TD
    Trigger["push / pull_request\nmain, develop"]

    subgraph CI["GitHub Actions (Node 22, yarn)"]
        Lint["Lint ジョブ\neslint\ntsc --noEmit"]
        Test["Test ジョブ\nvitest run --coverage"]
    end

    subgraph PreCommit["pre-commit フック (Husky + lint-staged)"]
        LSEslint["eslint --fix"]
        LSPrettier["prettier --write"]
        LSVitest["vitest run --findRelatedTests"]
    end

    Trigger --> Lint
    Lint -->|成功| Test

    Commit["git commit"] --> LSEslint
    LSEslint --> LSPrettier
    LSPrettier --> LSVitest
```
