"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // クライアントマウント直後の描画を待ってからアニメーションを開始し、カスケードレンダリングを防ぐ
    const mountTimer = setTimeout(() => {
      setMounted(true);
    }, 50);

    // 一定時間経過後にログイン画面へ自動遷移
    const redirectTimer = setTimeout(() => {
      router.replace("/login");
    }, 2500); // 2.5秒後に遷移

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  // タップ/クリックですぐに遷移させるハンドラー
  const handleSkip = () => {
    router.replace("/login");
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 font-sans overflow-hidden cursor-pointer select-none"
      onClick={handleSkip}
      title="クリックしてスキップ"
    >
      <div
        className={`flex flex-col items-center transition-all duration-1000 ease-out transform ${
          mounted
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* アプリロゴの代替モック */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/20">
          <span className="text-5xl" aria-label="Sparkles">
            ✨
          </span>
        </div>

        {/* アプリタイトル */}
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          SelfMaintenance
        </h1>

        {/* サブタイトル */}
        <p className="mt-3 text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
          あなたの快適な日々をサポート
        </p>

        {/* ローディングインジケーター（オプショナル） */}
        <div className="mt-12 flex space-x-2">
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-500/80 [animation-delay:-0.3s]"></div>
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-500/80 [animation-delay:-0.15s]"></div>
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-500/80"></div>
        </div>
      </div>
    </div>
  );
}
