"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

export const taskSchema = z.object({
  name: z.string().trim().min(1, "タスク名を入力してください。"),
  icon: z.string().max(2, "アイコンは2文字以内で入力してください。").optional(),
  interval_days: z
    .number({ error: "周期には数値を入力してください。" })
    .int("周期には整数を入力してください。")
    .min(1, "周期には1以上の数値を入力してください。"),
  last_completed_at: z.string().min(1, "前回の実施日を入力してください。"),
  memo: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  defaultValues: TaskFormValues;
  onSubmit: (data: TaskFormValues) => Promise<void>;
  submitButtonText?: string;
}

export default function TaskForm({
  defaultValues,
  onSubmit,
  submitButtonText = "保存する",
}: TaskFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: TaskFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      console.error(err);
      setSubmitError("処理に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* アイコン選択（簡易版）とタスク名 */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
            アイコン
          </label>
          <input
            type="text"
            placeholder="✨"
            maxLength={2}
            {...register("icon")}
            className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-0 rounded-2xl p-4 text-2xl text-center focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden"
          />
          {errors.icon && (
            <p className="text-rose-500 text-xs mt-1 ml-1">
              {errors.icon.message}
            </p>
          )}
        </div>
        <div className="w-full md:w-3/4">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
            タスク名 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="例: コンタクトレンズ交換"
            {...register("name")}
            className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-0 rounded-2xl p-4 text-lg font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden"
          />
          {errors.name && (
            <p className="text-rose-500 text-xs mt-1 ml-1">
              {errors.name.message}
            </p>
          )}
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
            min="1"
            {...register("interval_days", { valueAsNumber: true })}
            className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-0 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden"
          />
          {errors.interval_days && (
            <p className="text-rose-500 text-xs mt-1 ml-1">
              {errors.interval_days.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
            前回の実施日 <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            {...register("last_completed_at")}
            className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-0 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden"
          />
          {errors.last_completed_at && (
            <p className="text-rose-500 text-xs mt-1 ml-1">
              {errors.last_completed_at.message}
            </p>
          )}
        </div>
      </div>

      {/* メモ */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
          メモ (任意)
        </label>
        <textarea
          placeholder="備考や注意点など..."
          rows={4}
          {...register("memo")}
          className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-0 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-hidden resize-none"
        />
        {errors.memo && (
          <p className="text-rose-500 text-xs mt-1 ml-1">
            {errors.memo.message}
          </p>
        )}
      </div>

      {/* エラーメッセージ（送信時のシステムエラー） */}
      {submitError && (
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-sm font-medium border border-rose-200 dark:border-rose-800/50 animate-in fade-in slide-in-from-top-1">
          {submitError}
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full py-5 rounded-2xl font-bold text-white text-lg shadow-xl shadow-indigo-500/20
          bg-linear-to-r from-indigo-500 via-indigo-600 to-purple-600
          hover:opacity-90 active:scale-[0.98] transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          flex items-center justify-center gap-3
        `}
      >
        {isSubmitting ? (
          <>
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>処理中...</span>
          </>
        ) : (
          <span>{submitButtonText}</span>
        )}
      </button>
    </form>
  );
}
