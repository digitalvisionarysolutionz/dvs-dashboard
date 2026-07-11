"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server.js";
import {
  ADMIN_ROLES,
  WRITE_ROLES,
  getCurrentWorkspace,
  requireWorkspaceRole,
} from "../../../lib/workspace.js";

function getIdsFromFormData(formData) {
  const rawProjectIds = formData.get("projectIds");

  if (!rawProjectIds) return [];

  try {
    const parsedIds = JSON.parse(rawProjectIds);
    return Array.isArray(parsedIds) ? parsedIds.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getSingleIdFromFormData(formData) {
  const projectId = formData.get("projectId");

  if (!projectId) return [];

  return [projectId];
}

async function getWorkspaceContext({
  allowedRoles = WRITE_ROLES,
  action = "manage projects",
} = {}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await getCurrentWorkspace(supabase, user);

  if (!workspace?.organization?.id) {
    redirect("/login");
  }

  requireWorkspaceRole(workspace, allowedRoles, action);

  return {
    supabase,
    workspace,
    organizationId: workspace.organization.id,
  };
}

async function updateProjects(projectIds, updates, options = {}) {
  if (projectIds.length === 0) return;

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: options.allowedRoles || WRITE_ROLES,
    action: options.action || "update projects",
  });

  const { error } = await supabase
    .from("projects")
    .update(updates)
    .eq("organization_id", organizationId)
    .in("id", projectIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  revalidatePath("/");
}

async function deleteProjects(projectIds) {
  if (projectIds.length === 0) return;

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: ADMIN_ROLES,
    action: "delete projects",
  });

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("organization_id", organizationId)
    .in("id", projectIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  revalidatePath("/");
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanDate(value) {
  const nextValue = cleanText(value);

  return nextValue || null;
}

function getProgressFromStatus(status) {
  const progressByStatus = {
    not_started: 0,
    in_progress: 40,
    waiting_on_client: 60,
    ready_for_review: 85,
    completed: 100,
    archived: 0,
  };

  return progressByStatus[status] ?? 40;
}

async function validateExistingClientId({
  supabase,
  organizationId,
  existingClientId,
}) {
  if (!existingClientId) {
    return null;
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", existingClientId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error("Selected client was not found in this workspace.");
  }

  return data.id;
}

async function resolveProjectClientId({
  supabase,
  organizationId,
  existingClientId,
  newClientName,
}) {
  if (newClientName) {
    const { data: existingClient, error: existingError } = await supabase
      .from("clients")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("business_name", newClientName)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingClient?.id) {
      return existingClient.id;
    }

    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        organization_id: organizationId,
        name: newClientName,
        business_name: newClientName,
        status: "active",
        notes: "Created from project form.",
      })
      .select("id")
      .single();

    if (clientError) {
      throw new Error(clientError.message);
    }

    return newClient.id;
  }

  return validateExistingClientId({
    supabase,
    organizationId,
    existingClientId,
  });
}

function buildProjectPayload(formData, clientId) {
  const projectName = cleanText(formData.get("projectName"));

  if (!projectName) {
    throw new Error("Project name is required.");
  }

  const status = cleanText(formData.get("status")) || "in_progress";
  const now = new Date().toISOString();

  return {
    client_id: clientId,
    name: projectName,
    description:
      cleanText(formData.get("description")) ||
      "No project description added yet.",
    notes: cleanText(formData.get("notes")) || null,
    status,
    priority: cleanText(formData.get("priority")) || "medium",
    progress: getProgressFromStatus(status),
    due_date: cleanDate(formData.get("dueDate")),
    completed_at: status === "completed" ? now : null,
    archived_at: status === "archived" ? now : null,
  };
}

export async function createProject(formData) {
  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "create projects",
  });

  const existingClientId = cleanText(formData.get("clientId"));
  const newClientName = cleanText(formData.get("newClientName"));

  const clientId = await resolveProjectClientId({
    supabase,
    organizationId,
    existingClientId,
    newClientName,
  });

  const payload = buildProjectPayload(formData, clientId);

  const { error } = await supabase.from("projects").insert({
    organization_id: organizationId,
    ...payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/clients");
}

export async function updateProject(formData) {
  const projectId = cleanText(formData.get("projectId"));

  if (!projectId) {
    throw new Error("Missing project ID.");
  }

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "update projects",
  });

  const existingClientId = cleanText(formData.get("clientId"));
  const newClientName = cleanText(formData.get("newClientName"));

  const clientId = await resolveProjectClientId({
    supabase,
    organizationId,
    existingClientId,
    newClientName,
  });

  const payload = buildProjectPayload(formData, clientId);

  const { error } = await supabase
    .from("projects")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/clients");
}

export async function completeSelectedProjects(formData) {
  const projectIds = getIdsFromFormData(formData);

  await updateProjects(
    projectIds,
    {
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
      archived_at: null,
    },
    { action: "complete projects" }
  );
}

export async function moveSelectedProjectsToActive(formData) {
  const projectIds = getIdsFromFormData(formData);

  await updateProjects(
    projectIds,
    {
      status: "in_progress",
      progress: 40,
      completed_at: null,
      archived_at: null,
    },
    { action: "restore projects" }
  );
}

export async function archiveSelectedProjects(formData) {
  const projectIds = getIdsFromFormData(formData);

  await updateProjects(
    projectIds,
    {
      status: "archived",
      progress: 0,
      archived_at: new Date().toISOString(),
    },
    { action: "archive projects" }
  );
}

export async function deleteSelectedProjects(formData) {
  const projectIds = getIdsFromFormData(formData);

  await deleteProjects(projectIds);
}

export async function toggleSingleProjectCompletion(formData) {
  const projectId = formData.get("projectId");
  const currentStatus = formData.get("currentStatus");

  if (!projectId) return;

  if (currentStatus === "completed") {
    await updateProjects(
      [projectId],
      {
        status: "in_progress",
        progress: 40,
        completed_at: null,
        archived_at: null,
      },
      { action: "restore projects" }
    );

    return;
  }

  await updateProjects(
    [projectId],
    {
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
      archived_at: null,
    },
    { action: "complete projects" }
  );
}

export async function moveSingleProjectToActive(formData) {
  const projectIds = getSingleIdFromFormData(formData);

  await updateProjects(
    projectIds,
    {
      status: "in_progress",
      progress: 40,
      completed_at: null,
      archived_at: null,
    },
    { action: "restore projects" }
  );
}

export async function archiveSingleProject(formData) {
  const projectIds = getSingleIdFromFormData(formData);

  await updateProjects(
    projectIds,
    {
      status: "archived",
      progress: 0,
      archived_at: new Date().toISOString(),
    },
    { action: "archive projects" }
  );
}

export async function deleteSingleProject(formData) {
  const projectIds = getSingleIdFromFormData(formData);

  await deleteProjects(projectIds);
}