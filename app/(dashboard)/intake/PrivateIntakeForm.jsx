"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button.jsx";
import FormField from "../../../components/ui/FormField.jsx";
import { createPrivateIntakeLead } from "../crm/actions.js";

const servicesNeeded = [
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

const projectGoals = [
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

const painPoints = [
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

const assetsAvailable = [
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

const emptyQuickNotes = {
  internalNotes: "",
  recommendedService: "",
  quotedAmount: "",
  estimatedRange: "",
  followUpPriority: "",
  nextStep: "",
};

function SectionHeader({ number, title, description }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[#5cf4ec]/35 bg-[#5cf4ec]/10 text-[11px] font-black text-[#5cf4ec] shadow-[0_0_18px_rgba(92,244,236,0.08)]">
        {number}
      </span>

      <div className="min-w-0">
        <h2 className="text-[18px] font-black tracking-[0.1em] text-white">
          {title}
        </h2>
        <p className="mt-1 max-w-4xl text-[13px] font-semibold leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function IntakeCard({ number, title, description, children, featured = false }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[var(--radius-xl)] border p-4 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-5 ${
        featured
          ? "border-[#5cf4ec]/35 bg-gradient-to-br from-[#08161a] via-[#071018] to-[#020407]"
          : "border-[var(--app-border)] bg-gradient-to-br from-white/[0.045] via-white/[0.022] to-cyan-300/[0.018]"
      }`}
    >
      <div className="pointer-events-none absolute left-5 top-0 h-px w-44 bg-gradient-to-r from-[#5cf4ec] to-transparent opacity-75" />
      <SectionHeader number={number} title={title} description={description} />
      {children}
    </section>
  );
}

function TextInput({
  label,
  name,
  type = "text",
  required = false,
  placeholder = "",
  autoComplete,
  inputMode,
  maxLength,
  value,
  onChange,
}) {
  return (
    <FormField label={label} required={required}>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        className="dvs-form-input"
      />
    </FormField>
  );
}

function TextArea({
  label,
  name,
  required = false,
  placeholder = "",
  rows = 3,
}) {
  return (
    <FormField label={label} required={required}>
      <textarea
        name={name}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className="dvs-form-input resize-none"
      />
    </FormField>
  );
}

function SelectField({ label, name, required = false, children }) {
  return (
    <FormField label={label} required={required}>
      <select name={name} required={required} className="dvs-form-input">
        {children}
      </select>
    </FormField>
  );
}

function CheckGrid({ name, options }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => (
        <label
          key={option}
          className="group flex min-h-11 touch-manipulation cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-white/10 bg-[#050b12]/88 px-3 py-2.5 text-[13px] font-black leading-5 text-slate-300 transition hover:border-[#5cf4ec]/35 hover:bg-[#071018]"
        >
          <input
            type="checkbox"
            name={name}
            value={option}
            className="h-4 w-4 shrink-0 accent-[#5cf4ec]"
          />
          <span className="group-hover:text-white">{option}</span>
        </label>
      ))}
    </div>
  );
}

function RadioGrid({ name, options }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => (
        <label
          key={option}
          className="group flex min-h-11 touch-manipulation cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-white/10 bg-[#050b12]/88 px-3.5 py-2.5 text-[13px] font-black text-slate-300 transition hover:border-[#5cf4ec]/35 hover:bg-[#071018]"
        >
          <input
            type="radio"
            name={name}
            value={option}
            className="h-4 w-4 shrink-0 accent-[#5cf4ec]"
          />
          <span className="group-hover:text-white">{option}</span>
        </label>
      ))}
    </div>
  );
}

function QuickNotes({ quickNotes, setQuickNotes }) {
  const [open, setOpen] = useState(false);

  function updateField(field, value) {
    setQuickNotes((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[min(380px,calc(100%-2rem))]">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto flex min-h-11 touch-manipulation items-center justify-center rounded-full border border-[#5cf4ec]/40 bg-[#071018]/95 px-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#5cf4ec] shadow-[0_18px_60px_rgba(0,0,0,0.42),0_0_22px_rgba(92,244,236,0.11)] backdrop-blur transition hover:bg-[#0a141d]"
        >
          Notes
        </button>
      ) : (
        <div className="max-h-[76vh] overflow-y-auto rounded-[var(--radius-xl)] border border-[#5cf4ec]/28 bg-[#071018]/98 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.6),0_0_28px_rgba(92,244,236,0.09)] backdrop-blur">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#5cf4ec]">
                Internal
              </p>
              <h2 className="mt-1.5 text-xl font-black text-white">
                Quick Notes
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Collapse quick notes"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[#5cf4ec]/30 bg-[#050b12] text-lg font-black text-[#5cf4ec] transition hover:bg-[#0b1722]"
            >
              —
            </button>
          </div>

          <div className="space-y-3">
            <FormField label="Private Notes">
              <textarea
                rows="4"
                value={quickNotes.internalNotes}
                onChange={(event) =>
                  updateField("internalNotes", event.target.value)
                }
                placeholder="Quick notes while talking to the client..."
                className="dvs-form-input resize-none"
              />
            </FormField>

            <FormField label="Recommended Service">
              <select
                value={quickNotes.recommendedService}
                onChange={(event) =>
                  updateField("recommendedService", event.target.value)
                }
                className="dvs-form-input"
              >
                <option value="">Select one</option>
                <option>Web Development</option>
                <option>Lead Generation</option>
                <option>Custom System</option>
                <option>Photo / Video</option>
                <option>SEO/AEO</option>
                <option>Tech Support</option>
                <option>Combination Project</option>
                <option>Not Sure Yet</option>
              </select>
            </FormField>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Quoted $$">
                <input
                  value={quickNotes.quotedAmount}
                  onChange={(event) =>
                    updateField("quotedAmount", event.target.value)
                  }
                  placeholder="$3,500+"
                  className="dvs-form-input"
                />
              </FormField>

              <FormField label="Estimated Range">
                <input
                  value={quickNotes.estimatedRange}
                  onChange={(event) =>
                    updateField("estimatedRange", event.target.value)
                  }
                  placeholder="$2,500–$5,000"
                  className="dvs-form-input"
                />
              </FormField>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Follow-Up Priority">
                <select
                  value={quickNotes.followUpPriority}
                  onChange={(event) =>
                    updateField("followUpPriority", event.target.value)
                  }
                  className="dvs-form-input"
                >
                  <option value="">Select one</option>
                  <option>Hot Lead</option>
                  <option>Warm Lead</option>
                  <option>Needs Nurture</option>
                  <option>Low Priority</option>
                </select>
              </FormField>

              <FormField label="Next Step">
                <select
                  value={quickNotes.nextStep}
                  onChange={(event) =>
                    updateField("nextStep", event.target.value)
                  }
                  className="dvs-form-input"
                >
                  <option value="">Select one</option>
                  <option>Send proposal</option>
                  <option>Schedule call</option>
                  <option>Request access</option>
                  <option>Request content</option>
                  <option>Send pricing options</option>
                  <option>Follow up later</option>
                </select>
              </FormField>
            </div>

            <p className="rounded-[var(--radius-md)] border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-[11px] font-bold leading-5 text-amber-100">
              Internal only. Do not enter passwords, 2FA codes, banking info, or
              private access keys.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

function IntakeSuccessModal({ open, onStartNew, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#020407]/72 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-[#5cf4ec]/35 bg-[#071018]/98 p-6 text-center shadow-[0_30px_120px_rgba(0,0,0,0.75),0_0_46px_rgba(92,244,236,0.18)]">
        <div className="pointer-events-none absolute left-8 top-0 h-px w-2/3 bg-gradient-to-r from-transparent via-[#5cf4ec] to-transparent shadow-[0_0_20px_rgba(92,244,236,0.8)]" />

        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#5cf4ec]/45 bg-[#5cf4ec]/15 text-[#5cf4ec] shadow-[0_0_34px_rgba(92,244,236,0.22)]">
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
            <path
              d="m5 12 4 4L19 6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.26em] text-[#5cf4ec]">
          DVS Tech
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
          Client intake saved!
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-400">
          A private intake submission was saved and a new CRM lead was created.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" onClick={onStartNew}>
            Start New Intake
          </Button>

          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PrivateIntakeForm() {
  const router = useRouter();
  const formRef = useRef(null);
  const [quickNotes, setQuickNotes] = useState(emptyQuickNotes);
  const [phoneValue, setPhoneValue] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [success, setSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPending, startTransition] = useTransition();

  function markUnsaved() {
    setHasUnsavedChanges(true);
    setSuccess(false);
  }

  function resetForm() {
    formRef.current?.reset();
    setQuickNotes(emptyQuickNotes);
    setPhoneValue("");
    setStatus({ type: "", message: "" });
    setSuccess(false);
    setHasUnsavedChanges(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 3)})${digits.slice(3)}`;
    return `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  useEffect(() => {
    function handleBeforeUnload(event) {
      if (!hasUnsavedChanges || success) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, success]);

  async function handleSubmit(event) {
    event.preventDefault();

    const form = formRef.current;
    if (!form) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus({
        type: "error",
        message: "Please complete the required fields before submitting.",
      });
      return;
    }

    const formData = new FormData(form);

    if (formData.get("company_website")) return;

    formData.set("quickNotesPayload", JSON.stringify(quickNotes));
    setStatus({ type: "", message: "Submitting intake..." });

    startTransition(async () => {
      try {
        await createPrivateIntakeLead(formData);

        setSuccess(true);
        setHasUnsavedChanges(false);
        setStatus({
          type: "success",
          message: "Private intake submitted. A new CRM lead was created.",
        });

        form.reset();
        setPhoneValue("");
        setQuickNotes(emptyQuickNotes);
        router.refresh();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        setStatus({
          type: "error",
          message:
            error?.message ||
            "Something went wrong. Please try again or check the connection.",
        });
      }
    });
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-[1500px] pb-20">
      <div className="mb-5 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-gradient-to-br from-white/[0.045] via-white/[0.02] to-[#5cf4ec]/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.26)]">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#5cf4ec]">
            Client Onboarding
          </p>

          <div className="mt-3 h-[3px] w-36 rounded-full bg-gradient-to-r from-[#5cf4ec] via-[#5cf4ec]/45 to-transparent shadow-[0_0_18px_rgba(92,244,236,0.45)]" />

          <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[44px]">
            Private client intake.
          </h1>

          <p className="mt-3 max-w-4xl text-[13px] font-semibold leading-6 text-slate-400 sm:text-sm">
            Capture meeting notes, service needs, budget, timeline, and project
            context. Submissions create CRM leads first — never clients or
            projects directly.
          </p>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onInput={markUnsaved}
        onChange={markUnsaved}
        className="grid gap-5"
      >
        <input
          type="text"
          name="company_website"
          tabIndex="-1"
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <input type="hidden" name="quickNotesPayload" />

        <IntakeCard
          number="01"
          title="Client Info"
          description="Basic contact details for follow-up and proposal prep."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Full Name"
              name="fullName"
              required
              autoComplete="name"
            />
            <TextInput
              label="Business Name"
              name="businessName"
              required
              autoComplete="organization"
            />
            <TextInput
              label="Email Address"
              name="email"
              type="email"
              required
              autoComplete="email"
            />

            <TextInput
              label="Phone Number"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={13}
              placeholder="(555)555-5555"
              value={phoneValue}
              onChange={(event) => {
                setPhoneValue(formatPhone(event.target.value));
                markUnsaved();
              }}
            />

            <SelectField label="Preferred Contact Method" name="contactMethod">
              <option value="">Select one</option>
              <option>Phone Call</option>
              <option>Text</option>
              <option>Email</option>
              <option>Either Phone or Email</option>
            </SelectField>

            <TextInput
              label="Best Time to Reach"
              name="bestTime"
              placeholder="Morning, afternoon, evenings, etc."
            />
          </div>
        </IntakeCard>

        <IntakeCard
          number="02"
          title="Business Snapshot"
          description="Quick context about the business, audience, and current online presence."
        >
          <div className="grid gap-4">
            <TextArea
              label="What does the business do?"
              name="businessDescription"
              rows={3}
            />

            <TextArea
              label="Who do they serve?"
              name="idealCustomer"
              placeholder="Target customers, industries, service areas, etc."
              rows={3}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Service Area"
                name="serviceArea"
                placeholder="City, state, online, nationwide, etc."
              />
              <TextInput
                label="Current Website"
                name="websiteUrl"
                placeholder="Website, domain, or page name"
              />
              <TextInput
                label="Google Business Profile Link"
                name="gbpLink"
                placeholder="Google Business Profile URL"
              />
              <TextInput
                label="Social Links"
                name="socialLinks"
                placeholder="Facebook, Instagram, TikTok, etc."
              />
            </div>
          </div>
        </IntakeCard>

        <IntakeCard
          number="03"
          title="What They Need"
          description="Select everything that may apply. This helps uncover the right service path."
        >
          <CheckGrid name="servicesNeeded" options={servicesNeeded} />
        </IntakeCard>

        <IntakeCard
          number="04"
          title="Goals"
          description="What the client is trying to improve or accomplish."
        >
          <div className="space-y-4">
            <CheckGrid name="projectGoals" options={projectGoals} />
            <TextArea
              label="What would make this project successful?"
              name="successDefinition"
              rows={3}
            />
          </div>
        </IntakeCard>

        <IntakeCard
          number="05"
          title="Current Problems"
          description="This helps identify where the real value is."
        >
          <CheckGrid name="painPoints" options={painPoints} />
        </IntakeCard>

        <IntakeCard
          number="06"
          title="Budget + Timeline"
          description="Set expectations early and qualify the project properly."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Budget Range" name="budgetRange" required>
              <option value="">Select one</option>
              <option>Under $1,000</option>
              <option>$1,000–$2,500</option>
              <option>$2,500–$5,000</option>
              <option>$5,000–$10,000</option>
              <option>$10,000+</option>
              <option>Not sure yet</option>
            </SelectField>

            <SelectField label="Timeline" name="timeline" required>
              <option value="">Select one</option>
              <option>ASAP</option>
              <option>Within 2 weeks</option>
              <option>Within 30 days</option>
              <option>1–3 months</option>
              <option>Planning ahead</option>
            </SelectField>
          </div>
        </IntakeCard>

        <IntakeCard
          number="07"
          title="Assets + Access"
          description="Checklist only. Do not enter passwords or credentials."
        >
          <CheckGrid name="assetsAvailable" options={assetsAvailable} />

          <p className="mt-4 rounded-[var(--radius-md)] border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-[11px] font-bold leading-5 text-amber-100">
            Do not enter passwords, 2FA codes, banking info, or private access
            keys. This only tracks whether access/assets are needed or available.
          </p>
        </IntakeCard>

        <IntakeCard
          number="08"
          title="Project Details"
          description="Anything important that did not fit above."
        >
          <TextArea
            label="Describe the project, idea, or problem"
            name="projectDetails"
            rows={5}
            required
          />
        </IntakeCard>

        <IntakeCard
          number="09"
          title="Photo Sessions"
          description="Use this when the client may need visuals for their website, ads, launch, or content package."
          featured
        >
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Do they need a photo session?
              </p>
              <RadioGrid
                name="needsPhotoSession"
                options={["Yes", "No", "Maybe"]}
              />
            </div>

            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Session Type
              </p>
              <RadioGrid
                name="photoSessionType"
                options={[
                  "1-hour session",
                  "3-hour session",
                  "Half-day session",
                ]}
              />
            </div>

            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Type of Content
              </p>
              <RadioGrid
                name="photoContentType"
                options={[
                  "Website visuals",
                  "Social media content",
                  "Advertisement content",
                  "Other",
                ]}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Other Content Type"
                name="photoContentOther"
                placeholder="Describe other content type"
              />
              <TextArea
                label="Vision"
                name="photoVision"
                placeholder="Describe the style, location, shot ideas, brand feel, or content they need."
                rows={3}
              />
            </div>

            {status.message && status.type !== "success" && (
              <p
                role="status"
                className={`rounded-[var(--radius-lg)] border px-4 py-3 text-center text-sm font-bold ${
                  status.type === "error"
                    ? "border-red-300/20 bg-red-400/10 text-red-100"
                    : "border-white/10 bg-white/[0.035] text-slate-300"
                }`}
              >
                {status.message}
              </p>
            )}

            <div className="border-t border-[#5cf4ec]/15 pt-5">
              <div className="flex justify-center">
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit Client Intake"}
                </Button>
              </div>
            </div>
          </div>
        </IntakeCard>
      </form>

      <QuickNotes quickNotes={quickNotes} setQuickNotes={setQuickNotes} />

      <IntakeSuccessModal
        open={success}
        onStartNew={resetForm}
        onClose={() => setSuccess(false)}
      />
    </div>
  );
}