const ErrorAlert = () => {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center gap-3"
      role="alert"
      aria-live="assertive"
    >
      <p className="text-zinc-500 dark:text-zinc-400 text-lg">
        データの取得に失敗しました。
      </p>
      <p className="text-zinc-400 dark:text-zinc-500 text-sm">
        ページを再読み込みしてお試しください。
      </p>
    </div>
  );
};

export default ErrorAlert;
