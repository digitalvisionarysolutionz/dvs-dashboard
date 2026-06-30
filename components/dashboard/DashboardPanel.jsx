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
      className={`relative overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-br from-white/[0.045] via-white/[0.022] to-[#5cf4ec]/[0.018] p-4 shadow-[0_16px_46px_rgba(0,0,0,0.24)] ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5cf4ec]/45 to-transparent"
      />

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="truncate text-[9px] font-black uppercase tracking-[0.28em] text-[#5cf4ec]">
              {eyebrow}
            </p>
          )}

          <div className="inline-flex min-w-0 flex-col">
            <h3 className="truncate text-[15px] font-black tracking-tight text-white">
              {title}
            </h3>
            <AccentLine className="mt-1" />
          </div>
        </div>

        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:text-[#5cf4ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
          >
            {actionLabel}
          </Link>
        )}
      </div>

      {children}
    </section>
  );
}