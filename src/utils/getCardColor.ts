// interval_days の大きさからカードの背景色を決定するヘルパー
export default function getCardColor(intervalDays: number): string {
  if (intervalDays <= 14) return "bg-soft-pink";
  if (intervalDays <= 90) return "bg-mint";
  return "bg-lavender";
}
