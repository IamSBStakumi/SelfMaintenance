import { useRouter } from "next/navigation";

const TaskFormHeader = ({ headingText }: { headingText: string }) => {
  const router = useRouter();

  return (
    <header className="relative mb-8 flex items-center justify-center mt-4 sm:mb-12 sm:mt-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-0 flex shrink-0 items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors group cursor-pointer sm:gap-2 sm:text-base"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">
          ←
        </span>
        <span className="font-medium">戻る</span>
      </button>
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
        {headingText}
      </h1>
    </header>
  );
};

export default TaskFormHeader;
