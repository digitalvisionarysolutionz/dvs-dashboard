import AccentLine from "./AccentLine.jsx";

export default function Panel({ title, eyebrow, action, children }) {
  return (
    <section className="border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
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

        {action && (
          <button
            type="button"
            className="text-xs font-bold uppercase tracking-widest text-[var(--app-accent-text)] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          >
            {action}
          </button>
        )}
      </div>

      {children}
    </section>
  );
}