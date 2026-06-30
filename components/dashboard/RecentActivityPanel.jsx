import Link from "next/link";
import DashboardPanel from "./DashboardPanel.jsx";
import DashboardEmptyState from "./DashboardEmptyState.jsx";

const typeLabels = {
  client: "Client",
  project: "Project",
  lead: "Lead",
};

function getInitials(value = "") {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ActivityRow({ item }) {
  return (
    <Link
      href={item.href}
      className="relative grid min-h-[44px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-md)] border border-white/10 bg-white/[0.025] px-3 py-2 pl-8 transition hover:border-[#5cf4ec]/35 hover:bg-white/[0.045]"
    >
      <span
        aria-hidden="true"
        className="absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-[#5cf4ec]/60 bg-[#050b12] shadow-[0_0_14px_rgba(92,244,236,0.5)]"
      />

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5cf4ec]">
          {typeLabels[item.type] || "Update"}
        </p>

        <p className="mt-0.5 truncate text-[11px] font-semibold text-white">
          {item.message}
        </p>
      </div>

      <span className="shrink-0 text-[10px] font-semibold text-[var(--app-text-soft)]">
        {item.timeLabel}
      </span>
    </Link>
  );
}

function ClientCard({ client }) {
  return (
    <Link
      href={client.href}
      className="grid min-h-[66px] grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.025] px-3 py-2.5 transition hover:border-[#5cf4ec]/35 hover:bg-white/[0.045]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[#5cf4ec]/20 bg-[#5cf4ec]/[0.055] text-[11px] font-black text-[#5cf4ec]">
        {getInitials(client.businessName) || "C"}
      </span>

      <div className="min-w-0">
        <p className="truncate text-[12px] font-black text-white">
          {client.businessName}
        </p>

        <p className="mt-0.5 truncate text-[10px] font-semibold text-[var(--app-text-muted)]">
          {client.status} · {client.email || "No email"}
        </p>
      </div>
    </Link>
  );
}

function ProjectMiniRow({ project }) {
  return (
    <Link
      href={project.href}
      className="block rounded-[var(--radius-md)] border border-white/10 bg-white/[0.025] px-3 py-2 transition hover:border-[#5cf4ec]/35 hover:bg-white/[0.045]"
    >
      <p className="truncate text-[11px] font-black text-white">
        {project.name}
      </p>

      <p className="mt-0.5 truncate text-[10px] font-semibold text-[var(--app-text-muted)]">
        {project.clientName} · {project.status}
      </p>
    </Link>
  );
}

export default function RecentActivityPanel({
  activity = [],
  recentClients = [],
  recentProjects = [],
}) {
  const visibleActivity = activity.slice(0, 3);
  const visibleClients = recentClients.slice(0, 4);
  const visibleProjects = recentProjects.slice(0, 2);

  return (
    <div className="grid gap-3 xl:grid-cols-12">
      <div className="xl:col-span-5">
        <DashboardPanel title="Recent Activity" eyebrow="Recent Activity" className="p-4">
          {visibleActivity.length === 0 ? (
            <DashboardEmptyState
              title="No recent activity yet"
              description="Workspace events will appear here."
            />
          ) : (
            <div className="space-y-2">
              {visibleActivity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </DashboardPanel>
      </div>

      <div className="xl:col-span-7">
        <DashboardPanel
          title="Recent Clients"
          eyebrow="Recent Clients"
          actionHref="/clients"
          actionLabel="View All Clients"
          className="p-4"
        >
          {visibleClients.length === 0 ? (
            <DashboardEmptyState
              title="No recent clients"
              description="New client accounts will appear here."
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 min-[1500px]:grid-cols-4">
              {visibleClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}

          {visibleProjects.length > 0 && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5cf4ec]">
                  Latest Projects
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {visibleProjects.map((project) => (
                  <ProjectMiniRow key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}