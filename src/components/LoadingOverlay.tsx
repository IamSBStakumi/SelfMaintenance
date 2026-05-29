const LoadingOverlay = () => {
  return (
    <div
      className="min-h-screen bg-lavender p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100 italic flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      読み込み中...
    </div>
  );
};

export default LoadingOverlay;
