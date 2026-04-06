"use client";

import { addDays, format, isBefore, isToday, isTomorrow } from "date-fns";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import useMaintenanceItems from "@/hooks/useMaintenanceItems";
import { MaintenanceItem } from "@/types/maintenance";

// interval_days の大きさからカードの背景色を決定するヘルパー
function getCardColor(intervalDays: number): string {
  if (intervalDays <= 14) return "bg-soft-pink";
  if (intervalDays <= 90) return "bg-mint";
  return "bg-lavender";
}

// 次回予定日の表示文字列を生成するヘルパー
function formatNextDue(nextDue: Date): string {
  if (isToday(nextDue)) return "今日";
  if (isTomorrow(nextDue)) return "明日";
  return format(nextDue, "yyyy-MM-dd");
}

// 1件分のカードコンポーネント
function MaintenanceItemCard({ item }: { item: MaintenanceItem }) {
  const lastCompleted = new Date(item.last_completed_at);
  const nextDue = addDays(lastCompleted, item.interval_days);
  const isOverdue = isBefore(nextDue, new Date()) && !isToday(nextDue);
  const color = getCardColor(item.interval_days);

  return (
    <div
      className={`rounded-3xl p-6 shadow-soft transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex flex-col justify-between ${color} text-zinc-800`}
    >
      <div>
        {/* アイコンが設定されている場合は表示 */}
        {item.icon && (
          <span className="text-2xl mb-2 block" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <h2 className="text-xl font-bold mb-3 leading-tight">{item.name}</h2>
        <div className="text-sm opacity-80 mb-6 space-y-1 font-medium">
          <p className="flex items-center">
            <span className="w-16">周期:</span>
            <span>{item.interval_days}日</span>
          </p>
          <p className="flex items-center">
            <span className="w-16">前回:</span>
            <span>{format(lastCompleted, "yyyy-MM-dd")}</span>
          </p>
          {/* メモが設定されている場合は表示 */}
          {item.memo && (
            <p className="mt-2 text-xs opacity-70 line-clamp-2">{item.memo}</p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-black/10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
            次回予定
          </p>
          <p className={`font-bold text-lg ${isOverdue ? "text-red-600" : ""}`}>
            {formatNextDue(nextDue)}
          </p>
        </div>
        <button
          className="bg-white/90 hover:bg-white text-zinc-800 font-bold py-2.5 px-5 rounded-full shadow-sm transition-colors text-sm hover:shadow-md active:scale-95"
          aria-label={`${item.name}を完了にする`}
        >
          完了
        </button>
      </div>
    </div>
  );
}

// ローディング中のスケルトン表示
function SkeletonCard() {
  return (
    <div className="rounded-3xl p-6 bg-zinc-100 dark:bg-zinc-800 animate-pulse flex flex-col gap-4 h-52">
      <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
      <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
      <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
      <div className="mt-auto h-10 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full" />
    </div>
  );
}

export default function DashboardPage() {
  const { fetchMaintenanceItems } = useMaintenanceItems();
  const { data: items, isPending, isError } = fetchMaintenanceItems;
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100">
      <Header />
      <main className="max-w-5xl mx-auto pb-20">
        <button onClick={() => router.push("/create_task")}>新規登録</button>
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
        {!isPending && !isError && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              メンテナンス項目がまだありません。
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              最初のタスクを追加してみましょう。
            </p>
          </div>
        )}

        {/* 正常にデータが取得できた場合 */}
        {!isPending && !isError && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <MaintenanceItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
