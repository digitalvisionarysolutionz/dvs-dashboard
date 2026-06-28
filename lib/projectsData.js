function formatStatus(value = "") {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() || ""}${word.slice(1)}`)
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function getInitials(value = "") {
  const words = value
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) {
    return "IN";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export async function getProjectsData(supabase, organizationId) {
  if (!organizationId) {
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id,
client_id,
name,
description,
notes,
status,
priority,
progress,
due_date,
      completed_at,
      archived_at,
      created_at,
      client:clients (
        id,
        name,
        business_name,
        logo_url
      )
    `
    )
    .eq("organization_id", organizationId)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Projects data error:", error.message);
    return [];
  }

  return (data || []).map((project) => {
    const clientName =
      project.client?.business_name || project.client?.name || "Internal";

    const rawStatus = project.status || "unknown";
    const rawPriority = project.priority || "medium";

    return {
      id: project.id,
      name: project.name || "Untitled Project",
      description: project.description || "No project description added yet.",
      notes: project.notes || "No project notes added yet.",

      status: formatStatus(rawStatus),
      rawStatus,

      priority: formatStatus(rawPriority),
      rawPriority,

      progress: project.progress || 0,

      dueDate: formatDate(project.due_date),
      dueDateInput: formatDateInput(project.due_date),
      rawDueDate: project.due_date || null,

      completedAt: formatDate(project.completed_at),
      archivedAt: formatDate(project.archived_at),

      clientId: project.client_id || project.client?.id || "",
      clientName,
      clientInitials: getInitials(clientName),
      clientLogoUrl: project.client?.logo_url || "",

      isCompleted: rawStatus === "completed",
      isArchived: rawStatus === "archived",
    };
  });
}