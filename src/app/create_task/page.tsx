"use client";

import { useRouter } from "next/navigation";
import { parseISO, startOfDay } from "date-fns";
import { toast } from "react-toastify";
import useMaintenanceItems from "@/hooks/useMaintenanceItems";
import TaskForm, { TaskFormValues } from "@/components/TaskForm";
import CreateTaskHeader from "./CreateTaskHeader";

export default function CreateTaskPage() {
  const router = useRouter();
  const { createMaintenanceItem } = useMaintenanceItems();

  const handleCreateSubmit = async (data: TaskFormValues) => {
    try {
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
    } catch (error) {
      console.error("タスクの作成に失敗しました。", error);
      toast.error("タスクの作成に失敗しました。");
    }
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
        <CreateTaskHeader />

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
