export default function CompactActionButton({
  children,
  type = "button",
  variant = "secondary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
  ...props
}) {
  const baseClasses =
    "inline-flex shrink-0 touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border font-black transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020407] disabled:cursor-not-allowed disabled:opacity-45";

  const sizes = {
    sm: "min-h-9 px-3 py-2 text-xs",
    md: "min-h-10 px-4 py-2.5 text-sm",
  };

  const variants = {
    primary:
      "border-[#5cf4ec]/45 bg-[#5cf4ec] text-[#031012] shadow-[0_0_24px_rgba(92,244,236,0.2)] hover:brightness-110 active:translate-y-px",
    secondary:
      "border-white/10 bg-[#071018] text-slate-200 hover:border-[#5cf4ec]/35 hover:bg-[#0a141d] hover:text-white active:translate-y-px",
    ghost:
      "border-transparent bg-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.055] hover:text-white active:translate-y-px",
    danger:
      "border-red-400/25 bg-red-400/10 text-red-100 hover:border-red-300/50 hover:bg-red-400/15 active:translate-y-px",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizes[size] || sizes.md} ${
        variants[variant] || variants.secondary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}