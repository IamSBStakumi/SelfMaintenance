"use client";

import DashboardHeader from "./DashboardHeader";
import PageContent from "./PageContent";

import Header from "@/components/Header";
import useMaintenanceItems from "@/hooks/useMaintenanceItems";

export default function DashboardPage() {
  const { fetchMaintenanceItems } = useMaintenanceItems();
  const { data: items, isPending, isError } = fetchMaintenanceItems;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100">
      <Header />
      <main className="max-w-5xl mx-auto pb-20">
        <DashboardHeader />
        <PageContent />
      </main>
    </div>
  );
}
