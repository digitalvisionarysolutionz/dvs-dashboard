import Link from "next/link";
import DashboardPanel from "./DashboardPanel.jsx";
import DashboardEmptyState from "./DashboardEmptyState.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

function PipelineDonut({ stages = [], value = "$0" }) {
  const visibleStages = stages.filter((stage) => stage.count > 0);
  const total = visibleStages.reduce((sum, stage) => sum + stage.count, 0);

  if (total === 0) {
    return (
      <div className="mx-auto flex h-[128px] w-[128px] items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5cf4ec]">
            Pipeline
          </p>
          <p className="mt-1 text-lg font-black text-white">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[128px] w-[128px] shrink-0 rounded-full bg-[conic-gradient(from_180deg,#5cf4ec_0_32%,#2f86ff_32%_58%,#7c3cff_58%_78%,#19d38a_78%_100%)] p-[10px] shadow-[0_0_28px_rgba(92,244,236,0.12)]">
      <div className="flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-[#05080d] text-center">
        <div className="px-2">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-text-soft)]">
            Pipeline
          </p>
          <p className="mt-1 truncate text-[15px] font-black leading-none text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StageRow({ stage }) {
  const percentage = Math.min(Math.max(Number(stage.percentage) || 0, 0), 100);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_32px] items-center gap-2">
      <div className="min-w-0">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="truncate text-[10px] font-bold text-slate-300">
            {stage.label}
          </p>
          <p className="text-[10px] font-black text-[#5cf4ec]">{stage.count}</p>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-[#5cf4ec] shadow-[0_0_12px_rgba(92,244,236,0.45)]"
            style={{ width: `${Math.max(percentage, 6)}%` }}
          />
        </div>
      </div>

      <span className="text-right text-[10px] font-black text-[var(--app-text-soft)]">
        {percentage}%
      </span>
    </div>
  );
}

function HotLeadRow({ lead }) {
  return (
    <Link
      href={lead.href}
      className="grid min-h-[50px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-md)] border border-white/10 bg-white/[0.025] px-3 py-2 transition hover:border-[#5cf4ec]/35 hover:bg-white/[0.045]"
    >
      <div className="min-w-0">
        <p className="truncate text-[12px] font-black text-white">
          {lead.businessName}
        </p>

        <p className="mt-0.5 truncate text-[10px] font-semibold text-[var(--app-text-muted)]">
          {lead.serviceInterest}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden text-[10px] font-black text-[#5cf4ec] min-[1450px]:block">
          {lead.estimatedValueLabel}
        </span>

        <StatusBadge>{lead.stage}</StatusBadge>
      </div>
    </Link>
  );
}

export default function CrmSnapshotPanel({ crm }) {
  const {
    stageSummary = [],
    hotLeads = [],
    pipelineValue = "$0",
    activeLeadCount = 0,
    followUpsDue = 0,
  } = crm || {};

  const visibleStages = stageSummary
    .filter((stage) => stage.count > 0)
    .slice(0, 4);

  const visibleLeads = hotLeads.slice(0, 2);

  return (
    <DashboardPanel
      title="CRM Pipeline"
      eyebrow="CRM Pipeline"
      actionHref="/crm"
      actionLabel="View Pipeline"
      className="p-4"
    >
      <div className="grid gap-4 min-[640px]:grid-cols-[minmax(0,1fr)_128px] min-[640px]:items-center min-[1350px]:grid-cols-[128px_minmax(0,1fr)]">
        <div className="order-2 min-[640px]:order-1 min-[1350px]:order-none">
          <div className="min-w-0 space-y-2.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5cf4ec]">
                  Open Pipeline
                </p>

                <p className="mt-1 text-[22px] font-black leading-none text-white">
                  {pipelineValue}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black text-slate-300">
                  {activeLeadCount} active
                </p>
                <p className="mt-0.5 text-[10px] font-semibold text-[var(--app-text-muted)]">
                  {followUpsDue} follow-ups
                </p>
              </div>
            </div>

            {visibleStages.length > 0 ? (
              <div className="space-y-2">
                {visibleStages.map((stage) => (
                  <StageRow key={stage.key} stage={stage} />
                ))}
              </div>
            ) : (
              <DashboardEmptyState
                title="No CRM stages yet"
                description="Active lead stages will appear here."
              />
            )}
          </div>
        </div>

        <div className="order-1 flex justify-center min-[640px]:order-2 min-[1350px]:order-none">
          <PipelineDonut stages={visibleStages} value={pipelineValue} />
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--app-text-soft)]">
            Hot Opportunities
          </p>
        </div>

        {visibleLeads.length === 0 ? (
          <DashboardEmptyState
            title="No hot opportunities"
            description="Important CRM opportunities will surface here."
          />
        ) : (
          <div className="space-y-2">
            {visibleLeads.map((lead) => (
              <HotLeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}