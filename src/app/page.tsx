import Header from "@/components/Header";

import mockTasks from "../../mocks/mockTasks";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100">
      <Header />
      <main className="max-w-5xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-3xl p-6 shadow-soft transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex flex-col justify-between ${task.color} text-zinc-800`}
            >
              <div>
                <h2 className="text-xl font-bold mb-3 leading-tight">
                  {task.name}
                </h2>
                <div className="text-sm opacity-80 mb-6 space-y-1 font-medium">
                  <p className="flex items-center">
                    <span className="w-16">周期:</span>
                    <span>{task.interval}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="w-16">前回:</span>
                    <span>{task.lastCompleted}</span>
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-black/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
                    次回予定
                  </p>
                  <p
                    className={`font-bold text-lg ${task.status === "overdue" ? "text-red-600" : ""}`}
                  >
                    {task.nextDue}
                  </p>
                </div>
                <button className="bg-white/90 hover:bg-white text-zinc-800 font-bold py-2.5 px-5 rounded-full shadow-sm transition-colors text-sm hover:shadow-md">
                  完了
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
