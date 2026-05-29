const TaskFormCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <main
      className={`
          bg-white/70 dark:bg-zinc-800/50 backdrop-blur-xl
          border border-white/20 dark:border-zinc-700/30
          rounded-3xl p-5 shadow-2xl shadow-indigo-500/5 sm:p-8
          transition-all duration-500 transform
        `}
    >
      {children}
    </main>
  );
};

export default TaskFormCard;
