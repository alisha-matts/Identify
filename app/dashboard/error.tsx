"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12 text-center">
      <section className="max-w-xl rounded-[1.5rem] border border-white/70 bg-white/[0.68] p-8 shadow-[0_18px_56px_rgba(120,95,130,0.14)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mist">
          Dashboard unavailable
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink">
          Your Spotify identity could not load.
        </h1>
        <p className="mt-4 text-base leading-7 text-mist/[0.84]">
          Retry the dashboard, or sign in again if Spotify needs a fresh session.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/86 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
            onClick={reset}
            type="button"
          >
            Retry dashboard
          </button>
          <a
            className="rounded-lg border border-ink/10 bg-white/70 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
            href="/api/auth/login"
          >
            Sign in again
          </a>
        </div>
      </section>
    </main>
  );
}
