"use client";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12 text-center">
      <section className="max-w-xl rounded-[1.5rem] border border-white/70 bg-white/[0.68] p-8 shadow-[0_18px_56px_rgba(120,95,130,0.14)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mist">
          Something went wrong
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink">
          Identify could not finish loading.
        </h1>
        <p className="mt-4 text-base leading-7 text-mist/[0.84]">
          Try again, or reconnect Spotify if your session expired.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-mist/[0.62]">Error ID: {error.digest}</p>
        ) : null}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/86 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          <a
            className="rounded-lg border border-ink/10 bg-white/70 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
            href="/"
          >
            Back to login
          </a>
        </div>
      </section>
    </main>
  );
}
