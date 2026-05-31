# メグループ — アーキテクチャ・ドキュメント

## 1. システム全体アーキテクチャ

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
        ProfileTable["user_profiles\nuser_id · plan · subscription_status\nstripe_customer_id · stripe_subscription_id"]
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
    DB --> ProfileTable
    DB --> Table
    Table --> RLS
    ProfileTable --> RLS
```

## 2. ディレクトリ構造

```directory architecture
/ (root)
├── src/
│   ├── app/
│   │   ├── page.tsx          # トップページ
│   │   ├── layout.tsx        # ルートレイアウト（Geist フォント設定）
│   │   └── globals.css       # グローバルスタイル（Tailwind v4 import）
│   └── test/
│       ├── setup.ts          # テストセットアップ（@testing-library/jest-dom）
│       └── sample.test.ts    # サンプルテスト
│
├── supabase/
│   ├── config.toml           # Supabase ローカル設定（ポート・認証・ストレージ等）
│   ├── seed.sql              # テストデータ投入スクリプト
│   ├── .gitignore
│   └── migrations/           # テーブル定義・RLS ポリシー・updated_at トリガー
│
├── public/
│
├── .github/
│   ├── workflows/
│   │   └── ci.yml            # CI: lint → typecheck → test --coverage
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   └── feature_request.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml        # npm / GitHub Actions 週次自動更新
│
├── .husky/
│   └── pre-commit            # lint-staged 実行
│
├── docs/
│   └── architecture.md       # アーキテクチャ記述
│
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── postcss.config.mjs
├── next.config.ts
├── eslint.config.mjs
├── commitlint.config.js
├── .env.example
├── .vercelignore
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

## 3. Supabase データモデル

### テーブル: `public.user_profiles`

アプリユーザーのプラン・課金状態を管理するテーブルです。`auth.users` 作成時にトリガーで自動作成されます。

| カラム名                 | 型            | 制約                                              | 説明                                     |
| ------------------------ | ------------- | ------------------------------------------------- | ---------------------------------------- |
| `user_id`                | `uuid`        | PK, FK → `auth.users(id)` ON DELETE CASCADE       | オーナーユーザー                         |
| `plan`                   | `text`        | NOT NULL, default `free`, `free` / `pro`          | アプリ上のプラン                         |
| `subscription_status`    | `text`        | nullable                                          | Stripe サブスクリプション状態            |
| `stripe_customer_id`     | `text`        | nullable, UNIQUE                                  | Stripe Customer ID                       |
| `stripe_subscription_id` | `text`        | nullable, UNIQUE                                  | Stripe Subscription ID                   |
| `current_period_end`     | `timestamptz` | nullable                                          | 現在の課金期間終了日時                   |
| `created_at`             | `timestamptz` | NOT NULL, default `now()`                         | 作成日時                                 |
| `updated_at`             | `timestamptz` | NOT NULL, default `now()`                         | 更新日時（trigger で自動更新）           |

`plan = 'pro'` かつ `subscription_status IN ('active', 'trialing')` の場合に有料ユーザーとして扱います。

### テーブル: `public.maintenance_items`

| カラム名            | 型            | 制約                                              | 説明                           |
| ------------------- | ------------- | ------------------------------------------------- | ------------------------------ |
| `id`                | `uuid`        | PK, `gen_random_uuid()`                           | レコード識別子                 |
| `user_id`           | `uuid`        | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | オーナーユーザー               |
| `name`              | `text`        | NOT NULL                                          | 定期タスク名                   |
| `icon`              | `text`        | nullable                                          | 絵文字アイコン                 |
| `interval_days`     | `integer`     | NOT NULL                                          | 繰り返し間隔（日数）           |
| `last_completed_at` | `timestamptz` | NOT NULL, default `now()`                         | 最終完了日時                   |
| `memo`              | `text`        | nullable                                          | メモ                           |
| `created_at`        | `timestamptz` | NOT NULL, default `now()`                         | 作成日時                       |
| `updated_at`        | `timestamptz` | NOT NULL, default `now()`                         | 更新日時（trigger で自動更新） |

### Row Level Security (RLS) ポリシー

RLS が有効化されており、全操作でログインユーザー自身のデータのみアクセス可能。

| 操作   | ポリシー条件           |
| ------ | ---------------------- |
| SELECT | `auth.uid() = user_id` |
| INSERT | `auth.uid() = user_id` |
| UPDATE | `auth.uid() = user_id` |
| DELETE | `auth.uid() = user_id` |

### トリガー

```sql
-- updated_at を自動更新するトリガー
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.maintenance_items
FOR EACH ROW
EXECUTE PROCEDURE handle_updated_at();

-- 無料版ユーザーの定期タスク登録数を3件までに制限するトリガー
CREATE TRIGGER enforce_free_plan_maintenance_item_limit
BEFORE INSERT ON public.maintenance_items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_free_plan_maintenance_item_limit();
```

## 4. 技術スタック

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

## 5. CI/CD パイプライン

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

- 同一ブランチへの新しいプッシュで古いワークフローをキャンセル（`concurrency`）
- pre-commit フック: `lint-staged` → eslint --fix · prettier --write · vitest (関連テストのみ)
- コミットメッセージ規約: `commitlint` + Conventional Commits
