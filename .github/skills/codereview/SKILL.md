---
name: "code_review"
description: |
  "コードレビューを行う。"
  "「コードレビューして」「レビューplz」などで発火"
---

# コードレビュールール

このスキルは `self-maintenance` プロジェクト（Next.js v16 / React 19 / TypeScript）のコードレビューに特化したルールを定義します。
コードレビューを行う際は、以下のルールに必ず従ってください。

---

## レビューの進め方

1. レビュー対象のファイル・ディレクトリを `view_file` / `list_dir` ツールで全て読み込む。
2. 以下の各観点でチェックし、指摘事項を整理する。
3. 指摘は「致命的（Blocker）」「改善推奨（Warning）」「提案（Suggestion）」の3段階で分類する。
4. 結果は日本語で、Markdownの表や箇条書きを使って分かりやすく出力する。

---

## 観点1: App Router のディレクトリ構成と責務分離

このプロジェクトは `src/app/` を起点とする Next.js App Router 構成を採用しています。
各ディレクトリの役割が正しく守られているかを最優先で確認してください。

### ディレクトリ構成の期待値

```directory-architecture
src/
  app/          # ルーティング・ページ（UI の組み立てのみ）
  components/   # 再利用可能な UI コンポーネント
  hooks/        # カスタムフック（ロジックの抽象化）
  lib/          # 外部ライブラリの初期化・設定（supabase, zod スキーマ等）
  services/     # サーバーサイドのデータアクセス・ビジネスロジック
  providers/    # React Context プロバイダー
  types/        # 型定義
  utils/        # 純粋な関数ユーティリティ
```

### チェックリスト

- **[Blocker] `app/` 配下にビジネスロジックを書かないこと**
  ページコンポーネント（`page.tsx`, `layout.tsx`）は UI の組み立てに専念し、データ取得・変換ロジックは `services/` や `hooks/` に切り出すこと。

- **[Blocker] `services/` のサーバー側関数をクライアントコンポーネントから直接呼び出さないこと**
  `services/` はサーバー専用（`"use server"` または Server Component からのみ呼び出し）とする。クライアントからのデータ取得は `TanStack Query` 経由で行うこと。

- **[Warning] `components/` に特定ページ専用のロジックが混入させないこと**
  `components/` は再利用を前提とする。特定ページにしか使わないコンポーネントは `app/<route>/_components/` に配置することを推奨する。

- **[Suggestion] `utils/` は副作用のない純粋関数のみであること**
  `utils/` に API 呼び出しや状態変更を伴う処理が混入していないか確認する。

---

## 観点2: Server Component / Client Component の使い分け

Next.js App Router では、デフォルトで全コンポーネントが Server Component となります。
`"use client"` の使用が適切かどうかを確認してください。

### チェックリスト

- **[Blocker] `"use client"` の乱用**
  `useState`, `useEffect`, `useRef` 等のクライアント専用フックを使わないコンポーネントに `"use client"` が付いていないか確認する。不要な `"use client"` はサーバー側レンダリングの恩恵を損なう。

- **[Blocker] Server Component 内でブラウザ専用 API（`window`, `document` 等）を使用していないか**

- **[Blocker] Server Component から直接 `onClick` 等のイベントハンドラを渡さないこと**
  イベントハンドラが必要な場合は、その部分のみを Client Component に分離すること。

  ```tsx
  // NG: Server Component でイベントハンドラを持つ
  export default function Page() {
    return <button onClick={() => {}}>クリック</button>; // エラー
  }

  // OK: クライアント部分を分離する
  // _components/SubmitButton.tsx に "use client" を付けて切り出す
  ```

- **[Warning] データフェッチが Client Component 側で行われていないこと（Server Component で行うことを検討）**
  初期データの取得は Server Component で行い、インタラクティブな再取得は TanStack Query で行う構成を推奨する。

- **[Suggestion] `"use client"` の境界はできるだけ末端（葉）のコンポーネントに置くこと**
  境界を末端に寄せることで、より多くのコンポーネントをサーバー側でレンダリングできる。

---

## 観点3: TypeScript / React のベストプラクティス

### 型安全性

- **[Blocker] `any` 型を使用しないこと**
  `any` は型安全性を破壊する。`unknown` を使い、型ガードで絞り込むこと。

