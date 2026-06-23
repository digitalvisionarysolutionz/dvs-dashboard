import ComingSoonPage from "../../../components/dashboard/ComingSoonPage.jsx";

export default function AutomationsPage() {
  return (
    <ComingSoonPage
      eyebrow="Automations"
      title="Automation Center"
      description="Monitor lead flows, form routing, email sequences, reminders, and business process automations."
      items={[
        "Zapier workflow tracking",
        "Form routing",
        "Email sequences",
        "Reminder automations",
        "Webhook logs",
        "Automation status",
      ]}
    />
  );
}