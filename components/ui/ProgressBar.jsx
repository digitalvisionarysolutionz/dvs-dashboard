export default function ProgressBar({ value = 0, showLabel = true }) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-[3px] flex-1 bg-white/10"
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="h-full bg-[var(--app-accent)] shadow-[0_0_16px_rgba(92,244,236,0.7)]"
          style={{ width: `${safeValue}%` }}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-bold text-[var(--app-text-muted)]">
          {safeValue}%
        </span>
      )}
    </div>
  );
}