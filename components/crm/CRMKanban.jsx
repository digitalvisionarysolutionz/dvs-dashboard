"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Button from "../ui/Button.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import SmartMenu, { SmartMenuItem } from "../ui/SmartMenu.jsx";
import { leadStages } from "../../lib/leadsData.js";
import {
  convertLeadToClient,
  createLead,
  deleteLead,
  moveLeadStage,
  restoreLead,
  updateLead,
} from "../../app/(dashboard)/crm/actions.js";

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

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M6 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
    </svg>
  );
}

function LeadAvatar({ lead }) {
  const tone =
    lead.rawPriority === "high"
      ? "from-violet-500 to-cyan-400"
      : lead.rawPriority === "low"
        ? "from-green-500 to-emerald-400"
        : "from-cyan-400 to-blue-500";

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br ${tone} text-xs font-black tracking-widest text-white shadow-[0_0_22px_rgba(92,244,236,0.18)]`}
    >
      {lead.initials}
    </div>
  );
}

function getPriorityTone(priority) {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";
  if (priority === "low") return "success";
  return "neutral";
}

function getStageLineClass(tone) {
  const tones = {
    cyan: "from-cyan-300 to-cyan-500",
    blue: "from-blue-300 to-cyan-400",
    violet: "from-violet-400 to-fuchsia-500",
    orange: "from-orange-300 to-orange-500",
    yellow: "from-yellow-300 to-yellow-500",
    green: "from-green-300 to-emerald-500",
    red: "from-red-300 to-red-500",
  };

  return tones[tone] || tones.cyan;
}

function SummaryCards({ summary }) {
  const cards = [
    {
      label: "Total Leads",
      value: summary.totalLeads,
      detail: "All CRM records",
    },
    {
      label: "Active Opportunities",
      value: summary.activeOpportunities,
      detail: "Still in motion",
    },
    {
      label: "Est. Value",
      value: summary.estimatedValue,
      detail: "Open pipeline value",
    },
    {
      label: "Follow-Ups Due",
      value: summary.followUpsDue,
      detail: "Needs attention",
    },
  ];

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-gradient-to-br from-white/[0.045] via-white/[0.025] to-cyan-300/[0.025] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.2)]"
        >
          <p className="text-sm font-bold text-[var(--app-text-muted)]">
            {card.label}
          </p>

          <p className="mt-4 text-3xl font-black tracking-tight text-white">
            {card.value}
          </p>

          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[var(--app-text-soft)]">
            {card.detail}
          </p>
        </article>
      ))}
    </section>
  );
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function downloadCsv(filename, rows) {
  const csvContent = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function exportLeadsToCsv(leads, filename = "dvs-crm-leads.csv") {
  const headers = [
    "Business Name",
    "Contact Name",
    "Email",
    "Phone",
    "Website",
    "Location",
    "Source",
    "Form Source",
    "Form Name",
    "Service Interest",
    "Stage",
    "Priority",
    "Estimated Value",
    "Next Follow-Up",
    "Notes",
    "Created Date",
    "Client Linked",
  ];

  const rows = leads.map((lead) => [
    lead.businessName,
    lead.contactName,
    lead.email,
    lead.phone,
    lead.website,
    lead.location,
    lead.source,
    lead.formSource,
    lead.formName,
    lead.serviceInterest,
    lead.stage,
    lead.priority,
    lead.estimatedValue,
    lead.nextFollowUp,
    lead.notes,
    lead.createdAt,
    lead.clientId ? "Yes" : "No",
  ]);

  downloadCsv(filename, [headers, ...rows]);
}

function CRMViewToggle({
  viewMode,
  onViewChange,
  pipelineCount,
  archiveCount,
  onExport,
}) {
  const views = [
    { key: "pipeline", label: "Pipeline", count: pipelineCount },
    { key: "archive", label: "Archive", count: archiveCount },
  ];

  return (
    <div className="mb-5 border-b border-[var(--app-border)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-8">
          {views.map((view) => {
            const isActive = viewMode === view.key;

            return (
              <button
                key={view.key}
                type="button"
                onClick={() => onViewChange(view.key)}
                className={`relative pb-4 text-sm font-black transition md:text-base ${
                  isActive
                    ? "text-[var(--app-accent)]"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                {view.label}

                <span className="ml-2 rounded-[var(--radius-pill)] bg-[var(--app-accent-soft)] px-2 py-0.5 text-xs font-black">
                  {view.count}
                </span>

                {isActive && (
                  <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[var(--app-accent)] shadow-[0_0_18px_rgba(92,244,236,0.75)]" />
                )}
              </button>
            );
          })}
        </div>

        <button
  type="button"
  onClick={onExport}
  className="h-10 w-fit whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-4 text-sm font-black text-[var(--app-text)] transition hover:border-[var(--app-border-strong)] hover:text-white"
