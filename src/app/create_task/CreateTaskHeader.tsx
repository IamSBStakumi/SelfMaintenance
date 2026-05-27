"use client";

import { useRouter } from "next/navigation";

/**
 * タスク新規登録ページのヘッダーコンポーネント
 * 「戻る」ボタンとページタイトルを表示します。
 */
const CreateTaskHeader = () => {
  const router = useRouter();

  return (
    <header className="mb-8 flex items-center justify-between gap-3 mt-4 sm:mb-12 sm:mt-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex shrink-0 items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors group cursor-pointer sm:gap-2 sm:text-base"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">
          ←
        </span>
        <span className="font-medium">戻る</span>
      </button>
      <h1 className="min-w-0 flex-1 text-center text-xl font-bold tracking-tight sm:text-2xl">
        タスクの新規登録
      </h1>
      <div className="w-12 shrink-0 sm:w-16" /> {/* バランス用スペーサー */}
    </header>
  );
};

export default CreateTaskHeader;
