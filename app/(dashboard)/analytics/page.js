import ComingSoonPage from "../../../components/dashboard/ComingSoonPage.jsx";

export default function AnalyticsPage() {
  return (
    <ComingSoonPage
      eyebrow="Analytics"
      title="Business Analytics"
      description="Monitor business growth, lead sources, revenue trends, project volume, and conversion performance."
      items={[
        "Revenue trends",
        "Lead source reports",
        "Project completion rate",
        "Client growth",
        "Conversion metrics",
        "Monthly snapshots",
      ]}
    />
  );
}