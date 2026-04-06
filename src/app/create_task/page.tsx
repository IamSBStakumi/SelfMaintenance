"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import useMaintenanceItems from "@/hooks/useMaintenanceItems";

export default function CreateTaskPage() {
  const router = useRouter();
  const { createMaintenanceItem } = useMaintenanceItems();

  // フォーム状態の管理
  const [formData, setFormData] = useState({
    name: "",
    icon: "✨",
    interval_days: 30,
    last_completed_at: format(new Date(), "yyyy-MM-dd"),
    memo: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "interval_days" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // バリデーション
    if (!formData.name.trim()) {
      setErrorMsg("タスク名を入力してください。");
      return;
    }
    if (formData.interval_days <= 0) {
      setErrorMsg("周期には1以上の数値を入力してください。");
      return;
    }

    try {
      await createMaintenanceItem.mutateAsync({
        name: formData.name,
        icon: formData.icon || null,
        interval_days: formData.interval_days,
        last_completed_at: new Date(formData.last_completed_at).toISOString(),
        memo: formData.memo || null,
      });
      // 成功時にダッシュボードへリダイレクト
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to create maintenance item:", err);
      setErrorMsg("登録に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        {/* ヘッダーセクション */}
        <header className="mb-12 flex items-center justify-between mt-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            <span className="font-medium">戻る</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight">
            タスクの新規登録
          </h1>
          <div className="w-16" /> {/* バランス用スペーサー */}
        </header>

        {/* フォームカード */}
        <main
          className={`
            bg-white/70 dark:bg-zinc-800/50 backdrop-blur-xl
            border border-white/20 dark:border-zinc-700/30
            rounded-3xl p-8 shadow-2xl shadow-indigo-500/5
            transition-all duration-500 transform
          `}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* アイコン選択（簡易版）とタスク名 */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/4">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
                  アイコン
                </label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  placeholder="✨"
                  className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-0 rounded-2xl p-4 text-2xl text-center focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden"
                />
              </div>
              <div className="w-full md:w-3/4">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
                  タスク名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="例: コンタクトレンズ交換"
                  required
                  className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-0 rounded-2xl p-4 text-lg font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden"
                />
              </div>
            </div>

            {/* 周期と最終実施日 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
                  実施周期 (日間) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="interval_days"
                  value={formData.interval_days}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-0 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
                  前回の実施日 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="last_completed_at"
                  value={formData.last_completed_at}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-0 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden"
                />
              </div>
            </div>

            {/* メモ */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
                メモ (任意)
              </label>
              <textarea
                name="memo"
                value={formData.memo}
                onChange={handleChange}
                placeholder="備考や注意点など..."
                rows={4}
                className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-0 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden resize-none"
              />
            </div>

            {/* エラーメッセージ */}
            {errorMsg && (
              <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-sm font-medium border border-rose-200 dark:border-rose-800/50 animate-in fade-in slide-in-from-top-1">
                {errorMsg}
              </div>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={createMaintenanceItem.isPending}
              className={`
                w-full py-5 rounded-2xl font-bold text-white text-lg shadow-xl shadow-indigo-500/20
                bg-linear-to-r from-indigo-500 via-indigo-600 to-purple-600
                hover:opacity-90 active:scale-[0.98] transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                flex items-center justify-center gap-3
              `}
            >
              {createMaintenanceItem.isPending ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>登録中...</span>
                </>
              ) : (
                <span>新しいタスクを登録する</span>
              )}
            </button>
          </form>
        </main>

        <footer className="mt-12 text-center text-zinc-400 text-sm">
          <p>登録したタスクはダッシュボードでいつでも確認・編集できます。</p>
        </footer>
      </div>
    </div>
  );
}