- **[Blocker] Supabase のレスポンスをノーチェックで使用しないこと**
  `error` プロパティを確認せずに `data` を使う処理は Blocker とする。

  ```tsx
  // NG
  const { data } = await supabase.from("tasks").select();
  return data; // error を無視している

  // OK
  const { data, error } = await supabase.from("tasks").select();
  if (error) throw error;
  return data;
  ```

- **[Warning] Zod スキーマによるバリデーションを行うこと**
  外部入力（フォーム値・API レスポンス等）は必ず Zod でバリデーションすること。`lib/` 配下にスキーマが定義されているか確認する。

- **[Warning] `as` によるキャストを多用していないこと**
  型キャストは型推論が困難な箇所にとどめ、理由をコメントで明記すること。

### React / フック

- **[Blocker] `useEffect` 内で非同期処理を直接 `await` しないこと**

  ```tsx
  // NG: useEffect のコールバックは async にできない
  useEffect(async () => {
    const data = await fetchData();
  }, []);

  // OK: 内部に async 関数を定義して呼び出す
  useEffect(() => {
    const load = async () => {
      const data = await fetchData();
    };
    load();
  }, []);
  ```

- **[Warning] `useEffect` の依存配列に漏れがないこと**
  ESLint の `exhaustive-deps` ルールに従い、依存配列を正確に記述すること。

- **[Warning] カスタムフックの責務が肥大化していないこと**
  1つのカスタムフックが UI ロジック・データ取得・バリデーションを全て担っている場合は分割を検討する。

- **[Suggestion] TanStack Query の `queryKey` は一元管理すること**
  キャッシュの整合性のため、`queryKey` は `lib/` や `hooks/` に定数として切り出すことを推奨する。

### 命名規則

- **[Warning] コンポーネント名はパスカルケース（`PascalCase`）であること**
- **[Warning] カスタムフックは `use` プレフィックスで始まること（例: `useTaskList`）**
- **[Suggestion] 型名は `PascalCase` で、インターフェースには `I` プレフィックスを付けないこと**
  例: `Task`, `MaintenanceItem`（`ITask` は避ける）

---

## 観点4: テストの品質（Vitest / Testing Library）

### チェックリスト

- **[Blocker] 実際の Supabase / 外部 API に接続するテストが含まれていないこと**
  `vi.mock()` でモックし、ユニットテストは外部依存なしで完結すること。

- **[Blocker] テストが実装の内部実装（プライベート関数・状態の直接参照）に依存していないこと**
  Testing Library の原則に従い、ユーザーが操作する形でテストを書くこと（`getByRole`, `getByText` 等を優先）。

- **[Warning] テストケースが正常系のみでなく、異常系・境界値もカバーしていること**
  例: フォームバリデーションエラー表示、API エラー時のフォールバック表示。

- **[Warning] `describe` / `test` のテスト説明は「〜の場合、〜する」形式か（日本語可）**

  ```ts
  // OK
  describe("useTaskList", () => {
    it("タスクが存在しない場合、空配列を返す", () => {
  ```

- **[Warning] `vi.mock()` のリセットが適切に行われていること**
  `beforeEach` で `vi.clearAllMocks()` または `vi.resetAllMocks()` を呼び出し、テスト間の副作用を防ぐこと。

- **[Suggestion] テストデータ（フィクスチャ）はヘルパー関数またはファクトリに切り出すこと**
  `createMockTask()` のようなヘルパーを `src/test/` 配下に定義し、各テストで再利用すること。

- **[Suggestion] Storybook のストーリーはコンポーネントの主要な状態（通常・エラー・ローディング）を網羅すること**

---

## 出力フォーマット

レビュー結果は以下の形式で出力してください。

```markdown
# コードレビュー結果: <対象パス>

## サマリー

| 区分          | 件数 |
| ------------- | ---- |
| 🔴 Blocker    | X件  |
| 🟡 Warning    | X件  |
| 🟢 Suggestion | X件  |

## 指摘一覧

### 🔴 Blocker

#### [ファイル名:行番号] 指摘タイトル

- **問題**: （何が問題か）
- **理由**: （なぜ問題なのか）
- **修正案**: （どう直すべきか、コード例があれば記載）

### 🟡 Warning

...

### 🟢 Suggestion

...

## 総評

（全体的な所感・良かった点・優先して対応すべき点）
```
