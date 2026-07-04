"use client";

function dispatchDashboardEvent(eventName) {
  window.dispatchEvent(new CustomEvent(eventName));
}

const actions = [
  {
    label: "New Project",
    description: "Create a new client project",
    eventName: "dvs-open-new-project",
    icon: "+",
  },
  {
    label: "New Client",
    description: "Add a new client profile",
    eventName: "dvs-dashboard-open-new-client",
    icon: "♙",
  },
  {
    label: "New Lead",
    description: "Capture a new opportunity",
    eventName: "dvs-dashboard-open-new-lead",
    icon: "◎",
  },
  {
    label: "Schedule Meeting",
    description: "Open booking calendar",
    eventName: "dvs-dashboard-open-schedule-meeting",
    icon: "▣",
  },
];

function QuickActionButton({ action }) {
  return (
    <button
      type="button"
      onClick={() => dispatchDashboardEvent(action.eventName)}
      className="group flex h-[44px] w-full touch-manipulation items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.045] px-3 text-left transition hover:border-[#5cf4ec]/35 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-white/5 bg-white/[0.055] text-[15px] font-black text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] group-hover:text-[#5cf4ec]">
        {action.icon}
      </span>

      <span className="min-w-0">
        <span className="block text-[12px] font-black leading-tight text-white">
          {action.label}
        </span>

        <span className="mt-0.5 block truncate text-[10px] font-semibold leading-tight text-[var(--app-text-muted)]">
          {action.description}
        </span>
      </span>
    </button>
  );
}

export default function CommandQuickActions() {
  return (
    <div className="grid gap-2">
      {actions.map((action) => (
        <QuickActionButton key={action.label} action={action} />
      ))}
    </div>
  );
}