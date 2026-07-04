import Link from "next/link";
import DashboardPanel from "./DashboardPanel.jsx";
import DashboardEmptyState from "./DashboardEmptyState.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

const iconStyles = [
  {
    border: "border-[#12d7ff]/35",
    bg: "bg-[#08283a]",
    glow: "shadow-[0_0_18px_rgba(18,215,255,0.18)]",
    text: "text-[#5cf4ec]",
    mark: "◇",
  },
  {
    border: "border-violet-300/35",
    bg: "bg-violet-500/20",
    glow: "shadow-[0_0_18px_rgba(139,92,246,0.18)]",
    text: "text-violet-200",
    mark: "⌘",
  },
  {
    border: "border-emerald-300/35",
    bg: "bg-emerald-400/18",
    glow: "shadow-[0_0_18px_rgba(52,211,153,0.16)]",
    text: "text-emerald-200",
    mark: "◇",
  },
  {
    border: "border-amber-300/40",
    bg: "bg-amber-400/22",
    glow: "shadow-[0_0_18px_rgba(251,191,36,0.18)]",
    text: "text-amber-100",
    mark: "≫",
  },
];

function formatStatus(value = "") {
  return String(value)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusTone(status = "") {
  const normalized = String(status).toLowerCase();

  if (
    normalized.includes("complete") ||
    normalized.includes("delivered") ||
    normalized.includes("on track")
  ) {
    return "success";
  }

  if (normalized.includes("progress")) {
    return "accent";
  }

  if (
    normalized.includes("waiting") ||
    normalized.includes("review") ||
    normalized.includes("due")
  ) {
    return "warning";
  }

  if (
    normalized.includes("high") ||
    normalized.includes("urgent") ||
    normalized.includes("overdue")
  ) {
    return "danger";
  }

  return "neutral";
}

function ProjectIcon({ index }) {
  const style = iconStyles[index % iconStyles.length];

  return (
    <span
      className={`row-span-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border ${style.border} ${style.bg} ${style.text} ${style.glow}`}
    >
      <span className="text-[14px] font-black leading-none">{style.mark}</span>
    </span>
  );
}

function ProjectProgress({ value = 0 }) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.09]">
        <div
          className="h-full rounded-full bg-[#5cf4ec] shadow-[0_0_12px_rgba(92,244,236,0.58)]"
          style={{ width: `${safeValue}%` }}
        />
      </div>

      <span className="w-8 shrink-0 text-right text-[10px] font-black text-slate-300">
        {safeValue}%
      </span>
    </div>
  );
}

function ProjectRow({ project, index }) {
  const status = formatStatus(project.status);
  const statusTone = getStatusTone(project.status);

  return (
    <Link
      href={project.href}
      className="grid min-h-[68px] grid-cols-[36px_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-2 rounded-[12px] border border-white/[0.065] bg-[#071017]/54 px-3 py-2.5 transition hover:border-[#5cf4ec]/30 hover:bg-[#0a141d]/72"
    >
      <ProjectIcon index={index} />

      <div className="min-w-0 self-end">
        <h4 className="overflow-hidden text-[11px] font-black leading-[1.12] text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {project.name}
        </h4>

        <p className="mt-0.5 truncate text-[9px] font-semibold leading-tight text-slate-400">
          {project.clientName || "Internal"}
        </p>
      </div>

      <StatusBadge
        tone={statusTone}
        className="self-center whitespace-nowrap px-2.5 py-1 text-[8px] normal-case tracking-normal"
      >
        {status}
      </StatusBadge>

      <div className="col-span-2 col-start-2 min-w-0 self-start pr-1">
        <ProjectProgress value={project.progress} />
      </div>
    </Link>
  );
}

export default function ProjectSnapshotPanel({ projects = [] }) {
  const visibleProjects = projects.slice(0, 4);

  return (
    <DashboardPanel
      title="Project Snapshot"
      eyebrow="Project Snapshot"
      actionHref="/projects"
      actionLabel="View All Projects"
      className="h-full p-4"
    >
      {visibleProjects.length === 0 ? (
        <DashboardEmptyState
          title="No active projects"
          description="Open projects will appear here with status and progress."
        />
      ) : (
        <div className="space-y-2">
          {visibleProjects.map((project, index) => (
            <ProjectRow key={project.id} project={project} index={index} />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}