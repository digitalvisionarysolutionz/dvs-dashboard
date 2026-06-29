import CommandQuickActions from "./CommandQuickActions.jsx";

function SignalRow({ signal }) {
  const toneClass =
    signal.tone === "danger"
      ? "text-red-200"
      : signal.tone === "warning"
        ? "text-yellow-100"
        : signal.tone === "neutral"
          ? "text-[var(--app-text-muted)]"
          : "text-[var(--app-accent-text)]";

  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-white/10 bg-black/35 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
        {signal.label}
      </span>

      <span className={`text-sm font-black ${toneClass}`}>{signal.value}</span>
    </div>
  );
}

function HeroStat({ stat }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-cyan-300/15 bg-black/35 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--app-text-soft)]">
        {stat.label}
      </p>

      <p className="mt-2 text-2xl font-black leading-none text-white">
        {stat.value}
      </p>

      <p className="mt-1 text-xs font-semibold text-[var(--app-text-muted)]">
        {stat.detail}
      </p>
    </div>
  );
}

export default function CommandCenterHero({
  firstName,
  organizationName,
  statusSentence,
  heroStats = [],
  systemSignals = [],
}) {
  const visibleStats = heroStats.slice(0, 3);
  const visibleSignals = systemSignals.slice(0, 4);

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-xl)] border border-cyan-300/35 bg-[#03070d] shadow-[0_30px_120px_rgba(0,0,0,0.58)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/images/dashboard/dvs-hero.png')] bg-cover bg-center opacity-80"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,4,7,0.96)_0%,rgba(2,4,7,0.82)_34%,rgba(2,4,7,0.48)_64%,rgba(2,4,7,0.2)_100%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(92,244,236,0.22),transparent_30%),radial-gradient(circle_at_86%_72%,rgba(24,200,255,0.16),transparent_30%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(92,244,236,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(92,244,236,0.025)_1px,transparent_1px)] bg-[size:52px_52px] opacity-70"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--app-accent)] to-transparent opacity-80"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-cyan-300/70 via-transparent to-cyan-300/30"
      />

      <div className="relative z-10 grid min-h-[380px] gap-6 p-5 md:p-7 xl:min-h-[420px] xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
        <div className="flex min-h-[310px] flex-col justify-between xl:min-h-[360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[var(--radius-md)] border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-[var(--app-accent)] shadow-[0_0_24px_rgba(92,244,236,0.16)] backdrop-blur">
                DVS Command Center
              </span>

              <span className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.055] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-soft)] backdrop-blur">
                Live Workspace
              </span>
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)] md:text-5xl xl:text-6xl">
              Command center online, {firstName}.
            </h1>

            <p className="mt-4 text-sm font-black uppercase tracking-[0.22em] text-[var(--app-accent-text)]">
              {organizationName}
            </p>

            <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-slate-300 md:text-lg">
              {statusSentence}
            </p>
          </div>

          {visibleStats.length > 0 && (
            <div className="mt-8 grid gap-3 md:grid-cols-3 xl:max-w-3xl">
              {visibleStats.map((stat) => (
                <HeroStat key={stat.label} stat={stat} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-xl)] border border-cyan-300/20 bg-[#02070d]/75 p-4 shadow-[0_0_54px_rgba(92,244,236,0.14)] backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--app-accent)]">
                Signal Stack
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">
                Operational quick read
              </p>
            </div>

            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--app-accent)] shadow-[0_0_18px_rgba(92,244,236,0.9)]" />
          </div>

          {visibleSignals.length > 0 && (
            <div className="space-y-2">
              {visibleSignals.map((signal) => (
                <SignalRow key={signal.id} signal={signal} />
              ))}
            </div>
          )}

          <div className="mt-4 border-t border-white/10 pt-4">
            <CommandQuickActions />
          </div>
        </div>
      </div>
    </section>
  );
}