>
  Export
</button>
      </div>
    </div>
  );
}

function CRMFilters({
  searchValue,
  onSearchChange,
  serviceValue,
  onServiceChange,
  sourceValue,
  onSourceChange,
  services,
  sources,
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <label
        className="relative block"
        style={{
          width: "360px",
          maxWidth: "100%",
        }}
      >
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-text-soft)]">
          <SearchIcon />
        </span>

        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search leads..."
          className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] pl-10 pr-4 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-soft)] focus:border-[var(--app-border-strong)]"
        />
      </label>

      <select
        value={serviceValue}
        onChange={(event) => onServiceChange(event.target.value)}
        style={{
          width: "220px",
          maxWidth: "100%",
        }}
        className="h-11 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-3 text-sm font-bold text-[var(--app-text)] outline-none transition focus:border-[var(--app-border-strong)]"
      >
        <option className="bg-[#071018]" value="all">
          All Services
        </option>

        {services.map((service) => (
          <option key={service} className="bg-[#071018]" value={service}>
            {service}
          </option>
        ))}
      </select>

      <select
        value={sourceValue}
        onChange={(event) => onSourceChange(event.target.value)}
        style={{
          width: "220px",
          maxWidth: "100%",
        }}
        className="h-11 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-3 text-sm font-bold text-[var(--app-text)] outline-none transition focus:border-[var(--app-border-strong)]"
      >
        <option className="bg-[#071018]" value="all">
          All Sources
        </option>

        {sources.map((source) => (
          <option key={source} className="bg-[#071018]" value={source}>
            {source}
          </option>
        ))}
      </select>
    </div>
  );
}

