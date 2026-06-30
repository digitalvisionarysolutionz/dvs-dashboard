import Link from "next/link";
import DashboardPanel from "./DashboardPanel.jsx";
import DashboardEmptyState from "./DashboardEmptyState.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";

const DVS_CYAN = "#5cf4ec";

function getInitials(value = "") {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ProjectIcon({ project }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[#5cf4ec]/20 bg-[#5cf4ec]/[0.055] text-[11px] font-black text-[#5cf4ec] shadow-[0_0_18px_rgba(92,244,236,0.12)]">
      {getInitials(project.name) || "P"}
    </span>
  );
}

function CompactProgress({ value = 0 }) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-[#5cf4ec] shadow-[0_0_14px_rgba(92,244,236,0.5)]"
          style={{ width: `${safeValue}%` }}
        />
      </div>

      <span className="w-8 shrink-0 text-right text-[10px] font-black text-slate-300">
        {safeValue}%
      </span>
    </div>
  );
}

function ProjectRow({ project }) {
  return (
    <Link
      href={project.href}
      className="grid min-h-[58px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.025] px-3 py-2.5 transition hover:border-[#5cf4ec]/35 hover:bg-white/[0.045] min-[1320px]:grid-cols-[minmax(0,1.2fr)_minmax(120px,0.7fr)_auto]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <ProjectIcon project={project} />

        <div className="min-w-0">
          <h4 className="truncate text-[12px] font-black leading-tight text-white">
            {project.name}
          </h4>

          <p className="mt-0.5 truncate text-[10px] font-semibold text-[var(--app-text-muted)]">
            {project.clientName || "Internal"}
          </p>
        </div>
      </div>

      <div className="hidden min-[1320px]:block">
        <CompactProgress value={project.progress} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden min-[1180px]:block min-[1320px]:hidden">
          <CompactProgress value={project.progress} />
        </div>

        <StatusBadge>{project.status}</StatusBadge>
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
      className="p-4"
    >
      {visibleProjects.length === 0 ? (
        <DashboardEmptyState
          title="No active projects"
          description="Open projects will appear here with status and progress."
        />
      ) : (
        <div className="space-y-2">
          {visibleProjects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}