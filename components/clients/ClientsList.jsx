"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button.jsx";
import CompactActionButton from "../ui/CompactActionButton.jsx";
import DashboardModal from "../ui/DashboardModal.jsx";
import FormField from "../ui/FormField.jsx";
import SmartMenu, { SmartMenuItem } from "../ui/SmartMenu.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import {
  archiveSelectedClients,
  createClientRecord,
  deleteSelectedClients,
  moveSelectedClientsToActive,
  updateClientRecord,
  archiveSingleClient,
  deleteSingleClient,
  moveSingleClientToActive,
} from "../../app/(dashboard)/clients/actions.js";

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

function ClientLogo({ client }) {
  if (client.logoUrl) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[#5cf4ec]/25 bg-white/[0.035]">
        <img
          src={client.logoUrl}
          alt={`${client.businessName} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[#5cf4ec]/25 bg-[#5cf4ec]/10 text-sm font-black text-[#5cf4ec]">
      {client.initials}
    </div>
  );
}

function ClientPortfolioLogo({ client }) {
  if (client.logoUrl) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[#5cf4ec]/25 bg-white/[0.035] shadow-[0_0_24px_rgba(92,244,236,0.12)]">
        <img
          src={client.logoUrl}
          alt=""
          className="h-full w-full object-contain"
          loading="lazy"
          draggable="false"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-[#5cf4ec]/25 bg-[#5cf4ec]/10 text-lg font-black text-[#5cf4ec] shadow-[0_0_24px_rgba(92,244,236,0.12)]">
      {client.initials}
    </div>
  );
}

function ClientLogoPreview({ client }) {
  return (
    <div className="flex items-center gap-3">
      <ClientLogo client={client} />

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5cf4ec]">
          Client Logo
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          {client?.logoUrl ? "Logo uploaded" : "Using initials fallback"}
        </p>
      </div>
    </div>
  );
}

const portfolioTabs = [
  { key: "overview", label: "Overview" },
  { key: "business", label: "Business" },
  { key: "needs", label: "Needs" },
  { key: "projects", label: "Projects" },
  { key: "intake", label: "Intake" },
  { key: "notes", label: "Notes" },
  { key: "activity", label: "Activity" },
];

const placeholderNeeds = [
  "Web Development",
  "Website Redesign",
  "Lead Generation",
  "Custom System / Dashboard",
  "Client Portal",
  "Booking or Intake System",
  "Quote Request System",
  "Automation / Lead Flow",
  "Booking or Payment System",
  "SEO/AEO / GBP",
  "Photo / Video",
  "Content Launch Pack",
  "Tech Support",
  "App or Software Idea",
  "Not Sure Yet",
];

const placeholderGoals = [
  "Look more professional",
  "Get more leads",
  "Book more appointments",
  "Improve Google visibility",
  "Organize customer info",
  "Automate follow-up",
  "Launch a new offer",
  "Fix outdated web presence",
  "Create better visuals",
  "Build a custom system",
];

const placeholderProblems = [
  "Not getting enough leads",
  "Website looks outdated",
  "Customers are confused",
  "No clear booking process",
  "Leads are getting lost",
  "Too much manual follow-up",
  "No organized dashboard",
  "No good photos/content",
  "Poor Google visibility",
  "Need a better system behind the business",
];

const placeholderAssets = [
  "Logo",
  "Brand colors",
  "Photos",
  "Videos",
  "Written content",
  "Domain",
  "Website login",
  "Hosting login",
  "Google Business Profile access",
  "Social media access",
  "Email platform",
  "CRM/spreadsheet",
  "None yet",
];

function PortfolioTabs({ activeTab, onTabChange }) {
  return (
    <div className="border-b border-[var(--app-border)]">
      <div
        role="tablist"
        aria-label="Client portfolio sections"
        className="flex gap-6 overflow-x-auto"
      >
        {portfolioTabs.map((tab) => {
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

function PortfolioCard({ eyebrow, title, children, className = "" }) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4 ${className}`}
    >
      {eyebrow && (
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5cf4ec]">
          {eyebrow}
        </p>
      )}

      {title && <h3 className="mt-1 text-base font-black text-white">{title}</h3>}

      <div className={eyebrow || title ? "mt-3" : ""}>{children}</div>
    </div>
  );
}

