"use client";

import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import { createProject } from "../../app/(dashboard)/projects/actions.js";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm5.5-2.5L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-2.5 8-2.5 8h17S18 16 18 9ZM10 20h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 6h16v12H4V6Zm1 1 7 6 7-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconButton({ children, label, badge }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative hidden h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-[#071018] text-slate-200 transition hover:border-cyan-300/30 hover:bg-[#0b1722] hover:text-white md:flex"
    >
      {children}

      {badge && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--app-accent)] px-1 text-[10px] font-black text-[#031012]">
          {badge}
        </span>
      )}
    </button>
  );
}

function FormField({ label, children, required = false }) {
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

function NewProjectModal({ open, onClose }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
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

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close new project form"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--app-border-strong)] bg-[#071018] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--app-border)] pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--app-accent)]">
              Project Creation
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              New Project
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Select an existing client or type a new client name. If a new
              client is entered, it will be created automatically.
            </p>
          </div>

          <Button type="button" variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form
          action={createProject}
          onSubmit={() => {
            onClose();
          }}
          className="space-y-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Project Name" required>
              <input
                name="projectName"
                required
                placeholder="Website refresh, dashboard build, content package..."
                className="dvs-form-input"
              />
            </FormField>

            <FormField label="Existing Client">
              <select name="clientId" className="dvs-form-input" defaultValue="">
                <option value="">
                  {loadingClients ? "Loading clients..." : "No existing client selected"}
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
                placeholder="Type new client name if not in the list"
                className="dvs-form-input"
              />
            </FormField>

            <FormField label="Status">
              <select name="status" defaultValue="in_progress" className="dvs-form-input">
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </FormField>

            <FormField label="Priority">
              <select name="priority" defaultValue="medium" className="dvs-form-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </FormField>

            <FormField label="Due Date">
              <input name="dueDate" type="date" className="dvs-form-input" />
            </FormField>

            <FormField label="Progress">
              <input
                name="progress"
                type="number"
                min="0"
                max="100"
                step="5"
                defaultValue="0"
                className="dvs-form-input"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              name="description"
              rows="3"
              placeholder="Briefly describe what needs to be built or delivered..."
              className="dvs-form-input resize-none"
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              name="notes"
              rows="3"
              placeholder="Internal notes, scope details, client preferences, or next steps..."
              className="dvs-form-input resize-none"
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--app-border)] pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Topbar({ onMenuClick }) {
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  return (
    <>
      <header className="dvs-topbar sticky top-0 z-40 border-b border-white/10 px-4 py-3 text-white md:px-6">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="secondary"
              onClick={onMenuClick}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 px-0 lg:hidden"
            >
              <span className="text-xl leading-none">☰</span>
            </Button>

            <label className="relative hidden w-full max-w-xl md:block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>

              <input
                type="search"
                placeholder="Search clients, projects, tasks..."
                className="h-11 w-full rounded-[var(--radius-lg)] border border-white/10 bg-[#071018] pl-12 pr-16 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/45 focus:bg-[#0b1722]"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-[var(--radius-sm)] border border-white/10 bg-[#020407] px-2 py-1 text-[11px] font-black text-slate-400">
                ⌘ K
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <IconButton label="Theme">
              <SunIcon />
            </IconButton>

            <IconButton label="Notifications" badge="3">
              <BellIcon />
            </IconButton>

            <IconButton label="Messages">
              <MailIcon />
            </IconButton>

            <Button
              type="button"
              className="hidden sm:inline-flex"
              onClick={() => setProjectModalOpen(true)}
            >
              + New Project
            </Button>
          </div>
        </div>
      </header>

      <NewProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />
    </>
  );
}