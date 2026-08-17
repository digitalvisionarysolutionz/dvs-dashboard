"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "../../app/(dashboard)/projects/actions.js";
import { createClientRecord } from "../../app/(dashboard)/clients/actions.js";
import { createLead } from "../../app/(dashboard)/crm/actions.js";
import Button from "../ui/Button.jsx";
import CompactActionButton from "../ui/CompactActionButton.jsx";
import DashboardModal from "../ui/DashboardModal.jsx";
import FormField from "../ui/FormField.jsx";
import ProjectBriefFields from "../projects/ProjectBriefFields.jsx";

const strategyCallLink = "https://calendar.app.google/cDsCsTyMjrqVpqPd9";

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

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
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
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
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
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
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
      className="relative hidden h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-[#071018] text-slate-200 transition hover:border-[#5cf4ec]/30 hover:bg-[#0b1722] hover:text-white md:flex"
    >
      {children}

      {badge && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5cf4ec] px-1 text-[9px] font-black text-[#031012]">
          {badge}
        </span>
      )}
    </button>
  );
}

function NewProjectModal({
  open,
  onClose,
  initialClientId = "",
  initialClientName = "",
}) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedClientId(initialClientId || "");
    } else {
      setSelectedClientId("");
    }
  }, [open, initialClientId]);

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

  return (
    <DashboardModal
      open={open}
      eyebrow="Project Creation"
      title="New Project"
      description="Choose an existing client or create a new one with this project."
      maxWidth="max-w-3xl"
      onClose={onClose}
      closeLabel="Close new project form"
      footer={
        <>
          <CompactActionButton type="button" variant="secondary" onClick={onClose}>
            Cancel
          </CompactActionButton>

          <CompactActionButton
            type="submit"
            form="new-project-form"
            variant="primary"
          >
            Create Project
          </CompactActionButton>
        </>
      }
    >
      <form
        id="new-project-form"
        action={createProject}
        onSubmit={onClose}
        className="space-y-4"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Project Name" required>
            <input
              name="projectName"
              required
              placeholder="Website refresh, dashboard build, content package..."
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Existing Client">
            <select
              name="clientId"
              className="dvs-form-input"
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
            >
              <option value="">
                {loadingClients ? "Loading clients..." : "No existing client selected"}
              </option>

              {initialClientId &&
                !clients.some((client) => client.id === initialClientId) && (
                  <option value={initialClientId}>
                    {initialClientName || "Selected client"}
                  </option>
                )}

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
            <select
              name="status"
              defaultValue="in_progress"
              className="dvs-form-input"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_on_client">Waiting on Client</option>
              <option value="ready_for_review">Ready for Review</option>
              <option value="completed">Completed</option>
            </select>
          </FormField>

          <FormField label="Priority">
            <select
              name="priority"
              defaultValue="medium"
              className="dvs-form-input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </FormField>

          <FormField label="Due Date">
            <input name="dueDate" type="date" className="dvs-form-input" />
          </FormField>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Description">
            <textarea
              name="description"
              rows="3"
              placeholder="Project scope, deliverables, or goals..."
              className="dvs-form-input resize-none"
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              name="notes"
              rows="3"
              placeholder="Internal notes or next steps..."
              className="dvs-form-input resize-none"
            />
          </FormField>
        </div>

        <ProjectBriefFields />
      </form>
    </DashboardModal>
  );
}

