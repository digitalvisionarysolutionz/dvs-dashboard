import Panel from "../ui/Panel.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import PriorityBadge from "../ui/PriorityBadge.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";

export default function DashboardGrid({
  projects = [],
  leads = [],
  tasks = [],
  payments = [],
}) {
  return (
    <div className="mt-6 grid gap-5 xl:grid-cols-12">
      <div className="xl:col-span-7">
        <Panel title="Active Projects" eyebrow="Projects" action="View All">
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border border-[var(--app-border)] bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-[var(--app-text)]">
                      {project.name}
                    </h4>
                    <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                      {project.client}
                    </p>
                  </div>

                  <StatusBadge>{project.status}</StatusBadge>
                </div>

                <div className="mt-4">
                  <ProgressBar value={project.progress} />
                </div>

                <p className="mt-3 text-xs text-[var(--app-text-soft)]">
                  Due {project.due}
                </p>
              </div>
            ))}

            {projects.length === 0 && (
              <p className="text-sm text-[var(--app-text-muted)]">
                No active projects found.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <div className="xl:col-span-5">
        <Panel title="Recent Leads" eyebrow="CRM" action="View CRM">
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-start justify-between gap-4 border-b border-[var(--app-border)] pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <h4 className="font-bold text-[var(--app-text)]">
                    {lead.name}
                  </h4>
                  <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                    {lead.service}
                  </p>
                  <p className="mt-1 text-xs text-[var(--app-text-soft)]">
                    Source: {lead.source}
                  </p>
                </div>

                <StatusBadge>{lead.status}</StatusBadge>
              </div>
            ))}

            {leads.length === 0 && (
              <p className="text-sm text-[var(--app-text-muted)]">
                No recent leads found.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <div className="xl:col-span-7">
        <Panel
          title="Tasks & Reminders"
          eyebrow="Operations"
          action="+ Add Task"
        >
          <div className="space-y-3">
            {tasks.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 border-b border-[var(--app-border)] pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <h4 className="font-semibold text-[var(--app-text)]">
                    {item.task}
                  </h4>
                  <p className="mt-1 text-xs text-[var(--app-text-soft)]">
                    Due {item.due}
                  </p>
                </div>

                <PriorityBadge priority={item.priority} />
              </div>
            ))}

            {tasks.length === 0 && (
              <p className="text-sm text-[var(--app-text-muted)]">
                No open tasks found.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <div className="xl:col-span-5">
        <Panel title="Payments Snapshot" eyebrow="Revenue" action="View">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {payments.map((payment) => (
              <div
                key={payment.label}
                className="border border-[var(--app-border)] bg-black/20 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-soft)]">
                  {payment.label}
                </p>
                <p className="mt-2 text-2xl font-black text-[var(--app-text)]">
                  {payment.value}
                </p>
              </div>
            ))}

            {payments.length === 0 && (
              <p className="text-sm text-[var(--app-text-muted)]">
                No payment data found.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}