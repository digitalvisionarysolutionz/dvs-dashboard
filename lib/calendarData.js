import { getLeadsData } from "./leadsData.js";
import { getProjectsData } from "./projectsData.js";

function getDateKey(value) {
  if (!value) return "";

  const rawValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return rawValue;
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizePriority(value = "") {
  return String(value || "medium").toLowerCase();
}

function normalizeStatus(value = "") {
  return String(value || "active").toLowerCase();
}

function cleanText(value, fallback = "") {
  const cleaned = String(value || "").trim();

  return cleaned || fallback;
}

function toProjectDeadlineEvent(project) {
  const date = getDateKey(project.rawDueDate);

  if (!date) {
    return null;
  }

  return {
    id: `project-deadline-${project.id}`,
    sourceId: project.id,
    sourceType: "project",
    eventType: "Project Deadline",
    title: project.name || "Project deadline",
    clientName: project.clientName || "Internal",
    date,
    startAt: null,
    endAt: null,
    allDay: true,
    priority: normalizePriority(project.rawPriority),
    status: normalizeStatus(project.rawStatus),
    description: project.description || "Project deadline",
    meta: {
      progress: Number(project.progress || 0),
      dueDateLabel: project.dueDate || "",
      statusLabel: project.status || "",
      priorityLabel: project.priority || "",
    },
    href: "/projects",
  };
}

function toLeadFollowUpEvent(lead) {
  const date = getDateKey(lead.nextFollowUp);

  if (!date) {
    return null;
  }

  return {
    id: `lead-follow-up-${lead.id}`,
    sourceId: lead.id,
    sourceType: "lead",
    eventType: "Lead Follow-Up",
    title: lead.businessName || "Lead follow-up",
    clientName: lead.contactName || "No contact added",
    date,
    startAt: null,
    endAt: null,
    allDay: true,
    priority: normalizePriority(lead.rawPriority),
    status: normalizeStatus(lead.rawStage),
    description: lead.serviceInterest || "Follow up with lead",
    meta: {
      valueLabel: lead.estimatedValueLabel || "$0",
      stageLabel: lead.stage || "",
      sourceLabel: lead.source || "",
      serviceLabel: lead.serviceInterest || "",
    },
    href: "/crm",
  };
}

function toIntakeEvent(submission) {
  const date = getDateKey(submission.created_at);

  if (!date) {
    return null;
  }

  const title =
    cleanText(submission.business_name) ||
    cleanText(submission.full_name) ||
    "Private intake submitted";

  return {
    id: `intake-submitted-${submission.id}`,
    sourceId: submission.id,
    sourceType: "intake",
    eventType: "Intake Submitted",
    title,
    clientName: cleanText(submission.full_name, "Private Intake"),
    date,
    startAt: submission.created_at || null,
    endAt: null,
    allDay: false,
    priority: "medium",
    status: normalizeStatus(submission.status || "new"),
    description: cleanText(
      submission.service_interest,
      "New private intake submission"
    ),
    meta: {
      formName: submission.form_name || "Private Client Intake",
      formType: submission.form_type || "private_intake",
      sourceLabel: submission.source || "DVS Intake",
      statusLabel: submission.status || "",
    },
    href: "/forms",
  };
}

async function getIntakeCalendarEvents(supabase, organizationId) {
  const { data, error } = await supabase
    .from("form_submissions")
    .select(
      `
      id,
      lead_id,
      client_id,
      form_type,
      source,
      form_name,
      full_name,
      business_name,
      service_interest,
      status,
      created_at
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Calendar intake data error:", error.message);
    return [];
  }

  return (data || []).map(toIntakeEvent).filter(Boolean);
}

function sortEvents(events = []) {
  return [...events].sort((left, right) => {
    const leftDate = left.startAt || left.date;
    const rightDate = right.startAt || right.date;

    return new Date(leftDate).getTime() - new Date(rightDate).getTime();
  });
}

function buildCalendarSummary(events = []) {
  const todayKey = getDateKey(new Date().toISOString());

  const todayEvents = events.filter((event) => event.date === todayKey);
  const projectDeadlines = events.filter(
    (event) => event.sourceType === "project"
  );
  const leadFollowUps = events.filter((event) => event.sourceType === "lead");
  const intakeEvents = events.filter((event) => event.sourceType === "intake");

  return {
    totalEvents: events.length,
    todayEvents: todayEvents.length,
    projectDeadlines: projectDeadlines.length,
    leadFollowUps: leadFollowUps.length,
    intakeEvents: intakeEvents.length,
  };
}

export async function getCalendarData(supabase, organizationId) {
  if (!organizationId) {
    return {
      events: [],
      reminders: [],
      summary: buildCalendarSummary([]),
    };
  }

  const [projects, leadsResponse, intakeEvents] = await Promise.all([
    getProjectsData(supabase, organizationId),
    getLeadsData(supabase, organizationId),
    getIntakeCalendarEvents(supabase, organizationId),
  ]);

  const projectEvents = (projects || [])
    .map(toProjectDeadlineEvent)
    .filter(Boolean);

  const leadEvents = (leadsResponse?.leads || [])
    .map(toLeadFollowUpEvent)
    .filter(Boolean);

  const events = sortEvents([...projectEvents, ...leadEvents, ...intakeEvents]);

  return {
    events,
    reminders: [],
    summary: buildCalendarSummary(events),
  };
}