function PortfolioField({ label, value, fallback = "Not added yet." }) {
  const displayValue = value || fallback;

  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-white/10 bg-[#050b12] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-black leading-5 text-white">
        {displayValue}
      </p>
    </div>
  );
}

function PlaceholderPanel({ title, description, items = [] }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-white/10 bg-[#050b12] p-4">
      <p className="text-sm font-black text-white">{title}</p>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">
        {description}
      </p>

      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectProgressBar({ progress }) {
  const safeProgress = Math.min(Math.max(Number(progress) || 0, 0), 100);

  return (
    <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-white/[0.09]">
      <div
        className="h-full rounded-full bg-[#5cf4ec] shadow-[0_0_12px_rgba(92,244,236,0.55)]"
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
}

function ProjectCard({ project }) {
  const safeProgress = Math.min(Math.max(Number(project.progress) || 0, 0), 100);

  return (
    <div className="rounded-[var(--radius-md)] border border-white/10 bg-[#050b12] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{project.name}</p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            {project.status} · {project.dueDate}
          </p>

          {project.priority && (
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
              {project.priority} Priority
            </p>
          )}
        </div>

        <span className="shrink-0 text-xs font-black text-slate-300">
          {safeProgress}%
        </span>
      </div>

      <ProjectProgressBar progress={safeProgress} />
    </div>
  );
}

function ClientProjectsPanel({ client, onCreateProject }) {
  const projects = client?.linkedProjects || [];
  const summary = client?.projectSummary || {
    total: projects.length,
    active: projects.filter(
      (project) => !["completed", "archived"].includes(project.rawStatus)
    ).length,
    completed: projects.filter((project) => project.rawStatus === "completed")
      .length,
    urgentProject: projects[0] || null,
  };

  return (
    <PortfolioCard eyebrow="Linked Projects">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-black text-white">
            {summary.total} project{summary.total === 1 ? "" : "s"}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-400">
            {summary.active} active · {summary.completed} completed
          </p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onCreateProject(client);
          }}
          className="inline-flex min-h-10 shrink-0 touch-manipulation items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-[#071018] px-4 py-2 text-sm font-black text-white transition hover:border-[#5cf4ec]/35 hover:bg-[#0b1722] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020407]"
        >
          Create Project
        </button>
      </div>

      {summary.urgentProject && (
        <div className="mb-3 rounded-[var(--radius-md)] border border-[#5cf4ec]/20 bg-[#5cf4ec]/[0.055] p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#5cf4ec]">
            Priority Snapshot
          </p>

          <p className="mt-1 truncate text-sm font-black text-white">
            {summary.urgentProject.name}
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            {summary.urgentProject.status} · {summary.urgentProject.dueDate}
          </p>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-white/10 bg-[#050b12] p-4">
          <p className="text-sm font-semibold leading-6 text-slate-400">
            No linked projects yet. Use the Create Project button above to start
            the first project for this client.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 xl:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </PortfolioCard>
  );
}

function OverviewTab({ client }) {
  const summary = client.projectSummary || {
    total: 0,
    active: 0,
    completed: 0,
    urgentProject: null,
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <PortfolioField label="Status" value={client.status} />
          <PortfolioField label="Email" value={client.email} />
          <PortfolioField label="Phone" value={client.phone} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <PortfolioField label="Location" value={client.location} />

          <PortfolioCard eyebrow="Website">
            {client.website ? (
              <a
                href={client.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 touch-manipulation items-center rounded-[var(--radius-md)] border border-[#5cf4ec]/30 bg-[#5cf4ec]/10 px-3 text-xs font-black uppercase tracking-[0.18em] text-[#5cf4ec] transition hover:bg-[#5cf4ec]/15 hover:text-white"
              >
                Visit Website
              </a>
            ) : (
              <p className="text-sm font-semibold leading-6 text-slate-400">
                No website added.
              </p>
            )}
          </PortfolioCard>
        </div>
      </div>

      <PortfolioCard eyebrow="Portfolio Snapshot">
        <div className="grid gap-2">
          <PortfolioField label="Active Projects" value={String(summary.active)} />
          <PortfolioField
            label="Completed Projects"
            value={String(summary.completed)}
          />
          <PortfolioField
            label="Priority Project"
            value={summary.urgentProject?.name || ""}
          />
        </div>
      </PortfolioCard>
    </div>
  );
}

function BusinessTab({ client }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <PortfolioCard eyebrow="Business Snapshot">
        <div className="grid gap-3">
          <PortfolioField label="Business Name" value={client.businessName} />
          <PortfolioField label="Contact Name" value={client.name} />
          <PortfolioField label="Service Area" value={client.location} />
          <PortfolioField label="Current Website" value={client.website} />
        </div>
      </PortfolioCard>

      <PortfolioCard eyebrow="Future Intake Fields">
        <PlaceholderPanel
          title="Business context will come from intake."
          description="These fields are not stored on the client record yet. They should be collected through Intake or New Project brief records so the client portfolio stays clean."
          items={[
            "What does the business do?",
            "Who do they serve?",
            "Google Business Profile",
            "Social links",
            "Preferred contact",
            "Best time to reach",
          ]}
        />
      </PortfolioCard>
    </div>
  );
}

function NeedsTab() {
  return (
    <div className="space-y-3">
      <PlaceholderPanel
        title="Needs and goals will be connected through Intake and Project Briefs."
        description="Most of these fields should live on the intake submission or new project record, then surface here inside the Client Portfolio."
      />

      <PortfolioCard eyebrow="Potential Services">
        <div className="flex flex-wrap gap-2">
          {placeholderNeeds.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400"
            >
              {item}
            </span>
          ))}
        </div>
      </PortfolioCard>

      <div className="grid gap-3 lg:grid-cols-2">
        <PortfolioCard eyebrow="Goals">
          <div className="flex flex-wrap gap-2">
            {placeholderGoals.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400"
              >
                {item}
              </span>
            ))}
          </div>
        </PortfolioCard>

        <PortfolioCard eyebrow="Current Problems">
          <div className="flex flex-wrap gap-2">
            {placeholderProblems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400"
              >
                {item}
              </span>
            ))}
          </div>
        </PortfolioCard>
      </div>
    </div>
  );
}

