type FeatureCardProps = {
  eyebrow: string;
  title: string;
  body: string;
};

export function FeatureCard({ eyebrow, title, body }: FeatureCardProps) {
  return (
    <article className="rounded-lg border border-white/70 bg-white/[0.62] p-5 shadow-[0_14px_40px_rgba(120,95,130,0.12)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-mist/[0.68]">{body}</p>
    </article>
  );
}
