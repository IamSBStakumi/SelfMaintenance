"use client";

import { useRouter } from "next/navigation";
import { parseISO, startOfDay } from "date-fns";
import { toast } from "react-toastify";
import useMaintenanceItems from "@/hooks/useMaintenanceItems";
import TaskForm, { TaskFormValues } from "@/components/TaskForm";
import TaskFormWrapper from "@/components/TaskFormWrapper";
import TaskFormCard from "@/components/TaskFormCard";
import TaskFormHeader from "@/components/TaskFormHeader";
import TaskFormFooter from "@/components/TaskFormFooter";
import {
  FREE_PLAN_LIMIT_MESSAGE,
  FREE_PLAN_MAINTENANCE_ITEM_LIMIT,
} from "@/constants/planLimits";

export default function CreateTaskPage() {
  const router = useRouter();
  const { fetchMaintenanceItems, createMaintenanceItem } =
    useMaintenanceItems();
  const { data: items, isPending } = fetchMaintenanceItems;
  const taskCount = items?.length ?? 0;
  const hasReachedFreeLimit = taskCount >= FREE_PLAN_MAINTENANCE_ITEM_LIMIT;

  const handleCreateSubmit = async (data: TaskFormValues) => {
    if (hasReachedFreeLimit) {
      toast.info(FREE_PLAN_LIMIT_MESSAGE);
      return;
    }

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
      toast.error(
        error instanceof Error ? error.message : "タスクの作成に失敗しました。",
      );
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
    <TaskFormWrapper>
      <TaskFormHeader headingText="タスク新規登録" />

      {/* フォームカード */}
      <TaskFormCard>
        {hasReachedFreeLimit ? (
          <div className="space-y-4 text-center">
            <p className="text-4xl">🔒</p>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                無料版の上限に達しました
              </h2>
              <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {FREE_PLAN_LIMIT_MESSAGE}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 px-6 py-3 font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:opacity-90 active:scale-95"
            >
              ダッシュボードに戻る
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200">
              無料版では{FREE_PLAN_MAINTENANCE_ITEM_LIMIT}
              件まで登録できます。現在 {isPending ? "確認中" : `${taskCount}件`}
              です。
            </div>
            <TaskForm
              defaultValues={defaultFormValues}
              onSubmit={handleCreateSubmit}
              submitButtonText="新しいタスクを登録する"
            />
          </>
        )}
      </TaskFormCard>

      <TaskFormFooter />
    </TaskFormWrapper>
  );
}
