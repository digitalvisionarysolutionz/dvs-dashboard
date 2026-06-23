import { redirect } from "next/navigation";
import StatCard from "../../components/dashboard/StatCard.jsx";
import DashboardGrid from "../../components/dashboard/DashboardGrid.jsx";
import AccentLine from "../../components/ui/AccentLine.jsx";
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

  const dashboardData = await getDashboardData(
    supabase,
    workspace.organization.id
  );

  const firstName = workspace?.user?.firstName || "there";

  return (
    <section>
      <div className="mb-8">
        <div className="inline-flex flex-col items-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--app-accent)]">
            Dashboard
          </p>

          <AccentLine />
        </div>

        <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
          Welcome back, {firstName}.
        </h2>

        <p className="mt-4 max-w-2xl text-[var(--app-text-muted)]">
          Here is a live overview of clients, projects, revenue, and items that
          need your attention.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardData.stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
          />
        ))}
      </div>

      <DashboardGrid
        projects={dashboardData.projects}
        leads={dashboardData.leads}
        tasks={dashboardData.tasks}
        payments={dashboardData.payments}
      />
    </section>
  );
}