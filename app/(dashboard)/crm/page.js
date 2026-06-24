import { redirect } from "next/navigation";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import CRMHeaderActions from "../../../components/crm/CRMHeaderActions.jsx";
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
        eyebrow="Customer Relations Management"
        title="Sales Pipeline"
        description="Track leads, follow-ups, service interest, deal value, and close status from one clean pipeline."
        actions={<CRMHeaderActions />}
      />

      <CRMKanban leads={leads} summary={summary} />
    </section>
  );
}