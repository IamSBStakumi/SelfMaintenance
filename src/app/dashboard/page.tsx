"use client";

import DashboardHeader from "./DashboardHeader";
import PageContent from "./PageContent";
import SkeletonCard from "./SkeletonCard";

import Header from "@/components/Header";
import useMaintenanceItems, {
  useUserProfile,
} from "@/hooks/useMaintenanceItems";
import { isActivePaidSubscriptionStatus } from "@/constants/planLimits";

export default function DashboardPage() {
  const { fetchMaintenanceItems } = useMaintenanceItems();
  const { data: items, isPending, isError } = fetchMaintenanceItems;
  const { data: userProfile, isPending: isUserProfilePending } =
    useUserProfile();
  const hasActivePaidPlan =
    userProfile?.plan === "pro" &&
    isActivePaidSubscriptionStatus(userProfile.subscription_status);
  const isLimitCheckPending = isPending || isUserProfilePending;

  return (
    <div className="min-h-screen bg-lavender px-4 py-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100 sm:p-6">
      <Header />
      <main className="max-w-5xl mx-auto pb-20">
        <DashboardHeader
          taskCount={items?.length ?? 0}
          hasActivePaidPlan={hasActivePaidPlan}
          isLimitCheckPending={isLimitCheckPending}
        />
        {/* ローディング中: スケルトンを3件分表示 */}
        {isPending && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
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

        {/* データが0件 */}
        {!isPending && !isError && items?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              定期タスクがまだありません。
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              最初のタスクを追加してみましょう。
            </p>
          </div>
        )}

        {/* 正常にデータが取得できた場合 */}
        {!isPending && !isError && items && items.length > 0 && (
          <PageContent items={items} />
        )}
      </main>
    </div>
  );
}
