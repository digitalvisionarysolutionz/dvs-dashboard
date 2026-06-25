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

function cleanText(value) {
  return String(value || "").trim();
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

function buildClientPayload(formData, organizationId) {
  const businessName = cleanText(formData.get("businessName"));
  const contactName = cleanText(formData.get("contactName"));

  if (!businessName) {
    throw new Error("Business name is required.");
  }

  return {
    organization_id: organizationId,
    name: contactName || businessName,
    business_name: businessName,
    email: cleanText(formData.get("email")) || null,
    phone: cleanText(formData.get("phone")) || null,
    website: cleanText(formData.get("website")) || null,
    status: cleanText(formData.get("status")) || "active",
    notes: cleanText(formData.get("notes")) || null,
    logo_url: cleanText(formData.get("logoUrl")) || null,
  };
}

export async function createClientRecord(formData) {
  const { supabase, organizationId } = await getWorkspaceContext();

  const payload = buildClientPayload(formData, organizationId);

  const { error } = await supabase.from("clients").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function updateClientRecord(formData) {
  const clientId = cleanText(formData.get("clientId"));

  if (!clientId) {
    throw new Error("Missing client ID.");
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const payload = buildClientPayload(formData, organizationId);

  const { error } = await supabase
    .from("clients")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", clientId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
  revalidatePath("/projects");
  revalidatePath("/");
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