function LeadActions({ lead }) {
  const availableStages = leadStages.filter(
    (stage) => stage.key !== lead.rawStage
  );

  const canConvertToClient = !lead.clientId && lead.rawStatus !== "archived";

  return (
    <SmartMenu
      label={`More actions for ${lead.businessName}`}
      button={<DotsIcon />}
      width={210}
      estimatedHeight={canConvertToClient ? 360 : 300}
    >
      {canConvertToClient && (
        <>
          <form action={convertLeadToClient}>
            <input type="hidden" name="leadId" value={lead.id} />

            <SmartMenuItem type="submit" tone="success">
              Convert to Client
            </SmartMenuItem>
          </form>

          <div className="my-2 border-t border-[var(--app-border)]" />
        </>
      )}

      <p className="px-3 py-2 text-xs font-black uppercase tracking-widest text-[var(--app-text-soft)]">
        Move Stage
      </p>

      {availableStages.map((stage) => (
        <form key={stage.key} action={moveLeadStage}>
          <input type="hidden" name="leadId" value={lead.id} />
          <input type="hidden" name="stage" value={stage.key} />

          <SmartMenuItem type="submit">{stage.label}</SmartMenuItem>
        </form>
      ))}

      <div className="my-2 border-t border-[var(--app-border)]" />

      <form action={moveLeadStage}>
        <input type="hidden" name="leadId" value={lead.id} />
        <input type="hidden" name="stage" value="archived" />

        <SmartMenuItem type="submit">Archive</SmartMenuItem>
      </form>

      <form action={deleteLead}>
        <input type="hidden" name="leadId" value={lead.id} />

        <SmartMenuItem
          type="submit"
          tone="danger"
          onClick={(event) => {
            if (
              !window.confirm(
                "Delete this lead permanently? This cannot be undone."
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

function LeadCard({ lead, onOpenDetails, onOpenEdit }) {
  return (
    <article
      style={{
        minHeight: "260px",
      }}
      className="flex flex-col rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:border-[var(--app-border-strong)] hover:bg-white/[0.045]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <LeadAvatar lead={lead} />

          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-white">
              {lead.businessName}
            </h3>

            <p className="mt-1 truncate text-xs text-[var(--app-text-muted)]">
              {lead.contactName}
            </p>
          </div>
        </div>

        <LeadActions lead={lead} />
      </div>

      <div className="mt-4 flex-1 space-y-2 text-xs text-[var(--app-text-muted)]">
        <p className="line-clamp-2 min-h-[32px]">
          <span className="text-[var(--app-text-soft)]">Service:</span>{" "}
          {lead.serviceInterest}
        </p>

        <p className="line-clamp-1">
          <span className="text-[var(--app-text-soft)]">Source:</span>{" "}
          {lead.source}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <StatusBadge tone={getPriorityTone(lead.rawPriority)}>
            {lead.priority}
          </StatusBadge>

          <span className="font-black text-[var(--app-accent)]">
            {lead.estimatedValueLabel}
          </span>
        </div>

        <p className="flex items-center gap-2 pt-1">
          <CalendarIcon />
          <span>{lead.nextFollowUpLabel}</span>
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--app-border)] pt-3">
        <Button
          type="button"
          variant="secondary"
          className="h-8 px-3 py-1 text-xs"
          onClick={() => onOpenDetails(lead)}
        >
          View
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="h-8 px-3 py-1 text-xs"
          onClick={() => onOpenEdit(lead)}
        >
          Edit
        </Button>
      </div>
    </article>
  );
}

function CRMColumn({ stage, leads, onOpenDetails, onOpenCreate, onOpenEdit }) {
  const totalValue = leads.reduce((total, lead) => total + lead.estimatedValue, 0);

  return (
    <section
      style={{
        width: "340px",
        minWidth: "340px",
        maxWidth: "340px",
      }}
      className="flex min-h-[620px] shrink-0 flex-col rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-gradient-to-br from-white/[0.045] via-white/[0.025] to-cyan-300/[0.02] p-3"
    >
      <div className="mb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="truncate font-black text-white">{stage.label}</h2>

          <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--app-accent-soft)] px-2 py-0.5 text-xs font-black text-[var(--app-accent)]">
            {leads.length}
          </span>
        </div>

        <p className="mt-2 text-xs text-[var(--app-text-muted)]">
          Est. Value:{" "}
          <span className="font-black text-white">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(totalValue)}
          </span>
        </p>

        <span
          className={`mt-3 block h-[3px] rounded-full bg-gradient-to-r ${getStageLineClass(
            stage.tone
          )} shadow-[0_0_18px_rgba(92,244,236,0.28)]`}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onOpenDetails={onOpenDetails}
              onOpenEdit={onOpenEdit}
            />
          ))
        ) : (
          <div
            style={{
              minHeight: "260px",
            }}
            className="flex items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--app-border)] px-4 text-center text-xs font-bold text-[var(--app-text-soft)]"
          >
            No leads in this stage.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpenCreate(stage.key)}
        className="mt-4 rounded-[var(--radius-sm)] border border-transparent px-3 py-2 text-xs font-black uppercase tracking-widest text-[var(--app-accent)] transition hover:border-[var(--app-border-strong)] hover:bg-[var(--app-accent-soft)]"
      >
        + Add Lead
      </button>
    </section>
  );
}

