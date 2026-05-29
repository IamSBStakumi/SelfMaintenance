"use client";

import { useParams } from "next/navigation";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import TaskFormWrapper from "@/components/TaskFormWrapper";
import TaskFormHeader from "@/components/TaskFormHeader";
import TaskFormFooter from "@/components/TaskFormFooter";
import ErrorAlert from "@/components/ErrorAlert";
import TaskContent from "./TaskContent";
import Loading from "./Loading";

const TaskPage = () => {
  const { id: taskId } = useParams<{ id: string }>();

  const { fetchMaintenanceItem } = useMaintenanceItem(taskId);

  const { data: taskData, isPending, isError } = fetchMaintenanceItem;

  return (
    <TaskFormWrapper>
      <TaskFormHeader headingText="タスク更新" />

      <main
        className={`
          bg-white/70 dark:bg-zinc-800/50 backdrop-blur-xl
          border border-white/20 dark:border-zinc-700/30
          rounded-3xl p-5 shadow-2xl shadow-indigo-500/5 sm:p-8
          transition-all duration-500 transform
        `}
      >
        {/* ローディング中 */}
        {isPending && <Loading />}

        {/* エラー時 */}
        {isError && <ErrorAlert />}

        {/* 正常にデータが取得できた場合 */}
        {!isPending && !isError && taskData && (
          <TaskContent taskData={taskData} />
        )}
      </main>

      <TaskFormFooter />
    </TaskFormWrapper>
  );
};

export default TaskPage;
