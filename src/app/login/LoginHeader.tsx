const LoginHeader = () => {
  return (
    <div>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 mb-8">
        <span className="text-3xl" aria-label="Sparkles">
          ✨
        </span>
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight">
        SelfMaintenance
      </h2>
      <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium">
        毎日のメンテナンスをスマートに
      </p>
    </div>
  );
};

export default LoginHeader;
