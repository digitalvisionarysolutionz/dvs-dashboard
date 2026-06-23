import { redirect } from "next/navigation";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import Button from "../../../components/ui/Button.jsx";
import ClientsList from "../../../components/clients/ClientsList.jsx";
import { createClient } from "../../../utils/supabase/server.js";
import { getCurrentWorkspace } from "../../../lib/workspace.js";
import { getClientsData } from "../../../lib/clientsData.js";

export default async function ClientsPage() {
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

  const clients = await getClientsData(supabase, workspace.organization.id);

  return (
    <section>
      <PageHeader
        eyebrow="Clients"
        title="Client Hub"
        description="Manage client profiles, contact info, service notes, linked projects, and account history."
        actions={
          <>
            <Button variant="secondary">Export</Button>
            <Button>+ New Client</Button>
          </>
        }
      />

      <ClientsList clients={clients} />
    </section>
  );
}