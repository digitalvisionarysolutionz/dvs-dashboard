import ComingSoonPage from "../../../components/dashboard/ComingSoonPage.jsx";

export default function CRMPage() {
  return (
    <ComingSoonPage
      eyebrow="CRM"
      title="CRM Pipeline"
      description="Track leads, opportunities, follow-ups, proposals, and close status from one clean sales pipeline."
      items={[
        "Lead pipeline by stage",
        "Follow-up reminders",
        "Proposal status",
        "Source tracking",
        "Client conversion history",
        "Activity log",
      ]}
    />
  );
}