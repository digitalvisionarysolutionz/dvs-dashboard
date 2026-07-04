export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}) {
  return (
    <header className="mb-4 rounded-[var(--radius-xl)] border border-white/[0.06] bg-gradient-to-br from-white/[0.035] via-transparent to-[#5cf4ec]/[0.025] px-4 py-4 shadow-[0_18px_54px_rgba(0,0,0,0.18)] md:px-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-3 inline-flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#5cf4ec]">
                {eyebrow}
              </p>

              <span className="mt-2 h-[2px] w-full min-w-[120px] rounded-full bg-gradient-to-r from-[#5cf4ec] to-transparent shadow-[0_0_18px_rgba(92,244,236,0.55)]" />
            </div>
          )}

          <h1 className="text-[30px] font-black leading-none tracking-tight text-white md:text-[34px] xl:text-[38px]">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-4xl text-[13px] font-semibold leading-6 text-slate-400 md:text-sm">
              {description}
            </p>
          )}

          {children}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 xl:justify-end xl:pt-1">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}