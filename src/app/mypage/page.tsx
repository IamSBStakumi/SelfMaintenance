"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Header from "@/components/Header";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/supabase";
import { User } from "@supabase/supabase-js";

export default function MyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("ログアウトに失敗しました。", error);
      toast.error("ログアウトに失敗しました。");

      return;
    }
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lavender p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100 italic flex items-center justify-center">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lavender p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100">
      <Header />
      <main className="max-w-4xl mx-auto space-y-8">
        <section className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-700/50">
          <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 border-l-4 border-soft-pink pl-4">
            プロフィール
          </h2>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                メールアドレス
              </label>
              <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                {user?.email || "未設定"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-700/50">
          <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 border-l-4 border-mint pl-4">
            通知設定
          </h2>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                プッシュ通知
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                メンテナンス時期を通知します
              </p>
            </div>
            <div className="relative inline-block w-12 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 cursor-pointer transition-colors duration-200 ease-in-out">
              {/* トグルのUI（モック） */}
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </section>

        <div className="pt-8">
          <Button
            onClick={handleLogout}
            className="bg-red-50! text-red-600! border border-red-100! dark:bg-red-900/20! dark:text-red-400! dark:border-red-900/50! hover:bg-red-100! dark:hover:bg-red-900/30! font-bold py-4"
          >
            ログアウト
          </Button>
        </div>
      </main>
    </div>
  );
}
