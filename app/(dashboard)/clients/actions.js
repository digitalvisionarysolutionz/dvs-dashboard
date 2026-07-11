"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../utils/supabase/server.js";
import {
  ADMIN_ROLES,
  WRITE_ROLES,
  getCurrentWorkspace,
  requireWorkspaceRole,
} from "../../../lib/workspace.js";

const LOGO_BUCKET = "client-logos";
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

async function getWorkspaceContext({
  allowedRoles = WRITE_ROLES,
  action = "manage clients",
} = {}) {
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

  requireWorkspaceRole(workspace, allowedRoles, action);

  return {
    supabase,
    workspace,
    organizationId: workspace.organization.id,
  };
}

function cleanText(value) {
  return String(value || "").trim();
}

function parseClientIds(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getSafeFileExtension(file) {
  const nameExtension = file.name?.split(".").pop()?.toLowerCase();

  if (nameExtension && /^[a-z0-9]+$/.test(nameExtension)) {
    return nameExtension;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/svg+xml") return "svg";

  return "png";
}

function isSafeOrgLogoPath(path, organizationId) {
  const cleanedPath = cleanText(path);

  if (!cleanedPath || !organizationId) {
    return false;
  }

  return cleanedPath.startsWith(`${organizationId}/`);
}

async function deleteExistingLogo({ supabase, organizationId, existingLogoPath }) {
  if (!isSafeOrgLogoPath(existingLogoPath, organizationId)) {
    return;
  }

  const { error } = await supabase.storage
    .from(LOGO_BUCKET)
    .remove([existingLogoPath]);

  if (error) {
    console.error("Client logo delete error:", error.message);
  }
}

async function uploadClientLogo({ supabase, organizationId, formData }) {
  const logoFile = formData.get("logoFile");

  if (!logoFile || typeof logoFile === "string" || logoFile.size === 0) {
    return null;
  }

  if (!ALLOWED_LOGO_TYPES.has(logoFile.type)) {
    throw new Error("Logo must be a PNG, JPG, WEBP, or SVG file.");
  }

  if (logoFile.size > MAX_LOGO_SIZE_BYTES) {
    throw new Error("Logo file must be 5MB or smaller.");
  }

  const extension = getSafeFileExtension(logoFile);
  const fileName = `logo-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const storagePath = `${organizationId}/clients/${fileName}`;

  const { error } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(storagePath, logoFile, {
      cacheControl: "3600",
      contentType: logoFile.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Logo upload failed: ${error.message}`);
  }

  return storagePath;
}

async function getExistingClientLogoPath({ supabase, organizationId, clientId }) {
  if (!clientId) {
    return "";
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id, logo_path")
    .eq("organization_id", organizationId)
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.logo_path || "";
}

async function buildClientPayload({
  formData,
  organizationId,
  supabase,
  existingLogoPath = "",
}) {
  const businessName = cleanText(formData.get("businessName"));
  const contactName = cleanText(formData.get("contactName"));
  const removeLogo = formData.get("removeLogo") === "on";

  if (!businessName) {
    throw new Error("Business name is required.");
  }

  const uploadedLogoPath = await uploadClientLogo({
    supabase,
    organizationId,
    formData,
  });

  const payload = {
    organization_id: organizationId,
    name: contactName || businessName,
    business_name: businessName,
    email: cleanText(formData.get("email")) || null,
    phone: cleanText(formData.get("phone")) || null,
    website: cleanText(formData.get("website")) || null,
    location: cleanText(formData.get("location")) || null,
    status: cleanText(formData.get("status")) || "active",
    notes: cleanText(formData.get("notes")) || null,
  };

  if (removeLogo) {
    await deleteExistingLogo({ supabase, organizationId, existingLogoPath });
    payload.logo_path = null;
    payload.logo_url = null;
  }

  if (uploadedLogoPath) {
    await deleteExistingLogo({ supabase, organizationId, existingLogoPath });
    payload.logo_path = uploadedLogoPath;
    payload.logo_url = null;
  }

  return payload;
}

export async function createClientRecord(formData) {
  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "create clients",
  });

  const payload = await buildClientPayload({
    formData,
    organizationId,
    supabase,
  });

  const { error } = await supabase.from("clients").insert(payload);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function updateClientRecord(formData) {
  const clientId = cleanText(formData.get("clientId"));

  if (!clientId) throw new Error("Missing client ID.");

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "update clients",
  });

  const existingLogoPath = await getExistingClientLogoPath({
    supabase,
    organizationId,
    clientId,
  });

  const payload = await buildClientPayload({
    formData,
    organizationId,
    supabase,
    existingLogoPath,
  });

  const { error } = await supabase
    .from("clients")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function archiveSelectedClients(formData) {
  const clientIds = parseClientIds(formData.get("clientIds"));
  if (clientIds.length === 0) return;

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "archive clients",
  });

  const { error } = await supabase
    .from("clients")
    .update({ status: "archived" })
    .eq("organization_id", organizationId)
    .in("id", clientIds);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
}

export async function moveSelectedClientsToActive(formData) {
  const clientIds = parseClientIds(formData.get("clientIds"));
  if (clientIds.length === 0) return;

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "restore clients",
  });

  const { error } = await supabase
    .from("clients")
    .update({ status: "active" })
    .eq("organization_id", organizationId)
    .in("id", clientIds);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
}

export async function deleteSelectedClients(formData) {
  const clientIds = parseClientIds(formData.get("clientIds"));
  if (clientIds.length === 0) return;

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: ADMIN_ROLES,
    action: "delete clients",
  });

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("organization_id", organizationId)
    .in("id", clientIds);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
}

export async function archiveSingleClient(formData) {
  const clientId = formData.get("clientId");
  if (!clientId) return;

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "archive clients",
  });

  const { error } = await supabase
    .from("clients")
    .update({ status: "archived" })
    .eq("organization_id", organizationId)
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
}

export async function moveSingleClientToActive(formData) {
  const clientId = formData.get("clientId");
  if (!clientId) return;

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "restore clients",
  });

  const { error } = await supabase
    .from("clients")
    .update({ status: "active" })
    .eq("organization_id", organizationId)
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
}

export async function deleteSingleClient(formData) {
  const clientId = formData.get("clientId");
  if (!clientId) return;

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: ADMIN_ROLES,
    action: "delete clients",
  });

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
}