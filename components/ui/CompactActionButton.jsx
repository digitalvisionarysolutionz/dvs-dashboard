export default function CompactActionButton({
  children,
  type = "button",
  variant = "secondary",
  onClick,
  className = "",
  ...props
}) {
  const baseClasses =
    "h-10 w-fit whitespace-nowrap rounded-[var(--radius-md)] px-4 text-sm font-black transition";

  const variants = {
    primary:
      "bg-[var(--app-accent)] text-[#031012] shadow-[0_0_24px_rgba(92,244,236,0.18)] hover:brightness-110",
    secondary:
      "border border-[var(--app-border)] bg-[#071018] text-[var(--app-text)] hover:border-[var(--app-border-strong)] hover:text-white",
    danger:
      "border border-red-400/20 bg-red-400/10 text-red-100 hover:border-red-300/50 hover:bg-red-400/15",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.secondary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}