"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../utils/supabase/server.js";
import { getCurrentWorkspace } from "../../../lib/workspace.js";

async function getWorkspaceContext() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to manage clients.");
  }

  const workspace = await getCurrentWorkspace(supabase, user);

  if (!workspace?.organization?.id) {
    throw new Error("No active workspace found.");
  }

  return {
    supabase,
    organizationId: workspace.organization.id,
  };
}

function parseClientIds(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

export async function archiveSelectedClients(formData) {
  const clientIds = parseClientIds(formData.get("clientIds"));

  if (clientIds.length === 0) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("clients")
    .update({ status: "archived" })
    .eq("organization_id", organizationId)
    .in("id", clientIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
}

export async function moveSelectedClientsToActive(formData) {
  const clientIds = parseClientIds(formData.get("clientIds"));

  if (clientIds.length === 0) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("clients")
    .update({ status: "active" })
    .eq("organization_id", organizationId)
    .in("id", clientIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
}

export async function deleteSelectedClients(formData) {
  const clientIds = parseClientIds(formData.get("clientIds"));

  if (clientIds.length === 0) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("organization_id", organizationId)
    .in("id", clientIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
}

export async function archiveSingleClient(formData) {
  const clientId = formData.get("clientId");

  if (!clientId) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("clients")
    .update({ status: "archived" })
    .eq("organization_id", organizationId)
    .eq("id", clientId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
}

export async function moveSingleClientToActive(formData) {
  const clientId = formData.get("clientId");

  if (!clientId) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("clients")
    .update({ status: "active" })
    .eq("organization_id", organizationId)
    .eq("id", clientId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
}

export async function deleteSingleClient(formData) {
  const clientId = formData.get("clientId");

  if (!clientId) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", clientId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
}