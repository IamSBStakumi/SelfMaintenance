# TypeScript + Next.js スタイルガイド

## はじめに

本ガイドは、**TypeScript + Next.js（App Router）** を用いた開発のコーディング規約を定義します。

以下をベースとしています：

- TypeScript公式ガイドライン
- ESLint / Prettier標準設定
- React / Next.js ベストプラクティス

ただし、プロダクト開発の実務に最適化するため一部カスタマイズしています。

---

## レビュー時の出力について

- 常に日本語で出力すること
- 日本のギャルのように明るく元気にふるまい、敬語を使わないこと

### 出力例

- XXXの責務デッカすぎ
- ここの処理、XXXに分離できるよ
- この命名、XXXの方がわかりやすくね？
- XXXの処理、YYYに移動した方がよくね？
- めっちゃいい感じ！
- ちょーサイコー！

---

## 基本原則

- **可読性:** 初見でも責務とデータフローが理解できること
- **保守性:** 変更影響範囲が局所化されていること
- **一貫性:** ディレクトリ構造・命名・責務を統一する
- **型安全性:** 型でバグを防ぐ設計を優先する
- **パフォーマンス:** Server / Client の責務分離を徹底する

---

## ディレクトリ設計

### 基本構成（App Router）

```txt
src/
  app/
    (routes)/
      page.tsx
      layout.tsx
  components/
  features/
  hooks/
  lib/
  providers/
  services/
  types/
  utils/
```

### 指針

- **features単位で関心を分離する（推奨）**
- コンポーネントの肥大化を避ける
- 「UI / ロジック / データアクセス」を分離する

---

## 命名規則

### 変数・関数

```ts
const userName = "...";
function fetchUserData() {}
```

- camelCase

---

### 型・インターフェース

```ts
type User = {};
interface UserResponse {}
```

- PascalCase

---

### コンポーネント

```tsx
export function UserCard() {}
```

- PascalCase
- ファイル名も一致させる

---

### 定数

```ts
const MAX_RETRY_COUNT = 3;
```

- UPPER_SNAKE_CASE

---

### ファイル名

| 種類           | 命名             |
| -------------- | ---------------- |
| コンポーネント | `UserCard.tsx`   |
| hooks          | `useUser.ts`     |
| services       | `userService.ts` |
| util           | `formatDate.ts`  |

---

## コンポーネント設計

### 原則

- **1コンポーネント1責務**
- ロジックを持ちすぎない
- 再利用可能性を意識する

---

### Server / Client の分離

```tsx
// Server Component（デフォルト）
export default async function Page() {}

// Client Component
("use client");
```

#### ルール

- データ取得 → Server Component
- UI操作 → Client Component

---

### Props設計

```ts
type Props = {
  user: User;
  onClick: () => void;
};
```

- 明示的に型定義
- `any`は禁止

---

## Hooks

### カスタムフック

```ts
export function useUser() {
  // ロジック
}
```

#### 指針

- UIとロジックを分離
- 副作用はhookに閉じ込める
- 名前は `useXxx`

---

## 型設計

### 原則

- **型は「ドメイン」に寄せる**
- APIレスポンス型をそのまま使わない

```ts
// NG
type ApiUser = {};

// OK
type User = {
  id: string;
  name: string;
};
```

---

### Utility Types 活用

```ts
Partial<T>;
Pick<T, K>;
Record<K, T>;
```

---

## データ取得

### Server Component

```ts
async function getUser() {
  const res = await fetch(...)
  return res.json()
}
```

---

### Client側（例：React Query）

```ts
const { data } = useQuery(...)
```

---

### 指針

- Serverで取得できるものはServerで
- Client fetchは最小限

---

## サービス層

```ts
// src/services/userService.ts
export async function fetchUser() {}
```

### 役割

- API通信の抽象化
- UIから切り離す

---

## コメント

- 「なぜ」を書く
- 冗長な説明は禁止

```ts
// NG
// ユーザーを取得する

// OK
// API制約によりページングはサーバー側で行う
```

---

## エラーハンドリング

```ts
try {
  await fetchUser();
} catch (e) {
  // ハンドリング
}
```

### 指針

- UIに伝播するエラーを設計する
- 想定外エラーを握りつぶさない

---

## ロギング

- `console.log`は開発時のみ
- 本番ではロギング基盤へ

---

## フォーマット・Lint

### 必須ツール

- **Prettier**
- **ESLint（Next.js推奨設定）**
- **TypeScript strict mode**

---

## パフォーマンス

### 重要ポイント

- 不要なClient Componentを作らない
- `useMemo / useCallback`の過剰使用禁止
- ストリーミング・Suspenseを活用

---

## アンチパターン

### ❌ 巨大コンポーネント

→ 分割する

---

### ❌ Propsバケツリレー

→ hooks / context / colocationで解決

---

### ❌ anyの乱用

→ 型設計を見直す

---

### ❌ Server/Client混在

→ 責務を分離する

---

## 補足（実務的に重要）

- **状態は「使う場所の近く」に置く（colocation）**
- 複数箇所から使うなら → hook化
- 副作用を含むなら → hook または service に分離

---

## まとめ

- UI / ロジック / データ取得を分離する
- Server / Client の責務を厳密に分離する
- 型で安全性を担保する
- 構造で可読性を担保する
