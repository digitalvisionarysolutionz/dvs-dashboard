import Link from "next/link";
import DashboardPanel from "./DashboardPanel.jsx";
import DashboardEmptyState from "./DashboardEmptyState.jsx";

const badgeToneClass = {
  danger: "border-red-300/30 bg-red-400/10 text-red-200",
  warning: "border-yellow-300/30 bg-yellow-300/10 text-yellow-100",
  accent:
    "border-[var(--app-border-strong)] bg-[var(--app-accent-soft)] text-[var(--app-accent-text)]",
};

export default function NeedsAttentionPanel({ items = [] }) {
  return (
    <DashboardPanel
      title="Needs Attention"
      eyebrow="Priority Queue"
      actionHref="/projects"
      actionLabel="Review"
    >
      {items.length === 0 ? (
        <DashboardEmptyState
          title="Nothing urgent right now"
          description="High-priority projects, due dates, follow-ups, and proposal-stage leads will appear here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-black/20 p-4 transition hover:border-[var(--app-border-strong)] hover:bg-black/30"
            >
              <div className="min-w-0">
                <h4 className="truncate font-bold text-[var(--app-text)]">
                  {item.title}
                </h4>
                <p className="mt-1 truncate text-sm text-[var(--app-text-muted)]">
                  {item.subtitle}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-[var(--radius-md)] border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  badgeToneClass[item.badgeTone] || badgeToneClass.accent
                }`}
              >
                {item.badge}
              </span>
            </Link>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}
