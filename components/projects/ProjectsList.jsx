"use client";

import { useMemo, useState } from "react";
import Button from "../ui/Button.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import {
  archiveSelectedProjects,
  completeSelectedProjects,
  deleteSelectedProjects,
  moveSelectedProjectsToActive,
  moveSingleProjectToActive,
  archiveSingleProject,
  deleteSingleProject,
  toggleSingleProjectCompletion,
} from "../../app/(dashboard)/projects/actions.js";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm5.5-2.5L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M5 5.5h14v15H5v-15Zm0 4h14M8 3.5v4M16 3.5v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M5 7h14M10 11v6M14 11v6M8 7l.6 12h6.8L16 7M9 7l1-3h4l1 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M6 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
    </svg>
  );
}

function ProjectIcon({ project }) {
  const firstLetter = project.name?.charAt(0)?.toUpperCase() || "P";

  const toneByStatus = project.isCompleted
    ? "from-green-400 to-emerald-500"
    : project.isArchived
      ? "from-slate-500 to-slate-700"
      : project.rawPriority === "high"
        ? "from-violet-500 to-cyan-400"
        : "from-cyan-400 to-blue-500";

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br ${toneByStatus} text-sm font-black text-white shadow-[0_0_22px_rgba(92,244,236,0.18)]`}
    >
      {firstLetter}
    </div>
  );
}

function getTabProjects(projects, activeTab) {
  if (activeTab === "completed") {
    return projects.filter((project) => project.isCompleted);
  }

  if (activeTab === "archive") {
    return projects.filter((project) => project.isArchived);
  }

  return projects.filter(
    (project) => !project.isCompleted && !project.isArchived
  );
}

function getDisplayProgress(project) {
  if (project.isCompleted) {
    return 100;
  }

  return project.progress;
}

function getProjectTitle(project) {
  if (!project.clientName || project.clientName === "Internal") {
    return project.name;
  }

  return `${project.clientName} — ${project.name}`;
}

function ProjectTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { key: "active", label: "Active", count: counts.active },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "archive", label: "Archived", count: counts.archive },
  ];

  return (
    <div className="border-b border-[var(--app-border)]">
      <div className="flex flex-wrap gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`relative pb-4 text-sm font-black transition ${
                isActive
                  ? "text-[var(--app-accent)]"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-[var(--radius-pill)] bg-[var(--app-accent-soft)] px-2 py-0.5 text-xs">
                {tab.count}
              </span>

              {isActive && (
                <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[var(--app-accent)] shadow-[0_0_18px_rgba(92,244,236,0.75)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterBar({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  clientValue,
  onClientChange,
  sortValue,
  onSortChange,
  clients,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative block w-full sm:w-[260px]">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-text-soft)]">
          <SearchIcon />
        </span>

        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search projects..."
          className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] pl-10 pr-4 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-soft)] focus:border-[var(--app-border-strong)]"
        />
      </label>

      <select
        value={statusValue}
        onChange={(event) => onStatusChange(event.target.value)}
        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-3 text-sm font-bold text-[var(--app-text)] outline-none transition focus:border-[var(--app-border-strong)] sm:w-[150px]"
      >
        <option className="bg-[#071018]" value="all">
          All Status
        </option>
        <option className="bg-[#071018]" value="planning">
          Planning
        </option>
        <option className="bg-[#071018]" value="in_progress">
          In Progress
        </option>
        <option className="bg-[#071018]" value="review">
          Review
        </option>
        <option className="bg-[#071018]" value="completed">
          Completed
        </option>
        <option className="bg-[#071018]" value="archived">
          Archived
        </option>
      </select>

      <select
        value={clientValue}
        onChange={(event) => onClientChange(event.target.value)}
        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-3 text-sm font-bold text-[var(--app-text)] outline-none transition focus:border-[var(--app-border-strong)] sm:w-[160px]"
      >
        <option className="bg-[#071018]" value="all">
          All Clients
        </option>

        {clients.map((client) => (
          <option className="bg-[#071018]" key={client} value={client}>
            {client}
          </option>
        ))}
      </select>

      <select
        value={sortValue}
        onChange={(event) => onSortChange(event.target.value)}
        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-3 text-sm font-bold text-[var(--app-text)] outline-none transition focus:border-[var(--app-border-strong)] sm:w-[160px]"
      >
        <option className="bg-[#071018]" value="due">
          Sort: Due
        </option>
        <option className="bg-[#071018]" value="progress">
          Sort: Progress
        </option>
        <option className="bg-[#071018]" value="priority">
          Sort: Priority
        </option>
        <option className="bg-[#071018]" value="name">
          Sort: Name
        </option>
      </select>
    </div>
  );
}

function ProjectHeroStats({ projects }) {
  const activeCount = projects.filter(
    (project) => !project.isCompleted && !project.isArchived
  ).length;

  const completedCount = projects.filter((project) => project.isCompleted).length;
  const archivedCount = projects.filter((project) => project.isArchived).length;

  const highCount = projects.filter(
    (project) => project.rawPriority === "high"
  ).length;

  const mediumCount = projects.filter(
    (project) => project.rawPriority === "medium"
  ).length;

  const lowCount = projects.filter(
    (project) => project.rawPriority === "low"
  ).length;

  const totalPriority = Math.max(highCount + mediumCount + lowCount, 1);
  const highPercentage = Math.round((highCount / totalPriority) * 100);
  const mediumPercentage = Math.round((mediumCount / totalPriority) * 100);
  const lowPercentage = Math.round((lowCount / totalPriority) * 100);

  const stats = [
    {
      label: "Active Projects",
      value: activeCount,
      caption: "Currently in motion",
      tone: "cyan",
    },
    {
      label: "Completed",
      value: completedCount,
      caption: "Moved to completed",
      tone: "green",
    },
    {
      label: "Archived",
      value: archivedCount,
      caption: "Stored for later",
      tone: "orange",
    },
    {
      label: "High Priority",
      value: highCount,
      caption: "Needs attention",
      tone: "red",
    },
  ];

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-gradient-to-br from-white/[0.06] via-white/[0.035] to-cyan-300/[0.035] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.26)]">
      <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[var(--app-accent)]">
            Project Overview
          </p>

          <h3 className="mt-2 text-2xl font-black text-[var(--app-text)] md:text-3xl">
            Delivery Snapshot
          </h3>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-[var(--app-text-muted)]">
          Active work, completed projects, archive status, and priority balance
          across your current workspace.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {stats.map((stat) => {
            const toneClass =
              stat.tone === "green"
                ? "bg-green-400/10 text-green-300"
                : stat.tone === "orange"
                  ? "bg-amber-400/10 text-amber-300"
                  : stat.tone === "red"
                    ? "bg-red-400/10 text-red-300"
                    : "bg-cyan-400/10 text-cyan-200";

            return (
              <div
                key={stat.label}
                className="min-h-[120px] rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-[#071018] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${toneClass}`}
                  >
                    ●
                  </div>

                  <div>
                    <p className="text-2xl font-black leading-none text-[var(--app-text)] sm:text-3xl">
                      {stat.value}
                    </p>

                    <p className="mt-2 text-xs font-black text-[var(--app-text-muted)] sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-[var(--app-text-soft)] sm:mt-4 sm:text-xs">
                  {stat.caption}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-[#071018] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
  <div className="grid min-h-[150px] grid-cols-[minmax(0,1fr)_110px] items-center gap-4 sm:grid-cols-[minmax(0,1fr)_130px]">
    <div className="min-w-0">
      <p className="text-sm font-black text-[var(--app-text)]">
        Priority Breakdown
      </p>

      <p className="mt-1 text-xs text-[var(--app-text-soft)]">
        High, medium, and low priority mix
      </p>

      <div className="mt-4 space-y-2 text-xs sm:text-sm">
        <div className="flex items-center justify-between gap-3 text-[var(--app-text-muted)]">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            High
          </span>

          <span className="shrink-0 font-black text-[var(--app-text)]">
            {highCount} ({highPercentage}%)
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-[var(--app-text-muted)]">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Medium
          </span>

          <span className="shrink-0 font-black text-[var(--app-text)]">
            {mediumCount} ({mediumPercentage}%)
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-[var(--app-text-muted)]">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            Low
          </span>

          <span className="shrink-0 font-black text-[var(--app-text)]">
            {lowCount} ({lowPercentage}%)
          </span>
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <div
        className="h-24 w-24 shrink-0 rounded-full sm:h-28 sm:w-28"
        style={{
          background: `conic-gradient(
            #fb7185 0 ${highPercentage}%,
            #facc15 ${highPercentage}% ${highPercentage + mediumPercentage}%,
            #4ade80 ${highPercentage + mediumPercentage}% 100%
          )`,
        }}
      >
        <div className="m-[16px] h-16 w-16 rounded-full bg-[#071018] sm:m-[18px] sm:h-[76px] sm:w-[76px]" />
      </div>
    </div>
  </div>
</div>
      </div>
    </section>
  );
}

function BatchToolbar({ selectedIds, activeTab, onClearSelection }) {
  const [trashOpen, setTrashOpen] = useState(false);

  if (selectedIds.length === 0) {
    return null;
  }

  const selectedJson = JSON.stringify(selectedIds);

  const primaryAction =
    activeTab === "active"
      ? completeSelectedProjects
      : moveSelectedProjectsToActive;

  const primaryLabel =
    activeTab === "active" ? "Mark Completed" : "Mark Active";

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--app-border-strong)] bg-[#071018] p-3 shadow-[0_0_28px_rgba(92,244,236,0.12)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-black text-[var(--app-text)]">
        {selectedIds.length} project{selectedIds.length === 1 ? "" : "s"} selected
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <form
  action={primaryAction}
  onSubmit={() => {
    onClearSelection();
  }}
>
          <input type="hidden" name="projectIds" value={selectedJson} />
          <Button type="submit" size="sm">
            {primaryLabel}
          </Button>
        </form>

        {activeTab !== "archive" && (
          <form
  action={archiveSelectedProjects}
  onSubmit={() => {
    onClearSelection();
  }}
>
            <input type="hidden" name="projectIds" value={selectedJson} />
            <Button type="submit" variant="secondary" size="sm">
              Archive
            </Button>
          </form>
        )}

        <div className="relative">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setTrashOpen((current) => !current)}
          >
            <TrashIcon />
            Delete
          </Button>

          {trashOpen && (
            <div className="absolute right-0 z-30 mt-2 w-48 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.65)]">
              <p className="px-3 py-2 text-xs font-bold text-slate-400">
                This permanently deletes selected projects.
              </p>

              <form
  action={deleteSelectedProjects}
  onSubmit={() => {
    onClearSelection();
  }}
>
                <input type="hidden" name="projectIds" value={selectedJson} />
                <button
                  type="submit"
                  onClick={(event) => {
                    if (
                      !window.confirm(
                        "Delete selected projects permanently? This cannot be undone."
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                  className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-bold text-red-200 hover:bg-red-400/10"
                >
                  Confirm Delete
                </button>
              </form>
            </div>
          )}
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={onClearSelection}>
          Clear
        </Button>
      </div>
    </div>
  );
}

function RowActions({ project }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`More actions for ${project.name}`}
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--app-border)] bg-[#071018] text-[var(--app-text-muted)] transition hover:border-[var(--app-border-strong)] hover:text-white"
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-40 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.65)]">
          {project.isArchived || project.isCompleted ? (
            <form action={moveSingleProjectToActive}>
              <input type="hidden" name="projectId" value={project.id} />

              <button
                type="submit"
                className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-bold text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                Mark Active
              </button>
            </form>
          ) : (
            <form action={toggleSingleProjectCompletion}>
              <input type="hidden" name="projectId" value={project.id} />
              <input
                type="hidden"
                name="currentStatus"
                value={project.rawStatus}
              />

              <button
                type="submit"
                className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-bold text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                Mark Completed
              </button>
            </form>
          )}

          {!project.isArchived && (
            <form action={archiveSingleProject}>
              <input type="hidden" name="projectId" value={project.id} />

              <button
                type="submit"
                className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-bold text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                Archive
              </button>
            </form>
          )}

          <form action={deleteSingleProject}>
            <input type="hidden" name="projectId" value={project.id} />

            <button
              type="submit"
              onClick={(event) => {
                if (
                  !window.confirm(
                    "Delete this project permanently? This cannot be undone."
                  )
                ) {
                  event.preventDefault();
                }
              }}
              className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-bold text-red-200 hover:bg-red-400/10"
            >
              Delete
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function ProjectRow({
  project,
  isSelected,
  onToggleSelected,
  onOpenDetails,
}) {
  const displayProgress = getDisplayProgress(project);
  const isUrgent = project.rawPriority === "high" && !project.isCompleted;

  return (
    <article
      className={`grid gap-4 border-b border-[var(--app-border)] px-4 py-4 transition last:border-b-0 hover:bg-white/[0.035] lg:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.9fr)_auto] lg:items-center ${
        project.isCompleted ? "bg-green-400/[0.035]" : ""
      } ${project.isArchived ? "opacity-75" : ""}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelected(project.id)}
          aria-label={`Select ${project.name}`}
          className="mt-4 h-4 w-4 accent-[var(--app-accent)]"
        />

        <ProjectIcon project={project} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="truncate text-base font-black text-[var(--app-text)]">
              {getProjectTitle(project)}
            </h3>

            <StatusBadge>{project.status}</StatusBadge>
          </div>

          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
            Client: {project.clientName}
          </p>

          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
            {project.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--app-text-muted)]">
            <span className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  project.rawPriority === "high"
                    ? "bg-red-400"
                    : project.rawPriority === "medium"
                      ? "bg-amber-400"
                      : "bg-green-400"
                }`}
              />
              {project.priority}
            </span>

            <span className="flex items-center gap-2">
              <CalendarIcon />
              <span className="font-bold text-[var(--app-text)]">
                {project.dueDate}
              </span>
            </span>

            {project.isCompleted ? (
              <span className="font-bold text-green-400">Completed</span>
            ) : project.isArchived ? (
              <span className="font-bold text-slate-500">Archived</span>
            ) : isUrgent ? (
              <span className="font-bold text-red-300">High priority</span>
            ) : (
              <span className="text-[var(--app-text-soft)]">Scheduled</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-black/20 p-3 text-sm">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--app-text-soft)]">
            Progress
          </p>

          <p className="text-sm font-black text-[var(--app-text)]">
            {displayProgress}%
          </p>
        </div>

        <ProgressBar value={displayProgress} />

        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[var(--app-text-soft)]">
          {project.isCompleted
            ? "Completed"
            : project.isArchived
              ? "Archived"
              : "In motion"}
        </p>
      </div>

      <div className="flex items-center justify-start gap-2 lg:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onOpenDetails(project)}
        >
          View
        </Button>

        {project.isCompleted || project.isArchived ? (
          <form action={moveSingleProjectToActive}>
            <input type="hidden" name="projectId" value={project.id} />

            <Button type="submit" variant="secondary" size="sm">
              Mark Active
            </Button>
          </form>
        ) : (
          <form action={toggleSingleProjectCompletion}>
            <input type="hidden" name="projectId" value={project.id} />
            <input
              type="hidden"
              name="currentStatus"
              value={project.rawStatus}
            />

            <Button type="submit" variant="secondary" size="sm">
              Complete
            </Button>
          </form>
        )}

        <RowActions project={project} />
      </div>
    </article>
  );
}

function ProjectTable({
  projects,
  selectedIds,
  onToggleSelected,
  onOpenDetails,
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-[#050a10]">
      {projects.length > 0 ? (
        projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            isSelected={selectedIds.includes(project.id)}
            onToggleSelected={onToggleSelected}
            onOpenDetails={onOpenDetails}
          />
        ))
      ) : (
        <div className="p-8 text-center text-sm text-[var(--app-text-muted)]">
          No projects found for this view.
        </div>
      )}
    </div>
  );
}

function DetailsModal({ project, onClose }) {
  if (!project) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close project details"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--app-border-strong)] bg-[#071018] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--app-border)] pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--app-accent)]">
              Project Details
            </p>

            <h2 className="mt-3 text-2xl font-black text-white">
              {getProjectTitle(project)}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Client: {project.clientName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary">
              Edit
            </Button>

            <Button type="button" variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Status
            </p>
            <p className="mt-2 font-bold text-white">{project.status}</p>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Priority
            </p>
            <p className="mt-2 font-bold text-white">{project.priority}</p>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Due
            </p>
            <p className="mt-2 font-bold text-white">{project.dueDate}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Progress
          </p>
          <div className="mt-3">
            <ProgressBar value={getDisplayProgress(project)} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Description
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {project.description}
            </p>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Internal Notes
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {project.notes}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProjectsList({ projects = [] }) {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsProject, setDetailsProject] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [clientValue, setClientValue] = useState("all");
  const [sortValue, setSortValue] = useState("due");

  const counts = useMemo(
    () => ({
      active: projects.filter(
        (project) => !project.isCompleted && !project.isArchived
      ).length,
      completed: projects.filter((project) => project.isCompleted).length,
      archive: projects.filter((project) => project.isArchived).length,
    }),
    [projects]
  );

  const clients = useMemo(() => {
    return Array.from(new Set(projects.map((project) => project.clientName))).sort();
  }, [projects]);

  const visibleProjects = useMemo(() => {
    let nextProjects = getTabProjects(projects, activeTab);

    if (searchValue.trim()) {
      const normalizedSearch = searchValue.toLowerCase();

      nextProjects = nextProjects.filter((project) => {
        return (
          project.name.toLowerCase().includes(normalizedSearch) ||
          project.clientName.toLowerCase().includes(normalizedSearch) ||
          project.description.toLowerCase().includes(normalizedSearch)
        );
      });
    }

    if (statusValue !== "all") {
      nextProjects = nextProjects.filter(
        (project) => project.rawStatus === statusValue
      );
    }

    if (clientValue !== "all") {
      nextProjects = nextProjects.filter(
        (project) => project.clientName === clientValue
      );
    }

    return [...nextProjects].sort((a, b) => {
      if (sortValue === "progress") {
        return getDisplayProgress(b) - getDisplayProgress(a);
      }

      if (sortValue === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.rawPriority] ?? 3) - (order[b.rawPriority] ?? 3);
      }

      if (sortValue === "name") {
        return a.name.localeCompare(b.name);
      }

      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [
    activeTab,
    clientValue,
    projects,
    searchValue,
    sortValue,
    statusValue,
  ]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSelectedIds([]);
  }

  function handleToggleSelected(projectId) {
    setSelectedIds((currentIds) =>
      currentIds.includes(projectId)
        ? currentIds.filter((id) => id !== projectId)
        : [...currentIds, projectId]
    );
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  return (
    <>
      <div className="space-y-5">
        <ProjectHeroStats projects={projects} />

        <div className="rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-gradient-to-br from-white/[0.045] via-white/[0.025] to-cyan-300/[0.025] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
  <div className="space-y-5">
    <ProjectTabs
      activeTab={activeTab}
      onTabChange={handleTabChange}
      counts={counts}
    />

    <FilterBar
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      statusValue={statusValue}
      onStatusChange={setStatusValue}
      clientValue={clientValue}
      onClientChange={setClientValue}
      sortValue={sortValue}
      onSortChange={setSortValue}
      clients={clients}
    />

    <BatchToolbar
      selectedIds={selectedIds}
      activeTab={activeTab}
      onClearSelection={clearSelection}
    />

    <ProjectTable
      projects={visibleProjects}
      selectedIds={selectedIds}
      onToggleSelected={handleToggleSelected}
      onOpenDetails={setDetailsProject}
    />

    <div className="text-sm text-[var(--app-text-muted)]">
      Showing {visibleProjects.length} of{" "}
      {getTabProjects(projects, activeTab).length} projects
    </div>
  </div>
</div>
      </div>

      <DetailsModal
        project={detailsProject}
        onClose={() => setDetailsProject(null)}
      />
    </>
  );
}