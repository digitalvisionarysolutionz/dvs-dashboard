"use client";

import Button from "./Button.jsx";

export default function DashboardModal({
  open,
  eyebrow,
  title,
  description,
  maxWidth = "max-w-3xl",
  children,
  footer,
  onClose,
  closeLabel = "Close modal",
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <section
        className={`relative z-10 flex max-h-[82vh] w-full ${maxWidth} flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--app-border-strong)] bg-[#071018] shadow-[0_30px_100px_rgba(0,0,0,0.75)]`}
      >
        <div className="shrink-0 border-b border-[var(--app-border)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              {eyebrow && (
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--app-accent)]">
                  {eyebrow}
                </p>
              )}

              {title && (
                <h2 className="mt-2 text-2xl font-black text-white">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {description}
                </p>
              )}
            </div>

            <Button type="button" variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-[var(--app-border)] bg-[#071018]/95 p-5 backdrop-blur">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              {footer}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}