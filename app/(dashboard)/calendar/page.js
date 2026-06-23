import ComingSoonPage from "../../../components/dashboard/ComingSoonPage.jsx";

export default function CalendarPage() {
  return (
    <ComingSoonPage
      eyebrow="Calendar"
      title="Calendar & Meetings"
      description="Track consultations, project calls, deadlines, reviews, and upcoming business reminders."
      items={[
        "Upcoming meetings",
        "Consultation schedule",
        "Project deadlines",
        "Follow-up dates",
        "Google Calendar later",
        "Internal reminders",
      ]}
    />
  );
}