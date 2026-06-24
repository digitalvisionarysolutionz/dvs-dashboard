import { redirect } from "next/navigation";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import Button from "../../../components/ui/Button.jsx";
import CRMKanban from "../../../components/crm/CRMKanban.jsx";
import { createClient } from "../../../utils/supabase/server.js";
import { getCurrentWorkspace } from "../../../lib/workspace.js";
import { getLeadsData } from "../../../lib/leadsData.js";

export default async function CRMPage() {
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

  const { leads, summary } = await getLeadsData(
    supabase,
    workspace.organization.id
  );

  return (
    <section>
      <PageHeader
        eyebrow="CRM"
        title="Sales Pipeline"
        description="Track leads, follow-ups, service interest, deal value, and close status from one clean pipeline."
        actions={
          <>
            <Button variant="secondary" className="whitespace-nowrap">
              Export
            </Button>

            <Button className="whitespace-nowrap">+ New Lead</Button>
          </>
        }
      />

      <CRMKanban leads={leads} summary={summary} />
    </section>
  );
}