import CommandMetricCard from "./CommandMetricCard.jsx";

export default function CommandMetrics({ metrics = [], primaryMetric }) {
  const metricList = primaryMetric ? [primaryMetric, ...metrics] : metrics;

  if (metricList.length === 0) {
    return null;
  }

  return (
    <section className="grid grid-cols-5 gap-2.5">
      {metricList.slice(0, 5).map((metric) => (
        <CommandMetricCard
          key={metric.id || metric.label}
          label={metric.label}
          value={metric.value}
          hint={metric.hint}
          href={metric.href}
          tone={metric.tone}
          trend={metric.trend}
        />
      ))}
    </section>
  );
}