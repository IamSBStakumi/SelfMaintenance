import { useRouter } from "next/navigation";

const DashboardHeader = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-10 mt-6 bg-white/40 dark:bg-zinc-800/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 dark:border-zinc-700/30 gap-4">
      <div className="text-center md:text-left">
        <h2 className="text-xl font-bold tracking-tight">メンテナンス一覧</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          現在のタスク状況をチェックして、自分自身を整えましょう
        </p>
      </div>
      <button
        onClick={() => router.push("/create_task")}
        className="bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold py-3 px-8 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
      >
        <span className="text-2xl leading-none">+</span>
        <span>新規登録する</span>
      </button>
    </div>
  );
};

export default DashboardHeader;
