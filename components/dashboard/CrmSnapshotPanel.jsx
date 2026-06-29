import Link from "next/link";
import DashboardPanel from "./DashboardPanel.jsx";
import DashboardEmptyState from "./DashboardEmptyState.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import PriorityBadge from "../ui/PriorityBadge.jsx";

export default function CrmSnapshotPanel({ crm }) {
  const {
    stageSummary = [],
    hotLeads = [],
    pipelineValue = "$0",
    activeLeadCount = 0,
    followUpsDue = 0,
    pipelineTotal = 0,
  } = crm || {};

  const visibleStages = stageSummary.filter((stage) => stage.count > 0);

  return (
    <DashboardPanel
      title="CRM Snapshot"
      eyebrow="Pipeline"
      actionHref="/crm"
      actionLabel="View CRM"
    >
      <div className="mb-5 rounded-[var(--radius-xl)] border border-cyan-300/20 bg-black/25 p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--app-accent)]">
              Pipeline Value
            </p>
            <p className="mt-2 text-4xl font-black tracking-tight text-white">
              {pipelineValue}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">
              {activeLeadCount} active opportunities / {followUpsDue} follow-ups due
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.035] px-4 py-3 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
              Total CRM Records
            </p>
            <p className="mt-1 text-2xl font-black text-[var(--app-accent-text)]">
              {pipelineTotal}
            </p>
          </div>
        </div>
      </div>

      {visibleStages.length > 0 && (
        <div className="mb-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--app-text-soft)]">
            Stage Distribution
          </p>
          <div className="space-y-3">
            {visibleStages.map((stage) => (
              <div
                key={stage.key}
                className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--app-text-muted)]">
                    {stage.label}
                  </span>
                  <span className="text-xs font-black text-[var(--app-accent-text)]">
                    {stage.count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--app-accent)] to-[var(--app-accent-2)] shadow-[0_0_18px_rgba(92,244,236,0.45)]"
                    style={{ width: `${Math.max(stage.percentage, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hotLeads.length === 0 ? (
        <DashboardEmptyState
          title="No hot opportunities"
          description="High-priority leads, proposal-stage deals, and overdue follow-ups will surface here."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--app-text-soft)]">
            Hot Opportunities
          </p>

          {hotLeads.map((lead) => (
            <Link
              key={lead.id}
              href={lead.href}
              className="block rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-black/20 p-4 transition hover:border-[var(--app-border-strong)] hover:bg-black/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate font-bold text-[var(--app-text)]">
                    {lead.businessName}
                  </h4>
                  <p className="mt-1 truncate text-sm text-[var(--app-text-muted)]">
                    {lead.serviceInterest}
                  </p>
                </div>
                <StatusBadge>{lead.stage}</StatusBadge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PriorityBadge priority={lead.priority} />
                <span className="text-xs font-bold text-[var(--app-accent-text)]">
                  {lead.estimatedValueLabel}
                </span>
                <span className="text-xs text-[var(--app-text-soft)]">
                  Follow-up: {lead.nextFollowUpLabel}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}
