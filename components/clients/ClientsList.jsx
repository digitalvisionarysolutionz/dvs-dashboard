"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Button from "../ui/Button.jsx";
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
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--app-border)] bg-black/30 sm:h-14 sm:w-14">
        <Image
          src={client.logoUrl}
          alt={`${client.businessName} logo`}
          width={56}
          height={56}
          className="h-full w-full object-contain p-2"
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--app-border-strong)] bg-[var(--app-accent-soft)] text-sm font-black tracking-widest text-[var(--app-accent)] shadow-[0_0_20px_rgba(92,244,236,0.12)] sm:h-14 sm:w-14">
      {client.initials}
    </div>
  );
}

function getTabClients(clients, activeTab) {
  if (activeTab === "archive") {
    return clients.filter((client) => client.isArchived);
  }

  return clients.filter((client) => !client.isArchived);
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

  if (selectedIds.length === 0) {
    return null;
  }

  const selectedJson = JSON.stringify(selectedIds);

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--app-border-strong)] bg-[#071018] p-3 shadow-[0_0_28px_rgba(92,244,236,0.12)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-black text-[var(--app-text)]">
        {selectedIds.length} client{selectedIds.length === 1 ? "" : "s"} selected
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {activeTab === "archive" ? (
          <form action={moveSelectedClientsToActive}>
            <input type="hidden" name="clientIds" value={selectedJson} />
            <Button type="submit" size="sm">
              Mark Active
            </Button>
          </form>
        ) : (
          <form action={archiveSelectedClients}>
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

              <form action={deleteSelectedClients}>
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

        <Button type="button" variant="ghost" size="sm" onClick={onClearSelection}>
          Clear
        </Button>
      </div>
    </div>
  );
}

function RowActions({ client, onOpenDetails, onOpenEdit }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });

  const buttonRef = useRef(null);

  function toggleMenu() {
    if (!buttonRef.current) {
      setOpen((current) => !current);
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 120;
    const menuWidth = 160;
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const shouldOpenUp = spaceBelow < menuHeight + 24;

    setMenuPosition({
      top: shouldOpenUp
        ? buttonRect.top - menuHeight - 8
        : buttonRect.bottom + 8,
      left: Math.max(12, buttonRect.right - menuWidth),
      placement: shouldOpenUp ? "top" : "bottom",
    });

    setOpen((current) => !current);
  }

  useEffect(() => {
    function closeMenu() {
      setOpen(false);
    }

    if (!open) {
      return;
    }

    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [open]);

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

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-label={`More actions for ${client.businessName}`}
          onClick={toggleMenu}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--app-border)] bg-[#071018] text-[var(--app-text-muted)] transition hover:border-[var(--app-border-strong)] hover:text-white"
        >
          <DotsIcon />
        </button>

        {open && (
          <>
            <button
              type="button"
              aria-label="Close client actions"
              className="fixed inset-0 z-[80] cursor-default bg-transparent"
              onClick={() => setOpen(false)}
            />

            <div
              className="fixed z-[90] w-40 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.65)]"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              {client.isArchived ? (
                <form action={moveSingleClientToActive}>
                  <input type="hidden" name="clientId" value={client.id} />

                  <button
                    type="submit"
                    className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-bold text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  >
                    Mark Active
                  </button>
                </form>
              ) : (
                <form action={archiveSingleClient}>
                  <input type="hidden" name="clientId" value={client.id} />

                  <button
                    type="submit"
                    className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-bold text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  >
                    Archive
                  </button>
                </form>
              )}

              <form action={deleteSingleClient}>
                <input type="hidden" name="clientId" value={client.id} />

                <button
                  type="submit"
                  onClick={(event) => {
                    if (
                      !window.confirm(
                        "Delete this client permanently? This cannot be undone."
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
          </>
        )}
      </div>
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
      className={`grid gap-4 border-b border-[var(--app-border)] px-4 py-4 transition last:border-b-0 hover:bg-white/[0.035] lg:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.9fr)_auto] lg:items-center ${
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

          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
            {client.notes}
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-black/20 p-3 text-sm">
        <p className="break-words font-semibold text-[var(--app-text)]">
          {client.email}
        </p>

        <p className="mt-1 text-[var(--app-text-muted)]">{client.phone}</p>

        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[var(--app-text-soft)]">
          Website inside details
        </p>
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

function ClientDetailsModal({ client, onClose, onOpenEdit }) {
  if (!client) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close client details"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--app-border-strong)] bg-[#071018] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--app-border)] pb-4">
          <div className="flex min-w-0 items-center gap-4">
            <ClientLogo client={client} />

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--app-accent)]">
                Client Details
              </p>

              <h2 className="mt-2 truncate text-2xl font-black text-white">
                {client.businessName}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Contact: {client.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenEdit(client)}
            >
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
            <p className="mt-2 font-bold text-white">{client.status}</p>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Email
            </p>
            <p className="mt-2 break-words font-bold text-white">
              {client.email}
            </p>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Phone
            </p>
            <p className="mt-2 font-bold text-white">{client.phone}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Website
          </p>

          {client.website ? (
            <a
              href={client.website}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-black uppercase tracking-widest text-[var(--app-accent)] transition hover:text-white"
            >
              Visit Website
            </a>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No website added.</p>
          )}
        </div>

        <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Notes
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {client.notes}
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
    value === "No notes added yet." ||
    value === "Unnamed Client"
  ) {
    return fallback;
  }

  return value || fallback;
}

function ClientFormModal({ open, client, onClose }) {
  if (!open) {
    return null;
  }

  const isEditing = Boolean(client?.id);
  const action = isEditing ? updateClientRecord : createClientRecord;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label={isEditing ? "Close edit client form" : "Close new client form"}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className="relative z-10 flex h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--app-border-strong)] bg-[#071018] shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <div className="shrink-0 border-b border-[var(--app-border)] p-5">
  <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--app-accent)]">
              Client Profile
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {isEditing ? "Edit Client" : "New Client"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {isEditing
                ? "Update client contact info, status, notes, and account details."
                : "Create a client profile that can be linked to projects, CRM leads, invoices, and future portal activity."}
            </p>
          </div>

          <Button type="button" variant="ghost" onClick={onClose}>
  ✕
</Button>
  </div>
</div>

<form
  action={action}
  onSubmit={() => {
    onClose();
  }}
  className="flex min-h-0 flex-1 flex-col"
>
  {isEditing && <input type="hidden" name="clientId" value={client.id} />}

  <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
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

      <FormField label="Logo URL">
        <input
          name="logoUrl"
          defaultValue={client?.logoUrl || ""}
          placeholder="https://example.com/logo.png"
          className="dvs-form-input"
        />
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
  </div>

  <div className="shrink-0 border-t border-[var(--app-border)] bg-[#071018]/95 p-5 backdrop-blur">
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Button type="button" variant="secondary" onClick={onClose}>
        Cancel
      </Button>

      <Button type="submit">
        {isEditing ? "Save Changes" : "Save Client"}
      </Button>
    </div>
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
function openEditClient(client) {
  setDetailsClient(null);
  setEditingClient(client);
  setClientFormOpen(true);
}

function closeClientForm() {
  setEditingClient(null);
  setClientFormOpen(false);
}

  function clearSelection() {
    setSelectedIds([]);
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
/>

<ClientFormModal
  open={clientFormOpen}
  client={editingClient}
  onClose={closeClientForm}
/>
    </>
  );
}