import { MaintenanceItem } from "@/types/maintenance";

type Props = {
  taskData: MaintenanceItem;
};

const TaskContent = ({ taskData }: Props) => {
  return (
    <div>
      <p>{taskData.name}</p>
    </div>
  );
};

export default TaskContent;