function IntakeTab() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <PortfolioCard eyebrow="Latest Intake">
        <PlaceholderPanel
          title="No intake submission linked yet."
          description="Later, the private client intake form should save into Supabase, link to this client, and show the full submission here."
          items={[
            "Budget range",
            "Timeline",
            "Project details",
            "Photo session",
            "Vision",
          ]}
        />
      </PortfolioCard>

      <PortfolioCard eyebrow="Assets + Access">
        <PlaceholderPanel
          title="Assets checklist will live on intake or project briefs."
          description="This should not become random text on the client profile. It should be structured and connected to the specific project."
          items={placeholderAssets}
        />
      </PortfolioCard>
    </div>
  );
}

function NotesTab({ client }) {
  return (
    <PortfolioCard eyebrow="Internal Notes">
      <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-300">
        {client.notes}
      </p>
    </PortfolioCard>
  );
}

function ActivityTab() {
  return (
    <PortfolioCard eyebrow="Activity Timeline">
      <PlaceholderPanel
        title="Activity history is not connected yet."
        description="Later this tab should show client-created, lead-converted, project-created, project-completed, intake-submitted, note-added, and file-upload events."
        items={[
          "Client created",
          "Lead converted",
          "Project created",
          "Project completed",
          "Intake submitted",
          "Logo updated",
        ]}
      />
    </PortfolioCard>
  );
}

