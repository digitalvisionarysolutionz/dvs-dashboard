export default function DashboardEmptyState({ title, description }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--app-border)] bg-black/15 px-4 py-8 text-center">
      <p className="text-sm font-bold text-[var(--app-text)]">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-[var(--app-text-muted)]">{description}</p>
      )}
    </div>
  );
}
