"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  const getNavLinkClass = (href: string) =>
    `block whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-semibold transition-all sm:px-6 sm:text-sm ${
      pathname === href
        ? "bg-zinc-800 text-white shadow-md dark:bg-zinc-200 dark:text-zinc-900"
        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
    }`;

  return (
    <header className="max-w-4xl mx-auto mb-6 mt-6 w-full px-4 text-center sm:mb-8 sm:mt-8">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-zinc-800 dark:text-zinc-100">
          メグループ
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mb-6 text-sm md:text-base">
          忘れがちな定期タスクを一元管理し、次にやるタイミングを見逃さないための自己管理アプリ
        </p>
      </div>

      <nav className="mt-4 -mx-4 overflow-x-auto px-4">
        <ul className="mx-auto flex w-max bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-full shadow-sm p-1.5 border border-zinc-200 dark:border-zinc-700/50 gap-1">
          <li>
            <Link
              href="/dashboard"
              className={`${getNavLinkClass("/dashboard")}`}
            >
              ダッシュボード
            </Link>
          </li>
          <li>
            <Link
              href="/calendar"
              className={`${getNavLinkClass("/calendar")}`}
            >
              カレンダー
            </Link>
          </li>
          <li>
            <Link href="/mypage" className={`${getNavLinkClass("/mypage")}`}>
              マイページ
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
