export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading dashboard"
      className="min-h-screen px-5 py-8 sm:px-8 lg:px-10"
    >
      <div className="mx-auto flex w-full max-w-7xl animate-pulse flex-col gap-8">
        <div className="h-20 rounded-lg border border-white/70 bg-white/55" />
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="h-4 w-48 rounded-full bg-ink/10" />
          <div className="mt-5 h-12 max-w-2xl rounded-lg bg-ink/10" />
          <div className="mt-4 h-6 max-w-xl rounded-lg bg-ink/10" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="h-96 rounded-[1.25rem] border border-white/70 bg-white/55" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="h-36 rounded-lg bg-white/55" key={index} />
            ))}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-3 rounded-[1.25rem] border border-white/70 bg-white/55 p-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="h-20 rounded-lg bg-ink/10" key={index} />
            ))}
          </div>
          <div className="space-y-3 rounded-[1.25rem] border border-white/70 bg-white/55 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="h-20 rounded-lg bg-ink/10" key={index} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