function ArchivedLeadCard({ lead, onOpenDetails, onOpenEdit }) {
  return (
    <article className="grid gap-4 border-b border-[var(--app-border)] px-4 py-4 transition last:border-b-0 hover:bg-white/[0.035] xl:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.8fr)_auto] xl:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <LeadAvatar lead={lead} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="min-w-0 truncate text-base font-black text-white">
              {lead.businessName}
            </h3>

            <StatusBadge tone="neutral">Archived</StatusBadge>
          </div>

          <p className="mt-1 break-words text-sm text-[var(--app-text-muted)]">
            Contact: {lead.contactName}
          </p>

          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
            {lead.serviceInterest}
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-black/20 p-3 text-sm">
        <p className="text-xs font-black uppercase tracking-widest text-[var(--app-text-soft)]">
          Lead Value
        </p>

        <p className="mt-2 font-black text-[var(--app-accent)]">
          {lead.estimatedValueLabel}
        </p>

        <p className="mt-3 break-words text-xs text-[var(--app-text-muted)]">
          Source: {lead.source}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onOpenDetails(lead)}
        >
          View
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onOpenEdit(lead)}
        >
          Edit
        </Button>

        <form action={restoreLead}>
          <input type="hidden" name="leadId" value={lead.id} />

          <Button type="submit" size="sm">
            Restore
          </Button>
        </form>

        <form action={deleteLead}>
          <input type="hidden" name="leadId" value={lead.id} />

          <Button
            type="submit"
            variant="danger"
            size="sm"
            onClick={(event) => {
              if (
                !window.confirm(
                  "Delete this archived lead permanently? This cannot be undone."
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            Delete
          </Button>
        </form>
      </div>
    </article>
  );
}

function ArchivedLeadsView({ leads, onOpenDetails, onOpenEdit }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-[#050a10]">
      {leads.length > 0 ? (
        leads.map((lead) => (
          <ArchivedLeadCard
            key={lead.id}
            lead={lead}
            onOpenDetails={onOpenDetails}
            onOpenEdit={onOpenEdit}
          />
        ))
      ) : (
        <div className="p-8 text-center text-sm text-[var(--app-text-muted)]">
          No archived leads found.
        </div>
      )}
    </div>
  );
}

function ConvertLeadButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Converting..." : "Convert to Client"}
    </Button>
  );
}

function LeadDetailsModal({ lead, onClose, onOpenEdit }) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close lead details"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--app-border-strong)] bg-[#071018] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <div className="mb-5 flex flex-col gap-4 border-b border-[var(--app-border)] pb-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <LeadAvatar lead={lead} />

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--app-accent)]">
                Lead Details
              </p>

              <h2 className="mt-2 truncate text-2xl font-black text-white">
                {lead.businessName}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Contact: {lead.contactName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
  {!lead.clientId && lead.rawStatus !== "archived" && (
  <form action={convertLeadToClient} onSubmit={onClose}>
    <input type="hidden" name="leadId" value={lead.id} />

    <ConvertLeadButton />
  </form>
)}

  {lead.clientId && (
    <span className="rounded-[var(--radius-md)] border border-[var(--app-border-strong)] bg-[var(--app-accent-soft)] px-3 py-2 text-xs font-black uppercase tracking-widest text-[var(--app-accent)]">
      Client Linked
    </span>
  )}

  <Button
    type="button"
    variant="secondary"
    onClick={() => onOpenEdit(lead)}
  >
    Edit
  </Button>

  <Button type="button" variant="ghost" onClick={onClose}>
    ✕
  </Button>
</div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <InfoTile label="Stage" value={lead.stage} />
          <InfoTile label="Priority" value={lead.priority} />
          <InfoTile label="Value" value={lead.estimatedValueLabel} />
          <InfoTile label="Follow-Up" value={lead.nextFollowUpLabel} />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <InfoBlock label="Contact">
            <p>{lead.email}</p>
            <p>{lead.phone}</p>
            <p>{lead.location}</p>
          </InfoBlock>

          <InfoBlock label="Source">
            <p>Source: {lead.source}</p>
            <p>Form Source: {lead.formSource}</p>
            <p>Form Name: {lead.formName}</p>
          </InfoBlock>
        </div>

        <InfoBlock label="Service Interest" className="mt-5">
          <p>{lead.serviceInterest}</p>
        </InfoBlock>

        <InfoBlock label="Website" className="mt-5">
          {lead.website ? (
            <a
              href={lead.website}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm font-black uppercase tracking-widest text-[var(--app-accent)] transition hover:text-white"
            >
              Visit Website
            </a>
          ) : (
            <p>No website added.</p>
          )}
        </InfoBlock>

        <InfoBlock label="Notes" className="mt-5">
          <p>{lead.notes}</p>
        </InfoBlock>

        <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Form Payload
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            This lead can store source names, form IDs, submission IDs, and raw
            form payload data. We will surface live form payloads here once the
            forms are connected.
          </p>
        </div>
      </section>
    </div>
  );
}

