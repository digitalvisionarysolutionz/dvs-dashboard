import ComingSoonPage from "../../../components/dashboard/ComingSoonPage.jsx";

export default function FormsPage() {
  return (
    <ComingSoonPage
      eyebrow="Forms"
      title="Forms & Submissions"
      description="Review form submissions, intake requests, contact messages, project briefs, and lead details."
      items={[
        "Contact submissions",
        "Project briefs",
        "Lead intake forms",
        "Submission status",
        "Assigned follow-up",
        "Source page tracking",
      ]}
    />
  );
}