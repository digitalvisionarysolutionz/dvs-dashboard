"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../utils/supabase/server.js";
import {
  ADMIN_ROLES,
  WRITE_ROLES,
  getCurrentWorkspace,
  requireWorkspaceRole,
} from "../../../lib/workspace.js";

async function getWorkspaceContext({
  allowedRoles = WRITE_ROLES,
  action = "manage leads",
} = {}) {
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

  requireWorkspaceRole(workspace, allowedRoles, action);

  return {
    supabase,
    workspace,
    user,
    organizationId: workspace.organization.id,
  };
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanNumber(value) {
  const cleanedValue = String(value || "")
    .replaceAll(",", "")
    .replaceAll("$", "")
    .replace(/[^\d.]/g, "")
    .trim();

  if (!cleanedValue) {
    return 0;
  }

  const nextValue = Number(cleanedValue);

  if (Number.isNaN(nextValue)) {
    return 0;
  }

  return Math.max(0, nextValue);
}

function cleanDate(value) {
  const nextValue = cleanText(value);

  return nextValue || null;
}

function getTextList(formData, fieldName) {
  const values = formData
    .getAll(fieldName)
    .map((value) => cleanText(value))
    .filter(Boolean);

  if (values.length === 0) {
    return [];
  }

  if (values.length === 1) {
    const onlyValue = values[0];

    try {
      const parsedValue = JSON.parse(onlyValue);

      if (Array.isArray(parsedValue)) {
        return parsedValue.map((value) => cleanText(value)).filter(Boolean);
      }
    } catch {
      return onlyValue
        .split(",")
        .map((value) => cleanText(value))
        .filter(Boolean);
    }
  }

  return values;
}

function getRawPayload(formData) {
  const payload = {};

  for (const [key, value] of formData.entries()) {
    if (key === "company_website") {
      continue;
    }

    const textValue = cleanText(value);

    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      payload[key] = Array.isArray(payload[key])
        ? [...payload[key], textValue]
        : [payload[key], textValue];
    } else {
      payload[key] = textValue;
    }
  }

  return payload;
}

function safeParseJson(value, fallback = {}) {
  try {
    const parsed = JSON.parse(cleanText(value));

    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function getServiceSummary(services = []) {
  if (!services.length) {
    return "General inquiry";
  }

  if (services.length <= 3) {
    return services.join(", ");
  }

  return `${services.slice(0, 3).join(", ")} + ${services.length - 3} more`;
}

function getPriorityFromIntake(quickNotes = {}, selectedServices = []) {
  const followUpPriority = cleanText(quickNotes.followUpPriority).toLowerCase();

  if (followUpPriority.includes("hot")) {
    return "high";
  }

  if (followUpPriority.includes("low")) {
    return "low";
  }

  if (
    selectedServices.includes("Custom System / Dashboard") ||
    selectedServices.includes("App or Software Idea") ||
    selectedServices.includes("Client Portal")
  ) {
    return "high";
  }

  return "medium";
}

function getEstimatedValueFromIntake(quickNotes = {}) {
  const quotedAmount = cleanText(quickNotes.quotedAmount);

  if (!quotedAmount) {
    return 0;
  }

  return cleanNumber(quotedAmount);
}

function buildIntakeNotes({
  normalized,
  selectedServices,
  goals,
  painPoints,
  assetsAvailable,
  quickNotes,
}) {
  const lines = [
    "Private Intake Summary",
    "",
    `Preferred Contact: ${normalized.preferredContactMethod || "Not added"}`,
    `Best Time: ${normalized.bestTimeToReach || "Not added"}`,
    `Budget: ${normalized.budgetRange || "Not added"}`,
    `Timeline: ${normalized.timeline || "Not added"}`,
    "",
    `Services: ${selectedServices.length ? selectedServices.join(", ") : "Not selected"}`,
    `Goals: ${goals.length ? goals.join(", ") : "Not selected"}`,
    `Problems: ${painPoints.length ? painPoints.join(", ") : "Not selected"}`,
    `Assets/Access: ${assetsAvailable.length ? assetsAvailable.join(", ") : "Not selected"}`,
    "",
    "Business Snapshot:",
    normalized.businessDescription || "Not added",
    "",
    "Target Audience:",
    normalized.targetAudience || "Not added",
    "",
    "Project Details:",
    normalized.projectDetails || "Not added",
    "",
    "Success Definition:",
    normalized.successDefinition || "Not added",
  ];

  if (normalized.needsPhotoSession || normalized.photoSessionType) {
    lines.push(
      "",
      "Photo / Video:",
      `Needs Session: ${normalized.needsPhotoSession || "Not added"}`,
      `Session Type: ${normalized.photoSessionType || "Not added"}`,
      `Content Type: ${normalized.photoContentType || "Not added"}`,
      `Other Content: ${normalized.photoContentOther || "Not added"}`,
      `Vision: ${normalized.photoVision || "Not added"}`
    );
  }

  if (Object.keys(quickNotes).length > 0) {
    lines.push(
      "",
      "Internal Quick Notes:",
      `Recommended Service: ${quickNotes.recommendedService || "Not added"}`,
      `Quoted Amount: ${quickNotes.quotedAmount || "Not added"}`,
      `Estimated Range: ${quickNotes.estimatedRange || "Not added"}`,
      `Follow-Up Priority: ${quickNotes.followUpPriority || "Not added"}`,
      `Next Step: ${quickNotes.nextStep || "Not added"}`,
      `Private Notes: ${quickNotes.internalNotes || "Not added"}`
    );
  }

  return lines.join("\n");
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
    form_submission_id: cleanText(formData.get("formSubmissionId")) || null,
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
  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "create leads",
  });

  const payload = {
    ...buildLeadPayload(formData, organizationId),
    raw_payload: {},
  };

  const { error } = await supabase.from("leads").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm");
  revalidatePath("/");
}

