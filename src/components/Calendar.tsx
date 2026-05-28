"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";

interface CalendarProps {
  logs: { id: string; completed_at: string; item_id: string }[];
  onDayClick: (date: Date) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export default function Calendar({
  logs,
  onDayClick,
  currentDate,
  setCurrentDate,
}: CalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "yyyy年 M月";

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const daysInCalendar = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm p-3 sm:p-6 border border-zinc-100 flex flex-col animate-fade-in-up">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors active:scale-95 cursor-pointer"
          aria-label="前の月"
        >
          <svg
            className="w-5 h-5 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-base font-bold text-zinc-800 tracking-wide sm:text-lg">
          {format(currentDate, dateFormat, { locale: ja })}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors active:scale-95 cursor-pointer"
          aria-label="次の月"
        >
          <svg
            className="w-5 h-5 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-zinc-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
        {daysInCalendar.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDay = isToday(day);

          const dayLogs = logs.filter((log) =>
            isSameDay(new Date(log.completed_at), day),
          );

          return (
            <button
              key={day.toString() + idx}
              onClick={() => isCurrentMonth && onDayClick(day)}
              disabled={!isCurrentMonth}
              className={`
                aspect-square flex flex-col items-center justify-center relative cursor-pointer
                rounded-lg transition-all text-xs outline-none focus:ring-2 focus:ring-indigo-500 sm:rounded-xl sm:text-base
                ${!isCurrentMonth ? "text-zinc-300 opacity-50" : "text-zinc-700 hover:bg-indigo-50 active:scale-95"}
                ${isTodayDay ? "font-bold text-indigo-700 bg-indigo-50 ring-1 ring-indigo-200" : ""}
                ${dayLogs.length > 0 ? "font-medium" : ""}
              `}
            >
              <span className="z-10">{format(day, "d")}</span>

              {dayLogs.length > 0 && (
                <div className="absolute bottom-1 sm:bottom-2 flex gap-0.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                  {dayLogs.length > 1 && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-200"></div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
