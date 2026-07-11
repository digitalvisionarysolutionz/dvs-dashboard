import { brandConfig } from "./brandConfig.js";

export const ROLE_LEVELS = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

export const WRITE_ROLES = ["owner", "admin", "member"];
export const ADMIN_ROLES = ["owner", "admin"];

function getInitialsFromName(nameOrEmail) {
  if (!nameOrEmail) {
    return brandConfig.userInitials;
  }

  const cleanValue = nameOrEmail.split("@")[0].replace(/[._-]/g, " ");
  const parts = cleanValue.split(" ").filter(Boolean);

  if (parts.length === 0) {
    return brandConfig.userInitials;
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getSafeDisplayName(profile, user) {
  const profileName = profile?.full_name?.trim();
  const email = user?.email?.trim();

  if (profileName && profileName !== email) {
    return profileName;
  }

  if (user?.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }

  return "DVS Admin";
}

export function getFirstName(fullName) {
  if (!fullName) {
    return brandConfig.shortName;
  }

  return fullName.trim().split(" ")[0];
}

export function normalizeRole(role) {
  const nextRole = String(role || "viewer").toLowerCase();

  return Object.prototype.hasOwnProperty.call(ROLE_LEVELS, nextRole)
    ? nextRole
    : "viewer";
}

export function hasWorkspaceRole(role, allowedRoles = []) {
  const normalizedRole = normalizeRole(role);

  return allowedRoles.map(normalizeRole).includes(normalizedRole);
}

export function requireWorkspaceRole(workspace, allowedRoles = [], action = "perform this action") {
  const role = normalizeRole(workspace?.membership?.role);

  if (!hasWorkspaceRole(role, allowedRoles)) {
    throw new Error(`You do not have permission to ${action}.`);
  }

  return role;
}

export async function getCurrentWorkspace(supabase, user) {
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select(
      `
      role,
      organization:organizations (
        id,
        name,
        slug,
        logo_url,
        accent_color,
        dashboard_name,
        plan_name
      )
    `
    )
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    console.error("Workspace membership error:", membershipError.message);
  }

  const organization = membership?.organization;
  const userDisplayName = getSafeDisplayName(profile, user);
  const role = normalizeRole(membership?.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: userDisplayName,
      firstName: getFirstName(userDisplayName),
      avatarUrl: profile?.avatar_url || null,
      initials: getInitialsFromName(userDisplayName),
    },

    organization: {
      id: organization?.id || null,
      name: organization?.name || brandConfig.businessName,
      slug: organization?.slug || "dvs-tech",
      logoUrl: organization?.logo_url || brandConfig.logo.src,
      accentColor: organization?.accent_color || brandConfig.colors.accent,
      dashboardName: organization?.dashboard_name || brandConfig.dashboardName,
      planName: organization?.plan_name || brandConfig.planName,
    },

    membership: {
      role,
      canWrite: hasWorkspaceRole(role, WRITE_ROLES),
      canAdmin: hasWorkspaceRole(role, ADMIN_ROLES),
    },
  };
}