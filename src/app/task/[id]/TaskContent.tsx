import TaskForm, { TaskFormValues } from "@/components/TaskForm";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import { MaintenanceItem } from "@/types/maintenance";

type Props = {
  taskData: MaintenanceItem;
};

const TaskContent = ({ taskData }: Props) => {
  const { updateMaintenanceItem } = useMaintenanceItem(taskData.id);

  const handleUpdateTask = async (data: TaskFormValues) => {
    const payload = {
      ...data,
      icon: data.icon?.trim() ? data.icon : null,
      memo: data.memo?.trim() ? data.memo : null,
    };
    await updateMaintenanceItem.mutateAsync(payload);
  };

  const defaultFormValues: TaskFormValues = {
    name: taskData.name,
    icon: taskData.icon || "",
    interval_days: taskData.interval_days,
    last_completed_at: taskData.last_completed_at.split("T")[0],
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
