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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-black/82 backdrop-blur-sm"
        onClick={onClose}
      />

      <section
        className={`relative z-10 flex max-h-[88vh] w-full ${maxWidth} flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[#5cf4ec]/24 bg-[#071018] shadow-[0_30px_100px_rgba(0,0,0,0.78),0_0_36px_rgba(92,244,236,0.08)]`}
      >
        <div className="shrink-0 border-b border-white/10 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#5cf4ec]">
                  {eyebrow}
                </p>
              )}

              {title && (
                <h2 className="mt-2 text-[24px] font-black leading-[1.02] tracking-tight text-white sm:text-[26px]">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-2.5 max-w-2xl text-[13px] font-semibold leading-5 text-slate-400 sm:text-sm">
                  {description}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 px-0 text-lg"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-white/10 bg-[#071018]/96 px-4 py-3.5 backdrop-blur sm:px-5 sm:py-4">
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
              {footer}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}