"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Header from "@/components/Header";
import Button from "@/components/ui/Button";
import LoadingOverlay from "@/components/LoadingOverlay";
import MyPageSections from "./MyPageSections";
import useUser from "@/hooks/useUser";

export default function MyPage() {
  const router = useRouter();
  const { user, loading, signOut } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("ログアウトに失敗しました。", error);
      toast.error("ログアウトに失敗しました。");

      return;
    }
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-lavender p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100">
      <Header />

      <main className="max-w-4xl mx-auto space-y-8">
        {loading ? <LoadingOverlay /> : <MyPageSections user={user} />}

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
