function formatLabel(value = "") {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() || ""}${word.slice(1)}`)
    .join(" ");
}

function getInitials(value = "") {
  const words = value
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) return "LD";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function normalizeWebsite(value = "") {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

function formatDate(value) {
  if (!value) return "No follow-up";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatMoney(value = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export const leadStages = [
  {
    key: "new_lead",
    label: "New Lead",
    tone: "cyan",
  },
  {
    key: "contacted",
    label: "Contacted",
    tone: "blue",
  },
  {
    key: "discovery",
    label: "Discovery",
    tone: "violet",
  },
  {
    key: "proposal_sent",
    label: "Proposal Sent",
    tone: "orange",
  },
  {
    key: "negotiation",
    label: "Negotiation",
    tone: "yellow",
  },
  {
    key: "won",
    label: "Won",
    tone: "green",
  },
  {
    key: "lost",
    label: "Lost",
    tone: "red",
  },
];

export async function getLeadsData(supabase, organizationId) {
  if (!organizationId) {
    return {
      leads: [],
      summary: {
        totalLeads: 0,
        activeOpportunities: 0,
        estimatedValue: "$0",
        followUpsDue: 0,
      },
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .select(
      `
      id,
      business_name,
      contact_name,
      email,
      phone,
      website,
      location,
      source,
      form_source,
      form_name,
      form_id,
      submission_id,
      raw_payload,
      service_interest,
      stage,
      priority,
      estimated_value,
      next_follow_up,
      notes,
      status,
      client_id,
      project_id,
      created_at,
      updated_at
    `
    )
    .eq("organization_id", organizationId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Leads data error:", error.message);

    return {
      leads: [],
      summary: {
        totalLeads: 0,
        activeOpportunities: 0,
        estimatedValue: "$0",
        followUpsDue: 0,
      },
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const leads = (data || []).map((lead) => {
    const businessName = lead.business_name || "Unnamed Lead";
    const stage = lead.stage || "new_lead";
    const priority = lead.priority || "medium";
    const estimatedValue = Number(lead.estimated_value || 0);

    return {
      id: lead.id,
      businessName,
      contactName: lead.contact_name || "No contact added",
      initials: getInitials(businessName),
      email: lead.email || "No email",
      phone: lead.phone || "No phone",
      website: normalizeWebsite(lead.website || ""),
      location: lead.location || "No location",
      source: lead.source || "Manual",
      formSource: lead.form_source || "Manual",
      formName: lead.form_name || "No form name",
      formId: lead.form_id || "",
      submissionId: lead.submission_id || "",
      rawPayload: lead.raw_payload || {},
      serviceInterest: lead.service_interest || "General inquiry",
      rawStage: stage,
      stage: formatLabel(stage),
      rawPriority: priority,
      priority: formatLabel(priority),
      estimatedValue,
      estimatedValueLabel: formatMoney(estimatedValue),
      nextFollowUp: lead.next_follow_up || "",
      nextFollowUpLabel: formatDate(lead.next_follow_up),
      notes: lead.notes || "No notes added yet.",
      rawStatus: lead.status || "active",
      clientId: lead.client_id || "",
      projectId: lead.project_id || "",
      createdAt: lead.created_at || "",
      updatedAt: lead.updated_at || "",
    };
  });

  const activeLeads = leads.filter(
    (lead) =>
      !["won", "lost", "archived"].includes(lead.rawStage) &&
      lead.rawStatus !== "archived"
  );

  const estimatedValue = activeLeads.reduce(
    (total, lead) => total + lead.estimatedValue,
    0
  );

  const followUpsDue = activeLeads.filter((lead) => {
    if (!lead.nextFollowUp) return false;

    const dueDate = new Date(`${lead.nextFollowUp}T12:00:00`);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate <= today;
  }).length;

  return {
    leads,
    summary: {
      totalLeads: leads.length,
      activeOpportunities: activeLeads.length,
      estimatedValue: formatMoney(estimatedValue),
      followUpsDue,
    },
  };
}