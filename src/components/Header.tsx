const Header = () => {
  return (
    <header className="max-w-4xl mx-auto mb-12 flex flex-col items-center text-center mt-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-zinc-800 dark:text-zinc-100">
        Self Maintenance
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-xl">
        個人の周期的なタスクを一元管理し、日々のコンディションを最適に保つためのサポートアプリ
      </p>
    </header>
  );
};

export default Header;