export async function createPrivateIntakeLead(formData) {
  const honeypot = cleanText(formData.get("company_website"));

  if (honeypot) {
    return;
  }

  const { supabase, user, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "submit private intake",
  });

  const selectedServices = getTextList(formData, "servicesNeeded");
  const goals = getTextList(formData, "projectGoals");
  const painPoints = getTextList(formData, "painPoints");
  const assetsAvailable = getTextList(formData, "assetsAvailable");

  const quickNotes = safeParseJson(formData.get("quickNotesPayload"), {});
  const submissionId = `private-intake-${randomUUID()}`;

  const normalized = {
    fullName: cleanText(formData.get("fullName")),
    businessName: cleanText(formData.get("businessName")),
    email: cleanText(formData.get("email")),
    phone: cleanText(formData.get("phone")),
    preferredContactMethod: cleanText(formData.get("contactMethod")),
    bestTimeToReach: cleanText(formData.get("bestTime")),

    businessDescription: cleanText(formData.get("businessDescription")),
    targetAudience: cleanText(formData.get("idealCustomer")),
    serviceArea: cleanText(formData.get("serviceArea")),
    currentWebsite: cleanText(formData.get("websiteUrl")),
    googleBusinessProfileUrl: cleanText(formData.get("gbpLink")),
    socialLinks: cleanText(formData.get("socialLinks")),

    selectedServices,
    goals,
    currentProblems: painPoints,
    assetsAvailable,

    successDefinition: cleanText(formData.get("successDefinition")),
    budgetRange: cleanText(formData.get("budgetRange")),
    timeline: cleanText(formData.get("timeline")),
    projectDetails: cleanText(formData.get("projectDetails")),

    needsPhotoSession: cleanText(formData.get("needsPhotoSession")),
    photoSessionType: cleanText(formData.get("photoSessionType")),
    photoContentType: cleanText(formData.get("photoContentType")),
    photoContentOther: cleanText(formData.get("photoContentOther")),
    photoVision: cleanText(formData.get("photoVision")),

    quickNotes,
  };

  if (!normalized.businessName) {
    throw new Error("Business name is required.");
  }

  if (!normalized.fullName) {
    throw new Error("Full name is required.");
  }

  if (!normalized.email) {
    throw new Error("Email is required.");
  }

  const rawPayload = getRawPayload(formData);
  const serviceInterest = getServiceSummary(selectedServices);
  const estimatedValue = getEstimatedValueFromIntake(quickNotes);
  const priority = getPriorityFromIntake(quickNotes, selectedServices);
  const notes = buildIntakeNotes({
    normalized,
    selectedServices,
    goals,
    painPoints,
    assetsAvailable,
    quickNotes,
  });

  const { data: submission, error: submissionError } = await supabase
    .from("form_submissions")
    .insert({
  organization_id: organizationId,
  created_by: user.id,

  form_type: "private_intake",
  source_page: "/intake",
  source: "private_intake",
  form_name: "Private Client Intake",
  form_id: "dvs-private-intake",
  submission_id: submissionId,
  status: "lead_created",

      full_name: normalized.fullName,
      business_name: normalized.businessName,
      email: normalized.email,
      phone: normalized.phone || null,
      service_interest: serviceInterest,
      budget_range: normalized.budgetRange || null,
      timeline: normalized.timeline || null,

      raw_payload: rawPayload,
      normalized_payload: normalized,
      converted_to_lead_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (submissionError) {
    throw new Error(submissionError.message);
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      organization_id: organizationId,
      name: normalized.businessName,
      business_name: normalized.businessName,
      contact_name: normalized.fullName,
      email: normalized.email,
      phone: normalized.phone || null,
      website: normalized.currentWebsite || null,
      location: normalized.serviceArea || null,
      source: "DVS Intake",
      form_source: "Private Intake",
      form_name: "Private Client Intake",
      form_id: "dvs-private-intake",
      submission_id: submissionId,
      form_submission_id: submission.id,
      raw_payload: normalized,
      service_interest: serviceInterest,
      stage: "new_lead",
      priority,
      estimated_value: estimatedValue,
      next_follow_up: null,
      notes,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (leadError) {
    throw new Error(leadError.message);
  }

  const { error: updateSubmissionError } = await supabase
    .from("form_submissions")
    .update({
      lead_id: lead.id,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("id", submission.id);

  if (updateSubmissionError) {
    throw new Error(updateSubmissionError.message);
  }

  revalidatePath("/crm");
  revalidatePath("/");
}

export async function updateLead(formData) {
  const leadId = cleanText(formData.get("leadId"));

  if (!leadId) {
    throw new Error("Missing lead ID.");
  }

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "update leads",
  });

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
  revalidatePath("/");
}

export async function moveLeadStage(formData) {
  const leadId = formData.get("leadId");
  const stage = formData.get("stage");

  if (!leadId || !stage) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "move leads",
  });

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
  revalidatePath("/");
}

export async function restoreLead(formData) {
  const leadId = formData.get("leadId");

  if (!leadId) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "restore leads",
  });

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
  revalidatePath("/");
}

export async function convertLeadToClient(formData) {
  const leadId = cleanText(formData.get("leadId"));

  if (!leadId) {
    throw new Error("Missing lead ID.");
  }

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: WRITE_ROLES,
    action: "convert leads",
  });

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
      location,
      notes,
      client_id,
      form_submission_id
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
    revalidatePath("/");
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
        location: cleanText(lead.location) || null,
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

  if (lead.form_submission_id) {
    const { error: updateSubmissionError } = await supabase
      .from("form_submissions")
      .update({
        client_id: clientId,
        converted_to_client_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId)
      .eq("id", lead.form_submission_id);

    if (updateSubmissionError) {
      throw new Error(updateSubmissionError.message);
    }
  }

  revalidatePath("/crm");
  revalidatePath("/clients");
  revalidatePath("/");
}

export async function deleteLead(formData) {
  const leadId = formData.get("leadId");

  if (!leadId) {
    return;
  }

  const { supabase, organizationId } = await getWorkspaceContext({
    allowedRoles: ADMIN_ROLES,
    action: "delete leads",
  });

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
  revalidatePath("/");
}