function emptyField(value, fallback = "") {
  if (
    value === "No email" ||
    value === "No phone" ||
    value === "No location" ||
    value === "No contact added" ||
    value === "No follow-up" ||
    value === "No notes added yet."
  ) {
    return fallback;
  }

  return value || fallback;
}

function LeadFormModal({ defaultStage, lead, onClose }) {
  if (!defaultStage) {
    return null;
  }

  const isEditing = Boolean(lead?.id);
  const action = isEditing ? updateLead : createLead;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label={isEditing ? "Close edit lead form" : "Close new lead form"}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--app-border-strong)] bg-[#071018] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--app-border)] pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--app-accent)]">
              CRM Lead
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {isEditing ? "Edit Lead" : "Add New Lead"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {isEditing
                ? "Update lead details, stage, value, priority, and next follow-up."
                : "Add a manual lead now. Later, your forms will feed this same data structure automatically."}
            </p>
          </div>

          <Button type="button" variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form
          action={action}
          onSubmit={() => {
            onClose();
          }}
          className="space-y-5"
        >
          {isEditing && <input type="hidden" name="leadId" value={lead.id} />}

          <input
            type="hidden"
            name="formSource"
            value={emptyField(lead?.formSource, "Manual Entry")}
          />
          <input
            type="hidden"
            name="formName"
            value={emptyField(lead?.formName, "Manual CRM Entry")}
          />
          <input type="hidden" name="formId" value={lead?.formId || ""} />
          <input
            type="hidden"
            name="submissionId"
            value={lead?.submissionId || ""}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Business Name" required>
              <input
                name="businessName"
                required
                defaultValue={emptyField(lead?.businessName)}
                placeholder="Business or organization name"
                className="dvs-form-input"
              />
            </FormField>

            <FormField label="Contact Name">
              <input
                name="contactName"
                defaultValue={emptyField(lead?.contactName)}
                placeholder="Primary contact name"
                className="dvs-form-input"
              />
            </FormField>

            <FormField label="Email">
              <input
                name="email"
                type="email"
                defaultValue={emptyField(lead?.email)}
                placeholder="email@example.com"
                className="dvs-form-input"
              />
            </FormField>

            <FormField label="Phone">
              <input
                name="phone"
                defaultValue={emptyField(lead?.phone)}
                placeholder="(555) 000-0000"
                className="dvs-form-input"
              />
            </FormField>

            <FormField label="Website">
              <input
                name="website"
                defaultValue={emptyField(lead?.website)}
                placeholder="example.com"
                className="dvs-form-input"
              />
            </FormField>

            <FormField label="Location">
              <input
                name="location"
                defaultValue={emptyField(lead?.location)}
                placeholder="City, State"
                className="dvs-form-input"
              />
            </FormField>

            <FormField label="Lead Source">
              <select
                name="source"
                defaultValue={emptyField(lead?.source, "Manual")}
                className="dvs-form-input"
              >
                <option value="Manual">Manual</option>
                <option value="Website Form">Website Form</option>
                <option value="DVS Intake">DVS Intake</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Referral">Referral</option>
                <option value="Partner">Partner</option>
                <option value="Cold Outreach">Cold Outreach</option>
                <option value="Event">Event</option>
              </select>
            </FormField>

            <FormField label="Service Interest">
              <select
                name="serviceInterest"
                defaultValue={emptyField(
                  lead?.serviceInterest,
                  "Website / Web Development"
                )}
                className="dvs-form-input"
              >
                <option value="Website / Web Development">
                  Website / Web Development
                </option>
                <option value="CRM / Dashboard System">
                  CRM / Dashboard System
                </option>
                <option value="Automation">Automation</option>
                <option value="Lead Generation">Lead Generation</option>
                <option value="Photo / Video">Photo / Video</option>
                <option value="SEO / Google Business Profile">
                  SEO / Google Business Profile
                </option>
                <option value="Social Media / Content">
                  Social Media / Content
                </option>
                <option value="General inquiry">General inquiry</option>
              </select>
            </FormField>

            <FormField label="Stage">
              <select
                name="stage"
                defaultValue={lead?.rawStage === "archived" ? defaultStage : lead?.rawStage || defaultStage}
                className="dvs-form-input"
              >
                {leadStages.map((stage) => (
                  <option key={stage.key} value={stage.key}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Priority">
              <select
                name="priority"
                defaultValue={lead?.rawPriority || "medium"}
                className="dvs-form-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </FormField>

            <FormField label="Estimated Value">
  <div className="relative">
    <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm font-black text-[#5cf4ec]">
      $
    </span>

    <input
      name="estimatedValue"
      type="text"
      inputMode="decimal"
      defaultValue={lead?.estimatedValue || ""}
      placeholder="Estimated project value"
      className="dvs-form-input !pl-12"
    />
  </div>
</FormField>

            <FormField label="Next Follow-Up">
              <input
                name="nextFollowUp"
                type="date"
                defaultValue={lead?.nextFollowUp || ""}
                className="dvs-form-input"
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              name="notes"
              rows="4"
              defaultValue={emptyField(lead?.notes)}
              placeholder="Add lead notes, needs, next steps, or form details..."
              className="dvs-form-input resize-none"
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--app-border)] pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit">
              {isEditing ? "Save Changes" : "Save Lead"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
        {required && <span className="text-[var(--app-accent)]"> *</span>}
      </span>

      {children}
    </label>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-white">{value}</p>
    </div>
  );
}

function InfoBlock({ label, children, className = "" }) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4 text-sm leading-6 text-slate-300 ${className}`}
    >
      <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>

      {children}
    </div>
  );
}

export default function CRMKanban({ leads = [], summary }) {
const [detailsLead, setDetailsLead] = useState(null);
const [editingLead, setEditingLead] = useState(null);
const [leadFormStage, setLeadFormStage] = useState("");
const [viewMode, setViewMode] = useState("pipeline");
const [searchValue, setSearchValue] = useState("");
const [serviceValue, setServiceValue] = useState("all");
const [sourceValue, setSourceValue] = useState("all");

  useEffect(() => {
  function handleOpenNewLead() {
    setLeadFormStage("new_lead");
  }

  window.addEventListener("dvs-open-new-lead", handleOpenNewLead);

  return () => {
    window.removeEventListener("dvs-open-new-lead", handleOpenNewLead);
  };
}, []);

  const services = useMemo(() => {
    return [...new Set(leads.map((lead) => lead.serviceInterest).filter(Boolean))];
  }, [leads]);

  const sources = useMemo(() => {
    return [...new Set(leads.map((lead) => lead.source).filter(Boolean))];
  }, [leads]);

  const filteredLeads = useMemo(() => {
  let nextLeads = [...leads];

  if (searchValue.trim()) {
    const normalizedSearch = searchValue.toLowerCase();

    nextLeads = nextLeads.filter((lead) => {
      return (
        lead.businessName.toLowerCase().includes(normalizedSearch) ||
        lead.contactName.toLowerCase().includes(normalizedSearch) ||
        lead.email.toLowerCase().includes(normalizedSearch) ||
        lead.phone.toLowerCase().includes(normalizedSearch) ||
        lead.serviceInterest.toLowerCase().includes(normalizedSearch) ||
        lead.source.toLowerCase().includes(normalizedSearch)
      );
    });
  }

  if (serviceValue !== "all") {
    nextLeads = nextLeads.filter(
      (lead) => lead.serviceInterest === serviceValue
    );
  }

  if (sourceValue !== "all") {
    nextLeads = nextLeads.filter((lead) => lead.source === sourceValue);
  }

  return nextLeads;
}, [leads, searchValue, serviceValue, sourceValue]);

const pipelineLeads = useMemo(() => {
  return filteredLeads.filter(
    (lead) => lead.rawStatus !== "archived" && lead.rawStage !== "archived"
  );
}, [filteredLeads]);

const archivedLeads = useMemo(() => {
  return filteredLeads.filter(
    (lead) => lead.rawStatus === "archived" || lead.rawStage === "archived"
  );
}, [filteredLeads]);

const exportableLeads = viewMode === "archive" ? archivedLeads : pipelineLeads;

function handleExportCsv() {
  const today = new Date().toISOString().slice(0, 10);
  const viewLabel = viewMode === "archive" ? "archive" : "pipeline";

  exportLeadsToCsv(exportableLeads, `dvs-crm-${viewLabel}-${today}.csv`);
}

  function getStageLeads(stageKey) {
  return pipelineLeads.filter((lead) => lead.rawStage === stageKey);
}

  function openCreateLead(stageKey = "new_lead") {
  setDetailsLead(null);
  setEditingLead(null);
  setLeadFormStage(stageKey);
}

function openEditLead(lead) {
  setDetailsLead(null);
  setEditingLead(lead);
  setLeadFormStage(
    lead.rawStage === "archived" ? "new_lead" : lead.rawStage || "new_lead"
  );
}

function closeLeadForm() {
  setEditingLead(null);
  setLeadFormStage("");
}

  return (
    <>
      <SummaryCards summary={summary} />

      <section className="min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-gradient-to-br from-white/[0.045] via-white/[0.025] to-cyan-300/[0.025] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
  <CRMViewToggle
  viewMode={viewMode}
  onViewChange={setViewMode}
  pipelineCount={pipelineLeads.length}
  archiveCount={archivedLeads.length}
  onExport={handleExportCsv}
/>

<CRMFilters
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  serviceValue={serviceValue}
  onServiceChange={setServiceValue}
  sourceValue={sourceValue}
  onSourceChange={setSourceValue}
  services={services}
  sources={sources}
/>

{viewMode === "pipeline" ? (
  <div className="dvs-kanban-scroll w-full max-w-full overflow-x-auto overscroll-x-contain pb-4">
    <div className="flex min-w-max flex-nowrap gap-4 pr-8">
      {leadStages.map((stage) => (
        <CRMColumn
  key={stage.key}
  stage={stage}
  leads={getStageLeads(stage.key)}
  onOpenDetails={setDetailsLead}
  onOpenCreate={openCreateLead}
  onOpenEdit={openEditLead}
/>
      ))}
    </div>
    </div>
) : (
  <ArchivedLeadsView
    leads={archivedLeads}
    onOpenDetails={setDetailsLead}
    onOpenEdit={openEditLead}
  />
)}
</section>


      <LeadDetailsModal
  lead={detailsLead}
  onClose={() => setDetailsLead(null)}
  onOpenEdit={openEditLead}
/>

<LeadFormModal
  defaultStage={leadFormStage}
  lead={editingLead}
  onClose={closeLeadForm}
/>
    </>
  );
}