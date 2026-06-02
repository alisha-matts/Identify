export default function DashboardLoading() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="h-20 rounded-lg border border-white/10 bg-white/[0.04]" />
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="h-4 w-48 rounded-full bg-white/10" />
          <div className="mt-5 h-12 max-w-2xl rounded-lg bg-white/10" />
          <div className="mt-4 h-6 max-w-xl rounded-lg bg-white/10" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="h-20 rounded-lg bg-white/[0.06]" key={index} />
            ))}
          </div>
          <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="h-20 rounded-lg bg-white/[0.06]" key={index} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
