"use client";

function dispatchDashboardEvent(eventName) {
  window.dispatchEvent(new CustomEvent(eventName));
}

const baseActionClass =
  "inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border px-3 text-xs font-black uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]";

export default function CommandQuickActions() {
  // TODO: Wire dvs-open-new-client and dvs-open-new-lead in the GlobalModals phase.
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => dispatchDashboardEvent("dvs-open-new-project")}
        className={`${baseActionClass} border-cyan-300/40 bg-[var(--app-accent)] text-[#031012] shadow-[0_0_24px_rgba(92,244,236,0.22)] hover:brightness-110`}
      >
        + New Project
      </button>

      <button
        type="button"
        onClick={() => dispatchDashboardEvent("dvs-open-new-client")}
        className={`${baseActionClass} border-white/10 bg-white/[0.055] text-slate-200 hover:border-cyan-300/35 hover:bg-white/[0.085] hover:text-white`}
      >
        + New Client
      </button>

      <button
        type="button"
        onClick={() => dispatchDashboardEvent("dvs-open-new-lead")}
        className={`${baseActionClass} border-white/10 bg-white/[0.055] text-slate-200 hover:border-cyan-300/35 hover:bg-white/[0.085] hover:text-white`}
      >
        + New Lead
      </button>
    </div>
  );
}
