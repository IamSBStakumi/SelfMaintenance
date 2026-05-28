import type { Metadata } from "next";

export const metadata: Metadata = {
  applicationName: "メグループ",
  title: {
    default: "メグループ | 定期タスクを忘れない自己管理アプリ",
    template: "%s | メグループ",
  },
  description:
    "メグループは、コンタクトレンズ交換や美容室予約、通院、掃除などの繰り返しタスクを管理し、次にやるタイミングを忘れずに続けるための自己管理アプリです。",
  keywords: [
    "メグループ",
    "定期タスク",
    "繰り返しタスク",
    "タスク管理",
    "自己管理",
    "リマインダー",
    "ルーティン管理",
    "習慣管理",
    "スケジュール管理",
    "やることリスト",
    "コンタクトレンズ交換",
    "美容室予約",
    "通院管理",
    "定期健診",
    "掃除管理",
    "歯ブラシ交換",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "メグループ",
    title: "メグループ | 定期タスクを忘れない自己管理アプリ",
    description:
      "コンタクトレンズ交換、美容室予約、通院、掃除などの繰り返しタスクを管理し、次にやるタイミングを忘れずに続けられます。",
  },
  twitter: {
    card: "summary",
    title: "メグループ | 定期タスクを忘れない自己管理アプリ",
    description:
      "忘れがちな定期タスクを一元管理し、次にやるタイミングを見逃さないための自己管理アプリです。",
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "productivity",
};