function ClientPortfolioContent({ client, activeTab, onCreateProject }) {
  if (activeTab === "business") {
    return <BusinessTab client={client} />;
  }

  if (activeTab === "needs") {
    return <NeedsTab />;
  }

  if (activeTab === "projects") {
    return (
      <ClientProjectsPanel client={client} onCreateProject={onCreateProject} />
    );
  }

  if (activeTab === "intake") {
    return <IntakeTab />;
  }

  if (activeTab === "notes") {
    return <NotesTab client={client} />;
  }

  if (activeTab === "activity") {
    return <ActivityTab />;
  }

  return <OverviewTab client={client} />;
}

function ClientDetailsModal({ client, onClose, onOpenEdit, onCreateProject }) {
  const [activePortfolioTab, setActivePortfolioTab] = useState("overview");

  useEffect(() => {
    if (client?.id) {
      setActivePortfolioTab("overview");
    }
  }, [client?.id]);

  if (!client) {
    return null;
  }

  return (
    <DashboardModal
      open={Boolean(client)}
      eyebrow="Client Portfolio"
title="Client Portfolio"
description="Master client record, projects, intake, notes, and activity."
      maxWidth="max-w-6xl"
      onClose={onClose}
      closeLabel="Close client portfolio"
      footer={
        <>
          <CompactActionButton
            type="button"
            variant="secondary"
            onClick={() => onOpenEdit(client)}
          >
            Edit Client
          </CompactActionButton>

          <CompactActionButton type="button" variant="secondary" onClick={onClose}>
            Close
          </CompactActionButton>
        </>
      }
    >
      <div className="space-y-4">
  <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-white/[0.025] p-4">
    <ClientPortfolioLogo client={client} />

    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#5cf4ec]">
        Master Client Record
      </p>

      <h3 className="mt-1 truncate text-xl font-black text-white">
        {client.businessName}
      </h3>

      <p className="mt-1 truncate text-sm font-semibold text-slate-400">
        Contact: {client.name}
      </p>
    </div>
  </div>

  <PortfolioTabs
    activeTab={activePortfolioTab}
    onTabChange={setActivePortfolioTab}
  />

  <ClientPortfolioContent
    client={client}
    activeTab={activePortfolioTab}
    onCreateProject={onCreateProject}
  />
</div>
    </DashboardModal>
  );
}

function getTabClients(clients, activeTab) {
  if (activeTab === "archive") {
    return clients.filter((client) => client.isArchived);
  }

  return clients.filter((client) => !client.isArchived);
}

function emptyField(value, fallback = "") {
  if (
    value === "No email" ||
    value === "No phone" ||
    value === "No notes added yet." ||
    value === "Unnamed Client" ||
    value === "Unnamed Business"
  ) {
    return fallback;
  }

  return value || fallback;
}

function ClientTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { key: "active", label: "Active", count: counts.active },
    { key: "archive", label: "Archive", count: counts.archive },
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

function FilterBar({ searchValue, onSearchChange, statusValue, onStatusChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative block w-full sm:w-[320px]">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-text-soft)]">
          <SearchIcon />
        </span>

        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search clients..."
          className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] pl-10 pr-4 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-soft)] focus:border-[var(--app-border-strong)]"
        />
      </label>

      <select
        value={statusValue}
        onChange={(event) => onStatusChange(event.target.value)}
        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-3 text-sm font-bold text-[var(--app-text)] outline-none transition focus:border-[var(--app-border-strong)] sm:w-[160px]"
      >
        <option className="bg-[#071018]" value="all">
          All Status
        </option>
        <option className="bg-[#071018]" value="active">
          Active
        </option>
        <option className="bg-[#071018]" value="archived">
          Archived
        </option>
      </select>
    </div>
  );
}

