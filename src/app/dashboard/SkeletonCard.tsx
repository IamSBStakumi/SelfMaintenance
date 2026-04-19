// ローディング中のスケルトン表示
const SkeletonCard = () => {
  return (
    <div className="rounded-3xl p-6 bg-zinc-100 dark:bg-zinc-800 animate-pulse flex flex-col gap-4 h-52">
      <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
      <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
      <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
      <div className="mt-auto h-10 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full" />
    </div>
  );
};

export default SkeletonCard;
