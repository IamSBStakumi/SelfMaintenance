"use client";

import { useParams } from "next/navigation";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import TaskContent from "./TaskContent";

const TaskPage = () => {
  const { id: taskId } = useParams<{ id: string }>();

  const { fetchMaintenanceItem } = useMaintenanceItem(taskId);

  const { data: taskData, isPending, isError } = fetchMaintenanceItem;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100 sm:p-6">
      <main className="max-w-2xl mx-auto pb-20">
        {/* ローディング中 */}
        {isPending && (
          <div className="flex min-h-80 items-center justify-center text-center">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              読み込み中...
            </p>
          </div>
        )}

        {/* エラー時 */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              データの取得に失敗しました。
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              ページを再読み込みしてお試しください。
            </p>
          </div>
        )}

        {/* 正常にデータが取得できた場合 */}
        {!isPending && !isError && taskData && (
          <TaskContent taskData={taskData} />
        )}
      </main>
    </div>
  );
};

export default TaskPage;
