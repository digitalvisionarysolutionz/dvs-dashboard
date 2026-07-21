"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button.jsx";
import CompactActionButton from "../ui/CompactActionButton.jsx";
import DashboardModal from "../ui/DashboardModal.jsx";
import FormField from "../ui/FormField.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import SmartMenu, { SmartMenuItem } from "../ui/SmartMenu.jsx";
import {
  archiveSelectedProjects,
  completeSelectedProjects,
  deleteSelectedProjects,
  moveSelectedProjectsToActive,
  moveSingleProjectToActive,
  archiveSingleProject,
  deleteSingleProject,
  toggleSingleProjectCompletion,
  updateProject,
} from "../../app/(dashboard)/projects/actions.js";
import ProjectBriefFields from "./ProjectBriefFields.jsx";

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

function emptyField(value, fallback = "") {
  if (
    value === "No due date" ||
    value === "No project description added yet." ||
    value === "No project notes added yet." ||
    value === "Internal" ||
    value === "Untitled Project"
  ) {
    return fallback;
  }

  return value || fallback;
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
        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-3 text-sm font-bold text-[var(--app-text)] outline-none transition focus:border-[var(--app-border-strong)] sm:w-[180px]"
      >
        <option className="bg-[#071018]" value="all">
          All Status
        </option>
        <option className="bg-[#071018]" value="not_started">
          Not Started
        </option>
        <option className="bg-[#071018]" value="in_progress">
          In Progress
        </option>
        <option className="bg-[#071018]" value="waiting_on_client">
          Waiting on Client
        </option>
        <option className="bg-[#071018]" value="ready_for_review">
          Ready for Review
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
  const activeProjects = projects.filter(
    (project) => !project.isCompleted && !project.isArchived
  );

  const activeCount = activeProjects.length;
  const completedCount = projects.filter((project) => project.isCompleted).length;
  const archivedCount = projects.filter((project) => project.isArchived).length;

  const highCount = activeProjects.filter(
    (project) => project.rawPriority === "high"
  ).length;

  const mediumCount = activeProjects.filter(
    (project) => project.rawPriority === "medium"
  ).length;

  const lowCount = activeProjects.filter(
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
      caption: "Active projects only",
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
                Active project priority mix
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
  const menuHeight = project.isArchived ? 96 : 132;

  return (
    <SmartMenu
      label={`More actions for ${project.name}`}
      button={<DotsIcon />}
      width={160}
      estimatedHeight={menuHeight}
    >
      {project.isArchived || project.isCompleted ? (
        <form action={moveSingleProjectToActive}>
          <input type="hidden" name="projectId" value={project.id} />

          <SmartMenuItem type="submit">Mark Active</SmartMenuItem>
        </form>
      ) : (
        <form action={toggleSingleProjectCompletion}>
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="currentStatus" value={project.rawStatus} />

          <SmartMenuItem type="submit">Mark Completed</SmartMenuItem>
        </form>
      )}

      {!project.isArchived && (
        <form action={archiveSingleProject}>
          <input type="hidden" name="projectId" value={project.id} />

          <SmartMenuItem type="submit">Archive</SmartMenuItem>
        </form>
      )}

      <form action={deleteSingleProject}>
        <input type="hidden" name="projectId" value={project.id} />

        <SmartMenuItem
          type="submit"
          tone="danger"
          onClick={(event) => {
            if (
              !window.confirm(
                "Delete this project permanently? This cannot be undone."
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          Delete
        </SmartMenuItem>
      </form>
    </SmartMenu>
  );
}

function ProjectRow({
  project,
  isSelected,
  onToggleSelected,
  onOpenDetails,
  onOpenEdit,
}) {
  const displayProgress = getDisplayProgress(project);
  const isUrgent =
    project.rawPriority === "high" && !project.isCompleted && !project.isArchived;

  return (
    <article
  className={`grid gap-4 border-b border-[var(--app-border)] px-4 py-4 transition last:border-b-0 hover:bg-white/[0.035] xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center ${
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

      <div className="space-y-3 xl:min-w-[300px]">
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

  <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onOpenDetails(project)}
        >
          View
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onOpenEdit(project)}
        >
          Edit
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
</div>
</article>
  );
}

function ProjectTable({
  projects,
  selectedIds,
  onToggleSelected,
  onOpenDetails,
  onOpenEdit,
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
            onOpenEdit={onOpenEdit}
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

const projectDetailTabs = [
  { key: "overview", label: "Overview" },
  { key: "brief", label: "Brief" },
  { key: "needs", label: "Needs" },
  { key: "assets", label: "Assets" },
  { key: "photo", label: "Photo / Video" },
  { key: "notes", label: "Notes" },
  { key: "activity", label: "Activity" },
];

function hasBriefData(brief = {}) {
  return Boolean(
    brief.businessDescription ||
      brief.targetAudience ||
      brief.serviceArea ||
      brief.currentWebsite ||
      brief.googleBusinessProfileUrl ||
      brief.socialLinks ||
      brief.successDefinition ||
      brief.budgetRange ||
      brief.timeline ||
      brief.projectDetails ||
      brief.needsPhotoSession ||
      brief.photoSessionType ||
      brief.otherContentType ||
      brief.vision ||
      brief.internalNotes ||
      brief.privateNotes ||
      brief.selectedServices?.length ||
      brief.goals?.length ||
      brief.currentProblems?.length ||
      brief.assetsAvailable?.length ||
      brief.contentTypes?.length
  );
}

function ProjectDetailTabs({ activeTab, onTabChange }) {
  return (
    <div className="border-b border-[var(--app-border)]">
      <div
        role="tablist"
        aria-label="Project detail sections"
        className="flex gap-6 overflow-x-auto"
      >
        {projectDetailTabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.key)}
              className={`relative min-h-11 shrink-0 touch-manipulation pb-3 text-sm font-black tracking-normal transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020407] ${
                isActive
                  ? "text-[#5cf4ec]"
                  : "text-slate-500 hover:text-slate-200"
              }`}
            >
              {tab.label}

              {isActive && (
                <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[#5cf4ec] shadow-[0_0_18px_rgba(92,244,236,0.75)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DetailCard({ eyebrow, children, className = "" }) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-white/10 bg-white/[0.035] p-4 ${className}`}
    >
      {eyebrow && (
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5cf4ec]">
          {eyebrow}
        </p>
      )}

      <div className={eyebrow ? "mt-3" : ""}>{children}</div>
    </div>
  );
}

function DetailField({ label, value, fallback = "Not added yet." }) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-white/10 bg-[#050b12] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-line break-words text-sm font-black leading-5 text-white">
        {value || fallback}
      </p>
    </div>
  );
}

function TagList({ items = [], emptyText = "Nothing selected yet." }) {
  if (!items?.length) {
    return (
      <p className="text-sm font-semibold leading-6 text-slate-400">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-300"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function EmptyBriefState({ message = "No project brief data added yet." }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-white/10 bg-[#050b12] p-4">
      <p className="text-sm font-semibold leading-6 text-slate-400">
        {message}
      </p>
    </div>
  );
}

function ProjectOverviewTab({ project }) {
  const displayProgress = getDisplayProgress(project);

  return (
    <div className="space-y-3.5">
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <DetailCard>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            Status
          </p>

          <div className="mt-2">
            <StatusBadge>{project.status}</StatusBadge>
          </div>
        </DetailCard>

        <DetailField label="Priority" value={project.priority} />
        <DetailField label="Due" value={project.dueDate} />

        <DetailCard>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
              Progress
            </p>

            <p className="text-sm font-black text-white">{displayProgress}%</p>
          </div>

          <ProgressBar value={displayProgress} size="compact" />
        </DetailCard>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <DetailField label="Client" value={project.clientName} />
        <DetailField label="Project" value={project.name} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <DetailCard eyebrow="Description">
          <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-300">
            {project.description}
          </p>
        </DetailCard>

        <DetailCard eyebrow="Project Notes">
          <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-300">
            {project.notes}
          </p>
        </DetailCard>
      </div>
    </div>
  );
}

function ProjectBriefTab({ brief }) {
  if (!hasBriefData(brief)) {
    return <EmptyBriefState />;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <DetailField
          label="Business Description"
          value={brief.businessDescription}
        />
        <DetailField label="Target Audience" value={brief.targetAudience} />
        <DetailField label="Service Area" value={brief.serviceArea} />
        <DetailField label="Current Website" value={brief.currentWebsite} />
        <DetailField
          label="Google Business Profile"
          value={brief.googleBusinessProfileUrl}
        />
        <DetailField label="Social Links" value={brief.socialLinks} />
        <DetailField label="Budget Range" value={brief.budgetRange} />
        <DetailField label="Timeline" value={brief.timeline} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <DetailCard eyebrow="Project Details / Problem">
          <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-300">
            {brief.projectDetails || "Not added yet."}
          </p>
        </DetailCard>

        <DetailCard eyebrow="Success Definition">
          <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-300">
            {brief.successDefinition || "Not added yet."}
          </p>
        </DetailCard>
      </div>
    </div>
  );
}

function ProjectNeedsTab({ brief }) {
  if (!hasBriefData(brief)) {
    return <EmptyBriefState message="No needs, goals, or current problems added yet." />;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <DetailCard eyebrow="Selected Services">
        <TagList items={brief.selectedServices} />
      </DetailCard>

      <DetailCard eyebrow="Goals">
        <TagList items={brief.goals} />
      </DetailCard>

      <DetailCard eyebrow="Current Problems">
        <TagList items={brief.currentProblems} />
      </DetailCard>
    </div>
  );
}

function ProjectAssetsTab({ brief }) {
  return (
    <div className="space-y-3">
      <DetailCard eyebrow="Assets Available">
        <TagList items={brief.assetsAvailable} />
      </DetailCard>

      <div className="rounded-[var(--radius-md)] border border-amber-300/15 bg-amber-300/10 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100">
          Security Reminder
        </p>

        <p className="mt-2 text-sm font-semibold leading-6 text-amber-100/85">
          This dashboard should only track whether access/assets exist. Do not
          store passwords, 2FA codes, bank info, or private credentials here.
        </p>
      </div>
    </div>
  );
}

function ProjectPhotoTab({ brief }) {
  if (!hasBriefData(brief)) {
    return <EmptyBriefState message="No photo or video planning details added yet." />;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <DetailField
          label="Needs Photo Session"
          value={brief.needsPhotoSession}
        />
        <DetailField label="Session Type" value={brief.photoSessionType} />
        <DetailField
          label="Other Content Type"
          value={brief.otherContentType}
        />
      </div>

      <DetailCard eyebrow="Content Types">
        <TagList items={brief.contentTypes} />
      </DetailCard>

      <DetailCard eyebrow="Vision">
        <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-300">
          {brief.vision || "Not added yet."}
        </p>
      </DetailCard>
    </div>
  );
}

function ProjectNotesTab({ project, brief }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <DetailCard eyebrow="Project Notes">
        <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-300">
          {project.notes}
        </p>
      </DetailCard>

      <DetailCard eyebrow="Internal Brief Notes">
        <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-300">
          {brief.internalNotes || "No internal brief notes added yet."}
        </p>
      </DetailCard>

      <div className="md:col-span-2">
        <DetailCard eyebrow="Private Notes">
          <div className="rounded-[var(--radius-md)] border border-red-300/15 bg-red-400/10 p-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-100">
              Internal Only
            </p>

            <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-red-100/85">
              {brief.privateNotes ||
                "No private notes added yet. Private notes should never be exposed to a future client portal."}
            </p>
          </div>
        </DetailCard>
      </div>
    </div>
  );
}

function ProjectActivityTab() {
  return (
    <DetailCard eyebrow="Activity Timeline">
      <EmptyBriefState message="Activity logs are not connected yet. Later this will show project-created, brief-updated, status-changed, completed, archived, and client-related events." />
    </DetailCard>
  );
}

function ProjectDetailsContent({ activeTab, project }) {
  const brief = project.brief || {};

  if (activeTab === "brief") {
    return <ProjectBriefTab brief={brief} />;
  }

  if (activeTab === "needs") {
    return <ProjectNeedsTab brief={brief} />;
  }

  if (activeTab === "assets") {
    return <ProjectAssetsTab brief={brief} />;
  }

  if (activeTab === "photo") {
    return <ProjectPhotoTab brief={brief} />;
  }

  if (activeTab === "notes") {
    return <ProjectNotesTab project={project} brief={brief} />;
  }

  if (activeTab === "activity") {
    return <ProjectActivityTab />;
  }

  return <ProjectOverviewTab project={project} />;
}

function DetailsModal({ project, onClose, onOpenEdit }) {
  const [activeDetailTab, setActiveDetailTab] = useState("overview");

  useEffect(() => {
    if (project?.id) {
      setActiveDetailTab("overview");
    }
  }, [project?.id]);

  if (!project) {
    return null;
  }

  return (
    <DashboardModal
      open={Boolean(project)}
      eyebrow="Project Details"
      title={getProjectTitle(project)}
      description={`Client: ${project.clientName}`}
      maxWidth="max-w-6xl"
      onClose={onClose}
      closeLabel="Close project details"
      footer={
        <>
          <CompactActionButton
            type="button"
            variant="secondary"
            onClick={() => onOpenEdit(project)}
          >
            Edit Project
          </CompactActionButton>

          <CompactActionButton type="button" variant="secondary" onClick={onClose}>
            Close
          </CompactActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <ProjectDetailTabs
          activeTab={activeDetailTab}
          onTabChange={setActiveDetailTab}
        />

        <ProjectDetailsContent activeTab={activeDetailTab} project={project} />
      </div>
    </DashboardModal>
  );
}

function ProjectFormModal({ project, open, onClose }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let ignore = false;

    async function loadClients() {
      setLoadingClients(true);

      try {
        const response = await fetch("/api/project-options");
        const data = await response.json();

        if (!ignore) {
          setClients(data.clients || []);
        }
      } catch {
        if (!ignore) {
          setClients([]);
        }
      } finally {
        if (!ignore) {
          setLoadingClients(false);
        }
      }
    }

    loadClients();

    return () => {
      ignore = true;
    };
  }, [open]);

  if (!open || !project) {
    return null;
  }

  return (
    <DashboardModal
      open={open}
      eyebrow="Project Management"
      title="Edit Project"
      description="Update project details, linked client, status, priority, due date, and internal notes."
      maxWidth="max-w-3xl"
      onClose={onClose}
      closeLabel="Close edit project form"
      footer={
        <>
          <CompactActionButton
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </CompactActionButton>

          <CompactActionButton
            type="submit"
            form="edit-project-form"
            variant="primary"
          >
            Save Changes
          </CompactActionButton>
        </>
      }
    >
      <form
        id="edit-project-form"
        action={updateProject}
        onSubmit={() => {
          onClose();
        }}
        className="space-y-5"
      >
        <input type="hidden" name="projectId" value={project.id} />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Project Name" required>
            <input
              name="projectName"
              required
              defaultValue={emptyField(project.name)}
              placeholder="Website refresh, dashboard build, content package..."
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Existing Client">
            <select
              name="clientId"
              className="dvs-form-input"
              defaultValue={project.clientId || ""}
            >
              <option value="">
                {loadingClients
                  ? "Loading clients..."
                  : "No existing client selected"}
              </option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="New Client Name">
            <input
              name="newClientName"
              placeholder="Type new client name to create and link"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Status">
            <select
              name="status"
              defaultValue={project.rawStatus || "in_progress"}
              className="dvs-form-input"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_on_client">Waiting on Client</option>
              <option value="ready_for_review">Ready for Review</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>

          <FormField label="Priority">
            <select
              name="priority"
              defaultValue={project.rawPriority || "medium"}
              className="dvs-form-input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </FormField>

          <FormField label="Due Date">
            <input
              name="dueDate"
              type="date"
              defaultValue={project.dueDateInput || ""}
              className="dvs-form-input"
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Description">
            <textarea
              name="description"
              rows="3"
              defaultValue={emptyField(project.description)}
              placeholder="Project scope, deliverables, or goals..."
              className="dvs-form-input resize-none"
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              name="notes"
              rows="3"
              defaultValue={emptyField(project.notes)}
              placeholder="Internal notes or next steps..."
              className="dvs-form-input resize-none"
            />
          </FormField>
        </div>
        <ProjectBriefFields brief={project.brief || {}} />
      </form>
    </DashboardModal>
  );
}

export default function ProjectsList({ projects = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsProject, setDetailsProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
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

      return (a.dueDateInput || "9999-12-31").localeCompare(
        b.dueDateInput || "9999-12-31"
      );
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

  function openEditProject(project) {
    setDetailsProject(null);
    setEditingProject(project);
    setProjectFormOpen(true);
  }

  function closeProjectForm() {
  setEditingProject(null);
  setProjectFormOpen(false);

  window.setTimeout(() => {
    router.refresh();
  }, 250);
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
              onOpenEdit={openEditProject}
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
        onOpenEdit={openEditProject}
      />

      <ProjectFormModal
        project={editingProject}
        open={projectFormOpen}
        onClose={closeProjectForm}
      />
    </>
  );
}