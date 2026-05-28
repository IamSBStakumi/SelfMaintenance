import { useRouter } from "next/navigation";

const DashboardHeader = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-8 mt-4 bg-white/40 dark:bg-zinc-800/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 dark:border-zinc-700/30 gap-4 sm:mb-10 sm:mt-6 sm:p-6">
      <div className="text-center md:text-left">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">
          定期タスク一覧
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          現在のタスク状況をチェックして、次にやるタイミングを逃さないようにしましょう
        </p>
      </div>
      <button
        onClick={() => router.push("/create_task")}
        className="bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold py-3 px-6 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer sm:px-8"
      >
        <span className="text-2xl leading-none">+</span>
        <span>新規登録する</span>
      </button>
    </div>
  );
};

export default DashboardHeader;
