import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { MaintenanceItem, MaintenanceLog } from "@/types/maintenance";
import LogItem from "./LogItem";

type Props = {
  /** 選択中の日付 */
  selectedDate: Date;
  /** 選択日のログ一覧 */
  selectedLogs: MaintenanceLog[];
  /** ログ検索用のアイテムマップ（id -> MaintenanceItem） */
  itemMap: Map<string, MaintenanceItem>;
  /** ログデータのローディング状態 */
  isLogsLoading: boolean;
  /** アイテムデータのローディング状態 */
  isItemsLoading: boolean;
  /** ログデータのエラー状態 */
  isLogsError: boolean;
  /** アイテムデータのエラー状態 */
  isItemsError: boolean;
  /** ログデータのエラーオブジェクト */
  logsError: Error | null;
  /** アイテムデータのエラーオブジェクト */
  itemsError: Error | null;
};

/**
 * 選択日のログ一覧パネルコンポーネント
 * ローディング・エラー・空状態・ログ一覧の各状態を表示します。
 */
const LogList = ({
  selectedDate,
  selectedLogs,
  itemMap,
  isLogsLoading,
  isItemsLoading,
  isLogsError,
  isItemsError,
  logsError,
  itemsError,
}: Props) => {
  return (
    <div
      className="w-full lg:w-[40%] animate-fade-in-up flex flex-col gap-4"
      style={{ animationDelay: "100ms" }}
    >
      <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 pl-1 border-b border-zinc-200 dark:border-zinc-700 pb-2">
        {format(selectedDate, "M月d日 (E)", { locale: ja })} の履歴
      </h3>

      {/* ローディング中 */}
      {isLogsLoading || isItemsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
      ) : isLogsError || isItemsError ? (
        /* エラー時 */
        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 text-center border border-red-100 dark:border-red-800/30">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-1 flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            データの取得に失敗しました
          </p>
          <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-2">
            {logsError?.message ||
              itemsError?.message ||
              "ページを再読み込みしてお試しください。"}
          </p>
        </div>
      ) : selectedLogs.length > 0 ? (
        /* ログ一覧 */
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-700 overflow-hidden">
          {selectedLogs.map((log) => (
            <LogItem key={log.id} log={log} item={itemMap.get(log.item_id)} />
          ))}
        </div>
      ) : (
        /* 空状態 */
        <div className="bg-white/60 dark:bg-zinc-800/40 rounded-2xl p-8 text-center text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-700">
          <p>この日の履歴はありません。</p>
        </div>
      )}
    </div>
  );
};

export default LogList;
