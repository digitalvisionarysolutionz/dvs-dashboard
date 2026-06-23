import ComingSoonPage from "../../../components/dashboard/ComingSoonPage.jsx";

export default function SettingsPage() {
  return (
    <ComingSoonPage
      eyebrow="Settings"
      title="Workspace Settings"
      description="Manage brand settings, team roles, connected services, dashboard modules, and white-label options."
      items={[
        "Brand config",
        "Logo and colors",
        "Team roles",
        "Enabled modules",
        "Supabase connection",
        "White-label settings",
      ]}
    />
  );
}