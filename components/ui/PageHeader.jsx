export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}) {
  return (
    <header className="mb-6 rounded-[var(--radius-xl)] border border-transparent bg-gradient-to-br from-white/[0.035] via-transparent to-cyan-300/[0.035] px-1 py-2">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-5 inline-flex flex-col">
              <p className="text-sm font-black uppercase tracking-[0.38em] text-[var(--app-accent)]">
                {eyebrow}
              </p>

              <span className="mt-3 h-[2px] w-full min-w-[140px] rounded-full bg-gradient-to-r from-transparent via-[var(--app-accent)] to-transparent shadow-[0_0_18px_rgba(92,244,236,0.85),0_0_44px_rgba(92,244,236,0.28)]" />
            </div>
          )}

          <h1 className="text-4xl font-black tracking-tight text-[var(--app-text)] md:text-5xl xl:text-6xl">
            {title}
          </h1>

          {description && (
            <p className="mt-5 max-w-5xl text-lg leading-8 text-[var(--app-text-muted)]">
              {description}
            </p>
          )}

          {children}
        </div>

        {actions && (
          <div className="flex flex-row flex-nowrap items-center justify-end gap-3 xl:min-w-[340px] xl:pt-24">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}