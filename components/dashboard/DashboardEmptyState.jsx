export default function DashboardEmptyState({ title, description, className = "" }) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-dashed border-white/10 bg-white/[0.025] px-4 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] ${className}`}
    >
      <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[#5cf4ec]/20 bg-[#5cf4ec]/[0.055] text-[#5cf4ec] shadow-[0_0_18px_rgba(92,244,236,0.12)]">
        <span className="h-2 w-2 rounded-full bg-[#5cf4ec] shadow-[0_0_14px_rgba(92,244,236,0.75)]" />
      </div>

      <p className="text-sm font-black text-white">{title}</p>

      {description && (
        <p className="mx-auto mt-2 max-w-md text-xs font-semibold leading-5 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}