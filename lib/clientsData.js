function formatStatus(value = "") {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() || ""}${word.slice(1)}`)
    .join(" ");
}

function getInitials(value = "") {
  const words = value
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) {
    return "CL";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function normalizeWebsite(value = "") {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export async function getClientsData(supabase, organizationId) {
  if (!organizationId) {
    return [];
  }

  const { data, error } = await supabase
    .from("clients")
    .select(
      `
      id,
      name,
      business_name,
      email,
      phone,
      website,
      status,
      notes,
      logo_url,
      created_at
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Clients data error:", error.message);
    return [];
  }

  return (data || []).map((client) => {
    const rawStatus = client.status || "active";
    const businessName =
      client.business_name || client.name || "Unnamed Business";

    return {
      id: client.id,
      name: client.name || "Unnamed Client",
      businessName,
      initials: getInitials(businessName),
      email: client.email || "No email",
      phone: client.phone || "No phone",
      website: normalizeWebsite(client.website || ""),
      rawStatus,
      status: formatStatus(rawStatus),
      isArchived: rawStatus === "archived",
      notes: client.notes || "No notes added yet.",
      logoUrl: client.logo_url || "",
      createdAt: client.created_at || "",
    };
  });
}