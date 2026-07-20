import Link from "next/link";

const iconMap = {
  clients: "/icons/active-clients.png",
  projects: "/icons/active-projects.png",
  completed: "/icons/completed.png",
  leads: "/icons/active-leads.png",
  revenue: "/icons/sales-revenue.png",
  pipeline: "/icons/sales-revenue.png",
};

function getMetricIcon(label) {
  const normalizedLabel = String(label || "").toLowerCase();

  if (normalizedLabel.includes("client")) return iconMap.clients;
  if (normalizedLabel.includes("project")) return iconMap.projects;
  if (normalizedLabel.includes("complete")) return iconMap.completed;
  if (normalizedLabel.includes("lead")) return iconMap.leads;
  if (normalizedLabel.includes("revenue")) return iconMap.revenue;
  if (normalizedLabel.includes("pipeline")) return iconMap.pipeline;

  return iconMap.projects;
}

function getTrendLabel({ tone, trend }) {
  if (trend) return trend;
  return tone === "warning" ? "↘ 8%" : "↗ 14%";
}

function TrendBadge({ tone, trend }) {
  const isWarning = tone === "warning";

  return (
    <span
      className={`hidden shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-black min-[1500px]:inline-flex ${
        isWarning
          ? "bg-red-400/10 text-red-300"
          : "bg-[#5cf4ec]/10 text-[#5cf4ec]"
      }`}
    >
      {getTrendLabel({ tone, trend })}
    </span>
  );
}

export default function CommandMetricCard({
  label,
  value,
  hint,
  href,
  tone = "default",
  trend,
}) {
  const iconSrc = getMetricIcon(label);
  const isWarning = tone === "warning";
  const valueLength = String(value).length;

  const cardClass = `group relative block min-h-[84px] min-w-0 overflow-hidden rounded-[var(--radius-lg)] border px-3 py-2.5 transition hover:bg-[#071018] md:min-h-[88px] lg:h-[82px] lg:min-h-0 ${
    isWarning
      ? "border-yellow-300/20 bg-yellow-300/[0.035]"
      : "border-[#5cf4ec]/18 bg-[#060b11]/88"
  } shadow-[0_10px_30px_rgba(0,0,0,0.22)] hover:border-[#5cf4ec]/40`;

  const content = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_28%,rgba(92,244,236,0.09),transparent_42%)]"
      />

      <div className="relative z-10 flex h-full min-w-0 items-center gap-2.5 sm:gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11 lg:h-12 lg:w-12">
          <img
            src={iconSrc}
            alt=""
            className="h-9 w-9 object-contain drop-shadow-[0_0_12px_rgba(92,244,236,0.32)] sm:h-10 sm:w-10 lg:h-11 lg:w-11"
            draggable="false"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[9px] font-black uppercase leading-tight tracking-[0.13em] text-[#5cf4ec] lg:truncate lg:text-[8.5px] lg:tracking-[0.16em]">
            {label}
          </p>

          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <p
              className={`min-w-0 whitespace-nowrap font-black leading-none tracking-tight text-white ${
                valueLength > 8
                  ? "text-[18px] sm:text-[20px] min-[1500px]:text-[22px]"
                  : valueLength > 6
                    ? "text-[20px] sm:text-[22px]"
                    : "text-[23px] sm:text-[25px]"
              }`}
            >
              {value}
            </p>

            <TrendBadge tone={tone} trend={trend} />
          </div>

          <p className="mt-1 line-clamp-2 text-[9.5px] font-semibold leading-snug text-[var(--app-text-muted)] lg:truncate lg:text-[9px]">
            {hint || "vs last 30 days"}
          </p>
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <article className={cardClass}>{content}</article>;
}