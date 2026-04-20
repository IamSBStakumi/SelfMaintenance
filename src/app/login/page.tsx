"use client";

import Link from "next/link";
import { toast } from "react-toastify";
import { createClient } from "@/lib/supabase/supabase";
import Button from "@/components/ui/Button";
import GoogleIcon from "@/components/icons/GoogleIcon";
import LoginHeader from "./LoginHeader";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error("Error signing in with Google:", error);
        toast.error("Google認証に失敗しました");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("予期せぬエラーが発生しました");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-800 p-8 sm:p-10 rounded-4xl shadow-xl shadow-black/5 ring-1 ring-zinc-900/5 dark:ring-zinc-100/10">
        <LoginHeader />

        {/* Google認証ボタン部分 */}
        <div className="mt-10">
          <Button onClick={handleGoogleLogin}>
            <GoogleIcon />
            Googleでログイン
          </Button>
        </div>

        {/* 補足等のテキストエリア */}
        <div className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <p>ログインまたは登録することで、</p>
          <p className="mt-1">
            <Link
              href="#"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              利用規約
            </Link>
            と
            <Link
              href="#"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              プライバシーポリシー
            </Link>
            に同意したものとみなされます。
          </p>
        </div>
      </div>
    </div>
  );
}
