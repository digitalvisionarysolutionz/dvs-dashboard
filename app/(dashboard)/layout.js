import { redirect } from "next/navigation";
import AppShell from "../../components/layout/AppShell.jsx";
import { createClient } from "../../utils/supabase/server.js";
import { getCurrentWorkspace } from "../../lib/workspace.js";

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await getCurrentWorkspace(supabase, user);

  if (!workspace?.organization?.id) {
    redirect("/login");
  }

  return <AppShell workspace={workspace}>{children}</AppShell>;
}