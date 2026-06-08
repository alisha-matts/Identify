import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/55 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link className="flex items-center gap-3" href="/">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-lg bg-white text-2xl"
          >
            {"\u{1F481}\u200D\u2640\uFE0F"}
          </span>
          <span className="text-lg font-semibold tracking-normal text-ink">
            Identify
          </span>
        </Link>
      </div>
    </header>
  );
}