function NewClientModal({ open, onClose }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const logoInputRef = useRef(null);
  const [logoMessage, setLogoMessage] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [selectedLogoName, setSelectedLogoName] = useState("");

  useEffect(() => {
    if (open) {
      setLogoMessage("");
      setFormMessage("");
      setSelectedLogoName("");

      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  }, [open]);

  function validateLogoFile(form) {
    const logoFile = form.elements.logoFile?.files?.[0];

    if (!logoFile) {
      return "";
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(logoFile.type)) {
      return "Logo must be a PNG, JPG, WEBP, or SVG file.";
    }

    if (logoFile.size > 5 * 1024 * 1024) {
      return "Logo must be 5MB or smaller. Please compress the file and try again.";
    }

    return "";
  }

  function clearSelectedLogoFile() {
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }

    setSelectedLogoName("");
    setLogoMessage("");
  }

  function handleLogoFileChange(event) {
    const form = event.currentTarget.form;
    const logoFile = event.currentTarget.files?.[0];

    setSelectedLogoName(logoFile?.name || "");

    if (!logoFile) {
      setLogoMessage("");
      return;
    }

    const logoError = form ? validateLogoFile(form) : "";
    setLogoMessage(logoError);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const logoError = validateLogoFile(form);

    if (logoError) {
      setLogoMessage(logoError);
      setFormMessage("");
      return;
    }

    setLogoMessage("");
    setFormMessage("Creating client...");

    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await createClientRecord(formData);

        setFormMessage("");
        clearSelectedLogoFile();
        router.refresh();
        onClose();
      } catch (error) {
        setFormMessage(
          error?.message ||
            "Something went wrong while creating this client. Please try again."
        );
      }
    });
  }

  return (
    <DashboardModal
      open={open}
      eyebrow="Client Profile"
      title="New Client"
      description="Create a client profile that can be linked to projects, CRM leads, invoices, and future portal activity."
      maxWidth="max-w-3xl"
      onClose={onClose}
      closeLabel="Close new client form"
      footer={
        <>
          <CompactActionButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </CompactActionButton>

          <CompactActionButton
            type="submit"
            form="dashboard-new-client-form"
            variant="primary"
            disabled={isPending || Boolean(logoMessage)}
          >
            {isPending ? "Creating..." : "Save Client"}
          </CompactActionButton>
        </>
      }
    >
      <form
        id="dashboard-new-client-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Business Name" required>
            <input
              name="businessName"
              required
              placeholder="Business or organization name"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Contact Name">
            <input
              name="contactName"
              placeholder="Primary contact name"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Email">
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Phone">
            <input
              name="phone"
              placeholder="(555) 000-0000"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Website">
            <input
              name="website"
              placeholder="example.com"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Location">
            <input
              name="location"
              placeholder="Address, City, State, or service area"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Status">
            <select name="status" defaultValue="active" className="dvs-form-input">
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="past">Past</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>

          <FormField
            label="Upload Logo"
            description="PNG, JPG, WEBP, or SVG. Max 5MB."
          >
            <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.025] p-3">
              <input
                ref={logoInputRef}
                name="logoFile"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                className="block w-full cursor-pointer rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-3 py-2.5 text-sm font-semibold text-[var(--app-text-muted)] file:mr-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-[#5cf4ec] file:px-3 file:py-2 file:text-xs file:font-black file:text-[#031012] hover:border-[#5cf4ec]/35"
              />

              {selectedLogoName && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-white/10 bg-[#050b12] px-3 py-2">
                  <p className="min-w-0 truncate text-xs font-bold text-slate-300">
                    Selected: {selectedLogoName}
                  </p>

                  <button
                    type="button"
                    onClick={clearSelectedLogoFile}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-white/10 bg-white/[0.035] text-sm font-black text-slate-300 transition hover:border-red-300/35 hover:bg-red-400/10 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020407]"
                    aria-label="Clear selected logo file"
                  >
                    ×
                  </button>
                </div>
              )}

              {logoMessage ? (
                <p
                  role="alert"
                  className="mt-3 rounded-[var(--radius-md)] border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-bold leading-5 text-red-100"
                >
                  {logoMessage}
                </p>
              ) : (
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                  Uploading a logo is optional.
                </p>
              )}
            </div>
          </FormField>
        </div>

        <FormField label="Notes">
          <textarea
            name="notes"
            rows="2"
            placeholder="Client notes, service details, preferences, or next steps..."
            className="dvs-form-input resize-none"
          />
        </FormField>

        {formMessage && (
          <p
            role="status"
            className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-slate-300"
          >
            {formMessage}
          </p>
        )}
      </form>
    </DashboardModal>
  );
}

