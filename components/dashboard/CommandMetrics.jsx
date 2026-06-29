import CommandMetricCard from "./CommandMetricCard.jsx";

export default function CommandMetrics({ metrics = [], primaryMetric }) {
  if (metrics.length === 0 && !primaryMetric) {
    return null;
  }

  const [primaryFallback, ...secondaryFallback] = metrics;
  const featured = primaryMetric || primaryFallback;
  const secondaryMetrics = primaryMetric ? metrics : secondaryFallback;

  return (
    <section className="grid gap-3 xl:grid-cols-[1.15fr_2fr]">
      {featured && (
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-cyan-300/30 bg-[#050b12] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(92,244,236,0.18),transparent_42%)]"
          />
          <div className="relative">
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[var(--app-accent)]">
              {featured.label}
            </p>
            <p className="mt-4 text-5xl font-black tracking-tight text-white">
              {featured.value}
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--app-text-muted)]">
              {featured.hint}
            </p>

            {featured.supportingLabel && (
              <div className="mt-5 rounded-[var(--radius-lg)] border border-white/10 bg-black/25 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                  {featured.supportingLabel}
                </p>
                <p className="mt-1 text-2xl font-black text-[var(--app-accent-text)]">
                  {featured.supportingValue}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {secondaryMetrics.map((metric) => (
          <CommandMetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            href={metric.href}
            tone={metric.tone}
          />
        ))}
      </div>
    </section>
  );
}
