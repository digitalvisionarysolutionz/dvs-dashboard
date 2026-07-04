function normalizeStatus(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/-/g, " ");
}

function getToneFromStatus(status, fallbackTone = "accent") {
  const normalized = normalizeStatus(status);

  if (
    normalized.includes("complete") ||
    normalized.includes("delivered") ||
    normalized.includes("done") ||
    normalized.includes("on track") ||
    normalized.includes("active")
  ) {
    return "success";
  }

  if (
    normalized.includes("progress") ||
    normalized.includes("contacted") ||
    normalized.includes("new lead") ||
    normalized.includes("open")
  ) {
    return "accent";
  }

  if (
    normalized.includes("waiting") ||
    normalized.includes("follow") ||
    normalized.includes("due") ||
    normalized.includes("review")
  ) {
    return "warning";
  }

  if (
    normalized.includes("high") ||
    normalized.includes("urgent") ||
    normalized.includes("danger") ||
    normalized.includes("overdue")
  ) {
    return "danger";
  }

  if (
    normalized.includes("planning") ||
    normalized.includes("not started") ||
    normalized.includes("archive") ||
    normalized.includes("archived") ||
    normalized.includes("inactive")
  ) {
    return "neutral";
  }

  return fallbackTone;
}

export default function StatusBadge({
  children,
  tone,
  className = "",
  showDot = false,
}) {
  const resolvedTone = tone || getToneFromStatus(children);

  const tones = {
    accent:
      "border-[#2f86ff]/45 bg-[#12346f]/48 text-[#9cc9ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(47,134,255,0.12)]",
    success:
      "border-emerald-300/35 bg-emerald-400/15 text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(52,211,153,0.12)]",
    warning:
      "border-amber-300/35 bg-amber-300/14 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(251,191,36,0.12)]",
    danger:
      "border-red-300/35 bg-red-400/14 text-red-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(248,113,113,0.12)]",
    neutral:
      "border-white/12 bg-white/[0.06] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  };

  const dots = {
    accent: "bg-[#5cf4ec]",
    success: "bg-emerald-300",
    warning: "bg-amber-200",
    danger: "bg-red-300",
    neutral: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border px-2.5 py-1 text-[9px] font-black leading-none tracking-[0.08em] backdrop-blur-md ${
        tones[resolvedTone] || tones.accent
      } ${className}`}
    >
      {showDot && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${
            dots[resolvedTone] || dots.accent
          }`}
        />
      )}

      {children}
    </span>
  );
}