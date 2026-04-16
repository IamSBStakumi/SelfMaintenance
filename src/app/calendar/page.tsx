"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar/Calendar";
import Header from "@/components/Header";
import { startOfMonth, endOfMonth, isSameDay, format } from "date-fns";
import { ja } from "date-fns/locale";
import { useMaintenanceLogs } from "@/hooks/useMaintenanceLogs";
import useMaintenanceItems from "@/hooks/useMaintenanceItems";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const startDateStr = startOfMonth(currentDate).toISOString();
  const endDateStr = endOfMonth(currentDate).toISOString();

  const { data: logs = [], isLoading: isLogsLoading } = useMaintenanceLogs(
    startDateStr,
    endDateStr,
  );
  const { fetchMaintenanceItems } = useMaintenanceItems();
  const items = fetchMaintenanceItems.data || [];

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedLogs = selectedDate
    ? logs.filter((log) => isSameDay(new Date(log.completed_at), selectedDate))
    : [];

  return (
    <div className="min-h-screen bg-lavender p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100">
      <Header />
      <main className="max-w-5xl mx-auto pb-20">
        <div className="mb-10 text-center md:text-left bg-white/40 dark:bg-zinc-800/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 dark:border-zinc-700/30">
          <h2 className="text-xl font-bold tracking-tight mb-2">
            履歴カレンダー
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            メンテナンスタスクの完了履歴を振り返りましょう。
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[60%] shrink-0 animate-fade-in-up">
            <Calendar
              logs={logs}
              onDayClick={handleDayClick}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
            />
          </div>

          <div
            className="w-full lg:w-[40%] animate-fade-in-up flex flex-col gap-4"
            style={{ animationDelay: "100ms" }}
          >
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 pl-1 border-b border-zinc-200 dark:border-zinc-700 pb-2">
              {format(selectedDate, "M月d日 (E)", { locale: ja })} の履歴
            </h3>

            {isLogsLoading || fetchMaintenanceItems.isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
              </div>
            ) : selectedLogs.length > 0 ? (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-700 overflow-hidden">
                {selectedLogs.map((log) => {
                  const item = items.find((i) => i.id === log.item_id);
                  return (
                    <div
                      key={log.id}
                      className="p-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors group"
                    >
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
                })}
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-zinc-800/40 rounded-2xl p-8 text-center text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-700">
                <p>この日の履歴はありません。</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
