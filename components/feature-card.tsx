type FeatureCardProps = {
  eyebrow: string;
  title: string;
  body: string;
};

export function FeatureCard({ eyebrow, title, body }: FeatureCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-acid/80">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-mist/[0.68]">{body}</p>
    </article>
  );
}