function BatchToolbar({ selectedIds, activeTab, onClearSelection }) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setDeleteOpen(false);
    }
  }, [selectedIds.length]);

  if (selectedIds.length === 0) {
    return null;
  }

  const selectedJson = JSON.stringify(selectedIds);

  function handleActionSubmit() {
    setDeleteOpen(false);
    onClearSelection();
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--app-border-strong)] bg-[#071018] p-3 shadow-[0_0_28px_rgba(92,244,236,0.12)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-black text-[var(--app-text)]">
        {selectedIds.length} client{selectedIds.length === 1 ? "" : "s"}{" "}
        selected
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {activeTab === "archive" ? (
          <form action={moveSelectedClientsToActive} onSubmit={handleActionSubmit}>
            <input type="hidden" name="clientIds" value={selectedJson} />

            <Button type="submit" size="sm">
              Mark Active
            </Button>
          </form>
        ) : (
          <form action={archiveSelectedClients} onSubmit={handleActionSubmit}>
            <input type="hidden" name="clientIds" value={selectedJson} />

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
            onClick={() => setDeleteOpen((current) => !current)}
          >
            <TrashIcon />
            Delete
          </Button>

          {deleteOpen && (
            <div className="absolute right-0 z-30 mt-2 w-48 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.65)]">
              <p className="px-3 py-2 text-xs font-bold text-slate-400">
                This permanently deletes selected clients.
              </p>

              <form action={deleteSelectedClients} onSubmit={handleActionSubmit}>
                <input type="hidden" name="clientIds" value={selectedJson} />

                <button
                  type="submit"
                  onClick={(event) => {
                    if (
                      !window.confirm(
                        "Delete selected clients permanently? This cannot be undone."
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

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setDeleteOpen(false);
            onClearSelection();
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

function RowActions({ client, onOpenDetails, onOpenEdit }) {
  return (
    <div className="flex items-center justify-start gap-2 lg:justify-end">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => onOpenDetails(client)}
      >
        View
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => onOpenEdit(client)}
      >
        Edit
      </Button>

      <SmartMenu
        label={`More actions for ${client.businessName}`}
        button={<DotsIcon />}
        width={160}
        estimatedHeight={120}
      >
        {client.isArchived ? (
          <form action={moveSingleClientToActive}>
            <input type="hidden" name="clientId" value={client.id} />

            <SmartMenuItem type="submit">Mark Active</SmartMenuItem>
          </form>
        ) : (
          <form action={archiveSingleClient}>
            <input type="hidden" name="clientId" value={client.id} />

            <SmartMenuItem type="submit">Archive</SmartMenuItem>
          </form>
        )}

        <form action={deleteSingleClient}>
          <input type="hidden" name="clientId" value={client.id} />

          <SmartMenuItem
            type="submit"
            tone="danger"
            onClick={(event) => {
              if (
                !window.confirm(
                  "Delete this client permanently? This cannot be undone."
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
    </div>
  );
}

function ClientRow({
  client,
  isSelected,
  onToggleSelected,
  onOpenDetails,
  onOpenEdit,
}) {
  return (
    <article
      className={`grid gap-4 border-b border-[var(--app-border)] px-4 py-4 transition last:border-b-0 hover:bg-white/[0.035] lg:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.95fr)_auto] lg:items-center ${
        client.isArchived ? "opacity-75" : ""
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelected(client.id)}
          aria-label={`Select ${client.businessName}`}
          className="mt-4 h-4 w-4 accent-[var(--app-accent)]"
        />

        <ClientLogo client={client} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="truncate text-base font-black text-[var(--app-text)]">
              {client.businessName}
            </h3>

            <StatusBadge>{client.status}</StatusBadge>
          </div>

          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
            Contact: {client.name}
          </p>

          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
            {client.notes}
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-black/20 p-3 text-sm">
        <p className="break-words font-semibold text-[var(--app-text)]">
          {client.email}
        </p>

        <p className="mt-1 text-[var(--app-text-muted)]">{client.phone}</p>

        {client.location && (
          <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[var(--app-text-muted)]">
            {client.location}
          </p>
        )}
      </div>

      <RowActions
        client={client}
        onOpenDetails={onOpenDetails}
        onOpenEdit={onOpenEdit}
      />
    </article>
  );
}

function ClientDirectory({
  clients,
  selectedIds,
  onToggleSelected,
  onOpenDetails,
  onOpenEdit,
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-[#050a10]">
      {clients.length > 0 ? (
        clients.map((client) => (
          <ClientRow
            key={client.id}
            client={client}
            isSelected={selectedIds.includes(client.id)}
            onToggleSelected={onToggleSelected}
            onOpenDetails={onOpenDetails}
            onOpenEdit={onOpenEdit}
          />
        ))
      ) : (
        <div className="p-8 text-center text-sm text-[var(--app-text-muted)]">
          No clients found for this view.
        </div>
      )}
    </div>
  );
}

function ClientFormModal({ open, client, onClose }) {
  if (!open) {
    return null;
  }

  const isEditing = Boolean(client?.id);
  const action = isEditing ? updateClientRecord : createClientRecord;
  const formId = isEditing ? "edit-client-form" : "new-client-form";

  return (
    <DashboardModal
      open={open}
      eyebrow="Client Profile"
      title={isEditing ? "Edit Client" : "New Client"}
      description={
        isEditing
          ? "Update client contact info, status, notes, and account details."
          : "Create a client profile that can be linked to projects, CRM leads, invoices, and future portal activity."
      }
      maxWidth="max-w-3xl"
      onClose={onClose}
      closeLabel={isEditing ? "Close edit client form" : "Close new client form"}
      footer={
        <>
          <CompactActionButton
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </CompactActionButton>

          <CompactActionButton type="submit" form={formId} variant="primary">
            {isEditing ? "Save Changes" : "Save Client"}
          </CompactActionButton>
        </>
      }
    >
      <form
  id={formId}
  action={action}
  onSubmit={onClose}
  className="space-y-4"
>
        {isEditing && <input type="hidden" name="clientId" value={client.id} />}
        <input type="hidden" name="existingLogoPath" value={client?.logoPath || ""} />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Business Name" required>
            <input
              name="businessName"
              required
              defaultValue={emptyField(client?.businessName)}
              placeholder="Business or organization name"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Contact Name">
            <input
              name="contactName"
              defaultValue={emptyField(client?.name)}
              placeholder="Primary contact name"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Email">
            <input
              name="email"
              type="email"
              defaultValue={emptyField(client?.email)}
              placeholder="email@example.com"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Phone">
            <input
              name="phone"
              defaultValue={emptyField(client?.phone)}
              placeholder="(555) 000-0000"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Website">
  <input
    name="website"
    defaultValue={emptyField(client?.website)}
    placeholder="example.com"
    className="dvs-form-input"
  />
</FormField>

<FormField label="Location">
  <input
    name="location"
    defaultValue={client?.location || ""}
    placeholder="City, State"
    className="dvs-form-input"
  />
</FormField>

<FormField label="Status">
  <select
    name="status"
    defaultValue={client?.rawStatus || "active"}
    className="dvs-form-input"
  >
    <option value="lead">Lead</option>
    <option value="active">Active</option>
    <option value="past">Past</option>
    <option value="archived">Archived</option>
  </select>
</FormField>

<FormField
  label="Upload Logo"
  description={
    client?.logoPath
      ? "Upload a new logo or remove the current one."
      : "PNG, JPG, WEBP, or SVG. Max 5MB."
  }
>
  <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.025] p-3">
    {client && (
      <div className="mb-3 flex items-center justify-between gap-3">
        <ClientLogoPreview client={client} />

        {client.logoUrl && (
          <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-red-300/25 bg-red-400/10 px-3 text-xs font-black uppercase tracking-[0.14em] text-red-200">
            <input
              type="checkbox"
              name="removeLogo"
              className="accent-red-300"
            />
            Remove
          </label>
        )}
      </div>
    )}

    <input
      name="logoFile"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/svg+xml"
      className="block w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-3 py-2.5 text-sm font-semibold text-[var(--app-text-muted)] file:mr-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-[#5cf4ec] file:px-3 file:py-2 file:text-xs file:font-black file:text-[#031012] hover:border-[#5cf4ec]/35"
    />
  </div>
</FormField>

        </div>
      
        <FormField label="Notes">
          <textarea
            name="notes"
            rows="4"
            defaultValue={emptyField(client?.notes)}
            placeholder="Add account notes, preferences, context, or next steps..."
            className="dvs-form-input resize-none"
          />
        </FormField>
      </form>
    </DashboardModal>
  );
}

export default function ClientsList({ clients = [] }) {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsClient, setDetailsClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");

  useEffect(() => {
    function handleOpenNewClient() {
      setDetailsClient(null);
      setEditingClient(null);
      setClientFormOpen(true);
    }

    window.addEventListener("dvs-open-new-client", handleOpenNewClient);

    return () => {
      window.removeEventListener("dvs-open-new-client", handleOpenNewClient);
    };
  }, []);

  const counts = useMemo(
    () => ({
      active: clients.filter((client) => !client.isArchived).length,
      archive: clients.filter((client) => client.isArchived).length,
    }),
    [clients]
  );
useEffect(() => {
  setSelectedIds((currentIds) => {
    if (currentIds.length === 0) {
      return currentIds;
    }

    const existingClientIds = new Set(clients.map((client) => client.id));
    const nextIds = currentIds.filter((id) => existingClientIds.has(id));

    return nextIds.length === currentIds.length ? currentIds : nextIds;
  });
}, [clients]);

  const visibleClients = useMemo(() => {
    let nextClients = getTabClients(clients, activeTab);

    if (searchValue.trim()) {
      const normalizedSearch = searchValue.toLowerCase();

      nextClients = nextClients.filter((client) => {
        return (
          client.businessName.toLowerCase().includes(normalizedSearch) ||
          client.name.toLowerCase().includes(normalizedSearch) ||
          client.email.toLowerCase().includes(normalizedSearch) ||
          client.phone.toLowerCase().includes(normalizedSearch) ||
          client.notes.toLowerCase().includes(normalizedSearch)
        );
      });
    }

    if (statusValue !== "all") {
      nextClients = nextClients.filter(
        (client) => client.rawStatus === statusValue
      );
    }

    return nextClients;
  }, [activeTab, clients, searchValue, statusValue]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSelectedIds([]);
  }

  function handleToggleSelected(clientId) {
    setSelectedIds((currentIds) =>
      currentIds.includes(clientId)
        ? currentIds.filter((id) => id !== clientId)
        : [...currentIds, clientId]
    );
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  function openEditClient(client) {
    setDetailsClient(null);
    setEditingClient(client);
    setClientFormOpen(true);
  }

  function closeClientForm() {
    setEditingClient(null);
    setClientFormOpen(false);
  }

  function handleCreateProjectForClient(client) {
  if (!client?.id) {
    return;
  }

  setDetailsClient(null);

  window.setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent("dvs-open-new-project", {
        detail: {
          clientId: client.id,
          clientName: client.businessName,
        },
      })
    );
  }, 0);
}

  return (
    <>
      <div className="rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-gradient-to-br from-white/[0.045] via-white/[0.025] to-cyan-300/[0.025] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
        <div className="space-y-5">
          <ClientTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={counts}
          />

          <FilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            statusValue={statusValue}
            onStatusChange={setStatusValue}
          />

          <BatchToolbar
            selectedIds={selectedIds}
            activeTab={activeTab}
            onClearSelection={clearSelection}
          />

          <ClientDirectory
            clients={visibleClients}
            selectedIds={selectedIds}
            onToggleSelected={handleToggleSelected}
            onOpenDetails={setDetailsClient}
            onOpenEdit={openEditClient}
          />

          <div className="text-sm text-[var(--app-text-muted)]">
            Showing {visibleClients.length} of{" "}
            {getTabClients(clients, activeTab).length} clients
          </div>
        </div>
      </div>

      <ClientDetailsModal
  client={detailsClient}
  onClose={() => setDetailsClient(null)}
  onOpenEdit={openEditClient}
  onCreateProject={handleCreateProjectForClient}
/>

      <ClientFormModal
        open={clientFormOpen}
        client={editingClient}
        onClose={closeClientForm}
      />
    </>
  );
}