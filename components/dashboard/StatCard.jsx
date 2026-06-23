export default function StatCard({ label, value, change }) {
  return (
    <article className="border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
      <p className="text-sm font-medium text-[var(--app-text-muted)]">
        {label}
      </p>

      <div className="mt-4 flex items-end justify-between gap-4">
        <h3 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">
          {value}
        </h3>

        <span className="border border-[var(--app-border-strong)] bg-[var(--app-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--app-accent-text)]">
          {change}
        </span>
      </div>
    </article>
  );
}