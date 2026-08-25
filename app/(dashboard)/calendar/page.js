import { redirect } from "next/navigation";
import CalendarShell from "../../../components/calendar/CalendarShell.jsx";
import { getCalendarData } from "../../../lib/calendarData.js";
import { getCurrentWorkspace } from "../../../lib/workspace.js";
import { createClient } from "../../../utils/supabase/server.js";

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await getCurrentWorkspace(supabase, user);

  if (!workspace?.organization?.id) {
    redirect("/login");
  }

  const calendarData = await getCalendarData(
    supabase,
    workspace.organization.id
  );

  return <CalendarShell events={calendarData.events} summary={calendarData.summary} />;
}