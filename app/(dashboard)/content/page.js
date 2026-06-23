import ComingSoonPage from "../../../components/dashboard/ComingSoonPage.jsx";

export default function ContentPage() {
  return (
    <ComingSoonPage
      eyebrow="Content"
      title="Content Planner"
      description="Plan posts, campaigns, creative assets, captions, visuals, and content deliverables."
      items={[
        "Content calendar",
        "Post drafts",
        "Campaign ideas",
        "Asset library",
        "Caption bank",
        "Client approvals",
      ]}
    />
  );
}