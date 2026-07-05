const LOGO_BUCKET = "client-logos";

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

  if (words.length === 0) return "CL";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function normalizeWebsite(value = "") {
  const cleaned = String(value || "").trim();

  if (!cleaned) return "";
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }

  return `https://${cleaned}`;
}

function normalizeLogoUrl(value = "") {
  const cleaned = String(value || "").trim();

  if (!cleaned) return "";
  if (cleaned.startsWith("/") || cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }

  return `https://${cleaned}`;
}

async function getSignedLogoUrl(supabase, logoPath) {
  if (!logoPath) return "";

  const { data, error } = await supabase.storage
    .from(LOGO_BUCKET)
    .createSignedUrl(logoPath, 60 * 60);

  if (error) {
    console.error("Client logo signed URL error:", error.message);
    return "";
  }

  return data?.signedUrl || "";
}

export async function getClientsData(supabase, organizationId) {
  if (!organizationId) return [];

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
      location,
      status,
      notes,
      logo_url,
      logo_path,
      created_at
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Clients data error:", error.message);
    return [];
  }

  return Promise.all(
    (data || []).map(async (client) => {
      const rawStatus = client.status || "active";
      const businessName =
        client.business_name || client.name || "Unnamed Business";
      const signedLogoUrl = await getSignedLogoUrl(supabase, client.logo_path);

      return {
        id: client.id,
        name: client.name || "Unnamed Client",
        businessName,
        initials: getInitials(businessName),
        email: client.email || "No email",
        phone: client.phone || "No phone",
        website: normalizeWebsite(client.website || ""),
        location: client.location || "",
        rawStatus,
        status: formatStatus(rawStatus),
        isArchived: rawStatus === "archived",
        notes: client.notes || "No notes added yet.",
        logoPath: client.logo_path || "",
        logoUrl: signedLogoUrl || normalizeLogoUrl(client.logo_url || ""),
        createdAt: client.created_at || "",
      };
    })
  );
}