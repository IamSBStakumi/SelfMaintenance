import { format } from "date-fns";
import { MaintenanceItem, MaintenanceLog } from "@/types/maintenance";

type Props = {
  /** 表示するログデータ */
  log: MaintenanceLog;
  /** ログに対応する定期タスク（削除済みの場合は undefined） */
  item: MaintenanceItem | undefined;
};

/**
 * ログ1件分の行コンポーネント
 * アイコン・タスク名・完了時刻を表示します。
 */
const LogItem = ({ log, item }: Props) => {
  return (
    <div className="p-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors group">
      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xl shadow-inner group-hover:scale-105 transition-transform">
        {item?.icon || "✅"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
          {item?.name || "削除されたタスク"}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            focusable="false"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {format(new Date(log.completed_at), "HH:mm")}
        </p>
      </div>
    </div>
  );
};

export default LogItem;
