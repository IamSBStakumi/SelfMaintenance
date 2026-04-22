"use client";

import { useRouter } from "next/navigation";
import { parseISO, startOfDay } from "date-fns";
import useMaintenanceItems from "@/hooks/useMaintenanceItems";
import TaskForm, { TaskFormValues } from "@/components/TaskForm";
import Button from "@/components/ui/Button";

export default function CreateTaskPage() {
  const router = useRouter();
  const { createMaintenanceItem } = useMaintenanceItems();

  const handleCreateSubmit = async (data: TaskFormValues) => {
    // APIへ送信する処理
    await createMaintenanceItem.mutateAsync({
      name: data.name,
      icon: data.icon || null,
      interval_days: data.interval_days,
      last_completed_at: startOfDay(
        parseISO(data.last_completed_at),
      ).toISOString(),
      memo: data.memo || null,
    });
    // 成功時にダッシュボードへリダイレクト
    router.push("/dashboard");
  };

  const defaultFormValues: TaskFormValues = {
    name: "",
    icon: "✨",
    interval_days: 30,
    last_completed_at: new Date().toISOString(),
    memo: "",
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        {/* ヘッダーセクション */}
        <header className="mb-12 flex items-center justify-between mt-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors group cursor-pointer"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            <span className="font-medium">戻る</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight">
            タスクの新規登録
          </h1>
          <div className="w-16" /> {/* バランス用スペーサー */}
        </header>

        {/* フォームカード */}
        <main
          className={`
            bg-white/70 dark:bg-zinc-800/50 backdrop-blur-xl
            border border-white/20 dark:border-zinc-700/30
            rounded-3xl p-8 shadow-2xl shadow-indigo-500/5
            transition-all duration-500 transform
          `}
        >
          <TaskForm
            defaultValues={defaultFormValues}
            onSubmit={handleCreateSubmit}
            submitButtonText="新しいタスクを登録する"
          />
        </main>

        <footer className="mt-12 text-center text-zinc-400 text-sm">
          <p>登録したタスクはダッシュボードでいつでも確認・編集できます。</p>
        </footer>
      </div>
    </div>
  );
}
