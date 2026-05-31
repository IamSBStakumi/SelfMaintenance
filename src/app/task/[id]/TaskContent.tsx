import TaskForm, { TaskFormValues } from "@/components/TaskForm";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import { MaintenanceItem } from "@/types/maintenance";
import { toast } from "react-toastify";

type Props = {
  taskData: MaintenanceItem;
};

const TaskContent = ({ taskData }: Props) => {
  const { updateMaintenanceItem, deleteMaintenanceItem } = useMaintenanceItem(
    taskData.id,
  );

  const handleUpdateTask = async (data: TaskFormValues) => {
    const payload = {
      ...data,
      icon: data.icon?.trim() ? data.icon : null,
      memo: data.memo?.trim() ? data.memo : null,
    };
    await updateMaintenanceItem.mutateAsync(payload);
  };

  const handleDeleteTask = async () => {
    if (deleteMaintenanceItem.isPending) return;

    const confirmed = window.confirm(
      "このタスクを削除しますか？完了履歴には「削除されたタスク」として表示されます。",
    );

    if (!confirmed) return;

    try {
      await deleteMaintenanceItem.mutateAsync();
      toast.success("タスクを削除しました。");
    } catch (error) {
      console.error("タスクの削除に失敗しました。", error);
      toast.error("タスクの削除に失敗しました。");
    }
  };

  const defaultFormValues: TaskFormValues = {
    name: taskData.name,
    icon: taskData.icon || "",
    interval_days: taskData.interval_days,
    last_completed_at: taskData.last_completed_at.split("T")[0],
    memo: taskData.memo || "",
  };

  return (
    <>
      <TaskForm
        defaultValues={defaultFormValues}
        onSubmit={handleUpdateTask}
        submitButtonText="タスクを更新する"
      />

      <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="button"
          onClick={handleDeleteTask}
          disabled={deleteMaintenanceItem.isPending}
          className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
        >
          {deleteMaintenanceItem.isPending
            ? "削除中..."
            : "このタスクを削除する"}
        </button>
      </div>
    </>
  );
};

export default TaskContent;
