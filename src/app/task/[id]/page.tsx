"use client";

import { useParams } from "next/navigation";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import TaskFormWrapper from "@/components/TaskFormWrapper";
import TaskFormCard from "@/components/TaskFormCard";
import TaskFormHeader from "@/components/TaskFormHeader";
import TaskFormFooter from "@/components/TaskFormFooter";
import Loading from "@/components/Loading";
import ErrorAlert from "@/components/ErrorAlert";
import TaskContent from "./TaskContent";

const TaskPage = () => {
  const { id: taskId } = useParams<{ id: string }>();

  const { fetchMaintenanceItem } = useMaintenanceItem(taskId);

  const { data: taskData, isPending, isError } = fetchMaintenanceItem;

  return (
    <TaskFormWrapper>
      <TaskFormHeader headingText="タスク更新" />

      <TaskFormCard>
        {/* ローディング中 */}
        {isPending && <Loading />}

        {/* エラー時 */}
        {isError && <ErrorAlert />}

        {/* 正常にデータが取得できた場合 */}
        {!isPending && !isError && taskData && (
          <TaskContent taskData={taskData} />
        )}
      </TaskFormCard>

      <TaskFormFooter />
    </TaskFormWrapper>
  );
};

export default TaskPage;
