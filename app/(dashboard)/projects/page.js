import { redirect } from "next/navigation";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import ProjectsHeaderActions from "../../../components/projects/ProjectsHeaderActions.jsx";
import ProjectsList from "../../../components/projects/ProjectsList.jsx";
import { createClient } from "../../../utils/supabase/server.js";
import { getCurrentWorkspace } from "../../../lib/workspace.js";
import { getProjectsData } from "../../../lib/projectsData.js";

export default async function ProjectsPage() {
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

  const projects = await getProjectsData(supabase, workspace.organization.id);

  return (
    <section>
      <PageHeader
        eyebrow="Projects"
        title="Project Management"
        description="Track active projects, deadlines, progress, linked clients, and current project status."
        actions={<ProjectsHeaderActions />}
      />

      <ProjectsList projects={projects} />
    </section>
  );
}