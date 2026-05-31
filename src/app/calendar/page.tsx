"use client";

import { useState, useMemo } from "react";
import Calendar from "@/components/Calendar";
import Header from "@/components/Header";
import { startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { useMaintenanceLogs } from "@/hooks/useMaintenanceLogs";
import useMaintenanceItems from "@/hooks/useMaintenanceItems";
import CalendarHeader from "./CalendarHeader";
import LogList from "./LogList";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const startDateStr = startOfMonth(currentDate).toISOString();
  const endDateStr = endOfMonth(currentDate).toISOString();

  const {
    data: logs = [],
    isLoading: isLogsLoading,
    isError: isLogsError,
    error: logsError,
  } = useMaintenanceLogs(startDateStr, endDateStr);
  const { fetchMaintenanceItems } = useMaintenanceItems();
  const items = useMemo(
    () => fetchMaintenanceItems.data || [],
    [fetchMaintenanceItems.data],
  );

  const selectedLogs = logs.filter((log) =>
    isSameDay(new Date(log.completed_at), selectedDate),
  );

  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  return (
    <div className="min-h-screen bg-lavender px-4 py-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100 sm:p-6">
      <Header />
      <main className="max-w-5xl mx-auto pb-20">
        <CalendarHeader />

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-[60%] shrink-0">
            <Calendar
              logs={logs}
              onDayClick={setSelectedDate}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
            />
          </div>

          <LogList
            selectedDate={selectedDate}
            selectedLogs={selectedLogs}
            itemMap={itemMap}
            isLogsLoading={isLogsLoading}
            isItemsLoading={fetchMaintenanceItems.isLoading}
            isLogsError={isLogsError}
            isItemsError={fetchMaintenanceItems.isError}
            logsError={logsError}
            itemsError={fetchMaintenanceItems.error}
          />
        </div>
      </main>
    </div>
  );
}
