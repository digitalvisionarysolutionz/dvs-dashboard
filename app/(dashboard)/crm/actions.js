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

function buildLeadPayload(formData, organizationId) {
  const businessName = cleanText(formData.get("businessName"));
  const contactName = cleanText(formData.get("contactName"));

  if (!businessName) {
    throw new Error("Business name is required.");
  }

  const stage = cleanText(formData.get("stage")) || "new_lead";

  return {
    organization_id: organizationId,

    // Legacy compatibility. Your existing leads table still has this column.
    name: businessName,

    business_name: businessName,
    contact_name: contactName || businessName,
    email: cleanText(formData.get("email")) || null,
    phone: cleanText(formData.get("phone")) || null,
    website: cleanText(formData.get("website")) || null,
    location: cleanText(formData.get("location")) || null,

    source: cleanText(formData.get("source")) || "Manual",
    form_source: cleanText(formData.get("formSource")) || "Manual Entry",
    form_name: cleanText(formData.get("formName")) || "Manual CRM Entry",
    form_id: cleanText(formData.get("formId")) || null,
    submission_id: cleanText(formData.get("submissionId")) || null,

    service_interest:
      cleanText(formData.get("serviceInterest")) || "General inquiry",
    stage,
    priority: cleanText(formData.get("priority")) || "medium",
    estimated_value: cleanNumber(formData.get("estimatedValue")),
    next_follow_up: cleanDate(formData.get("nextFollowUp")),

    notes: cleanText(formData.get("notes")) || null,
    status: stage === "archived" ? "archived" : "active",
    updated_at: new Date().toISOString(),
  };
}

export async function createLead(formData) {
  const { supabase, organizationId } = await getWorkspaceContext();

  const payload = {
    ...buildLeadPayload(formData, organizationId),
    raw_payload: {},
  };

  const { error } = await supabase.from("leads").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm");
}

export async function updateLead(formData) {
  const leadId = cleanText(formData.get("leadId"));

  if (!leadId) {
    throw new Error("Missing lead ID.");
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const payload = buildLeadPayload(formData, organizationId);

  const { error } = await supabase
    .from("leads")
    .update(payload)
    .eq("organization_id", organizationId)
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm");
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
export async function restoreLead(formData) {
  const leadId = formData.get("leadId");

  if (!leadId) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("leads")
    .update({
      stage: "new_lead",
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm");
}

export async function convertLeadToClient(formData) {
  const leadId = cleanText(formData.get("leadId"));

  if (!leadId) {
    throw new Error("Missing lead ID.");
  }

  const { supabase, organizationId } = await getWorkspaceContext();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select(
      `
      id,
      business_name,
      contact_name,
      email,
      phone,
      website,
      notes,
      client_id
    `
    )
    .eq("organization_id", organizationId)
    .eq("id", leadId)
    .single();

  if (leadError) {
    throw new Error(leadError.message);
  }

  if (!lead) {
    throw new Error("Lead not found.");
  }

  if (lead.client_id) {
    const { error: updateExistingError } = await supabase
      .from("leads")
      .update({
        stage: "won",
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId)
      .eq("id", leadId);

    if (updateExistingError) {
      throw new Error(updateExistingError.message);
    }

    revalidatePath("/crm");
    revalidatePath("/clients");
    return;
  }

  const businessName = cleanText(lead.business_name) || "Unnamed Business";
  const contactName = cleanText(lead.contact_name) || businessName;

  const { data: existingClient, error: existingError } = await supabase
    .from("clients")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("business_name", businessName)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  let clientId = existingClient?.id;

  if (!clientId) {
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        organization_id: organizationId,
        name: contactName,
        business_name: businessName,
        email: cleanText(lead.email) || null,
        phone: cleanText(lead.phone) || null,
        website: cleanText(lead.website) || null,
        status: "active",
        notes:
          cleanText(lead.notes) ||
          "Converted from CRM lead. Add client notes here.",
      })
      .select("id")
      .single();

    if (clientError) {
      throw new Error(clientError.message);
    }

    clientId = newClient.id;
  }

  const { error: updateLeadError } = await supabase
    .from("leads")
    .update({
      client_id: clientId,
      stage: "won",
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("id", leadId);

  if (updateLeadError) {
    throw new Error(updateLeadError.message);
  }

  revalidatePath("/crm");
  revalidatePath("/clients");
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