type Props = React.ComponentProps<"button">;

const Button = ({ onClick, children, ...props }: Props) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group relative flex w-full justify-center items-center gap-3 rounded-xl bg-white dark:bg-zinc-700 py-3.5 px-4 text-sm font-bold text-zinc-700 dark:text-zinc-100 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:shadow-md active:scale-[0.98] hover:cursor-pointer"
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
