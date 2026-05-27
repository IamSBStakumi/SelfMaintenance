"use client";

import { addDays, format, isBefore, isToday } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import { MaintenanceItem } from "@/types/maintenance";
import getCardColor from "@/utils/getCardColor";
import formatNextDue from "@/utils/formatNextDue";

const MaintenanceItemCard = ({ item }: { item: MaintenanceItem }) => {
  const { updateMaintenanceItemNextCycle } = useMaintenanceItem(item.id);
  const router = useRouter();

  const lastCompleted = new Date(item.last_completed_at);
  const nextDue = addDays(lastCompleted, item.interval_days);
  const isOverdue = isBefore(nextDue, new Date()) && !isToday(nextDue);
  const color = getCardColor(item.interval_days);

  const handleCompleteTask = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (updateMaintenanceItemNextCycle.isPending) return;

    try {
      await updateMaintenanceItemNextCycle.mutateAsync();
      toast.success("タスクを完了しました。");
    } catch (error) {
      console.error("タスクの完了に失敗しました。", error);
      toast.error("タスクの完了に失敗しました。");
    }
  };

  const handleCardClick = () => {
    router.push(`/task/${item.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter") handleCardClick();
      }}
      className={`rounded-3xl p-5 shadow-soft transition-all duration-300 sm:hover:scale-[1.02] hover:-translate-y-1 flex flex-col justify-between sm:p-6 sm:hover:scale-105 ${color} text-zinc-800 cursor-pointer`}
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

      <div className="mt-auto pt-4 border-t border-black/10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
            次回予定
          </p>
          <p className={`font-bold text-lg ${isOverdue ? "text-red-600" : ""}`}>
            {formatNextDue(nextDue)}
          </p>
        </div>
        <button
          className={`w-full bg-white/90 hover:bg-white text-zinc-800 font-bold py-2.5 px-5 rounded-full shadow-sm transition-colors text-sm hover:shadow-md active:scale-95 sm:w-auto ${updateMaintenanceItemNextCycle.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          aria-label={`${item.name}を完了にする`}
          onClick={handleCompleteTask}
          disabled={updateMaintenanceItemNextCycle.isPending}
        >
          {updateMaintenanceItemNextCycle.isPending ? "処理中..." : "完了"}
        </button>
      </div>
    </div>
  );
};

export default MaintenanceItemCard;
