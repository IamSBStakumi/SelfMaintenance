"use client";

import { useParams } from "next/navigation";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import TaskFormHeader from "@/components/TaskFormHeader";
import TaskFormFooter from "@/components/TaskFormFooter";
import TaskContent from "./TaskContent";
import Loading from "./Loading";
import ErrorAlert from "./ErrorAlert";

const TaskPage = () => {
  const { id: taskId } = useParams<{ id: string }>();

  const { fetchMaintenanceItem } = useMaintenanceItem(taskId);

  const { data: taskData, isPending, isError } = fetchMaintenanceItem;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100 flex flex-col items-center sm:p-6">
      <div className="max-w-2xl w-full">
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
      </div>
    </div>
  );
};

export default TaskPage;
