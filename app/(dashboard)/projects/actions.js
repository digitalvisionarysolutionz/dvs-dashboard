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