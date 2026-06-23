export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const baseClass =
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border px-4 py-2.5 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] disabled:cursor-not-allowed disabled:opacity-45";

  const variants = {
    primary:
      "border-cyan-300/40 bg-[var(--app-accent)] text-[#031012] shadow-[0_0_28px_rgba(92,244,236,0.25)] hover:-translate-y-0.5 hover:bg-cyan-200",
    secondary:
      "border-white/10 bg-white/[0.045] text-slate-200 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-white/[0.075] hover:text-white",
    ghost:
      "border-transparent bg-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white",
    danger:
      "border-red-300/30 bg-red-400/10 text-red-200 hover:bg-red-400/15",
    success:
      "border-green-300/30 bg-green-400/10 text-green-200 hover:bg-green-400/15",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClass} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}