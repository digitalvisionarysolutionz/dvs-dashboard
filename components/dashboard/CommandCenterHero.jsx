import CommandQuickActions from "./CommandQuickActions.jsx";

export default function CommandCenterHero({
  firstName,
  organizationName,
  statusSentence,
}) {
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[#5cf4ec]/30 bg-[#03070d] shadow-[0_18px_56px_rgba(0,0,0,0.38)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/images/dashboard/dvs-hero.png')] bg-cover bg-[center_right] opacity-82"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,4,7,0.95)_0%,rgba(2,4,7,0.72)_35%,rgba(2,4,7,0.3)_64%,rgba(2,4,7,0.1)_100%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_16%,rgba(92,244,236,0.14),transparent_27%),linear-gradient(rgba(92,244,236,0.021)_1px,transparent_1px),linear-gradient(90deg,rgba(92,244,236,0.015)_1px,transparent_1px)] bg-[size:auto,42px_42px,42px_42px]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5cf4ec] to-transparent opacity-75"
      />

      <div className="relative z-10 grid min-h-[258px] gap-4 p-5 md:grid-cols-[minmax(0,1fr)_246px] md:items-center lg:grid-cols-[minmax(0,1fr)_270px] xl:grid-cols-[minmax(0,1fr)_282px] 2xl:min-h-[278px]">
        <div className="max-w-[500px]">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#5cf4ec]">
            DVS Command Center
          </p>

          <span
            aria-hidden="true"
            className="mt-2 block h-[2px] w-36 rounded-full bg-gradient-to-r from-[#5cf4ec] to-transparent shadow-[0_0_16px_rgba(92,244,236,0.45)]"
          />

          <h1 className="mt-5 max-w-[470px] text-[34px] font-black leading-[0.96] tracking-tight text-white md:text-[36px] lg:text-[40px] xl:text-[42px]">
            Welcome back, {firstName}.
          </h1>

          <p className="mt-3 text-[11px] font-black uppercase tracking-[0.24em] text-[#bffffb]">
            {organizationName}
          </p>

          <p className="mt-3 max-w-[410px] text-[13px] font-semibold leading-5 text-slate-300">
            {statusSentence}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-[var(--app-text-muted)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#5cf4ec] shadow-[0_0_14px_rgba(92,244,236,0.75)]" />
              All systems operational
            </span>

            <span className="hidden h-4 w-px bg-white/15 sm:block" />

            <span className="inline-flex items-center gap-2">
              <span className="text-[#5cf4ec]">↻</span>
              Updated just now
            </span>
          </div>
        </div>

        <div className="md:flex md:justify-end">
          <div className="w-full rounded-[22px] border border-white/10 bg-[#071017]/86 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.34),0_0_22px_rgba(92,244,236,0.08)] backdrop-blur-xl md:max-w-[246px] lg:max-w-[270px] xl:max-w-[282px]">
            <div className="mb-3">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#5cf4ec]">
                Quick Actions
              </p>
            </div>

            <CommandQuickActions />
          </div>
        </div>
      </div>
    </section>
  );
}