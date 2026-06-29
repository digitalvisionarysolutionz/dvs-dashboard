import Link from "next/link";
import AccentLine from "../ui/AccentLine.jsx";

export default function DashboardPanel({
  title,
  eyebrow,
  actionHref,
  actionLabel,
  children,
  className = "",
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-gradient-to-br from-white/[0.055] via-white/[0.028] to-cyan-300/[0.025] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/55 to-transparent"
      />

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--app-accent)]">
              {eyebrow}
            </p>
          )}

          <div className="inline-flex flex-col">
            <h3 className="text-lg font-bold tracking-tight text-[var(--app-text)]">
              {title}
            </h3>
            <AccentLine className="mt-1" />
          </div>
        </div>

        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="shrink-0 text-xs font-bold uppercase tracking-widest text-[var(--app-accent-text)] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          >
            {actionLabel}
          </Link>
        )}
      </div>

      {children}
    </section>
  );
}
