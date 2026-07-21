import PrivateIntakeForm from "./PrivateIntakeForm.jsx";

export const metadata = {
  title: "Private Intake | DVS Tech Dashboard",
  description:
    "Internal DVS Tech private intake form for creating CRM leads from calls, meetings, and walkthroughs.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function IntakePage() {
  return <PrivateIntakeForm />;
}