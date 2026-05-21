# Supabase本番マイグレーション手順

## 目的

Supabase CLIを使って、`supabase/migrations` 配下のマイグレーションを本番Supabaseプロジェクトへ安全に適用する。

このプロジェクトでは、現時点で以下のマイグレーションを管理している。

- `supabase/migrations/20260324082401_create_maintenance_items.sql`
- `supabase/migrations/20260416080300_create_maintenance_logs.sql`

## 前提

- Supabase本番プロジェクトが作成済みである
- Supabase Dashboardで本番DBのパスワードを確認できる
- Supabase Access Tokenを発行できる
- 本番DBのPostgres major versionが `supabase/config.toml` の `major_version = 17` と一致している
- リポジトリ直下でコマンドを実行する
- 依存関係が未インストールの場合は `yarn install --frozen-lockfile` を先に実行する

## 1. Supabase CLIのバージョンを確認する

```bash
yarn supabase --version
```

このリポジトリでは `package.json` の devDependencies に `supabase` CLIを含めているため、グローバルインストールではなく `yarn supabase` 経由で実行する。

## 2. Supabaseにログインする

ブラウザログインできる環境では次を実行する。

```bash
yarn supabase login
```

ブラウザを開けない環境やCIでは、Supabase Dashboardで発行したAccess Tokenを使う。

```bash
yarn supabase login --token "$SUPABASE_ACCESS_TOKEN"
```

Access Tokenはリポジトリに保存しない。ローカルシェル、CI Secret、または一時的な環境変数として扱う。

## 3. 本番プロジェクトへリンクする

`<PROJECT_REF>` はSupabase DashboardのProject Settingsで確認できるProject Refに置き換える。

```bash
yarn supabase link --project-ref <PROJECT_REF>
```

実行時に本番DBのパスワードを求められた場合は、Supabase Dashboardで確認したDatabase Passwordを入力する。

リンク情報は `supabase/.temp` 配下に保存される。通常はリポジトリへコミットしない。

## 4. 適用前にローカルのマイグレーションを確認する

```bash
ls supabase/migrations
```

本番へ適用したいSQLだけが含まれていることを確認する。不要な作業途中のマイグレーションがある場合は、この時点で止める。

## 5. リモートとの差分を確認する

リンク済み本番プロジェクトのマイグレーション履歴を確認する。

```bash
yarn supabase migration list
```

続けて、実際には適用せず、適用予定のマイグレーションだけを確認する。

```bash
yarn supabase db push --dry-run
```

ここで表示された内容が、今回本番へ反映したいマイグレーションだけであることを確認する。

## 6. 本番DBへマイグレーションを適用する

```bash
yarn supabase db push
```

`--include-seed` は付けない。`supabase/seed.sql` はローカル開発用データのため、本番DBへ投入しない。

CLIから確認を求められた場合は、適用対象のマイグレーション名を再確認してから承認する。

## 7. 適用後の状態を確認する

マイグレーション履歴を再確認する。

```bash
yarn supabase migration list
```

Supabase DashboardのTable EditorまたはSQL Editorで、以下を確認する。

- `public.maintenance_items` が存在する
- `public.maintenance_logs` が存在する
- 両テーブルでRLSが有効になっている
- `maintenance_items` に `set_updated_at` トリガーが存在する
- `maintenance_logs` に `idx_maintenance_logs_user_id_completed_at` と `idx_maintenance_logs_item_id` が存在する

SQL Editorで確認する場合の例。

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('maintenance_items', 'maintenance_logs');

select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and tablename in ('maintenance_items', 'maintenance_logs')
order by tablename, indexname;
```

## 8. アプリ側の本番環境変数を確認する

マイグレーション後、Vercelなどの本番環境に以下が設定されていることを確認する。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

`SUPABASE_SERVICE_ROLE_KEY` はクライアントで使わない。必要な場合も公開環境変数にせず、サーバー専用のSecretとして扱う。

## 9. Supabase Authの本番リダイレクト設定を確認する

本番環境でGoogleログイン後に `localhost` へ戻る場合、DBへのユーザー登録は成功していても、Supabase Authのリダイレクト先設定が本番URLになっていない可能性が高い。

Supabase Dashboardで対象の本番プロジェクトを開き、AuthenticationのURL Configurationを確認する。

- Site URL: `https://<本番ドメイン>`
- Redirect URLs: `https://<本番ドメイン>/auth/callback`
- Vercel Previewも使う場合: `https://*-<vercel-team>.vercel.app/auth/callback` など、運用方針に合うPreview URL

このアプリはログイン開始時に `window.location.origin` から `https://<本番ドメイン>/auth/callback` を `redirectTo` として渡す。Supabase側のRedirect URLsにこのURLが登録されていないと、SupabaseのSite URLへフォールバックし、Site URLが `http://localhost:3000` のままだとログイン後にlocalhostへリダイレクトされる。

Google Cloud ConsoleのOAuth設定では、Authorized redirect URIsにSupabase AuthのコールバックURLを登録する。

```text
https://<PROJECT_REF>.supabase.co/auth/v1/callback
```

アプリ側の `https://<本番ドメイン>/auth/callback` はGoogle Cloud Consoleではなく、Supabase AuthenticationのRedirect URLsに登録する。

## 10. 本番動作確認

本番URLで以下を確認する。

- Googleログインできる
- Googleログイン後に `localhost` ではなく本番URLの `/dashboard` へ戻る
- タスクを新規作成できる
- タスク一覧に作成したタスクが表示される
- タスクを編集できる
- タスク完了操作で `maintenance_logs` に履歴が作成される
- カレンダーで完了履歴を確認できる
- 別ユーザーのデータが表示されない

## 失敗時の対応

### リンク先を間違えた場合

`yarn supabase migration list` の結果やDashboardのProject Refを確認し、正しい本番プロジェクトへリンクし直す。

```bash
yarn supabase link --project-ref <PROJECT_REF>
```

### `db push` 前に想定外のマイグレーションが表示された場合

`yarn supabase db push` は実行しない。`supabase/migrations` の内容とブランチを確認し、適用対象を整理してから再度 `--dry-run` を実行する。

### 適用後にアプリが本番DBへ接続できない場合

Vercelの環境変数、Supabase Project URL、Anon Key、Google OAuthのRedirect URLを確認する。DBマイグレーションよりも、環境変数やOAuth設定の不一致が原因になりやすい。

### Googleログイン後にlocalhostへ戻る場合

Supabase DashboardのAuthentication URL Configurationで、Site URLが本番URLになっていること、Redirect URLsに `https://<本番ドメイン>/auth/callback` が含まれていることを確認する。ユーザーがDBに作成されている場合、Google認証自体は成功しており、最後のアプリ戻り先だけが誤っている可能性が高い。
