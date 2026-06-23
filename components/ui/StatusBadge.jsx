export default function StatusBadge({ children, tone = "accent" }) {
  const tones = {
    accent:
      "border-[var(--app-border-strong)] bg-[var(--app-accent-soft)] text-[var(--app-accent-text)]",
    success:
      "border-green-300/30 bg-green-400/10 text-green-200",
    warning:
      "border-yellow-300/30 bg-yellow-300/10 text-yellow-100",
    danger:
      "border-red-300/30 bg-red-400/10 text-red-200",
    neutral:
      "border-white/10 bg-white/[0.04] text-[var(--app-text-muted)]",
  };

  return (
    <span
      className={`border px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
        tones[tone] || tones.accent
      }`}
    >
      {children}
    </span>
  );
}