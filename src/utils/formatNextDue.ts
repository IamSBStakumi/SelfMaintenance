import { format, isToday, isTomorrow } from "date-fns";

// 次回予定日の表示文字列を生成するヘルパー
export default function formatNextDue(nextDue: Date): string {
  if (isToday(nextDue)) return "今日";
  if (isTomorrow(nextDue)) return "明日";
  return format(nextDue, "yyyy-MM-dd");
}
