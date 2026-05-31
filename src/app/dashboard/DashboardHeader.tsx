import { useRouter } from "next/navigation";

import {
  FREE_PLAN_LIMIT_MESSAGE,
  FREE_PLAN_MAINTENANCE_ITEM_LIMIT,
} from "@/constants/planLimits";

type DashboardHeaderProps = {
  taskCount: number;
  hasActivePaidPlan: boolean;
  isLimitCheckPending: boolean;
};

const DashboardHeader = ({
  taskCount,
  hasActivePaidPlan,
  isLimitCheckPending,
}: DashboardHeaderProps) => {
  const router = useRouter();
  const hasReachedFreeLimit =
    !hasActivePaidPlan && taskCount >= FREE_PLAN_MAINTENANCE_ITEM_LIMIT;
  const isCreateDisabled = isLimitCheckPending || hasReachedFreeLimit;

  return (
    <div className="mb-8 mt-4 space-y-4 sm:mb-10 sm:mt-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white/40 dark:bg-zinc-800/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 dark:border-zinc-700/30 gap-4 sm:p-6">
        <div className="text-center md:text-left">
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">
            定期タスク一覧
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            現在のタスク状況をチェックして、次にやるタイミングを逃さないようにしましょう
          </p>
        </div>
        <button
          onClick={() => router.push("/create_task")}
          disabled={isCreateDisabled}
          className="bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold py-3 px-6 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 sm:px-8"
        >
          <span className="text-2xl leading-none">+</span>
          <span>{isLimitCheckPending ? "確認中..." : "新規登録する"}</span>
        </button>
      </div>
      <div className="rounded-2xl border border-indigo-100 bg-white/60 px-4 py-3 text-sm text-zinc-600 dark:border-indigo-900/40 dark:bg-zinc-800/40 dark:text-zinc-300">
        {isLimitCheckPending ? (
          <span>登録上限を確認しています。</span>
        ) : hasActivePaidPlan ? (
          <span>有料プラン: タスク登録数の上限はありません。</span>
        ) : (
          <span>
            無料版の登録数: {taskCount} / {FREE_PLAN_MAINTENANCE_ITEM_LIMIT}件
          </span>
        )}
        {!hasActivePaidPlan && hasReachedFreeLimit && (
          <span className="mt-1 block text-indigo-600 dark:text-indigo-300">
            {FREE_PLAN_LIMIT_MESSAGE}
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
