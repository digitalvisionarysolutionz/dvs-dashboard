import Link from "next/link";
import DashboardEmptyState from "./DashboardEmptyState.jsx";
import NeedsAttentionPanel from "./NeedsAttentionPanel.jsx";

const signalToneClass = {
  accent: "text-[var(--app-accent-text)]",
  warning: "text-yellow-100",
  danger: "text-red-200",
  neutral: "text-[var(--app-text-muted)]",
};

export default function CommandInsightColumn({
  attentionItems = [],
  hotLeads = [],
  systemSignals = [],
}) {
  return (
    <aside className="space-y-5 xl:sticky xl:top-24">
      <NeedsAttentionPanel items={attentionItems} />

      <section className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[#050b12] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
        />
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[var(--app-accent)]">
              Pipeline Intel
            </p>
            <h3 className="mt-1 text-lg font-black text-white">
              Hot Opportunities
            </h3>
          </div>
          <Link
            href="/crm"
            className="text-xs font-black uppercase tracking-widest text-[var(--app-accent-text)] hover:text-white"
          >
            CRM
          </Link>
        </div>

        {hotLeads.length === 0 ? (
          <DashboardEmptyState
            title="No hot opportunities"
            description="High-priority leads and urgent follow-ups will appear here."
          />
        ) : (
          <div className="space-y-3">
            {hotLeads.slice(0, 3).map((lead) => (
              <Link
                key={lead.id}
                href={lead.href}
                className="block rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.035] p-3 transition hover:border-cyan-300/35 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black text-white">
                      {lead.businessName}
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-[var(--app-text-muted)]">
                      {lead.serviceInterest}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-black text-[var(--app-accent-text)]">
                    {lead.estimatedValueLabel}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[var(--app-text-soft)]">
                  {lead.stage} / Follow-up: {lead.nextFollowUpLabel}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-black/25 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[var(--app-accent)]">
          System Signals
        </p>
        <div className="mt-4 space-y-3">
          {systemSignals.map((signal) => (
            <div
              key={signal.id}
              className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0"
            >
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--app-text-soft)]">
                {signal.label}
              </span>
              <span
                className={`text-sm font-black ${
                  signalToneClass[signal.tone] || signalToneClass.accent
                }`}
              >
                {signal.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
