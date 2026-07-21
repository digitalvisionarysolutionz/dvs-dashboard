"use client";

const serviceOptions = [
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

const goalOptions = [
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

const problemOptions = [
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

const assetOptions = [
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

const contentTypeOptions = [
  "Website visuals",
  "Social media content",
  "Advertisement content",
  "Other",
];

function getList(value) {
  return Array.isArray(value) ? value : [];
}

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
      getList(brief.selectedServices).length ||
      getList(brief.goals).length ||
      getList(brief.currentProblems).length ||
      getList(brief.assetsAvailable).length ||
      getList(brief.contentTypes).length
  );
}

function Section({ title, description, children, defaultOpen = false }) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-white/[0.025]"
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#5cf4ec]">
            {title}
          </p>

          {description && (
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>

        <span className="shrink-0 text-lg font-black text-slate-500 transition group-open:rotate-180">
          ⌄
        </span>
      </summary>

      <div className="border-t border-[var(--app-border)] p-4">{children}</div>
    </details>
  );
}

function TextInput({ label, name, defaultValue = "", placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>

      <input
        name={name}
        defaultValue={defaultValue || ""}
        placeholder={placeholder}
        className="dvs-form-input"
      />
    </label>
  );
}

function TextArea({ label, name, defaultValue = "", placeholder = "", rows = 3 }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>

      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue || ""}
        placeholder={placeholder}
        className="dvs-form-input resize-none"
      />
    </label>
  );
}

function CheckGroup({ label, name, options, selected = [] }) {
  const selectedSet = new Set(getList(selected));

  return (
    <fieldset>
      <legend className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </legend>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-white/10 bg-[#050b12] px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-[#5cf4ec]/25 hover:bg-[#071018]"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={selectedSet.has(option)}
              className="h-4 w-4 shrink-0 accent-[#5cf4ec]"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function RadioGroup({ label, name, options, selected = "" }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </legend>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-white/10 bg-[#050b12] px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-[#5cf4ec]/25 hover:bg-[#071018]"
          >
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={selected === option}
              className="h-4 w-4 shrink-0 accent-[#5cf4ec]"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function ProjectBriefFields({ brief = {} }) {
  const shouldOpen = hasBriefData(brief);

  return (
    <div className="space-y-3">
      <div className="rounded-[var(--radius-lg)] border border-[#5cf4ec]/15 bg-[#5cf4ec]/[0.035] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#5cf4ec]">
          Optional Project Brief
        </p>

        <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
          Use this when the project needs discovery details, assets, goals, or
          photo/video planning. Leave it blank for a quick basic project.
        </p>
      </div>

      <Section
        title="Brief"
        description="Business context, budget, timeline, and project direction."
        defaultOpen={shouldOpen}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea
            label="Business description"
            name="businessDescription"
            defaultValue={brief.businessDescription}
            placeholder="What does the business do?"
          />

          <TextArea
            label="Target audience"
            name="targetAudience"
            defaultValue={brief.targetAudience}
            placeholder="Who do they serve?"
          />

          <TextInput
            label="Service area"
            name="serviceArea"
            defaultValue={brief.serviceArea}
            placeholder="City, state, region, or service area"
          />

          <TextInput
            label="Current website"
            name="currentWebsite"
            defaultValue={brief.currentWebsite}
            placeholder="example.com"
          />

          <TextInput
            label="Google Business Profile URL"
            name="googleBusinessProfileUrl"
            defaultValue={brief.googleBusinessProfileUrl}
            placeholder="GBP link"
          />

          <TextInput
            label="Social links"
            name="socialLinks"
            defaultValue={brief.socialLinks}
            placeholder="Instagram, Facebook, TikTok, etc."
          />

          <TextInput
            label="Budget range"
            name="budgetRange"
            defaultValue={brief.budgetRange}
            placeholder="$1k-$3k, $3k-$5k, etc."
          />

          <TextInput
            label="Timeline"
            name="timeline"
            defaultValue={brief.timeline}
            placeholder="ASAP, 2-4 weeks, flexible, etc."
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextArea
            label="Project details / idea / problem"
            name="projectDetails"
            defaultValue={brief.projectDetails}
            placeholder="Describe the project, idea, or problem..."
            rows={4}
          />

          <TextArea
            label="Success definition"
            name="successDefinition"
            defaultValue={brief.successDefinition}
            placeholder="What would make this project successful?"
            rows={4}
          />
        </div>
      </Section>

      <Section
        title="Needs"
        description="Services, goals, and current problems."
        defaultOpen={false}
      >
        <div className="space-y-5">
          <CheckGroup
            label="Selected services"
            name="selectedServices"
            options={serviceOptions}
            selected={brief.selectedServices}
          />

          <CheckGroup
            label="Goals"
            name="goals"
            options={goalOptions}
            selected={brief.goals}
          />

          <CheckGroup
            label="Current problems"
            name="currentProblems"
            options={problemOptions}
            selected={brief.currentProblems}
          />
        </div>
      </Section>

      <Section
        title="Assets + Access"
        description="Checklist only. Do not store passwords or credentials."
        defaultOpen={false}
      >
        <CheckGroup
          label="Assets available"
          name="assetsAvailable"
          options={assetOptions}
          selected={brief.assetsAvailable}
        />

        <p className="mt-4 rounded-[var(--radius-md)] border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-xs font-bold leading-5 text-amber-100">
          Do not enter passwords here. Track whether access is needed or already
          available, but keep credentials outside the dashboard.
        </p>
      </Section>

      <Section
        title="Photo / Video"
        description="Use this when visuals are part of the project."
        defaultOpen={false}
      >
        <div className="space-y-5">
          <RadioGroup
            label="Needs photo session?"
            name="needsPhotoSession"
            options={["Yes", "No", "Maybe"]}
            selected={brief.needsPhotoSession}
          />

          <RadioGroup
            label="Session type"
            name="photoSessionType"
            options={["1-hour session", "3-hour session", "Half-day session"]}
            selected={brief.photoSessionType}
          />

          <CheckGroup
            label="Content types"
            name="contentTypes"
            options={contentTypeOptions}
            selected={brief.contentTypes}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Other content type"
              name="otherContentType"
              defaultValue={brief.otherContentType}
              placeholder="Other content needs"
            />

            <TextArea
              label="Vision"
              name="vision"
              defaultValue={brief.vision}
              placeholder="Describe the visual direction or creative vision..."
            />
          </div>
        </div>
      </Section>

      <Section
        title="Private / Internal"
        description="Internal-only notes. Not for future client portal visibility."
        defaultOpen={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea
            label="Internal notes"
            name="internalNotes"
            defaultValue={brief.internalNotes}
            placeholder="Internal scope notes, reminders, or delivery context..."
            rows={4}
          />

          <TextArea
            label="Private notes"
            name="privateNotes"
            defaultValue={brief.privateNotes}
            placeholder="Private notes for DVS/internal team only..."
            rows={4}
          />
        </div>
      </Section>
    </div>
  );
}