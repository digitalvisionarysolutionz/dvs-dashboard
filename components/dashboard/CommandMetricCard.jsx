import Link from "next/link";

const toneStyles = {
  default: "border-white/10 bg-white/[0.035]",
  warning:
    "border-yellow-300/25 bg-yellow-300/[0.065] shadow-[0_0_24px_rgba(250,204,21,0.08)]",
};

export default function CommandMetricCard({
  label,
  value,
  hint,
  href,
  tone = "default",
}) {
  const cardClass = `group relative block overflow-hidden rounded-[var(--radius-lg)] border p-4 transition hover:border-[var(--app-border-strong)] hover:bg-black/30 ${
    toneStyles[tone] || toneStyles.default
  }`;

  const content = (
    <>
      <span
        aria-hidden="true"
        className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[var(--app-accent)] opacity-60 shadow-[0_0_14px_rgba(92,244,236,0.8)]"
      />
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--app-text-soft)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-xs font-semibold text-[var(--app-text-muted)]">
        {hint}
      </p>
      <span
        aria-hidden="true"
        className="mt-4 block h-1 rounded-full bg-gradient-to-r from-[var(--app-accent)] via-cyan-200/70 to-transparent opacity-70"
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <article className={cardClass}>{content}</article>;
}
