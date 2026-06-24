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
    throw new Error("You must be signed in to manage leads.");
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

export async function moveLeadStage(formData) {
  const leadId = formData.get("leadId");
  const stage = formData.get("stage");

  if (!leadId || !stage) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("leads")
    .update({
      stage,
      status: stage === "archived" ? "archived" : "active",
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm");
}

export async function deleteLead(formData) {
  const leadId = formData.get("leadId");

  if (!leadId) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("leads")
    .update({
      status: "deleted",
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm");
}