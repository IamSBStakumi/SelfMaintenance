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
    <TaskFormWrapper>
      <TaskFormHeader headingText="タスク新規登録" />

      {/* フォームカード */}
      <TaskFormCard>
        <TaskForm
          defaultValues={defaultFormValues}
          onSubmit={handleCreateSubmit}
          submitButtonText="新しいタスクを登録する"
        />
      </TaskFormCard>

      <TaskFormFooter />
    </TaskFormWrapper>
  );
}