function NewLeadModal({ open, onClose, initialStage = "new_lead" }) {
  return (
    <DashboardModal
      open={open}
      eyebrow="CRM Lead"
      title="New Lead"
      description="Add a manual lead now. Later, your forms can feed this same CRM pipeline."
      maxWidth="max-w-3xl"
      onClose={onClose}
      closeLabel="Close new lead form"
      footer={
        <>
          <CompactActionButton type="button" variant="secondary" onClick={onClose}>
            Cancel
          </CompactActionButton>

          <CompactActionButton
            type="submit"
            form="dashboard-new-lead-form"
            variant="primary"
          >
            Save Lead
          </CompactActionButton>
        </>
      }
    >
      <form
        id="dashboard-new-lead-form"
        action={createLead}
        onSubmit={onClose}
        className="space-y-4"
      >
        <input type="hidden" name="formSource" value="Manual Entry" />
        <input type="hidden" name="formName" value="Manual CRM Entry" />
        <input type="hidden" name="formId" value="" />
        <input type="hidden" name="submissionId" value="" />

        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Business Name" required>
            <input
              name="businessName"
              required
              placeholder="Business or organization name"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Contact Name">
            <input
              name="contactName"
              placeholder="Primary contact name"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Email">
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Phone">
            <input
              name="phone"
              placeholder="(555) 000-0000"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Website">
            <input
              name="website"
              placeholder="example.com"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Location">
            <input
              name="location"
              placeholder="City, State"
              className="dvs-form-input"
            />
          </FormField>

          <FormField label="Lead Source">
            <select name="source" defaultValue="Manual" className="dvs-form-input">
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
              defaultValue="Website / Web Development"
              className="dvs-form-input"
            >
              <option value="Website / Web Development">
                Website / Web Development
              </option>
              <option value="CRM / Dashboard System">CRM / Dashboard System</option>
              <option value="Automation">Automation</option>
              <option value="Lead Generation">Lead Generation</option>
              <option value="Photo / Video">Photo / Video</option>
              <option value="SEO / Google Business Profile">
                SEO / Google Business Profile
              </option>
              <option value="Social Media / Content">Social Media / Content</option>
              <option value="General inquiry">General inquiry</option>
            </select>
          </FormField>

          <FormField label="Stage">
            <select name="stage" defaultValue={initialStage || "new_lead"} className="dvs-form-input">
              <option value="new_lead">New Lead</option>
              <option value="contacted">Contacted</option>
              <option value="discovery">Discovery</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </FormField>

          <FormField label="Priority">
            <select name="priority" defaultValue="medium" className="dvs-form-input">
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
                placeholder="Estimated project value"
                className="dvs-form-input !pl-12"
              />
            </div>
          </FormField>

          <FormField label="Next Follow-Up">
            <input name="nextFollowUp" type="date" className="dvs-form-input" />
          </FormField>
        </div>

        <FormField label="Notes">
          <textarea
            name="notes"
            rows="2"
            placeholder="Add lead notes, needs, next steps, or form details..."
            className="dvs-form-input resize-none"
          />
        </FormField>
      </form>
    </DashboardModal>
  );
}

function CreateMenuItem({ label, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className="group flex min-h-[46px] w-full touch-manipulation items-center gap-3 px-2.5 py-2 text-left transition hover:bg-[#5cf4ec]/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020407]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-slate-500 transition group-hover:text-[#5cf4ec]">
        {icon}
      </span>

      <span className="min-w-0 text-sm font-black text-white transition group-hover:text-[#5cf4ec]">
        + {label}
      </span>
    </button>
  );
}

