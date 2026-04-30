"use client";

import { useRouter } from "next/navigation";

/**
 * タスク新規登録ページのヘッダーコンポーネント
 * 「戻る」ボタンとページタイトルを表示します。
 */
const CreateTaskHeader = () => {
  const router = useRouter();

  return (
    <header className="mb-12 flex items-center justify-between mt-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors group cursor-pointer"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">
          ←
        </span>
        <span className="font-medium">戻る</span>
      </button>
      <h1 className="text-2xl font-bold tracking-tight">タスクの新規登録</h1>
      <div className="w-16" /> {/* バランス用スペーサー */}
    </header>
  );
};

export default CreateTaskHeader;
