/**
 * カレンダーページのヘッダーコンポーネント
 * タイトルと説明文を表示します。
 */
const CalendarHeader = () => {
  return (
    <div className="mb-10 text-center md:text-left bg-white/40 dark:bg-zinc-800/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 dark:border-zinc-700/30">
      <h2 className="text-xl font-bold tracking-tight mb-2">履歴カレンダー</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        メンテナンスタスクの完了履歴を振り返りましょう。
      </p>
    </div>
  );
};

export default CalendarHeader;
