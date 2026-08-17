const LOGO_BUCKET = "client-logos";

function formatStatus(value = "") {
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

  if (words.length === 0) return "CL";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function normalizeWebsite(value = "") {
  const cleaned = String(value || "").trim();

  if (!cleaned) return "";
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }

  return `https://${cleaned}`;
}

function normalizeLogoUrl(value = "") {
  const cleaned = String(value || "").trim();

  if (!cleaned) return "";
  if (
    cleaned.startsWith("/") ||
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://")
  ) {
    return cleaned;
  }

  return `https://${cleaned}`;
}

function formatDate(value) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getSortDate(value) {
  if (!value) return Number.POSITIVE_INFINITY;

  return new Date(value).getTime();
}

function isActiveProject(project) {
  return !["completed", "archived"].includes(project.rawStatus);
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function uniqueList(values = []) {
  return [
    ...new Set(
      values.map((value) => String(value || "").trim()).filter(Boolean)
    ),
  ];
}

async function getSignedLogoUrl(supabase, logoPath) {
  if (!logoPath) return "";

  const { data, error } = await supabase.storage
    .from(LOGO_BUCKET)
    .createSignedUrl(logoPath, 60 * 60);

  if (error) {
    console.error("Client logo signed URL error:", error.message);
    return "";
  }

  return data?.signedUrl || "";
}

function normalizeBrief(brief) {
  const nextBrief = Array.isArray(brief) ? brief[0] : brief;

  if (!nextBrief) {
    return null;
  }

  return {
    id: nextBrief.id || "",
    formSubmissionId: nextBrief.form_submission_id || "",
    selectedServices: asArray(nextBrief.selected_services),
    goals: asArray(nextBrief.goals),
    currentProblems: asArray(nextBrief.current_problems),
    assetsAvailable: asArray(nextBrief.assets_available),
    budgetRange: nextBrief.budget_range || "",
    timeline: nextBrief.timeline || "",
    projectDetails: nextBrief.project_details || "",
    successDefinition: nextBrief.success_definition || "",
    businessDescription: nextBrief.business_description || "",
    targetAudience: nextBrief.target_audience || "",
    serviceArea: nextBrief.service_area || "",
    needsPhotoSession: nextBrief.needs_photo_session || "",
    photoSessionType: nextBrief.photo_session_type || "",
    contentTypes: asArray(nextBrief.content_types),
    vision: nextBrief.vision || "",
  };
}

function normalizeIntake(submission) {
  const normalized = submission.normalized_payload || submission.raw_payload || {};
  const quickNotes = normalized.quickNotes || {};

  return {
    id: submission.id,
    leadId: submission.lead_id || "",
    formType: submission.form_type || "",
    source: submission.source || "Private Intake",
    formName: submission.form_name || "Private Client Intake",
    submissionId: submission.submission_id || "",
    status: submission.status || "",
    submittedAt: formatDate(submission.created_at),
    rawCreatedAt: submission.created_at || "",
    fullName: submission.full_name || normalized.fullName || "",
    businessName: submission.business_name || normalized.businessName || "",
    email: submission.email || normalized.email || "",
    phone: submission.phone || normalized.phone || "",
    serviceInterest:
      submission.service_interest ||
      asArray(normalized.selectedServices).join(", ") ||
      "General inquiry",
    budgetRange: submission.budget_range || normalized.budgetRange || "",
    timeline: submission.timeline || normalized.timeline || "",
    selectedServices: uniqueList([
      ...asArray(normalized.selectedServices),
      submission.service_interest && submission.service_interest !== "General inquiry"
        ? submission.service_interest
        : "",
    ]),
    goals: asArray(normalized.goals),
    currentProblems: asArray(normalized.currentProblems),
    assetsAvailable: asArray(normalized.assetsAvailable),
    projectDetails: normalized.projectDetails || "",
    successDefinition: normalized.successDefinition || "",
    businessDescription: normalized.businessDescription || "",
    targetAudience: normalized.targetAudience || "",
    serviceArea: normalized.serviceArea || "",
    needsPhotoSession: normalized.needsPhotoSession || "",
    photoSessionType: normalized.photoSessionType || "",
    photoContentType: normalized.photoContentType || "",
    photoVision: normalized.photoVision || "",
    quickNotes: {
      internalNotes: quickNotes.internalNotes || "",
      recommendedService: quickNotes.recommendedService || "",
      quotedAmount: quickNotes.quotedAmount || "",
      estimatedRange: quickNotes.estimatedRange || "",
      followUpPriority: quickNotes.followUpPriority || "",
      nextStep: quickNotes.nextStep || "",
    },
  };
}

function groupProjectsByClient(projects = []) {
  return projects.reduce((groups, project) => {
    if (!project.client_id) return groups;

    const existingProjects = groups.get(project.client_id) || [];
    const rawStatus = project.status || "in_progress";
    const rawPriority = project.priority || "medium";
    const brief = normalizeBrief(project.project_briefs);

    existingProjects.push({
      id: project.id,
      name: project.name || "Untitled Project",
      status: formatStatus(rawStatus),
      rawStatus,
      priority: formatStatus(rawPriority),
      rawPriority,
      progress: Number(project.progress || 0),
      dueDate: formatDate(project.due_date),
      rawDueDate: project.due_date || null,
      brief,
    });

    groups.set(project.client_id, existingProjects);

    return groups;
  }, new Map());
}

function buildProjectSummary(projects = []) {
  const activeProjects = projects.filter(isActiveProject);
  const completedProjects = projects.filter(
    (project) => project.rawStatus === "completed"
  );

  const urgentProject =
    [...activeProjects].sort((left, right) => {
      const leftDue = getSortDate(left.rawDueDate);
      const rightDue = getSortDate(right.rawDueDate);

      if (leftDue !== rightDue) {
        return leftDue - rightDue;
      }

      if (left.rawPriority === "high" && right.rawPriority !== "high") {
        return -1;
      }

      if (right.rawPriority === "high" && left.rawPriority !== "high") {
        return 1;
      }

      return 0;
    })[0] || projects[0] || null;

  return {
    total: projects.length,
    active: activeProjects.length,
    completed: completedProjects.length,
    urgentProject,
  };
}

function groupLeadsByClient(leads = []) {
  return leads.reduce((groups, lead) => {
    if (!lead.client_id) return groups;

    const existingLeads = groups.get(lead.client_id) || [];
    existingLeads.push(lead);
    groups.set(lead.client_id, existingLeads);

    return groups;
  }, new Map());
}

function groupIntakesByClient({ submissions = [], leadsByClient = new Map() }) {
  const submissionIdToClientId = new Map();
  const leadIdToClientId = new Map();

  for (const [clientId, leads] of leadsByClient.entries()) {
    for (const lead of leads) {
      if (lead.form_submission_id) {
        submissionIdToClientId.set(lead.form_submission_id, clientId);
      }

      if (lead.id) {
        leadIdToClientId.set(lead.id, clientId);
      }
    }
  }

  return submissions.reduce((groups, submission) => {
    const clientId =
      submission.client_id ||
      submissionIdToClientId.get(submission.id) ||
      leadIdToClientId.get(submission.lead_id) ||
      "";

    if (!clientId) return groups;

    const existingSubmissions = groups.get(clientId) || [];
    existingSubmissions.push(normalizeIntake(submission));
    groups.set(clientId, existingSubmissions);

    return groups;
  }, new Map());
}

function buildNeedsSummary({ linkedProjects = [], linkedIntakes = [] }) {
  const projectBriefs = linkedProjects
    .map((project) => project.brief)
    .filter(Boolean);

  return {
    services: uniqueList([
      ...linkedIntakes.flatMap((intake) => intake.selectedServices),
      ...projectBriefs.flatMap((brief) => brief.selectedServices),
    ]),
    goals: uniqueList([
      ...linkedIntakes.flatMap((intake) => intake.goals),
      ...projectBriefs.flatMap((brief) => brief.goals),
    ]),
    currentProblems: uniqueList([
      ...linkedIntakes.flatMap((intake) => intake.currentProblems),
      ...projectBriefs.flatMap((brief) => brief.currentProblems),
    ]),
    assetsAvailable: uniqueList([
      ...linkedIntakes.flatMap((intake) => intake.assetsAvailable),
      ...projectBriefs.flatMap((brief) => brief.assetsAvailable),
    ]),
    sourceCount: linkedIntakes.length + projectBriefs.length,
  };
}

export async function getClientsData(supabase, organizationId) {
  if (!organizationId) return [];

  const [clientsResponse, projectsResponse, leadsResponse, submissionsResponse] =
    await Promise.all([
      supabase
        .from("clients")
        .select(
          `
          id,
          name,
          business_name,
          email,
          phone,
          website,
          location,
          status,
          notes,
          logo_url,
          logo_path,
          created_at
        `
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),

      supabase
        .from("projects")
        .select(
          `
          id,
          client_id,
          name,
          status,
          priority,
          progress,
          due_date,
          created_at,
          project_briefs (
            id,
            form_submission_id,
            business_description,
            target_audience,
            service_area,
            selected_services,
            goals,
            success_definition,
            current_problems,
            budget_range,
            timeline,
            assets_available,
            project_details,
            needs_photo_session,
            photo_session_type,
            content_types,
            vision
          )
        `
        )
        .eq("organization_id", organizationId)
        .not("client_id", "is", null)
        .neq("status", "archived")
        .order("due_date", { ascending: true }),

      supabase
        .from("leads")
        .select(
          `
          id,
          client_id,
          form_submission_id,
          business_name,
          contact_name,
          source,
          form_source,
          form_name,
          service_interest,
          stage,
          status,
          created_at
        `
        )
        .eq("organization_id", organizationId)
        .not("client_id", "is", null)
        .neq("status", "deleted")
        .order("created_at", { ascending: false }),

      supabase
        .from("form_submissions")
        .select(
          `
          id,
          client_id,
          lead_id,
          form_type,
          source_page,
          source,
          form_name,
          submission_id,
          status,
          full_name,
          business_name,
          email,
          phone,
          service_interest,
          budget_range,
          timeline,
          normalized_payload,
          raw_payload,
          created_at,
          updated_at
        `
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
    ]);

  if (clientsResponse.error) {
    console.error("Clients data error:", clientsResponse.error.message);
    return [];
  }

  if (projectsResponse.error) {
    console.error("Client linked projects error:", projectsResponse.error.message);
  }

  if (leadsResponse.error) {
    console.error("Client linked leads error:", leadsResponse.error.message);
  }

  if (submissionsResponse.error) {
    console.error(
      "Client linked intake submissions error:",
      submissionsResponse.error.message
    );
  }

  const projectsByClient = groupProjectsByClient(projectsResponse.data || []);
  const leadsByClient = groupLeadsByClient(leadsResponse.data || []);
  const intakesByClient = groupIntakesByClient({
    submissions: submissionsResponse.data || [],
    leadsByClient,
  });

  return Promise.all(
    (clientsResponse.data || []).map(async (client) => {
      const rawStatus = client.status || "active";
      const businessName =
        client.business_name || client.name || "Unnamed Business";
      const signedLogoUrl = await getSignedLogoUrl(supabase, client.logo_path);
      const linkedProjects = projectsByClient.get(client.id) || [];
      const linkedLeads = leadsByClient.get(client.id) || [];
      const linkedIntakes = intakesByClient.get(client.id) || [];

      return {
        id: client.id,
        name: client.name || "Unnamed Client",
        businessName,
        initials: getInitials(businessName),
        email: client.email || "No email",
        phone: client.phone || "No phone",
        website: normalizeWebsite(client.website || ""),
        location: client.location || "",
        rawStatus,
        status: formatStatus(rawStatus),
        isArchived: rawStatus === "archived",
        notes: client.notes || "No notes added yet.",
        logoPath: client.logo_path || "",
        logoUrl: signedLogoUrl || normalizeLogoUrl(client.logo_url || ""),
        linkedProjects: linkedProjects.slice(0, 12),
        linkedLeads,
        linkedIntakes,
        needsSummary: buildNeedsSummary({ linkedProjects, linkedIntakes }),
        projectSummary: buildProjectSummary(linkedProjects),
        createdAt: client.created_at || "",
      };
    })
  );
}