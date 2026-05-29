const TaskFormWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100 flex flex-col items-center sm:p-6">
      <div className="max-w-2xl w-full">{children}</div>
    </div>
  );
};

export default TaskFormWrapper;
