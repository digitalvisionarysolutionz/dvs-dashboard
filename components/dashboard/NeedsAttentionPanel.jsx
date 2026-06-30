import Link from "next/link";
import DashboardPanel from "./DashboardPanel.jsx";
import DashboardEmptyState from "./DashboardEmptyState.jsx";

const badgeToneClass = {
  danger: "border-red-300/30 bg-red-400/10 text-red-200",
  warning: "border-yellow-300/30 bg-yellow-300/10 text-yellow-100",
  accent: "border-[#5cf4ec]/35 bg-[#5cf4ec]/10 text-[#5cf4ec]",
};

const dotToneClass = {
  danger: "bg-red-300 shadow-[0_0_14px_rgba(252,165,165,0.45)]",
  warning: "bg-yellow-200 shadow-[0_0_14px_rgba(254,240,138,0.35)]",
  accent: "bg-[#5cf4ec] shadow-[0_0_14px_rgba(92,244,236,0.55)]",
};

function AttentionRow({ item }) {
  const tone = item.badgeTone || "accent";

  return (
    <Link
      href={item.href}
      className="grid min-h-[54px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.025] px-3 py-2.5 transition hover:border-[#5cf4ec]/35 hover:bg-white/[0.045]"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-white/[0.045]">
        <span
          className={`h-2 w-2 rounded-full ${
            dotToneClass[tone] || dotToneClass.accent
          }`}
        />
      </span>

      <div className="min-w-0">
        <h4 className="truncate text-[12px] font-black text-white">
          {item.title}
        </h4>

        <p className="mt-0.5 truncate text-[10px] font-semibold text-[var(--app-text-muted)]">
          {item.subtitle}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] ${
          badgeToneClass[tone] || badgeToneClass.accent
        }`}
      >
        {item.badge}
      </span>
    </Link>
  );
}

export default function NeedsAttentionPanel({ items = [] }) {
  const visibleItems = items.slice(0, 4);

  return (
    <DashboardPanel
      title="Needs Attention"
      eyebrow="Needs Attention"
      actionHref="/projects"
      actionLabel="View All"
      className="p-4"
    >
      {visibleItems.length === 0 ? (
        <DashboardEmptyState
          title="Nothing urgent right now"
          description="Priority items will appear here when something needs attention."
        />
      ) : (
        <div className="space-y-2">
          {visibleItems.map((item) => (
            <AttentionRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}