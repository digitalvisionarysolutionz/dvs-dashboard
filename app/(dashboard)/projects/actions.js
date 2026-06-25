"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server.js";
import { getCurrentWorkspace } from "../../../lib/workspace.js";

function getIdsFromFormData(formData) {
  const rawProjectIds = formData.get("projectIds");

  if (!rawProjectIds) {
    return [];
  }

  try {
    const parsedIds = JSON.parse(rawProjectIds);

    if (!Array.isArray(parsedIds)) {
      return [];
    }

    return parsedIds.filter(Boolean);
  } catch {
    return [];
  }
}

function getSingleIdFromFormData(formData) {
  const projectId = formData.get("projectId");

  if (!projectId) {
    return [];
  }

  return [projectId];
}

async function getWorkspaceContext() {
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

  return {
    supabase,
    organizationId: workspace.organization.id,
  };
}

async function updateProjects(projectIds, updates) {
  if (projectIds.length === 0) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("projects")
    .update(updates)
    .eq("organization_id", organizationId)
    .in("id", projectIds);

  if (error) {
    console.error("Project update error:", error.message);
  }

  revalidatePath("/projects");
  revalidatePath("/");
}

async function deleteProjects(projectIds) {
  if (projectIds.length === 0) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("organization_id", organizationId)
    .in("id", projectIds);

  if (error) {
    console.error("Project delete error:", error.message);
  }

  revalidatePath("/projects");
  revalidatePath("/");
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanNumber(value) {
  const nextValue = Number(value || 0);

  if (Number.isNaN(nextValue)) {
    return 0;
  }

  return nextValue;
}

function cleanDate(value) {
  const nextValue = cleanText(value);

  if (!nextValue) {
    return null;
  }

  return nextValue;
}

export async function createProject(formData) {
  const { supabase, organizationId } = await getWorkspaceContext();

  const projectName = cleanText(formData.get("projectName"));
  const existingClientId = cleanText(formData.get("clientId"));
  const newClientName = cleanText(formData.get("newClientName"));

  if (!projectName) {
    throw new Error("Project name is required.");
  }

  let clientId = existingClientId || null;

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
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          organization_id: organizationId,
          name: newClientName,
          business_name: newClientName,
          status: "active",
          notes: "Created from new project modal.",
        })
        .select("id")
        .single();

      if (clientError) {
        throw new Error(clientError.message);
      }

      clientId = newClient.id;
    }
  }

  const status = cleanText(formData.get("status")) || "in_progress";

  const { error } = await supabase.from("projects").insert({
    organization_id: organizationId,
    client_id: clientId,
    name: projectName,
    description:
      cleanText(formData.get("description")) ||
      "No project description added yet.",
    notes: cleanText(formData.get("notes")) || null,
    status,
    priority: cleanText(formData.get("priority")) || "medium",
    progress: cleanNumber(formData.get("progress")),
    due_date: cleanDate(formData.get("dueDate")),
    completed_at: status === "completed" ? new Date().toISOString() : null,
    archived_at: status === "archived" ? new Date().toISOString() : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/clients");
}

export async function completeSelectedProjects(formData) {
  const projectIds = getIdsFromFormData(formData);

  await updateProjects(projectIds, {
    status: "completed",
    progress: 100,
    completed_at: new Date().toISOString(),
    archived_at: null,
  });
}

export async function moveSelectedProjectsToActive(formData) {
  const projectIds = getIdsFromFormData(formData);

  await updateProjects(projectIds, {
    status: "in_progress",
    completed_at: null,
    archived_at: null,
  });
}

export async function archiveSelectedProjects(formData) {
  const projectIds = getIdsFromFormData(formData);

  await updateProjects(projectIds, {
    status: "archived",
    archived_at: new Date().toISOString(),
  });
}

export async function deleteSelectedProjects(formData) {
  const projectIds = getIdsFromFormData(formData);

  await deleteProjects(projectIds);
}

export async function toggleSingleProjectCompletion(formData) {
  const projectId = formData.get("projectId");
  const currentStatus = formData.get("currentStatus");

  if (!projectId) {
    return;
  }

  if (currentStatus === "completed") {
    await updateProjects([projectId], {
      status: "in_progress",
      progress: 75,
      completed_at: null,
      archived_at: null,
    });

    return;
  }

  await updateProjects([projectId], {
    status: "completed",
    progress: 100,
    completed_at: new Date().toISOString(),
    archived_at: null,
  });
}

export async function moveSingleProjectToActive(formData) {
  const projectIds = getSingleIdFromFormData(formData);

  await updateProjects(projectIds, {
    status: "in_progress",
    completed_at: null,
    archived_at: null,
  });
}

export async function archiveSingleProject(formData) {
  const projectIds = getSingleIdFromFormData(formData);

  await updateProjects(projectIds, {
    status: "archived",
    archived_at: new Date().toISOString(),
  });
}

export async function deleteSingleProject(formData) {
  const projectIds = getSingleIdFromFormData(formData);

  await deleteProjects(projectIds);
}