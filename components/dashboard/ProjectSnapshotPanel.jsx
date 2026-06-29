import Link from "next/link";
import DashboardPanel from "./DashboardPanel.jsx";
import DashboardEmptyState from "./DashboardEmptyState.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import PriorityBadge from "../ui/PriorityBadge.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";

export default function ProjectSnapshotPanel({ projects = [] }) {
  const [featuredProject, ...secondaryProjects] = projects;

  return (
    <DashboardPanel
      title="Project Snapshot"
      eyebrow="Active Work"
      actionHref="/projects"
      actionLabel="View All"
    >
      {projects.length === 0 ? (
        <DashboardEmptyState
          title="No active projects"
          description="Open projects will appear here with status, priority, due date, and progress."
        />
      ) : (
        <div className="space-y-4">
          {featuredProject && (
            <Link
              href={featuredProject.href}
              className="group block rounded-[var(--radius-xl)] border border-cyan-300/25 bg-[#050b12] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.3)] transition hover:border-cyan-300/45"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--app-accent)]">
                    Featured Mission
                  </p>
                  <h4 className="mt-2 text-2xl font-black tracking-tight text-white">
                    {featuredProject.name}
                  </h4>
                  <p className="mt-1 text-sm font-semibold text-[var(--app-text-muted)]">
                    {featuredProject.clientName}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge>{featuredProject.status}</StatusBadge>
                  <PriorityBadge priority={featuredProject.priority} />
                </div>
              </div>

              <div className="mt-4">
                <ProgressBar value={featuredProject.progress} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
                    Progress
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    {featuredProject.progressLabel}
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
                    Due State
                  </p>
                  <p className="mt-1 text-lg font-black text-[var(--app-accent-text)]">
                    {featuredProject.dueState}
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
                    Due Date
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    {featuredProject.dueDateShort}
                  </p>
                </div>
              </div>
            </Link>
          )}

          {secondaryProjects.length > 0 && (
            <div className="grid gap-3 lg:grid-cols-3">
              {secondaryProjects.map((project) => (
                <Link
                  key={project.id}
                  href={project.href}
                  className="rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-black/20 p-4 transition hover:border-[var(--app-border-strong)] hover:bg-black/30"
                >
                  <div className="min-w-0">
                    <h4 className="truncate font-bold text-[var(--app-text)]">
                      {project.name}
                    </h4>
                    <p className="mt-1 truncate text-sm text-[var(--app-text-muted)]">
                      {project.clientName}
                    </p>
                  </div>

                  <div className="mt-4">
                    <ProgressBar value={project.progress} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-[var(--app-text-soft)]">
                      {project.dueDateShort}
                    </span>
                    <PriorityBadge priority={project.priority} />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/projects"
            className="inline-flex text-xs font-bold uppercase tracking-widest text-[var(--app-accent-text)] transition hover:text-white"
          >
            Open Projects →
          </Link>
        </div>
      )}
    </DashboardPanel>
  );
}
