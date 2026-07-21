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
  if (!value) return "No due date";

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

function groupProjectsByClient(projects = []) {
  return projects.reduce((groups, project) => {
    if (!project.client_id) return groups;

    const existingProjects = groups.get(project.client_id) || [];
    const rawStatus = project.status || "in_progress";
    const rawPriority = project.priority || "medium";

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

export async function getClientsData(supabase, organizationId) {
  if (!organizationId) return [];

  const [clientsResponse, projectsResponse] = await Promise.all([
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
        created_at
      `
      )
      .eq("organization_id", organizationId)
      .not("client_id", "is", null)
      .neq("status", "archived")
      .order("due_date", { ascending: true }),
  ]);

  if (clientsResponse.error) {
    console.error("Clients data error:", clientsResponse.error.message);
    return [];
  }

  if (projectsResponse.error) {
    console.error("Client linked projects error:", projectsResponse.error.message);
  }

  const projectsByClient = groupProjectsByClient(projectsResponse.data || []);

  return Promise.all(
    (clientsResponse.data || []).map(async (client) => {
      const rawStatus = client.status || "active";
      const businessName =
        client.business_name || client.name || "Unnamed Business";
      const signedLogoUrl = await getSignedLogoUrl(supabase, client.logo_path);
      const linkedProjects = projectsByClient.get(client.id) || [];

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
        linkedProjects: linkedProjects.slice(0, 6),
        projectSummary: buildProjectSummary(linkedProjects),
        createdAt: client.created_at || "",
      };
    })
  );
}