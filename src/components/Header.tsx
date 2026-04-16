"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  const getNavLinkClass = (href: string) =>
    `block px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
      pathname === href
        ? "bg-zinc-800 text-white shadow-md dark:bg-zinc-200 dark:text-zinc-900"
        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
    }`;

  return (
    <header className="max-w-4xl mx-auto mb-8 mt-8 w-full px-4 text-center">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-zinc-800 dark:text-zinc-100">
          Self Maintenance
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mb-6 text-sm md:text-base">
          個人の周期的なタスクを一元管理し、日々のコンディションを最適に保つためのサポートアプリ
        </p>
      </div>

      <nav className="flex justify-center mt-4">
        <ul className="flex bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-full shadow-sm p-1.5 border border-zinc-200 dark:border-zinc-700/50 gap-1">
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
        </ul>
      </nav>
    </header>
  );
};

export default Header;
