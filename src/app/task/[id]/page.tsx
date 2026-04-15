"use client";

import { useParams } from "next/navigation";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import escapeString from "@/utils/escapeString";
import TaskContent from "./TaskContent";

const TaskPage = () => {
  const params = useParams();
  const taskId = escapeString(params.id as string);

  const { fetchMaintenanceItem } = useMaintenanceItem(taskId);

  const { data: taskData, isPending, isError } = fetchMaintenanceItem;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100">
      <main className="max-w-5xl mx-auto pb-20">
        {/* ローディング中 */}
        {isPending && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <p>読み込み中</p>
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
