export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const baseClass =
    "inline-flex shrink-0 touch-manipulation items-center justify-center gap-2 rounded-[var(--radius-md)] border font-black transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020407] disabled:cursor-not-allowed disabled:opacity-45";

  const sizes = {
    xs: "min-h-8 px-2.5 py-1.5 text-[11px]",
    sm: "min-h-9 px-3 py-2 text-xs",
    md: "min-h-10 px-4 py-2.5 text-sm",
    lg: "min-h-11 px-5 py-3 text-sm",
  };

  const variants = {
    primary:
      "border-[#5cf4ec]/45 bg-[#5cf4ec] text-[#031012] shadow-[0_0_26px_rgba(92,244,236,0.22)] hover:border-[#5cf4ec] hover:brightness-110 active:translate-y-px",
    secondary:
      "border-white/10 bg-[#071018] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] hover:border-[#5cf4ec]/35 hover:bg-[#0a141d] hover:text-white active:translate-y-px",
    ghost:
      "border-transparent bg-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.055] hover:text-white active:translate-y-px",
    danger:
      "border-red-300/30 bg-red-400/10 text-red-200 hover:border-red-300/50 hover:bg-red-400/15 active:translate-y-px",
    success:
      "border-emerald-300/30 bg-emerald-400/10 text-emerald-200 hover:border-emerald-300/50 hover:bg-emerald-400/15 active:translate-y-px",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClass} ${sizes[size] || sizes.md} ${
        variants[variant] || variants.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}