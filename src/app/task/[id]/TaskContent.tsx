import TaskForm, { TaskFormValues } from "@/components/TaskForm";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import { MaintenanceItem } from "@/types/maintenance";

type Props = {
  taskData: MaintenanceItem;
};

const TaskContent = ({ taskData }: Props) => {
  const { updateMaintenanceItem } = useMaintenanceItem(taskData.id);

  const handleUpdateTask = async (data: TaskFormValues) => {
    // TODO: タスク更新処理を実装する
    await updateMaintenanceItem.mutateAsync(data);
  };

  const defaultFormValues: TaskFormValues = {
    name: taskData.name,
    icon: taskData.icon || "",
    interval_days: taskData.interval_days,
    last_completed_at: taskData.last_completed_at,
    memo: taskData.memo || "",
  };

  return (
    <TaskForm
      defaultValues={defaultFormValues}
      onSubmit={handleUpdateTask}
      submitButtonText="タスクを更新する"
    />
  );
};

export default TaskContent;
