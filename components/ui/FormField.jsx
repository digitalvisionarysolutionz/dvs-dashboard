export default function FormField({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
        {required && <span className="text-[var(--app-accent)]"> *</span>}
      </span>

      {children}
    </label>
  );
}