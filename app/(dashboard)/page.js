import { redirect } from "next/navigation";
import CommandCenterHero from "../../components/dashboard/CommandCenterHero.jsx";
import CommandMetrics from "../../components/dashboard/CommandMetrics.jsx";
import NeedsAttentionPanel from "../../components/dashboard/NeedsAttentionPanel.jsx";
import ProjectSnapshotPanel from "../../components/dashboard/ProjectSnapshotPanel.jsx";
import CrmSnapshotPanel from "../../components/dashboard/CrmSnapshotPanel.jsx";
import RecentActivityPanel from "../../components/dashboard/RecentActivityPanel.jsx";
import { createClient } from "../../utils/supabase/server.js";
import { getCurrentWorkspace } from "../../lib/workspace.js";
import { getDashboardData } from "../../lib/dashboardData.js";

export default async function HomePage() {
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

  const commandCenter = await getDashboardData(
    supabase,
    workspace.organization.id
  );

  return (
    <section className="space-y-6">
      <CommandCenterHero
        firstName={workspace.user.firstName || "there"}
        organizationName={workspace.organization.name}
        statusSentence={commandCenter.statusSentence}
      />

      <CommandMetrics metrics={commandCenter.metrics} />

      <NeedsAttentionPanel items={commandCenter.needsAttention} />

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <ProjectSnapshotPanel projects={commandCenter.projectSnapshot} />
        </div>
        <div className="xl:col-span-5">
          <CrmSnapshotPanel crm={commandCenter.crmSnapshot} />
        </div>
      </div>

      <RecentActivityPanel
        activity={commandCenter.recentActivity}
        recentClients={commandCenter.recentClients}
        recentProjects={commandCenter.recentProjects}
      />
    </section>
  );
}
