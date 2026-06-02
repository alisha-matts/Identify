export default function DashboardLoading() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="glass-panel w-full max-w-lg rounded-[2rem] p-8 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-signal/80">
          Loading
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          Checking Spotify session
        </h1>
      </div>
    </main>
  );
}
