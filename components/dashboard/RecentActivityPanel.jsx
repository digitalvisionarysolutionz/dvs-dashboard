import Link from "next/link";
import DashboardPanel from "./DashboardPanel.jsx";
import DashboardEmptyState from "./DashboardEmptyState.jsx";

const typeLabels = {
  client: "Client",
  project: "Project",
  lead: "Lead",
};

export default function RecentActivityPanel({
  activity = [],
  recentClients = [],
  recentProjects = [],
}) {
  const hasSideLists = recentClients.length > 0 || recentProjects.length > 0;

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className={hasSideLists ? "xl:col-span-7" : "xl:col-span-12"}>
        <DashboardPanel title="Recent Activity" eyebrow="Timeline">
          {activity.length === 0 ? (
            <DashboardEmptyState
              title="No recent activity yet"
              description="Client, lead, and project events will appear here as your workspace grows."
            />
          ) : (
            <div className="relative space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-gradient-to-b before:from-[var(--app-accent)] before:via-cyan-300/25 before:to-transparent">
              {activity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="relative flex items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-white/10 bg-black/20 p-3 pl-8 transition hover:border-cyan-300/35 hover:bg-black/30"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-4 h-3.5 w-3.5 rounded-full border border-cyan-200/50 bg-[#050b12] shadow-[0_0_16px_rgba(92,244,236,0.55)]"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--app-accent)]">
                      {typeLabels[item.type] || "Update"}
                    </p>
                    <p className="mt-1 font-semibold text-[var(--app-text)]">
                      {item.message}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[var(--app-text-soft)]">
                    {item.timeLabel}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-[var(--app-text-soft)]">
            Derived from recent clients, leads, and projects.
          </p>
        </DashboardPanel>
      </div>

      {hasSideLists && (
        <div className="space-y-5 xl:col-span-5">
          {recentClients.length > 0 && (
            <DashboardPanel
              title="Recent Clients"
              eyebrow="Accounts"
              actionHref="/clients"
              actionLabel="View All"
            >
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <Link
                    key={client.id}
                    href={client.href}
                    className="block rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-black/20 p-3 transition hover:border-[var(--app-border-strong)] hover:bg-black/30"
                  >
                    <p className="font-semibold text-[var(--app-text)]">
                      {client.businessName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                      {client.status} · {client.email}
                    </p>
                  </Link>
                ))}
              </div>
            </DashboardPanel>
          )}

          {recentProjects.length > 0 && (
            <DashboardPanel
              title="Recent Projects"
              eyebrow="Latest"
              actionHref="/projects"
              actionLabel="View All"
            >
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={project.href}
                    className="block rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-black/20 p-3 transition hover:border-[var(--app-border-strong)] hover:bg-black/30"
                  >
                    <p className="font-semibold text-[var(--app-text)]">
                      {project.name}
                    </p>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                      {project.clientName} · {project.status}
                    </p>
                  </Link>
                ))}
              </div>
            </DashboardPanel>
          )}
        </div>
      )}
    </div>
  );
}
