import { User } from "@supabase/supabase-js";

const MyPageSections = ({ user }: { user: User | null | undefined }) => {
  return (
    <>
      <section className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-700/50 sm:p-8">
        <h2 className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 border-l-4 border-soft-pink pl-4 sm:text-2xl">
          プロフィール
        </h2>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
              メールアドレス
            </label>
            <p className="break-words text-base font-semibold text-zinc-800 dark:text-zinc-100 sm:text-lg">
              {user?.email || "未設定"}
            </p>
          </div>
        </div>
      </section>

      {/* <section className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-700/50">
        <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 border-l-4 border-mint pl-4">
          通知設定
        </h2>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">
              プッシュ通知
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              定期タスクの時期を通知します
            </p>
          </div>
          <div className="relative inline-block w-12 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 cursor-pointer transition-colors duration-200 ease-in-out">
            {/* トグルのUI（モック） 
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
        </div>
      </section> */}
    </>
  );
};

export default MyPageSections;