function GlobalCreateMenu({
  onOpenIntake,
  onOpenProject,
  onOpenLead,
  onOpenClient,
  onOpenMeeting,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function runAction(action) {
    setOpen(false);
    action();
  }

  const iconClass = "h-4 w-4";

  const icons = {
    intake: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none">
        <path
          d="M8 4h8m-9 4h10M8 12h8m-8 4h5M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    project: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none">
        <path
          d="M3 7.5h7l2 2H21v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    lead: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none">
        <path
          d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    ),
    client: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none">
        <path
          d="M16 19c0-2.2-1.8-4-4-4H8c-2.2 0-4 1.8-4 4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M18 9v6m3-3h-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    meeting: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none">
        <path
          d="M7 3v3m10-3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  const items = [
    {
      label: "New Private Intake",
      icon: icons.intake,
      action: onOpenIntake,
    },
    {
      label: "New Project",
      icon: icons.project,
      action: onOpenProject,
    },
    {
      label: "New Lead",
      icon: icons.lead,
      action: onOpenLead,
    },
    {
      label: "New Client",
      icon: icons.client,
      action: onOpenClient,
    },
    {
      label: "New Meeting",
      icon: icons.meeting,
      action: onOpenMeeting,
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className="h-9 px-4 text-[12px]"
        onClick={() => setOpen((current) => !current)}
      >
        + New
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Create new item"
          className="fixed right-3 top-[64px] z-[90] w-[min(340px,calc(100vw-1.5rem))] overflow-hidden rounded-[20px] border border-[#5cf4ec]/22 bg-[#071018]/92 px-3 py-2.5 shadow-[0_24px_80px_rgba(0,0,0,0.76),0_0_34px_rgba(92,244,236,0.1)] backdrop-blur-2xl sm:absolute sm:right-0 sm:top-[calc(100%+10px)] sm:w-[320px]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(92,244,236,0.11),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_34%)]" />
          <div className="pointer-events-none absolute left-4 top-0 h-px w-2/3 bg-gradient-to-r from-transparent via-[#5cf4ec] to-transparent opacity-80 shadow-[0_0_16px_rgba(92,244,236,0.7)]" />

          <div className="relative">
            {items.map((item, index) => (
              <div key={item.label}>
                <CreateMenuItem
                  label={item.label}
                  icon={item.icon}
                  onClick={() => runAction(item.action)}
                />

                {index < items.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="mx-2 block h-px bg-gradient-to-r from-transparent via-[#5cf4ec]/28 to-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Topbar({ onMenuClick }) {
  const router = useRouter();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadModalStage, setLeadModalStage] = useState("new_lead");
  const [projectClientPrefill, setProjectClientPrefill] = useState({
    clientId: "",
    clientName: "",
  });

  useEffect(() => {
    function handleOpenNewProject(event) {
      const detail = event?.detail || {};

      setProjectClientPrefill({
        clientId: detail.clientId || "",
        clientName: detail.clientName || "",
      });

      setProjectModalOpen(true);
    }

    function handleOpenNewClient() {
      setClientModalOpen(true);
    }

    function handleOpenNewLead(event) {
      const detail = event?.detail || {};
      setLeadModalStage(detail.stage || "new_lead");
      setLeadModalOpen(true);
    }

    function handleOpenScheduleMeeting() {
      window.open(strategyCallLink, "_blank", "noopener,noreferrer");
    }

    window.addEventListener("dvs-open-new-project", handleOpenNewProject);
    window.addEventListener("dvs-open-new-client", handleOpenNewClient);
    window.addEventListener("dvs-dashboard-open-new-client", handleOpenNewClient);
    window.addEventListener("dvs-open-new-lead", handleOpenNewLead);
    window.addEventListener("dvs-dashboard-open-new-lead", handleOpenNewLead);
    window.addEventListener(
      "dvs-dashboard-open-schedule-meeting",
      handleOpenScheduleMeeting
    );

    return () => {
      window.removeEventListener("dvs-open-new-project", handleOpenNewProject);
      window.removeEventListener("dvs-open-new-client", handleOpenNewClient);
      window.removeEventListener(
        "dvs-dashboard-open-new-client",
        handleOpenNewClient
      );
      window.removeEventListener("dvs-open-new-lead", handleOpenNewLead);
      window.removeEventListener(
        "dvs-dashboard-open-new-lead",
        handleOpenNewLead
      );
      window.removeEventListener(
        "dvs-dashboard-open-schedule-meeting",
        handleOpenScheduleMeeting
      );
    };
  }, []);

  function closeProjectModal() {
    setProjectModalOpen(false);
    setProjectClientPrefill({
      clientId: "",
      clientName: "",
    });
  }

  function openBlankProject() {
    setProjectClientPrefill({
      clientId: "",
      clientName: "",
    });
    setProjectModalOpen(true);
  }

  return (
    <>
      <header className="dvs-topbar sticky top-0 z-40 border-b border-white/10 px-3 py-2 text-white md:px-4">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={onMenuClick}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 px-0 lg:hidden"
            >
              <span className="text-lg leading-none">☰</span>
            </Button>

            <label className="relative hidden w-full max-w-[520px] md:block">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>

              <input
                type="search"
                placeholder="Search clients, projects, tasks..."
                className="h-9 w-full rounded-[var(--radius-lg)] border border-white/10 bg-[#071018] pl-10 pr-14 text-[12px] text-white outline-none transition placeholder:text-slate-500 focus:border-[#5cf4ec]/45 focus:bg-[#0b1722]"
              />

              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[var(--radius-sm)] border border-white/10 bg-[#020407] px-1.5 py-0.5 text-[10px] font-black text-slate-400">
                ⌘ K
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <IconButton label="Theme">
              <SunIcon />
            </IconButton>

            <IconButton label="Notifications" badge="3">
              <BellIcon />
            </IconButton>

            <IconButton label="Messages">
              <MailIcon />
            </IconButton>

            <GlobalCreateMenu
              onOpenIntake={() => router.push("/intake")}
              onOpenProject={openBlankProject}
              onOpenLead={() => {
                setLeadModalStage("new_lead");
                setLeadModalOpen(true);
              }}
              onOpenClient={() => setClientModalOpen(true)}
              onOpenMeeting={() =>
                window.open(strategyCallLink, "_blank", "noopener,noreferrer")
              }
            />
          </div>
        </div>
      </header>

      <NewProjectModal
        open={projectModalOpen}
        onClose={closeProjectModal}
        initialClientId={projectClientPrefill.clientId}
        initialClientName={projectClientPrefill.clientName}
      />

      <NewClientModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
      />

      <NewLeadModal
        open={leadModalOpen}
        initialStage={leadModalStage}
        onClose={() => setLeadModalOpen(false)}
      />
    </>
  );
}