export default function ProgressBar({
  value = 0,
  showLabel = false,
  size = "default",
  className = "",
  barClassName = "",
  labelClassName = "",
}) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  const sizes = {
    compact: "h-[5px]",
    default: "h-1.5",
    thick: "h-2",
  };

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <div
        className={`min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.085] ${
          sizes[size] || sizes.default
        } ${barClassName}`}
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Progress ${safeValue}%`}
      >
        <div
          className="h-full rounded-full bg-[#5cf4ec] shadow-[0_0_14px_rgba(92,244,236,0.58)]"
          style={{ width: `${safeValue}%` }}
        />
      </div>

      {showLabel && (
        <span
          className={`w-9 shrink-0 text-right text-[10px] font-black text-slate-300 ${labelClassName}`}
        >
          {safeValue}%
        </span>
      )}
    </div>
  );
}