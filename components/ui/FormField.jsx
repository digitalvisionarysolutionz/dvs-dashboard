export default function FormField({
  label,
  required = false,
  children,
  description,
  error,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
        {required && <span className="text-[#5cf4ec]">*</span>}
      </span>

      {children}

      {description && !error && (
        <span className="mt-1.5 block text-[11px] font-semibold leading-5 text-slate-500">
          {description}
        </span>
      )}

      {error && (
        <span className="mt-1.5 block text-[11px] font-bold leading-5 text-red-200">
          {error}
        </span>
      )}
    </label>
  );
}